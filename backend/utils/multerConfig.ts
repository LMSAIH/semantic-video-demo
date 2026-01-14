import multer from 'multer';
import path from 'path';

/**
 * Configure multer storage for video uploads
 */
export function configureStorage(uploadDir: string): multer.StorageEngine {
  return multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      const originalName = path.parse(file.originalname).name; // Get name without extension
      const extension = path.extname(file.originalname);
      cb(null, `${originalName}-${uniqueSuffix}${extension}`);
    }
  });
}

/**
 * File filter to allow only video files
 */
export function videoFileFilter(
  req: Express.Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
): void {
  const allowedExtensions = /mp4|avi|mov|mkv|webm|wmv/;
  const allowedMimeTypes = /video\/(mp4|x-msvideo|avi|quicktime|x-matroska|webm|x-ms-wmv|x-ms-asf)/;
  
  const extname = allowedExtensions.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedMimeTypes.test(file.mimetype);
  
  if (extname && mimetype) {
    cb(null, true);
  } else {
    cb(new Error('Only video files are allowed!'));
  }
}

/**
 * Create configured multer instance for video uploads
 */
export function createVideoUploader(uploadDir: string): multer.Multer {
  const storage = configureStorage(uploadDir);
  
  // Get max file size from environment or use 200MB default
  const maxSizeMB = parseInt(process.env.MAX_VIDEO_SIZE_MB || '200', 10);
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  
  return multer({
    storage: storage,
    limits: { fileSize: maxSizeBytes }, 
    fileFilter: videoFileFilter
  });
}
