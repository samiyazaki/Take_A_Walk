function initMap() {
    const directionsService = new google.maps.DirectionsService();
    const directionsRenderer = new google.maps.DirectionsRenderer();
    const map = new google.maps.Map(document.getElementById("map"), {
      zoom: 15,
      center: { lat:40.8075, lng: -73.9626 },
    });
  
    directionsRenderer.setMap(map);
  
    const onChangeHandler = function () {
      calculateAndDisplayRoute(directionsService, directionsRenderer);
    };
  
    document.getElementById("start").addEventListener("change", onChangeHandler);
    document.getElementById("end").addEventListener("change", onChangeHandler);
  }
  
  function calculateAndDisplayRoute(directionsService, directionsRenderer) {
    directionsService
      .route({
        origin: {
          query: document.getElementById("start").value,
        },
        destination: {
          query: document.getElementById("end").value,
        },
        travelMode: google.maps.TravelMode.WALKING,
      })
      .then((response) => {
        directionsRenderer.setDirections(response);
      })
      .catch((e) => window.alert("Directions request failed due to " + status));
  }
  
  window.initMap = initMap;

  window.onSpotifyIframeApiReady = (IFrameAPI) => {
    let element = document.getElementById('embed-iframe');
    let options = {
        uri: '6li5hO9q6mEiRCklRf7qHE'
      };
    let callback = (EmbedController) => {};
    IFrameAPI.createController(element, options, callback);
  };
  
  let callback = (EmbedController) => {
    document.querySelectorAll('ul#episodes > li > button').forEach(
      playlist => {
        playlist.addEventListener('click', () => {
          // click event handler logic goes here
        });
      })
  };
  playlist.addEventListener('click', () => {
    EmbedController.loadUri(playlist.dataset.spotifyId)
  });
  let options = {
    width: '60%',
    height: '200',
    uri: '6li5hO9q6mEiRCklRf7qHE'
  };

 