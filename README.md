# foliant

Telegram Mini App бота [@TheFoliantBot](https://t.me/TheFoliantBot): папки и заметки Obsidian внутри Telegram. Открывается кнопкой меню в чате с ботом.

Оболочка без сборки лежит на GitHub Pages, данные отдаёт веб-приложение бота на Google Apps Script. Запрос несёт `initData` от Telegram, сервер сверяет подпись с токеном бота и отдаёт только то, что этому аккаунту открыто в чате.

Заметки показываются как в Obsidian: `[[ссылки]]`, `![[картинки]]`, callout, формулы `$...$` и `$$...$$`, mermaid, таблицы, задачи. Блоки dataview пока не считаются.

## Файлы

- `index.html`, `style.css`, `app.js`: оболочка
- `vendor/`: telegram-web-app.js, markdown-it 14, MathJax 3, mermaid 11

Библиотеки: markdown-it (MIT), MathJax (Apache-2.0), mermaid (MIT), иконки Lucide (ISC).
