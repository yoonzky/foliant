// dataviewjs и dv.view как в Obsidian: dv поверх дерева и метаданных с сервера, хранилище только на чтение
const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor;
// карта по смыслу считается на Mac и тянет API Obsidian
const SKIP = ['semantic-map'];
const scripts = new Map();
const timers = [];
let host = null;
let libs = null;
let chart = null;
let paths = null;

export function setup(h) {
  host = h;
  helpers();
}

// интервалы блоков снимаются при уходе со страницы
export function stop() {
  timers.splice(0).forEach(id => {
    clearInterval(id);
    clearTimeout(id);
  });
}

export function blocks(root, f, text, codes) {
  const boxes = [...root.querySelectorAll('.dv')];
  if (!boxes.length) {
    return Promise.resolve();
  }
  window.app = window.app || fakeApp();
  window.renderHeatmapCalendar = window.renderHeatmapCalendar || ((el, data) => {
    const div = document.createElement('div');
    div.className = 'stub';
    div.textContent = 'календарь Heatmap Calendar считается только в Obsidian';
    el.append(div);
  });
  return ready(codes.join('\n')).then(() => Promise.all(boxes.map(box => {
    const code = codes[Number(box.dataset.n)];
    const dv = api(box, f, text);
    return new AsyncFunction('dv', code).call(dv, dv).catch(err => fail(box, err)).then(() => host.decorate(box));
  })));
}

// moment нужен почти всем блокам, Chart.js только с renderChart
function ready(code) {
  if (!libs) {
    libs = host.script('vendor/moment.min.js').catch(() => {
      libs = null;
    });
  }
  const need = [libs];
  if (/renderChart/.test(code)) {
    if (!chart) {
      chart = host.script('vendor/chart.umd.min.js').then(() => {
        const css = getComputedStyle(document.documentElement);
        window.Chart.defaults.color = css.getPropertyValue('--muted').trim();
        window.Chart.defaults.borderColor = css.getPropertyValue('--rule').trim();
        window.Chart.defaults.font.family = getComputedStyle(document.body).fontFamily;
        window.renderChart = (config, el) => {
          const canvas = document.createElement('canvas');
          el.append(canvas);
          return new window.Chart(canvas, config);
        };
      }, () => {
        chart = null;
      });
    }
    need.push(chart);
  }
  return Promise.all(need);
}

function fail(box, err) {
  const div = document.createElement('div');
  div.className = 'stub';
  div.textContent = 'dataviewjs: ' + (err && err.message ? err.message : String(err));
  box.append(div);
}

function api(container, f, text) {
  const self = path(f);
  const dv = {
    container: container,
    currentFilePath: self,
    app: window.app,
    component: {registerInterval: id => timers.push(id), register: () => {}, registerEvent: () => {}, registerDomEvent: (el, type, fn) => el.addEventListener(type, fn), addChild: () => {}},
    io: {load: p => load(p, f)},
    el: (tag, value, opts) => put(container.createEl(tag, opts), value, f),
    paragraph: (value, opts) => dv.el('p', value, opts),
    span: (value, opts) => dv.el('span', value, opts),
    header: (level, value, opts) => dv.el('h' + level, value, opts),
    list: (items, opts) => {
      const ul = container.createEl('ul', opts);
      wrap(items).forEach(x => put(ul.createEl('li'), x, f));
      return ul;
    },
    table: (heads, rows) => {
      const box = container.createDiv({cls: 'table'});
      const table = box.createEl('table');
      const tr = table.createEl('thead').createEl('tr');
      heads.forEach(h => put(tr.createEl('th'), h, f));
      const body = table.createEl('tbody');
      wrap(rows).forEach(row => {
        const r = body.createEl('tr');
        wrap(row).forEach(x => put(r.createEl('td'), x, f));
      });
      return box;
    },
    fileLink: (p, embed, display) => new Link(p, display),
    current: () => page(f, text),
    page: p => {
      const x = file(String(p), f);
      return x && x.md ? page(x) : undefined;
    },
    pages: source => wrap(pages(source, f)),
    array: a => wrap(a),
    isArray: a => Array.isArray(a) || a instanceof Data,
    date: s => (window.moment ? window.moment(s) : new Date(s)),
    view: (name, input) => view(name, input, dv, f),
  };
  return dv;
}

// значение в ячейку или абзац: ссылка, элемент, список или markdown
function put(el, value, f) {
  if (value instanceof Node) {
    el.append(value);
  } else if (value instanceof Data || Array.isArray(value)) {
    wrap(value).forEach((x, i) => {
      if (i) {
        el.append(', ');
      }
      put(el.createSpan(), x, f);
    });
  } else if (value !== undefined && value !== null) {
    const html = host.inline(value instanceof Link ? value.toString() : String(value), {from: f.parent, self: f});
    const t = document.createElement('template');
    t.innerHTML = html;
    host.clean(t.content);
    el.append(t.content);
  }
  return el;
}

