import React, { useState, useEffect } from 'react';
import {
  X,
  Phone,
  ShoppingCart,
  MapPin,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  Building2,
  Tag,
  ChevronLeft,
  ChevronRight,
  Star,
  BadgeCheck,
  Lock,
  MessageSquare,
  Send,
} from 'lucide-react';
import { Product, Language, Review, Order, User } from '../types';
import { SUPPORT_PHONE } from '../data/mockData';
import { TRANSLATIONS } from '../data/translations';

interface ProductModalProps {
  product: Product | null;
  language: Language;
  onClose: () => void;
  onAddToCart: (product: Product) => void;
  currentUser?: User | null;
  orders?: Order[];
  reviews?: Review[];
  onAddReview?: (review: Review) => void;
  onRequireAuth?: () => void;
}

export const ProductModal: React.FC<ProductModalProps> = ({
  product,
  language,
  onClose,
  onAddToCart,
  currentUser = null,
  orders = [],
  reviews = [],
  onAddReview,
  onRequireAuth,
}) => {
  const t = TRANSLATIONS[language];

  // Photo gallery state
  const [currentPhotoIdx, setCurrentPhotoIdx] = useState(0);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [touchEndX, setTouchEndX] = useState<number | null>(null);

  // Review form state
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState('');
  const [reviewSubmittedNotice, setReviewSubmittedNotice] = useState(false);

  // Reset states on product change
  useEffect(() => {
    setCurrentPhotoIdx(0);
    setNewRating(5);
    setNewComment('');
    setReviewSubmittedNotice(false);
  }, [product?.id]);

  if (!product) return null;

  // Resolve photo list (supports multiple photos or single image)
  const photoList =
    product.images && product.images.length > 0
      ? product.images
      : [product.imageUrl];

  const hasMultiplePhotos = photoList.length > 1;

  // Next / Previous Photo Handlers
  const handlePrevPhoto = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setCurrentPhotoIdx((prev) => (prev > 0 ? prev - 1 : photoList.length - 1));
  };

  const handleNextPhoto = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setCurrentPhotoIdx((prev) => (prev < photoList.length - 1 ? prev + 1 : 0));
  };

  // Mobile Touch Swipe Handling
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEndX(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStartX || !touchEndX || !hasMultiplePhotos) return;
    const distance = touchStartX - touchEndX;
    const isLeftSwipe = distance > 40;
    const isRightSwipe = distance < -40;

    if (isLeftSwipe) {
      handleNextPhoto();
    } else if (isRightSwipe) {
      handlePrevPhoto();
    }

    setTouchStartX(null);
    setTouchEndX(null);
  };

  // REQUIREMENT 3: Verified Purchase Checking
  // Filter all reviews for this product
  const productReviews = reviews.filter((r) => r.productId === product.id);

  // Check if current user has a valid completed or delivered order containing this product
  const hasPurchasedAndDelivered = Boolean(
    currentUser &&
      orders.some(
        (order) =>
          order.userId === currentUser.id &&
          (order.status === 'delivered' || order.status === 'completed') &&
          order.items.some((item) => item.productId === product.id)
      )
  );

  // Check if this user has already reviewed this product to prevent duplicate reviews
  const alreadyReviewed = Boolean(
    currentUser && productReviews.some((r) => r.userId === currentUser.id)
  );

  // Submit review handler
  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !hasPurchasedAndDelivered || alreadyReviewed || !newComment.trim()) {
      return;
    }

    const reviewObj: Review = {
      id: `rev-${Date.now()}`,
      productId: product.id,
      userId: currentUser.id,
      userName: currentUser.name,
      rating: newRating,
      comment: newComment.trim(),
      date: 'Just now',
      isVerifiedPurchase: true,
      orderId: `ord-verified-${Date.now()}`,
    };

    if (onAddReview) {
      onAddReview(reviewObj);
    }
    setReviewSubmittedNotice(true);
    setNewComment('');
  };

  const title =
    language === 'ti' ? product.titleTi : language === 'am' ? product.titleAm : product.titleEn;
  const description =
    language === 'ti'
      ? product.descriptionTi
      : language === 'am'
      ? product.descriptionAm
      : product.descriptionEn;
  const category =
    language === 'ti'
      ? product.categoryTi
      : language === 'am'
      ? product.categoryAm
      : product.category;
  const location =
    language === 'ti'
      ? product.locationTi
      : language === 'am'
      ? product.locationAm
      : product.location;
  const condition =
    language === 'ti'
      ? product.conditionTi
      : language === 'am'
      ? product.conditionAm
      : product.condition;
  const features =
    language === 'ti'
      ? product.featuresTi
      : language === 'am'
      ? product.featuresAm
      : product.featuresEn;

  const formatPrice = (price: number) => new Intl.NumberFormat('en-US').format(price);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-fade-in">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-slate-200">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 bg-slate-50 border-b border-slate-200 flex items-center justify-between sticky top-0 z-20">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider bg-emerald-100 px-2.5 py-1 rounded-md">
              {category}
            </span>
            <span className="text-xs font-bold text-slate-700 bg-slate-200 px-2.5 py-1 rounded-md flex items-center gap-1">
              <Tag className="w-3 h-3 text-slate-500" />
              {condition}
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-full transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 space-y-6">
          {/* REQUIREMENT 4: Product Photo Container with Next & Previous Controls and Swipe */}
          <div className="space-y-2">
            <div
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              className="w-full h-64 sm:h-84 rounded-2xl overflow-hidden bg-slate-900 border border-slate-200 relative group select-none"
            >
              <img
                src={photoList[currentPhotoIdx] || product.imageUrl}
                alt={`${title} - Photo ${currentPhotoIdx + 1}`}
                className="w-full h-full object-cover transition-opacity duration-200"
              />

              {/* Verified Seller Tag */}
              {product.isVerified && (
                <div className="absolute top-3 right-3 z-10">
                  <span className="flex items-center gap-1 text-xs font-bold text-emerald-950 bg-emerald-400 px-3 py-1.5 rounded-full shadow-md">
                    <ShieldCheck className="w-4 h-4" />
                    {t.verifiedMerchant}
                  </span>
                </div>
              )}

              {/* Photo Navigation Overlay (Only shown if multiple photos exist) */}
              {hasMultiplePhotos && (
                <>
                  {/* Previous Control Button */}
                  <button
                    type="button"
                    onClick={handlePrevPhoto}
                    className="absolute left-3 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-slate-900/70 hover:bg-slate-900 active:scale-95 text-white flex items-center justify-center transition-all shadow-md cursor-pointer border border-white/20"
                    title={t.prevPhoto}
                    aria-label={t.prevPhoto}
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </button>

                  {/* Next Control Button */}
                  <button
                    type="button"
                    onClick={handleNextPhoto}
                    className="absolute right-3 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-slate-900/70 hover:bg-slate-900 active:scale-95 text-white flex items-center justify-center transition-all shadow-md cursor-pointer border border-white/20"
                    title={t.nextPhoto}
                    aria-label={t.nextPhoto}
                  >
                    <ChevronRight className="w-6 h-6" />
                  </button>

                  {/* Photo Counter Pill */}
                  <div className="absolute bottom-3 right-3 z-10 bg-slate-900/80 backdrop-blur-xs text-white text-xs font-bold px-3 py-1 rounded-full shadow-md border border-white/20">
                    {currentPhotoIdx + 1} / {photoList.length} {t.productPhotoCount}
                  </div>
                </>
              )}
            </div>

            {/* Photo Navigation Thumbnails & Controls Bar below the image (Only if multiple photos) */}
            {hasMultiplePhotos && (
              <div className="flex items-center justify-between pt-1 px-1">
                <button
                  type="button"
                  onClick={handlePrevPhoto}
                  className="flex items-center gap-1 text-xs font-bold text-slate-700 hover:text-emerald-800 transition-colors py-1 px-2.5 rounded-lg hover:bg-slate-100 cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>{t.prevPhoto}</span>
                </button>

                {/* Thumbnails strip */}
                <div className="flex items-center gap-2 overflow-x-auto py-1">
                  {photoList.map((photoUrl, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setCurrentPhotoIdx(idx)}
                      className={`w-12 h-12 rounded-lg overflow-hidden border-2 transition-all cursor-pointer ${
                        currentPhotoIdx === idx
                          ? 'border-emerald-600 scale-105 shadow-xs'
                          : 'border-slate-200 opacity-60 hover:opacity-100'
                      }`}
                      aria-label={`Photo ${idx + 1}`}
                    >
                      <img
                        src={photoUrl}
                        alt={`Thumbnail ${idx + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={handleNextPhoto}
                  className="flex items-center gap-1 text-xs font-bold text-slate-700 hover:text-emerald-800 transition-colors py-1 px-2.5 rounded-lg hover:bg-slate-100 cursor-pointer"
                >
                  <span>{t.nextPhoto}</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {/* Title & Price */}
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-500 mb-2 font-medium">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              <span>{location}</span>
              <span>•</span>
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>{product.dateListed}</span>
            </div>

            <h2 className="text-xl sm:text-2xl font-black text-slate-900 leading-snug mb-3">
              {title}
            </h2>

            <div className="flex items-baseline gap-2">
              <span className="text-sm font-bold text-emerald-800">ETB</span>
              <span className="text-3xl font-black text-slate-900">
                {formatPrice(product.price)}
              </span>
              <span className="text-sm font-bold text-slate-500">{t.etbCurrency}</span>
              {product.originalPrice && (
                <span className="text-sm text-slate-400 line-through ml-2">
                  {formatPrice(product.originalPrice)} {t.etbCurrency}
                </span>
              )}
            </div>
          </div>

          {/* Seller Information */}
          <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-emerald-700 text-white flex items-center justify-center font-bold text-base shadow-xs">
                <Building2 className="w-5 h-5 text-amber-300" />
              </div>
              <div>
                <div className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
                  {product.sellerName}
                  {product.isVerified && (
                    <span title={t.verifiedMerchant}>
                      <ShieldCheck className="w-4 h-4 text-emerald-700" />
                    </span>
                  )}
                </div>
                <div className="text-xs text-slate-500">{t.verifiedMerchant}</div>
              </div>
            </div>

            <a
              href={`tel:${product.sellerPhone || SUPPORT_PHONE}`}
              className="inline-flex items-center gap-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold px-4 py-2 rounded-xl text-xs shadow-xs transition-all cursor-pointer"
            >
              <Phone className="w-4 h-4 text-amber-300" />
              <span>{product.sellerPhone || SUPPORT_PHONE}</span>
            </a>
          </div>

          {/* Description */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              {t.description}
            </h4>
            <p className="text-sm text-slate-700 leading-relaxed">{description}</p>
          </div>

          {/* Specifications / Features */}
          {features && features.length > 0 && (
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                {t.specifications}
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {features.map((feat, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2 text-xs font-medium text-slate-700 bg-slate-50 p-2.5 rounded-xl border border-slate-100"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Row */}
          <div className="pt-2 flex flex-col sm:flex-row gap-3">
            <a
              href={`tel:${product.sellerPhone || SUPPORT_PHONE}`}
              className="flex-1 flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-bold py-3.5 px-6 rounded-2xl text-sm transition-colors cursor-pointer"
            >
              <Phone className="w-4 h-4 text-emerald-400" />
              <span>{t.callToInquire}</span>
            </a>

            <button
              type="button"
              onClick={() => {
                onAddToCart(product);
                onClose();
              }}
              className="flex-1 flex items-center justify-center gap-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold py-3.5 px-6 rounded-2xl text-sm transition-colors shadow-md cursor-pointer"
            >
              <ShoppingCart className="w-4 h-4 text-amber-300" />
              <span>{t.addToCart}</span>
            </button>
          </div>

          {/* REQUIREMENT 3: Verified Purchase Reviews & Comments Section */}
          <div className="pt-6 border-t border-slate-200 space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-emerald-700" />
                <h3 className="font-bold text-slate-900 text-base">
                  {t.customerReviews} ({productReviews.length})
                </h3>
              </div>
              <div className="flex items-center gap-1 text-xs font-bold text-slate-700">
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                <span>{product.rating} / 5.0</span>
              </div>
            </div>

            {/* Review Submission Area */}
            {currentUser && hasPurchasedAndDelivered ? (
              alreadyReviewed || reviewSubmittedNotice ? (
                /* Already Reviewed Notice */
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-semibold flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  <span>{t.alreadyReviewedNotice}</span>
                </div>
              ) : (
                /* Verified Purchaser Active Review Submission Form */
                <form
                  onSubmit={handleReviewSubmit}
                  className="p-4 rounded-2xl bg-slate-50 border border-emerald-300 space-y-3"
                >
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-900">
                      <BadgeCheck className="w-4 h-4 text-emerald-600" />
                      <span>{t.writeReview} ({t.verifiedPurchase})</span>
                    </div>

                    {/* Star Rating Picker */}
                    <div className="flex items-center gap-1">
                      <span className="text-xs font-semibold text-slate-600 mr-1">{t.rating}:</span>
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setNewRating(star)}
                          className="p-0.5 text-amber-400 hover:scale-110 transition-transform cursor-pointer"
                        >
                          <Star
                            className={`w-4 h-4 ${
                              star <= newRating
                                ? 'fill-amber-400 text-amber-400'
                                : 'text-slate-300'
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  <textarea
                    rows={2}
                    required
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder={t.reviewPlaceholder}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm focus:ring-2 focus:ring-emerald-600 outline-none bg-white"
                  />

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold py-2 px-4 rounded-xl text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>{t.submitReview}</span>
                    </button>
                  </div>
                </form>
              )
            ) : (
              /* Informative Notice when user has not purchased / not authenticated */
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-slate-600 text-xs space-y-2">
                <div className="flex items-center gap-2 font-bold text-slate-800">
                  <Lock className="w-4 h-4 text-slate-500" />
                  <span>{t.purchaseRequiredNotice}</span>
                </div>
                {!currentUser && (
                  <p className="text-[11px] text-slate-500">
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        if (onRequireAuth) onRequireAuth();
                      }}
                      className="text-emerald-700 font-bold hover:underline cursor-pointer"
                    >
                      {t.login}
                    </button>{' '}
                    to verify your previous orders.
                  </p>
                )}
              </div>
            )}

            {/* List of Existing Product Reviews */}
            <div className="space-y-3">
              {productReviews.length === 0 ? (
                <div className="text-center py-4 text-xs text-slate-400">
                  No reviews yet. Be the first verified buyer to leave a review!
                </div>
              ) : (
                productReviews.map((rev) => (
                  <div
                    key={rev.id}
                    className="p-3.5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-1.5"
                  >
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-slate-900">{rev.userName}</span>
                        {rev.isVerifiedPurchase && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                            <BadgeCheck className="w-3 h-3 text-emerald-600" />
                            <span>{t.verifiedPurchase}</span>
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex text-amber-400">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star
                              key={s}
                              className={`w-3 h-3 ${
                                s <= rev.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-[10px] text-slate-400">{rev.date}</span>
                      </div>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">{rev.comment}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
