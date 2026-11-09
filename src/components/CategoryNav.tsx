import React from 'react';
import { 
  Tv, 
  Smartphone, 
  Car, 
  Shirt, 
  Armchair, 
  Refrigerator, 
  Home, 
  Wheat, 
  Package, 
  Grid 
} from 'lucide-react';
import { Category } from '../types';
import { useLanguage } from '../context/LanguageContext';

interface CategoryNavProps {
  categories: Category[];
  selectedCategory: string;
  onSelectCategory: (categoryId: string) => void;
}

const ICON_MAP: Record<string, React.ElementType> = {
  Tv,
  Smartphone,
  Car,
  Shirt,
  Armchair,
  Refrigerator,
  Home,
  Wheat,
  Package,
};

export const CategoryNav: React.FC<CategoryNavProps> = ({
  categories,
  selectedCategory,
  onSelectCategory,
}) => {
  const { t, language } = useLanguage();

  const getCategoryName = (c: Category) => {
    if (language === 'am') return c.name_am;
    if (language === 'ti') return c.name_ti;
    return c.name_en;
  };

  return (
    <div className="py-6 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none no-scrollbar">
          {/* All Categories Option */}
          <button
            onClick={() => onSelectCategory('all')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap shrink-0 transition-all ${
              selectedCategory === 'all'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            <Grid className="w-4 h-4" />
            <span>{t('cat.all')}</span>
          </button>

          {/* 9 Standard Product Categories */}
          {categories.map((c) => {
            const IconComponent = ICON_MAP[c.icon] || Package;
            const isSelected = selectedCategory === c.id;

            return (
              <button
                key={c.id}
                onClick={() => onSelectCategory(c.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap shrink-0 transition-all ${
                  isSelected
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                <IconComponent className="w-4 h-4" />
                <span>{getCategoryName(c)}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
