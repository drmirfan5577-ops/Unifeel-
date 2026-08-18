import React, { useState, useEffect, createContext, useContext } from "react";
import { Toaster } from "sonner";
import LoginPage from "@/pages/LoginPage";
import ChatsPage from "@/pages/ChatsPage";
import ChatDetailPage from "@/pages/ChatDetailPage";
import UpdatesPage from "@/pages/UpdatesPage";
import CommunitiesPage from "@/pages/CommunitiesPage";
import IHubPage from "@/pages/IHubPage";
import ESHubPage from "@/pages/ESHubPage";
import SettingsPage from "@/pages/SettingsPage";
import AdminPanelPage from "@/pages/AdminPanelPage";
import PrivateVaultPage from "@/pages/PrivateVaultPage";
import MediaGalleryPage from "@/pages/MediaGalleryPage";
import CallPage from "@/pages/CallPage";
import LiveStreamPage from "@/pages/LiveStreamPage";
import BottomNav from "@/components/layout/BottomNav";
import { isLoggedIn } from "@/lib/store";
import { supabase } from "@/lib/supabase";
import type { Contact } from "@/types";

export type Lang = "en" | "ur" | "ar";
export const LangContext = createContext<{ lang: Lang; setLang: (l: Lang) => void }>({
  lang: "en",
  setLang: () => {},
});
export const useLang = () => useContext(LangContext);

// Desktop live background scenes
const desktopScenes = [
  "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=1920&h=1080&fit=crop",
  "https://images.unsplash.com/photo-1557682250-33bd709cbe85?w=1920&h=1080&fit=crop",
  "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1920&h=1080&fit=crop",
  "https://images.unsplash.com/photo-1553356084-58ef4a67b2a7?w=1920&h=1080&fit=crop",
  "https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=1920&h=1080&fit=crop",
  "https://images.unsplash.com/photo-1518655048521-f130df041f66?w=1920&h=1080&fit=crop",
];

type AppPage = "chats" | "updates" | "communities" | "ihub" | "eshub" | "settings" | "admin" | "vault" | "gallery" | "live";

