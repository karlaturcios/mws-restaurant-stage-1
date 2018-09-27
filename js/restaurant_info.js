let restaurant;
var newMap;


/**
 * Get a parameter by name from page URL.
 */
getParameterByName = (name, url) => {
  if (!url)
    url = window.location.href;
  name = name.replace(/[\[\]]/g, '\\$&');
  const regex = new RegExp(`[?&]${name}(=([^&#]*)|&|#|$)`),
    results = regex.exec(url);
    //console.log('results =' + results[2]);
    const param = results[2];
    //console.log('results const param =' + param);
  if (!results)
    return null;
  if (!results[2])
    return '';
  return decodeURIComponent(results[2].replace(/\+/g, ' '));
}

/**
 * Initialize map as soon as the page is loaded.
 */
document.addEventListener('DOMContentLoaded', (event) => {  
  initMap();
});

/**
 * Initialize leaflet map
 */
initMap = () => {
  fetchRestaurantFromURL((error, restaurant) => {
    if (error) { // Got an error!
      console.error(error);
    } else {      
      self.newMap = L.map('map', {
        center: [restaurant.latlng.lat, restaurant.latlng.lng],
        zoom: 16,
        scrollWheelZoom: false
      });
      L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.jpg70?access_token={mapboxToken}', {
        mapboxToken: 'pk.eyJ1IjoibWFwYm94a2FybGE4IiwiYSI6ImNqaXVjNThkNjB6d3Qzd2xvaWcyYnJ2a2YifQ.Y7skotRZyyJFAQIcrTklvQ',
        maxZoom: 18,
        attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, ' +
          '<a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
          'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
        id: 'mapbox.streets'    
      }).addTo(newMap);
      fillBreadcrumb();
      DBHelper.mapMarkerForRestaurant(self.restaurant, self.newMap);
    }
  });
}  


/**
 * Get current restaurant from page URL.
 */
fetchRestaurantFromURL = (callback) => {
  if (self.restaurant) { // restaurant already fetched!
    callback(null, self.restaurant)
    return;
  }
  const id = getParameterByName('id');
  if (!id) { // no id found in URL
    error = 'No restaurant id in URL'
    callback(error, null);
  } else {
    DBHelper.fetchRestaurantById(id, (error, restaurant) => {
      self.restaurant = restaurant;
      if (!restaurant) {
        console.error(error);
        return;
      }
      fillRestaurantHTML();
      callback(null, restaurant)
    });
  }
}

/**
* Restaurant page URL.
*/
function urlForRestaurant(param) {
  return (`./restaurant.html?id=${param}`);
  }



/**
 * Create restaurant HTML and add it to the webpage
 */
fillRestaurantHTML = (restaurant = self.restaurant) => {
  const name = document.getElementById('restaurant-name');
  name.innerHTML = restaurant.name;
//make a button for favorite here
  const address = document.getElementById('restaurant-address');
  address.innerHTML = restaurant.address;

  const restFav = document.getElementById('restaurant-status');
  console.log('restaurant.is_favorite is ' + restaurant.is_favorite);
  if (restaurant.is_favorite === 'true' || restaurant.is_favorite === true ) {
    restFav.innerHTML = 'Favorite';
    document.getElementById('slider-control').classList.add('slideractive');
    //fillRestaurantHoursHTML();
  } else if (restaurant.is_favorite === 'false' || restaurant.is_favorite === false){
   restFav.innerHTML = 'Favorite';
  } else {
    restFav.innerHTML = 'Make Favorite';
  }

//TODO work on updating the toggle style onload of page or use another icon
 


  const image = document.getElementById('restaurant-img');
  image.className = 'restaurant-img'
  image.src = DBHelper.imageUrlForRestaurant(restaurant) + ".jpg";
  image.alt = restaurant.name + " restaurant photo";

  const cuisine = document.getElementById('restaurant-cuisine');
  cuisine.innerHTML = restaurant.cuisine_type;


  // fill operating hours
  if (restaurant.operating_hours) {
    fillRestaurantHoursHTML();
  }
  // fill reviews
  /*fillReviewsHTML();*/
  //DBHelper.fetchReviewsById(restaurant.id, fillReviewsHTML)


/*

  DBHelper.fetchFavById((id, callback) => {
    if (error) {
      callback(error.null);
    } else {
      const 
      fillFavToggle(results);
    }
  })*/
  
    /**
   * Fetch a restaurant reviews by its ID.
   */


   DBHelper.fetchReviews((error, reviews) => {
     if (error) {
       callback(error, null);
     } else {
       const results = reviews.filter(review => review.restaurant_id == restaurant.id);
       //console.log("fetchReviews results filtered: " + JSON.stringify(results));
       fillReviewsHTML(results);
     }
   })

}



