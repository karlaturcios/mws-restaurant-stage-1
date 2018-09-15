const nameInput = document.querySelector('#name');
//const restaurantNameInput = document.querySelector('#restaurantName');
const restaurantNameInput = getParameterByName('id');
//console.log('restaurantNameInput = ' + restaurantNameInput);
const restaurantId = Number(restaurantNameInput);
//console.log('restaurantId = ' + restaurantId);
const ratingSelector = document.querySelector('#rating');
const commentsInput = document.querySelector('#comments');
const formz = document.querySelector('form');
//let idReview = 0;
// open database
var dbPromise = idb.open('restaurants-reviews', 10, function(upgradeDb) {
  switch (upgradeDb.oldVersion) {
    case 0:
    upgradeDb.createObjectStore('restaurantz', {keyPath: 'id'});
    case 1:
      upgradeDb.createObjectStore('reviewz', {keyPath: 'id'});
    case 2:
    upgradeDb.createObjectStore('submittedReviews', {keyPath: 'id'});
  }
});

/**
 * Common database helper functions.
 */
class DBHelper {
  
  /**
   * Database URL.
   * Change this to restaurants.json file location on your server.
   */
  static get DATABASE_URL() {
    const port = 1337 // Change this to your server port
    return `http://localhost:${port}/restaurants`;
  }

/**
   * Database URL.
   * Change this to restaurants.json file location on your server.
   */
  static get DATABASE_URL_REVIEWS() {
    const port = 1337 // Change this to your server port
    return `http://localhost:${port}/reviews`;

  }

  /**
   * Fetch all restaurants.
   */
   
  // Fetch request
  static fetchRestaurants(callback, id){
    let fetchURL;
    if (!id){
      fetchURL = DBHelper.DATABASE_URL;
    } else {
      fetchURL = DBHelper.DATABASE_URL + '/' + id;
    }
    
    fetch(fetchURL).then(function(response) {
      if (!response.ok) {
        throw Error(response.statusText);
      }
      // return response.json();
      return response.json();
    }).then(function(response) {
      const restaurants = response;
      //console.log("restaurants: " + JSON.stringify(restaurants));
      dbPromise.then(db => {
        let tx = db.transaction('restaurantz', 'readwrite').objectStore('restaurantz')
          for (const restaurant of restaurants) {
            tx.put(restaurant)
          }
      });
      callback(null, restaurants);
    }).catch(function(error) {
      callback(error, null);
    });
  }
  /**
   * Fetch a restaurant by its ID.
   */
  static fetchRestaurantById(id, callback) {
    // fetch all restaurants with proper error handling.
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        const restaurant = restaurants.find(r => r.id == id);
        if (restaurant) { // Got the restaurant
          //console.log('fetched this rest by id# ' + id + ': ' + JSON.stringify(restaurant));
          callback(null, restaurant);
        } else { // Restaurant does not exist in the database
          callback('Restaurant does not exist', null);
        }
      }
    });
  }

  /**
   * Fetch restaurants by a cuisine type with proper error handling.
   */
  static fetchRestaurantByCuisine(cuisine, callback) {
    // Fetch all restaurants  with proper error handling
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Filter restaurants to have only given cuisine type
        const results = restaurants.filter(r => r.cuisine_type == cuisine);
        callback(null, results);
      }
    });
  }

  /**
   * Fetch restaurants by a neighborhood with proper error handling.
   */
  static fetchRestaurantByNeighborhood(neighborhood, callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Filter restaurants to have only given neighborhood
        const results = restaurants.filter(r => r.neighborhood == neighborhood);
        callback(null, results);
      }
    });
  }

  /**
   * Fetch restaurants by a cuisine and a neighborhood with proper error handling.
   */
  static fetchRestaurantByCuisineAndNeighborhood(cuisine, neighborhood, callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        let results = restaurants
        if (cuisine != 'all') { // filter by cuisine
          results = results.filter(r => r.cuisine_type == cuisine);
        }
        if (neighborhood != 'all') { // filter by neighborhood
          results = results.filter(r => r.neighborhood == neighborhood);
        }
        callback(null, results);
      }
    });
  }

  /**
   * Fetch all neighborhoods with proper error handling.
   */
  static fetchNeighborhoods(callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Get all neighborhoods from all restaurants
        const neighborhoods = restaurants.map((v, i) => restaurants[i].neighborhood)
        // Remove duplicates from neighborhoods
        const uniqueNeighborhoods = neighborhoods.filter((v, i) => neighborhoods.indexOf(v) == i)
        callback(null, uniqueNeighborhoods);
      }
    });
  }

  /**
   * Fetch all cuisines with proper error handling.
   */
  static fetchCuisines(callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Get all cuisines from all restaurants
        const cuisines = restaurants.map((v, i) => restaurants[i].cuisine_type)
        // Remove duplicates from cuisines
        const uniqueCuisines = cuisines.filter((v, i) => cuisines.indexOf(v) == i)
        callback(null, uniqueCuisines);
      }
    });
  }

