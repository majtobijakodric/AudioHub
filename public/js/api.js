// Change this in the actual application to the correct backend URL
const AUTH_BASE_URL = "http://localhost:8080/api/auth";
const YOUTUBE_BASE_URL = "http://localhost:8080/api/youtube";
const SONGS_BASE_URL = "http://localhost:8080/api/songs";

// Send a JSON POST request and return parsed JSON response
async function postJson(url, payload) {
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const message = data?.message || `Request failed with ${response.status}`;
    throw new Error(message);
  }

  return data;
}

window.api = {
  signup(payload) {
    return postJson(`${AUTH_BASE_URL}/signup`, payload);
  },
  login(payload) {
    return postJson(`${AUTH_BASE_URL}/login`, payload);
  },
  searchYoutube(payload) {
    return postJson(`${YOUTUBE_BASE_URL}/search`, payload);
  },
  // Download audio for a YouTube video by videoId
  downloadSong(payload) {
    return postJson(`${SONGS_BASE_URL}/download`, payload);
  },
};
