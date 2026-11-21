import type { Product as AdminProduct } from "./admin-api";

// Real product images from public/products/cords set/
const CORDS_SET_IMAGES = [
  "/products/cords set/905937710_1118136247512437_2099551318531647321_n.jpg",
  "/products/cords set/906103350_1118136274179101_4099530442062694841_n.jpg",
  "/products/cords set/906469184_1118136240845771_3943291408721840727_n.jpg",
  "/products/cords set/906970787_1118136294179099_2969676140071058051_n.jpg",
  "/products/cords set/907179635_1119377164055012_4690738175147170981_n.jpg",
  "/products/cords set/907179696_1120440083948720_7963413112182328795_n.jpg",
  "/products/cords set/907385142_1119561854036543_4006898923496413414_n.jpg",
  "/products/cords set/907405935_1115282814464447_1437912009837912524_n.jpg",
  "/products/cords set/907641467_1120440070615388_2107924479017573990_n.jpg",
  "/products/cords set/910465086_1119291994063529_6730173952863950097_n.jpg",
  "/products/cords set/910465283_1121429233849805_1193318539780352366_n.jpg",
  "/products/cords set/913180013_1120115427314519_7306115019982798276_n.jpg",
  "/products/cords set/916496639_2050418568951611_3231227725146044425_n.jpeg",
  "/products/cords set/907710748_1120440017282060_7568019241650380073_n.jpg",
  "/products/cords set/910779035_1119402200719175_1380832213076202045_n.jpg",
  "/products/cords set/911444036_1120115507314511_5435483419353914143_n.jpg",
];

interface FallbackProduct {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  discountPrice?: number;
  category: string;
  images: string[];
  badge?: string;
}

const MINITHAILANDBD_PRODUCTS: FallbackProduct[] = [
  {
    id: "mt-cord-001",
    name: "Thai Cord Set — Rose Pink",
    slug: "thai-cord-set-rose-pink",
    description: "থাইল্যান্ড থেকে আনা প্রিমিয়াম কর্ড সেট। সফট ফেব্রিক, স্টাইলিশ ডিজাইন। Premium Thai cord set in soft rose pink — lightweight, breathable fabric perfect for Bangladeshi weather.",
    price: 2200,
    discountPrice: 1800,
    category: "Cord Sets",
    images: [CORDS_SET_IMAGES[0], CORDS_SET_IMAGES[1]],
    badge: "Best Seller",
  },
  {
    id: "mt-cord-002",
    name: "Thai Cord Set — Sky Blue",
    slug: "thai-cord-set-sky-blue",
    description: "আকাশি নীল রঙের থাই কর্ড সেট। গরমে আরামদায়ক ও ফ্যাশনেবল। Elegant sky blue Thai cord set — trendy design, superior comfort.",
    price: 2200,
    discountPrice: 1850,
    category: "Cord Sets",
    images: [CORDS_SET_IMAGES[1], CORDS_SET_IMAGES[2]],
  },
  {
    id: "mt-cord-003",
    name: "Premium Cord Dress — Floral",
    slug: "premium-cord-dress-floral",
    description: "ফুলের ডিজাইনের প্রিমিয়াম কর্ড ড্রেস। বিশেষ অনুষ্ঠান বা দৈনন্দিন ব্যবহারের জন্য পারফেক্ট। Floral premium cord dress — perfect for special occasions and everyday style.",
    price: 2800,
    discountPrice: 2300,
    category: "Cord Sets",
    images: [CORDS_SET_IMAGES[2], CORDS_SET_IMAGES[3]],
    badge: "New Arrival",
  },
  {
    id: "mt-cord-004",
    name: "Thai Cord Set — Mint Green",
    slug: "thai-cord-set-mint-green",
    description: "মিন্ট সবুজ কর্ড সেট — গ্রীষ্মকালীন পোশাকের জন্য আদর্শ। Cool mint green Thai cord set, perfect for summer styling.",
    price: 2200,
    category: "Cord Sets",
    images: [CORDS_SET_IMAGES[3], CORDS_SET_IMAGES[4]],
  },
  {
    id: "mt-cord-005",
    name: "Designer Cord Set — Lavender",
    slug: "designer-cord-set-lavender",
    description: "লেভেন্ডার রঙের ডিজাইনার কর্ড সেট। থাইল্যান্ডের সেরা ডিজাইনারদের তৈরি। Designer lavender cord set — crafted by Thailand's finest fashion designers.",
    price: 2500,
    discountPrice: 2100,
    category: "Cord Sets",
    images: [CORDS_SET_IMAGES[4], CORDS_SET_IMAGES[5]],
    badge: "Trending",
  },
  {
    id: "mt-cord-006",
    name: "Thai Cord Set — Cream White",
    slug: "thai-cord-set-cream-white",
    description: "ক্রিম সাদা থাই কর্ড সেট — যেকোনো অনুষ্ঠানে মানানসই। Elegant cream white cord set — versatile for any occasion.",
    price: 2200,
    discountPrice: 1900,
    category: "Cord Sets",
    images: [CORDS_SET_IMAGES[5], CORDS_SET_IMAGES[6]],
  },
  {
    id: "mt-cord-007",
    name: "Printed Cord Set — Tropical",
    slug: "printed-cord-set-tropical",
    description: "ট্রপিক্যাল প্রিন্টেড কর্ড সেট — ছুটির দিনে বা বেড়াতে যাওয়ার জন্য পারফেক্ট। Tropical print cord set — ideal for holidays and casual outings.",
    price: 2600,
    discountPrice: 2200,
    category: "Cord Sets",
    images: [CORDS_SET_IMAGES[6], CORDS_SET_IMAGES[7]],
    badge: "Hot Pick",
  },
  {
    id: "mt-cord-008",
    name: "Classic Thai Cord Set — Peach",
    slug: "classic-thai-cord-set-peach",
    description: "পিচ রঙের ক্লাসিক থাই কর্ড সেট। সারা বছর পরার উপযোগী। Classic peach cord set — timeless style for year-round wear.",
    price: 2200,
    category: "Cord Sets",
    images: [CORDS_SET_IMAGES[7], CORDS_SET_IMAGES[8]],
  },
  {
    id: "mt-cord-009",
    name: "Embroidered Cord Set — Gold",
    slug: "embroidered-cord-set-gold",
    description: "সোনালী এম্ব্রয়ডারি করা কর্ড সেট — ঈদ ও পার্টির জন্য আদর্শ। Gold embroidered cord set — perfect for Eid celebrations and parties.",
    price: 3200,
    discountPrice: 2800,
    category: "Cord Sets",
    images: [CORDS_SET_IMAGES[8], CORDS_SET_IMAGES[9]],
    badge: "Eid Special",
  },
  {
    id: "mt-cord-010",
    name: "Thai Cord Set — Burgundy",
    slug: "thai-cord-set-burgundy",
    description: "বার্গান্ডি রঙের থাই কর্ড সেট — ক্লাসি ও স্মার্ট লুকের জন্য। Rich burgundy cord set — for a classy, sophisticated look.",
    price: 2400,
    discountPrice: 2000,
    category: "Cord Sets",
    images: [CORDS_SET_IMAGES[9], CORDS_SET_IMAGES[10]],
  },
  {
    id: "mt-cord-011",
    name: "Lace Detail Cord Set — White",
    slug: "lace-detail-cord-set-white",
    description: "লেস ডিটেইল সাদা কর্ড সেট — বিশেষ মুহূর্তের জন্য। Delicate lace detail white cord set — for special moments.",
    price: 2900,
    discountPrice: 2500,
    category: "Cord Sets",
    images: [CORDS_SET_IMAGES[10], CORDS_SET_IMAGES[11]],
    badge: "New Arrival",
  },
  {
    id: "mt-cord-012",
    name: "Premium Thai Cord Set — Navy",
    slug: "premium-thai-cord-set-navy",
    description: "নেভি ব্লু প্রিমিয়াম থাই কর্ড সেট — অফিস থেকে আউটিং সব জায়গায় মানানসই। Premium navy cord set — from office to outings, always stylish.",
    price: 2500,
    category: "Cord Sets",
    images: [CORDS_SET_IMAGES[11], CORDS_SET_IMAGES[12]],
  },
];

