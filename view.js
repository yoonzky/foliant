// просмотр файлов без своей страницы в Obsidian: код и текст, таблицы, ipynb, docx и doc, pptx, html
const CODE = {py: 'python', pyw: 'python', c: 'c', h: 'c', cpp: 'cpp', cc: 'cpp', cxx: 'cpp', hpp: 'cpp', java: 'java', js: 'javascript', mjs: 'javascript', cjs: 'javascript', ts: 'typescript', sql: 'sql', sh: 'bash', bash: 'bash', zsh: 'bash', json: 'json', xml: 'xml', xsd: 'xml', svg: 'xml', yml: 'yaml', yaml: 'yaml', css: 'css', scss: 'scss', go: 'go', rs: 'rust', swift: 'swift', kt: 'kotlin', cs: 'csharp', m: 'matlab', r: 'r', lua: 'lua', rb: 'ruby', php: 'php', ini: 'ini', cfg: 'ini', toml: 'ini', conf: 'ini', diff: 'diff', patch: 'diff', mk: 'makefile', pl: 'perl', asm: '', s: '', pas: '', bat: '', ps1: '', tex: '', txt: '', log: '', out: '', gitignore: 'bash', properties: 'ini', gradle: '', kts: 'kotlin', jsonl: 'json', ipynb: 'json'};
const NAMES = {makefile: 'makefile', dockerfile: 'bash', 'cmakelists.txt': ''};
const SHEET = ['xlsx', 'xlsm', 'xls', 'ods', 'csv', 'tsv'];
const ROWS = 500;
const COLS = 40;
// подсветка тяжелеет на длинных файлах, дальше только текст
const PAINT = 150000;
let sheetjs = null;
let mammoth = null;

export function kind(f) {
  const name = f.file.toLowerCase();
  const ext = name.includes('.') ? name.split('.').pop() : '';
  if (name in NAMES) {
    return 'code';
  }
  if (ext === 'ipynb') {
    return 'ipynb';
  }
  if (ext === 'docx') {
    return 'docx';
  }
  if (ext === 'doc') {
    return 'doc';
  }
  if (ext === 'pptx') {
    return 'pptx';
  }
  if (SHEET.includes(ext)) {
    return 'sheet';
  }
  if (ext === 'html' || ext === 'htm') {
    return 'html';
  }
  if (ext in CODE) {
    return 'code';
  }
  return null;
}

export function preview(f, box, host) {
  const k = kind(f);
  return host.bytes(f.id).then(data => {
    if (!box.isConnected) {
      return null;
    }
    if (k === 'code') {
      return code(f, box, host, decode(data));
    }
    if (k === 'ipynb') {
      return notebook(f, box, host, decode(data));
    }
    if (k === 'html') {
      return page(box, decode(data));
    }
    if (k === 'docx') {
      return docx(box, host, data);
    }
    if (k === 'doc') {
      return doc(box, host, data);
    }
    if (k === 'pptx') {
      return slides(box, host, data);
    }
    return sheet(f, box, host, data);
  });
}

// utf-8, а старые файлы с кириллицей в cp1251
function decode(data) {
  try {
    return new TextDecoder('utf-8', {fatal: true}).decode(data).replace(/^﻿/, '');
  } catch (err) {
    return new TextDecoder('windows-1251').decode(data);
  }
}

function ext(f) {
  const name = f.file.toLowerCase();
  return name in NAMES ? NAMES[name] : CODE[name.split('.').pop()] || '';
}

function code(f, box, host, text) {
  box.innerHTML = '<pre class="source"><code></code></pre>';
  const el = box.querySelector('code');
  el.textContent = text;
  const lang = ext(f);
  if (!lang || text.length > PAINT) {
    return null;
  }
  return host.hljs().then(hljs => {
    if (hljs.getLanguage(lang)) {
      el.className = 'language-' + lang;
      hljs.highlightElement(el);
    }
  }).catch(() => {});
}

