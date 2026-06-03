import React, { useState, useMemo } from "react";
import {
  Shirt,
  User,
  Building2,
  Ruler,
  ArrowLeft,
  Search,
  X,
  Cake,
  Hash,
  MapPin,
  Flag,
  ChevronDown,
  ChevronUp,
  Star,
} from "lucide-react";
import squadsData from "../data/fifa_wc2026_squads.json";
import FlagIcon from "../components/FlagIcon";
import { COUNTRY_CODES } from "../utils/countryUtils";

/* ── Design tokens ── */
const POSITION_COLORS = {
  GK: {
    bg: "rgba(234,179,8,0.14)",
    border: "rgba(234,179,8,0.38)",
    text: "#EAB308",
    glow: "rgba(234,179,8,0.25)",
    label: "Goalkeeper",
    gradient:
      "linear-gradient(135deg, rgba(234,179,8,0.18) 0%, rgba(234,179,8,0.04) 100%)",
  },
  DF: {
    bg: "rgba(59,130,246,0.14)",
    border: "rgba(59,130,246,0.38)",
    text: "#60A5FA",
    glow: "rgba(59,130,246,0.25)",
    label: "Defender",
    gradient:
      "linear-gradient(135deg, rgba(59,130,246,0.18) 0%, rgba(59,130,246,0.04) 100%)",
  },
  MF: {
    bg: "rgba(22,163,74,0.14)",
    border: "rgba(22,163,74,0.38)",
    text: "#22C55E",
    glow: "rgba(22,163,74,0.25)",
    label: "Midfielder",
    gradient:
      "linear-gradient(135deg, rgba(22,163,74,0.18) 0%, rgba(22,163,74,0.04) 100%)",
  },
  FW: {
    bg: "rgba(239,68,68,0.14)",
    border: "rgba(239,68,68,0.38)",
    text: "#F87171",
    glow: "rgba(239,68,68,0.25)",
    label: "Forward",
    gradient:
      "linear-gradient(135deg, rgba(239,68,68,0.18) 0%, rgba(239,68,68,0.04) 100%)",
  },
};

const POS_ORDER = { GK: 0, DF: 1, MF: 2, FW: 3 };

const GROUP_MAP = {
  Mexico: "A",
  "South Africa": "A",
  "South Korea": "A",
  Czechia: "A",
  Canada: "B",
  "Bosnia-Herzegovina": "B",
  Qatar: "B",
  Switzerland: "B",
  Brazil: "C",
  Morocco: "C",
  Haiti: "C",
  Scotland: "C",
  USA: "D",
  Paraguay: "D",
  Australia: "D",
  Turkey: "D",
  Germany: "E",
  Curacao: "E",
  "Ivory Coast": "E",
  Ecuador: "E",
  Netherlands: "F",
  Japan: "F",
  Sweden: "F",
  Tunisia: "F",
  Belgium: "G",
  Egypt: "G",
  Iran: "G",
  "New Zealand": "G",
  Spain: "H",
  "Cape Verde": "H",
  "Saudi Arabia": "H",
  Uruguay: "H",
  France: "I",
  Senegal: "I",
  Iraq: "I",
  Norway: "I",
  Argentina: "J",
  Algeria: "J",
  Austria: "J",
  Jordan: "J",
  Portugal: "K",
  Congo: "K",
  Uzbekistan: "K",
  Colombia: "K",
  England: "L",
  Croatia: "L",
  Ghana: "L",
  Panama: "L",
};

const GROUP_COLORS = {
  A: "#22C55E",
  B: "#4ADE80",
  C: "#2DD4BF",
  D: "#22D3EE",
  E: "#60A5FA",
  F: "#818CF8",
  G: "#A78BFA",
  H: "#C084FC",
  I: "#F472B6",
  J: "#FB923C",
  K: "#FBBF24",
  L: "#A3E635",
};

