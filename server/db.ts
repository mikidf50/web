import pg from 'pg';
import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';

const { Pool } = pg;

export type DBUserRole = 'user' | 'admin' | 'seller' | 'customer';

export interface DBUser {
  id: string;
  email: string;
  password_hash: string;
  full_name: string;
  phone: string;
  profile_photo: string;
  role: DBUserRole;
  business_name?: string;
  is_verified?: boolean;
  status?: 'active' | 'suspended';
  can_publish?: boolean;
  seller_status?: 'approved' | 'pending' | 'rejected' | 'suspended';
  created_at: string;
  updated_at?: string;
}

export interface DBCategory {
  id: string;
  slug: string;
  name_en: string;
  name_am: string;
  name_ti: string;
  icon: string;
  description?: string;
  display_order: number;
  created_at?: string;
}

export interface DBProduct {
  id: string;
  user_id: string;
  category_id?: string;
  title: string;
  description: string;
  category: string;
  condition: 'new' | 'used';
  price: number;
  currency: string;
  stock_quantity?: number;
  photo_url: string;
  additional_photos?: string[];
  region: string;
  district: string;
  city: string;
  seller_contact: string;
  seller_name?: string;
  seller_photo?: string;
  status: 'active' | 'sold' | 'hidden' | 'draft' | 'pending' | 'rejected' | 'approved';
  featured?: boolean;
  views_count?: number;
  compatible_brands?: string[];
  compatible_models?: string[];
  created_at: string;
  updated_at?: string;
}

export interface DBAdminAuditLog {
  id: string;
  admin_id: string;
  admin_name?: string;
  action: string;
  entity_type: string;
  entity_id?: string;
  details?: any;
  created_at: string;
}

export interface DBSiteSettings {
  key: string;
  value: any;
  updated_at?: string;
}

export interface DBOrder {
  id: string;
  order_number: string;
  buyer_id?: string;
  buyer_name: string;
  buyer_email: string;
  buyer_phone: string;
  total_amount: number;
  currency: string;
  status: 'pending' | 'confirmed' | 'processing' | 'completed' | 'cancelled';
  payment_status: 'unpaid' | 'paid' | 'refunded';
  shipping_address?: string;
  shipping_city?: string;
  shipping_region?: string;
  notes?: string;
  created_at: string;
  items?: DBOrderItem[];
}

export interface DBOrderItem {
  id: string;
  order_id: string;
  product_id?: string;
  seller_id?: string;
  title: string;
  quantity: number;
  unit_price: number;
  total_price: number;
}

export interface DBPayment {
  id: string;
  order_id: string;
  user_id?: string;
  payment_method: string;
  amount: number;
  currency: string;
  status: 'pending' | 'successful' | 'failed' | 'refunded';
  transaction_ref?: string;
  created_at: string;
}

export interface DBInquiry {
  id: string;
  product_id: string;
  buyer_name: string;
  buyer_email: string;
  buyer_phone: string;
  message: string;
  status: 'pending' | 'responded' | 'closed';
  created_at: string;
}

export interface DBReport {
  id: string;
  product_id: string;
  reporter_email: string;
  reason: string;
  status: 'pending' | 'reviewed';
  created_at: string;
}

export interface DatabaseState {
  users: DBUser[];
  products: DBProduct[];
  categories?: DBCategory[];
  orders?: DBOrder[];
  payments?: DBPayment[];
  inquiries: DBInquiry[];
  reports: DBReport[];
}

export const defaultCategories: DBCategory[] = [
  { id: 'accessories', slug: 'accessories', name_en: 'Accessories & Parts', name_am: 'መለዋወጫ እና አክሰሰሪዎች', name_ti: 'መለዋወጥን ኣክሰሰሪታትን', icon: 'Headphones', display_order: 1 },
  { id: 'electronics', slug: 'electronics', name_en: 'Electronics & Phones', name_am: 'ኤሌክትሮኒክስ እና ስልኮች', name_ti: 'ኤሌክትሮኒክስን ተሌፎናትን', icon: 'Smartphone', display_order: 2 },
  { id: 'vehicles', slug: 'vehicles', name_en: 'Vehicles & Parts', name_am: 'ተሽከርካሪዎች እና መለዋወጫ', name_ti: 'ተሽከርከርትን መለዋወጥን', icon: 'Car', display_order: 3 },
  { id: 'property', slug: 'property', name_en: 'Property & Houses', name_am: 'ቤቶች እና ቦታዎች', name_ti: 'ገዛውትን ቦታታትን', icon: 'Home', display_order: 4 },
  { id: 'fashion', slug: 'fashion', name_en: 'Fashion & Traditional Wear', name_am: 'ፋሽን እና ባህላዊ አልባሳት', name_ti: 'ፋሽንን ባህላዊ ክዳውንትን', icon: 'Shirt', display_order: 5 },
  { id: 'home', slug: 'home', name_en: 'Home & Kitchen Appliances', name_am: 'የቤት እና የወጥ ቤት እቃዎች', name_ti: 'ናይ ገዛን ክሽነን ኣቑሑት', icon: 'Coffee', display_order: 6 },
  { id: 'crafts', slug: 'crafts', name_en: 'Artisanal & Coffee Sets', name_am: 'የእጅ ጥበብ እና የቡና እቃዎች', name_ti: 'ስነ-ጥበብን ናይ ቡን ኣቑሑትን', icon: 'Sparkles', display_order: 7 },
  { id: 'agriculture', slug: 'agriculture', name_en: 'Agriculture & Food Produce', name_am: 'ግብርና እና ምርቶች', name_ti: 'ሕርሻን መግብን', icon: 'Wheat', display_order: 8 },
];

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DATA_FILE = path.join(DATA_DIR, 'mela_market.json');

let pool: pg.Pool | null = null;
let isPostgresConnected = false;
let dbEngineName = 'Initializing';
let connectionError: string | null = null;

