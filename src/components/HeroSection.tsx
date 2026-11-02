import React from 'react';
import {
  Phone,
  Search,
  MapPin,
  ShieldCheck,
  Zap,
  Truck,
  PlusCircle,
  MessageCircle,
} from 'lucide-react';
import { Language } from '../types';
import { SUPPORT_PHONE } from '../data/mockData';
import { TRANSLATIONS } from '../data/translations';
import { REGIONS } from '../data/locations';
import { WhatsAppIcon } from './WhatsAppIcon';

interface HeroSectionProps {
  language: Language;
  searchTerm: string;
  onSearchChange: (val: string) => void;
  selectedRegion: string;
  onRegionChange: (val: string) => void;
  selectedZone: string;
  onZoneChange: (val: string) => void;
  onPostAdClick: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  language,
  searchTerm,
  onSearchChange,
  selectedRegion,
  onRegionChange,
  selectedZone,
  onZoneChange,
  onPostAdClick,
}) => {
  const t = TRANSLATIONS[language];
  const isAm = language === 'am';
  const isTi = language === 'ti';

  const activeRegionObj = REGIONS.find((r) => r.id === selectedRegion);

  const handleRegionSelect = (regId: string) => {
    onRegionChange(regId);
    onZoneChange('all');
  };

  return (
    <section className="bg-emerald-800 text-white relative overflow-hidden transition-colors">
      {/* Subtle background texture */}
      <div
        className="absolute inset-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage:
            'radial-gradient(circle at 25px 25px, rgba(255, 255, 255, 0.4) 2%, transparent 0%), radial-gradient(circle at 75px 75px, rgba(255, 255, 255, 0.4) 2%, transparent 0%)',
          backgroundSize: '100px 100px',
        }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-9 sm:py-12 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Top Contact Badges: Small compact phone contact + WhatsApp Contact (@brmiki21) */}
          <div className="mb-5 flex flex-wrap items-center justify-center gap-2.5">
            {/* Small compact phone contact */}
            <a
              href={`tel:${SUPPORT_PHONE}`}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-900/80 hover:bg-emerald-950 border border-emerald-500/50 text-white text-xs sm:text-sm font-semibold transition-all duration-150 active:scale-95 shadow-xs"
              title={`Call ${SUPPORT_PHONE}`}
              aria-label={`Call ${SUPPORT_PHONE}`}
            >
              <Phone className="w-3.5 h-3.5 text-white shrink-0" />
              <span className="tracking-wide">{SUPPORT_PHONE}</span>
            </a>

            <a
              href="https://wa.me/brmiki21"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs sm:text-sm font-bold transition-all duration-150 active:scale-95 shadow-sm"
              title="Open WhatsApp chat with @brmiki21 directly"
            >
              <WhatsAppIcon className="w-4 h-4 fill-slate-950 text-slate-950" />
              <span>Contact us on WhatsApp (@brmiki21)</span>
            </a>
          </div>

          {/* Main Homepage Heading (Exact per language requirement) */}
          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight mb-3">
            {t.heroHeading}
          </h1>

          {/* Subtitle */}
          <p className="text-sm sm:text-base text-emerald-100 max-w-2xl mx-auto mb-7 font-normal leading-relaxed">
            {t.heroSubheading}
          </p>

          {/* Search and Location Filter Box (Addis Ababa sub-cities & Tigray woredas) */}
          <div className="bg-white p-2.5 sm:p-3 rounded-2xl shadow-xl max-w-3xl mx-auto mb-7 border border-emerald-600/30">
            <div className="flex flex-col sm:flex-row items-stretch gap-2">
              {/* Keyword Search Input */}
              <div className="relative flex-1 flex items-center">
                <Search className="w-5 h-5 text-slate-400 absolute left-3.5 pointer-events-none" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => onSearchChange(e.target.value)}
                  placeholder={t.searchPlaceholder}
                  className="w-full pl-11 pr-3 py-2.5 bg-slate-50 hover:bg-slate-100/70 focus:bg-white border-0 rounded-xl text-slate-900 placeholder:text-slate-400 text-sm focus:ring-2 focus:ring-emerald-600 outline-none transition-all"
                />
              </div>

              {/* REQUIREMENT 5: Location Region Dropdown */}
              <div className="relative sm:w-48 flex items-center">
                <MapPin className="w-4 h-4 text-emerald-700 absolute left-3 pointer-events-none z-10" />
                <select
                  value={selectedRegion}
                  onChange={(e) => handleRegionSelect(e.target.value)}
                  className="w-full pl-9 pr-7 py-2.5 bg-slate-100/90 hover:bg-slate-100 border-0 rounded-xl text-slate-800 text-xs sm:text-sm font-semibold focus:ring-2 focus:ring-emerald-600 outline-none appearance-none cursor-pointer transition-all"
                >
                  <option value="all">
                    {isTi ? 'መላእ ኢትዮጵያ' : isAm ? 'መላው ኢትዮጵያ' : 'All Regions'}
                  </option>
                  {REGIONS.map((r) => (
                    <option key={r.id} value={r.id}>
                      {isTi && r.nameTi ? r.nameTi : isAm ? r.nameAm : r.nameEn}
                    </option>
                  ))}
                </select>
                <span className="absolute right-2.5 pointer-events-none text-slate-400 text-[10px]">▼</span>
              </div>

              {/* REQUIREMENT 5: Location Zone / Sub-city Dropdown */}
              {selectedRegion !== 'all' && activeRegionObj && (
                <div className="relative sm:w-48 flex items-center animate-fade-in">
                  <select
                    value={selectedZone}
                    onChange={(e) => onZoneChange(e.target.value)}
                    className="w-full pl-3 pr-7 py-2.5 bg-emerald-50 border border-emerald-300 rounded-xl text-emerald-950 text-xs sm:text-sm font-semibold focus:ring-2 focus:ring-emerald-600 outline-none appearance-none cursor-pointer"
                  >
                    <option value="all">
                      {isTi ? 'ኩሎም ዞባታት / ክ/ከተማ' : isAm ? 'ሁሉም ዞኖች / ክ/ከተማ' : 'All Zones / Sub-cities'}
                    </option>
                    {activeRegionObj.zones.map((z) => (
                      <option key={z.id} value={z.id}>
                        {isTi && z.nameTi ? z.nameTi : isAm ? z.nameAm : z.nameEn}
                      </option>
                    ))}
                  </select>
                  <span className="absolute right-2.5 pointer-events-none text-emerald-700 text-[10px]">▼</span>
                </div>
              )}

              {/* Post Ad Button */}
              <button
                type="button"
                onClick={onPostAdClick}
                className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold px-5 py-2.5 rounded-xl text-xs sm:text-sm transition-all shadow-sm hover:shadow-md flex items-center justify-center gap-1.5 whitespace-nowrap active:scale-[0.98] cursor-pointer"
              >
                <PlusCircle className="w-4 h-4 text-slate-900" />
                <span>{t.postFreeAd}</span>
              </button>
            </div>
          </div>

          {/* Quick Trust Badges Strip (No flags) */}
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2.5 text-xs sm:text-sm text-emerald-100 font-medium">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-amber-300 shrink-0" />
              <span>{t.verifiedSellers}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-amber-300 shrink-0" />
              <span>{t.securePayments}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Truck className="w-4 h-4 text-amber-300 shrink-0" />
              <span>{t.fastDelivery}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
