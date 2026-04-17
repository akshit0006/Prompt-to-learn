import { Router } from "express";
import {
  createCourse,
  getCourse,
  listCourses,
  refreshLesson
} from "../controllers/courseController.js";
import { attachUser } from "../middlewares/auth.js";
import { requireTopic } from "../middlewares/validate.js";

const router = Router();

router.use(attachUser);

router.get("/", listCourses);
router.post("/generate", requireTopic, createCourse);
router.get("/:courseId", getCourse);
router.post("/:courseId/modules/:moduleIndex/lessons/:lessonIndex/refresh", refreshLesson);

export default router;