const App: React.FC = () => {
  const [loggedIn, setLoggedIn] = useState(isLoggedIn());

  // Sync Supabase session on startup
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user && !isLoggedIn()) {
        localStorage.setItem("itsme_logged_in", "true");
        setLoggedIn(true);
      }
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_OUT") {
        localStorage.removeItem("itsme_logged_in");
        setLoggedIn(false);
      }
    });
    return () => subscription.unsubscribe();
  }, []);
  const [activePage, setActivePage] = useState<AppPage>("chats");
  const [openChat, setOpenChat] = useState<Contact | null>(null);
  const [activeCall, setActiveCall] = useState<{ contact: Contact; type: "voice" | "video"; incoming?: boolean } | null>(null);
  const [bgScene, setBgScene] = useState(0);
  const [bgOpacity, setBgOpacity] = useState(1);
  const [lang, setLang] = useState<Lang>("en");

  useEffect(() => {
    const interval = setInterval(() => {
      setBgOpacity(0);
      setTimeout(() => {
        setBgScene((prev) => (prev + 1) % desktopScenes.length);
        setBgOpacity(1);
      }, 1000);
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  // PWA install prompt
  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      (window as any).deferredInstallPrompt = e;
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleNavigate = (page: string) => {
    setActivePage(page as AppPage);
  };

  const handleCall = (contact: Contact, type: "voice" | "video", incoming?: boolean) => {
    setActiveCall({ contact, type, incoming: incoming || false });
  };

  if (!loggedIn) {
    return (
      <LangContext.Provider value={{ lang, setLang }}>
        <Toaster position="top-center" richColors />
        <div className="app-container">
          <LoginPage onLogin={() => setLoggedIn(true)} />
        </div>
      </LangContext.Provider>
    );
  }

  const isFullScreen = !!(openChat || activeCall || activePage === "admin" || activePage === "vault" || activePage === "gallery");

  return (
    <LangContext.Provider value={{ lang, setLang }}>
      <Toaster position="top-center" richColors />

      {/* Desktop: Full-screen live animated backgrounds */}
      <div
        className="fixed inset-0 -z-10 hidden md:block"
        style={{
          backgroundImage: `url(${desktopScenes[bgScene]})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          opacity: bgOpacity,
          transition: "opacity 1s ease",
        }}
      />
      <div className="fixed inset-0 -z-10 hidden md:flex items-center justify-center" style={{ background: "rgba(15,5,40,0.7)" }}>
        {/* Floating mini panels — news channel background effect */}
        {desktopScenes.slice(0, 4).map((scene, i) => (
          <div
            key={i}
            className="absolute rounded-2xl overflow-hidden shadow-2xl"
            style={{
              width: "180px",
              height: "120px",
              top: `${12 + (i % 2) * 38}%`,
              left: i < 2 ? `${1 + i * 8}%` : `${76 + (i - 2) * 10}%`,
              opacity: 0.3,
              backgroundImage: `url(${desktopScenes[(i + 2) % desktopScenes.length]})`,
              backgroundSize: "cover",
              transform: `rotate(${i % 2 === 0 ? "-2.5deg" : "2.5deg"})`,
              animation: `float ${5 + i * 1.5}s ease-in-out infinite`,
              animationDelay: `${i * 0.8}s`,
              border: "1.5px solid rgba(255,255,255,0.2)",
            }}
          />
        ))}
        {/* News ticker */}
        <div className="absolute bottom-0 left-0 right-0 py-2 overflow-hidden" style={{ background: "rgba(69,39,160,0.92)", borderTop: "1.5px solid rgba(124,77,255,0.4)" }}>
          <div className="ticker-content text-white text-sm font-medium px-4">
            ✨ It's Me | آنس می &nbsp;|&nbsp; Social &amp; Digital Media Platform &nbsp;|&nbsp;
            📖 Islamic Hub: Quran • Hadith • Azkaar &nbsp;|&nbsp;
            💬 Real-time Encrypted Messaging &nbsp;|&nbsp;
            📹 Voice & Video Calls &nbsp;|&nbsp;
            🎨 10 Unique Themes &nbsp;|&nbsp;
            🛡️ Admin Panel: Admin5577 &nbsp;|&nbsp;
            📱 Install as PWA on Mobile &nbsp;|&nbsp;
            🔐 Private Vault for Personal Data &nbsp;|&nbsp;
            اردو | العربية | English
          </div>
        </div>
      </div>

      {/* App container */}
      <div className="app-container">
        {/* Language toggle - only on non-chat pages */}
        {!openChat && (
          <div
            className="relative z-50 flex justify-center gap-1 py-1 px-4"
            style={{ background: "linear-gradient(90deg, #4527A0, #7C4DFF, #C2185B)" }}
          >
            {(["en", "ur", "ar"] as Lang[]).map((l) => (
              <button
                key={l}
                onClick={() => setLang(l)}
                className="px-3 py-0.5 rounded-full text-xs font-semibold transition-all"
                style={{
                  background: lang === l ? "rgba(255,255,255,0.95)" : "rgba(255,255,255,0.15)",
                  color: lang === l ? "#4527A0" : "rgba(255,255,255,0.9)",
                  fontWeight: lang === l ? 700 : 500,
                }}
              >
                {l === "en" ? "English" : l === "ur" ? "اردو" : "العربية"}
              </button>
            ))}
          </div>
        )}

        {/* Active call overlay */}
        {activeCall && (
          <CallPage
            contact={activeCall.contact}
            callType={activeCall.type}
            isIncoming={activeCall.incoming}
            onEnd={() => setActiveCall(null)}
          />
        )}

        {isFullScreen && !activeCall ? (
          <div>
            {openChat && <ChatDetailPage contact={openChat} onBack={() => setOpenChat(null)} onCall={handleCall} />}
            {activePage === "admin" && <AdminPanelPage onBack={() => setActivePage("settings")} />}
            {activePage === "vault" && <PrivateVaultPage onBack={() => setActivePage("settings")} />}
            {activePage === "gallery" && <MediaGalleryPage onBack={() => setActivePage("settings")} />}
            {activePage === "live" && !activeCall && <LiveStreamPage onBack={() => setActivePage("updates")} />}
          </div>
        ) : !activeCall ? (
          <div className="relative">
            {activePage === "chats" && <ChatsPage onOpenChat={setOpenChat} onCall={handleCall} />}
            {activePage === "updates" && <UpdatesPage onCall={handleCall} />}
            {activePage === "communities" && <CommunitiesPage onNavigate={handleNavigate} />}
            {activePage === "live" && <LiveStreamPage onBack={() => setActivePage("updates")} />}
            {activePage === "ihub" && <IHubPage />}
            {activePage === "eshub" && <ESHubPage />}
            {activePage === "settings" && (
              <SettingsPage
                onNavigate={handleNavigate}
                onLogout={() => setLoggedIn(false)}
              />
            )}
            <BottomNav active={activePage} onNavigate={handleNavigate} />
          </div>
        ) : null}
      </div>
    </LangContext.Provider>
  );
};

export default App;
