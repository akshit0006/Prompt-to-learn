import { generateCourse, generateLesson } from "../services/aiService.js";
import {
  findCourseById,
  getCoursesForUser,
  saveGeneratedCourse,
  updateLessonAt
} from "../services/courseRepository.js";

export const listCourses = async (req, res, next) => {
  try {
    const courses = await getCoursesForUser(req.user.sub);
    res.json({ courses });
  } catch (err) {
    next(err);
  }
};

export const createCourse = async (req, res, next) => {
  try {
    const generated = await generateCourse(req.body.topic);
    const course = await saveGeneratedCourse(generated, req.user.sub);
    res.status(201).json({ course });
  } catch (err) {
    next(err);
  }
};

export const getCourse = async (req, res, next) => {
  try {
    const course = await findCourseById(req.params.courseId, req.user.sub);

    if (!course) {
      return res.status(404).json({
        error: "NotFound",
        message: "Course not found."
      });
    }

    res.json({ course });
  } catch (err) {
    next(err);
  }
};

export const refreshLesson = async (req, res, next) => {
  try {
    const course = await findCourseById(req.params.courseId, req.user.sub);

    if (!course) {
      return res.status(404).json({
        error: "NotFound",
        message: "Course not found."
      });
    }

    const moduleIndex = Number(req.params.moduleIndex);
    const lessonIndex = Number(req.params.lessonIndex);
    const module = course.modules?.[moduleIndex];
    const lesson = module?.lessons?.[lessonIndex];

    if (!module || !lesson) {
      return res.status(404).json({
        error: "NotFound",
        message: "Lesson not found."
      });
    }

    const refreshedLesson = await generateLesson(course, module, lesson.title);
    const updated = await updateLessonAt(course.id, moduleIndex, lessonIndex, refreshedLesson, req.user.sub);
    res.json({ course: updated });
  } catch (err) {
    next(err);
  }
};
