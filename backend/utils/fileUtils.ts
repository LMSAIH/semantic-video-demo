import fs from 'fs';
import path from 'path';

/**
 * Ensures a directory exists, creating it recursively if necessary
 */
export function ensureDirectoryExists(dirPath: string): void {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

/**
 * Checks if a file exists at the given path
 */
export function fileExists(filePath: string): boolean {
  return fs.existsSync(filePath);
}

/**
 * Gets file statistics (size, dates, etc.)
 */
export function getFileStats(filePath: string): fs.Stats {
  return fs.statSync(filePath);
}

/**
 * Creates a read stream for a file with optional byte range
 */
export function createFileReadStream(
  filePath: string,
  options?: { start?: number; end?: number }
): fs.ReadStream {
  return fs.createReadStream(filePath, options);
}

/**
 * Deletes a file if it exists
 */
export function deleteFile(filePath: string): void {
  if (fileExists(filePath)) {
    fs.unlinkSync(filePath);
  }
}

/**
 * Gets the upload directory path
 */
export function getUploadDir(baseDir: string): string {
  return path.join(baseDir, 'uploads');
}

/**
 * Gets the full path for an uploaded file
 */
export function getUploadedFilePath(baseDir: string, filename: string): string {
  return path.join(getUploadDir(baseDir), filename);
}
