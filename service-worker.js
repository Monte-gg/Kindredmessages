const CACHE_NAME = "kindred-shell-v18";
const APP_SHELL = [
  "./",
  "./index.html",
  "./styles.css?v=18",
  "./app.js?v=18",
  "./supabase-config.js",
  "./manifest.webmanifest?v=18",
  "./icons/kindred-192.png?v=18",
  "./icons/kindred-512.png?v=18",
  "./icons/kindred.svg?v=18",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL))
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => Promise.all(
      cacheNames.filter((cacheName) => cacheName.startsWith("kindred-shell-") && cacheName !== CACHE_NAME)
        .map((cacheName) => caches.delete(cacheName))
    ))
  );
  self.clients.claim();
});

self.addEventListener("message", (event) => {
  if (event.data?.type === "SKIP_WAITING") self.skipWaiting();
});

self.addEventListener("fetch", (event) => {
  const requestUrl = new URL(event.request.url);
  if (event.request.method !== "GET" || requestUrl.origin !== self.location.origin) return;

  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request).then((response) => {
        const copy = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put("./index.html", copy));
        return response;
      }).catch(() => caches.match("./index.html"))
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request).then((response) => {
        if (response.ok) {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
        }
        return response;
      });
    })
  );
});

self.addEventListener("notificationclick", (event) => {
  const notification = event.notification;
  const data = notification.data || {};
  const incomingCall = data.type === "incoming-call";
  const callId = data.callId;
  const userId = data.userId;
  const validUuid = (value) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value || "");
  if (incomingCall ? !validUuid(callId) : !validUuid(userId)) {
    notification.close();
    return;
  }
  const reply = event.action === "reply";
  notification.close();
  event.waitUntil((async () => {
    const windows = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
    const appWindow = windows.find((client) => new URL(client.url).origin === self.location.origin);
    if (appWindow) {
      await appWindow.focus();
      if (incomingCall) {
        appWindow.postMessage({ type: "KINDRED_FOCUS_CALL", callId });
      } else {
        appWindow.postMessage({
          type: "KINDRED_OPEN_CONVERSATION",
          userId,
          reply,
        });
      }
      return;
    }
    const url = new URL(data.url || "./", self.registration.scope);
    if (incomingCall) url.searchParams.set("incomingCall", callId);
    else {
      url.searchParams.set("notificationUser", userId);
      if (reply) url.searchParams.set("notificationReply", "1");
    }
    await self.clients.openWindow(url.href);
  })());
});