// ячейки по порядку: markdown текстом заметки, код с подсветкой, выводы картинками, таблицами и текстом
function notebook(f, box, host, text) {
  let nb = null;
  try {
    nb = JSON.parse(text);
  } catch (err) {
    return code(f, box, host, text);
  }
  const meta = nb.metadata || {};
  const lang = ((meta.kernelspec || {}).language || (meta.language_info || {}).name || 'python').toLowerCase();
  const join = s => Array.isArray(s) ? s.join('') : String(s || '');
  const env = host.env(f);
  const html = (nb.cells || []).map(c => {
    const src = join(c.source);
    if (c.cell_type === 'markdown') {
      return '<div class="cell md">' + host.render(src, env) + '</div>';
    }
    if (c.cell_type !== 'code') {
      return src.trim() ? '<pre class="cell raw">' + host.esc(src) + '</pre>' : '';
    }
    const n = c.execution_count ? '<span class="count">[' + c.execution_count + ']</span>' : '';
    return '<div class="cell code">' + n + '<pre><code class="language-' + host.esc(lang) + '">' + host.esc(src) + '</code></pre>' + (c.outputs || []).map(o => output(o, host, env)).join('') + '</div>';
  }).join('');
  box.innerHTML = '<article class="note nb">' + (html || '<p class="quiet">пустой ноутбук</p>') + '</article>';
  const body = box.firstElementChild;
  host.clean(body);
  return host.decorate(body);
}

function output(o, host, env) {
  const join = s => Array.isArray(s) ? s.join('') : String(s || '');
  const cut = s => s.length > 20000 ? s.slice(0, 20000) + '\n...' : s;
  if (o.output_type === 'stream') {
    return '<pre class="out' + (o.name === 'stderr' ? ' err' : '') + '">' + host.esc(cut(ansi(join(o.text)))) + '</pre>';
  }
  if (o.output_type === 'error') {
    return '<pre class="out err">' + host.esc(cut(ansi((o.traceback || []).join('\n') || o.ename + ': ' + o.evalue))) + '</pre>';
  }
  const d = o.data || {};
  for (const type of ['image/png', 'image/jpeg', 'image/gif']) {
    if (d[type]) {
      return '<div class="out"><img src="data:' + type + ';base64,' + join(d[type]).replace(/\s/g, '') + '" alt=""></div>';
    }
  }
  if (d['image/svg+xml']) {
    return '<div class="out"><img src="data:image/svg+xml;charset=utf-8,' + encodeURIComponent(join(d['image/svg+xml'])) + '" alt=""></div>';
  }
  if (d['text/html']) {
    return '<div class="out html">' + join(d['text/html']) + '</div>';
  }
  if (d['text/markdown']) {
    return '<div class="out">' + host.render(join(d['text/markdown']), env) + '</div>';
  }
  if (d['text/latex']) {
    return '<div class="out">' + host.render(join(d['text/latex']), env) + '</div>';
  }
  if (d['text/plain']) {
    return '<pre class="out">' + host.esc(cut(ansi(join(d['text/plain'])))) + '</pre>';
  }
  return '';
}

function ansi(s) {
  return s.replace(/\x1b\[[0-9;]*[A-Za-z]/g, '');
}

// скрипты страницы работают в песочнице без доступа к приложению
function page(box, text) {
  box.innerHTML = '<iframe class="page" sandbox="allow-scripts" referrerpolicy="no-referrer"></iframe>';
  box.firstElementChild.srcdoc = text;
  return null;
}

function sheetLib(host) {
  if (!sheetjs) {
    sheetjs = host.script('vendor/xlsx.full.min.js').then(() => window.XLSX, err => {
      sheetjs = null;
      throw err;
    });
  }
  return sheetjs;
}

function mammothLib(host) {
  if (!mammoth) {
    mammoth = host.script('vendor/mammoth.browser.min.js').then(() => window.mammoth, err => {
      mammoth = null;
      throw err;
    });
  }
  return mammoth;
}

function docx(box, host, data) {
  return mammothLib(host).then(m => m.convertToHtml({arrayBuffer: data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength)})).then(res => {
    if (!box.isConnected) {
      return null;
    }
    box.innerHTML = '<article class="note office">' + (res.value || '<p class="quiet">пустой документ</p>') + '</article>';
    const body = box.firstElementChild;
    host.clean(body);
    body.querySelectorAll('table').forEach(t => {
      const wrap = document.createElement('div');
      wrap.className = 'table';
      t.replaceWith(wrap);
      wrap.append(t);
    });
    return host.decorate(body);
  }, () => Promise.reject({error: 'view'}));
}

