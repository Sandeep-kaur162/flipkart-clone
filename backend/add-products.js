const Database = require('better-sqlite3');
const path = require('path');
const db = new Database(path.join(__dirname, 'flipkart.db'));
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

const U = id => `https://images.unsplash.com/photo-${id}?w=1200&q=95&fit=crop`;
const G = p => `https://fdn2.gsmarena.com/vv/pics/${p}`;

// cat IDs: electronics=1, mobiles=2, fashion=3, home-furniture=4, appliances=5, books=6, toys=7, sports=8

const products = [
  // ── MOBILES ──────────────────────────────────────────────────────────────
  ['Samsung Galaxy A54 5G', 'Samsung Galaxy A54 with 50MP OIS camera, 5000mAh battery and IP67 rating.', 34999, 42999, 19, 150, 2, 'Samsung', 4.3, 8234,
    JSON.stringify([G('samsung/samsung-galaxy-a54-5g-1.jpg'), G('samsung/samsung-galaxy-a54-5g-2.jpg'), G('samsung/samsung-galaxy-a54-5g-3.jpg')]),
    JSON.stringify({Display:'6.4 inch Super AMOLED',Processor:'Exynos 1380',RAM:'8 GB',Storage:'128 GB',Camera:'50 MP OIS',Battery:'5000 mAh',OS:'Android 13'})],

  ['Vivo V29 5G', 'Vivo V29 with 50MP Aura Light Portrait Camera and 80W FlashCharge.', 35999, 44999, 20, 90, 2, 'Vivo', 4.2, 4521,
    JSON.stringify([U('1598327105666-5b89351aff97'), U('1511707171634-5f897ff02aa9'), U('1610945415295-d9bbf067e59c')]),
    JSON.stringify({Display:'6.78 inch AMOLED',Processor:'Snapdragon 778G',RAM:'8 GB',Storage:'256 GB',Camera:'50 MP',Battery:'4600 mAh',OS:'Android 13'})],

  ['iQOO Neo 9 Pro 5G', 'iQOO Neo 9 Pro with Snapdragon 8 Gen 2 and 144Hz AMOLED display.', 36999, 44999, 18, 120, 2, 'iQOO', 4.4, 3210,
    JSON.stringify([U('1695048133142-1a20484d2569'), U('1580910051074-3eb694886505'), U('1592750475338-74b7b21085ab')]),
    JSON.stringify({Display:'6.78 inch AMOLED 144Hz',Processor:'Snapdragon 8 Gen 2',RAM:'12 GB',Storage:'256 GB',Camera:'50 MP',Battery:'5160 mAh',OS:'Android 14'})],

  ['Motorola Edge 50 Pro', 'Motorola Edge 50 Pro with 125W TurboPower charging and 50MP periscope camera.', 31999, 39999, 20, 80, 2, 'Motorola', 4.1, 2890,
    JSON.stringify([U('1511707171634-5f897ff02aa9'), U('1598327105666-5b89351aff97'), U('1610945415295-d9bbf067e59c')]),
    JSON.stringify({Display:'6.7 inch pOLED 144Hz',Processor:'Snapdragon 7 Gen 3',RAM:'12 GB',Storage:'256 GB',Camera:'50 MP',Battery:'4500 mAh',OS:'Android 14'})],

  ['Nothing Phone 2a', 'Nothing Phone 2a with Glyph Interface and Dimensity 7200 Pro.', 23999, 27999, 14, 200, 2, 'Nothing', 4.3, 5670,
    JSON.stringify([U('1695048133142-1a20484d2569'), U('1592750475338-74b7b21085ab'), U('1580910051074-3eb694886505')]),
    JSON.stringify({Display:'6.7 inch AMOLED 120Hz',Processor:'Dimensity 7200 Pro',RAM:'8 GB',Storage:'128 GB',Camera:'50 MP',Battery:'5000 mAh',OS:'Android 14'})],

  // ── ELECTRONICS ──────────────────────────────────────────────────────────
  ['Dell XPS 15 Laptop', 'Dell XPS 15 with Intel Core i7-13700H, 16GB RAM and OLED display.', 149990, 179990, 17, 15, 1, 'Dell', 4.6, 1234,
    JSON.stringify([U('1517336714731-489689fd1ca8'), U('1611186871525-9c4f9b855c3e'), U('1496181133206-80ce9b88a853')]),
    JSON.stringify({Display:'15.6 inch OLED 3.5K',Processor:'Intel Core i7-13700H',RAM:'16 GB',Storage:'512 GB SSD',GPU:'NVIDIA RTX 4060',Battery:'86 Whr',OS:'Windows 11'})],

  ['HP Pavilion 15 Laptop', 'HP Pavilion 15 with AMD Ryzen 5 7530U and Full HD IPS display.', 54990, 69990, 21, 40, 1, 'HP', 4.2, 3456,
    JSON.stringify([U('1496181133206-80ce9b88a853'), U('1517336714731-489689fd1ca8'), U('1611186871525-9c4f9b855c3e')]),
    JSON.stringify({Display:'15.6 inch FHD IPS',Processor:'AMD Ryzen 5 7530U',RAM:'16 GB',Storage:'512 GB SSD',Battery:'41 Whr',OS:'Windows 11'})],

  ['Sony Bravia 65 inch 4K OLED TV', 'Sony Bravia XR OLED with Cognitive Processor XR and Acoustic Surface Audio.', 189990, 249990, 24, 10, 1, 'Sony', 4.8, 892,
    JSON.stringify([U('1593359677879-a4bb92f829d1'), U('1571415060716-baff5f717c37'), U('1461151304267-38535e780c79')]),
    JSON.stringify({'Screen Size':'65 inch',Resolution:'4K OLED',Processor:'Cognitive XR',HDR:'Yes',OS:'Google TV','HDMI Ports':'4'})],

  ['JBL Flip 6 Bluetooth Speaker', 'JBL Flip 6 with IP67 waterproof rating and 12 hours playtime.', 9999, 13999, 29, 200, 1, 'JBL', 4.5, 12340,
    JSON.stringify([U('1505740420928-5e560c06d30e'), U('1484704849700-f032a568e944'), U('1583394838336-acd977736f90')]),
    JSON.stringify({Type:'Portable Bluetooth',Battery:'12 hours',Waterproof:'IP67',Connectivity:'Bluetooth 5.1',Power:'30W'})],

  ['Canon EOS R50 Mirrorless Camera', 'Canon EOS R50 with 24.2MP APS-C sensor and 4K video recording.', 74990, 89990, 17, 25, 1, 'Canon', 4.7, 1567,
    JSON.stringify([U('1516035069371-29a1b244cc32'), U('1502920917128-a3e7bb9c959b'), U('1516035069371-29a1b244cc32')]),
    JSON.stringify({Sensor:'24.2 MP APS-C',Video:'4K 30fps',Autofocus:'Dual Pixel CMOS AF II',Display:'3 inch Vari-angle',Weight:'375g'})],

  ['Bose QuietComfort 45 Headphones', 'Bose QC45 with world-class noise cancellation and 24-hour battery.', 24990, 32990, 24, 60, 1, 'Bose', 4.6, 4321,
    JSON.stringify([U('1505740420928-5e560c06d30e'), U('1583394838336-acd977736f90'), U('1484704849700-f032a568e944')]),
    JSON.stringify({Type:'Over-Ear',Battery:'24 hours',NoiseCancellation:'Yes',Connectivity:'Bluetooth 5.1',Weight:'238g'})],

  ['Samsung Galaxy Tab S9', 'Samsung Galaxy Tab S9 with Dynamic AMOLED 2X display and S Pen included.', 72999, 89999, 19, 35, 1, 'Samsung', 4.6, 2341,
    JSON.stringify([U('1593359677879-a4bb92f829d1'), U('1461151304267-38535e780c79'), U('1571415060716-baff5f717c37')]),
    JSON.stringify({Display:'11 inch Dynamic AMOLED 2X',Processor:'Snapdragon 8 Gen 2',RAM:'8 GB',Storage:'128 GB','S Pen':'Included',Battery:'8400 mAh'})],

  ['Apple iPad Air M2', 'Apple iPad Air with M2 chip, 11-inch Liquid Retina display and Apple Pencil support.', 59900, 69900, 14, 30, 1, 'Apple', 4.7, 3210,
    JSON.stringify([U('1593359677879-a4bb92f829d1'), U('1571415060716-baff5f717c37'), U('1461151304267-38535e780c79')]),
    JSON.stringify({Display:'11 inch Liquid Retina',Processor:'Apple M2',RAM:'8 GB',Storage:'128 GB',Camera:'12 MP',Battery:'28.65 Whr'})],

  ['Logitech G502 X Gaming Mouse', 'Logitech G502 X with LIGHTFORCE hybrid switches and HERO 25K sensor.', 6995, 9995, 30, 100, 1, 'Logitech', 4.5, 5678,
    JSON.stringify([U('1527864550417-7fd91fc51a46'), U('1615663245857-ac93bb7c39e7'), U('1563297007-0686b7003af7')]),
    JSON.stringify({Sensor:'HERO 25K',DPI:'100-25600',Buttons:'13',Connectivity:'Wired',Weight:'89g'})],

  ['Corsair K70 RGB Mechanical Keyboard', 'Corsair K70 RGB with Cherry MX Red switches and per-key RGB lighting.', 12999, 17999, 28, 50, 1, 'Corsair', 4.4, 2890,
    JSON.stringify([U('1527864550417-7fd91fc51a46'), U('1563297007-0686b7003af7'), U('1615663245857-ac93bb7c39e7')]),
    JSON.stringify({Switches:'Cherry MX Red',Backlight:'Per-key RGB',Layout:'Full Size',Connectivity:'USB','Wrist Rest':'Included'})],
];

