-- ========================================================
-- Zuzu Pet Co. - Supabase Mockup/Seed Data Clear Script
-- ========================================================
-- WARNING: This script will delete all mockup and seed data from your tables.
-- It keeps the admin login and action passwords intact so you don't lose access.
-- Run this script in your Supabase SQL Editor (Dashboard -> SQL Editor).

-- 1. Disable triggers temporarily if needed (optional)
-- SET session_replication_role = 'replica';

-- 2. Clear transaction and review tables
TRUNCATE TABLE product_reviews RESTART IDENTITY CASCADE;
TRUNCATE TABLE customer_reviews RESTART IDENTITY CASCADE;
TRUNCATE TABLE orders RESTART IDENTITY CASCADE;

-- 3. Clear catalog tables
TRUNCATE TABLE products RESTART IDENTITY CASCADE;
TRUNCATE TABLE categories RESTART IDENTITY CASCADE;
TRUNCATE TABLE coupons RESTART IDENTITY CASCADE;
TRUNCATE TABLE navbar_links RESTART IDENTITY CASCADE;
TRUNCATE TABLE brands RESTART IDENTITY CASCADE;

-- 4. Reset admin_settings to defaults (excluding credentials)
DELETE FROM admin_settings WHERE key NOT IN ('admin_login_password', 'admin_action_password');

-- Re-insert default settings
INSERT INTO admin_settings (key, value)
VALUES 
  ('customer_reviews_rating', '4.97'),
  ('customer_reviews_count', '875'),
  ('coupon_banner_visible', 'true')
ON CONFLICT (key) 
DO UPDATE SET 
  value = EXCLUDED.value,
  updated_at = timezone('utc'::text, now());

-- 5. Restore session replication role
-- SET session_replication_role = 'origin';

-- Mağaza şimdi tamamen boş ve yeni veriler eklenmeye hazır durumda!
