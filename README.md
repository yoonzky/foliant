# foliant

Telegram Mini App бота [@TheFoliantBot](https://t.me/TheFoliantBot): папки и заметки Obsidian внутри Telegram. Открывается кнопкой меню в чате с ботом.

Оболочка без сборки лежит на GitHub Pages, данные отдаёт веб-приложение бота на Google Apps Script. Запрос несёт `initData` от Telegram, сервер сверяет подпись с токеном бота и отдаёт только то, что этому аккаунту открыто в чате.

Заметки показываются как в Obsidian: `[[ссылки]]`, `![[картинки]]` и `![[вставки заметок]]`, callout, формулы `$...$` и `$$...$$`, mermaid, таблицы, задачи, сноски, подсветка кода, свёрнутые свойства из frontmatter, обратные ссылки под заметкой. PDF до 10 МБ открывается внутри, картинки и PDF приближаются щипком и двойным касанием.

Блоки `dataviewjs` и скрипты `dv.view` выполняются в `dv.js`: `dv` собран поверх дерева и метаданных заметок с сервера (frontmatter, ссылки, строки с инлайн-полями), `app` только на чтение. Блоки `dataview` на DQL и карта по смыслу не считаются.

## Файлы

- `index.html`, `style.css`, `app.js`: оболочка
- `dv.js`: dataviewjs и dv.view
- `vendor/`: telegram-web-app.js, markdown-it 14 и markdown-it-footnote 4, MathJax 3, mermaid 11, highlight.js 11, pdf.js 4 (legacy), moment 2, Chart.js 4

Библиотеки: markdown-it и markdown-it-footnote (MIT), MathJax (Apache-2.0), mermaid (MIT), highlight.js (BSD-3-Clause), pdf.js (Apache-2.0), moment (MIT), Chart.js (MIT), иконки Lucide (ISC).