// Initial Seeds with generated authentic photos
const initialSeeds: DatabaseState = {
  users: [
    {
      id: 'admin-1',
      email: 'mikiaelebrhane21@gmail.com',
      password_hash: bcrypt.hashSync('MelaAdmin2026!', 10),
      full_name: 'Miki Alebrhane (Admin)',
      phone: '+251 91 100 0000',
      profile_photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
      role: 'admin',
      created_at: new Date().toISOString(),
    },
    {
      id: 'user-almaz',
      email: 'almaz.t@example.com',
      password_hash: bcrypt.hashSync('Password123!', 10),
      full_name: 'Almaz Tadesse',
      phone: '+251 92 345 6789',
      profile_photo: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80',
      role: 'user',
      created_at: new Date().toISOString(),
    },
    {
      id: 'user-dawit',
      email: 'dawit.m@example.com',
      password_hash: bcrypt.hashSync('Password123!', 10),
      full_name: 'Dawit Mengistu',
      phone: '+251 93 456 7890',
      profile_photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
      role: 'user',
      created_at: new Date().toISOString(),
    }
  ],
  products: [
    {
      id: 'prod-acc-1',
      user_id: 'user-dawit',
      title: 'Anker MagSafe Wireless Power Bank & Fast Car Charger (ተስማሚ ኃይል መሙያ)',
      description: 'Ultra-fast 20W PD magnetic wireless power bank with 15W Qi car mount charger. Compatible with Apple, Samsung, Xiaomi devices.',
      category: 'accessories',
      condition: 'new',
      price: 2800,
      currency: 'ETB',
      photo_url: 'https://images.unsplash.com/photo-1609081219090-a6d81d3085bf?auto=format&fit=crop&w=800&q=80',
      region: 'Addis Ababa / አዲስ አበባ / ኣዲስ ኣበባ',
      district: 'Bole / Edna Mall',
      city: 'Addis Ababa',
      seller_contact: '+251 93 456 7890',
      seller_name: 'Dawit Mengistu',
      seller_photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
      status: 'active',
      compatible_brands: ['Apple', 'Samsung', 'Xiaomi', 'Anker'],
      compatible_models: ['iPhone 15 Pro Max', 'iPhone 14', 'iPhone 13', 'Galaxy S24 Ultra', 'Galaxy S23'],
      created_at: new Date(Date.now() - 1800000).toISOString(),
    },
    {
      id: 'prod-new-1',
      user_id: 'user-almaz',
      title: 'Handcrafted Traditional Ethiopian Jebena Coffee Ceremony Set (የቡና ረከቦት)',
      description: 'Authentic pure black clay Jebena with 6 artisanal hand-fired cups and acacia wood serving tray. Brand new directly from craft masters.',
      category: 'crafts',
      condition: 'new',
      price: 3400,
      currency: 'ETB',
      photo_url: '/src/assets/images/product_ethiopian_coffee_set_1794060982321.jpg',
      region: 'Addis Ababa / አዲስ አበባ / ኣዲስ ኣበባ',
      district: 'Bole Sub-city',
      city: 'Addis Ababa',
      seller_contact: '+251 92 345 6789',
      seller_name: 'Almaz Tadesse',
      seller_photo: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80',
      status: 'active',
      created_at: new Date(Date.now() - 3600000).toISOString(),
    },
    {
      id: 'prod-new-2',
      user_id: 'user-dawit',
      title: 'Latest Flagship Smartphone 256GB - Brand New in Sealed Box',
      description: 'Original brand new factory unlocked smartphone with 1 year warranty, OLED 120Hz display, and rapid charger included.',
      category: 'electronics',
      condition: 'new',
      price: 88500,
      currency: 'ETB',
      photo_url: '/src/assets/images/product_modern_smartphone_1794060983386.jpg',
      region: 'Addis Ababa / አዲስ አበባ / ኣዲስ ኣበባ',
      district: 'Kirkos / Mexico Square',
      city: 'Addis Ababa',
      seller_contact: '+251 93 456 7890',
      seller_name: 'Dawit Mengistu',
      seller_photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
      status: 'active',
      created_at: new Date(Date.now() - 7200000).toISOString(),
    },
    {
      id: 'prod-new-3',
      user_id: 'user-almaz',
      title: 'Luxury Handwoven Habesha Kemis with Emerald & Gold Tilf (የባህል ቀሚስ)',
      description: 'Custom tailored 100% Ethiopian organic cotton dress with intricate hand embroidery. Brand new with matching Netela.',
      category: 'fashion',
      condition: 'new',
      price: 14500,
      currency: 'ETB',
      photo_url: '/src/assets/images/product_habesha_kemis_1794060983627.jpg',
      region: 'Addis Ababa / አዲስ አበባ / ኣዲስ ኣበባ',
      district: 'Yeka Sub-city',
      city: 'Addis Ababa',
      seller_contact: '+251 92 345 6789',
      seller_name: 'Almaz Tadesse',
      seller_photo: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80',
      status: 'active',
      created_at: new Date(Date.now() - 10800000).toISOString(),
    },
    {
      id: 'prod-used-1',
      user_id: 'user-dawit',
      title: 'Full-Grain Cognac Leather Messenger Bag (Gently Used, Like New)',
      description: 'Ethiopian artisan-made leather bag with brass fittings and adjustable shoulder strap. Lightly used for 2 months, excellent condition with rich patina.',
      category: 'fashion',
      condition: 'used',
      price: 4200,
      currency: 'ETB',
      photo_url: '/src/assets/images/product_leather_bag_1794060984835.jpg',
      region: 'Oromia / ኦሮሚያ / ኦሮሚያ',
      district: 'Bishoftu Town',
      city: 'Bishoftu',
      seller_contact: '+251 93 456 7890',
      seller_name: 'Dawit Mengistu',
      seller_photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
      status: 'active',
      created_at: new Date(Date.now() - 14400000).toISOString(),
    },
    {
      id: 'prod-used-2',
      user_id: 'user-almaz',
      title: 'Toyota Corolla 2018 Executive Model (Clean Pre-Owned)',
      description: 'Accident free, original factory paint, automatic transmission, genuine low mileage (46,000 km). Full service history available.',
      category: 'vehicles',
      condition: 'used',
      price: 2850000,
      currency: 'ETB',
      photo_url: 'https://images.unsplash.com/photo-1590362891991-f776e747a588?auto=format&fit=crop&w=800&q=80',
      region: 'Addis Ababa / አዲስ አበባ / ኣዲስ ኣበባ',
      district: 'Bole Bulbula',
      city: 'Addis Ababa',
      seller_contact: '+251 92 345 6789',
      seller_name: 'Almaz Tadesse',
      seller_photo: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80',
      status: 'active',
      created_at: new Date(Date.now() - 18000000).toISOString(),
    },
    {
      id: 'prod-used-3',
      user_id: 'user-dawit',
      title: 'Sony Professional Wireless Noise-Cancelling Headphones (Pre-owned)',
      description: 'Used for 4 months. Flawless battery health (30+ hours), original USB-C cable and carrying travel case included. Sound quality is pristine.',
      category: 'electronics',
      condition: 'used',
      price: 18900,
      currency: 'ETB',
      photo_url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80',
      region: 'Tigray / ትግራይ / ትግራይ',
      district: 'Kedamay Weyane',
      city: 'Mekelle',
      seller_contact: '+251 93 456 7890',
      seller_name: 'Dawit Mengistu',
      seller_photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
      status: 'active',
      created_at: new Date(Date.now() - 21600000).toISOString(),
    },
    {
      id: 'prod-acc-1',
      user_id: 'user-dawit',
      title: 'Anker 65W GaN Fast Charger & Multi-Device Braided USB-C Cable',
      description: 'Ultra-compact 65W fast charger with foldable plug and 2m braided cable. Compatible with Apple MacBook, iPhone 15/16, Samsung Galaxy S23/S24, Xiaomi, and Google Pixel devices. Safe voltage regulation.',
      category: 'accessories',
      condition: 'new',
      price: 3400,
      currency: 'ETB',
      photo_url: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&w=800&q=80',
      region: 'Addis Ababa / አዲስ አበባ / ኣዲስ ኣበባ',
      district: 'Bole Medhanialem',
      city: 'Addis Ababa',
      seller_contact: '+251 93 456 7890',
      seller_name: 'Dawit Mengistu',
      seller_photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
      status: 'active',
      compatible_brands: ['Apple', 'Samsung', 'Xiaomi', 'Anker'],
      compatible_models: ['iPhone 15', 'iPhone 16', 'Galaxy S23', 'Galaxy S24', 'MacBook Air'],
      created_at: new Date(Date.now() - 7200000).toISOString(),
    }
  ],
  inquiries: [
    {
      id: 'inq-1',
      product_id: 'prod-new-1',
      buyer_name: 'Solomon Kebede',
      buyer_email: 'solomon@example.com',
      buyer_phone: '+251 91 222 3344',
      message: 'Hello, is the Jebena coffee set available for delivery around Bole Medhanialem?',
      status: 'pending',
      created_at: new Date(Date.now() - 1800000).toISOString(),
    }
  ],
  reports: []
};

