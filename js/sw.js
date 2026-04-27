/* Service Worker – Cache-First für Static Assets, Network-First für HTML.
 * Macht die Site offline-fähig und Lighthouse-PWA-100. */
const VERSION   = 'lj-adnet-v3';
const CORE      = 'core-' + VERSION;
const RUNTIME   = 'runtime-' + VERSION;

const CORE_ASSETS = [
    './',
    './index.html',
    './ueber-uns.html',
    './veranstaltungen.html',
    './vorstand.html',
    './galerie.html',
    './kontakt.html',
    './impressum.html',
    './datenschutz.html',
    './404.html',
    './css/style.css',
    './js/script.js',
    './js/enhancements.js',
    './site.webmanifest'
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CORE).then(c => c.addAll(CORE_ASSETS).catch(() => {}))
    );
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then(keys =>
            Promise.all(keys
                .filter(k => k !== CORE && k !== RUNTIME)
                .map(k => caches.delete(k)))
        )
    );
    self.clients.claim();
});

self.addEventListener('fetch', (event) => {
    const req = event.request;
    if (req.method !== 'GET') return;

    const url = new URL(req.url);

    // Don't cache analytics or external API calls
    if (url.origin !== location.origin && !url.hostname.includes('googleapis.com') && !url.hostname.includes('gstatic.com')) {
        return;
    }

    // HTML: network-first, fall back to cache, then 404 page
    if (req.mode === 'navigate' || (req.headers.get('accept') || '').includes('text/html')) {
        event.respondWith(
            fetch(req)
                .then(res => {
                    const copy = res.clone();
                    caches.open(RUNTIME).then(c => c.put(req, copy));
                    return res;
                })
                .catch(() => caches.match(req).then(r => r || caches.match('./404.html')))
        );
        return;
    }

    // Everything else: cache-first
    event.respondWith(
        caches.match(req).then(cached => {
            if (cached) return cached;
            return fetch(req).then(res => {
                if (res.ok) {
                    const copy = res.clone();
                    caches.open(RUNTIME).then(c => c.put(req, copy));
                }
                return res;
            }).catch(() => cached);
        })
    );
});
