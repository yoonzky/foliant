// кэш заметок и файлов в IndexedDB: запись живёт, пока время файла в дереве то же
const LIMIT = 80 * 1048576;
let db = null;

export function open(user) {
  if (!db) {
    db = new Promise(ok => {
      try {
        const req = indexedDB.open('foliant' + user, 1);
        req.onupgradeneeded = () => {
          req.result.createObjectStore('notes', {keyPath: 'id'});
          req.result.createObjectStore('files', {keyPath: 'id'});
        };
        req.onsuccess = () => ok(req.result);
        req.onerror = () => ok(null);
        req.onblocked = () => ok(null);
      } catch (err) {
        ok(null);
      }
    });
  }
  return db;
}

// гостям копий на устройстве не остаётся: база закрывается и стирается
export function drop(user) {
  const was = db;
  db = Promise.resolve(null);
  return (was || Promise.resolve(null)).then(base => {
    if (base) {
      base.close();
    }
    try {
      indexedDB.deleteDatabase('foliant' + user);
    } catch (err) {
    }
  });
}

function run(name, mode, fn) {
  return (db || Promise.resolve(null)).then(base => new Promise(ok => {
    if (!base) {
      return ok(null);
    }
    try {
      const tx = base.transaction(name, mode);
      const out = fn(tx.objectStore(name));
      tx.oncomplete = () => ok(out && 'result' in out ? out.result : null);
      tx.onerror = () => ok(null);
      tx.onabort = () => ok(null);
    } catch (err) {
      ok(null);
    }
  }));
}

// stale: вернуть запись и с другим временем, когда сети нет
export function get(name, id, time, stale) {
  return run(name, 'readonly', s => s.get(id)).then(rec => {
    if (!rec || (rec.time !== time && !stale)) {
      return null;
    }
    if (name === 'files') {
      rec.used = Date.now();
      run(name, 'readwrite', s => s.put(rec));
    }
    return rec;
  });
}

export function put(name, rec) {
  rec.used = Date.now();
  return run(name, 'readwrite', s => s.put(rec)).then(() => name === 'files' ? trim() : null);
}

// файлы сверх лимита уходят, начиная с давно открытых
function trim() {
  return run('files', 'readonly', s => s.getAll()).then(all => {
    if (!all) {
      return;
    }
    let total = all.reduce((n, r) => n + r.blob.size, 0);
    const old = [];
    all.sort((a, b) => a.used - b.used).forEach(r => {
      if (total > LIMIT) {
        total -= r.blob.size;
        old.push(r.id);
      }
    });
    if (old.length) {
      return run('files', 'readwrite', s => old.forEach(id => s.delete(id)));
    }
  });
}
