import React, { useState, useRef } from "react";
import { X, Type, Image, Smile, Send, ChevronLeft, Palette } from "lucide-react";

interface StoryCreatorPageProps {
  onClose: () => void;
  onPost: (story: { content: string; bg: string; textColor: string; type: string }) => void;
}

const gradients = [
  "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
  "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
  "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
  "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
  "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
  "linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)",
  "linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)",
  "linear-gradient(135deg, #ff9a9e 0%, #fad0c4 100%)",
  "linear-gradient(135deg, #a1c4fd 0%, #c2e9fb 100%)",
  "linear-gradient(135deg, #d4fc79 0%, #96e6a1 100%)",
  "linear-gradient(135deg, #f6d365 0%, #fda085 100%)",
  "linear-gradient(135deg, #0f2027 0%, #203a43 50%, #2c5364 100%)",
];

const textColors = ["#ffffff", "#000000", "#FFD700", "#FF6B6B", "#4ECDC4", "#A29BFE", "#FD79A8", "#55EFC4"];

const stickers = ["😊", "❤️", "🌟", "🔥", "💯", "🎉", "👍", "😍", "🌈", "💫", "✨", "🎊", "🙌", "💪", "🎶", "📸"];

const StoryCreatorPage: React.FC<StoryCreatorPageProps> = ({ onClose, onPost }) => {
  const [text, setText] = useState("");
  const [selectedBg, setSelectedBg] = useState(gradients[0]);
  const [textColor, setTextColor] = useState("#ffffff");
  const [showStickers, setShowStickers] = useState(false);
  const [showColors, setShowColors] = useState(false);
  const [fontSize, setFontSize] = useState(28);
  const [textAlign, setTextAlign] = useState<"left" | "center" | "right">("center");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAddSticker = (s: string) => {
    setText((prev) => prev + s);
    setShowStickers(false);
  };

  const handlePost = () => {
    if (!text.trim()) return;
    onPost({ content: text, bg: selectedBg, textColor, type: "text" });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[150] flex flex-col" style={{ background: "#000" }}>
      {/* Story preview */}
      <div
        className="flex-1 relative flex items-center justify-center"
        style={{ background: selectedBg }}
      >
        {/* Top controls */}
        <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-4 pt-10 pb-3 z-10" style={{ background: "rgba(0,0,0,0.15)" }}>
          <button onClick={onClose} className="w-10 h-10 bg-black/30 rounded-full flex items-center justify-center backdrop-blur-sm">
            <X size={20} color="white" />
          </button>
          <p className="text-white font-bold text-lg" style={{ textShadow: "0 2px 8px rgba(0,0,0,0.5)" }}>Create Story</p>
          <div className="w-10" />
        </div>

        {/* Text display */}
        <div className="px-8 text-center" style={{ maxWidth: "90%" }}>
          {text ? (
            <p
              className="font-bold leading-tight break-words"
              style={{
                color: textColor,
                fontSize: `${fontSize}px`,
                textAlign,
                textShadow: textColor === "#ffffff" ? "0 2px 10px rgba(0,0,0,0.3)" : "0 2px 10px rgba(255,255,255,0.3)",
                fontFamily: "'Inter', sans-serif",
              }}
            >
              {text}
            </p>
          ) : (
            <p className="text-white/40 text-lg font-medium">Tap to add your story text...</p>
          )}
        </div>

        {/* Font size slider */}
        <div className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col items-center gap-2">
          <Type size={16} color="white" />
          <input
            type="range"
            min={16}
            max={56}
            value={fontSize}
            onChange={(e) => setFontSize(Number(e.target.value))}
            className="w-24 accent-white"
            style={{ writingMode: "vertical-lr", direction: "rtl", height: "120px" }}
          />
          <span className="text-white text-xs">{fontSize}</span>
        </div>
      </div>

      {/* Bottom panel */}
      <div style={{ background: "#111", paddingBottom: "env(safe-area-inset-bottom,0px)" }}>
        {/* Background gradient picker */}
        <div className="flex gap-2 px-4 py-3 overflow-x-auto scrollbar-hide">
          {gradients.map((g, i) => (
            <button
              key={i}
              onClick={() => setSelectedBg(g)}
              className="flex-shrink-0 rounded-xl transition-transform active:scale-90"
              style={{
                width: "44px",
                height: "44px",
                background: g,
                border: selectedBg === g ? "3px solid #fff" : "3px solid transparent",
                transform: selectedBg === g ? "scale(1.15)" : "scale(1)",
              }}
            />
          ))}
        </div>

        {/* Text color */}
        {showColors && (
          <div className="flex gap-2 px-4 pb-3 overflow-x-auto">
            {textColors.map((c) => (
              <button
                key={c}
                onClick={() => { setTextColor(c); setShowColors(false); }}
                className="flex-shrink-0 rounded-full border-2"
                style={{
                  width: "32px",
                  height: "32px",
                  background: c,
                  borderColor: textColor === c ? "#fff" : "transparent",
                }}
              />
            ))}
          </div>
        )}

        {/* Sticker picker */}
        {showStickers && (
          <div className="flex flex-wrap gap-2 px-4 pb-3">
            {stickers.map((s) => (
              <button key={s} onClick={() => handleAddSticker(s)} className="text-2xl active:scale-90 transition-transform">
                {s}
              </button>
            ))}
          </div>
        )}

        {/* Text input */}
        <div className="px-4 pb-3">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Write your story..."
            maxLength={200}
            rows={2}
            className="w-full bg-white/10 rounded-2xl px-4 py-3 text-white placeholder-white/40 text-sm outline-none resize-none"
            style={{ border: "1px solid rgba(255,255,255,0.15)" }}
          />
          <div className="flex justify-between items-center mt-1 px-1">
            <span className="text-white/30 text-xs">{text.length}/200</span>
            <div className="flex gap-3">
              <button onClick={() => { setShowColors(!showColors); setShowStickers(false); }}>
                <Palette size={18} color="rgba(255,255,255,0.5)" />
              </button>
              <button onClick={() => { setShowStickers(!showStickers); setShowColors(false); }}>
                <Smile size={18} color="rgba(255,255,255,0.5)" />
              </button>
              <button onClick={() => fileInputRef.current?.click()}>
                <Image size={18} color="rgba(255,255,255,0.5)" />
              </button>
              <input ref={fileInputRef} type="file" accept="image/*,video/*" className="hidden" />
            </div>
          </div>
        </div>

        {/* Post button */}
        <div className="px-4 pb-6">
          <button
            onClick={handlePost}
            disabled={!text.trim()}
            className="w-full py-3.5 rounded-2xl flex items-center justify-center gap-3 font-bold text-white transition-all active:scale-95 disabled:opacity-40"
            style={{
              background: text.trim()
                ? "linear-gradient(135deg, #7C4DFF, #E040FB)"
                : "rgba(255,255,255,0.1)",
            }}
          >
            <Send size={20} color="white" />
            Post to My Story
          </button>
        </div>
      </div>
    </div>
  );
};

export default StoryCreatorPage;
