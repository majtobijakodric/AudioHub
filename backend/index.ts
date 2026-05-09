import { createUser, initializePassport, checkAuthenticated, checkNotAuthenticated } from "./auth"
import { isString, isEmptyString } from "./helper"
import { searchYouTubeSong, downloadYouTubeSong, YouTubeSongData } from "./youtube"
import express, { NextFunction, Request, Response } from 'express'
import { addSongToDatabase, isDownloaded, isInDatabase } from "./songFunctions"

import flash from "express-flash"
import session from "express-session"
import MySQLStore from "express-mysql-session"
import { unlink } from "node:fs/promises"
import path from "node:path"
import passport from "passport"
import { prisma } from "../lib/prisma" // prisma adapter so you can talk to the db
import { logWithTime } from "./helper"

const app = express()
const PORT = Number(process.env.PORT) || 8080 // set the port in .env
export const FOLDER = "data/songs" // songs are stored here

const MySQLSessionStore = MySQLStore(session)

// save sessions in the databse
const sessionStore = new MySQLSessionStore({
    host: process.env.DATABASE_HOST,
    port: Number(process.env.DATABASE_PORT) || 3306,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_NAME
})

// form forms to work
app.use(express.urlencoded({ extended: false }))

// to pars json
app.use(express.json())

// to use sessions which are store in the db
app.use(session({
    secret: process.env.SESSION_SECRET || "4t38h4eghre",
    resave: false,
    store: sessionStore,
    saveUninitialized: false
}))

// for returning errors to the user (login / registration)
app.use(flash())

// passport and session
initializePassport(passport)
app.use(passport.initialize())
app.use(passport.session())

// to render ejs
app.set("view engine", "ejs")
app.set("views", path.join(__dirname, "../frontend"))

// so you can use css in html
app.use(express.static(path.join(__dirname, "../frontend")))

// so you can see icons in html
app.use("/fontawesome", express.static(path.join(__dirname, "../node_modules/@fortawesome/fontawesome-free")))

function logRequest(route: string) {
    return (req: Request, res: Response, next: NextFunction) => {
        logWithTime(`[${route}] from: ${req.ip}`)
        next()
    }
}

app.get('/', logRequest("/"), (req, res) => {
    if (req.isAuthenticated()) {
        return res.redirect("/home")
    }

    res.redirect("/login")
})

app.get('/login', logRequest("/login"), checkNotAuthenticated, (req, res) => {
    res.render("login")
})

app.post('/login', logRequest("/login"), checkNotAuthenticated, passport.authenticate("local", {
    successRedirect: "/home",
    failureRedirect: "/login",
    failureFlash: true
}))

app.get("/home", logRequest("/home"), checkAuthenticated, (req: Request, res: Response) => {
    res.render("home", {
        name: (req.user as { username: string }).username
    })
})

app.post("/logout", logRequest("/logout"), (req: Request, res: Response, next: NextFunction) => {
    req.logOut((error) => {
        if (error) return next(error)

        res.redirect("/login")
    })
})

app.get("/register", logRequest("/register"), checkNotAuthenticated, (req: Request, res: Response) => {
    res.render("register", {
        errors: req.flash("error")
    })
})

app.post('/register', logRequest("/register"), checkNotAuthenticated, async (req: Request, res: Response) => {
    logWithTime(`[REGISTER] register api called`)

    const { username, password } = req.body

    // check for valid username and password 
    // doesnt check for a strong password
    const hasValidCredentialFormat =
        isString(username) &&
        isString(password) &&
        !isEmptyString(username) &&
        !isEmptyString(password)

    if (!hasValidCredentialFormat) {
        logWithTime(`[REGISTER] Invalid data:`)
        res.status(400).send({ succes: false, message: "Missing information" })
        return
    }
    if (await createUser(username, password)) {
        logWithTime(`[REGISTER] added users ${username} to the database`)
        res.redirect("login")
    } else {
        logWithTime(`[REGISTER] failed to add user ${username} to the database`)
        req.flash("error", "This users already exists")
        res.redirect("/register")
    }
})

