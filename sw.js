/* ---------------- offline cache ---------------- */
const CACHE = "notlarim-pro-v2";
const ASSETS = ["./index.html", "./manifest.webmanifest", "./icons/icon-192.png", "./icons/icon-512.png"];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((cached) => cached || fetch(event.request))
  );
});

/* ---------------- background push (Firebase Cloud Messaging) ---------------- */
importScripts("https://www.gstatic.com/firebasejs/10.13.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.13.0/firebase-messaging-compat.js");

firebase.initializeApp({
  apiKey: "AIzaSyARTlJbJ-36gIHwR8FdaR-LcyaUR06Esn0",
  authDomain: "notlarim-pro.firebaseapp.com",
  projectId: "notlarim-pro",
  storageBucket: "notlarim-pro.firebasestorage.app",
  messagingSenderId: "67642380209",
  appId: "1:67642380209:web:9eef6bf46d811929d5b790"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  const title = (payload.notification && payload.notification.title) || (payload.data && payload.data.title) || "Notlarım";
  const body = (payload.notification && payload.notification.body) || (payload.data && payload.data.body) || "Vaktin geldi!";
  self.registration.showNotification(title, {
    body,
    icon: "./icons/icon-192.png",
    badge: "./icons/icon-192.png",
    tag: (payload.data && payload.data.noteId) || undefined
  });
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(
    self.clients.matchAll({ type: "window" }).then((clientsArr) => {
      const hadWindow = clientsArr.find((c) => "focus" in c);
      if (hadWindow) return hadWindow.focus();
      return self.clients.openWindow("./index.html");
    })
  );
});
