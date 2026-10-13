self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("push", (event) => {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch {
    data = { body: event.data ? event.data.text() : "" };
  }

  const title = data.title || "BoisGang";
  const options = {
    body: data.body || "Hay un próximo torneo a la vista.",
    icon: data.icon || "/icons/icon-192.png",
    tag: data.tag || "boisgang",
    data: { url: data.url || "/#torneos" },
    lang: "es",
  };
  if (data.image) options.image = data.image;

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const target = new URL(event.notification.data?.url || "/#torneos", self.location.origin).href;

  event.waitUntil(
    (async () => {
      const windows = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
      const sameUrl = windows.find((client) => client.url === target);
      if (sameUrl) return sameUrl.focus();
      return self.clients.openWindow(target);
    })()
  );
});
