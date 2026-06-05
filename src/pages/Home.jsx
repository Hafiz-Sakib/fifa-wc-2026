import React, {
  useState,
  useEffect,
  useRef,
  useMemo,
  useCallback,
} from "react";
import { useNavigate } from "react-router-dom";
import {
  Trophy,
  Users,
  CalendarDays,
  Globe,
  Search,
  ChevronRight,
  Zap,
  MapPin,
  Clock,
  Flame,
  Star,
  ArrowRight,
  Shield,
  Shirt,
  TrendingUp,
  Award,
  Target,
  Brain,
  MessageCircle,
  Mic2,
} from "lucide-react";
import fixtures from "../data/fixtures.json";
import MatchCard from "../components/MatchCard";
import FlagIcon from "../components/FlagIcon";
import { getAllTeams } from "../utils/countryUtils";
import { sortByDateTime } from "../utils/dateUtils";
import { getClubLogo } from "../utils/clubLogoMap";

const TOURNAMENT_START = "2026-06-12";
const TOURNAMENT_END = "2026-07-20";
const GROUP_STAGE = fixtures.filter(
  (f) =>
    ![
      "Round of 32",
      "Round of 16",
      "Quarter-Final",
      "Semi-Final",
      "Third Place",
      "Final",
    ].includes(f.group),
);
const TEAM_COUNT = getAllTeams().length;
const GROUPS = [...new Set(GROUP_STAGE.map((f) => f.group))].sort();
const GROUP_TEAMS = {};
GROUP_STAGE.forEach((f) => {
  if (!GROUP_TEAMS[f.group]) GROUP_TEAMS[f.group] = new Set();
  if (f.team1 && f.team1 !== "TBD") GROUP_TEAMS[f.group].add(f.team1);
  if (f.team2 && f.team2 !== "TBD") GROUP_TEAMS[f.group].add(f.team2);
});

function getTodayBDT() {
  const now = new Date();
  const bdt = new Date(now.getTime() + 6 * 60 * 60 * 1000);
  return bdt.toISOString().slice(0, 10);
}
function getCountdown(targetDateStr) {
  const now = new Date();
  const target = new Date(targetDateStr + "T00:00:00+06:00");
  const diff = target - now;
  if (diff <= 0) return null;
  return {
    days: Math.floor(diff / 86400000),
    hours: Math.floor((diff % 86400000) / 3600000),
    minutes: Math.floor((diff % 3600000) / 60000),
    seconds: Math.floor((diff % 60000) / 1000),
  };
}

function AnimCounter({ value, duration = 1400 }) {
  const [display, setDisplay] = useState(0);
  const raf = useRef(null);
  useEffect(() => {
    const start = performance.now();
    const animate = (now) => {
      const p = Math.min((now - start) / duration, 1);
      const e = 1 - Math.pow(1 - p, 3);
      setDisplay(Math.round(e * value));
      if (p < 1) raf.current = requestAnimationFrame(animate);
    };
    raf.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf.current);
  }, [value, duration]);
  return <>{display}</>;
}

function useInView(options = {}) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          obs.disconnect();
        }
      },
      { threshold: 0.15, ...options },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return [ref, inView];
}

function ScrollProgress() {
  const [pct, setPct] = useState(0);
  useEffect(() => {
    const onScroll = () => {
      const total = document.documentElement.scrollHeight - window.innerHeight;
      setPct(total > 0 ? (window.scrollY / total) * 100 : 0);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        height: 3,
        background: "rgba(0,0,0,0.3)",
        zIndex: 9999,
        pointerEvents: "none",
      }}
    >
      <div
        style={{
          height: "100%",
          width: `${pct}%`,
          background: "linear-gradient(90deg,#16A34A,#22C55E,#4ADE80)",
          transition: "width 0.05s linear",
          boxShadow: "0 0 10px rgba(34,197,94,0.6)",
        }}
      />
    </div>
  );
}

/* ── Enhanced Particles with soccer field elements ── */
function Particles() {
  const particles = useMemo(
    () =>
      Array.from({ length: 28 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 3 + 0.8,
        delay: Math.random() * 8,
        duration: Math.random() * 10 + 8,
        opacity: Math.random() * 0.35 + 0.06,
      })),
    [],
  );
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {particles.map((p) => (
        <div
          key={p.id}
          className="particle-dot"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
            opacity: p.opacity,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
          }}
        />
      ))}
      {[0, 1, 2, 3, 4].map((i) => (
        <div
          key={`ball-${i}`}
          className="particle-ball"
          style={{
            left: `${8 + i * 20}%`,
            animationDelay: `${i * 2.5}s`,
            animationDuration: `${14 + i * 2.5}s`,
            fontSize: `${12 + i * 4}px`,
          }}
        >
          ⚽
        </div>
      ))}
    </div>
  );
}

/* ── Animated pitch SVG overlay ── */
function PitchOverlay() {
  return (
    <div
      className="absolute inset-0 pointer-events-none overflow-hidden"
      style={{ opacity: 0.04 }}
    >
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 800 500"
        preserveAspectRatio="xMidYMid slice"
      >
        <rect
          x="40"
          y="30"
          width="720"
          height="440"
          fill="none"
          stroke="#22C55E"
          strokeWidth="1.5"
        />
        <line
          x1="400"
          y1="30"
          x2="400"
          y2="470"
          stroke="#22C55E"
          strokeWidth="1"
        />
        <circle
          cx="400"
          cy="250"
          r="70"
          fill="none"
          stroke="#22C55E"
          strokeWidth="1"
        />
        <circle cx="400" cy="250" r="4" fill="#22C55E" />
        <rect
          x="40"
          y="175"
          width="100"
          height="150"
          fill="none"
          stroke="#22C55E"
          strokeWidth="1"
        />
        <rect
          x="660"
          y="175"
          width="100"
          height="150"
          fill="none"
          stroke="#22C55E"
          strokeWidth="1"
        />
        <rect
          x="40"
          y="210"
          width="50"
          height="80"
          fill="none"
          stroke="#22C55E"
          strokeWidth="1"
        />
        <rect
          x="710"
          y="210"
          width="50"
          height="80"
          fill="none"
          stroke="#22C55E"
          strokeWidth="1"
        />
        <path
          d="M140 175 Q175 250 140 325"
          fill="none"
          stroke="#22C55E"
          strokeWidth="1"
        />
        <path
          d="M660 175 Q625 250 660 325"
          fill="none"
          stroke="#22C55E"
          strokeWidth="1"
        />
        <circle cx="140" cy="250" r="3" fill="#22C55E" />
        <circle cx="660" cy="250" r="3" fill="#22C55E" />
      </svg>
    </div>
  );
}

/* ── Countdown Box with flip animation ── */
function CountdownBox({ label, value }) {
  const [prev, setPrev] = useState(value);
  const [flip, setFlip] = useState(false);
  useEffect(() => {
    if (value !== prev) {
      setFlip(true);
      const t = setTimeout(() => {
        setFlip(false);
        setPrev(value);
      }, 300);
      return () => clearTimeout(t);
    }
  }, [value, prev]);
  return (
    <div
      className="countdown-box"
      style={{ position: "relative", overflow: "hidden" }}
    >
      <div
        className="countdown-num"
        style={{
          transition: flip ? "transform 0.3s, opacity 0.3s" : "none",
          transform: flip ? "translateY(-8px)" : "translateY(0)",
          opacity: flip ? 0 : 1,
        }}
      >
        {String(value).padStart(2, "0")}
      </div>
      <div className="countdown-label">{label}</div>
    </div>
  );
}

/* ── Trophy Graphic ── */
function TrophyGraphic() {
  const [pulse, setPulse] = useState(false);
  useEffect(() => {
    const id = setInterval(() => {
      setPulse((p) => !p);
    }, 2500);
    return () => clearInterval(id);
  }, []);

  return (
    <div
      className="relative flex items-center justify-center"
      style={{ width: "100%", maxWidth: "420px" }}
    >
      {/* Animated rings */}
      {[280, 220, 160].map((s, i) => (
        <div
          key={i}
          className="absolute"
          style={{
            width: s,
            height: s,
            borderRadius: "50%",
            border: `1px solid rgba(22,163,74,${0.06 + i * 0.04})`,
            top: "50%",
            left: "50%",
            transform: "translate(-50%,-50%)",
            animation: `spin ${20 + i * 8}s linear infinite${i % 2 ? " reverse" : ""}`,
          }}
        />
      ))}
      {/* Glow blobs */}
      <div
        className="absolute"
        style={{
          width: 280,
          height: 280,
          borderRadius: "50%",
          background:
            "radial-gradient(circle,rgba(22,163,74,0.18) 0%,rgba(30,58,138,0.2) 50%,transparent 70%)",
          filter: "blur(40px)",
          top: "50%",
          left: "50%",
          transform: "translate(-50%,-50%)",
        }}
      />
      <div
        className="absolute"
        style={{
          width: 180,
          height: 180,
          borderRadius: "50%",
          background:
            "radial-gradient(circle,rgba(244,197,66,0.14) 0%,transparent 70%)",
          filter: "blur(30px)",
          top: "30%",
          left: "60%",
          transform: "translate(-50%,-50%)",
        }}
      />
      {/* Trophy */}
      <div
        className="trophy-float relative z-10 select-none text-center"
        style={{
          fontSize: "clamp(6rem,15vw,10rem)",
          lineHeight: 1,
          filter: pulse
            ? "drop-shadow(0 0 60px rgba(244,197,66,0.95)) drop-shadow(0 20px 80px rgba(0,0,0,0.6))"
            : "drop-shadow(0 0 40px rgba(244,197,66,0.7)) drop-shadow(0 20px 60px rgba(0,0,0,0.5))",
          transition: "filter 1s ease",
        }}
      >
        🏆
      </div>
      {/* Host flags */}
      <div
        className="absolute bottom-0 left-1/2 flex items-center gap-3"
        style={{ transform: "translateX(-50%)" }}
      >
        {["🇺🇸", "🇨🇦", "🇲🇽"].map((flag, i) => (
          <div
            key={i}
            className="flex items-center justify-center text-2xl"
            style={{
              width: 44,
              height: 44,
              borderRadius: "50%",
              background: "rgba(8,38,61,0.9)",
              border: "2px solid rgba(255,255,255,0.1)",
              backdropFilter: "blur(8px)",
              boxShadow: "0 4px 16px rgba(0,0,0,0.3)",
              animation: `floatBob ${2 + i * 0.5}s ease-in-out infinite alternate`,
              animationDelay: `${i * 0.3}s`,
            }}
          >
            {flag}
          </div>
        ))}
      </div>
      <div
        className="absolute top-4 right-4 flex items-center gap-1.5 px-3 py-1.5 rounded-full"
        style={{
          background: "rgba(22,163,74,0.12)",
          border: "1px solid rgba(22,163,74,0.28)",
          fontSize: "0.65rem",
          color: "#22C55E",
          fontWeight: 700,
          letterSpacing: "1px",
          fontFamily: "'Barlow Condensed','Hind Siliguri',sans-serif",
          textTransform: "uppercase",
        }}
      >
        <Zap size={9} /> 48 Teams
      </div>
      <div
        className="absolute top-4 left-4 flex items-center gap-1.5 px-3 py-1.5 rounded-full"
        style={{
          background: "rgba(244,197,66,0.1)",
          border: "1px solid rgba(244,197,66,0.28)",
          fontSize: "0.65rem",
          color: "#F4C542",
          fontWeight: 700,
          letterSpacing: "1px",
          fontFamily: "'Barlow Condensed','Hind Siliguri',sans-serif",
          textTransform: "uppercase",
        }}
      >
        <Star size={9} fill="#F4C542" /> Finals 2026
      </div>
    </div>
  );
}

