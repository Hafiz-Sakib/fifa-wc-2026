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
  TrendingUp,
  Shield,
} from "lucide-react";
import fixtures from "../data/fixtures.json";
import MatchCard from "../components/MatchCard";
import FlagIcon from "../components/FlagIcon";
import { getAllTeams } from "../utils/countryUtils";
import { sortByDateTime } from "../utils/dateUtils";

//version 01
/* ── Constants ─────────────────────────────────────────── */
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

/* ── Animated Counter ── */
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

/* ── Floating Particles ── */
function Particles() {
  const particles = useMemo(
    () =>
      Array.from({ length: 28 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 3.5 + 0.8,
        delay: Math.random() * 8,
        duration: Math.random() * 10 + 7,
        opacity: Math.random() * 0.45 + 0.08,
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
            left: `${10 + i * 18}%`,
            animationDelay: `${i * 2.2}s`,
            animationDuration: `${13 + i * 2.5}s`,
            fontSize: `${13 + i * 3}px`,
          }}
        >
          ⚽
        </div>
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

/* ── Today's Section ── */
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

  // Get upcoming matches (next 3 days with matches)
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
      <section className="max-w-6xl mx-auto px-4 pb-16 animate-section">
        <div className="pre-tournament-banner">
          <div className="pre-tournament-glow" />
          <div className="relative z-10 text-center py-12 px-6">
            <div
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-6 text-xs font-bold tracking-widest uppercase"
              style={{
                background: "rgba(0,216,76,0.08)",
                border: "1px solid rgba(0,216,76,0.3)",
                color: "#00D84C",
              }}
            >
              <Zap size={11} /> Tournament Countdown
            </div>
            <h2 className="text-4xl md:text-5xl text-white mb-2 tracking-wide">
              টুর্নামেন্ট শুরু হতে আর
            </h2>
            <p className="text-gray-400 text-sm mb-10">
              Opening match:{" "}
              <span style={{ color: "#00D84C" }}>12 June 2026</span> — Estadio
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
            <p className="mt-10 text-xs text-gray-600">
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
      <section className="max-w-6xl mx-auto px-4 pb-16 animate-section">
        <div className="finished-banner">
          <div className="text-center py-14 px-6 relative z-10">
            <div
              className="text-6xl mb-4"
              style={{ filter: "drop-shadow(0 0 20px rgba(255,215,0,0.5))" }}
            >
              🏆
            </div>
            <h2 className="text-4xl text-white mb-3 tracking-wide">
              Tournament Complete!
            </h2>
            <p className="text-gray-400 text-sm mb-8">
              FIFA World Cup 2026 শেষ হয়েছে। সকল ফিক্সচার আর্কাইভ দেখুন।
            </p>
            <button
              onClick={() => navigate("/by-date")}
              className="btn-gold px-8 py-3 text-sm rounded-xl inline-flex items-center gap-2"
            >
              <CalendarDays size={15} /> সব ম্যাচ দেখুন
            </button>
          </div>
        </div>
      </section>
    );
  }

  /* During tournament */
  return (
    <section className="max-w-6xl mx-auto px-4 pb-16 animate-section">
      {/* Header row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="live-dot-wrapper">
            <div className="live-dot" />
            <div className="live-dot-ring" />
          </div>
          <div>
            <h2 className="text-2xl text-white tracking-wide leading-none">
              Match Center
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
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
          {/* Tab strip */}
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
            className="btn-outline px-4 py-2 text-xs rounded-xl inline-flex items-center gap-1.5"
          >
            সব <ArrowRight size={12} />
          </button>
        </div>
      </div>

      {activeTab === "today" ? (
        todayMatches.length === 0 ? (
          <div className="no-matches-today">
            <div className="text-4xl mb-3">📅</div>
            <p className="text-xl text-white tracking-wide mb-1">
              আজ কোনো ম্যাচ নেই
            </p>
            <p className="text-gray-500 text-sm">
              No matches scheduled for today.
            </p>
            <button
              onClick={() => setActiveTab("upcoming")}
              className="mt-5 btn-gold px-6 py-2.5 text-sm rounded-xl inline-flex items-center gap-1.5"
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
                style={{ animationDelay: `${i * 80}ms` }}
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
              <p className="text-gray-400 text-sm">
                No upcoming matches found.
              </p>
            </div>
          ) : (
            upcomingMatches.map((match, i) => (
              <div
                key={match.id}
                className="card-stagger"
                style={{ animationDelay: `${i * 80}ms` }}
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
            style={{ animationDelay: `${gi * 50}ms` }}
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

/* ── Featured Match Ticker ── */
function NextMatchTicker() {
  const today = getTodayBDT();
  const next = useMemo(() => {
    const future = fixtures.filter(
      (f) => f.date >= today && f.team1 !== "TBD" && f.team2 !== "TBD",
    );
    return sortByDateTime(future)[0] || null;
  }, [today]);

  if (!next) return null;
  return (
    <div className="featured-match px-6 py-5 flex flex-col md:flex-row items-center justify-between gap-4 mb-8">
      <div className="flex items-center gap-3">
        <div
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold tracking-widest uppercase"
          style={{
            background: "rgba(0,216,76,0.08)",
            border: "1px solid rgba(0,216,76,0.3)",
            color: "#00D84C",
          }}
        >
          <Zap size={9} /> Next Match
        </div>
        <span className="text-gray-500 text-sm">
          {new Date(next.date + "T00:00:00").toLocaleDateString("en-GB", {
            weekday: "short",
            day: "numeric",
            month: "short",
          })}
          {" · "}
          {next.time} BST
        </span>
      </div>
      <div className="flex items-center gap-5">
        <div className="flex items-center gap-2.5">
          <FlagIcon teamName={next.team1} size={28} />
          <span className="text-xl text-white tracking-wider">
            {next.team1}
          </span>
        </div>
        <span
          className="text-xs font-bold px-3 py-1.5 rounded-lg text-green-400"
          style={{
            background: "rgba(0,216,76,0.08)",
            border: "1px solid rgba(0,216,76,0.2)",
          }}
        >
          VS
        </span>
        <div className="flex items-center gap-2.5">
          <span className="text-xl text-white tracking-wider">
            {next.team2}
          </span>
          <FlagIcon teamName={next.team2} size={28} />
        </div>
      </div>
      <div className="flex items-center gap-1.5 text-gray-500 text-xs">
        <MapPin size={12} /> {next.venue}, {next.city}
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
      {/* ─── HERO ─────────────────────────────────────── */}
      <section className="relative overflow-hidden">
        <Particles />

        {/* Glow orbs */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="glow-orb glow-orb-1" />
          <div className="glow-orb glow-orb-2" />
          <div className="glow-orb glow-orb-3" />
          <div className="glow-orb glow-orb-gold" />
        </div>

        <div
          className="relative max-w-6xl mx-auto px-4 pt-20 pb-16 text-center"
          style={{ transform: `translateY(${scrollY * 0.12}px)` }}
        >
          {/* Badge */}
          <div className="hero-badge animate-fade-down">
            <Zap size={11} /> Official Tournament Fixtures
          </div>

          {/* Trophy */}
          <div
            className="trophy-icon animate-fade-down"
            style={{ animationDelay: "0.1s" }}
          >
            🏆
          </div>

          {/* Heading */}
          <h1
            className="text-5xl md:text-7xl leading-none mb-1 animate-fade-up gold-text tracking-wide"
            style={{ animationDelay: "0.15s" }}
          >
            FIFA World Cup
          </h1>
          <h2
            className="text-8xl md:text-[10rem] text-white mb-4 animate-fade-up year-text leading-none"
            style={{ animationDelay: "0.2s", letterSpacing: "-0.04em" }}
          >
            2026
          </h2>

          {/* Host countries strip */}
          <div className="animate-fade-up" style={{ animationDelay: "0.25s" }}>
            <div className="host-strip">
              <span className="text-sm font-semibold text-gray-300">USA</span>
              <div className="host-sep" />
              <span className="text-sm font-semibold text-gray-300">
                Canada
              </span>
              <div className="host-sep" />
              <span className="text-sm font-semibold text-gray-300">
                Mexico
              </span>
            </div>
          </div>

          <p
            className="text-sm text-gray-500 mt-3 mb-10 animate-fade-up"
            style={{ animationDelay: "0.3s" }}
          >
            সব সময়{" "}
            <span style={{ color: "#00D84C" }}>
              Bangladesh Standard Time (UTC+6)
            </span>{" "}
            অনুযায়ী
          </p>

          {/* Search */}
          <form
            onSubmit={handleSearch}
            className="max-w-xl mx-auto relative animate-fade-up"
            style={{ animationDelay: "0.35s" }}
          >
            <div className="search-wrapper">
              <Search
                size={18}
                className="search-icon"
                style={{ color: "#00D84C" }}
              />
              <input
                type="text"
                className="field-input search-input"
                placeholder="দল খুঁজুন (যেমন Brazil, Germany…)"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <button type="submit" className="btn-gold search-btn">
                খুঁজুন
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* ─── STATS ─────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-4 pb-14 animate-section">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            {
              icon: CalendarDays,
              label: "Total Matches",
              value: fixtures.length,
              color: "#00D84C",
            },
            {
              icon: Users,
              label: "Participating Teams",
              value: TEAM_COUNT,
              color: "#39FF8A",
            },
            {
              icon: Trophy,
              label: "Groups",
              value: GROUPS.length,
              color: "#00A83A",
            },
            {
              icon: Globe,
              label: "Host Countries",
              value: 3,
              color: "#A0FFD0",
            },
          ].map(({ icon: Icon, label, value, color }) => (
            <div key={label} className="stat-card px-5 py-6 text-center">
              <div className="stat-icon-wrap" style={{ "--stat-color": color }}>
                <Icon size={20} style={{ color }} />
              </div>
              <div className="text-3xl md:text-4xl font-black text-white mb-1">
                <AnimCounter value={value} />
              </div>
              <div className="text-xs text-gray-400 font-semibold tracking-wide uppercase">
                {label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── NEXT MATCH TICKER ─────────────────────────── */}
      <section className="max-w-6xl mx-auto px-4 pb-6 animate-section">
        <NextMatchTicker />
      </section>

      {/* ─── TODAY'S MATCHES ───────────────────────────── */}
      <TodaySection navigate={navigate} />

      {/* ─── QUICK NAV ─────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-4 pb-16 animate-section">
        <div className="flex items-center gap-4 mb-6">
          <h3 className="section-title">
            <Flame size={17} style={{ color: "#00D84C" }} /> Browse Fixtures
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
              iconBg: "rgba(0,168,58,0.15)",
              iconBorder: "rgba(0,216,76,0.3)",
              iconColor: "#00D84C",
              badge: "48 Teams",
            },
            {
              path: "/by-date",
              icon: CalendarDays,
              title: "Fixtures by Date",
              desc: "Browse all matches day-by-day — Group Stage through the Final",
              iconBg: "rgba(0,100,40,0.15)",
              iconBorder: "rgba(0,216,76,0.25)",
              iconColor: "#39FF8A",
              badge: "Jun–Jul",
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
                <div className="flex items-center gap-2.5 mb-1">
                  <span className="text-xl text-white tracking-wide">
                    {item.title}
                  </span>
                  <span
                    className="text-xs font-bold px-2 py-0.5 rounded-full"
                    style={{
                      background: "rgba(0,216,76,0.1)",
                      color: "#00D84C",
                      border: "1px solid rgba(0,216,76,0.2)",
                    }}
                  >
                    {item.badge}
                  </span>
                </div>
                <div className="text-sm text-gray-400">{item.desc}</div>
              </div>
              <ChevronRight
                size={20}
                className="flex-shrink-0 text-gray-600 nav-arrow"
              />
            </button>
          ))}
        </div>
      </section>

      {/* ─── GROUPS ────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-4 pb-16 animate-section">
        <div className="flex items-center gap-4 mb-6">
          <h3 className="section-title">
            <Star size={16} style={{ color: "#00D84C" }} /> Tournament Groups
          </h3>
          <div className="section-line" />
        </div>
        <GroupsSection navigate={navigate} />
        <p className="mt-5 text-sm text-gray-600 font-medium">
          12 groups · 4 teams per group · 72 group stage matches total
        </p>
      </section>

      {/* ─── HOST STADIUMS ─────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-4 pb-24 animate-section">
        <div className="flex items-center gap-4 mb-6">
          <h3 className="section-title">
            <MapPin size={16} style={{ color: "#00D84C" }} /> Host Stadiums
          </h3>
          <div className="section-line" />
        </div>

        {/* Country sections */}
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
            <div className="flex items-center gap-2 mb-3">
              <span className="text-lg">{section.flag}</span>
              <span className="text-base tracking-wider text-gray-300">
                {section.country}
              </span>
              <div
                className="flex-1 h-px"
                style={{ background: "rgba(0,216,76,0.1)" }}
              />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
              {section.venues.map((v, i) => (
                <div
                  key={v.name}
                  className="venue-card card-stagger"
                  style={{
                    animationDelay: `${(si * section.venues.length + i) * 35}ms`,
                  }}
                >
                  <div className="font-semibold text-white text-xs leading-snug">
                    {v.name}
                  </div>
                  <div className="text-gray-500 text-xs mt-0.5">{v.city}</div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}
