import Link from "next/link";
import CourseShell from "./ui/course-shell";
import { getCourseData } from "../../lib/course-data";

export const metadata = {
  title: "Курс: оглавление",
  description: "Оглавление и навигация по курсу инвестиционной недвижимости."
};

export default function CourseIndexPage() {
  const { modules, lessons } = getCourseData();

  return (
    <CourseShell modules={modules}>
      <article className="reader-page reader-overview">
        <header className="reader-hero">
          <p className="reader-eyebrow">Программа курса</p>
          <h1>Полный курс по инвестиционной недвижимости</h1>
          <p className="reader-intro">
            Здесь собрана полная структура курса: модули, уроки и
            последовательное прохождение материалов от первого занятия до
            финальных тем.
          </p>
          <div className="reader-metrics">
            <div>
              <strong>{modules.length}</strong>
              <span>модулей</span>
            </div>
            <div>
              <strong>{lessons.length}</strong>
              <span>урока</span>
            </div>
            <div>
              <strong>10–14</strong>
              <span>часов с практикой</span>
            </div>
          </div>
          <div className="reader-actions">
            <Link
              className="button button-primary"
              href={`/course/${lessons[0].slug}`}
            >
              Начать с первого урока
            </Link>
          </div>
        </header>

        <section className="reader-summary-grid">
          {modules.map((module) => (
            <article className="reader-summary-card" key={module.id}>
              <span>Модуль {module.number}</span>
              <h2>{module.title}</h2>
              <p>{module.summary}</p>
              <div className="reader-summary-footer">
                <small>{module.lessonCount} уроков</small>
                <Link href={`/course/${module.firstLessonSlug}`}>
                  Читать модуль
                </Link>
              </div>
            </article>
          ))}
        </section>
      </article>
    </CourseShell>
  );
}
