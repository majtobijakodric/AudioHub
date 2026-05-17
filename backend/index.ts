import {
  createUser,
  initializePassport,
  checkAuthenticated,
  checkNotAuthenticated,
} from "./auth";
import { isString, isEmptyString } from "./helper";
import {
  searchYouTubeSong,
  downloadYouTubeSong,
  YouTubeSongData,
} from "./youtube";
import express, { NextFunction, request, Request, Response } from "express";
import { addSongToDatabase, addSongToUser, getUserSongs, isDownloaded, isInDatabase, addSongToPlaylist, getPlayListsSongs, getUsersPlaylist, createPlaylist, removePlaylist, removeSong, areAllSongsDownloaded } from "./songFunctions";
import flash from "express-flash"; // used 2x for sending login and registration erros
import session from "express-session";
import MySQLStore from "express-mysql-session"; // for storing sessions in the db
import { unlink } from "node:fs/promises"; // for removing files
import path from "node:path"; // to get the path functions
import passport from "passport"; // auth
import { prisma } from "../lib/prisma"; // prisma adapter so you can talk to the db
import { logRequest, logWithTime } from "./helper"; // request loggin midleware

const app = express();
const PORT = Number(process.env.PORT) || 8080; // set the port in .env
export const FOLDER = "data/songs"; // songs are stored here

const MySQLSessionStore = MySQLStore(session);

// save sessions in the databse
const sessionStore = new MySQLSessionStore({
  host: process.env.DATABASE_HOST,
  port: Number(process.env.DATABASE_PORT) || 3306,
  user: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
});

// form forms to work
app.use(express.urlencoded({ extended: false }));

// to pars json
app.use(express.json());

// to use sessions which are store in the db
app.use(
  session({
    secret: process.env.SESSION_SECRET || "4t38h4eghre",
    resave: false,
    store: sessionStore,
    saveUninitialized: false,
  }),
);

// for returning errors to the user (login / registration)
app.use(flash());

// passport and session
initializePassport(passport);
app.use(passport.initialize());
app.use(passport.session());

// to render ejs
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "../frontend"));

// so you can use css in html
app.use(express.static(path.join(__dirname, "../frontend")));

// so you can see icons in html
app.use(
  "/fontawesome",
  express.static(
    path.join(__dirname, "../node_modules/@fortawesome/fontawesome-free"),
  ),
);

// midleware used for logging all request with path and ip
app.use(logRequest);

app.get("/", logRequest, (req, res) => {
  if (req.isAuthenticated()) {
    return res.redirect("/home");
  }

  res.redirect("/login");
});

app.get("/login", logRequest, checkNotAuthenticated, (req, res) => {
  res.render("login");
});

app.post(
  "/login",
  logRequest,
  checkNotAuthenticated,
  passport.authenticate("local", {
    successRedirect: "/home",
    failureRedirect: "/login",
    failureFlash: true,
  }),
);

app.get(
  "/home",
  logRequest,
  checkAuthenticated,
  (req: Request, res: Response) => {
    res.render("home", {
      name: (req.user as { username: string }).username,
    });
  },
);

app.post(
  "/logout",
  logRequest,
  (req: Request, res: Response, next: NextFunction) => {
    req.logOut((error) => {
      if (error) return next(error);

      res.redirect("/login");
    });
  },
);

app.get("/register", checkNotAuthenticated, (req: Request, res: Response) => {
  res.render("register", {
    errors: req.flash("error"),
  });
});

app.post("/register", checkNotAuthenticated, async (req: Request, res: Response) => {
  logWithTime(`[REGISTER] register api called`);

  const { username, password } = req.body;

  // check for valid username and password
  // doesnt check for a strong password
  const hasValidCredentialFormat =
    isString(username) &&
    isString(password) &&
    !isEmptyString(username) &&
    !isEmptyString(password);

  if (!hasValidCredentialFormat) {
    logWithTime(`[REGISTER] Invalid data:`);
    res.status(400).send({ succes: false, message: "Missing information" });
    return;
  }

  if (await createUser(username, password)) {
    logWithTime(`[REGISTER] added users ${username} to the database`);
    res.redirect("login");
  } else {
    logWithTime(`[REGISTER] failed to add user ${username} to the database`);
    req.flash("error", "This users already exists");
    res.redirect("/register");
  }
},
);

