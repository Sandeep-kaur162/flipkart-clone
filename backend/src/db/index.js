const { Pool } = require('pg');

// Use PostgreSQL in production (Render), SQLite in development
const isProduction = process.env.NODE_ENV === 'production';

let pool;

if (isProduction) {
  // PostgreSQL for Render
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });
} else {
  // SQLite for local development
  const Database = require('better-sqlite3');
  const path = require('path');

  // Initialize DB (creates tables + seeds if needed)
  require('./init');

  const DB_PATH = path.join(__dirname, '../../flipkart.db');
  const db = new Database(DB_PATH);
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');

  /**
   * SQLite query wrapper for local development
   */
  function sqliteQuery(text, params = []) {
    const sql = text.replace(/\$\d+/g, '?');
    const upper = sql.trim().toUpperCase();

    try {
      if (upper.startsWith('SELECT') || upper.startsWith('WITH')) {
        const rows = db.prepare(sql).all(...params);
        return Promise.resolve({ rows });
      }

      if (upper.startsWith('INSERT')) {
        const cleanSql = sql.replace(/\s+RETURNING\s+[\s\S]*/i, '');
        const info = db.prepare(cleanSql).run(...params);
        const lastId = info.lastInsertRowid;
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
        const info = db.prepare(sql).run(...params);
        return Promise.resolve({ rows: [], rowCount: info.changes });
      }

      db.exec(sql);
      return Promise.resolve({ rows: [] });
    } catch (err) {
      return Promise.reject(err);
    }
  }

  pool = {
    query: sqliteQuery,
    connect: () => {
      const client = {
        release: () => {},
        query: sqliteQuery,
      };
      return Promise.resolve(client);
    },
  };
}

module.exports = { query: (text, params) => pool.query(text, params), pool };
