const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, '../data/gas_dispatch.db');

let SQL = null;
let db = null;
let initPromise = null;

async function init() {
  if (initPromise) return initPromise;
  initPromise = (async () => {
    if (!SQL) {
      SQL = await initSqlJs();
    }
    if (!db) {
      const dataDir = path.dirname(DB_PATH);
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
      }
      if (fs.existsSync(DB_PATH)) {
        const buffer = fs.readFileSync(DB_PATH);
        db = new SQL.Database(buffer);
      } else {
        db = new SQL.Database();
      }
      db.run('PRAGMA foreign_keys = ON');
    }
    return db;
  })();
  return initPromise;
}

async function getDb() {
  return init();
}

function save() {
  if (!db) return;
  const data = db.export();
  const buffer = Buffer.from(data);
  fs.writeFileSync(DB_PATH, buffer);
}

function closeDb() {
  if (db) {
    save();
    db.close();
    db = null;
    initPromise = null;
  }
}

function cleanParams(params) {
  if (!Array.isArray(params)) return params;
  return params.map((p) => (p === undefined ? null : p));
}

async function query(sql, params = []) {
  await init();
  const cleanP = cleanParams(params);
  const trimmed = sql.trim();
  const isSelect = trimmed.toUpperCase().startsWith('SELECT');
  if (isSelect) {
    const stmt = db.prepare(sql);
    stmt.bind(cleanP);
    const rows = [];
    while (stmt.step()) {
      rows.push(stmt.getAsObject());
    }
    stmt.free();
    return rows;
  }
  const stmt = db.prepare(sql);
  stmt.bind(cleanP);
  stmt.step();
  stmt.free();
  save();
  return {
    changes: db.getRowsModified(),
    lastInsertRowid: null,
  };
}

async function queryOne(sql, params = []) {
  await init();
  const cleanP = cleanParams(params);
  const stmt = db.prepare(sql);
  stmt.bind(cleanP);
  let row = undefined;
  if (stmt.step()) {
    row = stmt.getAsObject();
  }
  stmt.free();
  return row;
}

module.exports = { init, getDb, save, closeDb, query, queryOne };
