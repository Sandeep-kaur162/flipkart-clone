const Database = require('better-sqlite3');
const path = require('path');
const db = new Database(path.join(__dirname, 'flipkart.db'));

db.prepare("UPDATE products SET images = ? WHERE name = 'Yonex Astrox 88D Pro Badminton Racket'")
  .run(JSON.stringify(['https://m.media-amazon.com/images/I/61UNMbFhpHL._SX679_.jpg']));

const row = db.prepare("SELECT name, images FROM products WHERE name LIKE 'Yonex%'").get();
console.log('Updated:', row.name, '->', row.images);
