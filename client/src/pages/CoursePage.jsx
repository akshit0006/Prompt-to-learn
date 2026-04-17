import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import ErrorMessage from "../components/ErrorMessage.jsx";
import LoadingSpinner from "../components/LoadingSpinner.jsx";
import { apiRequest } from "../utils/api.js";
import { useUnifiedAuth } from "../utils/useUnifiedAuth.js";

export default function CoursePage() {
  const { courseId } = useParams();
  const { getAccessTokenSilently } = useUnifiedAuth();
  const [course, setCourse] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
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

    const loadCourse = async () => {
      setIsLoading(true);
      setError("");

      try {
        const token = await getToken();
        const payload = await apiRequest(`/api/courses/${courseId}`, { token });
        if (isMounted) setCourse(payload.course);
      } catch (err) {
        if (isMounted) setError(err.message);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    loadCourse();
    return () => {
      isMounted = false;
    };
  }, [courseId, getToken]);

  if (isLoading) return <LoadingSpinner label="Opening course..." />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <div className="page-band">
      <section className="course-layout">
        <div>
          <p className="eyebrow">Course overview</p>
          <h1>{course.title}</h1>
          <p className="lead">{course.description}</p>
          <div className="tag-row">
            {(course.tags || []).map((tag) => (
              <span className="tag" key={tag}>
                {tag}
              </span>
            ))}
          </div>
          <div className="readings">
            <h3>Resource list</h3>
            {(course.resourceList || []).map((resource) => (
              <p key={resource.url}>
                <a href={resource.url} target="_blank" rel="noreferrer">
                  {resource.label}
                </a>
              </p>
            ))}
          </div>
        </div>

        <div className="module-list">
          {course.modules.map((module, moduleIndex) => (
            <article className="module-row" key={module.id || module.title}>
              <h2>{module.title}</h2>
              <p className="muted">{module.summary}</p>
              {module.lessons.map((lesson, lessonIndex) => (
                <Link
                  className="lesson-link"
                  key={lesson.id || lesson.title}
                  to={`/courses/${course.id}/module/${moduleIndex}/lesson/${lessonIndex}`}
                >
                  {lessonIndex + 1}. {lesson.title}
                </Link>
              ))}
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