const moreProducts = [
  // ── FASHION ──────────────────────────────────────────────────────────────
  ['Puma Men\'s Running Shoes', 'Puma Softride Pro running shoes with SoftFoam+ insole for all-day comfort.', 3999, 5999, 33, 200, 3, 'Puma', 4.2, 6789,
    JSON.stringify([U('1542291026-7eec264c27ff'), U('1600185365483-26d7a4cc7519'), U('1608231387042-66d1773070a5')]),
    JSON.stringify({Type:'Running',Sole:'Rubber',Closure:'Lace-Up',Upper:'Mesh',Technology:'SoftFoam+'})],

  ['Adidas Ultraboost 22', 'Adidas Ultraboost 22 with BOOST midsole and Primeknit+ upper.', 14999, 19999, 25, 80, 3, 'Adidas', 4.5, 4321,
    JSON.stringify([U('1542291026-7eec264c27ff'), U('1608231387042-66d1773070a5'), U('1600185365483-26d7a4cc7519')]),
    JSON.stringify({Type:'Running',Technology:'BOOST',Upper:'Primeknit+',Sole:'Continental Rubber',Drop:'10mm'})],

  ['Allen Solly Men\'s Formal Shirt', 'Allen Solly slim fit formal shirt in premium cotton blend.', 1299, 2499, 48, 300, 3, 'Allen Solly', 4.1, 8901,
    JSON.stringify([U('1542272604-787c3835535d'), U('1555689502-c4b22d76c56f'), U('1604176354204-9268737828e4')]),
    JSON.stringify({Fit:'Slim',Material:'60% Cotton 40% Polyester',Collar:'Spread',Sleeve:'Full',Care:'Machine Wash'})],

  ['H&M Women\'s Floral Dress', 'H&M floral print midi dress with puff sleeves and tie waist.', 1799, 2999, 40, 150, 3, 'H&M', 4.0, 5432,
    JSON.stringify([U('1542272604-787c3835535d'), U('1604176354204-9268737828e4'), U('1555689502-c4b22d76c56f')]),
    JSON.stringify({Fit:'Regular',Material:'100% Viscose',Length:'Midi',Sleeve:'Puff',Care:'Hand Wash'})],

  ['Wildcraft Backpack 45L', 'Wildcraft Trailblazer 45L backpack with rain cover and laptop compartment.', 2499, 3999, 38, 120, 3, 'Wildcraft', 4.3, 7654,
    JSON.stringify([U('1542272604-787c3835535d'), U('1555689502-c4b22d76c56f'), U('1604176354204-9268737828e4')]),
    JSON.stringify({Capacity:'45 L',Material:'Nylon',Laptop:'15.6 inch',RainCover:'Included',Pockets:'6'})],

  ['Ray-Ban Aviator Sunglasses', 'Ray-Ban Classic Aviator with gold frame and green G-15 lenses.', 6990, 9990, 30, 100, 3, 'Ray-Ban', 4.6, 3456,
    JSON.stringify([U('1542272604-787c3835535d'), U('1604176354204-9268737828e4'), U('1555689502-c4b22d76c56f')]),
    JSON.stringify({Frame:'Gold Metal',Lens:'G-15 Green',UV:'100% UV Protection',Style:'Aviator',Gender:'Unisex'})],

  // ── HOME & FURNITURE ─────────────────────────────────────────────────────
  ['Philips Air Fryer HD9200', 'Philips Air Fryer with Rapid Air Technology, 4.1L capacity.', 6995, 9995, 30, 80, 4, 'Philips', 4.4, 9876,
    JSON.stringify([U('1585515320310-259814833e62'), U('1556909114-f6e7ad7d3136'), U('1585515320310-259814833e62')]),
    JSON.stringify({Capacity:'4.1 L',Power:'1400W',Technology:'Rapid Air',Timer:'60 min',Dishwasher:'Safe'})],

  ['IKEA KALLAX Shelf Unit', 'IKEA KALLAX 4-cube shelf unit in white, perfect for living room storage.', 4999, 6999, 29, 50, 4, 'IKEA', 4.3, 4567,
    JSON.stringify([U('1571175443880-49e1d25b2bc5'), U('1584568694244-14fbdf83bd30'), U('1571175443880-49e1d25b2bc5')]),
    JSON.stringify({Material:'Particleboard',Dimensions:'77x77 cm',Cubes:'4',Color:'White',Assembly:'Required'})],

  ['Bajaj Majesty 1000W Room Heater', 'Bajaj Majesty fan room heater with 2 heat settings and overheat protection.', 1799, 2799, 36, 200, 4, 'Bajaj', 4.2, 12345,
    JSON.stringify([U('1585515320310-259814833e62'), U('1556909114-f6e7ad7d3136'), U('1585515320310-259814833e62')]),
    JSON.stringify({Power:'1000W',Settings:'2 Heat + Fan',Safety:'Overheat Protection',Type:'Fan Heater',Warranty:'2 years'})],

  ['Cello Opalware Dinner Set 35pcs', 'Cello Opalware 35-piece dinner set, microwave and dishwasher safe.', 1999, 3499, 43, 150, 4, 'Cello', 4.1, 8765,
    JSON.stringify([U('1585515320310-259814833e62'), U('1556909114-f6e7ad7d3136'), U('1585515320310-259814833e62')]),
    JSON.stringify({Pieces:'35',Material:'Opalware',Microwave:'Safe',Dishwasher:'Safe',Color:'White with Print'})],

  // ── APPLIANCES ───────────────────────────────────────────────────────────
  ['Voltas 1.5 Ton 5 Star AC', 'Voltas 5 Star Inverter Split AC with 4-in-1 adjustable mode.', 38990, 52990, 26, 30, 5, 'Voltas', 4.3, 5678,
    JSON.stringify([U('1626806787461-102c1bfaaea1'), U('1558618666-fcd25c85cd64'), U('1626806787461-102c1bfaaea1')]),
    JSON.stringify({Capacity:'1.5 Ton','Star Rating':'5 Star',Inverter:'Yes',Refrigerant:'R32',Warranty:'1+4+10 years'})],

  ['Whirlpool 265L Double Door Refrigerator', 'Whirlpool 265L frost-free double door fridge with 6th Sense technology.', 28990, 38990, 26, 25, 5, 'Whirlpool', 4.2, 4321,
    JSON.stringify([U('1571175443880-49e1d25b2bc5'), U('1584568694244-14fbdf83bd30'), U('1571175443880-49e1d25b2bc5')]),
    JSON.stringify({Capacity:'265 L',Type:'Double Door',FrostFree:'Yes','Star Rating':'3 Star',Warranty:'1+10 years'})],

  ['Havells Instanio 3L Water Heater', 'Havells Instanio 3L instant water heater with anti-siphon valve.', 3299, 4999, 34, 100, 5, 'Havells', 4.3, 7890,
    JSON.stringify([U('1626806787461-102c1bfaaea1'), U('1558618666-fcd25c85cd64'), U('1626806787461-102c1bfaaea1')]),
    JSON.stringify({Capacity:'3 L',Power:'3000W',Type:'Instant',Safety:'Anti-siphon valve',Warranty:'2 years'})],

  ['Dyson V12 Detect Slim Vacuum', 'Dyson V12 Detect Slim with laser dust detection and HEPA filtration.', 44900, 54900, 18, 20, 5, 'Dyson', 4.7, 1234,
    JSON.stringify([U('1626806787461-102c1bfaaea1'), U('1558618666-fcd25c85cd64'), U('1626806787461-102c1bfaaea1')]),
    JSON.stringify({Type:'Cordless',Battery:'60 min',Filtration:'HEPA',LaserDetection:'Yes',Weight:'2.2 kg'})],

  // ── BOOKS ────────────────────────────────────────────────────────────────
  ['The Alchemist by Paulo Coelho', 'A magical story about following your dreams. One of the best-selling books of all time.', 249, 399, 38, 800, 6, 'HarperCollins', 4.7, 89012,
    JSON.stringify(['https://m.media-amazon.com/images/I/71aFt4+OTOL._SY466_.jpg', U('1544716278-ca5e3f4abd8c'), U('1512820790803-83ca734da794')]),
    JSON.stringify({Author:'Paulo Coelho',Publisher:'HarperCollins',Pages:'208',Language:'English',ISBN:'9780062315007'})],

  ['Think and Grow Rich', 'Napoleon Hill\'s classic guide to achieving success and wealth.', 199, 399, 50, 600, 6, 'Fingerprint Publishing', 4.5, 45678,
    JSON.stringify([U('1553729459-efe14ef6055d'), U('1544716278-ca5e3f4abd8c'), U('1481627834876-b7833e8f5570')]),
    JSON.stringify({Author:'Napoleon Hill',Publisher:'Fingerprint',Pages:'320',Language:'English'})],

  ['Zero to One by Peter Thiel', 'Notes on startups, or how to build the future by PayPal co-founder Peter Thiel.', 399, 699, 43, 400, 6, 'Crown Business', 4.4, 23456,
    JSON.stringify([U('1512820790803-83ca734da794'), U('1544716278-ca5e3f4abd8c'), U('1553729459-efe14ef6055d')]),
    JSON.stringify({Author:'Peter Thiel',Publisher:'Crown Business',Pages:'224',Language:'English'})],

  ['Deep Work by Cal Newport', 'Rules for focused success in a distracted world.', 449, 699, 36, 350, 6, 'Grand Central Publishing', 4.6, 18765,
    JSON.stringify([U('1481627834876-b7833e8f5570'), U('1544716278-ca5e3f4abd8c'), U('1512820790803-83ca734da794')]),
    JSON.stringify({Author:'Cal Newport',Publisher:'Grand Central',Pages:'304',Language:'English'})],

  // ── TOYS ─────────────────────────────────────────────────────────────────
  ['LEGO Technic Bugatti Chiron', 'LEGO Technic 42083 Bugatti Chiron with 3599 pieces and working W16 engine.', 34999, 44999, 22, 30, 7, 'LEGO', 4.9, 2345,
    JSON.stringify([U('1614632537197-38a17061c2bd'), U('1579952363873-27f3bade9f55'), U('1553778263-73a83bab9b0c')]),
    JSON.stringify({Pieces:'3599',Age:'16+',Theme:'Technic',Scale:'1:8',Features:'Working W16 engine'})],

  ['Hot Wheels 20-Car Gift Pack', 'Hot Wheels 20-car gift pack with exclusive designs and die-cast metal bodies.', 999, 1499, 33, 200, 7, 'Hot Wheels', 4.4, 15678,
    JSON.stringify([U('1614632537197-38a17061c2bd'), U('1579952363873-27f3bade9f55'), U('1553778263-73a83bab9b0c')]),
    JSON.stringify({Cars:'20',Scale:'1:64',Material:'Die-cast Metal',Age:'3+',Theme:'Assorted'})],

  ['Funskool Monopoly Classic', 'Funskool Monopoly Classic board game for 2-8 players.', 799, 1299, 38, 150, 7, 'Funskool', 4.3, 9876,
    JSON.stringify([U('1614632537197-38a17061c2bd'), U('1579952363873-27f3bade9f55'), U('1553778263-73a83bab9b0c')]),
    JSON.stringify({Players:'2-8',Age:'8+',Duration:'60-180 min',Language:'English',Pieces:'28 Title Deeds + more'})],

  ['Barbie Dreamhouse Playset', 'Barbie Dreamhouse with 3 stories, 8 rooms, elevator and pool.', 12999, 17999, 28, 40, 7, 'Barbie', 4.5, 5432,
    JSON.stringify([U('1614632537197-38a17061c2bd'), U('1579952363873-27f3bade9f55'), U('1553778263-73a83bab9b0c')]),
    JSON.stringify({Floors:'3',Rooms:'8',Features:'Elevator, Pool, Slide',Age:'3+',Doll:'Not Included'})],

  // ── SPORTS ───────────────────────────────────────────────────────────────
  ['Decathlon Kipsta Football Size 5', 'Decathlon Kipsta F500 football, FIFA Basic certified, size 5.', 799, 1299, 38, 300, 8, 'Decathlon', 4.4, 12345,
    JSON.stringify([U('1614632537197-38a17061c2bd'), U('1579952363873-27f3bade9f55'), U('1553778263-73a83bab9b0c')]),
    JSON.stringify({Size:'5',Certification:'FIFA Basic',Material:'Thermobonded PU',Bladder:'Latex',Panels:'32'})],

  ['Cosco Cricket Bat Kashmir Willow', 'Cosco Kashmir Willow cricket bat, full size, for leather ball.', 1299, 1999, 35, 150, 8, 'Cosco', 4.2, 8765,
    JSON.stringify([U('1626224583764-f87db24ac4ea'), U('1599474924187-334a4ae5bd3c'), U('1551698618-1dfe5d97d256')]),
    JSON.stringify({Wood:'Kashmir Willow',Size:'Full (SH)',Weight:'1.1-1.2 kg',Handle:'Cane',For:'Leather Ball'})],

  ['Strauss Yoga Mat 6mm', 'Strauss anti-slip yoga mat with carrying strap, 6mm thickness.', 699, 1299, 46, 400, 8, 'Strauss', 4.3, 23456,
    JSON.stringify([U('1626224583764-f87db24ac4ea'), U('1599474924187-334a4ae5bd3c'), U('1551698618-1dfe5d97d256')]),
    JSON.stringify({Thickness:'6 mm',Material:'NBR Foam',Size:'183 x 61 cm',AntiSlip:'Yes',Strap:'Included'})],

  ['Boldfit Gym Gloves', 'Boldfit gym gloves with wrist support and anti-slip grip for weightlifting.', 499, 999, 50, 500, 8, 'Boldfit', 4.1, 34567,
    JSON.stringify([U('1626224583764-f87db24ac4ea'), U('1599474924187-334a4ae5bd3c'), U('1551698618-1dfe5d97d256')]),
    JSON.stringify({Material:'Leather + Neoprene',WristSupport:'Yes',AntiSlip:'Yes',Gender:'Unisex',Sizes:'S/M/L/XL'})],

  ['Nivia Carbonite Basketball', 'Nivia Carbonite basketball, size 7, for outdoor and indoor play.', 1299, 1999, 35, 100, 8, 'Nivia', 4.2, 5678,
    JSON.stringify([U('1614632537197-38a17061c2bd'), U('1579952363873-27f3bade9f55'), U('1553778263-73a83bab9b0c')]),
    JSON.stringify({Size:'7',Material:'Rubber',Surface:'Indoor/Outdoor',Panels:'8',Bladder:'Butyl'})],
];

const allProducts = [...products, ...moreProducts];

const ins = db.prepare(`INSERT INTO products (name, description, price, original_price, discount_percent, stock, category_id, brand, rating, rating_count, images, specifications) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);
const run = db.transaction(() => { allProducts.forEach(p => ins.run(...p)); });
run();
console.log(`✅ Added ${allProducts.length} products!`);
db.close();
