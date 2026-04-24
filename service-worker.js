const VERSION = 'mozg-site-danielle-v10';
const HOME_PATH = '/node-vitepress-danielle/';
const APP_SHELL = [
  '/node-vitepress-danielle/',
  '/node-vitepress-danielle/manifest.json',
  '/node-vitepress-danielle/logo-mini.svg',
  '/node-vitepress-danielle/logo-mini.png',
  '/node-vitepress-danielle/og.jpg',
  '/node-vitepress-danielle/data/site-catalog.json',
  '/node-vitepress-danielle/data/site-audit.json',
  '/node-vitepress-danielle/data/site-discovery.json',
  '/node-vitepress-danielle/data/site-portfolio.json',
  '/node-vitepress-danielle/data/site-projects.json',
  '/node-vitepress-danielle/data/site-capabilities.json',
  '/node-vitepress-danielle/data/site-stacks.json',
  '/node-vitepress-danielle/data/site-operations.json',
  '/node-vitepress-danielle/data/site-journeys.json',
  '/node-vitepress-danielle/data/site-trust.json',
  '/node-vitepress-danielle/llms.txt',
  '/node-vitepress-danielle/robots.txt',
  '/node-vitepress-danielle/contato',
  '/node-vitepress-danielle/presenca',
  '/node-vitepress-danielle/en/',
  '/node-vitepress-danielle/en/contact',
  '/node-vitepress-danielle/en/presence',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(VERSION)
      .then((cache) => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys.map((key) => (key === VERSION ? null : caches.delete(key))),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') {
    return;
  }

  const requestUrl = new URL(event.request.url);
  if (requestUrl.origin !== self.location.origin) {
    return;
  }

  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          if (response.ok) {
            const responseClone = response.clone();
            event.waitUntil(
              caches.open(VERSION).then((cache) => {
                cache.put(HOME_PATH, responseClone);
              }),
            );
          }
          return response;
        })
        .catch(async () => {
          const cache = await caches.open(VERSION);
          return cache.match(HOME_PATH) || Response.error();
        }),
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      const networkFetch = fetch(event.request)
        .then((response) => {
          if (response.ok) {
            const responseClone = response.clone();
            event.waitUntil(
              caches.open(VERSION).then((cache) => {
                cache.put(event.request, responseClone);
              }),
            );
          }
          return response;
        })
        .catch(() => cachedResponse || Response.error());

      return cachedResponse || networkFetch;
    }),
  );
});
