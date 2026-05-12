const playlistButton = document.getElementById("addPlaylist");

playlistButton.addEventListener("click", () => {
  console.log("playlist button clicked");

  try {
    const result = fetch("/createplaylist", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name: "New Playlist" }),
    })
      .then((res) => res.json())
      .then((data) => {
        console.log("playlist created:", data);
        // you can also update the UI here to show the new playlist
      });
  } catch (error) {
    console.error("Error creating playlist:", error);
  }
});
