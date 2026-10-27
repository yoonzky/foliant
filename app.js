// версия модулей та же, что у app.js в index.html: после выкладки старые из кэша не смешиваются с новыми
import {setup, blocks, stop} from './dv.js?v=5';
import {kind, preview} from './view.js?v=5';
import * as store from './store.js?v=5';

const API = 'https://script.google.com/macros/s/AKfycbwp_Qa67i2jicpv2Kj900XPD5GFlCbDIGcKXE_3OyzjYP-jp-K_BvXIaHPEGwsA5put9Q/exec';
const PICTURE = /\.(png|jpe?g|gif|webp|svg|bmp|avif)$/i;
const TYPES = {png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg', gif: 'image/gif', webp: 'image/webp', svg: 'image/svg+xml', bmp: 'image/bmp', avif: 'image/avif'};
const ERRORS = {
  sign: 'Сессия устарела. Закрой приложение и открой снова из чата.',
  access: 'Папки закрыты. Доступ выдаёт владелец в чате с ботом.',
  gone: 'Файла уже нет.',
  big: 'Файл больше 10 МБ, его можно прислать в чат.',
  view: 'Просмотр не открылся.',
  bad: 'Сервер не понял запрос.',
  fail: 'Ошибка на сервере.',
  net: 'Нет связи с сервером.',
  busy: 'Atlas уже собирается, попробуй через минуту.',
};
const BOT = 'https://t.me/TheFoliantBot';
// одновременных запросов файлов к Apps Script
const LANES = 3;
// пути иконок Lucide
const ICONS = {
  folder: '<path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z"/>',
  note: '<path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M10 9H8"/><path d="M16 13H8"/><path d="M16 17H8"/>',
  file: '<path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/>',
  image: '<rect width="18" height="18" x="3" y="3" rx="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>',
  search: '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',
  chevron: '<path d="m9 18 6-6-6-6"/>',
  fold: '<path d="m6 9 6 6 6-6"/>',
  send: '<path d="M14.536 21.686a.5.5 0 0 0 .937-.024l6.5-19a.496.496 0 0 0-.635-.635l-19 6.5a.5.5 0 0 0-.024.937l7.93 3.18a2 2 0 0 1 1.112 1.11z"/><path d="m21.854 2.147-10.94 10.939"/>',
  pencil: '<path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z"/><path d="m15 5 4 4"/>',
  list: '<rect width="8" height="4" x="8" y="2" rx="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><path d="M12 11h4"/><path d="M12 16h4"/><path d="M8 11h.01"/><path d="M8 16h.01"/>',
  info: '<circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/>',
  todo: '<circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/>',
  flame: '<path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/>',
  check: '<path d="M20 6 9 17l-5-5"/>',
  help: '<circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><path d="M12 17h.01"/>',
  alert: '<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"/><path d="M12 9v4"/><path d="M12 17h.01"/>',
  cross: '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>',
  zap: '<path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z"/>',
  example: '<path d="M3 12h.01"/><path d="M3 18h.01"/><path d="M3 6h.01"/><path d="M8 12h13"/><path d="M8 18h13"/><path d="M8 6h13"/>',
  quote: '<path d="M16 3a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2 1 1 0 0 1 1 1v1a2 2 0 0 1-2 2 1 1 0 0 0-1 1v2a1 1 0 0 0 1 1 6 6 0 0 0 6-6V5a2 2 0 0 0-2-2z"/><path d="M5 3a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2 1 1 0 0 1 1 1v1a2 2 0 0 1-2 2 1 1 0 0 0-1 1v2a1 1 0 0 0 1 1 6 6 0 0 0 6-6V5a2 2 0 0 0-2-2z"/>',
  map: '<path d="M14.106 5.553a2 2 0 0 0 1.788 0l3.659-1.83A1 1 0 0 1 21 4.619v12.764a1 1 0 0 1-.553.894l-4.553 2.277a2 2 0 0 1-1.788 0l-4.212-2.106a2 2 0 0 0-1.788 0l-3.659 1.83A1 1 0 0 1 3 19.381V6.618a1 1 0 0 1 .553-.894l4.553-2.277a2 2 0 0 1 1.788 0z"/><path d="M15 5.764v15"/><path d="M9 3.236v15"/>',
  star: '<path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z"/>',
  share: '<path d="M12 2v13"/><path d="m16 6-4-4-4 4"/><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/>',
  toc: '<path d="M21 5H3"/><path d="M15 12H3"/><path d="M17 19H3"/>',
  refresh: '<path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M8 16H3v5"/>',
  left: '<path d="m15 18-6-6 6-6"/>',
  code: '<path d="m16 18 6-6-6-6"/><path d="m8 6-6 6 6 6"/>',
  sheet: '<rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><line x1="3" x2="21" y1="9" y2="9"/><line x1="3" x2="21" y1="15" y2="15"/><line x1="9" x2="9" y1="9" y2="21"/><line x1="15" x2="15" y1="9" y2="21"/>',
  tag: '<path d="M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l6.58-6.58a2.426 2.426 0 0 0 0-3.42z"/><circle cx="7.5" cy="7.5" r=".5" fill="currentColor"/>',
  phone: '<rect width="14" height="20" x="5" y="2" rx="2" ry="2"/><path d="M12 18h.01"/>',
};
const CALLOUTS = {note: 'pencil', abstract: 'list', summary: 'list', tldr: 'list', info: 'info', todo: 'todo', tip: 'flame', hint: 'flame', important: 'flame', success: 'check', check: 'check', done: 'check', question: 'help', help: 'help', faq: 'help', warning: 'alert', caution: 'alert', attention: 'alert', failure: 'cross', fail: 'cross', missing: 'cross', danger: 'zap', error: 'zap', bug: 'zap', example: 'example', quote: 'quote', cite: 'quote'};

const tg = window.Telegram ? window.Telegram.WebApp : null;
const view = document.getElementById('view');
const collator = new Intl.Collator('ru', {numeric: true, sensitivity: 'base'});
const stack = [];
const notes = new Map();
const pics = new Map();
const pending = new Map();
let tree = null;
let md = null;
let user = '';
let retry = null;
let mathjax = null;
let mermaidReady = null;
let hljsReady = null;
let pdfjs = null;
let meta = null;
let seq = 0;
const blobs = new Map();
const leaving = [];
const layers = [];
const tones = new Map();
const waiting = [];
let lanes = 0;
let pins = [];
let launch = '';
let homeScreen = '';
let rebuilding = false;
let pressed = 0;

start();

function start() {
  if (!tg || !tg.initData) {
    view.innerHTML = '<p class="quiet pad">Открывается кнопкой в чате с <a href="https://t.me/TheFoliantBot">@TheFoliantBot</a></p>';
    return;
  }
  user = String((tg.initDataUnsafe.user || {}).id || '');
  launch = String(tg.initDataUnsafe.start_param || '');
  pins = read('pins') || [];
  cloudPins();
  md = markdown();
  setup({tree: () => tree, meta: () => meta, call: call, text: text, bytes: bytes, resolve: resolve, trail: trail, script: script, yaml: yaml, open: open, clean: clean, decorate: el => extras(el, 1), render: (src, env) => md.render(src, env), inline: (src, env) => md.renderInline(src, env)});
  history.scrollRestoration = 'manual';
  tg.expand();
  paint();
  tg.onEvent('themeChanged', paint);
  insets();
  ['safeAreaChanged', 'contentSafeAreaChanged', 'fullscreenChanged'].forEach(e => tg.onEvent(e, insets));
  tg.BackButton.onClick(back);
  if (tg.isVersionAtLeast('7.7')) {
    tg.disableVerticalSwipes();
  }
  view.addEventListener('click', click);
  // ссылки в панелях снизу мимо click: их тоже ведёт follow
  document.addEventListener('click', e => {
    const a = e.target.closest ? e.target.closest('a') : null;
    if (a && !e.defaultPrevented) {
      e.preventDefault();
      follow(a);
    }
  });
  view.addEventListener('touchstart', pinch, {passive: false});
  view.addEventListener('touchmove', pinch, {passive: false});
  view.addEventListener('touchend', pinch);
  view.addEventListener('touchcancel', pinch);
  // без touchstart WebKit не показывает :active при касании
  document.addEventListener('touchstart', () => {}, {passive: true});
  view.addEventListener('input', typed);
  // картинки в свёрнутых callout грузятся при раскрытии
  view.addEventListener('toggle', e => {
    if (e.target.open) {
      pictures(e.target);
    }
  }, true);
  document.addEventListener('touchstart', hold, {passive: true});
  document.addEventListener('touchmove', hold, {passive: true});
  document.addEventListener('touchend', hold);
  document.addEventListener('touchcancel', hold);
  // правая кнопка на компьютере и долгое нажатие на Android тоже открывают предпросмотр
  document.addEventListener('contextmenu', e => {
    const a = e.target.closest ? e.target.closest('a.internal[data-file]') : null;
    if (!a) {
      return;
    }
    e.preventDefault();
    if (Date.now() - pressed > 1000) {
      pressed = Date.now();
      peek(a.dataset.file, a.dataset.sub || '');
    }
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && layers.length) {
      back();
    }
  });
  window.addEventListener('scroll', () => {
    clearTimeout(remember.timer);
    remember.timer = setTimeout(remember, 400);
  }, {passive: true});
  if (tg.isVersionAtLeast('8.0') && tg.checkHomeScreenStatus) {
    tg.checkHomeScreenStatus(status => {
      homeScreen = status;
      const top = stack[stack.length - 1];
      if (status === 'missed' && tree && top && top.dir === tree.root && !layers.length) {
        refresh();
      }
    });
    tg.onEvent('homeScreenAdded', () => {
      homeScreen = 'added';
      toast('Иконка добавлена на экран');
    });
  }
  view.addEventListener('submit', e => {
    e.preventDefault();
    const input = e.target.querySelector('input');
    input.blur();
    if (input.value.trim()) {
      deep(input.value.trim());
    }
  });
  const saved = read('tree');
  if (saved) {
    use(saved);
    useMeta(read('meta'));
  } else {
    view.innerHTML = '<p class="quiet pad">загружается</p>';
  }
  tg.ready();
  load();
}

// цвета шапки и фона из темы Telegram, свои тона текста по схеме
function paint() {
  document.documentElement.dataset.scheme = tg.colorScheme === 'light' ? 'light' : 'dark';
  if (tg.isVersionAtLeast('6.1')) {
    tg.setHeaderColor('bg_color');
    tg.setBackgroundColor('bg_color');
  }
  if (tg.isVersionAtLeast('7.10')) {
    tg.setBottomBarColor('bg_color');
  }
}

// на весь экран сверху строка статуса и кнопки Telegram поверх страницы
function insets() {
  const s = tg.safeAreaInset || {};
  const c = tg.contentSafeAreaInset || {};
  document.documentElement.style.setProperty('--top', ((s.top || 0) + (c.top || 0)) + 'px');
}

