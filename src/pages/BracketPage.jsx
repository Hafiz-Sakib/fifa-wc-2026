import React, { useRef, useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ZoomIn, ZoomOut, Trophy, RotateCcw } from "lucide-react";
import matchesData from "../data/matches.json";

const STAGES = [
  "Round of 32",
  "Round of 16",
  "Quarter Final",
  "Semi Final",
  "Final",
];

const STAGE_LABELS = {
  "Round of 32": "R32",
  "Round of 16": "R16",
  "Quarter Final": "QF",
  "Semi Final": "SF",
  Final: "Final",
};

function MatchBox({ match, isChampion }) {
  if (!match) {
    return (
      <div className="bracket-match-empty">
        <div className="bracket-team tbd">
          <span className="bracket-flag">?</span>
          <span>TBD</span>
        </div>
        <div className="bracket-team tbd">
          <span className="bracket-flag">?</span>
          <span>TBD</span>
        </div>
      </div>
    );
  }

  const homeWin = match.homeScore !== null && match.homeScore > match.awayScore;
  const awayWin = match.homeScore !== null && match.awayScore > match.homeScore;

  return (
    <motion.div
      className={`bracket-match ${isChampion ? "champion-match" : ""}`}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
    >
      <div
        className={`bracket-team ${homeWin ? "winner" : awayWin ? "loser" : ""}`}
      >
        <span className="bracket-flag">{match.homeTeam.flag}</span>
        <span className="bracket-name">{match.homeTeam.name}</span>
        {match.homeScore !== null && (
          <span className={`bracket-score ${homeWin ? "score-win" : ""}`}>
            {match.homeScore}
          </span>
        )}
      </div>
      <div
        className={`bracket-team ${awayWin ? "winner" : homeWin ? "loser" : ""}`}
      >
        <span className="bracket-flag">{match.awayTeam.flag}</span>
        <span className="bracket-name">{match.awayTeam.name}</span>
        {match.awayScore !== null && (
          <span className={`bracket-score ${awayWin ? "score-win" : ""}`}>
            {match.awayScore}
          </span>
        )}
      </div>
    </motion.div>
  );
}

function TrophyCenter() {
  return (
    <motion.div
      className="trophy-center"
      animate={{ y: [0, -8, 0] }}
      transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
    >
      <div className="trophy-glow" />
      <div className="trophy-icon">🏆</div>
      <div className="trophy-label">CHAMPION</div>
    </motion.div>
  );
}

