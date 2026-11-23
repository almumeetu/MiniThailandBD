'use client';

import { useEffect, useMemo, useRef, useState, Suspense, useCallback, useTransition } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import AarongProductCard, { AarongProductCardSkeleton } from '@/components/aarong/aarong-product-card';
import ShopPageSkeleton from '@/components/sections/ui/shop-page-skeleton';
import {
  fetchShopProducts,
  fetchShopCategories,
  fetchShopBrands,
  fetchShopTags,
  type ShopProduct,
  type ShopCategory,
  type ShopBrand,
} from '@/lib/shop-api';
import {
  LuSlidersHorizontal,
  LuX,
  LuChevronDown,
  LuCheck,
  LuRotateCcw,
  LuGrid3X3,
  LuGrid2X2,
} from 'react-icons/lu';
import PageBanner, { type BreadcrumbItem } from '@/components/ui/page-banner';

const PAGE_LIMIT = 24;
const FETCH_BATCH_SIZE = 100;

const SORT_OPTIONS = [
  { label: 'Lowest price', value: 'price_asc' },
  { label: 'Highest price', value: 'price_desc' },
  { label: 'Newest arrivals', value: 'newest' },
  { label: 'Name, A to Z', value: 'alpha_asc' },
  { label: 'Name, Z to A', value: 'alpha_desc' },
];

const PRICE_PRESETS = [
  { label: 'Under ৳2,000', min: 0, max: 2000 },
  { label: '৳2,000 – ৳3,500', min: 2000, max: 3500 },
  { label: '৳3,500 – ৳5,000', min: 3500, max: 5000 },
  { label: 'Over ৳5,000', min: 5000, max: Infinity },
];

export interface ColorDefinition {
  name: string;
  hex: string;
  regex: RegExp;
}

export const KNOWN_COLORS: ColorDefinition[] = [
  { name: 'Black', hex: '#18181b', regex: /\b(black|midnight)\b/i },
  { name: 'White', hex: '#ffffff', regex: /\b(white|off[-\s]?white|ivory)\b/i },
  { name: 'Red', hex: '#ef4444', regex: /\b(red|wine|crimson|maroon|burgundy|ruby)\b/i },
  { name: 'Blue', hex: '#3b82f6', regex: /\b(blue|navy|sky\s*blue|royal\s*blue|cyan)\b/i },
  { name: 'Pink', hex: '#ec4899', regex: /\b(pink|rose|blush|magenta|fuchsia)\b/i },
  { name: 'Green', hex: '#10b981', regex: /\b(green|mint|emerald|olive|sage|khaki)\b/i },
  { name: 'Beige', hex: '#d4b996', regex: /\b(beige|cream|nude|tan|sand)\b/i },
  { name: 'Lavender', hex: '#c084fc', regex: /\b(lavender|mauve|purple|lilac|violet)\b/i },
  { name: 'Gold', hex: '#eab308', regex: /\b(gold|golden|yellow|mustard)\b/i },
  { name: 'Brown', hex: '#78350f', regex: /\b(brown|chocolate|coffee|mocha|bronze)\b/i },
  { name: 'Gray', hex: '#6b7280', regex: /\b(gray|grey|silver|charcoal)\b/i },
  { name: 'Orange', hex: '#f97316', regex: /\b(orange|peach|coral|rust|apricot)\b/i },
];

function normalizeCatName(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/co-?ord/g, 'cord')
    .replace(/[^a-z0-9]+/g, '-');
}

function matchesCategory(prodCategory: string, targetCategory: string): boolean {
  if (!prodCategory || !targetCategory) return false;
  if (targetCategory === 'All') return true;
  const pNorm = normalizeCatName(prodCategory);
  const tNorm = normalizeCatName(targetCategory);
  if (pNorm === tNorm) return true;

  const pWords = pNorm.split('-').filter(Boolean);
  const tWords = tNorm.split('-').filter(Boolean);

  const targetWordsInProd = tWords.every((tw) => pWords.includes(tw));
  if (targetWordsInProd) return true;

  const prodWordsInTarget = pWords.every((pw) => tWords.includes(pw));
  if (prodWordsInTarget) return true;

  return false;
}

function ProductsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const searchVal = searchParams?.get('search') || '';

  // Transition state for smooth filter changes without blocking
  const [isFiltering, startFilterTransition] = useTransition();

  // Helper to cleanly update URL without triggering route resets or jank
  const updateUrlParams = useCallback(
    (updates: Record<string, string | null>) => {
      if (typeof window === 'undefined') return;
      const url = new URL(window.location.href);
      Object.entries(updates).forEach(([key, val]) => {
        if (val === null || val === '' || (key === 'category' && val === 'All')) {
          url.searchParams.delete(key);
        } else {
          url.searchParams.set(key, val);
        }
      });
      window.history.replaceState(null, '', url.pathname + (url.search ? url.search : ''));
    },
    []
  );

  // UI state
  const [viewMode, setViewMode] = useState<'grid3' | 'grid4'>('grid4');
  const [showSidebar, setShowSidebar] = useState(true);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [isSortDropdownOpen, setIsSortDropdownOpen] = useState(false);
  const [showAllCategories, setShowAllCategories] = useState(false);

  // Metadata from API
  const [dbCategories, setDbCategories] = useState<ShopCategory[]>([]);
  const [, setDbBrands] = useState<ShopBrand[]>([]);
  const [dbTags, setDbTags] = useState<{ id: string; name: string }[]>([]);

  // Filter States
  const [selectedCategory, setSelectedCategory] = useState<string>(() => {
    const cat = searchParams?.get('category');
    return cat ? decodeURIComponent(cat) : 'All';
  });
  const [appliedMinPrice, setAppliedMinPrice] = useState<number | null>(null);
  const [appliedMaxPrice, setAppliedMaxPrice] = useState<number | null>(null);
  const [activePricePreset, setActivePricePreset] = useState<string | null>(null);
  const [tempMin, setTempMin] = useState<number>(0);
  const [tempMax, setTempMax] = useState<number>(10000);
  const priceDebounceRef = useRef<NodeJS.Timeout | null>(null);

  const [inStockOnly, setInStockOnly] = useState<boolean>(() => {
    const stock = searchParams?.get('stock');
    return stock === 'available' || stock === 'instock';
  });
  const [onSaleOnly, setOnSaleOnly] = useState<boolean>(() => {
    const deals = searchParams?.get('deals') || searchParams?.get('offer');
    return deals === 'true' || deals === '1';
  });
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [selectedStyles, setSelectedStyles] = useState<string[]>([]);
  const [selectedSort, setSelectedSort] = useState<string>(() => {
    const sort = searchParams?.get('sort');
    return sort && SORT_OPTIONS.some((s) => s.value === sort) ? sort : 'newest';
  });

  // Products state
  const [products, setProducts] = useState<ShopProduct[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const reqIdRef = useRef(0);
  const resultsRef = useRef<HTMLDivElement>(null);
  const sortDropdownRef = useRef<HTMLDivElement>(null);

  // Close sort dropdown when clicking outside
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (!sortDropdownRef.current?.contains(e.target as Node)) {
        setIsSortDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  // Lock body scroll on mobile filter drawer
  useEffect(() => {
    if (isMobileFilterOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileFilterOpen]);

  // Load Categories & Brands & Tags
  useEffect(() => {
    async function loadMeta() {
      try {
        const [cats, brs, tags] = await Promise.all([
          fetchShopCategories(),
          fetchShopBrands(),
          fetchShopTags().catch(() => []),
        ]);
        setDbCategories(cats || []);
        setDbBrands(brs || []);
        setDbTags(tags || []);
      } catch (err) {
        console.error('Failed to load filter metadata:', err);
      }
    }
    loadMeta();
  }, []);

  // Fetch all products with instant first-batch streaming
  useEffect(() => {
    const id = ++reqIdRef.current;
    let cancelled = false;
    setIsLoading(true);
    setLoadError(false);
    setProducts([]);

    async function loadProducts() {
      try {
        const params = {
          limit: FETCH_BATCH_SIZE,
          search: searchVal || undefined,
        };
        const first = await fetchShopProducts({ ...params, page: 1 });
        const all = [...first.data];
        const pages = Math.ceil(first.total / FETCH_BATCH_SIZE);

        // Stream initial batch immediately so users don't wait for all pages
        if (!cancelled && id === reqIdRef.current) {
          setProducts(all);
          setIsLoading(false);
        }

        for (let start = 2; start <= pages; start += 4) {
          if (cancelled || id !== reqIdRef.current) return;
          const batch = await Promise.all(
            Array.from({ length: Math.min(4, pages - start + 1) }, (_, index) =>
              fetchShopProducts({ ...params, page: start + index })
            )
          );
          all.push(...batch.flatMap((res) => res.data));
          if (!cancelled && id === reqIdRef.current) {
            setProducts([...all]);
          }
        }
      } catch (error) {
        if (!cancelled && id === reqIdRef.current) {
          console.error('Failed to fetch products:', error);
          setLoadError(true);
        }
      } finally {
        if (!cancelled && id === reqIdRef.current) {
          setIsLoading(false);
        }
      }
    }

    loadProducts();
    return () => {
      cancelled = true;
    };
  }, [searchVal]);

  // Handle browser back / forward navigation cleanly
  useEffect(() => {
    const handlePopState = () => {
      const params = new URLSearchParams(window.location.search);
      const cat = params.get('category');
      const dealsParam = params.get('deals') || params.get('offer');
      const stockParam = params.get('stock');
      const sortParam = params.get('sort');

      startFilterTransition(() => {
        setSelectedCategory(cat ? decodeURIComponent(cat) : 'All');
        setOnSaleOnly(dealsParam === 'true' || dealsParam === '1');
        setInStockOnly(stockParam === 'available' || stockParam === 'instock');
        if (sortParam && SORT_OPTIONS.some((s) => s.value === sortParam)) {
          setSelectedSort(sortParam);
        } else {
          setSelectedSort('newest');
        }
      });
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Dynamic Catalog Min and Max price
  const { catalogMinPrice, catalogMaxPrice } = useMemo(() => {
    if (products.length === 0) return { catalogMinPrice: 0, catalogMaxPrice: 10000 };
    let min = Infinity;
    let max = -Infinity;
    products.forEach((p) => {
      if (typeof p.price === 'number' && !isNaN(p.price)) {
        if (p.price < min) min = p.price;
        if (p.price > max) max = p.price;
      }
    });
    if (!isFinite(min)) min = 0;
    if (!isFinite(max)) max = 10000;
    return {
      catalogMinPrice: Math.floor(min / 100) * 100,
      catalogMaxPrice: Math.ceil(max / 100) * 100,
    };
  }, [products]);

  // Initialize and keep slider values synced
  useEffect(() => {
    if (appliedMinPrice === null) {
      setTempMin(catalogMinPrice);
    } else {
      setTempMin(appliedMinPrice);
    }
  }, [appliedMinPrice, catalogMinPrice]);

  useEffect(() => {
    if (appliedMaxPrice === null) {
      setTempMax(catalogMaxPrice);
    } else {
      setTempMax(appliedMaxPrice);
    }
  }, [appliedMaxPrice, catalogMaxPrice]);

  // Sync category & filter params from URL
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const cat = params.get('category');
      const catId = params.get('categoryId');
      const dealsParam = params.get('deals') || params.get('offer');
      const stockParam = params.get('stock');
      const sortParam = params.get('sort');

      setOnSaleOnly(dealsParam === 'true' || dealsParam === '1');
      setInStockOnly(stockParam === 'available' || stockParam === 'instock');

      if (sortParam && SORT_OPTIONS.some((s) => s.value === sortParam)) {
        setSelectedSort(sortParam);
      } else {
        setSelectedSort('newest');
      }

      if (cat) {
        setSelectedCategory(decodeURIComponent(cat));
      } else if (catId && dbCategories.length > 0) {
        const matched = dbCategories.find((c) => c.id === catId);
        if (matched) {
          setSelectedCategory(matched.name);
        }
      } else if (!dealsParam) {
        setSelectedCategory('All');
      }
    }
  }, [searchParams, dbCategories]);

  // Dynamic Categories list and counts from live products and categories
  const { categoriesList, categoryCounts } = useMemo(() => {
    const catMap = new Map<string, { label: string; count: number }>();

    // 1. First aggregate from actual products
    products.forEach((p) => {
      const raw = p.category?.trim();
      if (raw) {
        const key = normalizeCatName(raw);
        const existing = catMap.get(key);
        if (existing) {
          existing.count += 1;
        } else {
          catMap.set(key, { label: raw, count: 1 });
        }
      }
    });

    // 2. Check dbCategories to enhance label (e.g. "Co-ord Sets")
    dbCategories.forEach((c) => {
      const raw = c.name?.trim();
      if (raw) {
        const key = normalizeCatName(raw);
        const existing = catMap.get(key);
        if (existing) {
          existing.label = raw;
        }
      }
    });

    // 3. Only keep categories that have products or are currently selected
    const list = Array.from(catMap.values())
      .filter(
        (c) =>
          c.count > 0 ||
          (selectedCategory !== 'All' && matchesCategory(c.label, selectedCategory))
      )
      .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label))
      .map((c) => c.label);

    const counts: Record<string, number> = { all: products.length };
    catMap.forEach((item, key) => {
      counts[key] = item.count;
      counts[item.label.toLowerCase()] = item.count;
    });

    return { categoriesList: list, categoryCounts: counts };
  }, [products, dbCategories, selectedCategory]);

  // Real-time Dynamic Color counts — only colors that actually exist in the products
  const dynamicColors = useMemo(() => {
    return KNOWN_COLORS.map((col) => {
      const count = products.filter((p) => {
        const text = `${p.name} ${p.category || ''} ${p.unit || ''}`.toLowerCase();
        return col.regex.test(text);
      }).length;
      return { ...col, count };
    }).filter((col) => col.count > 0 || selectedColors.includes(col.name));
  }, [products, selectedColors]);

  // Dynamic Styles / Tags with live counts — only tags that actually match products
  const dynamicTags = useMemo(() => {
    const candidateTags = new Set<string>();
    dbTags.forEach((t) => {
      if (t.name?.trim()) candidateTags.add(t.name.trim());
    });
    const defaultFashionTags = [
      'Cord',
      'Velvet',
      'Floral',
      'Festive',
      'Modest',
      'Embroidered',
      'Printed',
      'Tiered',
      'Sequin',
      'Silk',
      'Chiffon',
      'Lace',
      'Fleece',
      'Maxi',
    ];
    defaultFashionTags.forEach((k) => candidateTags.add(k));

    return Array.from(candidateTags)
      .map((tag) => {
        const regex = new RegExp(`\\b${tag}\\b`, 'i');
        const count = products.filter((p) => {
          const text = `${p.name} ${p.category || ''}`.toLowerCase();
          return regex.test(text);
        }).length;
        return { tag, count };
      })
      .filter((item) => item.count > 0 || selectedStyles.includes(item.tag));
  }, [products, dbTags, selectedStyles]);

  // Dynamic Price Presets — only show presets that have products in that range
  const dynamicPricePresets = useMemo(() => {
    if (products.length === 0) return [];
    return PRICE_PRESETS.filter((preset) => {
      return products.some(
        (p) =>
          p.price >= preset.min &&
          (preset.max === Infinity ? true : p.price <= preset.max)
      );
    });
  }, [products]);

  // Overall counts
  const saleProductsCount = useMemo(() => {
    return products.filter((p) => p.originalPrice && p.originalPrice > p.price).length;
  }, [products]);

  const inStockProductsCount = useMemo(() => {
    return products.filter((p) => p.inStock).length;
  }, [products]);

  // Handle category change smoothly without route unmount or jumps
  const handleSelectCategory = useCallback(
    (catName: string) => {
      startFilterTransition(() => {
        if (catName === 'deals') {
          setOnSaleOnly(true);
          setSelectedCategory('All');
          updateUrlParams({ deals: 'true', category: null });
          return;
        }

        setOnSaleOnly(false);
        setSelectedCategory(catName);
        updateUrlParams({
          category: catName === 'All' ? null : catName,
          deals: null,
        });
      });
    },
    [updateUrlParams]
  );

  // Handle in-stock toggle smoothly
  const handleToggleInStock = useCallback(() => {
    startFilterTransition(() => {
      setInStockOnly((prev) => {
        const next = !prev;
        updateUrlParams({ stock: next ? 'available' : null });
        return next;
      });
    });
  }, [updateUrlParams]);

  // Handle special offers toggle smoothly
  const handleToggleOnSale = useCallback(() => {
    startFilterTransition(() => {
      setOnSaleOnly((prev) => {
        const next = !prev;
        updateUrlParams({ deals: next ? 'true' : null });
        return next;
      });
    });
  }, [updateUrlParams]);

  // Price presets handler
  const handlePricePreset = (preset: (typeof PRICE_PRESETS)[0]) => {
    if (priceDebounceRef.current) clearTimeout(priceDebounceRef.current);
    startFilterTransition(() => {
      if (activePricePreset === preset.label) {
        setActivePricePreset(null);
        setAppliedMinPrice(null);
        setAppliedMaxPrice(null);
        setTempMin(catalogMinPrice);
        setTempMax(catalogMaxPrice);
      } else {
        setActivePricePreset(preset.label);
        setAppliedMinPrice(preset.min);
        setAppliedMaxPrice(preset.max === Infinity ? null : preset.max);
        setTempMin(preset.min);
        setTempMax(preset.max === Infinity ? catalogMaxPrice : preset.max);
      }
    });
  };

  // Slider price handlers with 120ms debounce for 60fps sliding
  const handleMinSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Math.min(Number(e.target.value), tempMax - 100);
    setTempMin(val);
    setActivePricePreset(null);
    if (priceDebounceRef.current) clearTimeout(priceDebounceRef.current);
    priceDebounceRef.current = setTimeout(() => {
      startFilterTransition(() => {
        setAppliedMinPrice(val);
      });
    }, 120);
  };

  const handleMaxSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Math.max(Number(e.target.value), tempMin + 100);
    setTempMax(val);
    setActivePricePreset(null);
    if (priceDebounceRef.current) clearTimeout(priceDebounceRef.current);
    priceDebounceRef.current = setTimeout(() => {
      startFilterTransition(() => {
        setAppliedMaxPrice(val);
      });
    }, 120);
  };

  const clearPriceFilter = useCallback(() => {
    if (priceDebounceRef.current) clearTimeout(priceDebounceRef.current);
    startFilterTransition(() => {
      setAppliedMinPrice(null);
      setAppliedMaxPrice(null);
      setActivePricePreset(null);
      setTempMin(catalogMinPrice);
      setTempMax(catalogMaxPrice);
    });
  }, [catalogMinPrice, catalogMaxPrice]);

  // Toggle Color smoothly
  const toggleColor = (color: string) => {
    startFilterTransition(() => {
      setSelectedColors((prev) =>
        prev.includes(color) ? prev.filter((c) => c !== color) : [...prev, color]
      );
    });
  };

  // Toggle Tag smoothly
  const toggleTag = (tag: string) => {
    if (tag === 'On Sale') {
      handleToggleOnSale();
      return;
    }
    if (tag === 'In Stock') {
      handleToggleInStock();
      return;
    }
    startFilterTransition(() => {
      setSelectedStyles((prev) =>
        prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
      );
    });
  };

  // Clear all filters smoothly
  const clearAllFilters = useCallback(() => {
    if (priceDebounceRef.current) clearTimeout(priceDebounceRef.current);
    startFilterTransition(() => {
      setSelectedCategory('All');
      setAppliedMinPrice(null);
      setAppliedMaxPrice(null);
      setActivePricePreset(null);
      setTempMin(catalogMinPrice);
      setTempMax(catalogMaxPrice);
      setInStockOnly(false);
      setOnSaleOnly(false);
      setSelectedColors([]);
      setSelectedStyles([]);
      updateUrlParams({
        category: null,
        deals: null,
        stock: null,
        sort: null,
      });
    });
  }, [catalogMinPrice, catalogMaxPrice, updateUrlParams]);

  // Active filters count
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (selectedCategory !== 'All') count++;
    if (appliedMinPrice !== null || appliedMaxPrice !== null) count++;
    if (inStockOnly) count++;
    if (onSaleOnly) count++;
    if (selectedColors.length > 0) count += selectedColors.length;
    if (selectedStyles.length > 0) count += selectedStyles.length;
    return count;
  }, [
    selectedCategory,
    appliedMinPrice,
    appliedMaxPrice,
    inStockOnly,
    onSaleOnly,
    selectedColors,
    selectedStyles,
  ]);

  // Filtered & Sorted products
  const filteredProducts = useMemo(() => {
    let result = products.filter((p) => {
      // 1. Category
      if (selectedCategory !== 'All') {
        if (!matchesCategory(p.category || '', selectedCategory)) {
          return false;
        }
      }

      // 2. Price
      if (appliedMinPrice !== null && p.price < appliedMinPrice) return false;
      if (appliedMaxPrice !== null && p.price > appliedMaxPrice) return false;

      // 3. Stock
      if (inStockOnly && !p.inStock) return false;

      // 4. On sale
      if (onSaleOnly && (!p.originalPrice || p.originalPrice <= p.price)) return false;

      // 5. Colors
      if (selectedColors.length > 0) {
        const text = `${p.name} ${p.category || ''} ${p.unit || ''}`.toLowerCase();
        const matchesColor = selectedColors.some((selectedColName) => {
          const colDef = KNOWN_COLORS.find(
            (c) => c.name.toLowerCase() === selectedColName.toLowerCase()
          );
          if (colDef) {
            return colDef.regex.test(text);
          }
          return text.includes(selectedColName.toLowerCase());
        });
        if (!matchesColor) return false;
      }

      // 6. Style / Tags
      if (selectedStyles.length > 0) {
        const combined = `${p.name} ${p.category || ''}`.toLowerCase();
        const matchesAnyTag = selectedStyles.some((st) => combined.includes(st.toLowerCase()));
        if (!matchesAnyTag) return false;
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
    appliedMinPrice,
    appliedMaxPrice,
    inStockOnly,
    onSaleOnly,
    selectedColors,
    selectedStyles,
    selectedSort,
  ]);

  // Pagination
  const pageCount = Math.max(1, Math.ceil(filteredProducts.length / PAGE_LIMIT));
  const safePage = Math.min(currentPage, pageCount);
  const visibleProducts = filteredProducts.slice(
    (safePage - 1) * PAGE_LIMIT,
    safePage * PAGE_LIMIT
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [
    selectedCategory,
    appliedMinPrice,
    appliedMaxPrice,
    inStockOnly,
    onSaleOnly,
    selectedColors,
    selectedStyles,
    selectedSort,
    searchVal,
  ]);

  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, pageCount)));
    const top = resultsRef.current?.getBoundingClientRect().top;
    if (top !== undefined) {
      window.scrollTo({
        top: Math.max(0, window.scrollY + top - 100),
        behavior: 'smooth',
      });
    }
  };

  // Active filter items list for badges above grid
  const activeFilters = useMemo(() => {
    const list: { id: string; label: string; onRemove: () => void }[] = [];

    if (searchVal) {
      list.push({
        id: 'search',
        label: `"${searchVal}"`,
        onRemove: () => updateUrlParams({ search: null }),
      });
    }

    if (selectedCategory !== 'All') {
      list.push({
        id: 'category',
        label: selectedCategory,
        onRemove: () => handleSelectCategory('All'),
      });
    }

    if (onSaleOnly) {
      list.push({
        id: 'sale',
        label: 'On Sale',
        onRemove: handleToggleOnSale,
      });
    }

    if (inStockOnly) {
      list.push({
        id: 'stock',
        label: 'In Stock',
        onRemove: handleToggleInStock,
      });
    }

    if (appliedMinPrice !== null || appliedMaxPrice !== null) {
      let priceLabel = '';
      if (appliedMinPrice !== null && appliedMaxPrice !== null) {
        priceLabel = `৳${appliedMinPrice.toLocaleString()} – ৳${appliedMaxPrice.toLocaleString()}`;
      } else if (appliedMinPrice !== null) {
        priceLabel = `From ৳${appliedMinPrice.toLocaleString()}`;
      } else if (appliedMaxPrice !== null) {
        priceLabel = `Up to ৳${appliedMaxPrice.toLocaleString()}`;
      }
      list.push({
        id: 'price',
        label: priceLabel,
        onRemove: clearPriceFilter,
      });
    }

    selectedColors.forEach((color) => {
      list.push({
        id: `color-${color}`,
        label: color,
        onRemove: () => toggleColor(color),
      });
    });

    selectedStyles.forEach((style) => {
      list.push({
        id: `style-${style}`,
        label: style,
        onRemove: () => toggleTag(style),
      });
    });

    return list;
  }, [
    searchVal,
    selectedCategory,
    onSaleOnly,
    inStockOnly,
    appliedMinPrice,
    appliedMaxPrice,
    selectedColors,
    selectedStyles,
    handleSelectCategory,
    handleToggleOnSale,
    handleToggleInStock,
    clearPriceFilter,
    updateUrlParams,
  ]);

  const pageTitle = useMemo(() => {
    if (searchVal) return `Search: "${searchVal}"`;
    if (onSaleOnly) return 'Special Offers';
    if (selectedCategory !== 'All') return selectedCategory;
    return 'Products';
  }, [searchVal, onSaleOnly, selectedCategory]);

  const pageSubtitle = useMemo(() => {
    if (searchVal) {
      return `Showing curated results for "${searchVal}".`;
    }
    if (onSaleOnly) {
      return 'Exclusive discounted prices on authentic Bangkok fashion and luxury wear.';
    }
    if (selectedCategory !== 'All') {
      return `Explore authentic Bangkok designs and elegant silhouettes in ${selectedCategory}.`;
    }
    return 'Explore our curated collection of verified Bangkok fashion, luxury gowns, cord sets, and modest wear.';
  }, [searchVal, onSaleOnly, selectedCategory]);

  const breadcrumbItems = useMemo<BreadcrumbItem[]>(() => {
    const isFiltered = selectedCategory !== 'All' || Boolean(searchVal) || onSaleOnly;
    if (!isFiltered) {
      return [{ label: 'Shop All' }];
    }

    const items: BreadcrumbItem[] = [{ label: 'Shop All', href: '/products' }];
    if (selectedCategory !== 'All') {
      items.push({
        label: selectedCategory,
        href: searchVal ? `/products?category=${encodeURIComponent(selectedCategory)}` : undefined,
      });
    }
    if (onSaleOnly) {
      items.push({ label: 'Special Offers' });
    }
    if (searchVal) {
      items.push({ label: `"${searchVal}"` });
    }
    return items;
  }, [selectedCategory, searchVal, onSaleOnly]);

  const bannerCategoryPills = useMemo(() => {
    return [
      {
        label: 'All Collections',
        active: selectedCategory === 'All' && !onSaleOnly,
        onClick: () => handleSelectCategory('All'),
      },
      ...categoriesList.slice(0, 10).map((cat) => ({
        label: cat,
        active:
          !onSaleOnly &&
          (selectedCategory.toLowerCase() === cat.toLowerCase() ||
            normalizeCatName(cat) === normalizeCatName(selectedCategory)),
        onClick: () => handleSelectCategory(cat),
      })),
    ];
  }, [selectedCategory, onSaleOnly, categoriesList, handleSelectCategory]);

  const currentSortLabel =
    SORT_OPTIONS.find((s) => s.value === selectedSort)?.label || 'Lowest price';

  // Slider visual percentages
  const rangeSpan = catalogMaxPrice - catalogMinPrice || 1;
  const sliderLeftPct = Math.max(0, Math.min(100, ((tempMin - catalogMinPrice) / rangeSpan) * 100));
  const sliderRightPct = Math.max(0, Math.min(100, ((tempMax - catalogMinPrice) / rangeSpan) * 100));

  const displayedCategories = showAllCategories
    ? categoriesList
    : categoriesList.slice(0, 10);

  return (
    <div className="w-full min-h-screen bg-white font-sans text-neutral-900 pb-20">
      
      {/* ── 1. Page Banner & Breadcrumbs (Professional E-commerce Collection Header) ── */}
      <PageBanner
        title={pageTitle}
        subtitle={pageSubtitle}
        breadcrumbs={breadcrumbItems}
      />

      {/* Mobile "Show filters" Full-Width Pill Button */}
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 md:px-10 lg:px-12 pt-4 lg:hidden">
        <button
          type="button"
          onClick={() => setIsMobileFilterOpen(true)}
          className="w-full py-2.5 px-6 rounded-none border border-neutral-300 bg-white text-sm font-medium text-neutral-800 text-center flex items-center justify-center gap-2 hover:border-neutral-900 active:scale-[0.99] transition-all cursor-pointer shadow-2xs"
        >
          <LuSlidersHorizontal className="w-4 h-4 text-neutral-700" />
          <span>Show filters</span>
          {activeFiltersCount > 0 && (
            <span className="w-4.5 h-4.5 rounded-xs bg-neutral-900 text-white text-[10px] font-bold flex items-center justify-center">
              {activeFiltersCount}
            </span>
          )}
        </button>
      </div>

      {/* ── 2. Top Alignment Toolbar (Sticky under 58px header on desktop, top-0 on mobile) ── */}
      <div className="sticky top-0 lg:top-[58px] z-30 bg-white/98 backdrop-blur-md border-b border-neutral-200/80 shadow-2xs transition-shadow">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 md:px-10 lg:px-12 py-2.5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          
          {/* Left Group: Hide/Show filters pill, Mobile Filter Trigger, Product count & Active Filter pills */}
          <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
            
            {/* Desktop Pill Button: "Hide filters" / "Show filters" */}
            <button
              type="button"
              onClick={() => setShowSidebar(!showSidebar)}
              className="hidden lg:inline-flex items-center gap-2 px-5 py-2 rounded-none border border-neutral-300 hover:border-neutral-900 bg-white text-xs sm:text-sm font-medium text-neutral-800 transition-colors cursor-pointer select-none"
            >
              <span>{showSidebar ? 'Hide filters' : 'Show filters'}</span>
              {activeFiltersCount > 0 && (
                <span className="w-4.5 h-4.5 rounded-xs bg-neutral-900 text-white text-[10px] font-bold flex items-center justify-center ml-0.5">
                  {activeFiltersCount}
                </span>
              )}
            </button>

            {/* Mobile Sticky Filter Button (Always accessible when scrolling on mobile) */}
            <button
              type="button"
              onClick={() => setIsMobileFilterOpen(true)}
              className="lg:hidden inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-none border border-neutral-300 hover:border-neutral-900 bg-white text-xs font-medium text-neutral-800 transition-colors cursor-pointer select-none active:scale-95 shadow-2xs"
            >
              <LuSlidersHorizontal className="w-3.5 h-3.5 text-neutral-700" />
              <span>Filters</span>
              {activeFiltersCount > 0 && (
                <span className="w-4 h-4 rounded-xs bg-neutral-900 text-white text-[10px] font-bold flex items-center justify-center ml-0.5">
                  {activeFiltersCount}
                </span>
              )}
            </button>

            {/* Product Counter (Clean Muted Typography) */}
            <span className="text-xs sm:text-sm text-neutral-500 font-normal whitespace-nowrap">
              Showing {visibleProducts.length} of {filteredProducts.length}
            </span>

            {/* Active Filter Pills (Shown Inline Beside Count) */}
            {activeFilters.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5 pl-1 sm:pl-2">
                {activeFilters.map((filter) => (
                  <span
                    key={filter.id}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-none border border-neutral-300 bg-white text-xs font-normal text-neutral-800 hover:border-neutral-400 transition-colors"
                  >
                    <span>{filter.label}</span>
                    <button
                      type="button"
                      onClick={filter.onRemove}
                      className="text-neutral-400 hover:text-neutral-900 cursor-pointer transition-colors p-0.5"
                      aria-label={`Remove ${filter.label}`}
                    >
                      <LuX className="w-3 h-3" />
                    </button>
                  </span>
                ))}

                <button
                  type="button"
                  onClick={clearAllFilters}
                  className="text-xs text-neutral-400 hover:text-neutral-900 underline cursor-pointer ml-1 transition-colors"
                >
                  Clear all
                </button>
              </div>
            )}
          </div>

          {/* Right Group: Sort by selector & Grid mode toggles */}
          <div className="flex items-center gap-3 ml-auto">
            
            {/* Desktop 3-col vs 4-col toggle */}
            <div className="hidden sm:flex items-center border border-neutral-200 rounded-none p-0.5 bg-neutral-50">
              <button
                type="button"
                onClick={() => setViewMode('grid3')}
                title="3 Columns"
                className={`p-1.5 rounded-none transition-all cursor-pointer ${
                  viewMode === 'grid3'
                    ? 'bg-white text-neutral-950 shadow-xs'
                    : 'text-neutral-400 hover:text-neutral-700'
                }`}
              >
                <LuGrid2X2 className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode('grid4')}
                title="4 Columns"
                className={`p-1.5 rounded-none transition-all cursor-pointer ${
                  viewMode === 'grid4'
                    ? 'bg-white text-neutral-950 shadow-xs'
                    : 'text-neutral-400 hover:text-neutral-700'
                }`}
              >
                <LuGrid3X3 className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Sort Dropdown */}
            <div className="relative flex items-center gap-2" ref={sortDropdownRef}>
              <span className="text-xs sm:text-sm text-neutral-500 font-normal hidden sm:inline">
                Sort by
              </span>
              
              <button
                type="button"
                onClick={() => setIsSortDropdownOpen(!isSortDropdownOpen)}
                className="flex items-center gap-2 text-xs sm:text-sm text-neutral-900 font-medium py-1.5 px-4 rounded-none border border-neutral-300 hover:border-neutral-900 bg-white transition-colors cursor-pointer"
              >
                <span>{currentSortLabel}</span>
                <LuChevronDown
                  className={`w-3.5 h-3.5 text-neutral-500 transition-transform ${
                    isSortDropdownOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {isSortDropdownOpen && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-neutral-200 rounded-none shadow-xl py-1.5 z-50 animate-fadeIn">
                  {SORT_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => {
                        startFilterTransition(() => {
                          setSelectedSort(opt.value);
                          setIsSortDropdownOpen(false);
                          updateUrlParams({ sort: opt.value === 'newest' ? null : opt.value });
                        });
                      }}
                      className={`w-full flex items-center justify-between px-4 py-2 text-left text-xs transition-colors cursor-pointer ${
                        selectedSort === opt.value
                          ? 'bg-neutral-50 font-semibold text-neutral-950'
                          : 'text-neutral-600 hover:bg-neutral-50 hover:text-neutral-950'
                      }`}
                    >
                      <span>{opt.label}</span>
                      {selectedSort === opt.value && <LuCheck className="w-3.5 h-3.5 text-neutral-950" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

          </div>

        </div>
      </div>
    </div>

      {/* ── 3. Main Content: Left Filter Sidebar + Product Grid ── */}
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 md:px-10 lg:px-12 pt-6">
        <div className="flex items-start gap-8 lg:gap-10">
          
          {/* Desktop Left Clean Filter Sidebar (Sticky alongside product grid) */}
          {showSidebar && (
            <aside className="hidden lg:block w-60 xl:w-64 shrink-0 space-y-6 select-none sticky top-[116px] self-start max-h-[calc(100vh-130px)] overflow-y-auto pr-3 pt-2 [scrollbar-width:thin] scrollbar-thumb-neutral-200 hover:scrollbar-thumb-neutral-300">
              
              {/* ── Section 1: Categories ── */}
              <div className="pb-6 border-b border-neutral-100">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-bold text-store-primary tracking-tight">Categories</h3>
                  {selectedCategory !== 'All' && (
                    <button
                      type="button"
                      onClick={() => handleSelectCategory('All')}
                      className="text-xs text-neutral-400 hover:text-store-primary cursor-pointer font-normal transition-colors"
                    >
                      Clear
                    </button>
                  )}
                </div>

                <div className="space-y-1">
                  {/* All Collections Row */}
                  <button
                    type="button"
                    onClick={() => handleSelectCategory('All')}
                    className="w-full flex items-center justify-between py-1.5 text-xs sm:text-sm text-left transition-colors cursor-pointer group"
                  >
                    <span
                      className={
                        selectedCategory === 'All' && !onSaleOnly
                          ? 'font-semibold text-neutral-950'
                          : 'text-neutral-600 group-hover:text-neutral-950 font-normal'
                      }
                    >
                      All Collections
                    </span>
                    <span
                      className={
                        selectedCategory === 'All' && !onSaleOnly
                          ? 'text-neutral-950 font-semibold text-xs'
                          : 'text-neutral-400 group-hover:text-neutral-600 font-normal text-xs'
                      }
                    >
                      {products.length}
                    </span>
                  </button>

                  {/* Individual Categories List */}
                  {displayedCategories.map((cat) => {
                    const isSelected =
                      !onSaleOnly &&
                      selectedCategory !== 'All' &&
                      (selectedCategory.toLowerCase() === cat.toLowerCase() ||
                        normalizeCatName(cat) === normalizeCatName(selectedCategory));
                    const count = categoryCounts[cat.toLowerCase()] || categoryCounts[normalizeCatName(cat)] || 0;

                    return (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => handleSelectCategory(cat)}
                        className="w-full flex items-center justify-between py-1.5 text-xs sm:text-sm text-left transition-colors cursor-pointer group"
                      >
                        <span
                          className={
                            isSelected
                              ? 'font-semibold text-neutral-950'
                              : 'text-neutral-600 group-hover:text-neutral-950 font-normal'
                          }
                        >
                          {cat}
                        </span>
                        <span
                          className={
                            isSelected
                              ? 'text-neutral-950 font-semibold text-xs'
                              : 'text-neutral-400 group-hover:text-neutral-600 font-normal text-xs'
                          }
                        >
                          {count}
                        </span>
                      </button>
                    );
                  })}

                  {/* Show more / Show less toggle */}
                  {categoriesList.length > 10 && (
                    <button
                      type="button"
                      onClick={() => setShowAllCategories(!showAllCategories)}
                      className="pt-2 text-xs font-medium text-neutral-500 hover:text-store-primary cursor-pointer flex items-center gap-1 transition-colors"
                    >
                      <span>
                        {showAllCategories ? 'Show less' : `+ ${categoriesList.length - 10} more`}
                      </span>
                    </button>
                  )}
                </div>
              </div>

              {/* ── Section 2: Price (Clean Slider + Clear) ── */}
              <div className="pb-6 border-b border-neutral-100">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold text-store-primary tracking-tight">Price</h3>
                  {(appliedMinPrice !== null || appliedMaxPrice !== null) && (
                    <button
                      type="button"
                      onClick={clearPriceFilter}
                      className="text-xs text-neutral-400 hover:text-store-primary cursor-pointer font-normal transition-colors"
                    >
                      Clear
                    </button>
                  )}
                </div>

                {/* Minimalist Dual Range Slider Track */}
                <div className="relative pt-2 pb-1 select-none">
                  {/* Background Track Line */}
                  <div className="h-0.5 w-full bg-neutral-200 rounded-full relative">
                    {/* Active Track Highlight */}
                    <div
                      className="absolute h-0.5 bg-neutral-900 rounded-full"
                      style={{
                        left: `${sliderLeftPct}%`,
                        right: `${100 - sliderRightPct}%`,
                      }}
                    />
                  </div>

                  {/* Range Inputs */}
                  <input
                    type="range"
                    min={catalogMinPrice}
                    max={catalogMaxPrice}
                    step={50}
                    value={tempMin}
                    onChange={handleMinSliderChange}
                    className="absolute inset-x-0 -top-1 w-full h-4 opacity-0 pointer-events-auto cursor-pointer z-10"
                    aria-label="Minimum price"
                  />
                  <input
                    type="range"
                    min={catalogMinPrice}
                    max={catalogMaxPrice}
                    step={50}
                    value={tempMax}
                    onChange={handleMaxSliderChange}
                    className="absolute inset-x-0 -top-1 w-full h-4 opacity-0 pointer-events-auto cursor-pointer z-20"
                    aria-label="Maximum price"
                  />

                  {/* Clean Circular Thumbs (Matches Reference) */}
                  <div
                    className="absolute top-2 -translate-y-1/2 -translate-x-1/2 w-3.5 h-3.5 rounded-full bg-neutral-900 shadow-sm pointer-events-none"
                    style={{ left: `${sliderLeftPct}%` }}
                  />
                  <div
                    className="absolute top-2 -translate-y-1/2 -translate-x-1/2 w-3.5 h-3.5 rounded-full bg-neutral-900 shadow-sm pointer-events-none"
                    style={{ left: `${sliderRightPct}%` }}
                  />

                  {/* Price Labels Underneath: Left (Min), Right (Max) */}
                  <div className="flex items-center justify-between text-xs text-neutral-600 font-medium pt-3">
                    <span>৳{tempMin.toLocaleString()}</span>
                    <span>৳{tempMax.toLocaleString()}</span>
                  </div>
                </div>

                {/* Subtle Dynamic Price Preset Pills */}
                {dynamicPricePresets.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-3 pt-1">
                    {dynamicPricePresets.map((preset) => {
                      const isPresetActive = activePricePreset === preset.label;
                      return (
                        <button
                          key={preset.label}
                          type="button"
                          onClick={() => handlePricePreset(preset)}
                          className={`px-2.5 py-1 rounded-none text-[11px] font-normal transition-colors cursor-pointer border ${
                            isPresetActive
                              ? 'bg-neutral-900 text-white border-neutral-900 font-medium'
                              : 'bg-white text-neutral-600 border-neutral-200 hover:border-neutral-400'
                          }`}
                        >
                          {preset.label}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* ── Section 3: Colour (Fully Dynamic — Only Appears If Colors Exist) ── */}
              {dynamicColors.length > 0 && (
                <div className="pb-6 border-b border-neutral-100">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-bold text-store-primary tracking-tight">Colour</h3>
                    {selectedColors.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setSelectedColors([])}
                        className="text-xs text-neutral-400 hover:text-store-primary cursor-pointer font-normal transition-colors"
                      >
                        Clear
                      </button>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    {dynamicColors.map(({ name, hex, count }) => {
                      const isChecked = selectedColors.includes(name);

                      return (
                        <label
                          key={name}
                          className="flex items-center justify-between text-xs sm:text-sm text-neutral-700 hover:text-neutral-900 cursor-pointer select-none py-1 group"
                        >
                          <div className="flex items-center gap-2.5">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => toggleColor(name)}
                              className="w-4 h-4 rounded-none border-neutral-300 text-neutral-900 focus:ring-0 cursor-pointer accent-neutral-900"
                            />
                            <span
                              className="w-2.5 h-2.5 rounded-full border border-neutral-200"
                              style={{ backgroundColor: hex }}
                            />
                            <span
                              className={
                                isChecked
                                  ? 'font-semibold text-neutral-950'
                                  : 'text-neutral-600 group-hover:text-neutral-900 font-normal'
                              }
                            >
                              {name}
                            </span>
                          </div>
                          {count > 0 && (
                            <span className="text-xs text-neutral-400 font-normal">
                              {count}
                            </span>
                          )}
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* ── Section 4: Availability & Offers ── */}
              <div className="pb-6 border-b border-neutral-100">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-bold text-store-primary tracking-tight">Availability</h3>
                  {(inStockOnly || onSaleOnly) && (
                    <button
                      type="button"
                      onClick={() => {
                        setInStockOnly(false);
                        setOnSaleOnly(false);
                      }}
                      className="text-xs text-neutral-400 hover:text-store-primary cursor-pointer font-normal transition-colors"
                    >
                      Clear
                    </button>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label className="flex items-center justify-between text-xs sm:text-sm text-neutral-700 hover:text-neutral-900 cursor-pointer select-none py-1 group">
                    <div className="flex items-center gap-2.5">
                      <input
                        type="checkbox"
                        checked={inStockOnly}
                        onChange={handleToggleInStock}
                        className="w-4 h-4 rounded-none border-neutral-300 text-neutral-900 focus:ring-0 cursor-pointer accent-neutral-900"
                      />
                      <span
                        className={
                          inStockOnly
                            ? 'font-semibold text-neutral-950'
                            : 'text-neutral-600 group-hover:text-neutral-900 font-normal'
                        }
                      >
                        In Stock Only
                      </span>
                    </div>
                    <span className="text-xs text-neutral-400 font-normal">
                      {inStockProductsCount}
                    </span>
                  </label>

                  <label className="flex items-center justify-between text-xs sm:text-sm text-neutral-700 hover:text-neutral-900 cursor-pointer select-none py-1 group">
                    <div className="flex items-center gap-2.5">
                      <input
                        type="checkbox"
                        checked={onSaleOnly}
                        onChange={handleToggleOnSale}
                        className="w-4 h-4 rounded-none border-neutral-300 text-neutral-900 focus:ring-0 cursor-pointer accent-neutral-900"
                      />
                      <span
                        className={
                          onSaleOnly
                            ? 'font-semibold text-neutral-950'
                            : 'text-neutral-600 group-hover:text-neutral-900 font-normal'
                        }
                      >
                        Special Offers
                      </span>
                    </div>
                    <span className="text-xs text-neutral-400 font-normal">
                      {saleProductsCount}
                    </span>
                  </label>
                </div>
              </div>

              {/* ── Section 5: Tags (Pill Buttons Like Reference) ── */}
              {dynamicTags.length > 0 && (
                <div className="pb-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-bold text-store-primary tracking-tight">Tags</h3>
                    {selectedStyles.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setSelectedStyles([])}
                        className="text-xs text-neutral-400 hover:text-store-primary cursor-pointer font-normal transition-colors"
                      >
                        Clear
                      </button>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    {dynamicTags.map(({ tag }) => {
                      const isSelected =
                        selectedStyles.includes(tag) ||
                        (tag === 'On Sale' && onSaleOnly) ||
                        (tag === 'In Stock' && inStockOnly);

                      return (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => toggleTag(tag)}
                          className={`px-3 py-1 rounded-none text-xs transition-colors cursor-pointer border ${
                            isSelected
                              ? 'bg-neutral-900 text-white border-neutral-900 font-medium'
                              : 'bg-white text-neutral-700 border-neutral-300 hover:border-neutral-900 hover:text-neutral-900'
                          }`}
                        >
                          <span>{tag}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

            </aside>
          )}

          {/* Right Product Grid Area */}
          <div ref={resultsRef} className="flex-1 min-w-0">
            {isLoading || isFiltering ? (
              <div
                className={`grid grid-cols-2 ${
                  showSidebar
                    ? viewMode === 'grid3'
                      ? 'md:grid-cols-2 lg:grid-cols-3'
                      : 'md:grid-cols-3 lg:grid-cols-4'
                    : 'sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5'
                } gap-3 sm:gap-4 md:gap-5`}
              >
                {Array.from({ length: 8 }).map((_, idx) => (
                  <AarongProductCardSkeleton key={idx} />
                ))}
              </div>
            ) : loadError ? (
              <div className="rounded-none border border-neutral-200 bg-neutral-50/50 p-12 text-center space-y-3">
                <p className="text-sm font-semibold text-neutral-800">
                  Products are temporarily unavailable
                </p>
                <button
                  type="button"
                  onClick={() => window.location.reload()}
                  className="px-5 py-2 rounded-none bg-neutral-900 text-white text-xs font-semibold cursor-pointer hover:bg-neutral-800 transition-colors"
                >
                  Try Again
                </button>
              </div>
            ) : filteredProducts.length > 0 ? (
              <>
                {/* Product Grid */}
                <div
                  className={`grid grid-cols-2 ${
                    showSidebar
                      ? viewMode === 'grid3'
                        ? 'md:grid-cols-2 lg:grid-cols-3'
                        : 'md:grid-cols-3 lg:grid-cols-4'
                      : 'sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5'
                  } gap-3 sm:gap-4 md:gap-5`}
                >
                  {visibleProducts.map((product) => (
                    <AarongProductCard
                      key={product.id}
                      id={product.id}
                      name={product.name}
                      price={product.price}
                      originalPrice={product.originalPrice}
                      image={product.image}
                      slug={product.slug}
                      category={product.category}
                      badge={product.badge}
                      variantId={product.variantId}
                    />
                  ))}
                </div>

                {/* Minimalist Pagination */}
                {pageCount > 1 && (
                  <nav aria-label="Products pagination" className="mt-14 flex items-center justify-center gap-2">
                    <button
                      type="button"
                      onClick={() => goToPage(safePage - 1)}
                      disabled={safePage === 1}
                      className="h-9 px-4 rounded-none border border-neutral-300 text-xs font-medium text-neutral-700 hover:border-neutral-900 disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed transition-colors"
                    >
                      Previous
                    </button>

                    {Array.from({ length: pageCount }).map((_, idx) => {
                      const page = idx + 1;
                      const isCurrent = page === safePage;

                      return (
                        <button
                          key={page}
                          type="button"
                          onClick={() => goToPage(page)}
                          aria-current={isCurrent ? 'page' : undefined}
                          className={`w-9 h-9 rounded-none text-xs font-medium transition-colors cursor-pointer ${
                            isCurrent
                              ? 'bg-neutral-900 text-white shadow-xs'
                              : 'border border-neutral-200 text-neutral-700 hover:border-neutral-900'
                          }`}
                        >
                          {page}
                        </button>
                      );
                    })}

                    <button
                      type="button"
                      onClick={() => goToPage(safePage + 1)}
                      disabled={safePage === pageCount}
                      className="h-9 px-4 rounded-none border border-neutral-300 text-xs font-medium text-neutral-700 hover:border-neutral-900 disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed transition-colors"
                    >
                      Next
                    </button>
                  </nav>
                )}
              </>
            ) : (
              /* Empty state */
              <div className="flex flex-col items-center justify-center py-20 text-center px-4 bg-neutral-50/50 rounded-none border border-neutral-200">
                <div className="w-12 h-12 rounded-none bg-neutral-100 text-neutral-600 flex items-center justify-center mb-3">
                  <LuRotateCcw className="w-5 h-5" />
                </div>
                <h3 className="text-base font-semibold text-neutral-950 mb-1">
                  No products found
                </h3>
                <p className="text-xs text-neutral-500 max-w-sm mb-5">
                  Try adjusting your price range, color filters, or selecting another collection.
                </p>
                <button
                  type="button"
                  onClick={clearAllFilters}
                  className="px-5 py-2.5 bg-neutral-900 hover:bg-neutral-800 text-white font-medium text-xs rounded-none shadow-xs transition-colors cursor-pointer"
                >
                  Clear All Filters
                </button>
              </div>
            )}
          </div>

        </div>
      </div>

      {/* ── 4. Mobile Filter Slide-Over Drawer (Clean & Aligned) ── */}
      {isMobileFilterOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-xs animate-fadeIn">
          <button
            type="button"
            className="absolute inset-0 cursor-pointer"
            onClick={() => setIsMobileFilterOpen(false)}
            aria-label="Close filters"
          />

          <div
            role="dialog"
            aria-modal="true"
            aria-label="Filters"
            className="relative w-full max-w-xs sm:max-w-sm h-full bg-white shadow-2xl flex flex-col justify-between z-10 animate-slideLeft"
          >
            {/* Drawer Header */}
            <div className="px-5 py-4 border-b border-neutral-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold tracking-tight text-neutral-950">
                  Filters
                </h3>
                {activeFiltersCount > 0 && (
                  <span className="px-2 py-0.5 rounded-xs bg-neutral-900 text-white text-[10px] font-bold">
                    {activeFiltersCount}
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={() => setIsMobileFilterOpen(false)}
                className="w-8 h-8 rounded-none border border-neutral-200 flex items-center justify-center text-neutral-500 hover:text-neutral-950 cursor-pointer"
                aria-label="Close filters"
              >
                <LuX className="w-4 h-4" />
              </button>
            </div>

            {/* Drawer Body */}
            <div className="flex-1 overflow-y-auto px-5 py-5 space-y-6">
              
              {/* Categories */}
              <div className="space-y-2 pb-5 border-b border-neutral-100">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-store-primary">
                    Categories
                  </h4>
                  {selectedCategory !== 'All' && (
                    <button
                      type="button"
                      onClick={() => handleSelectCategory('All')}
                      className="text-xs text-neutral-400 hover:text-store-primary cursor-pointer"
                    >
                      Clear
                    </button>
                  )}
                </div>

                <div className="space-y-1">
                  <button
                    type="button"
                    onClick={() => {
                      handleSelectCategory('All');
                    }}
                    className="w-full flex items-center justify-between py-1.5 text-xs text-left cursor-pointer"
                  >
                    <span className={selectedCategory === 'All' ? 'font-semibold text-neutral-950' : 'text-neutral-600'}>
                      All Collections
                    </span>
                    <span className="text-neutral-400 text-xs">{products.length}</span>
                  </button>

                  {categoriesList.slice(0, 15).map((cat) => {
                    const isSelected =
                      !onSaleOnly &&
                      selectedCategory !== 'All' &&
                      (selectedCategory.toLowerCase() === cat.toLowerCase() ||
                        normalizeCatName(cat) === normalizeCatName(selectedCategory));
                    const count = categoryCounts[cat.toLowerCase()] || categoryCounts[normalizeCatName(cat)] || 0;
                    return (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => {
                          handleSelectCategory(cat);
                        }}
                        className="w-full flex items-center justify-between py-1.5 text-xs text-left cursor-pointer"
                      >
                        <span className={isSelected ? 'font-semibold text-neutral-950' : 'text-neutral-600'}>
                          {cat}
                        </span>
                        <span className="text-neutral-400 text-xs">{count}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Price Slider */}
              <div className="space-y-3 pb-5 border-b border-neutral-100">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-store-primary">
                    Price
                  </h4>
                  {(appliedMinPrice !== null || appliedMaxPrice !== null) && (
                    <button
                      type="button"
                      onClick={clearPriceFilter}
                      className="text-xs text-neutral-400 hover:text-store-primary cursor-pointer"
                    >
                      Clear
                    </button>
                  )}
                </div>

                <div className="relative pt-2 pb-1 select-none">
                  <div className="h-0.5 w-full bg-neutral-200 rounded-full relative">
                    <div
                      className="absolute h-0.5 bg-neutral-900 rounded-full"
                      style={{
                        left: `${sliderLeftPct}%`,
                        right: `${100 - sliderRightPct}%`,
                      }}
                    />
                  </div>

                  <input
                    type="range"
                    min={catalogMinPrice}
                    max={catalogMaxPrice}
                    step={50}
                    value={tempMin}
                    onChange={handleMinSliderChange}
                    className="absolute inset-x-0 -top-1 w-full h-4 opacity-0 pointer-events-auto cursor-pointer z-10"
                  />
                  <input
                    type="range"
                    min={catalogMinPrice}
                    max={catalogMaxPrice}
                    step={50}
                    value={tempMax}
                    onChange={handleMaxSliderChange}
                    className="absolute inset-x-0 -top-1 w-full h-4 opacity-0 pointer-events-auto cursor-pointer z-20"
                  />

                  <div
                    className="absolute top-2 -translate-y-1/2 -translate-x-1/2 w-3.5 h-3.5 rounded-full bg-neutral-900 shadow-sm pointer-events-none"
                    style={{ left: `${sliderLeftPct}%` }}
                  />
                  <div
                    className="absolute top-2 -translate-y-1/2 -translate-x-1/2 w-3.5 h-3.5 rounded-full bg-neutral-900 shadow-sm pointer-events-none"
                    style={{ left: `${sliderRightPct}%` }}
                  />

                  <div className="flex items-center justify-between text-xs text-neutral-600 font-medium pt-3">
                    <span>৳{tempMin.toLocaleString()}</span>
                    <span>৳{tempMax.toLocaleString()}</span>
                  </div>
                </div>

                {dynamicPricePresets.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {dynamicPricePresets.map((preset) => (
                      <button
                        key={preset.label}
                        type="button"
                        onClick={() => handlePricePreset(preset)}
                        className={`px-2.5 py-1 rounded-none text-[11px] transition-colors cursor-pointer border ${
                          activePricePreset === preset.label
                            ? 'bg-neutral-900 text-white border-neutral-900 font-medium'
                            : 'bg-white text-neutral-600 border-neutral-200'
                        }`}
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Colour Checkboxes — Fully Dynamic: only rendered if colors exist in products */}
              {dynamicColors.length > 0 && (
                <div className="space-y-2 pb-5 border-b border-neutral-100">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-store-primary">
                      Colour
                    </h4>
                    {selectedColors.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setSelectedColors([])}
                        className="text-xs text-neutral-400 hover:text-store-primary cursor-pointer"
                      >
                        Clear
                      </button>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    {dynamicColors.map(({ name, hex, count }) => {
                      const isChecked = selectedColors.includes(name);
                      return (
                        <label
                          key={name}
                          className="flex items-center justify-between text-xs text-neutral-700 py-1 cursor-pointer select-none"
                        >
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => toggleColor(name)}
                              className="w-4 h-4 rounded-none border-neutral-300 text-neutral-900 focus:ring-0 accent-neutral-900"
                            />
                            <span
                              className="w-2.5 h-2.5 rounded-full border border-neutral-200"
                              style={{ backgroundColor: hex }}
                            />
                            <span className={isChecked ? 'font-semibold text-neutral-950' : 'text-neutral-600'}>
                              {name}
                            </span>
                          </div>
                          {count > 0 && <span className="text-neutral-400 text-xs">{count}</span>}
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Availability */}
              <div className="space-y-2 pb-5 border-b border-neutral-100">
                <h4 className="text-xs font-bold uppercase tracking-wider text-store-primary">
                  Availability
                </h4>
                <div className="space-y-1.5">
                  <label className="flex items-center justify-between text-xs text-neutral-700 py-1 cursor-pointer select-none">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={inStockOnly}
                        onChange={handleToggleInStock}
                        className="w-4 h-4 rounded-none border-neutral-300 text-neutral-900 focus:ring-0 accent-neutral-900"
                      />
                      <span className={inStockOnly ? 'font-semibold text-neutral-950' : 'text-neutral-600'}>
                        In Stock Only
                      </span>
                    </div>
                    <span className="text-neutral-400 text-xs">{inStockProductsCount}</span>
                  </label>

                  <label className="flex items-center justify-between text-xs text-neutral-700 py-1 cursor-pointer select-none">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={onSaleOnly}
                        onChange={handleToggleOnSale}
                        className="w-4 h-4 rounded-none border-neutral-300 text-neutral-900 focus:ring-0 accent-neutral-900"
                      />
                      <span className={onSaleOnly ? 'font-semibold text-neutral-950' : 'text-neutral-600'}>
                        Special Offers
                      </span>
                    </div>
                    <span className="text-neutral-400 text-xs">{saleProductsCount}</span>
                  </label>
                </div>
              </div>

              {/* Tags — Fully Dynamic: only rendered if matching tags exist */}
              {dynamicTags.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-store-primary">
                    Tags
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {dynamicTags.map(({ tag }) => {
                      const isSelected =
                        selectedStyles.includes(tag) ||
                        (tag === 'On Sale' && onSaleOnly) ||
                        (tag === 'In Stock' && inStockOnly);
                      return (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => toggleTag(tag)}
                          className={`px-3 py-1 rounded-none text-xs transition-colors cursor-pointer border ${
                            isSelected
                              ? 'bg-neutral-900 text-white border-neutral-900 font-medium'
                              : 'bg-white text-neutral-700 border-neutral-300'
                          }`}
                        >
                          {tag}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

            </div>

            {/* Drawer Sticky Footer with Live Matching Product Count */}
            <div className="p-4 border-t border-neutral-200 flex items-center gap-3 bg-white">
              <button
                type="button"
                onClick={clearAllFilters}
                className="w-1/3 h-11 rounded-none border border-neutral-300 text-xs font-semibold text-neutral-700 hover:border-neutral-900 cursor-pointer transition-colors"
              >
                Reset
              </button>
              <button
                type="button"
                onClick={() => setIsMobileFilterOpen(false)}
                className="w-2/3 h-11 rounded-none bg-neutral-900 text-xs font-semibold text-white hover:bg-neutral-800 cursor-pointer transition-colors shadow-xs flex items-center justify-center gap-1.5"
              >
                <span>View Results ({filteredProducts.length})</span>
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<ShopPageSkeleton />}>
      <ProductsContent />
    </Suspense>
  );
}
