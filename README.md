# Text-to-Learn

Text-to-Learn is a full-stack course generator that turns a free-form topic into a navigable online course with modules, lessons, objectives, readings, quizzes, YouTube video suggestions, Hinglish narration, and PDF lesson export.

## Stack

- Frontend: React, Vite, React Router, Auth0 React SDK, jsPDF, html2canvas
- Backend: Node.js, Express, JavaScript
- Database: PostgreSQL through Supabase
- AI: Gemini for JSON course generation and Hinglish audio
- Video: YouTube Data API v3
- Auth: Auth0 JWT validation on the backend, Auth0 React SDK on the frontend

## Project Structure

```text
project-root/
+-- client/
|   +-- src/
|   |   +-- components/
|   |   +-- pages/
|   |   +-- utils/
|   |   +-- App.jsx
|   +-- package.json
+-- server/
|   +-- config/
|   +-- controllers/
|   +-- middlewares/
|   +-- routes/
|   +-- services/
|   +-- supabase/
|   +-- utils/
|   +-- server.js
+-- package.json
```

## API Keys And Environment Variables

Create `server/.env` from `server/.env.example`:

```bash
PORT=5000
CLIENT_ORIGIN=http://localhost:5173

SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

AUTH0_ISSUER_BASE_URL=https://your-tenant.us.auth0.com/
AUTH0_AUDIENCE=https://text-to-learn-api

GEMINI_API_KEY=your_google_gemini_api_key
GEMINI_MODEL=gemini-2.5-flash
GEMINI_TTS_MODEL=gemini-2.5-flash-preview-tts

YOUTUBE_API_KEY=your_youtube_data_api_key
```

Create `client/.env` from `client/.env.example`:

```bash
VITE_API_URL=http://localhost:5000
VITE_AUTH0_DOMAIN=your-tenant.us.auth0.com
VITE_AUTH0_CLIENT_ID=your_auth0_spa_client_id
VITE_AUTH0_AUDIENCE=https://text-to-learn-api
```

Required for production:

- `SUPABASE_URL`: your Supabase project URL.
- `SUPABASE_SERVICE_ROLE_KEY`: backend-only key for secure Postgres writes.
- `AUTH0_ISSUER_BASE_URL`: Auth0 tenant issuer URL.
- `AUTH0_AUDIENCE`: Auth0 API identifier used by frontend and backend.
- `VITE_AUTH0_DOMAIN`: Auth0 tenant domain for the React app.
- `VITE_AUTH0_CLIENT_ID`: Auth0 single-page application client id.
- `VITE_AUTH0_AUDIENCE`: same audience as the backend.
- `GEMINI_API_KEY`: Google AI Studio/Gemini key for course generation, translation, and TTS.
- `YOUTUBE_API_KEY`: YouTube Data API v3 key for lesson video lookup.

Optional:

- `GEMINI_MODEL`: defaults to `gemini-2.5-flash`.
- `GEMINI_TTS_MODEL`: defaults to `gemini-2.5-flash-preview-tts`.
- `CLIENT_ORIGIN`: frontend URL for CORS.

The app can run locally without provider keys. It falls back to demo auth, an in-memory store, template-generated courses, and video search links. For real persistence, Auth0 protection, AI generation, YouTube embeds, and Hinglish audio, provide the keys above.

## Supabase Setup

1. Create a Supabase project.
2. Open the SQL editor.
3. Run `server/supabase/schema.sql`.
4. Copy the project URL and service role key into `server/.env`.

The browser never receives the Supabase service role key. All writes go through the Express API after Auth0 token validation.

## Local Development

```bash
npm run install:all
npm run dev
```

Frontend: `http://localhost:5173`

Backend: `http://localhost:5000`

## Main Flows

1. User signs in with Auth0 or uses local demo mode when Auth0 env vars are absent.
2. User enters a topic such as "Intro to React Hooks".
3. Backend asks Gemini for strict JSON. If Gemini is unavailable, the rule-based generator creates a complete course.
4. Backend stores the course, modules, and lessons in Supabase/Postgres.
5. Frontend renders a course overview, module navigation, structured lesson blocks, quizzes, video embeds, Hinglish audio, and PDF export.

## Deployment

### Render Backend

- Root directory: `server`
- Build command: `npm install`
- Start command: `npm start`
- Add all `server/.env.example` variables in Render.

### Vercel Frontend

- Root directory: `client`
- Build command: `npm run build`
- Output directory: `dist`
- Add all `client/.env.example` variables in Vercel.

Set `VITE_API_URL` to the Render backend URL and `CLIENT_ORIGIN` to the Vercel frontend URL.
