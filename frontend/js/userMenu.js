const userMenu = document.getElementById("userMenu");
const usernameDisplay = document.getElementById("username");
const cancelUserMenuButton = document.getElementById("cancelUserMenuButton");
const deleteAccountButton = document.getElementById("deleteAccountButton");
const removeSongsButton = document.getElementById("removeSongsButton");
const removePlaylistsButton = document.getElementById("removePlaylistsButton");
const deleteAccountMenu = document.getElementById("deleteAccountMenu");
const confirmDeleteAccountButton = document.getElementById("confirmDeleteAccountButton");
const cancelDeleteAccountButton = document.getElementById("cancelDeleteAccountButton");
const songRemoveMenu = document.getElementById("songRemoveMenu");
const removeSongsMenu = document.getElementById("removeSongsMenu");
const removeSongsList = document.getElementById("removeSongsList");
const removeSongsAlert = document.getElementById("removeSongsAlert");
const cancelRemoveSongsButton = document.getElementById("cancelRemoveSongsButton");
const playlistRemoveMenu = document.getElementById("playlistRemoveMenu");
const removePlaylistsMenu = document.getElementById("removePlaylistsMenu");
const removePlaylistsList = document.getElementById("removePlaylistsList");
const removePlaylistsAlert = document.getElementById("removePlaylistsAlert");
const cancelRemovePlaylistsButton = document.getElementById("cancelRemovePlaylistsButton");

const removeMenuDefaultThumbnail = "/assets/playlistIcon.png";

async function setUsername() {
  const username = await getName().then(name => {
    if (name) {
      return name;
    }
  });
  usernameDisplay.textContent = "Hi, " + username;
}

// a function that toggles the user menu
function toggleUserMenu() {
  if (userMenu.classList.contains("hidden")) {
    userMenu.classList.remove("hidden");
  } else {
    userMenu.classList.add("hidden");
  }
}

// show the delete account menu
deleteAccountButton.addEventListener("click", () => {
  userMenu.classList.add("hidden");
  toggleDeleteAccountMenu();
});

// show the remove songs menu
removeSongsButton.addEventListener("click", async () => {
  userMenu.classList.add("hidden");
  toggleSongRemoveMenu();

  const songs = await getAllSongs();
  putSongsOnRemoveMenu(songs);
});

// show the remove playlists menu
removePlaylistsButton.addEventListener("click", async () => {
  userMenu.classList.add("hidden");
  togglePlaylistRemoveMenu();

  const playlists = await getPlaylists();
  putPlaylistsOnRemoveMenu(playlists);
});

cancelDeleteAccountButton.addEventListener("click", toggleDeleteAccountMenu);

cancelUserMenuButton.addEventListener("click", toggleUserMenu);

cancelRemoveSongsButton.addEventListener("click", () => {
  songRemoveMenu.classList.add("hidden");
  removeSongsMenu.reset();
  removeSongsAlert.textContent = "";
});

cancelRemovePlaylistsButton.addEventListener("click", () => {
  playlistRemoveMenu.classList.add("hidden");
  removePlaylistsMenu.reset();
  removePlaylistsAlert.textContent = "";
});

confirmDeleteAccountButton.addEventListener("click", async () => {
  try {
    const response = await fetch("/deleteaccount", {
      method: "POST",
    });

    if (response.ok) {
      window.location.href = "/login";
    }
  } catch (error) {
    console.error("Error deleting account:", error);
  }
});

removeSongsMenu.addEventListener("submit", async (event) => {
  event.preventDefault();

  const formData = new FormData(removeSongsMenu);
  const selectedSongIds = formData.getAll("songs");

  if (selectedSongIds.length === 0) {
    removeSongsAlert.textContent = "Please select at least one song.";
    return;
  }

  try {
    // remove selected songs
    for (const songId of selectedSongIds) {
      const response = await fetch("/deletesong", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          songId: songId,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to delete song");
      }
    }

    songRemoveMenu.classList.add("hidden");
    removeSongsMenu.reset();
    removeSongsAlert.textContent = "";
    getAllSongs().then((songs) => putSongOnScrean(songs));
  } catch (error) {
    console.error("Error removing songs:", error);
    removeSongsAlert.textContent = "Failed to remove songs.";
  }
});

