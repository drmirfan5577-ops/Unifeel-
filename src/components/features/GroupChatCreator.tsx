import React, { useState } from "react";
import { contacts } from "@/data/chatData";
import { X, Search, Check, Users, Camera, ChevronLeft, Plus } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import type { Contact } from "@/types";

interface GroupChatCreatorProps {
  onClose: () => void;
  onGroupCreated: (group: Contact) => void;
}

const GroupChatCreator: React.FC<GroupChatCreatorProps> = ({ onClose, onGroupCreated }) => {
  const [step, setStep] = useState<"select" | "setup">(1 > 0 ? "select" : "setup");
  const [selected, setSelected] = useState<Contact[]>([]);
  const [groupName, setGroupName] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [creating, setCreating] = useState(false);
  const [groupAvatar, setGroupAvatar] = useState<string>("");
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const allContacts = contacts.filter((c) => !c.isGroup);

  const filtered = allContacts.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleContact = (c: Contact) => {
    setSelected((prev) =>
      prev.find((s) => s.id === c.id)
        ? prev.filter((s) => s.id !== c.id)
        : [...prev, c]
    );
  };

  const handleAvatarUpload = async (file: File) => {
    const url = URL.createObjectURL(file);
    setGroupAvatar(url);
    try {
      const path = `groups/${Date.now()}.${file.name.split(".").pop()}`;
      const { error } = await supabase.storage.from("itsme-media").upload(path, file);
      if (!error) {
        const { data } = supabase.storage.from("itsme-media").getPublicUrl(path);
        setGroupAvatar(data.publicUrl);
      }
    } catch {}
  };

  const createGroup = async () => {
    if (!groupName.trim()) { toast.error("Enter group name"); return; }
    if (selected.length < 2) { toast.error("Add at least 2 members"); return; }
    setCreating(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        // Create conversation in backend
        const { data: conv } = await supabase.from("conversations").insert({
          type: "group",
          name: groupName.trim(),
          avatar: groupAvatar || null,
          created_by: user.id,
        }).select().single();

        if (conv) {
          // Add members (creator + selected contacts)
          const memberInserts = [
            { conversation_id: conv.id, user_id: user.id },
            ...selected.map((c) => ({ conversation_id: conv.id, user_id: c.id })),
          ];
          await supabase.from("conversation_members").insert(memberInserts);
        }
      }
    } catch (err) {
      console.log("Backend group creation:", err);
    }

    // Create local group contact
    const newGroup: Contact = {
      id: Date.now().toString(),
      name: groupName.trim(),
      avatar: groupAvatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(groupName)}&background=7C4DFF&color=fff&size=100`,
      lastMessage: `Group created · ${selected.length + 1} members`,
      time: "Just now",
      unread: 0,
      online: false,
      isGroup: true,
    };

    setCreating(false);
    toast.success(`Group "${groupName}" created! 🎉`);
    onGroupCreated(newGroup);
  };

  if (step === "setup") {
    return (
      <div className="fixed inset-0 z-[60] flex flex-col" style={{ background: "#f0e8ff" }}>
        {/* Header */}
        <div className="flex items-center gap-3 px-4 pt-4 pb-3"
          style={{ background: "linear-gradient(135deg,#4527A0,#7B1FA2,#C2185B)", boxShadow: "0 4px 16px rgba(69,39,160,0.4)" }}>
          <button onClick={() => setStep("select")} className="w-9 h-9 bg-white/15 rounded-full flex items-center justify-center">
            <ChevronLeft size={19} color="white" />
          </button>
          <div className="flex-1">
            <h2 className="text-base font-bold text-white">Group Setup</h2>
            <p className="text-white/60 text-xs">{selected.length} members selected</p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-4 pt-5 space-y-5">
          {/* Group avatar */}
          <div className="flex flex-col items-center gap-3">
            <div className="relative">
              <div
                className="w-24 h-24 rounded-3xl overflow-hidden flex items-center justify-center cursor-pointer"
                style={{ background: groupAvatar ? "transparent" : "linear-gradient(135deg,#7C4DFF,#E040FB)" }}
                onClick={() => fileInputRef.current?.click()}
              >
                {groupAvatar ? (
                  <img src={groupAvatar} className="w-full h-full object-cover" alt="" />
                ) : (
                  <div className="text-center">
                    <Camera size={28} color="white" className="mx-auto mb-1" />
                    <p className="text-white text-[10px]">Add Photo</p>
                  </div>
                )}
              </div>
              <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full flex items-center justify-center shadow-lg"
                style={{ background: "linear-gradient(135deg,#7C4DFF,#E040FB)" }}
                onClick={() => fileInputRef.current?.click()}>
                <Camera size={13} color="white" />
              </div>
            </div>
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) handleAvatarUpload(f); }} />
          </div>

          {/* Group name */}
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 block">Group Name</label>
            <input
              autoFocus
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              placeholder="Enter group name…"
              maxLength={50}
              className="w-full bg-white rounded-2xl px-4 py-3.5 text-sm text-gray-800 outline-none shadow-sm border-2 border-transparent focus:border-purple-400 transition-colors"
            />
            <p className="text-right text-xs text-gray-400 mt-1">{groupName.length}/50</p>
          </div>

          {/* Selected members preview */}
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Members ({selected.length + 1})</label>
            <div className="flex flex-wrap gap-2">
              {/* Me */}
              <div className="flex flex-col items-center gap-1">
                <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-purple-400">
                  <img src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop" className="w-full h-full object-cover" alt="Me" />
                </div>
                <p className="text-[10px] text-gray-500">You</p>
              </div>
              {selected.map((c) => (
                <div key={c.id} className="flex flex-col items-center gap-1 relative">
                  <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-pink-400">
                    <img src={c.avatar} className="w-full h-full object-cover" alt={c.name} />
                  </div>
                  <button onClick={() => toggleContact(c)}
                    className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-400 flex items-center justify-center shadow">
                    <X size={9} color="white" />
                  </button>
                  <p className="text-[10px] text-gray-500 truncate w-12 text-center">{c.name.split(" ")[0]}</p>
                </div>
              ))}
              <button onClick={() => setStep("select")} className="flex flex-col items-center gap-1">
                <div className="w-12 h-12 rounded-full border-2 border-dashed border-purple-300 flex items-center justify-center">
                  <Plus size={20} className="text-purple-400" />
                </div>
                <p className="text-[10px] text-gray-400">Add</p>
              </button>
            </div>
          </div>
        </div>

        <div className="px-4 py-4" style={{ paddingBottom: "calc(1rem + env(safe-area-inset-bottom,0px))" }}>
          <button
            onClick={createGroup}
            disabled={!groupName.trim() || selected.length < 2 || creating}
            className="w-full py-4 rounded-2xl text-white font-bold text-base disabled:opacity-40 active:scale-95 transition-transform"
            style={{ background: "linear-gradient(135deg,#7C4DFF,#E040FB)", boxShadow: "0 6px 20px rgba(124,77,255,0.4)" }}
          >
            {creating ? "Creating…" : `Create Group (${selected.length + 1} members)`}
          </button>
        </div>
      </div>
    );
  }

  // Step 1: Select contacts
  return (
    <div className="fixed inset-0 z-[60] flex flex-col" style={{ background: "#f0e8ff" }}>
      {/* Header */}
      <div className="flex items-center gap-3 px-4 pt-4 pb-3"
        style={{ background: "linear-gradient(135deg,#4527A0,#7B1FA2,#C2185B)", boxShadow: "0 4px 16px rgba(69,39,160,0.4)" }}>
        <button onClick={onClose} className="w-9 h-9 bg-white/15 rounded-full flex items-center justify-center">
          <X size={18} color="white" />
        </button>
        <div className="flex-1">
          <h2 className="text-base font-bold text-white">New Group Chat</h2>
          <p className="text-white/60 text-xs">Select at least 2 members</p>
        </div>
        {selected.length >= 2 && (
          <button onClick={() => setStep("setup")}
            className="px-4 py-2 rounded-full text-sm font-bold text-white"
            style={{ background: "rgba(255,255,255,0.25)" }}>
            Next →
          </button>
        )}
      </div>

      {/* Selected chips */}
      {selected.length > 0 && (
        <div className="flex gap-2 px-4 py-2 bg-white border-b border-gray-100 overflow-x-auto scrollbar-hide">
          {selected.map((c) => (
            <div key={c.id} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full flex-shrink-0"
              style={{ background: "linear-gradient(135deg,#7C4DFF20,#E040FB20)", border: "1px solid #7C4DFF30" }}>
              <img src={c.avatar} className="w-5 h-5 rounded-full object-cover" alt="" />
              <span className="text-xs font-medium text-purple-700">{c.name.split(" ")[0]}</span>
              <button onClick={() => toggleContact(c)}>
                <X size={11} className="text-purple-400" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Search */}
      <div className="px-4 py-2 bg-white border-b border-gray-100">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search contacts…"
            className="w-full bg-gray-100 rounded-xl pl-9 pr-4 py-2.5 text-sm outline-none"
          />
        </div>
      </div>

      {/* Contact list */}
      <div className="flex-1 overflow-y-auto bg-white">
        {filtered.map((c) => {
          const isSelected = !!selected.find((s) => s.id === c.id);
          return (
            <div key={c.id} onClick={() => toggleContact(c)}
              className="flex items-center gap-3 px-4 py-3 cursor-pointer active:bg-purple-50 transition-colors border-b border-gray-50">
              <div className="relative flex-shrink-0">
                <img src={c.avatar} className="w-12 h-12 rounded-full object-cover" alt={c.name} />
                {c.online && <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 rounded-full border-2 border-white" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-800 text-sm">{c.name}</p>
                <p className="text-xs text-gray-400 truncate">{c.lastMessage}</p>
              </div>
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 transition-all"
                style={{ background: isSelected ? "linear-gradient(135deg,#7C4DFF,#E040FB)" : "#f0f0f0" }}
              >
                {isSelected && <Check size={14} color="white" />}
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom CTA */}
      {selected.length >= 2 && (
        <div className="px-4 py-3 bg-white border-t border-gray-100" style={{ paddingBottom: "calc(0.75rem + env(safe-area-inset-bottom,0px))" }}>
          <button onClick={() => setStep("setup")}
            className="w-full py-3.5 rounded-2xl text-white font-bold text-sm active:scale-95 transition-transform flex items-center justify-center gap-2"
            style={{ background: "linear-gradient(135deg,#7C4DFF,#E040FB)", boxShadow: "0 4px 16px rgba(124,77,255,0.4)" }}>
            <Users size={17} />
            Continue with {selected.length} members
          </button>
        </div>
      )}
    </div>
  );
};

export default GroupChatCreator;
