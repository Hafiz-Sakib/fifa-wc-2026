import React, { useState, useCallback, useRef } from "react";
import {
  Trophy,
  RotateCcw,
  Share2,
  ChevronRight,
  Zap,
  Star,
} from "lucide-react";
import { getCountryCode } from "../utils/countryUtils";

/* ─────────────────────────────────────────────
   FLAG HELPER
───────────────────────────────────────────── */
function getFlagUrl(team) {
  if (!team || team === "TBD") return null;
  const code = getCountryCode(team);
  if (!code) return null;
  if (code === "GB-ENG")
    return "https://purecatamphetamine.github.io/country-flag-icons/3x2/GB-ENG.svg";
  if (code === "GB-SCT")
    return "https://purecatamphetamine.github.io/country-flag-icons/3x2/GB-SCT.svg";
  return `https://flagcdn.com/w80/${code.toLowerCase()}.png`;
}

/* ─────────────────────────────────────────────
   INITIAL BRACKET DATA  (Round of 32 — 16 matches)
   Matches from the reference image
───────────────────────────────────────────── */
const INITIAL_R32 = [
  // Left side (matches 1-8)
  { id: "R32_1", t1: "Germany", t2: "Australia", seed1: "1E", seed2: "3D" },
  { id: "R32_2", t1: "France", t2: "Egypt", seed1: "1I", seed2: "3G" },
  { id: "R32_3", t1: "Denmark", t2: "Switzerland", seed1: "2A", seed2: "2B" },
  { id: "R32_4", t1: "Netherlands", t2: "Morocco", seed1: "1F", seed2: "2C" },
  { id: "R32_5", t1: "Colombia", t2: "Croatia", seed1: "2K", seed2: "2L" },
  { id: "R32_6", t1: "Spain", t2: "Austria", seed1: "1H", seed2: "2J" },
  { id: "R32_7", t1: "USA", t2: "Canada", seed1: "1D", seed2: "3B" },
  { id: "R32_8", t1: "Belgium", t2: "South Korea", seed1: "1G", seed2: "3A" },
  // Right side (matches 9-16)
  { id: "R32_9", t1: "Brazil", t2: "Japan", seed1: "1C", seed2: "2F" },
  { id: "R32_10", t1: "Ecuador", t2: "Senegal", seed1: "2E", seed2: "2I" },
  { id: "R32_11", t1: "Mexico", t2: "Ukraine", seed1: "1A", seed2: "3F" },
  { id: "R32_12", t1: "England", t2: "Norway", seed1: "1L", seed2: "3I" },
  { id: "R32_13", t1: "Argentina", t2: "Uruguay", seed1: "1J", seed2: "2H" },
  { id: "R32_14", t1: "Turkey", t2: "Iran", seed1: "2D", seed2: "2G" },
  { id: "R32_15", t1: "Italy", t2: "Algeria", seed1: "1B", seed2: "3J" },
  { id: "R32_16", t1: "Portugal", t2: "Panama", seed1: "1K", seed2: "3L" },
];

/* ─────────────────────────────────────────────
   BRACKET LOGIC
───────────────────────────────────────────── */
function buildInitialState() {
  // rounds: r32, r16, qf, sf, final, champion
  const r32 = INITIAL_R32.map((m) => ({ ...m, winner: null }));

  // R16: 8 matches, pairs from R32
  const r16 = [
    { id: "R16_1", t1: null, t2: null, winner: null, from: ["R32_1", "R32_2"] },
    { id: "R16_2", t1: null, t2: null, winner: null, from: ["R32_3", "R32_4"] },
    { id: "R16_3", t1: null, t2: null, winner: null, from: ["R32_5", "R32_6"] },
    { id: "R16_4", t1: null, t2: null, winner: null, from: ["R32_7", "R32_8"] },
    {
      id: "R16_5",
      t1: null,
      t2: null,
      winner: null,
      from: ["R32_9", "R32_10"],
    },
    {
      id: "R16_6",
      t1: null,
      t2: null,
      winner: null,
      from: ["R32_11", "R32_12"],
    },
    {
      id: "R16_7",
      t1: null,
      t2: null,
      winner: null,
      from: ["R32_13", "R32_14"],
    },
    {
      id: "R16_8",
      t1: null,
      t2: null,
      winner: null,
      from: ["R32_15", "R32_16"],
    },
  ];

  // QF: 4 matches
  const qf = [
    { id: "QF_1", t1: null, t2: null, winner: null, from: ["R16_1", "R16_2"] },
    { id: "QF_2", t1: null, t2: null, winner: null, from: ["R16_3", "R16_4"] },
    { id: "QF_3", t1: null, t2: null, winner: null, from: ["R16_5", "R16_6"] },
    { id: "QF_4", t1: null, t2: null, winner: null, from: ["R16_7", "R16_8"] },
  ];

  // SF: 2 matches
  const sf = [
    { id: "SF_1", t1: null, t2: null, winner: null, from: ["QF_1", "QF_2"] },
    { id: "SF_2", t1: null, t2: null, winner: null, from: ["QF_3", "QF_4"] },
  ];

  // Final
  const final_ = [
    { id: "FINAL", t1: null, t2: null, winner: null, from: ["SF_1", "SF_2"] },
  ];

  return { r32, r16, qf, sf, final: final_, champion: null };
}

