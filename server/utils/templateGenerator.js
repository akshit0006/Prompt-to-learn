const readable = (topic) =>
  topic
    .replace(/\s+/g, " ")
    .trim()
    .replace(/^./, (letter) => letter.toUpperCase());

export const createTemplateCourse = (topic) => {
  const titleTopic = readable(topic);
  const modules = [
    {
      title: `Foundations of ${titleTopic}`,
      summary: "Start with the vocabulary, mental models, and essential context.",
      lessons: ["What You Are Learning", "Core Concepts", "Common Misconceptions"]
    },
    {
      title: `${titleTopic} In Practice`,
      summary: "Turn theory into small, repeatable practice routines.",
      lessons: ["Tools and Setup", "Guided Walkthrough", "Practice Project"]
    },
    {
      title: `Applying ${titleTopic}`,
      summary: "Connect the topic to real scenarios, decisions, and next steps.",
      lessons: ["Real-World Use Cases", "Review and Assessment", "Where to Go Next"]
    }
  ];

  return {
    title: `${titleTopic}: Complete Beginner Course`,
    description: `A structured, practical course that helps learners understand ${titleTopic}, practice the core ideas, and build confidence through quizzes and guided activities.`,
    tags: [titleTopic, "beginner", "self-learning", "practice"],
    resourceList: [
      { label: "Khan Academy", url: "https://www.khanacademy.org/" },
      { label: "freeCodeCamp", url: "https://www.freecodecamp.org/news/" },
      { label: "MIT OpenCourseWare", url: "https://ocw.mit.edu/" }
    ],
    modules: modules.map((module) => ({
      title: module.title,
      summary: module.summary,
      lessons: module.lessons.map((lesson) => createTemplateLesson(titleTopic, module.title, lesson))
    }))
  };
};

export const createTemplateLesson = (courseTitle, moduleTitle, lessonTitle) => {
  const videoQuery = `${courseTitle} ${lessonTitle} tutorial`;
  const lessonKey = lessonTitle.toLowerCase();
  const includeCode = /react|javascript|python|code|program|web|api|hooks/i.test(courseTitle);
  const bodyBlocks = buildLessonBody(courseTitle, moduleTitle, lessonTitle, lessonKey);

  return {
    title: lessonTitle,
    objectives: [
      `Describe how "${lessonTitle}" fits inside ${moduleTitle}.`,
      `Use examples to explain the idea in ${courseTitle}.`,
      "Spot common mistakes before they become habits.",
      "Complete a quick knowledge check with confidence."
    ],
    content: [
      { type: "heading", text: lessonTitle },
      ...bodyBlocks,
      ...(includeCode ? [buildCodeBlock(courseTitle, lessonTitle)] : []),
      { type: "video", query: videoQuery },
      ...buildMcqs(courseTitle, lessonTitle)
    ],
    suggestedReadings: [
      { label: "Wikipedia overview", url: "https://www.wikipedia.org/" },
      { label: "Open educational resources", url: "https://www.oercommons.org/" }
    ],
    videoQuery
  };
};

