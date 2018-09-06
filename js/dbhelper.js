const nameInput = document.querySelector('#name');
//const restaurantNameInput = document.querySelector('#restaurantName');
const restaurantNameInput = getParameterByName('id');
console.log('restaurantNameInput = ' + restaurantNameInput);
const restaurantId = Number(restaurantNameInput);
console.log('restaurantId = ' + restaurantId);
const ratingSelector = document.querySelector('#rating');
const commentsInput = document.querySelector('#comments');
const formz = document.querySelector('form');
//let idReview = 0;
// open database
var dbPromise = idb.open('restaurants-reviews', 9, function(upgradeDb) {
  switch (upgradeDb.oldVersion) {
    case 0:
    upgradeDb.createObjectStore('restaurantz', {keyPath: 'id'});
    case 1:
      
      //const submittedReviews = upgradeDB.createObjectStore('reviewz', {keyPath: 'id', autoIncrement: true});
      //submittedReviews.createIndex('name', 'name', { unique: false });
      //submittedReviews.createIndex('rating', 'rating', { unique: false });
      //submittedReviews.createIndex('comments', 'comments', { unique: false });
      upgradeDb.createObjectStore('reviewz', {keyPath: 'id'});
    case 2:
    upgradeDb.createObjectStore('submittedReviews', {keyPath: 'id'});
    submittedReviews.createIndex("restaurant_id", "restaurant_id");
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
   * Fetch all reviews not working.
   */

/*
  // Fetch request
  static fetchReviews(callback, id){
    let fetchReviewURL;
    if (!id){
      fetchReviewURL = DBHelper.DATABASE_URL_REVIEWS;
      console.log(fetchReviewURL);
    } else {
      fetchReviewURL = DBHelper.DATABASE_URL_REVIEWS + '/?restaurant_id=' + id;
      console.log(fetchReviewURL);
    }
    fetch(fetchReviewsURL).then(function(response) {
      if (!response.ok) {
        throw Error(response.statusText);
      }
      return response.json();
    }).then(function(response) {
      const reviews = response;
      console.log("reviews: " + JSON.stringify(reviews));
      dbPromise.then(db => {
        let txrvz = db.transaction('reviewz', 'readwrite').objectStore('reviewz')
          for (const review of reviews) {
            txrvz.put(review)
            console.log("Putting each review from reviews")
          }
      });
      callback(null, reviews);
    }).catch(function(error) {
      callback(error, null);
    });

  }*/

  /**
   * Fetch a review by its ID.
   */
  /*
  static fetchReviewsById(id, callback) {
    // fetch all reviews for a restaurant by id
    console.log('rest id: ' + id);
    const fetchReviewURL = DBHelper.DATABASE_URL_REVIEWS + '/?restaurant_id=' + id;
    fetch(fetchReviewURL, {method: 'GET'}).then(function(response) {
      if (!response.ok) {
        console.log('Problem');
      }
      console.log('response');
      console.log(response.json());//console out put of review by rest id,
    });
  }
*/
/*
  static fetchReviewsById(id, callback) {
    // fetch all reviews for a restaurant by id
    console.log('rest id: ' + id);
    const fetchReviewURL = DBHelper.DATABASE_URL_REVIEWS + '/?restaurant_id=' + id;

    fetch(fetchReviewURL, {method: 'GET'}).then(function(response) {
      if (!response.ok) {
        throw Error(response.statusText);
      }
      return(response.json());
    }).then(function(response) {
      return response.json();
    }).catch(error => callback(error, null));
  }
  
 static fetchReviewsById(id, callback) {
  // fetch all reviews for a restaurant by id
  console.log('rest id: ' + id);
  const fetchReviewURL = DBHelper.DATABASE_URL_REVIEWS + '/?restaurant_id=' + id;

  fetch(fetchReviewURL, {method: 'GET'}).then(function(response) {
    if (!response.ok) {
      throw Error(response.statusText);
    }
    return(response.json());
  }).then(function(response) {
    const reviews = response;
    console.log('Reviews for rest #' + id + 'are' + JSON.stringify(reviews));
    dbPromise.then(db => {
      let reviewstx = db.transaction('submittedReviews', 'readwrite').objectStore('submittedReviews')
        for (const review of reviews) {
          reviewstx.put(review)
          console.log('review: ' + JSON.stringify(review));
        }
    });
    callback(null, reviews);
  }).catch(error => callback(error, null));
}
*/

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

   //when we submit form we add data with this function
  // formz.onsubmit = addData;
   //function that adds data takes event and prevent default to not refresh and new variable to hold values form submission
   function addData() {
    
    //   e.preventDefault();
        var reviewDate = Math.round((new Date()).getTime()/1000);
       let newItem = { id: reviewDate, restaurant_id: restaurantId, name: nameInput.value, rating: ratingSelector.value, comments: commentsInput.value, createdAt: reviewDate, updatedAt: reviewDate};

       dbPromise.then(db => {
        let tx = db.transaction('reviewz', 'readwrite')
        //creates objecststoer which holds database restaurantz
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
        //createReview();
   }

   function createReview() {
   fetch('http://localhost:1337/reviews', {
    method: 'post',
    body: JSON.stringify({
    "restaurant_id": 3,
    "name": "Pumpkin",
    "createdAt": 1504095567183,
    "updatedAt": 1504095567183,
    "rating": 4,
    "comments": "For a Michelin star restaurant, it's fairly priced and the food is fairly good. Started with a strawberry margarita which was good in flavor but not much alcohol. Had the chicken enchiladas with salsa verde and it was really good. Great balance in flavor and a good portion. Extra tasty with their hot sauces. My wife had the lamb but it was a bit too salty for our taste. Although, it was cooked very well and fell off the bone. The highlight of the night was the tres leches cake. Probably the best I've ever had to be honest. Not too sweet and very milky. Overall, one of my top 3 favorite Mexican in NY."
    })
    });
    }
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

      // var reviewDate = Math.round((new Date()).getTime()/1000);
      // let newItem = { id: reviewDate, restaurant_id: restaurantId, //name: nameInput.value, rating: ratingSelector.value, comments: //commentsInput.value, createdAt: reviewDate, updatedAt: reviewDate};
        // The parameters we are gonna pass to the fetch function
        /*let fetchData = { 
        method: 'POST', 
        body: 
        }
        headers: new Headers()
        }

       fetch(DBHelper.DATABASE_URL_REVIEWS, fetchData).then(function(response) {
          if (!response.ok) {
            throw Error(response.statusText);
          }
          return(response.json());
        }).then(function(response) {
          console.log("fetch to pOST");
          callback(null, newItem);
        }).catch(function(error) {
          callback(error, null);
      });*/
     /* fetch('http://localhost:1337/reviews', {
    	method: 'post',
	    body: JSON.stringify({
          id: 1536200120,
          restaurant_id: 1,
           name: Steve,
           createdAt: 1504095567183,
           updatedAt: 1504095567183,
           rating: 4,
           comments: 'Mission Chinese Food has grown up from its scrappy'
	    })
      });*/