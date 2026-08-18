import React from "react";
import { Home, Users, Globe2, BookOpen, Globe, Settings } from "lucide-react";

interface BottomNavProps {
  active: string;
  onNavigate: (page: string) => void;
}

const tabs: { key: string; label: string; urdu: string; Icon: any; color: string; activeColor: string; badge?: string }[] = [
  { key: "chats", label: "Home", urdu: "ہوم", Icon: Home, color: "#7C4DFF", activeColor: "rgba(124,77,255,0.12)" },
  { key: "updates", label: "Guests", urdu: "مہمان", Icon: Users, color: "#E040FB", activeColor: "rgba(224,64,251,0.12)" },
  { key: "communities", label: "🌎", urdu: "گلوب", Icon: Globe2, color: "#00BCD4", activeColor: "rgba(0,188,212,0.12)", badge: "LIVE" },
  { key: "ihub", label: "I-Hub", urdu: "آئی ہب", Icon: BookOpen, color: "#4CAF50", activeColor: "rgba(76,175,80,0.12)" },
  { key: "eshub", label: "ES-Hub", urdu: "ای ایس", Icon: Globe, color: "#FF9800", activeColor: "rgba(255,152,0,0.12)" },
  { key: "settings", label: "Set!", urdu: "سیٹ", Icon: Settings, color: "#F44336", activeColor: "rgba(244,67,54,0.12)" },
];

const BottomNav: React.FC<BottomNavProps> = ({ active, onNavigate }) => {
  return (
    <nav className="bottom-nav">
      <div className="flex items-stretch" style={{ height: "60px" }}>
        {tabs.map(({ key, label, Icon, color, activeColor, badge }) => {
          const isActive = active === key;
          return (
            <button
              key={key}
              onClick={() => onNavigate(key)}
              className="flex-1 flex flex-col items-center justify-center gap-0.5 relative transition-all duration-200 active:scale-90"
              style={{ minWidth: 0 }}
            >
              {isActive && (
                <div
                  className="absolute top-0 left-1/2 -translate-x-1/2 rounded-b-full"
                  style={{ width: "24px", height: "2.5px", background: color }}
                />
              )}
              <div
                className="relative flex items-center justify-center rounded-xl transition-all duration-200"
                style={{ width: "32px", height: "24px", background: isActive ? activeColor : "transparent" }}
              >
                {key === "communities" ? (
                  <span style={{ fontSize: "16px", lineHeight: 1 }}>🌎</span>
                ) : (
                  <Icon size={isActive ? 19 : 17} style={{ color: isActive ? color : "#9E9E9E", transition: "all 0.2s" }} />
                )}
                {badge && (
                  <div
                    className="absolute -top-1 -right-1 text-white font-bold leading-none rounded"
                    style={{ fontSize: "6px", background: "#F44336", padding: "1.5px 3px" }}
                  >
                    {badge}
                  </div>
                )}
              </div>
              <span
                className="font-medium leading-none transition-all duration-200"
                style={{ fontSize: "8.5px", color: isActive ? color : "#9E9E9E", fontWeight: isActive ? 700 : 500 }}
              >
                {label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
