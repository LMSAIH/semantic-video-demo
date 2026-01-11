import { Request, Response, NextFunction } from "express";
import { getUploadDir, ensureDirectoryExists } from "../utils/fileUtils";
import { createVideoUploader } from "../utils/multerConfig";

import path from "path";

const uploadDir = getUploadDir(path.join(__dirname, '..'));
const upload = createVideoUploader(uploadDir);
const MAX_FILES_PER_REQUEST = parseInt(
  process.env.MAX_FILES_PER_REQUEST || "5"
);

export const uploadMiddleware = (req: Request, res: Response, next: NextFunction) => {
    ensureDirectoryExists(uploadDir);
    
    const uploadHandler = upload.array("videos", MAX_FILES_PER_REQUEST);
    uploadHandler(req, res, (err) => {
      if (err) {
  
        if (err.code === "LIMIT_UNEXPECTED_FILE") {
          return res.status(400).json({ 
            error: `Too many files. Maximum ${MAX_FILES_PER_REQUEST} files allowed`
          });
        }
        
        return res.status(400).json({ 
          error: err.message
        });
      }
      next();
    });
  }

export const uploadFiles = async (req: Request, res: Response) => {
  try {
    if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
      return res.status(400).json({ 
        error: "No files uploaded",
        hint: "Use field name 'videos' in form-data and select video files"
      });
    }

    const uploadedFiles = req.files.map((file) => ({
      filename: file.filename,
      path: file.path,
      size: file.size,
      originalName: file.originalname,
    }));

    res.json({
      message: uploadedFiles.length === 1 
        ? "Video uploaded successfully" 
        : `${uploadedFiles.length} videos uploaded successfully`,
      count: uploadedFiles.length,
      maxAllowed: MAX_FILES_PER_REQUEST,
      files: uploadedFiles,
    });
  } catch (error: any) {
    console.error("Upload processing error:", error);
    res.status(500).json({
      error: "Error processing uploaded videos",
      details: error.message,
    });
  }
};