/* ── Interactive Score Predictor Widget ── */
const PREDICT_MATCHES = [
  {
    id: 1,
    team1: "Brazil",
    flag1: "🇧🇷",
    team2: "Germany",
    flag2: "🇩🇪",
    t1Star: { name: "Vinicius Jr", club: "Real Madrid C.F." },
    t2Star: { name: "Kai Havertz", club: "Arsenal FC" },
  },
  {
    id: 2,
    team1: "Argentina",
    flag1: "🇦🇷",
    team2: "France",
    flag2: "🇫🇷",
    t1Star: { name: "L. Messi", club: "Inter Miami CF" },
    t2Star: { name: "K. Mbappé", club: "Real Madrid C.F." },
  },
  {
    id: 3,
    team1: "England",
    flag1: "🏴󠁧󠁢󠁥󠁮󠁧󠁿",
    team2: "Spain",
    flag2: "🇪🇸",
    t1Star: { name: "H. Kane", club: "FC Bayern München" },
    t2Star: { name: "Dani Olmo", club: "FC Barcelona" },
  },
];

/* ── Animated Football between scores ── */
function FootballAnimator({ kickSide, kickCount }) {
  const ballRef = useRef(null);
  const [ballState, setBallState] = useState({
    x: 50,
    rotate: 0,
    scale: 1,
    shadow: 0.3,
  });
  const animRef = useRef(null);
  const prevKickRef = useRef({ side: null, count: 0 });

  useEffect(() => {
    if (kickSide === null) return;
    if (
      prevKickRef.current.side === kickSide &&
      prevKickRef.current.count === kickCount
    )
      return;
    prevKickRef.current = { side: kickSide, count: kickCount };

    if (animRef.current) cancelAnimationFrame(animRef.current);

    const toX = kickSide === "left" ? 20 : 80;
    const fromX = kickSide === "left" ? 80 : 20;
    const startTime = performance.now();
    const duration = 480;

    const animate = (now) => {
      const p = Math.min((now - startTime) / duration, 1);
      const ease = p < 0.5 ? 2 * p * p : -1 + (4 - 2 * p) * p;
      const x = fromX + (toX - fromX) * ease;
      // arc: peak at midpoint
      const arc = Math.sin(p * Math.PI);
      const scale = 1 + arc * 0.35;
      const shadow = 0.3 - arc * 0.2;
      const rotDir = kickSide === "left" ? 1 : -1;
      const rotate = rotDir * p * 360;
      setBallState({ x, rotate, scale, shadow });
      if (p < 1) animRef.current = requestAnimationFrame(animate);
      else
        setBallState({ x: toX, rotate: rotDir * 360, scale: 1, shadow: 0.3 });
    };
    animRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animRef.current);
  }, [kickSide, kickCount]);

  // Idle gentle bob when nothing happening
  const [idlePhase, setIdlePhase] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setIdlePhase((p) => p + 0.06), 50);
    return () => clearInterval(id);
  }, []);

  const idleBob = kickSide === null ? Math.sin(idlePhase) * 3 : 0;
  const idleRotate = kickSide === null ? idlePhase * 12 : ballState.rotate;

  return (
    <div
      style={{
        position: "relative",
        height: 60,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {/* pitch line */}
      <div
        style={{
          position: "absolute",
          left: "10%",
          right: "10%",
          top: "50%",
          height: 1,
          background: "rgba(34,197,94,0.12)",
          borderRadius: 1,
        }}
      />
      {/* goal posts left */}
      <div
        style={{
          position: "absolute",
          left: "8%",
          top: "20%",
          width: 3,
          height: "60%",
          background: "rgba(34,197,94,0.25)",
          borderRadius: 2,
        }}
      />
      {/* goal posts right */}
      <div
        style={{
          position: "absolute",
          right: "8%",
          top: "20%",
          width: 3,
          height: "60%",
          background: "rgba(34,197,94,0.25)",
          borderRadius: 2,
        }}
      />

      {/* shadow */}
      <div
        style={{
          position: "absolute",
          left: `calc(${kickSide === null ? 50 : ballState.x}% - 14px)`,
          bottom: 4,
          width: 28,
          height: 7,
          borderRadius: "50%",
          background: `rgba(0,0,0,${kickSide === null ? 0.3 : ballState.shadow})`,
          filter: "blur(3px)",
          transition: kickSide === null ? "none" : undefined,
          transform: `scaleX(${kickSide === null ? 1 : ballState.scale * 0.8})`,
        }}
      />

      {/* ball */}
      <div
        ref={ballRef}
        style={{
          position: "absolute",
          left: `calc(${kickSide === null ? 50 : ballState.x}% - 16px)`,
          top:
            kickSide === null
              ? `calc(50% - 16px + ${idleBob}px)`
              : `calc(50% - ${16 * (kickSide === null ? 1 : ballState.scale)}px)`,
          fontSize: 32,
          lineHeight: 1,
          transform: `rotate(${kickSide === null ? idleRotate : ballState.rotate}deg) scale(${kickSide === null ? 1 : ballState.scale})`,
          filter:
            kickSide !== null && ballState.scale > 1.1
              ? "drop-shadow(0 0 10px rgba(34,197,94,0.7))"
              : "drop-shadow(0 4px 8px rgba(0,0,0,0.4))",
          userSelect: "none",
          willChange: "transform, left, top",
        }}
      >
        ⚽
      </div>
    </div>
  );
}

/* ── Football Pitch Animation Component ── */
function PitchAnimation({
  team1,
  flag1,
  team2,
  flag2,
  score1,
  score2,
  result,
  kickSide,
}) {
  const [frame, setFrame] = useState(0);
  const [goalFlash, setGoalFlash] = useState(null); // 'left' | 'right' | null
  const prevKick = useRef(null);

  // Animate ball continuously on pitch
  useEffect(() => {
    const id = setInterval(() => setFrame((f) => f + 1), 40);
    return () => clearInterval(id);
  }, []);

  // Flash goal net when kick happens
  useEffect(() => {
    if (kickSide && kickSide !== prevKick.current) {
      prevKick.current = kickSide;
      setGoalFlash(kickSide);
      const t = setTimeout(() => setGoalFlash(null), 700);
      return () => clearTimeout(t);
    }
  }, [kickSide]);

  // Ball trajectory: figure-8 idle path, or rush toward goal on kick
  const t = frame / 60;
  const ballX =
    kickSide === "left"
      ? 12 + Math.sin(frame / 4) * 3
      : kickSide === "right"
        ? 88 - Math.sin(frame / 4) * 3
        : 50 + Math.sin(t * 1.3) * 28;
  const ballY = 50 + Math.sin(t * 2.6) * 18;
  const ballRotate =
    frame * (kickSide === "left" ? -6 : kickSide === "right" ? 6 : 4);
  const ballScale = kickSide ? 1.3 : 1 + Math.sin(t * 2.6) * 0.08;

  // Player dots: 2 per team moving around
  const players = [
    // Team 1 (left side)
    {
      x: 25 + Math.sin(t * 0.7 + 0) * 8,
      y: 35 + Math.cos(t * 0.9 + 0) * 12,
      color: "#22C55E",
    },
    {
      x: 30 + Math.sin(t * 0.6 + 1) * 7,
      y: 60 + Math.cos(t * 0.8 + 1) * 10,
      color: "#22C55E",
    },
    {
      x: 18 + Math.sin(t * 0.5 + 2) * 5,
      y: 50 + Math.cos(t * 1.0 + 2) * 8,
      color: "#22C55E",
    },
    // Team 2 (right side)
    {
      x: 75 + Math.sin(t * 0.7 + 3) * 8,
      y: 38 + Math.cos(t * 0.9 + 3) * 12,
      color: "#60A5FA",
    },
    {
      x: 70 + Math.sin(t * 0.6 + 4) * 7,
      y: 62 + Math.cos(t * 0.8 + 4) * 10,
      color: "#60A5FA",
    },
    {
      x: 82 + Math.sin(t * 0.5 + 5) * 5,
      y: 50 + Math.cos(t * 1.0 + 5) * 8,
      color: "#60A5FA",
    },
  ];

  const winnerColor =
    result === "left" ? "#22C55E" : result === "right" ? "#60A5FA" : "#F4C542";
  const winnerLabel =
    result === "left"
      ? `${team1.toUpperCase()} WINS!`
      : result === "right"
        ? `${team2.toUpperCase()} WINS!`
        : "⚖️ DRAW";

  return (
    <div
      style={{
        borderTop: "1px solid rgba(255,255,255,0.05)",
        padding: "14px 18px 16px",
        marginTop: 14,
      }}
    >
      {/* Label */}
      <div
        style={{
          fontFamily: "'Barlow Condensed','Hind Siliguri',sans-serif",
          fontSize: "0.62rem",
          fontWeight: 700,
          color: "#334155",
          letterSpacing: "1.5px",
          textTransform: "uppercase",
          marginBottom: 10,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <span>Live Pitch</span>
        <span
          style={{
            color: winnerColor,
            fontSize: "0.7rem",
            letterSpacing: "1px",
            transition: "color 0.4s",
            fontWeight: 800,
          }}
        >
          {winnerLabel}
        </span>
      </div>

      {/* SVG Pitch */}
      <div
        style={{
          position: "relative",
          borderRadius: 12,
          overflow: "hidden",
          background: "rgba(4,30,18,0.85)",
          border: "1px solid rgba(34,197,94,0.12)",
        }}
      >
        <svg
          viewBox="0 0 400 200"
          width="100%"
          style={{ display: "block" }}
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Pitch grass stripes */}
          {[0, 1, 2, 3, 4, 5, 6].map((i) => (
            <rect
              key={i}
              x={i * 57}
              y={0}
              width={57}
              height={200}
              fill={i % 2 === 0 ? "rgba(5,46,22,0.8)" : "rgba(3,36,17,0.8)"}
            />
          ))}

          {/* Outer boundary */}
          <rect
            x="10"
            y="12"
            width="380"
            height="176"
            fill="none"
            stroke="rgba(34,197,94,0.35)"
            strokeWidth="1.2"
            rx="2"
          />

          {/* Centre line */}
          <line
            x1="200"
            y1="12"
            x2="200"
            y2="188"
            stroke="rgba(34,197,94,0.3)"
            strokeWidth="1"
          />

          {/* Centre circle */}
          <circle
            cx="200"
            cy="100"
            r="35"
            fill="none"
            stroke="rgba(34,197,94,0.3)"
            strokeWidth="1"
          />
          <circle cx="200" cy="100" r="2.5" fill="rgba(34,197,94,0.5)" />

          {/* Left penalty box */}
          <rect
            x="10"
            y="62"
            width="52"
            height="76"
            fill="none"
            stroke="rgba(34,197,94,0.28)"
            strokeWidth="1"
          />
          {/* Left goal box */}
          <rect
            x="10"
            y="80"
            width="22"
            height="40"
            fill="none"
            stroke="rgba(34,197,94,0.28)"
            strokeWidth="1"
          />
          {/* Left goal net */}
          <rect
            x="0"
            y="82"
            width="10"
            height="36"
            fill={
              goalFlash === "left"
                ? "rgba(34,197,94,0.4)"
                : "rgba(34,197,94,0.06)"
            }
            stroke="rgba(34,197,94,0.4)"
            strokeWidth="0.8"
            style={{ transition: "fill 0.15s" }}
          />
          {/* Left penalty arc */}
          <path
            d="M62,83 Q85,100 62,117"
            fill="none"
            stroke="rgba(34,197,94,0.22)"
            strokeWidth="1"
          />

          {/* Right penalty box */}
          <rect
            x="338"
            y="62"
            width="52"
            height="76"
            fill="none"
            stroke="rgba(34,197,94,0.28)"
            strokeWidth="1"
          />
          {/* Right goal box */}
          <rect
            x="368"
            y="80"
            width="22"
            height="40"
            fill="none"
            stroke="rgba(34,197,94,0.28)"
            strokeWidth="1"
          />
          {/* Right goal net */}
          <rect
            x="390"
            y="82"
            width="10"
            height="36"
            fill={
              goalFlash === "right"
                ? "rgba(96,165,250,0.4)"
                : "rgba(34,197,94,0.06)"
            }
            stroke="rgba(34,197,94,0.4)"
            strokeWidth="0.8"
            style={{ transition: "fill 0.15s" }}
          />
          {/* Right penalty arc */}
          <path
            d="M338,83 Q315,100 338,117"
            fill="none"
            stroke="rgba(34,197,94,0.22)"
            strokeWidth="1"
          />

          {/* Corner arcs */}
          {[
            [10, 12],
            [390, 12],
            [10, 188],
            [390, 188],
          ].map(([cx, cy], i) => (
            <circle
              key={i}
              cx={cx}
              cy={cy}
              r="6"
              fill="none"
              stroke="rgba(34,197,94,0.22)"
              strokeWidth="1"
            />
          ))}

          {/* Player dots */}
          {players.map((p, i) => (
            <g key={i}>
              <circle
                cx={p.x * 4}
                cy={p.y * 2}
                r="5.5"
                fill={p.color}
                opacity="0.9"
              />
              <circle
                cx={p.x * 4}
                cy={p.y * 2}
                r="8"
                fill={p.color}
                opacity="0.15"
              />
            </g>
          ))}

          {/* Ball shadow */}
          <ellipse
            cx={ballX * 4}
            cy={ballY * 2 + 8}
            rx={6 * ballScale}
            ry={2.5}
            fill="rgba(0,0,0,0.35)"
            style={{ filter: "blur(2px)" }}
          />

          {/* Football */}
          <text
            x={ballX * 4}
            y={ballY * 2}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize={20 * ballScale}
            style={{
              transform: `rotate(${ballRotate}deg)`,
              transformOrigin: `${ballX * 4}px ${ballY * 2}px`,
              filter: kickSide
                ? "drop-shadow(0 0 8px rgba(34,197,94,0.9))"
                : "drop-shadow(0 3px 6px rgba(0,0,0,0.5))",
              transition: kickSide ? "none" : undefined,
            }}
          >
            ⚽
          </text>

          {/* Goal flash overlay */}
          {goalFlash && (
            <rect
              x="0"
              y="0"
              width="400"
              height="200"
              fill={
                goalFlash === "left"
                  ? "rgba(34,197,94,0.08)"
                  : "rgba(96,165,250,0.08)"
              }
              style={{ animation: "none" }}
            />
          )}

          {/* Team labels on pitch */}
          <text
            x="80"
            y="198"
            textAnchor="middle"
            fontSize="9"
            fontWeight="700"
            fill="rgba(34,197,94,0.5)"
            fontFamily="'Barlow Condensed',sans-serif"
            letterSpacing="1"
          >
            {team1.toUpperCase()}
          </text>
          <text
            x="320"
            y="198"
            textAnchor="middle"
            fontSize="9"
            fontWeight="700"
            fill="rgba(96,165,250,0.5)"
            fontFamily="'Barlow Condensed',sans-serif"
            letterSpacing="1"
          >
            {team2.toUpperCase()}
          </text>
        </svg>

        {/* Goal flash text */}
        {goalFlash && (
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%,-50%)",
              fontFamily: "'Barlow Condensed',sans-serif",
              fontSize: "2rem",
              fontWeight: 900,
              color: goalFlash === "left" ? "#4ADE80" : "#93C5FD",
              textShadow: "0 0 20px currentColor",
              letterSpacing: "4px",
              pointerEvents: "none",
              animation: "goalFlashAnim 0.7s ease forwards",
            }}
          >
            GOAL!
          </div>
        )}
      </div>

      <style>{`
        @keyframes goalFlashAnim {
          0%   { opacity:0; transform:translate(-50%,-50%) scale(0.6); }
          30%  { opacity:1; transform:translate(-50%,-50%) scale(1.15); }
          70%  { opacity:1; transform:translate(-50%,-50%) scale(1); }
          100% { opacity:0; transform:translate(-50%,-50%) scale(0.9); }
        }
      `}</style>
    </div>
  );
}