function load() {
  call('tree').then(data => {
    write('tree', data);
    use(data);
    loadMeta();
    // ссылка на заметку, которой в доступном дереве нет
    if (launch) {
      launch = '';
      toast('Эта заметка недоступна');
    }
  }).catch(err => {
    if (err.error === 'sign' || err.error === 'access') {
      forget();
      tree = null;
      meta = null;
    }
    if (err.error === 'access') {
      store.drop(user);
    }
    if (!tree) {
      stack.length = 0;
      problem(err, load);
    } else {
      toast(message(err));
    }
  });
}

function use(data) {
  const first = !tree;
  tree = build(data);
  // копии заметок на устройстве только у владельца и вошедших по паролю
  if (tree.full) {
    store.open(user);
  } else {
    store.drop(user);
  }
  if (meta) {
    meta.back = null;
  }
  document.documentElement.classList.toggle('guarded', !tree.full);
  // ссылка t.me/...?startapp=id открывает файл сразу, иначе место, где закрыли
  if (launch && tree.files.has(launch)) {
    const f = tree.files.get(launch);
    launch = '';
    closeLayers();
    stack.length = 0;
    stack.push({dir: tree.root}, f.md ? {note: f.id} : {file: f.id});
    show();
    return;
  }
  if (first || !stack.length || stack[0].dir !== tree.root) {
    stack.length = 0;
    const saved = first ? (read('stack') || []).filter(valid) : [];
    if (saved.length && saved[0].dir === tree.root) {
      stack.push(...saved);
      show(true);
    } else {
      stack.push({dir: tree.root});
      show();
    }
    return;
  }
  // свежее дерево перерисовывает открытую папку, если в ней не идёт поиск
  const top = stack[stack.length - 1];
  const input = view.querySelector('.find input');
  if (top.dir && !(input && input.value) && !layers.length) {
    const y = window.scrollY;
    show();
    window.scrollTo(0, y);
  }
}

function valid(e) {
  return e && (e.dir ? tree.dirs.has(e.dir) : e.note ? tree.files.has(e.note) : e.file ? tree.files.has(e.file) : !!e.tag);
}

// стек страниц с прокруткой переживает закрытие приложения
function remember() {
  const top = stack[stack.length - 1];
  if (top && !layers.length) {
    top.y = window.scrollY;
  }
  write('stack', stack.map(e => ({dir: e.dir, note: e.note, file: e.file, tag: e.tag, y: e.y || 0})));
}

function refresh() {
  const y = window.scrollY;
  show();
  window.scrollTo(0, y);
}

// закладки хранятся в CloudStorage Telegram и видны со всех устройств
function cloudPins() {
  if (!tg.isVersionAtLeast('6.9') || !tg.CloudStorage) {
    return;
  }
  tg.CloudStorage.getItem('pins', (err, value) => {
    if (err || !value) {
      return;
    }
    try {
      pins = JSON.parse(value);
    } catch (e) {
      return;
    }
    write('pins', pins);
    const top = stack[stack.length - 1];
    if (tree && top && (top.dir === tree.root || top.note) && !layers.length) {
      refresh();
    }
  });
}

function pin(id) {
  const on = !pins.includes(id);
  pins = on ? [id].concat(pins) : pins.filter(x => x !== id);
  write('pins', pins);
  if (tg.isVersionAtLeast('6.9') && tg.CloudStorage) {
    tg.CloudStorage.setItem('pins', JSON.stringify(pins.slice(0, 100)));
  }
  haptic('impact');
  toast(on ? 'Закреплено на главной' : 'Откреплено');
  return on;
}

function haptic(kind) {
  const h = tg.HapticFeedback;
  if (!h || !tg.isVersionAtLeast('6.1')) {
    return;
  }
  if (kind === 'impact') {
    h.impactOccurred('light');
  } else {
    h.selectionChanged();
  }
}

function call(a, extra) {
  return fetch(API, {method: 'POST', body: JSON.stringify(Object.assign({init: tg.initData, a: a}, extra))}).catch(() => {
    throw {error: 'net'};
  }).then(res => res.json().catch(() => ({error: 'fail'}))).then(data => {
    if (data.error) {
      throw data;
    }
    return data;
  });
}

function read(key) {
  try {
    return JSON.parse(localStorage.getItem(key + user));
  } catch (err) {
    return null;
  }
}

function write(key, data) {
  try {
    localStorage.setItem(key + user, JSON.stringify(data));
  } catch (err) {
  }
}

function forget() {
  try {
    localStorage.removeItem('tree' + user);
    localStorage.removeItem('meta' + user);
  } catch (err) {
  }
}

// frontmatter, ссылки и поля всех видимых заметок: обратные ссылки и dv.pages
function loadMeta() {
  call('meta').then(data => {
    write('meta', data);
    useMeta(data);
  }).catch(() => {});
}

function useMeta(data) {
  if (!data || !data.n) {
    return;
  }
  // блоки dataviewjs, посчитанные без метаданных, пересчитываются
  const blind = !meta && !!view.querySelector('#note .dv');
  meta = {t: data.t, notes: new Map(data.n.map(([id, fm, links, fields, tags]) => [id, {fm: fm, links: links, fields: fields, tags: tags || []}])), back: null, tags: null};
  const top = stack[stack.length - 1];
  if (top && top.note) {
    backlinks(top.note);
  }
  if (top && (top.tag || (top.note && blind)) && tree && !layers.length) {
    refresh();
  }
}

