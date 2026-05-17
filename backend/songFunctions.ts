import path from "path";
import fs from "fs";
import { prisma } from "../lib/prisma";
import { FOLDER } from ".";
import { YouTubeSongData } from "./youtube";
import { logWithTime } from "./helper";

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

// removes songs from the database if they are not downloaded (used at start)
export async function areAllSongsDownloaded() {
  const songs = await prisma.song.findMany();

  for (const song of songs) {
    if (!fs.existsSync(song.diskPath)) {
      await removeSong(song.id);
    }
  }
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

export async function addSongToUser(userId: string, songId: string) {
  return await prisma.userSong.upsert({ // upsert creates data if it doesn't exit or update if it does
    where: {
      userId_songId: {
        userId: userId,
        songId: songId,
      },
    },
    update: {},
    create: {
      userId: userId,
      songId: songId,
    },
  });
}

export async function getUserSongs(userId: string) {
  const userSongs = await prisma.userSong.findMany({
    where: {
      userId: userId,
    },
    include: {
      song: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return userSongs.map((userSong) => userSong.song);
}

export async function createPlaylist(name: string, userId: string) {
  return await prisma.playlist.create({
    data: {
      name: name,
      userId: userId,
    },
  });
}

export async function removePlaylist(playlistId: string, userId: string) {
  const playlist = await prisma.playlist.findFirst({
    where: {
      id: playlistId,
      userId: userId,
    },
  });

  if (!playlist) return false;

  return await prisma.playlist.delete({
    where: {
      id: playlistId,
    },
  });
}

export async function addSongToPlaylist(songId: string, playlistId: string) {
  if (!(await isInDatabase(songId)) || !isDownloaded(songId)) return false;

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

export async function removeSong(songId: string) {
  const song = await prisma.song.findUnique({
    where: {
      id: songId,
    },
  });

  if (!song) return false;

  const x = await prisma.song.delete({
    where: {
      id: songId,
    },
  });
  logWithTime(`[REMOVESONG] Deleted song ${songId} from database`);

  return x;
}

export async function getPlayListsSongs(playlistId: string) {
  return await prisma.playlist.findUnique({
    where: {
      id: playlistId,
    },
    select: {
      id: true,
      songs: {
        orderBy: {
          createdAt: 'desc',
        },
      },
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
    orderBy: {
      createdAt: 'desc',
    },
  });
}
