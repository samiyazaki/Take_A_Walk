// SPOTIFY API::

window.onSpotifyIframeApiReady = (TakeAWalk) => {
  
    const APIController = (function () {
    const clientId = "ead6fd1d003e499dad7f6403e4c7a14b";
    const clientSecret = "d680859a5f9e4353a3c87409a58dacc7";
  
    // private methods
    const _getToken = async () => {
      const result = await fetch("https://accounts.spotify.com/api/token", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: "Basic " + btoa(clientId + ":" + clientSecret),
        },
        body: "grant_type=client_credentials",
      });
  
      const data = await result.json();
      return data.access_token;
    };
    function setCookie(name, value, days) {
      let expires = "";
      if (days) {
        const date = new Date();
        date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
        expires = "; expires=" + date.toUTCString();
      }
      document.cookie = name + "=" + (value || "") + expires + "; path=/" + "; SameSite=None; Secure";
    }
    const _getGenres = async (token) => {
      const limit = 50;

      const result = await fetch(
        `https://api.spotify.com/v1/browse/categories?locale=en_US&limit=${limit}`,
        {
          method: "GET",
          headers: { Authorization: "Bearer " + token },
        }
      );
  
      const data = await result.json();
      return data.categories.items;
    };
  
    const _getPlaylistByGenre = async (token, genreId) => {
      const limit = 50;
  
      const result = await fetch(
        `https://api.spotify.com/v1/browse/categories/${genreId}/playlists?limit=${limit}`,
        {
          method: "GET",
          headers: { Authorization: "Bearer " + token },
        }
      );
  
      const data = await result.json();
      return data.playlists.items;
    };
  
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
    };
  })();
  
  const DOMElements = {
    selectGenre: "#select_genre",
    selectPlaylist: "#select_playlist",
    buttonSubmit: "#btn_submit",
    divSongDetail: "#song-detail",
    hfToken: "#hidden_token",
  };
  // UI Module
  const UIController = (function () {
    //object to hold references to html selectors
    const DOMElements = {
      selectGenre: "#select_genre",
      selectPlaylist: "#select_playlist",
      buttonSubmit: "#btn_submit",
      divSongDetail: "#song-detail",
      hfToken: "#hidden_token",
    };
  
    //public methods
    return {
      //method to get input fields
      inputField() {
        return {
          genre: document.querySelector(DOMElements.selectGenre),
          playlist: document.querySelector(DOMElements.selectPlaylist),
          submit: document.querySelector(DOMElements.buttonSubmit),
        };
      },
  
      // need methods to create select list option
      createGenre(text, value) {
        const html = `<option value="${value}">${text}</option>`;
        document
          .querySelector(DOMElements.selectGenre)
          .insertAdjacentHTML("beforeend", html);
      },
  
      createPlaylist(text, value) {
        const html = `<option value="${value}">${text}</option>`;
        document
          .querySelector(DOMElements.selectPlaylist)
          .insertAdjacentHTML("beforeend", html);
      },
  
      storeToken(value) {
        document.querySelector(DOMElements.hfToken).value = value;
      },
  
      getStoredToken() {
        return {
          token: document.querySelector(DOMElements.hfToken).value,
        };
      },
    };
  })();
  
  const APPController = (function (UICtrl, APICtrl) {
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
      genres.forEach((element) => UICtrl.createGenre(element.name, element.id));
    };
  
    // create genre change event listener
    DOMInputs.genre.addEventListener("change", async () => {

      // remove old playlists
      $('#select_playlist').empty();

      const token = UICtrl.getStoredToken().token;
      // get genre select field
      const genreSelect = UICtrl.inputField().genre;
      // get  genre id associated with the selected genre
      const genreId = genreSelect.options[genreSelect.selectedIndex].value;
      // get  playlist based on a genre
      const playlist = await APICtrl.getPlaylistByGenre(token, genreId);
      // create a playlist list item for every playlist returned
      playlist.forEach((p) => UICtrl.createPlaylist(p.name, p.href))
      
      const _getPlaylistByGenre = async (token, genreId) => {
        const limit = 50;
    
        const result = await fetch(
          `https://api.spotify.com/v1/browse/categories/${genreId}/playlists?limit=${limit}`,
          {
            method: "GET",
            headers: { Authorization: "Bearer " + token },
          }
        );
    
        const data = await result.json();

        return data.playlists.items;
      };
    });
  
    
    // create submit button click event listener
    DOMInputs.submit.addEventListener("click", async (e) => {
      // prevent page reset
      e.preventDefault();
      //get the token
      const token = UICtrl.getStoredToken().token;
      // get the playlist field
      const playlistSelect = UICtrl.inputField().playlist;
      // get playlist url
      const tracksEndPoint =
        playlistSelect.options[playlistSelect.selectedIndex].value;
  
      // console log the playlist url
      console.log(tracksEndPoint);
  
      // create selected playilst_id object for iframe src url
      const iframeId = tracksEndPoint.replace(
        "https://api.spotify.com/v1/playlists/",
        ""
      );
  
      // create new iframe src attribute
      const iframePlayer = document.getElementById("iframe-player");
  
      // set src in iframe to selected playlist
     iframePlayer.setAttribute(
        "src",
        "https://open.spotify.com/embed/playlist/" +
          iframeId +
          "?utm_source=generator"
      );
  //Saving the user selction by select_playlist to localStorage
  const userSelection = document.getElementById("select_playlist").textContent;
  
  localStorage.setItem("selectedPlaylist", userSelection);
  // localStorage.setItem("selectedPlaylist", iframeSrc);
  
  const selectedPlaylist = playlistSelect.options[playlistSelect.selectedIndex].text;
  //Creating a button for the user to recall the selected playlist
  const button = document.createElement("button");
  button.innerText = selectedPlaylist;


    button.classList.add("btn", "btn-success");
    button.setAttribute("src", "https://open.spotify.com/embed/playlist/" +
  iframeId +
  "?utm_source=generator");

    // button event listener to switch iframe src url to saved url as data-attribute
  button.addEventListener("click", async (e) => {
    // prevent page reset
    e.preventDefault();
    //get the token
    const token = UICtrl.getStoredToken().token;
    iframePlayer.setAttribute("src", "https://open.spotify.com/embed/playlist/" +
    iframeId +
    "?utm_source=generator")});
  //can't figure out how to make the name of the playlist appear instead of it's link id
  document.getElementById("past-choice").appendChild(button);
      
    }
  );
  
    return {
      init() {
        console.log("Let's listen");
        loadGenres();
      },
    };
  })(UIController, APIController);
 

  // window.addEventListener("load", async function() {
  //   let storedGenres = localStorage.getItem("genres");

  //   if (storedGenres) {
  //     storedGenres=JSON.parse(storedGenres);
  //     storedGenres.forEach((genre) =>  {
  //       UIController.createGenre(genre.name, genre.id);
  //     });
  //   } else {
  //     const token = await APIController.getToken();
  //     UIController.storeToken(token);
  //     const genres = await APIController.getGenres(token);
  //     localStorage.setItem("genres", JSON.stringify(genres));
  //     genres.forEach((genre) => {
  //       UIController.createGenre(genre.name, genre.id);
  //     });
  //   }
  // });

  // Event listeners
  window.addEventListener("load", async function () {
    // Retrieve the list of genres from localStorage
    let storedGenres = localStorage.getItem("genres");
  
    // Check if the list of genres is stored in localStorage
    if (storedGenres !== undefined) {
      // Parse the stored genres as JSON
      storedGenres = JSON.parse(storedGenres);
  
      // Populate the select list with the stored genres
      storedGenres.forEach((genre) => {
        UIController.createGenre(genre.name, genre.id);
      });
    } else {
      // Get the token
      const token = await APIController.getToken();
  
      // Store the token in localStorage
      UIController.storeToken(token);
  
      // Get the list of genres from the Spotify API
      const genres = await APIController.getGenres(token);
  
      // Store the list of genres in localStorage
      localStorage.setItem("genres", JSON.stringify(genres));
  
      // Populate the select list with the genres
      genres.forEach((genre) => {
        UIController.createGenre(genre.name, genre.id);
      });
    }
  });
  
  document.querySelector(DOMElements.buttonSubmit).addEventListener("click", async function () {
    // Get the token
    const token = await APIController.getToken();
  
    // Store the token in localStorage
    UIController.storeToken(token);
  
    // Get the selected genre and playlist
    const selectedGenre = UIController.inputField().genre.value;
    const selectedPlaylist = UIController.inputField().playlist.value;
  
    // Get the playlist by genre
    const playlistByGenre = await APIController.getPlaylistByGenre(
      token,
      selectedGenre
    );
    // ...
  });
  // function crankThatSouljaBoy() {
  //   if(localStorage.getItem("selectedPlaylist")) {
  //     pastPlaylist = JSON.parse(localStorage.getItem("selectedPlaylist"));
  //     console.log(selectedPlaylist);

  //     listArray();

     
  //     }
  //   }
  //call a method to load the genres on page load
  APPController.init();
  
}