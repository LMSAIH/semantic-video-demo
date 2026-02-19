import { Router } from "express";
import {
  listVideos,
  getVideo,
  createVideo,
  updateVideo,
  removeVideo,
} from "../controllers/videosController";

const router = Router();

router.get("/", listVideos);
router.get("/:id", getVideo);
router.post("/", createVideo);
router.patch("/:id", updateVideo);
router.delete("/:id", removeVideo);

export default router;
