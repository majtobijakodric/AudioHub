import { Router } from 'express'
import { signup } from '../controllers/auth.js';

// Router for authentication-related endpoints.
const authRoutes: Router = Router();

// POST /api/auth/signup -> creates a new user.
authRoutes.post('/signup', signup);

// Export auth router for mounting in src/routes/index.ts.
export default authRoutes;
