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
      $("#select_playlist").empty();

      const token = UICtrl.getStoredToken().token;
      // get genre select field
      const genreSelect = UICtrl.inputField().genre;
      // get  genre id associated with the selected genre
      const genreId = genreSelect.options[genreSelect.selectedIndex].value;
      // get  playlist based on a genre
      const playlist = await APICtrl.getPlaylistByGenre(token, genreId);
      // create a playlist list item for every playlist returned
      playlist.forEach((p) => UICtrl.createPlaylist(p.name, p.href));

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
      const userSelection =
        document.getElementById("select_playlist").textContent;

      localStorage.setItem("selectedPlaylist", userSelection);
      // localStorage.setItem("selectedPlaylist", iframeSrc);

      const selectedPlaylist =
        playlistSelect.options[playlistSelect.selectedIndex].text;
      //Creating a button for the user to recall the selected playlist
      const button = document.createElement("button");
      button.innerText = selectedPlaylist;

      button.classList.add("btn", "btn-success");
      button.setAttribute(
        "src",
        "https://open.spotify.com/embed/playlist/" +
          iframeId +
          "?utm_source=generator"
      );

      // button event listener to switch iframe src url to saved url as data-attribute
      button.addEventListener("click", async (e) => {
        // prevent page reset
        e.preventDefault();
        //get the token
        const token = UICtrl.getStoredToken().token;
        iframePlayer.setAttribute(
          "src",
          "https://open.spotify.com/embed/playlist/" +
            iframeId +
            "?utm_source=generator"
        );
      });
      //can't figure out how to make the name of the playlist appear instead of it's link id
      document.getElementById("past-choice").appendChild(button);
    });

    return {
      init() {
        console.log("Let's listen");
        loadGenres();
      },
    };
  })(UIController, APIController);

  function crankThatSouljaBoy() {
    if (localStorage.getItem("selectedPlaylist")) {
      pastPlaylist = JSON.parse(localStorage.getItem("selectedPlaylist"));
      console.log(selectedPlaylist);

      listArray();
    }
  }
  //call a method to load the genres on page load
  APPController.init();
};
// Get the playlist buttons
const playlistButtons = document.querySelectorAll(".playlist-button");
const pastSelections = document.querySelector("#past-selections");

// Add event listeners to each playlist button
playlistButtons.forEach((button) => {
  button.addEventListener("click", () => {
    // Get the playlist URL from the button's data attribute
    const playlistUrl = button.getAttribute("data-playlist-url");

    // Add the playlist URL to local storage
    let pastUrls = localStorage.getItem("pastUrls");
    if (pastUrls) {
      pastUrls = JSON.parse(pastUrls);
    } else {
      pastUrls = [];
    }
    pastUrls.unshift(playlistUrl);
    pastUrls = pastUrls.slice(0, 10); // Keep a maximum of 10 URLs
    localStorage.setItem("pastUrls", JSON.stringify(pastUrls));

    // Update the past selections list
    pastSelections.innerHTML = ""; // Clear the list
    pastUrls.forEach((url) => {
      const li = document.createElement("li");
      li.textContent = url;
      pastSelections.appendChild(li);
    });
  });
});

// Update the past selections list on page load
let pastUrls = localStorage.getItem("pastUrls");
if (pastUrls) {
  pastUrls = JSON.parse(pastUrls);
  pastSelections.innerHTML = ""; // Clear the list
  pastUrls.forEach((url) => {
    const li = document.createElement("li");
    li.textContent = url;
    pastSelections.appendChild(li);
  });
}

// On page load, retrieve the last playlist selection from local storage
// and display it in the list of past selections
const lastPlaylistSelection = localStorage.getItem("lastPlaylistSelection");
if (lastPlaylistSelection) {
  const playlistSelectionItem = document.createElement("div");
  playlistSelectionItem.innerText = lastPlaylistSelection;
  pastSelectionsContainer.appendChild(playlistSelectionItem);
}
// retrieve list items from local storage and store in a variable
let playlistSelections = JSON.parse(localStorage.getItem("playlistSelections"));

// loop through the playlist selections
for (let i = 0; i < playlistSelections.length; i++) {
  // get the current playlist selection
  let playlistSelection = playlistSelections[i];

  // create a new button element
  let button = document.createElement("button");

  // set the text of the button to be the name of the playlist
  button.textContent = playlistSelection.name;

  // set the value of the data-playlist-url attribute to be the playlist's URL
  button.setAttribute("data-playlist-url", playlistSelection.url);

  // add an event listener to the button that will open the playlist in an embedded Spotify player when clicked
  button.addEventListener("click", function () {
    let url = this.getAttribute("data-playlist-url");
    let iframe = `<iframe src="https://open.spotify.com/embed/playlist/${url}" width="300" height="380" frameborder="0" allowtransparency="true" allow="encrypted-media"></iframe>`;
    document.getElementById("playlist-player").innerHTML = iframe;
  });

  // append the button to the page
  document.getElementById("playlist-buttons").appendChild(button);
}
