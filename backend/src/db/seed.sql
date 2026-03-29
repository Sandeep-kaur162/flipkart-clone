-- Seed categories
INSERT INTO categories (name, slug, image_url) VALUES
  ('Electronics', 'electronics', 'https://rukminim2.flixcart.com/flap/128/128/image/69c6589653afdb9a.png'),
  ('Mobiles', 'mobiles', 'https://rukminim2.flixcart.com/flap/128/128/image/22fddf3c7da4c4f4.png'),
  ('Fashion', 'fashion', 'https://rukminim2.flixcart.com/flap/128/128/image/f15c02bfeb02d15d.png'),
  ('Home & Furniture', 'home-furniture', 'https://rukminim2.flixcart.com/flap/128/128/image/ab7e2b022a4587dd.jpg'),
  ('Appliances', 'appliances', 'https://rukminim2.flixcart.com/flap/128/128/image/0ff199d1bd27eb98.png'),
  ('Books', 'books', 'https://rukminim2.flixcart.com/flap/128/128/image/71050627a56b4693.png'),
  ('Toys', 'toys', 'https://rukminim2.flixcart.com/flap/128/128/image/dff3f7adcf3a90c6.png'),
  ('Sports', 'sports', 'https://rukminim2.flixcart.com/flap/128/128/image/dff3f7adcf3a90c6.png')
ON CONFLICT DO NOTHING;

-- Seed products - Mobiles
INSERT INTO products (name, description, price, original_price, discount_percent, stock, category_id, brand, rating, rating_count, images, specifications) VALUES
(
  'Samsung Galaxy S23 Ultra 5G',
  'Experience the ultimate Galaxy with the S23 Ultra. Featuring a 200MP camera, built-in S Pen, and Snapdragon 8 Gen 2 processor.',
  124999, 149999, 17, 50, 2, 'Samsung', 4.5, 12453,
  ARRAY[
    'https://rukminim2.flixcart.com/image/416/416/xif0q/mobile/n/s/z/-original-imaghx9qkugtbfrn.jpeg',
    'https://rukminim2.flixcart.com/image/416/416/xif0q/mobile/n/s/z/-original-imaghx9qkugtbfrn.jpeg'
  ],
  '{"Display": "6.8 inch Dynamic AMOLED 2X", "Processor": "Snapdragon 8 Gen 2", "RAM": "12 GB", "Storage": "256 GB", "Camera": "200 MP + 12 MP + 10 MP + 10 MP", "Battery": "5000 mAh", "OS": "Android 13"}'
),
(
  'Apple iPhone 15 Pro Max',
  'iPhone 15 Pro Max. Forged in titanium and featuring the groundbreaking A17 Pro chip, a customizable Action button, and the most powerful iPhone camera system ever.',
  159900, 189900, 16, 30, 2, 'Apple', 4.7, 8921,
  ARRAY[
    'https://rukminim2.flixcart.com/image/416/416/xif0q/mobile/v/o/b/-original-imagtc4zhgcjhgzj.jpeg',
    'https://rukminim2.flixcart.com/image/416/416/xif0q/mobile/v/o/b/-original-imagtc4zhgcjhgzj.jpeg'
  ],
  '{"Display": "6.7 inch Super Retina XDR", "Processor": "A17 Pro", "RAM": "8 GB", "Storage": "256 GB", "Camera": "48 MP + 12 MP + 12 MP", "Battery": "4422 mAh", "OS": "iOS 17"}'
),
(
  'OnePlus 12 5G',
  'OnePlus 12 with Snapdragon 8 Gen 3, Hasselblad camera, and 100W SUPERVOOC charging.',
  64999, 74999, 13, 80, 2, 'OnePlus', 4.4, 5632,
  ARRAY[
    'https://rukminim2.flixcart.com/image/416/416/xif0q/mobile/q/s/s/-original-imagtxyzfhghg4zj.jpeg',
    'https://rukminim2.flixcart.com/image/416/416/xif0q/mobile/q/s/s/-original-imagtxyzfhghg4zj.jpeg'
  ],
  '{"Display": "6.82 inch LTPO AMOLED", "Processor": "Snapdragon 8 Gen 3", "RAM": "12 GB", "Storage": "256 GB", "Camera": "50 MP + 48 MP + 64 MP", "Battery": "5400 mAh", "OS": "Android 14"}'
),
(
  'Redmi Note 13 Pro+ 5G',
  'Redmi Note 13 Pro+ with 200MP camera, 120W HyperCharge, and Dimensity 7200 Ultra.',
  29999, 35999, 17, 120, 2, 'Xiaomi', 4.3, 9871,
  ARRAY[
    'https://rukminim2.flixcart.com/image/416/416/xif0q/mobile/b/p/s/-original-imagr3ygfhzgzgzg.jpeg',
    'https://rukminim2.flixcart.com/image/416/416/xif0q/mobile/b/p/s/-original-imagr3ygfhzgzgzg.jpeg'
  ],
  '{"Display": "6.67 inch AMOLED", "Processor": "Dimensity 7200 Ultra", "RAM": "8 GB", "Storage": "256 GB", "Camera": "200 MP + 8 MP + 2 MP", "Battery": "5000 mAh", "OS": "Android 13"}'
),

