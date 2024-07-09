self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open('expense-cache').then((cache) => {
            return cache.addAll([
                '/',
                '/public/index.html',
                '/public/css/style.css',
                '/public/js/app.js',
                '/public/manifest.json',
                '/public/image/icon.png'
            ]);
        })
    );
});

self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request).then((response) => {
            return response || fetch(event.request);
        })
    );
});
