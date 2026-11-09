import React, { useState } from 'react';
import { X, Camera, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Category, Product } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { CameraCapture } from './CameraCapture';

interface AddProductModalProps {
  categories: Category[];
  productToEdit?: Product | null;
  onClose: () => void;
  onSuccess: () => void;
}

const COMMON_CITIES = [
  'Addis Ababa (አዲስ አበባ)',
  'Hawassa (ሀዋሳ)',
  'Mekelle (መቐለ)',
  'Bahir Dar (ባህር ዳር)',
  'Dire Dawa (ድሬዳዋ)',
  'Adama (አዳማ)',
  'Jimma (ጅማ)',
  'Gondar (ጎንደር)',
  'Asmara (ኣስመራ)'
];

export const AddProductModal: React.FC<AddProductModalProps> = ({
  categories,
  productToEdit,
  onClose,
  onSuccess,
}) => {
  const { t, language } = useLanguage();
  const { token, user } = useAuth();

  const [title, setTitle] = useState(productToEdit?.title || '');
  const [description, setDescription] = useState(productToEdit?.description || '');
  const [price, setPrice] = useState(productToEdit?.price?.toString() || '');
  const [categoryId, setCategoryId] = useState(productToEdit?.category_id || categories[0]?.id || 'cat_electronics');
  const [condition, setCondition] = useState<'new' | 'used'>(productToEdit?.condition || 'new');
  const [location, setLocation] = useState(productToEdit?.location || user?.city || 'Addis Ababa');
  const [photoData, setPhotoData] = useState<string | null>(productToEdit?.photo_data || null);

  const [showCamera, setShowCamera] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const getCategoryName = (c: Category) => {
    if (language === 'am') return c.name_am;
    if (language === 'ti') return c.name_ti;
    return c.name_en;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!title.trim() || !description.trim() || !price || !categoryId || !location.trim()) {
      setErrorMsg('Please complete all required fields.');
      return;
    }

    const numPrice = parseFloat(price);
    if (isNaN(numPrice) || numPrice <= 0) {
      setErrorMsg('Price must be a valid positive number.');
      return;
    }

    setIsSubmitting(true);
    try {
      const isEditing = Boolean(productToEdit);
      const url = isEditing ? `/api/products/${productToEdit!.id}` : '/api/products';
      const method = isEditing ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          title,
          description,
          price: numPrice,
          currency: 'ETB',
          category_id: categoryId,
          condition,
          location,
          photo_data: photoData
        })
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || 'Failed to save product listing.');
      } else {
        onSuccess();
        onClose();
      }
    } catch (err) {
      setErrorMsg('Network error. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm overflow-y-auto">
        <div className="relative w-full max-w-xl overflow-hidden rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl text-slate-900 dark:text-white my-8">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800">
            <h3 className="text-base font-bold">
              {productToEdit ? t('post.edit') : t('post.title')}
            </h3>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
            {errorMsg && (
              <div className="flex items-center gap-2 p-3 text-xs bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 rounded-xl border border-rose-200 dark:border-rose-900">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Direct Camera Photo Capture Section */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                {t('post.photo')}
              </label>

              {photoData ? (
                <div className="relative aspect-video w-full rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-950 flex items-center justify-center">
                  <img
                    src={photoData}
                    alt="Captured Product"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-3 right-3 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setShowCamera(true)}
                      className="px-3 py-1.5 text-xs font-semibold bg-slate-900/90 text-white rounded-lg hover:bg-slate-800 backdrop-blur-sm transition-colors flex items-center gap-1.5 shadow"
                    >
                      <Camera className="w-3.5 h-3.5 text-emerald-400" />
                      <span>{t('camera.retake')}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setPhotoData(null)}
                      className="px-2.5 py-1.5 text-xs font-semibold bg-rose-900/90 text-rose-200 rounded-lg hover:bg-rose-800 backdrop-blur-sm transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-5 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800/40 text-center">
                  <Camera className="w-8 h-8 text-emerald-600 dark:text-emerald-400 mx-auto mb-2" />
                  <p className="text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    {t('camera.title')}
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-3 max-w-xs mx-auto">
                    {t('camera.subtitle')}
                  </p>
                  {/* ONLY Camera capture trigger - No file input per instructions */}
                  <button
                    type="button"
                    onClick={() => setShowCamera(true)}
                    className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl shadow transition-colors"
                  >
                    <Camera className="w-4 h-4" />
                    <span>{t('camera.startBtn')}</span>
                  </button>
                </div>
              )}
            </div>

            {/* Product Title */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {t('post.productName')} *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. iPhone 15 Pro Max 256GB / Toyota Corolla 2018"
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {/* Category & Condition Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {t('post.category')} *
                </label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {getCategoryName(c)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {t('post.condition')} *
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setCondition('new')}
                    className={`py-2 px-3 text-xs font-semibold rounded-xl border transition-colors ${
                      condition === 'new'
                        ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 text-emerald-700 dark:text-emerald-300'
                        : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    {t('filters.condition.new')}
                  </button>
                  <button
                    type="button"
                    onClick={() => setCondition('used')}
                    className={`py-2 px-3 text-xs font-semibold rounded-xl border transition-colors ${
                      condition === 'used'
                        ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 text-emerald-700 dark:text-emerald-300'
                        : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    {t('filters.condition.used')}
                  </button>
                </div>
              </div>
            </div>

            {/* Price & Location Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {t('post.price')} (ETB) *
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  step="any"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="e.g. 45000"
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {t('post.location')} *
                </label>
                <input
                  type="text"
                  required
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Bole, Addis Ababa"
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {t('post.description')} *
              </label>
              <textarea
                rows={4}
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Include specifications, warranty, condition notes, and pickup details..."
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
              >
                {t('common.cancel')}
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl shadow-md transition-colors disabled:opacity-50"
              >
                {isSubmitting ? t('post.submitting') : productToEdit ? t('common.save') : t('post.submit')}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Live Camera Modal Overlay */}
      {showCamera && (
        <CameraCapture
          initialPhoto={photoData}
          onPhotoCaptured={(captured) => setPhotoData(captured)}
          onClose={() => setShowCamera(false)}
        />
      )}
    </>
  );
};
