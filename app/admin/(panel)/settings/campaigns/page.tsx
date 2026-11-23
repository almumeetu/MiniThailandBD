"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { AdminIcon, PageHeader } from "../../../_components/admin-shell";
import { ConfirmModal } from "../../../_components/confirm-modal";
import { useDiscounts } from "../../../_hooks/use-discounts";
import { useSections } from "../../../_hooks/use-sections";
import { apiRequest, type Campaign } from "../../../../../lib/admin-api";
import {
  SettingsCard,
  FieldLabel,
  Input,
  Textarea,
  StatusToggle,
  SaveButton,
} from "../_components/settings-ui";

import {
  getStoredCampaigns,
  saveCustomCampaign,
  saveStoredCampaigns,
  toggleStoredCampaignStatus,
  deleteStoredCampaign,
  normalizeCampaignToEnglish,
} from "../../../../../lib/campaign-store";

import {
  LuImage,
  LuLayers,
  LuSparkles,
  LuEye,
  LuPencil,
  LuTrash2,
  LuArrowUp,
  LuArrowDown,
  LuExternalLink,
  LuSearch,
  LuX,
  LuPlus,
  LuSlidersHorizontal,
  LuCheck,
} from "react-icons/lu";

type CampaignForm = {
  id?: string;
  title: string;
  sectionId: string;
  description: string;
  status: "active" | "inactive";
  startAt: string;
  endAt: string;
  discountId: string;
  images: File[];
  existingImages: string[];
  badge?: string;
  linkUrl?: string;
  ctaText?: string;
};

