import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

// Animated football that bounces around
function BouncingBall({ containerRef }) {
  const ballRef = useRef(null);
  const pos = useRef({ x: 120, y: 80, vx: 2.8, vy: 2.2 });
  const animRef = useRef(null);

  useEffect(() => {
    const animate = () => {
      const container = containerRef.current;
      const ball = ballRef.current;
      if (!container || !ball) return;

      const cw = container.offsetWidth;
      const ch = container.offsetHeight;
      const bw = 48;

      pos.current.x += pos.current.vx;
      pos.current.y += pos.current.vy;

      if (pos.current.x <= 0 || pos.current.x >= cw - bw) {
        pos.current.vx *= -1;
        pos.current.x = Math.max(0, Math.min(pos.current.x, cw - bw));
      }
      if (pos.current.y <= 0 || pos.current.y >= ch - bw) {
        pos.current.vy *= -1;
        pos.current.y = Math.max(0, Math.min(pos.current.y, ch - bw));
      }

      ball.style.transform = `translate(${pos.current.x}px, ${pos.current.y}px) rotate(${pos.current.x * 2}deg)`;
      animRef.current = requestAnimationFrame(animate);
    };

    animRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animRef.current);
  }, [containerRef]);

  return (
    <div
      ref={ballRef}
      className="absolute top-0 left-0 w-12 h-12 text-3xl select-none pointer-events-none"
      style={{ willChange: "transform" }}
    >
      ⚽
    </div>
  );
}

const MESSAGES = [
  "VAR is reviewing this page...",
  "The referee blew for offside.",
  "This page got a red card.",
  "The ball went out of bounds.",
  "This page missed the penalty.",
  "No goal! Page not found.",
];

export default function NotFound() {
  const navigate = useNavigate();
  const containerRef = useRef(null);
  const [msgIdx, setMsgIdx] = useState(0);
  const [fade, setFade] = useState(true);

  // Cycle through funny messages
  useEffect(() => {
    const interval = setInterval(() => {
      setFade(false);
      setTimeout(() => {
        setMsgIdx((i) => (i + 1) % MESSAGES.length);
        setFade(true);
      }, 300);
    }, 2800);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-16 relative overflow-hidden"
      style={{ background: "linear-gradient(135deg, #0a1628 0%, #0d1f3c 50%, #0a2a1a 100%)" }}
    >
      {/* Pitch lines background */}
      <div className="absolute inset-0 opacity-5 pointer-events-none" style={{
        backgroundImage: `
          repeating-linear-gradient(0deg, transparent, transparent 60px, rgba(255,255,255,0.5) 60px, rgba(255,255,255,0.5) 62px),
          repeating-linear-gradient(90deg, transparent, transparent 60px, rgba(255,255,255,0.5) 60px, rgba(255,255,255,0.5) 62px)
        `
      }} />

      {/* Center circle */}
      <div className="absolute" style={{
        width: 280, height: 280,
        border: "2px solid rgba(255,255,255,0.06)",
        borderRadius: "50%",
        top: "50%", left: "50%",
        transform: "translate(-50%, -50%)",
        pointerEvents: "none"
      }} />

      {/* Bouncing ball arena */}
      <div
        ref={containerRef}
        className="absolute inset-0"
        style={{ pointerEvents: "none" }}
      >
        <BouncingBall containerRef={containerRef} />
      </div>

      {/* Main content */}
      <div className="relative z-10 text-center max-w-lg">
        {/* Big 404 with goal net effect */}
        <div className="relative mb-6 inline-block">
          <div
            className="font-black leading-none select-none"
            style={{
              fontSize: "clamp(6rem, 20vw, 10rem)",
              color: "transparent",
              WebkitTextStroke: "3px rgba(34,197,94,0.8)",
              textShadow: "0 0 60px rgba(34,197,94,0.3), 0 0 120px rgba(34,197,94,0.15)",
              fontFamily: "'Impact', 'Arial Black', sans-serif",
              letterSpacing: "-0.02em",
            }}
          >
            404
          </div>
          {/* Whistle emoji floating */}
          <div className="absolute -top-4 -right-6 text-3xl animate-bounce">🏆</div>
        </div>

        {/* VAR screen style box */}
        <div
          className="mb-6 mx-auto rounded-xl px-6 py-4 border"
          style={{
            background: "rgba(0,0,0,0.5)",
            borderColor: "rgba(234,179,8,0.4)",
            maxWidth: 380,
            backdropFilter: "blur(8px)",
          }}
        >
          <div className="flex items-center gap-2 justify-center mb-2">
            <div className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />
            <span className="text-yellow-400 text-xs font-bold tracking-widest uppercase">VAR Review</span>
            <div className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />
          </div>
          <p
            className="text-white font-semibold text-base transition-opacity duration-300"
            style={{ opacity: fade ? 1 : 0 }}
          >
            {MESSAGES[msgIdx]}
          </p>
        </div>

        <p className="text-slate-400 text-sm mb-8 leading-relaxed">
          The page you're looking for has been substituted off.<br />
          Head back to the dugout and try again.
        </p>

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => navigate("/")}
            className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all active:scale-95"
            style={{
              background: "linear-gradient(135deg, #16a34a, #15803d)",
              color: "white",
              boxShadow: "0 4px 20px rgba(22,163,74,0.4)",
            }}
            onMouseEnter={e => e.currentTarget.style.boxShadow = "0 4px 30px rgba(22,163,74,0.7)"}
            onMouseLeave={e => e.currentTarget.style.boxShadow = "0 4px 20px rgba(22,163,74,0.4)"}
          >
            🏠 Back to Home
          </button>
          <button
            onClick={() => navigate(-1)}
            className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all active:scale-95"
            style={{
              background: "rgba(255,255,255,0.07)",
              color: "#94a3b8",
              border: "1px solid rgba(255,255,255,0.12)",
            }}
            onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.12)"; e.currentTarget.style.color = "white"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.07)"; e.currentTarget.style.color = "#94a3b8"; }}
          >
            ← Go Back
          </button>
        </div>

        {/* Quick links */}
        <div className="mt-10 flex flex-wrap gap-2 justify-center">
          {[
            { label: "🏟 Fixtures by Team", path: "/by-team" },
            { label: "📅 Fixtures by Date", path: "/by-date" },
            { label: "👕 Squads", path: "/squads" },
          ].map(({ label, path }) => (
            <button
              key={path}
              onClick={() => navigate(path)}
              className="px-4 py-2 rounded-lg text-xs font-medium transition-all"
              style={{
                background: "rgba(255,255,255,0.05)",
                color: "#64748b",
                border: "1px solid rgba(255,255,255,0.08)",
              }}
              onMouseEnter={e => { e.currentTarget.style.color = "white"; e.currentTarget.style.borderColor = "rgba(34,197,94,0.4)"; }}
              onMouseLeave={e => { e.currentTarget.style.color = "#64748b"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"; }}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
