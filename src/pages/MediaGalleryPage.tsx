import React, { useState, useRef, useEffect } from "react";
import {
  ChevronLeft, Grid, List, Upload, Play, Image, Video,
  Music, FileText, Download, Trash2, X, Share2, Search,
  MoreVertical, ZoomIn, Eye, Heart, Filter, Plus
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

interface MediaItem {
  id: string;
  name: string;
  type: "image" | "video" | "audio" | "document";
  url: string;
  size: string;
  date: string;
  thumb?: string;
  duration?: string;
  liked?: boolean;
}

interface MediaGalleryPageProps {
  onBack: () => void;
  onSelectMedia?: (url: string, type: string, name: string) => void;
  selectMode?: boolean;
}

const sampleMedia: MediaItem[] = [
  { id: "1", type: "image", name: "Photo_001.jpg", url: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop", thumb: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=300&h=300&fit=crop", size: "2.4 MB", date: "Today" },
  { id: "2", type: "image", name: "Landscape.jpg", url: "https://images.unsplash.com/photo-1470770903676-69b98201ea1c?w=800&h=600&fit=crop", thumb: "https://images.unsplash.com/photo-1470770903676-69b98201ea1c?w=300&h=300&fit=crop", size: "1.8 MB", date: "Today" },
  { id: "3", type: "image", name: "Nature.jpg", url: "https://images.unsplash.com/photo-1501854140801-50d01698950b?w=800&h=600&fit=crop", thumb: "https://images.unsplash.com/photo-1501854140801-50d01698950b?w=300&h=300&fit=crop", size: "3.1 MB", date: "Jul 6" },
  { id: "4", type: "image", name: "Mosque.jpg", url: "https://images.unsplash.com/photo-1564769662533-4f00a87b4056?w=800&h=600&fit=crop", thumb: "https://images.unsplash.com/photo-1564769662533-4f00a87b4056?w=300&h=300&fit=crop", size: "2.9 MB", date: "Jul 6" },
  { id: "5", type: "video", name: "Video_001.mp4", url: "", thumb: "https://images.unsplash.com/photo-1518173946687-a4c8892bbd9f?w=300&h=300&fit=crop", size: "18.5 MB", date: "Jul 5", duration: "2:34" },
  { id: "6", type: "image", name: "Forest.jpg", url: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&h=600&fit=crop", thumb: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=300&h=300&fit=crop", size: "4.2 MB", date: "Jul 4" },
  { id: "7", type: "audio", name: "Quran_Recitation.mp3", url: "", size: "6.7 MB", date: "Jul 4", duration: "5:22" },
  { id: "8", type: "document", name: "Document.pdf", url: "", size: "1.2 MB", date: "Jul 3" },
  { id: "9", type: "image", name: "City_Night.jpg", url: "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=800&h=600&fit=crop", thumb: "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=300&h=300&fit=crop", size: "3.5 MB", date: "Jul 2" },
  { id: "10", type: "video", name: "Travel_Vlog.mp4", url: "", thumb: "https://images.unsplash.com/photo-1526779259212-939e64788e3c?w=300&h=300&fit=crop", size: "45.2 MB", date: "Jul 1", duration: "8:12" },
  { id: "11", type: "image", name: "Mountains.jpg", url: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&h=600&fit=crop", thumb: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=300&h=300&fit=crop", size: "5.1 MB", date: "Jun 30" },
  { id: "12", type: "audio", name: "Voice_Note.ogg", url: "", size: "0.8 MB", date: "Jun 29", duration: "0:45" },
  { id: "13", type: "image", name: "Abstract.jpg", url: "https://images.unsplash.com/photo-1553356084-58ef4a67b2a7?w=800&h=600&fit=crop", thumb: "https://images.unsplash.com/photo-1553356084-58ef4a67b2a7?w=300&h=300&fit=crop", size: "2.1 MB", date: "Jun 28" },
  { id: "14", type: "image", name: "Ocean.jpg", url: "https://images.unsplash.com/photo-1505118380757-91f5f5632de0?w=800&h=600&fit=crop", thumb: "https://images.unsplash.com/photo-1505118380757-91f5f5632de0?w=300&h=300&fit=crop", size: "3.8 MB", date: "Jun 27" },
  { id: "15", type: "document", name: "Presentation.pptx", url: "", size: "4.5 MB", date: "Jun 26" },
];

type TabKey = "all" | "images" | "videos" | "audio" | "docs";
const TABS: { key: TabKey; label: string; emoji: string; color: string }[] = [
  { key: "all", label: "All", emoji: "📁", color: "#7C4DFF" },
  { key: "images", label: "Photos", emoji: "🖼️", color: "#E040FB" },
  { key: "videos", label: "Videos", emoji: "🎬", color: "#FF4081" },
  { key: "audio", label: "Audio", emoji: "🎵", color: "#FF9800" },
  { key: "docs", label: "Docs", emoji: "📄", color: "#2196F3" },
];

const MediaGalleryPage: React.FC<MediaGalleryPageProps> = ({ onBack, onSelectMedia, selectMode = false }) => {
  const [activeTab, setActiveTab] = useState<TabKey>("all");
  const [viewMode, setViewMode] = useState<"grid" | "list" | "masonry">("grid");
  const [selectedItem, setSelectedItem] = useState<MediaItem | null>(null);
  const [items, setItems] = useState<MediaItem[]>(sampleMedia);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [sortBy, setSortBy] = useState<"date" | "size" | "name">("date");
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filtered = items
    .filter((item) => {
      const matchTab = activeTab === "all" ? true
        : activeTab === "images" ? item.type === "image"
        : activeTab === "videos" ? item.type === "video"
        : activeTab === "audio" ? item.type === "audio"
        : item.type === "document";
      const matchSearch = !searchQuery || item.name.toLowerCase().includes(searchQuery.toLowerCase());
      return matchTab && matchSearch;
    });

  const typeMeta = (type: string) => {
    const map: Record<string, { icon: React.ReactNode; bg: string; color: string }> = {
      video: { icon: <Video size={20} className="text-red-400" />, bg: "#FF408115", color: "#FF4081" },
      audio: { icon: <Music size={20} className="text-orange-400" />, bg: "#FF980015", color: "#FF9800" },
      document: { icon: <FileText size={20} className="text-blue-400" />, bg: "#2196F315", color: "#2196F3" },
      image: { icon: <Image size={20} className="text-purple-400" />, bg: "#7C4DFF15", color: "#7C4DFF" },
    };
    return map[type] || map.image;
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setUploading(true);
    for (const file of files) {
      const ext = file.name.split(".").pop();
      const path = `gallery/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;
      let publicUrl = URL.createObjectURL(file);
      try {
        const { error } = await supabase.storage.from("itsme-media").upload(path, file, { contentType: file.type });
        if (!error) {
          const { data } = supabase.storage.from("itsme-media").getPublicUrl(path);
          publicUrl = data.publicUrl;
        }
      } catch {}
      const type = file.type.startsWith("image/") ? "image"
        : file.type.startsWith("video/") ? "video"
        : file.type.startsWith("audio/") ? "audio"
        : "document";
      const newItem: MediaItem = {
        id: Date.now().toString() + Math.random(),
        name: file.name,
        type,
        url: publicUrl,
        thumb: type === "image" ? publicUrl : undefined,
        size: file.size > 1024 * 1024 ? `${(file.size / 1024 / 1024).toFixed(1)} MB` : `${(file.size / 1024).toFixed(0)} KB`,
        date: "Just now",
      };
      setItems((prev) => [newItem, ...prev]);
    }
    setUploading(false);
    toast.success(`${files.length} file${files.length > 1 ? "s" : ""} added`);
  };

  const toggleLike = (id: string) => {
    setItems((p) => p.map((i) => i.id === id ? { ...i, liked: !i.liked } : i));
  };

  const downloadItem = async (item: MediaItem) => {
    if (!item.url) { toast.error("No URL available"); return; }
    const a = document.createElement("a");
    a.href = item.url;
    a.download = item.name;
    a.target = "_blank";
    a.click();
    toast.success("Downloading…");
  };

  const handleItemTap = (item: MediaItem) => {
    if (selectMode && onSelectMedia) {
      onSelectMedia(item.url, item.type, item.name);
      return;
    }
    setSelectedItem(item);
  };

  const totalSize = items.reduce((acc, i) => {
    const mb = parseFloat(i.size);
    return acc + (isNaN(mb) ? 0 : mb);
  }, 0);

  return (
    <div className="page-content relative" style={{ background: "#f8f5ff" }}>
      {/* Header */}
      <div className="sticky top-0 z-20" style={{ background: "linear-gradient(135deg,#4527A0,#7B1FA2,#E040FB)", boxShadow: "0 4px 20px rgba(69,39,160,0.4)" }}>
        <div className="px-4 pt-4 pb-3">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <button onClick={onBack} className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center">
                <ChevronLeft size={20} color="white" />
              </button>
              <div>
                <h1 className="text-base font-bold text-white">{selectMode ? "Choose Media" : "Media Gallery"}</h1>
                <p className="text-purple-200 text-[10px]">{items.length} files · {totalSize.toFixed(1)} MB</p>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <button onClick={() => setShowSearch(!showSearch)} className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center">
                <Search size={16} color="white" />
              </button>
              <button
                onClick={() => setViewMode((v) => v === "grid" ? "list" : v === "list" ? "masonry" : "grid")}
                className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center"
              >
                {viewMode === "grid" ? <List size={16} color="white" /> : viewMode === "list" ? <Grid size={16} color="white" style={{ opacity: 0.7 }} /> : <Grid size={16} color="white" />}
              </button>
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="w-9 h-9 rounded-full flex items-center justify-center"
                style={{ background: "rgba(255,255,255,0.25)" }}
              >
                {uploading ? <div className="w-4 h-4 border-2 border-white/50 border-t-white rounded-full" style={{ animation: "spin 1s linear infinite" }} /> : <Plus size={18} color="white" />}
              </button>
            </div>
          </div>

          {/* Search bar */}
          {showSearch && (
            <div className="flex items-center gap-2 bg-white/15 rounded-xl px-3 py-2 mb-2">
              <Search size={14} color="rgba(255,255,255,0.7)" />
              <input
                autoFocus
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search files…"
                className="flex-1 bg-transparent text-white text-sm outline-none placeholder-white/50"
              />
              {searchQuery && <button onClick={() => setSearchQuery("")}><X size={14} color="rgba(255,255,255,0.7)" /></button>}
            </div>
          )}

          {/* Tab filters */}
          <div className="flex gap-1.5 overflow-x-auto scrollbar-hide">
            {TABS.map((t) => {
              const count = items.filter((i) =>
                t.key === "all" ? true
                : t.key === "images" ? i.type === "image"
                : t.key === "videos" ? i.type === "video"
                : t.key === "audio" ? i.type === "audio"
                : i.type === "document"
              ).length;
              return (
                <button
                  key={t.key}
                  onClick={() => setActiveTab(t.key)}
                  className="flex-shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-full text-[11px] font-bold transition-all"
                  style={{
                    background: activeTab === t.key ? "rgba(255,255,255,0.95)" : "rgba(255,255,255,0.18)",
                    color: activeTab === t.key ? t.color : "#fff",
                  }}
                >
                  <span>{t.emoji}</span>
                  <span>{t.label}</span>
                  <span className="opacity-70">({count})</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <input ref={fileInputRef} type="file" multiple accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt,.zip" className="hidden" onChange={handleFileUpload} />

      {/* Stats bar */}
      <div className="px-4 py-2 flex items-center justify-between bg-white border-b border-gray-100">
        <p className="text-xs text-gray-500">{filtered.length} {activeTab === "all" ? "items" : activeTab} {searchQuery ? `matching "${searchQuery}"` : ""}</p>
        <select value={sortBy} onChange={(e) => setSortBy(e.target.value as any)} className="text-xs text-gray-500 bg-transparent outline-none">
          <option value="date">By Date</option>
          <option value="name">By Name</option>
          <option value="size">By Size</option>
        </select>
      </div>

      {/* Content */}
      <div className="px-2 pt-2 pb-4">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <span className="text-5xl mb-3">📂</span>
            <p className="text-gray-600 font-semibold">No files found</p>
            <p className="text-gray-400 text-sm mt-1">{searchQuery ? "Try a different search" : "Tap + to add files"}</p>
            <button onClick={() => fileInputRef.current?.click()} className="mt-4 px-6 py-2.5 rounded-xl text-white text-sm font-bold"
              style={{ background: "linear-gradient(135deg,#7C4DFF,#E040FB)" }}>
              <Upload size={14} className="inline mr-1.5" /> Upload Files
            </button>
          </div>
        ) : viewMode === "list" ? (
          <div className="space-y-1.5">
            {filtered.map((item) => {
              const meta = typeMeta(item.type);
              return (
                <div key={item.id} onClick={() => handleItemTap(item)}
                  className="flex items-center gap-3 bg-white rounded-2xl px-3 py-3 shadow-sm cursor-pointer active:bg-purple-50 transition-colors">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center overflow-hidden flex-shrink-0" style={{ background: meta.bg }}>
                    {item.thumb ? <img src={item.thumb} alt="" className="w-full h-full object-cover rounded-xl" /> : meta.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-800 text-sm truncate">{item.name}</p>
                    <p className="text-xs text-gray-400">{item.size}{item.duration ? ` · ${item.duration}` : ""} · {item.date}</p>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button onClick={(e) => { e.stopPropagation(); toggleLike(item.id); }} className="w-8 h-8 rounded-full flex items-center justify-center">
                      <Heart size={14} className={item.liked ? "text-red-400 fill-red-400" : "text-gray-300"} />
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); setItems((p) => p.filter((i) => i.id !== item.id)); }} className="w-8 h-8 rounded-full flex items-center justify-center">
                      <Trash2 size={14} className="text-red-300" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : viewMode === "masonry" ? (
          // Masonry layout
          <div className="columns-2 gap-2 space-y-2">
            {filtered.map((item, i) => {
              const heights = ["160px", "200px", "140px", "180px", "220px"];
              const h = heights[i % heights.length];
              return (
                <div key={item.id} onClick={() => handleItemTap(item)}
                  className="relative rounded-2xl overflow-hidden cursor-pointer active:scale-95 transition-transform break-inside-avoid mb-2"
                  style={{ height: h }}>
                  {item.thumb ? (
                    <img src={item.thumb} alt={item.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center gap-2 p-3" style={{ background: typeMeta(item.type).bg }}>
                      {typeMeta(item.type).icon}
                      <p className="text-xs text-center text-gray-600 leading-tight">{item.name}</p>
                    </div>
                  )}
                  {item.type === "video" && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-10 h-10 bg-black/60 rounded-full flex items-center justify-center">
                        <Play size={18} color="white" fill="white" />
                      </div>
                    </div>
                  )}
                  <div className="absolute bottom-0 left-0 right-0 px-2 py-1.5" style={{ background: "linear-gradient(transparent,rgba(0,0,0,0.5))" }}>
                    <p className="text-white text-[9px] truncate">{item.name}</p>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          // Grid layout (3-col)
          <div className="grid grid-cols-3 gap-1">
            {filtered.map((item) => {
              const meta = typeMeta(item.type);
              return (
                <div key={item.id} onClick={() => handleItemTap(item)}
                  className="relative rounded-xl overflow-hidden cursor-pointer active:scale-95 transition-transform"
                  style={{ aspectRatio: "1", background: meta.bg }}>
                  {item.thumb ? (
                    <img src={item.thumb} alt={item.name} className="w-full h-full object-cover" loading="lazy" />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center gap-1 p-2">
                      {meta.icon}
                      <p className="text-[9px] text-center text-gray-600 line-clamp-2 leading-tight px-1">{item.name}</p>
                    </div>
                  )}
                  {item.type === "video" && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-9 h-9 bg-black/55 rounded-full flex items-center justify-center">
                        <Play size={16} color="white" fill="white" />
                      </div>
                    </div>
                  )}
                  {item.type === "audio" && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-9 h-9 bg-orange-400/80 rounded-full flex items-center justify-center">
                        <Music size={16} color="white" />
                      </div>
                    </div>
                  )}
                  {item.duration && (
                    <div className="absolute bottom-1 right-1 bg-black/70 rounded px-1.5 py-0.5">
                      <span className="text-white text-[9px] font-bold">{item.duration}</span>
                    </div>
                  )}
                  {item.liked && (
                    <div className="absolute top-1 right-1">
                      <Heart size={12} className="text-red-400 fill-red-400" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Full-screen viewer */}
      {selectedItem && (
        <div className="fixed inset-0 z-[100] bg-black flex flex-col" onClick={(e) => e.currentTarget === e.target && setSelectedItem(null)}>
          {/* Header */}
          <div className="flex items-center justify-between px-4 pt-10 pb-3 flex-shrink-0" style={{ background: "rgba(0,0,0,0.7)" }}>
            <button onClick={() => setSelectedItem(null)} className="w-10 h-10 bg-white/15 rounded-full flex items-center justify-center">
              <X size={20} color="white" />
            </button>
            <p className="text-white font-semibold text-sm truncate max-w-[55%]">{selectedItem.name}</p>
            <div className="flex gap-1.5">
              <button onClick={() => toggleLike(selectedItem.id)} className="w-10 h-10 bg-white/15 rounded-full flex items-center justify-center">
                <Heart size={18} className={selectedItem.liked ? "text-red-400 fill-red-400" : "text-white"} />
              </button>
              <button onClick={() => downloadItem(selectedItem)} className="w-10 h-10 bg-white/15 rounded-full flex items-center justify-center">
                <Download size={17} color="white" />
              </button>
              <button className="w-10 h-10 bg-white/15 rounded-full flex items-center justify-center">
                <Share2 size={17} color="white" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 flex items-center justify-center px-3 overflow-hidden">
            {selectedItem.type === "image" ? (
              <img src={selectedItem.url} alt={selectedItem.name} className="max-w-full max-h-full object-contain rounded-lg" style={{ maxHeight: "calc(100vh - 180px)" }} />
            ) : selectedItem.type === "video" ? (
              <video src={selectedItem.url || undefined} controls autoPlay playsInline
                className="max-w-full rounded-xl"
                style={{ maxHeight: "calc(100vh - 180px)", background: "#111" }}>
                Your browser does not support video playback.
              </video>
            ) : selectedItem.type === "audio" ? (
              <div className="w-full max-w-xs mx-auto">
                <div className="rounded-3xl p-6 text-center mb-4" style={{ background: "linear-gradient(135deg,#FF9800,#F44336)" }}>
                  <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-3">
                    <Music size={36} color="white" />
                  </div>
                  <p className="text-white font-bold text-base">{selectedItem.name}</p>
                  <p className="text-white/70 text-sm mt-1">{selectedItem.size} · {selectedItem.duration || "–"}</p>
                </div>
                <audio src={selectedItem.url || undefined} controls className="w-full" style={{ borderRadius: "12px" }} />
              </div>
            ) : (
              <div className="w-full max-w-sm p-8 rounded-3xl text-center" style={{ background: "rgba(255,255,255,0.08)" }}>
                <div className="w-20 h-20 rounded-2xl bg-blue-500/20 flex items-center justify-center mx-auto mb-4">
                  <FileText size={36} className="text-blue-400" />
                </div>
                <p className="text-white font-bold text-base mb-2">{selectedItem.name}</p>
                <p className="text-white/50 text-sm mb-4">{selectedItem.size} · {selectedItem.date}</p>
                <button onClick={() => downloadItem(selectedItem)}
                  className="px-6 py-3 rounded-xl text-white font-bold text-sm"
                  style={{ background: "linear-gradient(135deg,#2196F3,#1565C0)" }}>
                  <Download size={16} className="inline mr-1.5" /> Open / Download
                </button>
              </div>
            )}
          </div>

          {/* Info bar */}
          <div className="px-4 py-3 flex-shrink-0" style={{ background: "rgba(0,0,0,0.7)" }}>
            <p className="text-white/50 text-xs text-center">{selectedItem.size} · {selectedItem.date}</p>
          </div>
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

export default MediaGalleryPage;
