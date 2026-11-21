"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import {
  AdminIcon,
  PageHeader,
  StatusToggle,
} from "../../_components/admin-shell";
import { ConfirmModal } from "../../_components/confirm-modal";
import {
  createAdminVideo,
  deleteAdminVideo,
  fetchAdminVideos,
  importFacebookVideos,
  previewFacebookVideos,
  reorderAdminVideos,
  toggleAdminVideo,
  updateAdminVideo,
  type VideoItem,
  type VideoSource,
  type VideoType,
} from "../../../../lib/video-api";
import { fetchShopProducts, type ShopProduct } from "../../../../lib/shop-api";
import { resolveImageUrl } from "../../../../lib/admin-api";
import { toast } from "sonner";
import {
  LuCheck,
  LuExternalLink,
  LuEye,
  LuFilm,
  LuGripVertical,
  LuHeart,
  LuLayers,
  LuPlay,
  LuPlus,
  LuRefreshCw,
  LuSearch,
  LuSparkles,
  LuStar,
  LuTrash2,
  LuUpload,
  LuX,
} from "react-icons/lu";
import { FaFacebookF } from "react-icons/fa6";

interface VideoFormData {
  id?: string;
  title: string;
  caption: string;
  type: VideoType;
  source: VideoSource;
  facebookUrl: string;
  videoUrl: string;
  thumbnailUrl: string;
  durationSec: number;
  views: string;
  likes: string;
  productId: string;
  isFeatured: boolean;
  isActive: boolean;
  sortOrder: number;
  videoFile: File | null;
  thumbnailFile: File | null;
}

const defaultFormData: VideoFormData = {
  title: "",
  caption: "",
  type: "reel",
  source: "facebook",
  facebookUrl: "",
  videoUrl: "",
  thumbnailUrl: "",
  durationSec: 45,
  views: "1.5K",
  likes: "250",
  productId: "",
  isFeatured: false,
  isActive: true,
  sortOrder: 0,
  videoFile: null,
  thumbnailFile: null,
};

