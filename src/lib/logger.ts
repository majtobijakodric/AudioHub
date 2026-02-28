import { mkdirSync, existsSync, readdirSync, appendFileSync } from 'node:fs';
import path from 'node:path';

// Directory where log files are stored.
const LOGS_DIR = path.resolve('logs');

// Ensure the logs directory exists.
if (!existsSync(LOGS_DIR)) {
    mkdirSync(LOGS_DIR, { recursive: true });
}

// Format a date into individual padded parts.
function dateParts(now = new Date()) {
    const pad = (n: number) => String(n).padStart(2, '0');
    return {
        year: now.getFullYear(),
        month: pad(now.getMonth() + 1),
        day: pad(now.getDate()),
        hours: pad(now.getHours()),
        minutes: pad(now.getMinutes()),
        seconds: pad(now.getSeconds()),
    };
}

// Build the log file name: log-{N}-{DD.MM.YYYY}-{HH.MM}.txt
function buildLogFileName(): string {
    const { year, month, day, hours, minutes } = dateParts();

    // Count existing log files to determine the next increment number.
    const existingFiles = readdirSync(LOGS_DIR).filter((f) => f.startsWith('log-') && f.endsWith('.txt'));
    const nextNumber = existingFiles.length;

    return `log-${nextNumber}-${day}.${month}.${year}-${hours}.${minutes}.txt`;
}

// Log file path for this server run.
const LOG_FILE = path.join(LOGS_DIR, buildLogFileName());

// Format a timestamp as YYYY-MM-DD HH:MM:SS.
function timestamp(): string {
    const { year, month, day, hours, minutes, seconds } = dateParts();
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

// Write a log line to both console and the log file.
function writeLine(level: string, message: string): void {
    const line = `[${level}] [${timestamp()}] ${message}`;
    console.log(line);
    appendFileSync(LOG_FILE, line + '\n');
}

// Log an info-level message.
function info(message: string): void {
    writeLine('INFO', message);
}

// Log an error-level message with optional error details.
function error(message: string, err?: unknown): void {
    const details = err instanceof Error ? `: ${err.message}` : err ? `: ${String(err)}` : '';
    writeLine('ERROR', message + details);
}

export const logger = { info, error };
