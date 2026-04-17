import { Navigate, Route, Routes } from "react-router-dom";
import SidebarNavigation from "./components/SidebarNavigation.jsx";
import CoursePage from "./pages/CoursePage.jsx";
import HomePage from "./pages/HomePage.jsx";
import LessonPage from "./pages/LessonPage.jsx";
import { useUnifiedAuth } from "./utils/useUnifiedAuth.js";

export default function App() {
  const { isLoading } = useUnifiedAuth();

  if (isLoading) {
    return <div className="boot-screen">Preparing your learning space...</div>;
  }

  return (
    <div className="app-shell">
      <SidebarNavigation />
      <main className="main-panel">
        <Routes>
          <Route index element={<HomePage />} />
          <Route path="/course/:courseId" element={<CoursePage />} />
          <Route
            path="/courses/:courseId/module/:moduleIndex/lesson/:lessonIndex"
            element={<LessonPage />}
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}
