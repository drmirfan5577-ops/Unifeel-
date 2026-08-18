import React, { useEffect, useState } from "react";

interface AnimatedBackgroundProps {
  overlay?: string;
  variant?: "white" | "purple" | "dark" | "islamic";
}

const scenes = [
  "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=800&fit=crop&auto=format",
  "https://images.unsplash.com/photo-1557682250-33bd709cbe85?w=800&fit=crop&auto=format",
  "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&fit=crop&auto=format",
  "https://images.unsplash.com/photo-1553356084-58ef4a67b2a7?w=800&fit=crop&auto=format",
  "https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=800&fit=crop&auto=format",
];

const floatingShapes = Array.from({ length: 14 }, (_, i) => ({
  id: i,
  size: 8 + (i % 5) * 10,
  left: (i * 7.14 + 5) % 100,
  delay: i * 0.7,
  duration: 8 + (i % 6) * 2.5,
  color: [
    "rgba(124,77,255,0.15)",
    "rgba(224,64,251,0.12)",
    "rgba(255,64,129,0.10)",
    "rgba(255,213,0,0.12)",
    "rgba(77,182,172,0.10)",
  ][i % 5],
}));

const AnimatedBackground: React.FC<AnimatedBackgroundProps> = ({
  overlay = "rgba(255,255,255,0.88)",
  variant = "white",
}) => {
  const [sceneIdx, setSceneIdx] = useState(0);
  const [fade, setFade] = useState(1);

  useEffect(() => {
    const t = setInterval(() => {
      setFade(0);
      setTimeout(() => {
        setSceneIdx((p) => (p + 1) % scenes.length);
        setFade(1);
      }, 900);
    }, 6000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="animated-bg">
      {/* Live scene */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `url(${scenes[sceneIdx]})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          opacity: fade * 0.35,
          transition: "opacity 0.9s ease",
          filter: "blur(2px) saturate(1.3)",
        }}
      />

      {/* Gradient overlay */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: overlay,
        }}
      />

      {/* Floating particles */}
      {floatingShapes.map((s) => (
        <div
          key={s.id}
          className="particle"
          style={{
            width: s.size,
            height: s.size,
            left: `${s.left}%`,
            bottom: "-20px",
            background: s.color,
            animationDuration: `${s.duration}s`,
            animationDelay: `${s.delay}s`,
          }}
        />
      ))}

      {/* Shimmer streaks */}
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            top: `${20 + i * 30}%`,
            left: "-60%",
            width: "40%",
            height: "1px",
            background: "linear-gradient(90deg, transparent, rgba(124,77,255,0.18), transparent)",
            animation: `shimmer ${8 + i * 3}s linear ${i * 2}s infinite`,
          }}
        />
      ))}
    </div>
  );
};

export default AnimatedBackground;
