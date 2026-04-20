import { Router } from 'express';
import { downloadSong, listSongs } from '../controllers/songs.js';

// Router for song-related endpoints.
const songRoutes: Router = Router();

// POST /api/songs/download -> downloads audio for a YouTube video.
songRoutes.post('/download', downloadSong);

// GET /api/songs/listsongs -> lists all downloaded songs.
songRoutes.get('/listsongs', listSongs);

// Export song router for mounting in src/routes/index.ts.
export default songRoutes;