/**
 * Create restaurant operating hours div and add it to the webpage.

fillRestaurantHoursHTML = (operatingHours = self.restaurant.operating_hours) => {
  const hours = document.getElementById('restaurant-hours');
  for (let key in operatingHours) {
    
    const day = document.createElement('div');
    day.innerHTML = key;
    row.appendChild(day);

    const time = document.createElement('div');
    time.innerHTML = operatingHours[key];
    row.appendChild(time);

    hours.appendChild(row);
  }
} */
/**
 * Create restaurant operating hours HTML table and add it to the webpage.
 */
fillRestaurantHoursHTML = (operatingHours = self.restaurant.operating_hours) => {
  const hours = document.getElementById('restaurant-hours');
  for (let key in operatingHours) {
    const row = document.createElement('tr');
    
    const day = document.createElement('td');
    day.innerHTML = key;
    row.appendChild(day);

    const time = document.createElement('td');
    time.innerHTML = operatingHours[key];
    row.appendChild(time);

    hours.appendChild(row);
  }
}
/**
 * Create all reviews HTML and add them to the webpage.
 */
fillReviewsHTML = (reviews = self.restaurant.reviews) => {
  const container = document.getElementById('reviews-container');
  const title = document.createElement('h3');
  title.innerHTML = 'Reviews';
  container.appendChild(title);
  const div2 = document.createElement('div');
  div2.className = 'reviews-button-container';
  container.append(div2);
  const writeLink = document.createElement('button');
  writeLink.className = 'reviews-button';
  writeLink.innerHTML = 'Write a Review';
  writeLink.onclick = function() {
      const urlLink = `./review_form.html?id=${self.restaurant.id}`;
      //  const urlLink = urlForReview(param);
       // console.log('urlLink =' + urlLink);
        window.location = urlLink;
       // console.log(restaurant.id);
  }
    div2.append(writeLink)
  //console.log("self.restaurant.id = "  + self.restaurant.id)
  //console.log('fillReviewsHTML called: ' + JSON.stringify(reviews));
  if (!reviews) {
    const noReviews = document.createElement('p');
    noReviews.innerHTML = 'No reviews yet!';
    container.appendChild(noReviews);
    const div2 = document.createElement('div');
    div2.className = 'reviews-button-container';
    container.append(div2);
    const writeLink = document.createElement('button');
    writeLink.className = 'reviews-button';
    writeLink.innerHTML = 'Write a Review';
    writeLink.onclick = function() {
        const urlLink = `./review_form.html?id=${self.restaurant.id}`;
      //  const urlLink = urlForReview(param);
        console.log('urlLink =' + urlLink);
        window.location = urlLink;
       // console.log(restaurant.id);
    }
    div2.append(writeLink)
    return;
  }
  const ul = document.getElementById('reviews-list');
  reviews.forEach(review => {
    ul.appendChild(createReviewHTML(review));
  });
  container.appendChild(ul);
}

/**
 * Create review HTML and add it to the webpage.
 */
const createReviewHTML = (review) => {
  //console.log('createReview called: ' + JSON.stringify(review));
  const li = document.createElement('li');
  const name = document.createElement('p');
  name.innerHTML = review.name;
  li.appendChild(name);

  const date = document.createElement('p');
  const submitted = review.createdAt;
  date.innerHTML = new Date(submitted).toLocaleString();
  li.appendChild(date);

  const rating = document.createElement('p');
  rating.innerHTML = `Rating: ${review.rating}`;
  li.appendChild(rating);

  const comments = document.createElement('p');
  comments.innerHTML = review.comments;
  li.appendChild(comments);

  return li;
};

/**
 * Add restaurant name to the breadcrumb navigation menu
 */
fillBreadcrumb = (restaurant=self.restaurant) => {
  const breadcrumb = document.getElementById('breadcrumb');
  const li = document.createElement('li');
  li.innerHTML = restaurant.name;
  breadcrumb.appendChild(li);
}

