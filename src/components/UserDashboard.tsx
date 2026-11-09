import React, { useState, useEffect } from 'react';
import { 
  Package, 
  MessageSquare, 
  User as UserIcon, 
  Lock, 
  PlusCircle, 
  Edit3, 
  Trash2, 
  CheckCircle2, 
  AlertCircle,
  Eye,
  Phone,
  Mail,
  MapPin,
  Clock,
  Sparkles
} from 'lucide-react';
import { Product, Inquiry } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';

interface UserDashboardProps {
  onOpenPostModal: (product?: Product) => void;
  onViewProduct: (product: Product) => void;
}

export const UserDashboard: React.FC<UserDashboardProps> = ({
  onOpenPostModal,
  onViewProduct,
}) => {
  const { t } = useLanguage();
  const { user, token, updateProfile, changePassword } = useAuth();

  const [activeTab, setActiveTab] = useState<'listings' | 'inquiries' | 'profile' | 'security'>('listings');
  const [myProducts, setMyProducts] = useState<Product[]>([]);
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Profile Form States
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [city, setCity] = useState(user?.city || '');
  const [region, setRegion] = useState(user?.region || '');
  const [woreda, setWoreda] = useState(user?.woreda || '');
  const [bio, setBio] = useState(user?.bio || '');

  // Password Form States
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Fetch Seller's Products
  const fetchMyProducts = async () => {
    if (!user || !token) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/products?sellerId=${user.id}&status=all&limit=100`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setMyProducts(data.products || []);
    } catch (err) {
      console.error('Error fetching my products:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch Inquiries received for this seller
  const fetchInquiries = async () => {
    if (!token) return;
    try {
      const res = await fetch('/api/inquiries/seller', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setInquiries(data.inquiries || []);
    } catch (err) {
      console.error('Error fetching inquiries:', err);
    }
  };

  useEffect(() => {
    fetchMyProducts();
    fetchInquiries();
    if (user) {
      setName(user.name || '');
      setPhone(user.phone || '');
      setCity(user.city || '');
      setRegion(user.region || '');
      setWoreda(user.woreda || '');
      setBio(user.bio || '');
    }
  }, [user, token]);

  const handleDeleteProduct = async (id: string) => {
    if (!confirm('Are you sure you want to delete this listing permanently?')) return;
    try {
      const res = await fetch(`/api/products/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setMyProducts(prev => prev.filter(p => p.id !== id));
        setStatusMsg({ type: 'success', text: 'Listing deleted successfully.' });
      }
    } catch (err) {
      setStatusMsg({ type: 'error', text: 'Failed to delete listing.' });
    }
  };

  const handleUpdateInquiryStatus = async (id: string, status: Inquiry['status']) => {
    try {
      const res = await fetch(`/api/inquiries/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        setInquiries(prev => prev.map(i => i.id === id ? { ...i, status } : i));
      }
    } catch (err) {
      console.error('Error updating status:', err);
    }
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMsg(null);
    const result = await updateProfile({ name, phone, city, region, woreda, bio });
    if (result.success) {
      setStatusMsg({ type: 'success', text: 'Personal information updated successfully.' });
    } else {
      setStatusMsg({ type: 'error', text: result.error || 'Failed to update profile.' });
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMsg(null);

    if (newPassword !== confirmPassword) {
      setStatusMsg({ type: 'error', text: 'New passwords do not match.' });
      return;
    }

    const result = await changePassword(currentPassword, newPassword);
    if (result.success) {
      setStatusMsg({ type: 'success', text: 'Password changed successfully.' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } else {
      setStatusMsg({ type: 'error', text: result.error || 'Failed to change password.' });
    }
  };

  const newProducts = myProducts.filter(p => p.condition === 'new');
  const usedProducts = myProducts.filter(p => p.condition === 'used');

  const renderProductCard = (p: Product) => (
    <div key={p.id} className="flex flex-col bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition-shadow">
      <div className="relative aspect-video bg-slate-100">
        {p.photo_data ? (
          <img src={p.photo_data} alt={p.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-xs text-slate-400">
            Camera Photo
          </div>
        )}
        <div className="absolute top-2 left-2 flex items-center gap-1">
          <span className={`px-2 py-0.5 text-[10px] font-bold rounded-md uppercase ${
            p.condition === 'new' 
              ? 'bg-emerald-600 text-white' 
              : 'bg-amber-600 text-white'
          }`}>
            {p.condition === 'new' ? t('filters.condition.new') : t('filters.condition.used')}
          </span>
        </div>
        <span className={`absolute top-2 right-2 px-2 py-0.5 text-[10px] font-bold rounded-md uppercase ${
          p.status === 'active' ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-100'
        }`}>
          {p.status}
        </span>
      </div>

      <div className="p-4 flex-1 flex flex-col">
        <h4 className="text-sm font-bold text-slate-900 line-clamp-1 mb-1">{p.title}</h4>
        <p className="text-xs font-bold text-emerald-600 mb-2 tabular-nums">
          {new Intl.NumberFormat().format(p.price)} {p.currency || 'ETB'}
        </p>

        <div className="flex items-center gap-2 text-[11px] text-slate-500 mb-3">
          <MapPin className="w-3 h-3 text-emerald-600 shrink-0" />
          <span className="truncate">{p.location}</span>
          <span>·</span>
          <Eye className="w-3 h-3 text-slate-400 shrink-0" />
          <span>{p.views_count || 0}</span>
        </div>

        <div className="mt-auto pt-3 border-t border-slate-100 grid grid-cols-3 gap-2">
          <button
            onClick={() => onViewProduct(p)}
            className="py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg text-center transition-colors"
          >
            {t('products.details')}
          </button>
          <button
            onClick={() => onOpenPostModal(p)}
            className="py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg flex items-center justify-center gap-1 transition-colors"
          >
            <Edit3 className="w-3 h-3" />
            <span>Edit</span>
          </button>
          <button
            onClick={() => handleDeleteProduct(p.id)}
            className="py-1.5 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-lg flex items-center justify-center gap-1 transition-colors"
          >
            <Trash2 className="w-3 h-3" />
            <span>Delete</span>
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* User Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 bg-white rounded-2xl border border-slate-200 shadow-sm mb-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-xl border border-emerald-200">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-slate-900">{user?.name}</h2>
              <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200">
                {user?.role}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">{user?.email} · {user?.phone}</p>
          </div>
        </div>

        <button
          onClick={() => onOpenPostModal()}
          className="flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl shadow-sm transition-colors"
        >
          <PlusCircle className="w-4 h-4" />
          <span>{t('nav.postAd')}</span>
        </button>
      </div>

      {statusMsg && (
        <div className={`flex items-center gap-2 p-3 text-xs rounded-xl border mb-6 ${
          statusMsg.type === 'success'
            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
            : 'bg-rose-50 text-rose-800 border-rose-200'
        }`}>
          {statusMsg.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
          <span>{statusMsg.text}</span>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3 mb-6 overflow-x-auto">
        <button
          onClick={() => setActiveTab('listings')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-colors ${
            activeTab === 'listings'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>{t('dashboard.myListings')} ({myProducts.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('inquiries')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-colors ${
            activeTab === 'inquiries'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>{t('dashboard.inquiriesReceived')} ({inquiries.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('profile')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-colors ${
            activeTab === 'profile'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <UserIcon className="w-4 h-4" />
          <span>{t('dashboard.profile')}</span>
        </button>

        <button
          onClick={() => setActiveTab('security')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-colors ${
            activeTab === 'security'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Lock className="w-4 h-4" />
          <span>{t('dashboard.security')}</span>
        </button>
      </div>

      {/* Tab 1: My Listings - SEPARATE NEW AND USED PRODUCTS STACKED VERTICALLY */}
      {activeTab === 'listings' && (
        <div className="space-y-8">
          {myProducts.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl border border-slate-200 p-8 shadow-xs">
              <Package className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-900 mb-1">{t('dashboard.noListings')}</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mb-4">
                List vehicles, electronics, furniture, or goods and connect directly with local buyers.
              </p>
              <button
                onClick={() => onOpenPostModal()}
                className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl transition-colors"
              >
                {t('nav.postAd')}
              </button>
            </div>
          ) : (
            <>
              {/* SECTION 1: NEW PRODUCTS */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold border border-emerald-200">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-bold text-slate-900">
                          {t('filters.condition.new')} {t('dashboard.myListings')}
                        </h3>
                        <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                          {newProducts.length}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500">
                        Brand new, unopened, or unused merchandise
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => onOpenPostModal({ condition: 'new' } as any)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-xl border border-emerald-200 transition-colors self-start sm:self-auto"
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    <span>+ Add New Product</span>
                  </button>
                </div>

                {newProducts.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-1">
                    {newProducts.map((p) => renderProductCard(p))}
                  </div>
                ) : (
                  <div className="text-center py-8 bg-slate-50/70 rounded-xl border border-dashed border-slate-200 p-6">
                    <Sparkles className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="text-xs font-semibold text-slate-600 mb-2">No new products listed yet.</p>
                    <button
                      onClick={() => onOpenPostModal({ condition: 'new' } as any)}
                      className="px-3 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg transition-colors"
                    >
                      Post a New Product
                    </button>
                  </div>
                )}
              </div>

              {/* SECTION 2: USED PRODUCTS (STACKED VERTICALLY BELOW NEW PRODUCTS) */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold border border-amber-200">
                      <Clock className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-bold text-slate-900">
                          {t('filters.condition.used')} {t('dashboard.myListings')}
                        </h3>
                        <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                          {usedProducts.length}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500">
                        Pre-owned, secondhand, or refurbished merchandise
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => onOpenPostModal({ condition: 'used' } as any)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-amber-800 bg-amber-50 hover:bg-amber-100 rounded-xl border border-amber-200 transition-colors self-start sm:self-auto"
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    <span>+ Add Used Product</span>
                  </button>
                </div>

                {usedProducts.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-1">
                    {usedProducts.map((p) => renderProductCard(p))}
                  </div>
                ) : (
                  <div className="text-center py-8 bg-slate-50/70 rounded-xl border border-dashed border-slate-200 p-6">
                    <Clock className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="text-xs font-semibold text-slate-600 mb-2">No used products listed yet.</p>
                    <button
                      onClick={() => onOpenPostModal({ condition: 'used' } as any)}
                      className="px-3 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg transition-colors"
                    >
                      Post a Used Product
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      )}

      {/* Tab 2: Received Inquiries */}
      {activeTab === 'inquiries' && (
        <div className="space-y-4">
          {inquiries.length === 0 ? (
            <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8">
              <MessageSquare className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">{t('dashboard.noInquiries')}</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                When buyers contact you regarding your products, their contact details and message will appear here.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {inquiries.map((inq) => (
                <div key={inq.id} className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900 dark:text-white">{inq.buyer_name}</span>
                      <span className="text-xs text-slate-400">interested in</span>
                      <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">{inq.product_title || 'Listing'}</span>
                    </div>

                    <p className="text-xs text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                      "{inq.message}"
                    </p>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-1">
                      <span className="flex items-center gap-1 font-medium text-slate-800 dark:text-slate-200">
                        <Phone className="w-3.5 h-3.5 text-emerald-500" />
                        <a href={`tel:${inq.buyer_phone}`} className="hover:underline">{inq.buyer_phone}</a>
                      </span>
                      <span className="flex items-center gap-1">
                        <Mail className="w-3.5 h-3.5 text-slate-400" />
                        <a href={`mailto:${inq.buyer_email}`} className="hover:underline">{inq.buyer_email}</a>
                      </span>
                      {inq.buyer_location && (
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          <span>{inq.buyer_location}</span>
                        </span>
                      )}
                      <span className="flex items-center gap-1 text-[11px] text-slate-400">
                        <Clock className="w-3 h-3" />
                        <span>{new Date(inq.created_at).toLocaleString()}</span>
                      </span>
                    </div>
                  </div>

                  {/* Status Dropdown */}
                  <div className="shrink-0 flex items-center gap-2">
                    <span className="text-xs text-slate-400">Status:</span>
                    <select
                      value={inq.status}
                      onChange={(e) => handleUpdateInquiryStatus(inq.id, e.target.value as any)}
                      className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none"
                    >
                      <option value="new">{t('inquiry.status.new')}</option>
                      <option value="read">{t('inquiry.status.read')}</option>
                      <option value="replied">{t('inquiry.status.replied')}</option>
                      <option value="closed">{t('inquiry.status.closed')}</option>
                    </select>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Profile Information */}
      {activeTab === 'profile' && (
        <form onSubmit={handleProfileSubmit} className="max-w-xl bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-2">
            {t('dashboard.profile')}
          </h3>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              {t('auth.name')} *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              {t('auth.phone')} *
            </label>
            <input
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              {t('auth.city')}
            </label>
            <input
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {t('auth.region')} *
              </label>
              <input
                type="text"
                required
                value={region}
                onChange={(e) => setRegion(e.target.value)}
                placeholder="e.g. Addis Ababa, Oromia, Amhara..."
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {t('auth.woreda')} *
              </label>
              <input
                type="text"
                required
                value={woreda}
                onChange={(e) => setWoreda(e.target.value)}
                placeholder="e.g. Woreda 03, Bole, Arada..."
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Bio / Seller Description
            </label>
            <textarea
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell buyers about your goods, warranty, or location..."
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <button
            type="submit"
            className="px-5 py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl shadow transition-colors"
          >
            {t('common.save')}
          </button>
        </form>
      )}

      {/* Tab 4: Security & Password */}
      {activeTab === 'security' && (
        <form onSubmit={handlePasswordSubmit} className="max-w-xl bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-2">
            {t('dashboard.security')}
          </h3>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Current Password *
            </label>
            <input
              type="password"
              required
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              New Password * (Min 6 chars)
            </label>
            <input
              type="password"
              required
              minLength={6}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Confirm New Password *
            </label>
            <input
              type="password"
              required
              minLength={6}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <button
            type="submit"
            className="px-5 py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl shadow transition-colors"
          >
            Update Password
          </button>
        </form>
      )}
    </div>
  );
};
