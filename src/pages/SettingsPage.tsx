import React, { useState } from "react";
import {
  Key, Lock, MessageSquare, Bell, HardDrive, HelpCircle,
  ChevronRight, Shield, Palette, LogOut, Star,
  Info, Download, Image, FileCode
} from "lucide-react";
import AnimatedBackground from "@/components/layout/AnimatedBackground";
import { getUser, logout } from "@/lib/store";
import LauncherThemes from "@/components/features/LauncherThemes";

interface SettingsPageProps {
  onNavigate: (page: string) => void;
  onLogout: () => void;
}

const SettingsPage: React.FC<SettingsPageProps> = ({ onNavigate, onLogout }) => {
  const user = getUser();
  const [showThemes, setShowThemes] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  const [showDisclaimer, setShowDisclaimer] = useState(false);

  if (showThemes) return <LauncherThemes onBack={() => setShowThemes(false)} />;
  if (showAbout) return <AboutSection onBack={() => setShowAbout(false)} />;
  if (showDisclaimer) return <DisclaimerSection onBack={() => setShowDisclaimer(false)} />;

  const sections = [
    {
      title: "Account",
      color: "#7C4DFF",
      items: [
        { icon: Key, label: "Account", sub: "Privacy, security, change number", color: "#E91E63", bg: "#FCE4EC" },
        { icon: Lock, label: "Privacy", sub: "Block contacts, disappearing messages", color: "#9C27B0", bg: "#F3E5F5" },
        { icon: MessageSquare, label: "Chats", sub: "Theme, wallpapers, chat history", color: "#2196F3", bg: "#E3F2FD" },
        { icon: Bell, label: "Notifications", sub: "Message, group & call tones", color: "#FF9800", bg: "#FFF3E0" },
        { icon: HardDrive, label: "Storage and Data", sub: "Network usage, auto-download", color: "#607D8B", bg: "#ECEFF1" },
      ],
    },
    {
      title: "Features",
      color: "#E040FB",
      items: [
        { icon: Palette, label: "Launcher Themes", sub: "10 unique digital themes", color: "#7C4DFF", bg: "#EDE7F6", action: () => setShowThemes(true) },
        { icon: Shield, label: "Private Vault", sub: "Password protected personal space", color: "#C62828", bg: "#FFEBEE", action: () => onNavigate("vault") },
        { icon: Image, label: "Media Gallery", sub: "Photos, videos, audio & documents", color: "#1565C0", bg: "#E3F2FD", action: () => onNavigate("gallery") },
        { icon: Star, label: "Admin Panel", sub: "App customization & management", color: "#FF6F00", bg: "#FFF8E1", action: () => onNavigate("admin") },
      ],
    },
    {
      title: "Legal & Support",
      color: "#1565C0",
      items: [
        { icon: HelpCircle, label: "Help Centre", sub: "Help, contact us, FAQ", color: "#00BCD4", bg: "#E0F7FA" },
        { icon: FileCode, label: "Disclaimer & Privacy", sub: "Privacy policy, copyright, terms", color: "#3F51B5", bg: "#E8EAF6", action: () => setShowDisclaimer(true) },
        { icon: Info, label: "About Us", sub: "Version, downloads, mission", color: "#4CAF50", bg: "#E8F5E9", action: () => setShowAbout(true) },
      ],
    },
  ];

  return (
    <div className="page-content relative">
      <AnimatedBackground overlay="rgba(250,248,255,0.93)" />
      <div className="app-header px-4 py-4 relative z-10">
        <h1 className="text-xl font-bold text-white">Set! ⚙️</h1>
        <p className="text-purple-200 text-xs">App Configuration | سیٹنگز</p>
      </div>

      <div className="relative z-10">
        {/* Profile */}
        <div className="px-4 pt-4 pb-2">
          <div
            className="bg-white rounded-2xl shadow-md p-4 flex items-center gap-4 cursor-pointer hover:shadow-lg transition-shadow"
            style={{ border: "1.5px solid rgba(124,77,255,0.1)" }}
          >
            <div className="relative">
              <img src={user.avatar} className="w-16 h-16 rounded-full object-cover" alt={user.name} />
              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-400 rounded-full border-2 border-white" />
            </div>
            <div className="flex-1">
              <p className="font-bold text-gray-800 text-lg">{user.name}</p>
              <p className="text-gray-500 text-sm">{user.status}</p>
              <p className="text-gray-400 text-xs mt-0.5">{user.phone}</p>
            </div>
            <ChevronRight size={20} className="text-gray-300" />
          </div>
        </div>

        {sections.map((section) => (
          <div key={section.title} className="px-4 mt-4">
            <p className="text-xs font-bold uppercase tracking-wider mb-2 px-1" style={{ color: section.color }}>
              {section.title}
            </p>
            <div className="bg-white rounded-2xl shadow-md overflow-hidden">
              {section.items.map((item, i) => {
                const Icon = item.icon;
                const action = (item as any).action || (() => {});
                return (
                  <button
                    key={item.label}
                    onClick={action}
                    className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-purple-50 transition-colors text-left active:bg-purple-50"
                    style={{ borderBottom: i < section.items.length - 1 ? "1px solid #f5f5f5" : "none" }}
                  >
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: item.bg }}>
                      <Icon size={18} style={{ color: item.color }} />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-800 text-sm">{item.label}</p>
                      <p className="text-gray-400 text-xs">{item.sub}</p>
                    </div>
                    <ChevronRight size={16} className="text-gray-300" />
                  </button>
                );
              })}
            </div>
          </div>
        ))}

        <div className="px-4 mt-4 mb-6">
          <button
            onClick={() => { logout(); onLogout(); }}
            className="w-full bg-white rounded-2xl shadow-md p-4 flex items-center justify-center gap-3 text-red-500 hover:bg-red-50 transition-colors"
          >
            <LogOut size={18} />
            <span className="font-semibold">Log Out</span>
          </button>
        </div>
      </div>
    </div>
  );
};