app.post("/ytsearch", checkAuthenticated, async (req: Request, res: Response) => {
  try {
    const songname = req.body.songname;
    const limit = Number(req.body.count) || 3;
    const fast = req.body.fast;

    logWithTime(
      `[YTSEARCH] songname: ${songname}, limit: ${limit}, fast: ${fast}`,
    );

    if (!isString(songname) || isEmptyString(songname)) {
      res.status(400).json({ success: false, error: "Missing songname" });
      return;
    }

    const songs = await searchYouTubeSong({
      name: songname,
      limit,
      fast,
    });

    res.json(songs);
  } catch (error) {
    logWithTime(`[YTSEARCH] failed: ${error}`);
    res
      .status(500)
      .json({ success: false, error: "Failed to search YouTube" });
  }
},
);

app.post("/downloadsong", checkAuthenticated, async (req: Request, res: Response) => {
  try {
    const { url } = req.body.url;
    const userId = (req.user as { id: string }).id;
    logWithTime(`[YTDOWNLOAD] starting downloading song: ${url}`);

    if (!isString(url) || isEmptyString(url)) {
      res.status(400).json({ success: false, error: "Missing url" });
      return;
    }

    // getting song info again, to put in in the db
    // this does add time but it is here to verify if the song info is valid so the user doest mess with data that is going to the db

    const songData: YouTubeSongData[] = await searchYouTubeSong({
      name: url,
      limit: 1,
      fast: true,
    });

    const song = songData[0]; // searchYouTubeSong reutrn an array even if you specify for one song

    const songIsInDatabase = await isInDatabase(song.id);
    const songIsDownloaded = isDownloaded(song.id);

    // if the song is alredy here, just adds it to him
    if (songIsInDatabase && songIsDownloaded) {
      await addSongToUser(userId, song.id);
      res.json({ success: true, message: "Song added to your library" });
      return;
    }

    if (!songIsDownloaded) {
      await downloadYouTubeSong(url, FOLDER, song.id, true);
    }

    try {
      if (!songIsInDatabase) {
        await addSongToDatabase(song);
      }
      await addSongToUser(userId, song.id);
    } catch (error) {
      if (!songIsDownloaded && isDownloaded(song.id)) {
        await unlink(path.join(FOLDER, `${song.id}.mp3`)); // remove song file if there was an error adding songs info to the databse
      }
      throw error;
    }

    res.json({ success: true, message: "Song downloaded" });
  } catch (error) {
    logWithTime(`[YTDOWNLOAD] failed: ${error}`);
    res
      .status(500)
      .json({ success: false, error: "Failed to download song" });
  }

  logWithTime("[YTDOWNLOAD] song downloaded and in database");
},
);

app.get("/getallsongs", checkAuthenticated, async (req: Request, res: Response) => {
  // this is used at start to fetch all songs
  try {
    const userId = (req.user as { id: string }).id;
    logWithTime("[ALLSONGS] getallsongs api called");
    const songs = await getUserSongs(userId);
    res.send({ success: true, songs });
  } catch (error) {
    logWithTime(
      `[GETALLSONGS] internal error while gettins all songs ${error}`,
    );
    res.status(500).send({
      success: false,
      message: "Couldn get all songs, internal error",
    });
  }
},
);

app.post("/play", checkAuthenticated, async (req: Request, res: Response) => {
  // return a song file based on song id parameter
  try {
    const songId = req.body.id;
    logWithTime(`[PLAY] play api called for song id: ${songId}`);

    if (!isString(songId) || isEmptyString(songId)) {
      res.status(400).send({ success: false, message: "Missing song id" });
      return;
    }

    // check if the song exissts in the database
    if (!(await isInDatabase(songId))) {
      res.status(404).send({ success: false, message: "Song not found" });
      return;
    }

    const SONGS_FOLDER = path.join(__dirname, "../data/songs");
    const songPath = path.join(SONGS_FOLDER, `${songId}.mp3`);
    res.sendFile(songPath);
  } catch (error) {
    logWithTime(`[PLAY] failed to send a song: ${error}`);
    res.status(500).send({ success: false, message: "Failed to play song" });
  }
});

app.post("/createplaylist", checkAuthenticated, async (req: Request, res: Response) => {
  const { name } = req.body;

  if (!isString(name) || isEmptyString(name.trim())) {
    res.status(400).json({ success: false, message: "Missing playlist name" });
    return;
  }

  const userId = (req.user as { id: string }).id;

  try {
    const result = await createPlaylist(name.trim(), userId);
    res.json({ success: true, result });
  } catch (error) {
    logWithTime(`[CREATEPLAYLIST] failed: ${error}`);
    res.status(500).json({ success: false, message: "Failed to create playlist" });
  }
});

app.get("/getplaylists", checkAuthenticated, async (req: Request, res: Response) => {
  const userId = (req.user as { id: string }).id;

  try {
    const playlists = await getUsersPlaylist(userId);
    res.json({ success: true, playlists });
  } catch (error) {
    logWithTime(`[GETPLAYLISTS] failed: ${error}`);
    res.status(500).json({ success: false, message: "Failed to get playlists" });
  }
});

