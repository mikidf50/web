/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  Phone,
  ShoppingBag,
  TrendingUp,
  CheckCircle2,
  Shield,
} from 'lucide-react';
import { Language, Product, CartItem, User, Review, Order } from './types';
import { PRODUCTS, CATEGORIES, SUPPORT_PHONE, MOCK_REVIEWS, MOCK_ORDERS } from './data/mockData';
import { TRANSLATIONS } from './data/translations';
import { Header } from './components/Header';
import { HeroSection } from './components/HeroSection';
import { ProductCard } from './components/ProductCard';
import { ProductModal } from './components/ProductModal';
import { CartModal } from './components/CartModal';
import { SellModal } from './components/SellModal';
import { AuthModal } from './components/AuthModal';
import { AdminModal } from './components/AdminModal';
import { AboutModal } from './components/AboutModal';
import { HelpCenterModal } from './components/HelpCenterModal';
import { Footer } from './components/Footer';

const STORAGE_LANG_KEY = 'mela_market_lang';

export default function App() {
  // Default language: Amharic ('am'), unless user previously selected another language
  const [language, setLanguage] = useState<Language>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(STORAGE_LANG_KEY);
      if (saved === 'en' || saved === 'am' || saved === 'ti') {
        return saved;
      }
    }
    return 'am';
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedRegion, setSelectedRegion] = useState('all');
  const [selectedZone, setSelectedZone] = useState('all');
  const [productsList, setProductsList] = useState<Product[]>(PRODUCTS);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isSellOpen, setIsSellOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // Pending action for unauthenticated visitors
  const [pendingAction, setPendingAction] = useState<'sell' | null>(null);

  // Orders & Reviews state
  const [orders, setOrders] = useState<Order[]>(MOCK_ORDERS);
  const [reviews, setReviews] = useState<Review[]>(MOCK_REVIEWS);

  const t = TRANSLATIONS[language];

  // Save selected language to localStorage whenever it changes
  const handleLanguageChange = (newLang: Language) => {
    setLanguage(newLang);
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_LANG_KEY, newLang);
    }
  };

  // Check URL hash for admin route (#admin or #/admin)
  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash.toLowerCase();
      if (hash === '#admin' || hash === '#/admin') {
        if (currentUser?.role === 'admin') {
          setIsAdminOpen(true);
        } else {
          setIsAuthOpen(true);
        }
      }
    };

    handleHash();
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, [currentUser]);

  // REQUIREMENT 1: Dynamic product counts for all categories from actual products list
  const dynamicCategories = useMemo(() => {
    const activeProducts = productsList.filter((p) => p.inStock !== false);
    const totalCount = activeProducts.length;

    return CATEGORIES.map((cat) => {
      if (cat.id === 'all') {
        return { ...cat, count: totalCount };
      }
      const count = activeProducts.filter((p) => p.category === cat.id).length;
      return { ...cat, count };
    });
  }, [productsList]);

  // REQUIREMENT 2: Registration required before selling
  const handlePostAdClick = () => {
    if (!currentUser) {
      setPendingAction('sell');
      setIsAuthOpen(true);
    } else {
      setIsSellOpen(true);
    }
  };

  // REQUIREMENT 4: Role-based redirect on login
  const handleLoginSuccess = (name: string, email: string, role?: 'user' | 'admin') => {
    const isAdmin = role === 'admin' || email.toLowerCase().includes('admin');
    const loggedInUser: User = {
      id: isAdmin ? 'admin-1' : 'u-1',
      name,
      email,
      phone: '0904503245',
      role: isAdmin ? 'admin' : 'user',
    };
    setCurrentUser(loggedInUser);

    if (isAdmin) {
      // Automatically redirect/open Admin Dashboard for authenticated administrator
      setIsAdminOpen(true);
    } else if (pendingAction === 'sell') {
      setPendingAction(null);
      setIsSellOpen(true);
    }
  };

  // Handle product creation
  const handleProductCreated = (newProd: Product) => {
    setProductsList((prev) => [newProd, ...prev]);
  };

  // Add Verified Purchase Review
  const handleAddReview = (newRev: Review) => {
    setReviews((prev) => [newRev, ...prev]);

    // Recalculate product rating & reviewsCount
    setProductsList((prev) =>
      prev.map((prod) => {
        if (prod.id === newRev.productId) {
          const currentReviews = reviews.filter((r) => r.productId === prod.id);
          const totalRating =
            currentReviews.reduce((sum, r) => sum + r.rating, 0) + newRev.rating;
          const newCount = currentReviews.length + 1;
          const newAvg = parseFloat((totalRating / newCount).toFixed(1));

          return {
            ...prod,
            rating: newAvg,
            reviewsCount: newCount,
          };
        }
        return prod;
      })
    );
  };

  // Handle new order placed
  const handleOrderPlaced = (newOrder: Order) => {
    setOrders((prev) => [newOrder, ...prev]);
  };

  // Filter products based on search term, category, and dependent location (Region & Zone)
  const filteredProducts = useMemo(() => {
    return productsList.filter((item) => {
      // Category filter
      if (selectedCategory !== 'all' && item.category !== selectedCategory) {
        return false;
      }

      // REQUIREMENT 5: Dependent Location Filter (Region)
      if (selectedRegion !== 'all') {
        const itemRegion = item.locationDetails?.regionId;
        const locLower = item.location.toLowerCase();

        if (itemRegion) {
          if (itemRegion !== selectedRegion) return false;
        } else {
          if (selectedRegion === 'addis-ababa' && !locLower.includes('addis')) return false;
          if (selectedRegion === 'tigray' && !locLower.includes('tigray') && !locLower.includes('mekelle'))
            return false;
        }
      }

      // REQUIREMENT 5: Dependent Location Filter (Zone / Sub-city)
      if (selectedZone !== 'all') {
        const itemZone = item.locationDetails?.zoneId;
        const locLower = item.location.toLowerCase();
        const cleanZone = selectedZone.replace('-zone', '').replace('-', ' ');

        if (itemZone) {
          if (itemZone !== selectedZone) return false;
        } else {
          if (!locLower.includes(cleanZone)) return false;
        }
      }

      // Search term filter across all 3 languages
      if (searchTerm.trim() !== '') {
        const q = searchTerm.toLowerCase();
        const matchEn =
          item.titleEn.toLowerCase().includes(q) ||
          item.descriptionEn.toLowerCase().includes(q);
        const matchAm =
          item.titleAm.toLowerCase().includes(q) ||
          item.descriptionAm.toLowerCase().includes(q);
        const matchTi =
          item.titleTi.toLowerCase().includes(q) ||
          item.descriptionTi.toLowerCase().includes(q);
        const matchCat = item.category.toLowerCase().includes(q);
        const matchLoc = item.location.toLowerCase().includes(q);
        return matchEn || matchAm || matchTi || matchCat || matchLoc;
      }

      return true;
    });
  }, [productsList, searchTerm, selectedCategory, selectedRegion, selectedZone]);

  // Cart operations
  const handleAddToCart = (product: Product) => {
    setCartItems((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
    setIsCartOpen(true);
  };

  const handleUpdateQuantity = (productId: string, delta: number) => {
    setCartItems((prev) =>
      prev
        .map((item) => {
          if (item.product.id === productId) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const handleRemoveItem = (productId: string) => {
    setCartItems((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const handleClearCart = () => {
    setCartItems([]);
  };

  const handleDeleteProduct = (id: string) => {
    setProductsList((prev) => prev.filter((p) => p.id !== id));
  };

  const totalCartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans antialiased text-slate-900">
      {/* Website Header with 3-language selector, WhatsApp (@brmiki21), About, Help Center, Cart, Auth */}
      {/* REQUIREMENT 4: Admin button is COMPLETELY HIDDEN from public navigation */}
      <Header
        language={language}
        onLanguageChange={handleLanguageChange}
        cartCount={totalCartCount}
        onCartClick={() => setIsCartOpen(true)}
        onPostAdClick={handlePostAdClick}
        onAuthClick={() => setIsAuthOpen(true)}
        onAboutClick={() => setIsAboutOpen(true)}
        onHelpClick={() => setIsHelpOpen(true)}
        isLoggedIn={Boolean(currentUser)}
        userName={currentUser?.name}
        onLogout={() => setCurrentUser(null)}
      />

      {/* Main Homepage Hero: Green background, exact 3-language heading, phone & WhatsApp badges, dependent location filter */}
      <HeroSection
        language={language}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        selectedRegion={selectedRegion}
        onRegionChange={setSelectedRegion}
        selectedZone={selectedZone}
        onZoneChange={setSelectedZone}
        onPostAdClick={handlePostAdClick}
      />

      {/* Category Navigation Strip with DYNAMIC PRODUCT COUNTS (REQUIREMENT 1) */}
      <section className="bg-white border-b border-slate-200 sticky top-[73px] z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5">
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
            {dynamicCategories.map((cat) => {
              const isSelected = selectedCategory === cat.id;
              const catName =
                language === 'ti'
                  ? cat.nameTi
                  : language === 'am'
                  ? cat.nameAm
                  : cat.nameEn;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all duration-150 flex items-center gap-1.5 cursor-pointer ${
                    isSelected
                      ? 'bg-emerald-700 text-white shadow-xs'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  <span>{catName}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                      isSelected
                        ? 'bg-emerald-800 text-emerald-100'
                        : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {cat.count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2 text-emerald-800 font-bold text-xs uppercase tracking-wider mb-1">
              <TrendingUp className="w-4 h-4" />
              <span>{t.featuredListings}</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900">
              {selectedCategory === 'all'
                ? t.allCategories
                : CATEGORIES.find((c) => c.id === selectedCategory)?.[
                    language === 'ti'
                      ? 'nameTi'
                      : language === 'am'
                      ? 'nameAm'
                      : 'nameEn'
                  ]}
            </h2>
          </div>

          <div className="flex items-center gap-3 text-xs text-slate-500 font-medium">
            <span>
              {t.showingItems} {filteredProducts.length}
            </span>
            {(selectedCategory !== 'all' || selectedRegion !== 'all' || selectedZone !== 'all' || searchTerm !== '') && (
              <button
                type="button"
                onClick={() => {
                  setSelectedCategory('all');
                  setSelectedRegion('all');
                  setSelectedZone('all');
                  setSearchTerm('');
                }}
                className="text-emerald-700 hover:text-emerald-900 font-bold underline cursor-pointer"
              >
                {t.resetFilters}
              </button>
            )}
          </div>
        </div>

        {/* Product Grid with preserved product photos */}
        {filteredProducts.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-xs max-w-md mx-auto my-8">
            <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center mx-auto mb-4">
              <ShoppingBag className="w-8 h-8" />
            </div>
            <h3 className="font-bold text-slate-900 text-lg mb-1">{t.noItemsFound}</h3>
            <p className="text-xs text-slate-500 mb-6">{t.noItemsDesc}</p>
            <button
              type="button"
              onClick={() => {
                setSelectedCategory('all');
                setSelectedRegion('all');
                setSelectedZone('all');
                setSearchTerm('');
              }}
              className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold py-2.5 px-6 rounded-xl text-xs transition-colors cursor-pointer"
            >
              {t.viewAllListings}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                language={language}
                onQuickView={setSelectedProduct}
                onAddToCart={handleAddToCart}
              />
            ))}
          </div>
        )}

        {/* Mid-Page Hotline & Support Section */}
        <section className="mt-14 bg-gradient-to-r from-emerald-900 via-emerald-800 to-green-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-2 text-center md:text-left">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-amber-300 text-xs font-bold">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{t.directSupport}</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-white">{t.needHelp}</h3>
              <p className="text-xs sm:text-sm text-emerald-100 max-w-xl">{t.needHelpDesc}</p>
            </div>

            {/* Clickable Phone Number */}
            <div className="shrink-0">
              <a
                href={`tel:${SUPPORT_PHONE}`}
                className="inline-flex items-center gap-3 bg-white text-emerald-900 hover:bg-amber-300 hover:text-slate-950 px-5 py-3 rounded-2xl font-black text-lg sm:text-xl shadow-xl transition-all duration-200 active:scale-95"
              >
                <div className="w-8 h-8 rounded-lg bg-emerald-800 text-white flex items-center justify-center">
                  <Phone className="w-4 h-4 text-amber-300" />
                </div>
                <span>{SUPPORT_PHONE}</span>
              </a>
            </div>
          </div>
        </section>
      </main>

      {/* Floating Action Call Button for Mobile */}
      <aside aria-label="Quick contact" className="fixed bottom-5 right-5 z-40 sm:hidden">
        <a
          href={`tel:${SUPPORT_PHONE}`}
          className="flex items-center gap-2 bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold px-3.5 py-2.5 rounded-full shadow-2xl border-2 border-white transition-all active:scale-95"
          aria-label="Direct Call"
        >
          <Phone className="w-4 h-4" />
          <span className="text-xs">{SUPPORT_PHONE}</span>
        </a>
      </aside>

      {/* Reopen Admin Dashboard badge if currently authenticated as admin */}
      {currentUser?.role === 'admin' && (
        <aside aria-label="Admin Access" className="fixed bottom-5 left-5 z-40">
          <button
            type="button"
            onClick={() => setIsAdminOpen(true)}
            className="flex items-center gap-2 bg-emerald-900 hover:bg-emerald-950 text-white border border-emerald-600 font-bold px-3.5 py-2 rounded-full shadow-2xl text-xs cursor-pointer transition-all"
          >
            <Shield className="w-3.5 h-3.5 text-amber-300" />
            <span>Admin Console</span>
          </button>
        </aside>
      )}

      {/* Footer with About, Help Center, WhatsApp (@brmiki21) and hotline */}
      <Footer
        language={language}
        onAboutClick={() => setIsAboutOpen(true)}
        onHelpClick={() => setIsHelpOpen(true)}
      />

      {/* Product Detail Modal */}
      <ProductModal
        product={selectedProduct}
        language={language}
        onClose={() => setSelectedProduct(null)}
        onAddToCart={handleAddToCart}
        currentUser={currentUser}
        orders={orders}
        reviews={reviews}
        onAddReview={handleAddReview}
        onRequireAuth={() => setIsAuthOpen(true)}
      />

      {/* Shopping Cart Drawer / Modal */}
      <CartModal
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cartItems}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onClearCart={handleClearCart}
        language={language}
        currentUser={currentUser}
        onOrderPlaced={handleOrderPlaced}
      />

      {/* Sell Product Modal (Camera-Only Photo Capture, Preview, Retake/Confirm, LocationPicker, Supabase Upload) */}
      <SellModal
        isOpen={isSellOpen}
        onClose={() => setIsSellOpen(false)}
        language={language}
        currentUser={currentUser}
        onRequireAuth={() => setIsAuthOpen(true)}
        onProductCreated={handleProductCreated}
      />

      {/* User Auth Modal (Login / Register with admin role detection and auto-redirect) */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        language={language}
        onLoginSuccess={handleLoginSuccess}
      />

      {/* Admin Dashboard Modal (Protected, accessible to authenticated admins only) */}
      <AdminModal
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
        language={language}
        products={productsList}
        onDeleteProduct={handleDeleteProduct}
      />

      {/* REQUIREMENT 2: About Modal */}
      <AboutModal
        isOpen={isAboutOpen}
        onClose={() => setIsAboutOpen(false)}
        language={language}
      />

      {/* REQUIREMENT 2: Help Center Modal */}
      <HelpCenterModal
        isOpen={isHelpOpen}
        onClose={() => setIsHelpOpen(false)}
        language={language}
      />
    </div>
  );
}
