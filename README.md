# Text-to-Learn: AI-Powered Course Generator

Text-to-Learn is a full-stack AI-powered learning platform that converts any topic prompt into a structured online course. Users can enter a topic such as **"Intro to React Hooks"**, **"Linear Algebra"**, or **"Basics of Copyright Law"**, and the app generates a complete course with modules, lessons, objectives, reading material, quizzes, video resources, Hinglish explanations, and PDF export support.

---

## Live Demo

Frontend: [https://prompt-to-learn.vercel.app](https://prompt-to-learn.vercel.app)

Backend Health Check: [https://prompt-to-learn.onrender.com/health](https://prompt-to-learn.onrender.com/health)

GitHub Repository: [https://github.com/akshit0006/Prompt-to-learn](https://github.com/akshit0006/Prompt-to-learn)

---

## Project Overview

Text-to-Learn solves a common learning problem: when someone wants to learn a new topic, they often spend more time searching for resources than actually learning. This application generates a structured learning path instantly.

The app takes a simple text prompt and produces:

- A course title and description
- Multiple modules
- Lessons inside each module
- Lesson objectives
- Reading material
- Interactive quizzes
- YouTube video resources
- Hinglish explanation support
- PDF lesson download
- User-specific saved courses

The project is built as a complete full-stack application with authentication, AI integration, database persistence, and cloud deployment.

---

## Key Features

### AI Course Generation

Users enter any topic, and the backend uses Gemini AI to generate a structured course.

Each generated course includes:

- Course title
- Course description
- Tags
- Resource list
- Modules
- Lessons
- Objectives
- Reading content
- Quizzes
- Video search queries

The backend normalizes AI output into a consistent JSON structure so the frontend can render every lesson reliably.

---

### Structured Lesson Rendering

Lessons are rendered dynamically from JSON blocks.

Supported lesson blocks include:

- Headings
- Paragraphs
- Code blocks
- YouTube video blocks
- Multiple-choice questions
- Suggested readings

This makes the lesson system flexible and scalable.

---

### Interactive Quizzes

Each lesson includes multiple-choice questions. Users can select answers and receive immediate visual feedback.

The backend also ensures quiz blocks are always present, even if the AI response misses them.

---

### YouTube Video Integration

The application integrates with the YouTube Data API v3 to fetch relevant educational videos for lessons.

If a direct video embed is unavailable, the frontend displays a YouTube search fallback link.

---

### Hinglish Explanation Support

Users can generate a simplified Hinglish explanation of lesson content.

The backend uses Gemini for:

- English-to-Hinglish explanation
- Text-to-speech narration support

If audio generation is unavailable, the app still returns the Hinglish transcript.

---

### PDF Lesson Export

Lessons can be downloaded as PDFs for offline learning.

The frontend uses:

- `html2canvas`
- `jsPDF`

This allows students to save lesson content locally.

---

### Authentication With Auth0

The app uses Auth0 for secure login and protected backend routes.

Authentication enables:

- User login/logout
- Protected API access
- User-specific saved courses
- Secure token-based requests

---

### Persistent Storage With Supabase/PostgreSQL

Courses are stored in Supabase using PostgreSQL.

The database stores:

- Courses
- Modules
- Lessons
- Lesson content
- Video cache
- User ownership through Auth0 user IDs

---

### Production Deployment

The project is deployed using:

- Vercel for the React frontend
- Render for the Express backend
- Supabase for PostgreSQL database
- Auth0 for authentication

---

## Tech Stack

### Frontend

- React
- Vite
- React Router
- JavaScript
- CSS
- Auth0 React SDK
- jsPDF
- html2canvas

### Backend

- Node.js
- Express.js
- JavaScript
- Auth0 JWT middleware
- Supabase client
- Gemini API
- YouTube Data API v3

### Database

- Supabase
- PostgreSQL

### Deployment

- Vercel
- Render
- Supabase Cloud
- Auth0

---

## System Architecture

```text
User
 |
 | enters topic prompt
 v
React Frontend
 |
 | authenticated API request
 v
Express Backend
 |
 | calls Gemini AI
 | calls YouTube API
 | stores generated data
 v
Supabase PostgreSQL
 |
 | returns saved course data
 v
React Lesson Renderer
