import React, { useState } from "react";
import { Lock, Eye, EyeOff, Plus, FileText, Image, Video, Trash2, ChevronLeft, X } from "lucide-react";
import AnimatedBackground from "@/components/layout/AnimatedBackground";
import { getVaultPin, setVaultPin } from "@/lib/store";

interface PrivateVaultPageProps {
  onBack: () => void;
}

interface VaultNote {
  id: string;
  title: string;
  content: string;
  type: "note" | "image" | "video";
  date: string;
}

const PrivateVaultPage: React.FC<PrivateVaultPageProps> = ({ onBack }) => {
  const [unlocked, setUnlocked] = useState(false);
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [showPin, setShowPin] = useState(false);
  const [notes, setNotes] = useState<VaultNote[]>([
    { id: "1", title: "Personal Note", content: "Keep this private...", type: "note", date: "Jul 7, 2026" },
    { id: "2", title: "Important Info", content: "Confidential details...", type: "note", date: "Jul 6, 2026" },
  ]);
  const [addingNote, setAddingNote] = useState(false);
  const [newNote, setNewNote] = useState({ title: "", content: "" });

  const handleUnlock = () => {
    if (pin === getVaultPin()) {
      setUnlocked(true);
      setError("");
    } else {
      setError("Incorrect PIN. Try again.");
      setPin("");
    }
  };

  const handleAddNote = () => {
    if (!newNote.title) return;
    const note: VaultNote = {
      id: Date.now().toString(),
      title: newNote.title,
      content: newNote.content,
      type: "note",
      date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
    };
    setNotes((prev) => [note, ...prev]);
    setNewNote({ title: "", content: "" });
    setAddingNote(false);
  };

  const handleDelete = (id: string) => {
    setNotes((prev) => prev.filter((n) => n.id !== id));
  };

  const PinButton: React.FC<{ digit: string }> = ({ digit }) => (
    <button
      onClick={() => {
        if (digit === "⌫") setPin((p) => p.slice(0, -1));
        else if (pin.length < 4) setPin((p) => p + digit);
      }}
      className="w-16 h-16 rounded-full text-xl font-bold transition-all active:scale-90 flex items-center justify-center"
      style={{
        background: digit === "⌫" ? "#FFEBEE" : "rgba(255,255,255,0.95)",
        color: digit === "⌫" ? "#F44336" : "#333",
        boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
      }}
    >
      {digit}
    </button>
  );

  if (!unlocked) {
    return (
      <div className="min-h-screen relative flex flex-col">
        <AnimatedBackground overlay="rgba(20,10,40,0.8)" />
        <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-6">
          <button onClick={onBack} className="absolute top-6 left-6 w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
            <ChevronLeft size={20} color="white" />
          </button>

          <div
            className="w-20 h-20 rounded-3xl mb-5 flex items-center justify-center shadow-2xl"
            style={{ background: "linear-gradient(135deg, #7B1FA2, #9C27B0)" }}
          >
            <Lock size={36} color="white" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-1">Private Vault</h1>
          <p className="text-purple-200 text-sm mb-8">Enter your 4-digit PIN</p>

          {/* PIN display */}
          <div className="flex gap-4 mb-8">
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg"
                style={{
                  background: pin.length > i ? "rgba(255,255,255,0.95)" : "rgba(255,255,255,0.2)",
                  border: pin.length > i ? "2px solid #9C27B0" : "2px solid rgba(255,255,255,0.3)",
                }}
              >
                {pin.length > i && (
                  <div className="w-4 h-4 bg-purple-600 rounded-full" />
                )}
              </div>
            ))}
          </div>

          {error && <p className="text-red-300 text-sm mb-4 text-center">{error}</p>}

          {/* PIN pad */}
          <div className="grid grid-cols-3 gap-4">
            {["1","2","3","4","5","6","7","8","9","","0","⌫"].map((d, i) => (
              d === "" ? <div key={i} /> : <PinButton key={i} digit={d} />
            ))}
          </div>

          {pin.length === 4 && (
            <button
              onClick={handleUnlock}
              className="mt-6 px-8 py-3 rounded-xl text-white font-bold"
              style={{ background: "linear-gradient(135deg, #7B1FA2, #9C27B0)" }}
            >
              Unlock Vault
            </button>
          )}

          <p className="text-purple-300 text-xs mt-4">Default PIN: 1234</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-content relative">
      <AnimatedBackground overlay="rgba(243,229,245,0.92)" />
      <div
        className="relative z-10 px-4 py-4 flex items-center justify-between"
        style={{ background: "linear-gradient(135deg, #7B1FA2, #9C27B0)", boxShadow: "0 4px 20px rgba(123,31,162,0.4)" }}
      >
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="w-9 h-9 flex items-center justify-center rounded-full bg-white/20">
            <ChevronLeft size={20} color="white" />
          </button>
          <div>
            <h1 className="text-lg font-bold text-white">Private Vault</h1>
            <p className="text-purple-100 text-xs">🔐 Secured & Encrypted</p>
          </div>
        </div>
        <button onClick={() => setUnlocked(false)} className="text-white/70 text-xs px-3 py-1.5 bg-white/20 rounded-full">
          Lock
        </button>
      </div>

      <div className="relative z-10 px-4 pt-4">
        {/* Storage tabs */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          {[
            { icon: FileText, label: "Notes", color: "#7B1FA2" },
            { icon: Image, label: "Photos", color: "#1565C0" },
            { icon: Video, label: "Videos", color: "#E65100" },
          ].map((t) => {
            const Icon = t.icon;
            return (
              <div key={t.label} className="bg-white rounded-xl p-3 shadow-sm text-center cursor-pointer hover:shadow-md transition-shadow">
                <Icon size={22} style={{ color: t.color }} className="mx-auto mb-1" />
                <p className="text-xs font-semibold text-gray-700">{t.label}</p>
              </div>
            );
          })}
        </div>

        {/* Notes list */}
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Private Notes</p>
          <button
            onClick={() => setAddingNote(true)}
            className="flex items-center gap-1 text-purple-600 text-xs font-semibold"
          >
            <Plus size={14} /> Add Note
          </button>
        </div>

        {notes.map((note) => (
          <div key={note.id} className="bg-white rounded-xl p-4 mb-2 shadow-sm flex items-start gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <FileText size={18} className="text-purple-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-800 text-sm">{note.title}</p>
              <p className="text-gray-500 text-xs truncate">{note.content}</p>
              <p className="text-gray-300 text-xs mt-1">{note.date}</p>
            </div>
            <button onClick={() => handleDelete(note.id)} className="w-7 h-7 rounded-full hover:bg-red-50 flex items-center justify-center">
              <Trash2 size={14} className="text-red-400" />
            </button>
          </div>
        ))}

        <div className="mt-4 bg-white rounded-2xl p-4 shadow-md text-center">
          <p className="text-2xl mb-2">📁</p>
          <p className="text-gray-700 font-semibold text-sm">No need for a separate Gallery app!</p>
          <p className="text-gray-400 text-xs mt-1">All your photos, videos and documents are stored securely here. Tap the tabs above to manage your media files.</p>
        </div>
      </div>

      {/* Add Note Modal */}
      {addingNote && (
        <div className="fixed inset-0 z-50 flex items-end justify-center" style={{ background: "rgba(0,0,0,0.5)" }}>
          <div className="w-full max-w-[480px] bg-white rounded-t-3xl p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-800">New Private Note</h3>
              <button onClick={() => setAddingNote(false)} className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                <X size={16} className="text-gray-600" />
              </button>
            </div>
            <input
              value={newNote.title}
              onChange={(e) => setNewNote((p) => ({ ...p, title: e.target.value }))}
              placeholder="Title"
              className="w-full bg-gray-100 rounded-xl px-4 py-2.5 text-sm font-semibold outline-none focus:ring-2 focus:ring-purple-500 mb-3"
            />
            <textarea
              value={newNote.content}
              onChange={(e) => setNewNote((p) => ({ ...p, content: e.target.value }))}
              placeholder="Write your private note here..."
              rows={4}
              className="w-full bg-gray-100 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-purple-500 mb-4 resize-none"
            />
            <button
              onClick={handleAddNote}
              className="w-full py-3.5 rounded-xl text-white font-semibold"
              style={{ background: "linear-gradient(135deg, #7B1FA2, #9C27B0)" }}
            >
              Save Privately
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PrivateVaultPage;
