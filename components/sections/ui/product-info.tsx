'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  IoChevronDown,
  IoChevronUp,
} from 'react-icons/io5';
import {
  LuShoppingBag,
  LuCheck,
  LuStar,
  LuLoaderCircle,
  LuRuler,
  LuZap,
} from 'react-icons/lu';
import { FaWhatsapp } from 'react-icons/fa6';
import SizeGuideModal from './size-guide-modal';
import MobileStickyBuyBar from './mobile-sticky-buy-bar';
import { useCart } from '@/app/_providers/cart-provider';
import { setBuyNowItem } from '@/lib/buy-now';
import { toast } from 'sonner';
import {
  fetchShopSettings,
  type ShopSettings,
  parseContactEntries,
} from '@/lib/shop-api';
import type { ParsedVariant } from '../product-details';

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

function getColorHex(colorName: string, index: number): string {
  const c = colorName.toLowerCase().trim();
  if (c.includes('black') || c.includes('midnight') || c.includes('noir')) return '#18181b';
  if (c.includes('white') || c.includes('ivory')) return '#ffffff';
  if (c.includes('khaki') || c.includes('taupe')) return '#998d75';
  if (c.includes('sky blue') || c.includes('light blue') || c.includes('aakashi')) return '#7dd3fc';
  if (c.includes('navy')) return '#1e3a8a';
  if (c.includes('blue')) return '#3b82f6';
  if (c.includes('rose') || c.includes('dusty rose')) return '#f472b6';
  if (c.includes('pink') || c.includes('magenta')) return '#ec1c67';
  if (c.includes('green') || c.includes('olive') || c.includes('sage')) return '#65a30d';
  if (c.includes('emerald') || c.includes('mint')) return '#10b981';
  if (c.includes('red') || c.includes('crimson') || c.includes('maroon')) return '#dc2626';
  if (c.includes('brown') || c.includes('chocolate') || c.includes('coffee')) return '#78350f';
  if (c.includes('tan') || c.includes('beige') || c.includes('nude')) return '#d4b996';
  if (c.includes('gray') || c.includes('grey') || c.includes('charcoal')) return '#475569';
  if (c.includes('gold') || c.includes('mustard') || c.includes('yellow')) return '#eab308';
  if (c.includes('purple') || c.includes('lavender') || c.includes('violet')) return '#a855f7';
  const fallbacks = ['#998d75', '#3a3d40', '#1a1a1a', '#ec1c67', '#38bdf8', '#c9b097'];
  return fallbacks[index % fallbacks.length];
}

