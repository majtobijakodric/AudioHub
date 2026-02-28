// Import Express framework for building web servers
import express from 'express';
import type { Express, NextFunction, Request, Response } from 'express';
import { PORT } from './secrets.js';
import rootRouter from './routes/index.js';
import { logger } from './lib/logger.js';

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

// Log every incoming request with IP, method, path, status code, and response time.
app.use((req: Request, res: Response, next: NextFunction) => {
    const start = Date.now();
    res.on('finish', () => {
        const duration = Date.now() - start;
        const ip = req.ip ?? req.socket.remoteAddress ?? 'unknown';
        logger.info(`${ip} ${req.method} ${req.originalUrl} ${res.statusCode} ${duration}ms`);
    });
    next();
});

app.use('/api', rootRouter);

// Start the server
app.listen(port, '0.0.0.0', () => {
    logger.info(`Server is running on port ${port}`);
});
