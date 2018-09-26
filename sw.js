var staticCacheName = 'my-site-cache-v28';
//files to cache
var urlsToCache = [
  '/',
  '/index.html',
  '/restaurant.html',
  '/review_form.html',
  '/offline.html',
  '/css/styles.css',
  '/js/main.js',
  'js/restaurant_info.js',
  'js/dbhelper.js',
  'js/idb.js',
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


self.addEventListener('activate', event => {
  console.log('Activate new service worker to remove outdated caches');
  const currentCaches = [staticCacheName];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return cacheNames.filter(cacheName => !currentCaches.includes(cacheName));
    }).then(cachesToDelete => {
      return Promise.all(cachesToDelete.map(cacheToDelete => {
        return caches.delete(cacheToDelete);
      }));
    }).then(() => self.clients.claim())
  );
});
/*
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
});*/

/*
//TODO We'll try this after adding update to server, this 
//is for a request doesn't match anything in the cache, get it from the network, send it to the page & add it to the cache at the same time. 
//Combining Fetch per circumstance
self.addEventListener('fetch', function(event) {
  // Parse the URL:
  var requestURL = new URL(event.request.url);


  // Routing for local URLs
  if (requestURL.origin == location.origin) {
    // Handle anything else but GET
    if (request.method !== 'GET') { 
    return; 
  }
  event.respondWith(
    caches.open(staticCacheName).then(function(cache) {
      return cache.match(event.request).then(function (response) {
        return response || fetch(event.request).then(function(response) {
          cache.put(event.request, response.clone());
          return response;
        });
      });
    })
  );

  }

  // default pattern Cache, falling back to network
  event.respondWith(
    caches.match(event.request).then(function(response) {
      return response || fetch(event.request);
    }).catch(function() {
      // If both fail, show a generic fallback:
      return caches.match('/offline.html');
    })
  );
});*/




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
      return response || fetchAndCache(event.request);
      //return response || fetch(event.request);
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
   return caches.match('/offline.html');
  });
}

