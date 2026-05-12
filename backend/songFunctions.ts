import path from "path";
import fs from "fs";
import { prisma } from "../lib/prisma";
import { FOLDER } from ".";
import { YouTubeSongData } from "./youtube";

// check if the song is already downloaded
export function isDownloaded(songId: string): boolean {
  const songPath = path.join(FOLDER, `${songId}.mp3`);
  return fs.existsSync(songPath);
}

// is the song already in the databse
export async function isInDatabase(songId: string) {
  const song = await prisma.song.findUnique({
    where: {
      id: songId,
    },
  });

  return song == null ? false : true;
}

export async function addSongToDatabase(songData: YouTubeSongData) {
  const song = await prisma.song.create({
    data: {
      id: songData.id,
      title: songData.title,
      duration: songData.duration ?? 0,
      channelName: songData.channel ?? songData.uploader ?? "",
      thumbnailURL:
        songData.thumbnail ??
        `https://i.ytimg.com/vi/${songData.id}/hqdefault.jpg`,
      diskPath: path.join(FOLDER, `${songData.id}.mp3`),
      url: songData.url ?? `https://www.youtube.com/watch?v=${songData.id}`,
    },
  });

  return song;
}
