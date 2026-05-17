import { unlink } from "fs";
import path from "path";
import { FOLDER } from "..";
import { checkAuthenticated } from "../auth";
import { isString, isEmptyString, logWithTime } from "../helper";
import { removeSong, isDownloaded, getUserSongs, isInDatabase } from "../songFunctions";
import express, { Request, Response } from "express";

const songsRouter = express.Router();

songsRouter.post("/deletesong", checkAuthenticated, async (req: Request, res: Response) => {
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
            unlink(path.join(FOLDER, `${songId}.mp3`), (error) => { });
        }

        res.json({ success: true, message: "Song deleted" });
    } catch (error) {
        logWithTime(`[DELETESONG] failed: ${error}`);
        res.status(500).json({ success: false, message: "Failed to delete song" });
    }
});

songsRouter.get("/getallsongs", checkAuthenticated, async (req: Request, res: Response) => {
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

songsRouter.post("/play", checkAuthenticated, async (req: Request, res: Response) => {
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

export default songsRouter;