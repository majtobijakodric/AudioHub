import { Router } from "express";
import authRoutes from "./auth.js";

// Create the top-level router for all API route groups.
const rootRouter: Router = Router();
// Mount auth routes under /auth (full path becomes /api/auth from server entry).
rootRouter.use('/auth', authRoutes);

// Export the aggregated router to be mounted in src/index.ts.
export default rootRouter;
