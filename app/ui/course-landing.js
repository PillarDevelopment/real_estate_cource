"use client";

import { useState } from "react";

const modules = [
  {
    id: "module-1",
    label: "Модуль 1",
    title: "База рынка и роль инвестиционного советника",
    summary:
      "Понятийный каркас рынка, классы активов, роли участников, риск-профиль инвестора и базовая коммуникация.",
    lessons: [
      "Как устроен инвестиционный рынок недвижимости в России",
      "Классы активов и их реальная инвестиционная логика",
      "Доходность, риск, ликвидность и горизонт инвестирования",
      "Игроки рынка и их экономические интересы",
      "Кто такой инвестор на практике",
      "Определение риск-профиля и инвестиционного запроса",
      "Базовая коммуникация с инвестором",
      "Типовые возражения и работа с ними"
    ]
  },
  {
    id: "module-2",
    label: "Модуль 2",
    title: "Финансовый анализ и инвестиционное моделирование",
    summary:
      "Метрики, финансовая модель, сценарный анализ и проверка гипотез без псевдонауки и рекламной упаковки.",
    lessons: [
      "Что такое финансовый анализ объекта и проекта",
      "Какие показатели действительно важны инвестору",
      "NOI, эффективный доход и нормализация потока",
      "ROI, cash-on-cash и payback в прикладной логике",
      "IRR и NPV без псевдосложности",
      "Сценарный анализ: base, downside, upside",
      "Предпосылки модели: аренда, вакансия, CAPEX, OPEX, налоги, инфляция",
      "Построение модели для арендного и девелоперского сценария",
      "Ошибки моделей и манипуляции цифрами",
      "AI в подготовке аналитики и проверке гипотез"
    ]
  },
  {
    id: "module-3",
    label: "Модуль 3",
    title: "Продукты инвестиционной недвижимости и их продажа",
    summary:
      "Разбор продуктовых классов через экономику, риск, ликвидность и соответствие типу инвестора.",
    lessons: [
      "Офисная недвижимость",
      "Торговая недвижимость",
      "Городские апартаменты",
      "Спекулятивные инвестиции в жилье",
      "ЗПИФы и коллективные модели",
      "Склады и light industrial",
      "Курортная недвижимость и гостиничные апартаменты",
      "Загородная рекреационная недвижимость",
      "Городская жилая доходная недвижимость",
      "Как продавать разные продукты разным инвесторам"
    ]
  },
  {
    id: "module-4",
    label: "Модуль 4",
    title: "Работа с инвестором на всем жизненном цикле",
    summary:
      "Сопровождение клиента от первого контакта до выхода из проекта, ожидания, психология и доверие.",
    lessons: [
      "Путь инвестора: от первого контакта до выхода",
      "Предынвестиционная стадия: что обязан сделать советник",
      "Сопровождение в эксплуатации",
      "Подготовка к выходу из проекта",
      "Психология инвестора: тревога, жадность, regret aversion",
      "Как стать доверенным фильтром решений"
    ]
  },
  {
    id: "module-5",
    label: "Модуль 5",
    title: "Зарубежная недвижимость и дополнительные направления",
    summary:
      "Как обсуждать зарубежные активы и доходную жилую стратегию без подмены инвестиции эмоциональной покупкой.",
    lessons: [
      "Реальные цели клиента и ложные ожидания",
      "Доходная городская жилая недвижимость как отдельная стратегия",
      "ВНЖ, валютные и правовые риски как фактор сделки",
      "Сравнение российского и зарубежного продукта"
    ]
  },
  {
    id: "module-6",
    label: "Модуль 6",
    title: "Продвижение услуг советника и монетизация экспертизы",
    summary:
      "Позиционирование, линейка услуг, воронка, контент, бренд и устойчивый advisory-бизнес.",
    lessons: [
      "Что именно продает инвестиционный советник",
      "Линейка услуг и монетизация без хаоса",
      "Воронка советника: от контента до квалифицированного клиента",
      "Личный бренд советника",
      "Контент-стратегия: Telegram, LinkedIn и точечные каналы",
      "Как искать клиентов без деградации в поток лидов",
      "Продажи девелоперских проектов и отличие от advisory",
      "Практическая схема коммерциализации экспертизы"
    ]
  }
];

