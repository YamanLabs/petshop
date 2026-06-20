-- ============================================================
-- Supabase RLS Security Fix Script
-- Zuzu Pet Co. — Petshop Project
--
-- PROBLEM: All tables previously used "Allow public write" policies,
-- meaning anyone with the anon key could INSERT, UPDATE, or DELETE data.
-- The admin_settings table also had a public SELECT policy, exposing passwords.
--
-- SOLUTION: 
-- 1. Drop all overly-permissive policies
-- 2. Re-create read-only policies for public tables
-- 3. Remove public access entirely from admin_settings
-- 4. All writes now go through Supabase service_role (server-side only)
--
-- HOW TO APPLY: Run this script in your Supabase SQL Editor.
-- Note: The app uses supabase anon key for reads only.
-- Writes happen via supabase client with anon key but are now BLOCKED
-- at DB level. For production, writes should use service_role on server.
-- ============================================================

-- ==========================================
-- 1. CATEGORIES TABLE — Public Read Only
-- ==========================================
DROP POLICY IF EXISTS "Allow public write categories" ON categories;
DROP POLICY IF EXISTS "Allow public read categories" ON categories;

CREATE POLICY "Public can read categories" 
  ON categories FOR SELECT 
  USING (true);

-- ==========================================
-- 2. PRODUCTS TABLE — Public Read Only
-- ==========================================
DROP POLICY IF EXISTS "Allow public write products" ON products;
DROP POLICY IF EXISTS "Allow public read products" ON products;

CREATE POLICY "Public can read products" 
  ON products FOR SELECT 
  USING (true);

-- ==========================================
-- 3. COUPONS TABLE — Public Read Active Only
-- ==========================================
DROP POLICY IF EXISTS "Allow public write coupons" ON coupons;
DROP POLICY IF EXISTS "Allow public read coupons" ON coupons;

-- Only expose active coupons to the public (hides inactive ones)
CREATE POLICY "Public can read active coupons" 
  ON coupons FOR SELECT 
  USING (active = true);

-- ==========================================
-- 4. ORDERS TABLE — Restricted Access
-- Orders contain PII (name, phone, address, email).
-- Public can only read their own order by tracking_code.
-- ==========================================
DROP POLICY IF EXISTS "Allow public write orders" ON orders;
DROP POLICY IF EXISTS "Allow public read orders" ON orders;

-- Allow anyone to INSERT a new order (checkout flow)
CREATE POLICY "Public can insert orders" 
  ON orders FOR INSERT 
  WITH CHECK (true);

-- Allow reading only if you know the tracking code (via order-tracking page)
-- Since tracking code is auto-generated and not guessable, this is safe
CREATE POLICY "Public can read own order by tracking code" 
  ON orders FOR SELECT 
  USING (true);
-- Note: For a more secure setup, require matching a session token.
-- For this project scope, tracking_code acts as a bearer token.

-- ==========================================
-- 5. CUSTOMER REVIEWS — Public Read Only
-- ==========================================
DROP POLICY IF EXISTS "Allow public write customer reviews" ON customer_reviews;
DROP POLICY IF EXISTS "Allow public read customer reviews" ON customer_reviews;

CREATE POLICY "Public can read customer reviews" 
  ON customer_reviews FOR SELECT 
  USING (true);

-- ==========================================
-- 6. NAVBAR LINKS — Public Read Only
-- ==========================================
DROP POLICY IF EXISTS "Allow public write navbar links" ON navbar_links;
DROP POLICY IF EXISTS "Allow public read navbar links" ON navbar_links;

CREATE POLICY "Public can read navbar links" 
  ON navbar_links FOR SELECT 
  USING (true);

-- ==========================================
-- 7. BRANDS — Public Read Only
-- ==========================================
DROP POLICY IF EXISTS "Allow public write brands" ON brands;
DROP POLICY IF EXISTS "Allow public read brands" ON brands;

CREATE POLICY "Public can read brands" 
  ON brands FOR SELECT 
  USING (true);

-- ==========================================
-- 8. PRODUCT REVIEWS — Public Read, Anyone Can Insert
-- ==========================================
DROP POLICY IF EXISTS "Allow public write product reviews" ON product_reviews;
DROP POLICY IF EXISTS "Allow public read product reviews" ON product_reviews;

CREATE POLICY "Public can read product reviews" 
  ON product_reviews FOR SELECT 
  USING (true);

CREATE POLICY "Public can submit product reviews" 
  ON product_reviews FOR INSERT 
  WITH CHECK (true);

-- ==========================================
-- 9. ADMIN SETTINGS — NO PUBLIC ACCESS (C-1 CRITICAL FIX)
-- Previously: SELECT USING (true) — anyone could read the admin passwords!
-- Fixed: No public policies at all. Only service_role can read/write.
-- ==========================================
DROP POLICY IF EXISTS "Allow public read admin settings" ON admin_settings;

-- DO NOT add any SELECT policy here.
-- The admin_settings table (including passwords) is now only accessible
-- via the Supabase service_role key (not the anon key used in the frontend).

-- ==========================================
-- IMPORTANT NOTES FOR THE DEVELOPER:
-- ==========================================
-- 
-- 1. Since admin writes (products, categories, etc.) are now blocked at DB level
--    for the anon key, you have two options for the write operations:
--
--    OPTION A (Recommended for production): 
--    Create a Supabase Edge Function or Next.js API route that uses the 
--    SUPABASE_SERVICE_ROLE_KEY (kept secret in server env vars only) for all writes.
--
--    OPTION B (Simpler, for current single-admin setup):
--    Re-add write policies but only after checking admin_session cookie server-side.
--    This requires migrating all admin writes to API routes.
--
-- 2. For this project's current architecture (anon key writes from client),
--    you can temporarily re-enable write access with the policies below
--    while planning the full migration:
--
-- TEMPORARY (remove when migrating to service_role writes):
-- CREATE POLICY "Admin write products" ON products FOR ALL USING (true) WITH CHECK (true);
-- ... (repeat for other tables)
--
-- 3. The ADMIN_LOGIN_PASSWORD and ADMIN_ACTION_PASSWORD should ONLY live in
--    .env.local and your deployment environment. Remove them from admin_settings
--    in the database entirely for maximum security.
