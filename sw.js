
const CACHE_NAME = 'ai-ebook-reader-v4';
const URLS_TO_CACHE = [
  '.',
  'index.html',
  'manifest.json',
  'https://cdn.tailwindcss.com',
  'https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400..700;1,400..700&family=Poppins:wght@300;400;500;600;700&display=swap',
  'https://unpkg.com/uuid@latest/dist/umd/uuidv4.min.js',
  
  // Local files
  'index.js',
  'App.js',
  'types.js',
  'constants.js',
  'data/books.js',
  'services/geminiService.js',
  'hooks/useSpeech.js',
  'hooks/useSpeechRecognition.js',
  'components/Icon.js',
  'components/Library.js',
  'components/Reader.js',
  'components/ChatModal.js',
  'components/AddBookModal.js',
  'components/SettingsModal.js',

  // Dependencies from esm.sh
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
        const requests = URLS_TO_CACHE.map(url => new Request(url, { cache: 'reload' }));
        return cache.addAll(requests).catch(err => {
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
});

self.addEventListener('fetch', event => {
  if (event.request.url.includes('generativelanguage.googleapis.com') || event.request.url.includes('api.elevenlabs.io')) {
    return event.respondWith(fetch(event.request));
  }

  event.respondWith(
    caches.match(event.request)
      .then(response => {
        return response || fetch(event.request).then(fetchResponse => {
            return caches.open(CACHE_NAME).then(cache => {
                // We don't cache opaque responses (from no-cors requests)
                if (fetchResponse.type !== 'opaque') {
                   cache.put(event.request, fetchResponse.clone());
                }
                return fetchResponse;
            });
        });
      }).catch(error => {
        console.error('Fetch failed:', error);
      })
    );
});