function ScorePredictorWidget() {
  const [scores, setScores] = useState({
    1: { s1: 0, s2: 0 },
    2: { s1: 0, s2: 0 },
    3: { s1: 0, s2: 0 },
  });
  const [active, setActive] = useState(1);
  const [pulse, setPulse] = useState(null);
  const [kickSide, setKickSide] = useState(null);
  const [kickCount, setKickCount] = useState(0);
  const kickResetRef = useRef(null);

  const bump = (id, side, delta) => {
    setScores((prev) => {
      const cur = prev[id];
      const val = Math.max(0, Math.min(9, cur[side] + delta));
      return { ...prev, [id]: { ...cur, [side]: val } };
    });
    setPulse(`${id}-${side}`);
    setTimeout(() => setPulse(null), 350);

    if (delta > 0) {
      // kick towards scoring team's side
      const dir = side === "s1" ? "left" : "right";
      setKickSide(dir);
      setKickCount((c) => c + 1);
      if (kickResetRef.current) clearTimeout(kickResetRef.current);
      kickResetRef.current = setTimeout(() => setKickSide(null), 600);
    }
  };

  // Derive winner label for pitch animation
  const curScores = scores[active];
  const matchResult =
    curScores.s1 > curScores.s2
      ? "left"
      : curScores.s2 > curScores.s1
        ? "right"
        : "draw";

  const cur = PREDICT_MATCHES.find((m) => m.id === active);

  return (
    <div
      style={{
        width: "100%",
        maxWidth: "420px",
        borderRadius: "20px",
        background: "rgba(6,22,38,0.85)",
        border: "1px solid rgba(34,197,94,0.18)",
        backdropFilter: "blur(20px)",
        overflow: "hidden",
        boxShadow:
          "0 24px 64px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.05)",
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: "14px 18px 12px",
          borderBottom: "1px solid rgba(255,255,255,0.05)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div
            style={{
              width: 7,
              height: 7,
              borderRadius: "50%",
              background: "#22C55E",
              boxShadow: "0 0 8px #22C55E",
              animation: "pulse-dot 2s ease-in-out infinite",
            }}
          />
          <span
            style={{
              fontFamily: "'Barlow Condensed','Hind Siliguri',sans-serif",
              fontSize: "0.72rem",
              fontWeight: 700,
              color: "#22C55E",
              letterSpacing: "1.5px",
              textTransform: "uppercase",
            }}
          >
            Score Predictor
          </span>
        </div>
        <span
          style={{
            fontSize: "0.62rem",
            color: "#475569",
            fontWeight: 600,
            letterSpacing: "0.5px",
            textTransform: "uppercase",
          }}
        >
          FIFA World Cup 2026
        </span>
      </div>

      {/* Match tabs */}
      <div
        style={{
          display: "flex",
          gap: 0,
          borderBottom: "1px solid rgba(255,255,255,0.05)",
        }}
      >
        {PREDICT_MATCHES.map((m) => (
          <button
            key={m.id}
            onClick={() => setActive(m.id)}
            style={{
              flex: 1,
              padding: "9px 4px",
              background: "none",
              border: "none",
              borderBottom:
                active === m.id ? "2px solid #22C55E" : "2px solid transparent",
              color: active === m.id ? "#fff" : "#475569",
              fontSize: "0.68rem",
              fontWeight: 700,
              cursor: "pointer",
              fontFamily: "'Barlow Condensed','Hind Siliguri',sans-serif",
              letterSpacing: "0.5px",
              textTransform: "uppercase",
              transition: "color 0.2s, border-color 0.2s",
            }}
          >
            <FlagIcon teamName={m.team1} size={14} /> v{" "}
            <FlagIcon teamName={m.team2} size={14} />
          </button>
        ))}
      </div>

      {/* Score input */}
      <div style={{ padding: "16px 18px 0" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {/* Team 1 */}
          <div style={{ flex: 1, textAlign: "center" }}>
            <div
              style={{
                fontSize: "1.7rem",
                marginBottom: 4,
                display: "flex",
                justifyContent: "center",
              }}
            >
              <FlagIcon teamName={cur.team1} size={36} />
            </div>
            <div
              style={{
                fontFamily: "'Barlow Condensed','Hind Siliguri',sans-serif",
                fontSize: "0.75rem",
                fontWeight: 700,
                color: "#CBD5E1",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
                marginBottom: 10,
              }}
            >
              {cur.team1}
            </div>
            {/* Club logo for star player team1 */}
            {cur.t1Star &&
              (() => {
                const logo = getClubLogo(cur.t1Star.club);
                return (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 5,
                      marginBottom: 8,
                    }}
                  >
                    {logo && (
                      <img
                        src={logo}
                        alt={cur.t1Star.club}
                        style={{
                          width: 16,
                          height: 16,
                          objectFit: "contain",
                          borderRadius: 3,
                        }}
                      />
                    )}
                    <span
                      style={{
                        fontSize: "0.6rem",
                        color: "#475569",
                        fontWeight: 600,
                        maxWidth: 70,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {cur.t1Star.name}
                    </span>
                  </div>
                );
              })()}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
              }}
            >
              <button
                onClick={() => bump(cur.id, "s1", -1)}
                style={btnStyle("#1e293b", "#475569")}
              >
                −
              </button>
              <span
                style={{
                  ...scoreStyle,
                  color: pulse === `${cur.id}-s1` ? "#4ADE80" : "#fff",
                  transform:
                    pulse === `${cur.id}-s1` ? "scale(1.35)" : "scale(1)",
                  transition: "color 0.3s, transform 0.3s",
                }}
              >
                {scores[cur.id].s1}
              </span>
              <button
                onClick={() => bump(cur.id, "s1", 1)}
                style={btnStyle("rgba(22,163,74,0.15)", "#22C55E")}
              >
                +
              </button>
            </div>
          </div>

          {/* Animated Football + VS */}
          <div style={{ flex: 1.2, textAlign: "center" }}>
            <FootballAnimator kickSide={kickSide} kickCount={kickCount} />
            <div
              style={{
                fontFamily: "'Barlow Condensed',sans-serif",
                fontSize: "0.75rem",
                fontWeight: 800,
                color: "#334155",
                letterSpacing: "2px",
                marginTop: 2,
              }}
            >
              VS
            </div>
          </div>

          {/* Team 2 */}
          <div style={{ flex: 1, textAlign: "center" }}>
            <div
              style={{
                fontSize: "1.7rem",
                marginBottom: 4,
                display: "flex",
                justifyContent: "center",
              }}
            >
              <FlagIcon teamName={cur.team2} size={36} />
            </div>
            <div
              style={{
                fontFamily: "'Barlow Condensed','Hind Siliguri',sans-serif",
                fontSize: "0.75rem",
                fontWeight: 700,
                color: "#CBD5E1",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
                marginBottom: 10,
              }}
            >
              {cur.team2}
            </div>
            {/* Club logo for star player team2 */}
            {cur.t2Star &&
              (() => {
                const logo = getClubLogo(cur.t2Star.club);
                return (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 5,
                      marginBottom: 8,
                    }}
                  >
                    {logo && (
                      <img
                        src={logo}
                        alt={cur.t2Star.club}
                        style={{
                          width: 16,
                          height: 16,
                          objectFit: "contain",
                          borderRadius: 3,
                        }}
                      />
                    )}
                    <span
                      style={{
                        fontSize: "0.6rem",
                        color: "#475569",
                        fontWeight: 600,
                        maxWidth: 70,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {cur.t2Star.name}
                    </span>
                  </div>
                );
              })()}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
              }}
            >
              <button
                onClick={() => bump(cur.id, "s2", -1)}
                style={btnStyle("#1e293b", "#475569")}
              >
                −
              </button>
              <span
                style={{
                  ...scoreStyle,
                  color: pulse === `${cur.id}-s2` ? "#4ADE80" : "#fff",
                  transform:
                    pulse === `${cur.id}-s2` ? "scale(1.35)" : "scale(1)",
                  transition: "color 0.3s, transform 0.3s",
                }}
              >
                {scores[cur.id].s2}
              </span>
              <button
                onClick={() => bump(cur.id, "s2", 1)}
                style={btnStyle("rgba(22,163,74,0.15)", "#22C55E")}
              >
                +
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Football Pitch Animation ── */}
      <PitchAnimation
        team1={cur.team1}
        flag1={cur.flag1}
        team2={cur.team2}
        flag2={cur.flag2}
        score1={curScores.s1}
        score2={curScores.s2}
        result={matchResult}
        kickSide={kickSide}
      />
    </div>
  );
}

