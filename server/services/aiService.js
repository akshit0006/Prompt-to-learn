import { GoogleGenAI } from "@google/genai";
import { env } from "../config/env.js";
import { parseJsonObject } from "../utils/safeJson.js";
import { buildMcqs, createTemplateCourse, createTemplateLesson } from "../utils/templateGenerator.js";

const ai = env.hasGemini ? new GoogleGenAI({ apiKey: env.geminiApiKey }) : null;

export const generateCourse = async (topic) => {
  if (!ai) {
    return createTemplateCourse(topic);
  }

  try {
    const response = await generateContentWithRetry({
      model: env.geminiModel,
      contents: [{ role: "user", parts: [{ text: buildCoursePrompt(topic) }] }],
      config: {
        responseMimeType: "application/json",
        temperature: 0.45
      }
    });

    return normalizeCourse(parseJsonObject(response.text), topic);
  } catch (err) {
    console.warn("Gemini course generation failed. Falling back to template.", err.message);
    return createTemplateCourse(topic);
  }
};

export const generateLesson = async (course, module, lessonTitle) => {
  if (!ai) {
    return createTemplateLesson(course.title, module.title, lessonTitle);
  }

  try {
    const response = await generateContentWithRetry({
      model: env.geminiModel,
      contents: [{ role: "user", parts: [{ text: buildLessonPrompt(course.title, module.title, lessonTitle) }] }],
      config: {
        responseMimeType: "application/json",
        temperature: 0.4
      }
    });

    return normalizeLesson(parseJsonObject(response.text), lessonTitle);
  } catch (err) {
    console.warn("Gemini lesson generation failed. Falling back to template.", err.message);
    return createTemplateLesson(course.title, module.title, lessonTitle);
  }
};

const buildCoursePrompt = (topic) => `
You are generating a complete online course for the topic: "${topic}".
Return raw JSON only. No markdown. No prose outside JSON.

Schema:
{
  "title": "string",
  "description": "string",
  "tags": ["string"],
  "resourceList": [{ "label": "string", "url": "https://..." }],
  "modules": [{
    "title": "string",
    "summary": "string",
    "lessons": [{
      "title": "string",
      "objectives": ["string"],
      "content": [
        { "type": "heading", "text": "string" },
        { "type": "paragraph", "text": "string" },
        { "type": "code", "language": "javascript", "text": "string" },
        { "type": "video", "query": "string" },
        { "type": "mcq", "question": "string", "options": ["string"], "answer": 0, "explanation": "string" }
      ],
      "suggestedReadings": [{ "label": "string", "url": "https://..." }],
      "videoQuery": "string"
    }]
  }]
}

Rules:
- Create exactly 3 modules.
- Each module must contain exactly 3 lessons.
- Make the course progress from beginner foundations to practical application.
- Each lesson must include 2 to 4 objectives.
- Each lesson must include 3 to 5 paragraph/heading blocks before quiz blocks.
- Include exactly 4 MCQs near the end of every lesson.
- Include a code block only when it is relevant.
- Use video search queries, not direct video URLs.
- Keep each lesson concise enough for a web app response.
- Prefer complete, useful reading material over long introductions.
`;

const buildLessonPrompt = (courseTitle, moduleTitle, lessonTitle) => `
Generate one detailed lesson for:
Course: "${courseTitle}"
Module: "${moduleTitle}"
Lesson: "${lessonTitle}"

Return raw JSON only. No markdown. No prose outside JSON.
Use this shape:
{
  "title": "string",
  "objectives": ["string"],
  "content": [
    { "type": "heading", "text": "string" },
    { "type": "paragraph", "text": "string" },
    { "type": "code", "language": "javascript", "text": "string" },
    { "type": "video", "query": "string" },
    { "type": "mcq", "question": "string", "options": ["string"], "answer": 0, "explanation": "string" }
  ],
  "suggestedReadings": [{ "label": "string", "url": "https://..." }],
  "videoQuery": "string"
}

Include 3 or 4 objectives and 4 or 5 MCQs. Use a zero-based answer index.
`;

