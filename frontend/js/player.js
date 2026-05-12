const audioPlayer = document.getElementById("audioPlayer");
const playPauseButton = document.getElementById("playPauseButton");
const playPauseIcon = document.getElementById("playPauseIcon");
const progressBar = document.getElementById("progressBar");
const currentTime = document.getElementById("currentTime");
const durationTime = document.getElementById("durationTime");
const playerTitle = document.getElementById("playerTitle");
const playerChannel = document.getElementById("playerChannel");
const muteButton = document.getElementById("muteButton");
const volumeIcon = document.getElementById("volumeIcon");
const volumeBar = document.getElementById("volumeBar");
const songThumbnail = document.getElementById("songThumbnail");

let currentObjectUrl;

playPauseButton.addEventListener("click", () => {
  if (!audioPlayer.src) {
    return;
  }

  if (audioPlayer.paused) {
    audioPlayer.play().catch((err) => console.error("Audio play failed:", err));
  } else {
    audioPlayer.pause();
  }
});

progressBar.addEventListener("input", () => {
  if (!Number.isFinite(audioPlayer.duration) || audioPlayer.duration <= 0) {
    return;
  }

  audioPlayer.currentTime =
    (Number(progressBar.value) / 100) * audioPlayer.duration;
});

muteButton.addEventListener("click", () => {
  audioPlayer.muted = !audioPlayer.muted;
  updateVolumeIcon();
});

volumeBar.addEventListener("input", () => {
  audioPlayer.volume = Number(volumeBar.value);
  audioPlayer.muted = audioPlayer.volume === 0;
  updateVolumeIcon();
});

audioPlayer.addEventListener("play", updatePlayButton);
audioPlayer.addEventListener("pause", updatePlayButton);
audioPlayer.addEventListener("ended", updatePlayButton);
audioPlayer.addEventListener("loadedmetadata", updateProgress);
audioPlayer.addEventListener("timeupdate", updateProgress);
audioPlayer.addEventListener("volumechange", updateVolumeIcon);

function formatPlayerDuration(durationInSeconds) {
  const totalSeconds = Number(durationInSeconds);

  // isFinite checks if the number is not Infinite, undefined, ...
  if (!Number.isFinite(totalSeconds) || totalSeconds < 0) {
    return "0:00";
  }

  const minutes = Math.floor(totalSeconds / 60);
  const seconds = Math.floor(totalSeconds % 60);

  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

function updatePlayButton() {
  playPauseIcon.classList.toggle("fa-play", audioPlayer.paused);
  songThumbnail.classList.toggle("animate-[spin_8s_linear_infinite]", !audioPlayer.paused); // resets the icon songThumbnail animation when paused
  playPauseIcon.classList.toggle("fa-pause", !audioPlayer.paused);
  playPauseButton.setAttribute(
    "aria-label",
    audioPlayer.paused ? "Play" : "Pause",
  );
}

function updateProgress() {
  currentTime.textContent = formatPlayerDuration(audioPlayer.currentTime);
  durationTime.textContent = formatPlayerDuration(audioPlayer.duration);

  if (!Number.isFinite(audioPlayer.duration) || audioPlayer.duration <= 0) {
    progressBar.value = 0;
    return;
  }

  progressBar.value = (audioPlayer.currentTime / audioPlayer.duration) * 100;
}

function updateVolumeIcon() {
  volumeIcon.classList.remove(
    "fa-volume-high",
    "fa-volume-low",
    "fa-volume-xmark",
  );

  if (audioPlayer.muted || audioPlayer.volume === 0) {
    volumeIcon.classList.add("fa-volume-xmark");
    return;
  }

  volumeIcon.classList.add(
    audioPlayer.volume < 0.5 ? "fa-volume-low" : "fa-volume-high",
  );
}

async function playSong(song) {
  const res = await fetch("/play", {
    method: "POST",
    body: JSON.stringify({ id: song.id }),
    headers: {
      "Content-Type": "application/json; charset=UTF-8",
    },
  });

  if (!res.ok) {
    console.log("Failed to play song");
    return;
  }

  const blob = await res.blob();
  const objectUrl = URL.createObjectURL(blob);

  if (currentObjectUrl) {
    URL.revokeObjectURL(currentObjectUrl);
  }

  console.log(song.thumbnail);

  currentObjectUrl = objectUrl;
  playerTitle.textContent = song.title;
  playerChannel.textContent = song.channelName || "Unknown channel";
  songThumbnail.src =
    `https://i.ytimg.com/vi/${song.id}/hqdefault.jpg` ||
    "/default-thumbnail.png";
  songThumbnail.classList.add("scale-150", "animate-[spin_8s_linear_infinite]");
  audioPlayer.src = objectUrl;
  audioPlayer.play().catch((err) => console.error("Audio play failed:", err));
}
