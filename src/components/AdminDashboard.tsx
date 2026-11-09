import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Package, 
  MessageSquare, 
  Database, 
  ShieldCheck, 
  CheckCircle2, 
  XCircle, 
  Trash2, 
  RefreshCw, 
  Activity, 
  Server, 
  AlertTriangle 
} from 'lucide-react';
import { User, Product, Inquiry, DbStatus } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';

export const AdminDashboard: React.FC = () => {
  const { t } = useLanguage();
  const { token } = useAuth();

  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'products' | 'inquiries' | 'database'>('overview');
  const [stats, setStats] = useState<any>(null);
  const [dbStatus, setDbStatus] = useState<DbStatus | null>(null);
  const [usersList, setUsersList] = useState<User[]>([]);
  const [productsList, setProductsList] = useState<Product[]>([]);
  const [inquiriesList, setInquiriesList] = useState<Inquiry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [actionMsg, setActionMsg] = useState<string | null>(null);

  const fetchStatsAndDb = async () => {
    if (!token) return;
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/stats', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setStats(data.stats);
        setDbStatus(data.dbStatus);
      }
    } catch (err) {
      console.error('Error fetching admin stats:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUsers = async () => {
    if (!token) return;
    try {
      const res = await fetch('/api/admin/users', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setUsersList(data.users || []);
      }
    } catch (err) {
      console.error('Error fetching users:', err);
    }
  };

  const fetchProducts = async () => {
    if (!token) return;
    try {
      const res = await fetch('/api/admin/products?limit=100', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setProductsList(data.products || []);
      }
    } catch (err) {
      console.error('Error fetching products:', err);
    }
  };

  const fetchInquiries = async () => {
    if (!token) return;
    try {
      const res = await fetch('/api/admin/inquiries', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setInquiriesList(data.inquiries || []);
      }
    } catch (err) {
      console.error('Error fetching inquiries:', err);
    }
  };

  useEffect(() => {
    fetchStatsAndDb();
    if (activeTab === 'users') fetchUsers();
    if (activeTab === 'products') fetchProducts();
    if (activeTab === 'inquiries') fetchInquiries();
  }, [activeTab, token]);

  const handleToggleUserStatus = async (user: User) => {
    try {
      const res = await fetch(`/api/admin/users/${user.id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ is_active: !user.is_active })
      });
      if (res.ok) {
        setUsersList(prev => prev.map(u => u.id === user.id ? { ...u, is_active: !u.is_active } : u));
        setActionMsg(`User ${user.name} status updated.`);
      }
    } catch (err) {
      console.error('Error updating user status:', err);
    }
  };

  const handleModerateProduct = async (id: string, status: 'active' | 'rejected') => {
    try {
      const res = await fetch(`/api/admin/products/${id}/moderation`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        setProductsList(prev => prev.map(p => p.id === id ? { ...p, status } : p));
        setActionMsg(`Product ${status === 'active' ? 'approved' : 'rejected'}.`);
      }
    } catch (err) {
      console.error('Error moderating product:', err);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm('Are you sure you want to permanently delete this listing from Mela Market?')) return;
    try {
      const res = await fetch(`/api/admin/products/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setProductsList(prev => prev.filter(p => p.id !== id));
        setActionMsg('Listing removed permanently.');
      }
    } catch (err) {
      console.error('Error deleting product:', err);
    }
  };

  const handlePingDb = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/db-status', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setDbStatus(data);
        setActionMsg(`Database latency test complete: ${data.latencyMs || 0}ms response.`);
      }
    } catch (err) {
      console.error('Error testing DB:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 bg-slate-900 text-white rounded-2xl border border-slate-800 shadow-md mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold">{t('admin.title')}</h2>
            <p className="text-xs text-slate-400">Security, user management, listings moderation & Neon PostgreSQL telemetry</p>
          </div>
        </div>

        {/* Database indicator badge */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-950 border border-emerald-500/40 text-emerald-400">
            <Database className="w-3.5 h-3.5" />
            <span>{dbStatus?.type === 'neon-postgresql' ? 'Neon PostgreSQL' : 'Persistent Engine'}</span>
          </div>
        </div>
      </div>

      {actionMsg && (
        <div className="p-3 mb-6 text-xs bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 rounded-xl border border-emerald-200 dark:border-emerald-800 flex items-center justify-between">
          <span>{actionMsg}</span>
          <button onClick={() => setActionMsg(null)} className="text-emerald-700 hover:underline">Dismiss</button>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3 mb-6 overflow-x-auto">
        <button
          onClick={() => setActiveTab('overview')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
            activeTab === 'overview'
              ? 'bg-emerald-600 text-white'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Activity className="w-4 h-4" />
          <span>{t('admin.overview')}</span>
        </button>

        <button
          onClick={() => setActiveTab('users')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
            activeTab === 'users'
              ? 'bg-emerald-600 text-white'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>{t('admin.users')}</span>
        </button>

        <button
          onClick={() => setActiveTab('products')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
            activeTab === 'products'
              ? 'bg-emerald-600 text-white'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>{t('admin.products')}</span>
        </button>

        <button
          onClick={() => setActiveTab('inquiries')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
            activeTab === 'inquiries'
              ? 'bg-emerald-600 text-white'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>{t('admin.inquiries')}</span>
        </button>

        <button
          onClick={() => setActiveTab('database')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
            activeTab === 'database'
              ? 'bg-emerald-600 text-white'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Database className="w-4 h-4" />
          <span>{t('admin.database')}</span>
        </button>
      </div>

      {/* Tab: Overview */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <span className="text-xs text-slate-500 dark:text-slate-400">{t('admin.stats.totalUsers')}</span>
              <p className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1 tabular-nums">
                {stats?.totalUsers || 0}
              </p>
            </div>

            <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <span className="text-xs text-slate-500 dark:text-slate-400">{t('admin.stats.activeProducts')}</span>
              <p className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1 tabular-nums">
                {stats?.activeListings || 0}
              </p>
            </div>

            <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <span className="text-xs text-slate-500 dark:text-slate-400">{t('admin.stats.totalInquiries')}</span>
              <p className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1 tabular-nums">
                {stats?.totalInquiries || 0}
              </p>
            </div>

            <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <span className="text-xs text-slate-500 dark:text-slate-400">{t('admin.stats.dbConnection')}</span>
              <p className="text-sm font-bold text-slate-900 dark:text-white mt-2 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                <span>{dbStatus?.type === 'neon-postgresql' ? 'Neon Postgres Active' : 'Persistent Storage'}</span>
              </p>
            </div>
          </div>

          {/* Quick Database Summary Box */}
          <div className="p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Database Health & Architecture</h3>
              <button
                onClick={handlePingDb}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                <span>Test Database Connection</span>
              </button>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              {dbStatus?.message}
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 text-xs">
              <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                <span className="text-slate-400">DATABASE_URL Set:</span>
                <p className="font-bold text-slate-900 dark:text-white">{dbStatus?.databaseUrlSet ? 'Yes (Configured)' : 'Not set in env'}</p>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                <span className="text-slate-400">Connection Pool:</span>
                <p className="font-bold text-slate-900 dark:text-white">{dbStatus?.poolActive ? 'Active (Pooled)' : 'Standalone'}</p>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                <span className="text-slate-400">Ping Latency:</span>
                <p className="font-bold text-emerald-600 tabular-nums">{dbStatus?.latencyMs || 0} ms</p>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                <span className="text-slate-400">Server Engine:</span>
                <p className="font-bold text-slate-900 dark:text-white truncate">{dbStatus?.serverVersion || 'Express + Node.js'}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Users Management */}
      {activeTab === 'users' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Registered Users ({usersList.length})</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 uppercase font-bold border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Email & Phone</th>
                  <th className="px-4 py-3">Role</th>
                  <th className="px-4 py-3">City</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {usersList.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="px-4 py-3 font-semibold text-slate-900 dark:text-white">{u.name}</td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                      <div>{u.email}</div>
                      <div className="text-[11px] text-slate-400">{u.phone}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded-md text-[10px] uppercase font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        {u.role}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{u.city || 'Addis Ababa'}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                        u.is_active ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-400' : 'bg-rose-100 text-rose-800'
                      }`}>
                        {u.is_active ? 'Active' : 'Suspended'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      {u.role !== 'admin' && (
                        <button
                          onClick={() => handleToggleUserStatus(u)}
                          className={`px-3 py-1 rounded-lg text-xs font-semibold ${
                            u.is_active
                              ? 'text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40'
                              : 'text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40'
                          }`}
                        >
                          {u.is_active ? t('admin.suspend') : t('admin.activate')}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab: Products Moderation */}
      {activeTab === 'products' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
          <div className="p-4 border-b border-slate-200 dark:border-slate-800">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Product Listings Moderation ({productsList.length})</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 uppercase font-bold border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="px-4 py-3">Title</th>
                  <th className="px-4 py-3">Seller</th>
                  <th className="px-4 py-3">Price</th>
                  <th className="px-4 py-3">Location</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Moderation Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {productsList.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="px-4 py-3 font-semibold text-slate-900 dark:text-white max-w-xs truncate">{p.title}</td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{p.seller_name || p.seller_id}</td>
                    <td className="px-4 py-3 font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
                      {new Intl.NumberFormat().format(p.price)} {p.currency || 'ETB'}
                    </td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{p.location}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase ${
                        p.status === 'active' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-400' : 'bg-slate-100 dark:bg-slate-800 text-slate-700'
                      }`}>
                        {p.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right space-x-2">
                      {p.status !== 'active' && (
                        <button
                          onClick={() => handleModerateProduct(p.id, 'active')}
                          className="px-2.5 py-1 text-xs font-semibold text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 rounded-lg"
                        >
                          {t('admin.approve')}
                        </button>
                      )}
                      {p.status !== 'rejected' && (
                        <button
                          onClick={() => handleModerateProduct(p.id, 'rejected')}
                          className="px-2.5 py-1 text-xs font-semibold text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/40 rounded-lg"
                        >
                          {t('admin.reject')}
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteProduct(p.id)}
                        className="p-1 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg"
                        title="Delete listing"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab: Inquiries */}
      {activeTab === 'inquiries' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm p-4 space-y-3">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">Platform Buyer Inquiries ({inquiriesList.length})</h3>
          {inquiriesList.length === 0 ? (
            <p className="text-xs text-slate-400 text-center py-6">No buyer inquiries recorded yet.</p>
          ) : (
            inquiriesList.map((inq) => (
              <div key={inq.id} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 text-xs space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 dark:text-white">{inq.buyer_name} ({inq.buyer_phone} · {inq.buyer_email})</span>
                  <span className="text-[10px] uppercase font-bold text-slate-400">{inq.status}</span>
                </div>
                <p className="text-slate-600 dark:text-slate-300">"{inq.message}"</p>
                <div className="text-[11px] text-slate-400 pt-1">
                  Product ID: {inq.product_id} {inq.buyer_location ? `· Location: ${inq.buyer_location}` : ''}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Tab: Neon Database Configuration */}
      {activeTab === 'database' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Database className="w-5 h-5 text-emerald-600" />
                <span>Neon PostgreSQL Database Management</span>
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Real serverless PostgreSQL connection with connection pooling and schema migrations.
              </p>
            </div>
            <button
              onClick={handlePingDb}
              disabled={isLoading}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl transition-colors shrink-0"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              <span>Test Connection & Latency</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Connection Telemetry</h4>
              <div className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300">
                <div className="flex justify-between">
                  <span>Engine:</span>
                  <span className="font-semibold text-slate-900 dark:text-white">{dbStatus?.type}</span>
                </div>
                <div className="flex justify-between">
                  <span>Connected Status:</span>
                  <span className="font-semibold text-emerald-600">Active</span>
                </div>
                <div className="flex justify-between">
                  <span>DATABASE_URL:</span>
                  <span className="font-mono text-[11px] text-slate-500">{dbStatus?.databaseUrlSet ? 'Configured' : 'Missing (Using persistent store)'}</span>
                </div>
                <div className="flex justify-between">
                  <span>DIRECT_URL (Migrations):</span>
                  <span className="font-mono text-[11px] text-slate-500">{dbStatus?.directUrlSet ? 'Configured' : 'Optional'}</span>
                </div>
                <div className="flex justify-between">
                  <span>Round-trip latency:</span>
                  <span className="font-bold text-emerald-600 tabular-nums">{dbStatus?.latencyMs} ms</span>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Database Table Records</h4>
              <div className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300">
                <div className="flex justify-between">
                  <span>Users table:</span>
                  <span className="font-bold tabular-nums text-slate-900 dark:text-white">{dbStatus?.tableStats.users || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span>Products table:</span>
                  <span className="font-bold tabular-nums text-slate-900 dark:text-white">{dbStatus?.tableStats.products || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span>Inquiries table:</span>
                  <span className="font-bold tabular-nums text-slate-900 dark:text-white">{dbStatus?.tableStats.inquiries || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span>Categories table:</span>
                  <span className="font-bold tabular-nums text-slate-900 dark:text-white">{dbStatus?.tableStats.categories || 0}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-900 text-slate-200 text-xs space-y-2 font-mono">
            <p className="text-emerald-400 font-bold"># Neon PostgreSQL Setup Guide:</p>
            <p>1. Create a project at console.neon.tech</p>
            <p>2. Copy your pooled connection string into DATABASE_URL in .env:</p>
            <p className="text-amber-300">DATABASE_URL="postgresql://user:pass@ep-cool-pooler.eu-central-1.aws.neon.tech/neondb?sslmode=require"</p>
            <p>3. Copy your direct connection string into DIRECT_URL in .env:</p>
            <p className="text-amber-300">DIRECT_URL="postgresql://user:pass@ep-cool.eu-central-1.aws.neon.tech/neondb?sslmode=require"</p>
            <p>4. Mela Market automatically detects your connection and runs all migrations!</p>
          </div>
        </div>
      )}
    </div>
  );
};
