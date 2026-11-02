import { ProductLocation } from './data/locations';

export type Language = 'en' | 'am' | 'ti';

export interface Product {
  id: string;
  titleEn: string;
  titleAm: string;
  titleTi: string;
  category: string;
  categoryAm: string;
  categoryTi: string;
  price: number;
  originalPrice?: number;
  location: string;
  locationAm: string;
  locationTi: string;
  locationDetails?: ProductLocation;
  condition: 'Brand New' | 'Like New' | 'Gently Used';
  conditionAm: string;
  conditionTi: string;
  sellerName: string;
  sellerPhone: string;
  sellerId?: string;
  isVerified: boolean;
  rating: number;
  reviewsCount: number;
  descriptionEn: string;
  descriptionAm: string;
  descriptionTi: string;
  featuresEn: string[];
  featuresAm: string[];
  featuresTi: string[];
  inStock: boolean;
  dateListed: string;
  imageUrl: string;
  images?: string[];
  iconName: string;
}

export interface Review {
  id: string;
  productId: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  date: string;
  isVerifiedPurchase: boolean;
  orderId?: string;
}

export interface Order {
  id: string;
  userId: string;
  userName: string;
  userPhone: string;
  items: { productId: string; quantity: number; price: number }[];
  total: number;
  status: 'pending' | 'delivered' | 'completed' | 'cancelled';
  createdAt: string;
}

export interface Category {
  id: string;
  nameEn: string;
  nameAm: string;
  nameTi: string;
  icon: string;
  count: number;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface User {
  id: string;
  name: string;
  phone: string;
  email: string;
  role: 'user' | 'seller' | 'admin';
}
