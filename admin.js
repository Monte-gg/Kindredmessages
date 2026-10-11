(() => {
  "use strict";

  if (!window.supabase?.createClient || !window.KINDRED_SUPABASE_URL || !window.KINDRED_SUPABASE_PUBLISHABLE_KEY) {
    document.querySelector("#admin-login-error").textContent = "The secure sign-in service couldn't load. Check your internet connection and reload.";
    document.querySelector("#admin-login-form button").disabled = true;
    return;
  }
  const client = window.supabase.createClient(
    window.KINDRED_SUPABASE_URL,
    window.KINDRED_SUPABASE_PUBLISHABLE_KEY
  );
  const loginView = document.querySelector("#admin-login");
  const dashboard = document.querySelector("#admin-dashboard");
  const loginError = document.querySelector("#admin-login-error");
  const status = document.querySelector("#admin-status");
  const signOut = document.querySelector("#admin-signout");
  const accountRows = document.querySelector("#account-rows");
  const activityRows = document.querySelector("#activity-rows");
  let currentUserId = "";

  function escapeHtml(value) {
    return String(value ?? "").replace(/[&<>"']/g, (char) => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
    })[char]);
  }

  function formatDate(value) {
    if (!value) return "—";
    return new Intl.DateTimeFormat(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(value));
  }

  async function callAdmin(body) {
    const { data, error } = await client.functions.invoke("kindred-admin", { body });
    if (error) {
      const details = await error.context?.json?.().catch(() => null);
      throw new Error(details?.error || error.message || "The admin request failed.");
    }
    if (data?.error) throw new Error(data.error);
    return data;
  }

  async function loadDashboard() {
    status.textContent = "Loading accounts and activity…";
    try {
      const data = await callAdmin({ action: "list" });
      accountRows.innerHTML = data.accounts.length ? data.accounts.map((account) => `
        <tr>
          <td><strong>${escapeHtml(account.username || "—")}</strong><small>${escapeHtml(account.email)}</small></td>
          <td>${escapeHtml(formatDate(account.created_at))}</td>
          <td>${escapeHtml(formatDate(account.last_sign_in_at))}</td>
          <td>${account.suspended ? "Suspended" : "Active"}</td>
          <td>${account.id === currentUserId ? "You" : `<button class="row-action ${account.suspended ? "" : "suspend"}" type="button" data-user-id="${escapeHtml(account.id)}" data-action="${account.suspended ? "restore" : "suspend"}">${account.suspended ? "Restore" : "Suspend"}</button>`}</td>
        </tr>`).join("") : '<tr><td colspan="5">No accounts found.</td></tr>';
      activityRows.innerHTML = data.activity.length ? data.activity.map((event) => {
        const details = [
          event.details?.reason ? `Reason: ${event.details.reason}` : "",
          event.actor_email ? `By: ${event.actor_email}` : "",
        ].filter(Boolean).join(" · ");
        return `<tr>
          <td>${escapeHtml(formatDate(event.created_at))}</td>
          <td>${escapeHtml(event.event_type)}</td>
          <td>${escapeHtml(event.email)}</td>
          <td>${escapeHtml(details || event.details?.username || "—")}</td>
        </tr>`;
      }).join("") : '<tr><td colspan="4">No account activity yet.</td></tr>';
      status.textContent = data.truncated
        ? "Showing the first 100 accounts and the latest 200 activity records."
        : "Showing the latest 200 activity records.";
    } catch (error) {
      status.textContent = error.message;
    }
  }

  async function showDashboard(user) {
    currentUserId = user.id;
    loginView.hidden = true;
    dashboard.hidden = false;
    signOut.hidden = false;
    await loadDashboard();
  }

  document.querySelector("#admin-login-form").addEventListener("submit", async (event) => {
    event.preventDefault();
    const button = event.currentTarget.querySelector('button[type="submit"]');
    button.disabled = true;
    loginError.textContent = "";
    try {
      const { data, error } = await client.auth.signInWithPassword({
        email: document.querySelector("#admin-email").value.trim(),
        password: document.querySelector("#admin-password").value,
      });
      if (error) throw error;
      await showDashboard(data.user);
    } catch (error) {
      loginError.textContent = error.message || "Sign-in failed.";
    } finally {
      button.disabled = false;
    }
  });

  document.querySelector("#refresh-admin").addEventListener("click", loadDashboard);
  signOut.addEventListener("click", async () => {
    const { error } = await client.auth.signOut();
    if (error) {
      status.textContent = error.message;
      return;
    }
    dashboard.hidden = true;
    loginView.hidden = false;
    signOut.hidden = true;
  });

  accountRows.addEventListener("click", async (event) => {
    const button = event.target.closest("[data-user-id]");
    if (!button) return;
    const action = button.dataset.action;
    const reason = action === "suspend"
      ? window.prompt("Enter the reason for suspending this account:")
      : "";
    if (action === "suspend" && reason === null) return;
    button.disabled = true;
    status.textContent = action === "suspend" ? "Suspending account…" : "Restoring account…";
    try {
      await callAdmin({ action, userId: button.dataset.userId, reason });
      await loadDashboard();
    } catch (error) {
      status.textContent = error.message;
      button.disabled = false;
    }
  });

  client.auth.getSession().then(({ data, error }) => {
    if (error) throw error;
    if (data.session?.user) return showDashboard(data.session.user);
  }).catch((error) => {
    console.error("The admin session could not be restored.", error);
    loginError.textContent = "Your saved sign-in could not be restored. Please log in again.";
  });
})();
