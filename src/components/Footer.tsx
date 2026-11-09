import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { LanguageSelector } from './LanguageSelector';
import { ShieldCheck, PhoneCall, Mail, MapPin } from 'lucide-react';

interface FooterProps {
  onNavigate: (view: 'home' | 'browse' | 'dashboard' | 'admin', categoryId?: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  const { t } = useLanguage();

  return (
    <footer className="bg-white text-slate-600 border-t border-slate-200 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          {/* Brand Info */}
          <div className="space-y-3 md:col-span-1">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-bold text-sm">
                መ
              </div>
              <span className="text-base font-bold text-slate-900 tracking-tight">
                Mela Market <span className="text-emerald-600">· መላ ገበያ</span>
              </span>
            </div>
            <p className="text-slate-600 leading-relaxed text-xs">
              {t('footer.about')}
            </p>
            <div className="pt-2">
              <LanguageSelector />
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              {t('footer.quickLinks')}
            </h4>
            <ul className="space-y-1.5">
              <li>
                <button
                  onClick={() => onNavigate('home')}
                  className="hover:text-emerald-600 transition-colors"
                >
                  {t('nav.home')}
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('browse')}
                  className="hover:text-emerald-600 transition-colors"
                >
                  {t('nav.browse')}
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('browse', 'cat_vehicles')}
                  className="hover:text-emerald-600 transition-colors"
                >
                  {t('cat.vehicles')}
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('browse', 'cat_phones_computers')}
                  className="hover:text-emerald-600 transition-colors"
                >
                  {t('cat.phones_computers')}
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('browse', 'cat_property')}
                  className="hover:text-emerald-600 transition-colors"
                >
                  {t('cat.property')}
                </button>
              </li>
            </ul>
          </div>

          {/* Trust & Safety */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>{t('footer.safety')}</span>
            </h4>
            <ul className="space-y-1.5 text-slate-600 text-xs">
              <li>• Always inspect items in person</li>
              <li>• Meet at secure daytime public venues</li>
              <li>• Verified live device camera photos only</li>
              <li>• Direct buyer-to-seller negotiation</li>
            </ul>
          </div>

          {/* Contact & Regions */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              {t('footer.contact')}
            </h4>
            <ul className="space-y-2 text-slate-600 text-xs">
              <li className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Bole Sub-City, Addis Ababa, Ethiopia</span>
              </li>
              <li className="flex items-center gap-2">
                <PhoneCall className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>+251 911 002233</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>support@melamarket.com</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
          <p>© {new Date().getFullYear()} Mela Market (መላ ገበያ). {t('footer.rights')}</p>
          <p>{t('footer.poweredBy')}</p>
        </div>
      </div>
    </footer>
  );
};
