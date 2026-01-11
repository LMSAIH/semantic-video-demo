import { Router } from "express";
import { createVideoUploader } from "../utils/multerConfig";
import { getUploadDir, ensureDirectoryExists } from "../utils/fileUtils";
import { uploadMiddleware, uploadFiles } from "../controllers/filesController";
import path from "path";

const router = Router();
const uploadDir = getUploadDir(path.join(__dirname, ".."));
ensureDirectoryExists(uploadDir);
const upload = createVideoUploader(uploadDir);

// Maximum number of files that can be uploaded at once
const MAX_FILES_PER_REQUEST = parseInt(
  process.env.MAX_FILES_PER_REQUEST || "5"
);

// Upload one or multiple video files
router.post("/upload", uploadMiddleware, uploadFiles);
export default router;