class Link {
  constructor(p, display) {
    this.path = p;
    this.display = display;
  }

  toString() {
    return '[[' + this.path + (this.display ? '|' + this.display : '') + ']]';
  }

  markdown() {
    return this.toString();
  }
}

// время файла с теми методами Luxon, что зовут блоки
class Time {
  constructor(ms) {
    this.ts = ms;
  }

  toMillis() {
    return this.ts;
  }

  valueOf() {
    return this.ts;
  }

  toISODate() {
    return new Date(this.ts + 3 * 3600000).toISOString().slice(0, 10);
  }

  toString() {
    return new Date(this.ts).toISOString();
  }

  toFormat(fmt) {
    return window.moment ? window.moment(this.ts).format(fmt.replace(/yyyy/g, 'YYYY').replace(/dd/g, 'DD')) : this.toString();
  }
}

// массив Dataview: where, sort, first и остальное, что зовут блоки
class Data {
  constructor(list) {
    this.values = list;
  }

  get length() {
    return this.values.length;
  }

  [Symbol.iterator]() {
    return this.values[Symbol.iterator]();
  }

  where(fn) {
    return wrap(this.values.filter(fn));
  }

  filter(fn) {
    return this.where(fn);
  }

  map(fn) {
    return wrap(this.values.map(fn));
  }

  flatMap(fn) {
    return wrap(this.values.flatMap(x => {
      const v = fn(x);
      return v instanceof Data ? v.values : v;
    }));
  }

  forEach(fn) {
    this.values.forEach(fn);
  }

  sort(key, dir, cmp) {
    const by = typeof key === 'function' ? key : x => x;
    const sign = dir === 'desc' ? -1 : 1;
    return wrap(this.values.slice().sort((a, b) => sign * (cmp ? cmp(by(a), by(b)) : compare(by(a), by(b)))));
  }

  groupBy(fn) {
    const groups = new Map();
    this.values.forEach(x => {
      const k = fn(x);
      if (!groups.has(k)) {
        groups.set(k, []);
      }
      groups.get(k).push(x);
    });
    return wrap([...groups].map(([key, rows]) => ({key: key, rows: wrap(rows)})));
  }

  first() {
    return this.values[0];
  }

  last() {
    return this.values[this.values.length - 1];
  }

  limit(n) {
    return wrap(this.values.slice(0, n));
  }

  slice(a, b) {
    return wrap(this.values.slice(a, b));
  }

  array() {
    return this.values.slice();
  }

  find(fn) {
    return this.values.find(fn);
  }

  some(fn) {
    return this.values.some(fn);
  }

  every(fn) {
    return this.values.every(fn);
  }

  includes(x) {
    return this.values.includes(x);
  }

  join(sep) {
    return this.values.join(sep);
  }

  distinct(fn) {
    const seen = new Set();
    return this.where(x => {
      const k = fn ? fn(x) : x;
      return !seen.has(k) && seen.add(k);
    });
  }
}

function wrap(list) {
  if (list instanceof Data) {
    return list;
  }
  return new Data(Array.isArray(list) ? list : list === undefined || list === null ? [] : [...list]);
}

const collator = new Intl.Collator('ru', {numeric: true});

function compare(a, b) {
  if (a === b) {
    return 0;
  }
  if (a === undefined || a === null) {
    return -1;
  }
  if (b === undefined || b === null) {
    return 1;
  }
  if (typeof a === 'number' && typeof b === 'number') {
    return a - b;
  }
  if (a instanceof Time || b instanceof Time) {
    return Number(a) - Number(b);
  }
  return collator.compare(String(a), String(b));
}

// путь от корня Atlas, как в Obsidian
function path(f) {
  return host.trail(f.parent).slice(1).map(d => d.name).concat(f.file).join('/');
}

function folder(f) {
  return host.trail(f.parent).slice(1).map(d => d.name).join('/');
}

// файл по пути от корня или по имени, как getFirstLinkpathDest
function file(p, from) {
  const tree = host.tree();
  if (!paths || paths.tree !== tree) {
    paths = {tree: tree, map: new Map([...tree.files.values()].map(x => [path(x), x]))};
  }
  const clean = p.replace(/^\/+/, '');
  return paths.map.get(clean) || paths.map.get(clean + '.md') || host.resolve(clean, {from: from ? from.parent : ''});
}

function tfile(f) {
  if (!f) {
    return null;
  }
  const dot = f.file.lastIndexOf('.');
  return {path: path(f), name: f.file, basename: dot > 0 ? f.file.slice(0, dot) : f.file, extension: dot > 0 ? f.file.slice(dot + 1).toLowerCase() : '', stat: {mtime: f.time * 1000, ctime: f.time * 1000, size: f.size}, parent: {path: folder(f)}};
}

