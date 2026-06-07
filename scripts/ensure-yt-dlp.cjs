#!/usr/bin/env node
'use strict';

const fs = require('node:fs');
const fsp = require('node:fs/promises');
const path = require('node:path');
const http = require('node:http');
const https = require('node:https');
const { pipeline } = require('node:stream/promises');
const { spawnSync } = require('node:child_process');

const DOWNLOAD_URL =
  process.env.YTDLP_DOWNLOAD_URL ||
  'https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp_linux';

const TARGET =
  process.env.YTDLP_BINARY_PATH ||
  path.join(process.cwd(), 'node_modules', 'yt-dlp-exec', 'bin', 'yt-dlp');

const MAX_REDIRECTS = Number(process.env.YTDLP_MAX_REDIRECTS || 10);
const FORCE = process.env.YTDLP_FORCE_DOWNLOAD === '1';

function requestWithRedirects(url, redirectCount = 0) {
  return new Promise((resolve, reject) => {
    const parsed = new URL(url);
    const client = parsed.protocol === 'http:' ? http : https;

    const req = client.get(
      parsed,
      {
        headers: {
          'User-Agent': 'audiohub-yt-dlp-installer',
          Accept: 'application/octet-stream',
        },
      },
      (res) => {
        const status = res.statusCode || 0;

        if ([301, 302, 303, 307, 308].includes(status)) {
          res.resume();

          if (!res.headers.location) {
            reject(new Error(`Redirect ${status} without Location header from ${url}`));
            return;
          }

          if (redirectCount >= MAX_REDIRECTS) {
            reject(new Error(`Too many redirects while downloading yt-dlp`));
            return;
          }

          const nextUrl = new URL(res.headers.location, parsed).toString();
          console.log(`[yt-dlp] redirect ${status} -> ${nextUrl}`);

          resolve(requestWithRedirects(nextUrl, redirectCount + 1));
          return;
        }

        if (status !== 200) {
          let body = '';
          res.setEncoding('utf8');

          res.on('data', (chunk) => {
            body += chunk;
            if (body.length > 1000) body = body.slice(0, 1000);
          });

          res.on('end', () => {
            reject(
              new Error(
                `Download failed: HTTP ${status} ${res.statusMessage || ''}\n${body}`
              )
            );
          });

          return;
        }

        resolve(res);
      }
    );

    req.setTimeout(60_000, () => {
      req.destroy(new Error('Download timed out'));
    });

    req.on('error', reject);
  });
}

async function binaryWorks(file) {
  try {
    await fsp.access(file, fs.constants.X_OK);

    const result = spawnSync(file, ['--version'], {
      encoding: 'utf8',
      timeout: 15_000,
    });

    if (result.status === 0) {
      console.log(`[yt-dlp] ready: ${file} (${result.stdout.trim()})`);
      return true;
    }

    console.warn(
      `[yt-dlp] existing binary failed: ${
        result.stderr || result.error?.message || `exit ${result.status}`
      }`
    );

    return false;
  } catch {
    return false;
  }
}

async function downloadYtDlp() {
  const dir = path.dirname(TARGET);
  const tmp = path.join(dir, `.yt-dlp.${process.pid}.tmp`);

  await fsp.mkdir(dir, { recursive: true });

  try {
    await fsp.unlink(tmp);
  } catch {}

  console.log(`[yt-dlp] downloading ${DOWNLOAD_URL}`);
  console.log(`[yt-dlp] target ${TARGET}`);

  const res = await requestWithRedirects(DOWNLOAD_URL);

  let bytes = 0;
  res.on('data', (chunk) => {
    bytes += chunk.length;
  });

  try {
    await pipeline(res, fs.createWriteStream(tmp, { mode: 0o755 }));

    const stat = await fsp.stat(tmp);

    // GitHub error pages are tiny compared with the standalone Linux binary.
    if (stat.size < 1_000_000) {
      let sample = '';
      try {
        sample = await fsp.readFile(tmp, 'utf8');
      } catch {}

      throw new Error(
        `Downloaded file is suspiciously small: ${stat.size} bytes\n${sample.slice(
          0,
          300
        )}`
      );
    }

    await fsp.chmod(tmp, 0o755);
    await fsp.rename(tmp, TARGET);
    await fsp.chmod(TARGET, 0o755);

    console.log(`[yt-dlp] downloaded ${bytes} bytes`);
  } catch (err) {
    try {
      await fsp.unlink(tmp);
    } catch {}

    throw err;
  }
}

async function main() {
  if (!FORCE && (await binaryWorks(TARGET))) {
    return;
  }

  await downloadYtDlp();

  if (!(await binaryWorks(TARGET))) {
    throw new Error(`yt-dlp was downloaded but failed verification: ${TARGET}`);
  }
}

main().catch((err) => {
  console.error(`[yt-dlp] install failed`);
  console.error(err);
  process.exit(1);
});
