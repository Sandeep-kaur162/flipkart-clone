// Only initialize SQLite for local development
const isProduction = process.env.NODE_ENV === 'production';

if (!isProduction) {
  const Database = require('better-sqlite3');
  const path = require('path');

  const DB_PATH = path.join(__dirname, '../../flipkart.db');
  const db = new Database(DB_PATH);

  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');

  db.exec(`
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT,
  phone TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS categories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  image_url TEXT
);

CREATE TABLE IF NOT EXISTS products (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  description TEXT,
  price REAL NOT NULL,
  original_price REAL,
  discount_percent INTEGER DEFAULT 0,
  stock INTEGER DEFAULT 0,
  category_id INTEGER REFERENCES categories(id),
  brand TEXT,
  rating REAL DEFAULT 0,
  rating_count INTEGER DEFAULT 0,
  images TEXT DEFAULT '[]',
  specifications TEXT DEFAULT '{}',
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS addresses (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER REFERENCES users(id),
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  address_line1 TEXT NOT NULL,
  address_line2 TEXT,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  pincode TEXT NOT NULL,
  is_default INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS cart (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER REFERENCES users(id),
  product_id INTEGER REFERENCES products(id),
  quantity INTEGER DEFAULT 1,
  added_at TEXT DEFAULT (datetime('now')),
  UNIQUE(user_id, product_id)
);

CREATE TABLE IF NOT EXISTS orders (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  order_id TEXT UNIQUE NOT NULL,
  user_id INTEGER REFERENCES users(id),
  address_id INTEGER REFERENCES addresses(id),
  total_amount REAL NOT NULL,
  status TEXT DEFAULT 'placed',
  payment_method TEXT DEFAULT 'COD',
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS order_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  order_id INTEGER REFERENCES orders(id),
  product_id INTEGER REFERENCES products(id),
  quantity INTEGER NOT NULL,
  price REAL NOT NULL
);

CREATE TABLE IF NOT EXISTS wishlist (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER REFERENCES users(id),
  product_id INTEGER REFERENCES products(id),
  added_at TEXT DEFAULT (datetime('now')),
  UNIQUE(user_id, product_id)
);

CREATE TABLE IF NOT EXISTS otps (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT NOT NULL,
  otp TEXT NOT NULL,
  expires_at INTEGER NOT NULL,
  used INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS reviews (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
  user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  user_name TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK(rating BETWEEN 1 AND 5),
  title TEXT,
  body TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS coupons (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  code TEXT UNIQUE NOT NULL,
  discount_type TEXT NOT NULL CHECK(discount_type IN ('percent','flat')),
  discount_value REAL NOT NULL,
  min_order_amount REAL DEFAULT 0,
  max_uses INTEGER DEFAULT 100,
  used_count INTEGER DEFAULT 0,
  expires_at TEXT,
  active INTEGER DEFAULT 1
);

CREATE TABLE IF NOT EXISTS order_timeline (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
  status TEXT NOT NULL,
  note TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);
`);

  // Default user
  const existingUser = db.prepare('SELECT id FROM users WHERE id = 1').get();
  if (!existingUser) {
    db.prepare("INSERT INTO users (id, name, email, phone) VALUES (1, 'Guest User', 'guest@flipkart.com', '9999999999')").run();
  }

  // Seed categories
  const catCount = db.prepare('SELECT COUNT(*) as c FROM categories').get();
  if (catCount.c === 0) {
    const insertCat = db.prepare('INSERT INTO categories (name, slug) VALUES (?, ?)');
    [
      ['Electronics', 'electronics'],
      ['Mobiles', 'mobiles'],
      ['Fashion', 'fashion'],
      ['Home & Furniture', 'home-furniture'],
      ['Appliances', 'appliances'],
      ['Books', 'books'],
      ['Toys', 'toys'],
      ['Sports', 'sports'],
    ].forEach(([name, slug]) => insertCat.run(name, slug));
  }

  // Seed products (abbreviated for brevity)
  const prodCount = db.prepare('SELECT COUNT(*) as c FROM products').get();
  if (prodCount.c === 0) {
    const ins = db.prepare(`
      INSERT INTO products (name, description, price, original_price, discount_percent, stock, category_id, brand, rating, rating_count, images, specifications)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const products = [
      ['Samsung Galaxy S23 Ultra 5G', 'Experience the ultimate Galaxy with the S23 Ultra.', 124999, 149999, 17, 50, 2, 'Samsung', 4.5, 12453, JSON.stringify(['https://m.media-amazon.com/images/I/71Sa3dqTqzL._SX679_.jpg']), JSON.stringify({ Display: '6.8 inch Dynamic AMOLED 2X' })],
      ['Apple iPhone 15 Pro Max', 'iPhone 15 Pro Max. Forged in titanium.', 159900, 189900, 16, 30, 2, 'Apple', 4.7, 8921, JSON.stringify(['https://m.media-amazon.com/images/I/41bLD50sZGL._SX300_SY300_QL70_FMwebp_.jpg']), JSON.stringify({ Display: '6.7 inch Super Retina XDR' })],
      ['OnePlus 12 5G', 'OnePlus 12 with Snapdragon 8 Gen 3.', 64999, 74999, 13, 80, 2, 'OnePlus', 4.4, 5632, JSON.stringify(['https://m.media-amazon.com/images/I/61U3jn0R5GL._SX679_.jpg']), JSON.stringify({ Display: '6.82 inch LTPO AMOLED' })],
      ['Sony WH-1000XM5 Headphones', 'Industry-leading noise canceling.', 26990, 34990, 23, 45, 1, 'Sony', 4.6, 7823, JSON.stringify(['https://m.media-amazon.com/images/I/61vJPLMHDLL._SX679_.jpg']), JSON.stringify({ Type: 'Over-Ear' })],
      ['Apple MacBook Air M2', 'MacBook Air with M2 chip.', 114900, 134900, 15, 20, 1, 'Apple', 4.8, 4521, JSON.stringify(['https://m.media-amazon.com/images/I/71f5Eu5lJSL._SX679_.jpg']), JSON.stringify({ Processor: 'Apple M2' })],
    ];

    products.forEach(p => ins.run(...p));
  }

  // Seed coupons
  const couponCount = db.prepare('SELECT COUNT(*) as c FROM coupons').get();
  if (couponCount.c === 0) {
    const insCoupon = db.prepare('INSERT INTO coupons (code, discount_type, discount_value, min_order_amount, max_uses) VALUES (?, ?, ?, ?, ?)');
    [
      ['SAVE10', 'percent', 10, 500, 100],
      ['FLAT200', 'flat', 200, 1000, 50],
      ['WELCOME20', 'percent', 20, 0, 200],
      ['SHOPZEN50', 'flat', 50, 300, 500],
    ].forEach(args => insCoupon.run(...args));
  }

  console.log('✅ Database initialized with seed data');
  module.exports = db;
} else {
  // Production: PostgreSQL is used
  module.exports = null;
}
