import dotenv from "dotenv";

dotenv.config();

const clean = (value) => (value || "").trim();

export const env = {
  nodeEnv: clean(process.env.NODE_ENV) || "development",
  port: Number(process.env.PORT || 5000),
  clientOrigin: clean(process.env.CLIENT_ORIGIN) || "http://localhost:5173",
  supabaseUrl: clean(process.env.SUPABASE_URL),
  supabaseServiceRoleKey: clean(process.env.SUPABASE_SERVICE_ROLE_KEY),
  auth0IssuerBaseUrl: clean(process.env.AUTH0_ISSUER_BASE_URL),
  auth0Audience: clean(process.env.AUTH0_AUDIENCE),
  geminiApiKey: clean(process.env.GEMINI_API_KEY),
  geminiModel: clean(process.env.GEMINI_MODEL) || "gemini-2.5-flash",
  geminiTtsModel: clean(process.env.GEMINI_TTS_MODEL) || "gemini-2.5-flash-preview-tts",
  youtubeApiKey: clean(process.env.YOUTUBE_API_KEY)
};

env.hasSupabase = Boolean(env.supabaseUrl && env.supabaseServiceRoleKey);
env.hasAuth0 = Boolean(env.auth0IssuerBaseUrl && env.auth0Audience);
env.hasGemini = Boolean(env.geminiApiKey);
env.hasYouTube = Boolean(env.youtubeApiKey);
