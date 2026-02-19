import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { performance } from "node:perf_hooks";

dotenv.config();

import { ensureDirectoryExists, getUploadDir } from "./utils/fileUtils";
import "./db/database"; // Initialize database & run migrations on startup
import modelsRouter from "./routes/models";
import filesRouter from "./routes/files";
import analyzeRouter from "./routes/analyze";
import videosRouter from "./routes/videos";
import searchRouter from "./routes/search";
import composerRouter from "./routes/composer";
import { warmUpModel } from "./services/embeddingService";

const app = express();
const PORT = process.env.PORT || 3000;

// Create uploads directory if it doesn't exist
const uploadDir = getUploadDir(__dirname);
ensureDirectoryExists(uploadDir);

// Middleware
app.use(cors());
app.use(express.json());

// Serve uploaded files statically so the frontend can play videos by URL
app.use('/uploads', express.static(uploadDir));

app.use((req, res, next) => {

  const start = performance.now();

  res.on("finish", () => {
    const duration = performance.now() - start;
    console.log(
      `${req.method} ${req.originalUrl} - ${res.statusCode} - ${duration.toFixed(2)}ms`
    );
  });

  next(); 

});

app.use("/models", modelsRouter);
app.use("/files", filesRouter);
app.use("/analyze", analyzeRouter);
app.use("/videos", videosRouter);
app.use("/search", searchRouter);
app.use("/composer", composerRouter);

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  // Pre-warm the embedding model in the background
  warmUpModel();
});
