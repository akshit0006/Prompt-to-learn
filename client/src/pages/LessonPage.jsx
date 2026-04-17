import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import ErrorMessage from "../components/ErrorMessage.jsx";
import HinglishAudioPlayer from "../components/HinglishAudioPlayer.jsx";
import LessonPDFExporter from "../components/LessonPDFExporter.jsx";
import LessonRenderer from "../components/LessonRenderer.jsx";
import LoadingSpinner from "../components/LoadingSpinner.jsx";
import { apiRequest } from "../utils/api.js";
import { useUnifiedAuth } from "../utils/useUnifiedAuth.js";

export default function LessonPage() {
  const { courseId, moduleIndex, lessonIndex } = useParams();
  const { getAccessTokenSilently } = useUnifiedAuth();
  const lessonRef = useRef(null);
  const [course, setCourse] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState("");

  const getToken = useCallback(async () => {
    try {
      return await getAccessTokenSilently();
    } catch (_err) {
      return null;
    }
  }, [getAccessTokenSilently]);

  const loadCourse = useCallback(async () => {
    setError("");
    const token = await getToken();
    const payload = await apiRequest(`/api/courses/${courseId}`, { token });
    setCourse(payload.course);
  }, [courseId, getToken]);

  useEffect(() => {
    let isMounted = true;

    const run = async () => {
      setIsLoading(true);
      try {
        await loadCourse();
      } catch (err) {
        if (isMounted) setError(err.message);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    run();
    return () => {
      isMounted = false;
    };
  }, [loadCourse]);

  const refreshLesson = async () => {
    setIsRefreshing(true);
    setError("");

    try {
      const token = await getToken();
      const payload = await apiRequest(
        `/api/courses/${courseId}/modules/${moduleIndex}/lessons/${lessonIndex}/refresh`,
        { method: "POST", token }
      );
      setCourse(payload.course);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsRefreshing(false);
    }
  };

  if (isLoading) return <LoadingSpinner label="Loading lesson..." />;
  if (error && !course) return <ErrorMessage message={error} />;

  const module = course.modules[Number(moduleIndex)];
  const lesson = module?.lessons[Number(lessonIndex)];

  if (!lesson) return <ErrorMessage message="Lesson not found." />;

  return (
    <div className="page-band">
      <Link className="nav-link" to={`/course/${course.id}`}>
        Back to course
      </Link>

      <ErrorMessage message={error} />

      <article className="lesson-panel pdf-surface" ref={lessonRef}>
        <header className="lesson-header">
          <div>
            <p className="eyebrow">{module.title}</p>
            <h1>{lesson.title}</h1>
          </div>
          <div className="button-row">
            <LessonPDFExporter targetRef={lessonRef} fileName={lesson.title.replace(/\W+/g, "-")} />
            <button className="action-button alt" onClick={refreshLesson} disabled={isRefreshing}>
              {isRefreshing ? "Refreshing..." : "Regenerate lesson"}
            </button>
          </div>
        </header>

        <section className="objectives">
          <h3>Objectives</h3>
          <ul>
            {(lesson.objectives || []).map((objective) => (
              <li key={objective}>{objective}</li>
            ))}
          </ul>
        </section>

        <HinglishAudioPlayer lesson={lesson} getToken={getToken} />
        <LessonRenderer content={lesson.content} getToken={getToken} />

        <section className="readings">
          <h3>Suggested readings</h3>
          {(lesson.suggestedReadings || []).map((resource) => (
            <p key={resource.url}>
              <a href={resource.url} target="_blank" rel="noreferrer">
                {resource.label}
              </a>
            </p>
          ))}
        </section>
      </article>
    </div>
  );
}
