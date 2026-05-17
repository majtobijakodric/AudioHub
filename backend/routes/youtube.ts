import express, { Request, Response } from "express";
import { checkAuthenticated, } from "../auth";
import { isString, isEmptyString, logWithTime, logRequest } from "../helper";
import { searchYouTubeSong } from "../youtube";

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

export default youtubeRouter;