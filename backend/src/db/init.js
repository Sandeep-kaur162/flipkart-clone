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

// Seed products
const prodCount = db.prepare('SELECT COUNT(*) as c FROM products').get();
if (prodCount.c === 0) {
  const ins = db.prepare(`
    INSERT INTO products (name, description, price, original_price, discount_percent, stock, category_id, brand, rating, rating_count, images, specifications)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const products = [
    // Mobiles (cat 2)
    ['Samsung Galaxy S23 Ultra 5G', 'Experience the ultimate Galaxy with the S23 Ultra. Featuring a 200MP camera, built-in S Pen, and Snapdragon 8 Gen 2 processor.', 124999, 149999, 17, 50, 2, 'Samsung', 4.5, 12453,
      JSON.stringify(['https://m.media-amazon.com/images/I/71Sa3dqTqzL._SX679_.jpg']),
      JSON.stringify({ Display: '6.8 inch Dynamic AMOLED 2X', Processor: 'Snapdragon 8 Gen 2', RAM: '12 GB', Storage: '256 GB', Camera: '200 MP', Battery: '5000 mAh', OS: 'Android 13' })],
    ['Apple iPhone 15 Pro Max', 'iPhone 15 Pro Max. Forged in titanium and featuring the groundbreaking A17 Pro chip.', 159900, 189900, 16, 30, 2, 'Apple', 4.7, 8921,
      JSON.stringify(['https://m.media-amazon.com/images/I/41bLD50sZGL._SX300_SY300_QL70_FMwebp_.jpg']),
      JSON.stringify({ Display: '6.7 inch Super Retina XDR', Processor: 'A17 Pro', RAM: '8 GB', Storage: '256 GB', Camera: '48 MP', Battery: '4422 mAh', OS: 'iOS 17' })],
    ['OnePlus 12 5G', 'OnePlus 12 with Snapdragon 8 Gen 3, Hasselblad camera, and 100W SUPERVOOC charging.', 64999, 74999, 13, 80, 2, 'OnePlus', 4.4, 5632,
      JSON.stringify(['https://m.media-amazon.com/images/I/61U3jn0R5GL._SX679_.jpg']),
      JSON.stringify({ Display: '6.82 inch LTPO AMOLED', Processor: 'Snapdragon 8 Gen 3', RAM: '12 GB', Storage: '256 GB', Camera: '50 MP', Battery: '5400 mAh', OS: 'Android 14' })],
    ['Redmi Note 13 Pro+ 5G', 'Redmi Note 13 Pro+ with 200MP camera and 120W HyperCharge.', 29999, 35999, 17, 120, 2, 'Xiaomi', 4.3, 9871,
      JSON.stringify(['https://m.media-amazon.com/images/I/71Ux0XTINUL._SX679_.jpg']),
      JSON.stringify({ Display: '6.67 inch AMOLED', Processor: 'Dimensity 7200 Ultra', RAM: '8 GB', Storage: '256 GB', Camera: '200 MP', Battery: '5000 mAh', OS: 'Android 13' })],
    ['Realme 12 Pro+ 5G', 'Realme 12 Pro+ with periscope telephoto camera and 67W SUPERVOOC charging.', 27999, 32999, 15, 100, 2, 'Realme', 4.2, 4231,
      JSON.stringify(['https://m.media-amazon.com/images/I/71Ux0XTINUL._SX679_.jpg']),
      JSON.stringify({ Display: '6.7 inch AMOLED', Processor: 'Snapdragon 7s Gen 2', RAM: '8 GB', Storage: '128 GB', Camera: '50 MP + 64 MP periscope', Battery: '5000 mAh', OS: 'Android 14' })],

    // Electronics (cat 1)
    ['Sony WH-1000XM5 Wireless Headphones', 'Industry-leading noise canceling with Auto NC Optimizer. Up to 30-hour battery life.', 26990, 34990, 23, 45, 1, 'Sony', 4.6, 7823,
      JSON.stringify(['https://m.media-amazon.com/images/I/61vJPLMHDLL._SX679_.jpg']),
      JSON.stringify({ Type: 'Over-Ear', Connectivity: 'Bluetooth 5.2', Battery: '30 hours', 'Noise Cancellation': 'Yes', Weight: '250g' })],
    ['Apple MacBook Air M2', 'MacBook Air with M2 chip. Supercharged by the next-generation M2 chip.', 114900, 134900, 15, 20, 1, 'Apple', 4.8, 4521,
      JSON.stringify(['https://m.media-amazon.com/images/I/71f5Eu5lJSL._SX679_.jpg']),
      JSON.stringify({ Display: '13.6 inch Liquid Retina', Processor: 'Apple M2', RAM: '8 GB', Storage: '256 GB SSD', Battery: '18 hours', Weight: '1.24 kg', OS: 'macOS' })],
    ['Samsung 55 inch 4K Smart TV', 'Samsung Crystal 4K Pro Smart TV with Crystal Processor 4K.', 54990, 79990, 31, 35, 1, 'Samsung', 4.3, 6234,
      JSON.stringify(['https://m.media-amazon.com/images/I/71pnHk+KPNL._SX679_.jpg']),
      JSON.stringify({ 'Screen Size': '55 inch', Resolution: '4K Ultra HD', 'Smart TV': 'Yes', HDR: 'Yes', 'Refresh Rate': '60 Hz', 'HDMI Ports': '3' })],
    ['boAt Airdopes 141 TWS Earbuds', 'boAt Airdopes 141 with 42H total playback and BEAST Mode for gaming.', 1299, 4990, 74, 200, 1, 'boAt', 4.1, 45231,
      JSON.stringify(['https://m.media-amazon.com/images/I/61vJPLMHDLL._SX679_.jpg']),
      JSON.stringify({ Type: 'In-Ear TWS', Battery: '42 hours total', 'Water Resistance': 'IPX4', Connectivity: 'Bluetooth 5.2', 'Gaming Mode': 'Yes' })],
    ['Logitech MX Master 3S Mouse', 'Advanced wireless mouse with ultra-fast MagSpeed scrolling and 8K DPI sensor.', 9995, 12995, 23, 60, 1, 'Logitech', 4.7, 3421,
      JSON.stringify(['https://m.media-amazon.com/images/I/61ni3t1ryQL._SX679_.jpg']),
      JSON.stringify({ Connectivity: 'Bluetooth + USB', DPI: '200-8000', Battery: '70 days', Buttons: '7', OS: 'Windows/Mac/Linux' })],

    // Fashion (cat 3)
    ["Levi's Men's 511 Slim Fit Jeans", "Classic slim fit jeans from Levi's. Made with stretch denim for all-day comfort.", 2999, 4999, 40, 150, 3, "Levi's", 4.2, 8932,
      JSON.stringify(['https://m.media-amazon.com/images/I/71pnHk+KPNL._SX679_.jpg']),
      JSON.stringify({ Fit: 'Slim', Material: '98% Cotton, 2% Elastane', Closure: 'Zip fly with button', Pockets: '5' })],
    ['Nike Air Max 270 Running Shoes', "Nike Air Max 270 features Nike's biggest heel Air unit yet.", 12995, 15995, 19, 60, 3, 'Nike', 4.5, 3421,
      JSON.stringify(['https://m.media-amazon.com/images/I/71pnHk+KPNL._SX679_.jpg']),
      JSON.stringify({ Type: 'Running', Sole: 'Rubber', Closure: 'Lace-Up', Upper: 'Mesh', 'Air Unit': 'Max Air 270' })],

    // Home & Furniture (cat 4)
    ['Prestige Iris 750W Mixer Grinder', 'Prestige Iris 750W Mixer Grinder with 3 stainless steel jars and 1 juicer jar.', 2795, 4500, 38, 90, 4, 'Prestige', 4.3, 12453,
      JSON.stringify(['https://m.media-amazon.com/images/I/61ni3t1ryQL._SX679_.jpg']),
      JSON.stringify({ Power: '750W', Jars: '4 (3 SS + 1 Juicer)', 'Speed Settings': '3 + Pulse', Warranty: '2 years' })],
    ['Godrej 564L French Door Refrigerator', 'Godrej 564L French Door Refrigerator with Inverter Technology.', 79990, 99990, 20, 15, 4, 'Godrej', 4.4, 2341,
      JSON.stringify(['https://m.media-amazon.com/images/I/71f5Eu5lJSL._SX679_.jpg']),
      JSON.stringify({ Capacity: '564 L', Type: 'French Door', 'Star Rating': '3 Star', Inverter: 'Yes', Warranty: '1 year + 10 years compressor' })],

    // Books (cat 6)
    ['Atomic Habits by James Clear', 'An Easy & Proven Way to Build Good Habits & Break Bad Ones. #1 NYT bestseller.', 399, 799, 50, 500, 6, 'Penguin', 4.7, 34521,
      JSON.stringify(['https://m.media-amazon.com/images/I/81wgcld4wxL._SY466_.jpg']),
      JSON.stringify({ Author: 'James Clear', Publisher: 'Penguin Random House', Pages: '320', Language: 'English' })],
    ['The Psychology of Money', 'Timeless lessons on wealth, greed, and happiness by Morgan Housel.', 349, 599, 42, 400, 6, 'Jaico Publishing', 4.6, 28934,
      JSON.stringify(['https://m.media-amazon.com/images/I/71g2ednj0JL._SY466_.jpg']),
      JSON.stringify({ Author: 'Morgan Housel', Publisher: 'Harriman House', Pages: '256', Language: 'English' })],
    ['Rich Dad Poor Dad', 'What the Rich Teach Their Kids About Money That the Poor and Middle Class Do Not.', 299, 499, 40, 600, 6, 'Manjul Publishing', 4.5, 52341,
      JSON.stringify(['https://m.media-amazon.com/images/I/81BE7eeKzAL._SY466_.jpg']),
      JSON.stringify({ Author: 'Robert T. Kiyosaki', Pages: '336', Language: 'English' })],

    // Appliances (cat 5)
    ['LG 8 kg 5 Star Inverter Washing Machine', 'LG 8 kg 5 Star Inverter Fully-Automatic Front Loading Washing Machine with Steam.', 44990, 59990, 25, 25, 5, 'LG', 4.5, 5632,
      JSON.stringify(['https://m.media-amazon.com/images/I/71pnHk+KPNL._SX679_.jpg']),
      JSON.stringify({ Capacity: '8 kg', Type: 'Front Load', 'Star Rating': '5 Star', Inverter: 'Yes', Steam: 'Yes' })],

    // Sports (cat 8)
    ['Yonex Astrox 88D Pro Badminton Racket', 'Yonex Astrox 88D Pro with Rotational Generator System for powerful smashes.', 12999, 16999, 24, 40, 8, 'Yonex', 4.7, 2341,
      JSON.stringify(['https://m.media-amazon.com/images/I/61UNMbFhpHL._SX679_.jpg']),
      JSON.stringify({ Weight: '83g', Flex: 'Stiff', 'Frame Material': 'HM Graphite', 'String Tension': 'Up to 35 lbs' })],
    ['Nivia Storm Football Size 5', 'Nivia Storm Football, Size 5, suitable for professional and recreational play.', 599, 999, 40, 200, 8, 'Nivia', 4.2, 8923,
      JSON.stringify(['https://m.media-amazon.com/images/I/71f5Eu5lJSL._SX679_.jpg']),
      JSON.stringify({ Size: '5', Material: 'PU', Panels: '32', Bladder: 'Butyl' })],
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
