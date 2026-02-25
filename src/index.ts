// Import Express framework for building web servers
import express from 'express';
import type { Express, NextFunction, Request, Response } from 'express';
import { PORT } from './secrets.js';
import rootRouter from './routes/index.js';

// Set the path to the public folder where static files are stored
const app: Express = express();
const port = PORT;

// Mount all API routes under the /api prefix (e.g., /api/login).
app.use((req: Request, res: Response, next: NextFunction) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        res.sendStatus(204);
        return;
    }

    next();
});

app.use(express.json());
app.use(express.static('public'));

app.use('/api', rootRouter);

// Start the server
app.listen(port, () => {
    console.log('Server is running at http://localhost:' + port);
});
