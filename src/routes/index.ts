import { Router } from "express";
import authRoutes from "./auth.js";
import youtubeRoutes from "./youtube.js";
import songRoutes from "./songs.js";

// Create the top-level router for all API route groups.
const rootRouter: Router = Router();
rootRouter.get('/health', (_req, res) => {
    res.status(200).json({ ok: true, service: 'audiohub' });
});
// Mount auth routes under /auth (full path becomes /api/auth from server entry).
rootRouter.use('/auth', authRoutes);
// Mount youtube routes under /youtube (full path becomes /api/youtube from server entry).
rootRouter.use('/youtube', youtubeRoutes);
// Mount song routes under /songs (full path becomes /api/songs from server entry).
rootRouter.use('/songs', songRoutes);

// Export the aggregated router to be mounted in src/index.ts.
export default rootRouter;
