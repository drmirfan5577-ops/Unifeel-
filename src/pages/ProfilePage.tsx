import React, { useState } from "react";
import { QrCode, ChevronRight, Edit3, Mail, Phone, Camera } from "lucide-react";
import AnimatedBackground from "@/components/layout/AnimatedBackground";
import { getUser, saveUser, logout } from "@/lib/store";

interface ProfilePageProps {
  onLogout: () => void;
}

const ProfilePage: React.FC<ProfilePageProps> = ({ onLogout }) => {
  const [user, setUser] = useState(getUser());
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState(user.name);
  const [editStatus, setEditStatus] = useState(user.status);

  const handleSave = () => {
    const updated = { ...user, name: editName, status: editStatus };
    saveUser(updated);
    setUser(updated);
    setEditing(false);
  };

  const settingsItems = [
    { icon: "🔑", label: "Account", sub: "Privacy, security, change number", color: "#E91E63", bg: "#FCE4EC" },
    { icon: "🔒", label: "Privacy", sub: "Block contacts, disappearing messages", color: "#9C27B0", bg: "#F3E5F5" },
    { icon: "💬", label: "Chats", sub: "Theme, wallpapers, chat history", color: "#2196F3", bg: "#E3F2FD" },
    { icon: "🔔", label: "Notifications", sub: "Message, group & call tones", color: "#FF9800", bg: "#FFF3E0" },
    { icon: "💾", label: "Storage and Data", sub: "Network usage, auto-download", color: "#607D8B", bg: "#ECEFF1" },
    { icon: "❓", label: "Help", sub: "Help centre, contact us, privacy policy", color: "#00BCD4", bg: "#E0F7FA" },
  ];

  return (
    <div className="page-content relative">
      <AnimatedBackground overlay="rgba(248,250,255,0.92)" />

      <div className="app-header px-4 py-4 relative z-10 flex items-center justify-between">
        <h1 className="text-xl font-bold text-white">Profile</h1>
        <button className="w-9 h-9 flex items-center justify-center rounded-full bg-white/20">
          <QrCode size={20} color="white" />
        </button>
      </div>

      <div className="relative z-10 px-4 pt-5">
        {/* Profile card */}
        <div className="bg-white rounded-2xl shadow-md p-5 mb-5">
          <div className="flex items-start gap-4">
            <div className="relative">
              <img
                src={user.avatar}
                alt={user.name}
                className="w-20 h-20 rounded-full object-cover shadow-lg"
              />
              <button className="absolute bottom-0 right-0 w-7 h-7 bg-teal-500 rounded-full flex items-center justify-center shadow-md">
                <Camera size={12} color="white" />
              </button>
            </div>
            <div className="flex-1 min-w-0">
              {editing ? (
                <div className="space-y-2">
                  <input
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full bg-gray-100 rounded-lg px-3 py-2 text-sm font-semibold outline-none focus:ring-2 focus:ring-teal-500"
                  />
                  <input
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value)}
                    className="w-full bg-gray-100 rounded-lg px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-teal-500"
                  />
                  <div className="flex gap-2">
                    <button onClick={handleSave} className="px-4 py-1.5 bg-teal-500 text-white rounded-lg text-xs font-semibold">Save</button>
                    <button onClick={() => setEditing(false)} className="px-4 py-1.5 bg-gray-200 text-gray-600 rounded-lg text-xs font-semibold">Cancel</button>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="font-bold text-gray-800 text-xl">{user.name}</h2>
                    <button onClick={() => setEditing(true)}>
                      <Edit3 size={15} className="text-teal-500" />
                    </button>
                  </div>
                  <p className="text-gray-500 text-sm mt-0.5">{user.status}</p>
                </div>
              )}
            </div>
            <button className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
              <QrCode size={16} className="text-gray-600" />
            </button>
          </div>

          <div className="mt-4 space-y-3 pt-4 border-t border-gray-100">
            <div className="flex items-center gap-3">
              <Mail size={16} className="text-teal-500 flex-shrink-0" />
              <p className="text-gray-700 text-sm">{user.email}</p>
            </div>
            <div className="flex items-center gap-3">
              <Phone size={16} className="text-teal-500 flex-shrink-0" />
              <p className="text-gray-700 text-sm">{user.phone}</p>
            </div>
          </div>
        </div>

        {/* Settings items */}
        <div className="bg-white rounded-2xl shadow-md overflow-hidden mb-5">
          {settingsItems.map((item, i) => (
            <button
              key={item.label}
              className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-gray-50 transition-colors text-left"
              style={{ borderBottom: i < settingsItems.length - 1 ? "1px solid #f5f5f5" : "none" }}
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                style={{ background: item.bg }}
              >
                {item.icon}
              </div>
              <div className="flex-1">
                <p className="font-semibold text-gray-800 text-sm">{item.label}</p>
                <p className="text-gray-400 text-xs">{item.sub}</p>
              </div>
              <ChevronRight size={16} className="text-gray-300" />
            </button>
          ))}
        </div>

        {/* Logout */}
        <button
          onClick={() => { logout(); onLogout(); }}
          className="w-full bg-white rounded-2xl shadow-md p-4 flex items-center justify-center gap-3 text-red-500 hover:bg-red-50 transition-colors mb-6"
        >
          <span className="text-lg">🚪</span>
          <span className="font-semibold">Log Out</span>
        </button>
      </div>
    </div>
  );
};

export default ProfilePage;