// старый .doc: текст по таблице кусков из потока WordDocument, без оформления
function doc(box, host, data) {
  return sheetLib(host).then(X => {
    const cfb = X.CFB.read(data, {type: 'array'});
    const word = bytes(X.CFB.find(cfb, 'WordDocument'));
    const view = new DataView(word.buffer, word.byteOffset, word.byteLength);
    const table = bytes(X.CFB.find(cfb, view.getUint16(10, true) & 0x200 ? '1Table' : '0Table'));
    const fc = view.getUint32(0x1A2, true);
    const lcb = view.getUint32(0x1A6, true);
    const clx = new DataView(table.buffer, table.byteOffset + fc, lcb);
    let p = 0;
    while (clx.getUint8(p) === 1) {
      p += 3 + clx.getUint16(p + 1, true);
    }
    const size = clx.getUint32(p + 1, true);
    p += 5;
    // n кусков: n+1 позиций по 4 байта и n описаний по 8
    const n = (size - 4) / 12;
    let text = '';
    for (let i = 0; i < n; i++) {
      const len = clx.getInt32(p + (i + 1) * 4, true) - clx.getInt32(p + i * 4, true);
      const raw = clx.getUint32(p + (n + 1) * 4 + i * 8 + 2, true);
      if (raw & 0x40000000) {
        const at = (raw & 0x3FFFFFFF) / 2;
        text += new TextDecoder('windows-1252').decode(word.subarray(at, at + len));
      } else {
        text += new TextDecoder('utf-16le').decode(word.subarray(raw, raw + len * 2));
      }
    }
    // поля: код между 0x13 и 0x14 скрыт, результат до 0x15 остаётся
    text = text.replace(/\x13[^\x13\x14\x15]*\x14?/g, '').replace(/\x15/g, '').replace(/\x07/g, '\t').replace(/[\x00-\x06\x08\x0b\x0c\x0e-\x1f]/g, '');
    const paras = text.split('\r').map(s => s.trim()).filter(Boolean);
    box.innerHTML = '<article class="note office">' + (paras.length ? paras.map(s => '<p>' + host.esc(s).replace(/\t+/g, ' | ') + '</p>').join('') : '<p class="quiet">текста нет</p>') + '</article>';
    return null;
  }).catch(() => Promise.reject({error: 'view'}));
}

function bytes(entry) {
  if (!entry || !entry.content) {
    throw new Error('нет потока');
  }
  return entry.content instanceof Uint8Array ? entry.content : new Uint8Array(entry.content);
}

