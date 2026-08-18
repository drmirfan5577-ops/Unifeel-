import React, { useState, useRef, useEffect } from "react";
import { statuses, contacts as localContacts } from "@/data/chatData";
import {
  Plus, Camera, Search, MessageCircle, Phone, Video,
  Pin, BellOff, Lock, Users, UserPlus, X, ChevronLeft,
  Send, Mic, Smile, Paperclip, Image, FileText, Check, CheckCheck,
  MoreVertical, Play, Pause,
} from "lucide-react";
import AnimatedBackground from "@/components/layout/AnimatedBackground";
import StoryCreatorPage from "@/pages/StoryCreatorPage";
import MediaGalleryPage from "@/pages/MediaGalleryPage";
import GroupChatCreator from "@/components/features/GroupChatCreator";
import type { Contact, Message } from "@/types";
import { supabase } from "@/lib/supabase";
import { messages as localMessages } from "@/data/chatData";
import { toast } from "sonner";
import { usePushNotifications } from "@/hooks/usePushNotifications";

interface UpdatesPageProps {
  onCall?: (contact: Contact, type: "voice" | "video") => void;
}

interface StoryItem {
  id: string;
  name: string;
  avatar: string;
  time: string;
  seen: boolean;
  count: number;
  content?: string;
  bg?: string;
}

// ─── Story Viewer ────────────────────────────────────────────────────────────
const StoryViewer: React.FC<{ story: StoryItem; onClose: () => void }> = ({ story, onClose }) => {
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    const t = setInterval(() => {
      setProgress((p) => { if (p >= 100) { onClose(); return 0; } return p + 2; });
    }, 100);
    return () => clearInterval(t);
  }, []);
  return (
    <div className="fixed inset-0 z-[150] flex flex-col" style={{ background: story.bg || "linear-gradient(135deg,#7C4DFF,#E040FB)" }}>
      <div className="absolute top-0 left-0 right-0 p-2 z-10">
        <div className="h-1 bg-white/30 rounded-full overflow-hidden">
          <div className="h-full bg-white rounded-full transition-all" style={{ width: `${progress}%` }} />
        </div>
      </div>
      <div className="flex items-center gap-3 px-4 pt-8 pb-4 z-10">
        <img src={story.avatar} className="w-10 h-10 rounded-full object-cover border-2 border-white/50" alt={story.name} />
        <div className="flex-1">
          <p className="text-white font-semibold text-sm">{story.name}</p>
          <p className="text-white/60 text-xs">{story.time}</p>
        </div>
        <button onClick={onClose} className="w-9 h-9 bg-black/30 rounded-full flex items-center justify-center">
          <span className="text-white text-xl leading-none">×</span>
        </button>
      </div>
      <div className="flex-1 flex items-center justify-center px-8">
        {story.content ? (
          <p className="text-white text-2xl font-bold text-center leading-snug" style={{ textShadow: "0 2px 10px rgba(0,0,0,0.3)" }}>{story.content}</p>
        ) : (
          <img src={story.avatar} alt="" className="w-full rounded-2xl object-cover max-h-[60vh]" />
        )}
      </div>
    </div>
  );
};

