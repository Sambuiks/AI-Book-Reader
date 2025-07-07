
const CACHE_NAME = 'ai-ebook-reader-v6'; // Incremented version to force update
const URLS_TO_CACHE = [
  './',
  './index.html',
  './manifest.json',
  './index.js',
  // Assuming you have these icons in your repository.
  // If not, you should add them or remove these lines.
  './icon-192.png', 
  './icon-512.png',
  
  // External assets from CDNs
  'https://cdn.tailwindcss.com',
  'https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400..700;1,400..700&family=Poppins:wght@300;400;500;600;700&display=swap',
  'https://unpkg.com/uuid@latest/dist/umd/uuidv4.min.js',
  "https://esm.sh/react@18.2.0",
  "https://esm.sh/react-dom@18.2.0/client",
  "https://esm.sh/uuid@9.0.0",
  "https://esm.sh/pdfjs-dist@4.5.136/build/pdf.mjs",
  "https://esm.sh/pdfjs-dist@4.5.136/build/pdf.worker.mjs",
  "https://esm.sh/@google/genai@0.2.1"
];

self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache and caching URLs');
        return cache.addAll(URLS_TO_CACHE).catch(err => {
            console.error('Failed to cache some URLs:', err);
        });
      })
  );
});

self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  return self.clients.claim();
});

self.addEventListener('fetch', event => {
  // Never cache API calls
  if (event.request.url.includes('generativelanguage.googleapis.com') || event.request.url.includes('api.elevenlabs.io')) {
    // For API calls, always go to the network.
    return event.respondWith(fetch(event.request));
  }

  // For all other requests, use a cache-first strategy.
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // If it's in the cache, return it.
        if (response) {
          return response;
        }
        // Otherwise, fetch it from the network.
        return fetch(event.request).then(fetchResponse => {
            // And cache the new response for next time.
            return caches.open(CACHE_NAME).then(cache => {
                // We only cache successful GET requests
                if (fetchResponse.status === 200 && event.request.method === 'GET') {
                   cache.put(event.request, fetchResponse.clone());
                }
                return fetchResponse;
            });
        });
      })
    );
});
