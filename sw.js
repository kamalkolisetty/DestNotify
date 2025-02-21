self.addEventListener('install', (event) => {
    console.log('Service Worker Installed');
    self.skipWaiting();
});


// python -m http.server 8000


self.addEventListener('activate', (event) => {
    console.log('Service Worker Activated');
});

self.addEventListener('fetch', (event) => {
    // Optionally cache assets for offline support
});
