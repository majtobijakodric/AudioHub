import express, { Request, Response } from "express";
import { checkAuthenticated, } from "../auth";
import { isString, isEmptyString, logWithTime, logRequest } from "../helper";
import { downloadYouTubeSong, searchYouTubeSong, YouTubeSongData } from "../youtube";
import { unlink } from "fs";
import path from "path";
import { FOLDER } from "..";
import { isInDatabase, isDownloaded, addSongToUser, addSongToDatabase } from "../songFunctions";

const youtubeRouter = express.Router();

youtubeRouter.post("/ytsearch", logRequest, checkAuthenticated, async (req: Request, res: Response) => {
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
        res.status(500).json({ success: false, error: "Failed to search YouTube" });
    }
},
);

youtubeRouter.post("/downloadsong", checkAuthenticated, async (req: Request, res: Response) => {
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

export default youtubeRouter;