-- Electronics
(
  'Sony WH-1000XM5 Wireless Headphones',
  'Industry-leading noise canceling with Auto NC Optimizer. Crystal clear hands-free calling. Up to 30-hour battery life.',
  26990, 34990, 23, 45, 1, 'Sony', 4.6, 7823,
  ARRAY[
    'https://rukminim2.flixcart.com/image/416/416/xif0q/headphone/t/p/s/-original-imagfh5yzgzgzgzg.jpeg',
    'https://rukminim2.flixcart.com/image/416/416/xif0q/headphone/t/p/s/-original-imagfh5yzgzgzgzg.jpeg'
  ],
  '{"Type": "Over-Ear", "Connectivity": "Bluetooth 5.2", "Battery": "30 hours", "Noise Cancellation": "Yes", "Weight": "250g", "Foldable": "Yes"}'
),
(
  'Apple MacBook Air M2',
  'MacBook Air with M2 chip. Supercharged by the next-generation M2 chip, MacBook Air is impossibly thin and incredibly capable.',
  114900, 134900, 15, 20, 1, 'Apple', 4.8, 4521,
  ARRAY[
    'https://rukminim2.flixcart.com/image/416/416/xif0q/laptop/r/n/s/-original-imagfh5yzgzgzgzg.jpeg',
    'https://rukminim2.flixcart.com/image/416/416/xif0q/laptop/r/n/s/-original-imagfh5yzgzgzgzg.jpeg'
  ],
  '{"Display": "13.6 inch Liquid Retina", "Processor": "Apple M2", "RAM": "8 GB", "Storage": "256 GB SSD", "Battery": "18 hours", "Weight": "1.24 kg", "OS": "macOS Ventura"}'
),
(
  'Samsung 55 inch 4K Smart TV',
  'Samsung Crystal 4K Pro Smart TV with Crystal Processor 4K, AirSlim Design, and PurColor technology.',
  54990, 79990, 31, 35, 1, 'Samsung', 4.3, 6234,
  ARRAY[
    'https://rukminim2.flixcart.com/image/416/416/xif0q/television/r/n/s/-original-imagfh5yzgzgzgzg.jpeg',
    'https://rukminim2.flixcart.com/image/416/416/xif0q/television/r/n/s/-original-imagfh5yzgzgzgzg.jpeg'
  ],
  '{"Screen Size": "55 inch", "Resolution": "4K Ultra HD", "Smart TV": "Yes", "HDR": "Yes", "Refresh Rate": "60 Hz", "HDMI Ports": "3", "USB Ports": "2"}'
),
(
  'boAt Airdopes 141 TWS Earbuds',
  'boAt Airdopes 141 with 42H total playback, BEAST Mode for gaming, and IPX4 water resistance.',
  1299, 4990, 74, 200, 1, 'boAt', 4.1, 45231,
  ARRAY[
    'https://rukminim2.flixcart.com/image/416/416/xif0q/headphone/t/p/s/-original-imagfh5yzgzgzgzg.jpeg',
    'https://rukminim2.flixcart.com/image/416/416/xif0q/headphone/t/p/s/-original-imagfh5yzgzgzgzg.jpeg'
  ],
  '{"Type": "In-Ear TWS", "Battery": "42 hours total", "Water Resistance": "IPX4", "Connectivity": "Bluetooth 5.2", "Gaming Mode": "Yes"}'
),

