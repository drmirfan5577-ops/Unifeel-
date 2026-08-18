import React, { useState } from "react";
import { Users, Plus, ChevronRight, Search, Radio } from "lucide-react";
import AnimatedBackground from "@/components/layout/AnimatedBackground";

interface CommunitiesPageProps {
  onNavigate?: (page: string) => void;
}

const communities = [
  {
    id: "1",
    name: "It's Me Official",
    description: "Official community for It's Me app users",
    members: "12.4K",
    avatar: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=80&h=80&fit=crop",
    groups: 5,
    verified: true,
  },
  {
    id: "2",
    name: "Pakistan Digital Hub",
    description: "Connecting Pakistani digital creators",
    members: "8.9K",
    avatar: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=80&h=80&fit=crop",
    groups: 8,
    verified: true,
  },
  {
    id: "3",
    name: "Islamic Community",
    description: "Islamic knowledge, Quran, Hadith sharing",
    members: "22.1K",
    avatar: "https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=80&h=80&fit=crop",
    groups: 12,
    verified: true,
  },
  {
    id: "4",
    name: "Tech Enthusiasts PK",
    description: "Latest tech news and discussions",
    members: "5.6K",
    avatar: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=80&h=80&fit=crop",
    groups: 4,
    verified: false,
  },
];

const CommunitiesPage: React.FC<CommunitiesPageProps> = ({ onNavigate }) => {
  const [search, setSearch] = useState("");

  const filtered = communities.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="page-content relative">
      <AnimatedBackground overlay="rgba(255,255,255,0.9)" />

      <div className="app-header px-4 py-4 relative z-10">
        <h1 className="text-xl font-bold text-white">Communities</h1>
        <p className="text-teal-200 text-xs">Connect with groups & communities</p>
      </div>

      <div className="relative z-10 px-4 pt-4">
        {/* Search */}
        <div className="relative mb-4">
          <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search communities..."
            className="w-full search-input pl-10 pr-4 py-3 text-sm outline-none"
          />
        </div>

        {/* Go Live banner */}
        <button
          onClick={() => onNavigate?.("live")}
          className="w-full mb-5 p-4 rounded-2xl flex items-center gap-3 shadow-lg transition-all active:scale-98"
          style={{ background: "linear-gradient(135deg,#FF4081,#F44336)", boxShadow: "0 4px 20px rgba(244,67,54,0.35)" }}
        >
          <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
            <Radio size={24} color="white" />
          </div>
          <div className="text-left">
            <p className="text-white font-semibold">🔴 Go Live</p>
            <p className="text-red-100 text-xs">Start live streaming to your followers</p>
          </div>
          <ChevronRight size={20} color="white" className="ml-auto" />
        </button>

        {/* Create community */}
        <button
          className="w-full mb-5 p-4 rounded-2xl flex items-center gap-3 shadow-lg transition-all active:scale-98"
          style={{
            background: "linear-gradient(135deg, #00897B, #4DB6AC)",
            boxShadow: "0 4px 20px rgba(0,137,123,0.3)",
          }}
        >
          <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
            <Plus size={24} color="white" />
          </div>
          <div className="text-left">
            <p className="text-white font-semibold">New Community</p>
            <p className="text-teal-100 text-xs">Create groups within a community</p>
          </div>
          <ChevronRight size={20} color="white" className="ml-auto" />
        </button>

        {/* Communities list */}
        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Your Communities</p>
        {filtered.map(community => (
          <div
            key={community.id}
            className="bg-white rounded-2xl shadow-md mb-3 overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
          >
            <div className="p-4 flex items-start gap-3">
              <img
                src={community.avatar}
                alt={community.name}
                className="w-14 h-14 rounded-xl object-cover flex-shrink-0"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1 mb-0.5">
                  <p className="font-semibold text-gray-800 text-sm">{community.name}</p>
                  {community.verified && (
                    <span className="text-teal-500 text-xs">✓</span>
                  )}
                </div>
                <p className="text-xs text-gray-500 mb-2">{community.description}</p>
                <div className="flex items-center gap-3 text-xs text-gray-400">
                  <span className="flex items-center gap-1">
                    <Users size={11} />
                    {community.members} members
                  </span>
                  <span>{community.groups} groups</span>
                </div>
              </div>
              <ChevronRight size={18} className="text-gray-300 flex-shrink-0 mt-1" />
            </div>
          </div>
        ))}

        {/* Groups section */}
        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mt-4 mb-3">Active Groups</p>
        {[
          { name: "Friends Forever 🌟", members: 24, lastMsg: "Ali: Let's meet Saturday!" },
          { name: "Office Team 🏢", members: 15, lastMsg: "Meeting rescheduled to 3 PM" },
          { name: "Family Group 👨‍👩‍👧‍👦", members: 18, lastMsg: "Mom: Dinner at 8 PM everyone!" },
        ].map((g) => (
          <div key={g.name} className="flex items-center gap-3 p-3 bg-white rounded-xl shadow-sm mb-2 cursor-pointer hover:shadow-md transition-shadow">
            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center text-xl font-bold text-white"
              style={{ background: "linear-gradient(135deg, #00897B, #4DB6AC)" }}
            >
              {g.name[0]}
            </div>
            <div className="flex-1">
              <p className="font-semibold text-gray-800 text-sm">{g.name}</p>
              <p className="text-xs text-gray-400 truncate">{g.lastMsg}</p>
            </div>
            <span className="text-xs text-gray-400">{g.members}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CommunitiesPage;