// теги из свойств tags и tag и из текста, без решётки
function tagged() {
  if (!meta.tags) {
    meta.tags = new Map();
    meta.notes.forEach((n, id) => {
      const fm = yaml(n.fm);
      const list = [].concat(fm.tags || [], fm.tag || []).flatMap(t => String(t).split(/[\s,]+/)).concat(n.tags || []).map(t => t.replace(/^#/, '').toLowerCase()).filter(Boolean);
      meta.tags.set(id, [...new Set(list)]);
    });
  }
  return meta.tags;
}

// кто ссылается на заметку: цели ссылок разрешаются как в самой заметке
function backlinks(id) {
  const box = document.getElementById('back');
  if (!box || !meta || !tree) {
    return;
  }
  if (!meta.back) {
    meta.back = new Map();
    meta.notes.forEach((n, from) => {
      const f = tree.files.get(from);
      if (!f) {
        return;
      }
      n.links.forEach(target => {
        const to = resolve(target, {from: f.parent});
        if (to && to.id !== from) {
          if (!meta.back.has(to.id)) {
            meta.back.set(to.id, new Set());
          }
          meta.back.get(to.id).add(from);
        }
      });
    });
  }
  const list = [...(meta.back.get(id) || [])].map(x => tree.files.get(x)).filter(Boolean).sort((a, b) => collator.compare(a.name, b.name));
  box.innerHTML = list.length ? '<h2 class="label">Ссылки сюда</h2><div class="list">' + rows([], list, true) + '</div>' : '';
}

// папки и файлы по id, дети по папкам, имена для ссылок: заметки без .md, остальные с расширением
function build(data) {
  const t = {t: data.t, root: data.root, full: data.full, dirs: new Map(), files: new Map(), kids: new Map(), notes: new Map(), names: new Map()};
  const kid = id => {
    if (!t.kids.has(id)) {
      t.kids.set(id, {dirs: [], files: []});
    }
    return t.kids.get(id);
  };
  const add = (map, key, f) => {
    if (!map.has(key)) {
      map.set(key, []);
    }
    map.get(key).push(f);
  };
  data.f.forEach(([id, name, parent]) => t.dirs.set(id, {id: id, name: name, parent: parent}));
  t.dirs.forEach(d => {
    if (t.dirs.has(d.parent)) {
      kid(d.parent).dirs.push(d);
    }
  });
  data.m.forEach(([id, file, parent, time, size]) => {
    const note = /\.md$/i.test(file);
    const f = {id: id, file: file, name: note ? file.slice(0, -3) : file, md: note, parent: parent, time: time, size: size};
    t.files.set(id, f);
    kid(parent).files.push(f);
    if (note) {
      add(t.notes, f.name.toLowerCase(), f);
    }
    add(t.names, file.toLowerCase(), f);
  });
  // карта папки первой, потом заметки, потом остальные файлы
  t.kids.forEach((k, id) => {
    const map = ((t.dirs.get(id) || {}).name + ' Map').toLowerCase();
    k.dirs.sort((a, b) => collator.compare(a.name, b.name));
    k.files.sort((a, b) => (b.md && b.name.toLowerCase() === map) - (a.md && a.name.toLowerCase() === map) || b.md - a.md || collator.compare(a.name, b.name));
  });
  return t;
}

function trail(id) {
  const out = [];
  while (id && tree.dirs.has(id)) {
    out.unshift(tree.dirs.get(id));
    id = tree.dirs.get(id).parent;
  }
  return out;
}

function go(entry) {
  if (stack.length) {
    stack[stack.length - 1].y = window.scrollY;
  }
  stack.push(entry);
  show();
}

// назад сначала закрывает галерею или панель
function back() {
  if (layers.length) {
    layers.pop()();
    buttons();
  } else if (stack.length > 1) {
    stack.pop();
    show(true);
  }
}

function buttons() {
  if (stack.length > 1 || layers.length) {
    tg.BackButton.show();
  } else {
    tg.BackButton.hide();
  }
}

function layer(close) {
  layers.push(close);
  buttons();
}

function closeLayers() {
  layers.splice(0).reverse().forEach(fn => fn());
  buttons();
}

function show(restore) {
  const top = stack[stack.length - 1];
  stop();
  closeLayers();
  leaving.splice(0).forEach(fn => fn());
  buttons();
  const y = restore ? top.y || 0 : 0;
  const sub = top.sub;
  const done = top.note ? notePage(top) : top.file ? filePage(top) : top.tag ? tagPage(top) : folderPage(top);
  remember();
  if (!sub) {
    window.scrollTo(0, y);
  }
  // формулы и картинки меняют высоту, позицию восстанавливаем ещё раз
  if (done && y) {
    done.then(() => {
      if (stack[stack.length - 1] === top) {
        window.scrollTo(0, y);
      }
    });
  }
}

function folderPage(top) {
  const d = tree.dirs.get(top.dir);
  if (!d) {
    view.innerHTML = head([], 'Папки уже нет');
    return null;
  }
  const k = tree.kids.get(d.id) || {dirs: [], files: []};
  const tools = d.id === tree.root && tree.full ? tool('refresh', 'rebuild', 'Перечитать Atlas целиком') : '';
  const note = d.id === tree.root && tree.t ? 'сверено с Drive ' + stamp(tree.t) : '';
  let html = head(trail(d.parent), d.name, tools, note) + finder() + '<div class="list" id="list">' + rows(k.dirs, k.files) + '</div>';
  if (d.id === tree.root) {
    const pinned = pins.map(id => tree.files.get(id)).filter(Boolean);
    const last = tree.full ? [...tree.files.values()].filter(f => f.md).sort((a, b) => b.time - a.time).slice(0, 6) : [];
    html += '<section id="recent">' + (pinned.length ? '<h2 class="label">Закреплённые</h2><div class="list">' + rows([], pinned, true) + '</div>' : '') + (last.length ? '<h2 class="label">Недавние</h2><div class="list">' + rows([], last, true) + '</div>' : '') + (homeScreen === 'missed' ? '<div class="list home"><button type="button" class="row more" data-home="1">' + icon('phone') + '<span class="name">Добавить иконку на главный экран</span></button></div>' : '') + '</section>';
  }
  view.innerHTML = html;
  spin();
  return null;
}

function head(crumbs, title, tools, note) {
  const nav = crumbs.length ? '<nav class="crumbs">' + crumbs.map(c => '<button type="button" data-dir="' + c.id + '">' + esc(c.name) + '</button>').join('<span>/</span>') + '</nav>' : '';
  const h1 = title ? '<h1>' + esc(title) + '</h1>' : '';
  // без крошек кнопки встают в строку заголовка
  if (tools && !nav) {
    return '<header class="head"><div class="top titled">' + (h1 || '<span></span>') + '<div class="tools">' + tools + '</div></div>' + (note ? '<p class="synced">' + note + '</p>' : '') + '</header>';
  }
  return '<header class="head">' + (tools ? '<div class="top">' + nav + '<div class="tools">' + tools + '</div></div>' : nav) + h1 + (note ? '<p class="synced">' + note + '</p>' : '') + '</header>';
}

function tool(name, act, label, on) {
  return '<button type="button" class="tool' + (on ? ' on' : '') + '" data-act="' + act + '" aria-label="' + label + '" title="' + label + '">' + icon(name) + '</button>';
}

// заметки с тегом из свойств и тег в тексте через сервер
function tagPage(top) {
  const name = top.tag;
  let html = head([], '#' + name) + '<div class="list" id="list">';
  if (!meta) {
    html += '<p class="quiet pad">загружается</p>';
  } else {
    const want = name.toLowerCase();
    const list = [];
    tagged().forEach((tags, id) => {
      const f = tree.files.get(id);
      if (f && tags.some(t => t === want || t.startsWith(want + '/'))) {
        list.push(f);
      }
    });
    list.sort((a, b) => collator.compare(a.name, b.name));
    html += (list.length ? rows([], list, true) : '<p class="quiet pad">в свойствах тега нет</p>');
  }
  html += '<button type="button" class="row more" data-text="' + esc(name) + '">' + icon('search') + '<span class="name">Искать #' + esc(name) + ' в тексте заметок</span></button></div>';
  view.innerHTML = html;
  return null;
}

function finder() {
  return '<form class="find" role="search">' + icon('search') + '<input type="search" name="q" placeholder="Поиск" enterkeyhint="search" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" aria-label="Поиск по названиям"></form>';
}

function rows(dirs, files, paths) {
  const where = id => {
    const names = trail(id).slice(1).map(d => d.name);
    return paths && names.length ? '<span class="where">' + esc(names.join(' / ')) + '</span>' : '';
  };
  const html = dirs.map(d => '<button type="button" class="row dir" data-dir="' + d.id + '">' + icon('folder') + '<span class="name">' + esc(d.name) + where(d.parent) + '</span>' + icon('chevron', 'chev') + '</button>').join('') + files.map(f => '<button type="button" class="row' + (folderNote(f) ? ' map' : '') + '" data-file="' + f.id + '">' + icon(sign(f)) + '<span class="name">' + esc(f.name) + where(f.parent) + '</span>' + (f.size >= 1048576 ? '<span class="meta">' + mb(f.size) + '</span>' : '') + '</button>').join('');
  return html || '<p class="quiet pad">пусто</p>';
}

// заметка папки как у folder-notes: "{папка} Map" внутри неё
function folderNote(f) {
  const d = tree.dirs.get(f.parent);
  return f.md && d && f.name.toLowerCase() === (d.name + ' map').toLowerCase();
}

function sign(f) {
  if (f.md) {
    return folderNote(f) ? 'map' : 'note';
  }
  if (PICTURE.test(f.file)) {
    return 'image';
  }
  const k = kind(f);
  return k === 'code' || k === 'ipynb' || k === 'html' ? 'code' : k === 'sheet' ? 'sheet' : 'file';
}

// поиск по названиям сразу при вводе, по тексту через сервер
function typed(e) {
  if (!e.target.matches('.find input')) {
    return;
  }
  const q = e.target.value.trim();
  const list = document.getElementById('list');
  const top = stack[stack.length - 1];
  const recent = document.getElementById('recent');
  if (recent) {
    recent.hidden = !!q;
  }
  if (!q) {
    const k = tree.kids.get(top.dir) || {dirs: [], files: []};
    list.innerHTML = rows(k.dirs, k.files);
    return;
  }
  const words = norm(q).split(/\s+/);
  const hit = s => words.every(w => norm(s).includes(w));
  const rank = s => norm(s).startsWith(words[0]) ? 0 : 1;
  const dirs = [...tree.dirs.values()].filter(d => d.id !== tree.root && hit(d.name)).sort((a, b) => rank(a.name) - rank(b.name) || collator.compare(a.name, b.name)).slice(0, 5);
  const files = [...tree.files.values()].filter(f => hit(f.name)).sort((a, b) => rank(a.name) - rank(b.name) || b.md - a.md || collator.compare(a.name, b.name)).slice(0, 50);
  list.innerHTML = (dirs.length || files.length ? rows(dirs, files, true) : '<p class="quiet pad">в названиях ничего</p>') + '<button type="button" class="row more" data-text="' + esc(q) + '">' + icon('search') + '<span class="name">Искать в тексте заметок</span></button>';
}

function deep(q) {
  const list = document.getElementById('list');
  const more = list && list.querySelector('.more');
  if (!more || more.disabled) {
    return;
  }
  more.disabled = true;
  more.querySelector('.name').textContent = 'поиск по тексту';
  call('find', {q: q}).then(data => {
    if (!more.isConnected) {
      return;
    }
    const seen = new Set([...list.querySelectorAll('[data-dir], [data-file]')].map(el => el.dataset.dir || el.dataset.file));
    const dirs = data.ids.filter(id => tree.dirs.has(id) && !seen.has(id)).map(id => tree.dirs.get(id));
    const files = data.ids.filter(id => tree.files.has(id) && !seen.has(id)).map(id => tree.files.get(id));
    more.outerHTML = dirs.length || files.length ? '<h2 class="label">В тексте</h2>' + rows(dirs, files, true) : '<p class="quiet pad">в тексте ничего</p>';
  }).catch(err => {
    if (more.isConnected) {
      more.disabled = false;
      more.querySelector('.name').textContent = message(err) + ' Повторить';
    }
  });
}

// ссылка из заметки уходит только через Telegram, само окно приложения никуда не переходит; у ссылки в SVG имя тега строчное
function follow(a) {
  const href = a.getAttribute('href') || a.getAttribute('xlink:href') || '';
  if (href.startsWith('#')) {
    const to = document.getElementById(decode(href.slice(1)));
    if (to) {
      to.scrollIntoView({block: 'center'});
    }
  } else if (/^https:\/\/t\.me\//i.test(href)) {
    tg.openTelegramLink(href);
  } else if (/^https?:/i.test(href)) {
    tg.openLink(href);
  }
}

function click(e) {
  const el = e.target.closest('[data-dir], [data-file], [data-text], [data-send], [data-act], [data-tag], [data-home], a, img.pic, .retry, .zoomable');
  if (!el) {
    return;
  }
  // касание после долгого нажатия уже открыло предпросмотр
  if (Date.now() - pressed < 600) {
    e.preventDefault();
    return;
  }
  if (el.dataset.act) {
    act(el);
  } else if (el.dataset.tag) {
    go({tag: el.dataset.tag});
  } else if (el.dataset.home) {
    tg.addToHomeScreen();
  } else if (el.dataset.dir) {
    go({dir: el.dataset.dir});
  } else if (el.dataset.file) {
    e.preventDefault();
    open(el.dataset.file, el.dataset.sub);
  } else if (el.dataset.text) {
    deep(el.dataset.text);
  } else if (el.dataset.send) {
    send(el);
  } else if (el.matches('a')) {
    e.preventDefault();
    follow(el);
  } else if (el.matches('img.pic.broken')) {
    el.classList.remove('broken');
    fetchPic(el);
  } else if (el.matches('img.pic')) {
    const all = [...el.closest('.note, #view').querySelectorAll('img.pic:not(.broken)')].filter(x => tree.files.has(x.dataset.id));
    const ids = [...new Set(all.map(x => x.dataset.id))];
    gallery(ids, Math.max(0, ids.indexOf(el.dataset.id)));
  } else if (el.classList.contains('zoomable')) {
    tap(el, e);
  } else if (retry) {
    retry();
  }
}

function open(id, sub) {
  const f = tree.files.get(id);
  const top = stack[stack.length - 1];
  if (!f) {
    return;
  }
  if (top.note === id && !layers.length) {
    if (sub) {
      jump(sub);
    }
  } else if (PICTURE.test(f.file)) {
    // картинка из списка листается вместе с соседними по папке
    const k = tree.kids.get(f.parent) || {files: []};
    const ids = k.files.filter(x => PICTURE.test(x.file)).map(x => x.id);
    gallery(ids.includes(id) ? ids : [id], Math.max(0, ids.indexOf(id)));
  } else {
    go(f.md ? {note: id, sub: sub} : {file: id});
  }
}

// кнопки шапки заметки: оглавление, закладка, ссылка
function act(el) {
  if (el.dataset.act === 'rebuild') {
    rebuild();
    return;
  }
  const top = stack[stack.length - 1];
  const f = top && tree.files.get(top.note || top.file);
  if (!f) {
    return;
  }
  if (el.dataset.act === 'toc') {
    outline();
  } else if (el.dataset.act === 'pin') {
    el.classList.toggle('on', pin(f.id));
  } else if (el.dataset.act === 'share') {
    const link = BOT + '?startapp=' + f.id;
    tg.openTelegramLink('https://t.me/share/url?url=' + encodeURIComponent(link) + '&text=' + encodeURIComponent(f.name));
  }
}

// сервер обходит весь Drive заново: помогает, когда лента изменений что-то пропустила
function rebuild() {
  if (rebuilding) {
    return;
  }
  rebuilding = true;
  spin();
  haptic('impact');
  const before = tree.files.size;
  call('rebuild').then(data => {
    write('tree', data);
    rebuilding = false;
    use(data);
    spin();
    loadMeta();
    const diff = tree.files.size - before;
    toast('Atlas перечитан' + (diff > 0 ? ', новых файлов: ' + diff : diff < 0 ? ', убрано файлов: ' + -diff : ', всё на месте'));
  }).catch(err => {
    rebuilding = false;
    spin();
    toast(message(err));
  });
}

// сегодня 05:20, вчера 23:10 или 25.10 14:00
function stamp(t) {
  const d = new Date(t);
  const day = x => x.toDateString();
  const now = new Date();
  const time = String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0');
  if (day(d) === day(now)) {
    return 'сегодня ' + time;
  }
  if (day(d) === day(new Date(now - 86400000))) {
    return 'вчера ' + time;
  }
  return String(d.getDate()).padStart(2, '0') + '.' + String(d.getMonth() + 1).padStart(2, '0') + ' ' + time;
}

function spin() {
  const b = view.querySelector('[data-act="rebuild"]');
  if (b) {
    b.classList.toggle('busy', rebuilding);
    b.disabled = rebuilding;
  }
}

function outline() {
  const hs = [...document.querySelectorAll('#note :is(h1, h2, h3, h4, h5, h6)')].filter(h => h.offsetParent !== null).slice(1);
  if (!hs.length) {
    toast('В заметке нет заголовков');
    return;
  }
  const min = Math.min(...hs.map(h => Number(h.tagName[1])));
  const panel = sheet('<h2 class="label">Оглавление</h2><div class="list toc">' + hs.map((h, i) => '<button type="button" class="row" data-h="' + i + '" style="padding-left:' + (10 + (Number(h.tagName[1]) - min) * 16) + 'px"><span class="name">' + esc(h.textContent.trim()) + '</span></button>').join('') + '</div>');
  panel.addEventListener('click', e => {
    const b = e.target.closest('[data-h]');
    if (b) {
      back();
      hs[Number(b.dataset.h)].scrollIntoView();
    }
  });
}

// панель снизу поверх страницы, закрывается кнопкой назад, касанием фона и Escape
function sheet(html) {
  const wrap = document.createElement('div');
  wrap.className = 'sheet';
  wrap.innerHTML = '<div class="sheet-back"></div><div class="sheet-panel" role="dialog">' + html + '</div>';
  document.body.append(wrap);
  document.documentElement.classList.add('locked');
  requestAnimationFrame(() => wrap.classList.add('open'));
  let gone = false;
  const close = () => {
    if (gone) {
      return;
    }
    gone = true;
    wrap.classList.remove('open');
    setTimeout(() => wrap.remove(), 220);
    if (!document.querySelector('.sheet.open, .gallery')) {
      document.documentElement.classList.remove('locked');
    }
  };
  wrap.firstElementChild.addEventListener('click', () => {
    const i = layers.indexOf(close);
    if (i >= 0) {
      layers.splice(i, 1);
      close();
      buttons();
    }
  });
  layer(close);
  return wrap.lastElementChild;
}

// долгое нажатие на ссылку показывает заметку в панели
function hold(e) {
  if (e.type === 'touchstart') {
    const a = e.touches.length === 1 && e.target.closest ? e.target.closest('a.internal[data-file]') : null;
    clearTimeout(hold.timer);
    if (!a) {
      return;
    }
    hold.x = e.touches[0].clientX;
    hold.y = e.touches[0].clientY;
    hold.timer = setTimeout(() => {
      pressed = Date.now();
      haptic('impact');
      peek(a.dataset.file, a.dataset.sub || '');
    }, 450);
  } else if (e.type === 'touchmove') {
    const t = e.touches[0];
    if (t && Math.hypot(t.clientX - hold.x, t.clientY - hold.y) > 8) {
      clearTimeout(hold.timer);
    }
  } else {
    clearTimeout(hold.timer);
  }
}

function peek(id, sub) {
  const f = tree.files.get(id);
  if (!f) {
    return;
  }
  const panel = sheet('<div class="peek-head"><span class="peek-name">' + esc(f.name + (sub ? ' > ' + sub.replace(/#/g, ' > ') : '')) + '</span><button type="button" class="act" data-go="1">Открыть</button></div><article class="note peek">' + (f.md ? '<p class="quiet">загружается</p>' : '<p class="quiet">' + esc(f.file) + '</p>') + '</article>');
  const body = panel.querySelector('.peek');
  panel.addEventListener('click', e => {
    const a = e.target.closest('[data-go], a.internal[data-file]');
    if (a && Date.now() - pressed > 600) {
      e.preventDefault();
      back();
      if (a.dataset.go) {
        open(id, sub);
      } else {
        open(a.dataset.file, a.dataset.sub);
      }
    }
  });
  if (!f.md) {
    return;
  }
  note(f).then(data => {
    if (!body.isConnected) {
      return;
    }
    const env = {from: f.parent, self: f};
    const t = document.createElement('template');
    t.innerHTML = md.render(prepare(part(data.text, sub)), env);
    clean(t.content);
    // имя уже в шапке панели
    const first = t.content.firstElementChild;
    if (first && /^H[1-6]$/.test(first.tagName)) {
      first.remove();
    }
    body.replaceChildren(t.content);
    extras(body, 1);
  }, err => {
    if (body.isConnected) {
      body.innerHTML = '<p class="quiet">' + esc(message(err)) + '</p>';
    }
  });
}

function notePage(top) {
  const f = tree.files.get(top.note);
  if (!f) {
    view.innerHTML = head([], 'Заметки уже нет');
    return null;
  }
  view.innerHTML = head(trail(f.parent), '', tool('toc', 'toc', 'Оглавление') + tool('star', 'pin', 'Закрепить', pins.includes(f.id)) + tool('share', 'share', 'Поделиться ссылкой')) + '<article class="note" id="note"></article><section id="back"></section>';
  backlinks(f.id);
  const body = document.getElementById('note');
  const have = notes.get(f.id);
  if (have && have.time === f.time) {
    return fill(body, have, top);
  }
  body.innerHTML = '<h1>' + esc(f.name) + '</h1><p class="quiet">загружается</p>';
  return note(f).then(data => {
    if (body.isConnected) {
      return fill(body, data, top);
    }
  }).catch(err => {
    if (body.isConnected) {
      body.innerHTML = '<h1>' + esc(f.name) + '</h1><p class="quiet">' + esc(message(err)) + '</p>';
    }
  });
}

// заметка из памяти, из IndexedDB или с сервера; без сети годится и старая копия
function note(f) {
  const have = notes.get(f.id);
  if (have && have.time === f.time) {
    return Promise.resolve(have);
  }
  return store.get('notes', f.id, f.time).then(saved => {
    if (saved) {
      notes.set(f.id, saved);
      return saved;
    }
    return call('note', {id: f.id}).then(data => {
      const rec = {id: f.id, time: f.time, text: data.text};
      notes.set(f.id, rec);
      store.put('notes', rec);
      Object.keys(data.files || {}).forEach(id => {
        const x = tree.files.get(id);
        if (x && !blobs.has(id)) {
          const b = toBlob(data.files[id], x);
          keep(id, b, x.time);
          store.put('files', {id: id, time: x.time, blob: b});
        }
      });
      return rec;
    }, err => store.get('notes', f.id, f.time, true).then(old => {
      if (!old || err.error === 'sign' || err.error === 'access' || err.error === 'gone') {
        throw err;
      }
      toast('Нет связи, показана сохранённая копия');
      return old;
    }));
  });
}

function fill(body, data, top) {
  const f = tree.files.get(data.id);
  const env = {from: f.parent, self: f, dv: []};
  const t = document.createElement('template');
  t.innerHTML = md.render(prepare(data.text), env);
  // без H1 в начале заголовком встаёт имя заметки
  let first = t.content.firstElementChild;
  if (!first || first.tagName !== 'H1') {
    first = document.createElement('h1');
    first.textContent = f.name;
    t.content.prepend(first);
  }
  first.insertAdjacentHTML('afterend', props(front(data.text), env));
  clean(t.content);
  body.replaceChildren(t.content);
  const done = Promise.all([extras(body, 0), blocks(body, f, data.text, env.dv)]);
  const sub = top.sub;
  if (sub) {
    top.sub = '';
    jump(sub);
    done.then(() => jump(sub));
  }
  return done;
}

function extras(root, depth) {
  return Promise.all([pictures(root), maths(root), diagrams(root), code(root), embeds(root, depth)]);
}

// свойства свёрнуты: в Obsidian блок свойств скрыт сниппетом dashboard
function props(fm, env) {
  const data = yaml(fm);
  const keys = Object.keys(data);
  if (!keys.length) {
    return '';
  }
  const value = (v, key) => {
    if (Array.isArray(v)) {
      return v.map(x => value(x, key)).join('');
    }
    if (v === null || v === '') {
      return '<span class="empty">пусто</span>';
    }
    if (typeof v === 'boolean') {
      return '<span class="task' + (v ? ' done' : '') + '"></span>';
    }
    if (key === 'tags') {
      return '<span class="tag" data-tag="' + esc(String(v).replace(/^#/, '')) + '">#' + esc(String(v).replace(/^#/, '')) + '</span>';
    }
    return '<span class="chip">' + md.renderInline(String(v), env) + '</span>';
  };
  return '<details class="props"><summary>' + icon('list') + '<span>Свойства</span>' + icon('fold', 'fold') + '</summary><dl>' + keys.map(k => '<dt>' + esc(k) + '</dt><dd>' + value(data[k], k.toLowerCase()) + '</dd>').join('') + '</dl></details>';
}

function front(text) {
  return (text.match(/^---\r?\n([\s\S]*?)\r?\n---[ \t]*(?:\r?\n|$)/) || [])[1] || '';
}

// YAML свойств Obsidian: скаляры, списки [a, b] и через дефис
function yaml(text) {
  const out = {};
  let key = null;
  (text || '').split(/\r?\n/).forEach(line => {
    if (!line.trim() || /^\s*#/.test(line)) {
      return;
    }
    const item = line.match(/^\s*-\s+(.*)$|^\s*-$/);
    if (item && key) {
      if (!Array.isArray(out[key])) {
        out[key] = [];
      }
      if (item[1] !== undefined) {
        out[key].push(scalar(item[1]));
      }
      return;
    }
    const m = line.match(/^([^\s:#-][^:]*?)\s*:(?:\s+(.*))?\s*$/);
    if (m) {
      key = m[1].trim();
      out[key] = m[2] === undefined || m[2].trim() === '' ? null : scalar(m[2]);
    }
  });
  return out;
}

function scalar(s) {
  s = s.trim();
  if (/^\[.*\]$/.test(s) && !/^\[\[.*\]\]$/.test(s)) {
    return s.slice(1, -1).split(',').map(scalar).filter(x => x !== '' && x !== null);
  }
  const q = s.match(/^"(.*)"$|^'(.*)'$/);
  if (q) {
    return q[1] !== undefined ? q[1].replace(/\\"/g, '"') : q[2].replace(/''/g, "'");
  }
  if (/^-?\d+(\.\d+)?$/.test(s)) {
    return Number(s);
  }
  if (/^(true|false)$/i.test(s)) {
    return s.toLowerCase() === 'true';
  }
  if (/^(null|~)$/i.test(s)) {
    return null;
  }
  return s.replace(/\s+#.*$/, '');
}

// ![[заметка]] и ![[заметка#раздел]] вставляются текстом, не глубже двух уровней
function embeds(root, depth) {
  return Promise.all([...root.querySelectorAll('.embed-note:not(.ready)')].map(box => {
    box.classList.add('ready');
    const f = tree.files.get(box.dataset.embed);
    const inner = box.querySelector('.embed-body');
    if (!f || depth >= 2) {
      inner.remove();
      return null;
    }
    return note(f).then(data => {
      const env = {from: f.parent, self: f};
      const t = document.createElement('template');
      t.innerHTML = md.render(prepare(part(data.text, box.dataset.sub || '')), env);
      clean(t.content);
      inner.replaceChildren(t.content);
      return extras(inner, depth + 1);
    }, err => {
      inner.textContent = message(err);
    });
  }));
}

// раздел заметки от заголовка до следующего того же или старшего уровня
function part(text, sub) {
  const body = text.replace(/^---\r?\n[\s\S]*?\r?\n---[ \t]*(?:\r?\n|$)/, '');
  if (!sub || sub.startsWith('^')) {
    return body;
  }
  const want = norm(sub.split('#').pop().trim());
  const lines = body.split('\n');
  const level = l => (l.match(/^(#{1,6})\s/) || [, ''])[1].length;
  const start = lines.findIndex(l => level(l) && norm(l.replace(/^#+\s+/, '').replace(/\s+#+\s*$/, '').trim()) === want);
  if (start < 0) {
    return body;
  }
  const end = lines.findIndex((l, i) => i > start && level(l) && level(l) <= level(lines[start]));
  return lines.slice(start, end < 0 ? lines.length : end).join('\n');
}

function code(root) {
  const nodes = [...root.querySelectorAll('pre > code[class*="language-"]:not(.hljs)')];
  if (!nodes.length) {
    return Promise.resolve();
  }
  return highlighter().then(hljs => {
    nodes.forEach(n => {
      const lang = (n.className.match(/language-(\S+)/) || [])[1];
      if (lang && hljs.getLanguage(lang)) {
        hljs.highlightElement(n);
      }
    });
  }).catch(() => {});
}

function highlighter() {
  if (!hljsReady) {
    hljsReady = script('vendor/highlight.min.js').then(() => window.hljs, err => {
      hljsReady = null;
      throw err;
    });
  }
  return hljsReady;
}

function filePage(top) {
  const f = tree.files.get(top.file);
  if (!f) {
    view.innerHTML = head([], 'Файла уже нет');
    return null;
  }
  const pic = PICTURE.test(f.file);
  const small = f.size <= 10 * 1048576;
  const pdf = /\.pdf$/i.test(f.file) && small;
  const doc = !pic && !pdf && small && kind(f);
  const info = (f.file.includes('.') ? f.file.split('.').pop().toUpperCase() + ', ' : '') + (f.size >= 1048576 ? mb(f.size) : Math.max(1, Math.round(f.size / 1024)) + ' КБ');
  const bar = '<div class="bar pad"><span class="quiet">' + esc(info) + '</span><button type="button" class="act" data-send="' + f.id + '">' + icon('send') + '<span>Прислать в чат</span></button></div>';
  const tools = tool('star', 'pin', 'Закрепить', pins.includes(f.id)) + tool('share', 'share', 'Поделиться ссылкой');
  view.innerHTML = head(trail(f.parent), f.name, tools) + (pic ? '<div class="viewer zoomable" id="viewer"><div class="zoom"><img alt="' + esc(f.name) + '"></div></div>' + bar : bar + (pdf ? '<div class="viewer pdf zoomable" id="viewer"><div class="zoom"><p class="quiet pad">загружается</p></div></div>' : doc ? '<div class="doc" id="viewer"><p class="quiet pad">загружается</p></div>' : ''));
  const box = document.getElementById('viewer');
  const fail = err => {
    if (box.isConnected) {
      box.outerHTML = '<p class="quiet pad">' + esc(message(err)) + '</p>';
    }
  };
  if (pdf) {
    return pdfPage(f, box).catch(fail);
  }
  if (doc) {
    return preview(f, box, {bytes: bytes, script: script, hljs: highlighter, render: (src, env) => md.render(prepare(src), env), clean: clean, decorate: el => extras(el, 1), env: x => ({from: x.parent, self: x}), esc: esc, leave: fn => leaving.push(fn)}).catch(fail);
  }
  if (!pic) {
    return null;
  }
  const img = box.querySelector('img');
  img.classList.toggle('svg', /\.svg$/i.test(f.file));
  return picture(f.id).then(src => {
    if (tones.has(f.id)) {
      img.dataset.tone = tones.get(f.id);
    }
    img.src = src;
  }).catch(fail);
}

// галерея на весь экран: листание, щипок, двойное касание, смахивание вниз закрывает
function gallery(ids, at) {
  if (!ids.length) {
    return;
  }
  const box = document.createElement('div');
  box.className = 'gallery';
  box.innerHTML = '<div class="g-stage"><img class="g-img" alt="" draggable="false"></div><div class="g-top"><span class="g-count"></span><button type="button" class="g-btn g-close" aria-label="Закрыть">' + icon('cross') + '</button></div><button type="button" class="g-btn g-prev" aria-label="Назад">' + icon('left') + '</button><button type="button" class="g-btn g-next" aria-label="Дальше">' + icon('chevron') + '</button><div class="g-bottom"><span class="g-name"></span><button type="button" class="act" data-send=""><span>Прислать в чат</span></button></div><p class="g-fail" hidden></p>';
  document.body.append(box);
  document.documentElement.classList.add('locked');
  const stage = box.querySelector('.g-stage');
  const img = box.querySelector('.g-img');
  const fail = box.querySelector('.g-fail');
  const sendBtn = box.querySelector('[data-send]');
  // k масштаб, x и y сдвиг картинки от её места в разметке
  const s = {i: at, k: 1, x: 0, y: 0};
  const pts = new Map();
  let g = null;
  let lastTap = 0;
  let gone = false;
  const apply = smooth => {
    img.style.transition = smooth ? 'transform .22s ease, opacity .18s' : 'none';
    img.style.transform = 'translate(' + s.x + 'px,' + s.y + 'px) scale(' + s.k + ')';
  };
  // край картинки не заходит внутрь экрана, меньшая экрана по центру
  const clamp = () => {
    const W = stage.clientWidth;
    const H = stage.clientHeight;
    const w = img.offsetWidth * s.k;
    const h = img.offsetHeight * s.k;
    const L = img.offsetLeft;
    const T = img.offsetTop;
    s.x = w <= W ? (W - w) / 2 - L : Math.min(-L, Math.max(W - w - L, s.x));
    s.y = h <= H ? (H - h) / 2 - T : Math.min(-T, Math.max(H - h - T, s.y));
  };
  const zoomAt = (k, cx, cy) => {
    const r = stage.getBoundingClientRect();
    const px = cx - r.left - img.offsetLeft;
    const py = cy - r.top - img.offsetTop;
    k = Math.min(Math.max(k, 1), 6);
    s.x = px - (px - s.x) * k / s.k;
    s.y = py - (py - s.y) * k / s.k;
    s.k = k;
  };
  const reset = () => {
    s.k = 1;
    s.x = 0;
    s.y = 0;
  };
  const showAt = i => {
    s.i = (i + ids.length) % ids.length;
    const f = tree.files.get(ids[s.i]);
    reset();
    apply(false);
    img.style.opacity = '0';
    img.removeAttribute('src');
    img.dataset.tone = '';
    img.classList.toggle('svg', /\.svg$/i.test(f.file));
    fail.hidden = true;
    box.querySelector('.g-count').textContent = ids.length > 1 ? (s.i + 1) + ' из ' + ids.length : '';
    box.querySelector('.g-name').textContent = f.name;
    sendBtn.dataset.send = f.id;
    sendBtn.disabled = false;
    sendBtn.querySelector('span').textContent = 'Прислать в чат';
    box.classList.toggle('single', ids.length < 2);
    const want = s.i;
    picture(f.id).then(src => {
      if (gone || want !== s.i) {
        return;
      }
      if (tones.has(f.id)) {
        img.dataset.tone = tones.get(f.id);
      }
      img.src = src;
      return img.decode().catch(() => {}).then(() => {
        if (want === s.i) {
          img.style.opacity = '1';
        }
      });
    }, err => {
      if (want === s.i) {
        fail.textContent = message(err);
        fail.hidden = false;
      }
    });
    // соседние заранее
    [s.i + 1, s.i - 1].forEach(j => picture(ids[(j + ids.length) % ids.length]).catch(() => {}));
  };
  const step = d => {
    if (ids.length > 1) {
      haptic('select');
      showAt(s.i + d);
    }
  };
  const close = () => {
    gone = true;
    box.classList.add('closing');
    setTimeout(() => box.remove(), 180);
    if (!document.querySelector('.sheet.open')) {
      document.documentElement.classList.remove('locked');
    }
  };
  const toggleZoom = (cx, cy) => {
    if (s.k > 1) {
      reset();
    } else {
      zoomAt(2.5, cx, cy);
    }
    clamp();
    apply(true);
  };
  stage.addEventListener('pointerdown', e => {
    try {
      stage.setPointerCapture(e.pointerId);
    } catch (err) {
    }
    pts.set(e.pointerId, {x: e.clientX, y: e.clientY});
    if (pts.size === 1) {
      g = {x: e.clientX, y: e.clientY, sx: s.x, sy: s.y, moved: false, t: Date.now()};
    } else if (pts.size === 2) {
      const [a, b] = [...pts.values()];
      g = {pinch: true, d: Math.hypot(a.x - b.x, a.y - b.y) || 1, k: s.k, moved: true};
    }
  });
  stage.addEventListener('pointermove', e => {
    if (!pts.has(e.pointerId) || !g) {
      return;
    }
    pts.set(e.pointerId, {x: e.clientX, y: e.clientY});
    if (g.pinch && pts.size === 2) {
      const [a, b] = [...pts.values()];
      zoomAt(g.k * Math.hypot(a.x - b.x, a.y - b.y) / g.d, (a.x + b.x) / 2, (a.y + b.y) / 2);
      apply(false);
      return;
    }
    if (g.pinch) {
      return;
    }
    const dx = e.clientX - g.x;
    const dy = e.clientY - g.y;
    if (Math.hypot(dx, dy) > 6) {
      g.moved = true;
    }
    if (s.k > 1) {
      s.x = g.sx + dx;
      s.y = g.sy + dy;
      clamp();
      apply(false);
    } else if (g.moved) {
      // при обычном масштабе картинка идёт за пальцем: вбок листать, вниз закрыть
      g.axis = g.axis || (Math.abs(dx) > Math.abs(dy) ? 'x' : 'y');
      s.x = g.axis === 'x' ? dx : 0;
      s.y = g.axis === 'y' ? Math.max(0, dy) : 0;
      apply(false);
      box.style.setProperty('--fade', g.axis === 'y' ? String(Math.max(.3, 1 - s.y / 400)) : '1');
    }
  });
  const up = e => {
    if (!pts.has(e.pointerId)) {
      return;
    }
    pts.delete(e.pointerId);
    if (!g) {
      return;
    }
    if (g.pinch) {
      if (!pts.size) {
        g = null;
        if (s.k < 1.05) {
          reset();
        }
        clamp();
        apply(true);
      }
      return;
    }
    const dx = e.clientX - g.x;
    const dy = e.clientY - g.y;
    const moved = g.moved;
    const axis = g.axis;
    g = null;
    box.style.setProperty('--fade', '1');
    if (!moved && e.type === 'pointerup') {
      const now = Date.now();
      if (now - lastTap < 300) {
        lastTap = 0;
        toggleZoom(e.clientX, e.clientY);
      } else {
        lastTap = now;
        setTimeout(() => {
          if (lastTap === now) {
            box.classList.toggle('bare');
          }
        }, 300);
      }
      return;
    }
    if (s.k > 1) {
      return;
    }
    if (axis === 'x' && Math.abs(dx) > 60 && ids.length > 1) {
      step(dx < 0 ? 1 : -1);
    } else if (axis === 'y' && dy > 110) {
      back();
    } else {
      reset();
      apply(true);
    }
  };
  stage.addEventListener('pointerup', up);
  stage.addEventListener('pointercancel', up);
  stage.addEventListener('wheel', e => {
    e.preventDefault();
    zoomAt(s.k * Math.exp(-e.deltaY / 300), e.clientX, e.clientY);
    clamp();
    apply(false);
  }, {passive: false});
  box.querySelector('.g-close').addEventListener('click', () => back());
  box.querySelector('.g-prev').addEventListener('click', () => step(-1));
  box.querySelector('.g-next').addEventListener('click', () => step(1));
  sendBtn.addEventListener('click', () => send(sendBtn));
  const keys = e => {
    if (e.key === 'ArrowRight') {
      step(1);
    } else if (e.key === 'ArrowLeft') {
      step(-1);
    }
  };
  document.addEventListener('keydown', keys);
  window.addEventListener('resize', onResize);
  function onResize() {
    clamp();
    apply(false);
  }
  layer(() => {
    document.removeEventListener('keydown', keys);
    window.removeEventListener('resize', onResize);
    close();
  });
  showAt(at);
}

function pdfLib() {
  if (!pdfjs) {
    pdfjs = import('./vendor/pdfjs/pdf.min.mjs').then(lib => {
      lib.GlobalWorkerOptions.workerSrc = new URL('vendor/pdfjs/pdf.worker.min.mjs', location.href).href;
      return lib;
    }, err => {
      pdfjs = null;
      throw err;
    });
  }
  return pdfjs;
}

// страницы рисуются, когда подходят к экрану, и стираются вдали: у WebKit мало памяти на canvas
async function pdfPage(f, box) {
  const [lib, data] = await Promise.all([pdfLib().catch(() => Promise.reject({error: 'view'})), bytes(f.id)]);
  const doc = await lib.getDocument({data: data, cMapUrl: 'vendor/pdfjs/cmaps/', cMapPacked: true, standardFontDataUrl: 'vendor/pdfjs/standard_fonts/', isEvalSupported: false}).promise.catch(() => Promise.reject({error: 'view'}));
  if (!box.isConnected) {
    doc.destroy();
    return;
  }
  const first = (await doc.getPage(1)).getViewport({scale: 1});
  const inner = box.firstElementChild;
  inner.replaceChildren();
  const slots = [];
  for (let i = 1; i <= doc.numPages; i++) {
    const slot = document.createElement('div');
    slot.className = 'page';
    slot.style.aspectRatio = first.width + ' / ' + first.height;
    slot.n = i;
    inner.append(slot);
    slots.push(slot);
  }
  const free = slot => {
    if (slot.task) {
      slot.task.cancel();
    }
    const c = slot.firstChild;
    if (c) {
      c.width = 0;
      c.height = 0;
      slot.replaceChildren();
    }
    slot.scale = 0;
  };
  const draw = async slot => {
    const page = await doc.getPage(slot.n);
    const one = page.getViewport({scale: 1});
    slot.style.aspectRatio = one.width + ' / ' + one.height;
    // canvas в WebKit не больше 16 млн пикселей
    const scale = Math.min(slot.clientWidth * Math.min(window.devicePixelRatio || 1, 2) / one.width, Math.sqrt(16e6 / (one.width * one.height)));
    if (!scale || Math.abs((slot.scale || 0) - scale) < .01) {
      return;
    }
    slot.scale = scale;
    if (slot.task) {
      slot.task.cancel();
    }
    const vp = page.getViewport({scale: scale});
    const canvas = document.createElement('canvas');
    canvas.width = Math.floor(vp.width);
    canvas.height = Math.floor(vp.height);
    const task = page.render({canvasContext: canvas.getContext('2d'), viewport: vp});
    slot.task = task;
    try {
      await task.promise;
    } catch (err) {
      return;
    }
    if (slot.task === task) {
      slot.task = null;
      slot.replaceChildren(canvas);
    }
  };
  const io = new IntersectionObserver(list => list.forEach(e => (e.isIntersecting ? draw(e.target) : free(e.target))), {rootMargin: '1200px 0px'});
  slots.forEach(s => io.observe(s));
  box.onzoom = () => slots.filter(s => s.scale).forEach(draw);
  leaving.push(() => {
    io.disconnect();
    slots.forEach(free);
    doc.destroy();
  });
}

// двойное касание приближает к точке касания и возвращает обратно
function tap(box, e) {
  const now = Date.now();
  if (tap.box === box && now - tap.last < 320) {
    tap.last = 0;
    zoom(box, (box.k || 1) > 1 ? 1 : 2.5, e.clientX, e.clientY);
    if (box.onzoom) {
      box.onzoom();
    }
  } else {
    tap.box = box;
    tap.last = now;
  }
}

// щипок двумя пальцами, точка между пальцами остаётся на месте
function pinch(e) {
  const box = e.target.closest ? e.target.closest('.zoomable') : null;
  const gap = t => Math.hypot(t[0].clientX - t[1].clientX, t[0].clientY - t[1].clientY);
  if (e.type === 'touchstart' && box && e.touches.length === 2) {
    e.preventDefault();
    pinch.box = box;
    pinch.d = gap(e.touches) || 1;
    pinch.k = box.k || 1;
  } else if (e.type === 'touchmove' && pinch.box && e.touches.length === 2) {
    e.preventDefault();
    const t = e.touches;
    zoom(pinch.box, pinch.k * gap(t) / pinch.d, (t[0].clientX + t[1].clientX) / 2, (t[0].clientY + t[1].clientY) / 2);
  } else if ((e.type === 'touchend' || e.type === 'touchcancel') && pinch.box && e.touches.length < 2) {
    const b = pinch.box;
    pinch.box = null;
    if (b.onzoom) {
      b.onzoom();
    }
  }
}

function zoom(box, k, x, y) {
  const old = box.k || 1;
  k = Math.min(Math.max(k, 1), 5);
  if (Math.abs(k - old) < .001) {
    return;
  }
  const r = box.getBoundingClientRect();
  const px = box.scrollLeft + x - r.left;
  const py = y - r.top;
  box.k = k;
  box.classList.toggle('zoomed', k > 1);
  box.firstElementChild.style.width = k * 100 + '%';
  box.scrollLeft = px * k / old - (x - r.left);
  window.scrollBy(0, py * k / old - py);
}

function send(el) {
  const label = el.querySelector('span');
  el.disabled = true;
  label.textContent = 'отправляется';
  call('send', {id: el.dataset.send}).then(() => {
    label.textContent = 'Файл в чате';
  }).catch(err => {
    el.disabled = false;
    label.textContent = 'Прислать в чат';
    toast(message(err));
  });
}

function toast(text) {
  const box = document.getElementById('toast');
  box.textContent = text;
  box.hidden = false;
  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => {
    box.hidden = true;
  }, 2600);
}

function problem(err, again) {
  retry = again;
  const can = err.error !== 'sign' && err.error !== 'access';
  view.innerHTML = '<div class="pad"><p class="quiet">' + esc(message(err)) + '</p>' + (can ? '<button type="button" class="act retry">Повторить</button>' : '') + '</div>';
}

function message(err) {
  return ERRORS[err && err.error] || ERRORS.fail;
}

function jump(sub) {
  const want = norm(sub.split('#').pop().trim());
  const h = [...document.querySelectorAll('#note :is(h1, h2, h3, h4, h5, h6)')].find(x => norm(x.textContent.trim()) === want);
  if (h) {
    h.scrollIntoView();
  }
}

// картинки в свёрнутых callout ждут раскрытия, сломанная грузится заново по касанию
function pictures(body) {
  return Promise.all([...body.querySelectorAll('img.pic:not([src]):not(.broken)')].filter(img => !img.parentElement.closest('details:not([open])')).map(fetchPic));
}

function fetchPic(img) {
  const f = tree.files.get(img.dataset.id);
  if (!f) {
    img.classList.add('broken');
    return Promise.resolve();
  }
  img.classList.toggle('svg', /\.svg$/i.test(f.file));
  return picture(f.id).then(src => {
    if (tones.has(f.id)) {
      img.dataset.tone = tones.get(f.id);
    }
    img.src = src;
    return img.decode().catch(() => {});
  }, () => img.classList.add('broken'));
}

function picture(id) {
  const f = tree.files.get(id);
  if (!f) {
    return Promise.reject({error: 'gone'});
  }
  const key = id + ':' + f.time;
  if (pics.has(key)) {
    return Promise.resolve(pics.get(key));
  }
  if (!pending.has(key)) {
    pending.set(key, fileBlob(id).then(b => {
      const src = URL.createObjectURL(b);
      pics.set(key, src);
      pending.delete(key);
      return /\.svg$/i.test(f.file) ? b.text().then(t => {
        tones.set(id, tone(t));
        return src;
      }) : src;
    }, err => {
      pending.delete(key);
      throw err;
    }));
  }
  return pending.get(key);
}

// рисунок светлыми линиями по прозрачному фону или тёмными: средняя яркость цветов линий, заливок и текста
function tone(svg) {
  const lum = [];
  for (const m of svg.matchAll(/(?:fill|stroke|color)\s*[:=]\s*["']?\s*(#[0-9a-f]{3,8}\b|rgba?\([^)]*\)|white|black)/gi)) {
    const c = m[1].toLowerCase();
    let rgb = null;
    if (c === 'white') {
      rgb = [255, 255, 255];
    } else if (c === 'black') {
      rgb = [0, 0, 0];
    } else if (c[0] === '#') {
      const h = c.length <= 5 ? c.slice(1, 4).split('').map(x => x + x).join('') : c.slice(1, 7);
      rgb = [0, 2, 4].map(i => parseInt(h.slice(i, i + 2), 16));
    } else {
      rgb = (c.match(/[\d.]+/g) || []).slice(0, 3).map(Number);
    }
    if (rgb.length === 3 && rgb.every(x => !isNaN(x))) {
      lum.push((.2126 * rgb[0] + .7152 * rgb[1] + .0722 * rgb[2]) / 255);
    }
  }
  // без цветов SVG рисуется чёрным
  const avg = lum.length ? lum.reduce((a, b) => a + b, 0) / lum.length : 0;
  return avg > .5 ? 'light' : avg < .35 ? 'dark' : '';
}

// файл из памяти, из IndexedDB или с сервера, к серверу не больше LANES запросов сразу
function fileBlob(id) {
  const f = tree.files.get(id);
  if (!f) {
    return Promise.reject({error: 'gone'});
  }
  const have = blobs.get(id);
  if (have && have.time === f.time) {
    return Promise.resolve(have.blob);
  }
  return store.get('files', id, f.time).then(rec => {
    if (rec) {
      keep(id, rec.blob, f.time);
      return rec.blob;
    }
    return lane(() => call('file', {id: id})).then(data => {
      const b = toBlob(data.data, f);
      keep(id, b, f.time);
      store.put('files', {id: id, time: f.time, blob: b});
      return b;
    });
  });
}

function keep(id, b, time) {
  blobs.delete(id);
  blobs.set(id, {blob: b, time: time});
  if (blobs.size > 6) {
    blobs.delete(blobs.keys().next().value);
  }
}

function lane(fn) {
  return new Promise((ok, fail) => {
    waiting.push(() => fn().then(ok, fail).finally(() => {
      lanes--;
      next();
    }));
    next();
  });
}

function next() {
  while (lanes < LANES && waiting.length) {
    lanes++;
    waiting.shift()();
  }
}

function toBlob(b64, f) {
  const s = atob(b64);
  const out = new Uint8Array(s.length);
  for (let i = 0; i < s.length; i++) {
    out[i] = s.charCodeAt(i);
  }
  return new Blob([out], {type: TYPES[f.file.split('.').pop().toLowerCase()] || 'application/octet-stream'});
}

// байты файла копией: pdf.js забирает буфер себе
function bytes(id) {
  return fileBlob(id).then(b => b.arrayBuffer()).then(buf => new Uint8Array(buf));
}

function text(f) {
  return f.md ? note(f).then(data => data.text) : bytes(f.id).then(b => new TextDecoder().decode(b));
}

// MathJax грузится с первой формулой, TeX остаётся текстом, если не загрузился
function maths(body) {
  const nodes = [...body.querySelectorAll('.math:not(.ready)')];
  nodes.forEach(n => n.classList.add('ready'));
  if (!nodes.length) {
    return Promise.resolve();
  }
  if (!mathjax) {
    window.MathJax = {startup: {typeset: false}, svg: {fontCache: 'local'}};
    mathjax = script('vendor/tex-svg-full.js').then(() => window.MathJax.startup.promise).then(() => {
      document.head.append(window.MathJax.svgStylesheet());
    }, err => {
      mathjax = null;
      throw err;
    });
  }
  // по 40 формул за раз, длинный билет не подвешивает прокрутку
  return mathjax.then(async () => {
    for (let i = 0; i < nodes.length; i += 40) {
      nodes.slice(i, i + 40).forEach(n => {
        try {
          n.replaceChildren(window.MathJax.tex2svg(n.textContent, {display: n.classList.contains('display')}));
        } catch (err) {
          n.classList.add('broken');
        }
      });
      await new Promise(ok => setTimeout(ok));
    }
    // строчная формула шире колонки получает свою прокрутку
    const edge = body.getBoundingClientRect().right - parseFloat(getComputedStyle(body).paddingRight);
    nodes.filter(n => !n.classList.contains('display') && n.getBoundingClientRect().right > edge + 1).forEach(n => n.classList.add('wide'));
  }).catch(() => {});
}

function diagrams(body) {
  const nodes = [...body.querySelectorAll('.mermaid:not(.ready)')];
  nodes.forEach(n => n.classList.add('ready'));
  if (!nodes.length) {
    return Promise.resolve();
  }
  if (!mermaidReady) {
    mermaidReady = script('vendor/mermaid.min.js').then(() => {
      const css = getComputedStyle(document.documentElement);
      const v = name => css.getPropertyValue(name).trim();
      const dark = document.documentElement.dataset.scheme === 'dark';
      window.mermaid.initialize({startOnLoad: false, securityLevel: 'strict', theme: 'base', themeVariables: {darkMode: dark, background: v('--bg'), fontFamily: getComputedStyle(document.body).fontFamily, fontSize: '14px', primaryColor: mix(v('--accent'), v('--bg'), .16), primaryTextColor: v('--text'), primaryBorderColor: mix(v('--accent'), v('--bg'), .45), lineColor: v('--muted'), secondaryColor: mix(v('--text'), v('--bg'), .08), tertiaryColor: mix(v('--text'), v('--bg'), .05), textColor: v('--text'), edgeLabelBackground: v('--bg')}});
    }, err => {
      mermaidReady = null;
      throw err;
    });
  }
  return mermaidReady.then(async () => {
    for (const n of nodes) {
      try {
        const out = await window.mermaid.render('mermaid' + (++seq), n.textContent);
        n.innerHTML = out.svg;
      } catch (err) {
        n.classList.add('broken');
      }
    }
  }).catch(() => {});
}

function script(src) {
  return new Promise((ok, fail) => {
    const s = document.createElement('script');
    s.src = src;
    s.onload = ok;
    s.onerror = fail;
    document.head.append(s);
  });
}

// смесь двух #rrggbb, k доля первого
function mix(a, b, k) {
  const rgb = s => {
    const h = s.replace('#', '');
    return [0, 2, 4].map(i => parseInt(h.length === 3 ? h[i / 2] + h[i / 2] : h.slice(i, i + 2), 16));
  };
  const x = rgb(a);
  const y = rgb(b);
  return '#' + x.map((c, i) => Math.round(c * k + y[i] * (1 - k)).toString(16).padStart(2, '0')).join('');
}

// frontmatter, комментарии %% и метки ^блоков убираются, код не трогается
function prepare(text) {
  const code = [];
  return text.replace(/^---\r?\n(?:[\s\S]*?\r?\n)?---[ \t]*(?:\r?\n|$)/, '')
    .replace(/^(`{3,}|~{3,})[^\n]*\n[\s\S]*?^\1[ \t]*$/gm, m => '@@code' + (code.push(m) - 1) + '@@')
    .replace(/%%[\s\S]*?%%/g, '')
    .replace(/ \^[\w-]+$/gm, '')
    .replace(/@@code(\d+)@@/g, (m, n) => code[Number(n)]);
}

// адрес со схемой проходит только из списка; пробелы и управляющие знаки браузер в схеме выбрасывает, здесь тоже
const SAFE_HREF = /^(https?|mailto|tel):/i;
const SAFE_SRC = /^(https?:|blob:|data:image\/)/i;

function clean(root) {
  root.querySelectorAll('script, style, iframe, frame, object, embed, link, meta, base, form, animate, set').forEach(n => n.remove());
  root.querySelectorAll('*').forEach(n => {
    [...n.attributes].forEach(a => {
      const v = a.value.replace(/[\x00-\x20\x7f]/g, '');
      const scheme = /^[a-z][a-z0-9+.-]*:/i.test(v);
      if (/^on/i.test(a.name) || (/^(href|xlink:href|action|formaction)$/i.test(a.name) && scheme && !SAFE_HREF.test(v)) || (a.name === 'src' && scheme && !SAFE_SRC.test(v))) {
        n.removeAttribute(a.name);
      }
    });
  });
}

// markdown как в Obsidian: переносы строк, [[ссылки]], ![[вставки]], callout, $формулы$, ==выделение==, #теги, задачи
function markdown() {
  const m = window.markdownit({html: true, breaks: true, linkify: true});
  m.inline.ruler.before('link', 'wikilink', wikilink);
  m.inline.ruler.before('escape', 'math', mathInline);
  m.inline.ruler.before('emphasis', 'mark', mark);
  m.inline.ruler.push('tag', tag);
  m.block.ruler.before('fence', 'math_block', mathBlock, {alt: ['paragraph', 'reference', 'blockquote', 'list']});
  m.core.ruler.before('inline', 'callout', callouts);
  m.core.ruler.push('tasks', tasks);
  if (window.markdownitFootnote) {
    m.use(window.markdownitFootnote);
  }
  const r = m.renderer.rules;
  r.footnote_caption = (tokens, i) => String(tokens[i].meta.id + 1) + (tokens[i].meta.subId > 0 ? '.' + tokens[i].meta.subId : '');
  const fence = r.fence;
  r.wikilink = (tokens, i, opts, env) => link(tokens[i].content, env);
  r.wikiembed = (tokens, i, opts, env) => embed(tokens[i].content, env);
  r.math_inline = (tokens, i) => '<span class="math">' + esc(tokens[i].content) + '</span>';
  r.math_display = (tokens, i) => '<span class="math display">' + esc(tokens[i].content) + '</span>';
  r.math_block = (tokens, i) => '<div class="math display">' + esc(tokens[i].content) + '</div>';
  r.mark_open = () => '<mark>';
  r.mark_close = () => '</mark>';
  r.tag = (tokens, i) => '<span class="tag" data-tag="' + esc(tokens[i].content) + '">#' + esc(tokens[i].content) + '</span>';
  r.table_open = () => '<div class="table"><table>';
  r.table_close = () => '</table></div>';
  r.fence = (tokens, i, opts, env, self) => {
    const lang = tokens[i].info.trim().split(/\s+/)[0].toLowerCase();
    if (lang === 'mermaid') {
      return '<div class="mermaid">' + esc(tokens[i].content) + '</div>';
    }
    if (lang === 'dataviewjs' && env.dv) {
      return '<div class="dv block-language-dataviewjs" data-n="' + (env.dv.push(tokens[i].content) - 1) + '"></div>';
    }
    if (lang === 'dataview' || lang === 'dataviewjs') {
      return '<div class="stub">' + lang + ' считается только в Obsidian</div>';
    }
    return fence(tokens, i, opts, env, self);
  };
  r.image = (tokens, i, opts, env, self) => {
    const t = tokens[i];
    const src = t.attrGet('src') || '';
    const alt = self.renderInlineAsText(t.children, opts, env);
    if (/^(https?|data):/i.test(src)) {
      return '<img src="' + esc(src) + '" alt="' + esc(alt) + '">';
    }
    const f = resolve(decode(src), env);
    return f && PICTURE.test(f.file) ? '<img class="pic" data-id="' + f.id + '" alt="' + esc(alt) + '">' : '<span class="unresolved">' + esc(alt || src) + '</span>';
  };
  r.link_open = (tokens, i, opts, env, self) => {
    const t = tokens[i];
    const href = t.attrGet('href') || '';
    if (/^obsidian:/i.test(href)) {
      const file = (href.match(/[?&]file=([^&]+)/) || [])[1];
      const f = file ? resolve(decode(file), env) : null;
      t.attrs = f ? [['class', 'internal'], ['data-file', f.id]] : [['class', 'internal unresolved']];
    } else if (/^[a-z][a-z0-9+.-]*:/i.test(href)) {
      t.attrSet('class', 'external');
    } else {
      const [path, sub] = decode(href).split('#');
      const f = path ? resolve(path, env) : env.self;
      t.attrs = [['class', f ? 'internal' : 'internal unresolved']].concat(f ? [['data-file', f.id]] : [], sub ? [['data-sub', sub]] : []);
    }
    return self.renderToken(tokens, i, opts);
  };
  r.blockquote_open = (tokens, i, opts, env, self) => {
    const c = tokens[i].meta;
    if (!c) {
      return self.renderToken(tokens, i, opts);
    }
    return (c.fold ? '<details class="callout"' + (c.fold === '+' ? ' open' : '') : '<div class="callout"') + ' data-callout="' + esc(c.type) + '">';
  };
  r.blockquote_close = (tokens, i, opts, env, self) => {
    const c = tokens[i].meta;
    if (!c) {
      return self.renderToken(tokens, i, opts);
    }
    return '</div>' + (c.fold ? '</details>' : '</div>');
  };
  r.callout_title_open = (tokens, i) => (tokens[i].meta.fold ? '<summary' : '<div') + ' class="callout-title">' + icon(CALLOUTS[tokens[i].meta.type] || 'pencil') + '<span class="callout-title-inner">';
  r.callout_title_close = (tokens, i) => '</span>' + (tokens[i].meta.fold ? icon('fold', 'fold') + '</summary>' : '</div>') + '<div class="callout-content">';
  return m;
}

function wikilink(state, silent) {
  const src = state.src;
  let pos = state.pos;
  const embed = src.charCodeAt(pos) === 0x21;
  if (embed) {
    pos++;
  }
  if (src.charCodeAt(pos) !== 0x5B || src.charCodeAt(pos + 1) !== 0x5B) {
    return false;
  }
  const end = src.indexOf(']]', pos + 2);
  if (end < 0 || end > state.posMax) {
    return false;
  }
  const inner = src.slice(pos + 2, end);
  if (!inner.trim() || inner.includes('\n') || inner.includes('[[')) {
    return false;
  }
  if (!silent) {
    state.push(embed ? 'wikiembed' : 'wikilink', '', 0).content = inner;
  }
  state.pos = end + 2;
  return true;
}

// $...$ по правилам Pandoc: после открывающего и перед закрывающим не пробел, за закрывающим не цифра; $$...$$ в строке
function mathInline(state, silent) {
  const src = state.src;
  const start = state.pos;
  if (src.charCodeAt(start) !== 0x24) {
    return false;
  }
  const display = src.charCodeAt(start + 1) === 0x24;
  const from = start + (display ? 2 : 1);
  if (!display && /\s/.test(src[from] || ' ')) {
    return false;
  }
  let end = -1;
  for (let i = from; i < state.posMax; i++) {
    if (src[i] === '\\') {
      i++;
    } else if (src[i] === '$' && (display ? src[i + 1] === '$' : !/\s/.test(src[i - 1]) && !/\d/.test(src[i + 1] || ''))) {
      end = i;
      break;
    }
  }
  if (end <= from) {
    return false;
  }
  if (!silent) {
    state.push(display ? 'math_display' : 'math_inline', 'math', 0).content = src.slice(from, end).trim();
  }
  state.pos = end + (display ? 2 : 1);
  return true;
}

// блок $$ на отдельных строках, в том числе внутри списков и callout
function mathBlock(state, startLine, endLine, silent) {
  const start = state.bMarks[startLine] + state.tShift[startLine];
  if (state.sCount[startLine] - state.blkIndent >= 4 || state.src.slice(start, start + 2) !== '$$') {
    return false;
  }
  const first = state.src.slice(start + 2, state.eMarks[startLine]).trim();
  if (first.includes('$$') && !first.endsWith('$$')) {
    return false;
  }
  let line = startLine;
  let found = first.length > 2 && first.endsWith('$$');
  while (!found) {
    line++;
    if (line >= endLine) {
      return false;
    }
    const s = state.bMarks[line] + state.tShift[line];
    const e = state.eMarks[line];
    if (s < e && state.sCount[line] < state.blkIndent) {
      return false;
    }
    found = state.src.slice(s, e).trim().endsWith('$$');
  }
  if (silent) {
    return true;
  }
  const text = state.getLines(startLine, line + 1, state.blkIndent, false).trim();
  const token = state.push('math_block', 'math', 0);
  token.block = true;
  token.content = text.slice(2, -2).trim();
  token.map = [startLine, line + 1];
  state.line = line + 1;
  return true;
}

function mark(state, silent) {
  const src = state.src;
  const start = state.pos;
  if (src.charCodeAt(start) !== 0x3D || src.charCodeAt(start + 1) !== 0x3D) {
    return false;
  }
  const end = src.indexOf('==', start + 2);
  if (end < 0 || end === start + 2 || end > state.posMax || /\s/.test(src[start + 2]) || src.slice(start + 2, end).includes('\n')) {
    return false;
  }
  if (!silent) {
    state.push('mark_open', 'mark', 1);
    const max = state.posMax;
    state.pos = start + 2;
    state.posMax = end;
    state.md.inline.tokenize(state);
    state.posMax = max;
    state.push('mark_close', 'mark', -1);
  }
  state.pos = end + 2;
  return true;
}

// #тег после пробела или в начале строки, не из одних цифр
function tag(state, silent) {
  const src = state.src;
  const pos = state.pos;
  if (src.charCodeAt(pos) !== 0x23 || (pos > 0 && !/\s/.test(src[pos - 1]))) {
    return false;
  }
  const m = src.slice(pos + 1, state.posMax).match(/^[\p{L}\p{N}_/-]+/u);
  if (!m || /^[\d_/-]+$/.test(m[0])) {
    return false;
  }
  if (!silent) {
    state.push('tag', '', 0).content = m[0];
  }
  state.pos = pos + 1 + m[0].length;
  return true;
}

// > [!type]+ заголовок: blockquote становится callout, первая строка уходит в заголовок
function callouts(state) {
  const tokens = state.tokens;
  for (let i = 0; i + 2 < tokens.length; i++) {
    const open = tokens[i];
    const inline = tokens[i + 2];
    if (open.type !== 'blockquote_open' || tokens[i + 1].type !== 'paragraph_open' || inline.type !== 'inline') {
      continue;
    }
    const m = inline.content.match(/^\[!([^\]\s]+)\]([+-]?)[ \t]*(.*)/);
    if (!m) {
      continue;
    }
    const type = m[1].toLowerCase();
    const meta = {type: type, fold: m[2]};
    let depth = 0;
    for (let j = i; j < tokens.length; j++) {
      if (tokens[j].type === 'blockquote_open') {
        depth++;
      } else if (tokens[j].type === 'blockquote_close' && --depth === 0) {
        tokens[j].meta = meta;
        break;
      }
    }
    open.meta = meta;
    const title = new state.Token('inline', '', 0);
    title.content = m[3].trim() || type.charAt(0).toUpperCase() + type.slice(1);
    title.children = [];
    title.map = inline.map;
    const tOpen = new state.Token('callout_title_open', 'div', 1);
    const tClose = new state.Token('callout_title_close', 'div', -1);
    tOpen.meta = meta;
    tClose.meta = meta;
    const rest = inline.content.slice(m[0].length).replace(/^\r?\n/, '');
    if (rest.trim()) {
      inline.content = rest;
      tokens.splice(i + 1, 0, tOpen, title, tClose);
    } else {
      tokens.splice(i + 1, 3, tOpen, title, tClose);
    }
  }
}

function tasks(state) {
  const t = state.tokens;
  for (let i = 2; i < t.length; i++) {
    if (t[i].type !== 'inline' || t[i - 2].type !== 'list_item_open') {
      continue;
    }
    const first = t[i].children[0];
    const m = first && first.type === 'text' && first.content.match(/^\[([ xX])\]\s+/);
    if (!m) {
      continue;
    }
    const done = m[1] !== ' ';
    first.content = first.content.slice(m[0].length);
    const box = new state.Token('html_inline', '', 0);
    box.content = '<span class="task' + (done ? ' done' : '') + '"></span>';
    t[i].children.unshift(box);
    t[i - 2].attrJoin('class', done ? 'task-item done' : 'task-item');
  }
}

// [[цель#заголовок|подпись]], в таблицах черта экранирована
function parts(inner) {
  const s = inner.replace(/\\\|/g, '|');
  const bar = s.indexOf('|');
  const ref = bar < 0 ? s : s.slice(0, bar);
  const hash = ref.indexOf('#');
  return {target: (hash < 0 ? ref : ref.slice(0, hash)).trim(), sub: hash < 0 ? '' : ref.slice(hash + 1).trim(), alias: bar < 0 ? '' : s.slice(bar + 1).trim()};
}

function link(inner, env) {
  const p = parts(inner);
  const f = p.target ? resolve(p.target, env) : env.self;
  const text = p.alias || (p.target && p.sub ? p.target + ' > ' + p.sub.replace(/#/g, ' > ') : p.target || p.sub);
  if (!f) {
    return '<span class="internal unresolved">' + esc(text) + '</span>';
  }
  return '<a class="internal" data-file="' + f.id + '"' + (p.sub ? ' data-sub="' + esc(p.sub) + '"' : '') + '>' + esc(text) + '</a>';
}

function embed(inner, env) {
  const p = parts(inner);
  const f = resolve(p.target, env);
  if (!f) {
    return '<span class="unresolved">' + esc(p.alias || p.target) + '</span>';
  }
  if (PICTURE.test(f.file)) {
    const size = p.alias.match(/^(\d+)(?:x(\d+))?$/) || [];
    return '<img class="pic" data-id="' + f.id + '" alt="' + esc(size[1] ? f.name : p.alias || f.name) + '"' + (size[1] ? ' width="' + size[1] + '"' : '') + (size[2] ? ' height="' + size[2] + '"' : '') + '>';
  }
  const a = '<a class="internal embed" data-file="' + f.id + '"' + (p.sub ? ' data-sub="' + esc(p.sub) + '"' : '') + '>' + icon(f.md ? 'note' : 'file') + esc(p.alias || f.name + (p.sub ? ' > ' + p.sub.replace(/#/g, ' > ') : '')) + '</a>';
  return f.md ? '<span class="embed-note" data-embed="' + f.id + '"' + (p.sub ? ' data-sub="' + esc(p.sub) + '"' : '') + '>' + a + '<span class="embed-body"></span></span>' : a;
}

// цель ссылки по имени, при совпадении имён по хвосту пути, потом из папки заметки
function resolve(target, env) {
  const path = target.trim().replace(/\\$/, '').replace(/^\.?\//, '').toLowerCase();
  if (!path) {
    return null;
  }
  const base = path.split('/').pop();
  const list = tree.notes.get(base.replace(/\.md$/, '')) || tree.names.get(base) || [];
  if (list.length < 2) {
    return list[0] || null;
  }
  const tail = '/' + path.replace(/\.md$/, '');
  const full = f => ('/' + trail(f.parent).map(d => d.name).concat(f.name).join('/')).toLowerCase();
  return list.find(f => full(f).endsWith(tail)) || list.find(f => f.parent === env.from) || list[0];
}

function decode(s) {
  try {
    return decodeURIComponent(s);
  } catch (err) {
    return s;
  }
}

function icon(name, cls) {
  return '<svg class="' + (cls || 'ico') + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + ICONS[name] + '</svg>';
}

function mb(size) {
  return Math.round(size / 1048576) + ' МБ';
}

function norm(s) {
  return s.toLowerCase().replace(/ё/g, 'е');
}

function esc(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
