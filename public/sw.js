

self.addEventListener('install', function(event) {
  // Perform install steps
  event.waitUntil(
    caches.open('my-site-cache-v1')
      .then(function(cache) {
        return cache.addAll([
          '/',
          '/index.html',
          '/restaurant.html',
          '/css/styles.css',
          '/js/main.js',
          'js/restaurant_info.js',
          'js/dbhelper.js',
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
          ]);
      })
  );
});

self.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.match(event.request)
      .then(function(response) {
        // Cache hit - return response
        if (response) {
          caches.open('my-site-cache-v1').then(function (cache) {
            cache.put(event.request, responseClone);
          });
          return response;
        }
        return fetch(event.request);
        console.log(resourceType);
      }//.catch(() => offlineResponse(opts))
    )
  );
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