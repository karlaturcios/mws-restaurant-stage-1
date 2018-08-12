var CACHE_NAME = 'my-site-cache-v6';

var urlsToCache = [
  '/',
  '/index.html',
  '/restaurant.html',
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
  'img/na.png'
];
self.addEventListener('install', function(event) {
  // Perform install steps
  console.log('Attempting to install service worker and cache static assets');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('fetch', function(event) {
  console.log('Fetch event for ', event.request.url);
  event.respondWith(
    caches.match(event.request)
      .then(function(response) {
        // Cache hit - return response
        if (response) {
          console.log('Found ', event.request.url, ' in cache');
          caches.open('my-site-cache-v6').then(function (cache) {
            cache.put(event.request, response.clone());
          });
          return response;
        }
        return fetch(event.request);
        //console.log(resourceType);
      }//.catch(() => offlineResponse(opts))
    )
  );
});
self.addEventListener('message', function(event) {
  if (event.data.action === 'skipWaiting') {
    self.skipWaiting();
  }
});

/*/
function offlineResponse (resourceType, opts) {
  if (resourceType === 'image') {
    // … return an offline image
  } else if (resourceType === 'content') {
    return caches.match('/offline/');
  }
  return undefined;
}
*/

/*
self.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.match(event.request)
    .then(function(response) {
      return response || fetch(event.request);
    }).catch(error => {
      if (event.request.url.indexOf(".jpg") > -1) {
        return caches.match("/img/na.png");
      }
      return new Response("Application is not connected to the internet", {
        status: 404,
        statusText: "Application is not connected to the internet"
      });
    });  
  );
});
*/
/*
const handleNonAJAXEvent = (event, cacheRequest) => {
  // Check if the HTML request has previously been cached. If so, return the
  // response from the cache. If not, fetch the request, cache it, and then return
  // it.
  event.respondWith(caches.match(cacheRequest).then(response => {
    return (response || fetch(event.request).then(fetchResponse => {
      return caches
        .open(cacheID)
        .then(cache => {
          if (fetchResponse.url.indexOf("browser-sync") === -1) {
            cache.put(event.request, fetchResponse.clone());
          }
          return fetchResponse;
        });
    }).catch(error => {
      if (event.request.url.indexOf(".jpg") > -1) {
        return caches.match("/img/na.png");
      }
      return new Response("Application is not connected to the internet", {
        status: 404,
        statusText: "Application is not connected to the internet"
      });
    }));
  }));
};*/