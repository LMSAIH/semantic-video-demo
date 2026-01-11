import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { performance } from "node:perf_hooks";

dotenv.config();

import { ensureDirectoryExists, getUploadDir } from "./utils/fileUtils";
import modelsRouter from "./routes/models";
import filesRouter from "./routes/files";
import analyzeRouter from "./routes/analyze";

const app = express();
const PORT = process.env.PORT || 3000;

// Create uploads directory if it doesn't exist
const uploadDir = getUploadDir(__dirname);
ensureDirectoryExists(uploadDir);

// Middleware
app.use(cors());
app.use(express.json());

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

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
