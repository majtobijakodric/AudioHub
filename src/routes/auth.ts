import { Router } from 'express'
import { login } from '../controllers/auth.js';

// Router for authentication-related endpoints.
const authRoutes: Router = Router();

// GET /api/auth/login -> returns the login response from the controller.
authRoutes.get('/login', login);

// Export auth router for mounting in src/routes/index.ts.
export default authRoutes;
