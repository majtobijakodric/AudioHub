const playlistButton = document.getElementById("addPlaylist"); // opens the paylist menu
const playlistMenu = document.getElementById("playlistMenu"); // the actual playlist menu
const playlistNameInput = document.getElementById("playlistName"); // the input field for the playlist name
const createPlaylistButton = document.getElementById("createPlaylist"); // the button to create a new playlist
const playListContainer = document.getElementById("playListPlace"); // the container where the playlists will be displayed
const songAddMenu = document.getElementById("songAddMenu"); // the menu to add a song to a playlist
const allSongsMenu = document.getElementById("allSongsMenu"); // the form used to add songs to a playlist
const allSongsList = document.getElementById("allSongsList"); // the scrollable list where all songs will be displayed
const alertBox = document.getElementById("alertBox"); // the box to show alerts to the user

const playlistDefaultThumbnail = "/assets/playlistIcon.png";

// show the playlist menu
playlistButton.addEventListener("click", togglePlaylistMenu);

// fetch all the playlists and add them to the UI
getPlaylists().then((playlists) => addPlaylistToUI(playlists));

function togglePlaylistMenu() {
  if (playlistMenu.classList.contains("hidden")) {
    playlistMenu.classList.remove("hidden");
  } else {
    playlistMenu.classList.add("hidden");
  }
}

createPlaylistButton.addEventListener("click", async () => {
  try {
    const response = await fetch("/createplaylist", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: playlistNameInput.value
      }),
    });
    const data = await response.json();
    console.log("playlist created:", data.result.name);
    console.log("fetching all playlists");

    togglePlaylistMenu(); // hide the playlist menu after creating the playlist
    // gett all the playlists again to update the UI
    const playlists = await getPlaylists();
    addPlaylistToUI(playlists);
  } catch (error) {
    console.error("Error creating playlist:", error);
  }
});

async function getPlaylists(playlistId) {
  try {
    const response = await fetch("/getplaylists");
    const data = await response.json();
    console.log("playlists:", data.playlists);
    return data.playlists; // returns only the array of playlists
  } catch (error) {
    console.error("Error fetching playlists:", error);
    throw error; // so it catches it in try
  }

}

function addPlaylistToUI(playlists) {
  document.querySelectorAll(".playlist-item").forEach((playlistElement) => {
    playlistElement.remove();
  });

  if (!Array.isArray(playlists)) return;

  playlists.forEach((playlist) => {
    const li = document.createElement("li");

    const playlistRow = document.createElement("div");
    const playlistButton = document.createElement("button");
    const playlistImgFrame = document.createElement("div");
    const playlistImg = document.createElement("img");
    const playlistInfo = document.createElement("div");
    const playlistName = document.createElement("p");
    const addSongButton = document.createElement("button");
    const addSongIcon = document.createElement("i");

    li.classList.add("playlist-item", "w-full", "relative", "px-2", "pb-2");
    playlistRow.classList.add("flex", "items-center", "gap-2", "w-full", "rounded-lg", "hover:bg-white/10");
    playlistButton.type = "button";
    playlistButton.classList.add("playlist-select-button", "flex", "items-center", "gap-4", "min-w-0", "flex-1", "rounded-lg", "px-3", "py-2", "text-left", "cursor-pointer");
    playlistImgFrame.classList.add("h-12", "w-12", "shrink-0", "overflow-hidden", "rounded-full");
    playlistImg.classList.add("h-full", "w-full", "object-cover");
    playlistInfo.classList.add("min-w-0", "flex-1", "flex", "flex-col", "items-start", "justify-start", "text-left");
    playlistName.classList.add("truncate", "font-medium", "text-left", "text-amber-50");
    addSongButton.classList.add("flex", "h-8", "w-8", "shrink-0", "items-center", "justify-center", "rounded-full", "text-gray-300", "hover:bg-white/10", "hover:text-amber-50", "cursor-pointer");
    addSongIcon.classList.add("fa-solid", "fa-plus", "text-sm");

    playlistImg.src = playlistDefaultThumbnail;
    playlistImg.alt = "playlist cover";
    playlistName.textContent = playlist.name;
    addSongButton.type = "button";

    // gets all playlists songs and adds them to the selection menu
    playlistButton.addEventListener("click", async () => {
      // gets all songs
      const songs = await getPlaylistSongs(playlist.id);

      // puts all songs on the menu
      putSongOnScrean(songs);

      // shows which playlist is selected
      document.querySelectorAll(".playlist-select-button").forEach((button) => {
        button.classList.remove("bg-white/10");
      });
      playlistButton.classList.add("bg-white/10");
    });


    addSongButton.addEventListener("click", (event) => {
      // stops refreshing the playlist menu when clicking the add song button
      event.stopPropagation();
      allSongsMenu.dataset.playlistId = playlist.id;

      // shows the menu to add songs to the playlist
      if (songAddMenu.classList.contains("hidden")) {
        songAddMenu.classList.remove("hidden");
      } else {
        songAddMenu.classList.add("hidden");
      }

      // fetch all songs to display in the add to playlist menu
      getAllSongs().then((songs) => {
        putSongOnMenu(songs);
      });

    });

    playlistImgFrame.appendChild(playlistImg);
    addSongButton.appendChild(addSongIcon);
    playlistInfo.appendChild(playlistName);
    playlistButton.appendChild(playlistImgFrame);
    playlistButton.appendChild(playlistInfo);
    playlistRow.appendChild(playlistButton);
    playlistRow.appendChild(addSongButton);
    li.appendChild(playlistRow);
    playListContainer.appendChild(li);
  });
}