const ALL_TEAMS = Object.keys(COUNTRY_CODES)
  .filter(
    (t) =>
      t !== "TBD" &&
      !t.startsWith("Winner") &&
      !t.startsWith("Loser") &&
      !t.startsWith("1") &&
      !t.startsWith("2") &&
      !t.startsWith("3rd"),
  )
  .sort((a, b) => {
    const ga = GROUP_MAP[a] || "Z",
      gb = GROUP_MAP[b] || "Z";
    return ga === gb ? a.localeCompare(b) : ga.localeCompare(gb);
  });

const SQUAD_MAP = Object.fromEntries(squadsData.teams.map((t) => [t.team, t]));

function calcAge(dob) {
  if (!dob || dob.startsWith("1000")) return null;
  const b = new Date(dob),
    t = new Date();
  let a = t.getFullYear() - b.getFullYear();
  const m = t.getMonth() - b.getMonth();
  if (m < 0 || (m === 0 && t.getDate() < b.getDate())) a--;
  return a;
}

function formatDOB(dob) {
  if (!dob || dob.startsWith("1000")) return null;
  const d = new Date(dob);
  return d.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

/* ── Stat Pill ── */
function StatPill({ icon: Icon, label, value, color }) {
  if (!value && value !== 0) return null;
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 5,
        background: "rgba(255,255,255,0.04)",
        border: "1px solid rgba(255,255,255,0.07)",
        borderRadius: 8,
        padding: "5px 9px",
      }}
    >
      <Icon size={11} style={{ color: color || "#64748B", flexShrink: 0 }} />
      <div
        style={{ display: "flex", flexDirection: "column", lineHeight: 1.2 }}
      >
        <span
          style={{
            fontSize: 9,
            color: "#475569",
            letterSpacing: "0.5px",
            textTransform: "uppercase",
          }}
        >
          {label}
        </span>
        <span style={{ fontSize: 12, color: "#CBD5E1", fontWeight: 600 }}>
          {value}
        </span>
      </div>
    </div>
  );
}