const btnStyle = (bg, color) => ({
  width: 28,
  height: 28,
  borderRadius: 8,
  border: `1px solid ${color}33`,
  background: bg,
  color,
  fontSize: "1rem",
  fontWeight: 700,
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  transition: "all 0.15s",
  lineHeight: 1,
});

const scoreStyle = {
  fontFamily: "'Barlow Condensed',sans-serif",
  fontSize: "2rem",
  fontWeight: 900,
  minWidth: 36,
  textAlign: "center",
  display: "inline-block",
};

/* ── Animated Stat Card with shimmer ── */
function StatCard({ icon: Icon, label, value, color, delay = 0 }) {
  const [ref, inView] = useInView();
  const [hov, setHov] = useState(false);
  return (
    <div
      ref={ref}
      className="stat-card px-5 py-6 text-center"
      style={{
        opacity: inView ? 1 : 0,
        transform: inView
          ? "translateY(0) scale(1)"
          : "translateY(24px) scale(0.95)",
        transition: `opacity 0.5s ease ${delay}ms, transform 0.5s ease ${delay}ms`,
        cursor: "default",
        position: "relative",
        overflow: "hidden",
      }}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
    >
      {/* shimmer on hover */}
      {hov && (
        <div
          style={{
            position: "absolute",
            top: 0,
            left: "-100%",
            width: "60%",
            height: "100%",
            background:
              "linear-gradient(90deg,transparent,rgba(255,255,255,0.04),transparent)",
            animation: "card-sweep 0.7s ease forwards",
          }}
        />
      )}
      <div className="stat-icon-wrap">
        <Icon size={20} style={{ color }} />
      </div>
      <div
        className="mb-1 text-white"
        style={{
          fontFamily: "'Barlow Condensed','Hind Siliguri',sans-serif",
          fontSize: "clamp(2rem,4vw,2.8rem)",
          fontWeight: 800,
        }}
      >
        {inView ? <AnimCounter value={value} /> : "0"}
      </div>
      <div
        className="text-xs font-semibold tracking-wide uppercase"
        style={{ color: "#64748B" }}
      >
        {label}
      </div>
      {hov && (
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: 2,
            background: `linear-gradient(90deg,transparent,${color},transparent)`,
            opacity: 0.6,
          }}
        />
      )}
    </div>
  );
}

