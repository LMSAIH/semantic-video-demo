import { Router } from "express";
import { createVideoUploader } from "../utils/multerConfig";
import { getUploadDir, ensureDirectoryExists } from "../utils/fileUtils";
import { uploadMiddleware, uploadFiles } from "../controllers/filesController";
import path from "path";

const router = Router();
const uploadDir = getUploadDir(path.join(__dirname, ".."));
ensureDirectoryExists(uploadDir);


// Upload one or multiple video files
router.post("/upload", uploadMiddleware, uploadFiles);
export default router;
