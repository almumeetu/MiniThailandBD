"use client";

import { useEffect, useState } from "react";

export interface BranchOutlet {
  id: string;
  name: string;
  shopNo: string;
  level: string;
  location: string;
  city: string;
}

export interface NotificationSettings {
  enabled: boolean;
  slides: string[];
  autoplayDelay: number;
  speed: number;
  hotlinePhone: string;
  hotlineShort: string;
  whatsappNumber: string;
  followerBadge: string;
  reelViewsBadge: string;
  bannerEnabled: boolean;
  bannerTitle: string;
  bannerText: string;
  bannerButtonText: string;
  bannerButtonLink: string;
  facebookUrl: string;
  instagramUrl: string;
  youtubeUrl: string;
  websiteUrl: string;
  branches: BranchOutlet[];
}

export const DEFAULT_NOTIFICATION_SETTINGS: NotificationSettings = {
  enabled: true,
  slides: [
    "✨ 534K Followers • 282M Reel Views on Facebook & Instagram | Authentic Bangkok Fashion",
    "🛍️ Visit our 4 Dhaka Outlets: Jamuna Future Park, Dhanmondi, Uttara & Adabor",
    "📞 Call & WhatsApp Hotline: +880 1706-126663 | Fast Nationwide Delivery across Bangladesh",
    "👗 Exclusive Thai Cord Sets, Luxury Velvet Party Gowns & Modest Boutique Fashion",
  ],
  autoplayDelay: 3500,
  speed: 600,
  hotlinePhone: "+880 1706-126663",
  hotlineShort: "01706126663",
  whatsappNumber: "8801706126663",
  followerBadge: "534K followers",
  reelViewsBadge: "282M reel views",
  bannerEnabled: true,
  bannerTitle: "Mini Thailand Official Facebook & Outlets",
  bannerText:
    "Order online or visit our 4 outlets in Dhaka: Jamuna Future Park, Dhanmondi, Uttara & Adabor. Connect with 534K+ fashion lovers!",
  bannerButtonText: "Chat on WhatsApp: +880 1706-126663",
  bannerButtonLink: "https://wa.me/8801706126663",
  facebookUrl: "https://www.facebook.com/minithailand2022/",
  instagramUrl: "https://www.instagram.com/mini_thailand123",
  youtubeUrl: "https://www.youtube.com/@MiniThailand-pk5rs",
  websiteUrl: "http://minithailandbd.com",
  branches: [
    {
      id: "branch-jfp",
      name: "Jamuna Future Park",
      shopNo: "Shop no. 11, Zone C",
      level: "Ground Floor",
      location: "South Court, Jamuna Future Park, Pragati Sarani",
      city: "Dhaka, Bangladesh, 1229",
    },
    {
      id: "branch-adabor",
      name: "Shahabuddin Plaza",
      shopNo: "Shop no. 43",
      level: "Level 2",
      location: "Ring Road, Adabor, Mohammadpur",
      city: "Dhaka, Bangladesh, 1207",
    },
    {
      id: "branch-uttara",
      name: "Nigar Plaza",
      shopNo: "Shop no. 23-24",
      level: "Level 2",
      location: "Rajlokkhi, Sector 3, Uttara",
      city: "Dhaka, Bangladesh, 1230",
    },
    {
      id: "branch-dhanmondi",
      name: "Shimanto Shambhar (Simanto Somvar)",
      shopNo: "Shop no. 3060",
      level: "Level 3",
      location: "Road 2, Dhanmondi",
      city: "Dhaka, Bangladesh, 1209",
    },
  ],
};

const STORAGE_KEY = "minithailand_notification_settings_v1";
const EVENT_NAME = "minithailand:notification-updated";

export function getStoredNotificationSettings(): NotificationSettings {
  if (typeof window === "undefined") return DEFAULT_NOTIFICATION_SETTINGS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_NOTIFICATION_SETTINGS;
    const parsed = JSON.parse(raw);
    return {
      ...DEFAULT_NOTIFICATION_SETTINGS,
      ...parsed,
      slides: Array.isArray(parsed.slides) && parsed.slides.length > 0
        ? parsed.slides
        : DEFAULT_NOTIFICATION_SETTINGS.slides,
      branches: Array.isArray(parsed.branches) && parsed.branches.length > 0
        ? parsed.branches
        : DEFAULT_NOTIFICATION_SETTINGS.branches,
    };
  } catch {
    return DEFAULT_NOTIFICATION_SETTINGS;
  }
}

export function saveStoredNotificationSettings(
  settings: NotificationSettings
): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: settings }));
  } catch (err) {
    console.error("Failed to save notification settings:", err);
  }
}

export function resetStoredNotificationSettings(): NotificationSettings {
  if (typeof window !== "undefined") {
    try {
      localStorage.removeItem(STORAGE_KEY);
      window.dispatchEvent(
        new CustomEvent(EVENT_NAME, { detail: DEFAULT_NOTIFICATION_SETTINGS })
      );
    } catch (err) {
      console.error("Failed to reset notification settings:", err);
    }
  }
  return DEFAULT_NOTIFICATION_SETTINGS;
}

export function useNotificationSettings(): NotificationSettings {
  const [settings, setSettings] = useState<NotificationSettings>(
    DEFAULT_NOTIFICATION_SETTINGS
  );

  useEffect(() => {
    setSettings(getStoredNotificationSettings());

    const handler = (event: Event) => {
      const custom = event as CustomEvent<NotificationSettings>;
      if (custom.detail) {
        setSettings(custom.detail);
      } else {
        setSettings(getStoredNotificationSettings());
      }
    };

    window.addEventListener(EVENT_NAME, handler);
    return () => window.removeEventListener(EVENT_NAME, handler);
  }, []);

  return settings;
}
