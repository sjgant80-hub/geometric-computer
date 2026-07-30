// sw.js — network-first (online always gets fresh code; cache is the offline fallback).
const CACHE = 'geometric-computer-v1';
const ASSETS = ['./', './index.html', './manifest.webmanifest', './icon.svg',
  './kernel/fold.mjs', './kernel/eth.mjs', './kernel/attractor.mjs'];
self.addEventListener('install', (e) => { e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS)).then(() => self.skipWaiting())); });
self.addEventListener('activate', (e) => { e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  e.respondWith(fetch(e.request).then((res) => { const c = res.clone(); caches.open(CACHE).then((k) => k.put(e.request, c)).catch(() => {}); return res; }).catch(() => caches.match(e.request)));
});
