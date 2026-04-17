import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import { env } from "./config/env.js";
import { errorHandler, notFoundHandler } from "./middlewares/errorHandler.js";
import audioRoutes from "./routes/audioRoutes.js";
import courseRoutes from "./routes/courseRoutes.js";
import youtubeRoutes from "./routes/youtubeRoutes.js";

const app = express();

app.use(helmet());
app.use(
  cors({
    origin: env.clientOrigin,
    credentials: true
  })
);
app.use(express.json({ limit: "2mb" }));
app.use(morgan(env.nodeEnv === "production" ? "combined" : "dev"));

app.get("/health", (_req, res) => {
  res.json({
    status: "ok",
    storage: env.hasSupabase ? "supabase" : "memory",
    ai: env.hasGemini ? "gemini" : "template",
    auth: env.hasAuth0 ? "auth0" : "demo"
  });
});

app.use("/api/courses", courseRoutes);
app.use("/api/youtube", youtubeRoutes);
app.use("/api/audio", audioRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

app.listen(env.port, () => {
  console.log(`Text-to-Learn API listening on http://localhost:${env.port}`);
});