const EMPTY_FORM: CampaignForm = {
  title: "",
  sectionId: "sec-feature-banner",
  description: "",
  status: "active",
  startAt: new Date().toISOString().slice(0, 16),
  endAt: "",
  discountId: "",
  images: [],
  existingImages: [],
  badge: "Featured Edit",
  linkUrl: "/products",
  ctaText: "SHOP NOW",
};

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [slotFilter, setSlotFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
  const [previewBanner, setPreviewBanner] = useState<Campaign | null>(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState<CampaignForm>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [imageUrlInput, setImageUrlInput] = useState("");

  const { discounts } = useDiscounts();
  const { sections } = useSections();

  const [deleteModal, setDeleteModal] = useState<{ open: boolean; campaign: Campaign | null }>({
    open: false,
    campaign: null,
  });

  const loadCampaigns = useCallback(async () => {
    setLoading(true);
    let apiData: Campaign[] = [];
    try {
      const data = await apiRequest<Campaign[]>("/campaigns");
      if (Array.isArray(data) && data.length > 0) {
        apiData = data;
      }
    } catch {
      apiData = [];
    }

    const storedData = getStoredCampaigns();
    const map = new Map<string, Campaign>();
    for (const c of storedData) map.set(c.id, c);
    for (const c of apiData) map.set(c.id, c);

    setCampaigns(Array.from(map.values()).map(normalizeCampaignToEnglish));
    setLoading(false);
  }, []);

  useEffect(() => {
    loadCampaigns();
  }, [loadCampaigns]);

  function openAdd(defaultSlot?: string) {
    setForm({
      ...EMPTY_FORM,
      sectionId: defaultSlot || (sections[0]?.id || "sec-hero"),
      ctaText: defaultSlot === "sec-hero" ? "EXPLORE COLLECTION" : "SHOP NOW",
      linkUrl: "/products",
    });
    setImageUrlInput("");
    setModalOpen(true);
  }

  function openEdit(c: Campaign) {
    setForm({
      id: c.id,
      title: c.title,
      sectionId: c.sectionId || "sec-feature-banner",
      description: c.description ?? "",
      status: c.status,
      startAt: c.startAt ? c.startAt.slice(0, 16) : new Date().toISOString().slice(0, 16),
      endAt: c.endAt ? c.endAt.slice(0, 16) : "",
      discountId: c.discountId ?? "",
      images: [],
      existingImages: (c.images ?? []).flatMap((img) => img.images ?? []),
      badge: c.badge || "",
      linkUrl: c.linkUrl || "/products",
      ctaText: c.ctaText || "SHOP NOW",
    });
    setImageUrlInput("");
    setModalOpen(true);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    if (form.images.length === 0 && form.existingImages.length === 0) {
      toast.error("At least one campaign image is required.");
      setSaving(false);
      return;
    }

    // Convert file objects to Data URLs for instant preview & persistence
    const fileDataUrls: string[] = await Promise.all(
      form.images.map(
        (file) =>
          new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = () => resolve("");
            reader.readAsDataURL(file);
          })
      )
    );

    const validFileDataUrls = fileDataUrls.filter(Boolean);
    const combinedImages = [...form.existingImages, ...validFileDataUrls];

    const currentSection = sections.find((s) => s.id === form.sectionId) || {
      id: form.sectionId || "sec-feature-banner",
      title: "Feature Banner (Full-Width)",
      position: 1,
      page: "home",
    };

    const campaignId = form.id || `camp-${Date.now()}`;
    const newCampaign: Campaign = {
      id: campaignId,
      title: form.title,
      description: form.description,
      status: form.status,
      sectionId: form.sectionId || "sec-feature-banner",
      section: currentSection,
      hasDiscount: !!form.discountId,
      discountId: form.discountId || null,
      startAt: form.startAt ? new Date(form.startAt).toISOString() : new Date().toISOString(),
      endAt: form.endAt ? new Date(form.endAt).toISOString() : null,
      badge: form.badge || undefined,
      linkUrl: form.linkUrl || "/products",
      ctaText: form.ctaText || "SHOP NOW",
      images: [
        {
          id: `img-${Date.now()}`,
          images: combinedImages,
        },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // 1. Save to local storage store so it immediately shows up on the website hero slider
    saveCustomCampaign(newCampaign);

    // 2. Also attempt backend API if running
    try {
      const body = new FormData();
      body.append("title", form.title);
      body.append("sectionId", form.sectionId || "sec-hero");
      body.append("status", form.status);
      if (form.description) body.append("description", form.description);
      if (form.startAt) body.append("startAt", new Date(form.startAt).toISOString());
      if (form.endAt) body.append("endAt", new Date(form.endAt).toISOString());
      if (form.discountId) body.append("discountId", form.discountId);
      for (const file of form.images) {
        body.append("images", file);
      }

      if (form.id) {
        body.append("keepImages", JSON.stringify(form.existingImages));
        await apiRequest(`/campaigns/${form.id}`, { method: "PATCH", body });
      } else {
        await apiRequest("/campaigns", { method: "POST", body });
      }
    } catch {
      // Backend may be offline in demo mode; local save already succeeded
    }

    toast.success("Campaign saved successfully! It is now live in the Hero section.");
    setModalOpen(false);
    setSaving(false);
    await loadCampaigns();
  }

  async function toggleStatus(c: Campaign) {
    const newStatus = c.status === "active" ? "inactive" : "active";
    toggleStoredCampaignStatus(c.id);
    setCampaigns((prev) =>
      prev.map((item) => (item.id === c.id ? { ...item, status: newStatus } : item)),
    );
    try {
      await apiRequest(`/campaigns/${c.id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
    } catch {
      // Local status already updated
    }
  }

  async function confirmDelete() {
    if (!deleteModal.campaign) return;
    deleteStoredCampaign(deleteModal.campaign.id);
    setCampaigns((prev) => prev.filter((item) => item.id !== deleteModal.campaign?.id));
    try {
      await apiRequest(`/campaigns/${deleteModal.campaign.id}`, { method: "DELETE" });
    } catch {}
    setDeleteModal({ open: false, campaign: null });
    toast.success("Campaign removed.");
  }

  function handleReorder(campaignId: string, direction: "up" | "down") {
    const heroSlides = campaigns.filter(
      (c) => !c.sectionId || c.sectionId === "sec-hero" || c.id.startsWith("camp-hero-")
    );
    const currentIndex = heroSlides.findIndex((c) => c.id === campaignId);
    if (currentIndex === -1) return;

    const targetIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
    if (targetIndex < 0 || targetIndex >= heroSlides.length) return;

    const newHeroSlides = [...heroSlides];
    const [moved] = newHeroSlides.splice(currentIndex, 1);
    newHeroSlides.splice(targetIndex, 0, moved);

    const nonHero = campaigns.filter(
      (c) => !(!c.sectionId || c.sectionId === "sec-hero" || c.id.startsWith("camp-hero-"))
    );
    const updated = [...newHeroSlides, ...nonHero];

    setCampaigns(updated);
    saveStoredCampaigns(updated);
    toast.success(`Slide position moved ${direction === "up" ? "up" : "down"}`);
  }

  const selectedDiscount = form.discountId
    ? discounts.find((d) => d.id === form.discountId)
    : null;

  const filtered = campaigns.filter((c) => {
    const query = search.toLowerCase().trim();
    const matchesSearch =
      !query ||
      `${c.title} ${c.section?.title ?? ""} ${c.description ?? ""} ${c.ctaText ?? ""}`
        .toLowerCase()
        .includes(query);
    if (!matchesSearch) return false;

    if (statusFilter !== "all" && c.status !== statusFilter) return false;

    if (slotFilter === "all") return true;
    if (slotFilter === "sec-hero")
      return !c.sectionId || c.sectionId === "sec-hero" || c.id.startsWith("camp-hero-");
    if (slotFilter === "sec-feature-banner") return c.sectionId === "sec-feature-banner";
    if (slotFilter === "sec-split")
      return c.sectionId === "sec-split-1" || c.sectionId === "sec-split-2";
    return c.sectionId === slotFilter;
  });

  const heroSlides = campaigns.filter(
    (c) => !c.sectionId || c.sectionId === "sec-hero" || c.id.startsWith("camp-hero-")
  );
  const heroCount = heroSlides.length;
  const featureCount = campaigns.filter((c) => c.sectionId === "sec-feature-banner").length;
  const splitCount = campaigns.filter(
    (c) => c.sectionId === "sec-split-1" || c.sectionId === "sec-split-2"
  ).length;
  const activeCount = campaigns.filter((c) => c.status === "active").length;

  return (
    <>
      <PageHeader
        title="Hero Sliders & Campaigns"
        description="Curate and organize your boutique storefront hero sliders, editorial feature banners, and split promotion slots."
        action={
          <div className="flex flex-wrap items-center gap-2.5">
            <Link
              href="/"
              target="_blank"
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-2xs transition-all active:scale-95"
            >
              <LuExternalLink className="h-3.5 w-3.5 text-slate-500" />
              <span>View Storefront</span>
            </Link>
            <button
              onClick={() => openAdd("sec-hero")}
              type="button"
              className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 px-4 py-2 text-xs font-bold text-white shadow-xs transition-all active:scale-95 cursor-pointer"
            >
              <LuPlus className="h-3.5 w-3.5" />
              <span>Add Hero Slide</span>
            </button>
            <SaveButton onClick={() => openAdd()}>
              Add Campaign
            </SaveButton>
          </div>
        }
      />

      {/* Top Quick Status Overview Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
        <div className="bg-white border border-slate-200/90 rounded-xl p-4 shadow-2xs flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-violet-50 text-violet-700 flex items-center justify-center border border-violet-100">
              <LuSlidersHorizontal className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Hero Carousel</p>
              <p className="text-lg font-bold text-slate-900">{heroCount} Slides</p>
            </div>
          </div>
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Active
          </span>
        </div>

        <div className="bg-white border border-slate-200/90 rounded-xl p-4 shadow-2xs flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-rose-50 text-rose-700 flex items-center justify-center border border-rose-100">
              <LuSparkles className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Feature & Promo</p>
              <p className="text-lg font-bold text-slate-900">{featureCount + splitCount} Placements</p>
            </div>
          </div>
          <span className="text-xs font-mono text-slate-400">Editorial</span>
        </div>

        <div className="bg-white border border-slate-200/90 rounded-xl p-4 shadow-2xs flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center border border-blue-100">
              <LuLayers className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Total Campaigns</p>
              <p className="text-lg font-bold text-slate-900">{campaigns.length} Banners</p>
            </div>
          </div>
          <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
            {activeCount} live
          </span>
        </div>
      </div>

      <SettingsCard title="All Website Sliders & Banners" description="Manage order, headlines, links, and visibility of promotional banners across all pages.">
        {/* Placement Filter Tabs - Refined Segmented Control */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100/80 rounded-xl border border-slate-200/60">
            {[
              { id: "all", label: "All Banners", icon: LuLayers, count: campaigns.length },
              { id: "sec-hero", label: "Hero Sliders", icon: LuSlidersHorizontal, count: heroCount },
              { id: "sec-feature-banner", label: "Feature Banner", icon: LuSparkles, count: featureCount },
              { id: "sec-split", label: "Split Banners", icon: LuImage, count: splitCount },
            ].map((tab) => {
              const isActive = slotFilter === tab.id;
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setSlotFilter(tab.id)}
                  className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    isActive
                      ? "bg-white text-slate-900 shadow-xs border border-slate-200/80"
                      : "text-slate-600 hover:text-slate-900 hover:bg-white/50"
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? "text-violet-600" : "text-slate-400"}`} />
                  <span>{tab.label}</span>
                  <span
                    className={`px-1.5 py-0.5 rounded-full text-[10px] font-mono leading-none ${
                      isActive ? "bg-slate-900 text-white" : "bg-slate-200/80 text-slate-600"
                    }`}
                  >
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Status Filter Pills */}
          <div className="flex items-center gap-1 text-xs">
            <span className="text-slate-400 text-[11px] font-medium mr-1">Status:</span>
            {(["all", "active", "inactive"] as const).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setStatusFilter(s)}
                className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all capitalize cursor-pointer ${
                  statusFilter === s
                    ? "bg-slate-900 text-white shadow-2xs"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Toolbar: Counter & Refined Search */}
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-700">
              Showing {filtered.length} of {campaigns.length} banners
            </span>
            {slotFilter === "sec-hero" && (
              <span className="text-[11px] text-violet-700 bg-violet-50 border border-violet-200/60 px-2 py-0.5 rounded-md font-medium">
                Tip: Use ▲ ▼ to reorder slides
              </span>
            )}
          </div>

          <label className="relative flex h-10 w-full max-w-sm items-center rounded-lg border border-slate-200 bg-slate-50/50 hover:bg-white focus-within:bg-white focus-within:border-slate-400 focus-within:ring-2 focus-within:ring-slate-100 transition-all px-3">
            <LuSearch className="h-4 w-4 shrink-0 text-slate-400" />
            <input
              className="w-full bg-transparent px-2.5 text-xs font-medium text-slate-800 placeholder-slate-400 outline-none"
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by title, placement or link..."
              value={search}
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                <LuX className="h-3.5 w-3.5" />
              </button>
            )}
          </label>
        </div>

        {/* Modern Table */}
        <div className="overflow-x-auto rounded-xl border border-slate-200/90 shadow-2xs bg-white">
          <table className="w-full min-w-[760px] text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="px-4 py-3.5 w-14 text-center"># Order</th>
                <th className="px-4 py-3.5 w-40">Banner Preview</th>
                <th className="px-5 py-3.5 min-w-[220px]">Campaign Details</th>
                <th className="px-4 py-3.5 whitespace-nowrap">Placement Slot</th>
                <th className="px-4 py-3.5 min-w-[160px]">Button & Target</th>
                <th className="px-4 py-3.5 w-28">Status</th>
                <th className="px-4 py-3.5 w-28 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {loading ? (
                <tr>
                  <td className="px-6 py-12 text-center text-sm font-medium text-slate-400" colSpan={7}>
                    <div className="flex flex-col items-center justify-center gap-2">
                      <div className="h-6 w-6 border-2 border-slate-300 border-t-slate-800 rounded-full animate-spin" />
                      <span>Loading campaigns...</span>
                    </div>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td className="px-6 py-16 text-center" colSpan={7}>
                    <div className="max-w-sm mx-auto text-center space-y-2">
                      <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
                        <LuImage className="w-6 h-6" />
                      </div>
                      <p className="text-sm font-bold text-slate-800">No matching banners found</p>
                      <p className="text-xs text-slate-500">
                        Try adjusting your search query or reset the placement filter.
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          setSearch("");
                          setSlotFilter("all");
                          setStatusFilter("all");
                        }}
                        className="mt-2 text-xs font-semibold text-blue-600 hover:text-blue-800 underline cursor-pointer"
                      >
                        Reset all filters
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map((c) => {
                  const rawImg = c.images?.[0]?.images?.[0];
                  const isHero = !c.sectionId || c.sectionId === "sec-hero" || c.id.startsWith("camp-hero-");
                  const heroIndex = isHero ? heroSlides.findIndex((s) => s.id === c.id) : -1;

                  const isFeature = c.sectionId === "sec-feature-banner";
                  const isSplit = c.sectionId === "sec-split-1" || c.sectionId === "sec-split-2";

                  const placementBadge = isHero ? (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-violet-50 text-violet-700 border border-violet-200/80 whitespace-nowrap">
                      <span className="w-1.5 h-1.5 rounded-full bg-violet-500" />
                      Hero Slider Banner
                    </span>
                  ) : isFeature ? (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200/80 whitespace-nowrap">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                      Feature Banner (Full)
                    </span>
                  ) : isSplit ? (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-sky-50 text-sky-700 border border-sky-200/80 whitespace-nowrap">
                      <span className="w-1.5 h-1.5 rounded-full bg-sky-500" />
                      {c.sectionId === "sec-split-1" ? "Split Left" : "Split Right"}
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200 whitespace-nowrap">
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                      {c.section?.title || c.sectionId || "General Banner"}
                    </span>
                  );

                  return (
                    <tr
                      key={c.id}
                      className="hover:bg-slate-50/70 transition-colors group"
                    >
                      {/* 1. Order / Reorder */}
                      <td className="px-4 py-4 text-center">
                        {isHero ? (
                          <div className="flex flex-col items-center justify-center gap-1">
                            <span className="w-7 h-7 rounded-lg bg-slate-900 text-white font-mono text-xs font-bold flex items-center justify-center shadow-2xs">
                              #{heroIndex + 1}
                            </span>
                            <div className="flex items-center gap-0.5 opacity-80 group-hover:opacity-100 transition-opacity">
                              <button
                                type="button"
                                disabled={heroIndex <= 0}
                                onClick={() => handleReorder(c.id, "up")}
                                title="Move slide up"
                                className="p-1 rounded text-slate-400 hover:text-slate-900 hover:bg-slate-200 disabled:opacity-20 disabled:hover:bg-transparent cursor-pointer disabled:cursor-not-allowed"
                              >
                                <LuArrowUp className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                disabled={heroIndex >= heroSlides.length - 1}
                                onClick={() => handleReorder(c.id, "down")}
                                title="Move slide down"
                                className="p-1 rounded text-slate-400 hover:text-slate-900 hover:bg-slate-200 disabled:opacity-20 disabled:hover:bg-transparent cursor-pointer disabled:cursor-not-allowed"
                              >
                                <LuArrowDown className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ) : (
                          <span className="text-xs font-mono text-slate-400">—</span>
                        )}
                      </td>

                      {/* 2. Banner Preview (16:9 Widescreen aspect) */}
                      <td className="px-4 py-4">
                        <div
                          onClick={() => setPreviewBanner(c)}
                          className="relative w-32 aspect-[16/9] rounded-lg overflow-hidden border border-slate-200 bg-slate-950 group/img cursor-pointer shadow-2xs transition-all hover:border-slate-400"
                        >
                          {rawImg ? (
                            <img
                              src={rawImg}
                              alt={c.title}
                              className="w-full h-full object-cover group-hover/img:scale-105 transition-transform duration-300"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-600 bg-slate-900">
                              <LuImage className="w-6 h-6" />
                            </div>
                          )}
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center gap-1.5 text-white">
                            <LuEye className="w-4 h-4" />
                            <span className="text-[10px] font-bold tracking-wider uppercase">Preview</span>
                          </div>
                        </div>
                      </td>

                      {/* 3. Campaign Narrative Details */}
                      <td className="px-5 py-4">
                        <div className="space-y-1 max-w-sm">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p
                              onClick={() => openEdit(c)}
                              className="font-bold text-slate-900 text-sm hover:text-blue-600 cursor-pointer transition-colors"
                            >
                              {c.title}
                            </p>
                            {c.badge && (
                              <span className="text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-200/80">
                                {c.badge}
                              </span>
                            )}
                          </div>
                          {c.description && (
                            <p className="text-xs text-slate-500 line-clamp-1 leading-relaxed">
                              {c.description}
                            </p>
                          )}
                          <p className="text-[10px] font-mono text-slate-400">
                            ID: {c.id}
                          </p>
                        </div>
                      </td>

                      {/* 4. Placement Slot Badge */}
                      <td className="px-4 py-4">
                        {placementBadge}
                      </td>

                      {/* 5. Button & Target Link */}
                      <td className="px-4 py-4">
                        <div className="space-y-1 max-w-[190px]">
                          <span className="inline-flex items-center px-2 py-0.5 rounded bg-slate-900 text-white font-mono text-[10px] font-bold tracking-wider uppercase shadow-2xs">
                            {c.ctaText || "SHOP NOW"}
                          </span>
                          <a
                            href={c.linkUrl || "/products"}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-[11px] font-mono text-slate-500 hover:text-blue-600 transition-colors truncate"
                            title={c.linkUrl || "/products"}
                          >
                            <span className="truncate">{c.linkUrl || "/products"}</span>
                            <LuExternalLink className="w-3 h-3 shrink-0 opacity-70" />
                          </a>
                        </div>
                      </td>

                      {/* 6. Status Column */}
                      <td className="px-4 py-4">
                        <div className="flex flex-col gap-1.5">
                          <StatusToggle
                            active={c.status === "active"}
                            onChange={() => toggleStatus(c)}
                          />
                          <span className="text-[11px] font-semibold text-slate-600">
                            {c.status === "active" ? (
                              <span className="inline-flex items-center gap-1 text-emerald-700 font-bold">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                Live
                              </span>
                            ) : (
                              <span className="text-slate-400">Hidden</span>
                            )}
                          </span>
                        </div>
                      </td>

                      {/* 7. Actions Column */}
                      <td className="px-4 py-4 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => setPreviewBanner(c)}
                            title="Preview slide"
                            className="grid h-8 w-8 place-items-center rounded-lg border border-slate-200 text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 cursor-pointer shadow-2xs"
                          >
                            <LuEye className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => openEdit(c)}
                            title="Edit campaign"
                            className="grid h-8 w-8 place-items-center rounded-lg border border-slate-200 text-slate-600 transition hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 cursor-pointer shadow-2xs"
                          >
                            <LuPencil className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteModal({ open: true, campaign: c })}
                            title="Delete campaign"
                            className="grid h-8 w-8 place-items-center rounded-lg bg-red-50 text-red-600 transition hover:bg-red-100 hover:border-red-200 cursor-pointer"
                          >
                            <LuTrash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </SettingsCard>

      {/* Live Storefront Slide Preview Lightbox Modal */}
      {previewBanner && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 modal-backdrop"
          onClick={() => setPreviewBanner(null)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="relative w-full max-w-4xl bg-slate-950 rounded-2xl overflow-hidden border border-white/10 shadow-2xl animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-slate-900/80">
              <div className="flex items-center gap-3">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <h3 className="text-white font-bold text-sm">Storefront Banner Live Preview</h3>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-white/10 text-white/80 font-mono">
                  {previewBanner.section?.title || previewBanner.sectionId}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setPreviewBanner(null)}
                className="h-8 w-8 rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <LuX className="h-4 w-4" />
              </button>
            </div>

            {/* Banner Simulation */}
            <div className="relative aspect-[16/7] sm:aspect-[21/9] w-full overflow-hidden bg-slate-900">
              <img
                src={previewBanner.images?.[0]?.images?.[0] || "/images/sliders/arch-wine.webp"}
                alt={previewBanner.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/55 to-transparent" />

              {/* Banner content */}
              <div className="absolute inset-0 flex flex-col justify-center px-8 sm:px-14 max-w-xl text-white space-y-3">
                {previewBanner.badge && (
                  <span className="inline-block self-start text-[10px] font-bold tracking-[0.2em] uppercase text-rose-300 bg-rose-950/70 border border-rose-800/80 px-2.5 py-0.5 rounded-full">
                    {previewBanner.badge}
                  </span>
                )}
                <h2 className="text-xl sm:text-3xl font-serif font-bold text-white leading-tight drop-shadow-md">
                  {previewBanner.title}
                </h2>
                {previewBanner.description && (
                  <p className="text-xs sm:text-sm text-white/85 line-clamp-2 leading-relaxed">
                    {previewBanner.description}
                  </p>
                )}
                <div className="pt-1">
                  <span className="inline-flex items-center gap-2 px-5 py-2.5 bg-rose-600 text-white text-xs font-bold tracking-wider uppercase shadow-md">
                    <span>{previewBanner.ctaText || "SHOP NOW"}</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-4 bg-slate-900/95 border-t border-white/10">
              <div className="text-xs text-slate-400">
                Target Link: <span className="text-slate-200 font-mono">{previewBanner.linkUrl || "/products"}</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const b = previewBanner;
                    setPreviewBanner(null);
                    openEdit(b);
                  }}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-colors cursor-pointer"
                >
                  <LuPencil className="h-3.5 w-3.5" />
                  <span>Edit Campaign</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Campaign Modal */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-slate-950/50 px-4 py-6 modal-backdrop"
          role="dialog"
          aria-modal="true"
          aria-labelledby="campaign-modal-title"
        >
          <form
            className="modal-panel flex w-full max-w-2xl flex-col rounded-xl border border-slate-200 bg-white shadow-2xl overflow-hidden min-h-[480px] max-h-[calc(100vh-3rem)]"
            onSubmit={handleSubmit}
          >
            <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-6 pt-6 pb-5 shrink-0">
              <div>
                <h2 className="text-2xl font-black" id="campaign-modal-title">
                  {form.id ? "Edit Campaign" : "Add Campaign"}
                </h2>
                <p className="mt-1 font-medium text-slate-600">
                  Fill in the details for this campaign.
                </p>
              </div>
              <button
                className="grid h-10 w-10 place-items-center rounded-lg border border-slate-300 text-slate-600"
                disabled={saving}
                onClick={() => setModalOpen(false)}
                type="button"
              >
                <AdminIcon className="h-5 w-5" name="x" />
              </button>
            </div>

            <div className="flex-1 min-h-0 modal-body overflow-y-auto px-6 py-5">
            <div className="space-y-4">
              {/* Banner Placement / Slot + Status */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <FieldLabel required>Banner Placement / Slot</FieldLabel>
                  <select
                    className="h-12 w-full rounded-md border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-800 outline-none transition focus:border-blue-500"
                    onChange={(e) => setForm((p) => ({ ...p, sectionId: e.target.value }))}
                    required
                    value={form.sectionId}
                  >
                    <option value="sec-hero">🖼️ Hero Slider Banner (Top Carousel Slide)</option>
                    <option value="sec-feature-banner">🌟 Feature Banner (Full-Width Editorial)</option>
                    <option value="sec-split-1">✨ Split Banner 1 - Left (e.g. Silver Statement)</option>
                    <option value="sec-split-2">✨ Split Banner 2 - Right (e.g. Festive Edit)</option>
                    <option value="sec-trend">🔥 Trending / Collection Banner</option>
                    {sections
                      .filter(
                        (s) =>
                          !["sec-feature-banner", "sec-split-1", "sec-split-2", "sec-hero", "sec-trend"].includes(
                            s.id
                          )
                      )
                      .map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.title}
                        </option>
                      ))}
                  </select>
                  <p className="mt-1 text-[11px] text-slate-500">
                    {form.sectionId === "sec-hero"
                      ? "🖼️ Appears in the Hero Slider at the top of the homepage."
                      : "Auto-replaces the slot with this campaign. If inactive, default image design shows."}
                  </p>
                </div>
                <div className="flex items-end gap-3 pb-1">
                  <div className="flex-1">
                    <FieldLabel>Status</FieldLabel>
                    <div className="flex h-12 items-center">
                      <StatusToggle
                        active={form.status === "active"}
                        onChange={(v) =>
                          setForm((p) => ({ ...p, status: v ? "active" : "inactive" }))
                        }
                      />
                      <span className="ml-3 text-sm font-medium text-slate-600">
                        {form.status === "active" ? "Active (Visible on Storefront)" : "Inactive (Hidden)"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Campaign Title */}
              <div>
                <FieldLabel required>Slide Headline / Title</FieldLabel>
                <Input
                  onChange={(v) => setForm((p) => ({ ...p, title: v }))}
                  placeholder="e.g. Autumn & Winter Haute Couture"
                  required
                  value={form.title}
                />
              </div>

              {/* Description */}
              <div>
                <FieldLabel>Description / Subtitle</FieldLabel>
                <Textarea
                  onChange={(v) => setForm((p) => ({ ...p, description: v }))}
                  placeholder="e.g. Browse winter essentials & timeless boutique edits…"
                  rows={2}
                  value={form.description}
                />
              </div>

              {/* Button Text & Target Link */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <FieldLabel>Button Text</FieldLabel>
                  <Input
                    onChange={(v) => setForm((p) => ({ ...p, ctaText: v }))}
                    placeholder="e.g. SHOP NOW"
                    value={form.ctaText || ""}
                  />
                </div>
                <div>
                  <FieldLabel>Button Link URL</FieldLabel>
                  <Input
                    onChange={(v) => setForm((p) => ({ ...p, linkUrl: v }))}
                    placeholder="e.g. /products?category=Party%20Gowns"
                    value={form.linkUrl || ""}
                  />
                </div>
              </div>

              {/* Images */}
              <div>
                <FieldLabel>Campaign Images (Upload File or Enter URL)</FieldLabel>
                <div className="flex flex-col sm:flex-row gap-2 mb-2">
                  <input
                    type="url"
                    placeholder="Paste image URL (e.g. https://...)"
                    value={imageUrlInput}
                    onChange={(e) => setImageUrlInput(e.target.value)}
                    className="flex-1 h-11 rounded-lg border border-slate-200 px-3 text-sm font-medium outline-none "
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (imageUrlInput.trim()) {
                        setForm((p) => ({
                          ...p,
                          existingImages: [...p.existingImages, imageUrlInput.trim()],
                        }));
                        setImageUrlInput("");
                      }
                    }}
                    className="h-11 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold whitespace-nowrap cursor-pointer transition-colors"
                  >
                    + Add Image URL
                  </button>
                </div>

                <div className="mb-2">
                  <span className="text-xs text-slate-400 font-medium mr-2">Or quick select curated boutique slides:</span>
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {[
                      { name: "Bottom Split Gowns", url: "/images/campaign/bottom-campain (1).webp" },
                      { name: "Bottom Split Cord Sets", url: "/images/campaign/bottom-campain (2).webp" },
                      { name: "Arch Royal Blue", url: "/images/sliders/arch-blue.webp" },
                      { name: "Arch Imperial Maroon", url: "/images/sliders/arch-maroon.webp" },
                      { name: "Arch Regal Violet (Pleated Rose)", url: "/images/sliders/arch-purple-2.webp" },
                      { name: "Arch Regal Purple", url: "/images/sliders/arch-purple.webp" },
                      { name: "Arch Burgundy Wine", url: "/images/sliders/arch-wine.webp" },
                      { name: "Bangkok Atelier Edit (m-7)", url: "/images/campaign/m-7.webp" },
                      { name: "Bangkok Designer Edit (m-2)", url: "/images/campaign/m-2.webp" },
                      { name: "Festive & Party Wear (m-3)", url: "/images/campaign/m-3.webp" },
                      { name: "Autumn Haute Couture", url: "/images/campaign/minit-2.webp" },
                      { name: "Bangkok Co-ord Sets", url: "/images/campaign/minit-5.webp" },
                      { name: "Modest Luxury Abayas", url: "/images/campaign/minit-6.webp" },
                      { name: "Winter Velvet Outerwear", url: "/images/campaign/minit-7.webp" },
                      { name: "Feature Banner Editorial", url: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=2400&auto=format&fit=crop&q=95" },
                      { name: "Silver Statement Edit", url: "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=1600&auto=format&fit=crop&q=95" },
                      { name: "Festive Editorial", url: "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=1600&auto=format&fit=crop&q=95" },
                    ].map((preset, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          setForm((p) => ({
                            ...p,
                            existingImages: [...p.existingImages, preset.url],
                          }));
                        }}
                        className="text-[11px] px-2 py-0.5 rounded-md bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 text-slate-600 border border-slate-200 cursor-pointer"
                      >
                        + {preset.name}
                      </button>
                    ))}
                  </div>
                </div>

                <input
                  accept="image/*"
                  className="block w-full rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium"
                  multiple
                  onChange={(e) => {
                    const files = e.target.files ? Array.from(e.target.files) : [];
                    setForm((p) => ({ ...p, images: [...p.images, ...files] }));
                  }}
                  type="file"
                />

                <div className="mt-3 grid grid-cols-4 gap-3">
                  {form.existingImages.map((url, i) => (
                    <div className="relative group" key={`e-${i}`}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        alt=""
                        className="h-20 w-full rounded-lg border border-slate-200 object-cover"
                        src={url}
                      />
                      <button
                        className="absolute -right-2 -top-2 grid h-6 w-6 place-items-center rounded-full bg-red-500 text-xs text-white shadow-xs"
                        onClick={() =>
                          setForm((p) => ({
                            ...p,
                            existingImages: p.existingImages.filter((_, j) => j !== i),
                          }))
                        }
                        type="button"
                      >
                        <AdminIcon className="h-3 w-3" name="x" />
                      </button>
                    </div>
                  ))}
                  {form.images.map((file, i) => (
                    <div className="relative group" key={`n-${i}`}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        alt=""
                        className="h-20 w-full rounded-lg border border-slate-200 object-cover"
                        src={URL.createObjectURL(file)}
                      />
                      <button
                        className="absolute -right-2 -top-2 grid h-6 w-6 place-items-center rounded-full bg-red-500 text-xs text-white shadow-xs"
                        onClick={() =>
                          setForm((p) => ({
                            ...p,
                            images: p.images.filter((_, j) => j !== i),
                          }))
                        }
                        type="button"
                      >
                        <AdminIcon className="h-3 w-3" name="x" />
                      </button>
                    </div>
                  ))}
                </div>
                {form.images.length === 0 && form.existingImages.length === 0 && (
                  <p className="mt-2 text-xs font-medium text-slate-400">
                    At least one image is required.
                  </p>
                )}
              </div>

              {/* Dates */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <FieldLabel>Start At</FieldLabel>
                  <Input
                    onChange={(v) => setForm((p) => ({ ...p, startAt: v }))}
                    type="datetime-local"
                    value={form.startAt}
                  />
                </div>
                <div>
                  <FieldLabel>End At</FieldLabel>
                  <Input
                    onChange={(v) => setForm((p) => ({ ...p, endAt: v }))}
                    type="datetime-local"
                    value={form.endAt}
                  />
                </div>
              </div>

              {/* Select Offer or Discount */}
              <div>
                <FieldLabel>Select Offer or Discount</FieldLabel>
                <select
                  className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-800 outline-none transition   "
                  onChange={(e) => setForm((p) => ({ ...p, discountId: e.target.value }))}
                  value={form.discountId}
                >
                  <option value="">No discount</option>
                  {discounts.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Selected Discount Details */}
              {selectedDiscount && (
                <div className="overflow-x-auto rounded-xl border border-slate-200">
                  <table className="w-full text-left">
                    <thead className="bg-slate-50">
                      <tr>
                        {["Offer or Discount Name", "Start At", "End At", "Action"].map((h) => (
                          <th className="px-4 py-3 text-sm font-black text-slate-700" key={h}>
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="px-4 py-3 text-sm font-medium text-slate-800">
                          {selectedDiscount.name}
                        </td>
                        <td className="px-4 py-3 text-sm font-medium text-slate-500">
                          {selectedDiscount.startDate ?? "-"}
                        </td>
                        <td className="px-4 py-3 text-sm font-medium text-slate-500">
                          {selectedDiscount.endDate ?? "-"}
                        </td>
                        <td className="px-4 py-3">
                          <button
                            className="text-sm font-black text-red-600 hover:text-red-800"
                            onClick={() => setForm((p) => ({ ...p, discountId: "" }))}
                            type="button"
                          >
                            Remove
                          </button>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}

            </div>
            </div>

              <div className="flex shrink-0 justify-end gap-3 border-t border-slate-100 bg-white px-6 py-5">
                <button
                  className="h-12 rounded-md border border-slate-300 bg-white px-5 font-black text-slate-700 hover:bg-slate-50 transition"
                  disabled={saving}
                  onClick={() => setModalOpen(false)}
                  type="button"
                >
                  Cancel
                </button>
                <button
                  className="inline-flex h-12 items-center gap-1.5 rounded-md px-5 text-sm font-semibold text-white disabled:opacity-60 shadow-xs transition bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 cursor-pointer disabled:cursor-not-allowed"
                  disabled={saving}
                  type="submit"
                >
                  <AdminIcon className="h-5 w-5" name={form.id ? "check" : "plus"} />
                  {saving ? "Saving..." : form.id ? "Update Campaign" : "Add Campaign"}
                </button>
            </div>
          </form>
        </div>
      )}

      <ConfirmModal
        cancelText="No"
        confirmText="Yes, Delete"
        isDestructive
        isOpen={deleteModal.open}
        message={`Are you sure you want to delete "${deleteModal.campaign?.title}"? This action cannot be undone.`}
        onClose={() => setDeleteModal({ open: false, campaign: null })}
        onConfirm={confirmDelete}
        title="Delete Campaign"
      />
    </>
  );
}
