const userMenu = document.getElementById("userMenu")

// a function that toggles the user menu
function toggleUserMenu() {
    if (userMenu.classList.contains("hidden")) {
        userMenu.classList.remove("hidden")
    } else {
        userMenu.classList.add("hidden")
    }
}