export default function AdminVideosPage() {
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [products, setProducts] = useState<ShopProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [sourceFilter, setSourceFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<VideoFormData>(defaultFormData);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [videoToDelete, setVideoToDelete] = useState<VideoItem | null>(null);

  // Auto thumbnail generation state
  const [isGeneratingThumb, setIsGeneratingThumb] = useState(false);
  const [thumbPreviewUrl, setThumbPreviewUrl] = useState<string | null>(null);
  const [productSearch, setProductSearch] = useState("");
  const [isProductDropdownOpen, setIsProductDropdownOpen] = useState(false);

  // Facebook Import State
  const [isFbModalOpen, setIsFbModalOpen] = useState(false);
  const [fbLoading, setFbLoading] = useState(false);
  const [fbConfigured, setFbConfigured] = useState<boolean | null>(null);
  const [fbMessage, setFbMessage] = useState<string>("");
  const [fbVideos, setFbVideos] = useState<any[]>([]);
  const [selectedFbIds, setSelectedFbIds] = useState<string[]>([]);
  const [customFbPageId, setCustomFbPageId] = useState("");
  const [customFbToken, setCustomFbToken] = useState("");

  const hiddenVideoRef = useRef<HTMLVideoElement>(null);
  const hiddenCanvasRef = useRef<HTMLCanvasElement>(null);

  // Load videos and products
  async function loadData() {
    setLoading(true);
    try {
      const [res, prodRes] = await Promise.all([
        fetchAdminVideos(),
        fetchShopProducts({ page: 1, limit: 150 }).catch(() => ({ data: [] })),
      ]);
      setVideos(res.data);
      setProducts(prodRes.data || []);
    } catch (err: any) {
      toast.error(err.message || "Failed to load videos");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  // Filtered videos
  const filteredVideos = useMemo(() => {
    return videos.filter((v) => {
      const matchSearch =
        !search ||
        v.title.toLowerCase().includes(search.toLowerCase()) ||
        (v.caption && v.caption.toLowerCase().includes(search.toLowerCase()));

      const matchType = typeFilter === "all" || v.type === typeFilter;
      const matchSource = sourceFilter === "all" || v.source === sourceFilter;
      const matchStatus =
        statusFilter === "all"
          ? true
          : statusFilter === "active"
          ? v.isActive
          : statusFilter === "inactive"
          ? !v.isActive
          : statusFilter === "featured"
          ? v.isFeatured
          : true;

      return matchSearch && matchType && matchSource && matchStatus;
    });
  }, [videos, search, typeFilter, sourceFilter, statusFilter]);

  // Quick stats
  const stats = useMemo(() => {
    const total = videos.length;
    const active = videos.filter((v) => v.isActive).length;
    const featured = videos.filter((v) => v.isFeatured).length;
    const fb = videos.filter((v) => v.source === "facebook").length;
    const upload = videos.filter((v) => v.source === "upload").length;
    return { total, active, featured, fb, upload };
  }, [videos]);

  // Open Add modal
  function handleOpenAddModal() {
    setFormData({
      ...defaultFormData,
      sortOrder: videos.length + 1,
    });
    setThumbPreviewUrl(null);
    setProductSearch("");
    setIsModalOpen(true);
  }

  // Open Edit modal
  function handleOpenEditModal(video: VideoItem) {
    setFormData({
      id: video.id,
      title: video.title,
      caption: video.caption || "",
      type: video.type,
      source: video.source,
      facebookUrl: video.facebookUrl || "",
      videoUrl: video.videoUrl || "",
      thumbnailUrl: video.thumbnailUrl,
      durationSec: video.durationSec || 0,
      views: video.views || "1.5K",
      likes: video.likes || "250",
      productId: video.productId || "",
      isFeatured: video.isFeatured,
      isActive: video.isActive,
      sortOrder: video.sortOrder,
      videoFile: null,
      thumbnailFile: null,
    });
    setThumbPreviewUrl(video.thumbnailUrl ? resolveImageUrl(video.thumbnailUrl) : null);
    const linked = products.find((p) => p.id === video.productId);
    setProductSearch(linked ? linked.name : "");
    setIsModalOpen(true);
  }

  // Handle Video file change & auto-generate thumbnail from frame
  function handleVideoFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setFormData((prev) => ({
      ...prev,
      videoFile: file,
      source: "upload",
    }));

    // Auto-generate thumbnail from video first frame
    if (!formData.thumbnailFile && !formData.thumbnailUrl) {
      generateThumbnailFromFile(file);
    }
  }

  function generateThumbnailFromFile(file: File) {
    setIsGeneratingThumb(true);
    const fileUrl = URL.createObjectURL(file);
    const video = document.createElement("video");
    video.src = fileUrl;
    video.muted = true;
    video.playsInline = true;
    video.crossOrigin = "anonymous";
    video.currentTime = 0.5;

    video.onloadeddata = () => {
      video.currentTime = 0.5;
    };

    video.onseeked = () => {
      try {
        const canvas = document.createElement("canvas");
        canvas.width = video.videoWidth || 720;
        canvas.height = video.videoHeight || 1280;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          canvas.toBlob((blob) => {
            if (blob) {
              const thumbFile = new File([blob], "auto-thumbnail.jpg", {
                type: "image/jpeg",
              });
              setFormData((prev) => ({ ...prev, thumbnailFile: thumbFile }));
              setThumbPreviewUrl(URL.createObjectURL(blob));
              toast.success("Auto-generated thumbnail from video frame!");
            }
            setIsGeneratingThumb(false);
            URL.revokeObjectURL(fileUrl);
          }, "image/jpeg", 0.85);
        } else {
          setIsGeneratingThumb(false);
          URL.revokeObjectURL(fileUrl);
        }
      } catch {
        setIsGeneratingThumb(false);
        URL.revokeObjectURL(fileUrl);
      }
    };

    video.onerror = () => {
      setIsGeneratingThumb(false);
      URL.revokeObjectURL(fileUrl);
    };
  }

  // Handle Thumbnail file change
  function handleThumbnailFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setFormData((prev) => ({
      ...prev,
      thumbnailFile: file,
    }));
    setThumbPreviewUrl(URL.createObjectURL(file));
  }

  // Validate Facebook URL
  function isValidFacebookUrl(url: string) {
    if (!url) return false;
    return /^(https?:\/\/)?(www\.|m\.|web\.)?(facebook\.com|fb\.watch)\/.+$/i.test(
      url.trim(),
    );
  }

  // Save video
  async function handleSaveVideo(e: React.FormEvent) {
    e.preventDefault();

    if (!formData.title.trim()) {
      toast.error("Please provide a video title");
      return;
    }

    if (formData.source === "facebook") {
      if (!formData.facebookUrl.trim()) {
        toast.error("Please provide a Facebook Video or Reel URL");
        return;
      }
      if (!isValidFacebookUrl(formData.facebookUrl)) {
        toast.error("Please enter a valid Facebook URL (e.g. https://www.facebook.com/reel/...)");
        return;
      }
    } else {
      if (!formData.id && !formData.videoFile && !formData.videoUrl.trim()) {
        toast.error("Please select an MP4 video file or provide a video URL");
        return;
      }
    }

    setIsSaving(true);
    try {
      const formPayload = new FormData();
      formPayload.append("title", formData.title.trim());
      formPayload.append("caption", formData.caption.trim());
      formPayload.append("type", formData.type);
      formPayload.append("source", formData.source);
      formPayload.append("durationSec", String(formData.durationSec));
      formPayload.append("views", formData.views.trim() || "1.2K");
      formPayload.append("likes", formData.likes.trim() || "250");
      formPayload.append("sortOrder", String(formData.sortOrder));
      formPayload.append("isFeatured", String(formData.isFeatured));
      formPayload.append("isActive", String(formData.isActive));

      if (formData.productId) {
        formPayload.append("productId", formData.productId);
      }

      if (formData.facebookUrl) {
        formPayload.append("facebookUrl", formData.facebookUrl.trim());
      }

      if (formData.videoUrl) {
        formPayload.append("videoUrl", formData.videoUrl.trim());
      }

      if (formData.thumbnailUrl && !formData.thumbnailFile) {
        formPayload.append("thumbnailUrl", formData.thumbnailUrl.trim());
      }

      if (formData.videoFile) {
        formPayload.append("video", formData.videoFile);
      }

      if (formData.thumbnailFile) {
        formPayload.append("thumbnail", formData.thumbnailFile);
      }

      if (formData.id) {
        await updateAdminVideo(formData.id, formPayload);
        toast.success("Video updated successfully");
      } else {
        await createAdminVideo(formPayload);
        toast.success("Video added successfully");
      }

      setIsModalOpen(false);
      await loadData();
    } catch (err: any) {
      toast.error(err.message || "Failed to save video");
    } finally {
      setIsSaving(false);
    }
  }

  // Toggle active/featured
  async function handleToggle(id: string, field: "isActive" | "isFeatured") {
    try {
      const updated = await toggleAdminVideo(id, field);
      setVideos((prev) =>
        prev.map((item) => (item.id === id ? { ...item, [field]: updated[field] } : item)),
      );
      toast.success(
        field === "isActive"
          ? `Video ${updated.isActive ? "activated" : "hidden"}`
          : `Video ${updated.isFeatured ? "featured" : "unfeatured"}`,
      );
    } catch (err: any) {
      toast.error(err.message || "Failed to update status");
    }
  }

  // Delete video
  async function handleDeleteVideo() {
    if (!videoToDelete) return;
    try {
      await deleteAdminVideo(videoToDelete.id);
      setVideos((prev) => prev.filter((v) => v.id !== videoToDelete.id));
      toast.success("Video deleted");
      setDeleteModalOpen(false);
      setVideoToDelete(null);
    } catch (err: any) {
      toast.error(err.message || "Failed to delete video");
    }
  }

  // Move sort order up or down
  async function handleMoveOrder(index: number, direction: "up" | "down") {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= filteredVideos.length) return;

    const newVideos = [...filteredVideos];
    const current = newVideos[index];
    const target = newVideos[targetIndex];

    const currentOrder = current.sortOrder;
    current.sortOrder = target.sortOrder;
    target.sortOrder = currentOrder;

    newVideos[index] = target;
    newVideos[targetIndex] = current;

    setVideos(newVideos);

    try {
      await reorderAdminVideos([
        { id: current.id, sortOrder: current.sortOrder },
        { id: target.id, sortOrder: target.sortOrder },
      ]);
      toast.success("Order updated");
    } catch (err: any) {
      toast.error(err.message || "Failed to reorder");
      loadData();
    }
  }

  // Facebook Import Tool
  async function handleOpenFbImport() {
    setIsFbModalOpen(true);
    setFbLoading(true);
    setFbMessage("");
    try {
      const res = await previewFacebookVideos(customFbPageId, customFbToken);
      setFbConfigured(res.configured);
      setFbVideos(res.videos || []);
      if (res.message) setFbMessage(res.message);
      setSelectedFbIds(res.videos?.map((v) => v.fbId) || []);
    } catch (err: any) {
      setFbConfigured(false);
      setFbMessage(err.message || "Failed to fetch Facebook preview");
    } finally {
      setFbLoading(false);
    }
  }

  async function handleImportSelectedFb() {
    if (!selectedFbIds.length) {
      toast.error("Please select at least one video to import");
      return;
    }
    const toImport = fbVideos.filter((v) => selectedFbIds.includes(v.fbId));
    setFbLoading(true);
    try {
      const res = await importFacebookVideos(toImport);
      toast.success(`Successfully imported ${res.importedCount} videos from Facebook!`);
      setIsFbModalOpen(false);
      loadData();
    } catch (err: any) {
      toast.error(err.message || "Failed to import Facebook videos");
    } finally {
      setFbLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Videos & Reels Showcase"
        description="Curate Facebook reels, live streams, and showcase videos with linked shopping tags."
        action={
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={handleOpenFbImport}
              className="inline-flex items-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-3.5 py-2 text-xs font-semibold text-blue-700 hover:bg-blue-100 hover:border-blue-300 transition-colors shadow-xs"
            >
              <FaFacebookF className="h-3.5 w-3.5 text-[#1877F2]" />
              <span>Import from Facebook</span>
            </button>

            <button
              type="button"
              onClick={handleOpenAddModal}
              className="inline-flex items-center gap-2 rounded-xl bg-store-primary px-4 py-2 text-xs font-semibold text-white hover:bg-store-primary/90 transition-all shadow-sm active:scale-95"
            >
              <LuPlus className="h-4 w-4" />
              <span>Add Video</span>
            </button>
          </div>
        }
      />

      {/* Stats overview */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="rounded-2xl border border-zinc-200/80 bg-white p-3.5 shadow-xs">
          <p className="text-[11px] font-medium text-zinc-500">Total Videos</p>
          <p className="mt-1 text-xl font-bold text-zinc-900">{stats.total}</p>
        </div>
        <div className="rounded-2xl border border-emerald-100 bg-emerald-50/50 p-3.5 shadow-xs">
          <p className="text-[11px] font-medium text-emerald-700">Active (Visible)</p>
          <p className="mt-1 text-xl font-bold text-emerald-900">{stats.active}</p>
        </div>
        <div className="rounded-2xl border border-amber-100 bg-amber-50/50 p-3.5 shadow-xs">
          <p className="text-[11px] font-medium text-amber-700">Featured</p>
          <p className="mt-1 text-xl font-bold text-amber-900">{stats.featured}</p>
        </div>
        <div className="rounded-2xl border border-blue-100 bg-blue-50/50 p-3.5 shadow-xs">
          <p className="text-[11px] font-medium text-blue-700">Facebook Source</p>
          <p className="mt-1 text-xl font-bold text-blue-900">{stats.fb}</p>
        </div>
        <div className="col-span-2 sm:col-span-1 rounded-2xl border border-purple-100 bg-purple-50/50 p-3.5 shadow-xs">
          <p className="text-[11px] font-medium text-purple-700">MP4 Uploads</p>
          <p className="mt-1 text-xl font-bold text-purple-900">{stats.upload}</p>
        </div>
      </div>

      {/* Filters and search */}
      <div className="rounded-2xl border border-zinc-200/80 bg-white p-3.5 shadow-xs flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        <div className="relative flex-1">
          <LuSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by title or Bengali caption..."
            className="w-full rounded-xl border border-zinc-200 bg-zinc-50/50 pl-9 pr-3.5 py-2 text-xs text-zinc-900 placeholder:text-zinc-400 focus:border-store-primary focus:bg-white focus:outline-none"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Type Filter */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="rounded-xl border border-zinc-200 bg-zinc-50/50 px-3 py-2 text-xs font-medium text-zinc-700 focus:border-store-primary focus:outline-none"
          >
            <option value="all">All Types</option>
            <option value="reel">Reels (9:16)</option>
            <option value="video">Standard Video</option>
          </select>

          {/* Source Filter */}
          <select
            value={sourceFilter}
            onChange={(e) => setSourceFilter(e.target.value)}
            className="rounded-xl border border-zinc-200 bg-zinc-50/50 px-3 py-2 text-xs font-medium text-zinc-700 focus:border-store-primary focus:outline-none"
          >
            <option value="all">All Sources</option>
            <option value="facebook">Facebook Only</option>
            <option value="upload">Upload Only</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-xl border border-zinc-200 bg-zinc-50/50 px-3 py-2 text-xs font-medium text-zinc-700 focus:border-store-primary focus:outline-none"
          >
            <option value="all">All Status</option>
            <option value="active">Active Only</option>
            <option value="inactive">Hidden Only</option>
            <option value="featured">Featured Only</option>
          </select>

          <button
            type="button"
            onClick={loadData}
            title="Refresh list"
            className="rounded-xl border border-zinc-200 p-2 text-zinc-600 hover:bg-zinc-100 transition-colors"
          >
            <LuRefreshCw className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Videos List */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-72 rounded-2xl bg-zinc-100 animate-pulse border border-zinc-200/80"
            />
          ))}
        </div>
      ) : filteredVideos.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-zinc-300 bg-white p-12 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 text-store-primary">
            <LuFilm className="h-6 w-6" />
          </div>
          <h3 className="mt-3 text-sm font-bold text-zinc-900">No videos found</h3>
          <p className="mt-1 text-xs text-zinc-500">
            {search || typeFilter !== "all"
              ? "Try adjusting your filters or search terms."
              : "Start by adding your first Facebook Reel or uploading an MP4 video."}
          </p>
          <button
            type="button"
            onClick={handleOpenAddModal}
            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-store-primary px-4 py-2 text-xs font-semibold text-white hover:bg-store-primary/90"
          >
            <LuPlus className="h-3.5 w-3.5" />
            <span>Add New Video</span>
          </button>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-zinc-200/80 bg-white shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-zinc-200/80 bg-zinc-50/70 text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">
                <tr>
                  <th className="py-3 pl-4 pr-2 w-12 text-center">Order</th>
                  <th className="py-3 px-3">Video / Reel</th>
                  <th className="py-3 px-3">Type & Source</th>
                  <th className="py-3 px-3">Linked Product</th>
                  <th className="py-3 px-3">Stats</th>
                  <th className="py-3 px-3 text-center">Featured</th>
                  <th className="py-3 px-3 text-center">Active</th>
                  <th className="py-3 pl-3 pr-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200/60">
                {filteredVideos.map((video, idx) => (
                  <tr
                    key={video.id}
                    className="group hover:bg-zinc-50/50 transition-colors"
                  >
                    {/* Order buttons */}
                    <td className="py-3 pl-4 pr-2 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-1 text-zinc-400">
                        <span className="font-mono text-[11px] font-semibold text-zinc-700 w-4">
                          {video.sortOrder}
                        </span>
                        <div className="flex flex-col">
                          <button
                            type="button"
                            disabled={idx === 0}
                            onClick={() => handleMoveOrder(idx, "up")}
                            className="p-0.5 hover:text-zinc-900 disabled:opacity-20"
                          >
                            ▲
                          </button>
                          <button
                            type="button"
                            disabled={idx === filteredVideos.length - 1}
                            onClick={() => handleMoveOrder(idx, "down")}
                            className="p-0.5 hover:text-zinc-900 disabled:opacity-20"
                          >
                            ▼
                          </button>
                        </div>
                      </div>
                    </td>

                    {/* Thumbnail & Title */}
                    <td className="py-3 px-3">
                      <div className="flex items-start gap-3 min-w-[220px]">
                        <div className="relative h-20 w-14 shrink-0 overflow-hidden rounded-xl bg-zinc-900 border border-zinc-200 shadow-xs">
                          {video.thumbnailUrl && (
                            <Image
                              src={resolveImageUrl(video.thumbnailUrl)}
                              alt={video.title}
                              fill
                              sizes="56px"
                              className="object-cover"
                              unoptimized={video.thumbnailUrl.startsWith("http")}
                            />
                          )}
                          <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/80 text-store-primary shadow-xs">
                              <LuPlay className="h-3 w-3 translate-x-0.5" />
                            </span>
                          </div>
                          {video.durationSec > 0 && (
                            <span className="absolute bottom-1 right-1 rounded bg-black/75 px-1 py-0.2 text-[9px] font-medium text-white">
                              {Math.floor(video.durationSec / 60)}:
                              {String(video.durationSec % 60).padStart(2, "0")}
                            </span>
                          )}
                        </div>

                        <div className="space-y-1 min-w-0">
                          <p className="font-semibold text-zinc-900 line-clamp-1">
                            {video.title}
                          </p>
                          {video.caption && (
                            <p className="text-[11px] text-zinc-500 line-clamp-1">
                              {video.caption}
                            </p>
                          )}
                          {video.facebookUrl && (
                            <a
                              href={video.facebookUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-[10px] text-blue-600 hover:underline"
                            >
                              <span>View on Facebook</span>
                              <LuExternalLink className="h-2.5 w-2.5" />
                            </a>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Type & Source */}
                    <td className="py-3 px-3 whitespace-nowrap">
                      <div className="flex flex-col gap-1 items-start">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                            video.type === "reel"
                              ? "bg-rose-50 text-rose-700 border border-rose-200"
                              : "bg-blue-50 text-blue-700 border border-blue-200"
                          }`}
                        >
                          {video.type === "reel" ? "Reel (9:16)" : "Video"}
                        </span>
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${
                            video.source === "facebook"
                              ? "bg-indigo-50 text-indigo-700 border border-indigo-200"
                              : "bg-purple-50 text-purple-700 border border-purple-200"
                          }`}
                        >
                          {video.source === "facebook" ? (
                            <>
                              <FaFacebookF className="h-2 w-2" />
                              <span>Facebook</span>
                            </>
                          ) : (
                            <>
                              <LuUpload className="h-2.5 w-2.5" />
                              <span>MP4 Upload</span>
                            </>
                          )}
                        </span>
                      </div>
                    </td>

                    {/* Linked Product */}
                    <td className="py-3 px-3">
                      {video.product ? (
                        <div className="flex items-center gap-2 max-w-[200px]">
                          <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-lg border border-zinc-200 bg-zinc-100">
                            {video.product.media?.[0]?.media?.url && (
                              <Image
                                src={resolveImageUrl(video.product.media[0].media.url)}
                                alt={video.product.name}
                                fill
                                sizes="36px"
                                className="object-cover"
                              />
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="truncate font-medium text-zinc-900 text-[11px]">
                              {video.product.name}
                            </p>
                            <p className="text-[10px] font-bold text-store-primary">
                              {video.product.variants?.[0]?.price
                                ? `৳${Number(video.product.variants[0].price).toLocaleString()}`
                                : "View"}
                            </p>
                          </div>
                        </div>
                      ) : (
                        <span className="text-zinc-400 text-[11px] italic">
                          No product linked
                        </span>
                      )}
                    </td>

                    {/* Stats */}
                    <td className="py-3 px-3 whitespace-nowrap">
                      <div className="flex items-center gap-3 text-zinc-500 text-[11px]">
                        <span className="inline-flex items-center gap-1">
                          <LuEye className="h-3 w-3 text-zinc-400" />
                          <span>{video.views || "—"}</span>
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <LuHeart className="h-3 w-3 text-rose-400" />
                          <span>{video.likes || "—"}</span>
                        </span>
                      </div>
                    </td>

                    {/* Featured toggle */}
                    <td className="py-3 px-3 text-center">
                      <button
                        type="button"
                        onClick={() => handleToggle(video.id, "isFeatured")}
                        className={`inline-flex items-center justify-center p-1.5 rounded-lg border transition-all ${
                          video.isFeatured
                            ? "bg-amber-50 text-amber-600 border-amber-200 shadow-xs"
                            : "bg-zinc-50 text-zinc-400 border-zinc-200 hover:text-zinc-700"
                        }`}
                        title="Toggle Featured"
                      >
                        <LuStar
                          className={`h-4 w-4 ${
                            video.isFeatured ? "fill-amber-400 text-amber-500" : ""
                          }`}
                        />
                      </button>
                    </td>

                    {/* Active toggle */}
                    <td className="py-3 px-3 text-center">
                      <StatusToggle
                        checked={video.isActive}
                        onChange={() => handleToggle(video.id, "isActive")}
                      />
                    </td>

                    {/* Actions */}
                    <td className="py-3 pl-3 pr-4 text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleOpenEditModal(video)}
                          className="rounded-lg border border-zinc-200 p-1.5 text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 transition-colors"
                          title="Edit Video"
                        >
                          <AdminIcon name="edit" className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setVideoToDelete(video);
                            setDeleteModalOpen(true);
                          }}
                          className="rounded-lg border border-rose-200 p-1.5 text-rose-600 hover:bg-rose-50 transition-colors"
                          title="Delete Video"
                        >
                          <LuTrash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add / Edit Video Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/60 backdrop-blur-xs p-4 sm:p-6">
          <div className="relative w-full max-w-2xl rounded-3xl bg-white p-6 sm:p-8 shadow-2xl border border-zinc-200 animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-zinc-100 pb-4 mb-5">
              <div>
                <h3 className="text-lg font-bold text-zinc-900">
                  {formData.id ? "Edit Showcase Video" : "Add New Showcase Video"}
                </h3>
                <p className="text-xs text-zinc-500 mt-0.5">
                  Link your Facebook reels or uploaded video to high-converting product tags.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="rounded-full p-2 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600"
              >
                <LuX className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveVideo} className="space-y-5">
              {/* Source Tabs */}
              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-2">
                  Video Source
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      setFormData((p) => ({ ...p, source: "facebook" }))
                    }
                    className={`flex items-center justify-center gap-2 rounded-xl border p-3 text-xs font-semibold transition-all ${
                      formData.source === "facebook"
                        ? "border-[#1877F2] bg-blue-50/60 text-[#1877F2] shadow-xs"
                        : "border-zinc-200 bg-zinc-50 text-zinc-600 hover:bg-white"
                    }`}
                  >
                    <FaFacebookF className="h-3.5 w-3.5" />
                    <span>Facebook Reel / Video URL</span>
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setFormData((p) => ({ ...p, source: "upload" }))
                    }
                    className={`flex items-center justify-center gap-2 rounded-xl border p-3 text-xs font-semibold transition-all ${
                      formData.source === "upload"
                        ? "border-store-primary bg-rose-50/60 text-store-primary shadow-xs"
                        : "border-zinc-200 bg-zinc-50 text-zinc-600 hover:bg-white"
                    }`}
                  >
                    <LuUpload className="h-4 w-4" />
                    <span>Direct MP4 Upload</span>
                  </button>
                </div>
              </div>

              {/* Source-specific Inputs */}
              {formData.source === "facebook" ? (
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-zinc-700">
                    Facebook URL <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="url"
                    required
                    value={formData.facebookUrl}
                    onChange={(e) =>
                      setFormData((p) => ({ ...p, facebookUrl: e.target.value }))
                    }
                    placeholder="https://www.facebook.com/reel/1399503357700927 or https://fb.watch/..."
                    className="w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-2.5 text-xs text-zinc-900 focus:border-store-primary focus:outline-none"
                  />
                  <p className="text-[11px] text-zinc-500">
                    Accepts Reels (`facebook.com/reel/...`), Watch videos (`facebook.com/watch/?v=...`), or `fb.watch` links.
                  </p>
                </div>
              ) : (
                <div className="space-y-3 rounded-2xl border border-zinc-200 bg-zinc-50/60 p-4">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-700 mb-1">
                      Choose Video File (MP4 / WebM)
                    </label>
                    <input
                      type="file"
                      accept="video/mp4,video/webm,video/quicktime"
                      onChange={handleVideoFileChange}
                      className="block w-full text-xs text-zinc-500 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-store-primary file:text-white hover:file:bg-store-primary/90 cursor-pointer"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-700 mb-1">
                      Or Video URL (MP4 / HLS Stream)
                    </label>
                    <input
                      type="url"
                      value={formData.videoUrl}
                      onChange={(e) =>
                        setFormData((p) => ({ ...p, videoUrl: e.target.value }))
                      }
                      placeholder="https://commondatastorage.googleapis.com/.../video.mp4"
                      className="w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-2 text-xs text-zinc-900 focus:border-store-primary focus:outline-none"
                    />
                  </div>
                </div>
              )}

              {/* Title & Caption */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5 sm:col-span-2">
                  <label className="block text-xs font-semibold text-zinc-700">
                    Video Title <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) =>
                      setFormData((p) => ({ ...p, title: e.target.value }))
                    }
                    placeholder="e.g. Thai Cord Set — Rose Pink Special"
                    className="w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-2.5 text-xs text-zinc-900 focus:border-store-primary focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5 sm:col-span-2">
                  <label className="block text-xs font-semibold text-zinc-700">
                    Caption / Description (Bengali + English)
                  </label>
                  <textarea
                    rows={2}
                    value={formData.caption}
                    onChange={(e) =>
                      setFormData((p) => ({ ...p, caption: e.target.value }))
                    }
                    placeholder="থাই কর্ড সেট — লাইভ স্পেশাল কালেকশন..."
                    className="w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-2 text-xs text-zinc-900 focus:border-store-primary focus:outline-none"
                  />
                </div>
              </div>

              {/* Thumbnail + Video Type */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Thumbnail upload & preview */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-semibold text-zinc-700">
                      Thumbnail Image
                    </label>
                    {isGeneratingThumb && (
                      <span className="text-[10px] text-store-primary font-medium flex items-center gap-1 animate-pulse">
                        <LuSparkles className="h-3 w-3" /> Auto-extracting...
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="relative h-16 w-12 shrink-0 overflow-hidden rounded-xl border border-zinc-200 bg-zinc-100 shadow-xs">
                      {thumbPreviewUrl ? (
                        <Image
                          src={thumbPreviewUrl}
                          alt="Thumbnail preview"
                          fill
                          sizes="48px"
                          className="object-cover"
                          unoptimized={thumbPreviewUrl.startsWith("blob:") || thumbPreviewUrl.startsWith("http")}
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-zinc-400">
                          <LuFilm className="h-4 w-4" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 space-y-1.5">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleThumbnailFileChange}
                        className="block w-full text-[11px] text-zinc-500 file:mr-2 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-[11px] file:font-semibold file:bg-zinc-100 file:text-zinc-700 hover:file:bg-zinc-200 cursor-pointer"
                      />
                      <input
                        type="url"
                        value={formData.thumbnailUrl}
                        onChange={(e) => {
                          setFormData((p) => ({ ...p, thumbnailUrl: e.target.value }));
                          setThumbPreviewUrl(e.target.value);
                        }}
                        placeholder="Or image URL..."
                        className="w-full rounded-lg border border-zinc-200 px-2.5 py-1 text-[11px] text-zinc-800 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Type & Duration */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-zinc-700">
                      Display Type
                    </label>
                    <select
                      value={formData.type}
                      onChange={(e) =>
                        setFormData((p) => ({ ...p, type: e.target.value as VideoType }))
                      }
                      className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-xs text-zinc-800 focus:border-store-primary focus:outline-none"
                    >
                      <option value="reel">Reel (9:16 Vertical)</option>
                      <option value="video">Video (16:9 Standard)</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-zinc-700">
                      Duration (Sec)
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={formData.durationSec}
                      onChange={(e) =>
                        setFormData((p) => ({ ...p, durationSec: Number(e.target.value) }))
                      }
                      className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-xs text-zinc-800 focus:border-store-primary focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Linked Product Searchable Select */}
              <div className="space-y-1.5 relative">
                <label className="block text-xs font-semibold text-zinc-700">
                  Link Store Product (for 1-click WhatsApp/Cart order)
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={productSearch}
                    onFocus={() => setIsProductDropdownOpen(true)}
                    onChange={(e) => {
                      setProductSearch(e.target.value);
                      setIsProductDropdownOpen(true);
                    }}
                    placeholder="Search product by name to link..."
                    className="w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-2.5 text-xs text-zinc-900 focus:border-store-primary focus:outline-none"
                  />
                  {formData.productId && (
                    <button
                      type="button"
                      onClick={() => {
                        setFormData((p) => ({ ...p, productId: "" }));
                        setProductSearch("");
                      }}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 text-xs flex items-center gap-1 font-semibold"
                    >
                      <LuX className="h-3.5 w-3.5" /> Clear
                    </button>
                  )}
                </div>

                {/* Dropdown list */}
                {isProductDropdownOpen && (
                  <div className="absolute left-0 right-0 top-full z-20 mt-1 max-h-52 overflow-y-auto rounded-2xl border border-zinc-200 bg-white p-1.5 shadow-xl">
                    <button
                      type="button"
                      onClick={() => {
                        setFormData((p) => ({ ...p, productId: "" }));
                        setProductSearch("");
                        setIsProductDropdownOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 text-xs text-zinc-500 hover:bg-zinc-50 rounded-xl"
                    >
                      — Do not link any product —
                    </button>
                    {products
                      .filter((p) =>
                        p.name.toLowerCase().includes(productSearch.toLowerCase()),
                      )
                      .slice(0, 8)
                      .map((prod) => (
                        <button
                          key={prod.id}
                          type="button"
                          onClick={() => {
                            setFormData((p) => ({ ...p, productId: prod.id }));
                            setProductSearch(prod.name);
                            setIsProductDropdownOpen(false);
                            // Auto fill thumbnail if none exists
                            if (!formData.thumbnailUrl && !formData.thumbnailFile && prod.image) {
                              setFormData((p) => ({ ...p, thumbnailUrl: prod.image }));
                              setThumbPreviewUrl(resolveImageUrl(prod.image));
                            }
                          }}
                          className="w-full flex items-center justify-between gap-3 px-3 py-2 text-xs text-zinc-800 hover:bg-rose-50/60 rounded-xl transition-colors"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="relative h-7 w-7 shrink-0 overflow-hidden rounded-md bg-zinc-100">
                              {prod.image && (
                                <Image
                                  src={resolveImageUrl(prod.image)}
                                  alt={prod.name}
                                  fill
                                  sizes="28px"
                                  className="object-cover"
                                />
                              )}
                            </div>
                            <span className="truncate font-medium">{prod.name}</span>
                          </div>
                          <span className="font-bold text-store-primary shrink-0">
                            ৳{Number(prod.price).toLocaleString()}
                          </span>
                        </button>
                      ))}
                  </div>
                )}
              </div>

              {/* Display metrics & toggles */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
                <div>
                  <label className="block text-[11px] font-semibold text-zinc-600 mb-1">
                    Display Views
                  </label>
                  <input
                    type="text"
                    value={formData.views}
                    onChange={(e) =>
                      setFormData((p) => ({ ...p, views: e.target.value }))
                    }
                    placeholder="e.g. 18.4K"
                    className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-1.5 text-xs text-zinc-800"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-zinc-600 mb-1">
                    Display Likes
                  </label>
                  <input
                    type="text"
                    value={formData.likes}
                    onChange={(e) =>
                      setFormData((p) => ({ ...p, likes: e.target.value }))
                    }
                    placeholder="e.g. 1.2K"
                    className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-1.5 text-xs text-zinc-800"
                  />
                </div>

                <div className="flex items-center gap-2 pt-5">
                  <input
                    type="checkbox"
                    id="isFeatured"
                    checked={formData.isFeatured}
                    onChange={(e) =>
                      setFormData((p) => ({ ...p, isFeatured: e.target.checked }))
                    }
                    className="h-4 w-4 rounded text-store-primary focus:ring-store-primary"
                  />
                  <label
                    htmlFor="isFeatured"
                    className="text-xs font-semibold text-zinc-800 cursor-pointer"
                  >
                    Feature Video
                  </label>
                </div>

                <div className="flex items-center gap-2 pt-5">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={formData.isActive}
                    onChange={(e) =>
                      setFormData((p) => ({ ...p, isActive: e.target.checked }))
                    }
                    className="h-4 w-4 rounded text-store-primary focus:ring-store-primary"
                  />
                  <label
                    htmlFor="isActive"
                    className="text-xs font-semibold text-zinc-800 cursor-pointer"
                  >
                    Active (Visible)
                  </label>
                </div>
              </div>

              {/* Submit buttons */}
              <div className="flex items-center justify-end gap-3 border-t border-zinc-100 pt-5">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-xl border border-zinc-200 px-4 py-2.5 text-xs font-semibold text-zinc-700 hover:bg-zinc-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="inline-flex items-center gap-2 rounded-xl bg-store-primary px-5 py-2.5 text-xs font-semibold text-white hover:bg-store-primary/90 transition-all shadow-md disabled:opacity-50"
                >
                  {isSaving && <LuRefreshCw className="h-3.5 w-3.5 animate-spin" />}
                  <span>{formData.id ? "Update Video" : "Publish Video"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Facebook Graph API Auto-Sync Modal */}
      {isFbModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/60 backdrop-blur-xs p-4 sm:p-6">
          <div className="relative w-full max-w-3xl rounded-3xl bg-white p-6 sm:p-8 shadow-2xl border border-zinc-200 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-4 mb-5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-[#1877F2]">
                  <FaFacebookF className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-zinc-900">
                    Import Videos from Facebook Page
                  </h3>
                  <p className="text-xs text-zinc-500">
                    Automatically fetch public videos and reels directly from your Facebook Page Graph API.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsFbModalOpen(false)}
                className="rounded-full p-2 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600"
              >
                <LuX className="h-5 w-5" />
              </button>
            </div>

            {fbLoading ? (
              <div className="py-16 text-center">
                <LuRefreshCw className="h-8 w-8 animate-spin mx-auto text-blue-600" />
                <p className="mt-3 text-xs font-medium text-zinc-600">
                  Fetching recent videos from Facebook...
                </p>
              </div>
            ) : fbConfigured === false ? (
              <div className="space-y-4">
                <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-xs text-amber-900">
                  <p className="font-semibold mb-1">
                    Facebook Page Access Token Not Found in Environment
                  </p>
                  <p className="text-amber-800 leading-relaxed">
                    To enable 1-click automatic Facebook sync, please set{" "}
                    <code className="bg-amber-100 px-1.5 py-0.5 rounded font-mono">
                      FB_PAGE_ID
                    </code>{" "}
                    and{" "}
                    <code className="bg-amber-100 px-1.5 py-0.5 rounded font-mono">
                      FB_PAGE_TOKEN
                    </code>{" "}
                    in your backend <code className="font-mono">.env</code> file.
                  </p>
                  <p className="mt-2 text-[11px] text-amber-700">
                    Alternatively, you can test it directly below, or continue adding Facebook reels manually using the "Add Video" form.
                  </p>
                </div>

                <div className="space-y-3 rounded-2xl border border-zinc-200 p-4 bg-zinc-50/50">
                  <h4 className="text-xs font-bold text-zinc-800">
                    Test with temporary Page ID & Token:
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-zinc-600 mb-1">
                        Facebook Page ID
                      </label>
                      <input
                        type="text"
                        value={customFbPageId}
                        onChange={(e) => setCustomFbPageId(e.target.value)}
                        placeholder="e.g. 10008654321..."
                        className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-zinc-600 mb-1">
                        Page Access Token (EAAG...)
                      </label>
                      <input
                        type="password"
                        value={customFbToken}
                        onChange={(e) => setCustomFbToken(e.target.value)}
                        placeholder="EAAG..."
                        className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-xs"
                      />
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleOpenFbImport}
                    className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700"
                  >
                    <span>Fetch Videos</span>
                  </button>
                </div>
              </div>
            ) : fbVideos.length === 0 ? (
              <div className="py-12 text-center text-zinc-500">
                <p className="text-sm font-semibold">No recent videos found on page</p>
                <p className="text-xs mt-1">{fbMessage}</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between text-xs text-zinc-600">
                  <p>
                    Found <strong>{fbVideos.length}</strong> videos. Select the ones you want to showcase:
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      if (selectedFbIds.length === fbVideos.length) {
                        setSelectedFbIds([]);
                      } else {
                        setSelectedFbIds(fbVideos.map((v) => v.fbId));
                      }
                    }}
                    className="text-blue-600 font-semibold hover:underline"
                  >
                    {selectedFbIds.length === fbVideos.length
                      ? "Deselect All"
                      : "Select All"}
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 max-h-96 overflow-y-auto p-1">
                  {fbVideos.map((v) => {
                    const isSelected = selectedFbIds.includes(v.fbId);
                    return (
                      <div
                        key={v.fbId}
                        onClick={() => {
                          setSelectedFbIds((prev) =>
                            isSelected
                              ? prev.filter((id) => id !== v.fbId)
                              : [...prev, v.fbId],
                          );
                        }}
                        className={`relative rounded-2xl border p-3 cursor-pointer transition-all ${
                          isSelected
                            ? "border-blue-500 bg-blue-50/50 shadow-xs"
                            : "border-zinc-200 bg-white hover:border-zinc-300"
                        }`}
                      >
                        <div className="relative h-32 w-full overflow-hidden rounded-xl bg-zinc-900 mb-2">
                          {v.thumbnailUrl && (
                            <Image
                              src={v.thumbnailUrl}
                              alt={v.title}
                              fill
                              sizes="200px"
                              className="object-cover"
                              unoptimized
                            />
                          )}
                          <span className="absolute top-2 right-2 flex h-5 w-5 items-center justify-center rounded-full bg-white shadow-xs">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => {}}
                              className="h-3.5 w-3.5 rounded text-blue-600"
                            />
                          </span>
                        </div>
                        <p className="font-semibold text-xs text-zinc-900 line-clamp-1">
                          {v.title}
                        </p>
                        <p className="text-[11px] text-zinc-500 line-clamp-1 mt-0.5">
                          {v.caption}
                        </p>
                      </div>
                    );
                  })}
                </div>

                <div className="flex items-center justify-end gap-3 border-t border-zinc-100 pt-4">
                  <button
                    type="button"
                    onClick={() => setIsFbModalOpen(false)}
                    className="rounded-xl border border-zinc-200 px-4 py-2 text-xs font-semibold text-zinc-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleImportSelectedFb}
                    className="inline-flex items-center gap-2 rounded-xl bg-[#1877F2] px-5 py-2 text-xs font-semibold text-white hover:bg-blue-700 shadow-xs"
                  >
                    <span>Import Selected ({selectedFbIds.length})</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteModalOpen}
        title="Delete Showcase Video"
        message={`Are you sure you want to delete "${videoToDelete?.title}"? This cannot be undone.`}
        confirmText="Delete Video"
        onConfirm={handleDeleteVideo}
        onClose={() => {
          setDeleteModalOpen(false);
          setVideoToDelete(null);
        }}
      />
    </div>
  );
}