-- Fashion
(
  'Levi''s Men''s 511 Slim Fit Jeans',
  'Classic slim fit jeans from Levi''s. Made with stretch denim for all-day comfort.',
  2999, 4999, 40, 150, 3, 'Levi''s', 4.2, 8932,
  ARRAY[
    'https://rukminim2.flixcart.com/image/416/416/xif0q/jean/r/n/s/-original-imagfh5yzgzgzgzg.jpeg',
    'https://rukminim2.flixcart.com/image/416/416/xif0q/jean/r/n/s/-original-imagfh5yzgzgzgzg.jpeg'
  ],
  '{"Fit": "Slim", "Material": "98% Cotton, 2% Elastane", "Closure": "Zip fly with button", "Pockets": "5", "Care": "Machine wash"}'
),
(
  'Nike Air Max 270 Running Shoes',
  'Nike Air Max 270 features Nike''s biggest heel Air unit yet for a super-soft ride that feels as impossible as it looks.',
  12995, 15995, 19, 60, 3, 'Nike', 4.5, 3421,
  ARRAY[
    'https://rukminim2.flixcart.com/image/416/416/xif0q/shoe/r/n/s/-original-imagfh5yzgzgzgzg.jpeg',
    'https://rukminim2.flixcart.com/image/416/416/xif0q/shoe/r/n/s/-original-imagfh5yzgzgzgzg.jpeg'
  ],
  '{"Type": "Running", "Sole": "Rubber", "Closure": "Lace-Up", "Upper Material": "Mesh", "Air Unit": "Max Air 270"}'
),

-- Home & Furniture
(
  'Prestige Iris 750W Mixer Grinder',
  'Prestige Iris 750W Mixer Grinder with 3 stainless steel jars and 1 juicer jar.',
  2795, 4500, 38, 90, 4, 'Prestige', 4.3, 12453,
  ARRAY[
    'https://rukminim2.flixcart.com/image/416/416/xif0q/mixer-grinder/r/n/s/-original-imagfh5yzgzgzgzg.jpeg',
    'https://rukminim2.flixcart.com/image/416/416/xif0q/mixer-grinder/r/n/s/-original-imagfh5yzgzgzgzg.jpeg'
  ],
  '{"Power": "750W", "Jars": "4 (3 SS + 1 Juicer)", "Speed Settings": "3 + Pulse", "Warranty": "2 years"}'
),
(
  'Godrej 564L French Door Refrigerator',
  'Godrej 564L French Door Refrigerator with Inverter Technology and Multi Air Flow system.',
  79990, 99990, 20, 15, 4, 'Godrej', 4.4, 2341,
  ARRAY[
    'https://rukminim2.flixcart.com/image/416/416/xif0q/refrigerator/r/n/s/-original-imagfh5yzgzgzgzg.jpeg',
    'https://rukminim2.flixcart.com/image/416/416/xif0q/refrigerator/r/n/s/-original-imagfh5yzgzgzgzg.jpeg'
  ],
  '{"Capacity": "564 L", "Type": "French Door", "Star Rating": "3 Star", "Inverter": "Yes", "Warranty": "1 year comprehensive + 10 years compressor"}'
),

