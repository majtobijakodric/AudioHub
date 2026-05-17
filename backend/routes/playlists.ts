import { checkAuthenticated } from "../auth";
import { isString, isEmptyString, logWithTime } from "../helper";
import { createPlaylist, getUsersPlaylist, removePlaylist, getPlayListsSongs, addSongToPlaylist } from "../songFunctions";
import express, { Request, Response } from "express";

const playlistRouter = express.Router();

playlistRouter.post("/createplaylist", checkAuthenticated, async (req: Request, res: Response) => {
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

playlistRouter.get("/getplaylists", checkAuthenticated, async (req: Request, res: Response) => {
    const userId = (req.user as { id: string }).id;

    try {
        const playlists = await getUsersPlaylist(userId);
        res.json({ success: true, playlists });
    } catch (error) {
        logWithTime(`[GETPLAYLISTS] failed: ${error}`);
        res.status(500).json({ success: false, message: "Failed to get playlists" });
    }
});

playlistRouter.post("/removeplaylist", checkAuthenticated, async (req: Request, res: Response) => {
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

playlistRouter.post("/getplaylistsongs", checkAuthenticated, async (req: Request, res: Response) => {
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

playlistRouter.post("/addsongtoplaylist", checkAuthenticated, async (req: Request, res: Response) => {
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

export default playlistRouter;