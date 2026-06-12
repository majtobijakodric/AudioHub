import { unlink } from "fs";
import path from "path";
import { checkAuthenticated } from "../auth";
import { isString, isEmptyString, logWithTime } from "../helper";
import { removeSong, isDownloaded, getUserSongs, isInDatabase, addSongToDatabase, addSongToUser, removeSongFromUser } from "../songFunctions";
import express, { Request, Response } from "express";
import { YouTubeSongData, searchYouTubeSong, downloadYouTubeSong } from "../youtube";
import youtubeRouter from "./youtube";
import { FOLDER } from "..";

const songsRouter = express.Router();

songsRouter.post("/deletesong", checkAuthenticated, async (req: Request, res: Response) => {
  const { songId } = req.body;

  if (!isString(songId) || isEmptyString(songId.trim())) {
    res.status(400).json({ success: false, message: "Missing song id" });
    return;
  }

  try {
    const userId = (req.user as { id: string }).id;
    const result = await removeSongFromUser(userId, songId);

    if (!result) {
      res.status(404).json({ success: false, message: "Song not found" });
      return;
    }

    if (result.fileRemoved && isDownloaded(songId)) {
      unlink(path.join(FOLDER, `${songId}.mp3`), () => {});
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

        const songPath = path.resolve(FOLDER, `${songId}.mp3`);
        res.sendFile(songPath);
    } catch (error) {
        logWithTime(`[PLAY] failed to send a song: ${error}`);
        res.status(500).send({ success: false, message: "Failed to play song" });
    }
});

youtubeRouter.post("/downloadsong", checkAuthenticated, async (req: Request, res: Response) => {
    try {
        const { url } = req.body;
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
                unlink(path.join(FOLDER, `${song.id}.mp3`), (error) => { }); // remove song file if there was an error adding songs info to the databse
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
export default songsRouter;
