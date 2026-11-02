import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  CheckCircle,
  Phone,
  Sparkles,
  Camera,
  RotateCcw,
  AlertCircle,
  Upload,
  Lock,
  UserCheck,
  Check,
} from 'lucide-react';
import { Language, Product, User } from '../types';
import { SUPPORT_PHONE, CATEGORIES } from '../data/mockData';
import { TRANSLATIONS } from '../data/translations';
import { uploadProductImage } from '../lib/supabase';
import { LocationPicker, LocationSelection } from './LocationPicker';
import { REGIONS, ProductLocation } from '../data/locations';

interface SellModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  currentUser: User | null;
  onRequireAuth: () => void;
  onProductCreated?: (product: Product) => void;
}

export const SellModal: React.FC<SellModalProps> = ({
  isOpen,
  onClose,
  language,
  currentUser,
  onRequireAuth,
  onProductCreated,
}) => {
  const t = TRANSLATIONS[language];
  const [submitted, setSubmitted] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Form fields
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState(CATEGORIES[1].id);
  const [price, setPrice] = useState('');
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [description, setDescription] = useState('');

  // REQUIREMENT 5: Dependent Location Selection for Tigray and Addis Ababa
  const [locationSelection, setLocationSelection] = useState<LocationSelection>({
    regionId: 'addis-ababa',
    zoneId: 'bole',
    woredaId: 'bole-w01',
    townId: 'edna-mall',
    specificAddress: '',
  });

  // REQUIREMENT 6: Camera-only Product Photo Capture
  const [capturedFile, setCapturedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isPhotoConfirmed, setIsPhotoConfirmed] = useState(false);
  const [isLiveCameraActive, setIsLiveCameraActive] = useState(false);
  const [cameraPermissionError, setCameraPermissionError] = useState(false);

  const nativeCameraInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Sync phone with logged-in user
  useEffect(() => {
    if (currentUser?.phone) {
      setPhone(currentUser.phone);
    }
  }, [currentUser]);

  // Clean up media stream when closing or unmounting
  useEffect(() => {
    return () => {
      stopCameraStream();
    };
  }, []);

  const stopCameraStream = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsLiveCameraActive(false);
  };

  if (!isOpen) return null;

  // REQUIREMENT 2: Registration required before selling
  if (!currentUser) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-fade-in">
        <div className="bg-white rounded-3xl max-w-md w-full p-6 text-center space-y-4 shadow-2xl border border-slate-200">
          <div className="w-16 h-16 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center mx-auto">
            <Lock className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-slate-900">{t.sellTitle}</h3>
          <p className="text-sm text-slate-600 leading-relaxed">
            {t.loginToSellNotice}
          </p>
          <div className="pt-2 flex flex-col gap-2">
            <button
              type="button"
              onClick={() => {
                onClose();
                onRequireAuth();
              }}
              className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-bold py-3 rounded-xl text-sm transition-colors cursor-pointer shadow-xs"
            >
              {t.login} / {t.register}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="text-xs text-slate-500 hover:text-slate-700 font-semibold py-1 cursor-pointer"
            >
              {t.back}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // REQUIREMENT 6: Camera Activation & Capture Handlers
  const startCameraCapture = async () => {
    setErrorMessage(null);
    setCameraPermissionError(false);

    // Try navigator.mediaDevices.getUserMedia first
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: 'environment' } },
        });
        streamRef.current = stream;
        setIsLiveCameraActive(true);
        setTimeout(() => {
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            videoRef.current.play().catch((err) => console.warn(err));
          }
        }, 100);
        return;
      } catch (err: any) {
        console.warn('Live camera stream error, trying native camera input:', err);
        // If permission explicitly denied
        if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
          setCameraPermissionError(true);
          setErrorMessage(
            language === 'ti'
              ? 'ናይ ካሜራ ፍቓድ ኣይተዋህበን። በጃኹም ኣብ ናይ ብራውዘር መተዓራረዪ ፍቓድ ካሜራ ሃቡ።'
              : language === 'am'
              ? 'የካሜራ ፈቃድ አልተገኘም። እባክዎ በብሮውዘርዎ ሴቲንግ ውስጥ የካሜራ ፈቃድ ይስጡ።'
              : 'Camera permission denied. Please allow camera access in your browser settings to take a product photo.'
          );
          return;
        }
      }
    }

    // Direct native device camera capture trigger
    if (nativeCameraInputRef.current) {
      nativeCameraInputRef.current.click();
    } else {
      setCameraPermissionError(true);
      setErrorMessage(
        language === 'ti'
          ? 'ካሜራ ኣብዚ መሳርሒ ኣይተረኽበን።'
          : language === 'am'
          ? 'በዚህ መሣሪያ ላይ ካሜራ ማግኘት አልተቻለም።'
          : 'No camera hardware found on this device.'
      );
    }
  };

  const capturePhotoFromStream = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 800;
    canvas.height = video.videoHeight || 600;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      canvas.toBlob((blob) => {
        if (blob) {
          const file = new File([blob], `mela-product-camera-${Date.now()}.jpg`, {
            type: 'image/jpeg',
          });
          stopCameraStream();
          setCapturedFile(file);
          setPreviewUrl(URL.createObjectURL(file));
          setIsPhotoConfirmed(false); // require seller to confirm
        }
      }, 'image/jpeg', 0.92);
    }
  };

  const handleNativeCameraFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setCapturedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setIsPhotoConfirmed(false);
      setErrorMessage(null);
    }
  };

  const handleRetakePhoto = () => {
    setPreviewUrl(null);
    setCapturedFile(null);
    setIsPhotoConfirmed(false);
    startCameraCapture();
  };

  const handleConfirmPhoto = () => {
    if (previewUrl && capturedFile) {
      setIsPhotoConfirmed(true);
      setErrorMessage(null);
    }
  };

  // Form Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!currentUser) {
      onRequireAuth();
      return;
    }

    // REQUIREMENT 6: Only captured and confirmed photos can be submitted
    if (!capturedFile || !isPhotoConfirmed) {
      setErrorMessage(
        language === 'ti'
          ? 'በጃኹም ብካሜራ ስእሊ ኣልዒልኩም "ስእሊ ኣረጋግጽ" ጠውቑ።'
          : language === 'am'
          ? 'እባክዎ በካሜራ ፎቶ አንስተው "ፎቶ አረጋግጥ" የሚለውን ይጫኑ።'
          : 'Please capture a photo with your camera and click "Confirm Photo".'
      );
      return;
    }

    setIsUploading(true);

    // Upload to Supabase Storage bucket
    const uploadRes = await uploadProductImage(capturedFile);
    if (uploadRes.error) {
      setIsUploading(false);
      setErrorMessage(uploadRes.error);
      return;
    }

    const finalImageUrl = uploadRes.url;

    // Resolve location labels for display
    const regionObj = REGIONS.find((r) => r.id === locationSelection.regionId);
    const zoneObj = regionObj?.zones.find((z) => z.id === locationSelection.zoneId);
    const woredaObj = zoneObj?.woredas.find((w) => w.id === locationSelection.woredaId);
    const townObj = woredaObj?.towns?.find((t) => t.id === locationSelection.townId);

    const locationEn = `${regionObj?.nameEn || ''}, ${zoneObj?.nameEn || ''}, ${woredaObj?.nameEn || ''}${
      townObj ? ` (${townObj.nameEn})` : ''
    }`;
    const locationAm = `${regionObj?.nameAm || ''}፣ ${zoneObj?.nameAm || ''}፣ ${woredaObj?.nameAm || ''}${
      townObj ? ` (${townObj.nameAm})` : ''
    }`;
    const locationTi = `${regionObj?.nameTi || regionObj?.nameAm || ''}፣ ${
      zoneObj?.nameTi || zoneObj?.nameAm || ''
    }፣ ${woredaObj?.nameTi || woredaObj?.nameAm || ''}${townObj ? ` (${townObj.nameTi || townObj.nameAm})` : ''}`;

    const locationDetails: ProductLocation = {
      regionId: locationSelection.regionId,
      regionNameEn: regionObj?.nameEn || '',
      regionNameAm: regionObj?.nameAm || '',
      regionNameTi: regionObj?.nameTi,
      zoneId: locationSelection.zoneId,
      zoneNameEn: zoneObj?.nameEn || '',
      zoneNameAm: zoneObj?.nameAm || '',
      zoneNameTi: zoneObj?.nameTi,
      woredaId: locationSelection.woredaId,
      woredaNameEn: woredaObj?.nameEn || '',
      woredaNameAm: woredaObj?.nameAm || '',
      woredaNameTi: woredaObj?.nameTi,
      townId: locationSelection.townId,
      townNameEn: townObj?.nameEn,
      townNameAm: townObj?.nameAm,
      townNameTi: townObj?.nameTi,
      specificAddress: locationSelection.specificAddress,
    };

    const selectedCategoryObj = CATEGORIES.find((c) => c.id === category);

    const newProduct: Product = {
      id: `prod-${Date.now()}`,
      titleEn: title,
      titleAm: title,
      titleTi: title,
      category,
      categoryAm: selectedCategoryObj?.nameAm || 'አጠቃላይ',
      categoryTi: selectedCategoryObj?.nameTi || 'ሓፈሻዊ',
      price: parseFloat(price) || 0,
      location: locationEn,
      locationAm: locationAm,
      locationTi: locationTi,
      locationDetails,
      condition: 'Brand New',
      conditionAm: 'አዲስ',
      conditionTi: 'ሓድሽ',
      sellerName: currentUser.name,
      sellerPhone: phone || currentUser.phone || SUPPORT_PHONE,
      sellerId: currentUser.id,
      isVerified: true,
      rating: 5.0,
      reviewsCount: 1,
      descriptionEn: description,
      descriptionAm: description,
      descriptionTi: description,
      featuresEn: ['Live Camera Captured Photo', 'Verified Seller Listing'],
      featuresAm: ['በቀጥታ ካሜራ የተነሳ ፎቶ', 'የተረጋገጠ ሻጭ'],
      featuresTi: ['ብቐጥታ ብካሜራ ዝተላዕለ ስእሊ', 'ዝተረጋገጸ ሻያጢ'],
      inStock: true,
      dateListed: 'Just now',
      imageUrl: finalImageUrl,
      images: [finalImageUrl],
      iconName: 'Package',
    };

    setIsUploading(false);
    setSubmitted(true);

    if (onProductCreated) {
      onProductCreated(newProduct);
    }

    setTimeout(() => {
      setSubmitted(false);
      onClose();
    }, 2200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-fade-in">
      <div className="bg-white rounded-3xl max-w-xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-slate-200">
        {/* Header */}
        <div className="p-5 sm:p-6 bg-slate-50 border-b border-slate-200 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-500" />
            <div>
              <h2 className="text-lg font-bold text-slate-900">{t.sellTitle}</h2>
              <div className="text-[11px] text-emerald-800 font-semibold flex items-center gap-1">
                <UserCheck className="w-3.5 h-3.5" />
                <span>{currentUser.name}</span>
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              stopCameraStream();
              onClose();
            }}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-full transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 sm:p-6">
          {submitted ? (
            <div className="text-center py-8 space-y-3">
              <div className="w-14 h-14 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">{t.listingSubmitted}</h3>
              <p className="text-xs text-slate-500">{t.listingSubmittedDesc}</p>
              <div className="p-3 bg-emerald-50 rounded-xl text-xs font-semibold text-emerald-800">
                <Phone className="w-3.5 h-3.5 inline mr-1" />
                {t.orderCallNotice}{' '}
                <a href={`tel:${SUPPORT_PHONE}`} className="underline font-bold">
                  {SUPPORT_PHONE}
                </a>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {errorMessage && (
                <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs font-semibold text-red-800 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* REQUIREMENT 6: Camera-Only Photo Capture Section (Gallery upload strictly removed) */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-slate-900">
                    {language === 'ti'
                      ? 'ናይ ኣቕሓ ስእሊ (ብካሜራ ጥራይ)'
                      : language === 'am'
                      ? 'የእቃው ፎቶ (በካሜራ ብቻ)'
                      : 'Product Photo (Camera Only)'}
                  </label>
                  <span className="text-[10px] text-emerald-800 font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    {language === 'ti' ? 'ቀጥታ ካሜራ' : language === 'am' ? 'ቀጥታ ካሜራ' : 'Live Camera Required'}
                  </span>
                </div>

                {/* Hidden native camera capture input (mobile browsers) */}
                <input
                  ref={nativeCameraInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  className="hidden"
                  onChange={handleNativeCameraFile}
                />

                {/* View 1: Active Live Camera Viewfinder */}
                {isLiveCameraActive ? (
                  <div className="rounded-2xl overflow-hidden border-2 border-emerald-600 bg-black relative p-2 space-y-2">
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full h-64 object-cover rounded-xl"
                    />
                    <div className="flex items-center justify-between gap-2 pt-1">
                      <button
                        type="button"
                        onClick={stopCameraStream}
                        className="px-3.5 py-2 rounded-xl bg-slate-800 text-white text-xs font-bold cursor-pointer hover:bg-slate-700"
                      >
                        {t.back}
                      </button>
                      <button
                        type="button"
                        onClick={capturePhotoFromStream}
                        className="flex-1 bg-amber-400 hover:bg-amber-300 active:scale-95 text-slate-950 font-extrabold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer shadow-md transition-all"
                      >
                        <Camera className="w-4 h-4 text-slate-950" />
                        <span>{language === 'ti' ? 'ስእሊ ኣልዕሉ' : language === 'am' ? 'ፎቶ ያንሱ' : 'Capture Photo'}</span>
                      </button>
                    </div>
                  </div>
                ) : previewUrl ? (
                  /* View 2: Captured Photo Preview with Retake and Confirm Photo Buttons */
                  <div className="rounded-2xl border-2 border-emerald-500 overflow-hidden bg-slate-50 p-3 space-y-2.5">
                    <div className="w-full h-52 rounded-xl overflow-hidden bg-slate-900 relative">
                      <img src={previewUrl} alt="Captured product" className="w-full h-full object-cover" />
                      {isPhotoConfirmed && (
                        <div className="absolute top-2 right-2 bg-emerald-600 text-white px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1 shadow-md">
                          <Check className="w-3.5 h-3.5" />
                          <span>{language === 'ti' ? 'ዝተረጋገጸ' : language === 'am' ? 'ተረጋግጧል' : 'Confirmed'}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between gap-2">
                      <button
                        type="button"
                        onClick={handleRetakePhoto}
                        className="flex-1 py-2 px-3 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>{language === 'ti' ? 'ደጊምኩም ኣልዕሉ' : language === 'am' ? 'እንደገና ያንሱ (Retake)' : 'Retake Photo'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleConfirmPhoto}
                        className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-colors shadow-xs ${
                          isPhotoConfirmed
                            ? 'bg-emerald-800 text-white'
                            : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                        }`}
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>
                          {isPhotoConfirmed
                            ? language === 'ti'
                              ? 'ስእሊ ጸዲቑ (Confirmed)'
                              : language === 'am'
                              ? 'ፎቶ ጸድቋል (Confirmed)'
                              : 'Photo Confirmed'
                            : language === 'ti'
                            ? 'ስእሊ ኣረጋግጽ (Confirm)'
                            : language === 'am'
                            ? 'ፎቶ አረጋግጥ (Confirm)'
                            : 'Confirm Photo'}
                        </span>
                      </button>
                    </div>
                  </div>
                ) : (
                  /* View 3: Dedicated "Take Product Photo" Button */
                  <div className="p-6 rounded-2xl border-2 border-dashed border-emerald-400 bg-emerald-50/60 text-center space-y-3">
                    <div className="w-14 h-14 rounded-2xl bg-emerald-700 text-white flex items-center justify-center mx-auto shadow-sm">
                      <Camera className="w-7 h-7 text-amber-300" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">
                        {language === 'ti'
                          ? 'ናይቲ ኣቕሓ ሓድሽ ስእሊ ብቐጥታ ኣልዕሉ'
                          : language === 'am'
                          ? 'የእቃውን ፎቶ በካሜራ በቀጥታ ያንሱ'
                          : 'Capture Live Product Photo'}
                      </h4>
                      <p className="text-[11px] text-slate-500 max-w-sm mx-auto mt-0.5">
                        {language === 'ti'
                          ? 'ካብ ጋለሪ ወይ ስክሪንሾት ምጽዓን ኣይፍቀድን። ትክክለኛ ስእሊ ጥራይ ተቐባልነት ኣለዎ።'
                          : language === 'am'
                          ? 'ከጋለሪ ወይም ስክሪንሾት መጫን አይፈቀድም። የቀጥታ ካሜራ ፎቶ ብቻ ተቀባይነት አለው።'
                          : 'Gallery file uploads and screenshots are disallowed. Please take a live photo of your item.'}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={startCameraCapture}
                      className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold py-2.5 px-6 rounded-xl text-xs sm:text-sm inline-flex items-center gap-2 transition-all cursor-pointer shadow-md active:scale-95"
                    >
                      <Camera className="w-4 h-4 text-amber-300" />
                      <span>
                        {language === 'ti'
                          ? 'ናይ ኣቕሓ ስእሊ ኣልዕሉ (Take Product Photo)'
                          : language === 'am'
                          ? 'የእቃ ፎቶ አንሳ (Take Product Photo)'
                          : 'Take Product Photo'}
                      </span>
                    </button>
                  </div>
                )}
              </div>

              {/* Title */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {t.listingTitle}
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Yirgacheffe Coffee / Samsung S24"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-600 outline-none"
                />
              </div>

              {/* Category & Price */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {t.categories}
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-600 outline-none cursor-pointer"
                  >
                    {CATEGORIES.filter((c) => c.id !== 'all').map((c) => {
                      const catName =
                        language === 'ti'
                          ? c.nameTi
                          : language === 'am'
                          ? c.nameAm
                          : c.nameEn;
                      return (
                        <option key={c.id} value={c.id}>
                          {catName}
                        </option>
                      );
                    })}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {t.price}
                  </label>
                  <input
                    type="number"
                    required
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="ETB"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-600 outline-none"
                  />
                </div>
              </div>

              {/* REQUIREMENT 5: Complete Location Selection for Tigray and Addis Ababa */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <label className="block text-xs font-bold text-slate-900">
                  {language === 'ti'
                    ? 'ናይቲ ኣቕሓ ቦታ (ትግራይ ወይ ኣዲስ ኣበባ)'
                    : language === 'am'
                    ? 'የእቃው የሚገኝበት ቦታ (ትግራይ ወይም አዲስ አበባ)'
                    : 'Product Location (Tigray or Addis Ababa)'}
                </label>
                <LocationPicker
                  language={language}
                  value={locationSelection}
                  onChange={setLocationSelection}
                  isFilter={false}
                />
              </div>

              {/* Contact Phone */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {t.phoneNumber}
                </label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="09..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-600 outline-none"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {t.description}
                </label>
                <textarea
                  rows={2}
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Item condition, warranty, features..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-600 outline-none"
                />
              </div>

              {/* Submit */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isUploading || !isPhotoConfirmed}
                  className="w-full bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white font-bold py-3 rounded-xl text-sm transition-colors shadow-xs cursor-pointer flex items-center justify-center gap-2"
                >
                  {isUploading ? (
                    <>
                      <Upload className="w-4 h-4 animate-spin" />
                      <span>Uploading to Supabase Storage...</span>
                    </>
                  ) : (
                    <span>{t.submitListing}</span>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
