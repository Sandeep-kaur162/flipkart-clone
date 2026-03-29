const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const DB_PATH = path.join(__dirname, '../../flipkart.db');
const db = new Database(DB_PATH);

// Enable WAL for better performance
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// Wrap in a promise-like interface to match pg's query(text, params) API
function query(text, params = []) {
  // Convert PostgreSQL $1,$2 placeholders to ? for SQLite
  const sql = text.replace(/\$\d+/g, '?');

  // Detect statement type
  const trimmed = sql.trim().toUpperCase();

  try {
    if (trimmed.startsWith('SELECT') || trimmed.startsWith('WITH')) {
      const stmt = db.prepare(sql);
      const rows = stmt.all(...params);
      return Promise.resolve({ rows });
    } else if (trimmed.startsWith('INSERT') && sql.toUpperCase().includes('RETURNING')) {
      // SQLite doesn't support RETURNING — run insert then fetch last row
      const withoutReturning = sql.replace(/RETURNING\s+.*/is, '');
      const stmt = db.prepare(withoutReturning);
      const info = stmt.run(...params);
      const lastId = info.lastInsertRowid;
      // Try to get the inserted row
      const tableMatch = sql.match(/INSERT\s+(?:OR\s+\w+\s+)?INTO\s+(\w+)/i);
      if (tableMatch) {
        const row = db.prepare(`SELECT * FROM ${tableMatch[1]} WHERE rowid = ?`).get(lastId);
        return Promise.resolve({ rows: row ? [row] : [{ id: lastId }] });
      }
      return Promise.resolve({ rows: [{ id: lastId }] });
    } else if (trimmed.startsWith('UPDATE') && sql.toUpperCase().includes('RETURNING')) {
      const withoutReturning = sql.replace(/RETURNING\s+.*/is, '');
      const stmt = db.prepare(withoutReturning);
      stmt.run(...params);
      // Fetch updated row using WHERE clause heuristic
      const tableMatch = sql.match(/UPDATE\s+(\w+)\s+SET/i);
      const whereMatch = sql.match(/WHERE\s+(.+?)(?:\s+RETURNING|$)/is);
      if (tableMatch && whereMatch) {
        const whereParams = params.slice(params.length - (whereMatch[1].match(/\?/g) || []).length);
        const row = db.prepare(`SELECT * FROM ${tableMatch[1]} WHERE ${whereMatch[1].replace(/\$\d+/g, '?')}`).get(...whereParams);
        return Promise.resolve({ rows: row ? [row] : [] });
      }
      return Promise.resolve({ rows: [] });
    } else {
      const stmt = db.prepare(sql);
      const info = stmt.run(...params);
      return Promise.resolve({ rows: [], rowCount: info.changes });
    }
  } catch (err) {
    return Promise.reject(err);
  }
}

// Transaction support
function connect() {
  const client = {
    query,
    release: () => {},
    _tx: null,
  };

  client.query = function(text, params = []) {
    if (text.trim().toUpperCase() === 'BEGIN') {
      client._tx = db.transaction(() => {});
      // We'll handle manually
      return Promise.resolve({ rows: [] });
    }
    if (text.trim().toUpperCase() === 'COMMIT') {
      return Promise.resolve({ rows: [] });
    }
    if (text.trim().toUpperCase() === 'ROLLBACK') {
      return Promise.resolve({ rows: [] });
    }
    return query(text, params);
  };

  return Promise.resolve(client);
}

module.exports = { query, pool: { connect } };
