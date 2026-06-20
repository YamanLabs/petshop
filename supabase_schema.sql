-- Supabase Database Schema Setup for Zuzu Pet Co.
-- Copy and run this script in your Supabase SQL Editor.

-- ==========================================
-- 1. CATEGORIES TABLE
-- ==========================================
CREATE TABLE IF NOT EXISTS categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  parent_id TEXT REFERENCES categories(id) ON DELETE SET NULL,
  description TEXT,
  icon_type TEXT DEFAULT 'svg',
  icon_svg_preset TEXT DEFAULT 'none',
  icon_image_url TEXT,
  is_promo BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read categories" ON categories FOR SELECT USING (true);
CREATE POLICY "Allow public write categories" ON categories FOR ALL USING (true) WITH CHECK (true);

-- ==========================================
-- 2. PRODUCTS TABLE
-- ==========================================
CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  price NUMERIC NOT NULL,
  original_price NUMERIC,
  image TEXT,
  category_id TEXT REFERENCES categories(id) ON DELETE SET NULL,
  brand TEXT,
  stock INTEGER DEFAULT 0,
  rating NUMERIC DEFAULT 5,
  reviews JSONB DEFAULT '[]'::jsonb,
  variations JSONB DEFAULT '[]'::jsonb,
  meta_title TEXT,
  meta_description TEXT,
  meta_keywords TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read products" ON products FOR SELECT USING (true);
CREATE POLICY "Allow public write products" ON products FOR ALL USING (true) WITH CHECK (true);

-- ==========================================
-- 3. COUPONS TABLE
-- ==========================================
CREATE TABLE IF NOT EXISTS coupons (
  code TEXT PRIMARY KEY,
  type TEXT NOT NULL,
  value NUMERIC NOT NULL,
  active BOOLEAN DEFAULT true,
  usage_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read coupons" ON coupons FOR SELECT USING (true);
CREATE POLICY "Allow public write coupons" ON coupons FOR ALL USING (true) WITH CHECK (true);

-- ==========================================
-- 4. ORDERS TABLE
-- ==========================================
CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY,
  tracking_code TEXT NOT NULL,
  customer_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  address TEXT NOT NULL,
  items JSONB DEFAULT '[]'::jsonb,
  subtotal NUMERIC NOT NULL,
  discount NUMERIC DEFAULT 0,
  total NUMERIC NOT NULL,
  status TEXT DEFAULT 'pending'::text,
  date TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read orders" ON orders FOR SELECT USING (true);
CREATE POLICY "Allow public write orders" ON orders FOR ALL USING (true) WITH CHECK (true);

-- ==========================================
-- 5. CUSTOMER REVIEWS TABLE (Sizden Gelenler)
-- ==========================================
CREATE TABLE IF NOT EXISTS customer_reviews (
  id TEXT PRIMARY KEY,
  text TEXT NOT NULL,
  rating INTEGER NOT NULL,
  user_name TEXT NOT NULL,
  product_name TEXT,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE customer_reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read customer reviews" ON customer_reviews FOR SELECT USING (true);
CREATE POLICY "Allow public write customer reviews" ON customer_reviews FOR ALL USING (true) WITH CHECK (true);

-- ==========================================
-- 6. NAVBAR LINKS TABLE
-- ==========================================
CREATE TABLE IF NOT EXISTS navbar_links (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  parent_id TEXT REFERENCES navbar_links(id) ON DELETE SET NULL,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE navbar_links ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read navbar links" ON navbar_links FOR SELECT USING (true);
CREATE POLICY "Allow public write navbar links" ON navbar_links FOR ALL USING (true) WITH CHECK (true);

-- ==========================================
-- 7. BRANDS TABLE
-- ==========================================
CREATE TABLE IF NOT EXISTS brands (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  logo_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE brands ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read brands" ON brands FOR SELECT USING (true);
CREATE POLICY "Allow public write brands" ON brands FOR ALL USING (true) WITH CHECK (true);

-- ==========================================
-- 8. PRODUCT REVIEWS TABLE
-- ==========================================
CREATE TABLE IF NOT EXISTS product_reviews (
  id TEXT PRIMARY KEY,
  product_id TEXT REFERENCES products(id) ON DELETE CASCADE,
  customer_name TEXT NOT NULL,
  rating INTEGER NOT NULL,
  comment TEXT NOT NULL,
  date TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE product_reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read product reviews" ON product_reviews FOR SELECT USING (true);
CREATE POLICY "Allow public write product reviews" ON product_reviews FOR ALL USING (true) WITH CHECK (true);

-- ==========================================
-- 9. ADMIN SETTINGS TABLE (Passwords)
-- ==========================================
CREATE TABLE IF NOT EXISTS admin_settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE admin_settings ENABLE ROW LEVEL SECURITY;
-- For security, only SELECT reads are permitted publicly; INSERT/UPDATE/DELETE are not allowed through the anon key.
CREATE POLICY "Allow public read admin settings" ON admin_settings FOR SELECT USING (true);

-- Seed Initial Passwords and Settings
INSERT INTO admin_settings (key, value)
VALUES 
  ('admin_login_password', 't9Y2xK8vB7mW5qR4sP0uC3zJ1bE8dF9g'),
  ('admin_action_password', 'k4P9vR1sT7uW0xY3zA6bC9dE2fH5i8jF'),
  ('customer_reviews_rating', '4.97'),
  ('customer_reviews_count', '875'),
  ('coupon_banner_visible', 'true'),
  ('contact_address', 'İnönü mah. Hürriyet cad. No 236/A bornova, izmir'),
  ('contact_phone', '+90 530 470 05 43'),
  ('contact_email', 'destek@zuzupet.co'),
  ('contact_hours', 'Hafta İçi & Hafta Sonu: 09:00 - 20:00'),
  ('contact_map_iframe', 'https://maps.google.com/maps?q=Inonu%20Mahallesi%20Hurriyet%20Caddesi%20No%20236/A%20Bornova%20Izmir&t=&z=15&ie=UTF8&iwloc=&output=embed')
ON CONFLICT (key) 
DO UPDATE SET 
  value = EXCLUDED.value,
  updated_at = timezone('utc'::text, now());
