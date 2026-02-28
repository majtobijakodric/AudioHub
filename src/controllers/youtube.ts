import type { Request, Response } from 'express';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const yts = require('yt-search') as typeof import('yt-search');

type YoutubeVideoResult = {
    videoId: string;
    title: string;
    url: string;
    duration: {
        seconds: number;
        timestamp: string;
    };
    views: number;
    author: string;
    thumbnail: string;
};

export const searchYoutube = async (req: Request, res: Response) => {
    try {
        const { ytTitle } = req.body;

        if (typeof ytTitle !== 'string' || ytTitle.trim().length === 0) {
            res.status(400).json({ message: 'ytTitle is required and must be a non-empty string' });
            return;
        }

        const query = ytTitle.trim();

        let videos: YoutubeVideoResult[] = [];

        try {
            const result = await yts(query);

            videos = result.videos.slice(0, 5).map((video) => ({
                videoId: video.videoId,
                title: video.title,
                url: video.url,
                duration: {
                    seconds: video.duration?.seconds ?? video.seconds ?? 0,
                    timestamp: video.duration?.timestamp ?? video.timestamp ?? '0:00'
                },
                views: video.views ?? 0,
                author: video.author?.name ?? '',
                thumbnail: video.thumbnail ?? video.image
            }));
        } catch (error) {
            console.log('YouTube search upstream failed:', error);
            res.status(502).json({ message: 'Failed to fetch results from YouTube' });
            return;
        }

        res.status(200).json({
            query,
            count: videos.length,
            results: videos
        });
    } catch (error) {
        console.log('YouTube search failed:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