// листы вкладками, на экране до ROWS строк и COLS столбцов
function sheet(f, box, host, data) {
  return sheetLib(host).then(X => {
    const wb = /\.(csv|tsv)$/i.test(f.file) ? X.read(decode(data), {type: 'string', raw: true}) : X.read(data, {type: 'array', cellDates: true});
    if (!box.isConnected) {
      return;
    }
    const names = wb.SheetNames;
    box.innerHTML = (names.length > 1 ? '<div class="tabs">' + names.map((s, i) => '<button type="button" data-sheet="' + i + '"' + (i ? '' : ' class="on"') + '>' + host.esc(s) + '</button>').join('') + '</div>' : '') + '<div class="sheet"></div>';
    const out = box.querySelector('.sheet');
    const draw = i => {
      const ws = wb.Sheets[names[i]];
      const ref = ws && ws['!ref'];
      if (!ref) {
        out.innerHTML = '<p class="quiet pad">пустой лист</p>';
        return;
      }
      const r = X.utils.decode_range(ref);
      const cut = r.e.r - r.s.r >= ROWS || r.e.c - r.s.c >= COLS;
      r.e.r = Math.min(r.e.r, r.s.r + ROWS - 1);
      r.e.c = Math.min(r.e.c, r.s.c + COLS - 1);
      const html = X.utils.sheet_to_html(Object.assign({}, ws, {'!ref': X.utils.encode_range(r)}), {header: '', footer: ''});
      out.innerHTML = '<div class="table"><table>' + (html.match(/<table[^>]*>([\s\S]*)<\/table>/) || [, ''])[1] + '</table></div>' + (cut ? '<p class="quiet pad">показано начало листа, целиком в файле</p>' : '');
      host.clean(out);
    };
    draw(0);
    box.onclick = e => {
      const b = e.target.closest('[data-sheet]');
      if (b) {
        box.querySelectorAll('[data-sheet]').forEach(x => x.classList.toggle('on', x === b));
        draw(Number(b.dataset.sheet));
      }
    };
  }).catch(() => Promise.reject({error: 'view'}));
}

// слайды карточками: текст абзацами, картинки из ppt/media
function slides(box, host, data) {
  return sheetLib(host).then(X => {
    const zip = X.CFB.read(data, {type: 'array'});
    // пути в архиве с корнем Root Entry, CFB.find их по полному имени не находит
    const entries = new Map(zip.FullPaths.map((p, i) => [p.replace(/^[^/]*\//, ''), zip.FileIndex[i]]));
    const file = p => entries.get(p);
    const xml = p => {
      const e = file(p);
      return e ? new DOMParser().parseFromString(new TextDecoder().decode(bytes(e)), 'application/xml') : null;
    };
    const list = zip.FullPaths.map(p => (p.match(/ppt\/slides\/slide(\d+)\.xml$/) || [])[1]).filter(Boolean).map(Number).sort((a, b) => a - b);
    const urls = [];
    const html = list.map(n => {
      const s = xml('ppt/slides/slide' + n + '.xml');
      const rels = xml('ppt/slides/_rels/slide' + n + '.xml.rels');
      const target = {};
      if (rels) {
        [...rels.getElementsByTagName('Relationship')].forEach(r => {
          target[r.getAttribute('Id')] = r.getAttribute('Target');
        });
      }
      const paras = s ? [...s.getElementsByTagName('a:p')].map(p => [...p.getElementsByTagName('a:t')].map(t => t.textContent).join('').trim()).filter(Boolean) : [];
      const pics = s ? [...s.getElementsByTagName('a:blip')].map(b => target[b.getAttribute('r:embed')]).filter(Boolean) : [];
      const imgs = pics.map(t => {
        const e = file('ppt/' + t.replace(/^\.\.\//, ''));
        if (!e || !/\.(png|jpe?g|gif|svg|webp|bmp)$/i.test(t)) {
          return '';
        }
        const url = URL.createObjectURL(new Blob([bytes(e)], {type: /\.svg$/i.test(t) ? 'image/svg+xml' : 'image/' + t.split('.').pop().toLowerCase().replace('jpg', 'jpeg')}));
        urls.push(url);
        return '<img src="' + url + '" alt="">';
      }).join('');
      return '<section class="slide"><span class="count">' + n + '</span>' + (paras.length ? '<h3>' + host.esc(paras[0]) + '</h3>' + paras.slice(1).map(t => '<p>' + host.esc(t) + '</p>').join('') : '') + imgs + '</section>';
    }).join('');
    box.innerHTML = '<article class="note office deck">' + (html || '<p class="quiet">слайдов нет</p>') + '</article>';
    host.leave(() => urls.forEach(u => URL.revokeObjectURL(u)));
    return null;
  }).catch(() => Promise.reject({error: 'view'}));
}
