import { searchVideos } from "../services/youtubeService.js";

export const getVideos = async (req, res, next) => {
  try {
    const query = String(req.query.query || "").trim();

    if (!query) {
      return res.status(400).json({
        error: "ValidationError",
        message: "A query parameter is required."
      });
    }

    const videos = await searchVideos(query);
    res.json({ videos });
  } catch (err) {
    next(err);
  }
};
