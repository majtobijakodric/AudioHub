const defaultThumbnail = "/assets/noSongThumbnail.png" // Default thumbnail image path
const loadingGif = "/assets/loading.gif"
const searchBar = document.getElementById("searchBar")
const searchInput = document.getElementById("search")

const TIME_OUT_TIME = 400; // keystroke timeout

let searchTimeout

// to get the songs on screan on load
getAllSongs().then((songs) => putSongOnScrean(songs))

searchInput.addEventListener("input", () => {
  clearTimeout(searchTimeout)

  if (searchInput.value.trim().length === 0) {
    hideSearchBar()
    return
  }

  searchTimeout = setTimeout(() => {
    searchBarShow()
  }, TIME_OUT_TIME)
})

// prevent refreshing the site when enter is pressed in the searchbar
searchBar.addEventListener("submit", (e) => {
  e.preventDefault();
})

// to close the search menu when you click elswere
document.addEventListener("click", (e) => {
  const searchBarPopup = document.getElementById("searchBarPopup")

  if (!searchBarPopup) return
  if (searchBar.contains(e.target) || searchBarPopup.contains(e.target)) return

  hideSearchBar()
})

function hideSearchBar() {
  const searchBarPopup = document.getElementById("searchBarPopup")

  if (searchBarPopup) {
    searchBarPopup.remove()
  }
}

async function getAllSongs() {
  try {
    const res = await fetch("/getallsongs")
    const data = await res.json() // parse the response

    if (Array.isArray(data.songs)) {
      return data.songs
    }

    return []
  } catch (err) {
    console.error("Fetch error:", err)
    return []
  }
}

function formatDuration(durationInSeconds) {
  const totalSeconds = Number(durationInSeconds)

  if (!Number.isFinite(totalSeconds) || totalSeconds < 0) {
    return "0:00"
  }

  const minutes = Math.floor(totalSeconds / 60)
  const seconds = Math.floor(totalSeconds % 60)

  return `${minutes}:${seconds.toString().padStart(2, "0")}`
}

// will be used when you open a playlist
// is currently used on load to show songs
async function putSongOnScrean(songs) {
  // songs list = ul
  const songsList = document.getElementById("songsList")
  songsList.textContent = ""

  // makes a div inside <li> to show song contetnt
  songs.forEach(song => {
    const li = document.createElement("li")
    const songDiv = document.createElement("div")
    const songInfo = document.createElement("div")
    const songName = document.createElement("p")
    const songImg = document.createElement("img")
    const songDuration = document.createElement("p")
    const chanelName = document.createElement("p")

    li.classList.add("w-full")
    songDiv.classList.add("flex", "items-center", "gap-4", "w-full", "rounded-lg", "px-3", "py-2", "hover:bg-white/10", "cursor-pointer")
    songImg.classList.add("h-16", "w-16", "shrink-0", "rounded-lg", "object-cover")
    songInfo.classList.add("min-w-0", "flex-1")
    songName.classList.add("truncate", "font-medium", "text-amber-50")
    chanelName.classList.add("truncate", "text-sm", "text-gray-400")
    songDuration.classList.add("ml-auto", "shrink-0", "text-sm", "text-gray-300")

    songImg.src = song.thumbnailURL || defaultThumbnail // Fallback image if thumbnailURL is not available
    songImg.alt = "song cover"

    chanelName.textContent = song.channelName
    songName.textContent = song.title
    songDuration.textContent = formatDuration(song.duration)

    songDiv.appendChild(songImg)
    songInfo.appendChild(songName)
    songInfo.appendChild(chanelName)
    songDiv.appendChild(songInfo)
    songDiv.appendChild(songDuration)
    li.appendChild(songDiv)
    songsList.appendChild(li)
  })
}

function showSearchLoading(searchBarPopup) {
  const loadingImg = document.createElement("img")

  searchBarPopup.textContent = ""
  searchBarPopup.classList.add("min-h-32")
  loadingImg.src = loadingGif
  loadingImg.alt = "Loading"
  loadingImg.classList.add("mx-auto", "my-8", "h-10", "w-10", "object-contain")
  searchBarPopup.appendChild(loadingImg)
}

async function searchBarShow() {

  // to get the x and y cords of the searchBar
  const { x, y, width, height } = searchBar.getBoundingClientRect()

  // get round cordinates
  // WHY?? are pixels in decimal by default??
  const X = Math.floor(x)
  const Y = Math.floor(y)
  const WIDTH = Math.floor(width)
  const HEIGHT = Math.floor(height)

  // creates the popup that will show results
  let searchBarPopup = document.getElementById("searchBarPopup")

  if (!searchBarPopup) {
    searchBarPopup = document.createElement("div")
    searchBarPopup.id = "searchBarPopup"
    searchBarPopup.classList.add("fixed", "z-50", "max-h-80", "overflow-y-auto", "rounded-2xl", "border", "border-white", "bg-[#121212]", "p-2", "shadow-md",)
    document.body.appendChild(searchBarPopup)
  }

  searchBarPopup.style.left = `${X}px`
  searchBarPopup.style.top = `${Y + HEIGHT + 8}px`
  searchBarPopup.style.width = `${WIDTH}px`
  showSearchLoading(searchBarPopup)

  // append each song to the search box with no thumbnail just the name
  searchSongs(searchInput.value).then((results) => {
    searchBarPopup.textContent = ""

    // if there are no results
    if (!Array.isArray(results) || results.length === 0) {
      const noResults = document.createElement("p")
      noResults.classList.add("px-4", "py-3", "text-sm", "text-gray-400")
      noResults.textContent = "No songs found"
      searchBarPopup.appendChild(noResults)
      return
    }

    const MAX_TITLE_LENGTH = 50 // Maximum title length before truncation

    results.forEach((song) => {
      const songButton = document.createElement("button")
      songButton.type = "button"
      songButton.classList.add("block", "w-full", "rounded-xl", "border-transparent", "px-4", "py-3", "text-left", "text-sm", "text-amber-50", "hover:bg-white/5", "cursor-pointer")
      
      if (song.title.length > MAX_TITLE_LENGTH) {
        songButton.textContent = `${song.title.substr(0, MAX_TITLE_LENGTH)}...`
      } else {
        songButton.textContent = song.title
      }

      searchBarPopup.appendChild(songButton)

    })
  })

}

async function searchSongs(songName) {
  console.log("Started fetching ");

  try {
    console.log("in try ");

    const res = await fetch("/ytsearch", {
      method: "POST",
      body: JSON.stringify({
        songname: songName,
        limit: 3,
        fast: true
      }),
      headers: {
        "Content-type": "application/json; charset=UTF-8"
      }
    })
    console.log("Hi");

    const data = await res.json() // parse the response
    console.log(data);
    return data

  } catch (error) {
    console.log(`Error while searching ${error}`);
    return []
  }
}
