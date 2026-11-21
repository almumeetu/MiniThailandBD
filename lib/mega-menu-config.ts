/**
 * Mega Menu Configuration
 * 
 * This file contains the mega menu structure and can be easily customized
 * to match your store's categories and products.
 */

export interface SubCategory {
  name: string;
  href: string;
  description?: string;
  image?: string;
  badge?: string; // e.g., "New", "Sale", "Hot"
}

export interface MenuSection {
  title: string;
  items: SubCategory[];
}

export interface FeaturedItem {
  title: string;
  description: string;
  image: string;
  href: string;
  badge?: string;
}

export interface MenuCategory {
  name: string;
  href: string;
  featured?: FeaturedItem;
  sections?: MenuSection[];
}

/**
 * Main Menu Configuration
 * Customize this array to match your store's navigation structure
 */
export const megaMenuConfig: MenuCategory[] = [
  {
    name: "Shop",
    href: "/products",
    featured: {
      title: "New Collection 2024",
      description: "Discover our latest premium football jerseys",
      image: "/images/featured/new-collection.jpg",
      href: "/products?collection=new-2024",
      badge: "New",
    },
    sections: [
      {
        title: "By Sport",
        items: [
          { name: "Football", href: "/products?sport=football" },
          { name: "Basketball", href: "/products?sport=basketball" },
          { name: "Cricket", href: "/products?sport=cricket" },
          { name: "Tennis", href: "/products?sport=tennis" },
          { name: "Rugby", href: "/products?sport=rugby" },
        ],
      },
      {
        title: "By Type",
        items: [
          { name: "Jerseys", href: "/products?type=jerseys" },
          { name: "Training Kits", href: "/products?type=training" },
          { name: "Fan Wear", href: "/products?type=fanwear" },
          { name: "Accessories", href: "/products?type=accessories" },
          { name: "Equipment", href: "/products?type=equipment" },
        ],
      },
      {
        title: "Collections",
        items: [
          { 
            name: "Best Sellers", 
            href: "/products?collection=bestsellers",
            badge: "Hot"
          },
          { 
            name: "Limited Edition", 
            href: "/products?collection=limited",
            badge: "Limited"
          },
          { name: "Vintage", href: "/products?collection=vintage" },
          { name: "Custom Design", href: "/products?collection=custom" },
        ],
      },
      {
        title: "Shop By Price",
        items: [
          { name: "Under $50", href: "/products?price=under-50" },
          { name: "$50 - $100", href: "/products?price=50-100" },
          { name: "$100 - $200", href: "/products?price=100-200" },
          { name: "Premium ($200+)", href: "/products?price=premium" },
        ],
      },
    ],
  },
  {
    name: "New In",
    href: "/products?filter=new",
    featured: {
      title: "Just Arrived",
      description: "Fresh drops from your favorite teams",
      image: "/images/featured/new-arrivals.jpg",
      href: "/products?filter=new",
      badge: "New",
    },
    sections: [
      {
        title: "This Week",
        items: [
          { name: "Latest Releases", href: "/products?new=this-week" },
          { name: "Restocked Items", href: "/products?new=restocked" },
          { name: "Pre-Orders", href: "/products?new=preorder" },
        ],
      },
      {
        title: "By League",
        items: [
          { name: "Premier League", href: "/products?league=epl" },
          { name: "La Liga", href: "/products?league=laliga" },
          { name: "Serie A", href: "/products?league=seriea" },
          { name: "Bundesliga", href: "/products?league=bundesliga" },
          { name: "Champions League", href: "/products?league=ucl" },
        ],
      },
      {
        title: "Trending",
        items: [
          { name: "Most Viewed", href: "/products?trending=viewed" },
          { name: "Most Wishlisted", href: "/products?trending=wishlist" },
          { name: "Fast Movers", href: "/products?trending=fast" },
        ],
      },
    ],
  },
  {
    name: "Brands",
    href: "/brands",
    featured: {
      title: "Premium Brands",
      description: "Official merchandise from top manufacturers",
      image: "/images/featured/brands.jpg",
      href: "/brands",
    },
    sections: [
      {
        title: "Top Brands",
        items: [
          { name: "Nike", href: "/brands/nike" },
          { name: "Adidas", href: "/brands/adidas" },
          { name: "Puma", href: "/brands/puma" },
          { name: "Umbro", href: "/brands/umbro" },
          { name: "New Balance", href: "/brands/newbalance" },
        ],
      },
      {
        title: "Official Teams",
        items: [
          { name: "Manchester United", href: "/brands/manutd" },
          { name: "Barcelona", href: "/brands/barcelona" },
          { name: "Real Madrid", href: "/brands/realmadrid" },
          { name: "Bayern Munich", href: "/brands/bayern" },
          { name: "Liverpool", href: "/brands/liverpool" },
        ],
      },
      {
        title: "National Teams",
        items: [
          { name: "England", href: "/brands/england" },
          { name: "Brazil", href: "/brands/brazil" },
          { name: "Germany", href: "/brands/germany" },
          { name: "Argentina", href: "/brands/argentina" },
          { name: "France", href: "/brands/france" },
        ],
      },
    ],
  },
  {
    name: "Archive",
    href: "/archive",
    featured: {
      title: "Vintage Classics",
      description: "Iconic jerseys from football history",
      image: "/images/featured/archive.jpg",
      href: "/archive",
    },
    sections: [
      {
        title: "By Era",
        items: [
          { name: "1990s", href: "/archive?era=1990s" },
          { name: "2000s", href: "/archive?era=2000s" },
          { name: "2010s", href: "/archive?era=2010s" },
          { name: "Retro Classics", href: "/archive?era=retro" },
        ],
      },
      {
        title: "Legendary Moments",
        items: [
          { name: "World Cup Finals", href: "/archive?moment=worldcup" },
          { name: "Champions League", href: "/archive?moment=ucl" },
          { name: "Derby Classics", href: "/archive?moment=derby" },
          { name: "Trophy Winners", href: "/archive?moment=trophy" },
        ],
      },
      {
        title: "Player Editions",
        items: [
          { name: "Iconic Numbers", href: "/archive?type=numbers" },
          { name: "Legend Series", href: "/archive?type=legends" },
          { name: "Signed Editions", href: "/archive?type=signed" },
        ],
      },
    ],
  },
];

/**
 * Quick Links Configuration
 * These appear at the bottom of the mega menu
 */
export const quickLinks = [
  { name: "Free Delivery", href: "/delivery" },
  { name: "Easy Returns", href: "/returns" },
  { name: "Gift Sets", href: "/gift-sets" },
  { name: "Size Guide", href: "/size-guide" },
];

/**
 * Mobile Menu Configuration
 * Simplified version for mobile devices
 */
export const mobileMenuConfig = megaMenuConfig.map((category) => ({
  ...category,
  // Limit sections for mobile
  sections: category.sections?.slice(0, 2),
}));
