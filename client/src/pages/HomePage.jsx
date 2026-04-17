import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import CourseCard from "../components/CourseCard.jsx";
import ErrorMessage from "../components/ErrorMessage.jsx";
import LoadingSpinner from "../components/LoadingSpinner.jsx";
import PromptForm from "../components/PromptForm.jsx";
import { apiRequest } from "../utils/api.js";
import { useUnifiedAuth } from "../utils/useUnifiedAuth.js";

export default function HomePage() {
  const navigate = useNavigate();
  const { getAccessTokenSilently, isAuthenticated, loginWithRedirect } = useUnifiedAuth();
  const [courses, setCourses] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState("");

  const getToken = useCallback(async () => {
    try {
      return await getAccessTokenSilently();
    } catch (_err) {
      return null;
    }
  }, [getAccessTokenSilently]);

  useEffect(() => {
    let isMounted = true;

    const loadCourses = async () => {
      if (!isAuthenticated) return;
      setIsLoading(true);
      setError("");

      try {
        const token = await getToken();
        const payload = await apiRequest("/api/courses", { token });
        if (isMounted) setCourses(payload.courses || []);
      } catch (err) {
        if (isMounted) setError(err.message);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    loadCourses();
    return () => {
      isMounted = false;
    };
  }, [getToken, isAuthenticated]);

  const generateCourse = async (topic) => {
    if (!isAuthenticated) {
      await loginWithRedirect();
      return;
    }

    setIsGenerating(true);
    setError("");

    try {
      const token = await getToken();
      const payload = await apiRequest("/api/courses/generate", {
        method: "POST",
        token,
        body: { topic }
      });
      navigate(`/course/${payload.course.id}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="page-band">
      <section className="hero-grid">
        <div className="hero-copy">
          <p className="eyebrow">Prompt to syllabus</p>
          <h1>Turn any topic into a course you can actually follow.</h1>
          <p className="lead">
            Generate a structured learning path with objectives, readings, quizzes, videos,
            Hinglish explanations, and PDF downloads.
          </p>
        </div>
        <div className="tool-panel">
          <PromptForm onSubmit={generateCourse} isLoading={isGenerating} />
        </div>
      </section>

      <ErrorMessage message={error} />

      <section>
        <h2>Your Courses</h2>
        {isLoading ? (
          <LoadingSpinner label="Loading saved courses..." />
        ) : courses.length ? (
          <div className="course-grid">
            {courses.map((course) => (
              <CourseCard course={course} key={course.id} />
            ))}
          </div>
        ) : (
          <div className="message">No courses yet. Create one from the prompt above.</div>
        )}
      </section>
    </div>
  );
}
