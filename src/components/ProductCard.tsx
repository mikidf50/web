import React from 'react';
import { MapPin, Eye, Camera, MessageSquare } from 'lucide-react';
import { Product } from '../types';
import { useLanguage } from '../context/LanguageContext';

interface ProductCardProps {
  product: Product;
  onViewDetails: (product: Product) => void;
  onInquire: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onViewDetails,
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

  // Default context imagery based on category if photo_data is not set
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
    <div className="group flex flex-col overflow-hidden rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 shadow-sm hover:shadow-md transition-all duration-200">
      {/* Product Image Area */}
      <div 
        onClick={() => onViewDetails(product)}
        className="relative aspect-[4/3] w-full bg-slate-100 dark:bg-slate-800 overflow-hidden cursor-pointer"
      >
        {imgSrc ? (
          <img
            src={imgSrc}
            alt={product.title}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900 text-slate-400">
            <Camera className="w-8 h-8 mb-1 opacity-40" />
            <span className="text-[11px] font-medium">{t('hero.directCameraNotice')}</span>
          </div>
        )}

        {/* Quiet Condition Tag Overlay */}
        <div className="absolute top-2.5 left-2.5">
          <span className="px-2.5 py-1 text-[11px] font-semibold rounded-md bg-slate-950/80 text-white backdrop-blur-sm">
            {getConditionLabel(product.condition)}
          </span>
        </div>
      </div>

      {/* Content Area */}
      <div className="p-4 flex flex-col flex-1">
        {/* Unboxed Metadata Header (Anti-pill) */}
        <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mb-1.5">
          <span className="font-medium text-emerald-600 dark:text-emerald-400">{getCategoryTitle()}</span>
          <span aria-hidden="true">·</span>
          <span className="truncate">{product.location}</span>
        </div>

        {/* Product Title */}
        <h3
          onClick={() => onViewDetails(product)}
          className="text-sm font-semibold text-slate-900 dark:text-white line-clamp-2 hover:text-emerald-600 dark:hover:text-emerald-400 cursor-pointer transition-colors mb-2"
        >
          {product.title}
        </h3>

        {/* Price & Views */}
        <div className="mt-auto pt-2 flex items-baseline justify-between border-t border-slate-100 dark:border-slate-800/80">
          <div className="flex items-baseline gap-1">
            <span className="text-base sm:text-lg font-bold tabular-nums text-slate-900 dark:text-white">
              {formatPrice(product.price)}
            </span>
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              {product.currency || t('common.currency')}
            </span>
          </div>

          <div className="flex items-center gap-1 text-[11px] text-slate-400">
            <Eye className="w-3.5 h-3.5" />
            <span className="tabular-nums">{product.views_count || 0}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-3 grid grid-cols-2 gap-2 pt-2">
          <button
            onClick={() => onViewDetails(product)}
            className="w-full py-1.5 px-2 text-xs font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors text-center"
          >
            {t('products.details')}
          </button>
          <button
            onClick={() => onInquire(product)}
            className="w-full py-1.5 px-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg transition-colors flex items-center justify-center gap-1 shadow-sm"
          >
            <MessageSquare className="w-3 h-3" />
            <span>{t('detail.contactSeller')}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
