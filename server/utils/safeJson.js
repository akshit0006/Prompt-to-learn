export const parseJsonObject = (raw) => {
  if (!raw || typeof raw !== "string") {
    throw new Error("AI response was empty.");
  }

  const trimmed = raw.trim();

  try {
    return JSON.parse(trimmed);
  } catch (_err) {
    const start = trimmed.indexOf("{");
    const end = trimmed.lastIndexOf("}");

    if (start === -1 || end === -1 || end <= start) {
      throw new Error("AI response did not contain JSON.");
    }

    return JSON.parse(trimmed.slice(start, end + 1));
  }
};
