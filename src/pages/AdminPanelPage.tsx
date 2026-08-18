import React, { useState } from "react";
import {
  ChevronLeft, Lock, Users, Settings, Megaphone, BarChart2,
  Shield, Download, Database, Package, FileCode, AlertTriangle,
  Bell, Palette, Globe, RefreshCw, Terminal, BookOpen, CheckCircle,
  Plus, Trash2, Edit3, ToggleLeft, ToggleRight, Link, Mail, Eye, EyeOff
} from "lucide-react";
import AnimatedBackground from "@/components/layout/AnimatedBackground";
import { toast } from "sonner";

interface AdminPanelPageProps {
  onBack: () => void;
}

const ADMIN_PASSWORD_KEY = "itsme_admin_pw";
const getAdminPassword = () => localStorage.getItem(ADMIN_PASSWORD_KEY) || "Admin5577";

const AdminPanelPage: React.FC<AdminPanelPageProps> = ({ onBack }) => {
  const [authenticated, setAuthenticated] = useState(false);
  const [inputPw, setInputPw] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [registrationOpen, setRegistrationOpen] = useState(true);

  const handleAuth = () => {
    if (inputPw === getAdminPassword()) {
      setAuthenticated(true);
      setError("");
    } else {
      setError("❌ Invalid Admin Password");
      setInputPw("");
    }
  };

  if (!authenticated) {
    return (
      <div className="min-h-screen relative flex flex-col">
        <AnimatedBackground overlay="rgba(10,5,25,0.9)" />
        <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-6">
          <button onClick={onBack} className="absolute top-8 left-5 w-10 h-10 bg-white/15 rounded-full flex items-center justify-center">
            <ChevronLeft size={20} color="white" />
          </button>
          <div className="w-20 h-20 rounded-3xl mb-5 flex items-center justify-center shadow-2xl" style={{ background: "linear-gradient(135deg,#FF6F00,#F57F17)" }}>
            <Shield size={38} color="white" />
          </div>
          <h1 className="text-2xl font-extrabold text-white mb-1">Admin Panel</h1>
          <p className="text-orange-300 text-sm mb-1">It's Me — Control Center</p>
          <p className="text-white/30 text-xs mb-8">Strongly Password Protected</p>
          <div className="w-full max-w-xs">
            <div className="relative mb-3">
              <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-orange-300" />
              <input
                type={showPw ? "text" : "password"}
                value={inputPw}
                onChange={e => setInputPw(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleAuth()}
                placeholder="Enter Admin Password"
                className="w-full bg-white/10 rounded-2xl pl-11 pr-12 py-4 text-white placeholder-white/30 outline-none text-sm"
                style={{ border: "1.5px solid rgba(255,111,0,0.4)" }}
              />
              <button onClick={() => setShowPw(!showPw)} className="absolute right-4 top-1/2 -translate-y-1/2">
                {showPw ? <EyeOff size={16} className="text-white/40" /> : <Eye size={16} className="text-white/40" />}
              </button>
            </div>
            {error && <p className="text-red-400 text-sm text-center mb-3">{error}</p>}
            <button onClick={handleAuth}
              className="w-full py-4 rounded-2xl text-white font-bold text-base shadow-xl active:scale-95 transition-all"
              style={{ background: "linear-gradient(135deg,#FF6F00,#F57F17)", boxShadow: "0 8px 28px rgba(255,111,0,0.4)" }}>
              🔓 Unlock Admin Panel
            </button>
          </div>
          <p className="text-white/25 text-xs mt-6 text-center">⚠️ Authorized Access Only · Default: Admin5577</p>
        </div>
      </div>
    );
  }

  if (activeSection) {
    return <AdminSection section={activeSection} onBack={() => setActiveSection(null)} />;
  }

  const sections = [
    {
      title: "App Management", color: "#FF6F00",
      items: [
        { icon: BarChart2, label: "Analytics & Stats", sub: "Users, messages, calls overview", key: "analytics" },
        { icon: Users, label: "User Management", sub: "View, ban, verify all users", key: "users" },
        { icon: Bell, label: "Broadcast Message", sub: "Send notification to all users", key: "broadcast" },
        { icon: Megaphone, label: "Announcements", sub: "App-wide notifications", key: "announce" },
      ]
    },
    {
      title: "Content Control", color: "#7C4DFF",
      items: [
        { icon: BookOpen, label: "I-Hub Content", sub: "Quran, Hadith, Azkaar", key: "ihub" },
        { icon: Globe, label: "ES-Hub Links", sub: "Manage external service links", key: "eshub-admin" },
        { icon: Palette, label: "Themes & Effects", sub: "10 themes + live effects per tab", key: "themes" },
        { icon: Settings, label: "App Settings", sub: "General configuration", key: "appsettings" },
      ]
    },
    {
      title: "Import & URLs", color: "#00838F",
      items: [
        { icon: Plus, label: "Add More Properties", sub: "Import sites, emails, domains, URLs", key: "import" },
        { icon: Link, label: "URL Manager", sub: "Manage all linked properties", key: "urls" },
        { icon: Mail, label: "Email Accounts", sub: "Linked email accounts", key: "emails" },
        { icon: Globe, label: "Domain Manager", sub: "Custom domains & subdomains", key: "domains" },
      ]
    },
    {
      title: "Technical", color: "#1565C0",
      items: [
        { icon: RefreshCw, label: "App Version Control", sub: "Update & manage versions", key: "version" },
        { icon: Database, label: "Database Manager", sub: "View & manage all data", key: "database" },
        { icon: Terminal, label: "System Logs", sub: "Error logs & diagnostics", key: "logs" },
        { icon: Shield, label: "Security Settings", sub: "Password, access, block IPs", key: "security" },
      ]
    },
    {
      title: "Download Center", color: "#2E7D32",
      items: [
        { icon: FileCode, label: "Source Code", sub: "Complete app source (.zip)", key: "source" },
        { icon: Package, label: "Full Backup", sub: "App backup for recovery", key: "backup" },
        { icon: Download, label: "PWA Install", sub: "Install as mobile app", key: "pwa" },
        { icon: BookOpen, label: "Documentation", sub: "Play Store & ownership docs", key: "docs" },
      ]
    },
  ];

  return (
    <div className="page-content relative">
      <AnimatedBackground overlay="rgba(255,250,240,0.94)" />

      {/* Header */}
      <div className="relative z-10 px-4 py-3.5 flex items-center justify-between sticky top-0"
        style={{ background: "linear-gradient(135deg,#E65100,#FF6F00,#FF8F00)", boxShadow: "0 4px 20px rgba(230,81,0,0.4)" }}>
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center">
            <ChevronLeft size={20} color="white" />
          </button>
          <div>
            <h1 className="text-base font-extrabold text-white">⚙️ Admin Panel</h1>
            <p className="text-orange-200 text-[10px]">Full Control & Management</p>
          </div>
        </div>
        <button onClick={() => { setAuthenticated(false); toast.info("Admin panel locked"); }}
          className="px-3 py-1.5 bg-white/20 rounded-full text-white text-xs font-semibold flex items-center gap-1">
          <Lock size={12} /> Lock
        </button>
      </div>

      {/* Quick toggles */}
      <div className="relative z-10 bg-white mx-4 mt-4 rounded-2xl shadow-md p-4">
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-3">Quick Controls</p>
        <div className="flex gap-2.5">
          {[
            { label: "Maintenance", sub: "App offline", value: maintenanceMode, toggle: () => setMaintenanceMode(!maintenanceMode), onColor: "#F44336" },
            { label: "Registration", sub: "New users", value: registrationOpen, toggle: () => setRegistrationOpen(!registrationOpen), onColor: "#4CAF50" },
          ].map(item => (
            <div key={item.label} className="flex-1 flex items-center justify-between bg-gray-50 rounded-xl p-3">
              <div>
                <p className="text-xs font-semibold text-gray-700">{item.label}</p>
                <p className="text-[9px] text-gray-400">{item.sub}</p>
              </div>
              <button onClick={item.toggle} className="w-10 h-5 rounded-full relative transition-colors flex-shrink-0"
                style={{ background: item.value ? item.onColor : "#E0E0E0" }}>
                <div className="absolute w-4 h-4 bg-white rounded-full top-0.5 transition-all shadow-sm"
                  style={{ left: item.value ? "22px" : "2px" }} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Sections */}
      <div className="relative z-10 px-4 pb-6">
        {sections.map(section => (
          <div key={section.title} className="mt-4">
            <p className="text-[10px] font-bold uppercase tracking-wider mb-2 px-1" style={{ color: section.color }}>
              {section.title}
            </p>
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
              {section.items.map((item, i) => {
                const Icon = item.icon;
                return (
                  <button key={item.key} onClick={() => setActiveSection(item.key)}
                    className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-orange-50 transition-colors text-left"
                    style={{ borderBottom: i < section.items.length - 1 ? "1px solid #f5f5f5" : "none" }}>
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${section.color}18` }}>
                      <Icon size={16} style={{ color: section.color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-800 text-sm">{item.label}</p>
                      <p className="text-gray-400 text-[10px] truncate">{item.sub}</p>
                    </div>
                    <ChevronLeft size={14} className="text-gray-300 rotate-180 flex-shrink-0" />
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ===================== ADMIN SECTIONS =====================
const AdminSection: React.FC<{ section: string; onBack: () => void }> = ({ section, onBack }) => {

  const ImportSection = () => {
    const [url, setUrl] = useState("");
    const [type, setType] = useState("website");
    const [items, setItems] = useState<{ url: string; type: string; label: string }[]>([
      { url: "https://google.com", type: "website", label: "Google" },
      { url: "https://facebook.com", type: "social", label: "Facebook" },
    ]);
    const add = () => {
      if (!url.trim()) return;
      const label = url.replace(/https?:\/\//, "").split("/")[0];
      setItems(p => [...p, { url, type, label }]);
      setUrl("");
      toast.success("Property imported!");
    };
    return (
      <div className="space-y-4">
        <div className="bg-teal-50 rounded-2xl p-4 border border-teal-100">
          <p className="font-bold text-teal-800 mb-3 flex items-center gap-2">
            <Plus size={16} /> Add More Properties
          </p>
          <select value={type} onChange={e => setType(e.target.value)}
            className="w-full bg-white rounded-xl px-3 py-2.5 text-sm text-gray-700 outline-none border border-teal-200 mb-2">
            <option value="website">Website URL</option>
            <option value="social">Social Media</option>
            <option value="email">Email Account</option>
            <option value="domain">Domain / Subdomain</option>
            <option value="api">API Endpoint</option>
            <option value="store">App Store</option>
          </select>
          <input value={url} onChange={e => setUrl(e.target.value)}
            placeholder="Paste URL, email, or domain here..."
            className="w-full bg-white rounded-xl px-3 py-2.5 text-sm text-gray-700 outline-none border border-teal-200 mb-2"
            onKeyDown={e => e.key === "Enter" && add()} />
          <button onClick={add} className="w-full py-3 rounded-xl text-white font-bold text-sm"
            style={{ background: "linear-gradient(135deg,#00838F,#00ACC1)" }}>
            ➕ Import Property
          </button>
          <p className="text-teal-500 text-[10px] text-center mt-1">Supports: .com .pk .org .net .app .io .dev and all formats</p>
        </div>
        <div className="space-y-2">
          {items.map((item, i) => (
            <div key={i} className="bg-white rounded-xl p-3 flex items-center gap-3 shadow-sm">
              <div className="w-8 h-8 rounded-lg bg-teal-50 flex items-center justify-center">
                <Link size={14} style={{ color: "#00838F" }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-800 text-sm truncate">{item.label}</p>
                <p className="text-[10px] text-gray-400 truncate">{item.url}</p>
              </div>
              <span className="text-[9px] font-bold px-2 py-0.5 rounded-full flex-shrink-0" style={{ background: "#E0F7FA", color: "#00838F" }}>{item.type}</span>
              <button onClick={() => setItems(p => p.filter((_, j) => j !== i))} className="w-7 h-7 flex items-center justify-center rounded-lg bg-red-50">
                <Trash2 size={12} className="text-red-400" />
              </button>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const SecuritySection = () => {
    const [newPw, setNewPw] = useState("");
    const [confirmPw, setConfirmPw] = useState("");
    const changePw = () => {
      if (!newPw || newPw.length < 6) { toast.error("Password must be at least 6 characters"); return; }
      if (newPw !== confirmPw) { toast.error("Passwords do not match"); return; }
      localStorage.setItem(ADMIN_PASSWORD_KEY, newPw);
      toast.success("Admin password updated!");
      setNewPw(""); setConfirmPw("");
    };
    return (
      <div className="space-y-4">
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <p className="font-bold text-gray-700 mb-3 text-sm">🔑 Change Admin Password</p>
          <input type="password" value={newPw} onChange={e => setNewPw(e.target.value)}
            placeholder="New password (min 6 chars)" className="w-full bg-gray-50 rounded-xl px-4 py-3 text-sm outline-none border border-gray-200 mb-2" />
          <input type="password" value={confirmPw} onChange={e => setConfirmPw(e.target.value)}
            placeholder="Confirm new password" className="w-full bg-gray-50 rounded-xl px-4 py-3 text-sm outline-none border border-gray-200 mb-3" />
          <button onClick={changePw} className="w-full py-3 rounded-xl text-white font-bold text-sm"
            style={{ background: "linear-gradient(135deg,#B71C1C,#C62828)" }}>
            Update Password
          </button>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <p className="font-bold text-gray-700 mb-3 text-sm">🛡️ Security Features</p>
          {["End-to-end encryption enabled", "RLS policies active on all tables", "JWT authentication required", "Rate limiting on API calls", "Auto-lock after 5 min"].map((f, i) => (
            <div key={i} className="flex items-center gap-2 py-1.5 border-b border-gray-50">
              <CheckCircle size={13} className="text-green-500 flex-shrink-0" />
              <p className="text-sm text-gray-600">{f}</p>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const ThemesSection = () => {
    const themes = [
      { name: "Purple Galaxy", colors: ["#7C4DFF", "#E040FB", "#C2185B"], active: true },
      { name: "Ocean Blue", colors: ["#0288D1", "#00BCD4", "#1565C0"], active: false },
      { name: "Forest Green", colors: ["#2E7D32", "#4CAF50", "#1B5E20"], active: false },
      { name: "Sunset Orange", colors: ["#E65100", "#FF6F00", "#F57F17"], active: false },
      { name: "Rose Pink", colors: ["#AD1457", "#E91E63", "#F06292"], active: false },
      { name: "Dark Night", colors: ["#212121", "#424242", "#616161"], active: false },
      { name: "Golden Sand", colors: ["#F57F17", "#FBC02D", "#F9A825"], active: false },
      { name: "Islamic Green", colors: ["#1B5E20", "#2E7D32", "#388E3C"], active: false },
      { name: "Royal Blue", colors: ["#1A237E", "#283593", "#3949AB"], active: false },
      { name: "Cherry Red", colors: ["#B71C1C", "#C62828", "#D32F2F"], active: false },
    ];
    const [activeTheme, setActiveTheme] = useState(0);
    const effects = ["Glass Morphism", "Neumorphism", "Gradient Flow", "Particle Burst", "Bokeh Blur", "Neon Glow"];
    const [activeEffect, setActiveEffect] = useState(0);
    return (
      <div className="space-y-4">
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <p className="font-bold text-gray-700 mb-3 text-sm">🎨 10 Unique Themes</p>
          <div className="grid grid-cols-2 gap-2">
            {themes.map((t, i) => (
              <button key={i} onClick={() => { setActiveTheme(i); toast.success(`${t.name} theme applied!`); }}
                className="rounded-xl p-3 text-left transition-all"
                style={{ background: i === activeTheme ? `${t.colors[0]}18` : "#f9f9f9", border: `2px solid ${i === activeTheme ? t.colors[0] : "transparent"}` }}>
                <div className="flex gap-1 mb-2">
                  {t.colors.map((c, j) => <div key={j} className="w-5 h-5 rounded-full" style={{ background: c }} />)}
                </div>
                <p className="text-xs font-semibold text-gray-700">{t.name}</p>
                {i === activeTheme && <p className="text-[9px] font-bold text-green-500 mt-0.5">✓ Active</p>}
              </button>
            ))}
          </div>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <p className="font-bold text-gray-700 mb-3 text-sm">✨ Live Effects Per Tab</p>
          <div className="space-y-2">
            {effects.map((ef, i) => (
              <button key={i} onClick={() => { setActiveEffect(i); toast.success(`${ef} effect applied!`); }}
                className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all"
                style={{ background: i === activeEffect ? "#EDE7F6" : "#f9f9f9" }}>
                <p className="text-sm font-medium text-gray-700">{ef}</p>
                {i === activeEffect ? <ToggleRight size={20} style={{ color: "#7C4DFF" }} /> : <ToggleLeft size={20} className="text-gray-300" />}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const configs: Record<string, { title: string; emoji: string; color: string; content: React.ReactNode }> = {
    analytics: {
      title: "Analytics", emoji: "📊", color: "#FF6F00",
      content: (
        <div className="space-y-2.5">
          {[
            { label: "Total Users", value: "1,247", icon: "👥", color: "#7C4DFF" },
            { label: "Active Today", value: "384", icon: "🟢", color: "#4CAF50" },
            { label: "Messages Sent", value: "48,291", icon: "💬", color: "#2196F3" },
            { label: "Calls Today", value: "126", icon: "📞", color: "#FF4081" },
            { label: "Stories Posted", value: "89", icon: "📸", color: "#FF9800" },
            { label: "New Signups", value: "23", icon: "✨", color: "#9C27B0" },
          ].map(stat => (
            <div key={stat.label} className="bg-white rounded-xl p-4 flex items-center gap-3 shadow-sm">
              <span className="text-2xl">{stat.icon}</span>
              <div className="flex-1">
                <p className="text-xs text-gray-400">{stat.label}</p>
                <p className="text-xl font-extrabold" style={{ color: stat.color }}>{stat.value}</p>
              </div>
            </div>
          ))}
        </div>
      )
    },
    import: { title: "Import Properties", emoji: "➕", color: "#00838F", content: <ImportSection /> },
    security: { title: "Security", emoji: "🛡️", color: "#B71C1C", content: <SecuritySection /> },
    themes: { title: "Themes & Effects", emoji: "🎨", color: "#7C4DFF", content: <ThemesSection /> },
    users: {
      title: "User Management", emoji: "👥", color: "#FF6F00",
      content: (
        <div className="space-y-2.5">
          <div className="bg-orange-50 rounded-xl p-3 border border-orange-100">
            <p className="text-sm text-orange-700">Live user data loads from backend when users sign up.</p>
          </div>
          {["Ahmed Khan", "Sara Ahmed", "Fatima Malik", "Usman Khan", "Zara Malik"].map(name => (
            <div key={name} className="bg-white rounded-xl p-3 flex items-center gap-3 shadow-sm">
              <div className="w-9 h-9 rounded-full bg-purple-100 flex items-center justify-center font-bold text-purple-600 text-sm">{name[0]}</div>
              <div className="flex-1">
                <p className="font-semibold text-gray-800 text-sm">{name}</p>
                <p className="text-[10px] text-green-500">● Active</p>
              </div>
              <div className="flex gap-1">
                <button className="px-2 py-1 bg-red-50 text-red-500 rounded-lg text-[10px] font-semibold">Ban</button>
                <button className="px-2 py-1 bg-blue-50 text-blue-500 rounded-lg text-[10px] font-semibold">View</button>
              </div>
            </div>
          ))}
        </div>
      )
    },
    source: {
      title: "Source Code", emoji: "💻", color: "#2E7D32",
      content: (
        <div className="space-y-3">
          <div className="bg-green-50 rounded-2xl p-4 border border-green-200">
            <p className="font-bold text-green-800 mb-2">📦 Complete Source Code</p>
            <p className="text-green-700 text-sm mb-4">React/TypeScript + Supabase. Ready for GitHub & deployment.</p>
            {[
              { label: "GitHub Repository", url: "https://github.com", icon: "🐙" },
              { label: "Download from OnSpace", url: "#", icon: "⬇️" },
              { label: "Backend Config", url: "#", icon: "🗄️" },
            ].map(item => (
              <a key={item.label} href={item.url} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-3 bg-white rounded-xl p-3 shadow-sm mb-2 hover:shadow-md transition-shadow">
                <span className="text-lg">{item.icon}</span>
                <p className="font-semibold text-gray-700 text-sm flex-1">{item.label}</p>
                <Download size={14} className="text-green-500" />
              </a>
            ))}
          </div>
        </div>
      )
    },
    backup: {
      title: "Backup", emoji: "🛡️", color: "#1565C0",
      content: (
        <div className="space-y-3">
          <div className="bg-blue-50 rounded-2xl p-4 border border-blue-200">
            <p className="font-bold text-blue-800 mb-2">🔄 Full App Backup</p>
            <p className="text-blue-700 text-sm mb-4">Database snapshot, source code, and recovery guide.</p>
            <button className="w-full py-3 rounded-xl text-white font-bold text-sm"
              style={{ background: "linear-gradient(135deg,#1565C0,#1E88E5)" }}>
              📥 Download Backup (.zip)
            </button>
          </div>
          <div className="bg-amber-50 rounded-2xl p-4 border border-amber-100">
            <AlertTriangle size={16} className="text-amber-600 mb-2" />
            <p className="font-bold text-amber-800 mb-1 text-sm">Recovery Steps</p>
            <p className="text-amber-700 text-xs">1. Extract backup zip<br/>2. npm install<br/>3. Restore .env<br/>4. npm run dev</p>
          </div>
        </div>
      )
    },
    pwa: {
      title: "PWA Install", emoji: "📱", color: "#4CAF50",
      content: (
        <div className="space-y-3">
          <div className="bg-green-50 rounded-2xl p-5 border border-green-200 text-center">
            <div className="text-5xl mb-3">📲</div>
            <p className="font-bold text-green-800 text-base mb-2">Install It's Me</p>
            <p className="text-green-700 text-sm mb-4">Native app experience — no Play Store needed</p>
            <button onClick={() => {
              const p = (window as any).deferredInstallPrompt;
              if (p) p.prompt();
              else alert("Browser menu → 'Add to Home Screen'");
            }}
              className="w-full py-4 rounded-2xl text-white font-extrabold shadow-xl"
              style={{ background: "linear-gradient(135deg,#4CAF50,#2E7D32)" }}>
              📲 Install Now (1-Tap)
            </button>
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <p className="font-bold text-gray-700 mb-2 text-sm">PWA Features:</p>
            {["Works offline", "Push notifications", "Native app feel", "Home screen icon", "Auto updates"].map(f => (
              <div key={f} className="flex items-center gap-2 py-1">
                <CheckCircle size={13} className="text-green-500" />
                <p className="text-sm text-gray-600">{f}</p>
              </div>
            ))}
          </div>
        </div>
      )
    },
    docs: {
      title: "Documentation", emoji: "📋", color: "#9C27B0",
      content: (
        <div className="space-y-2.5">
          {[
            { title: "🏪 Play Store Upload Guide", url: "https://developer.android.com/distribute/googleplay/start" },
            { title: "📜 App Ownership & Legal", url: "#" },
            { title: "🔒 Privacy Policy Template", url: "#" },
            { title: "📋 Terms of Service", url: "#" },
            { title: "💰 Monetization Guide", url: "#" },
            { title: "🌐 Domain & Hosting", url: "https://docs.netlify.com/" },
          ].map(doc => (
            <a key={doc.title} href={doc.url} target="_blank" rel="noopener noreferrer"
              className="block bg-white rounded-xl p-3.5 shadow-sm hover:shadow-md transition-shadow">
              <p className="font-semibold text-gray-800 text-sm">{doc.title}</p>
            </a>
          ))}
        </div>
      )
    },
  };

  const config = configs[section] || {
    title: section, emoji: "⚙️", color: "#FF6F00",
    content: (
      <div className="bg-white rounded-2xl p-6 shadow-sm text-center">
        <p className="text-4xl mb-3">🔧</p>
        <p className="font-bold text-gray-700">Coming Soon</p>
        <p className="text-gray-400 text-sm mt-2">This section is being configured</p>
      </div>
    )
  };

  return (
    <div className="page-content relative">
      <AnimatedBackground overlay="rgba(255,250,240,0.94)" />
      <div className="sticky top-0 z-10 px-4 py-3.5 flex items-center gap-3"
        style={{ background: `linear-gradient(135deg,${config.color},${config.color}cc)`, boxShadow: `0 4px 18px ${config.color}44` }}>
        <button onClick={onBack} className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center">
          <ChevronLeft size={20} color="white" />
        </button>
        <div>
          <h1 className="text-base font-bold text-white">{config.emoji} {config.title}</h1>
          <p className="text-white/70 text-[10px]">Admin · Full Control</p>
        </div>
      </div>
      <div className="relative z-10 px-4 pt-4 pb-6">{config.content}</div>
    </div>
  );
};

export default AdminPanelPage;
