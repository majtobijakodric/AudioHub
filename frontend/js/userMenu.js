const userMenu = document.getElementById("userMenu");
const usernameDisplay = document.getElementById("username");

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


