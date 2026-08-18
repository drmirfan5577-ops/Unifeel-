import React, { useState } from "react";
import { Search } from "lucide-react";
import type { Contact } from "@/types";
import { toast } from "sonner";

interface ChatsPageProps {
  onOpenChat: (contact: Contact) => void;
  onCall?: (contact: Contact, type: "voice" | "video") => void;
}

// ── Real working app links ──────────────────────────────────────────────────
const appGroups = [
  {
    label: "Social Media",
    emoji: "📱",
    color: "#7C4DFF",
    bg: "#f3edff",
    apps: [
      { name: "WhatsApp", icon: "💬", url: "https://web.whatsapp.com", color: "#25D366", bg: "#E8F5E9" },
      { name: "Instagram", icon: "📸", url: "https://instagram.com", color: "#E1306C", bg: "#FCE4EC" },
      { name: "Facebook", icon: "👥", url: "https://facebook.com", color: "#1877F2", bg: "#E3F2FD" },
      { name: "Twitter/X", icon: "🐦", url: "https://x.com", color: "#000", bg: "#F5F5F5" },
      { name: "TikTok", icon: "🎵", url: "https://tiktok.com", color: "#FF0050", bg: "#FFE4E8" },
      { name: "YouTube", icon: "▶️", url: "https://youtube.com", color: "#FF0000", bg: "#FFEBEE" },
      { name: "Telegram", icon: "✈️", url: "https://web.telegram.org", color: "#0088CC", bg: "#E3F2FD" },
      { name: "Snapchat", icon: "👻", url: "https://snapchat.com", color: "#FFDD00", bg: "#FFFDE7" },
    ],
  },
  {
    label: "Official & Gov",
    emoji: "🏛️",
    color: "#1565C0",
    bg: "#e3f0ff",
    apps: [
      { name: "NADRA", icon: "🪪", url: "https://nadra.gov.pk", color: "#1565C0", bg: "#E3F2FD" },
      { name: "Pakistan.gov", icon: "🇵🇰", url: "https://pakistan.gov.pk", color: "#01411C", bg: "#E8F5E9" },
      { name: "FBR", icon: "💰", url: "https://fbr.gov.pk", color: "#BF360C", bg: "#FBE9E7" },
      { name: "State Bank", icon: "🏦", url: "https://sbp.org.pk", color: "#1A237E", bg: "#E8EAF6" },
      { name: "HEC", icon: "🎓", url: "https://hec.gov.pk", color: "#33691E", bg: "#F1F8E9" },
      { name: "PTCL", icon: "📞", url: "https://ptcl.com.pk", color: "#E65100", bg: "#FBE9E7" },
      { name: "Jazz", icon: "📶", url: "https://jazz.com.pk", color: "#BF360C", bg: "#FBE9E7" },
      { name: "Zong", icon: "📡", url: "https://zong.com.pk", color: "#006064", bg: "#E0F7FA" },
    ],
  },
  {
    label: "News & Media",
    emoji: "📰",
    color: "#D32F2F",
    bg: "#ffecec",
    apps: [
      { name: "ARY News", icon: "📺", url: "https://arynews.tv", color: "#D32F2F", bg: "#FFEBEE" },
      { name: "Geo News", icon: "🗞️", url: "https://geo.tv", color: "#1B5E20", bg: "#E8F5E9" },
      { name: "Dawn News", icon: "🌅", url: "https://dawn.com", color: "#1565C0", bg: "#E3F2FD" },
      { name: "Express", icon: "⚡", url: "https://express.pk", color: "#E65100", bg: "#FBE9E7" },
      { name: "Dunya TV", icon: "📻", url: "https://dunyanews.tv", color: "#880E4F", bg: "#FCE4EC" },
      { name: "BBC Urdu", icon: "🌍", url: "https://bbc.com/urdu", color: "#B71C1C", bg: "#FFEBEE" },
      { name: "Al Jazeera", icon: "🎙️", url: "https://aljazeera.net", color: "#006C35", bg: "#E8F5E9" },
      { name: "VOA Urdu", icon: "📡", url: "https://www.urduvoa.com", color: "#263238", bg: "#ECEFF1" },
    ],
  },
  {
    label: "Islamic Apps",
    emoji: "☪️",
    color: "#2E7D32",
    bg: "#e8f5e9",
    apps: [
      { name: "Quran.com", icon: "📖", url: "https://quran.com", color: "#2E7D32", bg: "#E8F5E9" },
      { name: "Athan.pro", icon: "🕌", url: "https://athan.pro", color: "#1565C0", bg: "#E3F2FD" },
      { name: "Muslim Pro", icon: "☪️", url: "https://muslimpro.com", color: "#4A148C", bg: "#F3E5F5" },
      { name: "Hadith.com", icon: "📚", url: "https://sunnah.com", color: "#BF360C", bg: "#FBE9E7" },
      { name: "Quran Radio", icon: "📻", url: "https://quranradio.com", color: "#006064", bg: "#E0F7FA" },
      { name: "IslamQA", icon: "🤲", url: "https://islamqa.info", color: "#33691E", bg: "#F1F8E9" },
      { name: "Seekers", icon: "✨", url: "https://seekersguidance.org", color: "#F57F17", bg: "#FFF8E1" },
      { name: "Duas.org", icon: "🕊️", url: "https://duas.org", color: "#880E4F", bg: "#FCE4EC" },
    ],
  },
  {
    label: "Education & Tools",
    emoji: "🎓",
    color: "#00695C",
    bg: "#e0f7f4",
    apps: [
      { name: "Wikipedia", icon: "📔", url: "https://wikipedia.org", color: "#000", bg: "#F5F5F5" },
      { name: "Google", icon: "🔍", url: "https://google.com", color: "#4285F4", bg: "#E3F2FD" },
      { name: "Translate", icon: "🌐", url: "https://translate.google.com", color: "#4285F4", bg: "#E3F2FD" },
      { name: "Gmail", icon: "📧", url: "https://gmail.com", color: "#D32F2F", bg: "#FFEBEE" },
      { name: "Drive", icon: "💾", url: "https://drive.google.com", color: "#0F9D58", bg: "#E8F5E9" },
      { name: "GitHub", icon: "⚙️", url: "https://github.com", color: "#333", bg: "#ECEFF1" },
      { name: "Stack Over", icon: "📦", url: "https://stackoverflow.com", color: "#F48024", bg: "#FFF3E0" },
      { name: "ChatGPT", icon: "🤖", url: "https://chat.openai.com", color: "#10A37F", bg: "#E8F5E8" },
    ],
  },
  {
    label: "International",
    emoji: "🌍",
    color: "#00838F",
    bg: "#e0f7fa",
    apps: [
      { name: "Reddit", icon: "🔴", url: "https://reddit.com", color: "#FF4500", bg: "#FBE9E7" },
      { name: "LinkedIn", icon: "💼", url: "https://linkedin.com", color: "#0077B5", bg: "#E3F2FD" },
      { name: "Discord", icon: "🎮", url: "https://discord.com", color: "#5865F2", bg: "#EDE7F6" },
      { name: "Medium", icon: "✍️", url: "https://medium.com", color: "#000", bg: "#F5F5F5" },
      { name: "Quora", icon: "❓", url: "https://quora.com", color: "#B92B27", bg: "#FFEBEE" },
      { name: "Pinterest", icon: "📌", url: "https://pinterest.com", color: "#E60023", bg: "#FFEBEE" },
      { name: "Twitch", icon: "🎮", url: "https://twitch.tv", color: "#9146FF", bg: "#EDE7F6" },
      { name: "Amazon", icon: "🛒", url: "https://amazon.com", color: "#FF9900", bg: "#FFF8E1" },
    ],
  },
];