function load(p, from) {
  const f = file(String(p), from);
  return f ? host.text(f) : Promise.resolve(undefined);
}

// страница Dataview из frontmatter, строк с полями и ссылок
function page(f, text) {
  const n = text === undefined ? (host.meta() ? host.meta().notes.get(f.id) : null) : scan(text);
  const fm = host.yaml(n ? n.fm : '');
  const p = {};
  Object.keys(fm).forEach(k => {
    p[k] = fm[k];
    p[k.toLowerCase().replace(/\s+/g, '-')] = fm[k];
  });
  const items = (n ? n.fields : []).map(line => item(line));
  const tags = [].concat(fm.tags || []).map(t => '#' + String(t).replace(/^#/, ''));
  p.file = {
    name: f.name,
    basename: f.name,
    path: path(f),
    folder: folder(f),
    ext: 'md',
    link: new Link(path(f)),
    size: f.size,
    mtime: new Time(f.time * 1000),
    ctime: new Time(f.time * 1000),
    mday: new Time(f.time * 1000),
    frontmatter: fm,
    tags: wrap(tags),
    etags: wrap(tags),
    aliases: wrap([].concat(fm.aliases || [])),
    lists: wrap(items),
    tasks: wrap(items.filter(x => x.task)),
    outlinks: wrap((n ? n.links : []).map(t => new Link(t))),
  };
  return p;
}

// те же правила, что у сервера для метаданных
function scan(text) {
  const fm = (text.match(/^---\r?\n([\s\S]*?)\r?\n---[ \t]*(?:\r?\n|$)/) || [])[1] || '';
  const body = text.replace(/^(`{3,}|~{3,})[^\n]*\n[\s\S]*?^\1[ \t]*$/gm, '').replace(/%%[\s\S]*?%%/g, '');
  const links = [...body.matchAll(/\[\[([^\]|#\n]+)/g)].map(m => m[1].trim());
  const fields = body.split('\n').filter(l => /^\s*(?:[-*+]|\d+[.)])\s/.test(l) && l.includes('::')).map(l => l.trim());
  return {fm: fm, links: links, fields: fields};
}

// пункт списка с полями (ключ:: значение) и [ключ:: значение]
function item(line) {
  const m = line.match(/^(?:[-*+]|\d+[.)])\s+(?:\[(.)\]\s+)?(.*)$/) || [, undefined, line];
  const it = {text: m[2], task: m[1] !== undefined, completed: m[1] !== undefined && m[1] !== ' ', fields: {}};
  const add = (k, v) => {
    const value = parse(v);
    it[k.trim()] = value;
    it[k.trim().toLowerCase().replace(/\s+/g, '-')] = value;
  };
  let found = false;
  for (const x of m[2].matchAll(/[(\[]([^()\[\]:]+?)::\s*([^()\[\]]*?)[)\]]/g)) {
    add(x[1], x[2]);
    found = true;
  }
  const whole = !found && m[2].match(/^([^:]+?)::\s*(.*)$/);
  if (whole) {
    add(whole[1], whole[2]);
  }
  return it;
}

function parse(v) {
  v = v.trim();
  if (/^-?\d+(\.\d+)?$/.test(v)) {
    return Number(v);
  }
  if (/^(true|false)$/i.test(v)) {
    return v.toLowerCase() === 'true';
  }
  const link = v.match(/^\[\[([^\]|]+)(?:\|([^\]]*))?\]\]$/);
  return link ? new Link(link[1], link[2]) : v;
}

// источник dv.pages: "папка", #тег, их сочетания через and и or, пусто значит все заметки
function pages(source, from) {
  const tree = host.tree();
  const all = [...tree.files.values()].filter(x => x.md && (!host.meta() || host.meta().notes.has(x.id) || x === from));
  const test = s => {
    s = s.trim();
    const folderMatch = s.match(/^"([^"]*)"$/);
    if (folderMatch) {
      const want = folderMatch[1].replace(/\/+$/, '');
      return x => !want || path(x) === want || path(x) === want + '.md' || path(x).startsWith(want + '/');
    }
    if (s.startsWith('#')) {
      const tag = s.slice(1).toLowerCase();
      return x => page(x).file.tags.some(t => t.toLowerCase() === '#' + tag || t.toLowerCase().startsWith('#' + tag + '/'));
    }
    return () => true;
  };
  let fn = () => true;
  if (source && String(source).trim()) {
    const ors = String(source).split(/\s+or\s+/i).map(part => part.split(/\s+and\s+/i).map(test));
    fn = x => ors.some(ands => ands.every(t => t(x)));
  }
  return all.filter(fn).map(x => page(x));
}

// dv.view: скрипт имя.js или имя/view.js по имени из любой папки
async function view(name, input, dv, f) {
  if (SKIP.includes(name)) {
    const div = dv.container.createDiv({cls: 'stub'});
    div.textContent = name + ' считается только в Obsidian';
    return;
  }
  const f2 = file(name + '.js', f) || file(name + '/view.js', f);
  if (!f2) {
    throw new Error('нет скрипта ' + name);
  }
  if (!scripts.has(f2.id + ':' + f2.time)) {
    scripts.set(f2.id + ':' + f2.time, host.text(f2));
  }
  const code = await scripts.get(f2.id + ':' + f2.time);
  await ready(code);
  return new AsyncFunction('dv', 'input', code)(dv, input);
}

// app из Obsidian: чтение файлов и переход по ссылке, запись запрещена
function fakeApp() {
  const byPath = p => file(String(p && p.path ? p.path : p));
  const deny = () => Promise.reject(new Error('в Telegram Atlas только для чтения'));
  return {
    vault: {
      adapter: {
        read: p => load(p),
        readBinary: p => {
          const f = byPath(p);
          return f ? host.bytes(f.id).then(b => b.buffer) : Promise.reject(new Error('нет файла ' + p));
        },
        exists: p => Promise.resolve(!!byPath(p)),
        getResourcePath: p => p,
      },
      read: t => load(t.path),
      cachedRead: t => load(t.path),
      getAbstractFileByPath: p => tfile(byPath(p)),
      getFileByPath: p => tfile(byPath(p)),
      getMarkdownFiles: () => [...host.tree().files.values()].filter(x => x.md).map(tfile),
      getFiles: () => [...host.tree().files.values()].map(tfile),
      modify: deny,
      process: deny,
      append: deny,
      create: deny,
    },
    metadataCache: {
      getFirstLinkpathDest: (name, from) => {
        const src = from ? file(String(from)) : null;
        return tfile(host.resolve(String(name), {from: src ? src.parent : ''}));
      },
      getFileCache: t => {
        const f = byPath(t);
        return f && f.md ? {frontmatter: page(f).file.frontmatter} : null;
      },
      isUserIgnored: () => false,
    },
    workspace: {
      openLinkText: (link, from) => {
        const [target, sub] = String(link).split('#');
        const src = from ? file(String(from)) : null;
        const f = host.resolve(target, {from: src ? src.parent : ''});
        if (f) {
          host.open(f.id, sub);
        }
      },
      getActiveFile: () => null,
      on: () => ({}),
    },
  };
}

// createDiv, createEl, createSpan и empty из Obsidian
function helpers() {
  const proto = HTMLElement.prototype;
  if (proto.createEl) {
    return;
  }
  const apply = (el, o) => {
    if (typeof o === 'string') {
      el.className = o;
      return el;
    }
    o = o || {};
    if (o.cls) {
      el.className = [].concat(o.cls).join(' ');
    }
    if (o.text !== undefined) {
      el.textContent = o.text;
    }
    if (o.title) {
      el.title = o.title;
    }
    if (o.href) {
      el.setAttribute('href', o.href);
    }
    if (o.type) {
      el.setAttribute('type', o.type);
    }
    if (o.value !== undefined) {
      el.value = o.value;
    }
    if (o.placeholder) {
      el.setAttribute('placeholder', o.placeholder);
    }
    Object.keys(o.attr || {}).forEach(k => {
      if (o.attr[k] !== null && o.attr[k] !== false) {
        el.setAttribute(k, o.attr[k]);
      }
    });
    return el;
  };
  const make = function (tag, o, cb) {
    const el = apply(document.createElement(tag), o);
    this.append(el);
    if (cb) {
      cb(el);
    }
    return el;
  };
  [HTMLElement.prototype, DocumentFragment.prototype].forEach(p => {
    p.createEl = make;
    p.createDiv = function (o, cb) {
      return make.call(this, 'div', o, cb);
    };
    p.createSpan = function (o, cb) {
      return make.call(this, 'span', o, cb);
    };
    p.empty = function () {
      this.replaceChildren();
    };
  });
  proto.setText = function (s) {
    this.textContent = s;
  };
  proto.addClass = function (...c) {
    this.classList.add(...c);
  };
  proto.removeClass = function (...c) {
    this.classList.remove(...c);
  };
  proto.toggleClass = function (c, on) {
    this.classList.toggle(c, on);
  };
  proto.hasClass = function (c) {
    return this.classList.contains(c);
  };
  proto.setAttr = function (k, v) {
    this.setAttribute(k, v);
  };
  window.createEl = (tag, o, cb) => {
    const el = apply(document.createElement(tag), o);
    if (cb) {
      cb(el);
    }
    return el;
  };
  window.createDiv = (o, cb) => window.createEl('div', o, cb);
  window.createSpan = (o, cb) => window.createEl('span', o, cb);
}
