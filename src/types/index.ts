export type Language = 'am' | 'en' | 'ti';
export type UserRole = 'admin' | 'seller' | 'customer' | 'user';

export interface User {
  id: string;
  email: string;
  fullName: string;
  full_name?: string;
  phone: string;
  profilePhoto: string;
  profile_photo?: string;
  role: UserRole;
  businessName?: string;
  business_name?: string;
  isVerified?: boolean;
  is_verified?: boolean;
  status?: 'active' | 'suspended';
  canPublish?: boolean;
  can_publish?: boolean;
  sellerStatus?: 'approved' | 'pending' | 'rejected' | 'suspended';
  seller_status?: 'approved' | 'pending' | 'rejected' | 'suspended';
  createdAt: string;
  created_at?: string;
}

export interface Product {
  id: string;
  userId: string;
  user_id?: string;
  title: string;
  description: string;
  category: string;
  condition: 'new' | 'used';
  price: number;
  currency: string;
  stockQuantity?: number;
  stock_quantity?: number;
  photoUrl: string;
  photo_url?: string;
  additionalPhotos?: string[];
  region: string;
  district: string;
  city: string;
  sellerContact: string;
  seller_contact?: string;
  sellerName?: string;
  seller_name?: string;
  sellerPhoto?: string;
  seller_photo?: string;
  status: 'active' | 'sold' | 'hidden' | 'draft' | 'pending' | 'rejected' | 'approved';
  featured?: boolean;
  viewsCount?: number;
  compatibleBrands?: string[];
  compatible_brands?: string[];
  compatibleModels?: string[];
  compatible_models?: string[];
  createdAt: string;
  created_at?: string;
}

export interface Category {
  id: string;
  slug: string;
  nameEn: string;
  name_en?: string;
  nameAm: string;
  name_am?: string;
  nameTi: string;
  name_ti?: string;
  icon: string;
  description?: string;
  displayOrder: number;
  display_order?: number;
}

export interface Inquiry {
  id: string;
  productId: string;
  product_id?: string;
  productTitle?: string;
  buyerName: string;
  buyer_name?: string;
  buyerEmail: string;
  buyer_email?: string;
  buyerPhone: string;
  buyer_phone?: string;
  message: string;
  status: 'pending' | 'responded' | 'closed';
  createdAt: string;
  created_at?: string;
}

export interface Report {
  id: string;
  productId: string;
  product_id?: string;
  productTitle?: string;
  reporterEmail: string;
  reporter_email?: string;
  reason: string;
  status: 'pending' | 'reviewed';
  createdAt: string;
  created_at?: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id?: string;
  seller_id?: string;
  title: string;
  quantity: number;
  unit_price: number;
  total_price: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  order_number?: string;
  buyerId?: string;
  buyer_id?: string;
  buyerName: string;
  buyer_name?: string;
  buyerEmail: string;
  buyer_email?: string;
  buyerPhone: string;
  buyer_phone?: string;
  totalAmount: number;
  total_amount?: number;
  currency: string;
  status: 'pending' | 'confirmed' | 'processing' | 'completed' | 'cancelled';
  paymentStatus: 'unpaid' | 'paid' | 'refunded';
  payment_status?: 'unpaid' | 'paid' | 'refunded';
  shippingAddress?: string;
  shipping_address?: string;
  shippingCity?: string;
  shipping_city?: string;
  shippingRegion?: string;
  shipping_region?: string;
  notes?: string;
  createdAt: string;
  created_at?: string;
  items?: OrderItem[];
}

export interface Payment {
  id: string;
  orderId: string;
  order_id?: string;
  userId?: string;
  user_id?: string;
  paymentMethod: string;
  payment_method?: string;
  amount: number;
  currency: string;
  status: 'pending' | 'successful' | 'failed' | 'refunded';
  transactionRef?: string;
  transaction_ref?: string;
  createdAt: string;
  created_at?: string;
}

export interface AuditLog {
  id: string;
  adminId: string;
  admin_id?: string;
  adminEmail?: string;
  admin_email?: string;
  adminName?: string;
  admin_name?: string;
  action: string;
  entityType: string;
  entity_type?: string;
  entityId?: string;
  entity_id?: string;
  details?: any;
  createdAt: string;
  created_at?: string;
}

export interface SiteBanner {
  id: string;
  title: string;
  subtitle: string;
  image_url: string;
  link: string;
  active: boolean;
}

export interface SiteAnnouncement {
  id: string;
  title: string;
  content: string;
  type: 'info' | 'warning' | 'alert';
  active: boolean;
  created_at: string;
}

export interface SiteContactInfo {
  email: string;
  phone: string;
  telegram?: string;
  address?: string;
  working_hours?: string;
}

export interface SiteSettings {
  banners?: SiteBanner[];
  announcements?: SiteAnnouncement[];
  contact_info?: SiteContactInfo;
  featured_products?: string[];
}

export interface DatabaseStatus {
  connected: boolean;
  engine: string;
  message: string;
  activeDatabase?: string;
  preservedDatabase?: string;
  tablesVerified: boolean;
  latencyMs?: number;
  tableCounts?: {
    users: number;
    products: number;
    categories?: number;
    orders?: number;
    payments?: number;
    inquiries: number;
    reports: number;
  };
  neonConfigured: boolean;
}
