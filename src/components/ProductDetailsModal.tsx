import React from 'react';
import { X, MapPin, Eye, Calendar, Phone, Mail, ShieldCheck, MessageSquare, AlertCircle } from 'lucide-react';
import { Product } from '../types';
import { useLanguage } from '../context/LanguageContext';

interface ProductDetailsModalProps {
  product: Product;
  onClose: () => void;
  onInquire: (product: Product) => void;
}

export const ProductDetailsModal: React.FC<ProductDetailsModalProps> = ({
  product,
  onClose,
  onInquire,
}) => {
  const { t, language } = useLanguage();

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getConditionLabel = (condition: 'new' | 'used') => {
    if (condition === 'new') return t('filters.condition.new');
    return t('filters.condition.used');
  };

  const getCategoryTitle = () => {
    if (language === 'am') return product.category_name_am || product.category_id;
    if (language === 'ti') return product.category_name_ti || product.category_id;
    return product.category_name_en || product.category_id;
  };

  const getProductImage = () => {
    if (product.photo_data) return product.photo_data;
    if (product.category_id === 'cat_phones_computers' || product.category_id === 'cat_electronics') {
      return '/src/assets/images/category_tech_devices_1794209517385.jpg';
    }
    if (product.category_id === 'cat_clothing' || product.category_id === 'cat_others') {
      return '/src/assets/images/category_habesha_craft_1794209517890.jpg';
    }
    if (product.category_id === 'cat_vehicles' || product.category_id === 'cat_property') {
      return '/src/assets/images/hero_mela_marketplace_1794209518438.jpg';
    }
    return null;
  };

  const imgSrc = getProductImage();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-3xl overflow-hidden rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl text-slate-900 dark:text-white my-8 max-h-[90vh] flex flex-col">
        {/* Modal Top Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              {getCategoryTitle()}
            </span>
            <span className="text-xs text-slate-400">·</span>
            <span className="text-xs text-slate-500">{product.location}</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="overflow-y-auto p-6 space-y-6">
          {/* Main Visual */}
          <div className="relative aspect-[16/9] w-full rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-800">
            {imgSrc ? (
              <img
                src={imgSrc}
                alt={product.title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-400">
                <span>{t('hero.directCameraNotice')}</span>
              </div>
            )}
            <div className="absolute top-3 left-3">
              <span className="px-3 py-1 text-xs font-semibold rounded-md bg-slate-950/80 text-white backdrop-blur-sm">
                {getConditionLabel(product.condition)}
              </span>
            </div>
          </div>

          {/* Title and Price */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                {product.title}
              </h2>
              <div className="flex items-center gap-3 mt-1.5 text-xs text-slate-500 dark:text-slate-400">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  {product.location}
                </span>
                <span>·</span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  {new Date(product.created_at).toLocaleDateString()}
                </span>
                <span>·</span>
                <span className="flex items-center gap-1">
                  <Eye className="w-3.5 h-3.5 text-slate-400" />
                  <span className="tabular-nums">{product.views_count || 0}</span> {t('products.views')}
                </span>
              </div>
            </div>

            <div className="text-left sm:text-right">
              <span className="text-2xl sm:text-3xl font-extrabold tabular-nums text-slate-900 dark:text-white">
                {formatPrice(product.price)}
              </span>
              <span className="ml-1 text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                {product.currency || t('common.currency')}
              </span>
            </div>
          </div>

          {/* Description */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              {t('post.description')}
            </h4>
            <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line bg-slate-50 dark:bg-slate-800/40 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
              {product.description}
            </p>
          </div>

          {/* Seller Card */}
          <div className="p-4 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                <ShieldCheck className="w-4 h-4" />
                <span>{t('detail.sellerInfo')}</span>
              </div>
              <p className="text-base font-bold text-slate-900 dark:text-white mt-1">
                {product.seller_name || 'Verified Marketplace Seller'}
              </p>
              {product.seller_phone && (
                <p className="text-xs text-slate-600 dark:text-slate-400 flex items-center gap-1.5 mt-1">
                  <Phone className="w-3 h-3 text-slate-400" />
                  <span>{product.seller_phone}</span>
                </p>
              )}
            </div>

            <button
              onClick={() => {
                onClose();
                onInquire(product);
              }}
              className="px-5 py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl transition-all shadow-md flex items-center justify-center gap-1.5 shrink-0"
            >
              <MessageSquare className="w-4 h-4" />
              <span>{t('detail.contactSeller')}</span>
            </button>
          </div>

          {/* Safety Guidelines */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 text-xs space-y-1.5">
            <div className="flex items-center gap-1.5 font-semibold text-slate-800 dark:text-slate-200">
              <AlertCircle className="w-4 h-4 text-amber-500" />
              <span>{t('detail.safetyTips')}</span>
            </div>
            <ul className="list-disc list-inside text-slate-500 dark:text-slate-400 space-y-1 pl-1">
              <li>{t('detail.safetyTip1')}</li>
              <li>{t('detail.safetyTip2')}</li>
              <li>{t('detail.safetyTip3')}</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
