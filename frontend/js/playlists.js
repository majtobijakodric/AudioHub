const playlistButton = document.getElementById("addPlaylist"); // opens the paylist menu
const playlistMenu = document.getElementById("playlistMenu"); // the actual playlist menu
const playlistNameInput = document.getElementById("playlistName"); // the input field for the playlist name
const createPlaylistButton = document.getElementById("createPlaylist"); // the button to create a new playlist
const playListContainer = document.getElementById("playListPlace"); // the container where the playlists will be displayed
const playlistDefaultThumbnail = "/assets/noSongThumbnail.png";

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

    const playlistButton = document.createElement("button");
    const playlistImgFrame = document.createElement("div");
    const playlistImg = document.createElement("img");
    const playlistInfo = document.createElement("div");
    const playlistName = document.createElement("p");

    li.classList.add("playlist-item", "w-full", "relative", "px-2", "pb-2");
    playlistButton.type = "button";
    playlistButton.classList.add("flex", "items-center", "gap-4", "w-full", "rounded-lg", "px-3", "py-2", "text-left", "hover:bg-white/10", "cursor-pointer");
    playlistImgFrame.classList.add("h-12", "w-12", "shrink-0", "overflow-hidden", "rounded-full");
    playlistImg.classList.add("h-full", "w-full", "object-cover");
    playlistInfo.classList.add("min-w-0", "flex-1", "flex", "flex-col", "items-start", "justify-start", "text-left");
    playlistName.classList.add("truncate", "font-medium", "text-left", "text-amber-50");

    playlistImg.src = playlistDefaultThumbnail;
    playlistImg.alt = "playlist cover";
    playlistName.textContent = playlist.name;

    // gets all playlists songs and adds them to the selection menu
    playlistButton.addEventListener("click", () => {
      putSongOnScrean(getPlaylistSongs(playlist.id));
      playlistButton.classList.add("bg-white/10");
    });

    playlistImgFrame.appendChild(playlistImg);
    playlistInfo.appendChild(playlistName);
    playlistButton.appendChild(playlistImgFrame);
    playlistButton.appendChild(playlistInfo);
    li.appendChild(playlistButton);
    playListContainer.appendChild(li);
  });
}

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