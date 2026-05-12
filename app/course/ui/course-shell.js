import Link from "next/link";

export default function CourseShell({
  modules,
  activeLessonSlug,
  activeModuleNumber,
  children
}) {
  const totalLessons = modules.reduce(
    (sum, module) => sum + module.lessonCount,
    0
  );

  return (
    <div className="reader-shell">
      <aside className="reader-sidebar">
        <div className="reader-sidebar-inner">
          <div className="reader-sidebar-top">
            <Link className="reader-back-link" href="/">
              На лендинг
            </Link>
            <div className="reader-sidebar-brand">
              <span className="reader-sidebar-kicker">Курс</span>
              <h2>Инвестиционная недвижимость в России</h2>
              <p>
                Полная программа курса с последовательной навигацией по
                модулям и урокам.
              </p>
            </div>

            <div className="reader-sidebar-stats">
              <div>
                <strong>{modules.length}</strong>
                <span>модулей</span>
              </div>
              <div>
                <strong>{totalLessons}</strong>
                <span>урока</span>
              </div>
            </div>
          </div>

          <Link
            className={`reader-overview-link ${
              activeLessonSlug ? "" : "is-active"
            }`}
            href="/course"
          >
            <span>Оглавление</span>
            <strong>Структура курса</strong>
          </Link>

          <div className="reader-module-list">
            {modules.map((module) => (
              <section
                className={`reader-module ${
                  module.number === activeModuleNumber ? "is-current" : ""
                }`}
                key={module.id}
              >
                <div className="reader-module-heading">
                  <span>M{module.number}</span>
                  <h3>{module.title}</h3>
                  <p>{module.lessonCount} уроков</p>
                </div>
                <ul className="reader-lesson-list">
                  {module.lessons.map((lesson) => (
                    <li key={lesson.slug}>
                      <Link
                        className={`reader-lesson-link ${
                          activeLessonSlug === lesson.slug ? "is-active" : ""
                        }`}
                        href={`/course/${lesson.slug}`}
                      >
                        <span>Урок {lesson.number}</span>
                        <strong>{lesson.title}</strong>
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
        </div>
      </aside>

      <main className="reader-main">{children}</main>
    </div>
  );
}
