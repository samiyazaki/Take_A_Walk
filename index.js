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

  // window.onSpotifyIframeApiReady = (IFrameAPI) => {
  //   let element = document.getElementById('embed-iframe');
  //   let options = {
  //       uri: '6li5hO9q6mEiRCklRf7qHE'
  //     };
  //   let callback = (EmbedController) => {};
  //   IFrameAPI.createController(element, options, callback);
  // };
  
  // let callback = (EmbedController) => {
  //   document.querySelectorAll('ul#episodes > li > button').forEach(
  //     playlist => {
  //       playlist.addEventListener('click', () => {
  //         // click event handler logic goes here
  //       });
  //     })
  // };
  // playlist.addEventListener('click', () => {
  //   EmbedController.loadUri(playlist.dataset.spotifyId)
  // });
  // let options = {
  //   width: '60%',
  //   height: '200',
  //   uri: '6li5hO9q6mEiRCklRf7qHE'
  // };





  //
  //
  //
  //
  //
  // SPOTIFY API js
  
  const APIController = (function() {
    
    const clientId = 'ead6fd1d003e499dad7f6403e4c7a14b';
    const clientSecret = 'd680859a5f9e4353a3c87409a58dacc7';

    // private methods
    const _getToken = async () => {

        const result = await fetch('https://accounts.spotify.com/api/token', {
            method: 'POST',
            headers: {
                'Content-Type' : 'application/x-www-form-urlencoded', 
                'Authorization' : 'Basic ' + btoa(clientId + ':' + clientSecret)
            },
            body: 'grant_type=client_credentials'
        });

        const data = await result.json();
        return data.access_token;
    }
    
    const _getGenres = async (token) => {

        const limit = 50;

        const result = await fetch(`https://api.spotify.com/v1/browse/categories?locale=en_US&limit=${limit}`, {
            method: 'GET',
            headers: { 'Authorization' : 'Bearer ' + token}
        });

        const data = await result.json();
        return data.categories.items;
    }

    const _getPlaylistByGenre = async (token, genreId) => {

        const limit = 50;
        
        const result = await fetch(`https://api.spotify.com/v1/browse/categories/${genreId}/playlists?limit=${limit}`, {
            method: 'GET',
            headers: { 'Authorization' : 'Bearer ' + token}
        });

        const data = await result.json();
        return data.playlists.items;
    }


    const _getTracks = async (token, tracksEndPoint) => {

        const limit = 10;

        const result = await fetch(`${tracksEndPoint}?limit=${limit}`, {
            method: 'GET',
            headers: { 'Authorization' : 'Bearer ' + token}
        });

        const data = await result.json();
        return data.items;
    }

    const _getTrack = async (token, trackEndPoint) => {

        const result = await fetch(`${trackEndPoint}`, {
            method: 'GET',
            headers: { 'Authorization' : 'Bearer ' + token}
        });

        const data = await result.json();
        return data;
    }

    return {
        getToken() {
            return _getToken();
        },
        getGenres(token) {
            return _getGenres(token);
        },
        getPlaylistByGenre(token, genreId) {
            return _getPlaylistByGenre(token, genreId);
        },
        getTracks(token, tracksEndPoint) {
            return _getTracks(token, tracksEndPoint);
        },
        getTrack(token, trackEndPoint) {
            return _getTrack(token, trackEndPoint);
        }
    }
})();


