var staticCacheName = 'my-site-cache-v26';
//files to cache
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
  'img/9.jpg',
  'img/na.jpg',
  'favicon.ico'
];

self.addEventListener('install', function(event) {
  // Perform install steps and set up cache for service worker
  console.log('Attempting to install service worker and cache static assets');
  event.waitUntil(
    caches.open(staticCacheName)
      .then(function(cache) {
        console.log('Opened cache and add all URLS');
        return cache.addAll(urlsToCache);
      })
  );
});




//Retrieve from cache, network or database
self.addEventListener('fetch', function(event) {
  var request = event.request;
  //Avoid caching POST events
  if (request.method !== 'GET') { 
    return; 
  }
  event.respondWith(
    caches.match(event.request)
    .then(function(response) {
      //return response || fetchAndCache(event.request);
      return response || fetch(event.request);
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



//Update cache anything new or remove
self.addEventListener('activate', function(event) {
  //this service takes center stage now
  console.log('Activating new service worker to remove outdated caches');

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