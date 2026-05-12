import "./globals.css";

export const metadata = {
  title: "Инвест Советник",
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
