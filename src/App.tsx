import React, { useState, useEffect } from 'react';
import { LanguageProvider, useLanguage } from './context/LanguageContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { CategoryNav } from './components/CategoryNav';
import { ProductCard } from './components/ProductCard';
import { ProductDetailsModal } from './components/ProductDetailsModal';
import { InquiryModal } from './components/InquiryModal';
import { AddProductModal } from './components/AddProductModal';
import { AuthModal } from './components/AuthModal';
import { UserDashboard } from './components/UserDashboard';
import { AdminDashboard } from './components/AdminDashboard';
import { Footer } from './components/Footer';
import { Category, Product } from './types';
import { SlidersHorizontal, ArrowUpDown, ChevronLeft, ChevronRight, X, AlertCircle } from 'lucide-react';

const AppContent: React.FC = () => {
  const { t } = useLanguage();
  const { user, isAdmin } = useAuth();

  // Navigation State
  const [currentView, setCurrentView] = useState<'home' | 'browse' | 'dashboard' | 'admin'>('home');

  // Categories & Products Data
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [totalProducts, setTotalProducts] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);

  // Filter States
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedCondition, setSelectedCondition] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [locationFilter, setLocationFilter] = useState<string>('');
  const [minPrice, setMinPrice] = useState<string>('');
  const [maxPrice, setMaxPrice] = useState<string>('');
  const [sortOption, setSortOption] = useState<'newest' | 'price_asc' | 'price_desc' | 'popular'>('newest');

  // Modals
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [productToEdit, setProductToEdit] = useState<Product | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [detailsProduct, setDetailsProduct] = useState<Product | null>(null);
  const [inquiryProduct, setInquiryProduct] = useState<Product | null>(null);

  // Fetch Categories
  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/categories');
      if (res.ok) {
        const data = await res.json();
        setCategories(data.categories || []);
      }
    } catch (err) {
      console.error('Failed to load categories:', err);
    }
  };

  // Fetch Products with filters
  const fetchProducts = async () => {
    setIsLoadingProducts(true);
    try {
      const params = new URLSearchParams();
      if (selectedCategory && selectedCategory !== 'all') params.set('category', selectedCategory);
      if (selectedCondition && selectedCondition !== 'all') params.set('condition', selectedCondition);
      if (searchQuery.trim()) params.set('search', searchQuery.trim());
      if (locationFilter.trim()) params.set('location', locationFilter.trim());
      if (minPrice && !isNaN(parseFloat(minPrice))) params.set('minPrice', minPrice);
      if (maxPrice && !isNaN(parseFloat(maxPrice))) params.set('maxPrice', maxPrice);
      params.set('sort', sortOption);
      params.set('page', page.toString());
      params.set('limit', '12');

      const res = await fetch(`/api/products?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setProducts(data.products || []);
        setTotalProducts(data.total || 0);
        setTotalPages(data.totalPages || 1);
      }
    } catch (err) {
      console.error('Failed to fetch products:', err);
    } finally {
      setIsLoadingProducts(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    if (currentView === 'home' || currentView === 'browse') {
      fetchProducts();
    }
  }, [selectedCategory, selectedCondition, searchQuery, locationFilter, minPrice, maxPrice, sortOption, page, currentView]);

  const handleHeroSearch = (params: { search: string; category: string; location: string }) => {
    setSearchQuery(params.search);
    setSelectedCategory(params.category);
    setLocationFilter(params.location);
    setPage(1);
    setCurrentView('browse');
  };

  const handleSelectCategory = (catId: string) => {
    setSelectedCategory(catId);
    setPage(1);
  };

  const handleResetFilters = () => {
    setSelectedCategory('all');
    setSelectedCondition('all');
    setSearchQuery('');
    setLocationFilter('');
    setMinPrice('');
    setMaxPrice('');
    setSortOption('newest');
    setPage(1);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 transition-colors">
      {/* Navigation Header */}
      <Header
        currentView={currentView}
        onNavigate={(view, catId) => {
          if (catId) setSelectedCategory(catId);
          setCurrentView(view);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onOpenPostModal={() => {
          setProductToEdit(null);
          setIsPostModalOpen(true);
        }}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {/* VIEW 1: HOME */}
        {currentView === 'home' && (
          <div>
            {/* Hero Banner */}
            <Hero
              categories={categories}
              selectedCategory={selectedCategory}
              onSearch={handleHeroSearch}
              onSelectCategory={handleSelectCategory}
            />

            {/* Category Navigation Bar */}
            <CategoryNav
              categories={categories}
              selectedCategory={selectedCategory}
              onSelectCategory={handleSelectCategory}
            />

            {/* Featured Product Grid */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                    {selectedCategory === 'all' ? t('nav.browse') : t('filters.category')}
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    {totalProducts} {t('products.found')}
                  </p>
                </div>

                {/* Sort Option Control */}
                <div className="flex items-center gap-2 self-start sm:self-auto">
                  <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                  <select
                    value={sortOption}
                    onChange={(e) => setSortOption(e.target.value as any)}
                    className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer"
                  >
                    <option value="newest">{t('filters.sort.newest')}</option>
                    <option value="price_asc">{t('filters.sort.priceAsc')}</option>
                    <option value="price_desc">{t('filters.sort.priceDesc')}</option>
                    <option value="popular">{t('filters.sort.popular')}</option>
                  </select>
                </div>
              </div>

              {isLoadingProducts ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 animate-pulse">
                  {[...Array(8)].map((_, i) => (
                    <div key={i} className="aspect-[4/3] rounded-2xl bg-slate-200 dark:bg-slate-800" />
                  ))}
                </div>
              ) : products.length === 0 ? (
                <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8">
                  <AlertCircle className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4">{t('products.noProducts')}</p>
                  <button
                    onClick={handleResetFilters}
                    className="px-4 py-2 text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl hover:bg-emerald-100 transition-colors"
                  >
                    {t('filters.reset')}
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {products.map((p) => (
                    <ProductCard
                      key={p.id}
                      product={p}
                      onViewDetails={(prod) => setDetailsProduct(prod)}
                      onInquire={(prod) => setInquiryProduct(prod)}
                    />
                  ))}
                </div>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-10 flex items-center justify-center gap-3">
                  <button
                    disabled={page <= 1}
                    onClick={() => setPage(page - 1)}
                    className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 disabled:opacity-40 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="text-xs font-semibold text-slate-600 dark:text-slate-400 tabular-nums">
                    {page} / {totalPages}
                  </span>
                  <button
                    disabled={page >= totalPages}
                    onClick={() => setPage(page + 1)}
                    className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 disabled:opacity-40 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* VIEW 2: BROWSE CATALOG WITH EXTENSIVE FILTERS */}
        {currentView === 'browse' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex flex-col lg:flex-row gap-8">
              {/* Sidebar Filters */}
              <div className="w-full lg:w-64 shrink-0 space-y-6">
                <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-1.5 font-bold text-sm">
                      <SlidersHorizontal className="w-4 h-4 text-emerald-600" />
                      <span>{t('filters.title')}</span>
                    </div>
                    <button
                      onClick={handleResetFilters}
                      className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
                    >
                      {t('filters.reset')}
                    </button>
                  </div>

                  {/* Category Filter */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
                      {t('filters.category')}
                    </label>
                    <select
                      value={selectedCategory}
                      onChange={(e) => {
                        setSelectedCategory(e.target.value);
                        setPage(1);
                      }}
                      className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700"
                    >
                      <option value="all">{t('cat.all')}</option>
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name_am} ({c.name_en})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Condition Filter */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
                      {t('filters.condition')}
                    </label>
                    <div className="grid grid-cols-3 gap-1">
                      {['all', 'new', 'used'].map((cond) => (
                        <button
                          key={cond}
                          onClick={() => {
                            setSelectedCondition(cond);
                            setPage(1);
                          }}
                          className={`py-1.5 px-2 text-xs font-semibold rounded-lg border transition-colors ${
                            selectedCondition === cond
                              ? 'bg-emerald-600 text-white border-emerald-600'
                              : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                          }`}
                        >
                          {cond === 'all'
                            ? t('filters.condition.all')
                            : cond === 'new'
                            ? t('filters.condition.new')
                            : t('filters.condition.used')}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Price Range */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
                      {t('filters.priceRange')}
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="number"
                        placeholder={t('filters.minPrice')}
                        value={minPrice}
                        onChange={(e) => setMinPrice(e.target.value)}
                        className="w-full px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700"
                      />
                      <input
                        type="number"
                        placeholder={t('filters.maxPrice')}
                        value={maxPrice}
                        onChange={(e) => setMaxPrice(e.target.value)}
                        className="w-full px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700"
                      />
                    </div>
                  </div>

                  {/* City Location */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
                      {t('detail.location')}
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Addis Ababa"
                      value={locationFilter}
                      onChange={(e) => {
                        setLocationFilter(e.target.value);
                        setPage(1);
                      }}
                      className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700"
                    />
                  </div>
                </div>
              </div>

              {/* Product Listing Main View */}
              <div className="flex-1 space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                    {searchQuery ? `Search: "${searchQuery}"` : t('nav.browse')} ({totalProducts})
                  </h2>

                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400">{t('filters.sort')}:</span>
                    <select
                      value={sortOption}
                      onChange={(e) => setSortOption(e.target.value as any)}
                      className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none"
                    >
                      <option value="newest">{t('filters.sort.newest')}</option>
                      <option value="price_asc">{t('filters.sort.priceAsc')}</option>
                      <option value="price_desc">{t('filters.sort.priceDesc')}</option>
                      <option value="popular">{t('filters.sort.popular')}</option>
                    </select>
                  </div>
                </div>

                {isLoadingProducts ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 animate-pulse">
                    {[...Array(6)].map((_, i) => (
                      <div key={i} className="aspect-[4/3] rounded-2xl bg-slate-200 dark:bg-slate-800" />
                    ))}
                  </div>
                ) : products.length === 0 ? (
                  <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8">
                    <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4">{t('products.noProducts')}</p>
                    <button
                      onClick={handleResetFilters}
                      className="px-4 py-2 text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl"
                    >
                      {t('filters.reset')}
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                    {products.map((p) => (
                      <ProductCard
                        key={p.id}
                        product={p}
                        onViewDetails={(prod) => setDetailsProduct(prod)}
                        onInquire={(prod) => setInquiryProduct(prod)}
                      />
                    ))}
                  </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="mt-8 flex items-center justify-center gap-3">
                    <button
                      disabled={page <= 1}
                      onClick={() => setPage(page - 1)}
                      className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 disabled:opacity-40"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <span className="text-xs font-semibold tabular-nums">
                      {page} / {totalPages}
                    </span>
                    <button
                      disabled={page >= totalPages}
                      onClick={() => setPage(page + 1)}
                      className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 disabled:opacity-40"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* VIEW 3: USER DASHBOARD */}
        {currentView === 'dashboard' && (
          user ? (
            <UserDashboard
              onOpenPostModal={(prod) => {
                setProductToEdit(prod || null);
                setIsPostModalOpen(true);
              }}
              onViewProduct={(prod) => setDetailsProduct(prod)}
            />
          ) : (
            <div className="max-w-md mx-auto my-16 p-8 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
              <h3 className="text-base font-bold mb-2">Please Log In</h3>
              <p className="text-xs text-slate-500 mb-4">You must be logged in to view your dashboard, inquiries, and listings.</p>
              <button
                onClick={() => setIsAuthModalOpen(true)}
                className="px-5 py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl"
              >
                {t('nav.login')}
              </button>
            </div>
          )
        )}

        {/* VIEW 4: ADMIN DASHBOARD */}
        {currentView === 'admin' && (
          isAdmin ? (
            <AdminDashboard />
          ) : (
            <div className="max-w-md mx-auto my-16 p-8 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
              <h3 className="text-base font-bold text-rose-600 mb-2">Access Denied</h3>
              <p className="text-xs text-slate-500 mb-4">Only authorized platform administrators have access to this page.</p>
              <button
                onClick={() => setCurrentView('home')}
                className="px-4 py-2 text-xs font-bold text-white bg-slate-900 dark:bg-slate-800 rounded-xl"
              >
                {t('nav.home')}
              </button>
            </div>
          )
        )}
      </main>

      {/* Product Details Modal */}
      {detailsProduct && (
        <ProductDetailsModal
          product={detailsProduct}
          onClose={() => setDetailsProduct(null)}
          onInquire={(prod) => {
            setDetailsProduct(null);
            setInquiryProduct(prod);
          }}
        />
      )}

      {/* Buyer Inquiry Modal */}
      {inquiryProduct && (
        <InquiryModal
          product={inquiryProduct}
          onClose={() => setInquiryProduct(null)}
        />
      )}

      {/* Post / Edit Product Modal with Camera Direct Capture */}
      {isPostModalOpen && (
        <AddProductModal
          categories={categories}
          productToEdit={productToEdit}
          onClose={() => {
            setIsPostModalOpen(false);
            setProductToEdit(null);
          }}
          onSuccess={() => {
            fetchProducts();
          }}
        />
      )}

      {/* User Auth Modal */}
      {isAuthModalOpen && (
        <AuthModal
          onClose={() => setIsAuthModalOpen(false)}
        />
      )}

      {/* Footer */}
      <Footer
        onNavigate={(view, catId) => {
          if (catId) setSelectedCategory(catId);
          setCurrentView(view);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />
    </div>
  );
};

export default function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </LanguageProvider>
  );
}
