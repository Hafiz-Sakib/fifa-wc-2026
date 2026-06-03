import React, { useState, useEffect, useRef, useMemo } from "react";
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
} from "lucide-react";
import fixtures from "../data/fixtures.json";
import MatchCard from "../components/MatchCard";
import FlagIcon from "../components/FlagIcon";
import { getAllTeams } from "../utils/countryUtils";
import { sortByDateTime } from "../utils/dateUtils";

/* ── Constants ─────────────────────────────────────────── */
const TOURNAMENT_START = "2026-06-12";
const TOURNAMENT_END   = "2026-07-20";
const GROUP_STAGE = fixtures.filter(
  (f) => !["Round of 32","Round of 16","Quarter-Final","Semi-Final","Third Place","Final"].includes(f.group),
);
const TEAM_COUNT  = getAllTeams().length;
const GROUPS      = [...new Set(GROUP_STAGE.map((f) => f.group))].sort();
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
  const now    = new Date();
  const target = new Date(targetDateStr + "T00:00:00+06:00");
  const diff   = target - now;
  if (diff <= 0) return null;
  return {
    days:    Math.floor(diff / 86400000),
    hours:   Math.floor((diff % 86400000) / 3600000),
    minutes: Math.floor((diff % 3600000) / 60000),
    seconds: Math.floor((diff % 60000) / 1000),
  };
}

/* ── Animated Counter ── */
function AnimCounter({ value, duration = 1400 }) {
  const [display, setDisplay] = useState(0);
  const raf = useRef(null);
  useEffect(() => {
    const start   = performance.now();
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

/* ── Particles ── */
function Particles() {
  const particles = useMemo(
    () =>
      Array.from({ length: 22 }, (_, i) => ({
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
            left: `${p.x}%`, top: `${p.y}%`,
            width: p.size, height: p.size,
            opacity: p.opacity,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
          }}
        />
      ))}
      {[0, 1, 2, 3].map((i) => (
        <div key={`ball-${i}`} className="particle-ball"
          style={{
            left: `${12 + i * 22}%`,
            animationDelay: `${i * 2.5}s`,
            animationDuration: `${14 + i * 2.5}s`,
            fontSize: `${12 + i * 4}px`,
          }}
        >⚽</div>
      ))}
    </div>
  );
}

/* ── Countdown Box ── */
function CountdownBox({ label, value }) {
  return (
    <div className="countdown-box">
      <div className="countdown-num">{String(value).padStart(2, "0")}</div>
      <div className="countdown-label">{label}</div>
    </div>
  );
}

/* ── Trophy SVG Graphic ── */
function TrophyGraphic() {
  return (
    <div className="relative flex items-center justify-center" style={{ width: "100%", maxWidth: "400px" }}>
      {/* Backdrop glow blobs */}
      <div
        className="absolute"
        style={{
          width: "280px", height: "280px",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(22,163,74,0.18) 0%, rgba(30,58,138,0.2) 50%, transparent 70%)",
          filter: "blur(40px)",
          top: "50%", left: "50%",
          transform: "translate(-50%, -50%)",
        }}
      />
      <div
        className="absolute"
        style={{
          width: "180px", height: "180px",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(244,197,66,0.12) 0%, transparent 70%)",
          filter: "blur(30px)",
          top: "30%", left: "60%",
          transform: "translate(-50%, -50%)",
        }}
      />

      {/* Trophy emoji large */}
      <div
        className="trophy-float relative z-10 select-none text-center"
        style={{
          fontSize: "clamp(6rem, 15vw, 10rem)",
          lineHeight: 1,
          filter: "drop-shadow(0 0 40px rgba(244,197,66,0.6)) drop-shadow(0 20px 60px rgba(0,0,0,0.5))",
        }}
      >
        🏆
      </div>

      {/* Host flags row */}
      <div
        className="absolute bottom-0 left-1/2 flex items-center gap-3"
        style={{ transform: "translateX(-50%)" }}
      >
        {["🇺🇸", "🇨🇦", "🇲🇽"].map((flag, i) => (
          <div
            key={i}
            className="flex items-center justify-center text-2xl"
            style={{
              width: "44px", height: "44px",
              borderRadius: "50%",
              background: "rgba(8,38,61,0.9)",
              border: "2px solid rgba(255,255,255,0.1)",
              backdropFilter: "blur(8px)",
              boxShadow: "0 4px 16px rgba(0,0,0,0.3)",
            }}
          >
            {flag}
          </div>
        ))}
      </div>

      {/* Corner decorative badges */}
      <div
        className="absolute top-4 right-4 flex items-center gap-1.5 px-3 py-1.5 rounded-full"
        style={{
          background: "rgba(22,163,74,0.12)",
          border: "1px solid rgba(22,163,74,0.28)",
          fontSize: "0.65rem",
          color: "#22C55E",
          fontWeight: 700,
          letterSpacing: "1px",
          fontFamily: "'Barlow Condensed', sans-serif",
          textTransform: "uppercase",
        }}
      >
        <Zap size={9}/> 48 Teams
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
          fontFamily: "'Barlow Condensed', sans-serif",
          textTransform: "uppercase",
        }}
      >
        <Star size={9} fill="#F4C542"/> Finals 2026
      </div>
    </div>
  );
}