function makeProduct(fp: FallbackProduct): AdminProduct {
  const catInfo = {
    id: "cat-cord-sets",
    name: "Cord Sets",
    slug: "cord-sets",
  };

  return {
    id: fp.id,
    name: fp.name,
    slug: fp.slug,
    description: fp.description,
    shortDescription: fp.name,
    status: "active",
    discountPrice: fp.discountPrice ? String(fp.discountPrice) : undefined,
    metaTitle: `${fp.name} | MiniThailandBD`,
    metaDescription: fp.description.slice(0, 160),
    brandId: "b-minithailandbd",
    categoryId: catInfo.id,
    brand: {
      id: "b-minithailandbd",
      name: "MiniThailandBD Collection",
      slug: "minithailandbd-collection",
      logoUrl: "/products/logo.jpg",
    },
    category: {
      id: catInfo.id,
      name: catInfo.name,
      slug: catInfo.slug,
    },
    unit: {
      id: `u-${fp.id}`,
      name: "Piece",
      abbreviation: "PC",
      factor: 1,
      isActive: true,
    },
    media: fp.images.map((img, idx) => ({
      id: `med-${fp.id}-${idx}`,
      isFeatured: idx === 0,
      sortOrder: idx,
      mediaId: `med-id-${fp.id}-${idx}`,
      media: {
        id: `med-id-${fp.id}-${idx}`,
        url: img,
        type: "image",
      },
    })),
    variants: [
      {
        id: `var-${fp.id}-std`,
        sku: `MT-${fp.id.toUpperCase()}-001`,
        price: String(fp.price),
        cost: String(Math.round(fp.price * 0.65)),
        stockQuantity: 50,
        stockAlertThreshold: 5,
        isDefault: true,
        attributes: [
          { attributeValue: { attribute: { name: "Origin" }, value: "Thailand" } },
          { attributeValue: { attribute: { name: "Condition" }, value: "Brand New" } },
        ],
      },
    ],
  } as unknown as AdminProduct;
}

export const FALLBACK_MARKETPLACE_PRODUCTS: AdminProduct[] =
  MINITHAILANDBD_PRODUCTS.map(makeProduct);
