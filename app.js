(() => {
  "use strict";

  const STORAGE_KEY = "kindred.messages.v1";
  const THEME_KEY = "kindred.theme.v1";
  const MEDIA_DATABASE = "kindred.media.v1";
  const MEDIA_STORE = "attachments";
  const MAX_ATTACHMENT_SIZE = 25 * 1024 * 1024;
  if (!window.supabase?.createClient || !window.KINDRED_SUPABASE_URL || !window.KINDRED_SUPABASE_PUBLISHABLE_KEY) {
    document.querySelector("#login-error").textContent = "The secure sign-in service couldn't load. Check your internet connection and reload.";
    document.querySelectorAll("#login-form button").forEach((button) => { button.disabled = true; });
    return;
  }
  const supabaseClient = window.supabase.createClient(
    window.KINDRED_SUPABASE_URL,
    window.KINDRED_SUPABASE_PUBLISHABLE_KEY
  );
  const PALETTE = [
    ["#e8efff", "#315fbd"],
    ["#e7ecf5", "#4f6288"],
    ["#edf0fa", "#626caa"],
    ["#e6f1fb", "#39719a"],
    ["#eef0f7", "#59678f"],
    ["#e9f2ff", "#476fae"],
  ];
  const $ = (selector) => document.querySelector(selector);
  const els = {
    loginScreen: $("#login-screen"),
    chatScreen: $("#chat-screen"),
    themeToggle: $("#theme-toggle"),
    refreshAppButton: $("#refresh-app-button"),
    checkUpdatesButton: $("#check-updates-button"),
    loginForm: $("#login-form"),
    loginUsername: $("#login-username"),
    loginEmail: $("#login-email"),
    loginIdentityLabel: $("#login-identity-label"),
    loginPassword: $("#login-password"),
    confirmPassword: $("#confirm-password"),
    confirmPasswordField: $("#confirm-password-field"),
    profileFields: $("#profile-fields"),
    loginCopy: $("#login-copy"),
    loginSubmit: $("#login-submit"),
    forgotPasswordRow: $("#forgot-password-row"),
    forgotPasswordButton: $("#forgot-password-button"),
    authSwitch: $("#auth-switch"),
    authSwitchButton: $("#auth-switch-button"),
    loginPhoto: $("#login-photo"),
    photoPreview: $("#photo-preview"),
    photoFileName: $("#photo-file-name"),
    loginError: $("#login-error"),
    chatList: $("#chat-list"),
    emptyList: $("#empty-list"),
    chatCount: $("#chat-count"),
    chatSearch: $("#chat-search"),
    sidebarHeading: $("#sidebar-heading"),
    messagesTab: $("#messages-tab"),
    peopleTab: $("#people-tab"),
    callsTab: $("#calls-tab"),
    peopleList: $("#people-list"),
    callsList: $("#calls-list"),
    peopleHint: $("#people-hint"),
    conversationEmpty: $("#conversation-empty"),
    activeConversation: $("#active-conversation"),
    conversationAvatar: $("#conversation-avatar"),
    conversationTitle: $("#conversation-title"),
    conversationEmail: $("#conversation-email"),
    conversationProfileButton: $("#conversation-profile-button"),
    audioCallButton: $("#audio-call-button"),
    memberProfileBackdrop: $("#member-profile-backdrop"),
    memberProfileAvatar: $("#member-profile-avatar"),
    memberProfileTitle: $("#member-profile-title"),
    memberProfileBio: $("#member-profile-bio"),
    memberProfileJoined: $("#member-profile-joined"),
    memberProfileMessageButton: $("#member-profile-message-button"),
    callBackdrop: $("#call-backdrop"),
    callAvatar: $("#call-avatar"),
    callEyebrow: $("#call-eyebrow"),
    callTitle: $("#call-title"),
    callStatus: $("#call-status"),
    callRemoteAudio: $("#call-remote-audio"),
    callEnableAudioButton: $("#call-enable-audio-button"),
    callMuteButton: $("#call-mute-button"),
    callOutputButton: $("#call-output-button"),
    callAudioHelp: $("#call-audio-help"),
    callAcceptButton: $("#call-accept-button"),
    callDeclineButton: $("#call-decline-button"),
    callHangupButton: $("#call-hangup-button"),
    messageList: $("#message-list"),
    replyPreview: $("#reply-preview"),
    replyPreviewTitle: $("#reply-preview-title"),
    replyPreviewText: $("#reply-preview-text"),
    cancelReplyButton: $("#cancel-reply-button"),
    emojiButton: $("#emoji-button"),
    emojiPicker: $("#emoji-picker"),
    typingIndicator: $("#typing-indicator"),
    typingLabel: $("#typing-label"),
    messageForm: $("#message-form"),
    messageInput: $("#message-input"),
    sendButton: $("#send-button"),
    attachmentButton: $("#attachment-button"),
    attachmentInput: $("#attachment-input"),
    attachmentPreviewBackdrop: $("#attachment-preview-backdrop"),
    attachmentPreviewContent: $("#attachment-preview-content"),
    attachmentPreviewTitle: $("#attachment-preview-title"),
    attachmentCaption: $("#attachment-caption"),
    attachmentPreviewError: $("#attachment-preview-error"),
    closeAttachmentPreview: $("#close-attachment-preview"),
    cancelAttachmentButton: $("#cancel-attachment-button"),
    sendAttachmentButton: $("#send-attachment-button"),
    accountAvatar: $("#account-avatar"),
    accountName: $("#account-name"),
    accountEmail: $("#account-email"),
    accountButton: $("#account-button"),
    accountMenu: $("#account-menu"),
    profileButton: $("#profile-button"),
    notificationsButton: $("#notifications-button"),
    profileBackdrop: $("#profile-backdrop"),
    profileAvatar: $("#profile-avatar"),
    profileForm: $("#profile-form"),
    profileUsername: $("#profile-username"),
    profileBio: $("#profile-bio"),
    profileBioCount: $("#profile-bio-count"),
    profileEmail: $("#profile-email"),
    profileJoined: $("#profile-joined"),
    profilePhotoInput: $("#profile-photo-input"),
    removeProfilePhotoButton: $("#remove-profile-photo-button"),
    profileError: $("#profile-error"),
    profileSaveButton: $("#profile-save-button"),
    closeProfileButton: $("#close-profile-button"),
    forwardBackdrop: $("#forward-backdrop"),
    forwardCopy: $("#forward-copy"),
    forwardContact: $("#forward-contact"),
    forwardError: $("#forward-error"),
    forwardSendButton: $("#forward-send-button"),
    closeForwardButton: $("#close-forward-button"),
    updateBanner: $("#app-update-banner"),
    applyAppUpdateButton: $("#apply-app-update-button"),
    dismissAppUpdateButton: $("#dismiss-app-update-button"),
    signOutButton: $("#sign-out-button"),
    modalBackdrop: $("#modal-backdrop"),
    resetBackdrop: $("#reset-backdrop"),
    resetRequestForm: $("#reset-request-form"),
    resetEmail: $("#reset-email"),
    resetRequestError: $("#reset-request-error"),
    resetCodeStep: $("#reset-code-step"),
    resetCodeDisplay: $("#reset-code-display"),
    resetCodeForm: $("#reset-code-form"),
    resetCodeInput: $("#reset-code-input"),
    resetCodeError: $("#reset-code-error"),
    resetPasswordStep: $("#reset-password-step"),
    resetPasswordForm: $("#reset-password-form"),
    resetPassword: $("#reset-password"),
    resetPasswordConfirm: $("#reset-password-confirm"),
    resetPasswordError: $("#reset-password-error"),
    resetPasswordSubmit: $("#reset-password-submit"),
    newChatForm: $("#new-chat-form"),
    contactEmail: $("#contact-email"),
    contactError: $("#contact-error"),
    toast: $("#toast"),
  };

  let currentEmail = "";
  let currentUserId = "";
  let activeChat = "";
  let activeContact = null;
  let sidebarMode = "messages";
  let selectedPhoto = "";
  let profileSelectedPhoto = "";
  let profileRemovePhoto = false;
  let replyTarget = null;
  let forwardTarget = null;
  let pendingAttachment = null;
  let attachmentSending = false;
  let authMode = "login";
  let recoveryChallenge = null;
  let cloudProfile = null;
  const profilesById = new Map();
  const messagesById = new Map();
  const messageActionsById = new Map();
  const profilePhotoUrlByPath = new Map();
  const attachmentUrlCache = new Map();
  const EMOJI_CHOICES = ["😀", "😂", "🥰", "😍", "😊", "👍", "👎", "❤️", "🎉", "🙏", "😭", "🔥", "✨", "😮", "🤔", "😎", "💯"];
  let toastTimer;
  let messageChannel = null;
  let presenceChannel = null;
  let notificationsChannel = null;
  let callInboxChannel = null;
  let callRoomChannel = null;
  let activeCall = null;
  let messagesRenderQueued = false;
  let messagesRenderVersion = 0;
  let messageToolsAvailable = true;
  let warnedMessageSchema = false;
  let callsLoadVersion = 0;
  let incomingCallQueue = Promise.resolve();
  let pendingIncomingCallId = "";
  let callAudioContext = null;
  let pendingNotificationOpen = (() => {
    const params = new URLSearchParams(window.location.search);
    const userId = params.get("notificationUser");
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(userId || "")) return null;
    return { userId, reply: params.get("notificationReply") === "1" };
  })();
  let notificationsEnabled = (() => {
    try {
      return window.Notification?.permission === "granted"
        && localStorage.getItem("kindred.notifications.disabled") !== "true";
    } catch (error) {
      console.error("Notification preference couldn't be loaded.", error);
      return window.Notification?.permission === "granted";
    }
  })();
  let onlineUserIds = new Set();
  let typingStopTimer = 0;
  let remoteTypingTimer = 0;
  let lastTypingBroadcastAt = 0;
  let typingAnnouncedChat = "";
  const readPositionByChat = new Map();
  let peopleRequest = 0;
  let chatsRequest = 0;
  const activeObjectUrls = new Set();

  function readStore() {
    try {
      const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{"chats":{}}');
      if (!parsed || typeof parsed !== "object" || !parsed.chats || typeof parsed.chats !== "object") {
        throw new Error("The saved chat data has an invalid format.");
      }
      if (!parsed.profiles || typeof parsed.profiles !== "object") parsed.profiles = {};
      return parsed;
    } catch (error) {
      if (error instanceof SyntaxError) {
        localStorage.removeItem(STORAGE_KEY);
        return { chats: {}, profiles: {} };
      }
      throw error;
    }
  }

  function writeStore(store) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
    } catch (error) {
      showToast(error.name === "QuotaExceededError"
        ? "This browser is out of space. Remove some browser data and try again."
        : "Your browser couldn't save this chat. Check its storage settings.");
      throw error;
    }
  }

  function openMediaDatabase() {
    return new Promise((resolve, reject) => {
      if (!("indexedDB" in window)) {
        reject(new Error("This browser doesn't support saving attachments."));
        return;
      }
      const request = indexedDB.open(MEDIA_DATABASE, 1);
      request.onupgradeneeded = () => {
        if (!request.result.objectStoreNames.contains(MEDIA_STORE)) {
          request.result.createObjectStore(MEDIA_STORE, { keyPath: "id" });
        }
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error || new Error("The attachment store couldn't be opened."));
      request.onblocked = () => reject(new Error("Close other Kindred tabs to update attachment storage."));
    });
  }

  async function putAttachment(record) {
    const database = await openMediaDatabase();
    return new Promise((resolve, reject) => {
      const transaction = database.transaction(MEDIA_STORE, "readwrite");
      transaction.objectStore(MEDIA_STORE).put(record);
      transaction.oncomplete = () => {
        database.close();
        resolve();
      };
      transaction.onerror = () => {
        database.close();
        reject(transaction.error || new Error("The attachment couldn't be saved."));
      };
      transaction.onabort = () => {
        database.close();
        reject(transaction.error || new Error("The attachment couldn't be saved."));
      };
    });
  }

  async function getAttachment(id) {
    const database = await openMediaDatabase();
    return new Promise((resolve, reject) => {
      const transaction = database.transaction(MEDIA_STORE, "readonly");
      const request = transaction.objectStore(MEDIA_STORE).get(id);
      request.onsuccess = () => resolve(request.result || null);
      transaction.oncomplete = () => database.close();
      transaction.onerror = () => {
        database.close();
        reject(transaction.error || new Error("The attachment couldn't be loaded."));
      };
    });
  }

  async function deleteAttachment(id) {
    const database = await openMediaDatabase();
    return new Promise((resolve, reject) => {
      const transaction = database.transaction(MEDIA_STORE, "readwrite");
      transaction.objectStore(MEDIA_STORE).delete(id);
      transaction.oncomplete = () => {
        database.close();
        resolve();
      };
      transaction.onerror = () => {
        database.close();
        reject(transaction.error || new Error("The unsent attachment couldn't be removed."));
      };
    });
  }

  function attachmentId() {
    if (window.crypto?.randomUUID) return window.crypto.randomUUID();
    if (!window.crypto?.getRandomValues) throw new Error("This browser can't create a safe attachment ID.");
    return Array.from(window.crypto.getRandomValues(new Uint8Array(16)), (value) => value.toString(16).padStart(2, "0")).join("");
  }

  function setAuthMode(mode) {
    authMode = mode;
    const isSignup = mode === "signup";
    els.profileFields.hidden = !isSignup;
    els.loginUsername.required = isSignup;
    els.loginUsername.autocomplete = isSignup ? "name" : "off";
    els.loginEmail.inputMode = "email";
    els.loginEmail.autocomplete = "email";
    els.loginEmail.placeholder = "you@your-domain.com";
    els.loginIdentityLabel.textContent = "Your email address";
    els.loginPassword.autocomplete = isSignup ? "new-password" : "current-password";
    els.confirmPasswordField.hidden = !isSignup;
    els.confirmPassword.required = isSignup;
    els.forgotPasswordRow.hidden = isSignup;
    els.loginCopy.textContent = isSignup
      ? "Create your account and set up your profile."
      : "Sign in to open your messages.";
    els.loginSubmit.innerHTML = isSignup
      ? 'Create account <span aria-hidden="true">→</span>'
      : 'Log in <span aria-hidden="true">→</span>';
    els.authSwitch.firstChild.textContent = isSignup ? "Already have an account? " : "New to Kindred? ";
    els.authSwitchButton.textContent = isSignup ? "Log in" : "Create an account";
    els.loginError.textContent = "";
  }

  function getAuthRedirectUrl() {
    if (window.location.protocol === "http:" || window.location.protocol === "https:") {
      const redirectUrl = new URL(window.location.href);
      redirectUrl.search = "";
      redirectUrl.hash = "";
      return redirectUrl.href;
    }
    return "http://localhost:8000/index.html";
  }

  function resetRecoveryForm() {
    recoveryChallenge = null;
    els.resetRequestForm.reset();
    els.resetCodeForm.reset();
    els.resetPasswordForm.reset();
    els.resetRequestForm.hidden = false;
    els.resetCodeStep.hidden = true;
    els.resetPasswordStep.hidden = true;
    els.resetRequestError.textContent = "";
    els.resetCodeError.textContent = "";
    els.resetPasswordError.textContent = "";
    els.resetCodeDisplay.textContent = "";
    document.querySelectorAll("#reset-password-step .password-toggle").forEach((toggle) => {
      const input = toggle.parentElement.querySelector("input");
      input.type = "password";
      toggle.classList.remove("is-showing");
      toggle.setAttribute("aria-label", "Show password");
      toggle.setAttribute("aria-pressed", "false");
    });
  }

  function openRecovery() {
    resetRecoveryForm();
    const identity = els.loginEmail.value.trim();
    els.resetEmail.value = isValidEmail(identity) ? normalizeEmail(identity) : "";
    els.resetBackdrop.hidden = false;
    window.setTimeout(() => els.resetEmail.focus(), 0);
  }

  function closeRecovery() {
    els.resetBackdrop.hidden = true;
    resetRecoveryForm();
  }

  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, (char) => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
    })[char]);
  }

  function normalizeEmail(value) {
    const email = value.trim().toLowerCase();
    const separator = email.lastIndexOf("@");
    if (separator < 0 || email.indexOf("@") !== separator) return email;
    const local = email.slice(0, separator);
    const domain = email.slice(separator + 1);
    if (!/^[\p{L}\p{N}\p{M}.-]+$/u.test(domain)) return email;
    try {
      const asciiDomain = new URL(`http://${domain}`).hostname.toLowerCase().replace(/\.$/, "");
      return asciiDomain ? `${local}@${asciiDomain}` : email;
    } catch {
      return email;
    }
  }

  function isValidEmail(value) {
    const input = value.trim().toLowerCase();
    if (new TextEncoder().encode(input).length > 254 || /\s/.test(input)) return false;
    const parts = input.split("@");
    if (parts.length !== 2) return false;
    const [local, domain] = parts;
    if (!local || !domain || new TextEncoder().encode(local).length > 64) return false;
    if (!/^[\p{L}\p{N}\p{M}!#$%&'*+/=?^_`{|}~.-]+$/u.test(local)) return false;
    if (local.startsWith(".") || local.endsWith(".") || local.includes("..")) return false;
    if (!/^[\p{L}\p{N}\p{M}.-]+$/u.test(domain) || domain.includes("..")) return false;

    try {
      const canonical = normalizeEmail(input);
      if (new TextEncoder().encode(canonical).length > 254) return false;
      const asciiDomain = canonical.slice(canonical.lastIndexOf("@") + 1);
      if (!asciiDomain || asciiDomain.length > 253 || !asciiDomain.includes(".")) return false;
      return asciiDomain.split(".").every((label) =>
        label.length > 0
        && label.length <= 63
        && /^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/.test(label)
      );
    } catch {
      return false;
    }
  }

  function displayName(email) {
    const localPart = email.split("@")[0].replace(/[._-]+/g, " ").trim();
    return localPart || email;
  }

  function profileFor(store, email) {
    const localProfile = store.profiles[email] || { username: displayName(email), photo: "" };
    if (cloudProfile?.email === email) {
      return { ...localProfile, ...cloudProfile, username: cloudProfile.username || localProfile.username };
    }
    return localProfile;
  }

  function initials(email, username = displayName(email)) {
    const words = username.trim().split(/\s+/).filter(Boolean);
    return words.length > 1
      ? `${words[0][0]}${words[1][0]}`.toUpperCase()
      : (words[0] || email)[0].toUpperCase();
  }

  function colorFor(email) {
    let hash = 0;
    for (const char of email) hash = (hash * 31 + char.charCodeAt(0)) | 0;
    return PALETTE[Math.abs(hash) % PALETTE.length];
  }

  function setAvatar(element, email, profile = { username: displayName(email), photo: "" }) {
    const [background, color] = colorFor(email);
    const localPhoto = profile.previewPhoto
      || (!profile.avatar_path ? profile.photo : "");
    const avatarUrl = profile.avatar_path
      ? supabaseClient.storage.from("kindred-profile-pictures").getPublicUrl(profile.avatar_path).data.publicUrl
      : "";
    const imageUrl = localPhoto && /^data:image\/jpeg;base64,[A-Za-z0-9+/]+=*$/.test(localPhoto)
      ? localPhoto
      : avatarUrl;
    if (imageUrl) {
      element.textContent = "";
      element.classList.add("has-photo");
      element.style.backgroundImage = `url("${imageUrl}")`;
    } else {
      element.textContent = initials(email, profile.username || displayName(email));
      element.classList.remove("has-photo");
      element.style.backgroundImage = "";
    }
    element.style.backgroundColor = background;
    element.style.color = color;
  }

  function formatTime(timestamp) {
    const date = new Date(timestamp);
    return new Intl.DateTimeFormat(undefined, { hour: "numeric", minute: "2-digit" }).format(date);
  }

  function formatListTime(timestamp) {
    const date = new Date(timestamp);
    const now = new Date();
    if (date.toDateString() === now.toDateString()) return new Intl.DateTimeFormat(undefined, { hour: "numeric", minute: "2-digit" }).format(date);
    if (date.getFullYear() === now.getFullYear()) return new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric" }).format(date);
    return new Intl.DateTimeFormat(undefined, { year: "2-digit", month: "numeric", day: "numeric" }).format(date);
  }

  function contactName(userId) {
    return profilesById.get(userId)?.username || "Kindred member";
  }

  function readReceiptMarkup(isRead) {
    const label = isRead ? "Read" : "Sent, not read";
    return `<span class="read-receipt${isRead ? " is-read" : ""}" role="img" aria-label="${label}" title="${label}">
      <svg viewBox="0 0 20 14" aria-hidden="true"><path d="m1.5 7 3.2 3.2L11.2 3.7M7.5 7l3.2 3.2 7.8-7.5" /></svg>
    </span>`;
  }

  function setSidebarMode(mode) {
    sidebarMode = ["messages", "people", "calls"].includes(mode) ? mode : "messages";
    const showingPeople = mode === "people";
    const showingCalls = mode === "calls";
    els.messagesTab.classList.toggle("is-active", mode === "messages");
    els.messagesTab.setAttribute("aria-selected", String(mode === "messages"));
    els.peopleTab.classList.toggle("is-active", showingPeople);
    els.peopleTab.setAttribute("aria-selected", String(showingPeople));
    els.callsTab.classList.toggle("is-active", showingCalls);
    els.callsTab.setAttribute("aria-selected", String(showingCalls));
    els.sidebarHeading.firstChild.textContent = showingPeople ? "People " : showingCalls ? "Recent calls " : "Messages ";
    els.chatSearch.placeholder = showingPeople ? "Username or exact email" : showingCalls ? "Find a call" : "Find a conversation";
    els.chatList.hidden = mode !== "messages";
    els.peopleList.hidden = !showingPeople;
    els.callsList.hidden = !showingCalls;
    els.peopleHint.hidden = !showingPeople;
    els.emptyList.hidden = showingPeople || showingCalls;
    if (showingPeople) renderPeople();
    else if (showingCalls) renderCallHistory();
    else renderChats();
  }

  async function renderCallHistory() {
    if (!currentUserId || sidebarMode !== "calls") return;
    const request = ++callsLoadVersion;
    els.callsList.innerHTML = '<p class="directory-status">Loading recent calls…</p>';
    const { data: calls, error } = await supabaseClient.from("kindred_calls")
      .select("id,conversation_id,caller_id,callee_id,status,created_at")
      .or(`caller_id.eq.${currentUserId},callee_id.eq.${currentUserId}`)
      .order("created_at", { ascending: false })
      .limit(50);
    if (request !== callsLoadVersion || sidebarMode !== "calls") return;
    if (error) {
      console.error("Recent calls couldn't be loaded.", error);
      els.callsList.innerHTML = '<p class="directory-status">Recent calls couldn’t be loaded. Refresh and try again.</p>';
      return;
    }
    const otherIds = [...new Set((calls || []).map((call) => (
      call.caller_id === currentUserId ? call.callee_id : call.caller_id
    )).filter((userId) => !profilesById.has(userId)))];
    if (otherIds.length) {
      const { data: profiles, error: profileError } = await supabaseClient.from("profiles")
        .select("user_id,username,avatar_path,bio")
        .in("user_id", otherIds);
      if (profileError) {
        console.error("Call participants couldn't be loaded.", profileError);
        showToast("Some recent call names couldn't be loaded.");
      } else {
        (profiles || []).forEach((profile) => profilesById.set(profile.user_id, profile));
      }
    }
    if (request !== callsLoadVersion || sidebarMode !== "calls") return;
    const query = els.chatSearch.value.trim().toLocaleLowerCase();
    const filteredCalls = (calls || []).filter((call) => {
      const otherId = call.caller_id === currentUserId ? call.callee_id : call.caller_id;
      return contactName(otherId).toLocaleLowerCase().includes(query);
    });
    if (!filteredCalls.length) {
      els.callsList.innerHTML = `<p class="directory-status">${query ? "No calls match that name." : "Your recent calls will appear here."}</p>`;
      return;
    }
    els.callsList.innerHTML = filteredCalls.map((call) => {
      const incoming = call.callee_id === currentUserId;
      const otherId = incoming ? call.caller_id : call.callee_id;
      const statusText = call.status === "missed" || call.status === "ringing"
        ? "Missed call"
        : call.status === "declined" ? "Declined call"
          : call.status === "accepted" || call.status === "ended" ? "Audio call"
            : "Call";
      return `<button class="call-history-item" type="button" role="listitem" data-call-user="${escapeHtml(otherId)}">
        <span class="avatar chat-avatar" data-call-avatar="${escapeHtml(otherId)}"></span>
        <span class="call-history-copy"><strong>${escapeHtml(contactName(otherId))}</strong><small class="${call.status === "missed" ? "is-missed" : ""}">${incoming ? "Incoming" : "Outgoing"} · ${statusText}</small></span>
        <time>${escapeHtml(formatListTime(new Date(call.created_at).getTime()))}</time>
      </button>`;
    }).join("");
    els.callsList.querySelectorAll("[data-call-avatar]").forEach((avatar) => {
      const profile = profilesById.get(avatar.dataset.callAvatar);
      setAvatar(avatar, profile?.user_id || avatar.dataset.callAvatar, profile || {});
    });
  }

  function memberCard(profile, relationship = null) {
    const userId = profile.user_id;
    const requestIsIncoming = relationship?.status === "pending" && relationship.recipient_id === currentUserId;
    const requestIsOutgoing = relationship?.status === "pending" && relationship.sender_id === currentUserId;
    const isFriend = relationship?.status === "accepted";
    const actionMarkup = requestIsIncoming
      ? `<button class="member-action" type="button" data-action="accept" data-request-id="${escapeHtml(relationship.id)}">Accept</button>
         <button class="member-action member-action-quiet" type="button" data-action="decline" data-request-id="${escapeHtml(relationship.id)}">Decline</button>`
      : requestIsOutgoing
        ? '<span class="friend-state">Request sent</span>'
        : isFriend
          ? '<span class="friend-state is-friend">Friend</span>'
          : `<button class="member-action" type="button" data-action="add" data-user-id="${escapeHtml(userId)}">Add friend</button>`;
    const isOnline = onlineUserIds.has(userId);
    return `<article class="member-card" role="listitem">
      <button class="avatar chat-avatar member-profile-trigger" type="button" data-action="view-profile" data-user-id="${escapeHtml(userId)}" aria-label="View ${escapeHtml(profile.username)}'s profile" data-person-avatar="${escapeHtml(userId)}"></button>
      <span class="member-card-main">
        <button class="member-name-button chat-item-name" type="button" data-action="view-profile" data-user-id="${escapeHtml(userId)}">${escapeHtml(profile.username)}</button>
        <span class="member-status${isOnline ? " is-online" : ""}" data-presence-user="${escapeHtml(userId)}">${isOnline ? "Online" : "Offline"}</span>
      </span>
      <span class="member-card-actions">${actionMarkup}
        <button class="member-action member-message-action" type="button" data-action="message" data-user-id="${escapeHtml(userId)}">Message</button>
      </span>
    </article>`;
  }

  function peopleSection(title, profiles, relationships) {
    if (!profiles.length) return "";
    return `<section class="people-section"><h3>${escapeHtml(title)} <span>${profiles.length}</span></h3>
      ${profiles.map((profile) => memberCard(profile, relationships.get(profile.user_id))).join("")}
    </section>`;
  }

  async function renderPeople() {
    if (!currentUserId || sidebarMode !== "people") return;
    const request = ++peopleRequest;
    const query = els.chatSearch.value.trim();
    els.peopleList.innerHTML = '<p class="directory-status">Loading people…</p>';
    const membersQuery = query.length >= 2
      ? supabaseClient.rpc("search_kindred_members", { search_query: query })
      : query
        ? Promise.resolve({ data: [], error: null })
        : supabaseClient.from("profiles")
          .select("user_id,username,avatar_path,created_at")
          .neq("user_id", currentUserId)
          .order("created_at", { ascending: false })
          .limit(40);
    const [membersResult, relationshipsResult] = await Promise.all([
      membersQuery,
      supabaseClient.from("friend_requests")
        .select("id,sender_id,recipient_id,status")
        .or(`sender_id.eq.${currentUserId},recipient_id.eq.${currentUserId}`)
        .in("status", ["pending", "accepted"]),
    ]);
    if (request !== peopleRequest || sidebarMode !== "people") return;
    if (membersResult.error || relationshipsResult.error) {
      const error = membersResult.error || relationshipsResult.error;
      els.peopleList.innerHTML = `<p class="directory-status">${escapeHtml(error.message || "People couldn't be loaded.")}<br />Run the latest supabase/schema.sql in your project's SQL Editor.</p>`;
      return;
    }
    const relationships = new Map();
    const relatedIds = new Set();
    (relationshipsResult.data || []).forEach((row) => {
      const otherUserId = row.sender_id === currentUserId ? row.recipient_id : row.sender_id;
      relationships.set(otherUserId, row);
      relatedIds.add(otherUserId);
    });
    const candidates = membersResult.data || [];
    const knownIds = new Set(candidates.map((profile) => profile.user_id));
    const missingIds = [...relatedIds].filter((userId) => !knownIds.has(userId));
    let relatedProfiles = [];
    if (missingIds.length) {
      const { data, error } = await supabaseClient.from("profiles")
        .select("user_id,username,avatar_path,created_at")
        .in("user_id", missingIds);
      if (request !== peopleRequest || sidebarMode !== "people") return;
      if (error) {
        els.peopleList.innerHTML = `<p class="directory-status">${escapeHtml(error.message || "Friends couldn't be loaded.")}</p>`;
        return;
      }
      relatedProfiles = data || [];
    }
    const allProfiles = [...candidates, ...relatedProfiles];
    allProfiles.forEach((profile) => profilesById.set(profile.user_id, profile));
    const profilesByUserId = new Map(allProfiles.map((profile) => [profile.user_id, profile]));
    let content;
    if (query) {
      const results = candidates.filter((profile) => profile.user_id !== currentUserId);
      content = results.length
        ? peopleSection("Search results", results, relationships)
        : `<p class="directory-status">${query.length < 2 ? "Enter at least 2 characters to search." : "No members match that username or exact email."}</p>`;
    } else {
      const incoming = (relationshipsResult.data || [])
        .filter((row) => row.status === "pending" && row.recipient_id === currentUserId)
        .map((row) => profilesByUserId.get(row.sender_id))
        .filter(Boolean);
      const friends = (relationshipsResult.data || [])
        .filter((row) => row.status === "accepted")
        .map((row) => profilesByUserId.get(row.sender_id === currentUserId ? row.recipient_id : row.sender_id))
        .filter(Boolean);
      const suggestions = candidates.filter((profile) => !relationships.has(profile.user_id));
      content = [
        peopleSection("Friend requests", incoming, relationships),
        peopleSection("Your friends", friends, relationships),
        peopleSection("Suggested people", suggestions, relationships),
      ].join("") || '<p class="directory-status">No other members have joined yet. Check back soon for suggestions.</p>';
    }
    els.chatCount.textContent = String(query ? candidates.length : relatedIds.size + candidates.filter((profile) => !relationships.has(profile.user_id)).length);
    els.peopleList.innerHTML = content;
    els.peopleList.querySelectorAll("[data-person-avatar]").forEach((avatar) => {
      const profile = profilesById.get(avatar.dataset.personAvatar);
      if (profile) setAvatar(avatar, profile.user_id, profile);
    });
    updatePresenceIndicators();
  }

  function updatePresenceIndicators() {
    document.querySelectorAll("[data-presence-user]").forEach((element) => {
      const isOnline = onlineUserIds.has(element.dataset.presenceUser);
      element.textContent = isOnline ? "Online" : "Offline";
      element.classList.toggle("is-online", isOnline);
    });
    document.querySelectorAll("[data-presence-dot]").forEach((element) => {
      const isOnline = onlineUserIds.has(element.dataset.presenceDot);
      element.classList.toggle("is-online", isOnline);
      element.setAttribute("aria-label", isOnline ? "Online" : "Offline");
    });
    updateConversationPresenceStatus();
  }

  function startPresence() {
    if (!currentUserId) return;
    if (presenceChannel) supabaseClient.removeChannel(presenceChannel);
    const channel = supabaseClient.channel("kindred-presence", {
      config: { presence: { key: currentUserId } },
    });
    presenceChannel = channel;
    channel
      .on("presence", { event: "sync" }, () => {
        if (presenceChannel !== channel) return;
        onlineUserIds = new Set(Object.keys(channel.presenceState()));
        updatePresenceIndicators();
      })
      .on("postgres_changes", {
        event: "*",
        schema: "public",
        table: "friend_requests",
      }, () => {
        if (sidebarMode === "people") renderPeople();
      })
      .subscribe(async (status) => {
        if (presenceChannel !== channel) return;
        if (status === "SUBSCRIBED") {
          const result = await channel.track({ online_at: new Date().toISOString() });
          if (result !== "ok") {
            console.error("Kindred presence tracking failed.", result);
            showToast("Your online status couldn't be shared.");
          }
        } else if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
          console.error("Kindred presence channel failed.", status);
          showToast("Online status and live friend requests are unavailable. Check Supabase Realtime settings.");
        }
      });
  }

  function subscribeRealtimeChannel(channel) {
    return new Promise((resolve, reject) => {
      let settled = false;
      const timeout = window.setTimeout(() => {
        if (settled) return;
        settled = true;
        reject(new Error("Realtime took too long to connect. Check your connection and Supabase Realtime settings."));
      }, 12000);
      channel.subscribe((status) => {
        if (settled) return;
        if (status === "SUBSCRIBED") {
          settled = true;
          window.clearTimeout(timeout);
          resolve();
        } else if (status === "CHANNEL_ERROR" || status === "TIMED_OUT" || status === "CLOSED") {
          settled = true;
          window.clearTimeout(timeout);
          reject(new Error("Realtime calls aren't ready. Run the latest supabase/schema.sql and check Supabase Realtime settings."));
        }
      });
    });
  }

  function setCallScreen(profile, status, incoming = false) {
    setAvatar(els.callAvatar, profile.user_id || profile.username, profile);
    els.callTitle.textContent = profile.username || "Kindred member";
    els.callStatus.textContent = status;
    els.callEyebrow.textContent = incoming ? "INCOMING AUDIO CALL" : "AUDIO CALL";
    els.callAcceptButton.hidden = !incoming;
    els.callAcceptButton.disabled = incoming;
    els.callEnableAudioButton.hidden = true;
    els.callMuteButton.hidden = true;
    els.callMuteButton.disabled = true;
    els.callMuteButton.textContent = "Mute microphone";
    els.callMuteButton.setAttribute("aria-pressed", "false");
    els.callOutputButton.hidden = true;
    els.callAudioHelp.hidden = true;
    els.callDeclineButton.hidden = !incoming;
    els.callDeclineButton.disabled = incoming;
    els.callHangupButton.hidden = incoming;
    els.callBackdrop.classList.toggle("is-incoming", incoming);
    els.callBackdrop.hidden = false;
  }

  function stopIncomingCallAlert(call) {
    if (call?.ringSource) {
      call.ringSource.stop();
      call.ringSource.disconnect();
      call.ringSource = null;
    }
    if (call?.ringGain) {
      call.ringGain.disconnect();
      call.ringGain = null;
    }
    if (call?.role === "callee") navigator.vibrate?.(0);
  }

  async function closeCallNotification(callId) {
    if (!("serviceWorker" in navigator)) return;
    const registration = await navigator.serviceWorker.ready;
    const notifications = await registration.getNotifications({ tag: `kindred-call-${callId}` });
    notifications.forEach((notification) => notification.close());
  }

  async function showIncomingCallNotification(call) {
    if (!notificationsEnabled || !("Notification" in window) || Notification.permission !== "granted") return;
    const registration = await navigator.serviceWorker.ready;
    await registration.showNotification("Incoming call · Kindred", {
      body: `Audio call from ${call.profile.username}. Open Kindred to answer.`,
      icon: "./icons/kindred-192.png",
      badge: "./icons/kindred-192.png",
      tag: `kindred-call-${call.id}`,
      renotify: false,
      silent: false,
      vibrate: [350, 120, 350, 700],
      data: {
        type: "incoming-call",
        callId: call.id,
        userId: call.callerId,
        url: "./",
      },
    });
  }

  async function unlockCallSound() {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;
    try {
      if (!callAudioContext || callAudioContext.state === "closed") {
        callAudioContext = new AudioContextClass();
      }
      if (callAudioContext.state === "suspended") await callAudioContext.resume();
    } catch (error) {
      console.info("Call sound couldn't be enabled by this browser.", error);
    }
  }

  function startIncomingCallAlert(call) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (AudioContextClass) {
      try {
        if (!callAudioContext || callAudioContext.state === "closed") {
          callAudioContext = new AudioContextClass();
        }
        const sampleRate = callAudioContext.sampleRate;
        const buffer = callAudioContext.createBuffer(1, sampleRate * 2, sampleRate);
        const samples = buffer.getChannelData(0);
        for (let index = 0; index < samples.length; index += 1) {
          const time = index / sampleRate;
          const pulseTime = time % 2;
          const firstPulse = pulseTime < 0.42 ? Math.min(1, pulseTime * 35, (0.42 - pulseTime) * 35) : 0;
          const secondPulse = pulseTime >= 0.62 && pulseTime < 1.04
            ? Math.min(1, (pulseTime - 0.62) * 35, (1.04 - pulseTime) * 35)
            : 0;
          const envelope = Math.max(firstPulse, secondPulse);
          samples[index] = envelope * (Math.sin(2 * Math.PI * 440 * time) + Math.sin(2 * Math.PI * 480 * time)) * 0.16;
        }
        const source = callAudioContext.createBufferSource();
        const gain = callAudioContext.createGain();
        source.buffer = buffer;
        source.loop = true;
        gain.gain.value = 0.7;
        source.connect(gain);
        gain.connect(callAudioContext.destination);
        call.ringSource = source;
        call.ringGain = gain;
        source.start();
        callAudioContext.resume().catch((error) => {
          console.info("Incoming call sound needs a browser interaction to start.", error);
        });
      } catch (error) {
        console.error("The incoming call sound couldn't be started.", error);
      }
    }
    navigator.vibrate?.([350, 120, 350, 700]);
    showIncomingCallNotification(call).catch((error) => {
      console.error("An incoming call notification couldn't be shown.", error);
    });
  }

  function startCallConnectionTimeout(call) {
    window.clearTimeout(call.connectionTimeout);
    call.connectionTimeout = window.setTimeout(() => {
      if (activeCall !== call || call.connected || call.peer?.connectionState === "connected") return;
      showToast(call.turnUnavailableReason === "not-deployed"
        ? "Both people are online, but this network blocks a direct call. Kindred's relay server still needs to be set up."
        : "The call couldn't connect. Check both devices' internet and microphone permissions, then try again.");
      endCall(true, "missed").catch((error) => console.error("The unconnected call couldn't be closed.", error));
    }, 60000);
  }

  async function setCallStatus(status) {
    if (!activeCall) return;
    const { error } = await supabaseClient.from("kindred_calls")
      .update({ status })
      .eq("id", activeCall.id);
    if (error) throw error;
  }

  async function sendCallSignal(event, payload = {}) {
    if (!callRoomChannel || !activeCall) throw new Error("The call connection is not ready.");
    const { error } = await supabaseClient.from("kindred_call_signals").insert({
      call_id: activeCall.id,
      sender_id: currentUserId,
      event,
      payload,
    });
    if (error) throw error;
    return "ok";
  }

  function createCallRoom(callId) {
    const channel = supabaseClient.channel(`kindred-call-signals:${callId}`);
    callRoomChannel = channel;
    channel.on("postgres_changes", {
      event: "INSERT",
      schema: "public",
      table: "kindred_call_signals",
      filter: `call_id=eq.${callId}`,
    }, ({ new: signal }) => {
      processCallSignal(signal);
    });
    return channel;
  }

  function processCallSignal(signal) {
    const call = activeCall;
    if (!call || call.id !== signal.call_id || signal.sender_id === currentUserId) return Promise.resolve();
    call.signalIds ||= new Set();
    if (call.signalIds.has(signal.id)) return call.signalQueue;
    call.signalIds.add(signal.id);
    call.signalQueue = call.signalQueue.then(async () => {
      if (activeCall !== call) return;
      await handleCallSignal(signal.event, {
        ...signal.payload,
        call_id: signal.call_id,
        user_id: signal.sender_id,
      });
    }).catch((error) => {
      console.error("Kindred audio call signaling failed.", error);
      showToast(error.message || "The call couldn't connect.");
      if (activeCall === call) {
        endCall(true).catch((endError) => console.error("The audio call could not be closed cleanly.", endError));
      }
    });
    return call.signalQueue;
  }

  async function replayCallSignals(callId) {
    const { data, error } = await supabaseClient.from("kindred_call_signals")
      .select("id,call_id,sender_id,event,payload")
      .eq("call_id", callId)
      .order("id", { ascending: true });
    if (error) throw error;
    for (const signal of data || []) await processCallSignal(signal);
  }

  async function getCallTurnServers(call) {
    if (Array.isArray(call.turnIceServers)) return call.turnIceServers;
    try {
      const { data, error } = await supabaseClient.functions.invoke("kindred-turn-credentials");
      if (error) throw error;
      const iceServers = Array.isArray(data?.iceServers)
        ? data.iceServers.filter((server) => {
          if (!server || (typeof server.urls !== "string" && !Array.isArray(server.urls))) return false;
          const urls = Array.isArray(server.urls) ? server.urls : [server.urls];
          const needsCredentials = urls.some((url) => typeof url === "string" && /^turns?:/i.test(url));
          return !needsCredentials
            || (typeof server.username === "string" && typeof server.credential === "string");
        })
        : [];
      if (!iceServers.some((server) => {
        const urls = Array.isArray(server.urls) ? server.urls : [server.urls];
        return urls.some((url) => typeof url === "string" && /^turns?:/i.test(url));
      })) {
        throw new Error("The relay service returned no TURN servers.");
      }
      call.turnIceServers = iceServers;
    } catch (error) {
      console.error("Kindred couldn't get temporary TURN credentials.", error);
      call.turnIceServers = [];
      call.turnUnavailableReason = error?.context?.status === 404 ? "not-deployed" : "unavailable";
      console.info("Trying a direct call without TURN relay credentials.");
    }
    return call.turnIceServers;
  }

  async function createCallPeer() {
    const call = activeCall;
    if (!call?.stream) throw new Error("Allow microphone access to start the call.");
    if (call.peer && call.peer.connectionState !== "closed") return call.peer;
    const configuredIceServers = Array.isArray(window.KINDRED_TURN_SERVERS)
      ? window.KINDRED_TURN_SERVERS.filter((server) => (
        server && (typeof server.urls === "string" || Array.isArray(server.urls))
      ))
      : [];
    const turnIceServers = await getCallTurnServers(call);
    if (activeCall !== call) throw new Error("The call has ended.");
    const peer = new RTCPeerConnection({
      iceServers: [
        { urls: "stun:stun.cloudflare.com:3478" },
        { urls: "stun:stun.l.google.com:19302" },
        ...configuredIceServers,
        ...turnIceServers,
      ],
    });
    call.peer = peer;
    call.queuedIce = [];
    call.stream.getTracks().forEach((track) => peer.addTrack(track, call.stream));
    const audioTracks = call.stream.getAudioTracks();
    els.callMuteButton.hidden = audioTracks.length === 0;
    els.callMuteButton.disabled = audioTracks.length === 0;
    els.callMuteButton.setAttribute("aria-pressed", "false");
    els.callMuteButton.textContent = "Mute microphone";
    els.callOutputButton.hidden = false;
    els.callAudioHelp.hidden = false;
    peer.onicecandidate = (event) => {
      if (!event.candidate || activeCall !== call || call.peer !== peer) return;
      sendCallSignal("ice", { candidate: event.candidate.toJSON() })
        .then((status) => {
          if (status !== "ok") console.error("An audio call network candidate could not be sent.", status);
        })
        .catch((error) => console.error("An audio call network candidate could not be sent.", error));
    };
    peer.ontrack = (event) => {
      if (activeCall !== call || call.peer !== peer) return;
      els.callRemoteAudio.srcObject = event.streams[0] || new MediaStream([event.track]);
      els.callRemoteAudio.play().catch((error) => {
        console.info("The browser blocked audio playback for this call.", error);
        els.callEnableAudioButton.hidden = false;
        els.callStatus.textContent = "Connected. Tap Enable sound to hear the call.";
      });
    };
    peer.onconnectionstatechange = () => {
      if (activeCall !== call || call.peer !== peer) return;
      if (peer.connectionState === "connected") {
        call.connected = true;
        window.clearTimeout(call.ringTimeout);
        window.clearTimeout(call.connectionTimeout);
        stopIncomingCallAlert(call);
        els.callStatus.textContent = "Connected";
      } else if (peer.connectionState === "disconnected") {
        window.clearTimeout(call.connectionTimeout);
        call.connectionTimeout = window.setTimeout(() => {
          if (activeCall === call && call.peer === peer && peer.connectionState === "disconnected") {
            showToast("The call lost its connection.");
            endCall(true, call.connected ? "ended" : "missed")
              .catch((error) => console.error("The disconnected call could not be closed.", error));
          }
        }, 20000);
      } else if (peer.connectionState === "failed") {
        showToast(call.turnUnavailableReason === "not-deployed"
          ? "Both people are online, but this network blocks a direct call. Kindred's relay server still needs to be set up."
          : "The call couldn't connect. Check both devices' internet and microphone permissions, then try again.");
        endCall(true, call.connected ? "ended" : "missed")
          .catch((error) => console.error("The audio call could not be closed cleanly.", error));
      }
    };
    return peer;
  }

  async function handleCallSignal(event, payload) {
    if (!activeCall) return;
    if (event === "ready" && activeCall.role === "caller") {
      const call = activeCall;
      window.clearTimeout(activeCall.ringTimeout);
      els.callStatus.textContent = "Connecting…";
      startCallConnectionTimeout(call);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      if (activeCall !== call) {
        stream.getTracks().forEach((track) => track.stop());
        return;
      }
      call.stream = stream;
      const peer = await createCallPeer();
      const offer = await peer.createOffer();
      await peer.setLocalDescription(offer);
      const status = await sendCallSignal("offer", { description: peer.localDescription });
      if (status !== "ok") throw new Error("The call offer couldn't be sent. Try again.");
      startCallConnectionTimeout(call);
      return;
    }
    if (event === "ready" && activeCall.role === "callee") {
      const call = activeCall;
      call.callerReady = true;
      els.callStatus.textContent = "Incoming call";
      els.callAcceptButton.disabled = false;
      return;
    }
    if (event === "offer" && activeCall.role === "callee") {
      const call = activeCall;
      const peer = await createCallPeer();
      if (activeCall !== call) return;
      await peer.setRemoteDescription(payload.description);
      for (const candidate of call.queuedIce) await peer.addIceCandidate(candidate);
      call.queuedIce = [];
      const answer = await peer.createAnswer();
      await peer.setLocalDescription(answer);
      const status = await sendCallSignal("answer", { description: peer.localDescription });
      if (status !== "ok") throw new Error("Your call answer couldn't be sent. Try again.");
      startCallConnectionTimeout(call);
      els.callStatus.textContent = "Connecting…";
      return;
    }
    if (event === "answer" && activeCall.role === "caller") {
      const call = activeCall;
      if (!call.peer) throw new Error("The call offer was lost. Try starting the call again.");
      await call.peer.setRemoteDescription(payload.description);
      for (const candidate of call.queuedIce) await call.peer.addIceCandidate(candidate);
      call.queuedIce = [];
      return;
    }
    if (event === "ice" && payload.candidate) {
      const call = activeCall;
      if (call.peer?.remoteDescription) {
        await call.peer.addIceCandidate(payload.candidate);
      } else {
        call.queuedIce.push(payload.candidate);
      }
      return;
    }
    if (event === "declined") {
      showToast(`${activeCall.profile.username} declined the call.`);
      await endCall(false);
      return;
    }
    if (event === "ended") {
      showToast("The other person ended the call.");
      await endCall(false);
    }
  }

  function handleIncomingCall(payload) {
    const callId = payload?.id;
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(callId || "")) {
      return Promise.resolve();
    }
    const task = incomingCallQueue.then(() => handleIncomingCallNow(payload));
    incomingCallQueue = task.catch((error) => {
      console.error("The incoming call couldn't be handled.", error);
      showToast(error.message || "An incoming call couldn't be opened.");
    });
    return task;
  }

  async function handleIncomingCallNow(payload) {
    const callId = payload?.id;
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(callId || "")
      || activeCall?.id === callId || pendingIncomingCallId === callId) return;
    pendingIncomingCallId = callId;
    try {
      const { data: call, error } = await supabaseClient.from("kindred_calls")
        .select("id,caller_id,callee_id,status")
        .eq("id", callId)
        .maybeSingle();
      if (error) throw error;
      if (!call || call.callee_id !== currentUserId || call.status !== "ringing") return;
      if (activeCall) {
        const { error: signalError } = await supabaseClient.from("kindred_call_signals").insert({
          call_id: call.id,
          sender_id: currentUserId,
          event: "declined",
          payload: {},
        });
        const { error: statusError } = await supabaseClient.from("kindred_calls")
          .update({ status: "declined" })
          .eq("id", call.id);
        if (signalError || statusError) {
          const busyError = signalError || statusError;
          console.error("A busy response couldn't be sent to the caller.", busyError);
          showToast(busyError.message || "The incoming call couldn't be declined.");
        }
        return;
      }
      const { data: profile, error: profileError } = await supabaseClient.from("profiles")
        .select("user_id,username,avatar_path,bio")
        .eq("user_id", call.caller_id)
        .maybeSingle();
      if (profileError) throw profileError;
      if (!profile) throw new Error("The caller's profile couldn't be loaded.");
      profilesById.set(profile.user_id, profile);
      activeCall = {
        id: call.id,
        role: "callee",
        profile,
        callerId: call.caller_id,
        queuedIce: [],
        signalQueue: Promise.resolve(),
        signalIds: new Set(),
      };
      const currentCall = activeCall;
      const channel = createCallRoom(call.id);
      setCallScreen(profile, "Incoming call", true);
      startIncomingCallAlert(currentCall);
      await subscribeRealtimeChannel(channel);
      if (activeCall !== currentCall) return;
      els.callDeclineButton.disabled = false;
      await replayCallSignals(call.id);
      if (activeCall !== currentCall) return;
      currentCall.ringTimeout = window.setTimeout(() => {
        if (activeCall !== currentCall || currentCall.role !== "callee") return;
        showToast("The incoming call ended because it wasn't answered.");
        endCall(false, "missed").catch((error) => console.error("The unanswered incoming call couldn't be closed.", error));
      }, 40000);
    } catch (error) {
      console.error("The incoming audio call could not connect.", error);
      showToast(error.message || "The incoming call couldn't connect.");
      if (activeCall?.id === callId) await endCall(false);
    } finally {
      if (pendingIncomingCallId === callId) pendingIncomingCallId = "";
    }
  }

  async function recoverIncomingCall() {
    if (!currentUserId || activeCall || pendingIncomingCallId) return;
    const since = new Date(Date.now() - 60000).toISOString();
    const { data, error } = await supabaseClient.from("kindred_calls")
      .select("id,caller_id,callee_id,status")
      .eq("callee_id", currentUserId)
      .eq("status", "ringing")
      .gte("created_at", since)
      .order("created_at", { ascending: false })
      .limit(1);
    if (error) throw error;
    if (data?.[0]) await handleIncomingCall(data[0]);
  }

  async function startCallInbox() {
    if (!currentUserId) return;
    if (callInboxChannel) await supabaseClient.removeChannel(callInboxChannel);
    const channel = supabaseClient.channel(`kindred-call-inbox:${currentUserId}`);
    callInboxChannel = channel;
    channel.on("postgres_changes", {
      event: "INSERT",
      schema: "public",
      table: "kindred_calls",
      filter: `callee_id=eq.${currentUserId}`,
    }, ({ new: call }) => {
      if (!call || call.status !== "ringing") return;
      handleIncomingCall(call).catch((error) => {
        console.error("The incoming call couldn't be handled.", error);
        showToast(error.message || "An incoming call couldn't be opened.");
      });
    });
    try {
      await subscribeRealtimeChannel(channel);
      await recoverIncomingCall();
    } catch (error) {
      console.error("The Kindred call inbox could not connect.", error);
      showToast(error.message || "Audio calls aren't available. Run the latest supabase/schema.sql.");
    }
  }

  async function startAudioCall() {
    if (!activeChat || !activeContact || activeCall) {
      if (activeCall) showToast("Finish your current call before starting another one.");
      return;
    }
    if (!navigator.mediaDevices?.getUserMedia || !window.RTCPeerConnection) {
      showToast("Audio calls need a supported browser and a secure HTTPS connection.");
      return;
    }
    els.audioCallButton.disabled = true;
    try {
      const { data: callId, error } = await supabaseClient.rpc("create_kindred_call", {
        target_conversation_id: activeChat,
      });
      if (error) throw error;
      const profile = activeContact;
      activeCall = {
        id: callId,
        role: "caller",
        profile,
        queuedIce: [],
        signalQueue: Promise.resolve(),
        signalIds: new Set(),
      };
      const room = createCallRoom(callId);
      setCallScreen(profile, "Calling…");
      await subscribeRealtimeChannel(room);
      await replayCallSignals(callId);
      await sendCallSignal("ready");
      els.callStatus.textContent = "Ringing…";
      activeCall.ringTimeout = window.setTimeout(() => {
        if (activeCall?.id !== callId) return;
        showToast(`${profile.username} didn't answer.`);
        endCall(true, "missed").catch((error) => console.error("The unanswered call could not be closed.", error));
      }, 35000);
    } catch (error) {
      if (activeCall) await endCall(false);
      els.callBackdrop.hidden = true;
      showToast(error.message || "The audio call couldn't be started. Run the latest supabase/schema.sql.");
    } finally {
      els.audioCallButton.disabled = false;
    }
  }

  async function acceptAudioCall() {
    if (!activeCall || activeCall.role !== "callee") return;
    if (!activeCall.callerReady) {
      showToast("Connecting to the caller. Please wait a moment.");
      return;
    }
    if (!navigator.mediaDevices?.getUserMedia || !window.RTCPeerConnection) {
      showToast("Audio calls need a supported browser and a secure HTTPS connection.");
      await endCall(true, "declined");
      return;
    }
    const call = activeCall;
    els.callAcceptButton.disabled = true;
    try {
      window.clearTimeout(call.ringTimeout);
      stopIncomingCallAlert(call);
      closeCallNotification(call.id).catch((error) => console.error("The call notification couldn't be closed.", error));
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      if (activeCall !== call) {
        stream.getTracks().forEach((track) => track.stop());
        return;
      }
      call.stream = stream;
      await createCallPeer();
      if (activeCall !== call) return;
      await setCallStatus("accepted");
      const status = await sendCallSignal("ready");
      if (status !== "ok") throw new Error("The call acceptance couldn't be sent.");
      els.callStatus.textContent = "Connecting…";
      els.callAcceptButton.hidden = true;
      els.callDeclineButton.hidden = true;
      els.callHangupButton.hidden = false;
    } catch (error) {
      showToast(error.message || "Microphone access is needed to answer the call.");
      await endCall(true, "declined");
    } finally {
      els.callAcceptButton.disabled = false;
    }
  }

  async function endCall(notifyPeer = true, status = "ended") {
    const call = activeCall;
    if (!call || call.ending) return;
    call.ending = true;
    window.clearTimeout(call.ringTimeout);
    window.clearTimeout(call.connectionTimeout);
    stopIncomingCallAlert(call);
    closeCallNotification(call.id).catch((error) => console.error("The call notification couldn't be closed.", error));
    if (notifyPeer && callRoomChannel) {
      try {
        const { error } = await supabaseClient.from("kindred_call_signals").insert({
          call_id: call.id,
          sender_id: currentUserId,
          event: status === "declined" ? "declined" : "ended",
          payload: {},
        });
        if (error) throw error;
      } catch (error) {
        console.error("The call ending couldn't be sent to the other person.", error);
        showToast("The call ended here, but the other person might not be notified.");
      }
    }
    activeCall = null;
    if (call.stream) call.stream.getTracks().forEach((track) => track.stop());
    if (call.peer) call.peer.close();
    els.callRemoteAudio.srcObject = null;
    els.callEnableAudioButton.hidden = true;
    els.callMuteButton.hidden = true;
    els.callOutputButton.hidden = true;
    els.callAudioHelp.hidden = true;
    els.callBackdrop.hidden = true;
    if (callRoomChannel) {
      const channel = callRoomChannel;
      callRoomChannel = null;
      await supabaseClient.removeChannel(channel);
    }
    if (currentUserId) {
      const { error: signalDeleteError } = await supabaseClient.from("kindred_call_signals")
        .delete()
        .eq("call_id", call.id);
      if (signalDeleteError) {
        console.error("Call signaling data couldn't be removed.", signalDeleteError);
        showToast("The call ended, but its temporary signaling data couldn't be removed.");
      }
      const { error } = await supabaseClient.from("kindred_calls")
        .update({ status })
        .eq("id", call.id);
      if (error) {
        console.error("The call status couldn't be saved.", error);
        showToast("The call ended, but its status couldn't be synchronized.");
      }
    }
    if (sidebarMode === "calls") renderCallHistory();
  }

  function updateNotificationsButton() {
    if (!("Notification" in window) || !("serviceWorker" in navigator)) {
      els.notificationsButton.textContent = "Notifications unavailable";
      els.notificationsButton.disabled = true;
      return;
    }
    if (Notification.permission === "denied") {
      els.notificationsButton.textContent = "Notifications blocked in browser";
      els.notificationsButton.disabled = true;
      return;
    }
    els.notificationsButton.disabled = false;
    els.notificationsButton.textContent = notificationsEnabled
      ? "Pause message & call alerts"
      : Notification.permission === "granted" ? "Turn on message & call alerts" : "Enable message & call alerts";
  }

  async function enableNotifications() {
    if (!("Notification" in window) || !("serviceWorker" in navigator)) {
      showToast("This browser doesn't support Kindred notifications.");
      return;
    }
    await unlockCallSound();
    let permission = Notification.permission;
    if (permission === "default") permission = await Notification.requestPermission();
    if (permission !== "granted") {
      updateNotificationsButton();
      showToast(permission === "denied"
        ? "Notifications are blocked. Allow them in your browser or device settings."
        : "Notifications weren't enabled.");
      return;
    }
    notificationsEnabled = true;
    try {
      localStorage.removeItem("kindred.notifications.disabled");
    } catch (error) {
      console.error("Notification preference couldn't be saved.", error);
    }
    updateNotificationsButton();
    showToast("Message and call alerts are on while Kindred is open.");
  }

  async function handleNotificationMessage(message) {
    if (!currentUserId || !message || message.sender_id === currentUserId || !notificationsEnabled) return;
    if (!document.hidden && activeChat === message.conversation_id) return;
    if (!("Notification" in window) || Notification.permission !== "granted") return;
    try {
      const registration = await navigator.serviceWorker.ready;
      let contact = profilesById.get(message.sender_id);
      if (!contact) {
        const { data, error } = await supabaseClient.from("profiles")
          .select("user_id,username,avatar_path")
          .eq("user_id", message.sender_id)
          .maybeSingle();
        if (error) throw error;
        contact = data;
        if (contact) profilesById.set(contact.user_id, contact);
      }
      const senderName = contact?.username || "A Kindred member";
      await registration.showNotification("New message · Kindred", {
        body: `${senderName} sent you a message.`,
        icon: "./icons/kindred-192.png",
        badge: "./icons/kindred-192.png",
        tag: `kindred-message-${message.conversation_id}`,
        renotify: false,
        data: {
          userId: message.sender_id,
          conversationId: message.conversation_id,
          url: "./",
        },
        actions: [
          { action: "reply", title: "Reply" },
          { action: "open", title: "Open Kindred" },
        ],
      });
    } catch (error) {
      console.error("An incoming message notification couldn't be shown.", error);
    }
  }

  function startMessageNotifications() {
    if (!currentUserId) return;
    if (notificationsChannel) supabaseClient.removeChannel(notificationsChannel);
    const channel = supabaseClient.channel(`kindred-message-alerts:${currentUserId}`);
    notificationsChannel = channel;
    channel.on("postgres_changes", {
      event: "INSERT",
      schema: "public",
      table: "messages",
    }, ({ new: message }) => {
      handleNotificationMessage(message);
    }).subscribe((status) => {
      if (notificationsChannel !== channel) return;
      if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
        console.error("Kindred message notification updates aren't connected.", status);
      }
    });
  }

  async function openConversationFromNotification(userId) {
    if (!currentUserId || !userId || userId === currentUserId) return;
    let contact = profilesById.get(userId);
    if (!contact) {
      const { data, error } = await supabaseClient.from("profiles")
        .select("user_id,username,avatar_path")
        .eq("user_id", userId)
        .maybeSingle();
      if (error) {
        showToast(error.message || "That conversation couldn't be opened.");
        return;
      }
      if (!data) {
        showToast("That member couldn't be found.");
        return;
      }
      contact = data;
      profilesById.set(userId, contact);
    }
    await openConversation(userId);
    pendingNotificationOpen = null;
    try {
      window.history.replaceState(window.history.state, "", window.location.pathname + window.location.hash);
    } catch (error) {
      console.warn("The notification link couldn't be removed from the page address.", error);
    }
    els.messageInput.focus();
  }

  function processPendingNotificationOpen() {
    if (pendingNotificationOpen && currentUserId) {
      openConversationFromNotification(pendingNotificationOpen.userId);
    }
  }

  async function renderChats() {
    if (!currentUserId || sidebarMode !== "messages") return;
    const request = ++chatsRequest;
    els.chatList.innerHTML = '<p class="directory-status">Loading conversations…</p>';
    const { data: memberships, error: membershipError } = await supabaseClient
      .from("conversation_members")
      .select("conversation_id")
      .eq("user_id", currentUserId);
    if (request !== chatsRequest || sidebarMode !== "messages") return;
    if (membershipError) {
      els.chatList.innerHTML = `<p class="directory-status">${escapeHtml(membershipError.message || "Conversations couldn't be loaded.")}</p>`;
      return;
    }
    const conversationIds = [...new Set((memberships || []).map((row) => row.conversation_id))];
    if (!conversationIds.length) {
      els.chatList.innerHTML = "";
      els.chatList.hidden = true;
      els.emptyList.hidden = false;
      els.emptyList.classList.add("is-visible");
      els.emptyList.querySelector("p").textContent = "No conversations yet";
      els.emptyList.querySelector("span").textContent = "Choose someone from People to start a conversation.";
      els.emptyList.querySelector(".text-button").hidden = Boolean(els.chatSearch.value.trim());
      els.chatCount.textContent = "0";
      return;
    }

    const { data: members, error: membersError } = await supabaseClient
      .from("conversation_members")
      .select("conversation_id,user_id,last_read_at")
      .in("conversation_id", conversationIds);
    if (request !== chatsRequest || sidebarMode !== "messages") return;
    if (membersError) {
      els.chatList.innerHTML = `<p class="directory-status">${escapeHtml(membersError.message || "Conversations couldn't be loaded.")}</p>`;
      return;
    }
    const contactRows = (members || []).filter((member) => member.user_id !== currentUserId);
    const userIds = [...new Set(contactRows.map((member) => member.user_id))];
    const { data: profiles, error: profilesError } = await supabaseClient
      .from("profiles")
      .select("user_id,username,avatar_path")
      .in("user_id", userIds);
    if (request !== chatsRequest || sidebarMode !== "messages") return;
    if (profilesError) {
      els.chatList.innerHTML = `<p class="directory-status">${escapeHtml(profilesError.message || "Profiles couldn't be loaded.")}</p>`;
      return;
    }
    (profiles || []).forEach((profile) => profilesById.set(profile.user_id, profile));
    const { data: messages, error: messagesError } = await supabaseClient
      .from("messages")
      .select("conversation_id,sender_id,content,attachment_name,created_at")
      .in("conversation_id", conversationIds)
      .order("created_at", { ascending: false })
      .limit(1000);
    if (request !== chatsRequest || sidebarMode !== "messages") return;
    if (messagesError) {
      els.chatList.innerHTML = `<p class="directory-status">${escapeHtml(messagesError.message || "Messages couldn't be loaded.")}</p>`;
      return;
    }
    const latestMessages = new Map();
    (messages || []).forEach((message) => {
      if (!latestMessages.has(message.conversation_id)) latestMessages.set(message.conversation_id, message);
    });
    const query = els.chatSearch.value.trim().toLowerCase();
    const participantReadPositions = new Map();
    (members || []).forEach((member) => {
      if (member.user_id !== currentUserId) {
        participantReadPositions.set(member.conversation_id, member.last_read_at);
      }
    });
    const conversations = contactRows.map((member) => ({
      id: member.conversation_id,
      userId: member.user_id,
      profile: profilesById.get(member.user_id),
      last: latestMessages.get(member.conversation_id),
    })).filter((chat) => chat.profile?.username.toLowerCase().includes(query))
      .sort((first, second) => new Date(second.last?.created_at || 0) - new Date(first.last?.created_at || 0));

    els.chatCount.textContent = String(conversations.length);
    els.chatList.innerHTML = conversations.map(({ id, userId, profile, last }) => {
      const previewText = last
        ? last.content || (last.attachment_name ? `File: ${last.attachment_name}` : "Attachment")
        : "Start a conversation";
      const isMine = last?.sender_id === currentUserId;
      const preview = last ? `${isMine ? "You: " : ""}${previewText}` : previewText;
      const peerReadAt = Date.parse(participantReadPositions.get(id) || "") || 0;
      const receipt = isMine ? readReceiptMarkup(peerReadAt >= Date.parse(last.created_at)) : "";
      return `<button class="chat-item${id === activeChat ? " is-active" : ""}" role="listitem" type="button" data-chat="${escapeHtml(id)}" data-user-id="${escapeHtml(userId)}">
        <span class="avatar chat-avatar" data-person-avatar="${escapeHtml(userId)}"></span>
        <span class="chat-item-main">
          <span class="chat-item-top"><span class="chat-item-name">${escapeHtml(profile.username)} <span class="presence-dot${onlineUserIds.has(userId) ? " is-online" : ""}" data-presence-dot="${escapeHtml(userId)}" aria-label="${onlineUserIds.has(userId) ? "Online" : "Offline"}"></span></span><span class="chat-item-time-group"><time class="chat-item-time">${last ? escapeHtml(formatListTime(new Date(last.created_at).getTime())) : ""}</time>${receipt}</span></span>
          <span class="chat-item-preview">${escapeHtml(preview)}</span>
        </span>
      </button>`;
    }).join("");
    els.chatList.querySelectorAll("[data-person-avatar]").forEach((avatar) => {
      const profile = profilesById.get(avatar.dataset.personAvatar);
      setAvatar(avatar, profile.user_id, profile);
    });
    const hasChats = conversations.length > 0;
    els.emptyList.hidden = false;
    els.emptyList.classList.toggle("is-visible", !hasChats);
    els.emptyList.querySelector("p").textContent = query ? "No matches found" : "No conversations yet";
    els.emptyList.querySelector("span").textContent = query ? "Try a different name." : "Choose someone from People to start a conversation.";
    els.emptyList.querySelector(".text-button").hidden = Boolean(query);
    els.chatList.hidden = !hasChats;
  }

  function releaseObjectUrls() {
    activeObjectUrls.forEach((url) => URL.revokeObjectURL(url));
    activeObjectUrls.clear();
  }

  function formatFileSize(size) {
    if (size < 1024) return `${size} B`;
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
    return `${(size / (1024 * 1024)).toFixed(1)} MB`;
  }

  async function renderAttachment(message) {
    if (!message.attachment_path) return "";
    let signedUrl = attachmentUrlCache.get(message.attachment_path);
    if (!signedUrl || signedUrl.expiresAt <= Date.now()) {
      const { data, error } = await supabaseClient.storage
        .from("kindred-chat-files")
        .createSignedUrl(message.attachment_path, 300);
      if (error || !data?.signedUrl) {
        if (error) console.error("A chat attachment could not be opened.", error);
        return '<div class="attachment-missing">This attachment is unavailable.</div>';
      }
      signedUrl = { url: data.signedUrl, expiresAt: Date.now() + 240000 };
      attachmentUrlCache.set(message.attachment_path, signedUrl);
    }
    if (!signedUrl?.url) {
      return '<div class="attachment-missing">This attachment is unavailable.</div>';
    }
    const safeUrl = escapeHtml(signedUrl.url);
    const safeName = escapeHtml(message.attachment_name || "Attachment");
    if (message.attachment_type.startsWith("image/")) {
      return `<a class="message-attachment image-attachment" href="${safeUrl}" target="_blank" rel="noopener"><img src="${safeUrl}" alt="${safeName}" loading="lazy"></a>`;
    }
    if (message.attachment_type.startsWith("video/")) {
      return `<video class="message-attachment video-attachment" controls preload="metadata" src="${safeUrl}">${escapeHtml("Your browser can't play this video.")}</video>`;
    }
    if (message.attachment_type.startsWith("audio/")) {
      return `<audio class="message-audio" controls preload="metadata" src="${safeUrl}">${escapeHtml("Your browser can't play this audio.")}</audio>`;
    }
    return `<a class="file-attachment" href="${safeUrl}" download="${safeName}">
      <span class="file-attachment-icon" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M13 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V10Z" /><path d="M13 3v7h7M8 15h8M8 18h5" /></svg></span>
      <span class="file-attachment-details"><strong>${safeName}</strong><small>${formatFileSize(message.attachment_size || 0)}</small></span>
      <span class="file-download-label">Download</span>
    </a>`;
  }

  function updateConversationPresenceStatus() {
    if (!activeContact) return;
    const isOnline = onlineUserIds.has(activeContact.user_id);
    els.conversationEmail.className = `presence-label${isOnline ? " is-online" : ""}`;
    els.conversationEmail.textContent = isOnline ? "Online" : "Offline";
  }

  function showRemoteTyping(isTyping, conversationId, userId) {
    if (activeChat !== conversationId || activeContact?.user_id !== userId) return;
    window.clearTimeout(remoteTypingTimer);
    if (isTyping) {
      els.typingLabel.textContent = `${activeContact.username} is typing`;
      els.typingIndicator.hidden = false;
      remoteTypingTimer = window.setTimeout(() => {
        els.typingIndicator.hidden = true;
        updateConversationPresenceStatus();
      }, 2200);
      return;
    }
    els.typingIndicator.hidden = true;
    updateConversationPresenceStatus();
  }

  function broadcastTyping(isTyping) {
    const conversationId = activeChat;
    const channel = messageChannel;
    if (!conversationId || !channel) return;
    channel.send({
      type: "broadcast",
      event: "typing",
      payload: { user_id: currentUserId, is_typing: isTyping },
    }).then((status) => {
      if (status !== "ok") console.error("A typing update could not be sent.", status);
    }).catch((error) => console.error("A typing update could not be sent.", error));
  }

  function stopTyping() {
    window.clearTimeout(typingStopTimer);
    if (!typingAnnouncedChat) return;
    typingAnnouncedChat = "";
    broadcastTyping(false);
  }

  function updateTyping() {
    if (!activeChat || !els.messageInput.value.trim()) {
      stopTyping();
      return;
    }
    const now = Date.now();
    if (typingAnnouncedChat !== activeChat || now - lastTypingBroadcastAt >= 1800) {
      typingAnnouncedChat = activeChat;
      lastTypingBroadcastAt = now;
      broadcastTyping(true);
    }
    window.clearTimeout(typingStopTimer);
    typingStopTimer = window.setTimeout(stopTyping, 1500);
  }

  function renderMessages() {
    if (messagesRenderQueued) return;
    messagesRenderQueued = true;
    window.requestAnimationFrame(() => {
      messagesRenderQueued = false;
      renderMessagesNow();
    });
  }

  function renderMessageActionsMarkup(message) {
    if (!messageToolsAvailable) return "";
    const actions = messageActionsById.get(String(message.id)) || [];
    const reactions = new Map();
    let pinned = false;
    let starred = false;
    actions.forEach((action) => {
      if (action.reaction) {
        const reaction = reactions.get(action.reaction) || { count: 0, own: false };
        reaction.count += 1;
        reaction.own ||= action.user_id === currentUserId;
        reactions.set(action.reaction, reaction);
      }
      if (action.user_id === currentUserId) {
        pinned = action.is_pinned;
        starred = action.is_starred;
      }
    });
    const reactionMarkup = [...reactions].map(([emoji, reaction]) => (
      `<button class="message-reaction${reaction.own ? " is-own" : ""}" type="button" data-message-action="react" data-message-id="${escapeHtml(String(message.id))}" data-reaction="${escapeHtml(emoji)}" aria-label="${escapeHtml(`${emoji} ${reaction.count} reactions`)}">${emoji} <span>${reaction.count}</span></button>`
    )).join("");
    return `${reactionMarkup ? `<div class="message-reactions">${reactionMarkup}</div>` : ""}
      <details class="message-actions">
        <summary aria-label="Message actions" title="Message actions">⋯</summary>
        <div class="message-actions-menu">
          <button type="button" data-message-action="info" data-message-id="${escapeHtml(String(message.id))}">Message info</button>
          <button type="button" data-message-action="reply" data-message-id="${escapeHtml(String(message.id))}">Reply</button>
          <button type="button" data-message-action="copy" data-message-id="${escapeHtml(String(message.id))}">Copy</button>
          <button type="button" data-message-action="react" data-message-id="${escapeHtml(String(message.id))}" data-reaction="👍">React 👍</button>
          <button type="button" data-message-action="forward" data-message-id="${escapeHtml(String(message.id))}">Forward</button>
          <button type="button" data-message-action="pin" data-message-id="${escapeHtml(String(message.id))}">${pinned ? "Unpin" : "Pin"}</button>
          <button type="button" data-message-action="star" data-message-id="${escapeHtml(String(message.id))}">${starred ? "Remove star" : "Star"}</button>
          ${message.sender_id === currentUserId ? `<button class="is-danger" type="button" data-message-action="delete" data-message-id="${escapeHtml(String(message.id))}">Delete</button>` : ""}
        </div>
      </details>`;
  }

  async function renderMessagesNow() {
    if (!activeChat || !activeContact) return;
    const request = ++messagesRenderVersion;
    const renderedChat = activeChat;
    const contact = activeContact;
    const wasNearBottom = els.messageList.scrollHeight - els.messageList.scrollTop - els.messageList.clientHeight < 90;
    const oldScrollTop = els.messageList.scrollTop;
    const enhancedSelect = "id,sender_id,content,created_at,attachment_path,attachment_name,attachment_type,attachment_size,reply_to_id,is_forwarded";
    let { data: messages, error } = await supabaseClient
      .from("messages")
      .select(enhancedSelect)
      .eq("conversation_id", activeChat)
      .order("created_at", { ascending: true })
      .limit(1000);
    if (error && ["42703", "PGRST200", "PGRST204"].includes(error.code)) {
      messageToolsAvailable = false;
      if (!warnedMessageSchema) {
        warnedMessageSchema = true;
        showToast("Supabase is returning an older message schema. Check that Kindred is using the project where you ran schema.sql, then refresh the Data API schema cache.");
      }
      ({ data: messages, error } = await supabaseClient.from("messages")
        .select("id,sender_id,content,created_at,attachment_path,attachment_name,attachment_type,attachment_size")
        .eq("conversation_id", activeChat)
        .order("created_at", { ascending: true })
        .limit(1000));
    }
    if (error) {
      showToast(error.message || "Messages couldn't be loaded.");
      return;
    }
    if (activeChat !== renderedChat || request !== messagesRenderVersion) return;
    setAvatar(els.conversationAvatar, contact.user_id, contact);
    els.conversationTitle.textContent = contact.username;
    els.conversationEmail.dataset.presenceUser = contact.user_id;
    updateConversationPresenceStatus();
    if (!messages.length) {
      messagesById.clear();
      messageActionsById.clear();
      els.messageList.innerHTML = `<p class="message-empty">This is the beginning of your conversation. Say hello 👋</p>`;
      return;
    }
    messagesById.clear();
    messages.forEach((message) => messagesById.set(String(message.id), message));
    messageActionsById.clear();
    if (messageToolsAvailable) {
      const replyIds = [...new Set(messages.map((message) => message.reply_to_id).filter(Boolean))];
      if (replyIds.length) {
        const { data: replies, error: repliesError } = await supabaseClient.from("messages")
          .select("id,sender_id,content,attachment_name,attachment_type")
          .eq("conversation_id", renderedChat)
          .in("id", replyIds);
        if (activeChat !== renderedChat || request !== messagesRenderVersion) return;
        if (repliesError) {
          console.error("Reply previews couldn't be loaded.", repliesError);
        } else {
          const repliesById = new Map((replies || []).map((reply) => [String(reply.id), reply]));
          messages.forEach((message) => {
            const reply = repliesById.get(String(message.reply_to_id));
            if (reply) message.reply_to = reply;
          });
        }
      }
    }
    if (messageToolsAvailable) {
      const { data: messageActions, error: actionsError } = await supabaseClient.from("kindred_message_actions")
        .select("message_id,user_id,reaction,is_pinned,is_starred")
        .eq("conversation_id", renderedChat)
        .in("message_id", messages.map((message) => message.id));
      if (actionsError && ["42P01", "PGRST205"].includes(actionsError.code)) {
        messageToolsAvailable = false;
        if (!warnedMessageSchema) {
          warnedMessageSchema = true;
          showToast("The message-actions table is missing from this Supabase project. Check that Kindred is using the project where you ran schema.sql.");
        }
      } else if (actionsError) {
        console.error("Message reactions and saved actions couldn't be loaded.", actionsError);
      } else {
        (messageActions || []).forEach((action) => {
          const key = String(action.message_id);
          const items = messageActionsById.get(key) || [];
          items.push(action);
          messageActionsById.set(key, items);
        });
      }
    }
    const { data: members, error: membersError } = await supabaseClient
      .from("conversation_members")
      .select("user_id,last_read_at")
      .eq("conversation_id", renderedChat);
    if (activeChat !== renderedChat || request !== messagesRenderVersion) return;
    if (membersError) {
      console.error("Conversation read positions couldn't be loaded.", membersError);
      showToast(membersError.code === "42703" || membersError.code === "PGRST204"
        ? "Supabase hasn't refreshed the conversation read-receipt schema yet. Refresh the Data API schema cache."
        : "Read receipts are temporarily unavailable. Your messages still work.");
    }
    const participantRows = members || [];
    const ownMember = participantRows.find((member) => member.user_id === currentUserId);
    const otherMember = participantRows.find((member) => member.user_id === contact.user_id);
    const peerReadAt = otherMember?.last_read_at ? Date.parse(otherMember.last_read_at) : 0;
    let previousDay = "";
    try {
      const renderedMessages = [];
      for (const message of messages) {
        const date = new Date(message.created_at);
        const day = date.toDateString();
        let dayLabel = "";
        if (day !== previousDay) {
          const today = new Date().toDateString();
          const yesterday = new Date(Date.now() - 86400000).toDateString();
          dayLabel = day === today ? "Today" : day === yesterday ? "Yesterday" : new Intl.DateTimeFormat(undefined, { month: "long", day: "numeric", year: "numeric" }).format(date);
          previousDay = day;
        }
        const isMine = message.sender_id === currentUserId;
        const attachment = await renderAttachment(message);
        const reply = Array.isArray(message.reply_to) ? message.reply_to[0] : message.reply_to;
        const quotedText = reply?.content?.trim() || reply?.attachment_name || (reply ? "Attachment" : "");
        renderedMessages.push(`${dayLabel ? `<div class="message-day">${escapeHtml(dayLabel)}</div>` : ""}
          <article class="message-row${isMine ? " is-mine" : ""}" data-message-row="${escapeHtml(String(message.id))}">
            ${!isMine ? `<span class="message-sender">${escapeHtml(contactName(message.sender_id))}</span>` : ""}
            <div class="message-bubble">
              ${message.is_forwarded ? '<span class="message-forwarded">↗ Forwarded</span>' : ""}
              ${reply ? `<div class="message-reply-quote"><strong>${escapeHtml(contactName(reply.sender_id))}</strong><span>${escapeHtml(quotedText)}</span></div>` : ""}
              ${message.content ? `<div class="message-text">${escapeHtml(message.content)}</div>` : ""}${attachment}
            </div>
            <div class="message-meta"><time>${escapeHtml(formatTime(date.getTime()))}</time>${isMine ? readReceiptMarkup(peerReadAt >= date.getTime()) : ""}${renderMessageActionsMarkup(message)}</div>
          </article>`);
      }
      if (activeChat !== renderedChat || request !== messagesRenderVersion) {
        return;
      }
      els.messageList.innerHTML = renderedMessages.join("");
      els.messageList.scrollTop = wasNearBottom
        ? els.messageList.scrollHeight
        : Math.min(oldScrollTop, els.messageList.scrollHeight - els.messageList.clientHeight);
      if (!membersError && !document.hidden && ownMember) {
        const latestMessage = messages[messages.length - 1];
        const previousReadAt = readPositionByChat.get(renderedChat) || ownMember.last_read_at;
        if (!previousReadAt || Date.parse(latestMessage.created_at) > Date.parse(previousReadAt)) {
          readPositionByChat.set(renderedChat, latestMessage.created_at);
          const { error: readError } = await supabaseClient.from("conversation_members")
            .update({ last_read_at: latestMessage.created_at })
            .eq("conversation_id", renderedChat)
            .eq("user_id", currentUserId);
          if (readError) {
            readPositionByChat.delete(renderedChat);
            console.error("Your message read position couldn't be updated.", readError);
            showToast("Your messages couldn't be marked as read. Run the latest supabase/schema.sql.");
          }
        }
      }
    } catch (error) {
      showToast(error.message || "Messages couldn't be loaded.");
    }
  }

  function showConversation() {
    const hasActiveChat = Boolean(activeChat);
    els.conversationEmpty.hidden = hasActiveChat;
    els.activeConversation.hidden = !hasActiveChat;
    els.chatScreen.classList.toggle("mobile-chat-open", hasActiveChat);
    if (hasActiveChat) renderMessages();
    renderChats();
  }

  function updateConversationHistory(userId, push) {
    const state = { kindredView: "conversation", userId };
    try {
      if (push) window.history.pushState(state, "");
      else window.history.replaceState(state, "");
      return true;
    } catch (error) {
      console.warn("Conversation back navigation isn't available for this page address.", error);
      return false;
    }
  }

  function leaveConversation() {
    if (!activeChat) return;
    stopTyping();
    window.clearTimeout(remoteTypingTimer);
    els.typingIndicator.hidden = true;
    activeChat = "";
    activeContact = null;
    if (messageChannel) {
      supabaseClient.removeChannel(messageChannel);
      messageChannel = null;
    }
    showConversation();
  }

  function showChatScreen(email) {
    currentEmail = email.toLowerCase();
    els.signOutButton.classList.remove("is-visible");
    els.loginScreen.hidden = true;
    els.chatScreen.hidden = false;
    const profile = profileFor(readStore(), currentEmail);
    els.accountEmail.textContent = currentEmail;
    els.accountName.textContent = profile.username || displayName(currentEmail);
    setAvatar(els.accountAvatar, currentEmail, profile);
    activeChat = "";
    activeContact = null;
    showConversation();
  }

  async function loadCloudProfile(user) {
    let { data, error } = await supabaseClient
      .from("profiles")
      .select("username,avatar_path,bio,created_at")
      .eq("user_id", user.id)
      .maybeSingle();
    if (error?.code === "42703" && error.message?.includes("profiles.bio")) {
      const fallback = await supabaseClient.from("profiles")
        .select("username,avatar_path,created_at")
        .eq("user_id", user.id)
        .maybeSingle();
      data = fallback.data ? { ...fallback.data, bio: "" } : null;
      error = fallback.error;
    }
    if (error) throw error;
    if (!data) {
      throw new Error("Your account profile is missing in Supabase. Run the updated supabase/schema.sql in this project's SQL Editor, then try again.");
    }
    cloudProfile = {
      email: user.email.toLowerCase(),
      username: data.username,
      avatar_path: data.avatar_path,
      bio: data.bio || "",
      created_at: data.created_at,
    };
  }

  async function finishCloudLogin(user) {
    await loadCloudProfile(user);
    currentUserId = user.id;
    if (selectedPhoto && !cloudProfile.avatar_path) {
      let uploadedPath = "";
      try {
        uploadedPath = await uploadProfilePhoto(selectedPhoto);
        const { error } = await supabaseClient.rpc("update_my_profile", {
          new_username: cloudProfile.username,
          new_avatar_path: uploadedPath,
        });
        if (error) throw error;
        cloudProfile.avatar_path = uploadedPath;
      } catch (error) {
        if (uploadedPath) {
          const { error: cleanupError } = await supabaseClient.storage
            .from("kindred-profile-pictures").remove([uploadedPath]);
          if (cleanupError) console.error("An unsaved profile picture couldn't be removed.", cleanupError);
        }
        console.error("The signup profile picture couldn't be saved.", error);
        showToast(error.message || "Your account was created, but its profile picture couldn't be saved.");
      }
    }
    profilesById.set(user.id, {
      user_id: user.id,
      username: cloudProfile.username,
      avatar_path: cloudProfile.avatar_path,
      bio: cloudProfile.bio || "",
    });
    const store = readStore();
    store.profiles[user.email.toLowerCase()] = {
      ...(store.profiles[user.email.toLowerCase()] || {}),
      username: cloudProfile.username,
      photo: selectedPhoto || store.profiles[user.email.toLowerCase()]?.photo || "",
    };
    writeStore(store);
    showChatScreen(user.email);
    startPresence();
    startMessageNotifications();
    startCallInbox();
    updateNotificationsButton();
    processPendingNotificationOpen();
  }

  function closeProfile() {
    els.profileBackdrop.hidden = true;
    els.profileError.textContent = "";
    profileSelectedPhoto = "";
    profileRemovePhoto = false;
    els.profilePhotoInput.value = "";
    els.removeProfilePhotoButton.disabled = false;
    els.removeProfilePhotoButton.textContent = "Remove profile picture";
    els.accountButton.focus();
  }

  function restoreProfileAvatar() {
    profileSelectedPhoto = "";
    profileRemovePhoto = false;
    els.profilePhotoInput.value = "";
    els.removeProfilePhotoButton.disabled = false;
    els.removeProfilePhotoButton.textContent = "Remove profile picture";
    setAvatar(els.profileAvatar, currentEmail, profileFor(readStore(), currentEmail));
  }

  async function uploadProfilePhoto(dataUrl) {
    const response = await fetch(dataUrl);
    if (!response.ok) throw new Error("The selected profile picture couldn't be prepared.");
    const image = await response.blob();
    const path = `${currentUserId}/${attachmentId()}.jpg`;
    const { error } = await supabaseClient.storage
      .from("kindred-profile-pictures")
      .upload(path, image, { contentType: "image/jpeg", upsert: false });
    if (error) throw error;
    return path;
  }

  function openProfile() {
    const store = readStore();
    const profile = profileFor(store, currentEmail);
    els.profileUsername.value = cloudProfile?.username || profile.username || "";
    els.profileBio.value = cloudProfile?.bio || "";
    updateBioCharacterCount();
    els.profileEmail.value = currentEmail;
    els.profileJoined.textContent = cloudProfile?.created_at
      ? `Member since ${new Intl.DateTimeFormat(undefined, { month: "long", year: "numeric" }).format(new Date(cloudProfile.created_at))}`
      : "";
    els.profileError.textContent = "";
    restoreProfileAvatar();
    els.accountMenu.classList.remove("is-visible");
    els.accountButton.setAttribute("aria-expanded", "false");
    els.profileBackdrop.hidden = false;
    els.profileUsername.focus();
  }

  async function saveProfile(event) {
    event.preventDefault();
    const username = els.profileUsername.value.trim();
    const bio = els.profileBio.value.trim();
    if (!username || username.length > 40) {
      els.profileError.textContent = "Choose a username between 1 and 40 characters.";
      els.profileUsername.focus();
      return;
    }
    if (bio.length > 280) {
      els.profileError.textContent = "Your bio must be 280 characters or fewer.";
      els.profileBio.focus();
      return;
    }
    els.profileSaveButton.disabled = true;
    els.profileError.textContent = "";
    let uploadedPath = "";
    const oldAvatarPath = cloudProfile.avatar_path || "";
    let oldAvatarDeleteError = null;
    try {
      if (profileSelectedPhoto) uploadedPath = await uploadProfilePhoto(profileSelectedPhoto);
      const { data, error } = await supabaseClient.rpc("update_my_profile", {
        new_username: username,
        new_avatar_path: uploadedPath || null,
        new_bio: bio,
        remove_avatar: profileRemovePhoto,
      });
      if (error) throw error;
      const savedUsername = data || username;
      cloudProfile.username = savedUsername;
      cloudProfile.bio = bio;
      if (uploadedPath) cloudProfile.avatar_path = uploadedPath;
      if (profileRemovePhoto) cloudProfile.avatar_path = null;
      profilesById.set(currentUserId, {
        user_id: currentUserId,
        username: savedUsername,
        avatar_path: cloudProfile.avatar_path,
        bio,
      });
      const store = readStore();
      store.profiles[currentEmail] = {
        ...(store.profiles[currentEmail] || {}),
        username: savedUsername,
        photo: profileRemovePhoto ? "" : profileSelectedPhoto || store.profiles[currentEmail]?.photo || "",
      };
      writeStore(store);
      els.accountName.textContent = savedUsername;
      setAvatar(els.accountAvatar, currentEmail, {
        username: savedUsername,
        avatar_path: cloudProfile.avatar_path,
      });
      if ((uploadedPath || profileRemovePhoto) && oldAvatarPath && oldAvatarPath !== uploadedPath) {
        const { error: removeError } = await supabaseClient.storage
          .from("kindred-profile-pictures").remove([oldAvatarPath]);
        if (removeError) {
          console.error("The previous profile picture couldn't be removed.", removeError);
          oldAvatarDeleteError = removeError;
        }
      }
      els.profileUsername.value = savedUsername;
      closeProfile();
      if (oldAvatarDeleteError) {
        showToast("Profile updated, but the old picture couldn't be deleted from storage.");
      } else {
        showToast("Your profile has been updated.");
      }
    } catch (error) {
      if (uploadedPath) {
        const { error: cleanupError } = await supabaseClient.storage
          .from("kindred-profile-pictures").remove([uploadedPath]);
        if (cleanupError) console.error("An unsaved profile picture couldn't be removed.", cleanupError);
      }
      els.profileError.textContent = error.message || "Your profile couldn't be updated.";
    } finally {
      els.profileSaveButton.disabled = false;
    }
  }

  function updateBioCharacterCount() {
    els.profileBioCount.textContent = `${els.profileBio.value.length} / 280`;
  }

  async function openMemberProfile(userId) {
    if (!userId || userId === currentUserId) return;
    els.memberProfileTitle.textContent = "Loading profile…";
    els.memberProfileBio.textContent = "";
    els.memberProfileJoined.textContent = "";
    els.memberProfileBackdrop.hidden = false;
    try {
      const { data, error } = await supabaseClient.from("profiles")
        .select("user_id,username,avatar_path,bio,created_at")
        .eq("user_id", userId)
        .maybeSingle();
      if (error) throw error;
      if (!data) {
        els.memberProfileBackdrop.hidden = true;
        showToast("This profile is no longer available.");
        return;
      }
      profilesById.set(userId, data);
      setAvatar(els.memberProfileAvatar, userId, data);
      els.memberProfileTitle.textContent = data.username;
      els.memberProfileBio.textContent = data.bio?.trim() || "This member hasn't added a bio yet.";
      els.memberProfileJoined.textContent = data.created_at
        ? `Member since ${new Intl.DateTimeFormat(undefined, { month: "long", year: "numeric" }).format(new Date(data.created_at))}`
        : "";
      els.memberProfileMessageButton.dataset.userId = userId;
    } catch (error) {
      els.memberProfileBackdrop.hidden = true;
      showToast(error.message || "This profile couldn't be loaded.");
    }
  }

  function closeMemberProfile() {
    els.memberProfileBackdrop.hidden = true;
  }

  function showLoginScreen() {
    endCall(false).catch((error) => console.error("The audio call couldn't be closed during sign out.", error));
    stopTyping();
    currentEmail = "";
    currentUserId = "";
    cloudProfile = null;
    activeChat = "";
    activeContact = null;
    try {
      window.history.replaceState({}, "", window.location.pathname + window.location.hash);
    } catch (error) {
      console.warn("The page address couldn't be reset after sign out.", error);
    }
    profilesById.clear();
    if (messageChannel) {
      supabaseClient.removeChannel(messageChannel);
      messageChannel = null;
    }
    window.clearTimeout(remoteTypingTimer);
    els.typingIndicator.hidden = true;
    if (presenceChannel) {
      supabaseClient.removeChannel(presenceChannel);
      presenceChannel = null;
    }
    if (notificationsChannel) {
      supabaseClient.removeChannel(notificationsChannel);
      notificationsChannel = null;
    }
    if (callInboxChannel) {
      supabaseClient.removeChannel(callInboxChannel);
      callInboxChannel = null;
    }
    onlineUserIds.clear();
    els.accountMenu.classList.remove("is-visible");
    els.accountButton.setAttribute("aria-expanded", "false");
    els.profileBackdrop.hidden = true;
    els.signOutButton.classList.remove("is-visible");
    els.chatScreen.hidden = true;
    els.loginScreen.hidden = false;
    els.loginUsername.value = "";
    els.loginEmail.value = "";
    els.loginPassword.value = "";
    els.confirmPassword.value = "";
    els.loginPhoto.value = "";
    selectedPhoto = "";
    resetPhotoPreview();
    els.loginError.textContent = "";
    setAuthMode("login");
    els.chatScreen.classList.remove("mobile-chat-open");
  }

  async function openConversation(userId) {
    const contact = profilesById.get(userId);
    if (!contact || userId === currentUserId) return;
    const { data: conversationId, error } = await supabaseClient
      .rpc("create_direct_conversation", { target_user_id: userId });
    if (error) {
      showToast(error.message || "A conversation couldn't be opened.");
      return;
    }
    updateConversationHistory(userId, !activeChat);
    stopTyping();
    window.clearTimeout(remoteTypingTimer);
    els.typingIndicator.hidden = true;
    if (messageChannel) await supabaseClient.removeChannel(messageChannel);
    activeChat = conversationId;
    activeContact = contact;
    setSidebarMode("messages");
    els.chatSearch.value = "";
    showConversation();
    messageChannel = supabaseClient
      .channel(`messages:${conversationId}`)
      .on("postgres_changes", {
        event: "*",
        schema: "public",
        table: "messages",
        filter: `conversation_id=eq.${conversationId}`,
      }, () => {
        renderMessages();
        renderChats();
      })
      .on("postgres_changes", {
        event: "UPDATE",
        schema: "public",
        table: "conversation_members",
        filter: `conversation_id=eq.${conversationId}`,
      }, ({ new: member }) => {
        if (member?.user_id === currentUserId) return;
        renderMessages();
        renderChats();
      })
      .on("postgres_changes", {
        event: "*",
        schema: "public",
        table: "kindred_message_actions",
        filter: `conversation_id=eq.${conversationId}`,
      }, () => {
        renderMessages();
      })
      .on("broadcast", { event: "typing" }, ({ payload }) => {
        if (!payload || payload.user_id === currentUserId) return;
        showRemoteTyping(Boolean(payload.is_typing), conversationId, payload.user_id);
      })
      .subscribe((status) => {
        if (status === "SUBSCRIBED") {
          renderMessages();
          renderChats();
        }
        if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
          showToast("Live message updates are unavailable. Refresh to check for new messages.");
        }
      });
    els.messageInput.focus();
  }

  async function deleteMessage(messageId) {
    if (!activeChat || !currentUserId || !messageId) return;
    const row = [...els.messageList.querySelectorAll("[data-message-row]")]
      .find((messageRow) => messageRow.dataset.messageRow === messageId);
    if (!row || !row.classList.contains("is-mine")) return;
    if (!window.confirm("Delete this message and its attachment for everyone in this conversation? This cannot be undone.")) return;
    const conversationId = activeChat;
    const deleteButton = row.querySelector("[data-delete-message]");
    if (deleteButton) deleteButton.disabled = true;
    const { data, error } = await supabaseClient.from("messages")
      .delete()
      .eq("id", messageId)
      .eq("sender_id", currentUserId)
      .eq("conversation_id", conversationId)
      .select("id,attachment_path")
      .maybeSingle();
    if (error) {
      console.error("Your message couldn't be deleted.", error);
      showToast("This message couldn't be deleted. Run the latest supabase/schema.sql to enable message deletion.");
      if (deleteButton) deleteButton.disabled = false;
      return;
    }
    if (!data) {
      showToast("That message was already deleted or you don't have permission to remove it.");
      if (activeChat === conversationId) renderMessages();
      return;
    }
    if (data.attachment_path) {
      const { error: storageError } = await supabaseClient.storage
        .from("kindred-chat-files")
        .remove([data.attachment_path]);
      if (storageError) {
        console.error("The deleted message's attachment couldn't be removed from storage.", storageError);
        showToast("Message deleted, but its stored attachment couldn't be removed.");
      }
    }
    if (activeChat === conversationId) {
      renderMessages();
      renderChats();
    }
  }

  async function handleFriendAction(button) {
    const action = button.dataset.action;
    button.disabled = true;
    try {
      let result;
      if (action === "add") {
        result = await supabaseClient.rpc("send_friend_request", {
          target_user_id: button.dataset.userId,
        });
      } else {
        result = await supabaseClient.rpc("respond_to_friend_request", {
          target_request_id: button.dataset.requestId,
          accept_request: action === "accept",
        });
      }
      if (result.error) throw result.error;
      showToast(action === "add"
        ? "Friend request sent."
        : action === "accept" ? "Friend request accepted." : "Friend request declined.");
      await renderPeople();
    } catch (error) {
      showToast(error.message || "That friend request couldn't be updated.");
      button.disabled = false;
    }
  }

  function showToast(message) {
    els.toast.textContent = message;
    els.toast.classList.add("is-visible");
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => els.toast.classList.remove("is-visible"), 3200);
  }

  async function checkForAppUpdates(button) {
    const originalText = button.textContent;
    button.disabled = true;
    button.textContent = "Checking…";
    try {
      if (!("serviceWorker" in navigator)) {
        showToast("Refreshing Kindred.");
        window.location.reload();
        return;
      }

      const registration = await navigator.serviceWorker.ready;
      const hadController = Boolean(navigator.serviceWorker.controller);
      await registration.update();

      if (registration.waiting) {
        if (!hadController) {
          window.location.reload();
          return;
        }
        navigator.serviceWorker.addEventListener("controllerchange", () => {
          window.location.reload();
        }, { once: true });
        registration.waiting.postMessage({ type: "SKIP_WAITING" });
        return;
      }

      if (registration.installing) {
        const installingWorker = registration.installing;
        const workerState = await new Promise((resolve) => {
          const timeout = window.setTimeout(() => {
            installingWorker.removeEventListener("statechange", onStateChange);
            resolve("timeout");
          }, 15000);
          const onStateChange = () => {
            if (installingWorker.state === "installed" || installingWorker.state === "redundant") {
              window.clearTimeout(timeout);
              installingWorker.removeEventListener("statechange", onStateChange);
              resolve(installingWorker.state);
            }
          };
          installingWorker.addEventListener("statechange", onStateChange);
          onStateChange();
        });
        if (workerState === "installed" && registration.waiting && hadController) {
          navigator.serviceWorker.addEventListener("controllerchange", () => {
            window.location.reload();
          }, { once: true });
          registration.waiting.postMessage({ type: "SKIP_WAITING" });
          return;
        }
        if (workerState === "redundant") {
          throw new Error("The update couldn't be installed. Check your connection and try again.");
        }
        if (workerState === "installed" && !hadController) {
          window.location.reload();
          return;
        }
        if (workerState === "timeout") {
          throw new Error("The update is taking longer than expected. Try again when your connection is stronger.");
        }
      }

      showToast("Kindred is up to date.");
    } catch (error) {
      console.error("Kindred couldn't check for app updates.", error);
      showToast(error.message || "Kindred couldn't check for updates. Check your connection and try again.");
    } finally {
      if (button.isConnected) {
        button.textContent = originalText;
        button.disabled = false;
      }
    }
  }

  function setTheme(theme, persist = true) {
    const isDark = theme === "dark";
    document.documentElement.dataset.theme = isDark ? "dark" : "light";
    els.themeToggle.setAttribute("aria-label", `Switch to ${isDark ? "light" : "dark"} theme`);
    els.themeToggle.title = `Switch to ${isDark ? "light" : "dark"} theme`;
    document.querySelector('meta[name="theme-color"]').content = isDark ? "#080c14" : "#f4f7fc";
    if (!persist) return;
    try {
      localStorage.setItem(THEME_KEY, isDark ? "dark" : "light");
    } catch {
      showToast("Theme changed for this page, but your browser couldn't save the preference.");
    }
  }

  function resetPhotoPreview() {
    els.photoPreview.classList.remove("has-photo");
    els.photoPreview.style.backgroundImage = "";
    els.photoPreview.innerHTML = '<svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="4" /><path d="M5 20a7 7 0 0 1 14 0" /></svg>';
    els.photoFileName.textContent = "Add a profile picture";
  }

  function readPhoto(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = () => reject(new Error("This image couldn't be opened. Try another file."));
      reader.onload = () => {
        const image = new Image();
        image.onerror = () => reject(new Error("This image couldn't be opened. Try another file."));
        image.onload = () => {
          try {
            const frameSize = 512;
            const scale = Math.min(1, frameSize / image.naturalWidth, frameSize / image.naturalHeight);
            const width = Math.max(1, Math.round(image.naturalWidth * scale));
            const height = Math.max(1, Math.round(image.naturalHeight * scale));
            const canvas = document.createElement("canvas");
            canvas.width = frameSize;
            canvas.height = frameSize;
            const context = canvas.getContext("2d");
            if (!context) {
              reject(new Error("Your browser couldn't prepare this picture."));
              return;
            }
            context.fillStyle = "#eef2f7";
            context.fillRect(0, 0, frameSize, frameSize);
            context.drawImage(image, (frameSize - width) / 2, (frameSize - height) / 2, width, height);
            resolve(canvas.toDataURL("image/jpeg", 0.88));
          } catch {
            reject(new Error("Your browser couldn't prepare this picture. Try a smaller image."));
          }
        };
        image.src = reader.result;
      };
      reader.readAsDataURL(file);
    });
  }

  function setReplyTarget(message) {
    replyTarget = message;
    const reply = Array.isArray(message.reply_to) ? message.reply_to[0] : message.reply_to;
    const senderId = reply?.sender_id || message.sender_id;
    els.replyPreviewTitle.textContent = `Replying to ${contactName(senderId)}`;
    els.replyPreviewText.textContent = message.content?.trim()
      || message.attachment_name
      || (message.attachment_type?.startsWith("image/") ? "Photo" : "Attachment");
    els.replyPreview.hidden = false;
    els.emojiPicker.hidden = true;
    els.messageInput.focus();
  }

  function clearReplyTarget() {
    replyTarget = null;
    els.replyPreview.hidden = true;
    els.replyPreviewText.textContent = "";
  }

  async function saveMessageAction(message, updates) {
    if (!messageToolsAvailable || !activeChat || !message) {
      showToast("Run the latest supabase/schema.sql to enable this message action.");
      return;
    }
    const conversationId = activeChat;
    const rows = messageActionsById.get(String(message.id)) || [];
    const ownAction = rows.find((row) => row.user_id === currentUserId);
    const nextAction = {
      message_id: message.id,
      conversation_id: conversationId,
      user_id: currentUserId,
      reaction: ownAction?.reaction ?? null,
      is_pinned: ownAction?.is_pinned ?? false,
      is_starred: ownAction?.is_starred ?? false,
      ...updates,
      updated_at: new Date().toISOString(),
    };
    try {
      if (!nextAction.reaction && !nextAction.is_pinned && !nextAction.is_starred) {
        if (!ownAction) return;
        const { error } = await supabaseClient.from("kindred_message_actions")
          .delete()
          .eq("message_id", message.id)
          .eq("user_id", currentUserId);
        if (error) throw error;
      } else {
        const { error } = await supabaseClient.from("kindred_message_actions")
          .upsert(nextAction, { onConflict: "message_id,user_id" });
        if (error) throw error;
      }
      if (activeChat === conversationId) renderMessages();
    } catch (error) {
      console.error("A message reaction or saved action couldn't be updated.", error);
      showToast(error.message || "This message action couldn't be saved.");
    }
  }

  async function openForwardMessage(message) {
    if (!messageToolsAvailable) {
      showToast("Run the latest supabase/schema.sql to enable forwarding.");
      return;
    }
    forwardTarget = message;
    els.forwardCopy.textContent = message.content?.trim()
      || message.attachment_name
      || "This attachment";
    els.forwardContact.replaceChildren();
    els.forwardError.textContent = "";
    els.forwardSendButton.disabled = true;
    els.forwardBackdrop.hidden = false;
    try {
      const { data, error } = await supabaseClient.from("profiles")
        .select("user_id,username,avatar_path,bio")
        .neq("user_id", currentUserId)
        .order("username", { ascending: true })
        .limit(100);
      if (error) throw error;
      const profiles = data || [];
      profiles.forEach((profile) => profilesById.set(profile.user_id, profile));
      els.forwardContact.innerHTML = profiles.map((profile) => (
        `<option value="${escapeHtml(profile.user_id)}">${escapeHtml(profile.username)}</option>`
      )).join("");
      els.forwardSendButton.disabled = !profiles.length;
      if (!profiles.length) els.forwardError.textContent = "There are no other members to forward this to yet.";
    } catch (error) {
      console.error("The forwarding contact list couldn't be loaded.", error);
      els.forwardError.textContent = error.message || "Contacts couldn't be loaded.";
    }
  }

  async function forwardMessage() {
    if (!forwardTarget || !els.forwardContact.value) return;
    const message = forwardTarget;
    const targetUserId = els.forwardContact.value;
    els.forwardSendButton.disabled = true;
    els.forwardError.textContent = "";
    let attachmentPath = null;
    try {
      const { data: conversationId, error: conversationError } = await supabaseClient.rpc("create_direct_conversation", {
        target_user_id: targetUserId,
      });
      if (conversationError) throw conversationError;
      if (!conversationId) throw new Error("A conversation couldn't be opened.");
      if (message.attachment_path) {
        const { data: file, error: downloadError } = await supabaseClient.storage
          .from("kindred-chat-files")
          .download(message.attachment_path);
        if (downloadError) throw downloadError;
        const safeName = (message.attachment_name || "attachment").replace(/[^a-zA-Z0-9._-]/g, "_").slice(-120) || "attachment";
        attachmentPath = `${conversationId}/${currentUserId}/${attachmentId()}-${safeName}`;
        const { error: uploadError } = await supabaseClient.storage
          .from("kindred-chat-files")
          .upload(attachmentPath, file, {
            contentType: message.attachment_type || "application/octet-stream",
            upsert: false,
          });
        if (uploadError) throw uploadError;
      }
      const { error } = await supabaseClient.from("messages").insert({
        conversation_id: conversationId,
        sender_id: currentUserId,
        content: message.content || null,
        attachment_path: attachmentPath,
        attachment_name: attachmentPath ? message.attachment_name : null,
        attachment_type: attachmentPath ? message.attachment_type : null,
        attachment_size: attachmentPath ? message.attachment_size : null,
        is_forwarded: true,
      });
      if (error) throw error;
      els.forwardBackdrop.hidden = true;
      forwardTarget = null;
      showToast("Message forwarded.");
      renderChats();
    } catch (error) {
      if (attachmentPath) {
        try {
          const { error: cleanupError } = await supabaseClient.storage
            .from("kindred-chat-files")
            .remove([attachmentPath]);
          if (cleanupError) console.error("The incomplete forwarded attachment couldn't be removed.", cleanupError);
        } catch (cleanupError) {
          console.error("The incomplete forwarded attachment couldn't be removed.", cleanupError);
        }
      }
      console.error("The message couldn't be forwarded.", error);
      els.forwardError.textContent = error.message || "The message couldn't be forwarded.";
    } finally {
      if (forwardTarget === message) els.forwardSendButton.disabled = false;
    }
  }

  function showMessageInfo(message) {
    const details = [
      `Sent ${new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(new Date(message.created_at))}`,
      message.attachment_name ? `File: ${message.attachment_name} (${formatFileSize(message.attachment_size || 0)})` : "",
    ].filter(Boolean);
    showToast(details.join(" · "));
  }

  async function sendMessage(text) {
    const cleanText = text.trim();
    if (!cleanText || !activeChat) return;
    const conversationId = activeChat;
    const submittedText = cleanText;
    const replyId = replyTarget && messageToolsAvailable ? replyTarget.id : null;
    els.sendButton.disabled = true;
    try {
      const messagePayload = {
        conversation_id: conversationId,
        sender_id: currentUserId,
        content: cleanText,
      };
      if (messageToolsAvailable) messagePayload.reply_to_id = replyId;
      const { error } = await supabaseClient.from("messages").insert(messagePayload);
      if (error) throw error;
      if (activeChat === conversationId && els.messageInput.value.trim() === submittedText) {
        els.messageInput.value = "";
        els.messageInput.style.height = "auto";
        clearReplyTarget();
      }
      if (activeChat === conversationId) {
        renderMessages();
        renderChats();
      }
    } catch (error) {
      showToast(error.message || "Your message couldn't be sent.");
    } finally {
      els.sendButton.disabled = !els.messageInput.value.trim();
    }
    els.messageInput.focus();
  }

  async function sendAttachment(file) {
    if (!file || !activeChat) return false;
    stopTyping();
    if (file.size > MAX_ATTACHMENT_SIZE) {
      throw new Error("Choose a file smaller than 25 MB.");
    }
    const conversationId = activeChat;
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(-120) || "attachment";
    const path = `${conversationId}/${currentUserId}/${attachmentId()}-${safeName}`;
    try {
      const { error: uploadError } = await supabaseClient.storage
        .from("kindred-chat-files")
        .upload(path, file, { contentType: file.type || "application/octet-stream", upsert: false });
      if (uploadError) throw uploadError;
      const { error } = await supabaseClient.from("messages").insert({
        conversation_id: conversationId,
        sender_id: currentUserId,
        content: els.attachmentCaption.value.trim() || null,
        attachment_path: path,
        attachment_name: file.name.slice(0, 255),
        attachment_type: file.type || "application/octet-stream",
        attachment_size: file.size,
      });
      if (error) {
        const { error: cleanupError } = await supabaseClient.storage.from("kindred-chat-files").remove([path]);
        if (cleanupError) console.error("An unlinked uploaded attachment could not be removed.", cleanupError);
        throw error;
      }
      if (activeChat === conversationId) {
        renderMessages();
        renderChats();
      }
      return true;
    } catch (error) {
      throw new Error(error.message || "This file couldn't be attached.");
    }
  }

  function closeAttachmentPreview() {
    if (attachmentSending) return;
    if (pendingAttachment?.previewUrl) URL.revokeObjectURL(pendingAttachment.previewUrl);
    pendingAttachment = null;
    els.attachmentPreviewBackdrop.hidden = true;
    els.attachmentPreviewContent.replaceChildren();
    els.attachmentCaption.value = "";
    els.attachmentPreviewError.textContent = "";
    els.attachmentButton.focus();
  }

  function showAttachmentPreview(file) {
    if (!file || !activeChat) return;
    if (file.size > MAX_ATTACHMENT_SIZE) {
      showToast("Choose a file smaller than 25 MB.");
      return;
    }
    const previewUrl = URL.createObjectURL(file);
    pendingAttachment = { file, previewUrl, conversationId: activeChat };
    els.attachmentPreviewTitle.textContent = file.name;
    els.attachmentPreviewContent.replaceChildren();
    const safeName = escapeHtml(file.name);
    if (file.type.startsWith("image/")) {
      els.attachmentPreviewContent.innerHTML = `<img class="attachment-preview-image" src="${previewUrl}" alt="${safeName}" />`;
    } else if (file.type.startsWith("video/")) {
      els.attachmentPreviewContent.innerHTML = `<video class="attachment-preview-video" controls playsinline src="${previewUrl}">Your browser can't play this video.</video>`;
    } else if (file.type.startsWith("audio/")) {
      els.attachmentPreviewContent.innerHTML = `<div class="attachment-preview-audio"><span aria-hidden="true">♫</span><audio controls src="${previewUrl}">Your browser can't play this audio.</audio></div>`;
    } else {
      els.attachmentPreviewContent.innerHTML = `<div class="attachment-preview-file"><span class="file-attachment-icon" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M13 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V10Z" /><path d="M13 3v7h7M8 15h8M8 18h5" /></svg></span><span><strong>${safeName}</strong><small>${escapeHtml(file.type || "File")} · ${formatFileSize(file.size)}</small></span></div>`;
    }
    if (!file.type.startsWith("image/") && !file.type.startsWith("video/") && !file.type.startsWith("audio/")) {
      const details = document.createElement("p");
      details.className = "attachment-preview-note";
      details.textContent = `File size: ${formatFileSize(file.size)}. Add a message if you’d like, then send when you’re ready.`;
      els.attachmentPreviewContent.append(details);
    }
    els.attachmentPreviewError.textContent = "";
    els.attachmentPreviewBackdrop.hidden = false;
    els.attachmentCaption.focus();
  }

  async function submitAttachmentPreview() {
    if (!pendingAttachment || attachmentSending) return;
    if (pendingAttachment.conversationId !== activeChat) {
      els.attachmentPreviewError.textContent = "The conversation changed. Cancel and choose the file again.";
      return;
    }
    attachmentSending = true;
    els.sendAttachmentButton.disabled = true;
    els.cancelAttachmentButton.disabled = true;
    els.closeAttachmentPreview.disabled = true;
    els.attachmentCaption.disabled = true;
    els.sendAttachmentButton.textContent = "Sending...";
    try {
      const sent = await sendAttachment(pendingAttachment.file);
      if (sent) {
        attachmentSending = false;
        closeAttachmentPreview();
        els.messageInput.focus();
      }
    } catch (error) {
      els.attachmentPreviewError.textContent = error.message;
    } finally {
      attachmentSending = false;
      els.sendAttachmentButton.disabled = false;
      els.cancelAttachmentButton.disabled = false;
      els.closeAttachmentPreview.disabled = false;
      els.attachmentCaption.disabled = false;
      els.sendAttachmentButton.innerHTML = 'Send attachment <span aria-hidden="true">→</span>';
    }
  }

  els.loginForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const identity = els.loginEmail.value.trim();
    const email = normalizeEmail(identity);
    const username = els.loginUsername.value.trim();
    const password = els.loginPassword.value;
    if (!isValidEmail(email)) {
      els.loginError.textContent = "Please enter a valid email address.";
      return;
    }
    if (!identity) {
      els.loginError.textContent = "Enter your email address.";
      return;
    }
    if (password.length < 8) {
      els.loginError.textContent = "Use a password with at least 8 characters.";
      els.loginPassword.focus();
      return;
    }
    if (password.length > 128) {
      els.loginError.textContent = "Passwords can be up to 128 characters.";
      els.loginPassword.focus();
      return;
    }
    if (authMode === "signup" && !username) {
      els.loginError.textContent = "Please enter a username.";
      els.loginUsername.focus();
      return;
    }
    if (authMode === "signup" && password !== els.confirmPassword.value) {
      els.loginError.textContent = "The passwords don't match.";
      els.confirmPassword.focus();
      return;
    }
    const submitButton = els.loginForm.querySelector('button[type="submit"]');
    submitButton.disabled = true;
    try {
      if (authMode === "signup") {
        const { data, error } = await supabaseClient.auth.signUp({
          email,
          password,
          options: { data: { username } },
        });
        if (error) throw error;
        if (!data.session) {
          showToast("To skip confirmation emails, turn off Confirm email in Supabase Authentication settings, then create your account again.");
          setAuthMode("login");
          els.loginEmail.value = email;
          els.loginPassword.value = "";
          return;
        }
        await finishCloudLogin(data.user);
      } else {
        const { data, error } = await supabaseClient.auth.signInWithPassword({ email, password });
        if (error) throw error;
        await finishCloudLogin(data.user);
      }
    } catch (error) {
      const message = error.message || "Your account request couldn't be completed. Please try again.";
      els.loginError.textContent = /username.*(taken|duplicate)|duplicate.*username/i.test(message)
        ? "That username is already taken. Choose another one."
        : /already registered|already been registered/i.test(message)
          ? "This email address is already in use. Enter a different email or log in."
          : message;
    } finally {
      submitButton.disabled = false;
    }
  });

  document.querySelectorAll(".password-toggle").forEach((toggle) => {
    toggle.addEventListener("click", () => {
      const input = toggle.parentElement.querySelector('input[type="password"], input[type="text"]');
      const showPassword = input.type === "password";
      input.type = showPassword ? "text" : "password";
      toggle.setAttribute("aria-label", showPassword ? "Hide password" : "Show password");
      toggle.setAttribute("aria-pressed", String(showPassword));
      toggle.classList.toggle("is-showing", showPassword);
    });
  });

  els.authSwitchButton.addEventListener("click", () => {
    setAuthMode(authMode === "login" ? "signup" : "login");
    els.loginPassword.value = "";
    els.confirmPassword.value = "";
    if (authMode === "login") els.loginEmail.focus();
    else els.loginUsername.focus();
  });

  els.forgotPasswordButton.addEventListener("click", openRecovery);
  $("#close-reset-button").addEventListener("click", closeRecovery);
  $("#cancel-reset-button").addEventListener("click", closeRecovery);
  els.resetBackdrop.addEventListener("click", (event) => {
    if (event.target === els.resetBackdrop) closeRecovery();
  });

  els.resetRequestForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const email = normalizeEmail(els.resetEmail.value);
    if (!isValidEmail(email)) {
      els.resetRequestError.textContent = "Enter a valid email address.";
      return;
    }
    const submitButton = $("#reset-request-submit");
    submitButton.disabled = true;
    try {
      const { error } = await supabaseClient.auth.resetPasswordForEmail(email, {
        redirectTo: getAuthRedirectUrl(),
      });
      if (error) throw error;
      recoveryChallenge = { email, verified: false };
      els.resetRequestForm.hidden = true;
      els.resetCodeStep.hidden = false;
      window.setTimeout(() => els.resetCodeInput.focus(), 0);
    } catch (error) {
      els.resetRequestError.textContent = error.message || "A recovery email couldn't be sent. Try again.";
    } finally {
      submitButton.disabled = false;
    }
  });

  els.resetCodeForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (!recoveryChallenge) {
      els.resetCodeError.textContent = "Request a recovery code first.";
      return;
    }
    const submitButton = els.resetCodeForm.querySelector('button[type="submit"]');
    submitButton.disabled = true;
    els.resetCodeError.textContent = "";
    try {
      const { error } = await supabaseClient.auth.verifyOtp({
        email: recoveryChallenge.email,
        token: els.resetCodeInput.value.trim(),
        type: "recovery",
      });
      if (error) throw error;
      recoveryChallenge.verified = true;
      els.resetCodeStep.hidden = true;
      els.resetPasswordStep.hidden = false;
      window.setTimeout(() => els.resetPassword.focus(), 0);
    } catch (error) {
      els.resetCodeError.textContent = error.message || "That code couldn't be verified. Check your connection and try again.";
    } finally {
      submitButton.disabled = false;
    }
  });

  els.resetPasswordForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (!recoveryChallenge?.verified) {
      els.resetPasswordError.textContent = "Verify your email recovery code first.";
      return;
    }
    const password = els.resetPassword.value;
    if (password.length < 8 || password.length > 128) {
      els.resetPasswordError.textContent = "Choose a password between 8 and 128 characters.";
      els.resetPassword.focus();
      return;
    }
    if (password !== els.resetPasswordConfirm.value) {
      els.resetPasswordError.textContent = "The passwords don't match.";
      els.resetPasswordConfirm.focus();
      return;
    }
    els.resetPasswordSubmit.disabled = true;
    try {
      const { error } = await supabaseClient.auth.updateUser({ password });
      if (error) throw error;
      const email = recoveryChallenge.email;
      closeRecovery();
      els.loginEmail.value = email;
      els.loginPassword.value = "";
      els.loginIdentityLabel.textContent = "Your email address";
      els.loginEmail.placeholder = "you@your-domain.com";
      showToast("Your password has been changed. Log in with your new password.");
      els.loginPassword.focus();
    } catch (error) {
      els.resetPasswordError.textContent = error.message || "Your password couldn't be changed. Try again.";
    } finally {
      els.resetPasswordSubmit.disabled = false;
    }
  });

  els.loginPhoto.addEventListener("change", async () => {
    const file = els.loginPhoto.files[0];
    if (!file) return;
    els.loginError.textContent = "";
    if (!file.type.startsWith("image/")) {
      els.loginPhoto.value = "";
      els.loginError.textContent = "Choose an image file for your profile picture.";
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      els.loginPhoto.value = "";
      els.loginError.textContent = "Choose an image smaller than 5 MB.";
      return;
    }
    try {
      selectedPhoto = await readPhoto(file);
      els.photoPreview.innerHTML = "";
      els.photoPreview.classList.add("has-photo");
      els.photoPreview.style.backgroundImage = `url("${selectedPhoto}")`;
      els.photoFileName.textContent = file.name;
    } catch (error) {
      selectedPhoto = "";
      els.loginPhoto.value = "";
      els.loginError.textContent = error.message;
    }
  });

  els.profilePhotoInput.addEventListener("change", async () => {
    const file = els.profilePhotoInput.files[0];
    if (!file) return;
    els.profileError.textContent = "";
    if (!file.type.startsWith("image/")) {
      restoreProfileAvatar();
      els.profileError.textContent = "Choose an image file for your profile picture.";
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      restoreProfileAvatar();
      els.profileError.textContent = "Choose an image smaller than 5 MB.";
      return;
    }
    try {
      profileSelectedPhoto = await readPhoto(file);
      profileRemovePhoto = false;
      els.removeProfilePhotoButton.disabled = false;
      els.removeProfilePhotoButton.textContent = "Remove profile picture";
      const store = readStore();
      setAvatar(els.profileAvatar, currentEmail, {
        ...profileFor(store, currentEmail),
        previewPhoto: profileSelectedPhoto,
      });
    } catch (error) {
      restoreProfileAvatar();
      els.profileError.textContent = error.message;
    }
  });
  els.removeProfilePhotoButton.addEventListener("click", () => {
    profileSelectedPhoto = "";
    profileRemovePhoto = true;
    els.profilePhotoInput.value = "";
    els.removeProfilePhotoButton.disabled = true;
    els.removeProfilePhotoButton.textContent = "Picture will be removed when saved";
    setAvatar(els.profileAvatar, currentEmail, {
      username: cloudProfile?.username || currentEmail,
      avatar_path: null,
      photo: "",
    });
  });

  els.themeToggle.addEventListener("click", () => {
    setTheme(document.documentElement.dataset.theme === "dark" ? "light" : "dark");
  });
  els.refreshAppButton.addEventListener("click", () => checkForAppUpdates(els.refreshAppButton));
  els.checkUpdatesButton.addEventListener("click", () => {
    els.accountMenu.classList.remove("is-visible");
    els.accountButton.setAttribute("aria-expanded", "false");
    checkForAppUpdates(els.checkUpdatesButton);
  });

  els.messageForm.addEventListener("submit", (event) => {
    event.preventDefault();
    stopTyping();
    sendMessage(els.messageInput.value);
  });

  els.attachmentButton.addEventListener("click", () => els.attachmentInput.click());
  els.attachmentInput.addEventListener("change", () => {
    const file = els.attachmentInput.files[0];
    els.attachmentInput.value = "";
    showAttachmentPreview(file);
  });
  els.closeAttachmentPreview.addEventListener("click", closeAttachmentPreview);
  els.cancelAttachmentButton.addEventListener("click", closeAttachmentPreview);
  els.sendAttachmentButton.addEventListener("click", submitAttachmentPreview);
  els.attachmentPreviewBackdrop.addEventListener("click", (event) => {
    if (event.target === els.attachmentPreviewBackdrop) closeAttachmentPreview();
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !els.attachmentPreviewBackdrop.hidden) closeAttachmentPreview();
  });

  els.messageInput.addEventListener("input", () => {
    els.sendButton.disabled = !els.messageInput.value.trim();
    els.messageInput.style.height = "auto";
    els.messageInput.style.height = `${Math.min(els.messageInput.scrollHeight, 120)}px`;
    updateTyping();
  });

  els.messageInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      stopTyping();
      sendMessage(els.messageInput.value);
    }
  });

  els.emojiPicker.innerHTML = EMOJI_CHOICES.map((emoji) => (
    `<button type="button" data-emoji="${emoji}" aria-label="${emoji}">${emoji}</button>`
  )).join("");
  els.emojiButton.addEventListener("click", () => {
    els.emojiPicker.hidden = !els.emojiPicker.hidden;
    els.emojiButton.setAttribute("aria-expanded", String(!els.emojiPicker.hidden));
  });
  els.emojiPicker.addEventListener("click", (event) => {
    const button = event.target.closest("[data-emoji]");
    if (!button) return;
    const start = els.messageInput.selectionStart;
    const end = els.messageInput.selectionEnd;
    els.messageInput.setRangeText(button.dataset.emoji, start, end, "end");
    els.messageInput.dispatchEvent(new Event("input", { bubbles: true }));
    els.emojiPicker.hidden = true;
    els.emojiButton.setAttribute("aria-expanded", "false");
    els.messageInput.focus();
  });
  els.cancelReplyButton.addEventListener("click", clearReplyTarget);

  els.chatList.addEventListener("click", (event) => {
    const button = event.target.closest("[data-chat][data-user-id]");
    if (!button) return;
    openConversation(button.dataset.userId);
  });

  els.messageList.addEventListener("click", (event) => {
    const button = event.target.closest("[data-message-action]");
    if (!button) return;
    const message = messagesById.get(button.dataset.messageId);
    if (!message) return;
    const details = button.closest("details");
    if (details) details.open = false;
    const actions = messageActionsById.get(String(message.id)) || [];
    const ownAction = actions.find((action) => action.user_id === currentUserId);
    const action = button.dataset.messageAction;
    if (action === "delete") {
      deleteMessage(button.dataset.messageId);
    } else if (action === "reply") {
      setReplyTarget(message);
    } else if (action === "copy") {
      navigator.clipboard.writeText(message.content || message.attachment_name || "Attachment")
        .then(() => showToast("Message copied."))
        .catch((error) => {
          console.error("The message couldn't be copied.", error);
          showToast("Copy isn't available in this browser.");
        });
    } else if (action === "forward") {
      openForwardMessage(message);
    } else if (action === "info") {
      showMessageInfo(message);
    } else if (action === "react") {
      const reaction = button.dataset.reaction;
      saveMessageAction(message, { reaction: ownAction?.reaction === reaction ? null : reaction });
    } else if (action === "pin") {
      saveMessageAction(message, { is_pinned: !ownAction?.is_pinned });
    } else if (action === "star") {
      saveMessageAction(message, { is_starred: !ownAction?.is_starred });
    }
  });
  els.callsList.addEventListener("click", (event) => {
    const button = event.target.closest("[data-call-user]");
    if (button) openConversation(button.dataset.callUser);
  });
  document.addEventListener("click", (event) => {
    if (!els.emojiPicker.contains(event.target) && !els.emojiButton.contains(event.target)) {
      els.emojiPicker.hidden = true;
      els.emojiButton.setAttribute("aria-expanded", "false");
    }
  });
  els.closeForwardButton.addEventListener("click", () => {
    els.forwardBackdrop.hidden = true;
    forwardTarget = null;
  });
  els.forwardBackdrop.addEventListener("click", (event) => {
    if (event.target === els.forwardBackdrop) {
      els.forwardBackdrop.hidden = true;
      forwardTarget = null;
    }
  });
  els.forwardSendButton.addEventListener("click", forwardMessage);

  els.peopleList.addEventListener("click", (event) => {
    const button = event.target.closest("button[data-action]");
    if (!button) return;
    if (button.dataset.action === "message") openConversation(button.dataset.userId);
    else if (button.dataset.action === "view-profile") openMemberProfile(button.dataset.userId);
    else handleFriendAction(button);
  });
  els.chatSearch.addEventListener("input", () => {
    if (sidebarMode === "people") renderPeople();
    else if (sidebarMode === "calls") renderCallHistory();
    else renderChats();
  });
  els.messagesTab.addEventListener("click", () => setSidebarMode("messages"));
  els.peopleTab.addEventListener("click", () => setSidebarMode("people"));
  els.callsTab.addEventListener("click", () => setSidebarMode("calls"));
  $("#new-chat-button").addEventListener("click", () => setSidebarMode("people"));
  $("#empty-new-chat").addEventListener("click", () => setSidebarMode("people"));
  $("#welcome-new-chat").addEventListener("click", () => setSidebarMode("people"));
  $("#mobile-back-button").addEventListener("click", () => {
    if (window.history.state?.kindredView === "conversation") {
      window.history.back();
    } else {
      leaveConversation();
    }
  });
  window.addEventListener("popstate", (event) => {
    if (activeChat && event.state?.kindredView !== "conversation") leaveConversation();
  });
  document.addEventListener("visibilitychange", () => {
    if (!document.hidden) {
      if (activeChat) renderMessages();
      recoverIncomingCall().catch((error) => {
        console.error("An incoming call couldn't be recovered after returning to Kindred.", error);
      });
    }
  });
  els.accountButton.addEventListener("click", () => {
    const isOpen = els.accountMenu.classList.toggle("is-visible");
    els.accountButton.setAttribute("aria-expanded", String(isOpen));
  });
  document.addEventListener("click", (event) => {
    if (!els.accountMenu.contains(event.target) && !els.accountButton.contains(event.target)) {
      els.accountMenu.classList.remove("is-visible");
      els.accountButton.setAttribute("aria-expanded", "false");
    }
  });
  els.profileButton.addEventListener("click", openProfile);
  els.profileBio.addEventListener("input", updateBioCharacterCount);
  els.conversationProfileButton.addEventListener("click", () => {
    if (activeContact) openMemberProfile(activeContact.user_id);
  });
  els.audioCallButton.addEventListener("click", startAudioCall);
  els.callAcceptButton.addEventListener("click", acceptAudioCall);
  els.callEnableAudioButton.addEventListener("click", async () => {
    try {
      await els.callRemoteAudio.play();
      els.callEnableAudioButton.hidden = true;
    } catch (error) {
      console.error("Call audio playback is still blocked.", error);
      showToast("Audio is blocked by your browser or device. Check your sound settings and try again.");
    }
  });
  els.callMuteButton.addEventListener("click", () => {
    const tracks = activeCall?.stream?.getAudioTracks() || [];
    if (!tracks.length) {
      showToast("Your microphone is not ready yet.");
      return;
    }
    const muted = tracks[0].enabled;
    tracks.forEach((track) => { track.enabled = !muted; });
    els.callMuteButton.textContent = muted ? "Unmute microphone" : "Mute microphone";
    els.callMuteButton.setAttribute("aria-pressed", String(muted));
    els.callStatus.textContent = muted ? "Microphone muted" : activeCall.connected ? "Connected" : "Connecting…";
  });
  els.callOutputButton.addEventListener("click", async () => {
    const audio = els.callRemoteAudio;
    if (typeof audio.setSinkId !== "function") {
      showToast("Your browser manages speaker and earpiece routing. Use your device’s audio controls.");
      return;
    }
    try {
      if (typeof navigator.mediaDevices?.selectAudioOutput === "function") {
        const device = await navigator.mediaDevices.selectAudioOutput();
        await audio.setSinkId(device.deviceId);
        els.callOutputButton.textContent = device.label || "Audio output selected";
      } else {
        const outputs = (await navigator.mediaDevices.enumerateDevices())
          .filter((device) => device.kind === "audiooutput");
        if (outputs.length < 2) {
          showToast("No alternate audio output is available. Use your device’s audio controls.");
          return;
        }
        const currentIndex = outputs.findIndex((device) => device.deviceId === audio.sinkId);
        const firstAlternate = outputs.findIndex((device) => device.deviceId !== "default");
        const nextIndex = currentIndex < 0
          ? Math.max(firstAlternate, 0)
          : (currentIndex + 1) % outputs.length;
        const nextDevice = outputs[nextIndex];
        await audio.setSinkId(nextDevice.deviceId);
        els.callOutputButton.textContent = nextDevice.label || "Audio output selected";
      }
    } catch (error) {
      if (error.name === "NotAllowedError" || error.name === "AbortError") return;
      console.error("The call audio output could not be changed.", error);
      showToast("The audio output couldn't be changed. Check your browser and device settings.");
    }
  });
  els.callDeclineButton.addEventListener("click", async () => {
    if (!activeCall) return;
    if (activeCall.role === "callee") {
      try {
        await setCallStatus("declined");
      } catch (error) {
        console.error("The declined call status couldn't be saved.", error);
      }
      await endCall(true, "declined");
    } else {
      await endCall(true);
    }
  });
  els.callHangupButton.addEventListener("click", () => {
    endCall(true).catch((error) => {
      console.error("The audio call couldn't be ended.", error);
      showToast("The call couldn't be ended cleanly. Close the call window to stop using your microphone.");
    });
  });
  $("#close-member-profile-button").addEventListener("click", closeMemberProfile);
  els.memberProfileBackdrop.addEventListener("click", (event) => {
    if (event.target === els.memberProfileBackdrop) closeMemberProfile();
  });
  els.memberProfileMessageButton.addEventListener("click", () => {
    const userId = els.memberProfileMessageButton.dataset.userId;
    closeMemberProfile();
    openConversation(userId);
  });
  els.notificationsButton.addEventListener("click", async () => {
    await unlockCallSound();
    if ("Notification" in window && notificationsEnabled && Notification.permission === "granted") {
      notificationsEnabled = false;
      try {
        localStorage.setItem("kindred.notifications.disabled", "true");
      } catch (error) {
        console.error("Notification preference couldn't be saved.", error);
      }
      updateNotificationsButton();
      showToast("Notifications are paused on this device.");
      return;
    }
    await enableNotifications();
  });
  els.closeProfileButton.addEventListener("click", closeProfile);
  els.profileBackdrop.addEventListener("click", (event) => {
    if (event.target === els.profileBackdrop) closeProfile();
  });
  els.profileForm.addEventListener("submit", saveProfile);
  els.signOutButton.addEventListener("click", async () => {
    if (activeCall) await endCall(true);
    const { error } = await supabaseClient.auth.signOut();
    if (error) {
      showToast(error.message || "You couldn't be signed out. Try again.");
      return;
    }
    showLoginScreen();
  });
  $("#conversation-info-button").addEventListener("click", () => {
    showToast("Messages and attachments in this chat are shared with its members.");
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !els.memberProfileBackdrop.hidden) closeMemberProfile();
  });
  document.addEventListener("keydown", (event) => {
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
      event.preventDefault();
      if (!els.chatScreen.hidden) els.chatSearch.focus();
    }
    if (event.key === "/" && !els.chatScreen.hidden && document.activeElement !== els.messageInput && document.activeElement !== els.chatSearch) {
      event.preventDefault();
      els.chatSearch.focus();
    }
    if (event.key === "Escape" && !els.resetBackdrop.hidden) closeRecovery();
    if (event.key === "Escape" && !els.profileBackdrop.hidden) closeProfile();
  });
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.addEventListener("message", (event) => {
      if (event.data?.type === "KINDRED_FOCUS_CALL") {
        const callId = event.data.callId;
        if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(callId || "")) return;
        const focusCall = () => {
          if (activeCall?.id !== callId) return false;
          els.callBackdrop.focus();
          if (activeCall.role === "callee" && !els.callAcceptButton.disabled) els.callAcceptButton.focus();
          return true;
        };
        if (!focusCall()) {
          recoverIncomingCall().then(focusCall).catch((error) => {
            console.error("The incoming call notification couldn't be opened.", error);
          });
        }
        return;
      }
      if (event.data?.type !== "KINDRED_OPEN_CONVERSATION") return;
      const userId = event.data.userId;
      if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(userId || "")) return;
      pendingNotificationOpen = { userId, reply: event.data.reply === true };
      processPendingNotificationOpen();
    });
  }

  document.addEventListener("pointerdown", unlockCallSound, { once: true });
  document.addEventListener("keydown", unlockCallSound, { once: true });

  let preferredTheme = "light";
  try {
    preferredTheme = localStorage.getItem(THEME_KEY) === "dark" ? "dark" : "light";
  } catch {
    showToast("Theme preference couldn't be loaded from browser storage.");
  }
  setTheme(preferredTheme, false);
  setAuthMode("login");
  setSidebarMode("messages");
  updateNotificationsButton();
  supabaseClient.auth.getSession().then(async ({ data, error }) => {
    if (error) throw error;
    if (data.session?.user) await finishCloudLogin(data.session.user);
  }).catch((error) => {
    console.error("The saved account session could not be restored.", error);
    showToast("Your saved sign-in couldn't be restored. Please log in again.");
  });
})();
