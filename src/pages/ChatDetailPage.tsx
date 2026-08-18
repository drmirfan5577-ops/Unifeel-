// ChatDetailPage — re-exports InlineChatDetail from UpdatesPage
// Direct contact-to-chat navigation wrapper
import React, { useState, useRef, useEffect } from "react";
import {
  ChevronLeft, Phone, Video, MoreVertical, Send,
  Mic, Smile, Paperclip, Image, Camera, FileText,
  Check, CheckCheck, Lock, Search, X
} from "lucide-react";
import type { Contact, Message } from "@/types";
import { supabase } from "@/lib/supabase";
import { messages as localMessages } from "@/data/chatData";
import { toast } from "sonner";

interface ChatDetailPageProps {
  contact: Contact;
  onBack: () => void;
  onCall?: (contact: Contact, type: "voice" | "video") => void;
}

const ChatDetailPage: React.FC<ChatDetailPageProps> = ({ contact, onBack, onCall }) => {
  const [msgs, setMsgs] = useState<Message[]>(localMessages);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [showAttach, setShowAttach] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [msgSearch, setMsgSearch] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgs]);

  useEffect(() => {
    const interval = setInterval(async () => {
      const { data } = await supabase
        .from("messages")
        .select("*")
        .eq("conversation_id", contact.id)
        .order("created_at", { ascending: true })
        .limit(100);
      if (data && data.length > 0) {
        setMsgs(
          data.map((m: any) => ({
            id: m.id,
            text: m.content || "",
            time: new Date(m.created_at).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
            isSent: m.sender_id === "me",
            status: m.status || "sent",
            mediaUrl: m.media_url,
            type: m.type,
          }))
        );
      }
    }, 3000);
    return () => clearInterval(interval);
  }, [contact.id]);

  const sendMessage = async (text?: string, mediaUrl?: string, type = "text") => {
    const content = text || input.trim();
    if (!content && !mediaUrl) return;
    const newMsg: Message = {
      id: Date.now().toString(),
      text: content || "",
      time: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
      isSent: true,
      status: "sent",
    };
    setMsgs((prev) => [...prev, newMsg]);
    if (!text) setInput("");

    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase.from("messages").insert({
        conversation_id: contact.id,
        sender_id: user.id,
        content: content || "",
        type,
        media_url: mediaUrl || null,
        status: "sent",
      });
    }

    if (type === "text") {
      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
        const replies = ["وعلیکم السلام! 😊", "جی، ٹھیک ہے!", "بالکل! ✅", "شکریہ! 🙏", "ابھی آتا ہوں", "اچھا! 👍"];
        setMsgs((prev) => [...prev, {
          id: (Date.now() + 1).toString(),
          text: replies[Math.floor(Math.random() * replies.length)],
          time: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
          isSent: false,
        }]);
      }, 1200 + Math.random() * 800);
    }
  };

  const handleFileUpload = async (file: File) => {
    const ext = file.name.split(".").pop();
    const path = `${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("itsme-media").upload(path, file, { contentType: file.type });
    if (error) { toast.error("Upload failed"); return; }
    const { data: { publicUrl } } = supabase.storage.from("itsme-media").getPublicUrl(path);
    const type = file.type.startsWith("image") ? "image" : file.type.startsWith("video") ? "video" : file.type.startsWith("audio") ? "audio" : "document";
    await sendMessage(file.name, publicUrl, type);
    toast.success("File sent!");
  };

  const filteredMsgs = msgSearch
    ? msgs.filter((m) => m.text.toLowerCase().includes(msgSearch.toLowerCase()))
    : msgs;

  return (
    <div className="fixed inset-0 z-50 flex flex-col animate-slideInRight" style={{ background: "#f0eeff" }}>
      <div className="flex items-center gap-2 px-3 py-2.5 relative z-10"
        style={{ background: "linear-gradient(135deg,#4527A0,#7B1FA2,#C2185B)", boxShadow: "0 3px 16px rgba(69,39,160,0.4)" }}>
        <button onClick={onBack} className="w-9 h-9 flex items-center justify-center rounded-full bg-white/15">
          <ChevronLeft size={20} color="white" />
        </button>
        <div className="relative">
          <img src={contact.avatar} className="w-9 h-9 rounded-full object-cover border-2 border-white/30" alt={contact.name} />
          {contact.online && <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 rounded-full border-2 border-white" />}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-white text-sm truncate">{contact.name}</p>
          <p className="text-white/70 text-xs">{isTyping ? "⌨️ typing..." : contact.online ? "🟢 online" : "last seen recently"}</p>
        </div>
        <div className="flex gap-1">
          <button onClick={() => setShowSearch(!showSearch)} className="w-8 h-8 flex items-center justify-center rounded-full bg-white/15"><Search size={15} color="white" /></button>
          <button onClick={() => onCall?.(contact, "video")} className="w-8 h-8 flex items-center justify-center rounded-full bg-white/15"><Video size={15} color="white" /></button>
          <button onClick={() => onCall?.(contact, "voice")} className="w-8 h-8 flex items-center justify-center rounded-full bg-white/15"><Phone size={15} color="white" /></button>
          <button className="w-8 h-8 flex items-center justify-center rounded-full bg-white/15"><MoreVertical size={15} color="white" /></button>
        </div>
      </div>

      {showSearch && (
        <div className="flex items-center gap-2 px-3 py-2 bg-white border-b border-gray-100">
          <Search size={14} className="text-gray-400" />
          <input autoFocus value={msgSearch} onChange={(e) => setMsgSearch(e.target.value)} placeholder="Search messages..." className="flex-1 text-sm outline-none" />
          <button onClick={() => { setShowSearch(false); setMsgSearch(""); }}><X size={16} className="text-gray-400" /></button>
        </div>
      )}

      <div className="flex items-center justify-center gap-1 py-1 bg-purple-50 border-b border-purple-100">
        <Lock size={9} className="text-purple-400" />
        <p className="text-purple-500 text-[10px] font-medium">End-to-end encrypted</p>
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1.5"
        style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='40' height='40' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='20' cy='20' r='1' fill='%237C4DFF' fill-opacity='0.05'/%3E%3C/svg%3E\")" }}>
        {filteredMsgs.map((msg) => (
          <div key={msg.id} className={`flex ${msg.isSent ? "justify-end" : "justify-start"} animate-fadeIn`}>
            {!msg.isSent && <img src={contact.avatar} className="w-6 h-6 rounded-full object-cover mr-1.5 mt-1 flex-shrink-0" alt="" />}
            <div className={msg.isSent ? "msg-sent" : "msg-received"} style={{ maxWidth: "75%", padding: "7px 11px 5px" }}>
              {msg.mediaUrl && msg.type === "image" && (
                <img src={msg.mediaUrl} alt="media" className="rounded-xl mb-1 max-w-full" style={{ maxHeight: "200px", objectFit: "cover" }} />
              )}
              <p className="text-sm text-gray-800 leading-snug">{msg.text}</p>
              <div className={`flex items-center gap-0.5 mt-0.5 ${msg.isSent ? "justify-end" : "justify-start"}`}>
                <span className="text-[9px] text-gray-400">{msg.time}</span>
                {msg.isSent && (
                  msg.status === "read" ? <CheckCheck size={11} style={{ color: "#7C4DFF" }} /> :
                  msg.status === "delivered" ? <CheckCheck size={11} className="text-gray-400" /> :
                  <Check size={11} className="text-gray-400" />
                )}
              </div>
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-start animate-fadeIn">
            <img src={contact.avatar} className="w-6 h-6 rounded-full object-cover mr-1.5 mt-1 flex-shrink-0" alt="" />
            <div className="msg-received px-4 py-3 flex items-center gap-1">
              {[0, 1, 2].map(i => <div key={i} className="w-2 h-2 rounded-full bg-purple-400" style={{ animation: "pulse 1.2s ease-in-out infinite", animationDelay: `${i * 0.2}s` }} />)}
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {showAttach && (
        <div className="px-4 py-3 bg-white border-t border-gray-100">
          <input ref={fileInputRef} type="file" className="hidden" accept="*/*" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFileUpload(f); }} />
          <div className="grid grid-cols-4 gap-2">
            {[
              { icon: Image, label: "Gallery", color: "#7C4DFF", bg: "#EDE7F6", accept: "image/*" },
              { icon: Camera, label: "Camera", color: "#E040FB", bg: "#FCE4EC", accept: "image/*" },
              { icon: FileText, label: "Document", color: "#2196F3", bg: "#E3F2FD", accept: "*/*" },
              { icon: Mic, label: "Audio", color: "#FF9800", bg: "#FFF3E0", accept: "audio/*" },
            ].map(({ icon: Icon, label, color, bg, accept }) => (
              <button key={label} className="flex flex-col items-center gap-1.5 active:scale-90 transition-transform"
                onClick={() => { if (fileInputRef.current) { fileInputRef.current.accept = accept; fileInputRef.current.click(); } setShowAttach(false); }}>
                <div className="w-11 h-11 rounded-2xl flex items-center justify-center" style={{ background: bg }}>
                  <Icon size={20} style={{ color }} />
                </div>
                <p className="text-[10px] text-gray-500 font-medium">{label}</p>
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="px-3 py-2 bg-white border-t border-gray-100" style={{ paddingBottom: "calc(0.5rem + env(safe-area-inset-bottom,0px))" }}>
        <div className="flex items-center gap-1.5">
          <button className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100"><Smile size={20} className="text-gray-400" /></button>
          <div className="flex-1 flex items-center bg-gray-100 rounded-3xl px-3.5 py-2" style={{ minHeight: "42px" }}>
            <input ref={inputRef} type="text" value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && sendMessage()} placeholder="Message…" className="flex-1 bg-transparent text-sm text-gray-800 outline-none placeholder-gray-400" />
            <button onClick={() => setShowAttach(!showAttach)} className="ml-2"><Paperclip size={16} className="text-gray-400" /></button>
          </div>
          <button onClick={() => input.trim() ? sendMessage() : {}}
            className="w-11 h-11 rounded-full flex items-center justify-center active:scale-90 transition-transform shadow-md"
            style={{ background: "linear-gradient(135deg,#7C4DFF,#E040FB)", boxShadow: "0 4px 14px rgba(124,77,255,0.45)" }}>
            {input.trim() ? <Send size={18} color="white" /> : <Mic size={18} color="white" />}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatDetailPage;
