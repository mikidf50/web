export type Language = 'am' | 'en' | 'ti';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'user' | 'seller' | 'admin';
  region?: string;
  woreda?: string;
  city?: string;
  avatar_url?: string;
  bio?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  slug: string;
  name_am: string;
  name_en: string;
  name_ti: string;
  icon: string;
  sort_order: number;
}

export interface Product {
  id: string;
  seller_id: string;
  title: string;
  description: string;
  price: number;
  currency: string;
  category_id: string;
  condition: 'new' | 'used';
  location: string;
  photo_data?: string | null;
  status: 'active' | 'pending' | 'rejected' | 'sold' | 'deleted';
  views_count: number;
  created_at: string;
  updated_at: string;
  seller_name?: string;
  seller_phone?: string;
  seller_email?: string;
  category_name_am?: string;
  category_name_en?: string;
  category_name_ti?: string;
}

export interface Inquiry {
  id: string;
  product_id: string;
  seller_id: string;
  buyer_id?: string | null;
  buyer_name: string;
  buyer_email: string;
  buyer_phone: string;
  buyer_location?: string | null;
  message: string;
  status: 'new' | 'read' | 'replied' | 'closed';
  created_at: string;
  updated_at: string;
  product_title?: string;
  product_price?: number;
}

export interface DbStatus {
  type: 'neon-postgresql' | 'local-persistent';
  connected: boolean;
  message: string;
  databaseUrlSet: boolean;
  directUrlSet: boolean;
  poolActive: boolean;
  latencyMs?: number;
  serverVersion?: string;
  tableStats: {
    users: number;
    products: number;
    inquiries: number;
    categories: number;
  };
}
