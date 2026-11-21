'use client';

import { useEffect, useMemo, useRef, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import ProductCard, { ProductCardSkeleton } from '@/components/sections/ui/product-card';
import {
  fetchShopProducts,
  fetchShopCategories,
  fetchShopBrands,
  type ShopProduct,
  type ShopCategory,
  type ShopBrand,
} from '@/lib/shop-api';
import {
  LuSlidersHorizontal,
  LuX,
  LuChevronDown,
  LuChevronUp,
  LuSearch,
  LuCheck,
  LuRotateCcw,
  LuTag,
  LuRows2,
  LuGrid2X2,
} from 'react-icons/lu';
import { IoCloseOutline } from 'react-icons/io5';

const PAGE_LIMIT = 32;
const FETCH_BATCH_SIZE = 100;

const SORT_OPTIONS = [
  { label: 'Date, new to old', value: 'newest' },
  { label: 'Price, low to high', value: 'price_asc' },
  { label: 'Price, high to low', value: 'price_desc' },
  { label: 'Alphabetically, A-Z', value: 'alpha_asc' },
  { label: 'Alphabetically, Z-A', value: 'alpha_desc' },
];

const PRICE_PRESETS = [
  { label: 'Under ৳1,000', min: 0, max: 1000 },
  { label: '৳1,000 - ৳3,000', min: 1000, max: 3000 },
  { label: '৳3,000 - ৳10,000', min: 3000, max: 10000 },
  { label: 'Over ৳10,000', min: 10000, max: Infinity },
];

const NO_IMAGE = '/images/no-image-icon-6.png';

function ProductsPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const searchVal = searchParams?.get('search') || '';

  // Display & UI state (3, 4, 5, 6 columns for desktop, 1 or 2 for mobile)
  const [viewMode, setViewMode] = useState<'grid1' | 'grid2' | 'grid3' | 'grid4' | 'grid5' | 'grid6'>('grid5');
  const productGridClassName = `grid ${
    viewMode === 'grid1'
      ? 'grid-cols-1 gap-3 sm:gap-4'
      : viewMode === 'grid2'
      ? 'grid-cols-2 gap-2.5 sm:gap-4'
      : viewMode === 'grid3'
      ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-5'
      : viewMode === 'grid4'
      ? 'grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-4'
      : viewMode === 'grid5'
      ? 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-3.5'
      : 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 sm:gap-3'
  }`;
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [isSortDropdownOpen, setIsSortDropdownOpen] = useState(false);

  // Accordion open/close state for Shopify facets
  const [openAccordions, setOpenAccordions] = useState<Record<string, boolean>>({
    availability: true,
    price: true,
    collection: true,
    category: true,
    brand: true,
    deals: true,
  });

  const toggleAccordion = (facet: string) => {
    setOpenAccordions((prev) => ({ ...prev, [facet]: !prev[facet] }));
  };

  // DB Data
  const [dbCategories, setDbCategories] = useState<ShopCategory[]>([]);
  const [dbBrands, setDbBrands] = useState<ShopBrand[]>([]);

  // Filter Values
  const [selectedCollection, setSelectedCollection] = useState<string>('All');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedBrand, setSelectedBrand] = useState<string>('All');
  const [minPriceInput, setMinPriceInput] = useState<string>('');
  const [maxPriceInput, setMaxPriceInput] = useState<string>('');
  const [appliedMinPrice, setAppliedMinPrice] = useState<number | null>(null);
  const [appliedMaxPrice, setAppliedMaxPrice] = useState<number | null>(null);
  const [activePricePreset, setActivePricePreset] = useState<string | null>(null);
  const [inStockOnly, setInStockOnly] = useState<boolean>(false);
  const [onSaleOnly, setOnSaleOnly] = useState<boolean>(false);
  const [selectedSort, setSelectedSort] = useState<string>('newest');

  // Search inside brand and category lists
  const [brandSearchTerm, setBrandSearchTerm] = useState('');
  const [catSearchTerm, setCatSearchTerm] = useState('');

  // Products Data
  const [products, setProducts] = useState<ShopProduct[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const reqIdRef = useRef(0);
  const resultsRef = useRef<HTMLDivElement>(null);
  const mobileSortRef = useRef<HTMLDivElement>(null);
  const desktopSortRef = useRef<HTMLDivElement>(null);
  const filterCloseRef = useRef<HTMLButtonElement>(null);

  // Close sort dropdown when clicking outside
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (
        !mobileSortRef.current?.contains(e.target as Node) &&
        !desktopSortRef.current?.contains(e.target as Node)
      ) {
        setIsSortDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  // Lock scroll on mobile drawer
  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    if (isMobileFilterOpen) {
      document.body.style.overflow = 'hidden';
      filterCloseRef.current?.focus();
    }
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsMobileFilterOpen(false);
    };
    if (isMobileFilterOpen) window.addEventListener('keydown', handleEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleEscape);
    };
  }, [isMobileFilterOpen]);

  // Load filter reference metadata
  useEffect(() => {
    async function loadFilterData() {
      try {
        const [cats, brs] = await Promise.all([
          fetchShopCategories(),
          fetchShopBrands(),
        ]);
        setDbCategories(cats);
        setDbBrands(brs);
      } catch (err) {
        console.error('Failed to load filter options:', err);
      }
    }
    loadFilterData();
  }, []);

  // Sync category param from URL on initial mount or change
  useEffect(() => {
    if (typeof window !== 'undefined' && dbCategories.length > 0) {
      const params = new URLSearchParams(window.location.search);
      const cat = params.get('category');
      const brandParam = params.get('brand');
      const dealsParam = params.get('deals') || params.get('offer');

      if (dealsParam === 'true' || dealsParam === '1') {
        setOnSaleOnly(true);
      }

      if (brandParam) {
        const matchedBrand = dbBrands.find(
          (b) => b.name.toLowerCase() === brandParam.toLowerCase() || b.slug?.toLowerCase() === brandParam.toLowerCase()
        );
        if (matchedBrand) setSelectedBrand(matchedBrand.name);
      }

      if (cat) {
        const decodedCat = decodeURIComponent(cat).toLowerCase().trim();
        const match = dbCategories.find(
          (c) =>
            c.name.toLowerCase() === decodedCat ||
            c.slug?.toLowerCase() === decodedCat ||
            c.slug?.toLowerCase().replace(/-/g, "") === decodedCat.replace(/-/g, "") ||
            c.name.toLowerCase().includes(decodedCat) ||
            decodedCat.includes(c.slug?.toLowerCase() || "")
        );
        if (match) {
          if (!match.parentId) {
            setSelectedCollection(match.name);
            setSelectedCategory('All');
          } else {
            setSelectedCategory(match.name);
            const parent = dbCategories.find((p) => p.id === match.parentId);
            if (parent) {
              setSelectedCollection(parent.name);
            }
          }
        } else {
          setSelectedCategory(cat);
        }
      }
    }
  }, [dbCategories, dbBrands]);

  // Compute options
  const collectionOptions = useMemo(() => {
    const mainCats = dbCategories.filter((c) => !c.parentId);
    return ['All', ...mainCats.map((c) => c.name)];
  }, [dbCategories]);

  const categoryOptions = useMemo(() => {
    const filtered = dbCategories;
    if (selectedCollection !== 'All') {
      const parent = dbCategories.find((c) => c.name.toLowerCase() === selectedCollection.toLowerCase());
      if (!parent) return ['All'];
      const children = parent.children?.length ? parent.children : dbCategories.filter((c) => c.parentId === parent.id);
      return ['All', ...children.map((c) => c.name)];
    }
    return ['All', ...filtered.map((c) => c.name)];
  }, [dbCategories, selectedCollection]);

  const brandOptions = useMemo(() => {
    return ['All', ...dbBrands.map((b) => b.name)];
  }, [dbBrands]);

  const selectedCategoryId = useMemo(() => {
    if (selectedCategory !== 'All') {
      return dbCategories.find((c) => c.name.toLowerCase() === selectedCategory.toLowerCase())?.id;
    }
    if (selectedCollection !== 'All') {
      const col = dbCategories.find((c) => c.name.toLowerCase() === selectedCollection.toLowerCase());
      if (col && !col.children?.length && !dbCategories.some((category) => category.parentId === col.id)) {
        return col.id;
      }
    }
    return undefined;
  }, [selectedCategory, selectedCollection, dbCategories]);

  const selectedBrandId = useMemo(() => {
    if (selectedBrand === 'All') return undefined;
    return dbBrands.find((b) => b.name.toLowerCase() === selectedBrand.toLowerCase())?.id;
  }, [selectedBrand, dbBrands]);

  // Load all matching records before applying client-side filters and sorting.
  useEffect(() => {
    const id = ++reqIdRef.current;
    let cancelled = false;
    setIsLoading(true);
    setLoadError(false);
    setProducts([]);
    async function loadProducts() {
      try {
        const params = { limit: FETCH_BATCH_SIZE, search: searchVal || undefined, categoryId: selectedCategoryId, brandId: selectedBrandId };
        const first = await fetchShopProducts({ ...params, page: 1 });
        const all = [...first.data];
        const pages = Math.ceil(first.total / FETCH_BATCH_SIZE);
        for (let start = 2; start <= pages; start += 4) {
          if (cancelled || id !== reqIdRef.current) return;
          const batch = await Promise.all(Array.from({ length: Math.min(4, pages - start + 1) }, (_, index) => fetchShopProducts({ ...params, page: start + index })));
          all.push(...batch.flatMap((result) => result.data));
        }
        if (!cancelled && id === reqIdRef.current) setProducts(all);
      } catch (error) {
        if (!cancelled && id === reqIdRef.current) {
          console.error('Failed to fetch products:', error);
          setLoadError(true);
        }
      } finally {
        if (!cancelled && id === reqIdRef.current) setIsLoading(false);
      }
    }
    loadProducts();
    return () => { cancelled = true; };
  }, [searchVal, selectedCategoryId, selectedBrandId]);

  // Price presets handler
  const handlePricePreset = (preset: typeof PRICE_PRESETS[0]) => {
    if (activePricePreset === preset.label) {
      setActivePricePreset(null);
      setAppliedMinPrice(null);
      setAppliedMaxPrice(null);
      setMinPriceInput('');
      setMaxPriceInput('');
    } else {
      setActivePricePreset(preset.label);
      setAppliedMinPrice(preset.min);
      setAppliedMaxPrice(preset.max === Infinity ? null : preset.max);
      setMinPriceInput(preset.min.toString());
      setMaxPriceInput(preset.max === Infinity ? '' : preset.max.toString());
    }
  };

  const applyCustomPrice = () => {
    const min = minPriceInput.trim() !== '' ? Number(minPriceInput) : null;
    const max = maxPriceInput.trim() !== '' ? Number(maxPriceInput) : null;
    setAppliedMinPrice(min);
    setAppliedMaxPrice(max);
    setActivePricePreset(null);
  };

  // Filtered & Sorted products pipeline
  const filteredProducts = useMemo(() => {
    let result = products.filter((p) => {
      // 1. Collection filter
      if (selectedCollection !== 'All') {
        const selLower = selectedCollection.toLowerCase();
        const selSlug = selLower.replace(/[^a-z0-9]+/g, "-");
        const prodCat = (p.category || "").toLowerCase();
        const prodSlug = prodCat.replace(/[^a-z0-9]+/g, "-");

        const catObj = dbCategories.find((c) => c.name.toLowerCase() === prodCat || c.slug === prodSlug);
        const parentObj = catObj?.parentId ? dbCategories.find((c) => c.id === catObj.parentId) : null;
        const parentName = parentObj?.name.toLowerCase();

        const matchesCollection =
          prodCat === selLower ||
          prodSlug === selSlug ||
          prodCat.includes(selLower) ||
          selLower.includes(prodCat) ||
          prodSlug.includes(selSlug) ||
          selSlug.includes(prodSlug) ||
          parentName === selLower;

        if (!matchesCollection) {
          return false;
        }
      }

      // 2. Category filter
      if (selectedCategory !== 'All') {
        const selCatLower = selectedCategory.toLowerCase();
        const selCatSlug = selCatLower.replace(/[^a-z0-9]+/g, "-");
        const prodCat = (p.category || "").toLowerCase();
        const prodSlug = prodCat.replace(/[^a-z0-9]+/g, "-");
        const matchesCategory =
          prodCat === selCatLower ||
          prodSlug === selCatSlug ||
          prodCat.includes(selCatLower) ||
          selCatLower.includes(prodCat);
        if (!matchesCategory) {
          return false;
        }
      }

      // 3. Brand filter
      if (selectedBrand !== 'All' && p.team?.toLowerCase() !== selectedBrand.toLowerCase()) {
        return false;
      }

      // 4. Price range filter
      if (appliedMinPrice !== null && p.price < appliedMinPrice) return false;
      if (appliedMaxPrice !== null && p.price > appliedMaxPrice) return false;

      if (inStockOnly && !p.inStock) return false;

      // 5. On sale filter
      if (onSaleOnly) {
        if (!p.originalPrice || p.originalPrice <= p.price) return false;
      }

      return true;
    });

    // Sort Pipeline
    if (selectedSort === 'price_asc') {
      result = [...result].sort((a, b) => a.price - b.price);
    } else if (selectedSort === 'price_desc') {
      result = [...result].sort((a, b) => b.price - a.price);
    } else if (selectedSort === 'alpha_asc') {
      result = [...result].sort((a, b) => a.name.localeCompare(b.name));
    } else if (selectedSort === 'alpha_desc') {
      result = [...result].sort((a, b) => b.name.localeCompare(a.name));
    }

    return result;
  }, [
    products,
    selectedCategory,
    selectedCollection,
    selectedBrand,
    appliedMinPrice,
    appliedMaxPrice,
    onSaleOnly,
    inStockOnly,
    selectedSort,
    dbCategories,
  ]);

  const pageCount = Math.max(1, Math.ceil(filteredProducts.length / PAGE_LIMIT));
  const safePage = Math.min(currentPage, pageCount);
  const visibleProducts = filteredProducts.slice((safePage - 1) * PAGE_LIMIT, safePage * PAGE_LIMIT);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchVal, selectedCollection, selectedCategory, selectedBrand, appliedMinPrice, appliedMaxPrice, inStockOnly, onSaleOnly, selectedSort]);

  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, pageCount)));
    const top = resultsRef.current?.getBoundingClientRect().top;
    if (top !== undefined) window.scrollTo({ top: Math.max(0, window.scrollY + top - 150), behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
  };

  // Active filters list
  const activeFilters = useMemo(() => {
    const list: { id: string; label: string; onRemove: () => void }[] = [];

    if (searchVal) {
      list.push({
        id: 'search',
        label: `Search: "${searchVal}"`,
        onRemove: () => router.push('/products'),
      });
    }

    if (selectedCollection !== 'All') {
      list.push({
        id: 'collection',
        label: `Collection: ${selectedCollection}`,
        onRemove: () => setSelectedCollection('All'),
      });
    }

    if (selectedCategory !== 'All') {
      list.push({
        id: 'category',
        label: `Category: ${selectedCategory}`,
        onRemove: () => setSelectedCategory('All'),
      });
    }

    if (selectedBrand !== 'All') {
      list.push({
        id: 'brand',
        label: `Brand: ${selectedBrand}`,
        onRemove: () => setSelectedBrand('All'),
      });
    }

    if (appliedMinPrice !== null || appliedMaxPrice !== null) {
      let priceLabel = '';
      if (appliedMinPrice !== null && appliedMaxPrice !== null) {
        priceLabel = `Price: ৳${appliedMinPrice.toLocaleString()} - ৳${appliedMaxPrice.toLocaleString()}`;
      } else if (appliedMinPrice !== null) {
        priceLabel = `Price: Over ৳${appliedMinPrice.toLocaleString()}`;
      } else if (appliedMaxPrice !== null) {
        priceLabel = `Price: Under ৳${appliedMaxPrice.toLocaleString()}`;
      }
      list.push({
        id: 'price',
        label: priceLabel,
        onRemove: () => {
          setAppliedMinPrice(null);
          setAppliedMaxPrice(null);
          setActivePricePreset(null);
          setMinPriceInput('');
          setMaxPriceInput('');
        },
      });
    }

    if (inStockOnly) {
      list.push({
        id: 'inStock',
        label: 'In Stock Only',
        onRemove: () => setInStockOnly(false),
      });
    }

    if (onSaleOnly) {
      list.push({
        id: 'onSale',
        label: 'On Sale / Deals',
        onRemove: () => setOnSaleOnly(false),
      });
    }

    return list;
  }, [
    searchVal,
    selectedCollection,
    selectedCategory,
    selectedBrand,
    appliedMinPrice,
    appliedMaxPrice,
    inStockOnly,
    onSaleOnly,
    router,
  ]);

  const clearAllFilters = () => {
    setSelectedCollection('All');
    setSelectedCategory('All');
    setSelectedBrand('All');
    setAppliedMinPrice(null);
    setAppliedMaxPrice(null);
    setActivePricePreset(null);
    setMinPriceInput('');
    setMaxPriceInput('');
    setInStockOnly(false);
    setOnSaleOnly(false);
    setSelectedSort('newest');
    if (searchVal) router.push('/products');
  };

  // Page Heading
  const pageHeading = useMemo(() => {
    if (onSaleOnly) return "Offer Zone - Deals & Discounts";
    if (searchVal) return `Search Results for "${searchVal}"`;
    if (selectedCategory !== 'All') return selectedCategory;
    if (selectedCollection !== 'All') return selectedCollection;
    if (selectedBrand !== 'All') return selectedBrand;
    return 'All Products';
  }, [selectedCategory, selectedCollection, selectedBrand, searchVal, onSaleOnly]);

  const currentSortLabel = useMemo(() => {
    return SORT_OPTIONS.find((s) => s.value === selectedSort)?.label || 'Date, new to old';
  }, [selectedSort]);

  // Sidebar Facets Component (used in both Desktop & Mobile Drawer)
  const renderSidebarFilters = () => {
    return (
      <div className="space-y-0 text-sm text-zinc-800">
        {/* 3. Collection / Department Facet */}
        <div className="border-b border-zinc-100 py-2.5">
          <h2 className="font-semibold text-xs sm:text-sm text-zinc-900">Categories</h2>
            <div className="mt-2 space-y-0.5 max-h-56 overflow-y-auto pr-1">
              {collectionOptions.map((opt) => {
                const isSelected = selectedCollection === opt;
                return (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => {
                      setSelectedCollection(opt);
                      setSelectedCategory('All');
                    }}
                    className={`w-full min-h-[30px] flex items-center justify-between px-2.5 py-1 rounded-md text-xs sm:text-[13px] leading-tight text-left transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-store-surface text-store-primary font-bold'
                        : 'text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 font-medium'
                    }`}
                    title={opt}
                  >
                    <span className="truncate pr-1">{opt}</span>
                    {isSelected && <LuCheck className="w-3.5 h-3.5 text-store-primary shrink-0" />}
                  </button>
                );
              })}
            </div>
        </div>

        {/* 4. Subcategories Facet */}
        {selectedCollection !== 'All' && categoryOptions.length > 1 && <div className="border-b border-zinc-100 py-2.5">
          <button
            type="button"
            onClick={() => toggleAccordion('category')}
            className="w-full flex items-center justify-between font-semibold text-xs sm:text-sm text-zinc-900 cursor-pointer select-none py-1"
          >
            <span>Subcategories</span>
            {openAccordions.category ? (
              <LuChevronUp className="w-4 h-4 text-zinc-500" />
            ) : (
              <LuChevronDown className="w-4 h-4 text-zinc-500" />
            )}
          </button>

          {openAccordions.category && (
            <div className="mt-2 space-y-1">
              {/* Category Search Filter if long */}
              {categoryOptions.length > 7 && (
                <div className="relative mb-1.5">
                  <LuSearch className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400" />
                  <input
                    type="text"
                    value={catSearchTerm}
                    onChange={(e) => setCatSearchTerm(e.target.value)}
                    placeholder="Filter categories..."
                    className="w-full h-8 pl-8 pr-2 bg-zinc-50 border border-zinc-200 rounded-md text-xs placeholder-zinc-400 focus:outline-none"
                  />
                </div>
              )}

              <div className="max-h-48 overflow-y-auto space-y-0.5 pr-1">
                {categoryOptions
                  .filter((opt) => opt.toLowerCase().includes(catSearchTerm.toLowerCase()))
                  .map((opt) => {
                    const isSelected = selectedCategory === opt;
                    return (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => setSelectedCategory(opt)}
                        className={`w-full min-h-[30px] flex items-center justify-between px-2.5 py-1 rounded-md text-xs sm:text-[13px] leading-tight text-left transition-colors cursor-pointer ${
                          isSelected
                            ? 'bg-store-surface text-store-primary font-bold'
                            : 'text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 font-medium'
                        }`}
                        title={opt}
                      >
                        <span className="truncate">{opt}</span>
                        {isSelected && <LuCheck className="w-3.5 h-3.5 text-store-primary shrink-0" />}
                      </button>
                    );
                  })}
              </div>
            </div>
          )}
        </div>}

        {/* 1. Availability Facet */}
        <div className="border-b border-zinc-100 py-2.5 first:pt-1">
          <button
            type="button"
            onClick={() => toggleAccordion('availability')}
            className="w-full flex items-center justify-between font-semibold text-xs sm:text-sm text-zinc-900 cursor-pointer select-none py-1"
          >
            <span>Availability</span>
            {openAccordions.availability ? (
              <LuChevronUp className="w-4 h-4 text-zinc-500" />
            ) : (
              <LuChevronDown className="w-4 h-4 text-zinc-500" />
            )}
          </button>

          {openAccordions.availability && (
            <div className="mt-2 space-y-1.5">
              <label className="flex items-center gap-2.5 cursor-pointer select-none group py-0.5">
                <input
                  type="checkbox"
                  checked={inStockOnly}
                  onChange={(e) => setInStockOnly(e.target.checked)}
                  className="w-4 h-4 rounded border-zinc-300 text-store-primary cursor-pointer"
                />
                <span className="text-xs sm:text-sm text-zinc-700 group-hover:text-zinc-900 font-medium">
                  In stock only
                </span>
              </label>
            </div>
          )}
        </div>

        {/* 2. Price Facet (Shopify numeric inputs + presets) */}
        <div className="border-b border-zinc-100 py-2.5">
          <button
            type="button"
            onClick={() => toggleAccordion('price')}
            className="w-full flex items-center justify-between font-semibold text-xs sm:text-sm text-zinc-900 cursor-pointer select-none py-1"
          >
            <span>Price (BDT)</span>
            {openAccordions.price ? (
              <LuChevronUp className="w-4 h-4 text-zinc-500" />
            ) : (
              <LuChevronDown className="w-4 h-4 text-zinc-500" />
            )}
          </button>

          {openAccordions.price && (
            <div className="mt-2 space-y-2.5">
              {/* Quick Preset Pills */}
              <div className="flex flex-wrap gap-1">
                {PRICE_PRESETS.map((preset) => {
                  const isActive = activePricePreset === preset.label;
                  return (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() => handlePricePreset(preset)}
                      className={`min-h-[26px] px-2.5 py-0.5 rounded-full text-[10px] sm:text-[11px] font-semibold border transition-colors cursor-pointer ${
                        isActive
                          ? 'bg-store-primary text-white border-store-primary'
                          : 'bg-zinc-50 text-zinc-700 border-zinc-200 hover:border-zinc-300 hover:bg-zinc-100'
                      }`}
                    >
                      {preset.label}
                    </button>
                  );
                })}
              </div>

              {/* Min - Max Inputs (Mobile responsive 2-column layout) */}
              <div className="space-y-1.5 pt-0.5">
                <div className="grid grid-cols-2 gap-2 items-center">
                  <div className="relative">
                    <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-400 text-xs">৳</span>
                    <input
                      type="number"
                      placeholder="Min"
                      value={minPriceInput}
                      onChange={(e) => setMinPriceInput(e.target.value)}
                      className="w-full h-8 pl-6 pr-2 border border-zinc-200 rounded-md text-xs text-zinc-800 placeholder-zinc-400 focus:outline-none bg-white"
                    />
                  </div>
                  <div className="relative">
                    <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-400 text-xs">৳</span>
                    <input
                      type="number"
                      placeholder="Max"
                      value={maxPriceInput}
                      onChange={(e) => setMaxPriceInput(e.target.value)}
                      className="w-full h-8 pl-6 pr-2 border border-zinc-200 rounded-md text-xs text-zinc-800 placeholder-zinc-400 focus:outline-none bg-white"
                    />
                  </div>
                </div>
                <button
                  type="button"
                  onClick={applyCustomPrice}
                  className="w-full min-h-[32px] py-1 bg-store-primary hover:bg-store-hover text-white rounded-md text-[11px] font-bold uppercase tracking-wider transition-colors cursor-pointer text-center active:scale-[0.99]"
                >
                  Apply Price
                </button>
              </div>
            </div>
          )}
        </div>

        {/* 5. Brand / Vendor Facet */}
        <div className="border-b border-zinc-100 py-2.5">
          <button
            type="button"
            onClick={() => toggleAccordion('brand')}
            className="w-full flex items-center justify-between font-semibold text-xs sm:text-sm text-zinc-900 cursor-pointer select-none py-1"
          >
            <span>Brand / Merchant</span>
            {openAccordions.brand ? (
              <LuChevronUp className="w-4 h-4 text-zinc-500" />
            ) : (
              <LuChevronDown className="w-4 h-4 text-zinc-500" />
            )}
          </button>

          {openAccordions.brand && (
            <div className="mt-2 space-y-1">
              {brandOptions.length > 6 && (
                <div className="relative mb-1.5">
                  <LuSearch className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400" />
                  <input
                    type="text"
                    value={brandSearchTerm}
                    onChange={(e) => setBrandSearchTerm(e.target.value)}
                    placeholder="Search brands..."
                    className="w-full h-8 pl-8 pr-2 bg-zinc-50 border border-zinc-200 rounded-md text-xs placeholder-zinc-400 focus:outline-none"
                  />
                </div>
              )}

              <div className="max-h-48 overflow-y-auto space-y-0.5 pr-1">
                {brandOptions
                  .filter((opt) => opt.toLowerCase().includes(brandSearchTerm.toLowerCase()))
                  .map((opt) => {
                    const isSelected = selectedBrand === opt;
                    return (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => setSelectedBrand(opt)}
                        className={`w-full min-h-[30px] flex items-center justify-between px-2.5 py-1 rounded-md text-xs sm:text-[13px] leading-tight text-left transition-colors cursor-pointer ${
                          isSelected
                            ? 'bg-store-surface text-store-primary font-bold'
                            : 'text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 font-medium'
                        }`}
                        title={opt}
                      >
                        <span className="truncate">{opt}</span>
                        {isSelected && <LuCheck className="w-3.5 h-3.5 text-store-primary shrink-0" />}
                      </button>
                    );
                  })}
              </div>
            </div>
          )}
        </div>

        {/* 6. Special Offers / Discounts */}
        <div className="py-2.5">
          <button
            type="button"
            onClick={() => toggleAccordion('deals')}
            className="w-full flex items-center justify-between font-semibold text-xs sm:text-sm text-zinc-900 cursor-pointer select-none py-1"
          >
            <span>Deals & Discounts</span>
            {openAccordions.deals ? (
              <LuChevronUp className="w-4 h-4 text-zinc-500" />
            ) : (
              <LuChevronDown className="w-4 h-4 text-zinc-500" />
            )}
          </button>

          {openAccordions.deals && (
            <div className="mt-2 space-y-1.5">
              <label className="flex items-center gap-2.5 cursor-pointer select-none group py-0.5">
                <input
                  type="checkbox"
                  checked={onSaleOnly}
                  onChange={(e) => setOnSaleOnly(e.target.checked)}
                  className="w-4 h-4 rounded border-zinc-300 text-store-primary cursor-pointer"
                />
                <span className="text-xs sm:text-sm text-zinc-700 group-hover:text-zinc-900 font-medium flex items-center gap-1.5">
                  <LuTag className="w-3.5 h-3.5 text-rose-500" />
                  <span>On Sale / Special Deals</span>
                </span>
              </label>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col min-h-screen bg-store-page font-sans text-left">
      <main className="flex-grow w-full text-left">
        <div className="mx-auto max-w-[1440px] px-4 pt-5 pb-3 sm:px-6 md:px-10 lg:px-16"><h1 className="text-2xl font-semibold tracking-tight text-store-ink">{pageHeading}</h1></div>

        {/* Shopify OS 2.0 Filter Control Toolbar (Sticky with correct header clearance) */}
        <div className="sticky top-[120px] z-30 w-full border-b border-zinc-200/80 bg-white/95 shadow-[0_8px_24px_rgba(15,23,42,0.06)] backdrop-blur-md">
          <div className="max-w-[1440px] mx-auto px-4 sm:px-6 md:px-10 lg:px-16 py-2.5 sm:py-3">
            
            {/* Mobile Layout (< sm): Single neat row with zero overflow */}
            <div className="flex flex-wrap sm:hidden items-center justify-between gap-x-2 gap-y-2 w-full">
              <div className="flex items-center gap-1.5 min-w-0">
                {/* Mobile Filter Trigger Button */}
                <button
                  type="button"
                  onClick={() => setIsMobileFilterOpen(true)}
                  className="inline-flex min-h-10 items-center gap-1.5 px-3 py-1.5 rounded-xl border border-zinc-200 bg-white text-xs font-semibold text-zinc-800 shadow-sm transition-colors hover:border-store-primary/30 active:bg-zinc-100 shrink-0"
                  aria-label="Open Filters"
                >
                  <LuSlidersHorizontal className="w-3.5 h-3.5 text-store-primary shrink-0" />
                  <span>Filters</span>
                  {activeFilters.length > 0 && (
                    <span className="w-4.5 h-4.5 rounded-full bg-store-primary text-white text-[10px] font-bold flex items-center justify-center shrink-0">
                      {activeFilters.length}
                    </span>
                  )}
                </button>

                {/* Mobile Sort Dropdown */}
                <div className="relative shrink-0" ref={mobileSortRef}>
                  <button
                    type="button"
                    onClick={() => setIsSortDropdownOpen(!isSortDropdownOpen)}
                    className="inline-flex min-h-10 items-center gap-1 px-3 py-1.5 rounded-xl border border-zinc-200 bg-white text-xs font-medium text-zinc-700 shadow-sm transition-colors hover:border-store-primary/30 active:bg-zinc-100"
                    aria-label="Sort Options"
                  >
                    <span className="text-zinc-400">Sort:</span>
                    <span className="font-semibold text-zinc-900 max-w-[80px] truncate">
                      {selectedSort === 'newest'
                        ? 'Newest'
                        : selectedSort === 'price_asc'
                        ? '৳ Low'
                        : selectedSort === 'price_desc'
                        ? '৳ High'
                        : selectedSort === 'alpha_asc'
                        ? 'A-Z'
                        : 'Z-A'}
                    </span>
                    <LuChevronDown className={`w-3 h-3 text-zinc-400 transition-transform ${isSortDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {isSortDropdownOpen && (
                    <div className="absolute left-0 mt-1.5 w-48 bg-white border border-zinc-200 rounded-xl shadow-xl py-1.5 z-50">
                      {SORT_OPTIONS.map((opt) => (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => {
                            setSelectedSort(opt.value);
                            setIsSortDropdownOpen(false);
                          }}
                          className={`w-full min-h-10 flex items-center justify-between px-3 py-2 text-left text-xs transition-colors cursor-pointer ${
                            selectedSort === opt.value
                              ? 'bg-store-surface text-store-primary font-bold'
                              : 'text-zinc-700 hover:bg-zinc-50'
                          }`}
                        >
                          <span>{opt.label}</span>
                          {selectedSort === opt.value && <LuCheck className="w-3.5 h-3.5 text-store-primary" />}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Mobile Right: View Mode (1 vs 2 cols) & Count */}
              <div className="flex items-center gap-2 shrink-0">
                {/* Mobile 1-Col vs 2-Col Switcher */}
                <div className="flex items-center border border-zinc-200 rounded-[3px] p-0.5 bg-zinc-100/90 shadow-2xs">
                  <button
                    type="button"
                    onClick={() => setViewMode('grid1')}
                    title="Single Column View"
                    aria-label="Single column view"
                    aria-pressed={viewMode === 'grid1'}
                    className={`grid h-8 w-8 place-items-center rounded-[2px] transition-all cursor-pointer ${
                      viewMode === 'grid1'
                        ? 'bg-white text-zinc-900 shadow-2xs font-bold'
                        : 'text-zinc-400 hover:text-zinc-700'
                    }`}
                  >
                    <LuRows2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode('grid2')}
                    title="Two Columns View"
                    aria-label="Two column view"
                    aria-pressed={viewMode !== 'grid1'}
                    className={`grid h-8 w-8 place-items-center rounded-[2px] transition-all cursor-pointer ${
                      viewMode !== 'grid1'
                        ? 'bg-white text-zinc-900 shadow-2xs font-bold'
                        : 'text-zinc-400 hover:text-zinc-700'
                    }`}
                  >
                    <LuGrid2X2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <span className="text-[11px] text-zinc-500 font-medium whitespace-nowrap">
                  <strong className="text-zinc-900 font-semibold">{filteredProducts.length}</strong> items
                </span>
              </div>
            </div>

            {/* Desktop & Tablet Layout (sm+) */}
            <div className="hidden sm:flex items-center justify-between gap-4">
              {/* Left: Filter Toggle & Item Count */}
              <div className="flex items-center gap-3 sm:gap-4">
                {/* Tablet Filter Trigger Button */}
                <button
                  type="button"
                  onClick={() => setIsMobileFilterOpen(true)}
                  className="lg:hidden inline-flex items-center gap-2 px-3.5 py-2 rounded-lg border border-zinc-300 hover:border-zinc-400 bg-white text-zinc-800 text-xs font-semibold transition-all cursor-pointer shadow-2xs"
                >
                  <LuSlidersHorizontal className="w-4 h-4 text-zinc-600" />
                  <span>Filters & Sort</span>
                  {activeFilters.length > 0 && (
                    <span className="w-5 h-5 rounded-full bg-store-primary text-white text-[10px] font-bold flex items-center justify-center">
                      {activeFilters.length}
                    </span>
                  )}
                </button>

                {/* Total Products Count */}
                <span className="text-xs text-zinc-500 font-medium">
                  Showing <strong className="text-zinc-900 font-semibold">{filteredProducts.length}</strong> products
                </span>
              </div>

              {/* Right: Grid Switcher & Shopify Sort By */}
              <div className="flex items-center gap-3 sm:gap-5">
                {/* Desktop Grid Switcher (3, 4, 5, 6 columns options) */}
                <div className="flex items-center gap-0.5 border border-zinc-200 rounded-[3px] p-0.5 bg-zinc-100/90 shadow-2xs">
                  {/* 3 Cols */}
                  <button
                    type="button"
                    onClick={() => setViewMode('grid3')}
                    title="3 Columns Grid"
                    aria-label="3 columns grid"
                    aria-pressed={viewMode === 'grid3'}
                    className={`p-1.5 rounded-[2px] transition-all cursor-pointer ${
                      viewMode === 'grid3'
                        ? 'bg-white text-zinc-900 shadow-2xs'
                        : 'text-zinc-400 hover:text-zinc-700'
                    }`}
                  >
                    <svg className="w-4 h-4" viewBox="0 0 16 16" fill="currentColor">
                      <rect x="1.5" y="2" width="3.5" height="12" rx="0.5" />
                      <rect x="6.25" y="2" width="3.5" height="12" rx="0.5" />
                      <rect x="11" y="2" width="3.5" height="12" rx="0.5" />
                    </svg>
                  </button>

                  {/* 4 Cols */}
                  <button
                    type="button"
                    onClick={() => setViewMode('grid4')}
                    title="4 Columns Grid"
                    aria-label="4 columns grid"
                    aria-pressed={viewMode === 'grid4'}
                    className={`p-1.5 rounded-[2px] transition-all cursor-pointer ${
                      viewMode === 'grid4'
                        ? 'bg-white text-zinc-900 shadow-2xs'
                        : 'text-zinc-400 hover:text-zinc-700'
                    }`}
                  >
                    <svg className="w-4 h-4" viewBox="0 0 16 16" fill="currentColor">
                      <rect x="1" y="2" width="2.5" height="12" rx="0.5" />
                      <rect x="5" y="2" width="2.5" height="12" rx="0.5" />
                      <rect x="9" y="2" width="2.5" height="12" rx="0.5" />
                      <rect x="13" y="2" width="2.5" height="12" rx="0.5" />
                    </svg>
                  </button>

                  {/* 5 Cols */}
                  <button
                    type="button"
                    onClick={() => setViewMode('grid5')}
                    title="5 Columns Grid"
                    aria-label="5 columns grid"
                    aria-pressed={viewMode === 'grid5'}
                    className={`p-1.5 rounded-[2px] transition-all cursor-pointer ${
                      viewMode === 'grid5'
                        ? 'bg-white text-zinc-900 shadow-2xs'
                        : 'text-zinc-400 hover:text-zinc-700'
                    }`}
                  >
                    <svg className="w-4 h-4" viewBox="0 0 16 16" fill="currentColor">
                      <rect x="1" y="2" width="1.9" height="12" rx="0.4" />
                      <rect x="4.1" y="2" width="1.9" height="12" rx="0.4" />
                      <rect x="7.2" y="2" width="1.9" height="12" rx="0.4" />
                      <rect x="10.3" y="2" width="1.9" height="12" rx="0.4" />
                      <rect x="13.4" y="2" width="1.9" height="12" rx="0.4" />
                    </svg>
                  </button>

                  {/* 6 Cols */}
                  <button
                    type="button"
                    onClick={() => setViewMode('grid6')}
                    title="6 Columns Grid"
                    aria-label="6 columns grid"
                    aria-pressed={viewMode === 'grid6'}
                    className={`p-1.5 rounded-[2px] transition-all cursor-pointer ${
                      viewMode === 'grid6'
                        ? 'bg-white text-zinc-900 shadow-2xs'
                        : 'text-zinc-400 hover:text-zinc-700'
                    }`}
                  >
                    <svg className="w-4 h-4" viewBox="0 0 16 16" fill="currentColor">
                      <rect x="0.8" y="2" width="1.5" height="12" rx="0.3" />
                      <rect x="3.3" y="2" width="1.5" height="12" rx="0.3" />
                      <rect x="5.8" y="2" width="1.5" height="12" rx="0.3" />
                      <rect x="8.3" y="2" width="1.5" height="12" rx="0.3" />
                      <rect x="10.8" y="2" width="1.5" height="12" rx="0.3" />
                      <rect x="13.3" y="2" width="1.5" height="12" rx="0.3" />
                    </svg>
                  </button>
                </div>

                {/* Sort By Dropdown (Shopify Style) */}
                <div className="relative" ref={desktopSortRef}>
                  <button
                    type="button"
                    onClick={() => setIsSortDropdownOpen(!isSortDropdownOpen)}
                    className="flex min-h-10 items-center gap-1.5 text-xs text-zinc-700 hover:text-zinc-900 font-medium py-1.5 px-3 rounded-[3px] border border-zinc-200 hover:border-store-primary/30 bg-white transition-all cursor-pointer shadow-sm"
                  >
                    <span className="text-zinc-400">Sort by:</span>
                    <span className="font-semibold text-zinc-900">{currentSortLabel}</span>
                    <LuChevronDown className={`w-3.5 h-3.5 text-zinc-500 transition-transform ${isSortDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {isSortDropdownOpen && (
                    <div className="absolute right-0 mt-1.5 w-52 bg-white border border-zinc-200 rounded-xl shadow-xl py-1.5 z-50">
                      {SORT_OPTIONS.map((opt) => (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => {
                            setSelectedSort(opt.value);
                            setIsSortDropdownOpen(false);
                          }}
                          className={`w-full flex items-center justify-between px-3.5 py-2 text-left text-xs transition-colors cursor-pointer ${
                            selectedSort === opt.value
                              ? 'bg-store-surface text-store-primary font-bold'
                              : 'text-zinc-700 hover:bg-zinc-50'
                          }`}
                        >
                          <span>{opt.label}</span>
                          {selectedSort === opt.value && <LuCheck className="w-3.5 h-3.5 text-store-primary" />}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

              </div>

            </div>

          </div>
        </div>

        {/* Active Filter Chips Bar (Shopify Pill Tags, horizontally scrollable on mobile) */}
        {activeFilters.length > 0 && (
          <div className="w-full border-b border-zinc-200/80 bg-store-page/90">
            <div className="max-w-[1440px] mx-auto px-4 sm:px-6 md:px-10 lg:px-16 py-2 flex items-center gap-1.5 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-zinc-400 shrink-0 mr-1 select-none">
                Filters:
              </span>

              {activeFilters.map((filter) => (
                <button
                  key={filter.id}
                  type="button"
                  onClick={filter.onRemove}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] sm:text-xs font-medium bg-white border border-zinc-300 text-zinc-800 hover:border-red-300 hover:bg-red-50 hover:text-red-600 transition-all cursor-pointer shadow-2xs shrink-0 group"
                >
                  <span className="truncate max-w-[140px] sm:max-w-none">{filter.label}</span>
                  <LuX className="w-3 h-3 text-zinc-400 group-hover:text-red-500 shrink-0" />
                </button>
              ))}

              <button
                type="button"
                onClick={clearAllFilters}
                className="text-[11px] sm:text-xs font-semibold text-store-primary hover:text-store-accent underline underline-offset-2 ml-1 cursor-pointer transition-colors shrink-0 whitespace-nowrap"
              >
                Clear all ({activeFilters.length})
              </button>
            </div>
          </div>
        )}

        {/* Main Body: Desktop Sidebar + Product Grid */}
        <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 md:px-10 lg:px-16 py-4 sm:py-6">
          <div className="flex items-start gap-6 lg:gap-10">
            
            {/* Desktop Left-Hand Shopify Sidebar */}
              <aside className="hidden lg:block w-[260px] shrink-0 sticky top-[175px] max-h-[calc(100vh-190px)] overflow-y-auto self-start rounded-[3px] border border-store-border bg-white p-5 shadow-[0_12px_32px_rgba(20,38,56,0.05)]">
                <div className="flex items-center justify-between pb-4 mb-1 border-b border-zinc-100">
                  <h3 className="font-extrabold text-sm uppercase tracking-wider text-zinc-900 flex items-center gap-2">
                    <LuSlidersHorizontal className="w-4 h-4 text-store-primary" />
                    <span>Filter By</span>
                  </h3>
                  {activeFilters.length > 0 && (
                    <button
                      type="button"
                      onClick={clearAllFilters}
                      className="text-xs font-semibold text-red-600 hover:text-red-700 cursor-pointer"
                    >
                      Clear all
                    </button>
                  )}
                </div>

                {renderSidebarFilters()}
              </aside>

            {/* Right Product Grid Area */}
            <div ref={resultsRef} className="flex-1 min-w-0">
              {isLoading ? (
                <div className={productGridClassName}>
                  {[...Array(8)].map((_, i) => (
                    <ProductCardSkeleton key={i} />
                  ))}
                </div>
              ) : loadError ? (
                <div role="alert" className="rounded-2xl border border-store-border bg-white px-6 py-12 text-center"><h2 className="text-lg font-semibold text-store-ink">Products are temporarily unavailable</h2><p className="mt-2 text-sm text-store-accent">Please try again in a moment.</p><button type="button" onClick={() => window.location.reload()} className="mt-5 rounded-lg bg-store-primary px-4 py-2.5 text-sm font-medium text-white">Try again</button></div>
              ) : filteredProducts.length > 0 ? (
                <>
                  <div className={productGridClassName}>
                    {visibleProducts.map((product) => (
                      <ProductCard
                        key={product.id}
                        id={product.id}
                        name={product.name}
                        price={`৳${product.price.toLocaleString()}`}
                        originalPrice={
                          product.originalPrice ? `৳${product.originalPrice.toLocaleString()}` : ''
                        }
                        image={product.image || NO_IMAGE}
                        slug={product.slug}
                        category={product.category}
                        brand={product.team}
                        badge={product.badge}
                        unit={product.unit}
                        variantId={product.variantId}
                      />
                    ))}
                  </div>

                  {pageCount > 1 && (
                    <nav aria-label="Product pages" className="mt-8 flex flex-wrap items-center justify-center gap-2 sm:mt-10">
                      <button type="button" onClick={() => goToPage(safePage - 1)} disabled={safePage === 1} className="min-h-10 rounded-lg border border-store-border bg-white px-3 text-sm font-medium text-store-ink disabled:opacity-40">Previous</button>
                      {Array.from({ length: pageCount }, (_, index) => index + 1).filter((page) => page === 1 || page === pageCount || Math.abs(page - safePage) <= 1).map((page, index, pages) => (
                        <span key={page} className="flex items-center gap-2">
                          {index > 0 && page - pages[index - 1] > 1 && <span aria-hidden="true" className="text-stone-400">…</span>}
                          <button type="button" onClick={() => goToPage(page)} aria-current={page === safePage ? 'page' : undefined} aria-label={`Page ${page}`} className={`h-10 min-w-10 rounded-lg border px-2 text-sm font-medium ${page === safePage ? 'border-store-primary bg-store-primary text-white' : 'border-store-border bg-white text-store-ink hover:bg-store-surface'}`}>{page}</button>
                        </span>
                      ))}
                      <button type="button" onClick={() => goToPage(safePage + 1)} disabled={safePage === pageCount} className="min-h-10 rounded-lg border border-store-border bg-white px-3 text-sm font-medium text-store-ink disabled:opacity-40">Next</button>
                    </nav>
                  )}

                </>
              ) : (
                /* Empty state when filters return 0 results */
                <div className="flex flex-col items-center justify-center py-12 sm:py-20 text-center px-4 bg-zinc-50/50 rounded-2xl border border-dashed border-zinc-200 my-4">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-emerald-50 text-store-primary flex items-center justify-center mb-4">
                    <LuRotateCcw className="w-7 h-7 sm:w-8 sm:h-8" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-zinc-900 mb-1">
                    No products matched your filters
                  </h3>
                  <p className="text-xs text-zinc-500 max-w-md mb-6 leading-relaxed">
                    Try changing your price range, clearing some category tags, or resetting all filters to see our full catalogue.
                  </p>
                  <button
                    type="button"
                    onClick={clearAllFilters}
                    className="px-6 py-2.5 bg-store-primary hover:bg-store-accent text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer shadow-md shadow-blue-600/20 active:scale-95"
                  >
                    Clear All Filters
                  </button>
                </div>
              )}
            </div>

          </div>
        </div>

        {/* Mobile Slide-Over Filter Drawer (Shopify Style) */}
        {isMobileFilterOpen && (
          <div className="fixed inset-0 z-[100] flex justify-end bg-black/60 backdrop-blur-xs transition-opacity duration-300">
            {/* Click backdrop to close */}
            <button
              type="button"
              className="absolute inset-0 cursor-pointer"
              onClick={() => setIsMobileFilterOpen(false)}
              aria-label="Close filters"
            />

            <div role="dialog" aria-modal="true" aria-label="Filters and sort" className="relative w-full sm:max-w-[400px] h-[100dvh] bg-white shadow-2xl flex flex-col justify-between font-sans z-10">
              
              {/* Drawer Header */}
              <div className="px-4 sm:px-5 py-4 border-b border-zinc-200 flex items-center justify-between shrink-0 bg-gradient-to-r from-white to-store-page">
                <div className="flex items-center gap-2">
                  <LuSlidersHorizontal className="w-4 h-4 text-store-primary" />
                  <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-900">
                    Filters & Sort
                  </h3>
                  {activeFilters.length > 0 && (
                    <span className="px-2 py-0.5 rounded-full bg-store-primary text-white text-[10px] font-bold">
                      {activeFilters.length}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2.5">
                  {activeFilters.length > 0 && (
                    <button
                      type="button"
                      onClick={clearAllFilters}
                      className="text-xs font-semibold text-red-500 hover:text-red-700 cursor-pointer"
                    >
                      Reset
                    </button>
                  )}
                  <button
                    ref={filterCloseRef}
                    type="button"
                    onClick={() => setIsMobileFilterOpen(false)}
                    className="w-10 h-10 rounded-full border border-zinc-200 flex items-center justify-center text-zinc-500 hover:text-zinc-800 cursor-pointer bg-white active:scale-95"
                    aria-label="Close filters"
                  >
                    <IoCloseOutline className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Drawer Scrollable Content */}
              <div className="flex-grow overflow-y-auto px-4 sm:px-5 py-4 space-y-5 bg-white">
                {/* Mobile Sort Option */}
                <div className="border-b border-zinc-200 pb-4">
                  <h4 className="font-bold text-xs uppercase tracking-wider text-zinc-900 mb-2.5">
                    Sort By
                  </h4>
                  <div className="grid grid-cols-1 gap-1.5">
                    {SORT_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setSelectedSort(opt.value)}
                        className={`px-3 py-2 rounded-lg text-xs font-medium border text-left flex items-center justify-between cursor-pointer transition-colors ${
                          selectedSort === opt.value
                            ? 'bg-store-surface border-store-primary text-store-primary font-bold'
                            : 'bg-zinc-50 border-zinc-200 text-zinc-700 hover:bg-zinc-100'
                        }`}
                      >
                        <span>{opt.label}</span>
                        {selectedSort === opt.value && <LuCheck className="w-3.5 h-3.5 text-store-primary" />}
                      </button>
                    ))}
                  </div>
                </div>

                {renderSidebarFilters()}
              </div>

              {/* Drawer Sticky Footer Action */}
              <div className="p-3.5 sm:p-4 border-t border-zinc-200 bg-white shrink-0 pb-[max(1rem,env(safe-area-inset-bottom))] flex items-center gap-2.5 shadow-[0_-8px_24px_rgba(15,23,42,0.05)]">
                {activeFilters.length > 0 && (
                  <button
                    type="button"
                    onClick={clearAllFilters}
                    className="py-3 px-3.5 rounded-xl border border-zinc-300 hover:bg-zinc-100 text-zinc-700 text-xs font-semibold uppercase tracking-wider text-center transition-all cursor-pointer shadow-2xs shrink-0"
                  >
                    Reset
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setIsMobileFilterOpen(false)}
                  className="flex-1 py-3 px-4 bg-zinc-900 hover:bg-store-primary text-white text-xs font-bold uppercase tracking-wider rounded-xl text-center transition-all cursor-pointer shadow-sm active:scale-[0.99]"
                >
                  View ({filteredProducts.length}) Products
                </button>
              </div>

            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col items-center justify-center min-h-[50vh] py-20 text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-store-primary mb-4" />
          <p className="text-zinc-500 text-xs font-medium uppercase tracking-wider">Loading marketplace products...</p>
        </div>
      }
    >
      <ProductsPageContent />
    </Suspense>
  );
}
