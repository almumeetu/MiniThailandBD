/**
 * Type definitions for Mega Menu components
 */

export interface SubCategory {
  name: string;
  href: string;
  description?: string;
  image?: string;
  badge?: "New" | "Sale" | "Hot" | "Limited";
  isExternal?: boolean;
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
  badge?: "New" | "Sale" | "Hot" | "Limited";
  cta?: string; // Call-to-action text
}

export interface MenuCategory {
  name: string;
  href: string;
  featured?: FeaturedItem;
  sections?: MenuSection[];
  badge?: "New" | "Sale" | "Hot";
}

export interface QuickLink {
  name: string;
  href: string;
  icon?: React.ComponentType;
}

export interface MegaMenuConfig {
  categories: MenuCategory[];
  quickLinks?: QuickLink[];
}

// Props for MegaMenu component
export interface MegaMenuProps {
  categories?: MenuCategory[];
  className?: string;
  onNavigate?: (href: string) => void;
}

// Props for MobileMenu component
export interface MobileMenuProps {
  categories?: MenuCategory[];
  className?: string;
  onNavigate?: (href: string) => void;
}

// State types
export interface MegaMenuState {
  activeMenu: string | null;
  isHovering: boolean;
}

export interface MobileMenuState {
  isOpen: boolean;
  expandedCategory: string | null;
}
