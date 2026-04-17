import { Link } from "react-router-dom";

export default function CourseCard({ course }) {
  return (
    <article className="course-card">
      <div>
        <h3>{course.title}</h3>
        <p className="muted">{course.description}</p>
      </div>
      <div className="tag-row">
        {(course.tags || []).slice(0, 4).map((tag) => (
          <span className="tag" key={tag}>
            {tag}
          </span>
        ))}
      </div>
      <p className="muted">
        {course.moduleCount ?? course.modules?.length ?? 0} modules -{" "}
        {course.lessonCount ??
          course.modules?.reduce((count, module) => count + module.lessons.length, 0) ??
          0}{" "}
        lessons
      </p>
      <Link className="action-button alt" to={`/course/${course.id}`}>
        Open course
      </Link>
    </article>
  );
}
