// A simple service worker to satisfy PWA install requirements
self.addEventListener('install', (event) => {
    console.log('Lex App Installed');
});

self.addEventListener('fetch', (event) => {
    // Just passing network requests through normally
    event.respondWith(fetch(event.request));
});
