import type { Request, Response } from 'express';
import { prismaClient } from '../lib/prisma.js';
import { createRequire } from 'node:module';
import { existsSync, mkdirSync } from 'node:fs';
import path from 'node:path';
import { logger } from '../lib/logger.js';

const require = createRequire(import.meta.url);
const YTDlpWrap = require('yt-dlp-wrap').default;

// Shared yt-dlp wrapper instance.
const ytDlp = new YTDlpWrap();

// Directory where downloaded audio files are stored.
const SONGS_DIR = path.resolve('data/songs');

// Ensure the songs directory exists on startup.
if (!existsSync(SONGS_DIR)) {
    mkdirSync(SONGS_DIR, { recursive: true });
}

export const downloadSong = async (req: Request, res: Response) => {
    try {
        const { videoId, title, author, durationSeconds, durationTimestamp, thumbnail } = req.body;

        // Validate that videoId is provided and is a non-empty string
        if (typeof videoId !== 'string' || videoId.trim().length === 0) {
            res.status(400).json({ message: 'videoId is required and must be a non-empty string' });
            return;
        }

        const trimmedVideoId = videoId.trim();
        const filePath = path.join(SONGS_DIR, `${trimmedVideoId}.opus`);

        // Check if the song already exists in the database
        const existingSong = await prismaClient.song.findUnique({
            where: { videoId: trimmedVideoId },
            include: { author: true }
        });

        if (existingSong) {
            // If DB record exists and the file is on disk, return it immediately
            if (existsSync(existingSong.filePath)) {
                res.status(200).json({
                    message: 'Song already downloaded',
                    song: existingSong
                });
                return;
            }
            // If DB record exists but file is missing, continue to re-download below
        }

        // Find or create the author record
        const authorName = typeof author === 'string' && author.trim().length > 0
            ? author.trim()
            : 'Unknown';

        let authorRecord = await prismaClient.author.findFirst({
            where: { name: authorName }
        });

        if (!authorRecord) {
            authorRecord = await prismaClient.author.create({
                data: { name: authorName }
            });
        }

        // Download audio from YouTube using yt-dlp
        const videoUrl = `https://www.youtube.com/watch?v=${trimmedVideoId}`;

        try {
            await ytDlp.exec([
                videoUrl,
                '-x',
                '--audio-format', 'opus',
                '--audio-quality', '0',
                '-o', filePath,
                '--no-playlist'
            ]);
        } catch (dlError) {
            logger.error('yt-dlp download failed', dlError);
            res.status(502).json({ message: 'Failed to download audio from YouTube' });
            return;
        }

        // Determine if this is a re-download (repair) or a new download
        const isRedownload = existingSong !== null && existingSong !== undefined;

        let song;

        if (isRedownload) {
            // Update existing record with repaired file info
            song = await prismaClient.song.update({
                where: { videoId: trimmedVideoId },
                data: {
                    filePath,
                    status: 'downloaded',
                    downloadedAt: new Date()
                },
                include: { author: true }
            });
        } else {
            // Create a new song record
            song = await prismaClient.song.create({
                data: {
                    videoId: trimmedVideoId,
                    title: typeof title === 'string' ? title.trim() : 'Untitled',
                    authorId: authorRecord.id,
                    durationSeconds: typeof durationSeconds === 'number' ? durationSeconds : 0,
                    durationTimestamp: typeof durationTimestamp === 'string' ? durationTimestamp : '0:00',
                    filePath,
                    thumbnail: typeof thumbnail === 'string' ? thumbnail : null,
                    status: 'downloaded',
                    downloadedAt: new Date()
                },
                include: { author: true }
            });
        }

        // Return the song record with appropriate status code and message
        const statusCode = isRedownload ? 200 : 201;
        const message = isRedownload
            ? 'Song re-downloaded (file was missing)'
            : 'Song downloaded successfully';

        res.status(statusCode).json({ message, song });

    } catch (error) {
        logger.error('Song download failed', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
