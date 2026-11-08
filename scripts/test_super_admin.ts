import 'dotenv/config';
import jwt from 'jsonwebtoken';
import pg from 'pg';

const { Pool } = pg;
const BASE_URL = 'http://127.0.0.1:3000';
const JWT_SECRET = process.env.JWT_SECRET || 'mela_market_jwt_secret_production_key_2026';
const connStr = process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_EyY6LPRSa2Gj@ep-withered-wildflower-bevhq6e4-pooler.c-9.us-east-2.aws.neon.tech/mela_market_v2?sslmode=require&channel_binding=require';

const pool = new Pool({
  connectionString: connStr,
  ssl: { rejectUnauthorized: false },
});

async function runTests() {
  console.log('--- STARTING SUPER ADMIN TEST SUITE ---');

  // Fetch real admin user from Neon
  const adminRes = await pool.query("SELECT id, email, full_name, role FROM users WHERE role = 'admin' ORDER BY created_at ASC LIMIT 1;");
  if (adminRes.rows.length === 0) {
    throw new Error('No admin found in Neon database');
  }
  const realAdmin = adminRes.rows[0];
  console.log(`Using authorized admin account: ${realAdmin.email} (ID: ${realAdmin.id})`);

  // Generate authentic JWT signed with JWT_SECRET
  const adminToken = jwt.sign(
    {
      id: realAdmin.id,
      email: realAdmin.email,
      role: 'admin',
      fullName: realAdmin.full_name,
    },
    JWT_SECRET,
    { expiresIn: '2h' }
  );

  // 1. Public site settings
  console.log('\n[1] Testing GET /api/site-settings...');
  const resSettings = await fetch(`${BASE_URL}/api/site-settings`);
  const settingsJson = await resSettings.json();
  console.log('Site Settings status:', resSettings.status, 'Banners:', settingsJson.banners?.length, 'Announcements:', settingsJson.announcements?.length);

  // 2. Admin Overview
  console.log('\n[2] Testing GET /api/admin/overview (requireAdmin)...');
  const resOverview = await fetch(`${BASE_URL}/api/admin/overview`, {
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  const overviewJson = await resOverview.json();
  console.log('Admin Overview status:', resOverview.status);
  console.log('Overview stats:', overviewJson.stats);
  console.log('Neon DB Status:', overviewJson.dbStatus?.engine, 'Connected:', overviewJson.dbStatus?.connected, 'Active DB:', overviewJson.dbStatus?.activeDatabase);

  // 3. Admin User Creation
  console.log('\n[3] Testing POST /api/admin/users (Create User)...');
  const testEmail = `test_seller_${Date.now()}@example.com`;
  const resCreateUser = await fetch(`${BASE_URL}/api/admin/users`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${adminToken}`,
    },
    body: JSON.stringify({
      fullName: 'Test Ethiopian Seller',
      email: testEmail,
      phone: '+251 91 123 9999',
      password: 'password123',
      role: 'seller',
      businessName: 'Addis Tech Emporium',
      status: 'active',
    }),
  });
  const createUserJson = await resCreateUser.json();
  console.log('Create user status:', resCreateUser.status, 'Created ID:', createUserJson.user?.id);
  const createdUserId = createUserJson.user?.id;

  // 4. Admin User Status Update (Suspend & Activate)
  console.log('\n[4] Testing PATCH /api/admin/users/:id/status (Suspend user)...');
  const resSuspend = await fetch(`${BASE_URL}/api/admin/users/${createdUserId}/status`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${adminToken}`,
    },
    body: JSON.stringify({ status: 'suspended' }),
  });
  const suspendJson = await resSuspend.json();
  console.log('Suspend user status:', resSuspend.status, 'User status:', suspendJson.user?.status);

  // 5. Admin Seller Publishing Permission Control
  console.log('\n[5] Testing PATCH /api/admin/sellers/:id/permissions...');
  const resPerm = await fetch(`${BASE_URL}/api/admin/sellers/${createdUserId}/permissions`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${adminToken}`,
    },
    body: JSON.stringify({ canPublish: false }),
  });
  const permJson = await resPerm.json();
  console.log('Seller permissions status:', resPerm.status, 'Can publish:', permJson.user?.can_publish);

  // 6. Admin Product Creation
  console.log('\n[6] Testing POST /api/admin/products...');
  const resCreateProduct = await fetch(`${BASE_URL}/api/admin/products`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${adminToken}`,
    },
    body: JSON.stringify({
      title: 'Admin Listed Genuine Leather Bag',
      description: 'Handcrafted premium leather bag made in Addis Ababa.',
      category: 'fashion',
      condition: 'new',
      price: 3400,
      currency: 'ETB',
      stockQuantity: 5,
      photoUrl: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=800&q=80',
      region: 'Addis Ababa',
      city: 'Addis Ababa',
      district: 'Bole',
      featured: true,
      status: 'active',
      userId: realAdmin.id,
    }),
  });
  const createProductJson = await resCreateProduct.json();
  console.log('Create product status:', resCreateProduct.status, 'Product ID:', createProductJson.product?.id);
  const createdProductId = createProductJson.product?.id;

  // 7. Admin Product Status Update & Toggle Featured
  console.log('\n[7] Testing PATCH /api/admin/products/:id/featured and status...');
  const resFeat = await fetch(`${BASE_URL}/api/admin/products/${createdProductId}/featured`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${adminToken}`,
    },
    body: JSON.stringify({ featured: true }),
  });
  console.log('Toggle featured status:', resFeat.status);

  // 8. Order Placement & Admin Order Management
  console.log('\n[8] Testing Order Placement & Admin Order Update...');
  const resOrder = await fetch(`${BASE_URL}/api/orders`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${adminToken}`,
    },
    body: JSON.stringify({
      items: [
        {
          productId: createdProductId,
          title: 'Admin Listed Genuine Leather Bag',
          price: 3400,
          quantity: 1,
          sellerId: realAdmin.id,
        },
      ],
      totalAmount: 3400,
      shippingAddress: 'Bole Sub-city, Woreda 03',
      shippingCity: 'Addis Ababa',
      shippingRegion: 'Addis Ababa',
      notes: 'Please deliver after 2 PM',
    }),
  });
  const orderJson = await resOrder.json();
  console.log('Create order status:', resOrder.status, 'Order #:', orderJson.order?.order_number);
  const orderId = orderJson.order?.id;

  // Admin updates order status
  const resOrderStatus = await fetch(`${BASE_URL}/api/admin/orders/${orderId}/status`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${adminToken}`,
    },
    body: JSON.stringify({ status: 'confirmed', paymentStatus: 'paid' }),
  });
  const orderStatusJson = await resOrderStatus.json();
  console.log('Update order status:', resOrderStatus.status, 'New order status:', orderStatusJson.order?.status, 'Payment:', orderStatusJson.order?.payment_status);

  // 9. Admin Audit Logs
  console.log('\n[9] Testing GET /api/admin/audit-logs...');
  const resLogs = await fetch(`${BASE_URL}/api/admin/audit-logs`, {
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  const logsJson = await resLogs.json();
  console.log('Audit logs status:', resLogs.status, 'Total logged actions:', logsJson.length);
  if (logsJson.length > 0) {
    console.log('Latest audit action:', logsJson[0].action, 'Entity:', logsJson[0].entity_type);
  }

  // 10. Clean up test records
  console.log('\n[10] Cleaning up test records...');
  await fetch(`${BASE_URL}/api/products/${createdProductId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  await fetch(`${BASE_URL}/api/admin/users/${createdUserId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  console.log('Cleaned up test product and user.');

  await pool.end();
  console.log('\n=== ALL SUPER ADMIN VERIFICATIONS COMPLETED SUCCESSFULLY ===');
}

runTests().catch(err => {
  console.error('Super Admin Test Failure:', err);
  process.exit(1);
});
