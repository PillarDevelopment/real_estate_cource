import fs from "node:fs";
import path from "node:path";
import { cache } from "react";

const courseFilePath = path.join(
  process.cwd(),
  "final_real_estate_course_full.md"
);

const moduleMeta = [
  {
    number: 1,
    id: "module-1",
    title: "База рынка и роль инвестиционного советника",
    summary:
      "Понятийный каркас рынка, классы активов, роли участников, риск-профиль инвестора и базовая коммуникация."
  },
  {
    number: 2,
    id: "module-2",
    title: "Финансовый анализ и инвестиционное моделирование",
    summary:
      "Метрики, финансовая модель, сценарный анализ и проверка гипотез без псевдонауки и рекламной упаковки."
  },
  {
    number: 3,
    id: "module-3",
    title: "Продукты инвестиционной недвижимости и их продажа",
    summary:
      "Разбор продуктовых классов через экономику, риск, ликвидность и соответствие типу инвестора."
  },
  {
    number: 4,
    id: "module-4",
    title: "Работа с инвестором на всем жизненном цикле",
    summary:
      "Сопровождение клиента от первого контакта до выхода из проекта, ожидания, психология и доверие."
  },
  {
    number: 5,
    id: "module-5",
    title: "Зарубежная недвижимость и дополнительные направления",
    summary:
      "Сравнительный анализ зарубежных активов, валютного риска, юрисдикции и реальной функции такого продукта для клиента."
  },
  {
    number: 6,
    id: "module-6",
    title: "Продвижение услуг советника и монетизация экспертизы",
    summary:
      "Позиционирование, линейка услуг, воронка, бренд и коммерциализация advisory-практики."
  }
];

const moduleRanges = [
  { number: 1, start: 1, end: 8 },
  { number: 2, start: 9, end: 19 },
  { number: 3, start: 20, end: 29 },
  { number: 4, start: 30, end: 36 },
  { number: 5, start: 37, end: 44 },
  { number: 6, start: 45, end: 52 }
];

function getModuleNumberByLesson(lessonNumber) {
  return (
    moduleRanges.find(
      ({ start, end }) => lessonNumber >= start && lessonNumber <= end
    )?.number ?? null
  );
}

function slugFromLessonNumber(lessonNumber) {
  return `urok-${String(lessonNumber).padStart(2, "0")}`;
}

function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function inlineToHtml(text) {
  return escapeHtml(text)
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/`(.+?)`/g, "<code>$1</code>");
}

function parseMarkdownBlocks(markdown) {
  const lines = markdown.split(/\r?\n/);
  const blocks = [];
  let index = 0;

  while (index < lines.length) {
    const rawLine = lines[index];
    const line = rawLine.trim();

    if (!line) {
      index += 1;
      continue;
    }

    if (/^-{3,}$/.test(line)) {
      blocks.push({ type: "divider" });
      index += 1;
      continue;
    }

    const headingMatch = line.match(/^(#{2,4})\s+(.+)$/);
    if (headingMatch) {
      blocks.push({
        type: "heading",
        level: headingMatch[1].length,
        html: inlineToHtml(headingMatch[2].trim())
      });
      index += 1;
      continue;
    }

    if (/^>\s?/.test(line)) {
      const quoteLines = [];

      while (index < lines.length && /^>\s?/.test(lines[index].trim())) {
        quoteLines.push(lines[index].trim().replace(/^>\s?/, ""));
        index += 1;
      }

      blocks.push({
        type: "quote",
        html: inlineToHtml(quoteLines.join(" "))
      });
      continue;
    }

    if (/^\d+\.\s+/.test(line)) {
      const items = [];

      while (index < lines.length && /^\d+\.\s+/.test(lines[index].trim())) {
        items.push(
          inlineToHtml(lines[index].trim().replace(/^\d+\.\s+/, ""))
        );
        index += 1;
      }

      blocks.push({ type: "ordered-list", items });
      continue;
    }

    if (/^-\s+/.test(line)) {
      const items = [];

      while (index < lines.length && /^-\s+/.test(lines[index].trim())) {
        items.push(inlineToHtml(lines[index].trim().replace(/^-\s+/, "")));
        index += 1;
      }

      blocks.push({ type: "unordered-list", items });
      continue;
    }

    const paragraphLines = [];

    while (index < lines.length) {
      const current = lines[index].trim();

      if (
        !current ||
        /^-{3,}$/.test(current) ||
        /^(#{2,4})\s+/.test(current) ||
        /^>\s?/.test(current) ||
        /^\d+\.\s+/.test(current) ||
        /^-\s+/.test(current)
      ) {
        break;
      }

      paragraphLines.push(current);
      index += 1;
    }

    if (paragraphLines.length) {
      blocks.push({
        type: "paragraph",
        html: inlineToHtml(paragraphLines.join(" "))
      });
      continue;
    }

    index += 1;
  }

  return blocks;
}

export const getCourseData = cache(() => {
  const source = fs.readFileSync(courseFilePath, "utf8");
  const lines = source.split(/\r?\n/);
  const lessonStarts = [];

  lines.forEach((line, lineIndex) => {
    const match = line.match(/^(#{1,2})\s+УРОК\s+(\d+)\.\s+(.+)$/);

    if (!match) {
      return;
    }

    lessonStarts.push({
      lineIndex,
      lessonNumber: Number(match[2]),
      title: match[3].trim()
    });
  });

  const lessons = lessonStarts.map((lessonStart, lessonIndex) => {
    const nextLesson = lessonStarts[lessonIndex + 1];
    const contentLines = lines
      .slice(lessonStart.lineIndex + 1, nextLesson?.lineIndex ?? lines.length)
      .join("\n")
      .trim();
    const moduleNumber = getModuleNumberByLesson(lessonStart.lessonNumber);
    const moduleInfo = moduleMeta.find((module) => module.number === moduleNumber);

    return {
      number: lessonStart.lessonNumber,
      slug: slugFromLessonNumber(lessonStart.lessonNumber),
      title: lessonStart.title,
      moduleNumber,
      moduleId: moduleInfo.id,
      moduleTitle: moduleInfo.title,
      blocks: parseMarkdownBlocks(contentLines)
    };
  });

  const lessonsWithRelations = lessons.map((lesson, lessonIndex) => {
    const moduleLessons = lessons.filter(
      (item) => item.moduleNumber === lesson.moduleNumber
    );

    return {
      ...lesson,
      prevLessonSlug: lessons[lessonIndex - 1]?.slug ?? null,
      nextLessonSlug: lessons[lessonIndex + 1]?.slug ?? null,
      position: lessonIndex + 1,
      totalLessons: lessons.length,
      lessonPositionInModule:
        moduleLessons.findIndex((item) => item.slug === lesson.slug) + 1,
      moduleLessonCount: moduleLessons.length
    };
  });

  const modules = moduleMeta.map((module) => {
    const moduleLessons = lessonsWithRelations.filter(
      (lesson) => lesson.moduleNumber === module.number
    );

    return {
      ...module,
      lessonCount: moduleLessons.length,
      firstLessonSlug: moduleLessons[0]?.slug ?? null,
      lessons: moduleLessons
    };
  });

  return {
    modules,
    lessons: lessonsWithRelations
  };
});

export function getLessonBySlug(slug) {
  return getCourseData().lessons.find((lesson) => lesson.slug === slug) ?? null;
}

export function getModuleByNumber(moduleNumber) {
  return (
    getCourseData().modules.find((module) => module.number === moduleNumber) ??
    null
  );
}
