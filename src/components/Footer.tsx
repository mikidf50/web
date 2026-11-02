import React from 'react';
import { Phone, MapPin, ShieldCheck, Store, MessageCircle, HelpCircle, Info } from 'lucide-react';
import { Language } from '../types';
import { SUPPORT_PHONE } from '../data/mockData';
import { TRANSLATIONS } from '../data/translations';
import { WhatsAppIcon } from './WhatsAppIcon';

interface FooterProps {
  language: Language;
  onAboutClick?: () => void;
  onHelpClick?: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  language,
  onAboutClick,
  onHelpClick,
}) => {
  const t = TRANSLATIONS[language];
  const isAm = language === 'am';
  const isTi = language === 'ti';

  return (
    <footer className="bg-slate-900 text-slate-300 pt-12 pb-8 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-10 border-b border-slate-800">
          {/* Brand info */}
          <div className="md:col-span-1 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold">
                <Store className="w-5 h-5 text-amber-300" />
              </div>
              <span className="text-xl font-black text-white">{t.siteTitle}</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              {t.heroSubheading}
            </p>

            {/* Contacts: Phone & WhatsApp */}
            <div className="pt-2 flex flex-col gap-2">
              <a
                href={`tel:${SUPPORT_PHONE}`}
                className="inline-flex items-center gap-2.5 bg-emerald-950 border border-emerald-700/60 hover:border-emerald-500 text-white font-bold px-3.5 py-2 rounded-xl text-xs sm:text-sm transition-all"
              >
                <Phone className="w-4 h-4 text-amber-400" />
                <span>{SUPPORT_PHONE}</span>
              </a>

              <a
                href="https://wa.me/brmiki21"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-emerald-900/80 hover:bg-emerald-900 border border-emerald-600 text-amber-300 hover:text-white font-bold px-3.5 py-2 rounded-xl text-xs transition-all shadow-xs"
                title="Direct chat on WhatsApp (@brmiki21)"
              >
                <WhatsAppIcon className="w-4 h-4 fill-amber-300 shrink-0" />
                <span>WhatsApp: @brmiki21</span>
              </a>
            </div>
          </div>

          {/* Quick Links: About, Help Center, Categories */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 mb-3">
              {isTi ? 'ገጻት መላ ዕዳጋ' : isAm ? 'ገጾች እና መረጃዎች' : 'Mela Market Pages'}
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <button
                  type="button"
                  onClick={onAboutClick}
                  className="hover:text-white transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <Info className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{isTi ? 'ብዛዕባና (About)' : isAm ? 'ስለ እኛ (About)' : 'About Mela Market'}</span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={onHelpClick}
                  className="hover:text-white transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <HelpCircle className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{isTi ? 'ናይ ሓገዝ ማእከል (Help Center)' : isAm ? 'የእርዳታ ማዕከል (Help Center)' : 'Help Center'}</span>
                </button>
              </li>
              <li className="hover:text-white transition-colors">
                <span>{language === 'ti' ? 'ቡንን ቀመማትን' : language === 'am' ? 'ቡና እና ቅመማ ቅመም' : 'Coffee & Spices'}</span>
              </li>
              <li className="hover:text-white transition-colors">
                <span>{language === 'ti' ? 'ስልኪታትን ቴክኖሎጂን' : language === 'am' ? 'ስልኮችና ቴክኖሎጂ' : 'Smartphones & Tech'}</span>
              </li>
              <li className="hover:text-white transition-colors">
                <span>{language === 'ti' ? 'ናይ ቆርበት ፍርያት' : language === 'am' ? 'የቆዳ ውጤቶች' : 'Leather Goods'}</span>
              </li>
            </ul>
          </div>

          {/* Customer Support */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 mb-3">
              {t.directSupport}
            </h4>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li className="flex items-center gap-2">
                <a
                  href="https://wa.me/brmiki21"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white font-bold text-slate-200 underline inline-flex items-center gap-1.5"
                  title="WhatsApp: @brmiki21"
                >
                  <WhatsAppIcon className="w-3.5 h-3.5 fill-emerald-400 text-emerald-400 shrink-0" />
                  <span>@brmiki21 (WhatsApp)</span>
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-emerald-400" />
                <a href={`tel:${SUPPORT_PHONE}`} className="hover:text-white font-bold text-slate-200">
                  {SUPPORT_PHONE}
                </a>
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                <span>Addis Ababa & Tigray Region</span>
              </li>
              <li className="flex items-center gap-2">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>{t.verifiedSellers}</span>
              </li>
            </ul>
          </div>

          {/* Payments & Assurance */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 mb-3">
              {t.paymentMethod}
            </h4>
            <p className="text-xs text-slate-400 mb-3">
              {t.paymentAccepted}
            </p>
            <div className="flex flex-wrap gap-1.5 text-[11px] font-bold">
              <span className="px-2.5 py-1 bg-slate-800 text-emerald-400 rounded-md border border-slate-700">
                Telebirr
              </span>
              <span className="px-2.5 py-1 bg-slate-800 text-purple-400 rounded-md border border-slate-700">
                CBE Birr
              </span>
              <span className="px-2.5 py-1 bg-slate-800 text-amber-400 rounded-md border border-slate-700">
                Cash
              </span>
            </div>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2">
          <div>
            © {new Date().getFullYear()} {t.copyright}
          </div>
          <div className="flex items-center gap-3">
            <a
              href="https://wa.me/brmiki21"
              target="_blank"
              rel="noopener noreferrer"
              className="text-amber-400 hover:text-white font-bold inline-flex items-center gap-1.5"
            >
              <WhatsAppIcon className="w-3.5 h-3.5 fill-amber-400 shrink-0" />
              <span>WhatsApp: @brmiki21</span>
            </a>
            <span>•</span>
            <a href={`tel:${SUPPORT_PHONE}`} className="font-bold text-slate-300 hover:text-white">
              {SUPPORT_PHONE}
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};