export default function ProductInfo({
  name,
  subtitle,
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
  onReviewsClick,
}: ProductInfoProps) {
  const router = useRouter();
  const { addItem } = useCart();

  const [settings, setSettings] = useState<ShopSettings | null>(initialSettings ?? null);
  const [quantity, setQuantity] = useState(1);
  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false);
  const [isDescExpanded, setIsDescExpanded] = useState(false);
  const [openAccordion, setOpenAccordion] = useState<string | null>('details');

  // Selected Variant
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

  useEffect(() => {
    if (!settings) {
      fetchShopSettings()
        .then((s) => {
          if (s) setSettings(s);
        })
        .catch(() => {});
    }
  }, [settings]);

  // Sync variant to parent
  useEffect(() => {
    if (onVariantChange) {
      onVariantChange(selectedVariant);
    }
  }, [selectedVariant, onVariantChange]);

  // Extract available sizes from variants or provide fashion standards
  const availableSizes = useMemo(() => {
    const fromVariants = variants
      .map((v) => v.attributes.Size || v.attributes.size)
      .filter(Boolean) as string[];
    const unique = Array.from(new Set(fromVariants));
    return unique.length > 0 ? unique : ['XS', 'S', 'M', 'L', 'XL'];
  }, [variants]);

  const [selectedSize, setSelectedSize] = useState<string>(() => {
    const fromVar = selectedVariant?.attributes.Size || selectedVariant?.attributes.size;
    return fromVar || availableSizes[2] || availableSizes[0] || 'M';
  });

  // Extract available colors from variants
  const availableColors = useMemo(() => {
    const fromVariants = variants
      .map((v) => v.attributes.Color || v.attributes.Colour || v.attributes.color)
      .filter(Boolean) as string[];
    const unique = Array.from(new Set(fromVariants));
    return unique.length > 0 ? unique : ['Dark khaki', 'Dusty Rose', 'Midnight Black'];
  }, [variants]);

  const [selectedColor, setSelectedColor] = useState<string>(() => {
    const fromVar =
      selectedVariant?.attributes.Color ||
      selectedVariant?.attributes.Colour ||
      selectedVariant?.attributes.color;
    return fromVar || availableColors[0] || 'Dark khaki';
  });

  const handleSelectSize = (size: string) => {
    setSelectedSize(size);
    const match = variants.find(
      (v) => (v.attributes.Size || v.attributes.size)?.toLowerCase() === size.toLowerCase()
    );
    if (match) {
      setSelectedVariant(match);
    }
  };

  const handleSelectColor = (color: string) => {
    setSelectedColor(color);
    const match = variants.find(
      (v) =>
        (v.attributes.Color || v.attributes.Colour || v.attributes.color)?.toLowerCase() ===
        color.toLowerCase()
    );
    if (match) {
      setSelectedVariant(match);
    }
  };

  const handleQuantityChange = (type: 'inc' | 'dec') => {
    if (type === 'dec') {
      setQuantity((q) => (q > 1 ? q - 1 : 1));
    } else {
      const maxStock = selectedVariant?.stockQuantity ?? 99;
      setQuantity((q) => (q < maxStock ? q + 1 : q));
    }
  };

  const toggleAccordion = (sec: string) => {
    setOpenAccordion((prev) => (prev === sec ? null : sec));
  };

  const stockQty = selectedVariant?.stockQuantity ?? 100;
  const isOutOfStock = stockQty <= 0;

  const displayPrice = selectedVariant ? selectedVariant.priceFormatted : price;
  const displayOriginalPrice = selectedVariant ? selectedVariant.originalPriceFormatted : originalPrice;
  const activeVariantId = selectedVariant?.id || variantId || variants?.[0]?.id || '';

  // Contact info
  const validContacts = parseContactEntries(settings?.contactNumber);
  const primaryPhone = validContacts[0]?.value || '+880 1706-126663';
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
      color: selectedColor || attributes.Color || attributes.Colour || attributes.color || '',
      size: selectedSize || attributes.Size || attributes.size || '',
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
      await addItem(buildCartItem(), { silent: false });
      setIsAdded(true);
      if (addedTimer.current) clearTimeout(addedTimer.current);
      addedTimer.current = setTimeout(() => setIsAdded(false), 2000);
      toast.success('Added to your shopping bag!');
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

  // Delivery charge settings
  const feeInside = settings?.deliveryChargeInside ?? 60;
  const feeOutside = settings?.deliveryChargeOutside ?? 120;

  // Clean description text
  const cleanDescription = description || productData.description || '';
  const descParagraph =
    cleanDescription.replace(/<[^>]*>?/gm, '').trim() ||
    `Crafted with authentic imported Bangkok fabrics, featuring modern tailored lines, premium finishings, and all-day comfort suitable for casual outings, work, and elevated occasions.`;

  return (
    <>
      {/* ══════════════════════════════════════════════════════════════════
          MOBILE PRODUCT INFO (Clean, Modern Brand Aesthetic)
         ══════════════════════════════════════════════════════════════════ */}
      <section className="lg:hidden w-full font-sans bg-white border-b border-zinc-200">
        <div className="p-4 sm:p-5 space-y-4">
          
          {/* Row 1: Brand Eyebrow + Star Rating */}
          <div className="flex items-center justify-between gap-2">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-xs text-[10px] font-bold uppercase tracking-wider bg-[#fff0f5] text-[#ec1c67] border border-[#fbcfe8]">
              {category || brand || 'Mini Thailand Exclusive'}
            </span>

            <button
              type="button"
              onClick={onReviewsClick}
              className="inline-flex items-center gap-1.5 text-zinc-600 hover:text-zinc-950 font-medium text-xs cursor-pointer"
            >
              <div className="flex text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <LuStar key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <span className="font-semibold text-zinc-800">4.8</span>
              <span className="text-zinc-400">(514)</span>
            </button>
          </div>

          {/* Row 2: Title and Prices */}
          <div className="space-y-1.5">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-950 font-sans leading-snug">
              {name}
            </h1>

            <div className="flex items-baseline gap-2.5 flex-wrap">
              <span className="text-2xl font-extrabold text-[#ec1c67] tracking-tight">
                {displayPrice}
              </span>
              {displayOriginalPrice && (
                <span className="text-sm text-zinc-400 line-through font-normal">
                  {displayOriginalPrice}
                </span>
              )}
              <span className="px-2 py-0.5 rounded-xs text-[10px] font-bold uppercase tracking-wider bg-rose-50 text-[#ec1c67] border border-rose-200">
                New Arrivals
              </span>
            </div>
          </div>

          {/* Row 3: Color Selector */}
          {availableColors.length > 0 && (
            <div className="space-y-2 pt-1">
              <div className="text-xs font-medium text-zinc-700">
                Color: <strong className="font-bold text-zinc-950">{selectedColor}</strong>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {availableColors.map((color, idx) => {
                  const isSelected = color === selectedColor;
                  const colorBg = getColorHex(color, idx);
                  const isLight = ['#ffffff', '#fef3c7', '#d4b996', '#7dd3fc', '#f472b6'].includes(colorBg.toLowerCase());
                  return (
                    <button
                      key={color}
                      type="button"
                      onClick={() => handleSelectColor(color)}
                      className={`flex items-center gap-1.5 pl-1.5 pr-2.5 py-1 rounded-none border text-xs transition-all cursor-pointer ${
                        isSelected
                          ? 'border-[#ec1c67] bg-[#fff0f5] text-[#ec1c67] font-bold ring-1 ring-[#ec1c67]'
                          : 'border-zinc-200 bg-white text-zinc-700 hover:border-zinc-400'
                      }`}
                    >
                      <span
                        className={`w-3.5 h-3.5 rounded-none border shrink-0 ${isLight ? 'border-zinc-300' : 'border-black/20'}`}
                        style={{ backgroundColor: colorBg }}
                      />
                      <span className="text-[11px] truncate max-w-[90px]">{color}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Row 4: Size Selector */}
          <div className="space-y-2 pt-1">
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium text-zinc-700">
                Size: <strong className="font-bold text-zinc-950">{selectedSize}</strong>
              </span>
              <button
                type="button"
                onClick={() => setIsSizeGuideOpen(true)}
                className="inline-flex items-center gap-1 text-[#ec1c67] font-semibold hover:underline cursor-pointer"
              >
                <LuRuler className="w-3.5 h-3.5" />
                <span>Size guide</span>
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {availableSizes.map((size) => {
                const isSelected = size === selectedSize;
                return (
                  <button
                    key={size}
                    type="button"
                    onClick={() => handleSelectSize(size)}
                    className={`min-w-[48px] px-3.5 h-10 rounded-none text-xs font-bold transition-all cursor-pointer flex items-center justify-center shrink-0 border ${
                      isSelected
                        ? 'bg-zinc-950 text-white border-zinc-950 shadow-sm'
                        : 'bg-white text-zinc-800 border-zinc-200 hover:border-zinc-400'
                    }`}
                  >
                    {size}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Row 5: Description with Read More */}
          <div className="space-y-1 text-xs text-zinc-600 leading-relaxed font-normal pt-1">
            <p>
              {isDescExpanded ? descParagraph : `${descParagraph.slice(0, 130)}... `}
              <button
                type="button"
                onClick={() => setIsDescExpanded(!isDescExpanded)}
                className="font-bold text-[#ec1c67] hover:underline cursor-pointer ml-1 inline text-xs"
              >
                {isDescExpanded ? 'Read Less' : 'Read More'}
              </button>
            </p>
          </div>

          {/* Row 6: Action Row (Stepper + Add to Bag + Buy Now) */}
          <div className="space-y-2.5 pt-2">
            <div className="flex items-center gap-2">
              {/* Stepper */}
              <div className="flex items-center border border-zinc-200 rounded-none bg-white p-0.5 shrink-0 h-12">
                <button
                  type="button"
                  onClick={() => handleQuantityChange('dec')}
                  disabled={isOutOfStock || quantity <= 1}
                  className="w-9 h-full rounded-none hover:bg-zinc-100 flex items-center justify-center text-zinc-700 disabled:opacity-30 cursor-pointer font-bold text-sm"
                >
                  -
                </button>
                <span className="w-7 text-center font-bold text-xs text-zinc-950">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => handleQuantityChange('inc')}
                  disabled={isOutOfStock || quantity >= stockQty}
                  className="w-9 h-full rounded-none hover:bg-zinc-100 flex items-center justify-center text-zinc-700 disabled:opacity-30 cursor-pointer font-bold text-sm"
                >
                  +
                </button>
              </div>

              {/* Add to Bag Button */}
              <button
                type="button"
                onClick={handleAddToCart}
                disabled={isOutOfStock || isAdding}
                className="flex-1 h-12 rounded-none bg-zinc-950 hover:bg-zinc-800 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer transition-all shadow-sm disabled:opacity-50"
              >
                {isAdding ? (
                  <LuLoaderCircle className="w-4 h-4 animate-spin" />
                ) : isAdded ? (
                  <LuCheck className="w-4 h-4 text-emerald-400" />
                ) : (
                  <LuShoppingBag className="w-4 h-4" />
                )}
                <span>{isAdding ? 'Adding…' : isAdded ? 'Added to Bag' : 'Add to Bag'}</span>
              </button>
            </div>

            {/* Buy Now Button (High-Converting Brand Hot Pink) */}
            <button
              type="button"
              onClick={handleBuyNow}
              disabled={isOutOfStock || isAdding}
              className="w-full h-12 rounded-none bg-gradient-to-r from-[#ec1c67] to-[#d81358] hover:from-[#d81358] hover:to-[#b30c45] text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md active:scale-[0.99] disabled:opacity-50"
            >
              <LuZap className="w-4 h-4" />
              <span>Buy It Now</span>
            </button>
          </div>

          {/* Row 7: WhatsApp Order */}
          <div className="pt-1">
            <a
              href={`https://wa.me/${formattedWhatsapp}?text=${encodeURIComponent(
                `Hello MiniThailandBD, I would like to order: *${name}* (${displayPrice})\nLink: ${
                  typeof window !== 'undefined' ? window.location.href : ''
                }`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full h-10 px-3 rounded-none border border-emerald-200 bg-emerald-50/80 text-emerald-800 hover:bg-emerald-100 font-semibold text-xs flex items-center justify-center gap-2 transition-colors"
            >
              <FaWhatsapp className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>WhatsApp Order</span>
            </a>
          </div>

          {/* Row 8: Trust Badges */}
          <div className="rounded-none border border-zinc-200/80 bg-zinc-50/70 p-3 space-y-2 text-xs text-zinc-600">
            <div className="flex items-center gap-2">
              <LuCheck className="w-4 h-4 text-[#ec1c67] shrink-0 stroke-[2.5]" />
              <span>Free delivery on orders over ৳5,000</span>
            </div>
            <div className="flex items-center gap-2">
              <LuCheck className="w-4 h-4 text-emerald-600 shrink-0 stroke-[2.5]" />
              <span>Ordered before 3 PM, dispatched today across 64 districts</span>
            </div>
          </div>

          {/* Row 9: Accordion Sections */}
          <div className="pt-2 border-t border-zinc-100 divide-y divide-zinc-100">
            {[
              {
                id: 'details',
                title: 'Product Details',
                content: (
                  <ul className="list-disc pl-4 space-y-1 text-xs text-zinc-600 leading-relaxed font-normal">
                    <li>Cropped modern silhouette with refined tailoring</li>
                    <li>Premium imported fabric from Bangkok with breathable comfort</li>
                    <li>Functional buttons &amp; reinforced seam construction</li>
                    <li>SKU: {selectedVariant?.sku || sku || 'MT-LUM-001'}</li>
                    <li>Category: {category || 'Boutique Apparel'}</li>
                  </ul>
                ),
              },
              {
                id: 'shipment',
                title: 'Shipment & Delivery',
                content: (
                  <div className="space-y-1.5 text-xs text-zinc-600 leading-relaxed font-normal">
                    <p><strong>Dhaka City:</strong> ৳{feeInside} (Delivered within 24–48 hours)</p>
                    <p><strong>Outside Dhaka:</strong> ৳{feeOutside} (Delivered within 2–3 business days)</p>
                    <p>Cash on Delivery (COD) available nationwide across 64 districts.</p>
                  </div>
                ),
              },
              {
                id: 'material',
                title: 'Material & Care',
                content: (
                  <ul className="list-disc pl-4 space-y-1 text-xs text-zinc-600 leading-relaxed font-normal">
                    <li>Dry clean or gentle hand wash in cold water</li>
                    <li>Do not bleach or tumble dry</li>
                    <li>Cool iron inside out if needed</li>
                  </ul>
                ),
              },
            ].map((section) => {
              const isOpen = openAccordion === section.id;
              return (
                <div key={section.id} className="py-2.5">
                  <button
                    type="button"
                    onClick={() => toggleAccordion(section.id)}
                    className="w-full flex items-center justify-between text-xs font-bold text-zinc-900 cursor-pointer select-none"
                  >
                    <span>{section.title}</span>
                    {isOpen ? <IoChevronUp className="w-3.5 h-3.5 text-zinc-500" /> : <IoChevronDown className="w-3.5 h-3.5 text-zinc-500" />}
                  </button>
                  {isOpen && <div className="pt-2">{section.content}</div>}
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════
          DESKTOP PRODUCT INFO COLUMN (Cohesive, Modern Mini Thailand Theme)
         ══════════════════════════════════════════════════════════════════ */}
      <section className="hidden lg:flex min-w-0 w-full flex-col font-sans text-zinc-900 lg:col-span-6 sticky top-[72px] self-start space-y-4">
        
        {/* 1. Category Eyebrow & Brand */}
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <span className="inline-flex items-center px-3 py-1 rounded-xs text-[11px] font-bold tracking-wider uppercase bg-[#fff0f5] text-[#ec1c67] border border-[#fbcfe8]">
            {category || brand || 'Mini Thailand Exclusive'}
          </span>

          <div className="flex items-center gap-2 text-xs">
            <div className="flex text-amber-400">
              {[...Array(5)].map((_, i) => (
                <LuStar key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              ))}
            </div>
            <button
              type="button"
              onClick={onReviewsClick}
              className="hover:text-[#ec1c67] hover:underline cursor-pointer font-semibold text-zinc-700"
            >
              4.8 <span className="text-zinc-400 font-normal">(514 reviews)</span>
            </button>
          </div>
        </div>

        {/* 2. Product Title */}
        <h1 className="text-2xl xl:text-3xl font-extrabold text-zinc-950 tracking-tight leading-snug">
          {name}
        </h1>

        {/* 3. Price Block */}
        <div className="flex items-baseline gap-3 flex-wrap">
          <span className="text-3xl font-extrabold text-[#ec1c67] tracking-tight">
            {displayPrice}
          </span>
          {displayOriginalPrice && (
            <span className="text-base text-zinc-400 line-through font-normal">
              {displayOriginalPrice}
            </span>
          )}
          <span className="px-2.5 py-0.5 rounded-xs text-[11px] font-bold uppercase tracking-wider bg-rose-50 text-[#ec1c67] border border-rose-200">
            New Arrivals
          </span>
        </div>

        {/* 4. Short Description Paragraph */}
        <p className="text-xs sm:text-[13px] text-zinc-600 leading-relaxed font-normal">
          {descParagraph}
        </p>

        {/* 5. Variant Selection Box (Card container) */}
        <div className="rounded-none border border-zinc-200/80 bg-zinc-50/60 p-4 space-y-3.5">
          {/* Color Selector */}
          {availableColors.length > 0 && (
            <div className="space-y-2">
              <div className="text-xs font-medium text-zinc-700">
                Color: <strong className="font-bold text-zinc-950">{selectedColor}</strong>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {availableColors.map((color, idx) => {
                  const isSelected = color === selectedColor;
                  const colorBg = getColorHex(color, idx);
                  const isLight = ['#ffffff', '#fef3c7', '#d4b996', '#7dd3fc', '#f472b6'].includes(colorBg.toLowerCase());
                  return (
                    <button
                      key={color}
                      type="button"
                      onClick={() => handleSelectColor(color)}
                      title={color}
                      className={`flex items-center gap-1.5 pl-1.5 pr-3 py-1.5 rounded-none border text-xs transition-all cursor-pointer ${
                        isSelected
                          ? 'border-[#ec1c67] bg-[#fff0f5] text-[#ec1c67] font-bold ring-1 ring-[#ec1c67] shadow-xs'
                          : 'border-zinc-200 bg-white text-zinc-700 hover:border-zinc-400 hover:bg-zinc-50'
                      }`}
                    >
                      <span
                        className={`w-4 h-4 rounded-none border shrink-0 ${isLight ? 'border-zinc-300' : 'border-black/20'}`}
                        style={{ backgroundColor: colorBg }}
                      />
                      <span className="text-xs truncate">{color}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Size Selector */}
          <div className="space-y-2 pt-1 border-t border-zinc-200/60">
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium text-zinc-700">
                Size: <strong className="font-bold text-zinc-950">{selectedSize}</strong>
              </span>
              <button
                type="button"
                onClick={() => setIsSizeGuideOpen(true)}
                className="inline-flex items-center gap-1 text-[#ec1c67] font-semibold hover:underline cursor-pointer"
              >
                <LuRuler className="w-3.5 h-3.5" />
                <span>Size guides</span>
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {availableSizes.map((size) => {
                const isSelected = size === selectedSize;
                return (
                  <button
                    key={size}
                    type="button"
                    onClick={() => handleSelectSize(size)}
                    className={`min-w-[48px] px-3.5 h-10 rounded-none text-xs font-bold transition-all cursor-pointer flex items-center justify-center shrink-0 border ${
                      isSelected
                        ? 'bg-zinc-950 text-white border-zinc-950 shadow-sm'
                        : 'bg-white text-zinc-800 border-zinc-200 hover:border-zinc-400 hover:bg-zinc-50'
                    }`}
                  >
                    {size}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* 6. Purchase Action Buttons */}
        <div className="space-y-2.5 pt-1">
          <div className="flex items-center gap-2.5">
            {/* Stepper */}
            <div className="flex items-center border border-zinc-200 rounded-none bg-white p-0.5 shrink-0 h-12 shadow-2xs">
              <button
                type="button"
                onClick={() => handleQuantityChange('dec')}
                disabled={isOutOfStock || quantity <= 1}
                className="w-9 h-full rounded-none hover:bg-zinc-100 flex items-center justify-center text-zinc-700 disabled:opacity-30 cursor-pointer font-bold text-sm"
              >
                -
              </button>
              <span className="w-8 text-center font-bold text-xs text-zinc-950">
                {quantity}
              </span>
              <button
                type="button"
                onClick={() => handleQuantityChange('inc')}
                disabled={isOutOfStock || quantity >= stockQty}
                className="w-9 h-full rounded-none hover:bg-zinc-100 flex items-center justify-center text-zinc-700 disabled:opacity-30 cursor-pointer font-bold text-sm"
              >
                +
              </button>
            </div>

            {/* Add to Cart button */}
            <button
              type="button"
              onClick={handleAddToCart}
              disabled={isOutOfStock || isAdding}
              className="flex-1 h-12 rounded-none bg-zinc-950 hover:bg-zinc-800 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm hover:shadow-md active:scale-[0.99] disabled:opacity-50"
            >
              {isAdding ? (
                <LuLoaderCircle className="w-4 h-4 animate-spin" />
              ) : isAdded ? (
                <LuCheck className="w-4 h-4 text-emerald-400" />
              ) : (
                <LuShoppingBag className="w-4 h-4" />
              )}
              <span>{isAdding ? 'Adding…' : isAdded ? 'Added to Bag' : 'Add to cart'}</span>
            </button>
          </div>

          {/* Buy It Now button (Mini Thailand Signature Hot Pink) */}
          <button
            type="button"
            onClick={handleBuyNow}
            disabled={isOutOfStock || isAdding}
            className="w-full h-12 rounded-none bg-gradient-to-r from-[#ec1c67] to-[#d81358] hover:from-[#d81358] hover:to-[#b30c45] text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md hover:shadow-lg active:scale-[0.99] disabled:opacity-50"
          >
            <LuZap className="w-4 h-4" />
            <span>Buy it now</span>
          </button>
        </div>

        {/* 7. WhatsApp Order */}
        <div className="pt-0.5">
          <a
            href={`https://wa.me/${formattedWhatsapp}?text=${encodeURIComponent(
              `Hello MiniThailandBD, I would like to order: *${name}* (${displayPrice})\nLink: ${
                typeof window !== 'undefined' ? window.location.href : ''
              }`
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full h-11 px-3.5 rounded-none border border-emerald-200 bg-emerald-50/80 text-emerald-800 hover:bg-emerald-100 font-semibold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-2xs"
          >
            <FaWhatsapp className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>WhatsApp Order</span>
          </a>
        </div>

        {/* 8. Trust Signals Card */}
        <div className="rounded-none border border-zinc-200/80 bg-zinc-50/70 p-3.5 space-y-2 text-xs text-zinc-600">
          <div className="flex items-center gap-2.5">
            <div className="w-5 h-5 rounded-full bg-[#ec1c67]/10 text-[#ec1c67] flex items-center justify-center shrink-0">
              <LuCheck className="w-3.5 h-3.5 stroke-[2.5]" />
            </div>
            <span>Free delivery on orders over ৳5,000 nationwide</span>
          </div>
          <div className="flex items-center gap-2.5">
            <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
              <LuCheck className="w-3.5 h-3.5 stroke-[2.5]" />
            </div>
            <span>Ordered before 3 PM, dispatched today across 64 districts</span>
          </div>
          <div className="flex items-center gap-2.5">
            <div className="w-5 h-5 rounded-full bg-zinc-200 text-zinc-800 flex items-center justify-center shrink-0">
              <LuCheck className="w-3.5 h-3.5 stroke-[2.5]" />
            </div>
            <span>100% Authentic imported Bangkok boutique collection</span>
          </div>
        </div>

        {/* 9. Product Details Accordion */}
        <div className="rounded-none border border-zinc-200/80 bg-white divide-y divide-zinc-100 overflow-hidden">
          {[
            {
              id: 'details',
              title: 'Product Details',
              content: (
                <ul className="list-disc pl-4 space-y-1 text-xs text-zinc-600 leading-relaxed font-normal">
                  <li>Cropped modern silhouette with refined tailoring</li>
                  <li>Utility-inspired design with premium Bangkok imported fabrics</li>
                  <li>Front button / zipper closure with high-grade durable hardware</li>
                  <li>Functional front flap pockets for elevated everyday styling</li>
                  <li>SKU: {selectedVariant?.sku || sku || 'MT-LUM-001'}</li>
                  <li>Category: {category || 'Boutique Apparel'}</li>
                </ul>
              ),
            },
            {
              id: 'shipment',
              title: 'Shipment & Delivery',
              content: (
                <div className="space-y-1.5 text-xs text-zinc-600 leading-relaxed font-normal">
                  <p><strong>Inside Dhaka:</strong> ৳{feeInside} (Delivered within 24–48 hours)</p>
                  <p><strong>Outside Dhaka:</strong> ৳{feeOutside} (Delivered within 2–3 business days)</p>
                  <p>Cash on Delivery (COD) available across all 64 districts in Bangladesh.</p>
                </div>
              ),
            },
            {
              id: 'material',
              title: 'Material & Care',
              content: (
                <ul className="list-disc pl-4 space-y-1 text-xs text-zinc-600 leading-relaxed font-normal">
                  <li>Hand wash cold or gentle machine cycle</li>
                  <li>Wash with similar colors inside out</li>
                  <li>Do not bleach or tumble dry</li>
                  <li>Cool iron on reverse side</li>
                </ul>
              ),
            },
          ].map((section) => {
            const isOpen = openAccordion === section.id;
            return (
              <div key={section.id} className="p-3">
                <button
                  type="button"
                  onClick={() => toggleAccordion(section.id)}
                  className="w-full flex items-center justify-between text-xs font-bold text-zinc-900 cursor-pointer select-none hover:text-[#ec1c67] transition-colors"
                >
                  <span>{section.title}</span>
                  {isOpen ? <IoChevronUp className="w-3.5 h-3.5 text-zinc-500" /> : <IoChevronDown className="w-3.5 h-3.5 text-zinc-500" />}
                </button>
                {isOpen && <div className="pt-2.5">{section.content}</div>}
              </div>
            );
          })}
        </div>

      </section>

      {/* Size Guide Modal */}
      <SizeGuideModal
        isOpen={isSizeGuideOpen}
        onClose={() => setIsSizeGuideOpen(false)}
        category={category}
      />

      {/* Mobile Sticky Buy Bar on Deep Scroll */}
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
