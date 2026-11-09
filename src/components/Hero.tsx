import React, { useState } from 'react';
import { Search, MapPin, Camera, Sparkles } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { Category } from '../types';

interface HeroProps {
  categories: Category[];
  selectedCategory: string;
  onSearch: (params: { search: string; category: string; location: string }) => void;
  onSelectCategory: (catId: string) => void;
}

const ETHIOPIA_CITIES = [
  'Addis Ababa (አዲስ አበባ)',
  'Hawassa (ሀዋሳ)',
  'Mekelle (መቐለ)',
  'Bahir Dar (ባህር ዳር)',
  'Dire Dawa (ድሬዳዋ)',
  'Adama / Nazret (አዳማ)',
  'Jimma (ጅማ)',
  'Gondar (ጎንደር)',
  'Bishoftu (ቢሾፍቱ)',
  'Asmara (ኣስመራ)'
];

export const Hero: React.FC<HeroProps> = ({
  categories,
  selectedCategory,
  onSearch,
  onSelectCategory,
}) => {
  const { t, language } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryChoice, setCategoryChoice] = useState(selectedCategory || 'all');
  const [locationChoice, setLocationChoice] = useState('all');

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch({
      search: searchTerm,
      category: categoryChoice,
      location: locationChoice === 'all' ? '' : locationChoice.split(' ')[0]
    });
  };

  const getCategoryName = (c: Category) => {
    if (language === 'am') return c.name_am;
    if (language === 'ti') return c.name_ti;
    return c.name_en;
  };

  return (
    <div className="relative overflow-hidden bg-gradient-to-b from-emerald-50/50 via-white to-slate-50/50 text-slate-900 py-12 md:py-20 border-b border-slate-200">
      {/* Background Image with Crisp Light Atmospheric Wash */}
      <div className="absolute inset-0 z-0">
        <img
          src="/src/assets/images/hero_mela_marketplace_1794209518438.jpg"
          alt="Mela Market Showcase"
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover opacity-10 scale-105 transition-transform duration-1000"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-emerald-50/40 via-white/80 to-white" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center space-y-4">
          {/* Trust marker badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold shadow-xs">
            <Camera className="w-3.5 h-3.5 text-emerald-600" />
            <span>{t('hero.directCameraNotice')}</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900 leading-tight">
            {t('hero.title')}
          </h1>

          <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
            {t('hero.subtitle')}
          </p>

          {/* Search Box Card */}
          <form
            onSubmit={handleFormSubmit}
            className="mt-6 p-2 sm:p-3 bg-white rounded-2xl shadow-xl border border-slate-200 text-slate-900"
          >
            <div className="grid grid-cols-1 md:grid-cols-12 gap-2">
              {/* Search Keyword */}
              <div className="md:col-span-5 flex items-center px-3 py-2 bg-slate-50 rounded-xl border border-slate-200 focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-500/20 transition-all">
                <Search className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder={t('hero.searchPlaceholder')}
                  className="w-full bg-transparent text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none"
                />
              </div>

              {/* Category Dropdown */}
              <div className="md:col-span-3 flex items-center px-3 py-2 bg-slate-50 rounded-xl border border-slate-200 focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-500/20 transition-all">
                <select
                  value={categoryChoice}
                  onChange={(e) => setCategoryChoice(e.target.value)}
                  className="w-full bg-transparent text-xs sm:text-sm text-slate-800 focus:outline-none cursor-pointer"
                >
                  <option value="all">{t('hero.allCategories')}</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {getCategoryName(c)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Location Dropdown */}
              <div className="md:col-span-2 flex items-center px-3 py-2 bg-slate-50 rounded-xl border border-slate-200 focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-500/20 transition-all">
                <MapPin className="w-4 h-4 text-slate-400 mr-1.5 shrink-0" />
                <select
                  value={locationChoice}
                  onChange={(e) => setLocationChoice(e.target.value)}
                  className="w-full bg-transparent text-xs sm:text-sm text-slate-800 focus:outline-none cursor-pointer truncate"
                >
                  <option value="all">{t('hero.allLocations')}</option>
                  {ETHIOPIA_CITIES.map((city, idx) => (
                    <option key={idx} value={city}>
                      {city}
                    </option>
                  ))}
                </select>
              </div>

              {/* Submit CTA */}
              <div className="md:col-span-2">
                <button
                  type="submit"
                  className="w-full h-full min-h-[42px] flex items-center justify-center gap-1.5 px-4 py-2 text-xs sm:text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl shadow-md transition-all active:scale-[0.98]"
                >
                  <Search className="w-4 h-4" />
                  <span>{t('hero.searchBtn')}</span>
                </button>
              </div>
            </div>
          </form>

          {/* Quick Categories Bar */}
          <div className="pt-2 flex flex-wrap items-center justify-center gap-1.5 text-xs text-slate-600">
            <span className="text-slate-500 mr-1 font-medium">{t('filters.category')}:</span>
            <button
              onClick={() => onSelectCategory('all')}
              className={`px-3 py-1 rounded-full transition-colors text-xs ${
                selectedCategory === 'all'
                  ? 'bg-emerald-600 text-white font-bold shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              {t('cat.all')}
            </button>
            {categories.slice(0, 6).map((c) => {
              const isSelected = selectedCategory === c.id;
              return (
                <button
                  key={c.id}
                  onClick={() => onSelectCategory(c.id)}
                  className={`px-3 py-1 rounded-full transition-colors text-xs ${
                    isSelected
                      ? 'bg-emerald-600 text-white font-bold shadow-xs'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  {getCategoryName(c)}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