const AboutSection: React.FC<{ onBack: () => void }> = ({ onBack }) => (
  <div className="page-content relative">
    <AnimatedBackground overlay="rgba(250,248,255,0.93)" />
    <div className="app-header px-4 py-4 flex items-center gap-3 relative z-10">
      <button onClick={onBack} className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center">
        <ChevronRight size={20} color="white" className="rotate-180" />
      </button>
      <div>
        <h1 className="text-lg font-bold text-white">About It's Me</h1>
        <p className="text-purple-200 text-xs">v1.0.0 · آنس می</p>
      </div>
    </div>
    <div className="relative z-10 px-4 pt-4">
      <div className="bg-white rounded-2xl shadow-lg p-5 mb-4 text-center">
        <div className="w-20 h-20 rounded-3xl mx-auto mb-3 flex items-center justify-center text-4xl shadow-lg" style={{ background: "linear-gradient(135deg,#4527A0,#7C4DFF,#E040FB)" }}>
          💬
        </div>
        <h2 className="text-2xl font-extrabold gradient-text">It's Me</h2>
        <p className="text-purple-500 font-medium">آنس می</p>
        <p className="text-gray-400 text-sm mt-1">Version 1.0.0 · Build 2026.08.09</p>
        <p className="text-gray-400 text-xs mt-1">Social & Digital Media Platform</p>
        <div className="mt-3 p-3 bg-purple-50 rounded-xl text-xs text-purple-700 text-left">
          <p className="font-bold mb-1">🎯 Our Mission:</p>
          <p>To connect people across the globe with secure, feature-rich, and spiritually enriching communication — bridging technology with Islamic values.</p>
        </div>
        <div className="mt-2 p-3 bg-teal-50 rounded-xl text-xs text-teal-700 text-left">
          <p className="font-bold mb-1">👁️ Our Vision:</p>
          <p>To become the world's most trusted multilingual social platform that serves both modern digital needs and spiritual guidance.</p>
        </div>
      </div>

      {[
        { title: "📱 Play Store Guide", desc: "Complete guide for Google Play Store publishing", link: "https://developer.android.com/distribute/googleplay/start" },
        { title: "📦 Source Code on GitHub", desc: "Full source code repository", link: "https://github.com/drmirfan5577-ops/lts-Me-ES-OneWorld" },
        { title: "🔒 Privacy Policy", desc: "How we protect your personal data", link: "#" },
        { title: "📋 Terms of Service", desc: "Usage terms and conditions", link: "#" },
        { title: "💾 Backup & Recovery", desc: "Complete backup documentation", link: "#" },
        { title: "📞 Contact Support", desc: "itsme.support@gmail.com", link: "mailto:itsme.support@gmail.com" },
      ].map((item) => (
        <a key={item.title} href={item.link} target="_blank" rel="noopener noreferrer"
          className="flex items-center gap-3 bg-white rounded-xl p-3.5 mb-2 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex-1">
            <p className="font-semibold text-gray-800 text-sm">{item.title}</p>
            <p className="text-gray-500 text-xs">{item.desc}</p>
          </div>
          <Download size={16} className="text-purple-400 flex-shrink-0" />
        </a>
      ))}
      <p className="text-center text-xs text-gray-400 mt-4 mb-6">Made with ❤️ | All Rights Reserved © 2026 It's Me</p>
    </div>
  </div>
);

