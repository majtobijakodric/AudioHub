const registerForm = document.getElementById("register-form");
const loginForm = document.getElementById("login-form");
const youtubeSearchForm = document.getElementById("youtube-search-form");
const youtubeResults = document.getElementById("youtube-results");

let registerValues = {};
let loginValues = {};
let youtubeSearchValues = {};
let registeredUser = null;
let loginResponse = null;
let youtubeSearchResponse = null;

function formatViews(views) {
  const value = Number(views) || 0;
  return `${value.toLocaleString()} views`;
}

function renderYoutubeResults(data) {
  if (!youtubeResults) return;

  youtubeResults.innerHTML = "";

  const results = Array.isArray(data?.results) ? data.results : [];

  if (results.length === 0) {
    const emptyText = document.createElement("p");
    emptyText.className = "youtube-empty";
    emptyText.textContent = "No videos found.";
    youtubeResults.appendChild(emptyText);
    return;
  }

  const list = document.createElement("div");
  list.className = "youtube-results-list";

  results.forEach((video) => {
    const item = document.createElement("article");
    item.className = "youtube-result-item";

    const thumb = document.createElement("img");
    thumb.className = "youtube-thumb";
    thumb.src = video.thumbnail || "";
    thumb.alt = video.title || "Video thumbnail";

    const middle = document.createElement("div");
    middle.className = "youtube-main";

    const title = document.createElement("h3");
    title.className = "youtube-title";
    title.textContent = video.title || "Untitled video";

    const author = document.createElement("p");
    author.className = "youtube-author";
    author.textContent = video.author || "Unknown author";

    middle.appendChild(title);
    middle.appendChild(author);

    const right = document.createElement("div");
    right.className = "youtube-meta";

    const views = document.createElement("p");
    views.className = "youtube-views";
    views.textContent = formatViews(video.views);

    const length = document.createElement("p");
    length.className = "youtube-length";
    length.textContent = video.duration?.timestamp || "0:00";

    right.appendChild(views);
    right.appendChild(length);

    item.appendChild(thumb);
    item.appendChild(middle);
    item.appendChild(right);
    list.appendChild(item);
  });

  youtubeResults.appendChild(list);
}

if (registerForm) {
  registerForm.addEventListener("submit", async (event) => {
    // Stops page refresh so JavaScript can handle the submit
    event.preventDefault();

    // Convert the register form data to an object
    registerValues = Object.fromEntries(new FormData(registerForm).entries());

    try {
      // Create a new user with signup endpoint
      registeredUser = await window.api.signup(registerValues);
      console.log("User created:", registeredUser);
    } catch (error) {
      // Use .message only when the thrown value is a real Error object.
      console.error("Signup error:", error instanceof Error ? error.message : error);
    }
  });
}

if (loginForm) {
  loginForm.addEventListener("submit", async (event) => {
    // Stops page refresh so JavaScript can handle the submit
    event.preventDefault();

    // Convert the login form data to an object
    loginValues = Object.fromEntries(new FormData(loginForm).entries());

    try {
      // Authenticate user with login endpoint
      loginResponse = await window.api.login(loginValues);
      console.log("Login success:", loginResponse);
    } catch (error) {
      console.error("Login error:", error instanceof Error ? error.message : error);
    }
  });
}

if (youtubeSearchForm) {
  youtubeSearchForm.addEventListener("submit", async (event) => {
    // Stops page refresh so JavaScript can handle the submit
    event.preventDefault();

    // Convert the youtube search form data to an object
    youtubeSearchValues = Object.fromEntries(
      new FormData(youtubeSearchForm).entries(),
    );

    try {
      // Search videos with youtube endpoint
      youtubeSearchResponse = await window.api.searchYoutube(youtubeSearchValues);
      console.log("YouTube search success:", youtubeSearchResponse);
      renderYoutubeResults(youtubeSearchResponse);
    } catch (error) {
      console.error(
        "YouTube search error:",
        error instanceof Error ? error.message : error,
      );
      if (youtubeResults) {
        youtubeResults.innerHTML = "";
        const errorText = document.createElement("p");
        errorText.className = "youtube-empty";
        errorText.textContent = `Search failed: ${error instanceof Error ? error.message : "Unknown error"}`;
        youtubeResults.appendChild(errorText);
      }
    }
  });
}
