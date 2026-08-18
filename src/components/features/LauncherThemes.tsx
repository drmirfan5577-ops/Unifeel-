import React, { useState } from "react";
import { ChevronLeft, Check } from "lucide-react";
import { getSelectedTheme, setSelectedTheme } from "@/lib/store";
import AnimatedBackground from "@/components/layout/AnimatedBackground";

interface LauncherThemesProps {
  onBack: () => void;
}

const themes = [
  {
    id: "theme1",
    name: "Teal Classic",
    gradient: "linear-gradient(135deg, #00897B 0%, #4DB6AC 50%, #80CBC4 100%)",
    accent: "#00897B",
    preview: "🌊",
    style: "Smooth, professional teal elegance",
  },
  {
    id: "theme2",
    name: "Royal Gold",
    gradient: "linear-gradient(135deg, #F57F17 0%, #FBC02D 50%, #FFD54F 100%)",
    accent: "#F57F17",
    preview: "✨",
    style: "Luxurious golden radiance",
  },
  {
    id: "theme3",
    name: "Deep Purple",
    gradient: "linear-gradient(135deg, #4A148C 0%, #7B1FA2 50%, #CE93D8 100%)",
    accent: "#7B1FA2",
    preview: "💜",
    style: "Mystical purple depth",
  },
  {
    id: "theme4",
    name: "Sunset Fire",
    gradient: "linear-gradient(135deg, #B71C1C 0%, #E64A19 50%, #FF8A65 100%)",
    accent: "#E64A19",
    preview: "🔥",
    style: "Bold fiery sunset warmth",
  },
  {
    id: "theme5",
    name: "Ocean Blue",
    gradient: "linear-gradient(135deg, #0D47A1 0%, #1976D2 50%, #64B5F6 100%)",
    accent: "#1976D2",
    preview: "🌊",
    style: "Deep ocean crystal clarity",
  },
  {
    id: "theme6",
    name: "Forest Green",
    gradient: "linear-gradient(135deg, #1B5E20 0%, #388E3C 50%, #81C784 100%)",
    accent: "#388E3C",
    preview: "🌿",
    style: "Natural forest tranquility",
  },
  {
    id: "theme7",
    name: "Rose Gold",
    gradient: "linear-gradient(135deg, #880E4F 0%, #C2185B 50%, #F48FB1 100%)",
    accent: "#C2185B",
    preview: "🌹",
    style: "Elegant rose gold glamour",
  },
  {
    id: "theme8",
    name: "Midnight Dark",
    gradient: "linear-gradient(135deg, #1A1A2E 0%, #16213E 50%, #0F3460 100%)",
    accent: "#E94560",
    preview: "🌙",
    style: "Sleek midnight digital neon",
  },
  {
    id: "theme9",
    name: "Neon Cyber",
    gradient: "linear-gradient(135deg, #00BFA5 0%, #1DE9B6 50%, #A7FFEB 100%)",
    accent: "#00BFA5",
    preview: "⚡",
    style: "Electric cyberpunk glow",
  },
  {
    id: "theme10",
    name: "Islamic Green",
    gradient: "linear-gradient(135deg, #004D40 0%, #00695C 50%, #4DB6AC 100%)",
    accent: "#00695C",
    preview: "☽",
    style: "Sacred Islamic heritage",
  },
];