const DisclaimerSection: React.FC<{ onBack: () => void }> = ({ onBack }) => (
  <div className="page-content relative">
    <AnimatedBackground overlay="rgba(250,248,255,0.93)" />
    <div className="app-header px-4 py-4 flex items-center gap-3 relative z-10">
      <button onClick={onBack} className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center">
        <ChevronRight size={20} color="white" className="rotate-180" />
      </button>
      <h1 className="text-lg font-bold text-white">Legal & Privacy</h1>
    </div>
    <div className="relative z-10 px-4 pt-4 space-y-3">
      {[
        {
          title: "⚠️ Disclaimer",
          color: "#FF6F00",
          content: "It's Me is an independent social media platform. All Islamic content (Quran, Hadith, Duas) is provided for educational purposes. We do not claim any endorsement from any religious authority. Users are responsible for content they share. This app is not affiliated with or a copy of any other messaging application."
        },
        {
          title: "🔒 Privacy Policy",
          color: "#7C4DFF",
          content: "We collect only the information necessary to provide our services (email, username). Your messages are end-to-end encrypted. We never sell your personal data to third parties. Private Vault contents remain on your device and are never uploaded without your consent."
        },
        {
          title: "©️ Copyright Notice",
          color: "#C2185B",
          content: "It's Me, آنس می, and all associated logos, designs, and visual identities are original creations. All rights reserved © 2026. The app's unique gradient design system, tab layout, and visual identity are protected intellectual property. Unauthorized copying or distribution is prohibited."
        },
        {
          title: "📋 Terms of Service",
          color: "#1565C0",
          content: "By using It's Me, you agree to use the platform lawfully and respectfully. Prohibited: hate speech, illegal content, impersonation, spam. We reserve the right to terminate accounts violating these terms. Islamic content is to be treated with respect."
        },
        {
          title: "📖 Data Usage",
          color: "#2E7D32",
          content: "Your data is stored securely on OnSpace Cloud (Supabase). Media files are stored in encrypted cloud storage. You can delete your account and all associated data at any time from Settings → Account → Delete Account."
        },
      ].map((section) => (
        <div key={section.title} className="bg-white rounded-2xl shadow-sm p-4" style={{ borderLeft: `4px solid ${section.color}` }}>
          <p className="font-bold text-gray-800 mb-2 text-sm">{section.title}</p>
          <p className="text-gray-600 text-xs leading-relaxed">{section.content}</p>
        </div>
      ))}
      <p className="text-center text-xs text-gray-400 pb-4">Last updated: August 9, 2026</p>
    </div>
  </div>
);

export default SettingsPage;
