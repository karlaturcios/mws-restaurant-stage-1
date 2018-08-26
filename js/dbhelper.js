const nameInput = document.querySelector('#name');
//const restaurantNameInput = document.querySelector('#restaurantName');
const restaurantNameInput = 3;
const ratingSelector = document.querySelector('#rating');
const commentsInput = document.querySelector('#comments');
const form = document.querySelector('form');
// open database
var dbPromise = idb.open('restaurants-reviews', 1, function(upgradeDb) {
  switch (upgradeDb.oldVersion) {
    case 0:
        // nothing 
    case 1:
      upgradeDb.createObjectStore('restaurantz', {keyPath: 'id'});
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
   * Restaurant page URL.
   */
  static urlForRestaurant(restaurant) {
    return (`./restaurant.html?id=${restaurant.id}`);
  }

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
   form.onsubmit = addData;
   //function that adds data takes event and prevent default to not refresh and new variable to hold values form submission
   function addData(e) {
       e.preventDefault();
       console.log("Form hello");
       //holds values in form
       let newItem = { id: restaurantNameInput, name: nameInput.value, rating: ratingSelector.value, comments: commentsInput.value};
       console.log(newItem);
       dbPromise.then(db => {
        let tx = db.transaction('restaurantz', 'readwrite')
        //creates objecststoer which holds database restaurantz
        let objectStore = tx.objectStore('restaurantz');
        //passing new item
        let request = objectStore.put(newItem);
               //info if success
        request.onsuccess = () => {
        //once successful clear form since its added to database
        nameInput.value = '';
        restaurantNameInput.value = '';
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