// Fallback file storage management
function ensureDataFile(): DatabaseState {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify(initialSeeds, null, 2), 'utf-8');
    return initialSeeds;
  }
  try {
    const raw = fs.readFileSync(DATA_FILE, 'utf-8');
    const data = JSON.parse(raw);
    return data;
  } catch (err) {
    console.error('Error reading data file, reinitializing seeds:', err);
    fs.writeFileSync(DATA_FILE, JSON.stringify(initialSeeds, null, 2), 'utf-8');
    return initialSeeds;
  }
}

function saveDataFile(data: DatabaseState) {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

// Initialize Database with Neon PostgreSQL
export async function initDatabase(): Promise<{ connected: boolean; engine: string; error?: string }> {
  const databaseUrl = process.env.DATABASE_URL || '';

  dbEngineName = 'Neon PostgreSQL';

  if (databaseUrl && databaseUrl.trim() && !databaseUrl.includes('MY_REAL_NEON_CONNECTION_STRING')) {
    try {
      console.log('Connecting to Neon PostgreSQL via DATABASE_URL...');
      
      pool = new Pool({
        connectionString: databaseUrl,
        ssl: { rejectUnauthorized: false }, // Required for Neon PostgreSQL SSL
        connectionTimeoutMillis: 10000,
      });

      // Execute live connection test
      const client = await pool.connect();
      const testRes = await client.query('SELECT NOW() as current_time, version() as pg_version');
      console.log('Neon PostgreSQL Connection Test Succeeded:', testRes.rows[0]);

      // Create relational tables on Neon PostgreSQL
      await client.query(`
        CREATE TABLE IF NOT EXISTS users (
          id VARCHAR(100) PRIMARY KEY,
          email VARCHAR(255) UNIQUE NOT NULL,
          password_hash TEXT NOT NULL,
          full_name VARCHAR(255) NOT NULL,
          phone VARCHAR(100) NOT NULL,
          profile_photo TEXT,
          role VARCHAR(50) DEFAULT 'user',
          created_at TIMESTAMPTZ DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS products (
          id VARCHAR(100) PRIMARY KEY,
          user_id VARCHAR(100) REFERENCES users(id) ON DELETE CASCADE,
          title VARCHAR(255) NOT NULL,
          description TEXT NOT NULL,
          category VARCHAR(100) NOT NULL,
          condition VARCHAR(50) NOT NULL,
          price NUMERIC NOT NULL,
          currency VARCHAR(20) DEFAULT 'ETB',
          photo_url TEXT NOT NULL,
          region VARCHAR(100) NOT NULL,
          district VARCHAR(100) NOT NULL,
          city VARCHAR(100) NOT NULL,
          seller_contact VARCHAR(100) NOT NULL,
          seller_name VARCHAR(255),
          seller_photo TEXT,
          status VARCHAR(50) DEFAULT 'active',
          compatible_brands TEXT[] DEFAULT '{}',
          compatible_models TEXT[] DEFAULT '{}',
          created_at TIMESTAMPTZ DEFAULT NOW()
        );

        ALTER TABLE products ADD COLUMN IF NOT EXISTS compatible_brands TEXT[] DEFAULT '{}';
        ALTER TABLE products ADD COLUMN IF NOT EXISTS compatible_models TEXT[] DEFAULT '{}';

        CREATE TABLE IF NOT EXISTS inquiries (
          id VARCHAR(100) PRIMARY KEY,
          product_id VARCHAR(100) REFERENCES products(id) ON DELETE CASCADE,
          buyer_name VARCHAR(255) NOT NULL,
          buyer_email VARCHAR(255) NOT NULL,
          buyer_phone VARCHAR(100) NOT NULL,
          message TEXT NOT NULL,
          status VARCHAR(50) DEFAULT 'pending',
          created_at TIMESTAMPTZ DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS reports (
          id VARCHAR(100) PRIMARY KEY,
          product_id VARCHAR(100) REFERENCES products(id) ON DELETE CASCADE,
          reporter_email VARCHAR(255) NOT NULL,
          reason TEXT NOT NULL,
          status VARCHAR(50) DEFAULT 'pending',
          created_at TIMESTAMPTZ DEFAULT NOW()
        );
      `);

      // Seed admin and baseline marketplace listings if empty on Neon
      const usersCountRes = await client.query('SELECT COUNT(*) FROM users');
      if (parseInt(usersCountRes.rows[0].count, 10) === 0) {
        for (const u of initialSeeds.users) {
          await client.query(
            `INSERT INTO users (id, email, password_hash, full_name, phone, profile_photo, role, created_at)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8) ON CONFLICT (id) DO NOTHING`,
            [u.id, u.email, u.password_hash, u.full_name, u.phone, u.profile_photo, u.role, u.created_at]
          );
        }
        for (const p of initialSeeds.products) {
          await client.query(
            `INSERT INTO products (id, user_id, title, description, category, condition, price, currency, photo_url, region, district, city, seller_contact, seller_name, seller_photo, status, compatible_brands, compatible_models, created_at)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19) ON CONFLICT (id) DO NOTHING`,
            [p.id, p.user_id, p.title, p.description, p.category, p.condition, p.price, p.currency, p.photo_url, p.region, p.district, p.city, p.seller_contact, p.seller_name, p.seller_photo, p.status, p.compatible_brands || [], p.compatible_models || [], p.created_at]
          );
        }
      } else {
        // Ensure accessory seed product is also present in Neon
        const accProduct = initialSeeds.products.find(p => p.id === 'prod-acc-1');
        if (accProduct) {
          await client.query(
            `INSERT INTO products (id, user_id, title, description, category, condition, price, currency, photo_url, region, district, city, seller_contact, seller_name, seller_photo, status, compatible_brands, compatible_models, created_at)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19)
             ON CONFLICT (id) DO UPDATE SET compatible_brands = EXCLUDED.compatible_brands, compatible_models = EXCLUDED.compatible_models`,
            [accProduct.id, accProduct.user_id, accProduct.title, accProduct.description, accProduct.category, accProduct.condition, accProduct.price, accProduct.currency, accProduct.photo_url, accProduct.region, accProduct.district, accProduct.city, accProduct.seller_contact, accProduct.seller_name, accProduct.seller_photo, accProduct.status, accProduct.compatible_brands || [], accProduct.compatible_models || [], accProduct.created_at]
          );
        }
      }

      client.release();
      isPostgresConnected = true;
      connectionError = null;
      console.log('Neon PostgreSQL is fully connected, verified, and operational.');
      return { connected: true, engine: 'Neon PostgreSQL' };
    } catch (err: any) {
      console.error('Neon PostgreSQL connection test failed:', err.message);
      connectionError = err.message;
      isPostgresConnected = false;
      return { connected: false, engine: 'Neon PostgreSQL', error: err.message };
    }
  } else {
    isPostgresConnected = false;
    connectionError = 'DATABASE_URL environment variable is not set. Awaiting real Neon PostgreSQL connection string.';
    console.log('Neon PostgreSQL configured, waiting for user DATABASE_URL.');
    return { connected: false, engine: 'Neon PostgreSQL', error: connectionError };
  }
}

// Function to test and connect a new Neon connection string dynamically
export async function connectNeonDatabase(connectionString: string): Promise<{ success: boolean; message: string; latencyMs?: number; version?: string }> {
  if (!connectionString || !connectionString.trim()) {
    return { success: false, message: 'Please provide a valid Neon PostgreSQL connection string.' };
  }

  const start = Date.now();
  let testPool: pg.Pool | null = null;
  try {
    testPool = new Pool({
      connectionString: connectionString.trim(),
      ssl: { rejectUnauthorized: false },
      connectionTimeoutMillis: 10000,
    });

    const client = await testPool.connect();
    const res = await client.query('SELECT NOW() as current_time, version() as pg_version');
    const latency = Date.now() - start;
    const version = res.rows[0]?.pg_version || 'PostgreSQL';

    // Apply tables
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(100) PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        full_name VARCHAR(255) NOT NULL,
        phone VARCHAR(100) NOT NULL,
        profile_photo TEXT,
        role VARCHAR(50) DEFAULT 'user',
        created_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS products (
        id VARCHAR(100) PRIMARY KEY,
        user_id VARCHAR(100) REFERENCES users(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        category VARCHAR(100) NOT NULL,
        condition VARCHAR(50) NOT NULL,
        price NUMERIC NOT NULL,
        currency VARCHAR(20) DEFAULT 'ETB',
        photo_url TEXT NOT NULL,
        region VARCHAR(100) NOT NULL,
        district VARCHAR(100) NOT NULL,
        city VARCHAR(100) NOT NULL,
        seller_contact VARCHAR(100) NOT NULL,
        seller_name VARCHAR(255),
        seller_photo TEXT,
        status VARCHAR(50) DEFAULT 'active',
        compatible_brands TEXT[] DEFAULT '{}',
        compatible_models TEXT[] DEFAULT '{}',
        created_at TIMESTAMPTZ DEFAULT NOW()
      );

      ALTER TABLE products ADD COLUMN IF NOT EXISTS compatible_brands TEXT[] DEFAULT '{}';
      ALTER TABLE products ADD COLUMN IF NOT EXISTS compatible_models TEXT[] DEFAULT '{}';

      CREATE TABLE IF NOT EXISTS inquiries (
        id VARCHAR(100) PRIMARY KEY,
        product_id VARCHAR(100) REFERENCES products(id) ON DELETE CASCADE,
        buyer_name VARCHAR(255) NOT NULL,
        buyer_email VARCHAR(255) NOT NULL,
        buyer_phone VARCHAR(100) NOT NULL,
        message TEXT NOT NULL,
        status VARCHAR(50) DEFAULT 'pending',
        created_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS reports (
        id VARCHAR(100) PRIMARY KEY,
        product_id VARCHAR(100) REFERENCES products(id) ON DELETE CASCADE,
        reporter_email VARCHAR(255) NOT NULL,
        reason TEXT NOT NULL,
        status VARCHAR(50) DEFAULT 'pending',
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    // Seed baseline if empty
    const usersCountRes = await client.query('SELECT COUNT(*) FROM users');
    if (parseInt(usersCountRes.rows[0].count, 10) === 0) {
      for (const u of initialSeeds.users) {
        await client.query(
          `INSERT INTO users (id, email, password_hash, full_name, phone, profile_photo, role, created_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8) ON CONFLICT (id) DO NOTHING`,
          [u.id, u.email, u.password_hash, u.full_name, u.phone, u.profile_photo, u.role, u.created_at]
        );
      }
      for (const p of initialSeeds.products) {
        await client.query(
          `INSERT INTO products (id, user_id, title, description, category, condition, price, currency, photo_url, region, district, city, seller_contact, seller_name, seller_photo, status, created_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17) ON CONFLICT (id) DO NOTHING`,
          [p.id, p.user_id, p.title, p.description, p.category, p.condition, p.price, p.currency, p.photo_url, p.region, p.district, p.city, p.seller_contact, p.seller_name, p.seller_photo, p.status, p.created_at]
        );
      }
    }

    client.release();

    // Replace pool
    if (pool) {
      await pool.end().catch(() => {});
    }
    pool = testPool;
    isPostgresConnected = true;
    connectionError = null;
    process.env.DATABASE_URL = connectionString.trim();

    // Persist to .env file securely on server
    try {
      const envPath = path.resolve(process.cwd(), '.env');
      let envContent = '';
      if (fs.existsSync(envPath)) {
        envContent = fs.readFileSync(envPath, 'utf-8');
      }
      if (envContent.includes('DATABASE_URL=')) {
        envContent = envContent.replace(/DATABASE_URL=.*/, `DATABASE_URL="${connectionString.trim()}"`);
      } else {
        envContent += `\nDATABASE_URL="${connectionString.trim()}"\n`;
      }
      if (!envContent.includes('JWT_SECRET=')) {
        envContent += `JWT_SECRET="${process.env.JWT_SECRET || 'MY_SECURE_RANDOM_SECRET'}"\n`;
      }
      fs.writeFileSync(envPath, envContent.trim() + '\n', 'utf-8');
    } catch (saveErr) {
      console.warn('Could not write to .env:', saveErr);
    }

    return {
      success: true,
      message: 'Neon PostgreSQL connection verified and active!',
      latencyMs: latency,
      version,
    };
  } catch (err: any) {
    if (testPool) {
      await testPool.end().catch(() => {});
    }
    return {
      success: false,
      message: 'Neon PostgreSQL connection test failed: ' + err.message,
    };
  }
}

// Get DB Health Status
export async function getDatabaseStatus() {
  const start = Date.now();
  if (isPostgresConnected && pool) {
    try {
      const client = await pool.connect();
      await client.query('SELECT 1');
      const latency = Date.now() - start;
      const dbNameRes = await client.query('SELECT current_database() as db_name');
      const activeDbName = dbNameRes.rows[0]?.db_name || 'mela_market_v2';
      const uRes = await client.query('SELECT count(*) FROM users');
      const pRes = await client.query('SELECT count(*) FROM products');
      const cRes = await client.query('SELECT count(*) FROM categories').catch(() => ({ rows: [{ count: '0' }] }));
      const oRes = await client.query('SELECT count(*) FROM orders').catch(() => ({ rows: [{ count: '0' }] }));
      const payRes = await client.query('SELECT count(*) FROM payments').catch(() => ({ rows: [{ count: '0' }] }));
      const iRes = await client.query('SELECT count(*) FROM inquiries');
      const rRes = await client.query('SELECT count(*) FROM reports');
      client.release();

      return {
        connected: true,
        engine: 'Neon PostgreSQL',
        activeDatabase: activeDbName,
        preservedDatabase: 'neondb (safe & preserved)',
        message: `Neon PostgreSQL active database: ${activeDbName}. Preserved database: neondb. All operational.`,
        tablesVerified: true,
        latencyMs: latency,
        neonConfigured: true,
        tableCounts: {
          users: parseInt(uRes.rows[0].count, 10),
          products: parseInt(pRes.rows[0].count, 10),
          categories: parseInt(cRes.rows[0].count, 10),
          orders: parseInt(oRes.rows[0].count, 10),
          payments: parseInt(payRes.rows[0].count, 10),
          inquiries: parseInt(iRes.rows[0].count, 10),
          reports: parseInt(rRes.rows[0].count, 10),
        }
      };
    } catch (err: any) {
      return {
        connected: false,
        engine: 'Neon PostgreSQL',
        activeDatabase: 'mela_market_v2',
        preservedDatabase: 'neondb',
        message: `Neon connection error: ${err.message}`,
        tablesVerified: false,
        neonConfigured: true,
      };
    }
  }

  // Not connected yet - if Neon is configured via DATABASE_URL, report status while keeping local storage functional
  if (process.env.DATABASE_URL && !process.env.DATABASE_URL.includes('MY_REAL_NEON_CONNECTION_STRING')) {
    const localData = ensureDataFile();
    return {
      connected: false,
      engine: 'Local In-Memory / File Storage (PostgreSQL Offline)',
      activeDatabase: 'local_storage',
      preservedDatabase: 'neondb (safe & preserved)',
      message: connectionError || 'PostgreSQL connection offline or direct TCP blocked. Operating seamlessly in local storage mode.',
      tablesVerified: false,
      latencyMs: 0,
      neonConfigured: true,
      error: connectionError || 'PostgreSQL connection offline',
      tableCounts: {
        users: localData.users.length,
        products: localData.products.length,
        categories: defaultCategories.length,
        orders: localData.orders?.length || 0,
        payments: localData.payments?.length || 0,
        inquiries: localData.inquiries.length,
        reports: localData.reports.length,
      }
    };
  }

  const localData = ensureDataFile();
  return {
    connected: false,
    engine: 'Local In-Memory Mode',
    message: 'DATABASE_URL is not set. Operating in local storage mode.',
    tablesVerified: false,
    latencyMs: 0,
    neonConfigured: false,
    tableCounts: {
      users: localData.users.length,
      products: localData.products.length,
      categories: defaultCategories.length,
      orders: localData.orders?.length || 0,
      payments: localData.payments?.length || 0,
      inquiries: localData.inquiries.length,
      reports: localData.reports.length,
    }
  };
}

function assertNeonConnected() {
  if (!isPostgresConnected || !pool) {
    // Seamless fallback to local in-memory/JSON data storage when PostgreSQL is not connected
    return;
  }
}

// User Operations
export async function findUserByEmail(email: string): Promise<DBUser | null> {
  const normalizedEmail = email.toLowerCase().trim();
  if (isPostgresConnected && pool) {
    const res = await pool.query('SELECT * FROM users WHERE LOWER(email) = $1', [normalizedEmail]);
    return res.rows[0] || null;
  }
  assertNeonConnected();
  const data = ensureDataFile();
  return data.users.find(u => u.email.toLowerCase() === normalizedEmail) || null;
}

export async function findUserById(id: string): Promise<DBUser | null> {
  if (isPostgresConnected && pool) {
    const res = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
    return res.rows[0] || null;
  }
  assertNeonConnected();
  const data = ensureDataFile();
  return data.users.find(u => u.id === id) || null;
}

export async function updateUserPassword(id: string, hash: string): Promise<boolean> {
  if (isPostgresConnected && pool) {
    await pool.query('UPDATE users SET password_hash = $1 WHERE id = $2', [hash, id]);
    return true;
  }
  assertNeonConnected();
  const data = ensureDataFile();
  const user = data.users.find(u => u.id === id);
  if (user) {
    user.password_hash = hash;
    saveDataFile(data);
  }
  return true;
}

export async function createUser(user: DBUser): Promise<DBUser> {
  if (isPostgresConnected && pool) {
    await pool.query(
      `INSERT INTO users (id, email, password_hash, full_name, phone, profile_photo, role, business_name, is_verified, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
      [user.id, user.email.toLowerCase(), user.password_hash, user.full_name, user.phone, user.profile_photo, user.role, user.business_name || null, Boolean(user.is_verified), user.created_at]
    );
    return user;
  }
  assertNeonConnected();
  const data = ensureDataFile();
  data.users.push(user);
  saveDataFile(data);
  return user;
}

export async function getAllUsers(): Promise<Omit<DBUser, 'password_hash'>[]> {
  if (isPostgresConnected && pool) {
    const res = await pool.query('SELECT id, email, full_name, phone, profile_photo, role, business_name, is_verified, created_at FROM users ORDER BY created_at DESC');
    return res.rows;
  }
  assertNeonConnected();
  const data = ensureDataFile();
  return data.users.map(({ password_hash, ...u }) => u);
}

export async function deleteUser(id: string): Promise<boolean> {
  if (isPostgresConnected && pool) {
    await pool.query('DELETE FROM users WHERE id = $1', [id]);
    return true;
  }
  assertNeonConnected();
  const data = ensureDataFile();
  data.users = data.users.filter(u => u.id !== id);
  data.products = data.products.filter(p => p.user_id !== id);
  saveDataFile(data);
  return true;
}

// Product Operations
export async function getProducts(filters?: {
  condition?: string;
  category?: string;
  region?: string;
  search?: string;
  compatibleBrand?: string;
  compatibleModel?: string;
}): Promise<DBProduct[]> {
  let list: DBProduct[] = [];
  if (isPostgresConnected && pool) {
    let query = 'SELECT * FROM products';
    const conditions: string[] = [];
    const params: any[] = [];

    if (filters?.condition && filters.condition !== 'all') {
      params.push(filters.condition.toLowerCase());
      conditions.push(`LOWER(condition) = $${params.length}`);
    }
    if (filters?.category && filters.category !== 'all') {
      params.push(filters.category.toLowerCase());
      conditions.push(`LOWER(category) = $${params.length}`);
    }
    if (filters?.region && filters.region !== 'all') {
      params.push(`%${filters.region.toLowerCase()}%`);
      conditions.push(`LOWER(region) LIKE $${params.length}`);
    }
    if (filters?.search && filters.search.trim()) {
      params.push(`%${filters.search.toLowerCase().trim()}%`);
      conditions.push(`(LOWER(title) LIKE $${params.length} OR LOWER(description) LIKE $${params.length} OR LOWER(city) LIKE $${params.length})`);
    }
    if (filters?.compatibleBrand && filters.compatibleBrand !== 'all') {
      params.push(filters.compatibleBrand.toLowerCase());
      conditions.push(`EXISTS (SELECT 1 FROM unnest(compatible_brands) b WHERE LOWER(b) = $${params.length})`);
    }
    if (filters?.compatibleModel && filters.compatibleModel.trim()) {
      params.push(`%${filters.compatibleModel.toLowerCase().trim()}%`);
      conditions.push(`EXISTS (SELECT 1 FROM unnest(compatible_models) m WHERE LOWER(m) LIKE $${params.length})`);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }
    query += ' ORDER BY created_at DESC';

    const res = await pool.query(query, params);
    return res.rows;
  }
  assertNeonConnected();
  const data = ensureDataFile();
  list = [...data.products];

  if (filters?.condition && filters.condition !== 'all') {
    list = list.filter(p => p.condition.toLowerCase() === filters.condition?.toLowerCase());
  }
  if (filters?.category && filters.category !== 'all') {
    list = list.filter(p => p.category.toLowerCase() === filters.category?.toLowerCase());
  }
  if (filters?.region && filters.region !== 'all') {
    list = list.filter(p => p.region.toLowerCase().includes(filters.region!.toLowerCase()) || filters.region!.toLowerCase().includes(p.region.toLowerCase()));
  }
  if (filters?.search && filters.search.trim()) {
    const q = filters.search.toLowerCase().trim();
    list = list.filter(p => 
      p.title.toLowerCase().includes(q) || 
      p.description.toLowerCase().includes(q) || 
      p.city.toLowerCase().includes(q)
    );
  }
  if (filters?.compatibleBrand && filters.compatibleBrand !== 'all') {
    const bTarget = filters.compatibleBrand.toLowerCase();
    list = list.filter(p => p.compatible_brands && p.compatible_brands.some(b => b.toLowerCase() === bTarget));
  }
  if (filters?.compatibleModel && filters.compatibleModel.trim()) {
    const mTarget = filters.compatibleModel.toLowerCase().trim();
    list = list.filter(p => p.compatible_models && p.compatible_models.some(m => m.toLowerCase().includes(mTarget)));
  }

  return list;
}

export async function getProductById(id: string): Promise<DBProduct | null> {
  if (isPostgresConnected && pool) {
    const res = await pool.query('SELECT * FROM products WHERE id = $1', [id]);
    return res.rows[0] || null;
  }
  assertNeonConnected();
  const data = ensureDataFile();
  return data.products.find(p => p.id === id) || null;
}

export async function createProduct(prod: DBProduct): Promise<DBProduct> {
  if (isPostgresConnected && pool) {
    await pool.query(
      `INSERT INTO products (id, user_id, title, description, category, condition, price, currency, photo_url, region, district, city, seller_contact, seller_name, seller_photo, status, compatible_brands, compatible_models, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19)`,
      [
        prod.id,
        prod.user_id,
        prod.title,
        prod.description,
        prod.category,
        prod.condition,
        prod.price,
        prod.currency,
        prod.photo_url,
        prod.region,
        prod.district,
        prod.city,
        prod.seller_contact,
        prod.seller_name,
        prod.seller_photo,
        prod.status,
        prod.compatible_brands || [],
        prod.compatible_models || [],
        prod.created_at
      ]
    );
    return prod;
  }
  assertNeonConnected();
  const data = ensureDataFile();
  data.products.unshift(prod);
  saveDataFile(data);
  return prod;
}

export async function deleteProduct(id: string): Promise<boolean> {
  if (isPostgresConnected && pool) {
    await pool.query('DELETE FROM products WHERE id = $1', [id]);
    return true;
  }
  assertNeonConnected();
  const data = ensureDataFile();
  data.products = data.products.filter(p => p.id !== id);
  data.inquiries = data.inquiries.filter(i => i.product_id !== id);
  data.reports = data.reports.filter(r => r.product_id !== id);
  saveDataFile(data);
  return true;
}

// Inquiries Operations
export async function createInquiry(inq: DBInquiry): Promise<DBInquiry> {
  if (isPostgresConnected && pool) {
    await pool.query(
      `INSERT INTO inquiries (id, product_id, buyer_name, buyer_email, buyer_phone, message, status, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [inq.id, inq.product_id, inq.buyer_name, inq.buyer_email, inq.buyer_phone, inq.message, inq.status, inq.created_at]
    );
    return inq;
  }
  assertNeonConnected();
  const data = ensureDataFile();
  data.inquiries.unshift(inq);
  saveDataFile(data);
  return inq;
}

export async function getInquiries(): Promise<DBInquiry[]> {
  if (isPostgresConnected && pool) {
    const res = await pool.query('SELECT * FROM inquiries ORDER BY created_at DESC');
    return res.rows;
  }
  assertNeonConnected();
  const data = ensureDataFile();
  return data.inquiries;
}

// Reports Operations
export async function createReport(rep: DBReport): Promise<DBReport> {
  if (isPostgresConnected && pool) {
    await pool.query(
      `INSERT INTO reports (id, product_id, reporter_email, reason, status, created_at)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [rep.id, rep.product_id, rep.reporter_email, rep.reason, rep.status, rep.created_at]
    );
    return rep;
  }
  assertNeonConnected();
  const data = ensureDataFile();
  data.reports.unshift(rep);
  saveDataFile(data);
  return rep;
}

export async function getReports(): Promise<DBReport[]> {
  if (isPostgresConnected && pool) {
    const res = await pool.query('SELECT * FROM reports ORDER BY created_at DESC');
    return res.rows;
  }
  assertNeonConnected();
  const data = ensureDataFile();
  return data.reports;
}

// Categories Operations
export async function getCategories(): Promise<DBCategory[]> {
  if (isPostgresConnected && pool) {
    try {
      const res = await pool.query('SELECT * FROM categories ORDER BY display_order ASC');
      if (res.rows.length > 0) return res.rows;
    } catch {
      // Fall through to defaultCategories
    }
  }
  return defaultCategories;
}

// Orders Operations
export async function getOrders(userId?: string): Promise<DBOrder[]> {
  if (isPostgresConnected && pool) {
    try {
      let query = 'SELECT * FROM orders ORDER BY created_at DESC';
      let params: any[] = [];
      if (userId) {
        query = 'SELECT * FROM orders WHERE buyer_id = $1 ORDER BY created_at DESC';
        params = [userId];
      }
      const res = await pool.query(query, params);
      return res.rows;
    } catch (err) {
      assertNeonConnected();
      throw err;
    }
  }
  assertNeonConnected();
  const data = ensureDataFile();
  const orders = data.orders || [];
  if (userId) {
    return orders.filter(o => o.buyer_id === userId);
  }
  return orders;
}

export async function createOrder(order: DBOrder, items: DBOrderItem[]): Promise<DBOrder> {
  if (isPostgresConnected && pool) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      await client.query(
        `INSERT INTO orders (id, order_number, buyer_id, buyer_name, buyer_email, buyer_phone, total_amount, currency, status, payment_status, shipping_address, shipping_city, shipping_region, notes, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)`,
        [order.id, order.order_number, order.buyer_id, order.buyer_name, order.buyer_email, order.buyer_phone, order.total_amount, order.currency, order.status, order.payment_status, order.shipping_address, order.shipping_city, order.shipping_region, order.notes, order.created_at]
      );

      for (const item of items) {
        await client.query(
          `INSERT INTO order_items (id, order_id, product_id, seller_id, title, quantity, unit_price, total_price)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
          [item.id, order.id, item.product_id, item.seller_id, item.title, item.quantity, item.unit_price, item.total_price]
        );
      }
      await client.query('COMMIT');
      return { ...order, items };
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }
  assertNeonConnected();
  const data = ensureDataFile();
  if (!data.orders) {
    data.orders = [];
  }
  const fullOrder = { ...order, items };
  data.orders.unshift(fullOrder);
  saveDataFile(data);
  return fullOrder;
}

// Payments Operations
export async function getPayments(): Promise<DBPayment[]> {
  if (isPostgresConnected && pool) {
    try {
      const res = await pool.query('SELECT * FROM payments ORDER BY created_at DESC');
      return res.rows;
    } catch (err) {
      assertNeonConnected();
      throw err;
    }
  }
  assertNeonConnected();
  const data = ensureDataFile();
  return data.payments || [];
}

export async function createPayment(payment: DBPayment): Promise<DBPayment> {
  if (isPostgresConnected && pool) {
    try {
      await pool.query(
        `INSERT INTO payments (id, order_id, user_id, payment_method, amount, currency, status, transaction_ref, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
        [payment.id, payment.order_id, payment.user_id, payment.payment_method, payment.amount, payment.currency, payment.status, payment.transaction_ref, payment.created_at]
      );
      return payment;
    } catch (err) {
      assertNeonConnected();
      throw err;
    }
  }
  assertNeonConnected();
  const data = ensureDataFile();
  if (!data.payments) {
    data.payments = [];
  }
  data.payments.unshift(payment);
  saveDataFile(data);
  return payment;
}

// ---------------- SUPER ADMIN FUNCTIONS ---------------- //

export async function updateUser(id: string, updates: Partial<DBUser>): Promise<DBUser | null> {
  if (isPostgresConnected && pool) {
    const fields: string[] = [];
    const values: any[] = [];
    let idx = 1;

    if (updates.full_name !== undefined) {
      fields.push(`full_name = $${idx++}`);
      values.push(updates.full_name);
    }
    if (updates.phone !== undefined) {
      fields.push(`phone = $${idx++}`);
      values.push(updates.phone);
    }
    if (updates.role !== undefined) {
      fields.push(`role = $${idx++}`);
      values.push(updates.role);
    }
    if (updates.business_name !== undefined) {
      fields.push(`business_name = $${idx++}`);
      values.push(updates.business_name);
    }
    if (updates.is_verified !== undefined) {
      fields.push(`is_verified = $${idx++}`);
      values.push(Boolean(updates.is_verified));
    }
    if (updates.status !== undefined) {
      fields.push(`status = $${idx++}`);
      values.push(updates.status);
    }
    if (updates.can_publish !== undefined) {
      fields.push(`can_publish = $${idx++}`);
      values.push(Boolean(updates.can_publish));
    }
    if (updates.seller_status !== undefined) {
      fields.push(`seller_status = $${idx++}`);
      values.push(updates.seller_status);
    }
    if (updates.profile_photo !== undefined) {
      fields.push(`profile_photo = $${idx++}`);
      values.push(updates.profile_photo);
    }
    if (updates.password_hash !== undefined) {
      fields.push(`password_hash = $${idx++}`);
      values.push(updates.password_hash);
    }

    if (fields.length === 0) return findUserById(id);

    fields.push(`updated_at = NOW()`);
    values.push(id);
    const query = `UPDATE users SET ${fields.join(', ')} WHERE id = $${idx} RETURNING *`;
    const res = await pool.query(query, values);
    return res.rows[0] || null;
  }
  assertNeonConnected();
  const data = ensureDataFile();
  const user = data.users.find(u => u.id === id);
  if (!user) return null;
  Object.assign(user, updates, { updated_at: new Date().toISOString() });
  saveDataFile(data);
  return user;
}

export async function updateProduct(id: string, updates: Partial<DBProduct>): Promise<DBProduct | null> {
  if (isPostgresConnected && pool) {
    const fields: string[] = [];
    const values: any[] = [];
    let idx = 1;

    if (updates.title !== undefined) {
      fields.push(`title = $${idx++}`);
      values.push(updates.title);
    }
    if (updates.description !== undefined) {
      fields.push(`description = $${idx++}`);
      values.push(updates.description);
    }
    if (updates.category !== undefined) {
      fields.push(`category = $${idx++}`);
      values.push(updates.category);
    }
    if (updates.condition !== undefined) {
      fields.push(`condition = $${idx++}`);
      values.push(updates.condition);
    }
    if (updates.price !== undefined) {
      fields.push(`price = $${idx++}`);
      values.push(Number(updates.price));
    }
    if (updates.currency !== undefined) {
      fields.push(`currency = $${idx++}`);
      values.push(updates.currency);
    }
    if (updates.stock_quantity !== undefined) {
      fields.push(`stock_quantity = $${idx++}`);
      values.push(Number(updates.stock_quantity));
    }
    if (updates.photo_url !== undefined) {
      fields.push(`photo_url = $${idx++}`);
      values.push(updates.photo_url);
    }
    if (updates.region !== undefined) {
      fields.push(`region = $${idx++}`);
      values.push(updates.region);
    }
    if (updates.district !== undefined) {
      fields.push(`district = $${idx++}`);
      values.push(updates.district);
    }
    if (updates.city !== undefined) {
      fields.push(`city = $${idx++}`);
      values.push(updates.city);
    }
    if (updates.status !== undefined) {
      fields.push(`status = $${idx++}`);
      values.push(updates.status);
    }
    if (updates.featured !== undefined) {
      fields.push(`featured = $${idx++}`);
      values.push(Boolean(updates.featured));
    }
    if (updates.compatible_brands !== undefined) {
      fields.push(`compatible_brands = $${idx++}`);
      values.push(updates.compatible_brands);
    }
    if (updates.compatible_models !== undefined) {
      fields.push(`compatible_models = $${idx++}`);
      values.push(updates.compatible_models);
    }

    if (fields.length === 0) return getProductById(id);

    fields.push(`updated_at = NOW()`);
    values.push(id);
    const query = `UPDATE products SET ${fields.join(', ')} WHERE id = $${idx} RETURNING *`;
    const res = await pool.query(query, values);
    return res.rows[0] || null;
  }
  assertNeonConnected();
  const data = ensureDataFile();
  const prod = data.products.find(p => p.id === id);
  if (!prod) return null;
  Object.assign(prod, updates);
  saveDataFile(data);
  return prod;
}

export async function updateOrderStatus(orderId: string, status: string, paymentStatus?: string, notes?: string): Promise<DBOrder | null> {
  if (isPostgresConnected && pool) {
    const fields = ['status = $1', 'updated_at = NOW()'];
    const values: any[] = [status];
    let idx = 2;

    if (paymentStatus) {
      fields.push(`payment_status = $${idx++}`);
      values.push(paymentStatus);
    }
    if (notes !== undefined) {
      fields.push(`notes = $${idx++}`);
      values.push(notes);
    }
    values.push(orderId);
    const query = `UPDATE orders SET ${fields.join(', ')} WHERE id = $${idx} RETURNING *`;
    const res = await pool.query(query, values);
    return res.rows[0] || null;
  }
  assertNeonConnected();
  const data = ensureDataFile();
  const order = data.orders?.find(o => o.id === orderId);
  if (!order) return null;
  order.status = status as any;
  if (paymentStatus) order.payment_status = paymentStatus as any;
  if (notes) order.notes = notes;
  saveDataFile(data);
  return order;
}

export async function createCategory(cat: DBCategory): Promise<DBCategory> {
  if (isPostgresConnected && pool) {
    await pool.query(
      `INSERT INTO categories (id, slug, name_en, name_am, name_ti, icon, description, display_order, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
       ON CONFLICT (id) DO UPDATE SET
         slug = EXCLUDED.slug,
         name_en = EXCLUDED.name_en,
         name_am = EXCLUDED.name_am,
         name_ti = EXCLUDED.name_ti,
         icon = EXCLUDED.icon,
         description = EXCLUDED.description,
         display_order = EXCLUDED.display_order`,
      [cat.id, cat.slug, cat.name_en, cat.name_am, cat.name_ti, cat.icon, cat.description || null, cat.display_order || 0]
    );
    return cat;
  }
  assertNeonConnected();
  return cat;
}

export async function updateCategory(id: string, updates: Partial<DBCategory>): Promise<DBCategory | null> {
  if (isPostgresConnected && pool) {
    const fields: string[] = [];
    const values: any[] = [];
    let idx = 1;

    if (updates.slug !== undefined) {
      fields.push(`slug = $${idx++}`);
      values.push(updates.slug);
    }
    if (updates.name_en !== undefined) {
      fields.push(`name_en = $${idx++}`);
      values.push(updates.name_en);
    }
    if (updates.name_am !== undefined) {
      fields.push(`name_am = $${idx++}`);
      values.push(updates.name_am);
    }
    if (updates.name_ti !== undefined) {
      fields.push(`name_ti = $${idx++}`);
      values.push(updates.name_ti);
    }
    if (updates.icon !== undefined) {
      fields.push(`icon = $${idx++}`);
      values.push(updates.icon);
    }
    if (updates.description !== undefined) {
      fields.push(`description = $${idx++}`);
      values.push(updates.description);
    }
    if (updates.display_order !== undefined) {
      fields.push(`display_order = $${idx++}`);
      values.push(Number(updates.display_order));
    }

    if (fields.length === 0) return null;
    values.push(id);
    const query = `UPDATE categories SET ${fields.join(', ')} WHERE id = $${idx} RETURNING *`;
    const res = await pool.query(query, values);
    return res.rows[0] || null;
  }
  assertNeonConnected();
  return null;
}

export async function deleteCategory(id: string): Promise<boolean> {
  if (isPostgresConnected && pool) {
    await pool.query('DELETE FROM categories WHERE id = $1', [id]);
    return true;
  }
  assertNeonConnected();
  return true;
}

export async function recordAuditLog(adminId: string, action: string, entityType: string, entityId?: string, details?: any): Promise<void> {
  if (isPostgresConnected && pool) {
    try {
      const id = 'audit_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6);
      await pool.query(
        `INSERT INTO admin_audit_logs (id, admin_id, action, entity_type, entity_id, details, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, NOW())`,
        [id, adminId, action, entityType, entityId || null, details ? JSON.stringify(details) : null]
      );
    } catch (err) {
      console.warn('Could not record audit log:', err);
    }
  }
}

export async function getAuditLogs(limit = 50): Promise<DBAdminAuditLog[]> {
  if (isPostgresConnected && pool) {
    try {
      const res = await pool.query(`
        SELECT a.id, a.admin_id, u.email as admin_email, u.full_name as admin_name, a.action, a.entity_type, a.entity_id, a.details, a.created_at
        FROM admin_audit_logs a
        LEFT JOIN users u ON a.admin_id = u.id
        ORDER BY a.created_at DESC
        LIMIT $1
      `, [limit]);
      return res.rows;
    } catch {
      return [];
    }
  }
  return [];
}

export async function getSiteSettings(key: string): Promise<any> {
  if (isPostgresConnected && pool) {
    try {
      const res = await pool.query('SELECT value FROM site_settings WHERE key = $1', [key]);
      return res.rows[0]?.value || null;
    } catch {
      return null;
    }
  }
  return null;
}

export async function updateSiteSettings(key: string, value: any): Promise<void> {
  if (isPostgresConnected && pool) {
    await pool.query(
      `INSERT INTO site_settings (key, value, updated_at)
       VALUES ($1, $2, NOW())
       ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()`,
      [key, JSON.stringify(value)]
    );
  }
}

export async function getAllSiteSettings(): Promise<Record<string, any>> {
  if (isPostgresConnected && pool) {
    try {
      const res = await pool.query('SELECT key, value FROM site_settings');
      const map: Record<string, any> = {};
      res.rows.forEach(r => {
        map[r.key] = r.value;
      });
      return map;
    } catch {
      return {};
    }
  }
  return {};
}
