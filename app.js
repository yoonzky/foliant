const API = 'https://script.google.com/macros/s/AKfycbwp_Qa67i2jicpv2Kj900XPD5GFlCbDIGcKXE_3OyzjYP-jp-K_BvXIaHPEGwsA5put9Q/exec';
const PICTURE = /\.(png|jpe?g|gif|webp|svg|bmp|avif)$/i;
const TYPES = {png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg', gif: 'image/gif', webp: 'image/webp', svg: 'image/svg+xml', bmp: 'image/bmp', avif: 'image/avif'};
const ERRORS = {
  sign: 'Сессия устарела. Закрой приложение и открой снова из чата.',
  access: 'Папки закрыты. Доступ выдаёт владелец в чате с ботом.',
  gone: 'Файла уже нет.',
  big: 'Файл больше 10 МБ, его можно прислать в чат.',
  bad: 'Сервер не понял запрос.',
  fail: 'Ошибка на сервере.',
  net: 'Нет связи с сервером.',
};
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
let seq = 0;

start();

function start() {
  if (!tg || !tg.initData) {
    view.innerHTML = '<p class="quiet pad">Открывается кнопкой в чате с <a href="https://t.me/TheFoliantBot">@TheFoliantBot</a></p>';
    return;
  }
  user = String((tg.initDataUnsafe.user || {}).id || '');
  md = markdown();
  history.scrollRestoration = 'manual';
  tg.expand();
  paint();
  tg.onEvent('themeChanged', paint);
  tg.BackButton.onClick(back);
  if (tg.isVersionAtLeast('7.7')) {
    tg.disableVerticalSwipes();
  }
  view.addEventListener('click', click);
  // без touchstart WebKit не показывает :active при касании
  document.addEventListener('touchstart', () => {}, {passive: true});
  view.addEventListener('input', typed);
  view.addEventListener('submit', e => {
    e.preventDefault();
    const input = e.target.querySelector('input');
    input.blur();
    if (input.value.trim()) {
      deep(input.value.trim());
    }
  });
  const saved = read();
  if (saved) {
    use(saved);
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

function load() {
  call('tree').then(data => {
    write(data);
    use(data);
  }).catch(err => {
    if (err.error === 'sign' || err.error === 'access') {
      forget();
      tree = null;
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
  document.documentElement.classList.toggle('guarded', !tree.full);
  if (first || !stack.length || stack[0].dir !== tree.root) {
    stack.length = 0;
    stack.push({dir: tree.root});
    show();
    return;
  }
  // свежее дерево перерисовывает открытую папку, если в ней не идёт поиск
  const top = stack[stack.length - 1];
  const input = view.querySelector('.find input');
  if (top.dir && !(input && input.value)) {
    const y = window.scrollY;
    show();
    window.scrollTo(0, y);
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

function read() {
  try {
    return JSON.parse(localStorage.getItem('tree' + user));
  } catch (err) {
    return null;
  }
}

function write(data) {
  try {
    localStorage.setItem('tree' + user, JSON.stringify(data));
  } catch (err) {
  }
}

function forget() {
  try {
    localStorage.removeItem('tree' + user);
  } catch (err) {
  }
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

function back() {
  if (stack.length > 1) {
    stack.pop();
    show(true);
  }
}

function show(restore) {
  const top = stack[stack.length - 1];
  if (stack.length > 1) {
    tg.BackButton.show();
  } else {
    tg.BackButton.hide();
  }
  const y = restore ? top.y || 0 : 0;
  const sub = top.sub;
  const done = top.note ? notePage(top) : top.file ? filePage(top) : folderPage(top);
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
  let html = head(trail(d.parent), d.name) + finder() + '<div class="list" id="list">' + rows(k.dirs, k.files) + '</div>';
  if (d.id === tree.root && tree.full) {
    const last = [...tree.files.values()].filter(f => f.md).sort((a, b) => b.time - a.time).slice(0, 6);
    html += '<section id="recent"><h2 class="label">Недавние</h2><div class="list">' + rows([], last, true) + '</div></section>';
  }
  view.innerHTML = html;
  return null;
}

function head(crumbs, title) {
  const nav = crumbs.length ? '<nav class="crumbs">' + crumbs.map(c => '<button type="button" data-dir="' + c.id + '">' + esc(c.name) + '</button>').join('<span>/</span>') + '</nav>' : '';
  return '<header class="head">' + nav + (title ? '<h1>' + esc(title) + '</h1>' : '') + '</header>';
}

function finder() {
  return '<form class="find" role="search">' + icon('search') + '<input type="search" name="q" placeholder="Поиск" enterkeyhint="search" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" aria-label="Поиск по названиям"></form>';
}

function rows(dirs, files, paths) {
  const where = id => {
    const names = trail(id).slice(1).map(d => d.name);
    return paths && names.length ? '<span class="where">' + esc(names.join(' / ')) + '</span>' : '';
  };
  const html = dirs.map(d => '<button type="button" class="row dir" data-dir="' + d.id + '">' + icon('folder') + '<span class="name">' + esc(d.name) + where(d.parent) + '</span>' + icon('chevron', 'chev') + '</button>').join('') + files.map(f => '<button type="button" class="row" data-file="' + f.id + '">' + icon(f.md ? 'note' : PICTURE.test(f.file) ? 'image' : 'file') + '<span class="name">' + esc(f.name) + where(f.parent) + '</span>' + (f.size >= 1048576 ? '<span class="meta">' + mb(f.size) + '</span>' : '') + '</button>').join('');
  return html || '<p class="quiet pad">пусто</p>';
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

function click(e) {
  const el = e.target.closest('[data-dir], [data-file], [data-text], [data-send], a, img.pic, .retry, #viewer');
  if (!el) {
    return;
  }
  if (el.dataset.dir) {
    go({dir: el.dataset.dir});
  } else if (el.dataset.file) {
    e.preventDefault();
    open(el.dataset.file, el.dataset.sub);
  } else if (el.dataset.text) {
    deep(el.dataset.text);
  } else if (el.dataset.send) {
    send(el);
  } else if (el.tagName === 'A') {
    e.preventDefault();
    const href = el.getAttribute('href') || '';
    if (/^https:\/\/t\.me\//i.test(href)) {
      tg.openTelegramLink(href);
    } else if (/^https?:/i.test(href)) {
      tg.openLink(href);
    }
  } else if (el.matches('img.pic')) {
    go({file: el.dataset.id});
  } else if (el.id === 'viewer') {
    el.classList.toggle('zoom');
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
  if (top.note === id) {
    if (sub) {
      jump(sub);
    }
  } else {
    go(f.md ? {note: id, sub: sub} : {file: id});
  }
}

function notePage(top) {
  const f = tree.files.get(top.note);
  if (!f) {
    view.innerHTML = head([], 'Заметки уже нет');
    return null;
  }
  view.innerHTML = head(trail(f.parent), '') + '<article class="note" id="note"></article>';
  const body = document.getElementById('note');
  const have = notes.get(f.id);
  if (have && have.time === f.time) {
    return fill(body, have, top);
  }
  body.innerHTML = '<h1>' + esc(f.name) + '</h1><p class="quiet">загружается</p>';
  return call('note', {id: f.id}).then(data => {
    notes.set(f.id, data);
    if (body.isConnected) {
      return fill(body, data, top);
    }
  }).catch(err => {
    if (body.isConnected) {
      body.innerHTML = '<h1>' + esc(f.name) + '</h1><p class="quiet">' + esc(message(err)) + '</p>';
    }
  });
}

function fill(body, data, top) {
  const f = tree.files.get(data.id);
  Object.keys(data.files || {}).forEach(id => {
    if (!pics.has(id) && tree.files.has(id)) {
      pics.set(id, url(id, data.files[id]));
    }
  });
  const t = document.createElement('template');
  t.innerHTML = md.render(prepare(data.text), {from: f.parent, self: f});
  clean(t.content);
  // без H1 в начале заголовком встаёт имя заметки
  const first = t.content.firstElementChild;
  if (!first || first.tagName !== 'H1') {
    const h = document.createElement('h1');
    h.textContent = f.name;
    t.content.prepend(h);
  }
  body.replaceChildren(t.content);
  const done = Promise.all([pictures(body), maths(body), diagrams(body)]);
  const sub = top.sub;
  if (sub) {
    top.sub = '';
    jump(sub);
    done.then(() => jump(sub));
  }
  return done;
}

function filePage(top) {
  const f = tree.files.get(top.file);
  if (!f) {
    view.innerHTML = head([], 'Файла уже нет');
    return null;
  }
  const pic = PICTURE.test(f.file);
  const info = (f.file.includes('.') ? f.file.split('.').pop().toUpperCase() + ', ' : '') + (f.size >= 1048576 ? mb(f.size) : Math.max(1, Math.round(f.size / 1024)) + ' КБ');
  view.innerHTML = head(trail(f.parent), f.name) + (pic ? '<div class="viewer" id="viewer"><img alt="' + esc(f.name) + '"></div>' : '') + '<p class="quiet pad">' + esc(info) + '</p><div class="pad"><button type="button" class="act" data-send="' + f.id + '">' + icon('send') + '<span>Прислать в чат</span></button></div>';
  if (!pic) {
    return null;
  }
  const img = view.querySelector('#viewer img');
  return (pics.has(f.id) ? Promise.resolve(pics.get(f.id)) : picture(f.id)).then(src => {
    img.src = src;
  }).catch(err => {
    const box = document.getElementById('viewer');
    if (box) {
      box.outerHTML = '<p class="quiet pad">' + esc(message(err)) + '</p>';
    }
  });
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

function pictures(body) {
  return Promise.all([...body.querySelectorAll('img.pic')].map(img => {
    const id = img.dataset.id;
    return (pics.has(id) ? Promise.resolve(pics.get(id)) : picture(id)).then(src => {
      img.src = src;
      return img.decode().catch(() => {});
    }, () => img.classList.add('broken'));
  }));
}

function picture(id) {
  if (!pending.has(id)) {
    pending.set(id, call('file', {id: id}).then(data => {
      const src = url(id, data.data);
      pics.set(id, src);
      return src;
    }, err => {
      pending.delete(id);
      throw err;
    }));
  }
  return pending.get(id);
}

function url(id, data) {
  const f = tree.files.get(id);
  const ext = f ? f.file.split('.').pop().toLowerCase() : '';
  return 'data:' + (TYPES[ext] || 'application/octet-stream') + ';base64,' + data;
}

// MathJax грузится с первой формулой, TeX остаётся текстом, если не загрузился
function maths(body) {
  const nodes = [...body.querySelectorAll('.math')];
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
  }).catch(() => {});
}

function diagrams(body) {
  const nodes = [...body.querySelectorAll('.mermaid')];
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

function clean(root) {
  root.querySelectorAll('script, style, iframe, frame, object, embed, link, meta, base, form').forEach(n => n.remove());
  root.querySelectorAll('*').forEach(n => {
    [...n.attributes].forEach(a => {
      if (/^on/i.test(a.name) || (/^(href|src|xlink:href|action|formaction)$/i.test(a.name) && /^\s*(javascript|vbscript|data:text)/i.test(a.value))) {
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
  const r = m.renderer.rules;
  const fence = r.fence;
  r.wikilink = (tokens, i, opts, env) => link(tokens[i].content, env);
  r.wikiembed = (tokens, i, opts, env) => embed(tokens[i].content, env);
  r.math_inline = (tokens, i) => '<span class="math">' + esc(tokens[i].content) + '</span>';
  r.math_display = (tokens, i) => '<span class="math display">' + esc(tokens[i].content) + '</span>';
  r.math_block = (tokens, i) => '<div class="math display">' + esc(tokens[i].content) + '</div>';
  r.mark_open = () => '<mark>';
  r.mark_close = () => '</mark>';
  r.tag = (tokens, i) => '<span class="tag">#' + esc(tokens[i].content) + '</span>';
  r.table_open = () => '<div class="table"><table>';
  r.table_close = () => '</table></div>';
  r.fence = (tokens, i, opts, env, self) => {
    const lang = tokens[i].info.trim().split(/\s+/)[0].toLowerCase();
    if (lang === 'mermaid') {
      return '<div class="mermaid">' + esc(tokens[i].content) + '</div>';
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
  return '<a class="internal embed" data-file="' + f.id + '"' + (p.sub ? ' data-sub="' + esc(p.sub) + '"' : '') + '>' + icon(f.md ? 'note' : 'file') + esc(p.alias || f.name) + '</a>';
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
