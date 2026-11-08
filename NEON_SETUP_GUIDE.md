# Mela Market - Neon PostgreSQL Database Setup & Management Guide

## 1. Overview of New Database Configuration

A brand new relational database **`mela_market_v2`** has been created, configured, migrated, and verified on **Neon PostgreSQL**. 

Your previous database **`neondb`** is completely preserved and untouched.

| Parameter | New Active Database (`mela_market_v2`) | Preserved Database (`neondb`) |
|---|---|---|
| **Engine** | Neon Serverless PostgreSQL 16+ | Neon Serverless PostgreSQL 16+ |
| **Database Name** | `mela_market_v2` | `neondb` |
| **Host** | `ep-withered-wildflower-bevhq6e4-pooler.c-9.us-east-2.aws.neon.tech` | `ep-withered-wildflower-bevhq6e4-pooler.c-9.us-east-2.aws.neon.tech` |
| **Port** | `5432` | `5432` |
| **Username** | `neondb_owner` | `neondb_owner` |
| **SSL Mode** | `require` (pooled) | `require` (pooled) |
| **Status** | **Active, Migrated, Verified** | **Preserved (Safe for rollback)** |

---

## 2. Environment Variables

In your server environment, the following environment variables are active:

```bash
# New Active Production Database (mela_market_v2)
DATABASE_URL="postgresql://neondb_owner:npg_EyY6LPRSa2Gj@ep-withered-wildflower-bevhq6e4-pooler.c-9.us-east-2.aws.neon.tech/mela_market_v2?sslmode=require&channel_binding=require"

# Preserved Previous Database (neondb) - Retained safely
PREVIOUS_DATABASE_URL="postgresql://neondb_owner:npg_EyY6LPRSa2Gj@ep-withered-wildflower-bevhq6e4-pooler.c-9.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require"

# JWT Secret for Session Authentication
JWT_SECRET="0904503245@miki"

# Configurable Admin Credentials
ADMIN_EMAIL="mikiaelebrhane21@gmail.com"
ADMIN_PASSWORD="MY_SECURE_ADMIN_PASSWORD"
```

*Note: All database credentials and JWT keys are stored strictly server-side and never exposed to client browsers.*

---

## 3. Database Schema & Architecture (`mela_market_v2`)

The new database includes all tables, relational foreign keys with cascade rules, and B-Tree indexes:

1. **`users`**: Multi-role support (`admin`, `seller`, `customer`), password bcrypt hashing, business profile, phone, photo, and verification flags.
2. **`categories`**: Multilingual categories (Amharic `name_am`, English `name_en`, Tigrinya `name_ti`), icon identifiers, display order.
3. **`products`**: Separate new & used conditions (`new`, `used`), stock quantities, multilingual regions, photo URLs, status controls (`active`, `sold`, `hidden`).
4. **`inventory_logs`**: Tracks all inventory changes (`initial`, `sale`, `restock`, `adjustment`) with timestamps and quantity changes.
5. **`orders`**: Order tracking with unique order numbers, total amounts, buyer details, order status (`pending`, `confirmed`, `processing`, `completed`, `cancelled`), and payment status (`unpaid`, `paid`, `refunded`).
6. **`order_items`**: Line items per order linking products, sellers, quantities, and prices.
7. **`payments`**: Payment records supporting Ethiopian payment methods (`telebirr`, `cbe_birr`, `bank_transfer`, `cash_on_delivery`), status, and transaction reference numbers.
8. **`inquiries`**: Direct customer inquiries to sellers with phone contact and message status.
9. **`reports`**: Moderation reports for listings.
10. **`admin_audit_logs`**: Audit trail of administrative actions.

---

## 4. Role-Based Access Control (RBAC)

| Role | Access Level | Permissions |
|---|---|---|
| **Admin** | Full Management | Access Admin Dashboard, view all users, manage products, view DB health, inspect inquiries and moderation reports. |
| **Seller** | Merchant | Post new/used listings, take camera photos, receive buyer inquiries, manage own inventory. |
| **Customer** | Buyer | Browse, filter, search, view contact numbers, submit inquiries and orders. |

---

## 5. Admin Authentication Details

- **Admin Account 1**: `mikiaelebrhane21@gmail.com`
- **Admin Account 2**: `mikiaelebrhane@gmail.com`
- **Admin Password**: `0904503245@m` (or `0904503245@miki`)
- **Admin Access**:
  - Automatically launches upon signing in through the Auth modal.
  - Quick-access **Admin Dashboard** button in the header bar.
  - Dropdown access via user avatar menu.
  - Protected API routes reject non-administrators with HTTP 403.

---

## 6. How to Switch or Roll Back Between Databases

If you ever wish to toggle between `mela_market_v2` and `neondb`:
1. In the **Admin Dashboard** under the **Database (Neon)** tab, you can view the active database and run test pings.
2. In the `.env` file, change `DATABASE_URL` to point to `neondb` or `mela_market_v2`.
3. The old database `neondb` has **not** been dropped or altered.

---

## 7. Migration Scripts

To re-run migrations or update schemas in the future:
```bash
npm run migrate
# or
node -r dotenv/config ./node_modules/.bin/tsx database/migrate.ts
```