/**
   * Fetch all reviews.
   */
   
  // Fetch request for reviews
  static fetchReviews(callback, id){
    let fetchReviewURL;
    if (!id){
      fetchReviewURL = DBHelper.DATABASE_URL_REVIEWS;
    } else {
      fetchReviewURL = DBHelper.DATABASE_URL_REVIEWS + '/?restaurant_id=' + id;
    }
    

    fetch(fetchReviewURL).then(function(response) {
      if (!response.ok) {
        throw Error(response.statusText);
      }
      return response.json();
    }).then(function(response) {
        const reviews = response;
        //console.log('Reviews are' + JSON.stringify(reviews));
        dbPromise.then(db => {
         let reviewstx = db.transaction('submittedReviews', 'readwrite').objectStore('submittedReviews')
         var reviewsAmount = reviews.length;
         let idReview = reviewsAmount;
         console.log('idReview: ' + idReview);
        for (const review of reviews) {
          reviewstx.put(review)
          //console.log('review from fetchreviewURL: ' + JSON.stringify(review));
        }
    });
      callback(null, reviews);
    }).catch(function(error) {
      callback(error, null);
    });

    
  }
  /**
   * Fetch a restaurant reviews by its ID.
   */
  /*
 static fetchReviewsById(id, callback) {
   console.log('fetchReviewsbyid is id#' + id);
    DBHelper.fetchReviews((error, reviews) => {
      if (error) {
        callback(error, null);
      } else {
        //const review = reviews.find(r => r.restaurant_id == restaurant_id);
        const results = reviews.filter(review => review.restaurant_id == restaurant_id);
        if (review ) { // Got the restaurant
          console.log('fetched this review by id# ' + id + ': ' + JSON.stringify(review));
          //callback(null, review);
          callback(null, results);
          console.log('fetchReviewsbyid results' + results);
        } else { // Restaurant does not exist in the database
          callback('No reviews exist', null);
        }
      }
    });
}*/
  /**
   * Restaurant page URL.
   */
  static urlForRestaurant(restaurant) {
    return (`./restaurant.html?id=${restaurant.id}`);
  }
  /*

  static urlForReview(restaurant) {
    return (`./review_form.html?id=${restaurant.id}`);
    console.log('urlForReview' + urlForReview);
  }
*/
  /**
   * Restaurant image URL.
   */
  static imageUrlForRestaurant(restaurant) {
    if(restaurant.photograph == undefined)  {
      return ('/img/na')
    };
    return (`/img/${restaurant.photograph}`);
  }
  
  
  /**
   * Map marker for a restaurant.
   */
  static mapMarkerForRestaurant(restaurant, map) {
    // https://leafletjs.com/reference-1.3.0.html#marker  
    const marker = new L.marker([restaurant.latlng.lat, restaurant.latlng.lng],
      {title: restaurant.name,
      alt: restaurant.name,
      url: DBHelper.urlForRestaurant(restaurant)
      })
      marker.addTo(newMap);
    return marker;
  } 
  
}