function getMatchById(state, id) {
  for (const round of [state.r32, state.r16, state.qf, state.sf, state.final]) {
    const m = round.find((x) => x.id === id);
    if (m) return m;
  }
  return null;
}

function propagateWinner(state, matchId, winner) {
  // Deep clone
  const ns = {
    r32: state.r32.map((m) => ({ ...m })),
    r16: state.r16.map((m) => ({ ...m })),
    qf: state.qf.map((m) => ({ ...m })),
    sf: state.sf.map((m) => ({ ...m })),
    final: state.final.map((m) => ({ ...m })),
    champion: state.champion,
  };

  // Set winner in current match
  const allMatches = [...ns.r32, ...ns.r16, ...ns.qf, ...ns.sf, ...ns.final];
  const match = allMatches.find((m) => m.id === matchId);
  if (!match) return ns;

  const prevWinner = match.winner;
  match.winner = winner;

  // Find next match that references this match
  const nextRounds = [ns.r16, ns.qf, ns.sf, ns.final];
  for (const round of nextRounds) {
    for (const nm of round) {
      if (!nm.from) continue;
      const idx = nm.from.indexOf(matchId);
      if (idx === -1) continue;

      // Slot: idx 0 → t1, idx 1 → t2
      const slot = idx === 0 ? "t1" : "t2";

      // If old winner was set in this slot, cascade-clear further
      if (nm[slot] === prevWinner && prevWinner !== null) {
        // Clear this slot and cascade
        nm[slot] = winner;
        if (nm.winner === prevWinner) {
          ns = propagateWinner_mut(ns, nm.id, null);
        }
      } else if (nm[slot] === null || nm[slot] === undefined) {
        nm[slot] = winner;
      } else {
        // Overwrite if it was the old winner
        if (nm[slot] === prevWinner) nm[slot] = winner;
        else nm[slot] = winner; // still overwrite slot
      }
    }
  }

  // Handle champion
  if (matchId === "FINAL") {
    ns.champion = winner;
  }

  return ns;
}

// Mutable cascade clear used internally
function propagateWinner_mut(state, matchId, winner) {
  const allMatches = [
    ...state.r32,
    ...state.r16,
    ...state.qf,
    ...state.sf,
    ...state.final,
  ];
  const match = allMatches.find((m) => m.id === matchId);
  if (!match) return state;
  const prevWinner = match.winner;
  match.winner = winner;

  const nextRounds = [state.r16, state.qf, state.sf, state.final];
  for (const round of nextRounds) {
    for (const nm of round) {
      if (!nm.from) continue;
      const idx = nm.from.indexOf(matchId);
      if (idx === -1) continue;
      const slot = idx === 0 ? "t1" : "t2";
      if (nm[slot] === prevWinner) {
        nm[slot] = winner;
        if (nm.winner === prevWinner) {
          propagateWinner_mut(state, nm.id, null);
        }
      }
    }
  }
  if (matchId === "FINAL") state.champion = winner;
  return state;
}