export default function BracketPage() {
  const scrollRef = useRef(null);
  const [zoom, setZoom] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, scrollLeft: 0 });

  const matchesByStage = {};
  STAGES.forEach((s) => {
    matchesByStage[s] = matchesData.filter((m) => m.stage === s);
  });

  const handleMouseDown = (e) => {
    if (!scrollRef.current) return;
    setIsDragging(true);
    setDragStart({
      x: e.pageX - scrollRef.current.offsetLeft,
      scrollLeft: scrollRef.current.scrollLeft,
    });
  };

  const handleMouseMove = (e) => {
    if (!isDragging || !scrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - dragStart.x) * 1.5;
    scrollRef.current.scrollLeft = dragStart.scrollLeft - walk;
  };

  const handleMouseUp = () => setIsDragging(false);

  const handleTouchStart = (e) => {
    if (!scrollRef.current) return;
    setDragStart({
      x: e.touches[0].pageX,
      scrollLeft: scrollRef.current.scrollLeft,
    });
  };

  const handleTouchMove = (e) => {
    if (!scrollRef.current) return;
    const walk = (e.touches[0].pageX - dragStart.x) * 1.5;
    scrollRef.current.scrollLeft = dragStart.scrollLeft - walk;
  };

  const stageColCounts = {
    "Round of 32": 8,
    "Round of 16": 4,
    "Quarter Final": 4,
    "Semi Final": 2,
    Final: 1,
  };

  return (
    <div className="py-10">
      <div className="page-container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <h1 className="section-title gold-text mb-2">Tournament Bracket</h1>
          <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>
            Interactive knockout bracket · Drag to navigate · Pinch or use
            buttons to zoom
          </p>
        </motion.div>

        {/* Zoom controls */}
        <div className="flex items-center gap-2 mb-4">
          <button
            onClick={() => setZoom((z) => Math.min(z + 0.15, 1.8))}
            className="p-2 rounded-lg border border-white/10 hover:border-yellow-400/50 transition-colors"
            style={{ color: "var(--color-text-muted)" }}
          >
            <ZoomIn size={16} />
          </button>
          <button
            onClick={() => setZoom((z) => Math.max(z - 0.15, 0.4))}
            className="p-2 rounded-lg border border-white/10 hover:border-yellow-400/50 transition-colors"
            style={{ color: "var(--color-text-muted)" }}
          >
            <ZoomOut size={16} />
          </button>
          <button
            onClick={() => setZoom(1)}
            className="p-2 rounded-lg border border-white/10 hover:border-yellow-400/50 transition-colors"
            style={{ color: "var(--color-text-muted)" }}
          >
            <RotateCcw size={14} />
          </button>
          <span
            className="text-xs ml-2"
            style={{ color: "var(--color-text-muted)" }}
          >
            {Math.round(zoom * 100)}%
          </span>
        </div>

        <div className="glass-card p-4 overflow-hidden">
          <div
            ref={scrollRef}
            className="overflow-x-auto overflow-y-hidden select-none"
            style={{ cursor: isDragging ? "grabbing" : "grab" }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
          >
            <div
              style={{
                transform: `scale(${zoom})`,
                transformOrigin: "top left",
                width: zoom < 1 ? `${100 / zoom}%` : "auto",
                minWidth: "900px",
                transition: "transform 0.2s ease",
                padding: "16px",
              }}
            >
              {/* Stage headers */}
              <div className="flex items-center mb-4">
                {STAGES.map((stage, i) => (
                  <div
                    key={stage}
                    className="flex items-center justify-center text-center"
                    style={{
                      minWidth: stage === "Final" ? "220px" : "200px",
                      flex: stage === "Final" ? "0 0 220px" : "0 0 200px",
                      marginRight: i < STAGES.length - 1 ? "32px" : "0",
                    }}
                  >
                    <span
                      className="text-xs font-bold tracking-widest uppercase px-3 py-1 rounded-full"
                      style={{
                        background: "rgba(245,158,11,0.15)",
                        color: "#f59e0b",
                        border: "1px solid rgba(245,158,11,0.3)",
                      }}
                    >
                      {stage}
                    </span>
                  </div>
                ))}
              </div>

              {/* Bracket body */}
              <div className="flex items-start gap-8">
                {STAGES.map((stage, stageIdx) => {
                  const matches = matchesByStage[stage] || [];
                  const isFinal = stage === "Final";

                  return (
                    <div
                      key={stage}
                      className="flex flex-col"
                      style={{
                        minWidth: isFinal ? "220px" : "200px",
                        flex: isFinal ? "0 0 220px" : "0 0 200px",
                        gap: isFinal ? "0" : `${Math.pow(2, stageIdx) * 20}px`,
                        justifyContent: isFinal ? "center" : "flex-start",
                        alignItems: "stretch",
                        minHeight: "600px",
                      }}
                    >
                      {isFinal ? (
                        <div
                          className="flex flex-col items-center justify-center h-full gap-4"
                          style={{ minHeight: "600px" }}
                        >
                          <TrophyCenter />
                          {matches[0] && (
                            <MatchBox match={matches[0]} isChampion />
                          )}
                        </div>
                      ) : (
                        matches.map((match, i) => (
                          <MatchBox key={match.id || i} match={match} />
                        ))
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Legend */}
        <div
          className="flex flex-wrap gap-4 mt-4 text-xs"
          style={{ color: "var(--color-text-muted)" }}
        >
          <div className="flex items-center gap-1.5">
            <div
              className="w-2.5 h-2.5 rounded-sm"
              style={{ background: "#22c55e" }}
            />
            <span>Winner / Advances</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div
              className="w-2.5 h-2.5 rounded-sm"
              style={{
                background: "rgba(245,158,11,0.4)",
                border: "1px solid #f59e0b",
              }}
            />
            <span>Final</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div
              className="w-2.5 h-2.5 rounded-sm"
              style={{ background: "rgba(255,255,255,0.06)" }}
            />
            <span>TBD</span>
          </div>
        </div>
      </div>
    </div>
  );
}
