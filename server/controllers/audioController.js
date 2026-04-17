import { createHinglishNarration } from "../services/audioService.js";

export const createHinglishAudio = async (req, res, next) => {
  try {
    const text = String(req.body?.text || "").trim();

    if (text.length < 20) {
      return res.status(400).json({
        error: "ValidationError",
        message: "Send at least 20 characters of lesson text."
      });
    }

    const narration = await createHinglishNarration(text);
    res.json(narration);
  } catch (err) {
    next(err);
  }
};