removePlaylistsMenu.addEventListener("submit", async (event) => {
  event.preventDefault();

  const formData = new FormData(removePlaylistsMenu);
  const selectedPlaylistIds = formData.getAll("playlists");

  if (selectedPlaylistIds.length === 0) {
    removePlaylistsAlert.textContent = "Please select at least one playlist.";
    return;
  }

  try {
    // remove selected playlists
    for (const playlistId of selectedPlaylistIds) {
      const response = await fetch("/removeplaylist", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          playlistId: playlistId,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to remove playlist");
      }
    }

    playlistRemoveMenu.classList.add("hidden");
    removePlaylistsMenu.reset();
    removePlaylistsAlert.textContent = "";
    getPlaylists().then((playlists) => addPlaylistToUI(playlists));
  } catch (error) {
    console.error("Error removing playlists:", error);
    removePlaylistsAlert.textContent = "Failed to remove playlists.";
  }
});

function toggleDeleteAccountMenu() {
  if (deleteAccountMenu.classList.contains("hidden")) {
    deleteAccountMenu.classList.remove("hidden");
  } else {
    deleteAccountMenu.classList.add("hidden");
  }
}

function toggleSongRemoveMenu() {
  if (songRemoveMenu.classList.contains("hidden")) {
    songRemoveMenu.classList.remove("hidden");
  } else {
    songRemoveMenu.classList.add("hidden");
  }
}

function togglePlaylistRemoveMenu() {
  if (playlistRemoveMenu.classList.contains("hidden")) {
    playlistRemoveMenu.classList.remove("hidden");
  } else {
    playlistRemoveMenu.classList.add("hidden");
  }
}

// add songs to checkbox menu
function putSongsOnRemoveMenu(songs) {
  removeSongsList.textContent = "";

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
    songImg.src = song.thumbnailURL || removeMenuDefaultThumbnail;
    songImg.alt = "song cover";
    songName.textContent = song.title;
    chanelName.textContent = song.channelName;

    songImgFrame.appendChild(songImg);
    songInfo.appendChild(songName);
    songInfo.appendChild(chanelName);
    songLabel.appendChild(songCheckbox);
    songLabel.appendChild(songImgFrame);
    songLabel.appendChild(songInfo);
    removeSongsList.appendChild(songLabel);
  });
}

// add playlists to checkbox menu
function putPlaylistsOnRemoveMenu(playlists) {
  removePlaylistsList.textContent = "";

  if (!Array.isArray(playlists)) return;

  playlists.forEach((playlist) => {
    const playlistLabel = document.createElement("label");
    const playlistCheckbox = document.createElement("input");
    const playlistImgFrame = document.createElement("div");
    const playlistImg = document.createElement("img");
    const playlistInfo = document.createElement("div");
    const playlistName = document.createElement("p");

    playlistLabel.classList.add("all-song-menu-item", "flex", "items-center", "gap-3", "w-full", "max-w-full", "min-w-0", "rounded-lg", "px-3", "py-2", "text-left", "hover:bg-white/10", "cursor-pointer");
    playlistLabel.style.boxSizing = "border-box";
    playlistCheckbox.classList.add("h-4", "w-4", "shrink-0", "cursor-pointer", "accent-[#28B556]");
    playlistImgFrame.classList.add("h-10", "w-10", "shrink-0", "overflow-hidden", "rounded-full");
    playlistImg.classList.add("h-full", "w-full", "object-cover");
    playlistInfo.classList.add("min-w-0", "flex-1", "flex", "flex-col", "items-start", "justify-start", "text-left");
    playlistName.classList.add("truncate", "font-medium", "text-left", "text-amber-50", "w-55");

    playlistCheckbox.type = "checkbox";
    playlistCheckbox.name = "playlists";
    playlistCheckbox.value = playlist.id;
    playlistImg.src = removeMenuDefaultThumbnail;
    playlistImg.alt = "playlist cover";
    playlistName.textContent = playlist.name;

    playlistImgFrame.appendChild(playlistImg);
    playlistInfo.appendChild(playlistName);
    playlistLabel.appendChild(playlistCheckbox);
    playlistLabel.appendChild(playlistImgFrame);
    playlistLabel.appendChild(playlistInfo);
    removePlaylistsList.appendChild(playlistLabel);
  });
}

async function getName() {
  const res = await fetch("/getusername");

  if (res.ok) {
    const data = await res.json();
    const username = data.username;
    return username;
  } else {
    console.error("Failed to fetch username");
  }
}

setUsername();
