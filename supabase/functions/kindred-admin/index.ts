import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }
  if (request.method !== "POST") {
    return Response.json({ error: "Method not allowed" }, { status: 405, headers: corsHeaders });
  }

  try {
    const projectUrl = Deno.env.get("SUPABASE_URL");
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const publishableKey = Deno.env.get("SUPABASE_ANON_KEY");
    if (!projectUrl || !serviceKey || !publishableKey) {
      throw new Error("Admin service is not configured.");
    }

    const authorization = request.headers.get("Authorization") || "";
    const token = authorization.replace(/^Bearer\s+/i, "");
    if (!token || token === authorization) {
      return Response.json({ error: "Sign in as an administrator to continue." }, {
        status: 401,
        headers: corsHeaders,
      });
    }

    const authClient = createClient(projectUrl, publishableKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const { data: { user }, error: authError } = await authClient.auth.getUser(token);
    if (authError || !user) {
      return Response.json({ error: "Your sign-in has expired. Log in again." }, {
        status: 401,
        headers: corsHeaders,
      });
    }

    const adminClient = createClient(projectUrl, serviceKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const { data: admin, error: adminError } = await adminClient
      .from("app_admins")
      .select("user_id")
      .eq("user_id", user.id)
      .maybeSingle();
    if (adminError) throw adminError;
    if (!admin) {
      return Response.json({ error: "This account is not an administrator." }, {
        status: 403,
        headers: corsHeaders,
      });
    }

    const body = await request.json();
    if (body.action === "list") {
      const [{ data: usersData, error: usersError }, { data: events, error: eventsError }] = await Promise.all([
        adminClient.auth.admin.listUsers({ page: 1, perPage: 100 }),
        adminClient.from("account_activity")
          .select("id,user_id,actor_user_id,event_type,details,created_at")
          .order("created_at", { ascending: false })
          .limit(200),
      ]);
      if (usersError) throw usersError;
      if (eventsError) throw eventsError;
      const users = usersData.users;
      const ids = users.map((account) => account.id);
      const { data: profiles, error: profilesError } = await adminClient
        .from("profiles").select("user_id,username").in("user_id", ids);
      if (profilesError) throw profilesError;
      const profileById = new Map((profiles || []).map((profile) => [profile.user_id, profile]));
      const accountById = new Map(users.map((account) => [account.id, account]));
      return Response.json({
        accounts: users.map((account) => ({
          id: account.id,
          email: account.email,
          username: profileById.get(account.id)?.username || "",
          created_at: account.created_at,
          last_sign_in_at: account.last_sign_in_at,
          suspended: Boolean(account.banned_until && new Date(account.banned_until) > new Date()),
        })),
        activity: (events || []).map((event) => ({
          ...event,
          email: accountById.get(event.user_id)?.email || "Deleted account",
          actor_email: accountById.get(event.actor_user_id)?.email || "",
        })),
        truncated: usersData.users.length === 100,
      }, { headers: corsHeaders });
    }

    if (!["suspend", "restore"].includes(body.action) ||
      typeof body.userId !== "string" || body.userId === user.id) {
      return Response.json({ error: "Choose a valid account action." }, { status: 400, headers: corsHeaders });
    }
    if (body.action === "suspend" &&
      (typeof body.reason !== "string" || body.reason.trim().length < 3 || body.reason.trim().length > 500)) {
      return Response.json({ error: "Enter a suspension reason between 3 and 500 characters." }, {
        status: 400,
        headers: corsHeaders,
      });
    }

    const { data: target, error: targetError } = await adminClient.auth.admin.getUserById(body.userId);
    if (targetError || !target.user) {
      return Response.json({ error: "That account could not be found." }, { status: 404, headers: corsHeaders });
    }
    const { error: updateError } = await adminClient.auth.admin.updateUserById(body.userId, {
      ban_duration: body.action === "suspend" ? "876000h" : "none",
    });
    if (updateError) throw updateError;

    const { error: logError } = await adminClient.from("account_activity").insert({
      user_id: body.userId,
      actor_user_id: user.id,
      event_type: body.action === "suspend" ? "suspended" : "restored",
      details: body.action === "suspend" ? { reason: body.reason.trim() } : {},
    });
    if (logError) throw logError;
    return Response.json({ success: true }, { headers: corsHeaders });
  } catch (error) {
    console.error("Admin request failed.", error);
    return Response.json({ error: "The admin request could not be completed." }, {
      status: 500,
      headers: corsHeaders,
    });
  }
});
