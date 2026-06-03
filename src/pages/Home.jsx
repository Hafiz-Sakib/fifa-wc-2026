import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Trophy, Users, CalendarDays, Globe, Search, ChevronRight, Zap,
} from "lucide-react";
import fixtures from "../data/fixtures.json";
import { getAllTeams } from "../utils/countryUtils";
import FlagIcon from "../components/FlagIcon";

const GROUP_STAGE = fixtures.filter(
  (f) => !["Round of 32","Round of 16","Quarter-Final","Semi-Final","Third Place","Final"].includes(f.group),
);

const TEAM_COUNT = getAllTeams().length;
const GROUPS = [...new Set(GROUP_STAGE.map((f) => f.group))].sort();

// Build group → teams map
const GROUP_TEAMS = {};
GROUP_STAGE.forEach((f) => {
  if (!GROUP_TEAMS[f.group]) GROUP_TEAMS[f.group] = new Set();
  if (f.team1 && f.team1 !== "TBD") GROUP_TEAMS[f.group].add(f.team1);
  if (f.team2 && f.team2 !== "TBD") GROUP_TEAMS[f.group].add(f.team2);
});

/* ── Groups Section ─────────────────────────────────────── */
function GroupsSection({ navigate }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
      {GROUPS.map((g) => {
        const teams = Array.from(GROUP_TEAMS[g] || []).sort();
        return (
          <div
            key={g}
            className="rounded-xl overflow-hidden"
            style={{
              background: "rgba(10,23,16,0.9)",
              border: "1px solid rgba(0,200,83,0.22)",
            }}
          >
            {/* Group header */}
            <div
              className="px-4 py-2.5 text-sm font-bold"
              style={{
                color: "#00E676",
                borderBottom: "1px solid rgba(0,200,83,0.15)",
                background: "rgba(0,200,83,0.06)",
              }}
            >
              Group {g}
            </div>
            {/* Teams */}
            <div className="px-2 py-1.5">
              {teams.map((team) => (
                <button
                  key={team}
                  type="button"
                  onClick={() => navigate("/by-team", { state: { selectedTeam: team } })}
                  className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs text-left transition-colors"
                  style={{ color: "#cbd5e1" }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(0,200,83,0.08)")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                >
                  <FlagIcon teamName={team} size={18} />
                  <span className="font-medium truncate">{team}</span>
                </button>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ── Home Page ──────────────────────────────────────────── */
export default function Home() {
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim()) {
      navigate("/by-team", { state: { searchQuery: search.trim() } });
    }
  };

  return (
    <div className="hero-bg pitch-lines min-h-screen">
      {/* ── HERO ── */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div
            className="absolute rounded-full blur-3xl opacity-20"
            style={{
              width: 600, height: 600, top: -200, left: -100,
              background: "radial-gradient(circle, rgba(0,200,83,0.5), transparent)",
            }}
          />
          <div
            className="absolute rounded-full blur-3xl opacity-10"
            style={{
              width: 400, height: 400, bottom: 0, right: -100,
              background: "radial-gradient(circle, rgba(0,126,51,0.4), transparent)",
            }}
          />
        </div>

        <div className="relative max-w-6xl mx-auto px-4 pt-16 pb-14 text-center">
          {/* Badge */}
          <div
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-6 text-xs font-semibold tracking-widest uppercase"
            style={{
              background: "rgba(0,200,83,0.08)",
              border: "1px solid rgba(0,200,83,0.28)",
              color: "#00C853",
            }}
          >
            <Zap size={12} /> Official Tournament Fixtures
          </div>

          <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-2">
            <span className="gold-text">FIFA World Cup</span>
          </h1>
          <h2
            className="text-5xl md:text-7xl font-bold text-white mb-3"
            style={{ letterSpacing: "-1px" }}
          >
            2026
          </h2>
          <p className="text-gray-400 text-base md:text-lg mb-2">
            USA · Canada · Mexico
          </p>
          <p className="text-sm text-gray-500 mb-10">
            সব সময়{" "}
            <span style={{ color: "#00C853" }}>
              Bangladesh Standard Time (BST / UTC+6)
            </span>{" "}
            অনুযায়ী
          </p>

          {/* Search */}
          <form onSubmit={handleSearch} className="max-w-xl mx-auto relative">
            <div className="relative">
              <Search
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none"
                style={{ color: "#00C853" }}
              />
              <input
                type="text"
                className="field-input w-full pl-12 pr-32 py-4 text-sm rounded-2xl"
                placeholder="দল খুঁজুন (যেমন Brazil, Germany…)"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <button
                type="submit"
                className="btn-gold absolute right-2 top-1/2 -translate-y-1/2 px-5 py-2 text-sm rounded-xl"
              >
                খুঁজুন
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* ── STATS ── */}
      <section className="max-w-6xl mx-auto px-4 pb-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: CalendarDays, label: "Total Matches",       value: fixtures.length, color: "#00E676" },
            { icon: Users,        label: "Participating Teams", value: TEAM_COUNT,       color: "#69F0AE" },
            { icon: Trophy,       label: "Groups",              value: GROUPS.length,   color: "#00C853" },
            { icon: Globe,        label: "Host Countries",      value: 3,               color: "#B9F6CA" },
          ].map(({ icon: Icon, label, value, color }) => (
            <div key={label} className="stat-card px-5 py-5 text-center">
              <Icon size={24} className="mx-auto mb-2" style={{ color }} />
              <div className="text-2xl md:text-3xl font-bold text-white mb-1">{value}</div>
              <div className="text-xs text-gray-400 font-medium">{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── QUICK NAV ── */}
      <section className="max-w-6xl mx-auto px-4 pb-14">
        <h3 className="text-lg font-bold text-white mb-4">Browse Fixtures</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <a
            href="/by-team"
            onClick={(e) => { e.preventDefault(); navigate("/by-team"); }}
            className="glass-card p-6 flex items-center gap-4 cursor-pointer no-underline group"
          >
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{
                background: "linear-gradient(135deg, rgba(0,200,83,0.25), rgba(0,200,83,0.1))",
                border: "1px solid rgba(0,200,83,0.3)",
              }}
            >
              <Users size={22} style={{ color: "#00E676" }} />
            </div>
            <div className="min-w-0">
              <div className="font-bold text-white text-base mb-0.5">Fixtures by Team</div>
              <div className="text-sm text-gray-400">
                Select any of the {TEAM_COUNT} teams to view their full schedule
              </div>
            </div>
            <ChevronRight size={18} className="flex-shrink-0 text-gray-500 group-hover:text-green-400 transition-colors ml-auto" />
          </a>

          <a
            href="/by-date"
            onClick={(e) => { e.preventDefault(); navigate("/by-date"); }}
            className="glass-card p-6 flex items-center gap-4 cursor-pointer no-underline group"
          >
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{
                background: "linear-gradient(135deg, rgba(0,126,51,0.25), rgba(0,126,51,0.1))",
                border: "1px solid rgba(0,126,51,0.4)",
              }}
            >
              <CalendarDays size={22} style={{ color: "#69F0AE" }} />
            </div>
            <div className="min-w-0">
              <div className="font-bold text-white text-base mb-0.5">Fixtures by Date</div>
              <div className="text-sm text-gray-400">
                Browse all matches by date — from June 11 to July 19, 2026
              </div>
            </div>
            <ChevronRight size={18} className="flex-shrink-0 text-gray-500 group-hover:text-green-400 transition-colors ml-auto" />
          </a>
        </div>
      </section>

      {/* ── GROUPS ── */}
      <section className="max-w-6xl mx-auto px-4 pb-16">
        <h3 className="text-lg font-bold text-white mb-4">Tournament Groups</h3>
        <GroupsSection navigate={navigate} />
        <p className="mt-4 text-sm text-gray-500">
          12 groups · 4 teams per group · 48 group stage matches total
        </p>
      </section>

      {/* ── HOST VENUES ── */}
      <section className="max-w-6xl mx-auto px-4 pb-16">
        <h3 className="text-lg font-bold text-white mb-4">Host Stadiums</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {[
            { name: "MetLife Stadium",        city: "New York/NJ",  country: "USA"    },
            { name: "SoFi Stadium",           city: "Los Angeles",  country: "USA"    },
            { name: "AT&T Stadium",           city: "Dallas",       country: "USA"    },
            { name: "Hard Rock Stadium",      city: "Miami",        country: "USA"    },
            { name: "Levi's Stadium",         city: "San Francisco",country: "USA"    },
            { name: "Mercedes-Benz Stadium",  city: "Atlanta",      country: "USA"    },
            { name: "Gillette Stadium",       city: "Boston",       country: "USA"    },
            { name: "Arrowhead Stadium",      city: "Kansas City",  country: "USA"    },
            { name: "Lincoln Financial Field",city: "Philadelphia", country: "USA"    },
            { name: "Estadio Azteca",         city: "Mexico City",  country: "Mexico" },
            { name: "Estadio BBVA",           city: "Monterrey",    country: "Mexico" },
            { name: "Estadio Akron",          city: "Guadalajara",  country: "Mexico" },
            { name: "BMO Field",              city: "Toronto",      country: "Canada" },
            { name: "BC Place",               city: "Vancouver",    country: "Canada" },
            { name: "Stade Olympique",        city: "Montreal",     country: "Canada" },
          ].map((v) => (
            <div
              key={v.name}
              className="px-3 py-2.5 rounded-xl text-xs"
              style={{
                background: "rgba(10,23,16,0.8)",
                border: "1px solid rgba(0,200,83,0.12)",
              }}
            >
              <div className="font-semibold text-white text-xs leading-snug">{v.name}</div>
              <div className="text-gray-500 mt-0.5">{v.city} · {v.country}</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
