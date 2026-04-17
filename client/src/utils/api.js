const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export const apiRequest = async (path, { method = "GET", body, token } = {}) => {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    },
    body: body ? JSON.stringify(body) : undefined
  });

  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(payload.message || "Request failed.");
  }

  return payload;
};

export const flattenLessonText = (lesson) =>
  [
    lesson.title,
    ...(lesson.objectives || []),
    ...(lesson.content || []).map((block) => {
      if (block.type === "mcq") {
        return `${block.question} ${block.options?.join(" ")} ${block.explanation || ""}`;
      }
      return block.text || block.query || "";
    })
  ]
    .filter(Boolean)
    .join("\n\n");