// ─── Voice Message Player ─────────────────────────────────────────────────────
const VoiceMessage: React.FC<{ url: string; duration: number; isSent: boolean }> = ({ url, duration, isSent }) => {
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);
  const fmt = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, "0")}`;

  const toggle = () => {
    if (!audioRef.current) return;
    if (playing) { audioRef.current.pause(); setPlaying(false); }
    else { audioRef.current.play(); setPlaying(true); }
  };

  return (
    <div className="flex items-center gap-2" style={{ minWidth: "160px", maxWidth: "220px" }}>
      <audio ref={audioRef} src={url}
        onEnded={() => { setPlaying(false); setProgress(0); }}
        onTimeUpdate={() => {
          if (audioRef.current && audioRef.current.duration)
            setProgress((audioRef.current.currentTime / audioRef.current.duration) * 100);
        }}
      />
      <button onClick={toggle}
        className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm"
        style={{ background: isSent ? "rgba(255,255,255,0.3)" : "linear-gradient(135deg,#7C4DFF,#E040FB)" }}>
        {playing
          ? <Pause size={15} color={isSent ? "#4527A0" : "white"} />
          : <Play size={15} color={isSent ? "#4527A0" : "white"} fill={isSent ? "#4527A0" : "white"} />}
      </button>
      <div className="flex-1">
        {/* Waveform bars */}
        <div className="flex items-center gap-px h-6 mb-0.5">
          {Array.from({ length: 24 }).map((_, i) => {
            const barH = [3, 5, 8, 12, 8, 5, 10, 14, 10, 7, 5, 8, 12, 8, 5, 10, 14, 10, 8, 5, 7, 10, 6, 4][i];
            const filled = (i / 24) * 100 <= progress;
            return (
              <div key={i} className="rounded-full flex-1"
                style={{
                  height: `${barH}px`,
                  background: filled
                    ? (isSent ? "#4527A0" : "#7C4DFF")
                    : (isSent ? "rgba(69,39,160,0.3)" : "#D1C4E9"),
                  transition: "background 0.1s",
                }} />
            );
          })}
        </div>
        <span className="text-[10px]" style={{ color: isSent ? "rgba(69,39,160,0.7)" : "#9E9E9E" }}>{fmt(duration)}</span>
      </div>
      <Mic size={12} className={isSent ? "text-purple-300 flex-shrink-0" : "text-gray-400 flex-shrink-0"} />
    </div>
  );
};

// ─── Inline Chat Detail ───────────────────────────────────────────────────────
const InlineChatDetail: React.FC<{
  contact: Contact;
  onBack: () => void;
  onCall?: (contact: Contact, type: "voice" | "video") => void;
}> = ({ contact, onBack, onCall }) => {
  const [msgs, setMsgs] = useState<Message[]>(localMessages);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [showAttach, setShowAttach] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [showGallery, setShowGallery] = useState(false);
  const [msgSearch, setMsgSearch] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { sendLocalNotification } = usePushNotifications();

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgs]);

  // Polling for real backend messages
  useEffect(() => {
    const interval = setInterval(async () => {
      const { data } = await supabase
        .from("messages")
        .select("*")
        .eq("conversation_id", contact.id)
        .order("created_at", { ascending: true })
        .limit(100);
      if (data && data.length > 0) {
        setMsgs(data.map((m: any) => ({
          id: m.id,
          text: m.content || "",
          time: new Date(m.created_at).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
          isSent: m.sender_id === "me",
          status: m.status || "sent",
          mediaUrl: m.media_url,
          type: m.type,
          duration: m.duration_seconds,
        })));
      }
    }, 3000);
    return () => clearInterval(interval);
  }, [contact.id]);

  const sendMessage = async (text?: string, mediaUrl?: string, type = "text", duration?: number) => {
    const content = text || input.trim();
    if (!content && !mediaUrl) return;
    const newMsg: Message = {
      id: Date.now().toString(),
      text: content || "",
      time: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
      isSent: true,
      status: "sent",
      type: type as any,
      mediaUrl,
      duration,
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
        const replies = [
          "وعلیکم السلام! 😊", "جی، ٹھیک ہے!", "بالکل! ✅", "شکریہ! 🙏",
          "ابھی آتا ہوں", "اچھا، سمجھ گیا!", "👍", "ہاں بالکل!", "کیا حال ہے؟ 😊",
        ];
        const replyMsg: Message = {
          id: (Date.now() + 1).toString(),
          text: replies[Math.floor(Math.random() * replies.length)],
          time: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
          isSent: false,
        };
        setMsgs((prev) => [...prev, replyMsg]);
        // Push notify if page not visible
        sendLocalNotification(`💬 ${contact.name}`, replyMsg.text, contact.avatar, `msg_${contact.id}`);
      }, 1200 + Math.random() * 800);
    }
  };

  const handleFileUpload = async (file: File) => {
    if (!file) return;
    const ext = file.name.split(".").pop();
    const path = `chat/${Date.now()}.${ext}`;
    let publicUrl = URL.createObjectURL(file);
    try {
      const { error } = await supabase.storage.from("itsme-media").upload(path, file, { contentType: file.type });
      if (!error) {
        const { data } = supabase.storage.from("itsme-media").getPublicUrl(path);
        publicUrl = data.publicUrl;
      }
    } catch {}
    const type = file.type.startsWith("image") ? "image"
      : file.type.startsWith("video") ? "video"
      : file.type.startsWith("audio") ? "audio"
      : "document";
    await sendMessage(file.name, publicUrl, type);
    toast.success("File sent! ✅");
  };

  const startVoiceRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeType = MediaRecorder.isTypeSupported("audio/webm") ? "audio/webm" : "audio/ogg";
      const recorder = new MediaRecorder(stream, { mimeType });
      audioChunksRef.current = [];
      recorder.ondataavailable = (e) => { if (e.data.size > 0) audioChunksRef.current.push(e.data); };
      recorder.start(100);
      mediaRecorderRef.current = recorder;
      setIsRecording(true);
      setRecordingTime(0);
      recordingTimerRef.current = setInterval(() => setRecordingTime((t) => t + 1), 1000);
    } catch {
      toast.error("Microphone access denied");
    }
  };

  const stopVoiceRecording = async (cancel = false) => {
    if (!mediaRecorderRef.current) return;
    const recorder = mediaRecorderRef.current;
    const duration = recordingTime;
    if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
    setIsRecording(false);
    setRecordingTime(0);
    recorder.stream?.getTracks().forEach((t) => t.stop());
    if (cancel) { recorder.stop(); return; }
    recorder.onstop = async () => {
      const blob = new Blob(audioChunksRef.current, { type: recorder.mimeType });
      const ext = recorder.mimeType.includes("webm") ? "webm" : "ogg";
      const path = `voice/${Date.now()}.${ext}`;
      let publicUrl = URL.createObjectURL(blob);
      try {
        const { error } = await supabase.storage.from("itsme-media").upload(path, blob);
        if (!error) {
          const { data } = supabase.storage.from("itsme-media").getPublicUrl(path);
          publicUrl = data.publicUrl;
        }
      } catch {}
      const voiceMsg: Message = {
        id: Date.now().toString(),
        text: "",
        time: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
        isSent: true,
        status: "sent",
        type: "voice",
        mediaUrl: publicUrl,
        duration,
      };
      setMsgs((p) => [...p, voiceMsg]);
      toast.success("Voice message sent! 🎙️");
    };
    recorder.stop();
  };

  const handleGallerySelect = (url: string, type: string, name: string) => {
    setShowGallery(false);
    const msgType = type === "image" ? "image" : type === "video" ? "video" : type === "audio" ? "audio" : "document";
    sendMessage(name, url, msgType);
  };

  const filteredMsgs = msgSearch
    ? msgs.filter((m) => m.text.toLowerCase().includes(msgSearch.toLowerCase()))
    : msgs;

  const fmtTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, "0")}`;

  if (showGallery) {
    return <MediaGalleryPage onBack={() => setShowGallery(false)} onSelectMedia={handleGallerySelect} selectMode />;
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col animate-slideInRight" style={{ background: "#f0eeff" }}>
      {/* Header */}
      <div className="flex items-center gap-2 px-3 py-2.5 relative z-10"
        style={{ background: "linear-gradient(135deg,#4527A0,#7B1FA2,#C2185B)", boxShadow: "0 3px 16px rgba(69,39,160,0.4)" }}>
        <button onClick={onBack} className="w-9 h-9 flex items-center justify-center rounded-full bg-white/15 flex-shrink-0">
          <ChevronLeft size={20} color="white" />
        </button>
        <div className="relative flex-shrink-0">
          <img src={contact.avatar} className="w-9 h-9 rounded-full object-cover border-2 border-white/30" alt={contact.name} />
          {contact.online && <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 rounded-full border-2 border-white" />}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-white text-sm truncate">{contact.name}</p>
          <p className="text-white/70 text-xs">
            {isTyping ? "⌨️ typing..." : contact.online ? "🟢 online" : "last seen recently"}
          </p>
        </div>
        <div className="flex gap-1">
          <button onClick={() => setShowSearch(!showSearch)} className="w-8 h-8 flex items-center justify-center rounded-full bg-white/15">
            <Search size={15} color="white" />
          </button>
          <button onClick={() => onCall?.(contact, "video")} className="w-8 h-8 flex items-center justify-center rounded-full bg-white/15">
            <Video size={15} color="white" />
          </button>
          <button onClick={() => onCall?.(contact, "voice")} className="w-8 h-8 flex items-center justify-center rounded-full bg-white/15">
            <Phone size={15} color="white" />
          </button>
          <button className="w-8 h-8 flex items-center justify-center rounded-full bg-white/15">
            <MoreVertical size={15} color="white" />
          </button>
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

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1.5"
        style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='40' height='40' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='20' cy='20' r='1' fill='%237C4DFF' fill-opacity='0.05'/%3E%3C/svg%3E\")" }}>
        {filteredMsgs.map((msg) => (
          <div key={msg.id} className={`flex ${msg.isSent ? "justify-end" : "justify-start"} animate-fadeIn`}>
            {!msg.isSent && (
              <img src={contact.avatar} className="w-6 h-6 rounded-full object-cover mr-1.5 mt-1 flex-shrink-0" alt="" />
            )}
            <div className={msg.isSent ? "msg-sent" : "msg-received"} style={{ maxWidth: "78%", padding: "7px 11px 5px" }}>
              {msg.type === "voice" && msg.mediaUrl && (
                <VoiceMessage url={msg.mediaUrl} duration={msg.duration || 0} isSent={msg.isSent} />
              )}
              {msg.type === "image" && msg.mediaUrl && (
                <img src={msg.mediaUrl} alt="img" className="rounded-xl mb-1 max-w-full" style={{ maxHeight: "200px", objectFit: "cover", width: "100%" }} />
              )}
              {msg.type === "video" && msg.mediaUrl && (
                <video src={msg.mediaUrl} controls playsInline className="rounded-xl mb-1 w-full" style={{ maxHeight: "180px" }} />
              )}
              {msg.type === "audio" && msg.mediaUrl && (
                <audio src={msg.mediaUrl} controls className="w-full mb-1" style={{ height: "36px" }} />
              )}
              {msg.type === "document" && (
                <div className="flex items-center gap-2 mb-1">
                  <FileText size={18} className="text-blue-500 flex-shrink-0" />
                  <span className="text-sm font-medium text-gray-700 truncate">{msg.text}</span>
                </div>
              )}
              {(!msg.type || msg.type === "text") && (
                <p className="text-sm text-gray-800 leading-snug">{msg.text}</p>
              )}
              {(msg.type === "image" || msg.type === "video") && msg.text && (
                <p className="text-xs text-gray-600 mt-1">{msg.text}</p>
              )}
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
              {[0, 1, 2].map((i) => (
                <div key={i} className="w-2 h-2 rounded-full bg-purple-400" style={{ animation: "pulse 1.2s ease-in-out infinite", animationDelay: `${i * 0.2}s` }} />
              ))}
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Attachment panel */}
      {showAttach && (
        <div className="px-4 py-3 bg-white border-t border-gray-100">
          <input ref={fileInputRef} type="file" className="hidden" accept="*/*"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) { handleFileUpload(f); setShowAttach(false); } }} />
          <div className="grid grid-cols-4 gap-2">
            {[
              { icon: Image, label: "Gallery", color: "#7C4DFF", bg: "#EDE7F6",
                onClick: () => { setShowAttach(false); setShowGallery(true); } },
              { icon: Camera, label: "Camera", color: "#E040FB", bg: "#FCE4EC",
                onClick: () => { if (fileInputRef.current) { fileInputRef.current.accept = "image/*"; fileInputRef.current.click(); } setShowAttach(false); } },
              { icon: FileText, label: "Document", color: "#2196F3", bg: "#E3F2FD",
                onClick: () => { if (fileInputRef.current) { fileInputRef.current.accept = "*/*"; fileInputRef.current.click(); } setShowAttach(false); } },
              { icon: Mic, label: "Audio", color: "#FF9800", bg: "#FFF3E0",
                onClick: () => { if (fileInputRef.current) { fileInputRef.current.accept = "audio/*,video/*"; fileInputRef.current.click(); } setShowAttach(false); } },
            ].map(({ icon: Icon, label, color, bg, onClick }) => (
              <button key={label} className="flex flex-col items-center gap-1.5 active:scale-90 transition-transform" onClick={onClick}>
                <div className="w-11 h-11 rounded-2xl flex items-center justify-center" style={{ background: bg }}>
                  <Icon size={20} style={{ color }} />
                </div>
                <p className="text-[10px] text-gray-500 font-medium">{label}</p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Recording indicator */}
      {isRecording && (
        <div className="px-4 py-2.5 bg-red-50 border-t border-red-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-red-500" style={{ animation: "blink 1s ease-in-out infinite" }} />
            <span className="text-red-600 text-sm font-bold">Recording… {fmtTime(recordingTime)}</span>
          </div>
          <div className="flex gap-2">
            <button onClick={() => stopVoiceRecording(true)} className="w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center">
              <X size={16} className="text-gray-500" />
            </button>
            <button onClick={() => stopVoiceRecording(false)} className="w-9 h-9 rounded-full bg-purple-500 flex items-center justify-center">
              <Send size={15} color="white" />
            </button>
          </div>
        </div>
      )}

      {/* Input bar */}
      <div className="px-3 py-2 bg-white border-t border-gray-100" style={{ paddingBottom: "calc(0.5rem + env(safe-area-inset-bottom,0px))" }}>
        <div className="flex items-center gap-1.5">
          <button className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100 flex-shrink-0">
            <Smile size={20} className="text-gray-400" />
          </button>
          <div className="flex-1 flex items-center bg-gray-100 rounded-3xl px-3.5 py-2" style={{ minHeight: "42px" }}>
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              placeholder="Message…"
              className="flex-1 bg-transparent text-sm text-gray-800 outline-none placeholder-gray-400"
            />
            <button onClick={() => setShowAttach(!showAttach)} className="ml-2 flex-shrink-0">
              <Paperclip size={16} className="text-gray-400" />
            </button>
          </div>
          {input.trim() ? (
            <button onClick={() => sendMessage()}
              className="w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0 active:scale-90 transition-transform shadow-md"
              style={{ background: "linear-gradient(135deg,#7C4DFF,#E040FB)", boxShadow: "0 4px 14px rgba(124,77,255,0.45)" }}>
              <Send size={18} color="white" />
            </button>
          ) : (
            <button
              onMouseDown={startVoiceRecording}
              onMouseUp={() => stopVoiceRecording(false)}
              onTouchStart={(e) => { e.preventDefault(); startVoiceRecording(); }}
              onTouchEnd={(e) => { e.preventDefault(); stopVoiceRecording(false); }}
              className="w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0 active:scale-90 transition-transform shadow-md"
              style={{
                background: isRecording
                  ? "linear-gradient(135deg,#F44336,#B71C1C)"
                  : "linear-gradient(135deg,#7C4DFF,#E040FB)",
                boxShadow: "0 4px 14px rgba(124,77,255,0.45)",
              }}>
              <Mic size={18} color="white" />
            </button>
          )}
        </div>
      </div>
      <style>{`@keyframes blink { 0%,100%{opacity:1} 50%{opacity:0.3} }`}</style>
    </div>
  );
};

// ─── Chat Item ────────────────────────────────────────────────────────────────
const ChatItem: React.FC<{
  contact: Contact;
  onOpen: (c: Contact) => void;
  onCall?: (c: Contact, type: "voice" | "video") => void;
}> = ({ contact, onOpen, onCall }) => (
  <div className="chat-item px-4 py-3 flex items-center gap-3 cursor-pointer relative" onClick={() => onOpen(contact)} style={{ minHeight: "68px" }}>
    {contact.unread > 0 && !contact.isMuted && (
      <div className="absolute left-0 top-4 bottom-4 rounded-r-full" style={{ width: "3px", background: "linear-gradient(180deg,#7C4DFF,#E040FB)" }} />
    )}
    <div className="relative flex-shrink-0">
      <div className="rounded-full overflow-hidden" style={{ width: "50px", height: "50px",
        border: contact.unread > 0 && !contact.isMuted ? "2px solid transparent" : "2px solid #eee",
        background: contact.unread > 0 && !contact.isMuted ? "linear-gradient(white,white) padding-box, linear-gradient(135deg,#7C4DFF,#E040FB) border-box" : "none",
        padding: contact.unread > 0 ? "1px" : "0" }}>
        <img src={contact.avatar} alt={contact.name} className="rounded-full object-cover w-full h-full block" loading="lazy" />
      </div>
      {contact.online && <div className="absolute" style={{ bottom: "1px", right: "1px", width: "11px", height: "11px", background: "#4CAF50", borderRadius: "50%", border: "2px solid white" }} />}
      {contact.isPinned && (
        <div className="absolute -top-1 -left-1 w-4 h-4 rounded-full flex items-center justify-center" style={{ background: "linear-gradient(135deg,#7C4DFF,#E040FB)" }}>
          <Pin size={7} color="white" />
        </div>
      )}
    </div>
    <div className="flex-1 min-w-0">
      <div className="flex items-center justify-between mb-0.5">
        <span className="font-semibold text-gray-900 text-sm truncate flex items-center gap-1 max-w-[65%]">
          {contact.isLive && <span className="text-white text-[8px] font-bold px-1 py-0.5 rounded uppercase leading-none flex-shrink-0" style={{ background: "linear-gradient(90deg,#FF4081,#F44336)" }}>LIVE</span>}
          {contact.name}
        </span>
        <div className="flex items-center gap-1 flex-shrink-0">
          <Lock size={8} className="text-gray-300" />
          <span className="text-[10px] text-gray-400">{contact.time}</span>
        </div>
      </div>
      <div className="flex items-center justify-between">
        <p className="text-xs text-gray-400 truncate" style={{ maxWidth: "70%" }}>
          {contact.isMuted ? "🔇 " : ""}{contact.lastMessage}
        </p>
        <div className="flex items-center gap-1 flex-shrink-0">
          {contact.unread > 0 && (
            <span className="text-[10px] font-bold text-white rounded-full flex items-center justify-center"
              style={{ background: contact.isMuted ? "#9E9E9E" : "linear-gradient(135deg,#7C4DFF,#E040FB)", minWidth: "18px", height: "18px", padding: "0 4px" }}>
              {contact.unread}
            </span>
          )}
          {contact.isMuted && contact.unread === 0 && <BellOff size={11} className="text-gray-300" />}
        </div>
      </div>
    </div>
  </div>
);

// ─── Main UpdatesPage ─────────────────────────────────────────────────────────
const UpdatesPage: React.FC<UpdatesPageProps> = ({ onCall }) => {
  const [showCreator, setShowCreator] = useState(false);
  const [myStories, setMyStories] = useState<StoryItem[]>([]);
  const [viewingStory, setViewingStory] = useState<StoryItem | null>(null);
  const [openChat, setOpenChat] = useState<Contact | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState<"all" | "unread" | "groups">("all");
  const [showContactSearch, setShowContactSearch] = useState(false);
  const [showGroupCreator, setShowGroupCreator] = useState(false);
  const [contactSearchQuery, setContactSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  const [extraContacts, setExtraContacts] = useState<Contact[]>([]);
  const { permission, requestPermission } = usePushNotifications();

  const allContacts = [...localContacts, ...extraContacts];
  const allStatuses: StoryItem[] = [...statuses];

  const filtered = allContacts.filter((c) => {
    const matchSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.lastMessage.toLowerCase().includes(searchQuery.toLowerCase());
    const matchFilter = filter === "all" ? true : filter === "unread" ? c.unread > 0 : !!c.isGroup;
    return matchSearch && matchFilter;
  });
  const totalUnread = allContacts.reduce((sum, c) => sum + c.unread, 0);

  const searchContacts = async (q: string) => {
    if (!q.trim()) { setSearchResults([]); return; }
    setSearching(true);
    const { data } = await supabase.from("user_profiles").select("id, username, email")
      .or(`username.ilike.%${q}%,email.ilike.%${q}%`).limit(20);
    setSearching(false);
    if (data) setSearchResults(data);
  };

  const handlePostStory = (story: { content: string; bg: string; textColor: string; type: string }) => {
    setMyStories((p) => [...p, {
      id: Date.now().toString(),
      name: "My Status",
      avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop",
      time: "Just now",
      seen: true,
      count: 1,
      content: story.content,
      bg: story.bg,
    }]);
  };

  if (openChat) return <InlineChatDetail contact={openChat} onBack={() => setOpenChat(null)} onCall={onCall} />;
  if (showGroupCreator) return (
    <GroupChatCreator
      onClose={() => setShowGroupCreator(false)}
      onGroupCreated={(g) => { setExtraContacts((p) => [g, ...p]); setShowGroupCreator(false); setOpenChat(g); }}
    />
  );
  if (showCreator) return <StoryCreatorPage onClose={() => setShowCreator(false)} onPost={handlePostStory} />;
  if (viewingStory) return <StoryViewer story={viewingStory} onClose={() => setViewingStory(null)} />;

  if (showContactSearch) {
    return (
      <div className="min-h-screen" style={{ background: "#f0e8ff", paddingBottom: "72px" }}>
        <div className="app-header px-4 pt-4 pb-3 sticky top-0 z-50" style={{ background: "linear-gradient(135deg,#E040FB,#7C4DFF)" }}>
          <div className="flex items-center gap-3 mb-3">
            <button onClick={() => setShowContactSearch(false)} className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center"><X size={18} color="white" /></button>
            <h1 className="text-base font-bold text-white">Find & Add Contacts</h1>
          </div>
          <div className="relative">
            <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input autoFocus value={contactSearchQuery}
              onChange={(e) => { setContactSearchQuery(e.target.value); searchContacts(e.target.value); }}
              placeholder="Search by name or email..."
              className="w-full search-input pl-10 pr-4 py-2.5 text-sm outline-none" />
          </div>
        </div>
        <div className="px-4 pt-4">
          {searching && <p className="text-center text-gray-400 text-sm py-6">Searching…</p>}
          {!searching && contactSearchQuery && searchResults.length === 0 && (
            <div className="text-center py-10"><div className="text-4xl mb-3">🔍</div><p className="text-gray-500 font-medium">No users found</p></div>
          )}
          {searchResults.map((user) => (
            <div key={user.id} className="bg-white rounded-2xl shadow-sm p-4 flex items-center gap-3 mb-2">
              <div className="w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold text-white flex-shrink-0"
                style={{ background: "linear-gradient(135deg,#7C4DFF,#E040FB)" }}>
                {(user.username || user.email)[0].toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-800 text-sm">{user.username || "Unknown"}</p>
                <p className="text-gray-400 text-xs truncate">{user.email}</p>
              </div>
              <button onClick={() => {
                const c: Contact = { id: user.id, name: user.username || user.email, avatar: `https://ui-avatars.com/api/?name=${user.username}&background=7C4DFF&color=fff`, lastMessage: "Start a conversation", time: "now", unread: 0, online: false };
                setShowContactSearch(false); setOpenChat(c);
              }} className="px-4 py-2 rounded-xl text-white text-xs font-bold flex-shrink-0" style={{ background: "linear-gradient(135deg,#7C4DFF,#E040FB)" }}>Chat</button>
            </div>
          ))}
          {!contactSearchQuery && (
            <div className="text-center py-12">
              <div className="text-5xl mb-3">👥</div>
              <p className="text-gray-600 font-semibold">Find People on unifeel</p>
              <p className="text-gray-400 text-sm mt-2">Search by name or email to connect</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="page-content relative" style={{ background: "#f0e8ff" }}>
      <AnimatedBackground overlay="rgba(240,232,255,0.92)" />

      {/* Header */}
      <div className="sticky top-0 z-20" style={{ background: "linear-gradient(135deg,#4527A0,#7B1FA2,#C2185B)", boxShadow: "0 4px 20px rgba(69,39,160,0.4)" }}>
        <div className="px-3 pt-3 pb-2.5">
          <div className="flex items-center justify-between mb-2.5">
            <div className="flex items-center gap-2">
              <Users size={18} color="white" />
              <h1 className="text-base font-extrabold text-white">Guests</h1>
              <span className="text-white/50 text-xs font-light" style={{ fontFamily: "'Amiri',serif" }}>مہمان</span>
              {totalUnread > 0 && (
                <span className="text-white text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: "rgba(255,64,129,0.8)" }}>{totalUnread}</span>
              )}
            </div>
            <div className="flex gap-1.5">
              <button onClick={() => setShowContactSearch(true)} className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                <UserPlus size={15} color="white" />
              </button>
              <button onClick={() => setShowGroupCreator(true)} className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center" title="New Group">
                <Users size={15} color="white" />
              </button>
              <button
                onClick={() => permission !== "granted" ? requestPermission() : toast.info("Notifications already enabled ✅")}
                className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center" title="Push Notifications"
              >
                <div className={`w-2.5 h-2.5 rounded-full ${permission === "granted" ? "bg-green-400" : "bg-yellow-300"}`} />
              </button>
              <button onClick={() => setShowCreator(true)} className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                <Camera size={15} color="white" />
              </button>
            </div>
          </div>

          <div className="relative mb-2.5">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search conversations…"
              className="w-full search-input pl-9 pr-4 py-2 text-sm outline-none" />
          </div>

          <div className="flex gap-1.5">
            {(["all", "unread", "groups"] as const).map((f) => (
              <button key={f} onClick={() => setFilter(f)}
                className="px-3.5 py-1 rounded-full text-[11px] font-semibold transition-all capitalize"
                style={{ background: filter === f ? "rgba(255,255,255,0.95)" : "rgba(255,255,255,0.18)", color: filter === f ? "#7C4DFF" : "#fff" }}>
                {f}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Story row */}
      <div className="bg-white border-b border-gray-100">
        <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-50">
          <div className="relative flex-shrink-0">
            <div className="w-14 h-14 rounded-full overflow-hidden"
              style={{ border: myStories.length > 0 ? "2.5px solid transparent" : "2px solid #eee", background: myStories.length > 0 ? "linear-gradient(135deg,#7C4DFF,#E040FB) padding-box, linear-gradient(135deg,#7C4DFF,#E040FB) border-box" : "none" }}>
              <img src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop" alt="My Status" className="w-full h-full object-cover rounded-full" />
            </div>
            <button onClick={() => setShowCreator(true)} className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center shadow-md" style={{ background: "linear-gradient(135deg,#7C4DFF,#E040FB)" }}>
              <Plus size={13} color="white" />
            </button>
          </div>
          <div className="flex-1">
            <p className="font-semibold text-gray-800 text-sm">My Status</p>
            <p className="text-gray-400 text-xs mt-0.5">{myStories.length > 0 ? `${myStories.length} update${myStories.length > 1 ? "s" : ""}` : "Tap + to add status"}</p>
          </div>
          <button onClick={() => setShowCreator(true)} className="px-3 py-1.5 rounded-full text-xs font-bold text-white flex-shrink-0" style={{ background: "linear-gradient(135deg,#7C4DFF,#E040FB)" }}>+ Story</button>
        </div>
        <div className="px-4 py-3">
          <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-1">
            {[...myStories, ...allStatuses.slice(1)].map((s, i) => (
              <div key={s.id + i} onClick={() => setViewingStory(s)} className="flex flex-col items-center gap-1.5 cursor-pointer flex-shrink-0">
                <div className="rounded-full overflow-hidden" style={{ width: "56px", height: "56px", padding: "2.5px", background: s.seen ? "rgba(0,0,0,0.1)" : "linear-gradient(135deg,#7C4DFF,#E040FB,#FF4081)" }}>
                  <img src={s.avatar} alt={s.name} className="w-full h-full object-cover rounded-full" style={{ border: "2px solid white" }} />
                </div>
                <p className="text-[10px] text-gray-500 font-medium truncate w-14 text-center">{s.name.split(" ")[0]}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* E2E notice */}
      <div className="flex items-center gap-1.5 px-4 py-1.5 border-b border-purple-100" style={{ background: "#f3eeff" }}>
        <Lock size={10} className="text-purple-500 flex-shrink-0" />
        <p className="text-[11px] text-purple-600 font-medium">End-to-end encrypted · خفیہ کاری محفوظ</p>
      </div>

      {/* Chat list */}
      <div className="bg-white">
        {filter === "all" && allContacts.filter((c) => c.isPinned).map((c) => (
          <ChatItem key={c.id} contact={c} onOpen={setOpenChat} onCall={onCall} />
        ))}
        {filter === "all" && allContacts.filter((c) => c.isPinned).length > 0 && (
          <div className="px-4 py-1.5 bg-gray-50 border-y border-gray-100">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">All Conversations</p>
          </div>
        )}
        {filtered.filter((c) => filter !== "all" || !c.isPinned).map((c) => (
          <ChatItem key={c.id} contact={c} onOpen={setOpenChat} onCall={onCall} />
        ))}
      </div>

      {/* Channels */}
      <div className="bg-white mt-2 mb-20">
        <div className="px-4 py-2 bg-gray-50 border-b border-gray-100">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">📢 Channels</p>
        </div>
        {[
          { name: "unifeel Official", sub: "Latest app updates & news", emoji: "💬", color: "#7C4DFF", members: "2.1M" },
          { name: "Islamic Reminders", sub: "Daily Hadith & Duas", emoji: "🕌", color: "#4CAF50", members: "850K" },
          { name: "Tech Pakistan", sub: "Technology news Pakistan", emoji: "🖥️", color: "#2196F3", members: "340K" },
        ].map((ch) => (
          <div key={ch.name} className="flex items-center gap-3 px-4 py-3 border-b border-gray-50 cursor-pointer hover:bg-purple-50 transition-colors">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0" style={{ background: `${ch.color}18` }}>{ch.emoji}</div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-800 text-sm">{ch.name}</p>
              <p className="text-xs text-gray-400 truncate">{ch.sub}</p>
            </div>
            <div className="text-right">
              <p className="text-xs font-bold" style={{ color: ch.color }}>{ch.members}</p>
              <button className="mt-1 text-xs px-3 py-1 rounded-full font-semibold text-white" style={{ background: ch.color }}>Follow</button>
            </div>
          </div>
        ))}
      </div>

      {/* FAB stack */}
      <div className="fixed z-30 flex flex-col items-center gap-2" style={{ bottom: "80px", right: "16px" }}>
        <button onClick={() => setShowGroupCreator(true)}
          className="w-11 h-11 rounded-full flex items-center justify-center shadow-lg active:scale-90 transition-transform"
          style={{ background: "linear-gradient(135deg,#00BCD4,#0097A7)", boxShadow: "0 4px 14px rgba(0,188,212,0.4)" }}>
          <Users size={18} color="white" />
        </button>
        <button onClick={() => setShowContactSearch(true)}
          className="w-14 h-14 rounded-full flex items-center justify-center shadow-2xl active:scale-90 transition-transform"
          style={{ background: "linear-gradient(135deg,#7C4DFF,#E040FB)", boxShadow: "0 6px 20px rgba(124,77,255,0.5)" }}>
          <MessageCircle size={22} color="white" />
        </button>
      </div>
    </div>
  );
};

export default UpdatesPage;
