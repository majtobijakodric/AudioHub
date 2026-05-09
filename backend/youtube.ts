import { mkdir } from "node:fs/promises";
import path from "node:path";
import { exec as ytdlpExec } from "yt-dlp-exec";

export type YouTubeSongData = {
  id: string;
  title: string;
  url?: string;
  webpageUrl?: string;
  duration: number;
  durationString?: string | null;
  uploader: string | null;
  uploaderUrl?: string | null;
  channel?: string | null;
  channelId?: string | null;
  thumbnail: string;
  viewCount?: number | null;
  likeCount?: number | null;
  uploadDate?: string | null;
  description?: string | null;
  extractor: string | null;
};

// to know the params when searching
type SearchSongParams = {
  name: string;
  limit?: number;
  fast?: boolean;
};

// gets an js object and returns it's data sorted
const toSongData = (item: any): YouTubeSongData => {
  const id = String(item.id ?? "");
  const webpageUrl = item.webpage_url ?? `https://www.youtube.com/watch?v=${id}`;

  return {
    id,
    title: item.title ?? "",
    url: item.url ?? webpageUrl,
    webpageUrl,
    duration: item.duration ?? null,
    durationString: item.duration_string ?? null,
    uploader: item.uploader ?? null,
    uploaderUrl: item.uploader_url ?? null,
    channel: item.channel ?? null,
    channelId: item.channel_id ?? null,
    thumbnail: item.thumbnail ?? null,
    viewCount: item.view_count ?? null,
    likeCount: item.like_count ?? null,
    uploadDate: item.upload_date ?? null,
    description: item.description ?? null,
    extractor: item.extractor ?? null,
  };
};

export async function searchYouTubeSong({ name, limit = 5, fast = false }: SearchSongParams): Promise<YouTubeSongData[]> {

  // return if name missing
  if (!name?.trim()) {
    throw new Error("Song name is required.");
  }

  const searchLimit = Math.max(1, Math.floor(limit));
  const { stdout } = await ytdlpExec(`ytsearch${searchLimit}:${name.trim()}`, {

    // returns only json data 
    dumpJson: true,
    skipDownload: true,
    noWarnings: true,

    // true faster, less data
    // false slower, more data

    // this 'fast' variable is useless now because it was needed just because it gave back thumbnail, but that can be crafted with video id
    flatPlaylist: fast,
  });

  return stdout
    .split("\n") // splits lines
    .map((line: string) => line.trim()) // remove empty text
    .filter(Boolean) // removes empty lines
    .map((line: string) => toSongData(JSON.parse(line))); // JSON.parse makes an js object from json and then toSongData makes add the type to it
}

export async function downloadYouTubeSong(url: string, folder: string, songid: string, progressBar = false) {
  if (!url?.trim()) {
    throw new Error("Song URL is required.");
  }

  if (!folder?.trim()) {
    throw new Error("Song folder is required!")
  }

  // create the folder songs if it doesnt exist
  // recursive: true => if the folder already exists doesn't crash 
  await mkdir(folder, { recursive: true });

  const audioFormat = "mp3";
  const options: Parameters<typeof ytdlpExec>[1] = {
    noWarnings: true,
    extractAudio: true,
    audioFormat: audioFormat,
    output: path.join(folder, `${songid}.${audioFormat}`),
  };

  if (!progressBar) {
    options.noProgress = true;
  }

  return ytdlpExec(url.trim(), options);
}
