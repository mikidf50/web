import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;
const connStr = process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_EyY6LPRSa2Gj@ep-withered-wildflower-bevhq6e4-pooler.c-9.us-east-2.aws.neon.tech/mela_market_v2?sslmode=require&channel_binding=require';

const pool = new Pool({
  connectionString: connStr,
  ssl: { rejectUnauthorized: false },
  connectionTimeoutMillis: 10000,
});

async function verifyAll() {
  const client = await pool.connect();
  console.log('===============================================================');
  console.log('REAL NEON POSTGRESQL VERIFICATION REPORT');
  console.log('===============================================================\n');

  try {
    // 1. Connection & Engine details
    const v = await client.query('SELECT version(), current_database(), current_user, inet_server_addr(), inet_server_port();');
    console.log('1. Connection Information:');
    console.log('   - Host:', new URL(connStr.replace('postgresql://', 'http://')).hostname);
    console.log('   - Database:', v.rows[0].current_database);
    console.log('   - User:', v.rows[0].current_user);
    console.log('   - PostgreSQL Version:', v.rows[0].version);

    // 2. Tables Verification
    const tablesRes = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `);
    const tables = tablesRes.rows.map((r: { table_name: string }) => r.table_name);
    console.log('\n2. Table Existence & Integrity (Total tables: ' + tables.length + '):');
    const requiredTables = [
      'users',
      'categories',
      'products',
      'inventory_logs',
      'orders',
      'order_items',
      'payments',
      'inquiries',
      'reports',
      'admin_audit_logs',
    ];
    const missing = requiredTables.filter(t => !tables.includes(t));
    if (missing.length > 0) {
      throw new Error('Missing required tables: ' + missing.join(', '));
    }
    for (const t of tables) {
      const c = await client.query(`SELECT count(*) FROM "${t}"`);
      console.log(`   ✓ Table '${t}': ${c.rows[0].count} records`);
    }

    // 3. Admin Operation Check
    console.log('\n3. Admin Operations Verification:');
    const adminUser = await client.query("SELECT id, email, full_name, role, is_verified FROM users WHERE role = 'admin' ORDER BY created_at ASC;");
    console.log('   ✓ Admin accounts found:');
    adminUser.rows.forEach(a => {
      console.log(`     • ${a.email} | ${a.full_name} | Role: ${a.role} | Verified: ${a.is_verified}`);
    });

    const auditId = 'audit_test_' + Date.now();
    await client.query(
      `INSERT INTO admin_audit_logs (id, admin_id, action, entity_type, entity_id, details)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [auditId, adminUser.rows[0].id, 'VERIFY_NEON_CONNECTION', 'system', 'neon_test', JSON.stringify({ verified_by: 'ai_studio_verification', timestamp: new Date().toISOString() })]
    );
    console.log('   ✓ Admin audit log written successfully (Audit ID:', auditId, ')');

    // 4. Seller Operation Check
    console.log('\n4. Seller Operations Verification:');
    const sellers = await client.query("SELECT id, email, full_name, role, business_name FROM users WHERE role = 'seller' ORDER BY created_at ASC;");
    console.log('   ✓ Seller accounts found:');
    sellers.rows.forEach(s => {
      console.log(`     • ${s.email} | ${s.full_name} | Business: ${s.business_name || 'N/A'}`);
    });

    // Test product creation by a seller
    const testProdId = 'prod_test_' + Date.now();
    await client.query(
      `INSERT INTO products (id, user_id, category, title, description, condition, price, currency, stock_quantity, photo_url, region, district, city, seller_contact, seller_name, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)`,
      [
        testProdId,
        sellers.rows[0].id,
        'electronics',
        'Verification Test Device (Automated Check)',
        'Product created during real Neon database verification',
        'new',
        1200.0,
        'ETB',
        10,
        'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=400&q=80',
        'Addis Ababa / አዲስ አበባ / ኣዲስ ኣበባ',
        'Bole Sub-city',
        'Addis Ababa',
        '+251 92 345 6789',
        sellers.rows[0].full_name,
        'active',
      ]
    );
    console.log('   ✓ Seller product listing created in Neon:', testProdId);

    // 5. Customer Operation Check
    console.log('\n5. Customer Operations Verification:');
    const customers = await client.query("SELECT id, email, full_name, role FROM users WHERE role = 'customer' ORDER BY created_at ASC;");
    console.log('   ✓ Customer accounts found:');
    customers.rows.forEach(c => {
      console.log(`     • ${c.email} | ${c.full_name}`);
    });

    // Customer inquiry
    const testInqId = 'inq_test_' + Date.now();
    await client.query(
      `INSERT INTO inquiries (id, product_id, buyer_name, buyer_email, buyer_phone, message, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [
        testInqId,
        testProdId,
        customers.rows[0].full_name,
        customers.rows[0].email,
        '+251 91 222 3344',
        'Is this item available for delivery in Bole?',
        'pending',
      ]
    );
    console.log('   ✓ Customer inquiry created in Neon:', testInqId);

    // Customer order
    const testOrdId = 'ord_test_' + Date.now();
    await client.query(
      `INSERT INTO orders (id, order_number, buyer_id, buyer_name, buyer_email, buyer_phone, total_amount, currency, status, payment_status, shipping_city)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
      [
        testOrdId,
        'MM-TEST-' + Math.floor(1000 + Math.random() * 9000),
        customers.rows[0].id,
        customers.rows[0].full_name,
        customers.rows[0].email,
        '+251 91 222 3344',
        1200.0,
        'ETB',
        'pending',
        'paid',
        'Addis Ababa',
      ]
    );
    console.log('   ✓ Customer order placed in Neon:', testOrdId);

    // Customer payment
    const testPayId = 'pay_test_' + Date.now();
    await client.query(
      `INSERT INTO payments (id, order_id, user_id, payment_method, amount, currency, status, transaction_ref)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [
        testPayId,
        testOrdId,
        customers.rows[0].id,
        'telebirr',
        1200.0,
        'ETB',
        'successful',
        'TX-TEST-' + Date.now(),
      ]
    );
    console.log('   ✓ Customer payment recorded in Neon:', testPayId);

    // 6. Cleanup verification records
    await client.query('DELETE FROM payments WHERE id = $1', [testPayId]);
    await client.query('DELETE FROM orders WHERE id = $1', [testOrdId]);
    await client.query('DELETE FROM inquiries WHERE id = $1', [testInqId]);
    await client.query('DELETE FROM products WHERE id = $1', [testProdId]);
    await client.query('DELETE FROM admin_audit_logs WHERE id = $1', [auditId]);
    console.log('\n6. Test Cleanup:');
    console.log('   ✓ Cleaned up test records. Original database state remains intact and unaffected.');

    // 7. Verify Preserved Database (neondb)
    console.log('\n7. Preserved Database Verification:');
    const prevConn = process.env.PREVIOUS_DATABASE_URL || 'postgresql://neondb_owner:npg_EyY6LPRSa2Gj@ep-withered-wildflower-bevhq6e4-pooler.c-9.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require';
    const prevPool = new Pool({ connectionString: prevConn, ssl: { rejectUnauthorized: false } });
    const prevClient = await prevPool.connect();
    try {
      const prevDbRes = await prevClient.query('SELECT current_database();');
      const prevTablesRes = await prevClient.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name;");
      console.log(`   ✓ Preserved Database: '${prevDbRes.rows[0].current_database}' is intact.`);
      console.log(`   ✓ Tables in preserved database:`, prevTablesRes.rows.map((r: { table_name: string }) => r.table_name).join(', '));
    } finally {
      prevClient.release();
      await prevPool.end();
    }

    console.log('\n===============================================================');
    console.log('VERIFICATION SUMMARY: ALL CHECKS PASSED ON REAL NEON POSTGRESQL');
    console.log('===============================================================');
  } finally {
    client.release();
    await pool.end();
  }
}

verifyAll().catch(err => {
  console.error('\nVerification FAILED:', err);
  process.exit(1);
});