/* ── Today Section ── */
function TodaySection({ navigate }) {
  const today       = getTodayBDT();
  const [countdown, setCountdown] = useState(getCountdown(TOURNAMENT_START));
  const [activeTab, setActiveTab] = useState("today");

  useEffect(() => {
    if (today < TOURNAMENT_START) {
      const id = setInterval(() => setCountdown(getCountdown(TOURNAMENT_START)), 1000);
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

  /* Before tournament */
  if (today < TOURNAMENT_START) {
    return (
      <section className="max-w-6xl mx-auto px-4 md:px-6 pb-16 animate-section">
        <div className="pre-tournament-banner">
          <div className="pre-tournament-glow" />
          <div className="relative z-10 text-center py-14 px-6">
            <div className="hero-badge mx-auto mb-6 w-fit">
              <Zap size={10} /> Tournament Countdown
            </div>
            <h2
              className="text-white mb-2"
              style={{
                fontFamily: "'Barlow Condensed', sans-serif",
                fontSize: "clamp(2rem, 5vw, 3.5rem)",
                fontWeight: 800,
                textTransform: "uppercase",
                letterSpacing: "0.03em",
              }}
            >
              টুর্নামেন্ট শুরু হতে আর
            </h2>
            <p className="text-sm mb-10" style={{ color: "#64748B" }}>
              Opening match:{" "}
              <span style={{ color: "#22C55E" }}>12 June 2026</span> — Estadio Azteca, Mexico City
            </p>
            {countdown && (
              <div className="flex items-center justify-center gap-4 md:gap-6 flex-wrap">
                <CountdownBox label="Days"    value={countdown.days}    />
                <div className="countdown-sep">:</div>
                <CountdownBox label="Hours"   value={countdown.hours}   />
                <div className="countdown-sep">:</div>
                <CountdownBox label="Minutes" value={countdown.minutes} />
                <div className="countdown-sep">:</div>
                <CountdownBox label="Seconds" value={countdown.seconds} />
              </div>
            )}
            <p className="mt-10 text-xs" style={{ color: "#475569" }}>
              সময় Bangladesh Standard Time (UTC+6) অনুযায়ী
            </p>
          </div>
        </div>
      </section>
    );
  }

  /* After tournament */
  if (today > TOURNAMENT_END) {
    return (
      <section className="max-w-6xl mx-auto px-4 md:px-6 pb-16 animate-section">
        <div className="finished-banner">
          <div className="text-center py-14 px-6 relative z-10">
            <div className="text-6xl mb-4" style={{ filter: "drop-shadow(0 0 20px rgba(244,197,66,0.5))" }}>🏆</div>
            <h2
              className="text-white mb-3"
              style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "2.5rem", fontWeight: 800, textTransform: "uppercase" }}
            >
              Tournament Complete!
            </h2>
            <p className="text-sm mb-8" style={{ color: "#64748B" }}>
              FIFA World Cup 2026 শেষ হয়েছে। সকল ফিক্সচার আর্কাইভ দেখুন।
            </p>
            <button
              onClick={() => navigate("/by-date")}
              className="btn-primary px-8 py-3 text-sm rounded-xl inline-flex items-center gap-2"
            >
              <CalendarDays size={15}/> সব ম্যাচ দেখুন
            </button>
          </div>
        </div>
      </section>
    );
  }

  /* During tournament */
  return (
    <section className="max-w-6xl mx-auto px-4 md:px-6 pb-16 animate-section">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="live-dot-wrapper"><div className="live-dot"/><div className="live-dot-ring"/></div>
          <div>
            <h2
              className="text-white leading-none"
              style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "1.5rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.04em" }}
            >
              Match Center
            </h2>
            <p className="text-xs mt-0.5" style={{ color: "#475569" }}>
              {new Date().toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" })} · BST
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="tab-strip">
            <button className={`tab-btn${activeTab === "today"    ? " active" : ""}`} onClick={() => setActiveTab("today")}>Today</button>
            <button className={`tab-btn${activeTab === "upcoming" ? " active" : ""}`} onClick={() => setActiveTab("upcoming")}>Upcoming</button>
          </div>
          <button
            onClick={() => navigate("/by-date")}
            className="btn-ghost px-4 py-2 text-xs rounded-xl inline-flex items-center gap-1.5"
          >
            সব <ArrowRight size={12}/>
          </button>
        </div>
      </div>

      {activeTab === "today" ? (
        todayMatches.length === 0 ? (
          <div className="no-matches-today">
            <div className="text-4xl mb-3">📅</div>
            <p className="text-xl text-white mb-1" style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, textTransform: "uppercase" }}>
              আজ কোনো ম্যাচ নেই
            </p>
            <p className="text-sm" style={{ color: "#64748B" }}>No matches scheduled for today.</p>
            <button
              onClick={() => setActiveTab("upcoming")}
              className="mt-5 btn-primary px-6 py-2.5 text-sm rounded-xl inline-flex items-center gap-1.5"
            >
              <CalendarDays size={13}/> See Upcoming
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {todayMatches.map((match, i) => (
              <div key={match.id} className="card-stagger" style={{ animationDelay: `${i * 75}ms` }}>
                <MatchCard match={match}/>
              </div>
            ))}
          </div>
        )
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {upcomingMatches.length === 0 ? (
            <div className="col-span-full no-matches-today">
              <p className="text-sm" style={{ color: "#64748B" }}>No upcoming matches found.</p>
            </div>
          ) : (
            upcomingMatches.map((match, i) => (
              <div key={match.id} className="card-stagger" style={{ animationDelay: `${i * 75}ms` }}>
                <MatchCard match={match}/>
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
          <div key={g} className="group-card card-stagger" style={{ animationDelay: `${gi * 45}ms` }}>
            <div className="group-card-header">Group {g}</div>
            <div className="px-2 py-1.5">
              {teams.map((team) => (
                <button
                  key={team}
                  type="button"
                  onClick={() => navigate("/by-team", { state: { selectedTeam: team } })}
                  className="team-row"
                >
                  <FlagIcon teamName={team} size={18}/>
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

/* ── Next Match Ticker ── */
function NextMatchTicker() {
  const today = getTodayBDT();
  const next  = useMemo(() => {
    const future = fixtures.filter((f) => f.date >= today && f.team1 !== "TBD" && f.team2 !== "TBD");
    return sortByDateTime(future)[0] || null;
  }, [today]);

  if (!next) return null;
  return (
    <div className="featured-match px-6 py-5 flex flex-col md:flex-row items-center justify-between gap-4 mb-8">
      <div className="flex items-center gap-3">
        <div
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold tracking-widest uppercase"
          style={{
            background: "rgba(22,163,74,0.1)",
            border: "1px solid rgba(22,163,74,0.28)",
            color: "#22C55E",
            fontFamily: "'Barlow Condensed', sans-serif",
          }}
        >
          <Zap size={9}/> Next Match
        </div>
        <span className="text-sm" style={{ color: "#475569" }}>
          {new Date(next.date + "T00:00:00").toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" })}
          {" · "}{next.time} BST
        </span>
      </div>
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-3">
          <FlagIcon teamName={next.team1} size={30}/>
          <span className="text-lg text-white font-semibold">{next.team1}</span>
        </div>
        <span
          className="text-xs font-bold px-3 py-1.5 rounded-lg"
          style={{ background: "rgba(22,163,74,0.1)", color: "#22C55E", border: "1px solid rgba(22,163,74,0.2)", fontFamily: "'Barlow Condensed', sans-serif" }}
        >
          VS
        </span>
        <div className="flex items-center gap-3">
          <span className="text-lg text-white font-semibold">{next.team2}</span>
          <FlagIcon teamName={next.team2} size={30}/>
        </div>
      </div>
      <div className="flex items-center gap-2 text-xs" style={{ color: "#475569" }}>
        <MapPin size={12}/> {next.venue}, {next.city}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   HOME PAGE
   ══════════════════════════════════════════════════════════ */
export default function Home() {
  const [search,  setSearch]  = useState("");
  const [scrollY, setScrollY] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim()) navigate("/by-team", { state: { searchQuery: search.trim() } });
  };

  return (
    <div className="hero-bg pitch-lines min-h-screen">

      {/* ─── HERO ──────────────────────────────────────────── */}
      <section className="relative overflow-hidden">
        <Particles/>

        {/* Glow orbs */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="glow-orb glow-orb-blue"/>
          <div className="glow-orb glow-orb-green"/>
          <div className="glow-orb glow-orb-gold"/>
        </div>

        <div
          className="relative max-w-6xl mx-auto px-4 md:px-6"
          style={{
            paddingTop: "clamp(56px, 10vw, 96px)",
            paddingBottom: "clamp(48px, 8vw, 80px)",
            transform: `translateY(${scrollY * 0.1}px)`,
          }}
        >
          {/* Two-column layout */}
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-8">

            {/* Left: Text + Buttons */}
            <div className="flex-1 text-center lg:text-left">
              {/* Badge */}
              <div className="hero-badge animate-fade-down mb-6 mx-auto lg:mx-0 w-fit">
                <Zap size={10}/> Official Tournament Fixtures
              </div>

              {/* Title */}
              <h1
                className="hero-title animate-fade-up mb-2"
                style={{
                  animationDelay: "0.1s",
                  fontSize: "clamp(2.8rem, 7vw, 5.5rem)",
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
                  fontSize: "clamp(2.2rem, 5.5vw, 4.2rem)",
                  background: "linear-gradient(135deg, #CBD5E1 0%, #94A3B8 100%)",
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
                  fontSize: "clamp(5rem, 14vw, 10rem)",
                  letterSpacing: "-0.03em",
                  background: "linear-gradient(180deg, #FFFFFF 0%, rgba(255,255,255,0.5) 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                  lineHeight: 0.85,
                }}
              >
                2026
              </h2>

              {/* Host strip */}
              <div className="animate-fade-up mb-6 flex justify-center lg:justify-start" style={{ animationDelay: "0.22s" }}>
                <div className="host-strip">
                  <span className="text-sm font-semibold" style={{ color: "#CBD5E1" }}>USA</span>
                  <div className="host-sep"/>
                  <span className="text-sm font-semibold" style={{ color: "#CBD5E1" }}>Canada</span>
                  <div className="host-sep"/>
                  <span className="text-sm font-semibold" style={{ color: "#CBD5E1" }}>Mexico</span>
                </div>
              </div>

              <p
                className="text-sm mb-8 animate-fade-up"
                style={{ animationDelay: "0.26s", color: "#475569" }}
              >
                সব সময়{" "}
                <span style={{ color: "#22C55E" }}>Bangladesh Standard Time (UTC+6)</span>{" "}
                অনুযায়ী
              </p>

              {/* Search */}
              <form
                onSubmit={handleSearch}
                className="max-w-lg mx-auto lg:mx-0 animate-fade-up"
                style={{ animationDelay: "0.32s" }}
              >
                <div className="search-wrapper">
                  <Search size={18} className="search-icon" style={{ color: "#22C55E" }}/>
                  <input
                    type="text"
                    className="field-input search-input"
                    placeholder="দল খুঁজুন (যেমন Brazil, Germany…)"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                  <button type="submit" className="btn-primary search-btn">খুঁজুন</button>
                </div>
              </form>

              {/* CTA buttons */}
              <div className="flex items-center gap-3 mt-5 justify-center lg:justify-start animate-fade-up" style={{ animationDelay: "0.38s" }}>
                <button
                  onClick={() => navigate("/by-date")}
                  className="btn-primary px-6 py-2.5 text-sm rounded-xl inline-flex items-center gap-2"
                >
                  <CalendarDays size={14}/> Match Schedule
                </button>
                <button
                  onClick={() => navigate("/by-team")}
                  className="btn-ghost px-6 py-2.5 text-sm rounded-xl inline-flex items-center gap-2"
                >
                  <Users size={14}/> By Team
                </button>
              </div>
            </div>

            {/* Right: Trophy Graphic */}
            <div
              className="flex-1 flex items-center justify-center animate-fade-up"
              style={{ animationDelay: "0.2s", minHeight: "320px" }}
            >
              <TrophyGraphic/>
            </div>
          </div>
        </div>
      </section>

      {/* ─── STATS ─────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-4 md:px-6 pb-14 animate-section">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: CalendarDays, label: "Total Matches",     value: fixtures.length, color: "#22C55E" },
            { icon: Users,        label: "Participating Teams",value: TEAM_COUNT,      color: "#4ADE80" },
            { icon: Trophy,       label: "Groups",            value: GROUPS.length,   color: "#16A34A" },
            { icon: Globe,        label: "Host Countries",    value: 3,               color: "#86EFAC" },
          ].map(({ icon: Icon, label, value, color }) => (
            <div key={label} className="stat-card px-5 py-6 text-center">
              <div className="stat-icon-wrap">
                <Icon size={20} style={{ color }}/>
              </div>
              <div
                className="mb-1 text-white"
                style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "clamp(2rem, 4vw, 2.8rem)", fontWeight: 800 }}
              >
                <AnimCounter value={value}/>
              </div>
              <div className="text-xs font-semibold tracking-wide uppercase" style={{ color: "#64748B" }}>
                {label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── NEXT MATCH TICKER ─────────────────────────── */}
      <section className="max-w-6xl mx-auto px-4 md:px-6 pb-6 animate-section">
        <NextMatchTicker/>
      </section>

      {/* ─── TODAY'S MATCHES ───────────────────────────── */}
      <TodaySection navigate={navigate}/>

      {/* ─── QUICK NAV ─────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-4 md:px-6 pb-16 animate-section">
        <div className="flex items-center gap-4 mb-6">
          <h3 className="section-title">
            <Flame size={16} style={{ color: "#22C55E" }}/> Browse Fixtures
          </h3>
          <div className="section-line"/>
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
                style={{ background: item.iconBg, border: `1px solid ${item.iconBorder}` }}
              >
                <item.icon size={24} style={{ color: item.iconColor }}/>
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2.5 mb-1.5">
                  <span
                    className="text-white"
                    style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "1.2rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.04em" }}
                  >
                    {item.title}
                  </span>
                  <span
                    className="text-xs font-semibold px-2 py-0.5 rounded-full"
                    style={{ background: "rgba(22,163,74,0.1)", color: "#22C55E", border: "1px solid rgba(22,163,74,0.2)" }}
                  >
                    {item.badge}
                  </span>
                </div>
                <div className="text-sm" style={{ color: "#64748B" }}>{item.desc}</div>
              </div>
              <ChevronRight size={20} className="flex-shrink-0 nav-arrow" style={{ color: "#475569" }}/>
            </button>
          ))}
        </div>
      </section>

      {/* ─── GROUPS ────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-4 md:px-6 pb-16 animate-section">
        <div className="flex items-center gap-4 mb-6">
          <h3 className="section-title">
            <Star size={15} style={{ color: "#22C55E" }}/> Tournament Groups
          </h3>
          <div className="section-line"/>
        </div>
        <GroupsSection navigate={navigate}/>
        <p className="mt-5 text-sm font-medium" style={{ color: "#475569" }}>
          12 groups · 4 teams per group · 72 group stage matches total
        </p>
      </section>

      {/* ─── HOST STADIUMS ─────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-4 md:px-6 pb-24 animate-section">
        <div className="flex items-center gap-4 mb-6">
          <h3 className="section-title">
            <MapPin size={15} style={{ color: "#22C55E" }}/> Host Stadiums
          </h3>
          <div className="section-line"/>
        </div>
        {[
          {
            flag: "🇺🇸", country: "United States",
            venues: [
              { name: "MetLife Stadium",         city: "New York/NJ"     },
              { name: "SoFi Stadium",             city: "Los Angeles"     },
              { name: "AT&T Stadium",             city: "Dallas"          },
              { name: "Hard Rock Stadium",        city: "Miami"           },
              { name: "Levi's Stadium",           city: "San Francisco"   },
              { name: "Mercedes-Benz Stadium",    city: "Atlanta"         },
              { name: "Gillette Stadium",         city: "Boston"          },
              { name: "Arrowhead Stadium",        city: "Kansas City"     },
              { name: "Lincoln Financial Field",  city: "Philadelphia"    },
              { name: "Lumen Field",              city: "Seattle"         },
              { name: "NRG Stadium",              city: "Houston"         },
            ],
          },
          {
            flag: "🇲🇽", country: "Mexico",
            venues: [
              { name: "Estadio Azteca", city: "Mexico City"  },
              { name: "Estadio BBVA",   city: "Monterrey"    },
              { name: "Estadio Akron",  city: "Guadalajara"  },
            ],
          },
          {
            flag: "🇨🇦", country: "Canada",
            venues: [
              { name: "BMO Field", city: "Toronto"   },
              { name: "BC Place",  city: "Vancouver" },
            ],
          },
        ].map((section, si) => (
          <div key={section.country} className="mb-8">
            <div className="flex items-center gap-2.5 mb-3">
              <span className="text-xl">{section.flag}</span>
              <span className="text-sm tracking-wider font-medium" style={{ color: "#CBD5E1" }}>{section.country}</span>
              <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.06)" }}/>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
              {section.venues.map((v, i) => (
                <div
                  key={v.name}
                  className="venue-card card-stagger"
                  style={{ animationDelay: `${(si * section.venues.length + i) * 30}ms` }}
                >
                  <div className="font-semibold text-white text-xs leading-snug">{v.name}</div>
                  <div className="text-xs mt-0.5" style={{ color: "#475569" }}>{v.city}</div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}
