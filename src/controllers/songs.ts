import type { Request, Response } from 'express';
import { prismaClient } from '../lib/prisma.js';
import { createRequire } from 'node:module';
import { existsSync, mkdirSync, statSync } from 'node:fs';
import path from 'node:path';
import { logger } from '../lib/logger.js';

// Make a CommonJS-style require function so this ESM file can load older packages.
const require = createRequire(import.meta.url);

// Load the yt-dlp wrapper package
const YTDlpWrap = require('yt-dlp-wrap').default;

// Create one downloader instance and reuse it
const ytDlp = new YTDlpWrap();

// Directory where downloaded audio files are stored.
// This is a relative path from the project root, but we resolve it to an absolute path for safety.
const SONGS_DIR = path.resolve('data/songs');

// Ensure the songs directory exists on startup. Recursive is used to create any missing parent directories
if (!existsSync(SONGS_DIR)) {
    mkdirSync(SONGS_DIR, { recursive: true });
}

const TITLE_PREVIEW_LENGTH = 28;

type SongData = {
    title: string;
    durationSeconds: number;
    thumbnail: string | null;
};

function formatBytes(value: number | undefined): string {
    if (!Number.isFinite(value) || value === undefined || value < 0) {
        return 'unknown';
    }

    if (value === 0) {
        return '0 B';
    }

    const units = ['B', 'KB', 'MB', 'GB', 'TB'];
    let size = value;
    let unitIndex = 0;

    while (size >= 1024 && unitIndex < units.length - 1) {
        size /= 1024;
        unitIndex += 1;
    }

    const digits = size >= 10 || unitIndex === 0 ? 0 : 1;
    return `${size.toFixed(digits)} ${units[unitIndex]}`;
}

function buildProgressLabel(videoId: string, title: unknown): string {
    const safeTitle = typeof title === 'string' && title.trim().length > 0 ? title.trim() : 'Untitled';
    const preview = safeTitle.length > TITLE_PREVIEW_LENGTH
        ? `${safeTitle.slice(0, TITLE_PREVIEW_LENGTH - 3)}...`
        : safeTitle;

    return `[${videoId}] ${preview}`;
}

export async function downloadSong(req: Request, res: Response) {
    try {

        const { videoId } = req.body;

        // Validate that videoId is provided and is a non-empty string
        if (typeof videoId !== 'string' || videoId.trim().length === 0) {
            res.status(400).json({ message: 'videoId is required and must be a non-empty string' });
            return;
        }

        const trimmedVideoId = videoId.trim();
        const filePath = path.join(SONGS_DIR, `${trimmedVideoId}.opus`);

        // Check if the song already exists in the database
        const existingSong = await prismaClient.song.findUnique({
            where: { videoId: trimmedVideoId }
        });

        if (existingSong) {
            // If DB record exists and the file is on disk, return it immediately
            if (existsSync(existingSong.filePath)) {
                res.status(200).json({
                    message: 'Song already downloaded',
                    song: {
                        videoId: existingSong.videoId,
                        title: existingSong.title,
                    }
                });
                return;
            }
            // If DB record exists but file is missing, continue to re-download below
        }

        let songData: SongData;

        try {
            songData = await fetchSongData(trimmedVideoId);

            // If song longer than an hour, reject
            if (songData.durationSeconds > 3600) {
                res.status(400).json({ message: 'Video is too long (over 1 hour)' });
                return;
            }
        } catch (metadataError) {
            logger.error('yt-dlp metadata fetch failed', metadataError);
            res.status(502).json({ message: 'Failed to fetch video metadata from YouTube' });
            return;
        }

        // Download audio from YouTube using yt-dlp
        const videoUrl = `https://www.youtube.com/watch?v=${trimmedVideoId}`;
        const progressLabel = buildProgressLabel(trimmedVideoId, songData.title);
        const downloadStartedAt = Date.now();

        try {
            // Use yt-dlp to download the audio file
            await ytDlp.execPromise([
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

        const finalFileSize = existsSync(filePath) ? statSync(filePath).size : 0;
        const elapsedSeconds = ((Date.now() - downloadStartedAt) / 1000).toFixed(1);

        logger.info(`Download complete ${progressLabel} saved=${formatBytes(finalFileSize)} path=${filePath} elapsed=${elapsedSeconds}s`);

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
                }
            });
        } else {
            // Create a new song record in DB
            song = await prismaClient.song.create({
                data: {
                    videoId: trimmedVideoId,
                    title: songData.title,
                    durationSeconds: songData.durationSeconds,
                    filePath,
                    thumbnail: songData.thumbnail,
                    status: 'downloaded',
                    downloadedAt: new Date()
                }
            });
        }

        // Return the song record with appropriate status code and message
        const statusCode = isRedownload ? 200 : 201;
        const message = isRedownload ? 'Song re-downloaded (file was missing)' : 'Song downloaded successfully';

        res.status(statusCode).json({ message, song: { videoId: song.videoId, title: song.title } });

    } catch (error) {
        logger.error('Song download failed', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

async function fetchSongData(videoId: string): Promise<SongData> {
    const rawMetadata = await ytDlp.execPromise([
        `https://www.youtube.com/watch?v=${videoId}`,
        '--dump-single-json',
        '--skip-download',
        '--no-playlist'
    ]);

    const metadata = JSON.parse(rawMetadata) as {
        title?: unknown;
        duration?: unknown;
        thumbnail?: unknown;
    };

    const safeTitle = typeof metadata.title === 'string' && metadata.title.trim().length > 0 
        ? metadata.title.trim()
        : 'Untitled';

    const safeDurationSeconds = typeof metadata.duration === 'number' && Number.isFinite(metadata.duration) && metadata.duration >= 0
        ? Math.floor(metadata.duration)
        : 0;

    const safeThumbnail = typeof metadata.thumbnail === 'string' && metadata.thumbnail.trim().length > 0
        ? metadata.thumbnail.trim()
        : null;

    return {
        title: safeTitle,
        durationSeconds: safeDurationSeconds,
        thumbnail: safeThumbnail
    };
}

export async function listSongs(req: Request, res: Response) {
    try {
        const songs = await prismaClient.song.findMany({
            orderBy: { downloadedAt: 'desc' }
        });

        res.status(200).json({ songs });
    } catch (error) {
        logger.error('Failed to list songs', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}