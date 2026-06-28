import React, { useState, useCallback, useEffect, useMemo } from "react";
import {
  Trophy,
  RotateCcw,
  Share2,
  Zap,
  Star,
  ChevronDown,
  Info,
  Users,
} from "lucide-react";
import { getCountryCode } from "../utils/countryUtils";
import fixturesData from "../data/fixtures.json";

/* ─────────────────────────────────────────────
   WINDOW SIZE HOOK
───────────────────────────────────────────── */
function useWindowSize() {
  const [size, setSize] = useState({
    w: typeof window !== "undefined" ? window.innerWidth : 1440,
  });
  useEffect(() => {
    const handler = () => setSize({ w: window.innerWidth });
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);
  return size;
}

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

function sortById(round) {
  return [...round].sort((a, b) => {
    const numA = parseInt(a.id.split("_")[1] || 0);
    const numB = parseInt(b.id.split("_")[1] || 0);
    return numA - numB;
  });
}

const GROUP_NAMES = [
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
];

/* ─────────────────────────────────────────────
   PARSE FIXTURES.JSON
───────────────────────────────────────────── */
function parseFixtures() {
  const groupMatches = {};
  const knockoutByRound = {
    "Round of 32": [],
    "Round of 16": [],
    "Quarter-Final": [],
    "Semi-Final": [],
    Final: [],
  };

  for (const m of fixturesData) {
    const g = m.group || "";
    if (GROUP_NAMES.includes(g)) {
      if (!groupMatches[g]) groupMatches[g] = [];
      groupMatches[g].push(m);
    } else if (knockoutByRound[g] !== undefined) {
      knockoutByRound[g].push(m);
    }
  }

  const groupTeams = {};
  for (const g of GROUP_NAMES) {
    const seen = [];
    for (const m of groupMatches[g] || []) {
      if (!seen.includes(m.team1)) seen.push(m.team1);
      if (!seen.includes(m.team2)) seen.push(m.team2);
    }
    groupTeams[g] = seen;
  }

  return { groupTeams, knockoutByRound };
}

const { groupTeams, knockoutByRound } = parseFixtures();

/* ─────────────────────────────────────────────
   R32 SLOTS — with per-slot 3rd Best index
   Each "3rd Best" slot gets its own index (0-7)
   so we can assign a different team to each.
───────────────────────────────────────────── */
let _thirdBestCounter = 0;
const R32_SLOTS = knockoutByRound["Round of 32"].map((m, i) => {
  // Prefer the original group-position placeholder (seed1/seed2) when present.
  // After the group stage these get filled with real team names in team1/team2,
  // so we keep deriving the predictor bracket from the seeds.
  const seed1 = m.seed1 ?? m.team1;
  const seed2 = m.seed2 ?? m.team2;
  const s1Is3rd = seed1 === "3rd Best";
  const s2Is3rd = seed2 === "3rd Best";
  return {
    id: `R32_${i + 1}`,
    seed1,
    seed2,
    // real qualified team names once the group stage is decided (null otherwise)
    real1: m.seed1 ? m.team1 : null,
    real2: m.seed2 ? m.team2 : null,
    // which index into the "8 best 3rd" array each slot uses
    thirdIdx1: s1Is3rd ? _thirdBestCounter++ : null,
    thirdIdx2: s2Is3rd ? _thirdBestCounter++ : null,
  };
});
// _thirdBestCounter should be 8 after this

/* ─────────────────────────────────────────────
   KNOCKOUT CONNECTIVITY
───────────────────────────────────────────── */
function parseR16From() {
  return knockoutByRound["Round of 16"].map((m, i) => {
    const extractNums = (str) => {
      const matches = [...str.matchAll(/#(\d+)/g)];
      return matches.map((x) => `R32_${x[1]}`);
    };
    return {
      id: `R16_${i + 1}`,
      from: [...extractNums(m.team1), ...extractNums(m.team2)],
    };
  });
}

function parseQFFrom() {
  return knockoutByRound["Quarter-Final"].map((m, i) => {
    const extractNums = (str) => {
      const matches = [...str.matchAll(/#(\d+)/g)];
      return matches.map((x) => `R16_${x[1]}`);
    };
    return {
      id: `QF_${i + 1}`,
      from: [...extractNums(m.team1), ...extractNums(m.team2)],
    };
  });
}

function parseSFFrom() {
  return knockoutByRound["Semi-Final"].map((m, i) => {
    const extractNums = (str) => {
      const matches = [...str.matchAll(/#(\d+)/g)];
      return matches.map((x) => `QF_${x[1]}`);
    };
    return {
      id: `SF_${i + 1}`,
      from: [...extractNums(m.team1), ...extractNums(m.team2)],
    };
  });
}

const R16_FROM = parseR16From();
const QF_FROM = parseQFFrom();
const SF_FROM = parseSFFrom();

/* ─────────────────────────────────────────────
   GROUP STATE
   rank1, rank2, rank3 — mutually exclusive picks
───────────────────────────────────────────── */
function buildInitialGroupState() {
  const gs = {};
  for (const g of GROUP_NAMES) {
    gs[g] = { rank1: null, rank2: null, rank3: null };
  }
  return gs;
}

/*
  thirdBestPicks: array of 8 team names (or null) — one per 3rd-Best slot.
  The user picks 8 of the 12 group 3rd-place finishers.
  Order matters: slot index 0..7 map to R32 "3rd Best" appearances in order.
  We let the user just pick which 8 qualify; we assign them in pick order.
*/

function resolveTeam(seed, thirdIdx, groupState, thirdBestOrdered) {
  if (!seed) return null;
  const m1 = seed.match(/^1st Gr\. ([A-L])$/);
  if (m1) return groupState[m1[1]]?.rank1 || null;
  const m2 = seed.match(/^2nd Gr\. ([A-L])$/);
  if (m2) return groupState[m2[1]]?.rank2 || null;
  if (seed === "3rd Best") {
    // thirdIdx is the positional index (0-7) for this slot
    return thirdBestOrdered[thirdIdx] || null;
  }
  return null;
}

/* ─────────────────────────────────────────────
   BRACKET STATE BUILDER
───────────────────────────────────────────── */
function buildBracketFromGroups(groupState, thirdBestOrdered) {
  const r32 = R32_SLOTS.map((s) => ({
    ...s,
    t1: resolveTeam(s.seed1, s.thirdIdx1, groupState, thirdBestOrdered),
    t2: resolveTeam(s.seed2, s.thirdIdx2, groupState, thirdBestOrdered),
    winner: null,
  }));

  const r16 = sortById(
    R16_FROM.map((s) => ({ ...s, t1: null, t2: null, winner: null })),
  );
  const qf = sortById(
    QF_FROM.map((s) => ({ ...s, t1: null, t2: null, winner: null })),
  );
  const sf = sortById(
    SF_FROM.map((s) => ({ ...s, t1: null, t2: null, winner: null })),
  );
  const final = [
    { id: "FINAL", t1: null, t2: null, winner: null, from: ["SF_1", "SF_2"] },
  ];

  return { r32, r16, qf, sf, final, champion: null };
}

function buildInitialState() {
  const gs = buildInitialGroupState();
  const tbo = new Array(8).fill(null); // 8 ordered 3rd-best picks
  return {
    groupState: gs,
    thirdBestOrdered: tbo,
    bracket: buildBracketFromGroups(gs, tbo),
  };
}

/* ─────────────────────────────────────────────
   DEFAULTS FROM REAL RESULTS
   Pre-fill the bracket with whatever has actually
   been decided so far (group standings, the eight
   best third-placed teams, and any completed
   knockout matches). Falls back gracefully while
   results are still missing.
───────────────────────────────────────────── */
function computeGroupStandings() {
  // group -> [ {team, pts, gd, gf} ] sorted best-first, only if group complete
  const stats = {};
  for (const g of GROUP_NAMES) stats[g] = {};

  const ensure = (g, t) => {
    if (!stats[g][t]) stats[g][t] = { team: t, p: 0, w: 0, d: 0, l: 0, gf: 0, ga: 0 };
    return stats[g][t];
  };

  const playedCount = {};
  for (const g of GROUP_NAMES) playedCount[g] = 0;

  for (const m of fixturesData) {
    const g = m.group;
    if (!GROUP_NAMES.includes(g)) continue;
    if (m.status !== "completed" || m.score1 == null || m.score2 == null) continue;
    playedCount[g] += 1;
    const a = ensure(g, m.team1);
    const b = ensure(g, m.team2);
    a.p += 1; b.p += 1;
    a.gf += m.score1; a.ga += m.score2;
    b.gf += m.score2; b.ga += m.score1;
    if (m.score1 > m.score2) { a.w += 1; b.l += 1; }
    else if (m.score1 < m.score2) { b.w += 1; a.l += 1; }
    else { a.d += 1; b.d += 1; }
  }

  const ranked = {};
  for (const g of GROUP_NAMES) {
    const teams = Object.values(stats[g]);
    // a group is "decided" only when all 6 matches have been played
    if (playedCount[g] < 6 || teams.length < 4) {
      ranked[g] = null;
      continue;
    }
    teams.forEach((t) => {
      t.pts = t.w * 3 + t.d;
      t.gd = t.gf - t.ga;
    });
    teams.sort((x, y) => y.pts - x.pts || y.gd - x.gd || y.gf - x.gf);
    ranked[g] = teams;
  }
  return ranked;
}

function buildDefaultGroupState(ranked) {
  const gs = buildInitialGroupState();
  for (const g of GROUP_NAMES) {
    const r = ranked[g];
    if (!r) continue;
    gs[g] = {
      rank1: r[0]?.team || null,
      rank2: r[1]?.team || null,
      rank3: r[2]?.team || null,
    };
  }
  return gs;
}

function buildDefaultThirdBest() {
  // Each "3rd Best" R32 slot already carries the real qualified team
  // (slot.real1 / slot.real2) once the group stage is complete. Map each
  // slot's thirdIdx to that team so the bracket matches the official draw.
  const tbo = new Array(8).fill(null);
  for (const s of R32_SLOTS) {
    if (s.thirdIdx1 != null && s.real1) tbo[s.thirdIdx1] = s.real1;
    if (s.thirdIdx2 != null && s.real2) tbo[s.thirdIdx2] = s.real2;
  }
  return tbo;
}

function applyCompletedKnockouts(bracket) {
  // Auto-pick winners for any knockout match that already has a final score.
  // Returns a new bracket with winners set + downstream slots advanced.
  const idByLabel = {
    "Round of 32": "r32",
    "Round of 16": "r16",
    "Quarter-Final": "qf",
    "Semi-Final": "sf",
    Final: "final",
  };

  // Build a quick lookup of completed knockout results keyed by the match's
  // ordered index within its round (matches fixtures order used to build slots).
  const completedByRound = {};
  for (const label of Object.keys(idByLabel)) completedByRound[label] = [];
  for (const m of fixturesData) {
    if (completedByRound[m.group] !== undefined) {
      completedByRound[m.group].push(m);
    }
  }

  let working = bracket;
  const roundKeys = ["r32", "r16", "qf", "sf", "final"];
  const labelByKey = {
    r32: "Round of 32",
    r16: "Round of 16",
    qf: "Quarter-Final",
    sf: "Semi-Final",
    final: "Final",
  };

  for (const key of roundKeys) {
    const fixturesForRound = completedByRound[labelByKey[key]] || [];
    // snapshot the current round's matches (ids + resolved teams) before picking
    const roundMatches = working[key].map((m) => ({
      id: m.id,
      t1: m.t1,
      t2: m.t2,
    }));
    roundMatches.forEach((match, i) => {
      const fx = fixturesForRound[i];
      if (!fx || fx.status !== "completed" || fx.score1 == null) return;
      const { t1, t2 } = match;
      if (!t1 || !t2) return;
      const w = fx.score1 > fx.score2 ? t1 : fx.score2 > fx.score1 ? t2 : null;
      if (!w) return;
      working = pickWinner(working, match.id, w);
    });
  }
  return working;
}

function buildDefaultState() {
  const ranked = computeGroupStandings();
  const gs = buildDefaultGroupState(ranked);
  const tbo = buildDefaultThirdBest();
  let bracket = buildBracketFromGroups(gs, tbo);
  bracket = applyCompletedKnockouts(bracket);
  return { groupState: gs, thirdBestOrdered: tbo, bracket };
}

/* ─────────────────────────────────────────────
   FLAG COMPONENT
───────────────────────────────────────────── */
function Flag({ team, size = 22 }) {
  const url = getFlagUrl(team);
  if (!url) {
    return (
      <div
        className="flex-shrink-0 rounded overflow-hidden bg-slate-700 flex items-center justify-center"
        style={{ width: size, height: size * 0.67 }}
      >
        <span
          className="text-slate-400 font-bold"
          style={{ fontSize: size * 0.32 }}
        >
          {team ? team.slice(0, 2).toUpperCase() : "?"}
        </span>
      </div>
    );
  }
  return (
    <div
      className="flex-shrink-0 rounded overflow-hidden shadow-sm"
      style={{ width: size, height: size * 0.67 }}
    >
      <img
        src={url}
        alt={team}
        style={{ width: "100%", height: "100%", objectFit: "cover" }}
        loading="lazy"
      />
    </div>
  );
}

/* ─────────────────────────────────────────────
   TEAM SLOT
───────────────────────────────────────────── */
function TeamSlot({ team, isWinner, onClick, seed, size = "md", justPicked }) {
  const canClick = !!team && !!onClick;
  const sz = {
    xs: {
      wrap: "py-1 px-1.5 gap-1",
      flag: 14,
      text: "text-[10px]",
      seed: "text-[8px]",
    },
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
      disabled={!canClick}
      title={team ? `Pick ${team} as winner` : seed || "TBD"}
      className={`
        w-full flex items-center ${sz.wrap} rounded-lg relative overflow-hidden
        transition-all duration-200 group team-slot
        ${justPicked ? "team-slot-flash" : ""}
        ${
          isWinner
            ? "winner-slot border border-green-500/50"
            : canClick
              ? "bg-white/5 border border-white/8 hover:bg-green-600/15 hover:border-green-500/40 cursor-pointer hover:shadow-[0_0_8px_rgba(34,197,94,0.2)]"
              : "bg-white/3 border border-white/5 cursor-default opacity-50"
        }
      `}
    >
      {isWinner && (
        <div className="absolute inset-0 winner-glow-bg pointer-events-none" />
      )}
      {team ? (
        <Flag team={team} size={sz.flag} />
      ) : (
        <div
          className="flex-shrink-0 rounded overflow-hidden bg-slate-800 flex items-center justify-center"
          style={{ width: sz.flag, height: sz.flag * 0.67 }}
        >
          <span className="text-slate-600" style={{ fontSize: sz.flag * 0.35 }}>
            ?
          </span>
        </div>
      )}
      <span
        className={`flex-1 text-left truncate ${sz.text} font-medium leading-tight
        ${isWinner ? "text-green-300" : canClick ? "text-slate-200 group-hover:text-white" : "text-slate-500"}`}
      >
        {team ||
          (seed ? (
            <span className="text-[9px] text-slate-600 italic truncate">
              {seed}
            </span>
          ) : (
            "TBD"
          ))}
      </span>
      {isWinner && (
        <div className="flex-shrink-0 w-4 h-4 rounded-full bg-green-500 flex items-center justify-center ml-1 winner-badge">
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
function MatchCard({ match, onPick, size = "md", justPickedId }) {
  const { t1, t2, winner, id, seed1, seed2 } = match;
  const canPick = t1 && t2;
  const isFlash = justPickedId === id;

  return (
    <div
      className={`relative rounded-xl overflow-hidden transition-all duration-300 match-card
        ${isFlash ? "match-flash" : ""}
        ${canPick ? "shadow-lg" : "opacity-70"}
        ${winner ? "shadow-[0_4px_20px_rgba(34,197,94,0.18)]" : ""}
      `}
      style={{
        background: "rgba(7, 36, 58, 0.92)",
        border: winner
          ? "1px solid rgba(34,197,94,0.38)"
          : "1px solid rgba(255,255,255,0.07)",
        minWidth:
          size === "xl" ? 140 : size === "lg" ? 120 : size === "xs" ? 90 : 105,
        width: "100%",
      }}
    >
      <div className="flex flex-col p-1 gap-0.5">
        <TeamSlot
          team={t1}
          isWinner={winner === t1}
          onClick={canPick ? () => onPick(id, t1) : null}
          seed={seed1}
          size={size}
          justPicked={isFlash && winner === t1}
        />
        <div className="flex items-center gap-1 px-2">
          <div className="flex-1 h-px bg-white/5" />
          <span className="text-[8px] text-slate-600 font-bold tracking-widest">
            VS
          </span>
          <div className="flex-1 h-px bg-white/5" />
        </div>
        <TeamSlot
          team={t2}
          isWinner={winner === t2}
          onClick={canPick ? () => onPick(id, t2) : null}
          seed={seed2}
          size={size}
          justPicked={isFlash && winner === t2}
        />
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   GROUP PICKER PANEL
   - 4 teams per group
   - User picks 1st, 2nd, 3rd — mutually exclusive
   - 3rd pick is optional (only needed for groups
     whose 3rd might qualify — but we show it for all
     since we don't know which 8 will be "best")
───────────────────────────────────────────── */
function GroupPicker({
  groupState,
  onPickRank,
  thirdBestOrdered,
  onPickThirdBest,
}) {
  const [activeGroup, setActiveGroup] = useState("A");
  const teams = groupTeams[activeGroup] || [];
  const gs = groupState[activeGroup];

  const pickedOthers = (excludeRank) =>
    ["rank1", "rank2", "rank3"]
      .filter((r) => r !== excludeRank)
      .map((r) => gs[r])
      .filter(Boolean);

  const rankLabel = {
    rank1: "1st Place",
    rank2: "2nd Place",
    rank3: "3rd Place",
  };
  const rankColor = { rank1: "#fbbf24", rank2: "#94a3b8", rank3: "#78716c" };

  // All groups that have a 3rd-place pick
  const all3rds = GROUP_NAMES.map((g) => groupState[g].rank3).filter(Boolean);
  // How many 3rd-best slots are filled
  const filledCount = thirdBestOrdered.filter(Boolean).length;

  // Check if a team is already chosen in the thirdBestOrdered list
  const isChosen3rd = (team) => thirdBestOrdered.includes(team);

  const handleToggle3rd = (team) => {
    const idx = thirdBestOrdered.indexOf(team);
    if (idx !== -1) {
      // Remove it — shift later picks down
      const next = [...thirdBestOrdered];
      next.splice(idx, 1);
      next.push(null);
      onPickThirdBest(next);
    } else {
      // Add to first null slot
      const next = [...thirdBestOrdered];
      const nullIdx = next.indexOf(null);
      if (nullIdx !== -1) {
        next[nullIdx] = team;
        onPickThirdBest(next);
      }
    }
  };

  return (
    //Group picker container — fixed width, centered, with header and tabs
    //Changes by Sakib!
    <div
      className="rounded-2xl overflow-hidden"
      style={{
        maxWidth: "620px", // ← ADD or change this
        margin: "0 auto", // ← ADD this (centers it)
        background: "rgba(7,36,58,0.92)",
        border: "1px solid rgba(255,255,255,0.07)",
      }}
    >
      {/* Header */}
      <div className="flex items-center gap-2 px-4 pt-3 pb-2 border-b border-white/5">
        <Users size={14} className="text-green-400" />
        <span
          style={{
            fontFamily: "'Barlow Condensed',sans-serif",
            fontSize: "0.8rem",
            fontWeight: 700,
            color: "#fff",
            letterSpacing: "0.1em",
            textTransform: "uppercase",
          }}
        >
          Group Stage Predictions
        </span>
        <span className="text-slate-500 text-xs ml-auto">
          {
            GROUP_NAMES.filter(
              (g) => groupState[g].rank1 && groupState[g].rank2,
            ).length
          }
          /12 groups set
        </span>
      </div>

      {/* Group tabs */}
      <div className="flex flex-wrap gap-1 p-2 border-b border-white/5">
        {GROUP_NAMES.map((g) => {
          const done = groupState[g].rank1 && groupState[g].rank2;
          return (
            <button
              key={g}
              onClick={() => setActiveGroup(g)}
              className="w-7 h-7 rounded-lg text-xs font-bold transition-all"
              style={{
                background:
                  activeGroup === g
                    ? "linear-gradient(135deg,#15803d,#16a34a)"
                    : done
                      ? "rgba(22,163,74,0.15)"
                      : "rgba(255,255,255,0.06)",
                color:
                  activeGroup === g ? "#fff" : done ? "#4ade80" : "#64748b",
                border:
                  activeGroup === g
                    ? "none"
                    : done
                      ? "1px solid rgba(22,163,74,0.3)"
                      : "1px solid rgba(255,255,255,0.08)",
                fontFamily: "'Barlow Condensed',sans-serif",
              }}
            >
              {g}
            </button>
          );
        })}
      </div>

      {/* Active group — narrower layout */}
      <div className="p-12" style={{ maxWidth: 520 }}>
        <div
          className="text-xs text-slate-400 mb-2"
          style={{
            fontFamily: "'Barlow Condensed',sans-serif",
            letterSpacing: "0.1em",
            textTransform: "uppercase",
          }}
        >
          Group {activeGroup}
        </div>

        {/* Ranks: 1st and 2nd in a row, then 3rd below */}
        <div className="flex flex-col gap-3">
          {["rank1", "rank2", "rank3"].map((rank) => (
            <div key={rank}>
              <div
                className="text-[10px] mb-1 font-semibold uppercase tracking-widest"
                style={{ color: rankColor[rank] }}
              >
                {rankLabel[rank]}
                {rank === "rank3" && (
                  <span className="text-slate-600 normal-case tracking-normal font-normal ml-1">
                    (optional – needed for best 3rd qualification)
                  </span>
                )}
              </div>
              <div className="grid grid-cols-2 gap-1">
                {teams.map((team) => {
                  const blocked = pickedOthers(rank).includes(team);
                  const selected = gs[rank] === team;
                  return (
                    <button
                      key={team}
                      onClick={() =>
                        !blocked &&
                        onPickRank(activeGroup, rank, selected ? null : team)
                      }
                      disabled={blocked}
                      className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-xs transition-all"
                      style={{
                        background: selected
                          ? "rgba(34,197,94,0.2)"
                          : "rgba(255,255,255,0.04)",
                        border: selected
                          ? "1px solid rgba(34,197,94,0.5)"
                          : "1px solid rgba(255,255,255,0.07)",
                        color: blocked
                          ? "#334155"
                          : selected
                            ? "#86efac"
                            : "#94a3b8",
                        cursor: blocked ? "not-allowed" : "pointer",
                        opacity: blocked ? 0.4 : 1,
                      }}
                    >
                      <Flag team={team} size={14} />
                      <span className="truncate">{team}</span>
                      {selected && (
                        <div className="ml-auto w-3 h-3 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
                          <svg
                            width="6"
                            height="6"
                            viewBox="0 0 8 8"
                            fill="none"
                          >
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
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 3rd Best qualifier — pick 8 of the available 3rd-place finishers */}
      {all3rds.length > 0 && (
        <div className="px-3 pb-3 border-t border-white/5 pt-3">
          <div className="flex items-center gap-2 mb-1">
            <div className="text-[10px] font-semibold uppercase tracking-widest text-orange-400">
              Best 3rd-Place Qualifiers
            </div>
            <span
              className="text-[9px] px-1.5 py-0.5 rounded-full font-bold"
              style={{
                background:
                  filledCount === 8
                    ? "rgba(34,197,94,0.2)"
                    : "rgba(251,146,60,0.15)",
                color: filledCount === 8 ? "#4ade80" : "#fb923c",
                border:
                  filledCount === 8
                    ? "1px solid rgba(34,197,94,0.3)"
                    : "1px solid rgba(251,146,60,0.2)",
              }}
            >
              {filledCount}/8 selected
            </span>
          </div>
          <p className="text-[9px] text-slate-500 mb-2">
            FIFA 2026 has 8 "3rd Best" slots in the R32. Pick which 8 of the 12
            group 3rd-place finishers qualify. Each fills a different bracket
            slot in order of selection.
          </p>
          <div className="flex flex-wrap gap-1">
            {all3rds.map((team) => {
              const chosen = isChosen3rd(team);
              const positionIdx = thirdBestOrdered.indexOf(team);
              const canAdd = !chosen && filledCount < 8;
              return (
                <button
                  key={team}
                  onClick={() => (chosen || canAdd) && handleToggle3rd(team)}
                  disabled={!chosen && filledCount >= 8}
                  className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs transition-all"
                  style={{
                    background: chosen
                      ? "rgba(251,146,60,0.2)"
                      : "rgba(255,255,255,0.04)",
                    border: chosen
                      ? "1px solid rgba(251,146,60,0.5)"
                      : "1px solid rgba(255,255,255,0.07)",
                    color: chosen
                      ? "#fdba74"
                      : filledCount >= 8
                        ? "#334155"
                        : "#64748b",
                    opacity: !chosen && filledCount >= 8 ? 0.4 : 1,
                    cursor:
                      !chosen && filledCount >= 8 ? "not-allowed" : "pointer",
                  }}
                >
                  {chosen && (
                    <span
                      className="text-[8px] font-bold w-3.5 h-3.5 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{
                        background: "rgba(251,146,60,0.4)",
                        color: "#fed7aa",
                      }}
                    >
                      {positionIdx + 1}
                    </span>
                  )}
                  <Flag team={team} size={12} />
                  <span>{team}</span>
                </button>
              );
            })}
          </div>
          {filledCount === 8 && (
            <p className="text-[9px] text-green-500 mt-1.5">
              ✅ All 8 qualifier slots filled — R32 "3rd Best" slots are now
              resolved.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────
   CHAMPION DISPLAY
───────────────────────────────────────────── */
function ChampionDisplay({ champion }) {
  const flagUrl = getFlagUrl(champion);
  return (
    <div className="flex flex-col items-center gap-3 px-2">
      <div
        className="relative flex items-center justify-center w-16 h-16 rounded-2xl champion-trophy"
        style={{
          background:
            "linear-gradient(135deg, #92400e, #d97706, #fbbf24, #d97706)",
          boxShadow: champion
            ? "0 0 40px rgba(245,158,11,0.7), 0 0 80px rgba(245,158,11,0.35)"
            : "0 0 20px rgba(245,158,11,0.2)",
        }}
      >
        <Trophy size={30} color="#fff" strokeWidth={1.5} />
        {champion && (
          <div
            className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-green-500 flex items-center justify-center"
            style={{ animation: "pulse 2s infinite" }}
          >
            <Star size={10} color="#fff" fill="#fff" />
          </div>
        )}
      </div>
      <div
        className="rounded-2xl overflow-hidden text-center champion-card"
        style={{
          background: champion
            ? "linear-gradient(135deg, rgba(245,158,11,0.18), rgba(34,197,94,0.12))"
            : "rgba(7,36,58,0.8)",
          border: champion
            ? "1px solid rgba(245,158,11,0.45)"
            : "1px dashed rgba(255,255,255,0.1)",
          minWidth: 130,
          padding: "12px 16px",
          boxShadow: champion ? "0 8px 32px rgba(245,158,11,0.25)" : "none",
          transition: "all 0.6s cubic-bezier(0.34,1.56,0.64,1)",
        }}
      >
        <div className="text-[10px] text-amber-400 uppercase tracking-widest font-bold mb-2">
          🏆 Champion
        </div>
        {champion ? (
          <div className="champion-reveal">
            {flagUrl && (
              <div
                className="mx-auto mb-2 rounded-lg overflow-hidden shadow-lg"
                style={{ width: 64, height: 43 }}
              >
                <img
                  src={flagUrl}
                  alt={champion}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              </div>
            )}
            <div
              className="text-white font-bold"
              style={{
                fontFamily: "'Barlow Condensed', sans-serif",
                fontSize: "1.1rem",
                letterSpacing: "0.05em",
                textShadow: "0 0 20px rgba(245,158,11,0.6)",
              }}
            >
              {champion}
            </div>
            <div className="flex justify-center gap-0.5 mt-1.5">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  size={8}
                  fill="#f59e0b"
                  color="#f59e0b"
                  style={{ animation: `starPop 0.4s ${i * 0.08}s ease both` }}
                />
              ))}
            </div>
          </div>
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
   SVG Tree CONNECTORS
───────────────────────────────────────────── */
function TreeSVGConnectors({ side, count, matchHeight, matchGap }) {
  const pairs = Math.floor(count / 2);
  const totalH = count * matchHeight + (count - 1) * matchGap;
  const w = 28;
  return (
    <svg
      width={w}
      height={totalH}
      style={{ flexShrink: 0, overflow: "visible" }}
    >
      {Array.from({ length: pairs }).map((_, pi) => {
        const i1 = pi * 2,
          i2 = pi * 2 + 1;
        const y1 = i1 * (matchHeight + matchGap) + matchHeight / 2;
        const y2 = i2 * (matchHeight + matchGap) + matchHeight / 2;
        const yMid = (y1 + y2) / 2;
        if (side === "right") {
          return (
            <g key={pi}>
              <line
                x1={0}
                y1={y1}
                x2={w * 0.6}
                y2={y1}
                stroke="rgba(34,197,94,0.35)"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
              <line
                x1={w * 0.6}
                y1={y1}
                x2={w * 0.6}
                y2={y2}
                stroke="rgba(34,197,94,0.35)"
                strokeWidth="1.5"
              />
              <line
                x1={w * 0.6}
                y1={y2}
                x2={0}
                y2={y2}
                stroke="rgba(34,197,94,0.35)"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
              <line
                x1={w * 0.6}
                y1={yMid}
                x2={w}
                y2={yMid}
                stroke="rgba(34,197,94,0.5)"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </g>
          );
        } else {
          return (
            <g key={pi}>
              <line
                x1={w}
                y1={y1}
                x2={w * 0.4}
                y2={y1}
                stroke="rgba(34,197,94,0.35)"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
              <line
                x1={w * 0.4}
                y1={y1}
                x2={w * 0.4}
                y2={y2}
                stroke="rgba(34,197,94,0.35)"
                strokeWidth="1.5"
              />
              <line
                x1={w * 0.4}
                y1={y2}
                x2={w}
                y2={y2}
                stroke="rgba(34,197,94,0.35)"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
              <line
                x1={w * 0.4}
                y1={yMid}
                x2={0}
                y2={yMid}
                stroke="rgba(34,197,94,0.5)"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </g>
          );
        }
      })}
    </svg>
  );
}

/* ─────────────────────────────────────────────
   ROUND COLUMN
───────────────────────────────────────────── */
function RoundCol({
  label,
  color,
  matches,
  onPick,
  size,
  matchHeight,
  matchGap,
  justPickedId,
}) {
  return (
    <div className="flex flex-col">
      <div className="text-center mb-2" style={{ height: 20 }}>
        <span
          style={{
            fontSize: "0.58rem",
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: color || "#64748b",
            fontWeight: 700,
            fontFamily: "'Barlow Condensed', sans-serif",
          }}
        >
          {label}
        </span>
      </div>
      <div className="flex flex-col" style={{ gap: matchGap }}>
        {matches.map((m) => (
          <div key={m.id} style={{ height: matchHeight }}>
            <MatchCard
              match={m}
              onPick={onPick}
              size={size}
              justPickedId={justPickedId}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   PROGRESS BAR
───────────────────────────────────────────── */
function ProgressBar({ bracket }) {
  const total = 31;
  const picked = [
    ...bracket.r32,
    ...bracket.r16,
    ...bracket.qf,
    ...bracket.sf,
    ...bracket.final,
  ].filter((m) => m.winner).length;
  const pct = Math.round((picked / total) * 100);
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 h-1.5 rounded-full bg-white/10 overflow-hidden">
        <div
          className="h-full rounded-full progress-bar transition-all duration-700"
          style={{ width: `${pct}%` }}
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
function MobileRound({
  label,
  matches,
  onPick,
  isOpen,
  onToggle,
  colorClass,
  justPickedId,
}) {
  return (
    <div
      className="rounded-2xl overflow-hidden mb-3 mobile-round"
      style={{
        background: "rgba(7,36,58,0.88)",
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
        <ChevronDown
          size={16}
          className={`text-slate-500 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
        />
      </button>
      {isOpen && (
        <div className="px-3 pb-3 grid grid-cols-1 sm:grid-cols-2 gap-2 accordion-body">
          {matches.map((m) => (
            <MatchCard
              key={m.id}
              match={m}
              onPick={onPick}
              size="xs"
              justPickedId={justPickedId}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────
   SHARE MODAL
───────────────────────────────────────────── */
function ShareModal({ bracket, onClose }) {
  const picked = [
    ...bracket.r32,
    ...bracket.r16,
    ...bracket.qf,
    ...bracket.sf,
    ...bracket.final,
  ].filter((m) => m.winner).length;
  const lines = [
    `🏆 My FIFA WC 2026 Predictions (${picked}/31)`,
    ``,
    bracket.champion
      ? `👑 Champion: ${bracket.champion}`
      : "👑 Champion: Not yet picked",
    bracket.final[0].t1 && bracket.final[0].t2
      ? `⚽ Final: ${bracket.final[0].t1} vs ${bracket.final[0].t2}`
      : "",
    ``,
    `Make your predictions at FIFA WC 2026!`,
  ]
    .filter((l) => l !== undefined)
    .join("\n");

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-backdrop"
      onClick={onClose}
    >
      <div
        className="rounded-2xl p-6 max-w-sm w-full modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "rgba(7,36,58,0.98)",
          border: "1px solid rgba(34,197,94,0.3)",
        }}
      >
        <div className="flex items-center gap-2 mb-4">
          <Share2 size={18} className="text-green-400" />
          <h3 className="text-white font-bold text-lg">Share Predictions</h3>
        </div>
        <pre className="text-slate-300 text-xs bg-white/5 rounded-xl p-3 whitespace-pre-wrap mb-4 font-mono">
          {lines}
        </pre>
        <div className="flex gap-2">
          <button
            onClick={() =>
              navigator.clipboard?.writeText(lines).catch(() => {})
            }
            className="flex-1 py-2 rounded-xl text-sm font-semibold text-white transition-all"
            style={{
              background: "rgba(34,197,94,0.2)",
              border: "1px solid rgba(34,197,94,0.3)",
            }}
          >
            Copy Text
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-400 transition-all"
            style={{
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.1)",
            }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   CONFETTI
───────────────────────────────────────────── */
function ConfettiEffect() {
  const pieces = Array.from({ length: 60 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    delay: Math.random() * 1.5,
    duration: 2 + Math.random() * 2,
    color: ["#22c55e", "#fbbf24", "#38bdf8", "#f472b6", "#a78bfa"][
      Math.floor(Math.random() * 5)
    ],
    size: 4 + Math.random() * 8,
  }));
  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {pieces.map((p) => (
        <div
          key={p.id}
          style={{
            position: "absolute",
            left: `${p.x}%`,
            top: "-20px",
            width: p.size,
            height: p.size,
            background: p.color,
            borderRadius: Math.random() > 0.5 ? "50%" : "2px",
            animation: `confettiFall ${p.duration}s ${p.delay}s ease-in forwards`,
            transform: `rotate(${Math.random() * 360}deg)`,
          }}
        />
      ))}
    </div>
  );
}

/* ─────────────────────────────────────────────
   BRACKET LOGIC HELPERS
───────────────────────────────────────────── */
function rebuildBracketTeams(prevBracket, groupState, thirdBestOrdered) {
  const nb = {
    r32: prevBracket.r32.map((m) => ({ ...m })),
    r16: sortById(prevBracket.r16.map((m) => ({ ...m }))),
    qf: sortById(prevBracket.qf.map((m) => ({ ...m }))),
    sf: sortById(prevBracket.sf.map((m) => ({ ...m }))),
    final: prevBracket.final.map((m) => ({ ...m })),
    champion: prevBracket.champion,
  };

  function cascadeClear(matchId, removedTeam) {
    const rounds = [nb.r16, nb.qf, nb.sf, nb.final];
    for (const round of rounds) {
      for (const nm of round) {
        if (!nm.from) continue;
        const idx = nm.from.indexOf(matchId);
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
    if (matchId === "FINAL") nb.champion = null;
  }

  for (const m of nb.r32) {
    const newT1 = resolveTeam(
      m.seed1,
      m.thirdIdx1,
      groupState,
      thirdBestOrdered,
    );
    const newT2 = resolveTeam(
      m.seed2,
      m.thirdIdx2,
      groupState,
      thirdBestOrdered,
    );

    if (newT1 !== m.t1) {
      if (m.winner === m.t1) {
        m.winner = null;
        cascadeClear(m.id, m.t1);
      }
      m.t1 = newT1;
    }
    if (newT2 !== m.t2) {
      if (m.winner === m.t2) {
        m.winner = null;
        cascadeClear(m.id, m.t2);
      }
      m.t2 = newT2;
    }
  }

  return nb;
}

function pickWinner(prevBracket, matchId, winner) {
  const nb = {
    r32: prevBracket.r32.map((m) => ({ ...m })),
    r16: sortById(prevBracket.r16.map((m) => ({ ...m }))),
    qf: sortById(prevBracket.qf.map((m) => ({ ...m }))),
    sf: sortById(prevBracket.sf.map((m) => ({ ...m }))),
    final: prevBracket.final.map((m) => ({ ...m })),
    champion: prevBracket.champion,
  };

  const allMatches = [...nb.r32, ...nb.r16, ...nb.qf, ...nb.sf, ...nb.final];

  function cascadeClear(mId, removedTeam) {
    const rounds = [nb.r16, nb.qf, nb.sf, nb.final];
    for (const round of rounds) {
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
    if (mId === "FINAL") nb.champion = null;
  }

  function advanceWinner(mId, w) {
    const rounds = [nb.r16, nb.qf, nb.sf, nb.final];
    for (const round of rounds) {
      for (const nm of round) {
        if (!nm.from) continue;
        const idx = nm.from.indexOf(mId);
        if (idx === -1) continue;
        const slot = idx === 0 ? "t1" : "t2";
        nm[slot] = w;
      }
    }
    if (mId === "FINAL") nb.champion = w;
  }

  const match = allMatches.find((m) => m.id === matchId);
  if (!match) return nb;

  const prevWinner = match.winner;
  if (prevWinner === winner) {
    match.winner = null;
    cascadeClear(matchId, prevWinner);
    return nb;
  }

  if (prevWinner) cascadeClear(matchId, prevWinner);
  match.winner = winner;
  advanceWinner(matchId, winner);

  return nb;
}

/* ─────────────────────────────────────────────
   MAIN TREE PAGE
───────────────────────────────────────────── */
export default function Tree() {
  // Default to the actual results so far (group standings, best third-placed
  // teams, and any decided knockout matches). Users can still edit or reset.
  const [appState, setAppState] = useState(buildDefaultState);
  const [showGroupPicker, setShowGroupPicker] = useState(true);
  const [openRound, setOpenRound] = useState("r32");
  const [justPickedId, setJustPickedId] = useState(null);
  const [showShare, setShowShare] = useState(false);
  const [confettiActive, setConfettiActive] = useState(false);

  const { groupState, thirdBestOrdered, bracket } = appState;

  useEffect(() => {
    if (bracket.champion) {
      setConfettiActive(true);
      setTimeout(() => setConfettiActive(false), 3000);
    }
  }, [bracket.champion]);

  const handlePickRank = useCallback((group, rank, team) => {
    setAppState((prev) => {
      const newGS = {
        ...prev.groupState,
        [group]: { ...prev.groupState[group], [rank]: team },
      };

      // If a 3rd-place pick was cleared or changed, remove that team from thirdBestOrdered
      let newTBO = [...prev.thirdBestOrdered];
      const oldRank3 = prev.groupState[group].rank3;
      if (rank === "rank3") {
        // Remove old 3rd from ordered list if it was there
        if (oldRank3 && oldRank3 !== team) {
          const idx = newTBO.indexOf(oldRank3);
          if (idx !== -1) {
            newTBO.splice(idx, 1);
            newTBO.push(null);
          }
        }
        // Also remove new rank3 if it was previously the rank1/rank2 (edge case: swapping)
        if (team === null && oldRank3) {
          const idx = newTBO.indexOf(oldRank3);
          if (idx !== -1) {
            newTBO.splice(idx, 1);
            newTBO.push(null);
          }
        }
      } else {
        // If rank1/rank2 team changed, and the newly assigned team was a 3rd-best pick, remove it
        // Also if the old 3rd for this group is being overwritten (team reassigned to rank1/rank2)
        if (team && newTBO.includes(team)) {
          const idx = newTBO.indexOf(team);
          newTBO.splice(idx, 1);
          newTBO.push(null);
        }
      }

      const newBracket = rebuildBracketTeams(prev.bracket, newGS, newTBO);
      return {
        ...prev,
        groupState: newGS,
        thirdBestOrdered: newTBO,
        bracket: newBracket,
      };
    });
  }, []);

  const handlePickThirdBest = useCallback((newOrdered) => {
    setAppState((prev) => {
      const newBracket = rebuildBracketTeams(
        prev.bracket,
        prev.groupState,
        newOrdered,
      );
      return { ...prev, thirdBestOrdered: newOrdered, bracket: newBracket };
    });
  }, []);

  const handlePick = useCallback((matchId, winner) => {
    setAppState((prev) => {
      const newBracket = pickWinner(prev.bracket, matchId, winner);
      return { ...prev, bracket: newBracket };
    });
    setJustPickedId(matchId);
    setTimeout(() => setJustPickedId(null), 700);
  }, []);

  const handleReset = useCallback(() => {
    setAppState(buildInitialState());
  }, []);

  const handleLoadResults = useCallback(() => {
    setAppState(buildDefaultState());
  }, []);

  const { w: winW } = useWindowSize();

  // Fluid scale: shrink on small screens, natural size on large, centered via margin:auto
  const BRACKET_NATURAL_W = 1300;
  const availW = Math.max(winW - 96, 320);
  const bracketScale = Math.min(
    1.0,
    Math.max(0.45, availW / BRACKET_NATURAL_W),
  );

  const R32_H = 72,
    R32_GAP = 6;
  const R16_H = 72,
    R16_GAP = 6;
  const QF_H = 76,
    QF_GAP = 8;
  const SF_H = 80;

  const totalPicked = [
    ...bracket.r32,
    ...bracket.r16,
    ...bracket.qf,
    ...bracket.sf,
    ...bracket.final,
  ].filter((m) => m.winner).length;
  const groupsDone = GROUP_NAMES.filter(
    (g) => groupState[g].rank1 && groupState[g].rank2,
  ).length;
  const r32Ready = bracket.r32.filter((m) => m.t1 && m.t2).length;

  const mobileRounds = [
    {
      key: "r32",
      label: "Round of 32",
      matches: bracket.r32,
      color: "text-sky-400",
    },
    {
      key: "r16",
      label: "Round of 16",
      matches: bracket.r16,
      color: "text-cyan-400",
    },
    {
      key: "qf",
      label: "Quarter-Final",
      matches: bracket.qf,
      color: "text-teal-400",
    },
    {
      key: "sf",
      label: "Semi-Final",
      matches: bracket.sf,
      color: "text-green-400",
    },
    {
      key: "final",
      label: "Final",
      matches: bracket.final,
      color: "text-amber-400",
    },
  ];

  return (
    <>
      <div className="min-h-screen tree-page">
        {confettiActive && <ConfettiEffect />}
        {showShare && (
          <ShareModal bracket={bracket} onClose={() => setShowShare(false)} />
        )}

        <div className="w-full max-w-[1800px] mx-auto px-3 sm:px-4 lg:px-6 pt-6 pb-8">
          {/* HEADER */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div
                  className="w-1 h-7 rounded-full"
                  style={{
                    background: "linear-gradient(180deg, #22c55e, #16a34a)",
                  }}
                />
                <div>
                  <h1
                    style={{
                      fontFamily: "'Barlow Condensed', sans-serif",
                      fontSize: "clamp(1.4rem, 4vw, 2.2rem)",
                      fontWeight: 800,
                      letterSpacing: "0.04em",
                      color: "#fff",
                      lineHeight: 1,
                    }}
                  >
                    KNOCKOUT BRACKET
                  </h1>
                  <p className="text-slate-400 text-xs mt-0.5">
                    Pick group finishers → predict your path to the trophy
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              <div
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs"
                style={{
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.08)",
                }}
              >
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ background: r32Ready > 0 ? "#22c55e" : "#475569" }}
                />
                <span className="text-slate-400">
                  {r32Ready}/16 R32 slots filled
                </span>
              </div>
              <div className="hidden md:block" style={{ minWidth: 190 }}>
                <div className="text-[10px] text-slate-500 uppercase tracking-widest mb-1 font-semibold">
                  Predictions — {totalPicked}/31
                </div>
                <ProgressBar bracket={bracket} />
              </div>
              <button
                onClick={() => setShowGroupPicker((v) => !v)}
                className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold transition-all"
                style={{
                  background: showGroupPicker
                    ? "rgba(34,197,94,0.15)"
                    : "rgba(255,255,255,0.06)",
                  border: showGroupPicker
                    ? "1px solid rgba(34,197,94,0.3)"
                    : "1px solid rgba(255,255,255,0.1)",
                  color: showGroupPicker ? "#4ade80" : "#94a3b8",
                }}
              >
                <Users size={13} /> Groups {showGroupPicker ? "▲" : "▼"}
              </button>
              <button
                onClick={() => setShowShare(true)}
                className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold transition-all btn-share"
              >
                <Share2 size={13} /> Share
              </button>
              <button
                onClick={handleLoadResults}
                className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold transition-all btn-results"
                title="Fill the bracket with the actual results so far"
              >
                <Zap size={13} /> Results
              </button>
              <button
                onClick={handleReset}
                className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold transition-all btn-reset"
              >
                <RotateCcw size={13} /> Reset
              </button>
            </div>
          </div>

          {/* Mobile progress */}
          <div className="md:hidden mb-4">
            <div className="text-[10px] text-slate-500 uppercase tracking-widest mb-1 font-semibold">
              Predictions — {totalPicked}/31
            </div>
            <ProgressBar bracket={bracket} />
          </div>

          {/* GROUP PICKER PANEL */}
          {showGroupPicker && (
            <div className="mb-6 group-picker-panel">
              <GroupPicker
                groupState={groupState}
                onPickRank={handlePickRank}
                thirdBestOrdered={thirdBestOrdered}
                onPickThirdBest={handlePickThirdBest}
              />
              {groupsDone === 12 && (
                <div className="mt-2 flex items-center gap-2 text-xs text-green-400 justify-center">
                  <span>
                    ✅ All groups set! Now predict match winners below.
                  </span>
                  <button
                    onClick={() => setShowGroupPicker(false)}
                    className="underline text-green-300 hover:text-green-200"
                  >
                    Hide groups
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Hint if no groups set */}
          {r32Ready === 0 && !showGroupPicker && (
            <div
              className="mb-4 flex items-center gap-2 px-4 py-3 rounded-xl text-sm text-slate-400"
              style={{
                background: "rgba(255,255,255,0.03)",
                border: "1px dashed rgba(255,255,255,0.1)",
              }}
            >
              <Info size={14} className="text-blue-400 flex-shrink-0" />
              <span>
                Open{" "}
                <button
                  onClick={() => setShowGroupPicker(true)}
                  className="text-green-400 underline"
                >
                  Group Stage Predictions
                </button>{" "}
                to pick group finishers — that unlocks the bracket.
              </span>
            </div>
          )}

          {/* DESKTOP BRACKET (≥768px) — fluid scale, centered */}
          <div className="hidden md:block pb-4 px-8 pt-28">
            <div
              className="bracket-scale-wrap"
              style={{
                transformOrigin: "top center",
                transform: `scale(${bracketScale})`,
                width: `${BRACKET_NATURAL_W}px`,
                margin: "0 auto",
                height: `${Math.round(780 * bracketScale)}px`,
              }}
            >
              <div
                className="flex items-start justify-center"
                style={{ minWidth: BRACKET_NATURAL_W, gap: 0 }}
              >
                <RoundCol
                  label="Round of 32"
                  color="#38bdf8"
                  matches={bracket.r32.slice(0, 8)}
                  onPick={handlePick}
                  size="xs"
                  matchHeight={R32_H}
                  matchGap={R32_GAP}
                  justPickedId={justPickedId}
                />
                <TreeSVGConnectors
                  side="right"
                  count={8}
                  matchHeight={R32_H}
                  matchGap={R32_GAP}
                />
                <RoundCol
                  label="Round of 16"
                  color="#22d3ee"
                  matches={bracket.r16.slice(0, 4)}
                  onPick={handlePick}
                  size="sm"
                  matchHeight={R16_H}
                  matchGap={R32_H * 2 + R32_GAP - R16_H}
                  justPickedId={justPickedId}
                />
                <TreeSVGConnectors
                  side="right"
                  count={4}
                  matchHeight={R16_H}
                  matchGap={R32_H * 2 + R32_GAP - R16_H}
                />
                <RoundCol
                  label="Quarter-Final"
                  color="#2dd4bf"
                  matches={bracket.qf.slice(0, 2)}
                  onPick={handlePick}
                  size="sm"
                  matchHeight={QF_H}
                  matchGap={R16_H * 2 + (R32_H * 2 + R32_GAP) - R16_H - QF_H}
                  justPickedId={justPickedId}
                />
                <TreeSVGConnectors
                  side="right"
                  count={2}
                  matchHeight={QF_H}
                  matchGap={R16_H * 2 + (R32_H * 2 + R32_GAP) - R16_H - QF_H}
                />

                {/* LEFT: SF_1 */}
                <div className="flex flex-col" style={{ marginTop: 20 }}>
                  <div className="text-center mb-2">
                    <span
                      style={{
                        fontSize: "0.58rem",
                        letterSpacing: "0.18em",
                        textTransform: "uppercase",
                        color: "#4ade80",
                        fontWeight: 700,
                        fontFamily: "'Barlow Condensed', sans-serif",
                      }}
                    >
                      Semi-Final
                    </span>
                  </div>
                  <div style={{ height: SF_H }}>
                    <MatchCard
                      match={bracket.sf[0]}
                      onPick={handlePick}
                      size="sm"
                      justPickedId={justPickedId}
                    />
                  </div>
                </div>

                {/* Arrow → Final */}
                <div className="flex items-center" style={{ marginTop: 40 }}>
                  <svg width={36} height={40} style={{ overflow: "visible" }}>
                    <line
                      x1={0}
                      y1={20}
                      x2={30}
                      y2={20}
                      stroke="rgba(251,191,36,0.5)"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                    <polygon
                      points="30,15 36,20 30,25"
                      fill="rgba(251,191,36,0.5)"
                    />
                  </svg>
                </div>

                {/* CENTER: FINAL + CHAMPION */}
                <div
                  className="flex flex-col items-center gap-3"
                  style={{ marginTop: 20, minWidth: 165 }}
                >
                  <div className="text-center">
                    <span
                      style={{
                        fontSize: "0.7rem",
                        letterSpacing: "0.2em",
                        textTransform: "uppercase",
                        color: "#fbbf24",
                        fontWeight: 800,
                        fontFamily: "'Barlow Condensed', sans-serif",
                      }}
                    >
                      ⚽ Final
                    </span>
                  </div>
                  <MatchCard
                    match={bracket.final[0]}
                    onPick={handlePick}
                    size="md"
                    justPickedId={justPickedId}
                  />
                  <ChampionDisplay champion={bracket.champion} />
                </div>

                {/* Arrow ← Final */}
                <div className="flex items-center" style={{ marginTop: 40 }}>
                  <svg width={36} height={40} style={{ overflow: "visible" }}>
                    <line
                      x1={6}
                      y1={20}
                      x2={36}
                      y2={20}
                      stroke="rgba(251,191,36,0.5)"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                    <polygon
                      points="6,15 0,20 6,25"
                      fill="rgba(251,191,36,0.5)"
                    />
                  </svg>
                </div>

                {/* RIGHT: SF_2 */}
                <div className="flex flex-col" style={{ marginTop: 20 }}>
                  <div className="text-center mb-2">
                    <span
                      style={{
                        fontSize: "0.58rem",
                        letterSpacing: "0.18em",
                        textTransform: "uppercase",
                        color: "#4ade80",
                        fontWeight: 700,
                        fontFamily: "'Barlow Condensed', sans-serif",
                      }}
                    >
                      Semi-Final
                    </span>
                  </div>
                  <div style={{ height: SF_H }}>
                    <MatchCard
                      match={bracket.sf[1]}
                      onPick={handlePick}
                      size="sm"
                      justPickedId={justPickedId}
                    />
                  </div>
                </div>

                <TreeSVGConnectors
                  side="left"
                  count={2}
                  matchHeight={QF_H}
                  matchGap={R16_H * 2 + (R32_H * 2 + R32_GAP) - R16_H - QF_H}
                />
                <RoundCol
                  label="Quarter-Final"
                  color="#2dd4bf"
                  matches={bracket.qf.slice(2, 4)}
                  onPick={handlePick}
                  size="sm"
                  matchHeight={QF_H}
                  matchGap={R16_H * 2 + (R32_H * 2 + R32_GAP) - R16_H - QF_H}
                  justPickedId={justPickedId}
                />
                <TreeSVGConnectors
                  side="left"
                  count={4}
                  matchHeight={R16_H}
                  matchGap={R32_H * 2 + R32_GAP - R16_H}
                />
                <RoundCol
                  label="Round of 16"
                  color="#22d3ee"
                  matches={bracket.r16.slice(4, 8)}
                  onPick={handlePick}
                  size="sm"
                  matchHeight={R16_H}
                  matchGap={R32_H * 2 + R32_GAP - R16_H}
                  justPickedId={justPickedId}
                />
                <TreeSVGConnectors
                  side="left"
                  count={8}
                  matchHeight={R32_H}
                  matchGap={R32_GAP}
                />
                <RoundCol
                  label="Round of 32"
                  color="#38bdf8"
                  matches={bracket.r32.slice(8, 16)}
                  onPick={handlePick}
                  size="xs"
                  matchHeight={R32_H}
                  matchGap={R32_GAP}
                  justPickedId={justPickedId}
                />
              </div>
            </div>
          </div>
        </div>

        {/* MOBILE (<768px) */}
        <div className="md:hidden">
          <div className="flex justify-center mb-5">
            <ChampionDisplay champion={bracket.champion} />
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
              justPickedId={justPickedId}
            />
          ))}
        </div>

        {/* Tip */}
        <div
          className="mt-4 flex items-center gap-2 text-xs text-slate-500 justify-center"
          style={{ opacity: 0.65 }}
        >
          <Zap size={10} />
          <span>
            Pick group finishers above → R32 slots auto-fill → click teams to
            predict winners → cascade forward
          </span>
        </div>
      </div>
      <TreeStyles />
    </>
  );
}

/* ─────────────────────────────────────────────
   STYLES
───────────────────────────────────────────── */
function TreeStyles() {
  return (
    <style>{`
      .tree-page {
        background: radial-gradient(ellipse 80% 60% at 50% 0%, rgba(22,163,74,0.08) 0%, transparent 70%), #001b2a;
      }
      /* TV / ultra-wide: cap bracket scale at 1.2 */
      @media (min-width: 2400px) {
        .bracket-scale-wrap { transform: scale(1.2) !important; transform-origin: top center !important; }
      }
      @media (min-width: 1800px) and (max-width: 2399px) {
        .bracket-scale-wrap { transform: scale(1.1) !important; transform-origin: top center !important; }
      }
      .winner-slot {
        background: linear-gradient(90deg, rgba(34,197,94,0.22), rgba(34,197,94,0.06)) !important;
        box-shadow: 0 0 10px rgba(34,197,94,0.18);
      }
      .winner-glow-bg { background: linear-gradient(90deg, rgba(34,197,94,0.12), transparent); }
      .winner-badge { animation: badgePop 0.4s cubic-bezier(0.34,1.56,0.64,1); }
      @keyframes matchFlash {
        0%   { transform: scale(1); box-shadow: 0 0 0 rgba(34,197,94,0); }
        40%  { transform: scale(1.035); box-shadow: 0 0 22px rgba(34,197,94,0.55); }
        100% { transform: scale(1); box-shadow: 0 4px 20px rgba(34,197,94,0.18); }
      }
      .match-flash { animation: matchFlash 0.55s cubic-bezier(0.34,1.56,0.64,1); }
      @keyframes slotFlash {
        0%  { background: rgba(34,197,94,0.35); }
        100%{}
      }
      .team-slot-flash { animation: slotFlash 0.6s ease; }
      @keyframes badgePop {
        0%   { transform: scale(0); }
        70%  { transform: scale(1.3); }
        100% { transform: scale(1); }
      }
      .group-picker-panel { animation: slideDown 0.3s cubic-bezier(0.34,1.56,0.64,1); }
      .accordion-body { animation: slideDown 0.25s cubic-bezier(0.34,1.56,0.64,1); }
      @keyframes slideDown {
        from { opacity: 0; transform: translateY(-10px); }
        to   { opacity: 1; transform: translateY(0); }
      }
      .progress-bar {
        background: linear-gradient(90deg, #16a34a, #22c55e, #4ade80);
        background-size: 200% 100%;
        animation: shimmer 2s infinite linear;
      }
      @keyframes shimmer {
        0%   { background-position: 200% 0; }
        100% { background-position: -200% 0; }
      }
      .champion-reveal { animation: championReveal 0.6s cubic-bezier(0.34,1.56,0.64,1); }
      @keyframes championReveal {
        from { opacity: 0; transform: scale(0.7) translateY(8px); }
        to   { opacity: 1; transform: scale(1) translateY(0); }
      }
      .champion-trophy { transition: box-shadow 0.5s ease; }
      @keyframes starPop {
        from { opacity: 0; transform: scale(0) rotate(-30deg); }
        to   { opacity: 1; transform: scale(1) rotate(0); }
      }
      @keyframes pulse {
        0%, 100% { opacity: 1; transform: scale(1); }
        50%       { opacity: 0.7; transform: scale(1.15); }
      }
      @keyframes confettiFall {
        0%   { transform: translateY(-20px) rotate(0deg); opacity: 1; }
        80%  { opacity: 1; }
        100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
      }
      .modal-backdrop {
        background: rgba(0,0,0,0.6);
        backdrop-filter: blur(4px);
        animation: fadeIn 0.2s ease;
      }
      .modal-content { animation: modalIn 0.3s cubic-bezier(0.34,1.56,0.64,1); }
      @keyframes modalIn {
        from { opacity: 0; transform: scale(0.85) translateY(20px); }
        to   { opacity: 1; transform: scale(1) translateY(0); }
      }
      @keyframes fadeIn {
        from { opacity: 0; }
        to   { opacity: 1; }
      }
      .btn-share {
        background: rgba(34,197,94,0.1);
        border: 1px solid rgba(34,197,94,0.25);
        color: #4ade80;
      }
      .btn-share:hover { background: rgba(34,197,94,0.2); transform: translateY(-1px); }
      .btn-reset {
        background: rgba(239,68,68,0.1);
        border: 1px solid rgba(239,68,68,0.25);
        color: #f87171;
      }
      .btn-reset:hover { background: rgba(239,68,68,0.2); transform: translateY(-1px); }
      .btn-results {
        background: rgba(244,197,66,0.12);
        border: 1px solid rgba(244,197,66,0.3);
        color: #F4C542;
      }
      .btn-results:hover { background: rgba(244,197,66,0.22); transform: translateY(-1px); }
      .match-card:hover { transform: translateY(-1px); }
    `}</style>
  );
}
