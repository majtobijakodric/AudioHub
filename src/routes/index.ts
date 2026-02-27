import { Router } from "express";
import authRoutes from "./auth.js";
import youtubeRoutes from "./youtube.js";

// Create the top-level router for all API route groups.
const rootRouter: Router = Router();
// Mount auth routes under /auth (full path becomes /api/auth from server entry).
rootRouter.use('/auth', authRoutes);
// Mount youtube routes under /youtube (full path becomes /api/youtube from server entry).
rootRouter.use('/youtube', youtubeRoutes);

// Export the aggregated router to be mounted in src/index.ts.
export default rootRouter;
