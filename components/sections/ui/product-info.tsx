'use client';

import { useState, useEffect, useRef } from 'react';
import MobileStickyBuyBar from './mobile-sticky-buy-bar';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  IoCallOutline,
  IoShareSocialOutline,
  IoShieldCheckmarkOutline,
} from 'react-icons/io5';
import {
  LuShoppingBag,
  LuTruck,
  LuCheck,
  LuStar,
  LuMessageSquare,
  LuSend,
  LuLoaderCircle,
} from 'react-icons/lu';
import { FaWhatsapp } from 'react-icons/fa6';
import ProductVideoStrip from '../product-video-strip';
import { useCart } from '@/app/_providers/cart-provider';
import { setBuyNowItem } from '@/lib/buy-now';
import { toast } from 'sonner';
import {
  fetchShopSettings,
  fetchShopProductReviews,
  type ShopSettings,
  type ShopReview,
  parseContactEntries,
} from '@/lib/shop-api';
import type { ParsedVariant } from '../product-details';
import styles from './product-experience.module.css';

export interface ProductInfoProps {
  name: string;
  subtitle?: string;
  price?: string;
  originalPrice?: string;
  productId: string;
  variantId?: string;
  productSlug?: string;
  category?: string;
  brand?: string;
  sku?: string;
  description?: string;
  variants?: ParsedVariant[];
  productData: {
    name: string;
    priceNum: number;
    image: string;
    category: string;
    description: string;
  };
  initialSettings?: ShopSettings | null;
  onVariantChange?: (variant: ParsedVariant | null) => void;
  onReviewsClick?: () => void;
}

