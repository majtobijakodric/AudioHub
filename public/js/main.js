const registerForm = document.getElementById("register-form");
const loginForm = document.getElementById("login-form");

// Change this in the actual application to the correct backend URL
const AUTH_BASE_URL = "http://localhost:8080/api/auth";

let registerValues = {};
let loginValues = {};
let registeredUser = null;
let loginResponse = null;

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

if (registerForm) {
  registerForm.addEventListener("submit", async (event) => {
    // Stops page refresh so JavaScript can handle the submit
    event.preventDefault();

    // Convert the register form data to an object
    registerValues = Object.fromEntries(new FormData(registerForm).entries());

    try {
      // Create a new user with signup endpoint
      registeredUser = await postJson(`${AUTH_BASE_URL}/signup`, registerValues);
      console.log("User created:", registeredUser);
    } catch (error) {
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
      loginResponse = await postJson(`${AUTH_BASE_URL}/login`, loginValues);
      console.log("Login success:", loginResponse);
    } catch (error) {
      console.error("Login error:", error instanceof Error ? error.message : error);
    }
  });
}