/* ── Horizontal Marquee for upcoming matches ── */
function MatchMarquee() {
  const today = getTodayBDT();
  const matches = useMemo(() => {
    const future = fixtures.filter(
      (f) => f.date >= today && f.team1 !== "TBD" && f.team2 !== "TBD",
    );
    return sortByDateTime(future).slice(0, 16);
  }, [today]);

  if (matches.length === 0) return null;
  const doubled = [...matches, ...matches];

  return (
    <div
      style={{
        overflow: "hidden",
        borderTop: "1px solid rgba(22,163,74,0.1)",
        borderBottom: "1px solid rgba(22,163,74,0.1)",
        background: "rgba(0,0,0,0.2)",
        padding: "10px 0",
        marginBottom: 24,
      }}
    >
      <div
        style={{
          display: "flex",
          gap: 0,
          animation: "marqueeScroll 40s linear infinite",
          width: "max-content",
        }}
      >
        {doubled.map((m, i) => (
          <div
            key={i}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "4px 24px",
              borderRight: "1px solid rgba(255,255,255,0.05)",
              flexShrink: 0,
            }}
          >
            <FlagIcon teamName={m.team1} size={18} />
            <span
              style={{
                fontSize: 12,
                fontWeight: 700,
                color: "#CBD5E1",
                fontFamily: "'Barlow Condensed',sans-serif",
                letterSpacing: "0.05em",
              }}
            >
              {m.team1}
            </span>
            <span
              style={{
                fontSize: 10,
                color: "#22C55E",
                fontWeight: 800,
                padding: "1px 6px",
                background: "rgba(22,163,74,0.12)",
                borderRadius: 4,
              }}
            >
              VS
            </span>
            <span
              style={{
                fontSize: 12,
                fontWeight: 700,
                color: "#CBD5E1",
                fontFamily: "'Barlow Condensed',sans-serif",
                letterSpacing: "0.05em",
              }}
            >
              {m.team2}
            </span>
            <FlagIcon teamName={m.team2} size={18} />
            <span style={{ fontSize: 10, color: "#475569", marginLeft: 4 }}>
              {m.date}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Featured Match Ticker ── */
function NextMatchTicker() {
  const today = getTodayBDT();
  const next = useMemo(() => {
    const future = fixtures.filter(
      (f) => f.date >= today && f.team1 !== "TBD" && f.team2 !== "TBD",
    );
    return sortByDateTime(future)[0] || null;
  }, [today]);
  const [ref, inView] = useInView();
  const [hov, setHov] = useState(false);

  if (!next) return null;
  return (
    <div
      ref={ref}
      className="featured-match px-6 py-5 flex flex-col md:flex-row items-center justify-between gap-4 mb-8"
      style={{
        opacity: inView ? 1 : 0,
        transform: inView ? "translateY(0)" : "translateY(20px)",
        transition: "opacity 0.5s ease, transform 0.5s ease",
        cursor: "default",
      }}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
    >
      <div className="flex items-center gap-3">
        <div
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold tracking-widest uppercase"
          style={{
            background: "rgba(22,163,74,0.1)",
            border: "1px solid rgba(22,163,74,0.28)",
            color: "#22C55E",
            fontFamily: "'Barlow Condensed','Hind Siliguri',sans-serif",
          }}
        >
          <Zap size={9} /> Next Match
        </div>
        <span className="text-sm" style={{ color: "#475569" }}>
          {new Date(next.date + "T00:00:00").toLocaleDateString("en-GB", {
            weekday: "short",
            day: "numeric",
            month: "short",
          })}{" "}
          · {next.time} BST
        </span>
      </div>
      <div className="flex items-center gap-6">
        <div
          className="flex items-center gap-3"
          style={{
            transform: hov ? "scale(1.04)" : "scale(1)",
            transition: "transform 0.2s",
          }}
        >
          <FlagIcon teamName={next.team1} size={32} />
          <span className="text-lg text-white font-semibold">{next.team1}</span>
        </div>
        <span
          className="text-xs font-bold px-3 py-1.5 rounded-lg"
          style={{
            background: "rgba(22,163,74,0.1)",
            color: "#22C55E",
            border: "1px solid rgba(22,163,74,0.2)",
            fontFamily: "'Barlow Condensed',sans-serif",
          }}
        >
          VS
        </span>
        <div
          className="flex items-center gap-3"
          style={{
            transform: hov ? "scale(1.04)" : "scale(1)",
            transition: "transform 0.2s",
          }}
        >
          <span className="text-lg text-white font-semibold">{next.team2}</span>
          <FlagIcon teamName={next.team2} size={32} />
        </div>
      </div>
      <div
        className="flex items-center gap-2 text-xs"
        style={{ color: "#475569" }}
      >
        <MapPin size={12} /> {next.venue}, {next.city}
      </div>
    </div>
  );
}

function AnimSection({ children, delay = 0, className = "" }) {
  const [ref, inView] = useInView();
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: inView ? 1 : 0,
        transform: inView ? "translateY(0)" : "translateY(32px)",
        transition: `opacity 0.6s ease ${delay}ms, transform 0.6s ease ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}

/* ── Today Section ── */
function TodaySection({ navigate }) {
  const today = getTodayBDT();
  const [countdown, setCountdown] = useState(getCountdown(TOURNAMENT_START));
  const [activeTab, setActiveTab] = useState("today");

  useEffect(() => {
    if (today < TOURNAMENT_START) {
      const id = setInterval(
        () => setCountdown(getCountdown(TOURNAMENT_START)),
        1000,
      );
      return () => clearInterval(id);
    }
  }, [today]);

  const todayMatches = useMemo(
    () => sortByDateTime(fixtures.filter((f) => f.date === today)),
    [today],
  );
  const upcomingMatches = useMemo(() => {
    const upcoming = [];
    for (let d = 1; d <= 14 && upcoming.length < 6; d++) {
      const dt = new Date(new Date(today).getTime() + d * 86400000);
      const ds = dt.toISOString().slice(0, 10);
      const ms = fixtures.filter((f) => f.date === ds);
      if (ms.length > 0) upcoming.push(...sortByDateTime(ms).slice(0, 3));
    }
    return upcoming.slice(0, 6);
  }, [today]);

  if (today < TOURNAMENT_START) {
    return (
      <section className="max-w-6xl mx-auto px-4 md:px-6 pb-16 animate-section">
        <div
          className="pre-tournament-banner"
          style={{ position: "relative", overflow: "hidden" }}
        >
          <div className="pre-tournament-glow" />
          <PitchOverlay />
          <div className="relative z-10 text-center py-14 px-6">
            <div className="hero-badge mx-auto mb-6 w-fit">
              <Zap size={10} /> Tournament Countdown
            </div>
            <h2
              className="text-white mb-2"
              style={{
                fontFamily: "'Hind Siliguri','Barlow Condensed',sans-serif",
                fontSize: "clamp(2rem,5vw,3.5rem)",
                fontWeight: 800,
                textTransform: "uppercase",
                letterSpacing: "0.03em",
              }}
            >
              টুর্নামেন্ট শুরু হতে আর
            </h2>
            <p className="text-sm mb-10" style={{ color: "#64748B" }}>
              Opening match:{" "}
              <span style={{ color: "#22C55E" }}>12 June 2026</span> — Estadio
              Azteca, Mexico City
            </p>
            {countdown && (
              <div className="flex items-center justify-center gap-4 md:gap-6 flex-wrap">
                <CountdownBox label="Days" value={countdown.days} />
                <div className="countdown-sep">:</div>
                <CountdownBox label="Hours" value={countdown.hours} />
                <div className="countdown-sep">:</div>
                <CountdownBox label="Minutes" value={countdown.minutes} />
                <div className="countdown-sep">:</div>
                <CountdownBox label="Seconds" value={countdown.seconds} />
              </div>
            )}
            <p className="mt-10 text-xs" style={{ color: "#475569" }}>
              <span
                style={{ fontFamily: "'Hind Siliguri','Inter',sans-serif" }}
              >
                সময় Bangladesh Standard Time (UTC+6) অনুযায়ী
              </span>
            </p>
            <div className="flex items-center justify-center gap-3 mt-8 flex-wrap">
              <button
                onClick={() => navigate("/squads")}
                className="btn-primary px-5 py-2.5 text-sm rounded-xl inline-flex items-center gap-2"
              >
                <Shirt size={14} /> View Squads
              </button>
              <button
                onClick={() => navigate("/by-date")}
                className="btn-ghost px-5 py-2.5 text-sm rounded-xl inline-flex items-center gap-2"
              >
                <CalendarDays size={14} /> Full Schedule
              </button>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (today > TOURNAMENT_END) {
    return (
      <section className="max-w-6xl mx-auto px-4 md:px-6 pb-16 animate-section">
        <div className="finished-banner">
          <div className="text-center py-14 px-6 relative z-10">
            <div
              className="text-6xl mb-4"
              style={{ filter: "drop-shadow(0 0 20px rgba(244,197,66,0.5))" }}
            >
              🏆
            </div>
            <h2
              className="text-white mb-3"
              style={{
                fontFamily: "'Barlow Condensed','Hind Siliguri',sans-serif",
                fontSize: "2.5rem",
                fontWeight: 800,
                textTransform: "uppercase",
              }}
            >
              Tournament Complete!
            </h2>
            <p className="text-sm mb-8" style={{ color: "#64748B" }}>
              <span style={{ fontFamily: "'Hind Siliguri',sans-serif" }}>
                FIFA World Cup 2026 শেষ হয়েছে। সকল ফিক্সচার আর্কাইভ দেখুন।
              </span>
            </p>
            <button
              onClick={() => navigate("/by-date")}
              className="btn-primary px-8 py-3 text-sm rounded-xl inline-flex items-center gap-2"
            >
              <CalendarDays size={15} />
              <span
                style={{ fontFamily: "'Hind Siliguri','Inter',sans-serif" }}
              >
                সব ম্যাচ দেখুন
              </span>
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="max-w-6xl mx-auto px-4 md:px-6 pb-16 animate-section">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="live-dot-wrapper">
            <div className="live-dot" />
            <div className="live-dot-ring" />
          </div>
          <div>
            <h2
              className="text-white leading-none"
              style={{
                fontFamily: "'Barlow Condensed','Hind Siliguri',sans-serif",
                fontSize: "1.5rem",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.04em",
              }}
            >
              Match Center
            </h2>
            <p className="text-xs mt-0.5" style={{ color: "#475569" }}>
              {new Date().toLocaleDateString("en-GB", {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric",
              })}{" "}
              · BST
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="tab-strip">
            <button
              className={`tab-btn${activeTab === "today" ? " active" : ""}`}
              onClick={() => setActiveTab("today")}
            >
              Today
            </button>
            <button
              className={`tab-btn${activeTab === "upcoming" ? " active" : ""}`}
              onClick={() => setActiveTab("upcoming")}
            >
              Upcoming
            </button>
          </div>
          <button
            onClick={() => navigate("/by-date")}
            className="btn-ghost px-4 py-2 text-xs rounded-xl inline-flex items-center gap-1.5"
          >
            <span style={{ fontFamily: "'Hind Siliguri','Inter',sans-serif" }}>
              সব
            </span>
            <ArrowRight size={12} />
          </button>
        </div>
      </div>
      {activeTab === "today" ? (
        todayMatches.length === 0 ? (
          <div className="no-matches-today">
            <div className="text-4xl mb-3">📅</div>
            <p
              className="text-xl text-white mb-1"
              style={{
                fontFamily: "'Barlow Condensed','Hind Siliguri',sans-serif",
                fontWeight: 700,
                textTransform: "uppercase",
              }}
            >
              আজ কোনো ম্যাচ নেই
            </p>
            <p className="text-sm" style={{ color: "#64748B" }}>
              No matches scheduled for today.
            </p>
            <button
              onClick={() => setActiveTab("upcoming")}
              className="mt-5 btn-primary px-6 py-2.5 text-sm rounded-xl inline-flex items-center gap-1.5"
            >
              <CalendarDays size={13} /> See Upcoming
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {todayMatches.map((match, i) => (
              <div
                key={match.id}
                className="card-stagger"
                style={{ animationDelay: `${i * 75}ms` }}
              >
                <MatchCard match={match} />
              </div>
            ))}
          </div>
        )
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {upcomingMatches.length === 0 ? (
            <div className="col-span-full no-matches-today">
              <p className="text-sm" style={{ color: "#64748B" }}>
                No upcoming matches found.
              </p>
            </div>
          ) : (
            upcomingMatches.map((match, i) => (
              <div
                key={match.id}
                className="card-stagger"
                style={{ animationDelay: `${i * 75}ms` }}
              >
                <MatchCard match={match} />
              </div>
            ))
          )}
        </div>
      )}
    </section>
  );
}

/* ── Groups Section ── */
function GroupsSection({ navigate }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
      {GROUPS.map((g, gi) => {
        const teams = Array.from(GROUP_TEAMS[g] || []).sort();
        return (
          <div
            key={g}
            className="group-card card-stagger"
            style={{ animationDelay: `${gi * 45}ms` }}
          >
            <div className="group-card-header">Group {g}</div>
            <div className="px-2 py-1.5">
              {teams.map((team) => (
                <button
                  key={team}
                  type="button"
                  onClick={() =>
                    navigate("/by-team", { state: { selectedTeam: team } })
                  }
                  className="team-row"
                >
                  <FlagIcon teamName={team} size={18} />
                  <span className="font-medium truncate text-xs">{team}</span>
                </button>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ── Tournament Timeline ── */
function TournamentTimeline() {
  const phases = [
    {
      label: "Group Stage",
      dates: "12 Jun – 2 Jul",
      matches: 72,
      icon: "⚽",
      color: "#22C55E",
    },
    {
      label: "Round of 32",
      dates: "4 Jul – 7 Jul",
      matches: 16,
      icon: "🔥",
      color: "#4ADE80",
    },
    {
      label: "Round of 16",
      dates: "9 Jul – 12 Jul",
      matches: 8,
      icon: "⚡",
      color: "#2DD4BF",
    },
    {
      label: "Quarter-Finals",
      dates: "14 Jul – 15 Jul",
      matches: 4,
      icon: "🏅",
      color: "#60A5FA",
    },
    {
      label: "Semi-Finals",
      dates: "17 Jul – 18 Jul",
      matches: 2,
      icon: "🥈",
      color: "#A78BFA",
    },
    {
      label: "Final",
      dates: "20 Jul 2026",
      matches: 1,
      icon: "🏆",
      color: "#F4C542",
    },
  ];
  const [ref, inView] = useInView();
  return (
    <div ref={ref} style={{ display: "flex", flexDirection: "column", gap: 0 }}>
      {phases.map((phase, i) => (
        <div
          key={phase.label}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            padding: "14px 0",
            borderBottom:
              i < phases.length - 1
                ? "1px solid rgba(255,255,255,0.05)"
                : "none",
            opacity: inView ? 1 : 0,
            transform: inView ? "translateX(0)" : "translateX(-24px)",
            transition: `opacity 0.5s ease ${i * 80}ms, transform 0.5s ease ${i * 80}ms`,
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              flexShrink: 0,
              width: 32,
            }}
          >
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: "50%",
                background: `${phase.color}18`,
                border: `2px solid ${phase.color}55`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 14,
              }}
            >
              {phase.icon}
            </div>
            {i < phases.length - 1 && (
              <div
                style={{
                  width: 2,
                  height: 14,
                  background: "rgba(255,255,255,0.06)",
                  marginTop: 4,
                }}
              />
            )}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                fontFamily: "'Barlow Condensed','Hind Siliguri',sans-serif",
                fontSize: "0.9rem",
                fontWeight: 700,
                color: "#fff",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
              }}
            >
              {phase.label}
            </div>
            <div style={{ fontSize: 11, color: "#64748B", marginTop: 1 }}>
              {phase.dates}
            </div>
          </div>
          <div
            style={{
              fontSize: 11,
              fontWeight: 600,
              color: phase.color,
              background: `${phase.color}12`,
              border: `1px solid ${phase.color}30`,
              borderRadius: 100,
              padding: "3px 10px",
              flexShrink: 0,
            }}
          >
            {phase.matches} {phase.matches === 1 ? "match" : "matches"}
          </div>
        </div>
      ))}
    </div>
  );
}

/* ── Highlight Matches Banner ── */
function HighlightBanner({ navigate }) {
  const today = getTodayBDT();
  const bigMatches = useMemo(() => {
    const topTeams = new Set([
      "Brazil",
      "Argentina",
      "France",
      "Germany",
      "England",
      "Spain",
      "Portugal",
      "Netherlands",
      "USA",
    ]);
    return fixtures
      .filter(
        (f) =>
          f.date >= today &&
          f.team1 !== "TBD" &&
          f.team2 !== "TBD" &&
          (topTeams.has(f.team1) || topTeams.has(f.team2)),
      )
      .slice(0, 4);
  }, [today]);

  if (bigMatches.length === 0) return null;
  const [ref, inView] = useInView();

  return (
    <div
      ref={ref}
      style={{
        opacity: inView ? 1 : 0,
        transform: inView ? "translateY(0)" : "translateY(24px)",
        transition: "opacity 0.6s ease, transform 0.6s ease",
        marginBottom: 32,
      }}
    >
      <div className="flex items-center gap-4 mb-4">
        <h3 className="section-title">
          <Flame size={16} style={{ color: "#F4C542" }} /> Marquee Matches
        </h3>
        <div className="section-line" />
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
          gap: 10,
        }}
      >
        {bigMatches.map((match, i) => (
          <button
            key={match.id}
            onClick={() => navigate("/by-date")}
            style={{
              background: "rgba(7,36,58,0.8)",
              border: "1px solid rgba(244,197,66,0.15)",
              borderRadius: 14,
              padding: "14px 16px",
              display: "flex",
              alignItems: "center",
              gap: 12,
              cursor: "pointer",
              textAlign: "left",
              width: "100%",
              transition: "all .2s",
              opacity: inView ? 1 : 0,
              transform: inView ? "translateY(0)" : "translateY(16px)",
              transitionDelay: `${i * 70}ms`,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "rgba(244,197,66,0.4)";
              e.currentTarget.style.background = "rgba(7,36,58,1)";
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.4)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "rgba(244,197,66,0.15)";
              e.currentTarget.style.background = "rgba(7,36,58,0.8)";
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "none";
            }}
          >
            <FlagIcon teamName={match.team1} size={28} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  color: "#fff",
                  fontFamily: "'Barlow Condensed','Hind Siliguri',sans-serif",
                  textTransform: "uppercase",
                  letterSpacing: "0.04em",
                }}
              >
                {match.team1} vs {match.team2}
              </div>
              <div style={{ fontSize: 10, color: "#64748B", marginTop: 2 }}>
                {new Date(match.date + "T00:00:00").toLocaleDateString(
                  "en-GB",
                  { day: "numeric", month: "short" },
                )}{" "}
                · {match.time}
              </div>
            </div>
            <FlagIcon teamName={match.team2} size={28} />
          </button>
        ))}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   HOME PAGE
   ══════════════════════════════════════════════════════════ */
export default function Home() {
  const [search, setSearch] = useState("");
  const [scrollY, setScrollY] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim())
      navigate("/by-team", { state: { searchQuery: search.trim() } });
  };

  return (
    <div className="hero-bg pitch-lines min-h-screen">
      <ScrollProgress />

      {/* ─── HERO ─── */}
      <section className="relative overflow-hidden">
        <Particles />
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="glow-orb glow-orb-blue" />
          <div className="glow-orb glow-orb-green" />
          <div className="glow-orb glow-orb-gold" />
        </div>
        <div
          className="relative max-w-6xl mx-auto px-4 md:px-6"
          style={{
            paddingTop: "clamp(56px,10vw,96px)",
            paddingBottom: "clamp(48px,8vw,80px)",
            transform: `translateY(${scrollY * 0.1}px)`,
          }}
        >
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-8">
            {/* Left */}
            <div className="flex-1 text-center lg:text-left">
              <div className="hero-badge animate-fade-down mb-6 mx-auto lg:mx-0 w-fit">
                <Zap size={10} /> Official Tournament Fixtures
              </div>
              <h1
                className="hero-title animate-fade-up mb-2"
                style={{
                  animationDelay: "0.1s",
                  fontSize: "clamp(2.8rem,7vw,5.5rem)",
                  color: "#FFFFFF",
                  textShadow: "0 0 60px rgba(22,163,74,0.15)",
                }}
              >
                FIFA
              </h1>
              <h1
                className="hero-title animate-fade-up mb-1"
                style={{
                  animationDelay: "0.14s",
                  fontSize: "clamp(2.2rem,5.5vw,4.2rem)",
                  background: "linear-gradient(135deg,#CBD5E1 0%,#94A3B8 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                World Cup
              </h1>
              <h2
                className="hero-title animate-fade-up mb-6"
                style={{
                  animationDelay: "0.18s",
                  fontSize: "clamp(5rem,14vw,10rem)",
                  letterSpacing: "-0.03em",
                  background:
                    "linear-gradient(180deg,#FFFFFF 0%,rgba(255,255,255,0.5) 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                  lineHeight: 0.85,
                }}
              >
                2026
              </h2>
              <div
                className="animate-fade-up mb-6 flex justify-center lg:justify-start"
                style={{ animationDelay: "0.22s" }}
              >
                <div className="host-strip">
                  <span
                    className="text-sm font-semibold"
                    style={{ color: "#CBD5E1" }}
                  >
                    USA
                  </span>
                  <div className="host-sep" />
                  <span
                    className="text-sm font-semibold"
                    style={{ color: "#CBD5E1" }}
                  >
                    Canada
                  </span>
                  <div className="host-sep" />
                  <span
                    className="text-sm font-semibold"
                    style={{ color: "#CBD5E1" }}
                  >
                    Mexico
                  </span>
                </div>
              </div>
              <p
                className="text-sm mb-8 animate-fade-up"
                style={{ animationDelay: "0.26s", color: "#475569" }}
              >
                <span
                  style={{ fontFamily: "'Hind Siliguri','Inter',sans-serif" }}
                >
                  সব সময়
                </span>{" "}
                <span style={{ color: "#22C55E" }}>
                  Bangladesh Standard Time (UTC+6)
                </span>{" "}
                <span
                  style={{ fontFamily: "'Hind Siliguri','Inter',sans-serif" }}
                >
                  অনুযায়ী
                </span>
              </p>
              <form
                onSubmit={handleSearch}
                className="max-w-lg mx-auto lg:mx-0 animate-fade-up"
                style={{ animationDelay: "0.32s" }}
              >
                <div className="search-wrapper">
                  <Search
                    size={18}
                    className="search-icon"
                    style={{ color: "#22C55E" }}
                  />
                  <input
                    type="text"
                    className="field-input search-input"
                    placeholder="দল খুঁজুন (যেমন Brazil, Germany…)"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                  <button type="submit" className="btn-primary search-btn">
                    <span
                      style={{
                        fontFamily: "'Hind Siliguri','Inter',sans-serif",
                      }}
                    >
                      খুঁজুন
                    </span>
                  </button>
                </div>
              </form>
              <div
                className="flex items-center gap-3 mt-5 justify-center lg:justify-start animate-fade-up"
                style={{ animationDelay: "0.38s" }}
              >
                <button
                  onClick={() => navigate("/by-date")}
                  className="btn-primary px-6 py-2.5 text-sm rounded-xl inline-flex items-center gap-2"
                  style={{ transition: "all .2s" }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.transform = "translateY(-2px)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.transform = "translateY(0)")
                  }
                >
                  <CalendarDays size={14} /> Match Schedule
                </button>
                <button
                  onClick={() => navigate("/by-team")}
                  className="btn-ghost px-6 py-2.5 text-sm rounded-xl inline-flex items-center gap-2"
                  style={{ transition: "all .2s" }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.transform = "translateY(-2px)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.transform = "translateY(0)")
                  }
                >
                  <Users size={14} /> By Team
                </button>
              </div>
            </div>
            {/* Right — Score Predictor */}
            <div
              className="flex-1 flex items-center justify-center animate-fade-up"
              style={{ animationDelay: "0.2s" }}
            >
              <ScorePredictorWidget />
            </div>
          </div>
        </div>
      </section>

      {/* ─── MATCH MARQUEE ─── */}
      <MatchMarquee />

      {/* ─── STATS ─── */}
      <section className="max-w-6xl mx-auto px-4 md:px-6 pb-14">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            {
              icon: CalendarDays,
              label: "Total Matches",
              value: fixtures.length,
              color: "#22C55E",
              delay: 0,
            },
            {
              icon: Users,
              label: "Participating Teams",
              value: TEAM_COUNT,
              color: "#4ADE80",
              delay: 80,
            },
            {
              icon: Trophy,
              label: "Groups",
              value: GROUPS.length,
              color: "#16A34A",
              delay: 160,
            },
            {
              icon: Globe,
              label: "Host Countries",
              value: 3,
              color: "#86EFAC",
              delay: 240,
            },
          ].map((s) => (
            <StatCard key={s.label} {...s} />
          ))}
        </div>
      </section>

      {/* ─── NEXT MATCH ─── */}
      <section className="max-w-6xl mx-auto px-4 md:px-6 pb-6">
        <NextMatchTicker />
      </section>

      {/* ─── MARQUEE MATCHES ─── */}
      <section className="max-w-6xl mx-auto px-4 md:px-6 pb-4">
        <HighlightBanner navigate={navigate} />
      </section>

      {/* ─── TODAY'S MATCHES ─── */}
      <TodaySection navigate={navigate} />

      {/* ─── QUICK NAV ─── */}
      <section className="max-w-6xl mx-auto px-4 md:px-6 pb-16 animate-section">
        <AnimSection>
          <div className="flex items-center gap-4 mb-6">
            <h3 className="section-title">
              <Flame size={16} style={{ color: "#22C55E" }} /> Browse Fixtures
            </h3>
            <div className="section-line" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              {
                path: "/by-team",
                icon: Users,
                title: "Fixtures by Team",
                desc: `All ${TEAM_COUNT} teams — select any to view their full tournament schedule`,
                iconBg: "rgba(22,163,74,0.12)",
                iconBorder: "rgba(22,163,74,0.28)",
                iconColor: "#22C55E",
                badge: "48 Teams",
              },
              {
                path: "/by-date",
                icon: CalendarDays,
                title: "Fixtures by Date",
                desc: "Browse all matches day-by-day — Group Stage through the Final",
                iconBg: "rgba(14,53,84,0.5)",
                iconBorder: "rgba(22,163,74,0.2)",
                iconColor: "#4ADE80",
                badge: "Jun–Jul",
              },
              {
                path: "/squads",
                icon: Shirt,
                title: "Team Squads",
                desc: "Explore full 26-man squads — players, positions, clubs & more",
                iconBg: "rgba(244,197,66,0.1)",
                iconBorder: "rgba(244,197,66,0.25)",
                iconColor: "#F4C542",
                badge: "9 Teams",
              },
            ].map((item) => (
              <button
                key={item.path}
                type="button"
                onClick={() => navigate(item.path)}
                className="nav-card group text-left w-full"
              >
                <div
                  className="nav-card-icon"
                  style={{
                    background: item.iconBg,
                    border: `1px solid ${item.iconBorder}`,
                  }}
                >
                  <item.icon size={24} style={{ color: item.iconColor }} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2.5 mb-1.5">
                    <span
                      className="text-white"
                      style={{
                        fontFamily:
                          "'Barlow Condensed','Hind Siliguri',sans-serif",
                        fontSize: "1.2rem",
                        fontWeight: 700,
                        textTransform: "uppercase",
                        letterSpacing: "0.04em",
                      }}
                    >
                      {item.title}
                    </span>
                    <span
                      className="text-xs font-semibold px-2 py-0.5 rounded-full"
                      style={{
                        background: "rgba(22,163,74,0.1)",
                        color: "#22C55E",
                        border: "1px solid rgba(22,163,74,0.2)",
                      }}
                    >
                      {item.badge}
                    </span>
                  </div>
                  <div className="text-sm" style={{ color: "#64748B" }}>
                    {item.desc}
                  </div>
                </div>
                <ChevronRight
                  size={20}
                  className="flex-shrink-0 nav-arrow"
                  style={{ color: "#475569" }}
                />
              </button>
            ))}
          </div>
        </AnimSection>
      </section>

      {/* ─── TOURNAMENT TIMELINE + GROUPS ─── */}
      <section className="max-w-6xl mx-auto px-4 md:px-6 pb-16">
        <div
          style={{ display: "grid", gridTemplateColumns: "1fr", gap: 32 }}
          className="lg:grid-cols-[1fr_1.6fr]"
        >
          <AnimSection>
            <div className="flex items-center gap-4 mb-6">
              <h3 className="section-title">
                <Target size={15} style={{ color: "#22C55E" }} /> Tournament
                Phases
              </h3>
              <div className="section-line" />
            </div>
            <div
              style={{
                background: "var(--card)",
                border: "1px solid rgba(255,255,255,0.06)",
                borderRadius: 16,
                padding: "20px 24px",
              }}
            >
              <TournamentTimeline />
            </div>
          </AnimSection>
          <AnimSection delay={100}>
            <div className="flex items-center gap-4 mb-6">
              <h3 className="section-title">
                <Star size={15} style={{ color: "#22C55E" }} /> Tournament
                Groups
              </h3>
              <div className="section-line" />
            </div>
            <GroupsSection navigate={navigate} />
            <p
              className="mt-5 text-sm font-medium"
              style={{ color: "#475569" }}
            >
              12 groups · 4 teams per group · 72 group stage matches total
            </p>
          </AnimSection>
        </div>
      </section>

      {/* ─── FAN ZONE ─── */}
      <section className="max-w-6xl mx-auto px-4 md:px-6 pb-16 animate-section">
        <AnimSection>
          <div className="flex items-center gap-4 mb-6">
            <h3 className="section-title">
              <Mic2 size={15} style={{ color: "#22C55E" }} /> Fan Zone
            </h3>
            <div className="section-line" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              {
                emoji: "🌍",
                title: "48 Nations",
                sub: "The biggest World Cup ever",
                desc: "For the first time, 48 nations will compete on the world stage — representing every confederation and footballing culture on the planet.",
              },
              {
                emoji: "🏟️",
                title: "16 Venues",
                sub: "Across 3 countries",
                desc: "Iconic stadiums from New York to Mexico City to Vancouver will host matches, creating a truly North American football fiesta.",
              },
              {
                emoji: "⚽",
                title: "104 Matches",
                sub: "More football than ever",
                desc: "More group games, more drama, and more chances for upsets. Every match counts in the expanded 2026 tournament format.",
              },
            ].map((card) => (
              <div
                key={card.title}
                style={{
                  background: "var(--card)",
                  border: "1px solid rgba(255,255,255,0.06)",
                  borderRadius: 18,
                  padding: "24px 20px",
                  display: "flex",
                  flexDirection: "column",
                  gap: 10,
                }}
              >
                <div style={{ fontSize: "2.2rem" }}>{card.emoji}</div>
                <div>
                  <div
                    style={{
                      fontFamily:
                        "'Barlow Condensed','Hind Siliguri',sans-serif",
                      fontSize: "1.3rem",
                      fontWeight: 800,
                      color: "#fff",
                      letterSpacing: "0.02em",
                    }}
                  >
                    {card.title}
                  </div>
                  <div
                    style={{
                      fontSize: "0.72rem",
                      color: "#22C55E",
                      fontWeight: 700,
                      textTransform: "uppercase",
                      letterSpacing: "1px",
                      marginBottom: 6,
                    }}
                  >
                    {card.sub}
                  </div>
                  <div
                    style={{
                      fontSize: "0.82rem",
                      color: "#64748B",
                      lineHeight: 1.6,
                    }}
                  >
                    {card.desc}
                  </div>
                </div>
              </div>
            ))}
          </div>
          {/* Fan chants / atmosphere */}
          <div
            style={{
              marginTop: 20,
              background:
                "linear-gradient(135deg,rgba(22,163,74,0.07),rgba(6,22,38,0.9))",
              border: "1px solid rgba(22,163,74,0.15)",
              borderRadius: 18,
              padding: "24px 24px",
              display: "flex",
              flexWrap: "wrap",
              alignItems: "center",
              gap: 20,
            }}
          >
            <div style={{ flex: "1 1 280px" }}>
              <div
                style={{
                  fontFamily: "'Barlow Condensed',sans-serif",
                  fontSize: "1.2rem",
                  fontWeight: 800,
                  color: "#fff",
                  marginBottom: 6,
                }}
              >
                Who Are You Supporting?
              </div>
              <div
                style={{
                  fontSize: "0.82rem",
                  color: "#64748B",
                  lineHeight: 1.6,
                }}
              >
                The World Cup brings billions of fans together. With 48 teams
                from every corner of the globe, there has never been a better
                chance for your nation to go all the way. Pick your team and
                follow their journey.
              </div>
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {[
                "Brazil",
                "Argentina",
                "France",
                "England",
                "Germany",
                "Spain",
                "Portugal",
                "Netherlands",
                "Belgium",
                "Italy",
                "Croatia",
                "Denmark",
                "Switzerland",
                "Serbia",
                "Poland",
                "Ukraine",
                "Turkey",
                "Norway",
                "USA",
                "Mexico",
                "Canada",
                "Japan",
                "South Korea",
                "Australia",
                "Morocco",
                "Senegal",
                "Nigeria",
                "Egypt",
                "Algeria",
                "Cameroon",
                "Ivory Coast",
                "Ghana",
                "Tunisia",
                "Ecuador",
                "Colombia",
                "Uruguay",
                "Chile",
                "Paraguay",
                "Peru",
                "Venezuela",
                "Iran",
                "Saudi Arabia",
                "Qatar",
                "Jordan",
                "Uzbekistan",
                "New Zealand",
              ].map((team) => (
                <div
                  key={team}
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    borderRadius: 30,
                    padding: "6px 14px",
                    fontSize: "0.78rem",
                    fontWeight: 600,
                    color: "#CBD5E1",
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  <FlagIcon teamName={team} size={18} />
                  {team}
                </div>
              ))}
            </div>
          </div>
        </AnimSection>
      </section>

      {/* ─── QUIZ PROMO ─── */}
      <section className="max-w-6xl mx-auto px-4 md:px-6 pb-16 animate-section">
        <AnimSection>
          <div
            style={{
              background:
                "linear-gradient(135deg,rgba(22,163,74,0.12) 0%,rgba(6,22,38,0.95) 100%)",
              border: "1px solid rgba(22,163,74,0.22)",
              borderRadius: 20,
              padding: "32px 28px",
              display: "flex",
              flexWrap: "wrap",
              alignItems: "center",
              gap: 24,
              position: "relative",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                position: "absolute",
                right: -30,
                top: -30,
                width: 180,
                height: 180,
                borderRadius: "50%",
                background: "rgba(22,163,74,0.05)",
                pointerEvents: "none",
              }}
            />
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: 18,
                background: "rgba(22,163,74,0.15)",
                border: "1px solid rgba(22,163,74,0.3)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <Brain size={28} color="#22C55E" />
            </div>
            <div style={{ flex: "1 1 260px" }}>
              <div
                style={{
                  fontFamily: "'Barlow Condensed',sans-serif",
                  fontSize: "1.5rem",
                  fontWeight: 900,
                  color: "#fff",
                  letterSpacing: "0.02em",
                  marginBottom: 4,
                }}
              >
                Test Your World Cup Knowledge!
              </div>
              <div
                style={{
                  fontSize: "0.82rem",
                  color: "#64748B",
                  lineHeight: 1.6,
                }}
              >
                20 questions on history, records & the 2026 edition. With
                timers, streaks & explanations — how many can you get right?
              </div>
            </div>
            <button
              type="button"
              onClick={() => navigate("/quiz")}
              style={{
                padding: "13px 28px",
                borderRadius: 12,
                border: "none",
                background: "linear-gradient(135deg,#15803D,#16A34A)",
                color: "#fff",
                fontSize: "0.9rem",
                fontWeight: 700,
                fontFamily: "'Barlow Condensed',sans-serif",
                letterSpacing: "0.5px",
                textTransform: "uppercase",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 8,
                boxShadow: "0 6px 24px rgba(22,163,74,0.3)",
                flexShrink: 0,
                whiteSpace: "nowrap",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.transform = "translateY(-2px)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.transform = "translateY(0)")
              }
            >
              <Brain size={16} /> Take the Quiz
            </button>
          </div>
        </AnimSection>
      </section>

      {/* ─── TOURNAMENT WINNERS HISTORY ─── */}
      <section className="max-w-6xl mx-auto px-4 md:px-6 pb-16 animate-section">
        <AnimSection>
          <div className="flex items-center gap-4 mb-6">
            <h3 className="section-title">
              <Trophy size={15} style={{ color: "#22C55E" }} /> Past Champions
            </h3>
            <div className="section-line" />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {[
              { year: 2022, team: "Argentina", flag: "🇦🇷", host: "Qatar" },
              { year: 2018, team: "France", flag: "🇫🇷", host: "Russia" },
              { year: 2014, team: "Germany", flag: "🇩🇪", host: "Brazil" },
              { year: 2010, team: "Spain", flag: "🇪🇸", host: "South Africa" },
              { year: 2006, team: "Italy", flag: "🇮🇹", host: "Germany" },
              { year: 2002, team: "Brazil", flag: "🇧🇷", host: "Korea/Japan" },
              { year: 1998, team: "France", flag: "🇫🇷", host: "France" },
              { year: 1994, team: "Brazil", flag: "🇧🇷", host: "USA" },
            ].map((c, i) => (
              <div
                key={c.year}
                className="card-stagger"
                style={{
                  animationDelay: `${i * 40}ms`,
                  background: "var(--card)",
                  border: "1px solid rgba(255,255,255,0.06)",
                  borderRadius: 14,
                  padding: "16px 14px",
                  textAlign: "center",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    marginBottom: 8,
                  }}
                >
                  <FlagIcon teamName={c.team} size={48} />
                </div>
                <div
                  style={{
                    fontFamily: "'Barlow Condensed',sans-serif",
                    fontSize: "1.1rem",
                    fontWeight: 800,
                    color: "#fff",
                  }}
                >
                  {c.team}
                </div>
                <div
                  style={{
                    fontSize: "0.7rem",
                    color: "#22C55E",
                    fontWeight: 700,
                    marginBottom: 2,
                  }}
                >
                  {c.year}
                </div>
                <div
                  style={{
                    fontSize: "0.65rem",
                    color: "#475569",
                    fontWeight: 500,
                  }}
                >
                  {c.host}
                </div>
              </div>
            ))}
          </div>
        </AnimSection>
      </section>

      {/* ─── KEY FACTS ─── */}
      <section className="max-w-6xl mx-auto px-4 md:px-6 pb-16 animate-section">
        <AnimSection>
          <div className="flex items-center gap-4 mb-6">
            <h3 className="section-title">
              <Star size={15} style={{ color: "#22C55E" }} /> Did You Know?
            </h3>
            <div className="section-line" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              {
                icon: "🏆",
                fact: "Brazil hold the record for most World Cup wins with 5 titles, the last in 2002.",
                label: "Most Titles",
              },
              {
                icon: "⚽",
                fact: "Miroslav Klose of Germany is the all-time top scorer with 16 World Cup goals.",
                label: "Top Scorer",
              },
              {
                icon: "⚡",
                fact: "Hakan Şükür scored the fastest ever World Cup goal in just 11 seconds for Turkey in 2002.",
                label: "Fastest Goal",
              },
              {
                icon: "🌍",
                fact: "The 2026 World Cup will be the first co-hosted by three nations across two CONCACAF federations.",
                label: "Historic First",
              },
              {
                icon: "📅",
                fact: "The tournament runs from June 12 to July 19, 2026 — 38 days of football.",
                label: "Tournament Span",
              },
              {
                icon: "🏟️",
                fact: "MetLife Stadium in New York/NJ will host the 2026 World Cup Final, with a capacity of over 82,000.",
                label: "Final Venue",
              },
            ].map((item, i) => (
              <div
                key={i}
                style={{
                  background: "var(--card)",
                  border: "1px solid rgba(255,255,255,0.06)",
                  borderRadius: 14,
                  padding: "16px 18px",
                  display: "flex",
                  gap: 14,
                  alignItems: "flex-start",
                }}
              >
                <div
                  style={{ fontSize: "1.6rem", flexShrink: 0, lineHeight: 1 }}
                >
                  {item.icon}
                </div>
                <div>
                  <div
                    style={{
                      fontSize: "0.65rem",
                      fontWeight: 700,
                      color: "#22C55E",
                      textTransform: "uppercase",
                      letterSpacing: "1px",
                      marginBottom: 4,
                    }}
                  >
                    {item.label}
                  </div>
                  <div
                    style={{
                      fontSize: "0.85rem",
                      color: "#94A3B8",
                      lineHeight: 1.55,
                    }}
                  >
                    {item.fact}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </AnimSection>
      </section>

      {/* ─── HOST STADIUMS ─── */}
      <section className="max-w-6xl mx-auto px-4 md:px-6 pb-24 animate-section">
        <AnimSection>
          <div className="flex items-center gap-4 mb-6">
            <h3 className="section-title">
              <MapPin size={15} style={{ color: "#22C55E" }} /> Host Stadiums
            </h3>
            <div className="section-line" />
          </div>
          {[
            {
              flag: "🇺🇸",
              country: "United States",
              venues: [
                { name: "MetLife Stadium", city: "New York/NJ" },
                { name: "SoFi Stadium", city: "Los Angeles" },
                { name: "AT&T Stadium", city: "Dallas" },
                { name: "Hard Rock Stadium", city: "Miami" },
                { name: "Levi's Stadium", city: "San Francisco" },
                { name: "Mercedes-Benz Stadium", city: "Atlanta" },
                { name: "Gillette Stadium", city: "Boston" },
                { name: "Arrowhead Stadium", city: "Kansas City" },
                { name: "Lincoln Financial Field", city: "Philadelphia" },
                { name: "Lumen Field", city: "Seattle" },
                { name: "NRG Stadium", city: "Houston" },
              ],
            },
            {
              flag: "🇲🇽",
              country: "Mexico",
              venues: [
                { name: "Estadio Azteca", city: "Mexico City" },
                { name: "Estadio BBVA", city: "Monterrey" },
                { name: "Estadio Akron", city: "Guadalajara" },
              ],
            },
            {
              flag: "🇨🇦",
              country: "Canada",
              venues: [
                { name: "BMO Field", city: "Toronto" },
                { name: "BC Place", city: "Vancouver" },
              ],
            },
          ].map((section, si) => (
            <div key={section.country} className="mb-8">
              <div className="flex items-center gap-2.5 mb-3">
                <span className="text-xl">{section.flag}</span>
                <span
                  className="text-sm tracking-wider font-medium"
                  style={{ color: "#CBD5E1" }}
                >
                  {section.country}
                </span>
                <div
                  className="flex-1 h-px"
                  style={{ background: "rgba(255,255,255,0.06)" }}
                />
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                {section.venues.map((v, i) => (
                  <div
                    key={v.name}
                    className="venue-card card-stagger"
                    style={{
                      animationDelay: `${(si * section.venues.length + i) * 30}ms`,
                    }}
                  >
                    <div className="font-semibold text-white text-xs leading-snug">
                      {v.name}
                    </div>
                    <div
                      className="text-xs mt-0.5"
                      style={{ color: "#475569" }}
                    >
                      {v.city}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </AnimSection>
      </section>
    </div>
  );
}
