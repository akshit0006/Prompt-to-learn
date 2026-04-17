import { nanoid } from "nanoid";
import { supabase } from "../config/supabase.js";

const memoryCourses = [];

export const getCoursesForUser = async (creator) => {
  if (!supabase) {
    return memoryCourses
      .filter((course) => course.creator === creator)
      .map(({ modules, ...summary }) => ({
        ...summary,
        moduleCount: modules.length,
        lessonCount: modules.reduce((count, module) => count + module.lessons.length, 0)
      }));
  }

  const { data, error } = await supabase
    .from("courses")
    .select("id,title,description,tags,resource_list,created_at,updated_at,course_modules(id,lessons(id))")
    .eq("creator", creator)
    .order("created_at", { ascending: false });

  if (error) throw error;

  return data.map((course) => ({
    id: course.id,
    title: course.title,
    description: course.description,
    tags: course.tags || [],
    resourceList: course.resource_list || [],
    createdAt: course.created_at,
    updatedAt: course.updated_at,
    moduleCount: course.course_modules?.length || 0,
    lessonCount:
      course.course_modules?.reduce((count, module) => count + (module.lessons?.length || 0), 0) || 0
  }));
};

export const findCourseById = async (courseId, creator) => {
  if (!supabase) {
    return memoryCourses.find((course) => course.id === courseId && course.creator === creator) || null;
  }

  const { data, error } = await supabase
    .from("courses")
    .select(
      `
      id,title,description,creator,tags,resource_list,created_at,updated_at,
      course_modules(
        id,title,summary,position,
        lessons(id,title,objectives,content,suggested_readings,video_query,is_enriched,position)
      )
    `
    )
    .eq("id", courseId)
    .eq("creator", creator)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  return mapCourseRecord(data);
};

export const saveGeneratedCourse = async (generated, creator) => {
  if (!supabase) {
    const course = {
      id: nanoid(),
      creator,
      title: generated.title,
      description: generated.description,
      tags: generated.tags || [],
      resourceList: generated.resourceList || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      modules: generated.modules.map((module, moduleIndex) => ({
        id: nanoid(),
        title: module.title,
        summary: module.summary,
        position: moduleIndex,
        lessons: module.lessons.map((lesson, lessonIndex) => ({
          id: nanoid(),
          ...lesson,
          position: lessonIndex,
          isEnriched: true
        }))
      }))
    };

    memoryCourses.unshift(course);
    return course;
  }

  const { data: course, error: courseError } = await supabase
    .from("courses")
    .insert({
      title: generated.title,
      description: generated.description,
      creator,
      tags: generated.tags || [],
      resource_list: generated.resourceList || []
    })
    .select()
    .single();

  if (courseError) throw courseError;

  for (const [moduleIndex, module] of generated.modules.entries()) {
    const { data: moduleRecord, error: moduleError } = await supabase
      .from("course_modules")
      .insert({
        course_id: course.id,
        title: module.title,
        summary: module.summary,
        position: moduleIndex
      })
      .select()
      .single();

    if (moduleError) throw moduleError;

    const lessons = module.lessons.map((lesson, lessonIndex) => ({
      module_id: moduleRecord.id,
      title: lesson.title,
      objectives: lesson.objectives || [],
      content: lesson.content || [],
      suggested_readings: lesson.suggestedReadings || [],
      video_query: lesson.videoQuery,
      is_enriched: true,
      position: lessonIndex
    }));

    const { error: lessonError } = await supabase.from("lessons").insert(lessons);
    if (lessonError) throw lessonError;
  }

  return findCourseById(course.id, creator);
};

export const updateLessonAt = async (courseId, moduleIndex, lessonIndex, lesson, creator) => {
  const course = await findCourseById(courseId, creator);
  if (!course) return null;

  const targetLesson = course.modules[moduleIndex]?.lessons[lessonIndex];
  if (!targetLesson) return course;

  if (!supabase) {
    Object.assign(targetLesson, { ...lesson, isEnriched: true });
    course.updatedAt = new Date().toISOString();
    return course;
  }

  const { error } = await supabase
    .from("lessons")
    .update({
      title: lesson.title,
      objectives: lesson.objectives || [],
      content: lesson.content || [],
      suggested_readings: lesson.suggestedReadings || [],
      video_query: lesson.videoQuery,
      is_enriched: true
    })
    .eq("id", targetLesson.id);

  if (error) throw error;

  await supabase.from("courses").update({ updated_at: new Date().toISOString() }).eq("id", courseId);
  return findCourseById(courseId, creator);
};

const mapCourseRecord = (course) => ({
  id: course.id,
  creator: course.creator,
  title: course.title,
  description: course.description,
  tags: course.tags || [],
  resourceList: course.resource_list || [],
  createdAt: course.created_at,
  updatedAt: course.updated_at,
  modules: (course.course_modules || [])
    .sort((a, b) => a.position - b.position)
    .map((module) => ({
      id: module.id,
      title: module.title,
      summary: module.summary,
      position: module.position,
      lessons: (module.lessons || [])
        .sort((a, b) => a.position - b.position)
        .map((lesson) => ({
          id: lesson.id,
          title: lesson.title,
          objectives: lesson.objectives || [],
          content: lesson.content || [],
          suggestedReadings: lesson.suggested_readings || [],
          videoQuery: lesson.video_query,
          isEnriched: lesson.is_enriched,
          position: lesson.position
        }))
    }))
});
