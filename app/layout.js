import "./globals.css";

export const metadata = {
  title: "Инвестиционная недвижимость в России",
  description:
    "Авторский курс по инвестиционной недвижимости: рынок, финансовый анализ, продукты, продажи и работа с инвестором."
};

export default function RootLayout({ children }) {
  return (
    <html lang="ru">
      <body>{children}</body>
    </html>
  );
}