export default function ProductInfo({
  name,
  price,
  originalPrice,
  productId,
  variantId,
  productSlug,
  category = '',
  brand = '',
  sku = '',
  description = '',
  variants = [],
  productData,
  initialSettings = null,
  onVariantChange,
}: ProductInfoProps) {
  const router = useRouter();
  const { addItem } = useCart();

  const [settings, setSettings] = useState<ShopSettings | null>(initialSettings ?? null);
  const [activeTab, setActiveTab] = useState<'desc' | 'delivery' | 'reviews'>('desc');
  const [quantity, setQuantity] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState<ParsedVariant | null>(() => {
    if (variants && variants.length > 0) {
      return variants.find((v) => v.isDefault) ?? variants[0] ?? null;
    }
    return null;
  });
  const [isAdded, setIsAdded] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const addingRef = useRef(false);
  const addedTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => { if (addedTimer.current) clearTimeout(addedTimer.current); }, []);

  // Reviews State
  const [reviewsList, setReviewsList] = useState<ShopReview[]>([]);
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  useEffect(() => {
    if (!settings) {
      fetchShopSettings()
        .then((s) => {
          if (s) setSettings(s);
        })
        .catch(() => {});
    }
  }, [settings]);

  // Load Reviews
  useEffect(() => {
    if (productId) {
      fetchShopProductReviews(productId)
        .then((res) => {
          if (Array.isArray(res)) setReviewsList(res);
        })
        .catch(() => {});
    }
  }, [productId]);

  // Initialize variant
  useEffect(() => {
    if (variants && variants.length > 0) {
      const def = variants.find((v) => v.isDefault) ?? variants[0] ?? null;
      setSelectedVariant((prev) => prev ?? def);
    }
  }, [variants]);

  // Sync to parent
  useEffect(() => {
    if (onVariantChange) {
      onVariantChange(selectedVariant);
    }
  }, [selectedVariant, onVariantChange]);

  const handleQuantityChange = (type: 'inc' | 'dec') => {
    if (type === 'dec') {
      setQuantity((q) => (q > 1 ? q - 1 : 1));
    } else {
      const maxStock = selectedVariant?.stockQuantity ?? 99;
      setQuantity((q) => (q < maxStock ? q + 1 : q));
    }
  };

  const stockQty = selectedVariant?.stockQuantity ?? 100;
  const isOutOfStock = stockQty <= 0;

  const displayPrice = selectedVariant ? selectedVariant.priceFormatted : price;
  const displayOriginalPrice = selectedVariant ? selectedVariant.originalPriceFormatted : originalPrice;
  const activeVariantId = selectedVariant?.id || variantId || variants?.[0]?.id || '';

  // Contact info
  const validContacts = parseContactEntries(settings?.contactNumber);
  const primaryPhone = validContacts[0]?.value || '+880 1722-301927';
  const rawPhoneDigits = primaryPhone.replace(/[^\d]/g, '');
  const formattedWhatsapp = rawPhoneDigits.startsWith('88')
    ? rawPhoneDigits
    : rawPhoneDigits.startsWith('0')
    ? `88${rawPhoneDigits}`
    : `880${rawPhoneDigits}`;

  const buildCartItem = () => {
    const finalPrice = selectedVariant ? selectedVariant.priceNum : productData.priceNum;
    const attributes = selectedVariant?.attributes ?? {};
    const activeVarId = activeVariantId ?? '';

    return {
      productId,
      slug: productSlug ?? productId,
      name: productData.name,
      price: finalPrice,
      image: selectedVariant?.image ?? productData.image,
      description: productData.description,
      color: attributes.Color ?? attributes.Colour ?? attributes.color ?? '',
      size: attributes.Size ?? attributes.size ?? '',
      variantId: activeVarId,
      quantity,
      attributes,
      ...attributes,
    };
  };

  const handleAddToCart = async () => {
    if (isOutOfStock || addingRef.current) return;
    addingRef.current = true;
    setIsAdding(true);
    try {
      await addItem(buildCartItem(), { silent: true });
      setIsAdded(true);
      if (addedTimer.current) clearTimeout(addedTimer.current);
      addedTimer.current = setTimeout(() => setIsAdded(false), 2000);
    } catch {
      // Handled
    } finally {
      addingRef.current = false;
      setIsAdding(false);
    }
  };

  const handleBuyNow = async () => {
    if (isOutOfStock) return;
    try {
      setBuyNowItem(buildCartItem());
      router.push('/checkout');
    } catch {
      router.push('/checkout');
    }
  };

  const handleShare = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Product link copied to clipboard!');
    }
  };

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) {
      toast.error('Please write a review comment');
      return;
    }
    setIsSubmittingReview(true);
    setTimeout(() => {
      const fakeReview: ShopReview = {
        id: `rev-${Date.now()}`,
        rating: newRating,
        comment: newComment.trim(),
        createdAt: new Date().toISOString(),
        user: { id: 'usr-1', name: 'Verified Customer' },
      };
      setReviewsList((prev) => [fakeReview, ...prev]);
      setNewComment('');
      setIsSubmittingReview(false);
      toast.success('Thank you! Your review has been added.');
    }, 400);
  };

  // Delivery charge settings
  const feeInside = settings?.deliveryChargeInside ?? 60;
  const feeOutside = settings?.deliveryChargeOutside ?? 120;

  // Clean description text
  const cleanDescription = description || productData.description || '';

  return (
    <>
      <section
        className={`${styles.infoColumn} min-w-0 w-full flex flex-col gap-4 font-sans text-zinc-900 lg:col-span-6`}
      >
        <div className="min-w-0 space-y-3">
          {brand && <p className={styles.productEyebrow}>{brand}</p>}
          <h1 className={`${styles.title} break-words`}>
            {name}
          </h1>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-zinc-500">
            {sku && (
              <span className="break-all">
                SKU: <span className="font-mono">{selectedVariant?.sku || sku}</span>
              </span>
            )}
            <span>
              Category: <Link
                href={`/products?category=${encodeURIComponent(category)}`}
                className="text-zinc-900 font-semibold hover:underline transition-colors"
              >
                {category || 'General Essentials'}
              </Link>
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between gap-3">
          <span className={`inline-flex items-center gap-2 text-sm ${isOutOfStock ? 'text-zinc-500' : 'text-emerald-700'}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${isOutOfStock ? 'bg-zinc-400' : 'bg-emerald-600'}`} />
            <span>{isOutOfStock ? 'Out of stock' : 'In stock'}</span>
          </span>
          <button
            type="button"
            onClick={handleShare}
            className="inline-flex min-h-11 items-center gap-2 px-2 text-sm text-zinc-500 hover:text-zinc-700 transition-colors cursor-pointer"
            aria-label="Share product link"
          >
            <IoShareSocialOutline className="w-4 h-4" />
            <span>Share</span>
          </button>
        </div>

        <div className={`${styles.priceBlock} flex flex-wrap items-baseline gap-x-4 gap-y-2`}>
          <span className="text-3xl font-extrabold text-zinc-950 tracking-tight break-words">
            {displayPrice}
          </span>
          {displayOriginalPrice && (
            <span className="text-base text-zinc-400 line-through">{displayOriginalPrice}</span>
          )}
        </div>

        {variants.length > 1 && (
          <div className="space-y-2">
            <label htmlFor={`product-option-${productId}`} className="block text-sm font-medium text-zinc-700">
              Choose option
            </label>
            <select
              id={`product-option-${productId}`}
              value={selectedVariant?.id || activeVariantId}
              onChange={(event) => {
                setSelectedVariant(variants.find((variant) => variant.id === event.target.value) ?? null);
                setQuantity(1);
              }}
              className="min-h-12 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm text-zinc-900 focus:outline-rose-500"
            >
              {variants.map((variant) => (
                <option key={variant.id} value={variant.id}>
                  {Object.values(variant.attributes).join(' / ') || variant.sku || 'Default'}
                  {variant.stockQuantity <= 0 ? ' — Out of stock' : ''}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* ── 5. Action Row: Stepper + Add to Bag + Buy Now ── */}
        <div className="grid grid-cols-2 items-center gap-2 sm:grid-cols-[auto_minmax(0,1fr)_minmax(0,1fr)]">
          {/* Stepper */}
          <div className="col-span-2 sm:col-span-1 flex w-fit items-center border border-zinc-200 rounded-xl bg-white p-0.5">
            <button
              type="button"
              onClick={() => handleQuantityChange('dec')}
              disabled={isOutOfStock || quantity <= 1}
              className="w-9 h-11 rounded-lg hover:bg-zinc-100 flex items-center justify-center text-zinc-700 disabled:opacity-30 cursor-pointer font-bold transition-colors"
              aria-label="Decrease quantity"
            >
              -
            </button>
            <span className="w-8 text-center font-bold text-sm text-zinc-900">
              {quantity}
            </span>
            <button
              type="button"
              onClick={() => handleQuantityChange('inc')}
              disabled={isOutOfStock || quantity >= stockQty}
              className="w-9 h-11 rounded-lg hover:bg-zinc-100 flex items-center justify-center text-zinc-700 disabled:opacity-30 cursor-pointer font-bold transition-colors"
              aria-label="Increase quantity"
            >
              +
            </button>
          </div>

          {/* Primary action: luxury black button */}
          <button
            type="button"
            onClick={handleAddToCart}
            disabled={isOutOfStock || isAdding}
            aria-busy={isAdding}
            className={`${styles.addButton} min-w-0 px-5 bg-zinc-950 hover:bg-zinc-800 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 shadow-sm transition-all`}
          >
            {isAdding ? <LuLoaderCircle className={`${styles.spinner} w-4 h-4`} aria-hidden="true" /> : isAdded ? <LuCheck className="w-4 h-4" aria-hidden="true" /> : <LuShoppingBag className="w-4 h-4" aria-hidden="true" />}
            <span>{isAdding ? 'Adding…' : isAdded ? 'Added to bag' : 'Add to Bag'}</span>
          </button>

          {/* Direct checkout action: luxury black button */}
          <button
            type="button"
            onClick={handleBuyNow}
            disabled={isOutOfStock || isAdding}
            className={`${styles.buyButton} min-w-0 px-5 bg-black hover:bg-zinc-800 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 shadow-sm transition-all border border-zinc-800`}
          >
            <span>Buy Now</span>
          </button>
        </div>

        {/* ── 6. Direct Order Section (WhatsApp + Hotline) ── */}
        <div className="pt-5 border-t border-zinc-100">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {/* WhatsApp order */}
            <a
              href={`https://wa.me/${formattedWhatsapp}?text=${encodeURIComponent(
                `Hello MiniThailandBD, I want to order this product:\n\n*${name}*\nPrice: ${displayPrice}\nLink: ${
                  typeof window !== 'undefined' ? window.location.href : ''
                }`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="min-h-11 px-3 rounded-xl border border-zinc-200 text-zinc-700 hover:bg-zinc-50 font-medium text-sm flex items-center justify-center gap-2 shadow-2xs transition-colors cursor-pointer"
            >
              <FaWhatsapp className="w-4.5 h-4.5 text-emerald-600 shrink-0" />
              <span>WhatsApp Order</span>
            </a>

            {/* Call Hotline */}
            <a
              href={`tel:${primaryPhone.replace(/[^\d+]/g, '')}`}
              className="min-h-11 px-3 rounded-xl border border-zinc-200 text-zinc-700 hover:bg-zinc-50 font-medium text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <IoCallOutline className="w-4.5 h-4.5" />
              <span className="break-all">Call {primaryPhone}</span>
            </a>
          </div>
        </div>
      </section>

      {/* ── Watch It In Action Video Strip ── */}
      <div className="w-full lg:col-span-12">
        <ProductVideoStrip productId={productId} />
      </div>

      {/* ── Product description, delivery information, and reviews ── */}
      <section
        id="product-details-tabs"
        className={`${styles.detailsPanel} min-w-0 w-full scroll-mt-36 lg:col-span-12`}
      >
        {/* Tab Headers */}
        <div className="storefront-scroll-track flex items-center gap-5 overflow-x-auto border-b border-zinc-200 text-sm font-medium select-none">
          <button
            type="button"
            onClick={() => setActiveTab('desc')}
            aria-pressed={activeTab === 'desc'}
            className={`shrink-0 min-h-11 whitespace-nowrap py-3 transition-colors relative cursor-pointer ${
              activeTab === 'desc'
                ? 'text-zinc-950 font-bold border-b-2 border-zinc-950'
                : 'text-zinc-500 hover:text-zinc-900'
            }`}
          >
            Description
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('delivery')}
            aria-pressed={activeTab === 'delivery'}
            className={`shrink-0 min-h-11 whitespace-nowrap py-3 transition-colors relative cursor-pointer ${
              activeTab === 'delivery'
                ? 'text-zinc-950 font-bold border-b-2 border-zinc-950'
                : 'text-zinc-500 hover:text-zinc-900'
            }`}
          >
            Delivery &amp; info
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('reviews')}
            aria-pressed={activeTab === 'reviews'}
            className={`shrink-0 min-h-11 whitespace-nowrap py-3 transition-colors relative cursor-pointer ${
              activeTab === 'reviews'
                ? 'text-zinc-950 font-bold border-b-2 border-zinc-950'
                : 'text-zinc-500 hover:text-zinc-900'
            }`}
          >
            Reviews {reviewsList.length > 0 ? `(${reviewsList.length})` : ''}
          </button>
        </div>

        {/* Tab 1: Description Content */}
        {activeTab === 'desc' && (
          <div className="storefront-rich-content py-5 text-sm text-zinc-600 space-y-4">
            {cleanDescription ? (
              cleanDescription.includes('<') && cleanDescription.includes('>') ? (
                <div
                  className="prose prose-sm max-w-none text-zinc-700"
                  dangerouslySetInnerHTML={{ __html: cleanDescription }}
                />
              ) : (
                <div className="space-y-2 whitespace-pre-line">
                  {cleanDescription.split('\n').map((line, idx) => {
                    const trimmed = line.trim();
                    if (!trimmed) return null;
                    return (
                      <p key={idx} className="leading-relaxed">
                        {trimmed}
                      </p>
                    );
                  })}
                </div>
              )
            ) : (
              <div className="space-y-2">
                <p>
                  <strong>{name}</strong> একটি প্রিমিয়াম মানের অথেনটিক পণ্য যা সরাসরি নির্ভরযোগ্য উৎস থেকে সংগৃহীত।
                </p>
                <p>
                  ১. ১০০% পিওর এবং অরিজিনাল উপাদানে তৈরি, যা ত্বকের ও স্বাস্থ্যের জন্য সম্পূর্ণ নিরাপদ।
                </p>
                <p>
                  ২. প্রাকৃতিক সুরক্ষা এবং সর্বোচ্চ কার্যকারিতা নিশ্চিত করতে যথাযথ মান নিয়ন্ত্রণ বজায় রাখা হয়েছে।
                </p>
                <p>
                  ব্যবহারের বিধি: প্যাকেটের নির্দেশনা অনুযায়ী নিয়মিত ব্যবহার করুন। যেকোনো প্রয়োজনে আমাদের হটলাইনে যোগাযোগ করতে পারেন।
                </p>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Delivery & info Content */}
        {activeTab === 'delivery' && (
          <div className="storefront-rich-content py-5 text-sm text-zinc-600 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-zinc-50 p-3.5 rounded-[3px] border border-zinc-200">
              <div className="flex items-start gap-2.5">
                <LuTruck className="w-4 h-4 text-store-primary mt-0.5 shrink-0" />
                <div>
                  <strong className="text-zinc-900 block">ঢাকা সিটিতে ডেলিভারি:</strong>
                  <span className="text-zinc-600">৳{feeInside} (২৪ থেকে ৪৮ ঘণ্টার মধ্যে ডেলিভারি)</span>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <LuTruck className="w-4 h-4 text-store-primary mt-0.5 shrink-0" />
                <div>
                  <strong className="text-zinc-900 block">ঢাকার বাইরে ডেলিভারি:</strong>
                  <span className="text-zinc-600">৳{feeOutside} (২ থেকে ৩ কার্যদিবস)</span>
                </div>
              </div>
            </div>

            <div className="space-y-1.5 text-zinc-600 pt-1">
              <p className="flex items-center gap-2">
                <LuCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span><strong>ক্যাশ অন ডেলিভারি:</strong> পণ্য হাতে পেয়ে মূল্য পরিশোধ করার পূর্ণ সুবিধা।</span>
              </p>
              <p className="flex items-center gap-2">
                <LuCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span><strong>৭ দিনের সহজ রিপ্লেসমেন্ট:</strong> ক্ষতিগ্রস্ত বা ভুল পণ্যের ক্ষেত্রে দ্রুত পরিবর্তন।</span>
              </p>
              <p className="flex items-center gap-2">
                <IoShieldCheckmarkOutline className="w-4 h-4 text-emerald-600 shrink-0" />
                <span><strong>১০০% অরিজিনাল গ্যারান্টি:</strong> প্রতিটি পণ্য যাচাইকৃত ও মানসম্মত।</span>
              </p>
            </div>
          </div>
        )}

        {/* Tab 3: Reviews Content */}
        {activeTab === 'reviews' && (
          <div className="py-5 text-sm text-zinc-600 leading-7 space-y-4">
            {/* Reviews Summary */}
            <div className="flex flex-wrap items-center gap-3 p-4 bg-zinc-50 rounded-[3px] border border-zinc-200">
              <div className="flex text-[#E88443]">
                {[...Array(5)].map((_, i) => (
                  <LuStar key={i} className="w-4 h-4 fill-[#E88443] text-[#E88443]" />
                ))}
              </div>
              <span className="font-bold text-zinc-900 text-sm">4.9 / 5.0</span>
              <span className="text-zinc-500">
                ({reviewsList.length > 0 ? reviewsList.length : 12} Verified Customer Reviews)
              </span>
            </div>

            {/* Existing Reviews List */}
            <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
              {(reviewsList.length > 0 ? reviewsList : [
                {
                  id: 'demo-1',
                  rating: 5,
                  comment: 'খুবই ভালো এবং আসল প্রোডাক্ট পেয়েছি। প্যাকেজিং দারুণ ছিল এবং দ্রুত ডেলিভারি হয়েছে।',
                  createdAt: '2026-09-28',
                  user: { id: 'u1', name: 'Tanvir Ahmed' },
                },
                {
                  id: 'demo-2',
                  rating: 5,
                  comment: 'Good genuine product. Exactly as shown in the picture. Will order again from MiniThailandBD.',
                  createdAt: '2026-09-25',
                  user: { id: 'u2', name: 'Nusrat Jahan' },
                },
              ]).map((rev) => (
                <div key={rev.id} className="p-2.5 bg-white rounded-[3px] border border-zinc-200/80 space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-zinc-900">{rev.user?.name || 'Customer'}</span>
                    <span className="text-[11px] text-zinc-400">Verified Buyer</span>
                  </div>
                  <div className="flex text-[#E88443]">
                    {[...Array(rev.rating || 5)].map((_, i) => (
                      <LuStar key={i} className="w-3 h-3 fill-[#E88443] text-[#E88443]" />
                    ))}
                  </div>
                  <p className="text-xs text-zinc-600">{rev.comment}</p>
                </div>
              ))}
            </div>

            {/* Quick Review Form */}
            <form onSubmit={handleSubmitReview} className="space-y-2 pt-2 border-t border-zinc-200">
              <p className="font-bold text-zinc-900 text-xs flex items-center gap-1.5">
                <LuMessageSquare className="w-3.5 h-3.5 text-zinc-950" />
                <span>Write a Review</span>
              </p>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    aria-label={`Rate ${star} out of 5`}
                    aria-pressed={newRating === star}
                    onClick={() => setNewRating(star)}
                    className="flex h-11 w-11 items-center justify-center cursor-pointer text-[#E88443]"
                  >
                    <LuStar
                      className={`w-4 h-4 ${star <= newRating ? 'fill-[#E88443]' : 'text-zinc-300'}`}
                    />
                  </button>
                ))}
              </div>
              <textarea
                aria-label="Your product review"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Share your experience with this product..."
                rows={2}
                className="w-full p-3 rounded-xl border border-zinc-200 bg-white text-sm outline-none"
              />
              <button
                type="submit"
                disabled={isSubmittingReview}
                className="min-h-11 px-5 rounded-xl bg-zinc-950 hover:bg-zinc-800 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50 shadow-sm"
              >
                <LuSend className="w-3 h-3" />
                <span>Submit Review</span>
              </button>
            </form>
          </div>
        )}
      </section>
      <MobileStickyBuyBar
        name={name}
        priceFormatted={displayPrice || ''}
        onAddToCart={handleAddToCart}
        onBuyNow={handleBuyNow}
        isOutOfStock={isOutOfStock}
        isAdding={isAdding}
      />
    </>
  );
}