app.post("/removeplaylist", checkAuthenticated, async (req: Request, res: Response) => {
  const { playlistId } = req.body;

  if (!isString(playlistId) || isEmptyString(playlistId.trim())) {
    res.status(400).json({ success: false, message: "Missing playlist id" });
    return;
  }

  const userId = (req.user as { id: string }).id;

  try {
    const result = await removePlaylist(playlistId, userId);
    if (!result) {
      res.status(404).json({ success: false, message: "Playlist not found" });
      return;
    }
    res.json({ success: true, message: "Playlist removed" });
  } catch (error) {
    logWithTime(`[REMOVEPLAYLIST] failed: ${error}`);
    res.status(500).json({ success: false, message: "Failed to remove playlist" });
  }
});

app.post("/getplaylistsongs", checkAuthenticated, async (req: Request, res: Response) => {
  const { playlistId } = req.body;

  // check if playlistId is valid
  if (!isString(playlistId) || isEmptyString(playlistId.trim())) {
    res.status(400).json({ success: false, message: "Missing playlist id" });
    return;
  }

  try {
    const playlist = await getPlayListsSongs(playlistId);

    res.json({ success: true, songs: playlist?.songs ?? [] });
  } catch (error) {
    logWithTime(`[GETPLAYLISTSONGS] failed: ${error}`);
    res.status(500).json({ success: false, message: "Failed to get playlist songs" });
  }
});

app.post("/addsongtoplaylist", checkAuthenticated, async (req: Request, res: Response) => {
  const { songIds, playlistId } = req.body;

  if (!Array.isArray(songIds) || songIds.some((id) => !isString(id) || isEmptyString(id))) {
    res.status(400).json({ success: false, message: "Invalid song ids" });
    return;
  }

  if (!isString(playlistId) || isEmptyString(playlistId.trim())) {
    res.status(400).json({ success: false, message: "Invalid playlist id" });
    return;
  }

  try {
    for (const songId of songIds) {
      await addSongToPlaylist(songId, playlistId);
    }

    res.json({ success: true, message: "Songs added to playlist" });
  } catch (error) {
    logWithTime(`[ADDSONGTOPLAYLIST] failed: ${error}`);
    res.status(500).json({ success: false, message: "Failed to add songs to playlist" });
  }
});

app.get("/getusername", checkAuthenticated, (req: Request, res: Response) => {
  const username = (req.user as { username: string }).username;
  res.json({ success: true, username });
});

app.post("/deleteaccount", checkAuthenticated, async (req: Request, res: Response, next: NextFunction) => {
  const userId = (req.user as { id: string }).id;

  try {
    await prisma.$transaction(async (tx) => {
      // delete playlists first so the user can be deleted
      await tx.playlist.deleteMany({
        where: { userId: userId },
      });

      await tx.user.delete({
        where: { id: userId },
      });
    });

    req.logOut(() => {
      req.session.destroy(() => {
        res.clearCookie("connect.sid");
        res.json({ success: true, message: "Account deleted" });
      });
    });

  } catch (error) {
    logWithTime(`[DELETEACCOUNT] failed: ${error}`);
    res.status(500).json({ success: false, message: "Failed to delete account" });
  }
});

app.post("/deletesong", checkAuthenticated, async (req: Request, res: Response) => {
  const { songId } = req.body;

  if (!isString(songId) || isEmptyString(songId.trim())) {
    res.status(400).json({ success: false, message: "Missing song id" });
    return;
  }

  try {
    const result = await removeSong(songId);

    if (!result) {
      res.status(404).json({ success: false, message: "Song not found" });
      return;
    }

    if (isDownloaded(songId)) {
      await unlink(path.join(FOLDER, `${songId}.mp3`));
    }

    res.json({ success: true, message: "Song deleted" });
  } catch (error) {
    logWithTime(`[DELETESONG] failed: ${error}`);
    res.status(500).json({ success: false, message: "Failed to delete song" });
  }
});



function start() {
  // Optionally use onReady() to get a promise that resolves when store is ready.
  sessionStore.onReady().then(() => {
    // MySQL session store ready for use.

    areAllSongsDownloaded().then(() => {
      logWithTime("[SONGS] all songs in the database are downloaded");
    });

    // 0.0.0.0 for listening on all IPv4
    app.listen(PORT, "0.0.0.0", () =>
      logWithTime(`[SERVER] listening on port http://localhost:${PORT}`),
    );

  }).catch((error) => {
    logWithTime(`${error}`);
  });
}

// call the start functon to start it all
start();
