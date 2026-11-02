import React from 'react';
import { X, Store, Target, ShieldCheck, Heart, Users, MessageCircle, Phone } from 'lucide-react';
import { Language } from '../types';
import { SUPPORT_PHONE } from '../data/mockData';
import { WhatsAppIcon } from './WhatsAppIcon';

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
}

export const AboutModal: React.FC<AboutModalProps> = ({ isOpen, onClose, language }) => {
  if (!isOpen) return null;

  const isAm = language === 'am';
  const isTi = language === 'ti';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-fade-in">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200">
        {/* Header */}
        <div className="p-5 sm:p-6 bg-slate-50 border-b border-slate-200 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-700 text-white flex items-center justify-center shadow-xs">
              <Store className="w-6 h-6 text-amber-300" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                {isTi ? 'ብዛዕባ መላ ዕዳጋ' : isAm ? 'ስለ መላ ገበያ' : 'About Mela Market'}
              </h2>
              <p className="text-xs text-slate-500">
                {isTi ? 'ዲጂታል ዕዳጋ ኢትዮጵያ' : isAm ? 'የኢትዮጵያ ዲጂታል የገበያ መድረክ' : 'Ethiopian Digital Marketplace'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-full transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 sm:p-8 space-y-6 text-slate-700 text-sm leading-relaxed">
          {/* Intro */}
          <div className="space-y-3">
            <h3 className="text-xl font-black text-slate-900">
              {isTi
                ? 'እንቋዕ ናብ መላ ዕዳጋ ብደሓን መጻእኹም'
                : isAm
                ? 'እንኳን ወደ መላ ገበያ በደህና መጡ'
                : 'Welcome to Mela Market'}
            </h3>
            <p>
              {isTi
                ? 'መላ ዕዳጋ ኣብ መላእ ኢትዮጵያ ንዝርከቡ ዓደግትን ሸየጥትን ብቐጥታ ዘራኽብ ዘመናዊ ዲጂታል የገበያ መድረኽ እዩ። ሓደስትን ዝተጠቀምኩምሎምን ኣቑሑት፣ ናይ ከባቢ ፍርያታት፣ ኤሌክትሮኒክስ፣ ተሽከርከርቲን ኣባይትን ብተኣማንነት ንክትገበየዩ ዝተዳለወ እዩ።'
                : isAm
                ? 'መላ ገበያ በመላው ኢትዮጵያ ያሉ ገዢዎችን እና ሻጮችን በቀጥታ የሚያገናኝ ዘመናዊ ዲጂታል የገበያ መድረክ ነው። ያገለገሉ እና አዳዲስ እቃዎችን፣ የሀገር ውስጥ ምርቶችን፣ ኤሌክትሮኒክስ፣ ተሽከርካሪዎችን እና ቤቶችን በታማኝነት እና በፍጥነት ለመገበያየት የተዘጋጀ ነው።'
                : 'Mela Market is a premier Ethiopian digital marketplace connecting verified local merchants, individual sellers, and buyers across Addis Ababa, Tigray, and all regional centers. We empower local commerce by making buying and selling safe, transparent, and direct.'}
            </p>
          </div>

          {/* Pillars */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200">
              <Target className="w-6 h-6 text-emerald-700 mb-2" />
              <h4 className="font-bold text-slate-900 text-sm mb-1">
                {isTi ? 'ዕላማና' : isAm ? 'ዓላማችን' : 'Our Mission'}
              </h4>
              <p className="text-xs text-slate-600">
                {isTi
                  ? 'ኣብ ኢትዮጵያ ዲጂታል ንግዲ ምቅልጣፍን ተዓማኒነት ዘለዎ የገበያ ስርዓት ምፍጣር።'
                  : isAm
                  ? 'በኢትዮጵያ ዲጂታል ግብይትን ማቀላጠፍና የታመነ የገበያ ስርዓት መገንባት።'
                  : 'To accelerate digital commerce across Ethiopia and provide a reliable, transparent peer-to-peer marketplace.'}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200">
              <ShieldCheck className="w-6 h-6 text-amber-700 mb-2" />
              <h4 className="font-bold text-slate-900 text-sm mb-1">
                {isTi ? 'ተኣማንነት' : isAm ? 'ደህንነትና እምነት' : 'Trust & Safety'}
              </h4>
              <p className="text-xs text-slate-600">
                {isTi
                  ? 'ዝተረጋገጸ ናይ ሻያጢ መንነት፣ ብተሓባባርነት ዝተረጋገጹ ርእይቶታትን ቅልጡፍ ምብጻሕን።'
                  : isAm
                  ? 'የተረጋገጡ ሻጮች፣ የተረጋገጠ የግዢ ግምገማዎች እና ደህንነቱ የተጠበቀ ክፍያ።'
                  : 'Verified merchant accounts, verified-purchase reviews, and secure payment processing.'}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-100 border border-slate-200">
              <Users className="w-6 h-6 text-slate-700 mb-2" />
              <h4 className="font-bold text-slate-900 text-sm mb-1">
                {isTi ? 'ማሕበረሰብና' : isAm ? 'ማህበረሰባችን' : 'Our Community'}
              </h4>
              <p className="text-xs text-slate-600">
                {isTi
                  ? 'ካብ ኣዲስ ኣበባ ክሳብ ትግራይ ንዝርከቡ ኩሎም ዜጋታት ዘገልግል ምቹእ መድረኽ።'
                  : isAm
                  ? 'ከአዲስ አበባ እስከ ትግራይ ያሉትን ሁሉንም የህብረተሰብ ክፍሎች የሚያስተሳስር።'
                  : 'Bridging cities, sub-cities, and regional woredas with localized support.'}
              </p>
            </div>
          </div>

          {/* WhatsApp Direct Contact Callout */}
          <div className="p-5 rounded-2xl bg-emerald-800 text-white flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="space-y-1 text-center sm:text-left">
              <div className="font-bold text-base flex items-center justify-center sm:justify-start gap-2">
                <WhatsAppIcon className="w-5 h-5 fill-amber-300 text-amber-300" />
                <span>{isTi ? 'ብዋትስኣፕ ይገናኙና' : isAm ? 'በዋትስአፕ ያግኙን' : 'Connect on WhatsApp'}</span>
              </div>
              <p className="text-xs text-emerald-100">
                {isTi ? 'ናይ ዋትስኣፕ ተጠቃሚ ስም፦ ' : isAm ? 'የዋትስአፕ ተጠቃሚ ስም፦ ' : 'WhatsApp Username: '}
                <strong className="text-white">@brmiki21</strong>
              </p>
            </div>
            <a
              href="https://wa.me/brmiki21"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold px-4 py-2.5 rounded-xl text-xs transition-colors shrink-0 shadow-md"
            >
              <WhatsAppIcon className="w-4 h-4 fill-slate-950 text-slate-950" />
              <span>Contact us on WhatsApp (@brmiki21)</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
