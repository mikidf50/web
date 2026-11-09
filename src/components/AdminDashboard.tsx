import React, { useState, useEffect, useCallback } from 'react';
import {
  X,
  Database,
  ShieldCheck,
  Package,
  Users,
  MessageSquare,
  AlertTriangle,
  RefreshCw,
  Trash2,
  CheckCircle,
  XCircle,
  Clock,
  ExternalLink,
  LayoutDashboard,
  Store,
  ShoppingBag,
  Globe,
  FileText,
  Search,
  Plus,
  Edit2,
  Star,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  DollarSign,
  Tag,
  Check,
  Megaphone,
  Phone,
  Mail,
  Sliders,
  Filter,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { DatabaseStatus, UserRole } from '../types';

interface AdminStats {
  totalUsers: number;
  totalSellers: number;
  totalCustomers: number;
  totalProducts: number;
  activeProducts: number;
  totalOrders: number;
  totalRevenue: number;
  inquiriesCount: number;
  reportsCount: number;
}

interface AdminUser {
  id: string;
  email: string;
  fullName?: string;
  full_name?: string;
  phone: string;
  role: string;
  businessName?: string;
  business_name?: string;
  isVerified?: boolean;
  is_verified?: boolean;
  status?: 'active' | 'suspended';
  canPublish?: boolean;
  can_publish?: boolean;
  sellerStatus?: 'approved' | 'pending' | 'rejected' | 'suspended';
  seller_status?: 'approved' | 'pending' | 'rejected' | 'suspended';
  createdAt?: string;
  created_at?: string;
}

interface AdminProduct {
  id: string;
  userId: string;
  user_id?: string;
  title: string;
  description?: string;
  category: string;
  condition: string;
  price: number;
  currency: string;
  stockQuantity?: number;
  stock_quantity?: number;
  city: string;
  district?: string;
  region: string;
  photoUrl: string;
  photo_url?: string;
  status: string;
  featured?: boolean;
  sellerName?: string;
  seller_name?: string;
  sellerContact?: string;
  seller_contact?: string;
  createdAt?: string;
  created_at?: string;
}

interface AdminOrder {
  id: string;
  order_number: string;
  buyer_name: string;
  buyer_email: string;
  buyer_phone: string;
  total_amount: number;
  currency: string;
  status: string;
  payment_status: string;
  shipping_address?: string;
  shipping_city?: string;
  shipping_region?: string;
  notes?: string;
  created_at: string;
  items?: Array<{
    id: string;
    title: string;
    quantity: number;
    unit_price: number;
    total_price: number;
  }>;
}

interface AdminPayment {
  id: string;
  order_id: string;
  payment_method: string;
  amount: number;
  currency: string;
  status: string;
  transaction_ref?: string;
  created_at: string;
}

interface AdminAuditLog {
  id: string;
  admin_id: string;
  admin_email?: string;
  admin_name?: string;
  action: string;
  entity_type: string;
  entity_id?: string;
  details?: any;
  created_at: string;
}

interface AdminCategory {
  id: string;
  slug: string;
  name_en: string;
  name_am: string;
  name_ti: string;
  icon: string;
  description?: string;
  display_order?: number;
}

interface SiteSettingsState {
  banners?: Array<{
    id: string;
    title: string;
    subtitle: string;
    image_url: string;
    link: string;
    active: boolean;
  }>;
  announcements?: Array<{
    id: string;
    title: string;
    content: string;
    type: 'info' | 'warning' | 'alert';
    active: boolean;
    created_at?: string;
  }>;
  contact_info?: {
    email: string;
    phone: string;
    telegram?: string;
    address?: string;
    working_hours?: string;
  };
}

interface AdminData {
  dbStatus: DatabaseStatus;
  stats?: AdminStats;
  users: AdminUser[];
  products: AdminProduct[];
  categories?: AdminCategory[];
  orders?: AdminOrder[];
  payments?: AdminPayment[];
  inquiries: Array<{
    id: string;
    product_id: string;
    buyer_name: string;
    buyer_email: string;
    buyer_phone: string;
    message: string;
    status: string;
    created_at: string;
  }>;
  reports: Array<{
    id: string;
    product_id: string;
    reporter_email: string;
    reason: string;
    status: string;
    created_at: string;
  }>;
  auditLogs?: AdminAuditLog[];
  siteSettings?: SiteSettingsState;
}

type TabKey =
  | 'overview'
  | 'users'
  | 'sellers'
  | 'products'
  | 'orders'
  | 'website'
  | 'audit'
  | 'db'
  | 'inquiries'
  | 'reports';

export const AdminDashboard: React.FC = () => {
  const { user, token, isAdminModalOpen, closeAdminModal, t } = useAuth();

  const [activeTab, setActiveTab] = useState<TabKey>('overview');
  const [data, setData] = useState<AdminData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [actionMessage, setActionMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // DB Ping / Connect state
  const [isPingingDb, setIsPingingDb] = useState(false);
  const [pingResult, setPingResult] = useState<string | null>(null);
  const [neonInput, setNeonInput] = useState('');
  const [isConnectingNeon, setIsConnectingNeon] = useState(false);
  const [neonConnectResult, setNeonConnectResult] = useState<{ success: boolean; message: string; latencyMs?: number; version?: string } | null>(null);

  // User search/filter
  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState<'all' | 'admin' | 'seller' | 'customer'>('all');

  // Product search/filter
  const [productSearch, setProductSearch] = useState('');
  const [productStatusFilter, setProductStatusFilter] = useState<string>('all');

  // Modals inside Admin
  const [isCreateUserModalOpen, setIsCreateUserModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
  const [isCreateProductModalOpen, setIsCreateProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<AdminProduct | null>(null);
  const [cancellingOrder, setCancellingOrder] = useState<AdminOrder | null>(null);
  const [cancelReason, setCancelReason] = useState('');
  const [isNewBannerModalOpen, setIsNewBannerModalOpen] = useState(false);
  const [isNewAnnouncementModalOpen, setIsNewAnnouncementModalOpen] = useState(false);
  const [isNewCategoryModalOpen, setIsNewCategoryModalOpen] = useState(false);

  // Form states for creating / editing user
  const [userFormData, setUserFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    role: 'customer' as UserRole,
    businessName: '',
    status: 'active' as 'active' | 'suspended',
    canPublish: true,
  });

  // Form states for creating / editing product
  const [productFormData, setProductFormData] = useState({
    title: '',
    description: '',
    category: 'electronics',
    condition: 'new' as 'new' | 'used',
    price: '',
    currency: 'ETB',
    stockQuantity: '1',
    photoUrl: '',
    region: 'Addis Ababa',
    district: '',
    city: 'Addis Ababa',
    status: 'active',
    featured: false,
    sellerContact: '+251 91 123 4567',
  });

  // Category form state
  const [categoryFormData, setCategoryFormData] = useState({
    slug: '',
    nameEn: '',
    nameAm: '',
    nameTi: '',
    icon: 'Package',
    description: '',
    displayOrder: 1,
  });

  // Banner form state
  const [bannerFormData, setBannerFormData] = useState({
    title: '',
    subtitle: '',
    image_url: '',
    link: '#',
    active: true,
  });

  // Announcement form state
  const [announcementFormData, setAnnouncementFormData] = useState({
    title: '',
    content: '',
    type: 'info' as 'info' | 'warning' | 'alert',
    active: true,
  });

  // Contact info state
  const [contactFormData, setContactFormData] = useState({
    email: 'support@melamarket.et',
    phone: '+251 90 000 0000',
    telegram: '@brmiki21',
    address: 'Bole Medhanialem, Addis Ababa, Ethiopia',
    working_hours: 'Monday - Saturday: 8:00 AM - 8:00 PM (EAT)',
  });

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setActionMessage({ type, text });
    setTimeout(() => {
      setActionMessage(null);
    }, 4000);
  };

  const fetchAdminData = useCallback(async () => {
    if (!token) return;
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/overview', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const json = await res.json();
        setData(json);
        if (json.siteSettings?.contact_info) {
          setContactFormData(json.siteSettings.contact_info);
        }
      } else {
        const errJson = await res.json().catch(() => ({}));
        showToast(errJson.error || 'Failed to load Super Admin data', 'error');
      }
    } catch (err: any) {
      console.error('Failed to load admin data:', err);
      showToast('Network error loading admin data: ' + err.message, 'error');
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (isAdminModalOpen && user?.role === 'admin') {
      fetchAdminData();
    }
  }, [isAdminModalOpen, user?.role, fetchAdminData]);

  // Strictly protect: Never render if modal closed or not admin
  if (!isAdminModalOpen || user?.role !== 'admin') {
    return null;
  }

  // ---------------- USER ACTIONS ---------------- //
  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(userFormData),
      });
      const resJson = await res.json();
      if (res.ok) {
        showToast(`User ${userFormData.fullName} created successfully.`);
        setIsCreateUserModalOpen(false);
        setUserFormData({
          fullName: '',
          email: '',
          phone: '',
          password: '',
          role: 'customer',
          businessName: '',
          status: 'active',
          canPublish: true,
        });
        fetchAdminData();
      } else {
        showToast(resJson.error || 'Failed to create user', 'error');
      }
    } catch (err: any) {
      showToast('Error: ' + err.message, 'error');
    }
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    try {
      const res = await fetch(`/api/admin/users/${editingUser.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          fullName: editingUser.fullName || editingUser.full_name,
          phone: editingUser.phone,
          role: editingUser.role,
          businessName: editingUser.businessName || editingUser.business_name,
          status: editingUser.status,
          canPublish: editingUser.canPublish ?? editingUser.can_publish,
        }),
      });
      const resJson = await res.json();
      if (res.ok) {
        showToast('User updated successfully.');
        setEditingUser(null);
        fetchAdminData();
      } else {
        showToast(resJson.error || 'Failed to update user', 'error');
      }
    } catch (err: any) {
      showToast('Error: ' + err.message, 'error');
    }
  };

  const handleToggleUserStatus = async (targetUser: AdminUser) => {
    const newStatus = targetUser.status === 'suspended' ? 'active' : 'suspended';
    try {
      const res = await fetch(`/api/admin/users/${targetUser.id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });
      const resJson = await res.json();
      if (res.ok) {
        showToast(`User status set to ${newStatus}.`);
        fetchAdminData();
      } else {
        showToast(resJson.error || 'Failed to change user status', 'error');
      }
    } catch (err: any) {
      showToast('Error: ' + err.message, 'error');
    }
  };

  const handleChangeUserRole = async (userId: string, newRole: string) => {
    try {
      const res = await fetch(`/api/admin/users/${userId}/role`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ role: newRole }),
      });
      const resJson = await res.json();
      if (res.ok) {
        showToast(`User role changed to ${newRole}.`);
        fetchAdminData();
      } else {
        showToast(resJson.error || 'Failed to change role', 'error');
      }
    } catch (err: any) {
      showToast('Error: ' + err.message, 'error');
    }
  };

  const handleDeleteUser = async (id: string) => {
    if (!window.confirm('Are you sure you want to permanently delete this user account and their records?')) return;
    try {
      const res = await fetch(`/api/admin/users/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        showToast('User account deleted.');
        fetchAdminData();
      } else {
        const resJson = await res.json();
        showToast(resJson.error || 'Failed to delete user', 'error');
      }
    } catch (err: any) {
      showToast('Error: ' + err.message, 'error');
    }
  };

  // ---------------- SELLER ACTIONS ---------------- //
  const handleUpdateSellerStatus = async (sellerId: string, status: 'approved' | 'rejected' | 'suspended') => {
    try {
      const res = await fetch(`/api/admin/sellers/${sellerId}/approval`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });
      const resJson = await res.json();
      if (res.ok) {
        showToast(`Seller status updated to ${status}.`);
        fetchAdminData();
      } else {
        showToast(resJson.error || 'Failed to update seller', 'error');
      }
    } catch (err: any) {
      showToast('Error: ' + err.message, 'error');
    }
  };

  const handleTogglePublishingPermission = async (sellerId: string, current: boolean) => {
    try {
      const res = await fetch(`/api/admin/sellers/${sellerId}/permissions`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ canPublish: !current }),
      });
      const resJson = await res.json();
      if (res.ok) {
        showToast(`Publishing permission set to ${!current ? 'ENABLED' : 'DISABLED'}.`);
        fetchAdminData();
      } else {
        showToast(resJson.error || 'Failed to change publishing permission', 'error');
      }
    } catch (err: any) {
      showToast('Error: ' + err.message, 'error');
    }
  };

  // ---------------- PRODUCT ACTIONS ---------------- //
  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(productFormData),
      });
      const resJson = await res.json();
      if (res.ok) {
        showToast(`Product "${productFormData.title}" created successfully.`);
        setIsCreateProductModalOpen(false);
        setProductFormData({
          title: '',
          description: '',
          category: 'electronics',
          condition: 'new',
          price: '',
          currency: 'ETB',
          stockQuantity: '1',
          photoUrl: '',
          region: 'Addis Ababa',
          district: '',
          city: 'Addis Ababa',
          status: 'active',
          featured: false,
          sellerContact: '+251 91 123 4567',
        });
        fetchAdminData();
        window.dispatchEvent(new CustomEvent('mela:refreshProducts'));
      } else {
        showToast(resJson.error || 'Failed to create product', 'error');
      }
    } catch (err: any) {
      showToast('Error: ' + err.message, 'error');
    }
  };

  const handleUpdateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    try {
      const res = await fetch(`/api/admin/products/${editingProduct.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(editingProduct),
      });
      const resJson = await res.json();
      if (res.ok) {
        showToast('Product updated successfully.');
        setEditingProduct(null);
        fetchAdminData();
        window.dispatchEvent(new CustomEvent('mela:refreshProducts'));
      } else {
        showToast(resJson.error || 'Failed to update product', 'error');
      }
    } catch (err: any) {
      showToast('Error: ' + err.message, 'error');
    }
  };

  const handleUpdateProductStatus = async (productId: string, status: string) => {
    try {
      const res = await fetch(`/api/admin/products/${productId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });
      const resJson = await res.json();
      if (res.ok) {
        showToast(`Product status changed to ${status}.`);
        fetchAdminData();
        window.dispatchEvent(new CustomEvent('mela:refreshProducts'));
      } else {
        showToast(resJson.error || 'Failed to update status', 'error');
      }
    } catch (err: any) {
      showToast('Error: ' + err.message, 'error');
    }
  };

  const handleToggleProductFeatured = async (productId: string, currentFeatured: boolean) => {
    try {
      const res = await fetch(`/api/admin/products/${productId}/featured`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ featured: !currentFeatured }),
      });
      const resJson = await res.json();
      if (res.ok) {
        showToast(`Product ${!currentFeatured ? 'marked as Featured' : 'unfeatured'}.`);
        fetchAdminData();
        window.dispatchEvent(new CustomEvent('mela:refreshProducts'));
      } else {
        showToast(resJson.error || 'Failed to toggle featured', 'error');
      }
    } catch (err: any) {
      showToast('Error: ' + err.message, 'error');
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this listing?')) return;
    try {
      const res = await fetch(`/api/products/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        showToast('Product deleted.');
        fetchAdminData();
        window.dispatchEvent(new CustomEvent('mela:refreshProducts'));
      } else {
        const resJson = await res.json();
        showToast(resJson.error || 'Failed to delete listing', 'error');
      }
    } catch (err: any) {
      showToast('Error: ' + err.message, 'error');
    }
  };

  // ---------------- ORDER ACTIONS ---------------- //
  const handleUpdateOrderStatus = async (orderId: string, status: string, paymentStatus?: string) => {
    try {
      const res = await fetch(`/api/admin/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status, paymentStatus }),
      });
      const resJson = await res.json();
      if (res.ok) {
        showToast(`Order status updated to ${status}.`);
        fetchAdminData();
      } else {
        showToast(resJson.error || 'Failed to update order', 'error');
      }
    } catch (err: any) {
      showToast('Error: ' + err.message, 'error');
    }
  };

  const handleCancelOrderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cancellingOrder) return;
    try {
      const res = await fetch(`/api/admin/orders/${cancellingOrder.id}/cancel`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ reason: cancelReason }),
      });
      const resJson = await res.json();
      if (res.ok) {
        showToast(`Order #${cancellingOrder.order_number} cancelled.`);
        setCancellingOrder(null);
        setCancelReason('');
        fetchAdminData();
      } else {
        showToast(resJson.error || 'Failed to cancel order', 'error');
      }
    } catch (err: any) {
      showToast('Error: ' + err.message, 'error');
    }
  };

  // ---------------- WEBSITE MANAGEMENT ACTIONS ---------------- //
  const handleSaveContactInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/settings/contact_info', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ value: contactFormData }),
      });
      const resJson = await res.json();
      if (res.ok) {
        showToast('Contact information & website content saved.');
        fetchAdminData();
      } else {
        showToast(resJson.error || 'Failed to save contact info', 'error');
      }
    } catch (err: any) {
      showToast('Error: ' + err.message, 'error');
    }
  };

  const handleAddBanner = async (e: React.FormEvent) => {
    e.preventDefault();
    const currentBanners = data?.siteSettings?.banners || [];
    const newBanner = {
      ...bannerFormData,
      id: 'banner_' + Date.now(),
    };
    try {
      const res = await fetch('/api/admin/settings/banners', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ value: [...currentBanners, newBanner] }),
      });
      if (res.ok) {
        showToast('Homepage banner added.');
        setIsNewBannerModalOpen(false);
        setBannerFormData({ title: '', subtitle: '', image_url: '', link: '#', active: true });
        fetchAdminData();
      }
    } catch (err: any) {
      showToast('Error: ' + err.message, 'error');
    }
  };

  const handleDeleteBanner = async (bannerId: string) => {
    const currentBanners = data?.siteSettings?.banners || [];
    const filtered = currentBanners.filter(b => b.id !== bannerId);
    try {
      const res = await fetch('/api/admin/settings/banners', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ value: filtered }),
      });
      if (res.ok) {
        showToast('Banner removed.');
        fetchAdminData();
      }
    } catch (err: any) {
      showToast('Error: ' + err.message, 'error');
    }
  };

  const handleAddAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    const current = data?.siteSettings?.announcements || [];
    const newAnn = {
      ...announcementFormData,
      id: 'ann_' + Date.now(),
      created_at: new Date().toISOString(),
    };
    try {
      const res = await fetch('/api/admin/settings/announcements', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ value: [newAnn, ...current] }),
      });
      if (res.ok) {
        showToast('Announcement published.');
        setIsNewAnnouncementModalOpen(false);
        setAnnouncementFormData({ title: '', content: '', type: 'info', active: true });
        fetchAdminData();
      }
    } catch (err: any) {
      showToast('Error: ' + err.message, 'error');
    }
  };

  const handleDeleteAnnouncement = async (annId: string) => {
    const current = data?.siteSettings?.announcements || [];
    const filtered = current.filter(a => a.id !== annId);
    try {
      const res = await fetch('/api/admin/settings/announcements', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ value: filtered }),
      });
      if (res.ok) {
        showToast('Announcement removed.');
        fetchAdminData();
      }
    } catch (err: any) {
      showToast('Error: ' + err.message, 'error');
    }
  };

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(categoryFormData),
      });
      const resJson = await res.json();
      if (res.ok) {
        showToast(`Category "${categoryFormData.nameEn}" added.`);
        setIsNewCategoryModalOpen(false);
        setCategoryFormData({
          slug: '',
          nameEn: '',
          nameAm: '',
          nameTi: '',
          icon: 'Package',
          description: '',
          displayOrder: 1,
        });
        fetchAdminData();
      } else {
        showToast(resJson.error || 'Failed to add category', 'error');
      }
    } catch (err: any) {
      showToast('Error: ' + err.message, 'error');
    }
  };

  const handleDeleteCategory = async (catId: string) => {
    if (!window.confirm('Are you sure you want to delete this category?')) return;
    try {
      const res = await fetch(`/api/admin/categories/${catId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        showToast('Category deleted.');
        fetchAdminData();
      } else {
        const resJson = await res.json();
        showToast(resJson.error || 'Failed to delete category', 'error');
      }
    } catch (err: any) {
      showToast('Error: ' + err.message, 'error');
    }
  };

  // ---------------- DB TESTS ---------------- //
  const handleTestDbPing = async () => {
    setIsPingingDb(true);
    setPingResult(null);
    try {
      const res = await fetch('/api/admin/db-test', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      const resJson = await res.json();
      setPingResult(resJson.message);
      if (resJson.status) {
        setData(prev => (prev ? { ...prev, dbStatus: resJson.status } : null));
      }
    } catch (err: any) {
      setPingResult('DB Ping Failed: ' + err.message);
    } finally {
      setIsPingingDb(false);
    }
  };

  const handleConnectNeon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!neonInput.trim()) return;

    setIsConnectingNeon(true);
    setNeonConnectResult(null);

    try {
      const res = await fetch('/api/admin/neon-connect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ connectionString: neonInput.trim() }),
      });

      const resJson = await res.json();
      setNeonConnectResult(resJson);

      if (resJson.success) {
        fetchAdminData();
        setNeonInput('');
        showToast('Neon PostgreSQL connection successfully verified and saved.');
      }
    } catch (err: any) {
      setNeonConnectResult({
        success: false,
        message: 'Neon connection request failed: ' + err.message,
      });
    } finally {
      setIsConnectingNeon(false);
    }
  };

  const dbStatus = data?.dbStatus;
  const stats = data?.stats || {
    totalUsers: data?.users.length || 0,
    totalSellers: data?.users.filter(u => u.role === 'seller').length || 0,
    totalCustomers: data?.users.filter(u => u.role !== 'admin' && u.role !== 'seller').length || 0,
    totalProducts: data?.products.length || 0,
    activeProducts: data?.products.filter(p => p.status === 'active' || p.status === 'approved').length || 0,
    totalOrders: data?.orders?.length || 0,
    totalRevenue: (data?.orders || []).reduce((s, o) => s + Number(o.total_amount || 0), 0),
    inquiriesCount: data?.inquiries.length || 0,
    reportsCount: data?.reports.length || 0,
  };

  // Filtered lists
  const filteredUsers = (data?.users || []).filter(u => {
    const matchSearch =
      (u.fullName || u.full_name || '').toLowerCase().includes(userSearch.toLowerCase()) ||
      u.email.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.phone.includes(userSearch);
    const matchRole = userRoleFilter === 'all' || u.role === userRoleFilter;
    return matchSearch && matchRole;
  });

  const sellersList = (data?.users || []).filter(u => u.role === 'seller');

  const filteredProducts = (data?.products || []).filter(p => {
    const matchSearch =
      p.title.toLowerCase().includes(productSearch.toLowerCase()) ||
      (p.description || '').toLowerCase().includes(productSearch.toLowerCase()) ||
      p.city.toLowerCase().includes(productSearch.toLowerCase());
    const matchStatus = productStatusFilter === 'all' || p.status === productStatusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-xs p-2 sm:p-4 overflow-y-auto">
      <div className="relative w-full max-w-6xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200 my-4 flex flex-col max-h-[92vh]">
        {/* Top Header */}
        <div className="px-5 py-3.5 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-emerald-600/30 text-emerald-400 border border-emerald-500/30">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm sm:text-base font-bold flex items-center gap-2">
                  <span>Mela Market Super Admin Control</span>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                    Full Authority
                  </span>
                </h2>
              </div>
              <p className="text-[11px] text-slate-400">
                Logged in: {user.fullName || (user as any).full_name || user.email} ({user.email}) · Owner WhatsApp: @brmiki21
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchAdminData}
              disabled={isLoading}
              title="Refresh all marketplace data"
              className="p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={closeAdminModal}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Action Toast */}
        {actionMessage && (
          <div
            className={`px-4 py-2.5 text-xs font-semibold flex items-center justify-between border-b ${
              actionMessage.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                : 'bg-red-50 text-red-800 border-red-200'
            }`}
          >
            <div className="flex items-center gap-2">
              {actionMessage.type === 'success' ? (
                <CheckCircle className="w-4 h-4 text-emerald-600" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-red-600" />
              )}
              <span>{actionMessage.text}</span>
            </div>
            <button onClick={() => setActionMessage(null)} className="cursor-pointer">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 px-4 bg-slate-50 border-b border-slate-200 overflow-x-auto text-xs font-semibold text-slate-600">
          <button
            type="button"
            onClick={() => setActiveTab('overview')}
            className={`px-3.5 py-2.5 border-b-2 flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'overview'
                ? 'border-emerald-600 text-emerald-700 bg-white font-bold'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            <span>Dashboard</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('users')}
            className={`px-3.5 py-2.5 border-b-2 flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'users'
                ? 'border-emerald-600 text-emerald-700 bg-white font-bold'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Users ({data?.users?.length || 0})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('sellers')}
            className={`px-3.5 py-2.5 border-b-2 flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'sellers'
                ? 'border-emerald-600 text-emerald-700 bg-white font-bold'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            <Store className="w-3.5 h-3.5" />
            <span>Sellers ({sellersList.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('products')}
            className={`px-3.5 py-2.5 border-b-2 flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'products'
                ? 'border-emerald-600 text-emerald-700 bg-white font-bold'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            <Package className="w-3.5 h-3.5" />
            <span>Products ({data?.products?.length || 0})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('orders')}
            className={`px-3.5 py-2.5 border-b-2 flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'orders'
                ? 'border-emerald-600 text-emerald-700 bg-white font-bold'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Orders ({data?.orders?.length || 0})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('website')}
            className={`px-3.5 py-2.5 border-b-2 flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'website'
                ? 'border-emerald-600 text-emerald-700 bg-white font-bold'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>Website Management</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('audit')}
            className={`px-3.5 py-2.5 border-b-2 flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'audit'
                ? 'border-emerald-600 text-emerald-700 bg-white font-bold'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Audit Logs ({data?.auditLogs?.length || 0})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('inquiries')}
            className={`px-3.5 py-2.5 border-b-2 flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'inquiries'
                ? 'border-emerald-600 text-emerald-700 bg-white font-bold'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Inquiries ({data?.inquiries?.length || 0})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('reports')}
            className={`px-3.5 py-2.5 border-b-2 flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'reports'
                ? 'border-emerald-600 text-emerald-700 bg-white font-bold'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Reports ({data?.reports?.length || 0})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('db')}
            className={`px-3.5 py-2.5 border-b-2 flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'db'
                ? 'border-emerald-600 text-emerald-700 bg-white font-bold'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>Neon DB</span>
          </button>
        </div>

        {/* Tab Body */}
        <div className="p-4 sm:p-6 flex-1 overflow-y-auto bg-slate-50/50">
          {isLoading && !data ? (
            <div className="p-12 text-center text-slate-500 flex flex-col items-center justify-center">
              <RefreshCw className="w-6 h-6 animate-spin text-emerald-600 mb-2" />
              <p className="text-sm">Loading Super Admin console...</p>
            </div>
          ) : (
            <>
              {/* TAB: OVERVIEW / DASHBOARD */}
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  {/* Top Stats Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                    <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs">
                      <span className="text-[10px] font-semibold text-slate-400 block uppercase">Total Users</span>
                      <span className="text-xl font-extrabold text-slate-900 tabular-nums">
                        {stats.totalUsers}
                      </span>
                      <span className="text-[10px] text-slate-500 block mt-0.5">
                        {stats.totalSellers} sellers · {stats.totalCustomers} customers
                      </span>
                    </div>

                    <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs">
                      <span className="text-[10px] font-semibold text-slate-400 block uppercase">Total Products</span>
                      <span className="text-xl font-extrabold text-slate-900 tabular-nums">
                        {stats.totalProducts}
                      </span>
                      <span className="text-[10px] text-emerald-600 font-semibold block mt-0.5">
                        {stats.activeProducts} active listings
                      </span>
                    </div>

                    <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs">
                      <span className="text-[10px] font-semibold text-slate-400 block uppercase">Total Orders</span>
                      <span className="text-xl font-extrabold text-slate-900 tabular-nums">
                        {stats.totalOrders}
                      </span>
                      <span className="text-[10px] text-slate-500 block mt-0.5">
                        {(data?.orders || []).filter(o => o.status === 'completed').length} completed
                      </span>
                    </div>

                    <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs">
                      <span className="text-[10px] font-semibold text-slate-400 block uppercase">Total Revenue</span>
                      <span className="text-xl font-extrabold text-emerald-700 tabular-nums">
                        {stats.totalRevenue.toLocaleString()} <span className="text-xs">ETB</span>
                      </span>
                      <span className="text-[10px] text-slate-500 block mt-0.5">
                        Across all confirmed orders
                      </span>
                    </div>

                    <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs">
                      <span className="text-[10px] font-semibold text-slate-400 block uppercase">Inquiries</span>
                      <span className="text-xl font-extrabold text-slate-900 tabular-nums">
                        {stats.inquiriesCount}
                      </span>
                      <span className="text-[10px] text-slate-500 block mt-0.5">
                        Direct buyer questions
                      </span>
                    </div>

                    <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs">
                      <span className="text-[10px] font-semibold text-slate-400 block uppercase">User Reports</span>
                      <span className="text-xl font-extrabold text-amber-600 tabular-nums">
                        {stats.reportsCount}
                      </span>
                      <span className="text-[10px] text-slate-500 block mt-0.5">
                        Content moderation flags
                      </span>
                    </div>
                  </div>

                  {/* Super Admin Quick Actions */}
                  <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
                      Super Admin Quick Actions
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                      <button
                        onClick={() => setIsCreateUserModalOpen(true)}
                        className="p-3 rounded-xl border border-slate-200 hover:border-emerald-600 hover:bg-emerald-50/50 transition-colors text-left flex items-center gap-2.5 cursor-pointer"
                      >
                        <div className="p-2 rounded-lg bg-emerald-100 text-emerald-700">
                          <Users className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-900">+ Create User</p>
                          <p className="text-[10px] text-slate-500">Admin/Seller/Buyer</p>
                        </div>
                      </button>

                      <button
                        onClick={() => setIsCreateProductModalOpen(true)}
                        className="p-3 rounded-xl border border-slate-200 hover:border-emerald-600 hover:bg-emerald-50/50 transition-colors text-left flex items-center gap-2.5 cursor-pointer"
                      >
                        <div className="p-2 rounded-lg bg-blue-100 text-blue-700">
                          <Package className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-900">+ Add Product</p>
                          <p className="text-[10px] text-slate-500">New or Used Listing</p>
                        </div>
                      </button>

                      <button
                        onClick={() => {
                          setActiveTab('website');
                          setIsNewAnnouncementModalOpen(true);
                        }}
                        className="p-3 rounded-xl border border-slate-200 hover:border-emerald-600 hover:bg-emerald-50/50 transition-colors text-left flex items-center gap-2.5 cursor-pointer"
                      >
                        <div className="p-2 rounded-lg bg-amber-100 text-amber-700">
                          <Megaphone className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-900">+ Announcement</p>
                          <p className="text-[10px] text-slate-500">Broadcast banner</p>
                        </div>
                      </button>

                      <button
                        onClick={() => setActiveTab('db')}
                        className="p-3 rounded-xl border border-slate-200 hover:border-emerald-600 hover:bg-emerald-50/50 transition-colors text-left flex items-center gap-2.5 cursor-pointer"
                      >
                        <div className="p-2 rounded-lg bg-purple-100 text-purple-700">
                          <Database className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-900">Database Engine</p>
                          <p className="text-[10px] text-slate-500">Neon v2 & Rollback DB</p>
                        </div>
                      </button>
                    </div>
                  </div>

                  {/* Recent Activity & System Status */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {/* Recent Audit Logs */}
                    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                          <FileText className="w-4 h-4 text-emerald-600" />
                          <span>Recent Super Admin Actions</span>
                        </h4>
                        <button
                          onClick={() => setActiveTab('audit')}
                          className="text-[11px] text-emerald-600 hover:underline font-semibold cursor-pointer"
                        >
                          View all logs →
                        </button>
                      </div>

                      <div className="space-y-2">
                        {(data?.auditLogs || []).slice(0, 5).map(log => (
                          <div key={log.id} className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs flex items-center justify-between">
                            <div>
                              <span className="font-bold text-slate-900 mr-2">{log.action}</span>
                              <span className="text-[11px] text-slate-500">({log.entity_type} {log.entity_id})</span>
                            </div>
                            <span className="text-[10px] text-slate-400">
                              {new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        ))}
                        {(!data?.auditLogs || data.auditLogs.length === 0) && (
                          <p className="text-xs text-slate-400 py-4 text-center">No audit logs recorded yet.</p>
                        )}
                      </div>
                    </div>

                    {/* Database & Security Status */}
                    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
                      <div>
                        <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5 mb-3">
                          <ShieldCheck className="w-4 h-4 text-emerald-600" />
                          <span>Platform Security & Storage</span>
                        </h4>

                        <div className="space-y-2 text-xs">
                          <div className="flex items-center justify-between p-2.5 rounded-xl bg-emerald-50/70 border border-emerald-100">
                            <span className="text-emerald-950 font-semibold">Neon PostgreSQL Connected:</span>
                            <span className="font-bold text-emerald-700">
                              {dbStatus?.connected ? '✓ Active (mela_market_v2)' : 'Connecting...'}
                            </span>
                          </div>

                          <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                            <span className="text-slate-700">Previous Database (Preserved):</span>
                            <span className="font-mono text-slate-900 font-bold">neondb (Untouched)</span>
                          </div>

                          <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                            <span className="text-slate-700">Backend RBAC Security:</span>
                            <span className="font-bold text-emerald-700">ENFORCED (requireAdmin)</span>
                          </div>

                          <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                            <span className="text-slate-700">Owner WhatsApp Support:</span>
                            <span className="font-mono text-slate-900 font-bold">@brmiki21</span>
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                        <span className="text-[11px] text-slate-400">All data stored permanently in Neon.</span>
                        <button
                          onClick={handleTestDbPing}
                          disabled={isPingingDb}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[11px] font-semibold transition-colors flex items-center gap-1 cursor-pointer"
                        >
                          <RefreshCw className={`w-3 h-3 ${isPingingDb ? 'animate-spin' : ''}`} />
                          <span>Test DB Ping</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB: USER MANAGEMENT */}
              {activeTab === 'users' && (
                <div className="space-y-4">
                  {/* Toolbar */}
                  <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
                    <div className="flex items-center gap-2 w-full sm:w-auto flex-1">
                      <div className="relative flex-1 max-w-sm">
                        <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                          type="text"
                          value={userSearch}
                          onChange={(e) => setUserSearch(e.target.value)}
                          placeholder="Search users by name, email, phone..."
                          className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-emerald-500"
                        />
                      </div>

                      <select
                        value={userRoleFilter}
                        onChange={(e) => setUserRoleFilter(e.target.value as any)}
                        className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-emerald-500 cursor-pointer"
                      >
                        <option value="all">All Roles</option>
                        <option value="admin">Super Admin</option>
                        <option value="seller">Sellers</option>
                        <option value="customer">Customers</option>
                      </select>
                    </div>

                    <button
                      onClick={() => setIsCreateUserModalOpen(true)}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs whitespace-nowrap"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Create User</span>
                    </button>
                  </div>

                  {/* Users Table */}
                  <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                          <tr>
                            <th className="p-3">User & Contact</th>
                            <th className="p-3">Role</th>
                            <th className="p-3">Account Status</th>
                            <th className="p-3">Seller Rights</th>
                            <th className="p-3">Registered</th>
                            <th className="p-3 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {filteredUsers.map((u) => {
                            const isSuspended = u.status === 'suspended';
                            const isSelf = u.id === user.id;

                            return (
                              <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                                <td className="p-3">
                                  <div className="font-bold text-slate-900">{u.fullName || u.full_name || 'No Name'}</div>
                                  <div className="text-[11px] text-slate-500">{u.email} · {u.phone}</div>
                                  {u.businessName && (
                                    <div className="text-[10px] text-emerald-700 font-semibold">Store: {u.businessName}</div>
                                  )}
                                </td>

                                <td className="p-3">
                                  <select
                                    value={u.role}
                                    disabled={isSelf}
                                    onChange={(e) => handleChangeUserRole(u.id, e.target.value)}
                                    className={`px-2 py-1 rounded-md text-[11px] font-bold border cursor-pointer ${
                                      u.role === 'admin'
                                        ? 'bg-purple-100 text-purple-800 border-purple-200'
                                        : u.role === 'seller'
                                        ? 'bg-blue-100 text-blue-800 border-blue-200'
                                        : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                    }`}
                                  >
                                    <option value="customer">CUSTOMER</option>
                                    <option value="seller">SELLER</option>
                                    <option value="admin">SUPER ADMIN</option>
                                  </select>
                                </td>

                                <td className="p-3">
                                  <button
                                    onClick={() => !isSelf && handleToggleUserStatus(u)}
                                    disabled={isSelf}
                                    className={`px-2.5 py-1 rounded-full text-[10px] font-bold flex items-center gap-1 cursor-pointer transition-colors ${
                                      isSuspended
                                        ? 'bg-red-100 text-red-800 hover:bg-red-200 border border-red-200'
                                        : 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200 border border-emerald-200'
                                    }`}
                                    title={isSelf ? 'Cannot suspend yourself' : 'Click to toggle active/suspended'}
                                  >
                                    {isSuspended ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
                                    <span>{isSuspended ? 'SUSPENDED' : 'ACTIVE'}</span>
                                  </button>
                                </td>

                                <td className="p-3">
                                  {u.role === 'seller' ? (
                                    <span
                                      className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                                        u.canPublish ?? u.can_publish !== false
                                          ? 'bg-emerald-100 text-emerald-800'
                                          : 'bg-red-100 text-red-800'
                                      }`}
                                    >
                                      {u.canPublish ?? u.can_publish !== false ? 'Can Publish' : 'Publishing Blocked'}
                                    </span>
                                  ) : (
                                    <span className="text-[11px] text-slate-400">—</span>
                                  )}
                                </td>

                                <td className="p-3 text-[11px] text-slate-400">
                                  {u.createdAt || u.created_at
                                    ? new Date(u.createdAt || u.created_at!).toLocaleDateString()
                                    : 'Recent'}
                                </td>

                                <td className="p-3 text-right">
                                  <div className="flex items-center justify-end gap-1">
                                    <button
                                      onClick={() => setEditingUser(u)}
                                      className="p-1.5 text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                                      title="Edit User"
                                    >
                                      <Edit2 className="w-3.5 h-3.5" />
                                    </button>

                                    {!isSelf && (
                                      <button
                                        onClick={() => handleDeleteUser(u.id)}
                                        className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                                        title="Delete User"
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </button>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB: SELLER MANAGEMENT */}
              {activeTab === 'sellers' && (
                <div className="space-y-4">
                  <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">Registered Marketplace Sellers</h3>
                      <p className="text-xs text-slate-500">
                        Approve, reject, suspend, and control listing publishing rights for merchants across Ethiopia.
                      </p>
                    </div>
                    <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-bold">
                      {sellersList.length} Sellers Total
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {sellersList.map((s) => {
                      const sellerProducts = (data?.products || []).filter(
                        p => p.userId === s.id || p.user_id === s.id
                      );
                      const currentStatus = s.sellerStatus || s.seller_status || 'approved';
                      const canPublish = s.canPublish ?? s.can_publish !== false;

                      return (
                        <div key={s.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
                          <div className="flex items-start justify-between">
                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className="font-bold text-slate-900 text-sm">
                                  {s.fullName || s.full_name}
                                </h4>
                                <span
                                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                    currentStatus === 'approved'
                                      ? 'bg-emerald-100 text-emerald-800'
                                      : currentStatus === 'pending'
                                      ? 'bg-amber-100 text-amber-800'
                                      : 'bg-red-100 text-red-800'
                                  }`}
                                >
                                  {currentStatus.toUpperCase()}
                                </span>
                              </div>
                              <p className="text-xs text-slate-500">{s.businessName || s.business_name || 'Individual Merchant'}</p>
                              <p className="text-xs text-slate-400 mt-1">{s.email} · {s.phone}</p>
                            </div>

                            <span className="text-xs font-bold px-2.5 py-1 rounded-xl bg-slate-100 text-slate-700">
                              {sellerProducts.length} Listings
                            </span>
                          </div>

                          {/* Controls */}
                          <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs">
                            <div className="flex items-center gap-1.5">
                              <span className="text-slate-500 font-semibold text-[11px]">Publishing:</span>
                              <button
                                onClick={() => handleTogglePublishingPermission(s.id, canPublish)}
                                className={`px-2.5 py-1 rounded-lg font-bold text-[10px] cursor-pointer transition-colors ${
                                  canPublish
                                    ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                                    : 'bg-red-100 text-red-800 hover:bg-red-200'
                                }`}
                              >
                                {canPublish ? '✓ Allowed to List' : '✕ Blocked from Listing'}
                              </button>
                            </div>

                            <div className="flex items-center gap-1">
                              {currentStatus !== 'approved' && (
                                <button
                                  onClick={() => handleUpdateSellerStatus(s.id, 'approved')}
                                  className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-[10px] cursor-pointer"
                                >
                                  Approve
                                </button>
                              )}
                              {currentStatus !== 'rejected' && (
                                <button
                                  onClick={() => handleUpdateSellerStatus(s.id, 'rejected')}
                                  className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg text-[10px] cursor-pointer"
                                >
                                  Reject
                                </button>
                              )}
                              {currentStatus !== 'suspended' && (
                                <button
                                  onClick={() => handleUpdateSellerStatus(s.id, 'suspended')}
                                  className="px-2.5 py-1 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg text-[10px] cursor-pointer"
                                >
                                  Suspend
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}

                    {sellersList.length === 0 && (
                      <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 text-slate-400 text-xs col-span-2">
                        No registered sellers yet.
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB: PRODUCT MANAGEMENT */}
              {activeTab === 'products' && (
                <div className="space-y-4">
                  {/* Toolbar */}
                  <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
                    <div className="flex items-center gap-2 w-full sm:w-auto flex-1">
                      <div className="relative flex-1 max-w-sm">
                        <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                          type="text"
                          value={productSearch}
                          onChange={(e) => setProductSearch(e.target.value)}
                          placeholder="Search products by title, city..."
                          className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-emerald-500"
                        />
                      </div>

                      <select
                        value={productStatusFilter}
                        onChange={(e) => setProductStatusFilter(e.target.value)}
                        className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-emerald-500 cursor-pointer"
                      >
                        <option value="all">All Statuses</option>
                        <option value="active">Active</option>
                        <option value="hidden">Hidden</option>
                        <option value="approved">Approved</option>
                        <option value="rejected">Rejected</option>
                        <option value="sold">Sold</option>
                      </select>
                    </div>

                    <button
                      onClick={() => setIsCreateProductModalOpen(true)}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs whitespace-nowrap"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add Product</span>
                    </button>
                  </div>

                  {/* Products Table */}
                  <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                          <tr>
                            <th className="p-3">Product</th>
                            <th className="p-3">Category</th>
                            <th className="p-3">Condition</th>
                            <th className="p-3">Price & Stock</th>
                            <th className="p-3">Status</th>
                            <th className="p-3">Featured</th>
                            <th className="p-3 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {filteredProducts.map((p, idx) => {
                            const isFeatured = Boolean(p.featured);

                            return (
                              <tr key={`${p.id}-${idx}`} className="hover:bg-slate-50/80 transition-colors">
                                <td className="p-3 font-semibold text-slate-900 flex items-center gap-2.5">
                                  <img
                                    src={
                                      (p.photoUrl && typeof p.photoUrl === 'string' && p.photoUrl.trim()) ||
                                      (p.photo_url && typeof p.photo_url === 'string' && p.photo_url.trim()) ||
                                      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=120&q=80'
                                    }
                                    alt={p.title}
                                    className="w-10 h-10 rounded-xl object-cover border border-slate-200"
                                    onError={(e) => {
                                      (e.target as HTMLImageElement).src =
                                        'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=120&q=80';
                                    }}
                                  />
                                  <div className="max-w-xs">
                                    <div className="truncate font-bold text-slate-900">{p.title}</div>
                                    <div className="text-[11px] text-slate-500">{p.city}, {p.region}</div>
                                  </div>
                                </td>

                                <td className="p-3 text-slate-600 capitalize">{p.category}</td>

                                <td className="p-3">
                                  <span
                                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                      p.condition === 'new'
                                        ? 'bg-emerald-100 text-emerald-800'
                                        : 'bg-slate-100 text-slate-800'
                                    }`}
                                  >
                                    {p.condition.toUpperCase()}
                                  </span>
                                </td>

                                <td className="p-3 font-bold text-slate-900 tabular-nums">
                                  <div>{p.price.toLocaleString()} {p.currency}</div>
                                  <div className="text-[10px] text-slate-400 font-normal">
                                    Stock: {p.stockQuantity ?? p.stock_quantity ?? 1}
                                  </div>
                                </td>

                                <td className="p-3">
                                  <select
                                    value={p.status}
                                    onChange={(e) => handleUpdateProductStatus(p.id, e.target.value)}
                                    className={`px-2 py-1 rounded-md text-[10px] font-bold border cursor-pointer ${
                                      p.status === 'active' || p.status === 'approved'
                                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                        : p.status === 'hidden'
                                        ? 'bg-slate-100 text-slate-700 border-slate-200'
                                        : p.status === 'sold'
                                        ? 'bg-purple-50 text-purple-800 border-purple-200'
                                        : 'bg-red-50 text-red-800 border-red-200'
                                    }`}
                                  >
                                    <option value="active">ACTIVE</option>
                                    <option value="hidden">HIDDEN</option>
                                    <option value="approved">APPROVED</option>
                                    <option value="rejected">REJECTED</option>
                                    <option value="sold">SOLD</option>
                                  </select>
                                </td>

                                <td className="p-3">
                                  <button
                                    onClick={() => handleToggleProductFeatured(p.id, isFeatured)}
                                    className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                                      isFeatured
                                        ? 'bg-amber-100 text-amber-800 border-amber-300'
                                        : 'bg-slate-50 text-slate-400 border-slate-200 hover:text-amber-600'
                                    }`}
                                    title={isFeatured ? 'Featured on homepage. Click to unfeature.' : 'Click to feature on homepage.'}
                                  >
                                    <Star className={`w-3.5 h-3.5 ${isFeatured ? 'fill-amber-500 text-amber-500' : ''}`} />
                                  </button>
                                </td>

                                <td className="p-3 text-right">
                                  <div className="flex items-center justify-end gap-1">
                                    <button
                                      onClick={() => setEditingProduct(p)}
                                      className="p-1.5 text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                                      title="Edit Product"
                                    >
                                      <Edit2 className="w-3.5 h-3.5" />
                                    </button>

                                    <button
                                      onClick={() => handleDeleteProduct(p.id)}
                                      className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                                      title="Delete Product"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB: ORDER MANAGEMENT */}
              {activeTab === 'orders' && (
                <div className="space-y-4">
                  <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">Marketplace Orders & Transactions</h3>
                      <p className="text-xs text-slate-500">
                        View orders, change order status, manage customer disputes, and inspect payments.
                      </p>
                    </div>
                    <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
                      {data?.orders?.length || 0} Total Orders
                    </span>
                  </div>

                  <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                          <tr>
                            <th className="p-3">Order Number</th>
                            <th className="p-3">Customer</th>
                            <th className="p-3">Amount</th>
                            <th className="p-3">Status</th>
                            <th className="p-3">Payment</th>
                            <th className="p-3">Date</th>
                            <th className="p-3 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {(data?.orders || []).map((o) => (
                            <tr key={o.id} className="hover:bg-slate-50/80 transition-colors">
                              <td className="p-3 font-mono font-bold text-slate-900">
                                {o.order_number}
                              </td>

                              <td className="p-3">
                                <div className="font-bold text-slate-900">{o.buyer_name}</div>
                                <div className="text-[11px] text-slate-500">{o.buyer_phone} · {o.shipping_city || 'Addis Ababa'}</div>
                              </td>

                              <td className="p-3 font-bold text-emerald-700 tabular-nums">
                                {Number(o.total_amount).toLocaleString()} {o.currency || 'ETB'}
                              </td>

                              <td className="p-3">
                                <select
                                  value={o.status}
                                  onChange={(e) => handleUpdateOrderStatus(o.id, e.target.value)}
                                  className="px-2 py-1 rounded-md text-[10px] font-bold border border-slate-200 bg-white cursor-pointer"
                                >
                                  <option value="pending">PENDING</option>
                                  <option value="confirmed">CONFIRMED</option>
                                  <option value="processing">PROCESSING</option>
                                  <option value="completed">COMPLETED</option>
                                  <option value="cancelled">CANCELLED</option>
                                </select>
                              </td>

                              <td className="p-3">
                                <span
                                  className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                    o.payment_status === 'paid'
                                      ? 'bg-emerald-100 text-emerald-800'
                                      : o.payment_status === 'refunded'
                                      ? 'bg-amber-100 text-amber-800'
                                      : 'bg-slate-100 text-slate-800'
                                  }`}
                                >
                                  {o.payment_status?.toUpperCase() || 'UNPAID'}
                                </span>
                              </td>

                              <td className="p-3 text-[11px] text-slate-400">
                                {new Date(o.created_at).toLocaleDateString()}
                              </td>

                              <td className="p-3 text-right">
                                {o.status !== 'cancelled' && (
                                  <button
                                    onClick={() => setCancellingOrder(o)}
                                    className="px-2.5 py-1 text-red-600 hover:bg-red-50 rounded-lg text-[10px] font-bold transition-colors cursor-pointer border border-red-200"
                                  >
                                    Cancel & Dispute
                                  </button>
                                )}
                              </td>
                            </tr>
                          ))}

                          {(!data?.orders || data.orders.length === 0) && (
                            <tr>
                              <td colSpan={7} className="p-8 text-center text-slate-400 text-xs">
                                No orders placed yet.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Payment Records Section */}
                  <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                    <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">
                      Payment Transaction History (Neon DB)
                    </h4>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                          <tr>
                            <th className="p-2.5">Reference</th>
                            <th className="p-2.5">Method</th>
                            <th className="p-2.5">Amount</th>
                            <th className="p-2.5">Status</th>
                            <th className="p-2.5">Timestamp</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {(data?.payments || []).map((pay) => (
                            <tr key={pay.id}>
                              <td className="p-2.5 font-mono text-[11px] text-slate-800">{pay.transaction_ref || pay.id}</td>
                              <td className="p-2.5 uppercase font-semibold text-slate-700">{pay.payment_method}</td>
                              <td className="p-2.5 font-bold text-emerald-700">{Number(pay.amount).toLocaleString()} {pay.currency}</td>
                              <td className="p-2.5">
                                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                                  {pay.status.toUpperCase()}
                                </span>
                              </td>
                              <td className="p-2.5 text-slate-400 text-[11px]">{new Date(pay.created_at).toLocaleString()}</td>
                            </tr>
                          ))}
                          {(!data?.payments || data.payments.length === 0) && (
                            <tr>
                              <td colSpan={5} className="p-4 text-center text-slate-400 text-xs">
                                No direct payments recorded yet.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB: WEBSITE MANAGEMENT */}
              {activeTab === 'website' && (
                <div className="space-y-6">
                  {/* Banners Section */}
                  <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-sm font-bold text-slate-900">Homepage Banners</h3>
                        <p className="text-xs text-slate-500">Manage promotional banners displayed to marketplace visitors.</p>
                      </div>
                      <button
                        onClick={() => setIsNewBannerModalOpen(true)}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add Banner</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {(data?.siteSettings?.banners || []).map((b) => (
                        <div key={b.id} className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between gap-3">
                          <div className="flex items-center gap-3">
                            {Boolean(b.image_url && b.image_url.trim()) && (
                              <img src={b.image_url.trim()} alt={b.title} className="w-12 h-12 rounded-lg object-cover" />
                            )}
                            <div>
                              <div className="font-bold text-slate-900 text-xs">{b.title}</div>
                              <div className="text-[11px] text-slate-500">{b.subtitle}</div>
                              <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${b.active ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'}`}>
                                {b.active ? 'ACTIVE' : 'INACTIVE'}
                              </span>
                            </div>
                          </div>
                          <button
                            onClick={() => handleDeleteBanner(b.id)}
                            className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Announcements Section */}
                  <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-sm font-bold text-slate-900">Marketplace Announcements</h3>
                        <p className="text-xs text-slate-500">Post system-wide alerts, holiday updates, or maintenance notes.</p>
                      </div>
                      <button
                        onClick={() => setIsNewAnnouncementModalOpen(true)}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add Announcement</span>
                      </button>
                    </div>

                    <div className="space-y-2">
                      {(data?.siteSettings?.announcements || []).map((a) => (
                        <div key={a.id} className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between gap-3">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-slate-900 text-xs">{a.title}</span>
                              <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase ${
                                a.type === 'alert' ? 'bg-red-100 text-red-800' : a.type === 'warning' ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'
                              }`}>
                                {a.type}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-600 mt-0.5">{a.content}</p>
                          </div>
                          <button
                            onClick={() => handleDeleteAnnouncement(a.id)}
                            className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Categories Management */}
                  <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-sm font-bold text-slate-900">Marketplace Categories</h3>
                        <p className="text-xs text-slate-500">Configure multi-language categories (English, Amharic, Tigrinya).</p>
                      </div>
                      <button
                        onClick={() => setIsNewCategoryModalOpen(true)}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add Category</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                      {(data?.categories || []).map((cat) => (
                        <div key={cat.id} className="p-3 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between text-xs">
                          <div>
                            <div className="font-bold text-slate-900">{cat.name_en}</div>
                            <div className="text-[11px] text-slate-500">{cat.name_am} · {cat.name_ti}</div>
                            <span className="text-[10px] font-mono text-emerald-700">slug: {cat.slug}</span>
                          </div>
                          <button
                            onClick={() => handleDeleteCategory(cat.id)}
                            className="p-1 text-red-500 hover:bg-red-50 rounded-md cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Contact Info Editor */}
                  <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                    <h3 className="text-sm font-bold text-slate-900 mb-1">Official Contact Information</h3>
                    <p className="text-xs text-slate-500 mb-4">Update contact channels visible in the footer and help section.</p>

                    <form onSubmit={handleSaveContactInfo} className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div>
                        <label className="font-semibold text-slate-700 block mb-1">Support Email</label>
                        <input
                          type="email"
                          value={contactFormData.email}
                          onChange={(e) => setContactFormData(prev => ({ ...prev, email: e.target.value }))}
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                        />
                      </div>

                      <div>
                        <label className="font-semibold text-slate-700 block mb-1">Support Phone</label>
                        <input
                          type="text"
                          value={contactFormData.phone}
                          onChange={(e) => setContactFormData(prev => ({ ...prev, phone: e.target.value }))}
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                        />
                      </div>

                      <div>
                        <label className="font-semibold text-slate-700 block mb-1">Telegram / WhatsApp Contact</label>
                        <input
                          type="text"
                          value={contactFormData.telegram || ''}
                          onChange={(e) => setContactFormData(prev => ({ ...prev, telegram: e.target.value }))}
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                        />
                      </div>

                      <div>
                        <label className="font-semibold text-slate-700 block mb-1">Working Hours</label>
                        <input
                          type="text"
                          value={contactFormData.working_hours || ''}
                          onChange={(e) => setContactFormData(prev => ({ ...prev, working_hours: e.target.value }))}
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <label className="font-semibold text-slate-700 block mb-1">Headquarters Address</label>
                        <input
                          type="text"
                          value={contactFormData.address || ''}
                          onChange={(e) => setContactFormData(prev => ({ ...prev, address: e.target.value }))}
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                        />
                      </div>

                      <div className="sm:col-span-2 flex justify-end">
                        <button
                          type="submit"
                          className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs cursor-pointer shadow-xs"
                        >
                          Save Contact Information
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              {/* TAB: AUDIT LOGS */}
              {activeTab === 'audit' && (
                <div className="space-y-4">
                  <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">Administrative Audit Trail</h3>
                      <p className="text-xs text-slate-500">
                        Immutable record of all Super Admin and management actions in Neon PostgreSQL.
                      </p>
                    </div>
                    <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-800 text-xs font-mono font-bold">
                      {data?.auditLogs?.length || 0} Records
                    </span>
                  </div>

                  <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                          <tr>
                            <th className="p-3">Timestamp</th>
                            <th className="p-3">Admin</th>
                            <th className="p-3">Action</th>
                            <th className="p-3">Target Entity</th>
                            <th className="p-3">Details</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {(data?.auditLogs || []).map((log) => (
                            <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                              <td className="p-3 text-[11px] text-slate-500 font-mono whitespace-nowrap">
                                {new Date(log.created_at).toLocaleString()}
                              </td>
                              <td className="p-3 font-semibold text-slate-900">
                                {log.admin_name || log.admin_email || log.admin_id}
                              </td>
                              <td className="p-3 font-bold text-emerald-800">
                                <span className="px-2 py-0.5 rounded bg-emerald-50 border border-emerald-100">
                                  {log.action}
                                </span>
                              </td>
                              <td className="p-3 text-slate-600 font-mono text-[11px]">
                                {log.entity_type} {log.entity_id ? `(#${log.entity_id})` : ''}
                              </td>
                              <td className="p-3 text-slate-500 font-mono text-[10px] max-w-xs truncate">
                                {log.details ? JSON.stringify(log.details) : '—'}
                              </td>
                            </tr>
                          ))}

                          {(!data?.auditLogs || data.auditLogs.length === 0) && (
                            <tr>
                              <td colSpan={5} className="p-8 text-center text-slate-400 text-xs">
                                No audit entries logged yet.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB: CUSTOMER INQUIRIES */}
              {activeTab === 'inquiries' && (
                <div className="space-y-3">
                  {data?.inquiries?.length === 0 ? (
                    <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 text-slate-400 text-xs">
                      No customer inquiries submitted yet.
                    </div>
                  ) : (
                    data?.inquiries?.map((inq) => (
                      <div key={inq.id} className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs text-xs space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-900">{inq.buyer_name} ({inq.buyer_phone})</span>
                          <span className="text-slate-400">{new Date(inq.created_at).toLocaleString()}</span>
                        </div>
                        {inq.buyer_email && (
                          <div className="text-slate-500">Email: {inq.buyer_email}</div>
                        )}
                        <p className="p-2.5 bg-slate-50 rounded-xl text-slate-700">
                          {inq.message}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* TAB: CONTENT REPORTS */}
              {activeTab === 'reports' && (
                <div className="space-y-3">
                  {data?.reports?.length === 0 ? (
                    <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 text-slate-400 text-xs">
                      No reported content. The marketplace is clean.
                    </div>
                  ) : (
                    data?.reports?.map((rep) => (
                      <div key={rep.id} className="p-4 bg-white rounded-2xl border border-red-200 shadow-xs text-xs space-y-2">
                        <div className="flex items-center justify-between text-red-700 font-bold">
                          <span>Reported Product ID: {rep.product_id}</span>
                          <span className="text-slate-400 font-normal">{new Date(rep.created_at).toLocaleDateString()}</span>
                        </div>
                        <p className="text-slate-700">Reason: {rep.reason}</p>
                        <div className="text-[11px] text-slate-400">Reporter: {rep.reporter_email}</div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* TAB: NEON DB CONNECTION */}
              {activeTab === 'db' && (
                <div className="space-y-6">
                  <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-10 h-10 rounded-xl flex items-center justify-center text-white ${
                            dbStatus?.connected ? 'bg-emerald-600' : 'bg-amber-600'
                          }`}
                        >
                          <Database className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-bold text-slate-900 text-base">
                              {dbStatus?.engine || 'PostgreSQL Engine'}
                            </h3>
                            <span
                              className={`text-xs px-2.5 py-0.5 rounded-full font-semibold ${
                                dbStatus?.connected
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-amber-100 text-amber-800'
                              }`}
                            >
                              {dbStatus?.connected ? 'Neon PostgreSQL Verified' : 'Standby / Disconnected'}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 mt-0.5">
                            {dbStatus?.message}
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={handleTestDbPing}
                        disabled={isPingingDb}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                      >
                        <RefreshCw className={`w-3.5 h-3.5 ${isPingingDb ? 'animate-spin' : ''}`} />
                        <span>Verify Connection</span>
                      </button>
                    </div>

                    {pingResult && (
                      <div className="mt-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>{pingResult}</span>
                      </div>
                    )}

                    {/* Active & Preserved Database Details */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4 pt-4 border-t border-slate-100">
                      <div className="p-3.5 rounded-xl bg-emerald-50/80 border border-emerald-200/80">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[11px] font-bold text-emerald-900 uppercase tracking-wider">
                            Active Database (Production)
                          </span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-600 text-white">
                            Active
                          </span>
                        </div>
                        <p className="font-mono text-xs font-bold text-emerald-950">
                          {dbStatus?.activeDatabase || 'mela_market_v2'}
                        </p>
                        <p className="text-[11px] text-emerald-800 mt-0.5">
                          Neon PostgreSQL Serverless (AWS us-east-2) · Latency: {dbStatus?.latencyMs ?? 0}ms
                        </p>
                      </div>

                      <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                            Preserved Database (Untouched)
                          </span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200 text-slate-800">
                            Preserved
                          </span>
                        </div>
                        <p className="font-mono text-xs font-bold text-slate-900">
                          {dbStatus?.preservedDatabase || 'neondb'}
                        </p>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          Previous database records preserved intact for rollback safety.
                        </p>
                      </div>
                    </div>

                    {/* Neon Connection Form */}
                    <div className="mt-6 p-5 rounded-2xl bg-slate-900 text-white border border-slate-800 shadow-sm">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Database className="w-4 h-4 text-emerald-400" />
                          <h4 className="text-sm font-bold text-white">
                            Neon PostgreSQL Connection & Verification
                          </h4>
                        </div>
                        <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                          dbStatus?.connected
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        }`}>
                          {dbStatus?.connected ? '✓ Neon Connected' : 'Awaiting Connection String'}
                        </span>
                      </div>

                      <p className="text-xs text-slate-300 mb-4 leading-relaxed">
                        Mela Market stores all production marketplace records in Neon PostgreSQL. Verify or update connection string below to test latency, verify table constraints, and ensure uninterrupted data persistence.
                      </p>

                      <form onSubmit={handleConnectNeon} className="space-y-3">
                        <div className="flex flex-col sm:flex-row gap-2">
                          <input
                            type="password"
                            value={neonInput}
                            onChange={(e) => setNeonInput(e.target.value)}
                            placeholder="postgresql://user:password@ep-xyz.aws.neon.tech/mela_market_v2?sslmode=require"
                            className="flex-1 px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 text-xs font-mono focus:outline-emerald-500"
                          />
                          <button
                            type="submit"
                            disabled={isConnectingNeon || !neonInput.trim()}
                            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap shadow-sm"
                          >
                            <RefreshCw className={`w-3.5 h-3.5 ${isConnectingNeon ? 'animate-spin' : ''}`} />
                            <span>{isConnectingNeon ? 'Testing Neon...' : 'Verify & Connect Neon'}</span>
                          </button>
                        </div>
                      </form>

                      {neonConnectResult && (
                        <div className={`mt-3 p-3 rounded-xl text-xs flex items-center gap-2 border ${
                          neonConnectResult.success
                            ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300'
                            : 'bg-red-950/60 border-red-500/40 text-red-300'
                        }`}>
                          {neonConnectResult.success ? (
                            <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                          ) : (
                            <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                          )}
                          <div>
                            <p className="font-semibold">{neonConnectResult.message}</p>
                            {neonConnectResult.version && (
                              <p className="text-[11px] opacity-80 mt-0.5 font-mono">
                                Server: {neonConnectResult.version} · Latency: {neonConnectResult.latencyMs}ms
                              </p>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* ---------------- MODALS ---------------- */}

        {/* Modal: Create User */}
        {isCreateUserModalOpen && (
          <div className="fixed inset-0 z-60 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
            <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl border border-slate-200">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
                <h3 className="font-bold text-slate-900 text-sm">Create New Account (Super Admin)</h3>
                <button onClick={() => setIsCreateUserModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleCreateUser} className="space-y-3 text-xs">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={userFormData.fullName}
                    onChange={(e) => setUserFormData(p => ({ ...p, fullName: e.target.value }))}
                    placeholder="e.g. Abebe Bikila"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    value={userFormData.email}
                    onChange={(e) => setUserFormData(p => ({ ...p, email: e.target.value }))}
                    placeholder="user@example.com"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Phone Number</label>
                  <input
                    type="text"
                    required
                    value={userFormData.phone}
                    onChange={(e) => setUserFormData(p => ({ ...p, phone: e.target.value }))}
                    placeholder="+251 91 123 4567"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Password</label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={userFormData.password}
                    onChange={(e) => setUserFormData(p => ({ ...p, password: e.target.value }))}
                    placeholder="Minimum 6 characters"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Role</label>
                    <select
                      value={userFormData.role}
                      onChange={(e) => setUserFormData(p => ({ ...p, role: e.target.value as any }))}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                    >
                      <option value="customer">Customer</option>
                      <option value="seller">Seller</option>
                      <option value="admin">Super Admin</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Status</label>
                    <select
                      value={userFormData.status}
                      onChange={(e) => setUserFormData(p => ({ ...p, status: e.target.value as any }))}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                    >
                      <option value="active">Active</option>
                      <option value="suspended">Suspended</option>
                    </select>
                  </div>
                </div>

                {userFormData.role === 'seller' && (
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Business / Store Name</label>
                    <input
                      type="text"
                      value={userFormData.businessName}
                      onChange={(e) => setUserFormData(p => ({ ...p, businessName: e.target.value }))}
                      placeholder="e.g. Merkato Electronics"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                    />
                  </div>
                )}

                <div className="pt-3 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsCreateUserModalOpen(false)}
                    className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl cursor-pointer"
                  >
                    Create User
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal: Edit User */}
        {editingUser && (
          <div className="fixed inset-0 z-60 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
            <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl border border-slate-200">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
                <h3 className="font-bold text-slate-900 text-sm">Edit User: {editingUser.email}</h3>
                <button onClick={() => setEditingUser(null)} className="text-slate-400 hover:text-slate-600">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleUpdateUser} className="space-y-3 text-xs">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={editingUser.fullName || editingUser.full_name || ''}
                    onChange={(e) => setEditingUser(p => p ? { ...p, fullName: e.target.value } : null)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Phone Number</label>
                  <input
                    type="text"
                    required
                    value={editingUser.phone}
                    onChange={(e) => setEditingUser(p => p ? { ...p, phone: e.target.value } : null)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Role</label>
                    <select
                      value={editingUser.role}
                      disabled={editingUser.id === user.id}
                      onChange={(e) => setEditingUser(p => p ? { ...p, role: e.target.value } : null)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                    >
                      <option value="customer">Customer</option>
                      <option value="seller">Seller</option>
                      <option value="admin">Super Admin</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Status</label>
                    <select
                      value={editingUser.status || 'active'}
                      disabled={editingUser.id === user.id}
                      onChange={(e) => setEditingUser(p => p ? { ...p, status: e.target.value as any } : null)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                    >
                      <option value="active">Active</option>
                      <option value="suspended">Suspended</option>
                    </select>
                  </div>
                </div>

                {editingUser.role === 'seller' && (
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Business Name</label>
                    <input
                      type="text"
                      value={editingUser.businessName || editingUser.business_name || ''}
                      onChange={(e) => setEditingUser(p => p ? { ...p, businessName: e.target.value } : null)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                    />
                  </div>
                )}

                <div className="pt-3 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setEditingUser(null)}
                    className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl cursor-pointer"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal: Add Product as Admin */}
        {isCreateProductModalOpen && (
          <div className="fixed inset-0 z-60 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
            <div className="bg-white rounded-3xl p-6 w-full max-w-lg shadow-2xl border border-slate-200 my-6">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
                <h3 className="font-bold text-slate-900 text-sm">Add Product to Marketplace</h3>
                <button onClick={() => setIsCreateProductModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleCreateProduct} className="space-y-3 text-xs">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Product Title</label>
                  <input
                    type="text"
                    required
                    value={productFormData.title}
                    onChange={(e) => setProductFormData(p => ({ ...p, title: e.target.value }))}
                    placeholder="e.g. Brand New Samsung Galaxy A54"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Category</label>
                    <select
                      value={productFormData.category}
                      onChange={(e) => setProductFormData(p => ({ ...p, category: e.target.value }))}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                    >
                      <option value="electronics">Electronics</option>
                      <option value="vehicles">Vehicles</option>
                      <option value="property">Property</option>
                      <option value="fashion">Fashion</option>
                      <option value="home">Home & Kitchen</option>
                      <option value="crafts">Crafts & Coffee</option>
                      <option value="agriculture">Agriculture</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Condition</label>
                    <select
                      value={productFormData.condition}
                      onChange={(e) => setProductFormData(p => ({ ...p, condition: e.target.value as any }))}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                    >
                      <option value="new">New (Factory Sealed)</option>
                      <option value="used">Used (Pre-owned)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Price (ETB)</label>
                    <input
                      type="number"
                      required
                      value={productFormData.price}
                      onChange={(e) => setProductFormData(p => ({ ...p, price: e.target.value }))}
                      placeholder="e.g. 25000"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Stock Quantity</label>
                    <input
                      type="number"
                      value={productFormData.stockQuantity}
                      onChange={(e) => setProductFormData(p => ({ ...p, stockQuantity: e.target.value }))}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Photo URL</label>
                  <input
                    type="url"
                    required
                    value={productFormData.photoUrl}
                    onChange={(e) => setProductFormData(p => ({ ...p, photoUrl: e.target.value }))}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-[11px]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">City</label>
                    <input
                      type="text"
                      required
                      value={productFormData.city}
                      onChange={(e) => setProductFormData(p => ({ ...p, city: e.target.value }))}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Region</label>
                    <input
                      type="text"
                      required
                      value={productFormData.region}
                      onChange={(e) => setProductFormData(p => ({ ...p, region: e.target.value }))}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Description</label>
                  <textarea
                    rows={2}
                    value={productFormData.description}
                    onChange={(e) => setProductFormData(p => ({ ...p, description: e.target.value }))}
                    placeholder="Provide details about the item..."
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="featured-checkbox"
                    checked={productFormData.featured}
                    onChange={(e) => setProductFormData(p => ({ ...p, featured: e.target.checked }))}
                    className="rounded text-emerald-600 cursor-pointer"
                  />
                  <label htmlFor="featured-checkbox" className="font-semibold text-slate-700 cursor-pointer">
                    Highlight as Featured Product on Homepage
                  </label>
                </div>

                <div className="pt-3 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsCreateProductModalOpen(false)}
                    className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl cursor-pointer"
                  >
                    Publish Listing
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal: Edit Product */}
        {editingProduct && (
          <div className="fixed inset-0 z-60 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
            <div className="bg-white rounded-3xl p-6 w-full max-w-lg shadow-2xl border border-slate-200 my-6">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
                <h3 className="font-bold text-slate-900 text-sm">Edit Listing: {editingProduct.title}</h3>
                <button onClick={() => setEditingProduct(null)} className="text-slate-400 hover:text-slate-600">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleUpdateProduct} className="space-y-3 text-xs">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Title</label>
                  <input
                    type="text"
                    required
                    value={editingProduct.title}
                    onChange={(e) => setEditingProduct(p => p ? { ...p, title: e.target.value } : null)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Price (ETB)</label>
                    <input
                      type="number"
                      required
                      value={editingProduct.price}
                      onChange={(e) => setEditingProduct(p => p ? { ...p, price: parseFloat(e.target.value) || 0 } : null)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Stock</label>
                    <input
                      type="number"
                      value={editingProduct.stockQuantity ?? editingProduct.stock_quantity ?? 1}
                      onChange={(e) => setEditingProduct(p => p ? { ...p, stockQuantity: parseInt(e.target.value, 10) || 1 } : null)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Category</label>
                    <input
                      type="text"
                      value={editingProduct.category}
                      onChange={(e) => setEditingProduct(p => p ? { ...p, category: e.target.value } : null)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Condition</label>
                    <select
                      value={editingProduct.condition}
                      onChange={(e) => setEditingProduct(p => p ? { ...p, condition: e.target.value as any } : null)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                    >
                      <option value="new">New</option>
                      <option value="used">Used</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Description</label>
                  <textarea
                    rows={3}
                    value={editingProduct.description || ''}
                    onChange={(e) => setEditingProduct(p => p ? { ...p, description: e.target.value } : null)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>

                <div className="pt-3 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setEditingProduct(null)}
                    className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl cursor-pointer"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal: Cancel Order with Dispute Note */}
        {cancellingOrder && (
          <div className="fixed inset-0 z-60 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
            <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl border border-slate-200">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
                <h3 className="font-bold text-slate-900 text-sm">Cancel Order #{cancellingOrder.order_number}</h3>
                <button onClick={() => setCancellingOrder(null)} className="text-slate-400 hover:text-slate-600">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleCancelOrderSubmit} className="space-y-3 text-xs">
                <p className="text-slate-600">
                  Are you sure you want to cancel this order? This will update the order status and record an entry in the administrative audit log.
                </p>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Dispute / Cancellation Reason</label>
                  <textarea
                    rows={3}
                    required
                    value={cancelReason}
                    onChange={(e) => setCancelReason(e.target.value)}
                    placeholder="e.g. Item out of stock / Customer requested refund / Fraudulent transaction"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>

                <div className="pt-3 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setCancellingOrder(null)}
                    className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl cursor-pointer"
                  >
                    Confirm Cancellation
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal: Add Banner */}
        {isNewBannerModalOpen && (
          <div className="fixed inset-0 z-60 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
            <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl border border-slate-200">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
                <h3 className="font-bold text-slate-900 text-sm">Create Homepage Banner</h3>
                <button onClick={() => setIsNewBannerModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleAddBanner} className="space-y-3 text-xs">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Banner Title</label>
                  <input
                    type="text"
                    required
                    value={bannerFormData.title}
                    onChange={(e) => setBannerFormData(p => ({ ...p, title: e.target.value }))}
                    placeholder="e.g. Ethiopian New Year Mega Discounts"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Subtitle</label>
                  <input
                    type="text"
                    required
                    value={bannerFormData.subtitle}
                    onChange={(e) => setBannerFormData(p => ({ ...p, subtitle: e.target.value }))}
                    placeholder="e.g. Up to 40% off electronics and traditional crafts"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Banner Image URL</label>
                  <input
                    type="url"
                    required
                    value={bannerFormData.image_url}
                    onChange={(e) => setBannerFormData(p => ({ ...p, image_url: e.target.value }))}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-[11px]"
                  />
                </div>

                <div className="pt-3 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsNewBannerModalOpen(false)}
                    className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl cursor-pointer"
                  >
                    Publish Banner
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal: Add Announcement */}
        {isNewAnnouncementModalOpen && (
          <div className="fixed inset-0 z-60 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
            <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl border border-slate-200">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
                <h3 className="font-bold text-slate-900 text-sm">Broadcast Announcement</h3>
                <button onClick={() => setIsNewAnnouncementModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleAddAnnouncement} className="space-y-3 text-xs">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Title</label>
                  <input
                    type="text"
                    required
                    value={announcementFormData.title}
                    onChange={(e) => setAnnouncementFormData(p => ({ ...p, title: e.target.value }))}
                    placeholder="e.g. Official WhatsApp Support Alert"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Notice Type</label>
                  <select
                    value={announcementFormData.type}
                    onChange={(e) => setAnnouncementFormData(p => ({ ...p, type: e.target.value as any }))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                  >
                    <option value="info">Info (Blue)</option>
                    <option value="warning">Warning (Amber)</option>
                    <option value="alert">Alert (Red)</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Message Content</label>
                  <textarea
                    rows={3}
                    required
                    value={announcementFormData.content}
                    onChange={(e) => setAnnouncementFormData(p => ({ ...p, content: e.target.value }))}
                    placeholder="Describe the update clearly..."
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>

                <div className="pt-3 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsNewAnnouncementModalOpen(false)}
                    className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl cursor-pointer"
                  >
                    Broadcast Now
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal: Add Category */}
        {isNewCategoryModalOpen && (
          <div className="fixed inset-0 z-60 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
            <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl border border-slate-200">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
                <h3 className="font-bold text-slate-900 text-sm">Create Marketplace Category</h3>
                <button onClick={() => setIsNewCategoryModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleAddCategory} className="space-y-3 text-xs">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Slug (identifier)</label>
                  <input
                    type="text"
                    required
                    value={categoryFormData.slug}
                    onChange={(e) => setCategoryFormData(p => ({ ...p, slug: e.target.value }))}
                    placeholder="e.g. musical_instruments"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-[11px]"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">English Name</label>
                  <input
                    type="text"
                    required
                    value={categoryFormData.nameEn}
                    onChange={(e) => setCategoryFormData(p => ({ ...p, nameEn: e.target.value }))}
                    placeholder="Musical Instruments"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Amharic Name (አማርኛ)</label>
                  <input
                    type="text"
                    required
                    value={categoryFormData.nameAm}
                    onChange={(e) => setCategoryFormData(p => ({ ...p, nameAm: e.target.value }))}
                    placeholder="የሙዚቃ መሳሪያዎች"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Tigrinya Name (ትግርኛ)</label>
                  <input
                    type="text"
                    required
                    value={categoryFormData.nameTi}
                    onChange={(e) => setCategoryFormData(p => ({ ...p, nameTi: e.target.value }))}
                    placeholder="ናይ ሙዚቃ መሳርሒታት"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>

                <div className="pt-3 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsNewCategoryModalOpen(false)}
                    className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl cursor-pointer"
                  >
                    Save Category
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