app.post("/ytsearch", logRequest("/ytsearch"), checkAuthenticated, async (req: Request, res: Response) => {

    try {
        const songname = req.body.songname
        const limit = Number(req.body.count) || 3
        const fast = req.body.fast

        logWithTime(`[YTSEARCH] songname: ${songname}, limit: ${limit}, fast: ${fast}`)

        if (!isString(songname) || isEmptyString(songname)) {
            res.status(400).json({ success: false, error: "Missing songname" })
            return
        }

        const songs = await searchYouTubeSong({
            name: songname,
            limit,
            fast,
        })

        res.json(songs)
    } catch (error) {
        logWithTime(`[YTSEARCH] failed: ${error}`)
        res.status(500).json({ success: false, error: "Failed to search YouTube" })
    }
})

app.post("/downloadsong", logRequest("/downloadsong"), checkAuthenticated, async (req: Request, res: Response) => {
    try {
        const url = req.body.url
        logWithTime(`[YTDOWNLOAD] starting downloading song: ${url}`)

        if (!isString(url) || isEmptyString(url)) {
            res.status(400).json({ success: false, error: "Missing url" })
            return
        }

        // getting song info again, to put in in the db
        // this does add time but it is here to verify if the song info is valid so the user doest mess with data that is going to the db

        const songData: YouTubeSongData[] = await searchYouTubeSong({
            name: url,
            limit: 1,
            fast: true
        })

        const song = songData[0] // searchYouTubeSong reutrn an array even if you specify for one song

        // check if the song already exists
        if (isDownloaded(song.id) || await isInDatabase(song.id)) {
            res.json({ success: false, message: "This song is already downloaded" })
            return
        }

        await downloadYouTubeSong(url, FOLDER, song.id, true)

        try {
            await addSongToDatabase(song)
        } catch (error) {
            await unlink(path.join(FOLDER, `${song.id}.mp3`)) // remove song file if there was an error adding songs info to the databse
            throw error
        }

        res.json({ success: true, message: "Song downloaded" })
    } catch (error) {
        logWithTime(`[YTDOWNLOAD] failed: ${error}`)
        res.status(500).json({ success: false, error: "Failed to download song" })
    }

    logWithTime("[YTDOWNLOAD] song downloaded and in database")

})

app.get("/getallsongs", logRequest("/getallsongs"), checkAuthenticated, async (req: Request, res: Response) => {
    // this is used at start to fetch all songs 
    try {
        logWithTime("[ALLSONGS] getallsongs api called")
        const songs = await prisma.song.findMany()
        res.send({ success: true, songs })

    } catch (error) {
        logWithTime(`[GETALLSONGS] internal error while gettins all songs ${error}`)
        res.status(500).send({ success: false, message: "Couldn get all songs, internal error" })
    }
})

app.get("/play", logRequest("/play"), checkAuthenticated, async (req: Request, res: Response) => {

    // return a song file based on song id parameter
    try {
        const songId = req.query.id
        logWithTime(`[PLAY] play api called for song id: ${songId}`)

        if (!isString(songId) || isEmptyString(songId)) {
            res.status(400).send({ success: false, message: "Missing song id" })
            return
        }

        // check if the song exissts in the database
        if (!await isInDatabase(songId)) {
            res.status(404).send({ success: false, message: "Song not found" })
            return
        }

        const songPath = path.join(FOLDER, `${songId}.mp3`)

        res.sendFile(songPath)
    } catch (error) {
        logWithTime(`[PLAY] failed to send a song: ${error}`)
        res.status(500).send({ success: false, message: "Failed to play song" })
    }
})

function start() {
    // Optionally use onReady() to get a promise that resolves when store is ready.
    sessionStore.onReady().then(() => {
        // MySQL session store ready for use.
        app.listen(PORT, "0.0.0.0", () => logWithTime(`[SERVER] listening on port http://localhost:${PORT}`))
    }).catch(error => {
        logWithTime(`${error}`)
    })
}

// call the start functon to start it all
start()