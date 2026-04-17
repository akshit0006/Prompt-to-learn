export const notFoundHandler = (req, res) => {
  res.status(404).json({
    error: "Not found",
    message: `${req.method} ${req.originalUrl} is not available.`
  });
};

export const errorHandler = (err, _req, res, _next) => {
  const status = err.status || err.statusCode || 500;
  const message = status === 500 ? "Something went wrong." : err.message;

  if (status === 500) {
    console.error(err);
  }

  res.status(status).json({
    error: err.name || "ServerError",
    message
  });
};
