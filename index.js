//Google Maps API

function initMap() {
  const directionsService = new google.maps.DirectionsService(); // Setting up the map, centered on Columbia university. The future will label the data as the users location
  const directionsRenderer = new google.maps.DirectionsRenderer();
  const map = new google.maps.Map(document.getElementById("map"), {
    zoom: 15,
    center: { lat: 40.8075, lng: -73.9626 },
  });

  directionsRenderer.setMap(map);

  const onChangeHandler = function () {
    calculateAndDisplayRoute(directionsService, directionsRenderer); // Sets up the route calculation
  };

  document.getElementById("start").addEventListener("change", onChangeHandler);
  document.getElementById("end").addEventListener("change", onChangeHandler); //Changes tbe data based on changing the option from the dropdown list
}

function calculateAndDisplayRoute(directionsService, directionsRenderer) {
  directionsService
    .route({
      origin: {
        query: document.getElementById("start").value, // Sets by start value which is currently just Columbia University
      },
      destination: {
        query: document.getElementById("end").value, // Sets end value by dropdown menu item and HTML element value option.
      },
      travelMode: google.maps.TravelMode.WALKING,
    })
    .then((response) => {
      directionsRenderer.setDirections(response); // Calculates the duration of the travel based off travelmode.walking and displays it to the duration class
      const duration = response.routes[0].legs[0].duration;
      console.log(`Estimated travel time: ${duration.text}`);
      const durationElement = document.getElementById("duration");
      durationElement.innerHTML = `Estimated Travel Time: ${duration.text}`;
    });
}

window.initMap = initMap;
