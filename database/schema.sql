-- ====================================================================
-- MELA MARKET DATABASE SCHEMA - NEON POSTGRESQL (v2)
-- Database Name: mela_market_v2
-- Target Engine: PostgreSQL 16+ / Neon Serverless PostgreSQL
-- Description: Complete relational schema for Ethiopia's premier marketplace
-- ====================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. USERS TABLE (Roles: admin, seller, customer/user)
CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(100) PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  phone VARCHAR(100) NOT NULL,
  profile_photo TEXT,
  role VARCHAR(50) NOT NULL DEFAULT 'customer', -- 'admin', 'seller', 'customer', 'user'
  business_name VARCHAR(255),
  is_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. CATEGORIES TABLE (Multilingual Ethiopian Marketplace)
CREATE TABLE IF NOT EXISTS categories (
  id VARCHAR(100) PRIMARY KEY,
  slug VARCHAR(100) UNIQUE NOT NULL,
  name_en VARCHAR(100) NOT NULL,
  name_am VARCHAR(100) NOT NULL,
  name_ti VARCHAR(100) NOT NULL,
  icon VARCHAR(50) NOT NULL,
  description TEXT,
  display_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. PRODUCTS TABLE (New & Used Carousels, Inventory, Region)
CREATE TABLE IF NOT EXISTS products (
  id VARCHAR(100) PRIMARY KEY,
  user_id VARCHAR(100) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  category_id VARCHAR(100) REFERENCES categories(id) ON DELETE SET NULL,
  category VARCHAR(100) NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  condition VARCHAR(50) NOT NULL CHECK (condition IN ('new', 'used')),
  price NUMERIC(14, 2) NOT NULL,
  currency VARCHAR(20) DEFAULT 'ETB',
  stock_quantity INT DEFAULT 1,
  photo_url TEXT NOT NULL,
  additional_photos TEXT[] DEFAULT '{}',
  region VARCHAR(100) NOT NULL,
  district VARCHAR(100) NOT NULL,
  city VARCHAR(100) NOT NULL,
  seller_contact VARCHAR(100) NOT NULL,
  seller_name VARCHAR(255),
  seller_photo TEXT,
  status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'sold', 'hidden', 'draft')),
  featured BOOLEAN DEFAULT FALSE,
  views_count INT DEFAULT 0,
  compatible_brands TEXT[] DEFAULT '{}',
  compatible_models TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Migration for pre-existing products tables
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'products' AND column_name = 'seller_id'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'products' AND column_name = 'user_id'
  ) THEN
    ALTER TABLE products RENAME COLUMN seller_id TO user_id;
  END IF;
END $$;

ALTER TABLE products ADD COLUMN IF NOT EXISTS user_id VARCHAR(100);
ALTER TABLE products ADD COLUMN IF NOT EXISTS compatible_brands TEXT[] DEFAULT '{}';
ALTER TABLE products ADD COLUMN IF NOT EXISTS compatible_models TEXT[] DEFAULT '{}';

-- 5. INVENTORY LOGS TABLE
CREATE TABLE IF NOT EXISTS inventory_logs (
  id VARCHAR(100) PRIMARY KEY,
  product_id VARCHAR(100) NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  change_type VARCHAR(50) NOT NULL, -- 'initial', 'sale', 'restock', 'adjustment'
  quantity_change INT NOT NULL,
  new_quantity INT NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. ORDERS TABLE
CREATE TABLE IF NOT EXISTS orders (
  id VARCHAR(100) PRIMARY KEY,
  order_number VARCHAR(50) UNIQUE NOT NULL,
  buyer_id VARCHAR(100) REFERENCES users(id) ON DELETE SET NULL,
  buyer_name VARCHAR(255) NOT NULL,
  buyer_email VARCHAR(255) NOT NULL,
  buyer_phone VARCHAR(100) NOT NULL,
  total_amount NUMERIC(14, 2) NOT NULL,
  currency VARCHAR(20) DEFAULT 'ETB',
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'processing', 'completed', 'cancelled')),
  payment_status VARCHAR(50) DEFAULT 'unpaid' CHECK (payment_status IN ('unpaid', 'paid', 'refunded')),
  shipping_address TEXT,
  shipping_city VARCHAR(100),
  shipping_region VARCHAR(100),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. ORDER ITEMS TABLE
CREATE TABLE IF NOT EXISTS order_items (
  id VARCHAR(100) PRIMARY KEY,
  order_id VARCHAR(100) NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id VARCHAR(100) REFERENCES products(id) ON DELETE SET NULL,
  seller_id VARCHAR(100) REFERENCES users(id) ON DELETE SET NULL,
  title VARCHAR(255) NOT NULL,
  quantity INT NOT NULL DEFAULT 1,
  unit_price NUMERIC(14, 2) NOT NULL,
  total_price NUMERIC(14, 2) NOT NULL
);

-- 8. PAYMENTS TABLE (Telebirr, CBE Birr, Bank Transfer, Cash on Delivery)
CREATE TABLE IF NOT EXISTS payments (
  id VARCHAR(100) PRIMARY KEY,
  order_id VARCHAR(100) REFERENCES orders(id) ON DELETE CASCADE,
  user_id VARCHAR(100) REFERENCES users(id) ON DELETE SET NULL,
  payment_method VARCHAR(50) NOT NULL, -- 'telebirr', 'cbe_birr', 'bank_transfer', 'cash_on_delivery'
  amount NUMERIC(14, 2) NOT NULL,
  currency VARCHAR(20) DEFAULT 'ETB',
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'successful', 'failed', 'refunded')),
  transaction_ref VARCHAR(100),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. INQUIRIES TABLE
CREATE TABLE IF NOT EXISTS inquiries (
  id VARCHAR(100) PRIMARY KEY,
  product_id VARCHAR(100) NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  buyer_name VARCHAR(255) NOT NULL,
  buyer_email VARCHAR(255),
  buyer_phone VARCHAR(100) NOT NULL,
  message TEXT NOT NULL,
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'responded', 'closed')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. REPORTS TABLE (Moderation)
CREATE TABLE IF NOT EXISTS reports (
  id VARCHAR(100) PRIMARY KEY,
  product_id VARCHAR(100) NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  reporter_email VARCHAR(255) NOT NULL,
  reason TEXT NOT NULL,
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'dismissed')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. ADMIN AUDIT LOGS TABLE
CREATE TABLE IF NOT EXISTS admin_audit_logs (
  id VARCHAR(100) PRIMARY KEY,
  admin_id VARCHAR(100) REFERENCES users(id) ON DELETE SET NULL,
  action VARCHAR(100) NOT NULL,
  entity_type VARCHAR(50) NOT NULL,
  entity_id VARCHAR(100),
  details JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. PERFORMANCE INDEXES
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_condition ON products(condition);
CREATE INDEX IF NOT EXISTS idx_products_user_id ON products(user_id);
CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);
CREATE INDEX IF NOT EXISTS idx_products_region ON products(region);
CREATE INDEX IF NOT EXISTS idx_products_created_at ON products(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_buyer ON orders(buyer_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_payments_order ON payments(order_id);
CREATE INDEX IF NOT EXISTS idx_inquiries_product ON inquiries(product_id);
CREATE INDEX IF NOT EXISTS idx_reports_product ON reports(product_id);
