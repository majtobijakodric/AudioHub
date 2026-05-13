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

export async function createPlaylist(name: string, userId: string) {
  return await prisma.playlist.create({
    data: {
      name: name,
      userId: userId,
    },
  });
}

export async function addSongToPlaylist(songId: string, playlistId: string) {
  if (!isInDatabase(songId) || !isDownloaded(songId)) return false;

  return await prisma.playlist.update({
    where: {
      id: playlistId,
    },
    data: {
      songs: {
        connect: {
          id: songId,
        },
      },
    },
  });
}

export async function getPlayListsSongs(playlistId: string) {
  return await prisma.playlist.findUnique({
    where: {
      id: playlistId,
    },
  });
}

export async function getUsersPlaylist(userId: string) {
  return await prisma.playlist.findMany({
    where: {
      userId: userId,
    },
    select: {
      id: true,
      name: true,
    },
  });
}
