import React, { useState, useEffect, useRef } from "react";
import {
  PhoneOff, Phone, Video, VideoOff, Mic, MicOff,
  Volume2, VolumeX, ChevronLeft, RotateCcw, Users, Wifi, WifiOff
} from "lucide-react";
import type { Contact } from "@/types";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

interface CallPageProps {
  contact: Contact;
  callType: "voice" | "video";
  isIncoming?: boolean;
  onEnd: () => void;
}

const CallPage: React.FC<CallPageProps> = ({ contact, callType, isIncoming = false, onEnd }) => {
  const [callStatus, setCallStatus] = useState<"ringing" | "connecting" | "active" | "ended">(
    isIncoming ? "ringing" : "connecting"
  );
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeaker, setIsSpeaker] = useState(true);
  const [isCameraOff, setIsCameraOff] = useState(false);
  const [agoraReady, setAgoraReady] = useState(false);
  const [networkQuality, setNetworkQuality] = useState<"good" | "poor" | "unknown">("unknown");

  // Agora state
  const agoraClientRef = useRef<any>(null);
  const localVideoRef = useRef<HTMLDivElement>(null);
  const remoteVideoRef = useRef<HTMLDivElement>(null);
  const localTracksRef = useRef<any[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const channelName = `call_${[contact.id, "me"].sort().join("_")}`;

  // ── Initialize Agora ──────────────────────────────────────────────────────
  const initAgora = async () => {
    try {
      // Dynamically load Agora SDK
      const AgoraRTC = (await import("agora-rtc-sdk-ng")).default;

      // Get App ID from edge function
      const { data: tokenData, error: tokenError } = await supabase.functions.invoke("agora-token", {
        body: { channelName, uid: 0, role: "publisher" },
      });

      if (tokenError || !tokenData?.appId) {
        console.log("Agora edge function not available, using simulation mode");
        setCallStatus("active");
        return;
      }

      const appId = tokenData.appId;

      // Create client
      const client = AgoraRTC.createClient({ mode: callType === "video" ? "rtc" : "rtc", codec: "vp8" });
      agoraClientRef.current = client;

      // Network quality monitoring
      client.on("network-quality", (stats: any) => {
        setNetworkQuality(stats.uplinkNetworkQuality <= 2 ? "good" : "poor");
      });

      // Remote user handling
      client.on("user-published", async (user: any, mediaType: "audio" | "video") => {
        await client.subscribe(user, mediaType);
        if (mediaType === "video" && remoteVideoRef.current) {
          user.videoTrack?.play(remoteVideoRef.current);
        }
        if (mediaType === "audio") {
          user.audioTrack?.play();
        }
      });

      client.on("user-unpublished", (user: any) => {
        console.log("Remote user left:", user.uid);
      });

      // Join channel
      const uid = await client.join(appId, channelName, tokenData.token, null);
      console.log("Joined Agora channel:", channelName, "uid:", uid);

      // Create and publish tracks
      const tracks: any[] = [];

      if (callType === "video" && !isCameraOff) {
        const [micTrack, cameraTrack] = await AgoraRTC.createMicrophoneAndCameraTracks(
          { encoderConfig: "music_standard" },
          { encoderConfig: "360p_7" }
        );
        tracks.push(micTrack, cameraTrack);
        if (localVideoRef.current) {
          cameraTrack.play(localVideoRef.current);
        }
      } else {
        const micTrack = await AgoraRTC.createMicrophoneAudioTrack({ encoderConfig: "music_standard" });
        tracks.push(micTrack);
      }

      localTracksRef.current = tracks;
      await client.publish(tracks);
      setAgoraReady(true);
      setCallStatus("active");
      toast.success("Connected!");

    } catch (err: any) {
      console.error("Agora init error:", err);
      // Fallback: simulate call without Agora
      setCallStatus("active");
    }
  };

  // ── Cleanup ───────────────────────────────────────────────────────────────
  const cleanupAgora = async () => {
    try {
      for (const track of localTracksRef.current) {
        track.stop();
        track.close();
      }
      localTracksRef.current = [];
      if (agoraClientRef.current) {
        await agoraClientRef.current.leave();
        agoraClientRef.current = null;
      }
    } catch (err) {
      console.error("Agora cleanup error:", err);
    }
  };

  // ── Lifecycle ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!isIncoming) {
      const t = setTimeout(() => initAgora(), 2000);
      return () => clearTimeout(t);
    }
  }, []);

  useEffect(() => {
    if (callStatus === "active") {
      timerRef.current = setInterval(() => setDuration((d) => d + 1), 1000);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [callStatus]);

  const formatDuration = (s: number) => {
    const m = Math.floor(s / 60).toString().padStart(2, "0");
    const sec = (s % 60).toString().padStart(2, "0");
    return `${m}:${sec}`;
  };

  const handleAccept = () => {
    setCallStatus("connecting");
    setTimeout(() => initAgora(), 1000);
  };

  const handleEnd = async () => {
    setCallStatus("ended");
    if (timerRef.current) clearInterval(timerRef.current);
    await cleanupAgora();

    // Log call to backend
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase.from("call_logs").insert({
        caller_id: user.id,
        callee_id: contact.id,
        type: callType,
        status: duration > 0 ? "completed" : "missed",
        duration_seconds: duration,
        started_at: new Date(Date.now() - duration * 1000).toISOString(),
        ended_at: new Date().toISOString(),
      }).then(() => {}).catch(() => {});
    }
    setTimeout(onEnd, 600);
  };

  const toggleMute = () => {
    setIsMuted((m) => {
      const next = !m;
      localTracksRef.current.find((t: any) => t.trackMediaType === "audio")?.setEnabled(!next);
      return next;
    });
  };

  const toggleCamera = () => {
    setIsCameraOff((c) => {
      const next = !c;
      localTracksRef.current.find((t: any) => t.trackMediaType === "video")?.setEnabled(!next);
      return next;
    });
  };

  const statusText = () => {
    if (callStatus === "ringing") return isIncoming ? "Incoming Call…" : "Calling…";
    if (callStatus === "connecting") return "Connecting…";
    if (callStatus === "active") return formatDuration(duration);
    return "Call Ended";
  };

  return (
    <div
      className="fixed inset-0 z-[200] flex flex-col overflow-hidden"
      style={{
        background: callType === "video"
          ? "linear-gradient(180deg, #0a0a1a 0%, #1a0a2e 40%, #0d0d2e 100%)"
          : "linear-gradient(180deg, #1a0533 0%, #2d0a4e 40%, #1a0533 100%)",
      }}
    >
      {/* Remote video bg */}
      {callType === "video" && (
        <div ref={remoteVideoRef} className="absolute inset-0 z-0"
          style={{ background: callStatus === "active" ? "transparent" : "linear-gradient(180deg,#1a0a2e,#0d0d2e)" }} />
      )}

      {/* Animated rings on ringing */}
      {callStatus === "ringing" && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
          {[1, 2, 3].map((i) => (
            <div key={i} className="absolute rounded-full border-2 border-white/20"
              style={{ width: `${140 + i * 70}px`, height: `${140 + i * 70}px`, animation: `ripple 2s ease-out ${i * 0.4}s infinite` }} />
          ))}
        </div>
      )}

      {/* Sparkles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-10">
        {Array.from({ length: 15 }).map((_, i) => (
          <div key={i} className="absolute w-1 h-1 bg-white rounded-full"
            style={{ left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%`, opacity: Math.random() * 0.5 + 0.1, animation: `twinkle ${2 + Math.random() * 3}s ease-in-out ${Math.random() * 2}s infinite` }} />
        ))}
      </div>

      {/* Back + network */}
      <div className="relative z-20 px-4 pt-12 flex items-center justify-between">
        <button onClick={handleEnd} className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center">
          <ChevronLeft size={20} color="white" />
        </button>
        <div className="flex items-center gap-1.5 bg-white/10 rounded-full px-3 py-1">
          {networkQuality === "good" ? <Wifi size={12} className="text-green-400" /> : <WifiOff size={12} className="text-red-400" />}
          <span className="text-white/70 text-xs">{agoraReady ? "Agora Live" : "Connected"}</span>
        </div>
      </div>

      {/* Call type badge */}
      <div className="relative z-20 flex justify-center mt-2">
        <div className="flex items-center gap-2 bg-white/10 rounded-full px-4 py-1.5 backdrop-blur-sm">
          {callType === "video" ? <Video size={14} color="white" /> : <Phone size={14} color="white" />}
          <span className="text-white text-xs font-medium">{callType === "video" ? "Video Call" : "Voice Call"}</span>
        </div>
      </div>

      {/* Contact */}
      <div className="relative z-20 flex flex-col items-center mt-10 flex-1 justify-center">
        <div className="relative mb-6">
          <div
            className="absolute inset-0 rounded-full"
            style={{ background: "radial-gradient(circle, rgba(124,77,255,0.4) 0%, transparent 70%)", transform: "scale(1.5)", animation: callStatus === "ringing" ? "pulse 1.5s ease-in-out infinite" : "none" }}
          />
          <div
            className="relative rounded-full overflow-hidden shadow-2xl"
            style={{ width: "130px", height: "130px", border: "3px solid rgba(255,255,255,0.3)", boxShadow: "0 0 40px rgba(124,77,255,0.5), 0 0 80px rgba(124,77,255,0.2)" }}
          >
            <img src={contact.avatar} alt={contact.name} className="w-full h-full object-cover" />
          </div>
          {contact.online && callStatus === "active" && (
            <div className="absolute bottom-2 right-2 w-4 h-4 rounded-full border-2 border-white" style={{ background: "#4CAF50" }} />
          )}
        </div>

        <h2 className="text-3xl font-bold text-white mb-2 text-center">{contact.name}</h2>
        <div className="flex items-center gap-2 mb-2">
          {callStatus === "active" && <div className="w-2 h-2 rounded-full bg-green-400" style={{ animation: "blink 1s ease-in-out infinite" }} />}
          <p className="text-lg font-mono" style={{ color: callStatus === "active" ? "#4CAF50" : "rgba(255,255,255,0.7)" }}>
            {statusText()}
          </p>
        </div>

        {/* Local video preview */}
        {callType === "video" && callStatus === "active" && (
          <div
            className="absolute bottom-32 right-4 rounded-2xl overflow-hidden shadow-2xl z-20"
            style={{ width: "100px", height: "140px", border: "2px solid rgba(255,255,255,0.3)" }}
          >
            {isCameraOff ? (
              <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                <VideoOff size={20} color="rgba(255,255,255,0.4)" />
              </div>
            ) : (
              <div ref={localVideoRef} className="w-full h-full bg-gray-900" />
            )}
            <div className="absolute bottom-1 left-1 right-1 text-center">
              <p className="text-white text-[9px] font-medium bg-black/40 rounded px-1 py-0.5">You</p>
            </div>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="relative z-20 px-8 pb-16">
        {callStatus === "ringing" && isIncoming ? (
          <div className="flex items-center justify-around">
            <div className="flex flex-col items-center gap-2">
              <button onClick={handleEnd} className="rounded-full flex items-center justify-center shadow-2xl active:scale-90 transition-transform"
                style={{ width: "72px", height: "72px", background: "linear-gradient(135deg,#F44336,#B71C1C)", boxShadow: "0 8px 30px rgba(244,67,54,0.6)" }}>
                <PhoneOff size={30} color="white" />
              </button>
              <p className="text-white/70 text-xs">Decline</p>
            </div>
            <div className="w-20 h-20 rounded-full flex items-center justify-center"
              style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)", animation: "pulse 1.5s ease-in-out infinite" }}>
              {callType === "video" ? <Video size={24} color="white" /> : <Phone size={24} color="white" />}
            </div>
            <div className="flex flex-col items-center gap-2">
              <button onClick={handleAccept} className="rounded-full flex items-center justify-center shadow-2xl active:scale-90 transition-transform"
                style={{ width: "72px", height: "72px", background: "linear-gradient(135deg,#4CAF50,#1B5E20)", boxShadow: "0 8px 30px rgba(76,175,80,0.6)" }}>
                <Phone size={30} color="white" />
              </button>
              <p className="text-white/70 text-xs">Accept</p>
            </div>
          </div>
        ) : (
          <div className="space-y-5">
            <div className="flex items-center justify-around">
              <ControlBtn icon={isMuted ? MicOff : Mic} label={isMuted ? "Unmute" : "Mute"} active={isMuted} onClick={toggleMute} />
              <ControlBtn icon={isSpeaker ? Volume2 : VolumeX} label="Speaker" active={isSpeaker} onClick={() => setIsSpeaker(!isSpeaker)} />
              {callType === "video" && <ControlBtn icon={isCameraOff ? VideoOff : Video} label={isCameraOff ? "Cam Off" : "Camera"} active={isCameraOff} onClick={toggleCamera} />}
              {callType === "video" && <ControlBtn icon={RotateCcw} label="Flip" active={false} onClick={() => toast.info("Camera flip")} />}
              {callType === "voice" && <ControlBtn icon={Users} label="Add" active={false} onClick={() => toast.info("Add participant")} />}
            </div>
            <div className="flex justify-center">
              <div className="flex flex-col items-center gap-2">
                <button onClick={handleEnd} className="rounded-full flex items-center justify-center shadow-2xl active:scale-90 transition-transform"
                  style={{ width: "72px", height: "72px", background: "linear-gradient(135deg,#F44336,#B71C1C)", boxShadow: "0 8px 30px rgba(244,67,54,0.6)" }}>
                  <PhoneOff size={30} color="white" />
                </button>
                <p className="text-white/60 text-xs">End Call</p>
              </div>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes ripple { 0% { transform: scale(0.8); opacity: 1; } 100% { transform: scale(2); opacity: 0; } }
        @keyframes twinkle { 0%, 100% { opacity: 0.2; transform: scale(0.5); } 50% { opacity: 1; transform: scale(1.2); } }
        @keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }
      `}</style>
    </div>
  );
};

const ControlBtn: React.FC<{
  icon: React.FC<any>;
  label: string;
  active: boolean;
  onClick: () => void;
}> = ({ icon: Icon, label, active, onClick }) => (
  <div className="flex flex-col items-center gap-1.5">
    <button onClick={onClick}
      className="w-14 h-14 rounded-full flex items-center justify-center transition-all active:scale-90"
      style={{ background: active ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.15)", backdropFilter: "blur(10px)", border: "1px solid rgba(255,255,255,0.2)" }}>
      <Icon size={22} color={active ? "#333" : "white"} />
    </button>
    <p className="text-white/60 text-xs">{label}</p>
  </div>
);

export default CallPage;
