
const CACHE_NAME = 'ai-ebook-reader-v5'; // Incremented version to force update
const URLS_TO_CACHE = [
  './',
  './index.html',
  './manifest.json',
  './index.js',
  // Assuming you have these icons in your repository
  './icon-192.png', 
  './icon-512.png',
  
  // External assets from CDNs
  'https://cdn.tailwindcss.com',
  'https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400..700;1,400..700&family=Poppins:wght@300;400;500;600;700&display=swap',
  'https://unpkg.com/uuid@latest/dist/umd/uuidv4.min.js',
  "https://esm.sh/react@18.2.0",
  "https://esm.sh/react-dom@18.2.0/client",
  "https://esm.sh/uuid@9.0.0",
  "https://esm.sh/pdfjs-dist@3.4.120/build/pdf",
  "https://esm.sh/pdfjs-dist@3.4.120/build/pdf.worker.mjs",
  "https://esm.sh/@google/genai@0.2.1"
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache and caching URLs');
        return cache.addAll(URLS_TO_CACHE).catch(err => {
            console.error('Failed to cache some URLs:', err);
        });
      })
  );
  self.skipWaiting();
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
    return event.respondWith(fetch(event.request));
  }

  // Cache-first strategy
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Return from cache or fetch from network
        return response || fetch(event.request).then(fetchResponse => {
            // Optional: Cache new requests on the fly
            return caches.open(CACHE_NAME).then(cache => {
                // We only cache successful GET requests
                if (fetchResponse.status === 200 && event.request.method === 'GET') {
                   cache.put(event.request, fetchResponse.clone());
                }
                return fetchResponse;
            });
        });
      }).catch(error => {
        console.error('Fetch failed:', error);
        // You can return a fallback page here if you have one
      })
    );
});