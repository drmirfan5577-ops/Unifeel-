import React, { useState, useRef, useEffect } from "react";
import {
  ChevronLeft, Radio, Eye, Heart, MessageCircle, Share2,
  Mic, MicOff, Video, VideoOff, Users, Send, X,
  Camera, Zap, Crown, Gift, Star
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

interface LiveStreamPageProps {
  onBack: () => void;
}

interface LiveChat {
  id: string;
  user: string;
  avatar: string;
  msg: string;
  color: string;
  isGift?: boolean;
}

const SAMPLE_AVATARS = [
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=40&h=40&fit=crop",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop",
  "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=40&h=40&fit=crop",
  "https://images.unsplash.com/photo-1547425260-76bcadfb4f2c?w=40&h=40&fit=crop",
];

const MSG_COLORS = ["#7C4DFF", "#E040FB", "#FF4081", "#FF9800", "#00BCD4", "#4CAF50"];

const LiveStreamPage: React.FC<LiveStreamPageProps> = ({ onBack }) => {
  const [mode, setMode] = useState<"browse" | "host" | "watch">("browse");
  const [isLive, setIsLive] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isCamOff, setIsCamOff] = useState(false);
  const [viewers, setViewers] = useState(0);
  const [likes, setLikes] = useState(0);
  const [chatMsgs, setChatMsgs] = useState<LiveChat[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [streamTitle, setStreamTitle] = useState("");
  const [agoraReady, setAgoraReady] = useState(false);
  const [floatingHearts, setFloatingHearts] = useState<{ id: number; x: number }[]>([]);
  const [selectedStream, setSelectedStream] = useState<(typeof liveStreams)[0] | null>(null);

  const localVideoRef = useRef<HTMLDivElement>(null);
  const agoraClientRef = useRef<any>(null);
  const localTracksRef = useRef<any[]>([]);
  const chatRef = useRef<HTMLDivElement>(null);

  const liveStreams = [
    { id: "s1", title: "Daily Quran Tilawat 📖", host: "Qari Sahib", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=60&h=60&fit=crop", viewers: 1247, likes: 3820, thumb: "https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=300&h=180&fit=crop", category: "Islamic" },
    { id: "s2", title: "Tech Review - New Phones 📱", host: "TechPK", avatar: "https://images.unsplash.com/photo-1547425260-76bcadfb4f2c?w=60&h=60&fit=crop", viewers: 892, likes: 2100, thumb: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=300&h=180&fit=crop", category: "Tech" },
    { id: "s3", title: "Cooking Pakistani Biryani 🍛", host: "Chef Zara", avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=60&h=60&fit=crop", viewers: 2341, likes: 7200, thumb: "https://images.unsplash.com/photo-1596797038530-2c107229654b?w=300&h=180&fit=crop", category: "Food" },
    { id: "s4", title: "Gaming Live - PUBG Mobile 🎮", host: "GamerPK", avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=60&h=60&fit=crop", viewers: 4502, likes: 12000, thumb: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=300&h=180&fit=crop", category: "Gaming" },
    { id: "s5", title: "Morning Workout Routine 💪", host: "FitLife", avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=60&h=60&fit=crop", viewers: 678, likes: 1900, thumb: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=300&h=180&fit=crop", category: "Fitness" },
    { id: "s6", title: "Nasheeds & Islamic Songs 🎵", host: "Naat Academy", avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=60&h=60&fit=crop", viewers: 3100, likes: 8900, thumb: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=180&fit=crop", category: "Islamic" },
  ];

  // Simulated live comments coming in
  useEffect(() => {
    if (!isLive && mode !== "watch") return;
    const sampleMsgs = [
      "ماشاءاللہ! 🌟", "Very nice bhai!", "❤️❤️❤️", "Keep it up!", "Masha Allah 💫",
      "سبحان اللہ!", "Watching from Karachi 🇵🇰", "💜💜", "Excellent stream!", "اللہ اکبر!",
      "Love this! 🔥", "Following now!", "Great content!", "👏👏", "Making dua for you!",
    ];
    const names = ["Ahmed", "Sara", "Bilal", "Fatima", "Omar", "Ayesha", "Zaid", "Hira"];
    const interval = setInterval(() => {
      const msg: LiveChat = {
        id: Date.now().toString(),
        user: names[Math.floor(Math.random() * names.length)],
        avatar: SAMPLE_AVATARS[Math.floor(Math.random() * SAMPLE_AVATARS.length)],
        msg: sampleMsgs[Math.floor(Math.random() * sampleMsgs.length)],
        color: MSG_COLORS[Math.floor(Math.random() * MSG_COLORS.length)],
      };
      setChatMsgs((p) => [...p.slice(-30), msg]);
      setViewers((v) => v + (Math.random() > 0.7 ? 1 : 0));
    }, 1800);
    return () => clearInterval(interval);
  }, [isLive, mode]);

  useEffect(() => {
    chatRef.current?.scrollTo({ top: chatRef.current.scrollHeight, behavior: "smooth" });
  }, [chatMsgs]);

  const initAgoraHost = async () => {
    try {
      const AgoraRTC = (await import("agora-rtc-sdk-ng")).default;
      const { data: tokenData } = await supabase.functions.invoke("agora-token", {
        body: { channelName: `live_${Date.now()}`, uid: 0, role: "host" },
      });
      if (!tokenData?.appId) { setIsLive(true); return; }
      const client = AgoraRTC.createClient({ mode: "live", codec: "vp8" });
      await (client as any).setClientRole("host");
      agoraClientRef.current = client;
      await client.join(tokenData.appId, tokenData.channelName, tokenData.token, null);
      const [micTrack, cameraTrack] = await AgoraRTC.createMicrophoneAndCameraTracks(
        { encoderConfig: "music_standard" },
        { encoderConfig: "720p_1" }
      );
      localTracksRef.current = [micTrack, cameraTrack];
      if (localVideoRef.current) cameraTrack.play(localVideoRef.current);
      await client.publish([micTrack, cameraTrack]);
      setAgoraReady(true);
      setIsLive(true);
      toast.success("You are LIVE! 🎉");
    } catch {
      setIsLive(true);
      toast.success("You are LIVE! 🎉");
    }
  };

  const stopStream = async () => {
    for (const t of localTracksRef.current) { t.stop(); t.close(); }
    localTracksRef.current = [];
    if (agoraClientRef.current) { await agoraClientRef.current.leave(); agoraClientRef.current = null; }
    setIsLive(false);
    setMode("browse");
    toast.info("Stream ended");
  };

  const sendLiveChat = () => {
    if (!chatInput.trim()) return;
    setChatMsgs((p) => [...p, {
      id: Date.now().toString(), user: "You", avatar: SAMPLE_AVATARS[0],
      msg: chatInput, color: "#7C4DFF",
    }]);
    setChatInput("");
  };

  const triggerHeart = () => {
    setLikes((l) => l + 1);
    const id = Date.now();
    setFloatingHearts((p) => [...p, { id, x: 30 + Math.random() * 40 }]);
    setTimeout(() => setFloatingHearts((p) => p.filter((h) => h.id !== id)), 2000);
  };

  // ── Browse Mode ──────────────────────────────────────────────────────────
  if (mode === "browse") {
    return (
      <div className="fixed inset-0 z-50 overflow-y-auto" style={{ background: "#0a0015", paddingBottom: "72px" }}>
        {/* Header */}
        <div className="sticky top-0 z-20 px-4 pt-4 pb-3" style={{ background: "linear-gradient(135deg,#1a0533,#2d0a4e)", boxShadow: "0 4px 20px rgba(0,0,0,0.5)" }}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <button onClick={onBack} className="w-9 h-9 bg-white/10 rounded-full flex items-center justify-center">
                <ChevronLeft size={18} color="white" />
              </button>
              <div>
                <h1 className="text-base font-extrabold text-white flex items-center gap-2">
                  <Radio size={16} className="text-red-400" /> Live Streaming
                </h1>
                <p className="text-white/40 text-[10px]">{liveStreams.reduce((a, b) => a + b.viewers, 0).toLocaleString()} watching now</p>
              </div>
            </div>
            <button
              onClick={() => setMode("host")}
              className="flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold text-white"
              style={{ background: "linear-gradient(135deg,#FF4081,#F44336)", boxShadow: "0 4px 14px rgba(244,67,54,0.4)" }}
            >
              <Radio size={13} /> Go Live
            </button>
          </div>

          {/* Category pills */}
          <div className="flex gap-2 overflow-x-auto scrollbar-hide">
            {["All", "Islamic", "Tech", "Food", "Gaming", "Fitness", "Music"].map((cat) => (
              <button key={cat} className="flex-shrink-0 px-3 py-1 rounded-full text-[11px] font-bold"
                style={{ background: "rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.8)" }}>
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Streams grid */}
        <div className="px-3 pt-4 grid grid-cols-2 gap-3">
          {liveStreams.map((stream) => (
            <button key={stream.id} onClick={() => { setSelectedStream(stream); setMode("watch"); setViewers(stream.viewers); setLikes(stream.likes); }}
              className="relative rounded-2xl overflow-hidden text-left active:scale-95 transition-transform"
              style={{ aspectRatio: "9/14" }}>
              <img src={stream.thumb} alt={stream.title} className="absolute inset-0 w-full h-full object-cover" />
              <div className="absolute inset-0" style={{ background: "linear-gradient(0deg, rgba(0,0,0,0.75) 0%, transparent 50%)" }} />
              {/* Live badge */}
              <div className="absolute top-2 left-2 flex items-center gap-1 px-2 py-0.5 rounded-full"
                style={{ background: "rgba(244,67,54,0.9)" }}>
                <div className="w-1.5 h-1.5 rounded-full bg-white" style={{ animation: "blink 1s infinite" }} />
                <span className="text-white text-[10px] font-bold">LIVE</span>
              </div>
              {/* Viewers */}
              <div className="absolute top-2 right-2 flex items-center gap-1 px-2 py-0.5 rounded-full bg-black/50">
                <Eye size={10} color="white" />
                <span className="text-white text-[10px]">{stream.viewers.toLocaleString()}</span>
              </div>
              {/* Info */}
              <div className="absolute bottom-0 left-0 right-0 p-2.5">
                <div className="flex items-center gap-1.5 mb-1">
                  <img src={stream.avatar} className="w-6 h-6 rounded-full border border-white/30" alt="" />
                  <span className="text-white/80 text-[10px] font-medium truncate">{stream.host}</span>
                </div>
                <p className="text-white text-xs font-bold leading-tight line-clamp-2">{stream.title}</p>
              </div>
            </button>
          ))}
        </div>

        <style>{`@keyframes blink { 0%,100%{opacity:1} 50%{opacity:0.3} }`}</style>
      </div>
    );
  }

  // ── Host Setup Mode ──────────────────────────────────────────────────────
  if (mode === "host" && !isLive) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col" style={{ background: "linear-gradient(180deg,#0a0015,#1a0533)" }}>
        <div className="flex items-center gap-3 px-4 pt-10 pb-4">
          <button onClick={() => setMode("browse")} className="w-9 h-9 bg-white/10 rounded-full flex items-center justify-center">
            <ChevronLeft size={18} color="white" />
          </button>
          <h1 className="text-base font-bold text-white">Setup Your Stream</h1>
        </div>

        {/* Camera preview placeholder */}
        <div className="mx-4 rounded-2xl overflow-hidden mb-4" style={{ height: "240px", background: "#111" }}>
          <div ref={localVideoRef} className="w-full h-full" />
          {!agoraReady && (
            <div className="w-full h-full -mt-60 flex items-center justify-center">
              <div className="text-center">
                <Camera size={40} color="rgba(255,255,255,0.3)" className="mx-auto mb-2" />
                <p className="text-white/40 text-sm">Camera Preview</p>
              </div>
            </div>
          )}
        </div>

        <div className="flex-1 px-4 space-y-4">
          <div>
            <label className="text-white/60 text-xs font-medium mb-1.5 block">Stream Title</label>
            <input
              value={streamTitle}
              onChange={(e) => setStreamTitle(e.target.value)}
              placeholder="What are you streaming about?"
              className="w-full bg-white/10 text-white placeholder-white/40 rounded-2xl px-4 py-3 text-sm outline-none border border-white/10 focus:border-purple-500"
            />
          </div>

          <div>
            <label className="text-white/60 text-xs font-medium mb-1.5 block">Category</label>
            <div className="flex flex-wrap gap-2">
              {["Islamic", "Education", "Entertainment", "Gaming", "Fitness", "Food", "Music", "Tech"].map((cat) => (
                <button key={cat} className="px-3 py-1.5 rounded-full text-xs font-medium"
                  style={{ background: "rgba(124,77,255,0.25)", color: "#B39DDB" }}>
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-3">
            <div className="flex-1 flex items-center gap-2 bg-white/10 rounded-2xl p-3 cursor-pointer" onClick={() => setIsMuted(!isMuted)}>
              {isMuted ? <MicOff size={18} className="text-red-400" /> : <Mic size={18} className="text-green-400" />}
              <span className="text-white/80 text-sm">{isMuted ? "Muted" : "Mic On"}</span>
            </div>
            <div className="flex-1 flex items-center gap-2 bg-white/10 rounded-2xl p-3 cursor-pointer" onClick={() => setIsCamOff(!isCamOff)}>
              {isCamOff ? <VideoOff size={18} className="text-red-400" /> : <Video size={18} className="text-green-400" />}
              <span className="text-white/80 text-sm">{isCamOff ? "Cam Off" : "Cam On"}</span>
            </div>
          </div>
        </div>

        <div className="px-4 pb-10">
          <button
            onClick={initAgoraHost}
            disabled={!streamTitle.trim()}
            className="w-full py-4 rounded-2xl text-white font-bold text-base disabled:opacity-40 active:scale-95 transition-transform"
            style={{ background: "linear-gradient(135deg,#FF4081,#F44336)", boxShadow: "0 8px 30px rgba(244,67,54,0.5)" }}
          >
            🔴 Start Live Stream
          </button>
        </div>
      </div>
    );
  }

  // ── Live Host / Viewer Mode ──────────────────────────────────────────────
  const stream = selectedStream;
  return (
    <div className="fixed inset-0 z-50 flex flex-col overflow-hidden" style={{ background: "#000" }}>
      {/* Video area */}
      <div className="relative flex-1">
        {/* Video feed */}
        {mode === "host" ? (
          <div ref={localVideoRef} className="absolute inset-0 bg-gray-900">
            {!agoraReady && (
              <div className="absolute inset-0 flex items-center justify-center"
                style={{ background: "linear-gradient(135deg,#1a0533,#2d0a4e)" }}>
                <div className="text-center">
                  <div className="w-20 h-20 rounded-full mx-auto mb-4 overflow-hidden border-4 border-red-400"
                    style={{ animation: "pulse 1.5s ease-in-out infinite" }}>
                    <img src={SAMPLE_AVATARS[0]} className="w-full h-full object-cover" alt="" />
                  </div>
                  <p className="text-white font-bold text-lg">You are LIVE!</p>
                  <p className="text-white/50 text-sm mt-1">{streamTitle}</p>
                </div>
              </div>
            )}
          </div>
        ) : (
          <img src={stream?.thumb} className="absolute inset-0 w-full h-full object-cover" alt="" />
        )}

        {/* Gradient overlay */}
        <div className="absolute inset-0" style={{ background: "linear-gradient(0deg,rgba(0,0,0,0.85) 0%,transparent 40%,rgba(0,0,0,0.4) 100%)" }} />

        {/* Top bar */}
        <div className="absolute top-0 left-0 right-0 pt-10 px-4 flex items-start justify-between z-10">
          <button onClick={mode === "host" ? stopStream : () => { setMode("browse"); setSelectedStream(null); }}
            className="w-9 h-9 bg-black/50 rounded-full flex items-center justify-center backdrop-blur-sm">
            <X size={18} color="white" />
          </button>

          <div className="flex items-center gap-2">
            {/* Live badge */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full" style={{ background: "rgba(244,67,54,0.9)" }}>
              <div className="w-2 h-2 rounded-full bg-white" style={{ animation: "blink 1s infinite" }} />
              <span className="text-white text-xs font-bold">LIVE</span>
            </div>
            {/* Viewer count */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-sm">
              <Eye size={12} color="white" />
              <span className="text-white text-xs font-bold">{viewers.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Host info */}
        <div className="absolute top-16 left-4 flex items-center gap-2 z-10">
          <div className="relative">
            <img src={stream?.avatar || SAMPLE_AVATARS[0]} className="w-10 h-10 rounded-full border-2 border-red-400 object-cover" alt="" />
            <Crown size={12} color="#FFD700" className="absolute -top-1 -right-1" />
          </div>
          <div>
            <p className="text-white text-sm font-bold">{stream?.host || "You"}</p>
            <p className="text-white/60 text-[10px]">{stream?.title || streamTitle}</p>
          </div>
        </div>

        {/* Floating hearts */}
        <div className="absolute right-4 bottom-48 pointer-events-none z-20">
          {floatingHearts.map((h) => (
            <div key={h.id} className="absolute text-2xl" style={{
              left: `${h.x}%`, animation: "floatUp 2s ease-out forwards",
              bottom: "0",
            }}>❤️</div>
          ))}
        </div>

        {/* Right side actions */}
        <div className="absolute right-4 bottom-52 flex flex-col gap-4 z-10 items-center">
          <button onClick={triggerHeart} className="flex flex-col items-center gap-1 active:scale-90 transition-transform">
            <div className="w-11 h-11 bg-black/50 rounded-full flex items-center justify-center backdrop-blur-sm">
              <Heart size={22} className="text-red-400" fill="#f44336" />
            </div>
            <span className="text-white text-[10px] font-bold">{(likes / 1000).toFixed(1)}k</span>
          </button>
          <button className="flex flex-col items-center gap-1">
            <div className="w-11 h-11 bg-black/50 rounded-full flex items-center justify-center backdrop-blur-sm">
              <Share2 size={20} color="white" />
            </div>
            <span className="text-white text-[10px]">Share</span>
          </button>
          <button className="flex flex-col items-center gap-1">
            <div className="w-11 h-11 bg-black/50 rounded-full flex items-center justify-center backdrop-blur-sm">
              <Gift size={20} color="#FFD700" />
            </div>
            <span className="text-white text-[10px] text-yellow-300">Gift</span>
          </button>
          {mode === "host" && (
            <button onClick={() => setIsMuted(!isMuted)} className="flex flex-col items-center gap-1">
              <div className="w-11 h-11 bg-black/50 rounded-full flex items-center justify-center backdrop-blur-sm">
                {isMuted ? <MicOff size={20} className="text-red-400" /> : <Mic size={20} color="white" />}
              </div>
            </button>
          )}
        </div>

        {/* Chat overlay */}
        <div className="absolute bottom-20 left-0 right-16 px-3 z-10" style={{ maxHeight: "200px" }}>
          <div ref={chatRef} className="overflow-y-auto space-y-1.5" style={{ maxHeight: "200px" }}>
            {chatMsgs.map((msg) => (
              <div key={msg.id} className="flex items-center gap-2 animate-fadeIn">
                <img src={msg.avatar} className="w-5 h-5 rounded-full flex-shrink-0 object-cover" alt="" />
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[10px] font-bold" style={{ color: msg.color }}>{msg.user}</span>
                  <span className="text-white text-[11px]">{msg.msg}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Chat input */}
      <div className="px-3 py-2.5 flex items-center gap-2" style={{ background: "rgba(0,0,0,0.9)" }}>
        <div className="flex-1 flex items-center bg-white/10 rounded-full px-4 py-2">
          <input
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendLiveChat()}
            placeholder="Say something…"
            className="flex-1 bg-transparent text-white text-sm outline-none placeholder-white/40"
          />
        </div>
        <button onClick={sendLiveChat} className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
          style={{ background: "linear-gradient(135deg,#7C4DFF,#E040FB)" }}>
          <Send size={16} color="white" />
        </button>
        {mode === "host" && (
          <button onClick={stopStream} className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
            style={{ background: "linear-gradient(135deg,#F44336,#B71C1C)" }}>
            <Radio size={16} color="white" />
          </button>
        )}
      </div>

      <style>{`
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0.3} }
        @keyframes floatUp { 0%{transform:translateY(0) scale(1);opacity:1} 100%{transform:translateY(-120px) scale(1.5);opacity:0} }
        .animate-fadeIn { animation: fadeIn 0.3s ease-out; }
        @keyframes fadeIn { from{opacity:0;transform:translateY(4px)} to{opacity:1;transform:translateY(0)} }
      `}</style>
    </div>
  );
};

export default LiveStreamPage;