-- Books
(
  'Atomic Habits by James Clear',
  'An Easy & Proven Way to Build Good Habits & Break Bad Ones. The #1 New York Times bestseller.',
  399, 799, 50, 500, 6, 'Penguin', 4.7, 34521,
  ARRAY[
    'https://rukminim2.flixcart.com/image/416/416/xif0q/book/r/n/s/-original-imagfh5yzgzgzgzg.jpeg',
    'https://rukminim2.flixcart.com/image/416/416/xif0q/book/r/n/s/-original-imagfh5yzgzgzgzg.jpeg'
  ],
  '{"Author": "James Clear", "Publisher": "Penguin Random House", "Pages": "320", "Language": "English", "ISBN": "9780735211292"}'
),
(
  'The Psychology of Money',
  'Timeless lessons on wealth, greed, and happiness by Morgan Housel.',
  349, 599, 42, 400, 6, 'Jaico Publishing', 4.6, 28934,
  ARRAY[
    'https://rukminim2.flixcart.com/image/416/416/xif0q/book/r/n/s/-original-imagfh5yzgzgzgzg.jpeg',
    'https://rukminim2.flixcart.com/image/416/416/xif0q/book/r/n/s/-original-imagfh5yzgzgzgzg.jpeg'
  ],
  '{"Author": "Morgan Housel", "Publisher": "Harriman House", "Pages": "256", "Language": "English", "ISBN": "9780857197689"}'
),

-- Appliances
(
  'LG 8 kg 5 Star Inverter Washing Machine',
  'LG 8 kg 5 Star Inverter Fully-Automatic Front Loading Washing Machine with Steam and AI Direct Drive.',
  44990, 59990, 25, 25, 5, 'LG', 4.5, 5632,
  ARRAY[
    'https://rukminim2.flixcart.com/image/416/416/xif0q/washing-machine/r/n/s/-original-imagfh5yzgzgzgzg.jpeg',
    'https://rukminim2.flixcart.com/image/416/416/xif0q/washing-machine/r/n/s/-original-imagfh5yzgzgzgzg.jpeg'
  ],
  '{"Capacity": "8 kg", "Type": "Front Load", "Star Rating": "5 Star", "Inverter": "Yes", "Steam": "Yes", "Warranty": "2 years comprehensive + 10 years motor"}'
),
(
  'Dyson V15 Detect Cordless Vacuum',
  'Dyson V15 Detect with laser dust detection, HEPA filtration, and up to 60 minutes run time.',
  52900, 62900, 16, 20, 5, 'Dyson', 4.6, 1823,
  ARRAY[
    'https://rukminim2.flixcart.com/image/416/416/xif0q/vacuum-cleaner/r/n/s/-original-imagfh5yzgzgzgzg.jpeg',
    'https://rukminim2.flixcart.com/image/416/416/xif0q/vacuum-cleaner/r/n/s/-original-imagfh5yzgzgzgzg.jpeg'
  ],
  '{"Type": "Cordless", "Battery": "60 min", "Filtration": "HEPA", "Laser Detection": "Yes", "Weight": "3.1 kg"}'
),

-- Sports
(
  'Yonex Astrox 88D Pro Badminton Racket',
  'Yonex Astrox 88D Pro with Rotational Generator System for powerful smashes.',
  12999, 16999, 24, 40, 8, 'Yonex', 4.7, 2341,
  ARRAY[
    'https://rukminim2.flixcart.com/image/416/416/xif0q/racket/r/n/s/-original-imagfh5yzgzgzgzg.jpeg',
    'https://rukminim2.flixcart.com/image/416/416/xif0q/racket/r/n/s/-original-imagfh5yzgzgzgzg.jpeg'
  ],
  '{"Weight": "83g", "Flex": "Stiff", "Frame Material": "HM Graphite", "Shaft Material": "HM Graphite", "String Tension": "Up to 35 lbs"}'
),
(
  'Nivia Storm Football Size 5',
  'Nivia Storm Football, Size 5, suitable for professional and recreational play.',
  599, 999, 40, 200, 8, 'Nivia', 4.2, 8923,
  ARRAY[
    'https://rukminim2.flixcart.com/image/416/416/xif0q/ball/r/n/s/-original-imagfh5yzgzgzgzg.jpeg',
    'https://rukminim2.flixcart.com/image/416/416/xif0q/ball/r/n/s/-original-imagfh5yzgzgzgzg.jpeg'
  ],
  '{"Size": "5", "Material": "PU", "Panels": "32", "Bladder": "Butyl", "Recommended For": "Football"}'
);
