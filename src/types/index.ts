export type Language = 'am' | 'en' | 'ti';
export type UserRole = 'admin' | 'seller' | 'customer' | 'user';

export interface User {
  id: string;
  email: string;
  fullName: string;
  phone: string;
  profilePhoto: string;
  role: UserRole;
  businessName?: string;
  isVerified?: boolean;
  createdAt: string;
}

export interface Product {
  id: string;
  userId: string;
  title: string;
  description: string;
  category: string;
  condition: 'new' | 'used';
  price: number;
  currency: string;
  stockQuantity?: number;
  photoUrl: string;
  additionalPhotos?: string[];
  region: string;
  district: string;
  city: string;
  sellerContact: string;
  sellerName?: string;
  sellerPhoto?: string;
  status: 'active' | 'sold' | 'hidden';
  createdAt: string;
}

export interface Category {
  id: string;
  slug: string;
  nameEn: string;
  nameAm: string;
  nameTi: string;
  icon: string;
  displayOrder: number;
}

export interface Inquiry {
  id: string;
  productId: string;
  productTitle?: string;
  buyerName: string;
  buyerEmail: string;
  buyerPhone: string;
  message: string;
  status: 'pending' | 'responded' | 'closed';
  createdAt: string;
}

export interface Report {
  id: string;
  productId: string;
  productTitle?: string;
  reporterEmail: string;
  reason: string;
  status: 'pending' | 'reviewed';
  createdAt: string;
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
