import { Router } from 'express';
import { searchYoutube } from '../controllers/youtube.js';

const youtubeRoutes: Router = Router();

// POST /api/youtube/search -> searches YouTube videos using yt-search.
youtubeRoutes.post('/search', searchYoutube);

export default youtubeRoutes;
