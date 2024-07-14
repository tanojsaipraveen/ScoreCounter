self.addEventListener('install', function(event) {
    event.waitUntil(
      caches.open('v1').then(function(cache) {
        return cache.addAll([
          '/',
          '/index.html',
          '/styles.css',
          '/script.js',
          'https://tanojsaipraveen.github.io/ScoreCounter/images/icon-192x192.png',
          'https://tanojsaipraveen.github.io/ScoreCounter/images/icon-512x512.png'
        ]);
      })
    );
  });
  
  self.addEventListener('fetch', function(event) {
    event.respondWith(
      caches.match(event.request).then(function(response) {
        return response || fetch(event.request);
      })
    );
  });
  