const buildLessonBody = (courseTitle, moduleTitle, lessonTitle, lessonKey) => {
  if (lessonKey.includes("misconception")) {
    return [
      {
        type: "paragraph",
        text: `Misconceptions in ${courseTitle} usually happen when learners memorize a rule without understanding when it applies. This lesson separates useful shortcuts from ideas that can lead to wrong decisions.`
      },
      {
        type: "heading",
        text: "Mistake 1: Treating every rule as universal"
      },
      {
        type: "paragraph",
        text: `Many beginners assume a concept works the same way in every situation. In ${courseTitle}, context matters: the right choice depends on the goal, the inputs, and the tradeoffs.`
      },
      {
        type: "heading",
        text: "Mistake 2: Skipping the reason behind the pattern"
      },
      {
        type: "paragraph",
        text: "A pattern is easier to remember when you know the problem it solves. Before using a technique, ask what issue it prevents and what would go wrong without it."
      },
      {
        type: "heading",
        text: "How to correct the misconception"
      },
      {
        type: "paragraph",
        text: `Take one example from ${moduleTitle}, explain it in plain language, then change one condition and predict what should happen. This turns passive reading into real understanding.`
      }
    ];
  }

  if (lessonKey.includes("core concept")) {
    return [
      {
        type: "paragraph",
        text: `The core concepts of ${courseTitle} are the ideas you will reuse throughout the course. Learn the vocabulary first, then connect each term to a small example.`
      },
      {
        type: "heading",
        text: "What to focus on"
      },
      {
        type: "paragraph",
        text: "Focus on purpose, inputs, outputs, and constraints. If you can explain those four things, you can usually understand where the concept belongs."
      },
      {
        type: "heading",
        text: "Practice routine"
      },
      {
        type: "paragraph",
        text: "Write a three-line summary after each concept: what it means, why it matters, and one situation where you would use it."
      }
    ];
  }

  return [
    {
      type: "paragraph",
      text: `${lessonTitle} is an important step in learning ${courseTitle}. Start with the main idea, then connect it to examples you can recognize and repeat.`
    },
    {
      type: "heading",
      text: "Core explanation"
    },
    {
      type: "paragraph",
      text: `In this part of ${moduleTitle}, your goal is to understand the problem being solved, the terms used to describe it, and the choices a learner needs to make.`
    },
    {
      type: "paragraph",
      text: `For ${courseTitle}, avoid rushing into formulas or definitions. First ask what the idea represents, what information it uses, and how it helps you solve a real problem.`
    },
    {
      type: "heading",
      text: "Worked reading notes"
    },
    {
      type: "paragraph",
      text: `Read the lesson as a chain: definition, example, interpretation, and check. The definition tells you the rule, the example shows it in action, the interpretation explains why it matters, and the check confirms that you understood it.`
    },
    {
      type: "paragraph",
      text: `A useful example for ${courseTitle} should be small enough to inspect by hand. Write down the input, apply one step, and explain the result in a sentence before moving to the next step.`
    },
    {
      type: "heading",
      text: "Common learner mistakes"
    },
    {
      type: "paragraph",
      text: "The most common mistake is recognizing a term but not knowing when to use it. Build the habit of asking: what condition tells me this idea is relevant?"
    },
    {
      type: "heading",
      text: "Try it yourself"
    },
    {
      type: "paragraph",
      text: `Create a tiny example in your own words. Then write three bullets: what changed, what stayed the same, and what conclusion you can draw. If you cannot explain it simply, return to the definition and compare it with a concrete use case.`
    }
  ];
};

const buildCodeBlock = (courseTitle, lessonTitle) => ({
  type: "code",
  language: "javascript",
  text: `const topic = ${JSON.stringify(courseTitle)};\nconst lesson = ${JSON.stringify(lessonTitle)};\n\nfunction summarizeLearning(topic, lesson) {\n  return \`I am learning \${lesson} as part of \${topic}.\`;\n}\n\nconsole.log(summarizeLearning(topic, lesson));`
});

export const buildMcqs = (courseTitle, lessonTitle) => [
  {
    type: "mcq",
    question: `What is the best first step when studying ${lessonTitle}?`,
    options: ["Memorize random facts", "Understand the core idea", "Skip examples", "Avoid practice"],
    answer: 1,
    explanation: "The core idea gives the rest of the lesson a useful structure."
  },
  {
    type: "mcq",
    question: `How should examples be used in ${courseTitle}?`,
    options: ["As decoration only", "To test whether the concept makes sense", "Only after mastery", "Never"],
    answer: 1,
    explanation: "Examples reveal whether you can recognize and apply the concept."
  },
  {
    type: "mcq",
    question: "Why are short quizzes useful?",
    options: ["They replace learning", "They expose gaps early", "They make topics harder", "They remove the need to review"],
    answer: 1,
    explanation: "A quiz helps you see what needs another pass before moving ahead."
  },
  {
    type: "mcq",
    question: "What should you do after finishing this lesson?",
    options: ["Create a quick summary", "Forget the topic", "Avoid using it", "Delete your notes"],
    answer: 0,
    explanation: "A short summary helps convert passive reading into active understanding."
  }
];