/**
 * Get review and add it to IDB and to REST Server
 */

function getNewReview() {
    addData();
    createReview();
}
//function that adds review to indexedb
function addData() {
       //e.preventDefault();
       var reviewDate = Math.round((new Date()).getTime()/1000);
       let newItem = {id: reviewDate, restaurant_id: restaurantId, name: nameInput.value, rating: ratingSelector.value, comments: commentsInput.value, createdAt: reviewDate, updatedAt: reviewDate};

       dbPromise.then(db => {
        let tx = db.transaction('reviewz', 'readwrite');
        //creates objecststore which holds database reviewz
        let objectStore = tx.objectStore('reviewz');
        //passing new item
        let request = objectStore.put(newItem);
        //info if success
        request.onsuccess = () => {
        //once successful clear form since its added to database
        nameInput.value = '';
        ratingSelector.value = '';
        commentsInput.value = '';
        };
        tx.oncomplete = () => {
        console.log('Transaction completed on the database');
        }
        tx.onerror = () => {
        console.log('Transaction NOT completed, error!');
        }
        });
}
//function that adds review to REST server
function createReview() {
  var body = { 
    "restaurant_id": restaurantId,
    "name": nameInput.value,
    "rating": ratingSelector.value,
    "comments": commentsInput.value
  };
  fetch(DBHelper.DATABASE_URL_REVIEWS, {
    method: 'post', 
    headers:{
      'Content-Type': 'application/json'
       },
    body: JSON.stringify(body) 
  })
  .catch(function(){});
}
/*
function createReview() {
  var body = { 
    "restaurant_id": restaurantId,
    "name": nameInput.value,
    "rating": ratingSelector.value,
    "comments": commentsInput.value
  };
  fetch(DBHelper.DATABASE_URL_REVIEWS, {
    method: 'POST', 
    body: JSON.stringify(body), 
    headers:{
       'Content-Type': 'application/json'
        }
  }).then(function(response){
    //return response.json();
    console.log(response.status);
  });
}
*/

/**
 * Get a parameter by name from page URL.
 */

function getParameterByName(name, url) {
  if (!url) url = window.location.href;
  name = name.replace(/[\[\]]/g, '\\$&');
  var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
      results = regex.exec(url);
  if (!results) return null;
  if (!results[2]) return '';
  return decodeURIComponent(results[2].replace(/\+/g, ' '));
}

/**
 * Updates Favorite Status of Restaurant
 */

function myFavorite() {

  dbPromise.then(function(db) {
    var tx = db.transaction('restaurantz', 'readwrite');
    var store = tx.objectStore('restaurantz');
    return store.openCursor();
 }).then(function updateFave(cursor) {
    //if null then exits
   if(!cursor) {
    //console.log('looped thorough all restaurants.');
     return;
    }
   //this goes through all values to find a match
   else if(cursor.value.id === restaurantId){
     //console.log('the rest id in cursor:' + restaurantId);
     if(cursor.value.is_favorite === false)
     {
        var updateId = cursor.value;
        //console.log('Not favorite cuz cursor.value.is_favorite is ' + JSON.stringify(cursor.value.is_favorite));
        updateId.is_favorite = true;
        var request = cursor.update(updateId);
     } else if(cursor.value.is_favorite === true) {
        var updateId = cursor.value;
        //console.log('favorite cuz cursor.value.is_favorite is' + JSON.stringify(cursor.value.is_favorite));
        updateId.is_favorite = false;
       var request = cursor.update(updateId);
     }
        request.onsuccess = function() {
        //console.log('cursor.value after update:' + JSON.stringify(cursor.value));
    };
   }
   //advances to next item
   return cursor.continue().then(updateFave);
 });
}