const principles = [
  {
    number: "01",
    title: "Анти-иллюзорный подход",
    text: "Разбор манипуляций доходностью, слабых офферов и конфликтов интересов."
  },
  {
    number: "02",
    title: "Двойной уровень подачи",
    text: "Материал понятен новичку, но содержит профессиональный слой для практиков."
  },
  {
    number: "03",
    title: "Прикладная ценность",
    text: "Каждый блок отвечает на вопрос, что с этим делать в реальной работе советника."
  },
  {
    number: "04",
    title: "Актуальность 2026",
    text: "Рыночный контекст, налоги, стоимость денег, земельные и продуктовые риски."
  }
];

const results = [
  "Анкета инвестора",
  "Шаблон investment memo",
  "Сравнительная матрица объектов",
  "Чек-лист due diligence",
  "Каркас инвестиционной презентации",
  "Схема воронки и монетизации"
];

export default function CourseLanding() {
  const [openModule, setOpenModule] = useState("module-1");
  const [submitted, setSubmitted] = useState(false);

  return (
    <div className="page-shell">
      <header className="site-header">
        <a className="brand" href="#top">
          <span className="brand-mark">RE</span>
          <span className="brand-text">Investment Course</span>
        </a>
        <nav className="site-nav">
          <a href="#about">О курсе</a>
          <a href="#program">Программа</a>
          <a href="#format">Формат</a>
          <a href="/course">Читать курс</a>
          <a href="#cta">Участие</a>
        </nav>
      </header>

      <main id="top">
        <section className="hero">
          <div className="hero-copy">
            <div>
              <p className="eyebrow">Авторский курс 2026</p>
              <h1>Инвестиционная недвижимость в России</h1>
              <p className="hero-lead">
                Системный курс для брокеров, консультантов, аналитиков и
                предпринимателей, которые хотят перейти от продажи объектов к
                профессиональной работе с инвестиционной логикой клиента.
              </p>
            </div>
            <div className="hero-actions">
              <a className="button button-primary" href="#program">
                Посмотреть программу
              </a>
              <a className="button button-secondary" href="/course">
                Открыть курс
              </a>
            </div>
          </div>

          <aside className="hero-card">
            <div>
              <p className="card-kicker">Что внутри</p>
              <ul className="metric-list">
                <li>
                  <strong>6</strong>
                  <span>модулей</span>
                </li>
                <li>
                  <strong>52</strong>
                  <span>урока</span>
                </li>
                <li>
                  <strong>10-14</strong>
                  <span>часов с практикой</span>
                </li>
                <li>
                  <strong>2026</strong>
                  <span>актуализированная рамка</span>
                </li>
              </ul>
            </div>
            <p className="hero-note">
              Не инфопродукт про доходность на витрине, а рабочая система:
              рынок, финмодель, типы инвесторов, продукты, продажи и
              сопровождение.
            </p>
          </aside>
        </section>

        <section className="signal-band">
          <p>
            Курс собран вокруг одной задачи: научить принимать инвестиционные
            решения и объяснять их клиенту без маркетинговых иллюзий.
          </p>
        </section>

        <section className="section" id="about">
          <div className="section-heading">
            <p className="eyebrow">О курсе</p>
            <h2>
              Для тех, кому нужен профессиональный каркас, а не набор
              разрозненных советов
            </h2>
          </div>
          <div className="two-column">
            <article className="panel">
              <h3>Кому подойдет</h3>
              <ul className="plain-list">
                <li>Начинающим инвестиционным брокерам и консультантам</li>
                <li>
                  Практикующим специалистам, которым не хватает системного
                  финанализа
                </li>
                <li>Руководителям продаж и собственникам агентств</li>
                <li>
                  Частным инвесторам, которые хотят профессионализировать
                  подход
                </li>
              </ul>
            </article>
            <article className="panel">
              <h3>Какой результат</h3>
              <ul className="plain-list">
                <li>Понимание рынка, классов активов и логики инвестора</li>
                <li>Навык собирать и читать финансовую модель проекта</li>
                <li>Умение сопоставлять продукт с риск-профилем клиента</li>
                <li>Способность продавать экспертизу, а не только объект</li>
              </ul>
            </article>
          </div>
        </section>

        <section className="section section-dark">
          <div className="section-heading">
            <p className="eyebrow">Принципы</p>
            <h2>Логика курса строится от инвестора, а не от витрины объектов</h2>
          </div>
          <div className="principles-grid">
            {principles.map((principle) => (
              <article className="principle" key={principle.number}>
                <span>{principle.number}</span>
                <h3>{principle.title}</h3>
                <p>{principle.text}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="section" id="program">
          <div className="section-heading">
            <p className="eyebrow">Программа</p>
            <h2>
              Шесть модулей от базы рынка до коммерциализации собственной
              экспертизы
            </h2>
          </div>
          <div className="program-list">
            {modules.map((module) => {
              const expanded = openModule === module.id;

              return (
                <article className="program-item" key={module.id}>
                  <button
                    className="program-toggle"
                    type="button"
                    aria-expanded={expanded}
                    onClick={() =>
                      setOpenModule(expanded ? null : module.id)
                    }
                  >
                    <span>{module.label}</span>
                    <strong>{module.title}</strong>
                  </button>
                  {expanded ? (
                    <div className="program-body">
                      <p>{module.summary}</p>
                      <ul className="lesson-list">
                        {module.lessons.map((lesson) => (
                          <li key={lesson}>{lesson}</li>
                        ))}
                      </ul>
                    </div>
                  ) : null}
                </article>
              );
            })}
          </div>
        </section>

        <section className="section" id="format">
          <div className="section-heading">
            <p className="eyebrow">Формат</p>
            <h2>Курс сделан как единая учебная система</h2>
          </div>
          <div className="format-grid">
            <article className="format-card">
              <h3>Основной корпус</h3>
              <p>
                Последовательный учебный текст от базового уровня к
                профессиональному.
              </p>
            </article>
            <article className="format-card">
              <h3>Практический слой</h3>
              <p>
                Мини-кейсы, расчетные задания, вопросы для самопроверки и
                тесты.
              </p>
            </article>
            <article className="format-card">
              <h3>Инструментальный слой</h3>
              <p>
                Чек-листы, шаблоны, формы брифинга клиента и структура
                investment memo.
              </p>
            </article>
            <article className="format-card">
              <h3>AI-блок</h3>
              <p>
                Промпты, сценарии использования, ограничения и правила проверки
                результатов.
              </p>
            </article>
          </div>
        </section>

        <section className="section section-accent">
          <div className="section-heading">
            <p className="eyebrow">Результат</p>
            <h2>
              После прохождения у слушателя остается не только теория, но и
              рабочая модель практики
            </h2>
          </div>
          <div className="results-grid">
            {results.map((item) => (
              <div className="result-pill" key={item}>
                {item}
              </div>
            ))}
          </div>
        </section>

        <section className="section cta-section" id="cta">
          <div className="cta-copy">
            <p className="eyebrow">Участие</p>
            <h2>Оставьте заявку на участие в следующем потоке</h2>
            <p>
              Подойдет, если вы хотите зайти в профессию глубже, усилить свою
              текущую практику или выстроить консультативную модель работы с
              инвестором.
            </p>
          </div>
          <form
            className="cta-form"
            onSubmit={(event) => {
              event.preventDefault();
              setSubmitted(true);
            }}
          >
            <label>
              <span>Имя</span>
              <input type="text" name="name" placeholder="Ваше имя" />
            </label>
            <label>
              <span>Контакт</span>
              <input
                type="text"
                name="contact"
                placeholder="Telegram или телефон"
              />
            </label>
            <label>
              <span>Запрос</span>
              <textarea
                name="message"
                rows="4"
                placeholder="Коротко опишите, зачем вам курс"
              />
            </label>
            <button className="button button-primary" type="submit">
              {submitted ? "Заявка принята" : "Отправить заявку"}
            </button>
          </form>
        </section>
      </main>

      <footer className="site-footer">
        <p>Авторский курс по инвестиционной недвижимости</p>
        <p>Актуализация рамки: 15.04.2026</p>
      </footer>
    </div>
  );
}
