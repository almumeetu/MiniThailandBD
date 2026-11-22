'use client';

import { useState, useEffect } from 'react';
import { IoBagCheckOutline, IoFlashOutline } from 'react-icons/io5';

interface MobileStickyBuyBarProps {
  name: string;
  priceFormatted: string;
  onAddToCart: () => void;
  onBuyNow: () => void;
  isOutOfStock?: boolean;
  isAdding?: boolean;
}

export default function MobileStickyBuyBar({
  name,
  priceFormatted,
  onAddToCart,
  onBuyNow,
  isOutOfStock = false,
  isAdding = false,
}: MobileStickyBuyBarProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Show sticky bar once scrolled down 350px
      if (window.scrollY > 350) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (!isVisible) return null;

  return (
    <div
      data-mobile-purchase-bar
      aria-label={`Buy ${name}`}
      className="fixed bottom-[calc(4rem+env(safe-area-inset-bottom))] left-0 right-0 z-40 md:bottom-0 lg:hidden bg-white/95 backdrop-blur-md border-t border-zinc-200 px-4 pt-2.5 pb-2.5 md:pb-[max(0.75rem,env(safe-area-inset-bottom))] shadow-lg"
    >
      <div className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-3 max-w-xl mx-auto">
        <div className="min-w-0 pr-1">
          <span className="text-base sm:text-lg font-extrabold text-[#ec1c67] tracking-tight block">
            {priceFormatted}
          </span>
          <span className="text-[10px] text-zinc-500 font-medium truncate block max-w-28 sm:max-w-32">
            In stock
          </span>
        </div>

        {/* Buttons */}
        <div className="grid min-w-0 grid-cols-2 gap-2">
          <button
            type="button"
            onClick={onAddToCart}
            disabled={isOutOfStock || isAdding}
            aria-busy={isAdding}
            className="min-w-0 h-11 px-3 bg-zinc-950 hover:bg-zinc-800 text-white font-bold text-xs uppercase tracking-wider rounded-xl flex items-center justify-center gap-1.5 transition-colors disabled:opacity-40 cursor-pointer shadow-xs"
            aria-label="Add to Bag"
          >
            <IoBagCheckOutline className="w-4 h-4" />
            <span>{isAdding ? 'Adding…' : 'Add to Bag'}</span>
          </button>

          <button
            type="button"
            onClick={onBuyNow}
            disabled={isOutOfStock || isAdding}
            className="min-w-0 h-11 px-3 bg-gradient-to-r from-[#ec1c67] to-[#d81358] hover:from-[#d81358] hover:to-[#b30c45] text-white font-bold text-xs uppercase tracking-wider rounded-xl flex items-center justify-center gap-1.5 transition-all disabled:opacity-40 shadow-sm cursor-pointer active:scale-95"
            aria-label="Buy Now"
          >
            <IoFlashOutline className="w-3.5 h-3.5" />
            <span>Buy Now</span>
          </button>
        </div>
      </div>
    </div>
  );
}
