import React, { useState } from "react";
import { Plus, ExternalLink, Edit2, Trash2, Save, X } from "lucide-react";
import AnimatedBackground from "@/components/layout/AnimatedBackground";
import { getESHubLinks, saveESHubLinks } from "@/lib/store";

interface Link {
  id: string;
  title: string;
  url: string;
  icon: string;
  color: string;
}

const ESHubPage: React.FC = () => {
  const [links, setLinks] = useState<Link[]>(getESHubLinks());
  const [editing, setEditing] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [newLink, setNewLink] = useState({ title: "", url: "", icon: "🌐", color: "#00897B" });

  const handleSave = () => {
    if (!newLink.title || !newLink.url) return;
    const updated = [
      ...links,
      { ...newLink, id: Date.now().toString(), url: newLink.url.startsWith("http") ? newLink.url : `https://${newLink.url}` },
    ].slice(0, 10);
    setLinks(updated);
    saveESHubLinks(updated);
    setNewLink({ title: "", url: "", icon: "🌐", color: "#00897B" });
    setShowAdd(false);
  };

  const handleDelete = (id: string) => {
    const updated = links.filter((l) => l.id !== id);
    setLinks(updated);
    saveESHubLinks(updated);
  };

  const handleOpen = (url: string) => {
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const iconOptions = ["🌐", "📺", "💬", "👥", "📸", "🐦", "💼", "📧", "📖", "🛒", "🎵", "🎮", "📰", "🔬", "🏥"];
  const colorOptions = ["#00897B", "#1877F2", "#FF0000", "#E1306C", "#1DA1F2", "#0A66C2", "#EA4335", "#FF9900", "#000000", "#6C5CE7"];

  return (
    <div className="page-content relative">
      <AnimatedBackground overlay="rgba(240,255,252,0.9)" />

      <div className="app-header px-4 py-4 relative z-10">
        <h1 className="text-xl font-bold text-white">ES Hub</h1>
        <p className="text-teal-200 text-xs">External Services & Apps ({links.length}/10)</p>
      </div>

      <div className="relative z-10 px-4 pt-4">
        {/* Info card */}
        <div
          className="rounded-2xl p-4 mb-4 shadow-lg"
          style={{ background: "linear-gradient(135deg, #00897B, #4DB6AC)" }}
        >
          <p className="text-white font-semibold mb-1">🔗 Your External Services</p>
          <p className="text-teal-100 text-xs">
            Add up to 10 URLs or email links to embed your favorite apps and services directly.
          </p>
        </div>

        {/* Grid of links */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          {links.map((link) => (
            <div
              key={link.id}
              className="bg-white rounded-2xl shadow-md overflow-hidden group cursor-pointer hover:shadow-lg transition-all duration-200 active:scale-95"
            >
              <div
                className="h-16 flex items-center justify-center relative"
                style={{ background: `linear-gradient(135deg, ${link.color}22, ${link.color}44)` }}
              >
                <span className="text-3xl">{link.icon}</span>
                {/* Delete button */}
                <button
                  onClick={(e) => { e.stopPropagation(); handleDelete(link.id); }}
                  className="absolute top-1 right-1 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X size={12} color="white" />
                </button>
              </div>
              <div
                className="p-3 flex items-center justify-between"
                onClick={() => handleOpen(link.url)}
              >
                <div className="min-w-0">
                  <p className="font-semibold text-gray-800 text-sm truncate">{link.title}</p>
                  <p className="text-xs text-gray-400 truncate">{link.url.replace("https://", "")}</p>
                </div>
                <ExternalLink size={14} style={{ color: link.color }} className="flex-shrink-0 ml-2" />
              </div>
            </div>
          ))}

          {/* Add button */}
          {links.length < 10 && (
            <button
              onClick={() => setShowAdd(true)}
              className="bg-gray-50 rounded-2xl shadow-md border-2 border-dashed border-teal-300 flex flex-col items-center justify-center h-32 gap-2 hover:bg-teal-50 transition-colors"
            >
              <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center">
                <Plus size={20} className="text-teal-600" />
              </div>
              <p className="text-xs font-medium text-teal-600">Add Link</p>
            </button>
          )}
        </div>

        {/* List view */}
        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">All Services</p>
        {links.map((link, i) => (
          <div key={link.id} className="flex items-center gap-3 bg-white rounded-xl p-3 mb-2 shadow-sm">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
              style={{ background: `${link.color}22` }}
            >
              {link.icon}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-800 text-sm truncate">{link.title}</p>
              <p className="text-xs text-gray-400 truncate">{link.url}</p>
            </div>
            <div className="flex gap-1">
              <button
                onClick={() => handleOpen(link.url)}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-teal-50 transition-colors"
              >
                <ExternalLink size={15} className="text-teal-500" />
              </button>
              <button
                onClick={() => handleDelete(link.id)}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-red-50 transition-colors"
              >
                <Trash2 size={15} className="text-red-400" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add Link Modal */}
      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-end justify-center" style={{ background: "rgba(0,0,0,0.5)" }}>
          <div className="w-full max-w-[480px] bg-white rounded-t-3xl p-6 shadow-2xl animate-slideInRight">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-gray-800">Add New Link</h3>
              <button onClick={() => setShowAdd(false)} className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                <X size={16} className="text-gray-600" />
              </button>
            </div>

            <div className="space-y-3 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                <input
                  value={newLink.title}
                  onChange={(e) => setNewLink((p) => ({ ...p, title: e.target.value }))}
                  placeholder="e.g. My App"
                  className="w-full bg-gray-100 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">URL or Email *</label>
                <input
                  value={newLink.url}
                  onChange={(e) => setNewLink((p) => ({ ...p, url: e.target.value }))}
                  placeholder="https://... or mailto:..."
                  className="w-full bg-gray-100 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Icon</label>
                <div className="flex flex-wrap gap-2">
                  {iconOptions.map((ico) => (
                    <button
                      key={ico}
                      onClick={() => setNewLink((p) => ({ ...p, icon: ico }))}
                      className={`text-xl p-1.5 rounded-lg transition-all ${newLink.icon === ico ? "bg-teal-100 ring-2 ring-teal-500" : "bg-gray-100"}`}
                    >
                      {ico}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Color</label>
                <div className="flex flex-wrap gap-2">
                  {colorOptions.map((c) => (
                    <button
                      key={c}
                      onClick={() => setNewLink((p) => ({ ...p, color: c }))}
                      className={`w-8 h-8 rounded-full border-2 transition-all ${newLink.color === c ? "border-gray-800 scale-110" : "border-transparent"}`}
                      style={{ background: c }}
                    />
                  ))}
                </div>
              </div>
            </div>

            <button
              onClick={handleSave}
              className="w-full py-3.5 rounded-xl text-white font-semibold transition-all active:scale-95"
              style={{ background: "linear-gradient(135deg, #00897B, #4DB6AC)" }}
            >
              Save Link
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ESHubPage;
