import { Router } from 'express'
import { login, signup } from '../controllers/auth.js';

// Router for authentication-related endpoints.
const authRoutes: Router = Router();

// POST /api/auth/signup -> creates a new user.
authRoutes.post('/signup', signup);
authRoutes.post('/login', login);

// Export auth router for mounting in src/routes/index.ts.
export default authRoutes;
