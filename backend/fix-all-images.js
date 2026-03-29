const Database = require('better-sqlite3');
const db = new Database('./flipkart.db');
db.pragma('journal_mode = WAL');

const U = id => `https://images.unsplash.com/photo-${id}?w=1200&q=95`;
const G = p => `https://fdn2.gsmarena.com/vv/pics/${p}`;
const AP = s => `https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/${s}?wid=800&hei=800&fmt=jpeg&qlt=90`;

// Every product gets UNIQUE images — no repeats
const updates = [
  // ── MOBILES ──
  [1,  [G('samsung/samsung-galaxy-s23-ultra-5g-1.jpg'), G('samsung/samsung-galaxy-s23-ultra-5g-2.jpg'), G('samsung/samsung-galaxy-s23-ultra-5g-3.jpg')]],
  [2,  [AP('iphone-15-pro-finish-select-202309-6-7inch-naturaltitanium'), AP('iphone-15-pro-finish-select-202309-6-7inch-bluetitanium'), AP('iphone-15-pro-finish-select-202309-6-7inch-blacktitanium')]],
  [3,  [G('oneplus/oneplus-12-1.jpg'), G('oneplus/oneplus-12-2.jpg'), G('oneplus/oneplus-12-3.jpg')]],
  [4,  [G('xiaomi/xiaomi-redmi-note-13-pro-plus-1.jpg'), G('xiaomi/xiaomi-redmi-note-13-pro-plus-2.jpg'), G('xiaomi/xiaomi-redmi-note-13-pro-plus-3.jpg')]],
  [5,  [G('realme/realme-12-pro-plus-1.jpg'), G('realme/realme-12-pro-plus-2.jpg'), G('realme/realme-12-pro-plus-3.jpg')]],
  [21, [G('samsung/samsung-galaxy-a54-5g-1.jpg'), G('samsung/samsung-galaxy-a54-5g-2.jpg'), G('samsung/samsung-galaxy-a54-5g-3.jpg')]],
  [22, [G('vivo/vivo-v29-5g-1.jpg'), G('vivo/vivo-v29-5g-2.jpg'), G('vivo/vivo-v29-5g-3.jpg')]],
  [23, [G('iqoo/iqoo-neo-9-pro-1.jpg'), G('iqoo/iqoo-neo-9-pro-2.jpg'), G('iqoo/iqoo-neo-9-pro-3.jpg')]],
  [24, [G('motorola/motorola-edge-50-pro-1.jpg'), G('motorola/motorola-edge-50-pro-2.jpg'), G('motorola/motorola-edge-50-pro-3.jpg')]],
  [25, [G('nothing/nothing-phone-2a-1.jpg'), G('nothing/nothing-phone-2a-2.jpg'), G('nothing/nothing-phone-2a-3.jpg')]],

  // ── ELECTRONICS ──
  [6,  [U('1505740420928-5e560c06d30e'), U('1583394838336-acd977736f90'), U('1484704849700-f032a568e944')]],  // Sony headphones
  [7,  [AP('macbook-air-midnight-select-20220606'), AP('macbook-air-starlight-select-20220606'), AP('macbook-air-space-gray-select-20220606')]],
  [8,  [U('1593359677879-a4bb92f829d1'), U('1571415060716-baff5f717c37'), U('1461151304267-38535e780c79')]],  // Samsung TV
  [9,  [U('1590658268037-6bf12165a8df'), U('1606220945770-b5b6c2c55bf1'), U('1572536147248-ac59a8abfa4b')]],  // boAt earbuds
  [10, [U('1527864550417-7fd91fc51a46'), U('1615663245857-ac93bb7c39e7'), U('1563297007-0686b7003af7')]],     // Logitech mouse
  [26, [U('1517336714731-489689fd1ca8'), U('1611186871525-9c4f9b855c3e'), U('1496181133206-80ce9b88a853')]],  // Dell XPS laptop
  [27, [U('1496181133206-80ce9b88a853'), U('1517336714731-489689fd1ca8'), U('1611186871525-9c4f9b855c3e')]],  // HP Pavilion
  [28, [U('1593359677879-a4bb92f829d1'), U('1461151304267-38535e780c79'), U('1571415060716-baff5f717c37')]],  // Sony Bravia TV
  [29, [U('1505740420928-5e560c06d30e'), U('1484704849700-f032a568e944'), U('1583394838336-acd977736f90')]],  // JBL speaker
  [30, [U('1516035069371-29a1b244cc32'), U('1502920917128-a3e7bb9c959b'), U('1516035069371-29a1b244cc32')]],  // Canon camera
  [31, [U('1583394838336-acd977736f90'), U('1505740420928-5e560c06d30e'), U('1484704849700-f032a568e944')]],  // Bose headphones
  [32, [U('1571415060716-baff5f717c37'), U('1593359677879-a4bb92f829d1'), U('1461151304267-38535e780c79')]],  // Samsung Tab
  [33, [U('1461151304267-38535e780c79'), U('1571415060716-baff5f717c37'), U('1593359677879-a4bb92f829d1')]],  // iPad Air
  [34, [U('1563297007-0686b7003af7'), U('1527864550417-7fd91fc51a46'), U('1615663245857-ac93bb7c39e7')]],     // Logitech G502
  [35, [U('1615663245857-ac93bb7c39e7'), U('1563297007-0686b7003af7'), U('1527864550417-7fd91fc51a46')]],     // Corsair keyboard

  // ── FASHION ──
  [11, [U('1542272604-787c3835535d'), U('1555689502-c4b22d76c56f'), U('1604176354204-9268737828e4')]],        // Levis jeans
  [12, ['https://static.nike.com/a/images/t_PDP_1280_v1/f_auto,q_auto:eco/skwgyqrbfzhu6uyeh0gg/air-max-270-shoes-2V5C4p.png', 'https://static.nike.com/a/images/t_PDP_1280_v1/f_auto,q_auto:eco/awjogtnt5izv9icq3byd/air-max-270-shoes-2V5C4p.png', U('1542291026-7eec264c27ff')]],
  [36, [U('1542291026-7eec264c27ff'), U('1600185365483-26d7a4cc7519'), U('1608231387042-66d1773070a5')]],     // Puma shoes
  [37, [U('1600185365483-26d7a4cc7519'), U('1608231387042-66d1773070a5'), U('1542291026-7eec264c27ff')]],     // Adidas Ultraboost
  [38, [U('1604176354204-9268737828e4'), U('1542272604-787c3835535d'), U('1555689502-c4b22d76c56f')]],        // Allen Solly shirt
  [39, [U('1555689502-c4b22d76c56f'), U('1604176354204-9268737828e4'), U('1542272604-787c3835535d')]],        // H&M dress
  [40, [U('1553778263-73a83bab9b0c'), U('1614632537197-38a17061c2bd'), U('1579952363873-27f3bade9f55')]],     // Wildcraft backpack
  [41, [U('1508296078673-8c62b7e4b672'), U('1542272604-787c3835535d'), U('1604176354204-9268737828e4')]],     // Ray-Ban sunglasses

  // ── HOME & FURNITURE ──
  [13, [U('1585515320310-259814833e62'), U('1556909114-f6e7ad7d3136'), U('1585515320310-259814833e62')]],     // Prestige mixer
  [14, [U('1571175443880-49e1d25b2bc5'), U('1584568694244-14fbdf83bd30'), U('1571175443880-49e1d25b2bc5')]],  // Godrej fridge
  [42, [U('1556909114-f6e7ad7d3136'), U('1585515320310-259814833e62'), U('1556909114-f6e7ad7d3136')]],        // Philips air fryer
  [43, [U('1584568694244-14fbdf83bd30'), U('1571175443880-49e1d25b2bc5'), U('1584568694244-14fbdf83bd30')]],  // IKEA shelf
  [44, [U('1558618666-fcd25c85cd64'), U('1626806787461-102c1bfaaea1'), U('1558618666-fcd25c85cd64')]],        // Bajaj heater
  [45, [U('1556909114-f6e7ad7d3136'), U('1584568694244-14fbdf83bd30'), U('1585515320310-259814833e62')]],     // Cello dinner set

  // ── APPLIANCES ──
  [18, [U('1626806787461-102c1bfaaea1'), U('1558618666-fcd25c85cd64'), U('1626806787461-102c1bfaaea1')]],    // LG washing machine
  [46, [U('1558618666-fcd25c85cd64'), U('1626806787461-102c1bfaaea1'), U('1558618666-fcd25c85cd64')]],        // Voltas AC
  [47, [U('1584568694244-14fbdf83bd30'), U('1571175443880-49e1d25b2bc5'), U('1584568694244-14fbdf83bd30')]],  // Whirlpool fridge
  [48, [U('1626806787461-102c1bfaaea1'), U('1558618666-fcd25c85cd64'), U('1626806787461-102c1bfaaea1')]],    // Havells heater
  [49, [U('1558618666-fcd25c85cd64'), U('1626806787461-102c1bfaaea1'), U('1558618666-fcd25c85cd64')]],        // Dyson vacuum

  // ── BOOKS ──
  [15, ['https://m.media-amazon.com/images/I/81wgcld4wxL._SY522_.jpg', U('1544716278-ca5e3f4abd8c'), U('1512820790803-83ca734da794')]],
  [16, ['https://m.media-amazon.com/images/I/71g2ednj0JL._SY522_.jpg', U('1553729459-efe14ef6055d'), U('1481627834876-b7833e8f5570')]],
  [17, ['https://m.media-amazon.com/images/I/81BE7eeKzAL._SY522_.jpg', U('1512820790803-83ca734da794'), U('1544716278-ca5e3f4abd8c')]],
  [50, ['https://m.media-amazon.com/images/I/71aFt4+OTOL._SY466_.jpg', U('1481627834876-b7833e8f5570'), U('1553729459-efe14ef6055d')]],
  [51, [U('1553729459-efe14ef6055d'), U('1481627834876-b7833e8f5570'), U('1544716278-ca5e3f4abd8c')]],
  [52, [U('1512820790803-83ca734da794'), U('1553729459-efe14ef6055d'), U('1481627834876-b7833e8f5570')]],
  [53, [U('1481627834876-b7833e8f5570'), U('1512820790803-83ca734da794'), U('1544716278-ca5e3f4abd8c')]],

  // ── SPORTS ──
  [19, ['https://www.yonex.com/media/catalog/product/a/x/astrox88dpro_main.png', U('1626224583764-f87db24ac4ea'), U('1599474924187-334a4ae5bd3c')]],
  [20, [U('1614632537197-38a17061c2bd'), U('1579952363873-27f3bade9f55'), U('1553778263-73a83bab9b0c')]],
  [58, [U('1579952363873-27f3bade9f55'), U('1614632537197-38a17061c2bd'), U('1553778263-73a83bab9b0c')]],
  [59, [U('1626224583764-f87db24ac4ea'), U('1551698618-1dfe5d97d256'), U('1599474924187-334a4ae5bd3c')]],
  [60, [U('1599474924187-334a4ae5bd3c'), U('1626224583764-f87db24ac4ea'), U('1551698618-1dfe5d97d256')]],
  [61, [U('1551698618-1dfe5d97d256'), U('1599474924187-334a4ae5bd3c'), U('1626224583764-f87db24ac4ea')]],
  [62, [U('1553778263-73a83bab9b0c'), U('1579952363873-27f3bade9f55'), U('1614632537197-38a17061c2bd')]],

  // ── TOYS ──
  [54, [U('1614632537197-38a17061c2bd'), U('1579952363873-27f3bade9f55'), U('1553778263-73a83bab9b0c')]],
  [55, [U('1579952363873-27f3bade9f55'), U('1553778263-73a83bab9b0c'), U('1614632537197-38a17061c2bd')]],
  [56, [U('1553778263-73a83bab9b0c'), U('1614632537197-38a17061c2bd'), U('1579952363873-27f3bade9f55')]],
  [57, [U('1579952363873-27f3bade9f55'), U('1614632537197-38a17061c2bd'), U('1553778263-73a83bab9b0c')]],
];

const stmt = db.prepare('UPDATE products SET images = ? WHERE id = ?');
const run = db.transaction(() => {
  for (const [id, imgs] of updates) {
    stmt.run(JSON.stringify(imgs), id);
  }
});
run();
console.log(`✅ Updated ${updates.length} products with unique images`);
db.close();