const LauncherThemes: React.FC<LauncherThemesProps> = ({ onBack }) => {
  const [selected, setSelected] = useState(getSelectedTheme());
  const [previewing, setPreviewing] = useState<string | null>(null);

  const handleSelect = (id: string) => {
    setSelected(id);
    setSelectedTheme(id);
  };

  return (
    <div className="page-content relative">
      <AnimatedBackground overlay="rgba(245,245,255,0.92)" />

      <div
        className="relative z-10 px-4 py-4 flex items-center gap-3 sticky top-0"
        style={{ background: "linear-gradient(135deg, #4A148C, #7B1FA2)", boxShadow: "0 4px 20px rgba(74,20,140,0.4)" }}
      >
        <button onClick={onBack} className="w-9 h-9 flex items-center justify-center rounded-full bg-white/20">
          <ChevronLeft size={20} color="white" />
        </button>
        <div>
          <h1 className="text-lg font-bold text-white">Launcher Themes</h1>
          <p className="text-purple-100 text-xs">10 Unique Digital Themes</p>
        </div>
      </div>

      <div className="relative z-10 px-4 pt-5">
        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">
          Select Your Theme
        </p>

        <div className="grid grid-cols-2 gap-3">
          {themes.map((theme) => {
            const isSelected = selected === theme.id;
            return (
              <div
                key={theme.id}
                className="theme-card shadow-lg cursor-pointer relative overflow-hidden"
                style={{
                  border: isSelected ? "3px solid #7B1FA2" : "3px solid transparent",
                  boxShadow: isSelected ? "0 0 20px rgba(123,31,162,0.5)" : "0 4px 15px rgba(0,0,0,0.1)",
                }}
                onClick={() => handleSelect(theme.id)}
              >
                {/* Theme preview */}
                <div
                  className="h-28 relative flex items-center justify-center"
                  style={{ background: theme.gradient }}
                >
                  {/* Animated sparkles */}
                  <div className="absolute inset-0 overflow-hidden">
                    {[...Array(5)].map((_, i) => (
                      <div
                        key={i}
                        className="absolute w-1.5 h-1.5 rounded-full bg-white/40"
                        style={{
                          top: `${20 + i * 15}%`,
                          left: `${10 + i * 18}%`,
                          animation: `sparkle ${1 + i * 0.3}s ease-in-out infinite`,
                          animationDelay: `${i * 0.2}s`,
                        }}
                      />
                    ))}
                  </div>

                  {/* Mock phone UI */}
                  <div
                    className="w-16 h-20 rounded-xl flex flex-col overflow-hidden shadow-xl"
                    style={{ background: "rgba(255,255,255,0.15)", backdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.3)" }}
                  >
                    <div className="h-5 flex items-center px-1.5" style={{ background: theme.accent }}>
                      <div className="w-2 h-2 bg-white/80 rounded-full" />
                      <div className="flex-1 h-1 bg-white/50 rounded mx-1" />
                    </div>
                    {[0,1,2].map((i) => (
                      <div key={i} className="flex items-center gap-1 px-1.5 py-1">
                        <div className="w-4 h-4 rounded-full bg-white/30" />
                        <div className="flex-1">
                          <div className="h-1 bg-white/40 rounded mb-0.5" />
                          <div className="h-0.5 w-3/4 bg-white/25 rounded" />
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Preview emoji */}
                  <span
                    className="absolute top-2 right-2 text-lg"
                    style={{ filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.3))" }}
                  >
                    {theme.preview}
                  </span>

                  {/* Selected checkmark */}
                  {isSelected && (
                    <div
                      className="absolute top-2 left-2 w-6 h-6 rounded-full flex items-center justify-center"
                      style={{ background: "#7B1FA2" }}
                    >
                      <Check size={13} color="white" strokeWidth={3} />
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="bg-white p-2.5">
                  <p className="font-bold text-gray-800 text-xs">{theme.name}</p>
                  <p className="text-[10px] text-gray-400 leading-tight">{theme.style}</p>
                  {isSelected && (
                    <span
                      className="inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded-full text-white"
                      style={{ background: theme.accent }}
                    >
                      Active
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Apply button */}
        <div className="mt-5 mb-6">
          <button
            onClick={onBack}
            className="w-full py-4 rounded-2xl text-white font-bold text-base shadow-xl transition-all active:scale-95"
            style={{
              background: themes.find(t => t.id === selected)?.gradient || "linear-gradient(135deg, #00897B, #4DB6AC)",
              boxShadow: "0 6px 25px rgba(0,0,0,0.2)",
            }}
          >
            ✨ Apply Theme & Continue
          </button>
        </div>
      </div>
    </div>
  );
};

export default LauncherThemes;