const normalizeCourse = (course, fallbackTopic) => {
  const template = createTemplateCourse(fallbackTopic);
  const modules = Array.isArray(course.modules) && course.modules.length ? course.modules : template.modules;

  return {
    title: asText(course.title, template.title),
    description: asText(course.description, template.description),
    tags: asArray(course.tags, template.tags).slice(0, 8),
    resourceList: asResources(course.resourceList, template.resourceList),
    modules: modules.slice(0, 6).map((module, moduleIndex) => ({
      title: asText(module.title, template.modules[moduleIndex % template.modules.length].title),
      summary: asText(module.summary, "A focused section with practical learning steps."),
      lessons: asArray(module.lessons, template.modules[moduleIndex % template.modules.length].lessons)
        .slice(0, 5)
        .map((lesson, lessonIndex) =>
          normalizeLesson(
            typeof lesson === "string" ? { title: lesson } : lesson,
            template.modules[moduleIndex % template.modules.length].lessons[lessonIndex % 3].title
          )
        )
    }))
  };
};

const normalizeLesson = (lesson, fallbackTitle) => {
  const title = asText(lesson.title, fallbackTitle);
  const content = asArray(lesson.content, createTemplateLesson("Course", "Module", title).content)
    .map(normalizeBlock)
    .filter(Boolean);
  const videoQuery = asText(lesson.videoQuery, `${title} beginner tutorial`);
  const hasVideoBlock = content.some((block) => block.type === "video");
  const contentWithQuizzes = ensureQuizBlocks(content, title);

  return {
    title,
    objectives: asArray(lesson.objectives, [
      `Explain the purpose of ${title}.`,
      "Apply the core ideas in a small practice task."
    ]).slice(0, 5),
    content: hasVideoBlock
      ? contentWithQuizzes
      : [...contentWithQuizzes, { type: "video", query: videoQuery }],
    suggestedReadings: asResources(lesson.suggestedReadings, [
      { label: "MDN Web Docs", url: "https://developer.mozilla.org/" }
    ]),
    videoQuery
  };
};

const ensureQuizBlocks = (content, lessonTitle) => {
  const quizBlocks = content.filter((block) => block.type === "mcq");

  if (quizBlocks.length >= 4) {
    return content;
  }

  const fallbackQuizzes = buildMcqs("this course", lessonTitle).slice(quizBlocks.length, 4);
  return [...content, ...fallbackQuizzes];
};

const normalizeBlock = (block) => {
  if (!block || typeof block !== "object") return null;
  const type = asText(block.type, "paragraph");

  if (type === "mcq") {
    return {
      type,
      question: asText(block.question, "Which statement best matches the lesson?"),
      options: asArray(block.options, ["Option A", "Option B", "Option C"]).slice(0, 5),
      answer: Number.isInteger(block.answer) ? block.answer : 0,
      explanation: asText(block.explanation, "Review the lesson explanation for the reasoning.")
    };
  }

  if (type === "code") {
    return { type, language: asText(block.language, "javascript"), text: asText(block.text, "") };
  }

  if (type === "video") {
    return { type, query: asText(block.query || block.url, "beginner tutorial") };
  }

  return { type: type === "heading" ? "heading" : "paragraph", text: asText(block.text, "") };
};

const asText = (value, fallback) => {
  const text = typeof value === "string" ? value.trim() : "";
  return text || fallback;
};

const asArray = (value, fallback) => (Array.isArray(value) && value.length ? value : fallback);

const asResources = (value, fallback) =>
  asArray(value, fallback)
    .map((resource) => ({
      label: asText(resource?.label, "Learning resource"),
      url: asText(resource?.url, "https://developer.mozilla.org/")
    }))
    .slice(0, 8);

const generateContentWithRetry = async (request, attempts = 3) => {
  let lastError;

  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      return await ai.models.generateContent(request);
    } catch (err) {
      lastError = err;
      const message = `${err.message || ""} ${JSON.stringify(err.error || {})}`;
      const isRetryable = /503|UNAVAILABLE|overload|high demand|rate|temporar/i.test(message);

      if (!isRetryable || attempt === attempts) {
        throw err;
      }

      await wait(900 * attempt);
    }
  }

  throw lastError;
};

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
