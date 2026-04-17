export const requireTopic = (req, res, next) => {
  const topic = String(req.body?.topic || "").trim();

  if (topic.length < 3) {
    return res.status(400).json({
      error: "ValidationError",
      message: "Enter a topic with at least 3 characters."
    });
  }

  if (topic.length > 160) {
    return res.status(400).json({
      error: "ValidationError",
      message: "Keep the topic under 160 characters."
    });
  }

  req.body.topic = topic;
  next();
};
