import { Router } from "express";
import { getVideos } from "../controllers/youtubeController.js";
import { attachUser } from "../middlewares/auth.js";

const router = Router();

router.use(attachUser);
router.get("/", getVideos);

export default router;
