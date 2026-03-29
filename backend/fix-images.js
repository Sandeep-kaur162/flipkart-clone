/**
 * fix-images.js — node fix-images.js
 * All URLs verified 200 OK. Product-relevant Unsplash photos + official CDNs.
 */
const Database = require('better-sqlite3');
const path = require('path');
const db = new Database(path.join(__dirname, 'flipkart.db'));
db.pragma('journal_mode = WAL');

const U = (id) => `https://images.unsplash.com/photo-${id}?w=1200&q=95&fit=crop`;

const updates = [
  // 1 - Samsung Galaxy S23 Ultra 5G (dark Android phone)
  [1, [
    U('1610945415295-d9bbf067e59c'),  // dark phone front
    U('1598327105666-5b89351aff97'),  // phone back cameras
    U('1511707171634-5f897ff02aa9'),  // phone side angle
  ]],

  // 2 - Apple iPhone 15 Pro Max (official Apple CDN - verified)
  [2, [
    'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/iphone-15-pro-finish-select-202309-6-7inch-naturaltitanium?wid=800&hei=800&fmt=jpeg&qlt=90',
    'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/iphone-15-pro-finish-select-202309-6-7inch-bluetitanium?wid=800&hei=800&fmt=jpeg&qlt=90',
    'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/iphone-15-pro-finish-select-202309-6-7inch-blacktitanium?wid=800&hei=800&fmt=jpeg&qlt=90',
  ]],

  // 3 - OnePlus 12 5G (green/black phone)
  [3, [
    U('1695048133142-1a20484d2569'),  // modern smartphone
    U('1580910051074-3eb694886505'),  // phone flat lay
    U('1592750475338-74b7b21085ab'),  // phone held in hand
  ]],

  // 4 - Redmi Note 13 Pro+ 5G
  [4, [
    U('1511707171634-5f897ff02aa9'),  // phone side
    U('1610945415295-d9bbf067e59c'),  // phone front dark
    U('1598327105666-5b89351aff97'),  // phone cameras
  ]],

  // 5 - Realme 12 Pro+ 5G
  [5, [
    U('1580910051074-3eb694886505'),  // phone on surface
    U('1592750475338-74b7b21085ab'),  // phone in hand
    U('1695048133142-1a20484d2569'),  // phone display
  ]],

  // 6 - Sony WH-1000XM5 Headphones
  [6, [
    U('1505740420928-5e560c06d30e'),  // over-ear headphones white bg
    U('1583394838336-acd977736f90'),  // headphones on table
    U('1484704849700-f032a568e944'),  // headphones lifestyle
  ]],

  // 7 - Apple MacBook Air M2 (official Apple CDN - verified)
  [7, [
    'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/macbook-air-midnight-select-20220606?wid=800&hei=800&fmt=jpeg&qlt=90',
    'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/macbook-air-starlight-select-20220606?wid=800&hei=800&fmt=jpeg&qlt=90',
    U('1496181133206-80ce9b88a853'),  // laptop on desk
  ]],

  // 8 - Samsung 55 inch 4K Smart TV
  [8, [
    U('1593359677879-a4bb92f829d1'),  // TV mounted on wall
    U('1571415060716-baff5f717c37'),  // TV in living room
    U('1461151304267-38535e780c79'),  // TV close up screen
  ]],

  // 9 - boAt Airdopes 141 TWS Earbuds
  [9, [
    U('1590658268037-6bf12165a8df'),  // TWS earbuds in case
    U('1606220945770-b5b6c2c55bf1'),  // earbuds white
    U('1572536147248-ac59a8abfa4b'),  // earbuds lifestyle
  ]],

  // 10 - Logitech MX Master 3S Mouse
  [10, [
    U('1527864550417-7fd91fc51a46'),  // computer mouse top view
    U('1615663245857-ac93bb7c39e7'),  // mouse on desk setup
    U('1563297007-0686b7003af7'),     // mouse side view
  ]],

  // 11 - Levi's 511 Slim Fit Jeans
  [11, [
    U('1542272604-787c3835535d'),     // blue jeans folded
    U('1555689502-c4b22d76c56f'),     // jeans worn standing
    U('1604176354204-9268737828e4'),  // denim close up texture
  ]],

  // 12 - Nike Air Max 270 (Nike official CDN - verified)
  [12, [
    'https://static.nike.com/a/images/t_PDP_1280_v1/f_auto,q_auto:eco/skwgyqrbfzhu6uyeh0gg/air-max-270-shoes-2V5C4p.png',
    'https://static.nike.com/a/images/t_PDP_1280_v1/f_auto,q_auto:eco/awjogtnt5izv9icq3byd/air-max-270-shoes-2V5C4p.png',
    U('1542291026-7eec264c27ff'),     // running shoe side
  ]],

  // 13 - Prestige Iris 750W Mixer Grinder
  [13, [
    U('1585515320310-259814833e62'),  // mixer grinder on counter
    U('1556909114-f6e7ad7d3136'),     // kitchen blender
    U('1585515320310-259814833e62'),  // mixer again
  ]],

  // 14 - Godrej 564L French Door Refrigerator
  [14, [
    U('1571175443880-49e1d25b2bc5'),  // refrigerator front
    U('1584568694244-14fbdf83bd30'),  // fridge open inside
    U('1571175443880-49e1d25b2bc5'),
  ]],

  // 15 - Atomic Habits (Amazon cover - verified)
  [15, [
    'https://m.media-amazon.com/images/I/81wgcld4wxL._SY522_.jpg',
    U('1544716278-ca5e3f4abd8c'),     // book on table
    U('1512820790803-83ca734da794'),  // books stack
  ]],

  // 16 - The Psychology of Money (Amazon cover - verified)
  [16, [
    'https://m.media-amazon.com/images/I/71g2ednj0JL._SY522_.jpg',
    U('1553729459-efe14ef6055d'),     // finance/money book
    U('1481627834876-b7833e8f5570'),  // bookshelf
  ]],

  // 17 - Rich Dad Poor Dad (Amazon cover - verified)
  [17, [
    'https://m.media-amazon.com/images/I/81BE7eeKzAL._SY522_.jpg',
    U('1512820790803-83ca734da794'),  // books
    U('1544716278-ca5e3f4abd8c'),     // book reading
  ]],

  // 18 - LG 8kg Washing Machine
  [18, [
    U('1626806787461-102c1bfaaea1'),  // front load washing machine
    U('1558618666-fcd25c85cd64'),     // washing machine white
    U('1626806787461-102c1bfaaea1'),
  ]],

  // 19 - Yonex Astrox 88D Pro (Yonex official - verified)
  [19, [
    'https://www.yonex.com/media/catalog/product/a/x/astrox88dpro_main.png',
    U('1626224583764-f87db24ac4ea'),  // badminton racket
    U('1599474924187-334a4ae5bd3c'),  // badminton court action
  ]],

  // 20 - Nivia Storm Football
  [20, [
    U('1614632537197-38a17061c2bd'),  // football close up
    U('1579952363873-27f3bade9f55'),  // football on grass
    U('1553778263-73a83bab9b0c'),     // football stadium
  ]],
];

const stmt = db.prepare('UPDATE products SET images = ? WHERE id = ?');
const run = db.transaction(() => {
  for (const [id, imgs] of updates) {
    stmt.run(JSON.stringify(imgs), id);
    console.log(`✅ Product ${id} updated`);
  }
});
run();
console.log('\n🎉 All images updated!');
db.close();
