import React, { useState } from 'react';
import { PlusCircle, User as UserIcon, Menu, X, ShieldAlert, LogOut, Package, MessageSquare } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { LanguageSelector } from './LanguageSelector';

interface HeaderProps {
  currentView: 'home' | 'browse' | 'dashboard' | 'admin';
  onNavigate: (view: 'home' | 'browse' | 'dashboard' | 'admin', categoryId?: string) => void;
  onOpenPostModal: () => void;
  onOpenAuthModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentView,
  onNavigate,
  onOpenPostModal,
  onOpenAuthModal,
}) => {
  const { t } = useLanguage();
  const { user, logout, isAdmin } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-8 h-16">
          {/* Zone 1: Single Brand Wordmark */}
          <button
            onClick={() => {
              onNavigate('home');
              setMobileMenuOpen(false);
            }}
            className="flex items-center gap-2 text-left whitespace-nowrap shrink-0 group focus:outline-none"
          >
            <div className="w-8 h-8 rounded-lg bg-emerald-600 dark:bg-emerald-500 flex items-center justify-center text-white font-bold text-lg shadow-sm">
              መ
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                Mela Market <span className="font-semibold text-emerald-600 dark:text-emerald-400">· መላ ገበያ</span>
              </span>
            </div>
          </button>

          {/* Zone 2: Navigation Links (Desktop) */}
          <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-600 dark:text-slate-300">
            <button
              onClick={() => onNavigate('home')}
              className={`hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors whitespace-nowrap shrink-0 ${
                currentView === 'home' ? 'text-emerald-600 dark:text-emerald-400 font-semibold' : ''
              }`}
            >
              {t('nav.home')}
            </button>
            <button
              onClick={() => onNavigate('browse')}
              className={`hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors whitespace-nowrap shrink-0 ${
                currentView === 'browse' ? 'text-emerald-600 dark:text-emerald-400 font-semibold' : ''
              }`}
            >
              {t('nav.browse')}
            </button>
            {user && (
              <button
                onClick={() => onNavigate('dashboard')}
                className={`hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors whitespace-nowrap shrink-0 ${
                  currentView === 'dashboard' ? 'text-emerald-600 dark:text-emerald-400 font-semibold' : ''
                }`}
              >
                {t('nav.dashboard')}
              </button>
            )}
            {isAdmin && (
              <button
                onClick={() => onNavigate('admin')}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 hover:bg-amber-100 transition-colors whitespace-nowrap shrink-0 ${
                  currentView === 'admin' ? 'font-semibold' : ''
                }`}
              >
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>{t('nav.admin')}</span>
              </button>
            )}
          </nav>

          {/* Zone 3: Actions (Language + Auth + Post Listing) */}
          <div className="hidden md:flex items-center gap-3 shrink-0">
            {/* Compact Language Selector */}
            <LanguageSelector />

            {/* User Profile / Auth Button */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors border border-slate-200 dark:border-slate-700"
                >
                  <UserIcon className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="max-w-[100px] truncate">{user.name}</span>
                </button>

                {userDropdownOpen && (
                  <div
                    className="absolute right-0 mt-2 w-48 rounded-xl bg-white dark:bg-slate-900 shadow-xl border border-slate-200 dark:border-slate-800 py-1.5 z-50"
                    onMouseLeave={() => setUserDropdownOpen(false)}
                  >
                    <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800">
                      <p className="text-xs font-semibold text-slate-900 dark:text-white truncate">{user.name}</p>
                      <p className="text-[11px] text-slate-500 truncate">{user.email}</p>
                      <span className="inline-block mt-1 text-[10px] uppercase font-semibold text-emerald-600 dark:text-emerald-400">
                        {user.role}
                      </span>
                    </div>
                    <button
                      onClick={() => {
                        onNavigate('dashboard');
                        setUserDropdownOpen(false);
                      }}
                      className="flex items-center gap-2 w-full px-3 py-2 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                      <Package className="w-3.5 h-3.5" />
                      {t('dashboard.myListings')}
                    </button>
                    <button
                      onClick={() => {
                        onNavigate('dashboard');
                        setUserDropdownOpen(false);
                      }}
                      className="flex items-center gap-2 w-full px-3 py-2 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      {t('nav.inquiries')}
                    </button>
                    {isAdmin && (
                      <button
                        onClick={() => {
                          onNavigate('admin');
                          setUserDropdownOpen(false);
                        }}
                        className="flex items-center gap-2 w-full px-3 py-2 text-xs text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/30"
                      >
                        <ShieldAlert className="w-3.5 h-3.5" />
                        {t('nav.admin')}
                      </button>
                    )}
                    <button
                      onClick={() => {
                        logout();
                        setUserDropdownOpen(false);
                      }}
                      className="flex items-center gap-2 w-full px-3 py-2 text-xs text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 border-t border-slate-100 dark:border-slate-800"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      {t('nav.logout')}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={onOpenAuthModal}
                className="px-3.5 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors whitespace-nowrap"
              >
                {t('nav.login')}
              </button>
            )}

            {/* Primary Action Button: Post Ad */}
            <button
              onClick={() => {
                if (!user) {
                  onOpenAuthModal();
                } else {
                  onOpenPostModal();
                }
              }}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg shadow-sm transition-all whitespace-nowrap shrink-0 hover:shadow-emerald-600/20"
            >
              <PlusCircle className="w-4 h-4" />
              <span>{t('nav.postAd')}</span>
            </button>
          </div>

          {/* Mobile Right Controls: Language & Hamburger */}
          <div className="flex md:hidden items-center gap-2">
            <LanguageSelector />
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 pt-3 pb-5 space-y-3 shadow-lg">
          <nav className="flex flex-col space-y-2">
            <button
              onClick={() => {
                onNavigate('home');
                setMobileMenuOpen(false);
              }}
              className={`px-3 py-2 rounded-lg text-left text-sm font-medium ${
                currentView === 'home'
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 font-semibold'
                  : 'text-slate-700 dark:text-slate-300'
              }`}
            >
              {t('nav.home')}
            </button>
            <button
              onClick={() => {
                onNavigate('browse');
                setMobileMenuOpen(false);
              }}
              className={`px-3 py-2 rounded-lg text-left text-sm font-medium ${
                currentView === 'browse'
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 font-semibold'
                  : 'text-slate-700 dark:text-slate-300'
              }`}
            >
              {t('nav.browse')}
            </button>
            {user && (
              <button
                onClick={() => {
                  onNavigate('dashboard');
                  setMobileMenuOpen(false);
                }}
                className={`px-3 py-2 rounded-lg text-left text-sm font-medium ${
                  currentView === 'dashboard'
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 font-semibold'
                    : 'text-slate-700 dark:text-slate-300'
                }`}
              >
                {t('nav.dashboard')}
              </button>
            )}
            {isAdmin && (
              <button
                onClick={() => {
                  onNavigate('admin');
                  setMobileMenuOpen(false);
                }}
                className={`px-3 py-2 rounded-lg text-left text-sm font-medium text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 ${
                  currentView === 'admin' ? 'font-semibold' : ''
                }`}
              >
                {t('nav.admin')}
              </button>
            )}
          </nav>

          <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex flex-col gap-2.5">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                if (!user) {
                  onOpenAuthModal();
                } else {
                  onOpenPostModal();
                }
              }}
              className="flex items-center justify-center gap-2 w-full py-2.5 text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg shadow-sm"
            >
              <PlusCircle className="w-4 h-4" />
              <span>{t('nav.postAd')}</span>
            </button>

            {user ? (
              <div className="flex items-center justify-between pt-2">
                <span className="text-xs text-slate-500 dark:text-slate-400 truncate">
                  {user.name} ({user.role})
                </span>
                <button
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }}
                  className="text-xs text-rose-600 font-semibold hover:underline"
                >
                  {t('nav.logout')}
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenAuthModal();
                }}
                className="w-full py-2 text-center text-xs font-semibold text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700 rounded-lg"
              >
                {t('nav.login')} / {t('nav.register')}
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
