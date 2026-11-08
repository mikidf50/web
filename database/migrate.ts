import pg from 'pg';
import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

// Read config
const TARGET_DB_NAME = process.env.NEW_DATABASE_NAME || 'mela_market_v2';
const RAW_DATABASE_URL = process.env.DATABASE_URL || '';

// Target connection string for mela_market_v2
let targetUrl = process.env.NEW_DATABASE_URL || '';
if (!targetUrl && RAW_DATABASE_URL) {
  // Replace database path with TARGET_DB_NAME
  targetUrl = RAW_DATABASE_URL.replace(/\/([a-zA-Z0-9_\-]+)(\?|$)/, `/${TARGET_DB_NAME}$2`);
}

// Configurable Admin Credentials via Environment Variables
const ADMIN_EMAIL = (process.env.ADMIN_EMAIL || 'mikiaelebrhane21@gmail.com').toLowerCase().trim();
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || '0904503245@m';

async function runMigration() {
  console.log('----------------------------------------------------');
  console.log(`Starting Mela Market Neon PostgreSQL Migration: ${TARGET_DB_NAME}`);
  console.log('----------------------------------------------------');

  if (!targetUrl) {
    throw new Error('No DATABASE_URL configured in environment.');
  }

  const pool = new Pool({
    connectionString: targetUrl,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 10000,
  });

  const client = await pool.connect();
  console.log(`Connected to Neon PostgreSQL database: ${TARGET_DB_NAME}`);

  try {
    // 1. Read schema.sql
    const schemaPath = path.resolve(process.cwd(), 'database', 'schema.sql');
    const schemaSql = fs.readFileSync(schemaPath, 'utf-8');

    console.log('Applying database schema, tables, and indexes...');
    await client.query(schemaSql);
    console.log('Schema applied successfully!');

    // 2. Seed Default Categories
    const categoriesCount = await client.query('SELECT COUNT(*) FROM categories');
    if (parseInt(categoriesCount.rows[0].count, 10) === 0) {
      console.log('Seeding marketplace categories...');
      const defaultCategories = [
        { id: 'cat-all', slug: 'all', name_en: 'All Categories', name_am: 'ሁሉም ምድቦች', name_ti: 'ኩሎም ምድባት', icon: 'Sparkles', display_order: 1 },
        { id: 'cat-electronics', slug: 'electronics', name_en: 'Electronics & Phones', name_am: 'ኤሌክትሮኒክስ እና ስልኮች', name_ti: 'ኤሌክትሮኒክስን ሞባይልን', icon: 'Smartphone', display_order: 2 },
        { id: 'cat-vehicles', slug: 'vehicles', name_en: 'Vehicles & Cars', name_am: 'ተሽከርካሪዎች እና መኪኖች', name_ti: 'መካይንን መጓዓዝያን', icon: 'Car', display_order: 3 },
        { id: 'cat-property', slug: 'property', name_en: 'Real Estate & Houses', name_am: 'ቤት እና ይዞታ', name_ti: 'ገዛውትን ቦታታትን', icon: 'Home', display_order: 4 },
        { id: 'cat-fashion', slug: 'fashion', name_en: 'Habesha Clothes & Fashion', name_am: 'የባህል ልብስ እና ፋሽን', name_ti: 'ባህላዊ ክዳውንትን ፋሽንን', icon: 'ShoppingBag', display_order: 5 },
        { id: 'cat-crafts', slug: 'crafts', name_en: 'Ethiopian Crafts & Jebena', name_am: 'የእጅ ጥበብ እና ጀበና', name_ti: 'ኢደ-ጥበብን ጀበናን', icon: 'Coffee', display_order: 6 },
        { id: 'cat-home', slug: 'home', name_en: 'Home & Furniture', name_am: 'የቤት እቃዎች እና ፈርኒቸር', name_ti: 'ናይ ገዛ ኣቑሑትን ፈርኒቸርን', icon: 'Armchair', display_order: 7 },
        { id: 'cat-services', slug: 'services', name_en: 'Services & Jobs', name_am: 'አገልግሎቶች እና ስራ', name_ti: 'ኣገልግሎታትን ስራሕን', icon: 'Briefcase', display_order: 8 },
      ];

      for (const cat of defaultCategories) {
        await client.query(
          `INSERT INTO categories (id, slug, name_en, name_am, name_ti, icon, display_order)
           VALUES ($1, $2, $3, $4, $5, $6, $7) ON CONFLICT (id) DO NOTHING`,
          [cat.id, cat.slug, cat.name_en, cat.name_am, cat.name_ti, cat.icon, cat.display_order]
        );
      }
      console.log(`Seeded ${defaultCategories.length} categories.`);
    }

    // 3. Seed / Verify Administrator Account
    console.log(`Configuring secure administrator account: ${ADMIN_EMAIL}...`);
    const adminSalt = await bcrypt.genSalt(10);
    const adminPasswordHash = await bcrypt.hash(ADMIN_PASSWORD, adminSalt);

    const existingAdmin = await client.query('SELECT * FROM users WHERE LOWER(email) = $1', [ADMIN_EMAIL]);
    if (existingAdmin.rows.length === 0) {
      await client.query(
        `INSERT INTO users (id, email, password_hash, full_name, phone, profile_photo, role, is_verified, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())`,
        [
          'admin-primary',
          ADMIN_EMAIL,
          adminPasswordHash,
          'Miki Alebrhane (Admin)',
          '+251 91 100 0000',
          'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
          'admin',
          true,
        ]
      );
      console.log(`Created primary admin account: ${ADMIN_EMAIL}`);
    } else {
      await client.query(
        `UPDATE users SET password_hash = $1, role = 'admin', is_verified = true, updated_at = NOW() WHERE LOWER(email) = $2`,
        [adminPasswordHash, ADMIN_EMAIL]
      );
      console.log(`Updated and secured existing admin account: ${ADMIN_EMAIL}`);
    }

    // Ensure secondary admin account if present
    const secondaryEmail = 'mikiaelebrhane@gmail.com';
    const secondaryAdmin = await client.query('SELECT * FROM users WHERE LOWER(email) = $1', [secondaryEmail]);
    if (secondaryAdmin.rows.length === 0) {
      await client.query(
        `INSERT INTO users (id, email, password_hash, full_name, phone, profile_photo, role, is_verified, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())`,
        [
          'admin-secondary',
          secondaryEmail,
          adminPasswordHash,
          'miki',
          '+251 90 450 3245',
          'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
          'admin',
          true,
        ]
      );
      console.log(`Configured secondary admin account: ${secondaryEmail}`);
    }

    // 4. Seed Verified Sellers & Customers for realistic ecosystem
    const defaultUsers = [
      {
        id: 'seller-almaz',
        email: 'almaz.t@example.com',
        full_name: 'Almaz Tadesse',
        phone: '+251 92 345 6789',
        role: 'seller',
        business_name: 'Almaz Habesha Crafts & Fashion',
        profile_photo: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80',
      },
      {
        id: 'seller-dawit',
        email: 'dawit.m@example.com',
        full_name: 'Dawit Mengistu',
        phone: '+251 93 456 7890',
        role: 'seller',
        business_name: 'Dawit Electronics & Pre-owned Goods',
        profile_photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
      },
      {
        id: 'customer-solomon',
        email: 'solomon@example.com',
        full_name: 'Solomon Kebede',
        phone: '+251 91 222 3344',
        role: 'customer',
        business_name: null,
        profile_photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
      },
    ];

    const userSalt = await bcrypt.genSalt(10);
    const userPassHash = await bcrypt.hash('Password123!', userSalt);

    for (const u of defaultUsers) {
      const exists = await client.query('SELECT id FROM users WHERE id = $1', [u.id]);
      if (exists.rows.length === 0) {
        await client.query(
          `INSERT INTO users (id, email, password_hash, full_name, phone, profile_photo, role, business_name, is_verified, created_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, true, NOW())`,
          [u.id, u.email, userPassHash, u.full_name, u.phone, u.profile_photo, u.role, u.business_name]
        );
      }
    }

    // 5. Seed Initial Marketplace Listings
    const productsCount = await client.query('SELECT COUNT(*) FROM products');
    if (parseInt(productsCount.rows[0].count, 10) === 0) {
      console.log('Seeding initial authentic Ethiopian products...');
      const defaultProducts = [
        {
          id: 'prod-new-1',
          user_id: 'seller-almaz',
          category: 'crafts',
          title: 'Handcrafted Traditional Ethiopian Jebena Coffee Ceremony Set (የቡና ረከቦት)',
          description: 'Authentic pure black clay Jebena with 6 artisanal hand-fired cups and acacia wood serving tray. Brand new directly from craft masters.',
          condition: 'new',
          price: 3400,
          currency: 'ETB',
          stock_quantity: 5,
          photo_url: '/src/assets/images/product_ethiopian_coffee_set_1794060982321.jpg',
          region: 'Addis Ababa / አዲስ አበባ / ኣዲስ ኣበባ',
          district: 'Bole Sub-city',
          city: 'Addis Ababa',
          seller_contact: '+251 92 345 6789',
          seller_name: 'Almaz Tadesse',
          seller_photo: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80',
          status: 'active',
          featured: true,
        },
        {
          id: 'prod-new-2',
          user_id: 'seller-dawit',
          category: 'electronics',
          title: 'Latest Flagship Smartphone 256GB - Brand New in Sealed Box',
          description: 'Original brand new factory unlocked smartphone with 1 year warranty, OLED 120Hz display, and rapid charger included.',
          condition: 'new',
          price: 88500,
          currency: 'ETB',
          stock_quantity: 2,
          photo_url: '/src/assets/images/product_modern_smartphone_1794060983386.jpg',
          region: 'Addis Ababa / አዲስ አበባ / ኣዲስ ኣበባ',
          district: 'Kirkos / Mexico Square',
          city: 'Addis Ababa',
          seller_contact: '+251 93 456 7890',
          seller_name: 'Dawit Mengistu',
          seller_photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
          status: 'active',
          featured: true,
        },
        {
          id: 'prod-new-3',
          user_id: 'seller-almaz',
          category: 'fashion',
          title: 'Luxury Handwoven Habesha Kemis with Emerald & Gold Tilf (የባህል ቀሚስ)',
          description: 'Custom tailored 100% Ethiopian organic cotton dress with intricate hand embroidery. Brand new with matching Netela.',
          condition: 'new',
          price: 14500,
          currency: 'ETB',
          stock_quantity: 3,
          photo_url: '/src/assets/images/product_habesha_kemis_1794060983627.jpg',
          region: 'Addis Ababa / አዲስ አበባ / ኣዲስ ኣበባ',
          district: 'Yeka Sub-city',
          city: 'Addis Ababa',
          seller_contact: '+251 92 345 6789',
          seller_name: 'Almaz Tadesse',
          seller_photo: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80',
          status: 'active',
          featured: false,
        },
        {
          id: 'prod-used-1',
          user_id: 'seller-dawit',
          category: 'fashion',
          title: 'Full-Grain Cognac Leather Messenger Bag (Gently Used, Like New)',
          description: 'Ethiopian artisan-made leather bag with brass fittings and adjustable shoulder strap. Lightly used for 2 months, excellent condition with rich patina.',
          condition: 'used',
          price: 4200,
          currency: 'ETB',
          stock_quantity: 1,
          photo_url: '/src/assets/images/product_leather_bag_1794060984835.jpg',
          region: 'Oromia / ኦሮሚያ / ኦሮሚያ',
          district: 'Bishoftu Town',
          city: 'Bishoftu',
          seller_contact: '+251 93 456 7890',
          seller_name: 'Dawit Mengistu',
          seller_photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
          status: 'active',
          featured: false,
        },
        {
          id: 'prod-used-2',
          user_id: 'seller-almaz',
          category: 'vehicles',
          title: 'Toyota Corolla 2018 Executive Model (Clean Pre-Owned)',
          description: 'Accident free, original factory paint, automatic transmission, genuine low mileage (46,000 km). Full service history available.',
          condition: 'used',
          price: 2850000,
          currency: 'ETB',
          stock_quantity: 1,
          photo_url: 'https://images.unsplash.com/photo-1590362891991-f776e747a588?auto=format&fit=crop&w=800&q=80',
          region: 'Addis Ababa / አዲስ አበባ / ኣዲስ ኣበባ',
          district: 'Bole Bulbula',
          city: 'Addis Ababa',
          seller_contact: '+251 92 345 6789',
          seller_name: 'Almaz Tadesse',
          seller_photo: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80',
          status: 'active',
          featured: false,
        },
        {
          id: 'prod-used-3',
          user_id: 'seller-dawit',
          category: 'electronics',
          title: 'Sony Professional Wireless Noise-Cancelling Headphones (Pre-owned)',
          description: 'Used for 4 months. Flawless battery health (30+ hours), original USB-C cable and carrying travel case included. Sound quality is pristine.',
          condition: 'used',
          price: 18900,
          currency: 'ETB',
          stock_quantity: 1,
          photo_url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80',
          region: 'Tigray / ትግራይ / ትግራይ',
          district: 'Kedamay Weyane',
          city: 'Mekelle',
          seller_contact: '+251 93 456 7890',
          seller_name: 'Dawit Mengistu',
          seller_photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
          status: 'active',
          featured: false,
        },
      ];

      for (const p of defaultProducts) {
        await client.query(
          `INSERT INTO products (id, user_id, category, title, description, condition, price, currency, stock_quantity, photo_url, region, district, city, seller_contact, seller_name, seller_photo, status, featured, created_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, NOW())`,
          [p.id, p.user_id, p.category, p.title, p.description, p.condition, p.price, p.currency, p.stock_quantity, p.photo_url, p.region, p.district, p.city, p.seller_contact, p.seller_name, p.seller_photo, p.status, p.featured]
        );

        // Record initial inventory log
        await client.query(
          `INSERT INTO inventory_logs (id, product_id, change_type, quantity_change, new_quantity, notes, created_at)
           VALUES ($1, $2, 'initial', $3, $3, 'Initial inventory setup', NOW())`,
          ['inv_' + p.id, p.id, p.stock_quantity]
        );
      }
      console.log(`Seeded ${defaultProducts.length} listings with inventory logs.`);
    }

    // 6. Verification Summary
    const uCount = await client.query('SELECT COUNT(*) FROM users');
    const pCount = await client.query('SELECT COUNT(*) FROM products');
    const cCount = await client.query('SELECT COUNT(*) FROM categories');
    const oCount = await client.query('SELECT COUNT(*) FROM orders');
    const payCount = await client.query('SELECT COUNT(*) FROM payments');
    const inqCount = await client.query('SELECT COUNT(*) FROM inquiries');
    const repCount = await client.query('SELECT COUNT(*) FROM reports');

    console.log('----------------------------------------------------');
    console.log('Neon PostgreSQL Migration Verification Summary:');
    console.log(`- Database Name: ${TARGET_DB_NAME}`);
    console.log(`- Users: ${uCount.rows[0].count}`);
    console.log(`- Products: ${pCount.rows[0].count}`);
    console.log(`- Categories: ${cCount.rows[0].count}`);
    console.log(`- Orders: ${oCount.rows[0].count}`);
    console.log(`- Payments: ${payCount.rows[0].count}`);
    console.log(`- Inquiries: ${inqCount.rows[0].count}`);
    console.log(`- Reports: ${repCount.rows[0].count}`);
    console.log('----------------------------------------------------');
    console.log('Migration completed with 100% success!');
  } finally {
    client.release();
    await pool.end();
  }
}

runMigration().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});