/* ── Player Card ── */
function PlayerCard({ player, index }) {
  const [imgErr, setImgErr] = useState(false);
  const [flipped, setFlipped] = useState(false);
  const pos = POSITION_COLORS[player.pos] || POSITION_COLORS.MF;
  const age = calcAge(player.dob);
  const dob = formatDOB(player.dob);

  // Extract club country from parentheses e.g. "FC Barcelona (ESP)"
  const clubMatch = player.club
    ? player.club.match(/^(.+?)\s*\(([A-Z]{2,3})\)$/)
    : null;
  const clubName = clubMatch ? clubMatch[1] : player.club;
  const clubCountry = clubMatch ? clubMatch[2] : null;

  return (
    <div
      onClick={() => setFlipped((f) => !f)}
      style={{
        perspective: "1000px",
        cursor: "pointer",
        animation: `cardSlideIn 0.4s ease both`,
        animationDelay: `${(index % 12) * 45}ms`,
      }}
    >
      <style>{`
        @keyframes cardSlideIn {
          from { opacity: 0; transform: translateY(18px) scale(0.96); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes shimmer {
          0%   { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        .player-card-inner {
          position: relative;
          width: 100%;
          height: 210px;
          transform-style: preserve-3d;
          transition: transform 0.55s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .player-card-inner.flipped {
          transform: rotateY(180deg);
        }
        .card-face {
          position: absolute;
          inset: 0;
          backface-visibility: hidden;
          -webkit-backface-visibility: hidden;
          border-radius: 14px;
          overflow: hidden;
        }
        .card-back {
          transform: rotateY(180deg);
        }
      `}</style>

      <div className={`player-card-inner${flipped ? " flipped" : ""}`}>
        {/* FRONT */}
        <div
          className="card-face"
          style={{
            background: pos.gradient,
            border: `1px solid ${pos.border}`,
            boxShadow: flipped
              ? "none"
              : `0 4px 20px rgba(0,0,0,0.3), 0 0 0 0 ${pos.glow}`,
            padding: "14px",
            display: "flex",
            flexDirection: "column",
            gap: 10,
          }}
        >
          {/* Top: avatar + name */}
          <div style={{ display: "flex", alignItems: "flex-start", gap: 11 }}>
            <div style={{ position: "relative", flexShrink: 0 }}>
              {!imgErr ? (
                <img
                  src={player.image}
                  alt={player.name}
                  onError={() => setImgErr(true)}
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: "50%",
                    objectFit: "cover",
                    border: `2.5px solid ${pos.border}`,
                    boxShadow: `0 0 12px ${pos.glow}`,
                  }}
                />
              ) : (
                <div
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: "50%",
                    background: pos.bg,
                    border: `2.5px solid ${pos.border}`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: `0 0 12px ${pos.glow}`,
                  }}
                >
                  <User size={22} style={{ color: pos.text }} />
                </div>
              )}
              {/* Jersey number badge */}
              <div
                style={{
                  position: "absolute",
                  bottom: -4,
                  right: -5,
                  background: pos.bg,
                  border: `1.5px solid ${pos.border}`,
                  borderRadius: 7,
                  padding: "1px 6px",
                  fontSize: 11,
                  fontWeight: 800,
                  color: pos.text,
                  lineHeight: 1.4,
                  boxShadow: `0 2px 6px rgba(0,0,0,0.4)`,
                }}
              >
                #{player.number}
              </div>
            </div>

            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  fontFamily: "'Barlow Condensed', sans-serif",
                  fontSize: "1rem",
                  fontWeight: 800,
                  color: "#fff",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  letterSpacing: "0.02em",
                }}
                title={player.name}
              >
                {player.name}
              </div>
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  marginTop: 5,
                  padding: "2px 9px",
                  borderRadius: 100,
                  background: pos.bg,
                  border: `1px solid ${pos.border}`,
                  fontSize: 10,
                  fontWeight: 700,
                  color: pos.text,
                  letterSpacing: "0.5px",
                  textTransform: "uppercase",
                }}
              >
                {pos.label}
              </div>
            </div>
          </div>

          {/* Stats grid */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 5,
              paddingTop: 8,
              borderTop: "1px solid rgba(255,255,255,0.07)",
            }}
          >
            {age !== null && (
              <StatPill icon={User} label="Age" value={age} color={pos.text} />
            )}
            {player.height_cm && (
              <StatPill
                icon={Ruler}
                label="Height"
                value={`${player.height_cm} cm`}
                color={pos.text}
              />
            )}
          </div>

          {/* Club */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              background: "rgba(0,0,0,0.2)",
              borderRadius: 8,
              padding: "6px 9px",
            }}
          >
            <Building2 size={11} style={{ color: "#64748B", flexShrink: 0 }} />
            <span
              style={{
                fontSize: 11,
                color: "#94A3B8",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                flex: 1,
              }}
              title={player.club}
            >
              {clubName}
              {clubCountry && (
                <span style={{ color: "#475569", marginLeft: 4 }}>
                  · {clubCountry}
                </span>
              )}
            </span>
          </div>

          {/* Flip hint */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 4,
              fontSize: 9,
              color: "#334155",
              letterSpacing: "0.5px",
            }}
          >
            <span>TAP FOR DETAILS</span>
          </div>
        </div>

        {/* BACK */}
        <div
          className="card-face card-back"
          style={{
            background: "rgba(7,24,44,0.97)",
            border: `1px solid ${pos.border}`,
            padding: "14px",
            display: "flex",
            flexDirection: "column",
            gap: 8,
          }}
        >
          {/* Header */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              marginBottom: 2,
            }}
          >
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: "50%",
                background: pos.bg,
                border: `2px solid ${pos.border}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <span style={{ fontSize: 13, fontWeight: 800, color: pos.text }}>
                {player.number}
              </span>
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  fontFamily: "'Barlow Condensed', sans-serif",
                  fontSize: "0.9rem",
                  fontWeight: 800,
                  color: "#fff",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {player.name}
              </div>
              <div
                style={{
                  fontSize: 10,
                  color: pos.text,
                  fontWeight: 600,
                  letterSpacing: "0.5px",
                }}
              >
                {pos.label}
              </div>
            </div>
          </div>

          <div
            style={{
              borderTop: `1px solid ${pos.border}`,
              paddingTop: 8,
              display: "flex",
              flexDirection: "column",
              gap: 6,
            }}
          >
            {/* DOB */}
            {dob && (
              <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                <Cake size={12} style={{ color: pos.text, flexShrink: 0 }} />
                <span style={{ fontSize: 11, color: "#94A3B8" }}>Born:</span>
                <span
                  style={{
                    fontSize: 11,
                    color: "#fff",
                    fontWeight: 600,
                    marginLeft: "auto",
                  }}
                >
                  {dob}
                </span>
              </div>
            )}
            {/* Age */}
            {age !== null && (
              <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                <User size={12} style={{ color: pos.text, flexShrink: 0 }} />
                <span style={{ fontSize: 11, color: "#94A3B8" }}>Age:</span>
                <span
                  style={{
                    fontSize: 11,
                    color: "#fff",
                    fontWeight: 600,
                    marginLeft: "auto",
                  }}
                >
                  {age} years
                </span>
              </div>
            )}
            {/* Height */}
            {player.height_cm && (
              <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                <Ruler size={12} style={{ color: pos.text, flexShrink: 0 }} />
                <span style={{ fontSize: 11, color: "#94A3B8" }}>Height:</span>
                <span
                  style={{
                    fontSize: 11,
                    color: "#fff",
                    fontWeight: 600,
                    marginLeft: "auto",
                  }}
                >
                  {player.height_cm} cm
                </span>
              </div>
            )}
            {/* Club */}
            {player.club && (
              <div
                style={{ display: "flex", alignItems: "flex-start", gap: 7 }}
              >
                <Building2
                  size={12}
                  style={{ color: pos.text, flexShrink: 0, marginTop: 1 }}
                />
                <span style={{ fontSize: 11, color: "#94A3B8", flexShrink: 0 }}>
                  Club:
                </span>
                <span
                  style={{
                    fontSize: 11,
                    color: "#fff",
                    fontWeight: 600,
                    textAlign: "right",
                    marginLeft: "auto",
                    wordBreak: "break-word",
                    maxWidth: "65%",
                  }}
                >
                  {clubName}
                  {clubCountry && (
                    <span
                      style={{
                        color: pos.text,
                        display: "block",
                        fontSize: 10,
                        fontWeight: 500,
                      }}
                    >
                      {clubCountry}
                    </span>
                  )}
                </span>
              </div>
            )}
            {/* Jersey */}
            <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
              <Hash size={12} style={{ color: pos.text, flexShrink: 0 }} />
              <span style={{ fontSize: 11, color: "#94A3B8" }}>Jersey:</span>
              <span
                style={{
                  fontSize: 11,
                  color: "#fff",
                  fontWeight: 600,
                  marginLeft: "auto",
                }}
              >
                #{player.number}
              </span>
            </div>
          </div>

          {/* Position indicator bar */}
          <div
            style={{
              marginTop: "auto",
              height: 3,
              borderRadius: 2,
              background: `linear-gradient(90deg, ${pos.text}88, ${pos.text}22)`,
            }}
          />
        </div>
      </div>
    </div>
  );
}

/* ── Position Section ── */
function PositionSection({ pos, players }) {
  const c = POSITION_COLORS[pos];
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div style={{ marginBottom: 32 }}>
      <button
        onClick={() => setCollapsed((v) => !v)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          marginBottom: collapsed ? 0 : 16,
          background: "none",
          border: "none",
          cursor: "pointer",
          padding: 0,
          width: "100%",
        }}
      >
        <div
          style={{
            width: 8,
            height: 8,
            borderRadius: "50%",
            background: c.text,
            boxShadow: `0 0 10px ${c.text}`,
            flexShrink: 0,
          }}
        />
        <span
          style={{
            fontFamily: "'Barlow Condensed', sans-serif",
            fontSize: "0.85rem",
            fontWeight: 800,
            letterSpacing: "3px",
            textTransform: "uppercase",
            color: c.text,
          }}
        >
          {c.label}s
        </span>
        <span
          style={{
            fontSize: 11,
            color: "#475569",
            padding: "1px 8px",
            borderRadius: 100,
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          {players.length}
        </span>
        <div style={{ marginLeft: "auto", color: "#475569" }}>
          {collapsed ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
        </div>
      </button>

      {!collapsed && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
            gap: 12,
          }}
        >
          {players.map((p, i) => (
            <PlayerCard key={p.number} player={p} index={i} />
          ))}
        </div>
      )}
    </div>
  );
}

/* ── Team Tile ── */
function TeamTile({ teamName, hasSquad, onSelect }) {
  const grp = GROUP_MAP[teamName] || "?";
  const grpColor = GROUP_COLORS[grp] || "#64748B";
  const [hov, setHov] = useState(false);

  return (
    <button
      onClick={() => onSelect(teamName)}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      title={
        hasSquad ? `View ${teamName} squad` : `${teamName} squad coming soon`
      }
      style={{
        background:
          hov && hasSquad ? "rgba(22,163,74,0.08)" : "rgba(7,36,58,0.75)",
        border:
          hov && hasSquad
            ? "1px solid rgba(22,163,74,0.35)"
            : "1px solid rgba(255,255,255,0.06)",
        borderRadius: 14,
        padding: "14px 12px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 9,
        cursor: hasSquad ? "pointer" : "default",
        transition: "all .2s",
        transform: hov && hasSquad ? "translateY(-3px)" : "translateY(0)",
        boxShadow: hov && hasSquad ? "0 10px 30px rgba(0,0,0,.35)" : "none",
        position: "relative",
        overflow: "hidden",
        opacity: hasSquad ? 1 : 0.6,
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 8,
          right: 8,
          fontSize: 9,
          fontWeight: 800,
          letterSpacing: 1,
          color: grpColor,
          opacity: 0.9,
          fontFamily: "'Barlow Condensed', sans-serif",
        }}
      >
        GRP {grp}
      </div>

      <div
        style={{
          width: 50,
          height: 50,
          borderRadius: "50%",
          overflow: "hidden",
          border: `2px solid ${hov && hasSquad ? "rgba(22,163,74,0.5)" : "rgba(255,255,255,0.1)"}`,
          flexShrink: 0,
          transition: "border-color .2s",
        }}
      >
        <FlagIcon teamName={teamName} size={50} />
      </div>

      <div
        style={{
          fontFamily: "'Barlow Condensed', sans-serif",
          fontSize: "0.85rem",
          fontWeight: 700,
          color: hov && hasSquad ? "#fff" : "#CBD5E1",
          textTransform: "uppercase",
          letterSpacing: "0.06em",
          textAlign: "center",
          lineHeight: 1.2,
          transition: "color .2s",
        }}
      >
        {teamName}
      </div>

      {hasSquad ? (
        <div
          style={{
            fontSize: 9,
            fontWeight: 600,
            letterSpacing: 0.5,
            color: "#22C55E",
            background: "rgba(22,163,74,0.1)",
            border: "1px solid rgba(22,163,74,0.25)",
            borderRadius: 100,
            padding: "2px 8px",
          }}
        >
          View Squad
        </div>
      ) : (
        <div
          style={{
            fontSize: 9,
            fontWeight: 600,
            letterSpacing: 0.5,
            color: "#475569",
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.06)",
            borderRadius: 100,
            padding: "2px 8px",
          }}
        >
          Coming Soon
        </div>
      )}
    </button>
  );
}

/* ── Squad Detail ── */
function SquadDetail({ teamData, onBack }) {
  const [posFilter, setPosFilter] = useState("ALL");
  const [search, setSearch] = useState("");

  const grouped = useMemo(() => {
    let players =
      posFilter === "ALL"
        ? teamData.players
        : teamData.players.filter((p) => p.pos === posFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      players = players.filter(
        (p) =>
          p.name.toLowerCase().includes(q) || p.club.toLowerCase().includes(q),
      );
    }
    return players.reduce((acc, p) => {
      acc[p.pos] = acc[p.pos] || [];
      acc[p.pos].push(p);
      return acc;
    }, {});
  }, [teamData, posFilter, search]);

  const sortedPos = Object.keys(grouped).sort(
    (a, b) => (POS_ORDER[a] ?? 99) - (POS_ORDER[b] ?? 99),
  );

  // Compute avg age
  const ages = teamData.players.map((p) => calcAge(p.dob)).filter(Boolean);
  const avgAge = ages.length
    ? (ages.reduce((a, b) => a + b, 0) / ages.length).toFixed(1)
    : null;

  // Unique clubs
  const uniqueClubs = new Set(teamData.players.map((p) => p.club)).size;

  return (
    <div className="fade-in">
      <style>{`
        @keyframes fadeSlideDown {
          from { opacity: 0; transform: translateY(-12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .squad-detail-header {
          animation: fadeSlideDown 0.4s ease both;
        }
      `}</style>

      {/* Back button */}
      <button
        onClick={onBack}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 8,
          background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: 10,
          padding: "8px 14px",
          color: "#94A3B8",
          cursor: "pointer",
          fontSize: 13,
          fontWeight: 500,
          marginBottom: 20,
          transition: "all .2s",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.color = "#fff";
          e.currentTarget.style.borderColor = "rgba(22,163,74,0.4)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.color = "#94A3B8";
          e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)";
        }}
      >
        <ArrowLeft size={15} /> All Teams
      </button>

      {/* Team header */}
      <div className="squad-detail-header" style={{ marginBottom: 24 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            marginBottom: 16,
          }}
        >
          <div
            style={{
              width: 70,
              height: 70,
              borderRadius: "50%",
              border: "2px solid rgba(22,163,74,0.45)",
              overflow: "hidden",
              flexShrink: 0,
              boxShadow: "0 0 20px rgba(22,163,74,0.2)",
            }}
          >
            <FlagIcon teamName={teamData.team} size={70} />
          </div>
          <div style={{ flex: 1 }}>
            <h2
              style={{
                fontFamily: "'Barlow Condensed', sans-serif",
                fontSize: "clamp(1.6rem,4vw,2.2rem)",
                fontWeight: 800,
                color: "#fff",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
              }}
            >
              {teamData.team}
            </h2>
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "5px 14px",
                marginTop: 5,
              }}
            >
              <span style={{ fontSize: 12, color: "#64748B" }}>
                <span style={{ color: "#22C55E", fontWeight: 700 }}>
                  {teamData.players.length}
                </span>{" "}
                Players
              </span>
              <span style={{ fontSize: 12, color: "#334155" }}>·</span>
              <span style={{ fontSize: 12, color: "#64748B" }}>
                Coach:{" "}
                <span style={{ color: "#94A3B8", fontWeight: 600 }}>
                  {teamData.head_coach.name}
                </span>
                {teamData.head_coach.nationality && (
                  <span style={{ color: "#475569" }}>
                    {" "}
                    ({teamData.head_coach.nationality})
                  </span>
                )}
              </span>
            </div>
          </div>
        </div>

        {/* Stats bar */}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 10,
            padding: "12px 16px",
            background: "rgba(7,36,58,0.6)",
            border: "1px solid rgba(255,255,255,0.06)",
            borderRadius: 12,
            marginBottom: 16,
          }}
        >
          {avgAge && (
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <Star size={12} style={{ color: "#F59E0B" }} />
              <span style={{ fontSize: 11, color: "#64748B" }}>Avg Age:</span>
              <span style={{ fontSize: 12, color: "#fff", fontWeight: 700 }}>
                {avgAge}
              </span>
            </div>
          )}
          <span style={{ color: "#1E293B", fontSize: 11 }}>·</span>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <Building2 size={12} style={{ color: "#60A5FA" }} />
            <span style={{ fontSize: 11, color: "#64748B" }}>Clubs:</span>
            <span style={{ fontSize: 12, color: "#fff", fontWeight: 700 }}>
              {uniqueClubs}
            </span>
          </div>
          <span style={{ color: "#1E293B", fontSize: 11 }}>·</span>
          {["GK", "DF", "MF", "FW"].map((pos) => {
            const count = teamData.players.filter((p) => p.pos === pos).length;
            const c = POSITION_COLORS[pos];
            return (
              <div
                key={pos}
                style={{ display: "flex", alignItems: "center", gap: 5 }}
              >
                <span style={{ fontSize: 10, color: c.text, fontWeight: 700 }}>
                  {pos}
                </span>
                <span style={{ fontSize: 12, color: "#fff", fontWeight: 700 }}>
                  {count}
                </span>
              </div>
            );
          })}
        </div>

        <div
          style={{
            fontSize: 11,
            color: "#475569",
            fontStyle: "italic",
            marginBottom: 6,
          }}
        >
          Click any card to flip and see full details
        </div>

        <hr
          style={{
            border: "none",
            borderTop: "1px solid rgba(244,197,66,0.18)",
          }}
        />
      </div>

      {/* Controls */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 10,
          marginBottom: 24,
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {["ALL", "GK", "DF", "MF", "FW"].map((f) => {
            const c = f === "ALL" ? null : POSITION_COLORS[f];
            const active = posFilter === f;
            const count =
              f === "ALL"
                ? teamData.players.length
                : teamData.players.filter((p) => p.pos === f).length;
            return (
              <button
                key={f}
                onClick={() => setPosFilter(f)}
                style={{
                  padding: "6px 14px",
                  borderRadius: 100,
                  cursor: "pointer",
                  border: active
                    ? `1px solid ${c ? c.border : "rgba(22,163,74,0.5)"}`
                    : "1px solid rgba(255,255,255,0.08)",
                  background: active
                    ? c
                      ? c.bg
                      : "rgba(22,163,74,0.12)"
                    : "rgba(255,255,255,0.03)",
                  color: active ? (c ? c.text : "#22C55E") : "#64748B",
                  fontSize: 11,
                  fontWeight: 700,
                  transition: "all .2s",
                  letterSpacing: "0.3px",
                }}
              >
                {f === "ALL" ? "All" : POSITION_COLORS[f].label + "s"}
                <span style={{ marginLeft: 5, fontSize: 10, opacity: 0.7 }}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 7,
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 10,
            padding: "7px 12px",
            minWidth: 180,
          }}
        >
          <Search size={13} style={{ color: "#64748B", flexShrink: 0 }} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search player or club..."
            style={{
              background: "none",
              border: "none",
              outline: "none",
              color: "#fff",
              fontSize: 12,
              width: "100%",
            }}
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "#64748B",
                padding: 0,
              }}
            >
              <X size={12} />
            </button>
          )}
        </div>
      </div>

      {sortedPos.length > 0 ? (
        sortedPos.map((pos) => (
          <PositionSection key={pos} pos={pos} players={grouped[pos]} />
        ))
      ) : (
        <div style={{ textAlign: "center", padding: 48, color: "#475569" }}>
          No players found.
        </div>
      )}
    </div>
  );
}

/* ── Main Page ── */
export default function Squads() {
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [groupFilter, setGroupFilter] = useState("ALL");
  const [search, setSearch] = useState("");

  const visibleTeams = useMemo(
    () =>
      ALL_TEAMS.filter((t) => {
        if (groupFilter !== "ALL" && GROUP_MAP[t] !== groupFilter) return false;
        if (search.trim() && !t.toLowerCase().includes(search.toLowerCase()))
          return false;
        return true;
      }),
    [groupFilter, search],
  );

  const teamData = useMemo(
    () => (selectedTeam ? SQUAD_MAP[selectedTeam] : null),
    [selectedTeam],
  );

  const handleSelect = (name) => {
    if (!SQUAD_MAP[name]) return;
    setSelectedTeam(name);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="page-bg" style={{ minHeight: "100vh" }}>
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-10">
        {/* Header */}
        <div style={{ marginBottom: 32 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              marginBottom: 8,
            }}
          >
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 12,
                background: "rgba(22,163,74,0.12)",
                border: "1px solid rgba(22,163,74,0.28)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Shirt size={20} style={{ color: "#22C55E" }} />
            </div>
            <h1
              style={{
                fontFamily: "'Barlow Condensed', sans-serif",
                fontSize: "clamp(2rem,5vw,3rem)",
                fontWeight: 800,
                color: "#fff",
                textTransform: "uppercase",
                letterSpacing: "0.04em",
              }}
            >
              {selectedTeam ? `${selectedTeam} Squad` : "Team Squads"}
            </h1>
          </div>
          <p className="text-sm pl-14" style={{ color: "#64748B" }}>
            {selectedTeam
              ? `FIFA World Cup 2026 — Full squad for ${selectedTeam}`
              : "FIFA World Cup 2026 — একটি দল বেছে নিন এবং তাদের পূর্ণ স্কোয়াড দেখুন"}
          </p>
        </div>

        {/* Squad detail */}
        {teamData && (
          <SquadDetail
            teamData={teamData}
            onBack={() => setSelectedTeam(null)}
          />
        )}

        {/* 48-team grid */}
        {!selectedTeam && (
          <div className="fade-in">
            {/* Filter bar */}
            <div
              style={{
                padding: "14px 16px",
                marginBottom: 20,
                background: "var(--card)",
                borderRadius: 16,
                border: "1px solid rgba(255,255,255,0.06)",
                display: "flex",
                flexWrap: "wrap",
                gap: 10,
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                {[
                  "ALL",
                  "A",
                  "B",
                  "C",
                  "D",
                  "E",
                  "F",
                  "G",
                  "H",
                  "I",
                  "J",
                  "K",
                  "L",
                ].map((g) => {
                  const active = groupFilter === g;
                  const gc = g !== "ALL" ? GROUP_COLORS[g] : "#22C55E";
                  return (
                    <button
                      key={g}
                      onClick={() => setGroupFilter(g)}
                      style={{
                        padding: "5px 11px",
                        borderRadius: 100,
                        cursor: "pointer",
                        border: active
                          ? `1px solid ${gc}55`
                          : "1px solid rgba(255,255,255,0.07)",
                        background: active
                          ? `${gc}18`
                          : "rgba(255,255,255,0.03)",
                        color: active ? gc : "#64748B",
                        fontSize: 11,
                        fontWeight: 700,
                        fontFamily: "'Barlow Condensed', sans-serif",
                        letterSpacing: 1,
                        transition: "all .18s",
                      }}
                    >
                      {g === "ALL" ? "ALL GROUPS" : `GRP ${g}`}
                    </button>
                  );
                })}
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 7,
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: 10,
                  padding: "7px 12px",
                  minWidth: 170,
                }}
              >
                <Search size={13} style={{ color: "#64748B", flexShrink: 0 }} />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search country..."
                  style={{
                    background: "none",
                    border: "none",
                    outline: "none",
                    color: "#fff",
                    fontSize: 12,
                    width: "100%",
                  }}
                />
                {search && (
                  <button
                    onClick={() => setSearch("")}
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      color: "#64748B",
                      padding: 0,
                    }}
                  >
                    <X size={12} />
                  </button>
                )}
              </div>
            </div>

            {/* Info row */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 16,
                marginBottom: 14,
              }}
            >
              <p style={{ fontSize: 12, color: "#475569" }}>
                Showing{" "}
                <span style={{ color: "#fff", fontWeight: 600 }}>
                  {visibleTeams.length}
                </span>{" "}
                teams
              </p>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <div
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    background: "#22C55E",
                  }}
                />
                <span style={{ fontSize: 11, color: "#475569" }}>
                  {Object.keys(SQUAD_MAP).length} squads available
                </span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <div
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    background: "#334155",
                  }}
                />
                <span style={{ fontSize: 11, color: "#475569" }}>
                  {48 - Object.keys(SQUAD_MAP).length} coming soon
                </span>
              </div>
            </div>

            {/* Grid */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(148px, 1fr))",
                gap: 12,
              }}
            >
              {visibleTeams.map((name) => (
                <TeamTile
                  key={name}
                  teamName={name}
                  hasSquad={!!SQUAD_MAP[name]}
                  onSelect={handleSelect}
                />
              ))}
            </div>

            {visibleTeams.length === 0 && (
              <div
                style={{ textAlign: "center", padding: 64, color: "#475569" }}
              >
                No teams found.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
