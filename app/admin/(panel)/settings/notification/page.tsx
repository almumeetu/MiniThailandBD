"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { FaFacebook, FaInstagram, FaWhatsapp, FaYoutube } from "react-icons/fa6";
import { FiPlus, FiTrash2, FiRotateCcw, FiExternalLink, FiMapPin, FiEye } from "react-icons/fi";
import { AdminIcon, PageHeader } from "../../../_components/admin-shell";
import {
  SettingsCard,
  FieldLabel,
  Input,
  Textarea,
  SaveButton,
  StatusToggle,
} from "../_components/settings-ui";
import {
  DEFAULT_NOTIFICATION_SETTINGS,
  getStoredNotificationSettings,
  saveStoredNotificationSettings,
  resetStoredNotificationSettings,
  type NotificationSettings,
  type BranchOutlet,
} from "../../../../../lib/notification-store";
import { useSettingsSaving } from "../../../_hooks/use-settings";

export default function NotificationSettingsPage() {
  const [settings, setSettings] = useState<NotificationSettings>(DEFAULT_NOTIFICATION_SETTINGS);
  const [newSlideText, setNewSlideText] = useState("");
  const [newBranch, setNewBranch] = useState<BranchOutlet>({
    id: "",
    name: "",
    shopNo: "",
    level: "",
    location: "",
    city: "Dhaka, Bangladesh",
  });
  const [isAddingBranch, setIsAddingBranch] = useState(false);

  const { saving: apiSaving, saveSettings: saveToApi } = useSettingsSaving();
  const [localSaving, setLocalSaving] = useState(false);

  useEffect(() => {
    setSettings(getStoredNotificationSettings());
  }, []);

  // ── Slides Helpers ────────────────────────────────────────────────────────
  const handleAddSlide = () => {
    if (!newSlideText.trim()) {
      toast.error("Please enter notification announcement text");
      return;
    }
    setSettings((prev) => ({
      ...prev,
      slides: [...prev.slides, newSlideText.trim()],
    }));
    setNewSlideText("");
    toast.success("Notification slide added");
  };

  const handleRemoveSlide = (index: number) => {
    if (settings.slides.length <= 1) {
      toast.error("At least one notification slide is required");
      return;
    }
    setSettings((prev) => ({
      ...prev,
      slides: prev.slides.filter((_, i) => i !== index),
    }));
  };

  const handleUpdateSlide = (index: number, text: string) => {
    setSettings((prev) => ({
      ...prev,
      slides: prev.slides.map((s, i) => (i === index ? text : s)),
    }));
  };

  // ── Branches Helpers ──────────────────────────────────────────────────────
  const handleAddBranch = () => {
    if (!newBranch.name.trim() || !newBranch.shopNo.trim()) {
      toast.error("Branch name and shop number are required");
      return;
    }
    const branchWithId: BranchOutlet = {
      ...newBranch,
      id: `branch-${Date.now()}`,
    };
    setSettings((prev) => ({
      ...prev,
      branches: [...prev.branches, branchWithId],
    }));
    setNewBranch({
      id: "",
      name: "",
      shopNo: "",
      level: "",
      location: "",
      city: "Dhaka, Bangladesh",
    });
    setIsAddingBranch(false);
    toast.success("Branch outlet added");
  };

  const handleRemoveBranch = (id: string) => {
    setSettings((prev) => ({
      ...prev,
      branches: prev.branches.filter((b) => b.id !== id),
    }));
  };

  // ── Reset to Real Facebook Defaults ───────────────────────────────────────
  const handleResetToRealFacebook = () => {
    const defaults = resetStoredNotificationSettings();
    setSettings(defaults);
    toast.info("Reset to official Facebook page content & numbers");
  };

  // ── Save All ──────────────────────────────────────────────────────────────
  const handleSave = async () => {
    setLocalSaving(true);
    try {
      // 1. Save locally to instant reactive store
      saveStoredNotificationSettings(settings);

      // 2. Sync phone, whatsapp and social media links with backend /settings API
      try {
        await saveToApi(
          "/settings",
          {
            contactNumber: {
              entries: [
                { title: "Hotline & WhatsApp", value: settings.hotlinePhone },
                { title: "Customer Care", value: settings.hotlineShort },
              ],
            },
            socialContact: {
              whatsapp: settings.whatsappNumber,
              facebook: settings.facebookUrl,
              instagram: settings.instagramUrl,
              youtube: settings.youtubeUrl,
            },
            branchAddress: settings.branches
              .map((b) => `${b.name} (${b.shopNo}, ${b.level}, ${b.location})`)
              .join(" | "),
          }
        );
      } catch {
        // Continue even if backend is offline
      }

      toast.success("Notification and real contact settings saved successfully!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to save settings");
    } finally {
      setLocalSaving(false);
    }
  };

  return (
    <div className="space-y-6 pb-16">
      <PageHeader
        title="Notification & Announcement Settings"
        description="Manage top notification ticker, store notices, real Facebook metrics & physical shop branches."
        action={
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleResetToRealFacebook}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-xs hover:bg-slate-50 transition"
              title="Reset to official Facebook page data"
            >
              <FiRotateCcw className="h-3.5 w-3.5" />
              <span>Facebook Defaults</span>
            </button>
            <SaveButton onClick={handleSave} saving={localSaving || apiSaving}>
              Save Notification Settings
            </SaveButton>
          </div>
        }
      />

      {/* ── Live Preview Banner ── */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-slate-900 text-white shadow-md">
        <div className="bg-[#14293a] px-4 py-2 border-b border-white/10 flex flex-wrap items-center justify-between text-xs text-slate-300 gap-2">
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-semibold text-emerald-400 uppercase tracking-wider text-[11px]">
              Live Storefront Top Bar Preview
            </span>
          </div>
          <div className="flex items-center gap-3 text-[11px]">
            <span>Hotline: <strong className="text-white">{settings.hotlinePhone}</strong></span>
            <span>•</span>
            <span className="text-rose-300 font-bold">{settings.followerBadge}</span>
            <span>•</span>
            <span className="text-amber-300 font-bold">{settings.reelViewsBadge}</span>
          </div>
        </div>
        <div className="p-4 bg-gradient-to-r from-[#17263c] to-[#0f172a] text-center">
          <p className="text-xs sm:text-sm font-medium text-slate-100 flex items-center justify-center gap-2">
            <span>📢</span>
            <span>{settings.slides[0] || "Mini Thailand Official Announcement"}</span>
          </p>
        </div>
      </div>

      {/* ── Top Bar Announcement Ticker Controls ── */}
      <SettingsCard title="Top Notification Announcement Bar">
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <p className="text-sm font-black text-slate-800">Enable Notification Bar</p>
              <p className="text-xs font-medium text-slate-500">
                Display the top rotating announcement bar across all storefront pages.
              </p>
            </div>
            <StatusToggle
              active={settings.enabled}
              onChange={(val) => setSettings((p) => ({ ...p, enabled: val }))}
            />
          </div>

          {/* Timing Controls */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <FieldLabel>Slide Duration / Autoplay Delay (ms)</FieldLabel>
              <Input
                type="number"
                value={settings.autoplayDelay}
                onChange={(val) => setSettings((p) => ({ ...p, autoplayDelay: Number(val) || 3500 }))}
                placeholder="3500"
              />
              <p className="mt-1 text-[11px] text-slate-400">Time each message stays visible (default: 3500ms)</p>
            </div>
            <div>
              <FieldLabel>Transition Speed (ms)</FieldLabel>
              <Input
                type="number"
                value={settings.speed}
                onChange={(val) => setSettings((p) => ({ ...p, speed: Number(val) || 600 }))}
                placeholder="600"
              />
              <p className="mt-1 text-[11px] text-slate-400">Slide transition animation duration (default: 600ms)</p>
            </div>
          </div>

          {/* Slides List */}
          <div>
            <FieldLabel required>Rotating Notification Messages ({settings.slides.length})</FieldLabel>
            <p className="text-xs text-slate-500 mb-3">
              These announcement messages rotate continuously at the very top of the website.
            </p>

            <div className="space-y-2.5">
              {settings.slides.map((slide, idx) => (
                <div key={idx} className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50/60 p-2">
                  <span className="grid h-7 w-7 shrink-0 place-items-center rounded bg-white text-xs font-black text-slate-600 border border-slate-200">
                    {idx + 1}
                  </span>
                  <input
                    type="text"
                    value={slide}
                    onChange={(e) => handleUpdateSlide(idx, e.target.value)}
                    className="flex-1 bg-transparent px-2 py-1 text-xs sm:text-sm font-medium text-slate-800 focus:outline-hidden"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveSlide(idx)}
                    className="rounded p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition"
                    title="Remove slide"
                  >
                    <FiTrash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>

            {/* Add New Slide Form */}
            <div className="mt-3 flex items-center gap-2">
              <input
                type="text"
                placeholder="Type new notification announcement message..."
                value={newSlideText}
                onChange={(e) => setNewSlideText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddSlide();
                  }
                }}
                className="flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:border-rose-500 focus:outline-hidden"
              />
              <button
                type="button"
                onClick={handleAddSlide}
                className="inline-flex items-center gap-1.5 rounded-lg bg-rose-600 px-4 py-2 text-xs font-bold text-white hover:bg-rose-700 transition"
              >
                <FiPlus className="h-4 w-4" />
                <span>Add Message</span>
              </button>
            </div>
          </div>
        </div>
      </SettingsCard>

      {/* ── Official Contact & WhatsApp Numbers (Real Content) ── */}
      <SettingsCard title="Facebook Official Contact & Social Numbers">
        <div className="space-y-5">
          <p className="text-xs text-slate-500">
            Real contact numbers taken directly from Mini Thailand&apos;s verified Facebook page.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <FieldLabel required>Hotline Phone Number (Display)</FieldLabel>
              <Input
                value={settings.hotlinePhone}
                onChange={(val) => setSettings((p) => ({ ...p, hotlinePhone: val }))}
                placeholder="+880 1706-126663"
              />
              <p className="mt-1 text-[11px] text-slate-400">Formatted number displayed on header &amp; badges</p>
            </div>

            <div>
              <FieldLabel required>Hotline Short / Direct Dial</FieldLabel>
              <Input
                value={settings.hotlineShort}
                onChange={(val) => setSettings((p) => ({ ...p, hotlineShort: val }))}
                placeholder="01706126663"
              />
              <p className="mt-1 text-[11px] text-slate-400">Raw dialable phone number for tel: links</p>
            </div>

            <div>
              <FieldLabel required>WhatsApp Order Number (International)</FieldLabel>
              <div className="flex items-center gap-2">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-emerald-500 text-white">
                  <FaWhatsapp className="h-5 w-5" />
                </span>
                <div className="flex-1">
                  <Input
                    value={settings.whatsappNumber}
                    onChange={(val) => setSettings((p) => ({ ...p, whatsappNumber: val }))}
                    placeholder="8801706126663"
                  />
                </div>
              </div>
              <p className="mt-1 text-[11px] text-slate-400">Without leading + or zeroes (e.g. 8801706126663)</p>
            </div>

            <div>
              <FieldLabel>Facebook Follower Badge</FieldLabel>
              <Input
                value={settings.followerBadge}
                onChange={(val) => setSettings((p) => ({ ...p, followerBadge: val }))}
                placeholder="534K followers"
              />
              <p className="mt-1 text-[11px] text-slate-400">Shown in notification bars &amp; social highlights</p>
            </div>

            <div>
              <FieldLabel>Reel Views Badge</FieldLabel>
              <Input
                value={settings.reelViewsBadge}
                onChange={(val) => setSettings((p) => ({ ...p, reelViewsBadge: val }))}
                placeholder="282M reel views"
              />
              <p className="mt-1 text-[11px] text-slate-400">Highlighted across storefront banners</p>
            </div>

            <div>
              <FieldLabel>Official Website URL</FieldLabel>
              <Input
                value={settings.websiteUrl}
                onChange={(val) => setSettings((p) => ({ ...p, websiteUrl: val }))}
                placeholder="http://minithailandbd.com"
              />
            </div>
          </div>

          <div className="border-t border-slate-100 pt-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <FieldLabel>Facebook Page</FieldLabel>
              <div className="flex items-center gap-2">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-[#1877f2] text-white">
                  <FaFacebook className="h-4 w-4" />
                </span>
                <input
                  type="text"
                  value={settings.facebookUrl}
                  onChange={(e) => setSettings((p) => ({ ...p, facebookUrl: e.target.value }))}
                  className="flex-1 rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs text-slate-800"
                />
              </div>
            </div>

            <div>
              <FieldLabel>Instagram Profile</FieldLabel>
              <div className="flex items-center gap-2">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-gradient-to-br from-[#833ab4] via-[#fd1d1d] to-[#fcb045] text-white">
                  <FaInstagram className="h-4 w-4" />
                </span>
                <input
                  type="text"
                  value={settings.instagramUrl}
                  onChange={(e) => setSettings((p) => ({ ...p, instagramUrl: e.target.value }))}
                  className="flex-1 rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs text-slate-800"
                />
              </div>
            </div>

            <div>
              <FieldLabel>YouTube Channel</FieldLabel>
              <div className="flex items-center gap-2">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-[#ff0000] text-white">
                  <FaYoutube className="h-4 w-4" />
                </span>
                <input
                  type="text"
                  value={settings.youtubeUrl}
                  onChange={(e) => setSettings((p) => ({ ...p, youtubeUrl: e.target.value }))}
                  className="flex-1 rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs text-slate-800"
                />
              </div>
            </div>
          </div>
        </div>
      </SettingsCard>

      {/* ── 4 Physical Outlets & Branches (Facebook Content) ── */}
      <SettingsCard title="Official Shop Branches & Outlets (Dhaka, Bangladesh)">
        <div className="space-y-4">
          <p className="text-xs text-slate-500">
            Real physical store locations listed on Mini Thailand&apos;s Facebook profile. Customers can visit or order online.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {settings.branches.map((branch, idx) => (
              <div
                key={branch.id || idx}
                className="relative rounded-xl border border-slate-200 bg-slate-50/70 p-4 transition hover:border-slate-300 hover:shadow-xs"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="grid h-7 w-7 place-items-center rounded-full bg-rose-100 text-rose-700 text-xs font-bold">
                      {idx + 1}
                    </span>
                    <h4 className="font-bold text-slate-800 text-sm">{branch.name}</h4>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveBranch(branch.id)}
                    className="rounded p-1 text-slate-400 hover:text-rose-600 transition"
                    title="Remove branch"
                  >
                    <FiTrash2 className="h-4 w-4" />
                  </button>
                </div>

                <div className="mt-3 space-y-1 text-xs text-slate-600">
                  <p>
                    <strong className="text-slate-700">Shop No:</strong> {branch.shopNo} •{" "}
                    <strong className="text-slate-700">Level:</strong> {branch.level}
                  </p>
                  <p className="flex items-center gap-1.5 text-slate-500">
                    <FiMapPin className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                    <span>{branch.location}, {branch.city}</span>
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Add Branch Section */}
          {isAddingBranch ? (
            <div className="rounded-xl border border-rose-200 bg-rose-50/30 p-4 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-rose-800">Add New Outlet</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="Branch Name (e.g. Jamuna Future Park)"
                  value={newBranch.name}
                  onChange={(e) => setNewBranch((b) => ({ ...b, name: e.target.value }))}
                  className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-800"
                />
                <input
                  type="text"
                  placeholder="Shop No. (e.g. Shop no. 11, Zone C)"
                  value={newBranch.shopNo}
                  onChange={(e) => setNewBranch((b) => ({ ...b, shopNo: e.target.value }))}
                  className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-800"
                />
                <input
                  type="text"
                  placeholder="Level / Floor (e.g. Ground Floor)"
                  value={newBranch.level}
                  onChange={(e) => setNewBranch((b) => ({ ...b, level: e.target.value }))}
                  className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-800"
                />
                <input
                  type="text"
                  placeholder="Location / Area (e.g. South Court, Pragati Sarani)"
                  value={newBranch.location}
                  onChange={(e) => setNewBranch((b) => ({ ...b, location: e.target.value }))}
                  className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-800"
                />
              </div>
              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleAddBranch}
                  className="rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-rose-700 transition"
                >
                  Save Branch
                </button>
                <button
                  type="button"
                  onClick={() => setIsAddingBranch(false)}
                  className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setIsAddingBranch(true)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-dashed border-slate-300 bg-slate-50 px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-100 transition"
            >
              <FiPlus className="h-4 w-4" />
              <span>Add Physical Outlet</span>
            </button>
          )}
        </div>
      </SettingsCard>
    </div>
  );
}
