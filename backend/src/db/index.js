const Database = require('better-sqlite3');
const path = require('path');

// Initialize DB (creates tables + seeds if needed)
require('./init');

const DB_PATH = path.join(__dirname, '../../flipkart.db');
const db = new Database(DB_PATH);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

/**
 * Executes a SQL query, converting PostgreSQL $1,$2 placeholders to SQLite ?
 * Returns a Promise<{ rows }> to match the pg interface used in routes.
 */
function query(text, params = []) {
  // Replace $1, $2, ... with ?
  const sql = text.replace(/\$\d+/g, '?');
  const upper = sql.trim().toUpperCase();

  try {
    if (upper.startsWith('SELECT') || upper.startsWith('WITH')) {
      const rows = db.prepare(sql).all(...params);
      return Promise.resolve({ rows });
    }

    if (upper.startsWith('INSERT')) {
      // Strip RETURNING clause — SQLite doesn't support it
      const cleanSql = sql.replace(/\s+RETURNING\s+[\s\S]*/i, '');

      // Handle ON CONFLICT DO UPDATE (upsert) — SQLite supports this natively
      const info = db.prepare(cleanSql).run(...params);
      const lastId = info.lastInsertRowid;

      // Return the inserted/updated row
      const tableMatch = sql.match(/INSERT\s+(?:OR\s+\w+\s+)?INTO\s+(\w+)/i);
      if (tableMatch && lastId) {
        const row = db.prepare(`SELECT * FROM ${tableMatch[1]} WHERE rowid = ?`).get(lastId);
        return Promise.resolve({ rows: row ? [row] : [{ id: lastId }] });
      }
      return Promise.resolve({ rows: [{ id: lastId }] });
    }

    if (upper.startsWith('UPDATE')) {
      const cleanSql = sql.replace(/\s+RETURNING\s+[\s\S]*/i, '');
      db.prepare(cleanSql).run(...params);
      return Promise.resolve({ rows: [] });
    }

    if (upper.startsWith('DELETE')) {
      db.prepare(sql).run(...params);
      return Promise.resolve({ rows: [], rowCount: 1 });
    }

    // DDL or other
    db.exec(sql);
    return Promise.resolve({ rows: [] });
  } catch (err) {
    return Promise.reject(err);
  }
}

/**
 * Simulates pg's pool.connect() for transaction support in orders route.
 * Uses SQLite's built-in transaction mechanism.
 */
const pool = {
  connect: () => {
    let inTx = false;
    const client = {
      release: () => {},
      query: (text, params = []) => {
        const upper = text.trim().toUpperCase();
        if (upper === 'BEGIN') {
          db.prepare('BEGIN').run();
          inTx = true;
          return Promise.resolve({ rows: [] });
        }
        if (upper === 'COMMIT') {
          db.prepare('COMMIT').run();
          inTx = false;
          return Promise.resolve({ rows: [] });
        }
        if (upper === 'ROLLBACK') {
          try { db.prepare('ROLLBACK').run(); } catch {}
          inTx = false;
          return Promise.resolve({ rows: [] });
        }
        return query(text, params);
      },
    };
    return Promise.resolve(client);
  },
};

module.exports = { query, pool };