/* ─────────────────────────────────────────────
   TEAM SLOT COMPONENT
───────────────────────────────────────────── */
function TeamSlot({ team, isWinner, onClick, isTBD, seed, size = "md" }) {
  const flagUrl = getFlagUrl(team);
  const sizeClasses = {
    sm: {
      wrap: "py-1 px-2 gap-1.5",
      flag: 18,
      text: "text-xs",
      seed: "text-[9px]",
    },
    md: {
      wrap: "py-1.5 px-2.5 gap-2",
      flag: 22,
      text: "text-xs",
      seed: "text-[10px]",
    },
    lg: {
      wrap: "py-2 px-3 gap-2.5",
      flag: 26,
      text: "text-sm",
      seed: "text-[10px]",
    },
    xl: {
      wrap: "py-2.5 px-3 gap-3",
      flag: 30,
      text: "text-sm font-semibold",
      seed: "text-xs",
    },
  }[size];

  return (
    <button
      onClick={onClick}
      disabled={!team || isTBD || !onClick}
      className={`
        w-full flex items-center ${sizeClasses.wrap} rounded-lg
        transition-all duration-200 group relative overflow-hidden
        ${
          isWinner
            ? "bg-gradient-to-r from-green-600/30 to-green-500/10 border border-green-500/50 shadow-[0_0_12px_rgba(34,197,94,0.2)]"
            : team && !isTBD
              ? "bg-white/5 border border-white/8 hover:bg-green-600/15 hover:border-green-500/40 cursor-pointer hover:shadow-[0_0_8px_rgba(34,197,94,0.15)]"
              : "bg-white/3 border border-white/5 cursor-default opacity-50"
        }
      `}
      title={team ? `Pick ${team}` : "TBD"}
    >
      {/* Winner glow effect */}
      {isWinner && (
        <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 to-transparent pointer-events-none" />
      )}

      {/* Flag */}
      <div
        className="flex-shrink-0 rounded overflow-hidden"
        style={{
          width: sizeClasses.flag,
          height: sizeClasses.flag * 0.67,
          minWidth: sizeClasses.flag,
        }}
      >
        {flagUrl ? (
          <img
            src={flagUrl}
            alt={team}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
            loading="lazy"
          />
        ) : (
          <div
            className="w-full h-full bg-slate-700 flex items-center justify-center"
            style={{ fontSize: sizeClasses.flag * 0.35 }}
          >
            <span className="text-slate-400 font-bold">
              {team ? team.slice(0, 2).toUpperCase() : "?"}
            </span>
          </div>
        )}
      </div>

      {/* Name */}
      <span
        className={`flex-1 text-left truncate ${sizeClasses.text} font-medium leading-tight
          ${isWinner ? "text-green-300" : team && !isTBD ? "text-slate-200 group-hover:text-white" : "text-slate-500"}`}
      >
        {team || "TBD"}
      </span>

      {/* Seed */}
      {seed && (
        <span
          className={`flex-shrink-0 ${sizeClasses.seed} text-slate-500 font-mono`}
        >
          {seed}
        </span>
      )}

      {/* Winner check */}
      {isWinner && (
        <div className="flex-shrink-0 w-4 h-4 rounded-full bg-green-500 flex items-center justify-center ml-1">
          <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
            <path
              d="M1.5 4L3 5.5L6.5 2"
              stroke="white"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      )}
    </button>
  );
}

