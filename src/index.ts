// Import Express framework for building web servers
import express from 'express';
// Import type definitions for Request and Response objects
import type { Request, Response } from 'express';
import path from 'path';

// Set the path to the public folder where static files are stored
const publicDir = path.join(process.cwd(), 'src', 'public');
const app = express();
const port = 8000;

// Serve static files (HTML, CSS, JS, images, etc.) from the public folder
app.use(express.static(publicDir));


// Handle get requests
app.get('/', (req: Request, res: Response) => {
    res.sendFile(path.join(publicDir, 'index.html'));
});

app.get('/about', (req: Request, res: Response) => {
    res.send('This is AudioHub!');

});

// Start the server
app.listen(port, () => {
    console.log('Server is running at http://localhost:' + port);
});

