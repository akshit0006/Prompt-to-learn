import { Router } from "express";
import { createHinglishAudio } from "../controllers/audioController.js";
import { attachUser } from "../middlewares/auth.js";

const router = Router();

router.use(attachUser);
router.post("/hinglish", createHinglishAudio);

export default router;