// ─────────────────────────────────────────────────────────────────────────────

const ChatsPage: React.FC<ChatsPageProps> = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeGroup, setActiveGroup] = useState<string | null>(null);

  const handleGoogleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    window.open(`https://www.google.com/search?q=${encodeURIComponent(searchQuery)}`, "_blank");
  };

  const openApp = (url: string, name: string) => {
    window.open(url, "_blank", "noopener,noreferrer");
    toast.success(`Opening ${name}...`);
  };

  const filteredGroups = searchQuery
    ? appGroups.map((g) => ({
        ...g,
        apps: g.apps.filter((a) =>
          a.name.toLowerCase().includes(searchQuery.toLowerCase())
        ),
      })).filter((g) => g.apps.length > 0)
    : appGroups;

  return (
    <div className="relative min-h-screen" style={{ paddingBottom: "72px", background: "#f7f3ff" }}>

      {/* ── Top bar ───────────────────────────────────────────────── */}
      <div
        className="sticky top-0 z-30 px-3 pt-3 pb-3"
        style={{
          background: "linear-gradient(135deg,#4527A0,#7B1FA2,#C2185B)",
          boxShadow: "0 4px 20px rgba(69,39,160,0.45)",
        }}
      >
        {/* Brand row */}
        <div className="flex items-center justify-center gap-2 mb-2.5">
          <span className="text-white text-lg font-extrabold tracking-wide">It's Me</span>
          <span className="text-white/40 text-xs">|</span>
          <span className="text-white/80 text-sm" style={{ fontFamily: "'Amiri',serif" }}>آنس می</span>
        </div>

        {/* Google-style search bar */}
        <form onSubmit={handleGoogleSearch} className="relative">
          <div
            className="flex items-center bg-white rounded-2xl px-3 py-2.5 shadow-lg"
            style={{ border: "1.5px solid rgba(124,77,255,0.18)" }}
          >
            {/* Google G */}
            <svg width="18" height="18" viewBox="0 0 24 24" className="flex-shrink-0 mr-2">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search Google or apps…"
              className="flex-1 text-sm text-gray-700 outline-none bg-transparent placeholder-gray-400"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="text-gray-400 ml-1"
              >
                ✕
              </button>
            )}
            <button type="submit" className="ml-2">
              <Search size={15} className="text-purple-500" />
            </button>
          </div>
        </form>

        {/* Category pill filters */}
        <div className="flex gap-1.5 mt-2.5 overflow-x-auto scrollbar-hide pb-0.5">
          <button
            onClick={() => setActiveGroup(null)}
            className="flex-shrink-0 px-3 py-1 rounded-full text-[11px] font-bold transition-all"
            style={{
              background: activeGroup === null ? "rgba(255,255,255,0.95)" : "rgba(255,255,255,0.18)",
              color: activeGroup === null ? "#7C4DFF" : "#fff",
            }}
          >
            All
          </button>
          {appGroups.map((g) => (
            <button
              key={g.label}
              onClick={() => setActiveGroup(activeGroup === g.label ? null : g.label)}
              className="flex-shrink-0 px-3 py-1 rounded-full text-[11px] font-bold transition-all"
              style={{
                background: activeGroup === g.label ? "rgba(255,255,255,0.95)" : "rgba(255,255,255,0.18)",
                color: activeGroup === g.label ? "#7C4DFF" : "#fff",
              }}
            >
              {g.emoji} {g.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── App Grid ─────────────────────────────────────────────── */}
      <div className="bg-white">
        {filteredGroups
          .filter((g) => activeGroup === null || g.label === activeGroup)
          .map((group) => (
            <div key={group.label} className="mb-1">
              {/* Section header */}
              <div
                className="px-4 py-2 flex items-center gap-2.5 sticky z-10"
                style={{
                  top: "120px",
                  background: group.bg,
                  borderBottom: `2px solid ${group.color}20`,
                }}
              >
                <div className="w-1.5 h-4 rounded-full flex-shrink-0" style={{ background: group.color }} />
                <p className="text-xs font-extrabold uppercase tracking-wider" style={{ color: group.color }}>
                  {group.emoji} {group.label}
                </p>
              </div>

              {/* 4-column icon grid */}
              <div className="grid grid-cols-4 gap-0 bg-white">
                {group.apps.map((app) => (
                  <button
                    key={app.name}
                    className="flex flex-col items-center gap-1.5 py-4 px-1.5 hover:bg-gray-50 active:scale-90 transition-all"
                    onClick={() => openApp(app.url, app.name)}
                  >
                    <div
                      className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-sm"
                      style={{
                        background: app.bg,
                        border: `1px solid ${app.color}25`,
                        boxShadow: `0 2px 8px ${app.color}18`,
                      }}
                    >
                      <span style={{ fontSize: "28px", lineHeight: 1 }}>{app.icon}</span>
                    </div>
                    <span
                      className="text-center font-medium leading-tight w-full px-0.5"
                      style={{
                        fontSize: "9.5px",
                        color: "#444",
                        wordBreak: "break-word",
                      }}
                    >
                      {app.name}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          ))}

        {filteredGroups.length === 0 && (
          <div className="text-center py-16">
            <div className="text-5xl mb-3">🔍</div>
            <p className="text-gray-500 font-semibold">No apps found</p>
            <p className="text-gray-400 text-sm mt-1">Try a different search term</p>
          </div>
        )}

        {/* Padding */}
        <div className="h-6" />
      </div>
    </div>
  );
};

export default ChatsPage;
