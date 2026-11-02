import React, { useState } from 'react';
import {
  X,
  HelpCircle,
  UserPlus,
  ShoppingBag,
  Camera,
  Truck,
  MessageCircle,
  Phone,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { Language } from '../types';
import { SUPPORT_PHONE } from '../data/mockData';
import { WhatsAppIcon } from './WhatsAppIcon';

interface HelpCenterModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
}

export const HelpCenterModal: React.FC<HelpCenterModalProps> = ({
  isOpen,
  onClose,
  language,
}) => {
  const [openSection, setOpenSection] = useState<number | null>(0);

  if (!isOpen) return null;

  const isAm = language === 'am';
  const isTi = language === 'ti';

  const guides = [
    {
      icon: <UserPlus className="w-5 h-5 text-emerald-700" />,
      titleEn: '1. Registration & Login',
      titleAm: '1. ምዝገባ እና አጠቃቀም (Registration & Login)',
      titleTi: '1. ምዝገባን ኣተኣታትዋን (Registration & Login)',
      contentEn:
        'To sell products or submit verified reviews, you must have an active account. Click "Login" in the header and choose "Register" to create an account with your full name, phone number, and password. Once logged in, your session remains active.',
      contentAm:
        'እቃዎችን ለመሸጥ ወይም የተረጋገጠ ግምገማ ለመስጠት መለያ ሊኖርዎት ይገባል። ከላይ "ይግቡ" የሚለውን ተጭነው "ይመዝገቡ" የሚለውን በመምረጥ ስምዎን፣ ስልክ ቁጥርዎንና የይለፍ ቃልዎን በማስገባት ይመዝገቡ።',
      contentTi:
        'ኣቑሑት ንምሻጥ ወይ ዝተረጋገጸ ርእይቶ ንምሃብ ንቑሕ ሕሳብ ክህልወኩም ይግባእ። "እተዉ" ዝብል ጠዊቕኩም "ተመዝገቡ" ብምምራጽ ብስምኩም፣ ቁጽሪ ስልክኹምን መሕለፊ ቃልኩምን ተመዝገቡ።',
    },
    {
      icon: <ShoppingBag className="w-5 h-5 text-emerald-700" />,
      titleEn: '2. Buying Products & Payment',
      titleAm: '2. እቃ መግዛት እና ክፍያ መፈጸም (Buying & Payment)',
      titleTi: '2. ኣቑሑት ምዕዳግን ክፍሊትን (Buying & Payment)',
      contentEn:
        'Browse products by Category or Location (Addis Ababa sub-cities and Tigray woredas). Click "Add to Cart" or "Call Seller". In your shopping cart, review items and checkout using Telebirr, CBE Birr, or Cash on Delivery. Same-day delivery is available.',
      contentAm:
        'በምድብ ወይም በአካባቢ (የአዲስ አበባ ክፍለ ከተሞች እና የትግራይ ወረዳዎች) እቃዎችን ይፈልጉ። "ወደ ቅርጫት ጨምር" ወይም "ይደውሉ" የሚለውን ይጠቀሙ። በቅርጫትዎ ውስጥ የቴሌብር፣ የሲቢኢ ብር ወይም ሲደርስ በጥሬ ክፍያን ይምረጡ።',
      contentTi:
        'ብምድብ ወይ ብቦታ (ናይ ኣዲስ ኣበባ ክፍለ ከተማታትን ናይ ትግራይ ወረዳታትን) ኣቑሑት ድለዩ። "ናብ ቅርጫት ወስኽ" ወይ "ደውሉ" ተጠቐሙ። ኣብ ቅርጫትኩም ብቴሌብር፣ ሲቢኢ ብር ወይ ምስ በጽሐ ብጥረ ገንዘብ ክፍሊት ፈጽሙ።',
    },
    {
      icon: <Camera className="w-5 h-5 text-emerald-700" />,
      titleEn: '3. Selling & Live Camera Product Upload',
      titleAm: '3. እቃ መሸጥ እና በካሜራ ፎቶ ማንሳት (Selling & Photo Capture)',
      titleTi: '3. ኣቕሓ ምሻጥን ብካሜራ ስእሊ ምልዓልን (Selling & Camera Upload)',
      contentEn:
        'Click "Post Ad" to list an item. For security and trust, sellers must capture live photos directly using their phone or device camera ("Take Product Photo"). Uploads from gallery or screenshots are strictly disallowed. Select your exact Region, Zone, and Woreda.',
      contentAm:
        'እቃ ለመሸጥ "ማስታወቂያ ይለጥፉ" የሚለውን ይጫኑ። ለደህንነት እና ለእምነት ሲባል ሻጮች የእቃውን ፎቶ በስልክ ወይም በኮምፒዩተር ካሜራ በቀጥታ ማንሳት አለባቸው ("Take Product Photo")። ስክሪንሾት ወይም ከጋለሪ መጫን አይፈቀድም። ትክክለኛ ክልል፣ ዞንና ወረዳ ይምረጡ።',
      contentTi:
        'ኣቕሓ ንምሻጥ "ምልክታ ልጠፉ" ጠውቑ። ንተኣማንነትን ድሕንነትን ክብል ሸየጥቲ ናይቲ ኣቕሓ ስእሊ ብቐጥታ ብካሜራ ከልዕሉ ኣለዎም ("Take Product Photo")። ስክሪንሾት ወይ ካብ ጋለሪ ምጽዓን ኣይፍቀድን። ዞባን ወረዳን ምረጹ።',
    },
    {
      icon: <Truck className="w-5 h-5 text-emerald-700" />,
      titleEn: '4. Order Management & Verified Purchase Reviews',
      titleAm: '4. የትዕዛዝ ክትትል እና የተረጋገጠ ግዢ ግምገማ (Orders & Reviews)',
      titleTi: '4. ክትትል ትእዛዛትን ዝተረጋገጸ ዕዳጋ ርእይቶን (Orders & Reviews)',
      contentEn:
        'Once your order is delivered, you can write a Verified Purchase review on the product page. Only verified buyers with completed deliveries can submit reviews and 1-5 star ratings. Unverified or duplicate reviews are automatically blocked.',
      contentAm:
        'ትዕዛዝዎ ደርሶ ከተጠናቀቀ በኋላ በእቃው ገጽ ላይ "የተረጋገጠ ግዢ" ግምገማ መጻፍ ይችላሉ። እቃውን ገዝተው የተቀበሉ ደንበኞች ብቻ ደረጃ እና አስተያየት መስጠት ይችላሉ።',
      contentTi:
        'ትእዛዝኩም ምስ በጽሐ ኣብቲ ናይ ኣቕሓ ገጽ "ዝተረጋገጸ ዕዳጋ" ርእይቶ ክትጽሕፉ ትኽእሉ ኢኹም። ዝዓደጉ ደንበኛታት ጥራይ ርእይቶ ክህቡ ይፍቀደሎም።',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-fade-in">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200">
        {/* Header */}
        <div className="p-5 sm:p-6 bg-slate-50 border-b border-slate-200 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-700 text-white flex items-center justify-center shadow-xs">
              <HelpCircle className="w-6 h-6 text-amber-300" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                {isTi ? 'ናይ ሓገዝ ማእከል' : isAm ? 'የእርዳታ ማዕከል' : 'Help Center'}
              </h2>
              <p className="text-xs text-slate-500">
                {isTi
                  ? 'ምዝገባ፣ ምዕዳግ፣ ምሻጥን ምምሕዳር ትእዛዛትን'
                  : isAm
                  ? 'ምዝገባ፣ መግዛት፣ መሸጥና የትዕዛዝ አስተዳደር'
                  : 'Guides on Registration, Buying, Selling, and Orders'}
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
        <div className="p-6 sm:p-8 space-y-4">
          <div className="space-y-3">
            {guides.map((item, idx) => {
              const isOpen = openSection === idx;
              const title = isTi ? item.titleTi : isAm ? item.titleAm : item.titleEn;
              const content = isTi ? item.contentTi : isAm ? item.contentAm : item.contentEn;

              return (
                <div
                  key={idx}
                  className="rounded-2xl border border-slate-200 overflow-hidden bg-slate-50/50 transition-colors"
                >
                  <button
                    type="button"
                    onClick={() => setOpenSection(isOpen ? null : idx)}
                    className="w-full p-4 text-left flex items-center justify-between gap-3 hover:bg-slate-100/70 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-emerald-100 flex items-center justify-center shrink-0">
                        {item.icon}
                      </div>
                      <span className="font-bold text-sm text-slate-900">{title}</span>
                    </div>
                    {isOpen ? (
                      <ChevronUp className="w-4 h-4 text-slate-500 shrink-0" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-500 shrink-0" />
                    )}
                  </button>

                  {isOpen && (
                    <div className="p-4 pt-1 pb-5 border-t border-slate-200 text-xs sm:text-sm text-slate-600 leading-relaxed bg-white">
                      {content}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* WhatsApp Direct Help Banner */}
          <div className="mt-6 p-5 rounded-2xl bg-gradient-to-r from-emerald-900 to-green-950 text-white space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <WhatsAppIcon className="w-5 h-5 fill-amber-300 text-amber-300" />
                <span className="font-bold text-sm">
                  {isTi ? 'ተወሳኺ ሓገዝ የድልየኩም ዶ?' : isAm ? 'ተጨማሪ እርዳታ ይፈልጋሉ?' : 'Need direct assistance?'}
                </span>
              </div>
              <span className="text-xs text-emerald-200">
                WhatsApp: <strong className="text-white">@brmiki21</strong>
              </span>
            </div>
            <p className="text-xs text-emerald-100">
              {isTi
                ? 'ምስ ናይ ዓደግቲ ኣገልግሎትና ብዋትስኣፕ ብቐጥታ ንምዝርራብ ኣብዚ ጠውቑ።'
                : isAm
                ? 'ከደንበኞች አገልግሎት ቡድናችን ጋር በዋትስአፕ በቀጥታ ለመነጋገር ከታች ያለውን ይጫኑ።'
                : 'Chat directly with our customer support team on WhatsApp using the link below.'}
            </p>
            <div className="pt-1 flex flex-wrap gap-2">
              <a
                href="https://wa.me/brmiki21"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold px-4 py-2 rounded-xl text-xs shadow-md transition-colors"
              >
                <WhatsAppIcon className="w-4 h-4 fill-slate-950 text-slate-950" />
                <span>Contact us on WhatsApp (@brmiki21)</span>
              </a>
              <a
                href={`tel:${SUPPORT_PHONE}`}
                className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-bold px-4 py-2 rounded-xl text-xs border border-white/20 transition-colors"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>{SUPPORT_PHONE}</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
