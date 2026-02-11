// Import Express framework for building web servers
import express from 'express';
import type { Express, Request, Response } from 'express';
import { PORT } from './secrets.js';
import rootRouter from './routes/index.js';

// Set the path to the public folder where static files are stored
const app: Express = express();
const port = PORT;

// Mount all API routes under the /api prefix (e.g., /api/login).
app.use('/api', rootRouter)

// Start the server
app.listen(port, () => {
    console.log('Server is running at http://localhost:' + port);
});