// UI Module
const UIController = (function() {

    //object to hold references to html selectors
    const DOMElements = {
        selectGenre: '#select_genre',
        selectPlaylist: '#select_playlist',
        buttonSubmit: '#btn_submit',
        divSongDetail: '#song-detail',
        hfToken: '#hidden_token',
        divSonglist: '.song-list'
    }

    //public methods
    return {

        //method to get input fields
        inputField() {
            return {
                genre: document.querySelector(DOMElements.selectGenre),
                playlist: document.querySelector(DOMElements.selectPlaylist),
                tracks: document.querySelector(DOMElements.divSonglist),
                submit: document.querySelector(DOMElements.buttonSubmit),
            }
        },

        // need methods to create select list option
        createGenre(text, value) {
            const html = `<option value="${value}">${text}</option>`;
            document.querySelector(DOMElements.selectGenre).insertAdjacentHTML('beforeend', html);
        }, 

        createPlaylist(text, value) {
            const html = `<option value="${value}">${text}</option>`;
            document.querySelector(DOMElements.selectPlaylist).insertAdjacentHTML('beforeend', html);
        },

        // need method to create a track list group item 
        createTrack(id, name) {
            const html = `<a href="#" class="list-group-item list-group-item-action list-group-item-light" id="${id}">${name}</a>`;
            document.querySelector(DOMElements.divSonglist).insertAdjacentHTML('beforeend', html);
        },

        // // need method to create the song detail
        // createTrackDetail(img, title, artist) {

        //     const detailDiv = document.querySelector(DOMElements.divSongDetail);
        //     // any time user clicks a new song, we need to clear out the song detail div
        //     detailDiv.innerHTML = '';

        //     const html = 
        //     `
        //     <div class="row col-sm-12 px-0">
        //         <img src="${img}" alt="">        
        //     </div>
        //     <div class="row col-sm-12 px-0">
        //         <label for="Genre" class="form-label col-sm-12">${title}:</label>
        //     </div>
        //     <div class="row col-sm-12 px-0">
        //         <label for="artist" class="form-label col-sm-12">By ${artist}:</label>
        //     </div> 
        //     `;

        //     detailDiv.insertAdjacentHTML('beforeend', html)
        // },


        storeToken(value) {
            document.querySelector(DOMElements.hfToken).value = value;
        },

        getStoredToken() {
            return {
                token: document.querySelector(DOMElements.hfToken).value
            }
        }
    }

})();

const APPController = (function(UICtrl, APICtrl) {

    // get input field object ref
    const DOMInputs = UICtrl.inputField();

    // get genres on page load
    const loadGenres = async () => {
        //get the token
        const token = await APICtrl.getToken();           
        //store the token onto the page
        UICtrl.storeToken(token);
        //get the genres
        const genres = await APICtrl.getGenres(token);
        //populate our genres select element
        genres.forEach(element => UICtrl.createGenre(element.name, element.id));
    }

    // create genre change event listener
    DOMInputs.genre.addEventListener('change', async () => {
        //get token that's stored on the page
        const token = UICtrl.getStoredToken().token;        
        // get genre select field
        const genreSelect = UICtrl.inputField().genre;       
        // get  genre id associated with the selected genre
        const genreId = genreSelect.options[genreSelect.selectedIndex].value;             
        // get  playlist based on a genre
        const playlist = await APICtrl.getPlaylistByGenre(token, genreId);       
        // create a playlist list item for every playlist returned
        playlist.forEach(p => UICtrl.createPlaylist(p.name, p.href));
    });
     

    //
    //
    // 
    //
    //

    // create submit button click event listener
    DOMInputs.submit.addEventListener('click', async (e) => {
        // prevent page reset
        e.preventDefault();
        // clear tracks
        //get the token
        const token = UICtrl.getStoredToken().token;        
        // get the playlist field
        const playlistSelect = UICtrl.inputField().playlist;
        // get track endpoint based on the selected playlist
        const tracksEndPoint = playlistSelect.options[playlistSelect.selectedIndex].value;
        // get the list of tracks
        const tracks = await APICtrl.getPlaylistByGenre(token, tracksEndPoint);
        // create a track list item
        tracks.forEach(el => UICtrl.createTrack(el.track.href, el.track.name));

        // create iframe url item
        const iframeUrl = playlistSelect.href;

        // create new iframe src attribute
        var iframePlayer = document.getElementById('iframe-player');
     // var src = iframePlayer.getAttribute('src');

        var playList_id = playlists.items[playlistSelect].id
      
      iframePlayer.setAttribute("src", "https://open.spotify.com/embed/playlist/" + playList_id + "?utm_source=generator");
        // set src url in iframe div

        
    });

    // create song selection click event listener
    DOMInputs.playlist.addEventListener('click', async (e) => {
        // prevent page reset
        e.preventDefault();
        // get the token
        const token = UICtrl.getStoredToken().token;
        // get the track endpoint
        const trackEndpoint = e.target.id;
        //get the track object
   //     const track = await APICtrl.getTrack(token, trackEndpoint);
        // load the track details
        UICtrl.createTrackDetail(track.album.images[2].url, track.name, track.artists[0].name);
    });    

    return {
        init() {
            console.log('App is starting');
            loadGenres();
        }
    }

})(UIController, APIController);

// will need to call a method to load the genres on page load
APPController.init();




 