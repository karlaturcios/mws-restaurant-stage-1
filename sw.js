var staticCacheName = 'my-site-cache-v25';

var urlsToCache = [
  '/',
  '/index.html',
  '/restaurant.html',
  '/review_form.html',
  '/css/styles.css',
  '/js/main.js',
  'js/restaurant_info.js',
  'js/dbhelper.js',
  'js/idb.js',
  './sw.js',
  'img/',
  'img/1.jpg',
  'img/10.jpg',
  'img/2.jpg',
  'img/3.jpg',
  'img/4.jpg',
  'img/5.jpg',
  'img/6.jpg',
  'img/7.jpg',
  'img/8.jpg',
  'img/8.jpg',
  'img/na.jpg',
  'favicon.ico'
];
self.addEventListener('install', function(event) {
  // Perform install steps and set up cache for service worker
  console.log('Attempting to install service worker and cache static assets');
  event.waitUntil(
    caches.open(staticCacheName)
      .then(function(cache) {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
        console.log('Added cache urls');
      })
  );
});

self.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.match(event.request)
    .then(function(response) {
      return response || fetchAndCache(event.request);
      /*return response;*/
     // console.log ('Response returned or fecthandcache event');
    })
  );
});

function fetchAndCache(url) {
  return fetch(url)
  .then(function(response) {
    return caches.open(staticCacheName)
    .then(function(cache) {
      cache.put(url, response.clone());
      //console.log('fetch url ok');
      //console.log('Response' + response);      
      return response;
    });
  })
  .catch(function(error) {
   // console.log('Request failed:', error);
    // You could return a custom offline 404 page here
  });
}

self.addEventListener('activate', function(event) {
  //this service takes center stage now
  console.log('Activating new service worker...');

  var cacheWhitelist = [staticCacheName];

  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.map(function(cacheName) {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});