allSongsMenu.addEventListener("submit", async (event) => {
  event.preventDefault();

  const formData = new FormData(allSongsMenu);
  const selectedSongIds = formData.getAll("songs");
  const playlistId = allSongsMenu.dataset.playlistId;

  if (selectedSongIds.length === 0) {
    alertBox.textContent = "Please select at least one song.";
    return;
  }

  if (!playlistId) {
    alertBox.textContent = "Please choose a playlist first.";
    return;
  }

  try {
    const response = await fetch("/addsongtoplaylist", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        playlistId: playlistId,
        songIds: selectedSongIds,
      }),
    });

    const result = await response.json();

    if (!response.ok || result.success === false) {
      throw new Error(result.message || "Failed to add songs to playlist");
    }

    songAddMenu.classList.add("hidden");
    allSongsMenu.reset();
    alertBox.textContent = "";
  } catch (error) {
    console.error("Error adding songs to playlist:", error);
    alertBox.textContent = "Failed to add songs to playlist.";
  }
});

// fetches all the songs in a playlist
async function getPlaylistSongs(playlistId) {
  try {
    const response = await fetch("/getplaylistsongs", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        playlistId: playlistId
      }),
    });
    const data = await response.json();

    return data.songs || [];
  } catch (error) {
    console.error("Error fetching playlist songs:", error);
    return [];
  }
}

// add all song to the add to playlist menu
// its adds them to a form with checkboxes so the user can select which songs to add to the playlist
function putSongOnMenu(songs) {
  allSongsList.textContent = "";

  if (!Array.isArray(songs)) return;

  songs.forEach((song) => {
    const songLabel = document.createElement("label");
    const songCheckbox = document.createElement("input");
    const songImgFrame = document.createElement("div");
    const songImg = document.createElement("img");
    const songInfo = document.createElement("div");
    const songName = document.createElement("p");
    const chanelName = document.createElement("p");

    songLabel.classList.add("all-song-menu-item", "flex", "items-center", "gap-3", "w-full", "max-w-full", "min-w-0", "rounded-lg", "px-3", "py-2", "text-left", "hover:bg-white/10", "cursor-pointer");
    songLabel.style.boxSizing = "border-box";
    songCheckbox.classList.add("h-4", "w-4", "shrink-0", "cursor-pointer", "accent-[#28B556]");
    songImgFrame.classList.add("h-10", "w-10", "shrink-0", "overflow-hidden", "rounded-full");
    songImg.classList.add("h-full", "w-full", "scale-135", "object-cover");
    songInfo.classList.add("min-w-0", "flex-1", "flex", "flex-col", "items-start", "justify-start", "text-left");
    songName.classList.add("truncate", "font-medium", "text-left", "text-amber-50", "w-55");
    chanelName.classList.add("truncate", "text-left", "text-sm", "text-gray-400");

    songCheckbox.type = "checkbox";
    songCheckbox.name = "songs";
    songCheckbox.value = song.id;
    songImg.src = song.thumbnailURL || playlistDefaultThumbnail;
    songImg.alt = "song cover";
    songName.textContent = song.title;
    chanelName.textContent = song.channelName;

    songImgFrame.appendChild(songImg);
    songInfo.appendChild(songName);
    songInfo.appendChild(chanelName);
    songLabel.appendChild(songCheckbox);
    songLabel.appendChild(songImgFrame);
    songLabel.appendChild(songInfo);
    allSongsList.appendChild(songLabel);
  });
}