/* ─────────────────────────────────────────────
   MATCH CARD
───────────────────────────────────────────── */
function MatchCard({ match, onPick, roundLabel, size = "md" }) {
  const { t1, t2, winner } = match;
  const canPick = t1 && t2 && t1 !== "TBD" && t2 !== "TBD";

  return (
    <div
      className={`
        relative rounded-xl overflow-hidden
        ${canPick ? "shadow-lg" : "opacity-70"}
        ${winner ? "shadow-[0_4px_20px_rgba(34,197,94,0.15)]" : ""}
        transition-all duration-300
      `}
      style={{
        background: "rgba(7, 36, 58, 0.9)",
        border: winner
          ? "1px solid rgba(34,197,94,0.35)"
          : "1px solid rgba(255,255,255,0.07)",
        minWidth: size === "xl" ? 160 : size === "lg" ? 140 : 120,
      }}
    >
      {/* Round label */}
      {roundLabel && (
        <div className="px-2 pt-1 pb-0.5">
          <span className="text-[9px] text-slate-500 uppercase tracking-widest font-semibold">
            {roundLabel}
          </span>
        </div>
      )}

      <div className="flex flex-col p-1 gap-0.5">
        <TeamSlot
          team={t1}
          isWinner={winner === t1}
          onClick={canPick ? () => onPick(match.id, t1) : null}
          isTBD={!t1}
          seed={match.seed1}
          size={size}
        />
        <div className="flex items-center gap-1 px-2">
          <div className="flex-1 h-px bg-white/5" />
          <span className="text-[9px] text-slate-600 font-bold tracking-widest">
            VS
          </span>
          <div className="flex-1 h-px bg-white/5" />
        </div>
        <TeamSlot
          team={t2}
          isWinner={winner === t2}
          onClick={canPick ? () => onPick(match.id, t2) : null}
          isTBD={!t2}
          seed={match.seed2}
          size={size}
        />
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   CONNECTOR LINES (SVG-based)
───────────────────────────────────────────── */
function ConnectorLine({ direction = "right" }) {
  return (
    <div
      className="flex items-center justify-center"
      style={{ width: 24, flexShrink: 0 }}
    >
      <div
        className="h-px"
        style={{
          width: "100%",
          background:
            "linear-gradient(90deg, rgba(34,197,94,0.4), rgba(34,197,94,0.1))",
        }}
      />
    </div>
  );
}

/* ─────────────────────────────────────────────
   CHAMPION TROPHY
───────────────────────────────────────────── */
function ChampionDisplay({ champion }) {
  const flagUrl = getFlagUrl(champion);
  return (
    <div className="flex flex-col items-center gap-3 px-4">
      {/* Trophy */}
      <div
        className="relative flex items-center justify-center w-16 h-16 rounded-2xl"
        style={{
          background:
            "linear-gradient(135deg, #92400e, #d97706, #fbbf24, #d97706)",
          boxShadow: champion
            ? "0 0 40px rgba(245,158,11,0.6), 0 0 80px rgba(245,158,11,0.3)"
            : "0 0 20px rgba(245,158,11,0.2)",
        }}
      >
        <Trophy size={32} color="#fff" strokeWidth={1.5} />
        {champion && (
          <div
            className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-green-500 flex items-center justify-center"
            style={{ animation: "pulse 2s infinite" }}
          >
            <Star size={10} color="#fff" fill="#fff" />
          </div>
        )}
      </div>

      {/* Champion card */}
      <div
        className="rounded-2xl overflow-hidden text-center"
        style={{
          background: champion
            ? "linear-gradient(135deg, rgba(245,158,11,0.15), rgba(34,197,94,0.1))"
            : "rgba(7,36,58,0.8)",
          border: champion
            ? "1px solid rgba(245,158,11,0.4)"
            : "1px dashed rgba(255,255,255,0.1)",
          minWidth: 130,
          padding: "12px 16px",
          boxShadow: champion ? "0 8px 32px rgba(245,158,11,0.2)" : "none",
          transition: "all 0.5s ease",
        }}
      >
        <div className="text-[10px] text-amber-400 uppercase tracking-widest font-bold mb-2">
          🏆 Champion
        </div>
        {champion ? (
          <>
            {flagUrl && (
              <div
                className="mx-auto mb-2 rounded-lg overflow-hidden"
                style={{ width: 60, height: 40 }}
              >
                <img
                  src={flagUrl}
                  alt={champion}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              </div>
            )}
            <div
              className="text-white font-bold text-sm"
              style={{
                fontFamily: "'Barlow Condensed', sans-serif",
                fontSize: "1.1rem",
                letterSpacing: "0.05em",
                textShadow: "0 0 20px rgba(245,158,11,0.5)",
              }}
            >
              {champion}
            </div>
          </>
        ) : (
          <div className="text-slate-500 text-xs">
            Make your
            <br />
            predictions!
          </div>
        )}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   ROUND COLUMN
───────────────────────────────────────────── */
function RoundColumn({ label, matches, onPick, size = "md", side = "left" }) {
  return (
    <div className="flex flex-col" style={{ gap: "inherit" }}>
      {/* Round label */}
      <div
        className="text-center mb-2"
        style={{
          fontSize: "0.6rem",
          letterSpacing: "0.2em",
          textTransform: "uppercase",
          color: "#64748b",
          fontWeight: 700,
          fontFamily: "'Barlow Condensed', sans-serif",
        }}
      >
        {label}
      </div>
      <div className="flex flex-col" style={{ gap: 8 }}>
        {matches.map((match, i) => (
          <div key={match.id} className="flex items-center" style={{ flex: 1 }}>
            <MatchCard match={match} onPick={onPick} size={size} />
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   PROGRESS BAR
───────────────────────────────────────────── */
function ProgressBar({ state }) {
  const total = 16 + 8 + 4 + 2 + 1; // 31 matches
  const picked = [
    ...state.r32,
    ...state.r16,
    ...state.qf,
    ...state.sf,
    ...state.final,
  ].filter((m) => m.winner).length;
  const pct = Math.round((picked / total) * 100);

  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 h-1.5 rounded-full bg-white/10 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{
            width: `${pct}%`,
            background: "linear-gradient(90deg, #16a34a, #22c55e)",
          }}
        />
      </div>
      <span className="text-xs text-slate-400 font-mono whitespace-nowrap">
        {picked}/{total}
      </span>
    </div>
  );
}

/* ─────────────────────────────────────────────
   MOBILE ACCORDION ROUND
───────────────────────────────────────────── */
function MobileRound({ label, matches, onPick, isOpen, onToggle, colorClass }) {
  return (
    <div
      className="rounded-2xl overflow-hidden mb-3"
      style={{
        background: "rgba(7,36,58,0.8)",
        border: "1px solid rgba(255,255,255,0.07)",
      }}
    >
      <button
        className="w-full flex items-center justify-between px-4 py-3"
        onClick={onToggle}
      >
        <div className="flex items-center gap-2">
          <span
            className={`text-xs font-bold uppercase tracking-widest ${colorClass}`}
            style={{
              fontFamily: "'Barlow Condensed', sans-serif",
              letterSpacing: "0.15em",
            }}
          >
            {label}
          </span>
          <span className="text-[10px] text-slate-500">
            ({matches.filter((m) => m.winner).length}/{matches.length} picked)
          </span>
        </div>
        <ChevronRight
          size={16}
          className={`text-slate-500 transition-transform duration-200 ${isOpen ? "rotate-90" : ""}`}
        />
      </button>
      {isOpen && (
        <div
          className="px-3 pb-3 grid grid-cols-2 gap-2"
          style={{ animation: "fadeIn 0.2s ease" }}
        >
          {matches.map((match) => (
            <MatchCard key={match.id} match={match} onPick={onPick} size="sm" />
          ))}
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────
   MAIN BRACKET PAGE
───────────────────────────────────────────── */
export default function Bracket() {
  const [state, setState] = useState(buildInitialState);
  const [openRound, setOpenRound] = useState("r32"); // mobile accordion
  const [justPicked, setJustPicked] = useState(null);

  const handlePick = useCallback((matchId, winner) => {
    setState((prev) => {
      // Deep clone all rounds
      const ns = {
        r32: prev.r32.map((m) => ({ ...m })),
        r16: prev.r16.map((m) => ({ ...m })),
        qf: prev.qf.map((m) => ({ ...m })),
        sf: prev.sf.map((m) => ({ ...m })),
        final: prev.final.map((m) => ({ ...m })),
        champion: prev.champion,
      };

      const allMatches = [
        ...ns.r32,
        ...ns.r16,
        ...ns.qf,
        ...ns.sf,
        ...ns.final,
      ];

      function cascadeClear(mId, removedTeam) {
        const nextRounds = [ns.r16, ns.qf, ns.sf, ns.final];
        for (const round of nextRounds) {
          for (const nm of round) {
            if (!nm.from) continue;
            const idx = nm.from.indexOf(mId);
            if (idx === -1) continue;
            const slot = idx === 0 ? "t1" : "t2";
            if (nm[slot] === removedTeam) {
              const prevW = nm.winner;
              nm[slot] = null;
              nm.winner = null;
              if (prevW) cascadeClear(nm.id, prevW);
            }
          }
        }
        if (mId === "FINAL") ns.champion = null;
      }

      function advanceWinner(mId, w) {
        const nextRounds = [ns.r16, ns.qf, ns.sf, ns.final];
        for (const round of nextRounds) {
          for (const nm of round) {
            if (!nm.from) continue;
            const idx = nm.from.indexOf(mId);
            if (idx === -1) continue;
            const slot = idx === 0 ? "t1" : "t2";
            nm[slot] = w;
          }
        }
        if (mId === "FINAL") ns.champion = w;
      }

      const match = allMatches.find((m) => m.id === matchId);
      if (!match) return ns;

      const prevWinner = match.winner;

      // If re-picking same winner, deselect
      if (prevWinner === winner) {
        match.winner = null;
        cascadeClear(matchId, prevWinner);
        return ns;
      }

      // If there was a previous winner, cascade clear it
      if (prevWinner) {
        cascadeClear(matchId, prevWinner);
      }

      match.winner = winner;
      advanceWinner(matchId, winner);

      return ns;
    });

    // Flash animation
    setJustPicked(matchId);
    setTimeout(() => setJustPicked(null), 600);
  }, []);

  const handleReset = useCallback(() => {
    setState(buildInitialState());
  }, []);

  // Mobile rounds config
  const mobileRounds = [
    {
      key: "r32",
      label: "Round of 32",
      matches: state.r32,
      color: "text-sky-400",
    },
    {
      key: "r16",
      label: "Round of 16",
      matches: state.r16,
      color: "text-cyan-400",
    },
    {
      key: "qf",
      label: "Quarter-Final",
      matches: state.qf,
      color: "text-teal-400",
    },
    {
      key: "sf",
      label: "Semi-Final",
      matches: state.sf,
      color: "text-green-400",
    },
    {
      key: "final",
      label: "Final",
      matches: state.final,
      color: "text-amber-400",
    },
  ];

  const totalPicked = [
    ...state.r32,
    ...state.r16,
    ...state.qf,
    ...state.sf,
    ...state.final,
  ].filter((m) => m.winner).length;

  return (
    <div
      className="min-h-screen"
      style={{
        background:
          "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(22,163,74,0.08) 0%, transparent 70%), #001b2a",
      }}
    >
      {/* ── Header ── */}
      <div className="max-w-[1600px] mx-auto px-4 pt-8 pb-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div
                className="w-1 h-6 rounded-full"
                style={{
                  background: "linear-gradient(180deg, #22c55e, #16a34a)",
                }}
              />
              <h1
                style={{
                  fontFamily: "'Barlow Condensed', sans-serif",
                  fontSize: "clamp(1.4rem, 4vw, 2rem)",
                  fontWeight: 800,
                  letterSpacing: "0.04em",
                  color: "#fff",
                  lineHeight: 1,
                }}
              >
                KNOCKOUT BRACKET
              </h1>
            </div>
            <p className="text-slate-400 text-sm">
              Click teams to predict winners · selections cascade automatically
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Progress */}
            <div className="hidden md:block" style={{ minWidth: 180 }}>
              <div className="text-[10px] text-slate-500 uppercase tracking-widest mb-1 font-semibold">
                Predictions
              </div>
              <ProgressBar state={state} />
            </div>

            {/* Reset */}
            <button
              onClick={handleReset}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all"
              style={{
                background: "rgba(239,68,68,0.1)",
                border: "1px solid rgba(239,68,68,0.25)",
                color: "#f87171",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(239,68,68,0.2)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "rgba(239,68,68,0.1)";
              }}
            >
              <RotateCcw size={14} />
              Reset
            </button>
          </div>
        </div>

        {/* Mobile progress */}
        <div className="md:hidden mb-4">
          <div className="text-[10px] text-slate-500 uppercase tracking-widest mb-1 font-semibold">
            Predictions — {totalPicked}/31
          </div>
          <ProgressBar state={state} />
        </div>

        {/* ── DESKTOP BRACKET ── */}
        <div className="hidden lg:block overflow-x-auto pb-6">
          <div
            className="flex items-stretch gap-0"
            style={{
              minWidth: 1100,
              // distribute vertical space
            }}
          >
            {/* LEFT SIDE */}
            {/* R32 L */}
            <div
              className="flex flex-col justify-around"
              style={{ gap: 6, flex: "0 0 148px" }}
            >
              <RoundHeader label="Round of 32" color="#38bdf8" />
              {state.r32.slice(0, 8).map((m) => (
                <div key={m.id} style={{ position: "relative" }}>
                  <div
                    className={justPicked === m.id ? "pick-flash" : ""}
                    style={{ transition: "all 0.3s" }}
                  >
                    <MatchCard match={m} onPick={handlePick} size="sm" />
                  </div>
                </div>
              ))}
            </div>

            <BracketConnector count={8} side="right" />

            {/* R16 L */}
            <div
              className="flex flex-col justify-around"
              style={{ gap: 6, flex: "0 0 148px" }}
            >
              <RoundHeader label="Round of 16" color="#22d3ee" />
              {state.r16.slice(0, 4).map((m) => (
                <div key={m.id}>
                  <MatchCard match={m} onPick={handlePick} size="sm" />
                </div>
              ))}
            </div>

            <BracketConnector count={4} side="right" />

            {/* QF L */}
            <div
              className="flex flex-col justify-around"
              style={{ gap: 6, flex: "0 0 148px" }}
            >
              <RoundHeader label="Quarter-Final" color="#2dd4bf" />
              {state.qf.slice(0, 2).map((m) => (
                <div key={m.id}>
                  <MatchCard match={m} onPick={handlePick} size="md" />
                </div>
              ))}
            </div>

            <BracketConnector count={2} side="right" />

            {/* SF L */}
            <div
              className="flex flex-col justify-around"
              style={{ gap: 6, flex: "0 0 150px" }}
            >
              <RoundHeader label="Semi-Final" color="#4ade80" />
              {state.sf.slice(0, 1).map((m) => (
                <div key={m.id}>
                  <MatchCard match={m} onPick={handlePick} size="md" />
                </div>
              ))}
            </div>

            <BracketConnector count={1} side="right" />

            {/* CENTER: FINAL + CHAMPION */}
            <div
              className="flex flex-col items-center justify-center gap-4"
              style={{ flex: "0 0 180px" }}
            >
              <RoundHeader label="Final" color="#fbbf24" center />
              <MatchCard match={state.final[0]} onPick={handlePick} size="lg" />
              <ChampionDisplay champion={state.champion} />
            </div>

            <BracketConnector count={1} side="left" />

            {/* SF R */}
            <div
              className="flex flex-col justify-around"
              style={{ gap: 6, flex: "0 0 150px" }}
            >
              <RoundHeader label="Semi-Final" color="#4ade80" />
              {state.sf.slice(1, 2).map((m) => (
                <div key={m.id}>
                  <MatchCard match={m} onPick={handlePick} size="md" />
                </div>
              ))}
            </div>

            <BracketConnector count={2} side="left" />

            {/* QF R */}
            <div
              className="flex flex-col justify-around"
              style={{ gap: 6, flex: "0 0 148px" }}
            >
              <RoundHeader label="Quarter-Final" color="#2dd4bf" />
              {state.qf.slice(2, 4).map((m) => (
                <div key={m.id}>
                  <MatchCard match={m} onPick={handlePick} size="md" />
                </div>
              ))}
            </div>

            <BracketConnector count={4} side="left" />

            {/* R16 R */}
            <div
              className="flex flex-col justify-around"
              style={{ gap: 6, flex: "0 0 148px" }}
            >
              <RoundHeader label="Round of 16" color="#22d3ee" />
              {state.r16.slice(4, 8).map((m) => (
                <div key={m.id}>
                  <MatchCard match={m} onPick={handlePick} size="sm" />
                </div>
              ))}
            </div>

            <BracketConnector count={8} side="left" />

            {/* R32 R */}
            <div
              className="flex flex-col justify-around"
              style={{ gap: 6, flex: "0 0 148px" }}
            >
              <RoundHeader label="Round of 32" color="#38bdf8" />
              {state.r32.slice(8, 16).map((m) => (
                <div key={m.id}>
                  <MatchCard match={m} onPick={handlePick} size="sm" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── TABLET (md–lg): scroll bracket ── */}
        <div className="hidden md:block lg:hidden overflow-x-auto pb-6">
          <div className="flex gap-3" style={{ minWidth: 900 }}>
            <TabletRoundCol
              label="R32"
              matches={state.r32.slice(0, 8)}
              onPick={handlePick}
              color="#38bdf8"
            />
            <TabletRoundCol
              label="R16"
              matches={state.r16.slice(0, 4)}
              onPick={handlePick}
              color="#22d3ee"
            />
            <TabletRoundCol
              label="QF"
              matches={state.qf.slice(0, 2)}
              onPick={handlePick}
              color="#2dd4bf"
            />
            <TabletRoundCol
              label="SF"
              matches={state.sf.slice(0, 1)}
              onPick={handlePick}
              color="#4ade80"
            />
            <div
              className="flex flex-col items-center justify-center gap-3"
              style={{ minWidth: 160 }}
            >
              <div className="text-[10px] font-bold uppercase tracking-widest text-amber-400">
                Final
              </div>
              <MatchCard match={state.final[0]} onPick={handlePick} size="md" />
              <ChampionDisplay champion={state.champion} />
            </div>
            <TabletRoundCol
              label="SF"
              matches={state.sf.slice(1, 2)}
              onPick={handlePick}
              color="#4ade80"
            />
            <TabletRoundCol
              label="QF"
              matches={state.qf.slice(2, 4)}
              onPick={handlePick}
              color="#2dd4bf"
            />
            <TabletRoundCol
              label="R16"
              matches={state.r16.slice(4, 8)}
              onPick={handlePick}
              color="#22d3ee"
            />
            <TabletRoundCol
              label="R32"
              matches={state.r32.slice(8)}
              onPick={handlePick}
              color="#38bdf8"
            />
          </div>
        </div>

        {/* ── MOBILE: accordion ── */}
        <div className="md:hidden">
          {/* Champion on top for mobile */}
          <div className="flex justify-center mb-6">
            <ChampionDisplay champion={state.champion} />
          </div>

          {mobileRounds.map((r) => (
            <MobileRound
              key={r.key}
              label={r.label}
              matches={r.matches}
              onPick={handlePick}
              isOpen={openRound === r.key}
              onToggle={() => setOpenRound(openRound === r.key ? null : r.key)}
              colorClass={r.color}
            />
          ))}
        </div>

        {/* ── Tip ── */}
        <div
          className="mt-4 flex items-center gap-2 text-xs text-slate-500 justify-center"
          style={{ opacity: 0.7 }}
        >
          <Zap size={11} />
          <span>
            Click any team to select as winner · click again to deselect ·
            selections cascade forward
          </span>
        </div>
      </div>

      <style>{`
        @keyframes pickFlash {
          0% { transform: scale(1); }
          50% { transform: scale(1.03); box-shadow: 0 0 20px rgba(34,197,94,0.5); }
          100% { transform: scale(1); }
        }
        .pick-flash {
          animation: pickFlash 0.4s ease;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.7; transform: scale(1.1); }
        }
      `}</style>
    </div>
  );
}

/* ── Helpers ── */
function RoundHeader({ label, color, center }) {
  return (
    <div className={`text-center ${center ? "mb-2" : "mb-1"}`}>
      <span
        style={{
          fontSize: "0.6rem",
          letterSpacing: "0.2em",
          textTransform: "uppercase",
          color: color || "#64748b",
          fontWeight: 700,
          fontFamily: "'Barlow Condensed', sans-serif",
        }}
      >
        {label}
      </span>
    </div>
  );
}

function TabletRoundCol({ label, matches, onPick, color }) {
  return (
    <div className="flex flex-col gap-2" style={{ minWidth: 130 }}>
      <div
        className="text-center text-[10px] font-bold uppercase tracking-widest mb-1"
        style={{ color, fontFamily: "'Barlow Condensed', sans-serif" }}
      >
        {label}
      </div>
      <div className="flex flex-col gap-2 justify-around flex-1">
        {matches.map((m) => (
          <MatchCard key={m.id} match={m} onPick={onPick} size="sm" />
        ))}
      </div>
    </div>
  );
}

function BracketConnector({ count, side }) {
  // Visual bracket connectors between rounds
  return (
    <div
      className="flex flex-col justify-around"
      style={{ width: 20, flexShrink: 0 }}
    >
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          style={{
            height: 2,
            width: "100%",
            background:
              side === "right"
                ? "linear-gradient(90deg, rgba(34,197,94,0.5), rgba(34,197,94,0.1))"
                : "linear-gradient(90deg, rgba(34,197,94,0.1), rgba(34,197,94,0.5))",
            borderRadius: 1,
          }}
        />
      ))}
    </div>
  );
}
