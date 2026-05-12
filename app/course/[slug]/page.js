import Link from "next/link";
import { notFound } from "next/navigation";
import CourseShell from "../ui/course-shell";
import {
  getCourseData,
  getLessonBySlug,
  getModuleByNumber
} from "../../../lib/course-data";

export function generateStaticParams() {
  return getCourseData().lessons.map((lesson) => ({
    slug: lesson.slug
  }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const lesson = getLessonBySlug(slug);

  if (!lesson) {
    return {
      title: "Урок не найден"
    };
  }

  return {
    title: `Урок ${lesson.number}: ${lesson.title}`,
    description: `${lesson.moduleTitle}. Урок ${lesson.number} курса по инвестиционной недвижимости.`
  };
}

function LessonBlock({ block }) {
  if (block.type === "heading") {
    if (block.level === 2) {
      return <h2 dangerouslySetInnerHTML={{ __html: block.html }} />;
    }

    if (block.level === 3) {
      return <h3 dangerouslySetInnerHTML={{ __html: block.html }} />;
    }

    return <h4 dangerouslySetInnerHTML={{ __html: block.html }} />;
  }

  if (block.type === "paragraph") {
    return <p dangerouslySetInnerHTML={{ __html: block.html }} />;
  }

  if (block.type === "quote") {
    return <blockquote dangerouslySetInnerHTML={{ __html: block.html }} />;
  }

  if (block.type === "ordered-list") {
    return (
      <ol>
        {block.items.map((item, index) => (
          <li
            dangerouslySetInnerHTML={{ __html: item }}
            key={`${item}-${index}`}
          />
        ))}
      </ol>
    );
  }

  if (block.type === "unordered-list") {
    return (
      <ul>
        {block.items.map((item, index) => (
          <li
            dangerouslySetInnerHTML={{ __html: item }}
            key={`${item}-${index}`}
          />
        ))}
      </ul>
    );
  }

  if (block.type === "divider") {
    return <hr />;
  }

  return null;
}

export default async function LessonPage({ params }) {
  const { slug } = await params;
  const { modules } = getCourseData();
  const lesson = getLessonBySlug(slug);

  if (!lesson) {
    notFound();
  }

  const module = getModuleByNumber(lesson.moduleNumber);
  const progress = Math.round(
    (lesson.lessonPositionInModule / lesson.moduleLessonCount) * 100
  );

  return (
    <CourseShell
      modules={modules}
      activeLessonSlug={lesson.slug}
      activeModuleNumber={lesson.moduleNumber}
    >
      <article className="reader-page">
        <header className="lesson-header">
          <div className="lesson-breadcrumbs">
            <Link href="/course">Курс</Link>
            <span>/</span>
            <span>{module.title}</span>
          </div>
          <div className="lesson-kicker-row">
            <p className="reader-eyebrow">
              Модуль {module.number} • Урок {lesson.number}
            </p>
            <div className="lesson-sequence">
              <span>
                #{lesson.position} из {lesson.totalLessons}
              </span>
            </div>
          </div>
          <h1>{lesson.title}</h1>
          <p className="lesson-deck">{module.summary}</p>

          <div className="lesson-meta-grid">
            <div className="lesson-meta-card">
              <span>В модуле</span>
              <strong>
                {lesson.lessonPositionInModule} / {lesson.moduleLessonCount}
              </strong>
            </div>
            <div className="lesson-meta-card">
              <span>Прогресс модуля</span>
              <strong>{progress}%</strong>
            </div>
            <div className="lesson-meta-card lesson-progress-card">
              <span>Навигация по модулю</span>
              <div className="lesson-progress-bar" aria-hidden="true">
                <span style={{ width: `${progress}%` }} />
              </div>
            </div>
          </div>
        </header>

        <div className="reader-article-frame">
          <section className="reader-article">
            {lesson.blocks.map((block, index) => (
              <LessonBlock
                block={block}
                key={`${lesson.slug}-${block.type}-${index}`}
              />
            ))}
          </section>
        </div>

        <nav className="lesson-pager">
          <div>
            {lesson.prevLessonSlug ? (
              <Link href={`/course/${lesson.prevLessonSlug}`}>
                ← Предыдущий урок
              </Link>
            ) : null}
          </div>
          <div>
            {lesson.nextLessonSlug ? (
              <Link href={`/course/${lesson.nextLessonSlug}`}>
                Следующий урок →
              </Link>
            ) : null}
          </div>
        </nav>
      </article>
    </CourseShell>
  );
}
