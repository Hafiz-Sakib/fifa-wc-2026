import React from "react";
import { MapPin, Clock, Calendar } from "lucide-react";
import FlagIcon from "./FlagIcon";
import { formatDateCard, formatTime, getTimePeriod } from "../utils/dateUtils";
import { isKnockoutRound, getGroupColorClass } from "../utils/countryUtils";

export default function MatchCard({ match }) {
  const knockout = isKnockoutRound(match.group);
  const groupColor = getGroupColorClass(match.group);
  const period = getTimePeriod(match.time);

  const cardClass =
    match.group === "Final"
      ? "glass-card final-card"
      : knockout
        ? "glass-card knockout-card"
        : "glass-card";

  const groupLabel =
    match.group === "Round of 32"
      ? "R32"
      : match.group === "Round of 16"
        ? "R16"
        : match.group === "Quarter-Final"
          ? "QF"
          : match.group === "Semi-Final"
            ? "SF"
            : match.group === "Third Place"
              ? "3rd Place"
              : match.group === "Final"
                ? "🏆 FINAL"
                : `Group ${match.group}`;

  const isFinal = match.group === "Final";

  return (
    <div className={`${cardClass} p-5 fade-in`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <span
          className={`group-badge ${groupColor}`}
          style={
            isFinal
              ? {
                  background: "rgba(244,197,66,0.12)",
                  borderColor: "rgba(244,197,66,0.38)",
                  color: "#F4C542",
                  fontWeight: "800",
                }
              : {}
          }
        >
          {groupLabel}
        </span>
        <div
          className="flex items-center gap-1.5"
          style={{ fontSize: "0.66rem", color: "#64748B" }}
        >
          <Calendar size={10} />
          <span>{formatDateCard(match.date)}</span>
        </div>
      </div>

      {/* Teams row */}
      <div className="flex items-center justify-between gap-3 py-2">
        {/* Team 1 */}
        <div className="flex flex-col items-center gap-2.5 flex-1 min-w-0">
          <div
            className="flag-circle"
            style={
              isFinal
                ? {
                    borderColor: "rgba(244,197,66,0.4)",
                    width: "52px",
                    height: "52px",
                  }
                : {}
            }
          >
            <FlagIcon teamName={match.team1} size={isFinal ? 42 : 36} />
          </div>
          <span
            className="text-center font-semibold leading-tight text-white"
            style={{
              fontSize: "0.82rem",
              wordBreak: "break-word",
              maxWidth: "90px",
            }}
          >
            {match.team1}
          </span>
        </div>

        {/* VS / Score */}
        <div className="flex flex-col items-center gap-2 flex-shrink-0">
          {match.status === "completed" &&
          match.score1 != null &&
          match.score2 != null ? (
            <div className="flex flex-col items-center gap-0.5">
              <span
                style={{
                  fontFamily: "'Barlow Condensed','Hind Siliguri',sans-serif",
                  fontSize: "1.5rem",
                  fontWeight: 800,
                  letterSpacing: "0.04em",
                  color: "#F4C542",
                  lineHeight: 1,
                }}
              >
                {match.score1}
                <span style={{ color: "#475569", margin: "0 4px" }}>–</span>
                {match.score2}
              </span>
              <span
                style={{
                  fontSize: "0.55rem",
                  fontWeight: 700,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  color: "#22C55E",
                }}
              >
                Full Time
              </span>
            </div>
          ) : (
            <span className="vs-badge">VS</span>
          )}
          {isFinal && (
            <span
              style={{
                fontSize: "1.3rem",
                filter: "drop-shadow(0 0 10px rgba(244,197,66,0.7))",
              }}
            >
              🏆
            </span>
          )}
        </div>

        {/* Team 2 */}
        <div className="flex flex-col items-center gap-2.5 flex-1 min-w-0">
          <div
            className="flag-circle"
            style={
              isFinal
                ? {
                    borderColor: "rgba(244,197,66,0.4)",
                    width: "52px",
                    height: "52px",
                  }
                : {}
            }
          >
            <FlagIcon teamName={match.team2} size={isFinal ? 42 : 36} />
          </div>
          <span
            className="text-center font-semibold leading-tight text-white"
            style={{
              fontSize: "0.82rem",
              wordBreak: "break-word",
              maxWidth: "90px",
            }}
          >
            {match.team2}
          </span>
        </div>
      </div>

      {/* Divider */}
      <hr className="gold-line my-3" />

      {/* Footer */}
      <div
        className="flex items-center justify-between gap-2 flex-wrap"
        style={{ fontSize: "0.68rem" }}
      >
        <div className="flex items-center gap-2">
          <Clock size={11} style={{ color: "#22C55E", flexShrink: 0 }} />
          <span
            className="font-bold"
            style={{ color: "#22C55E", fontSize: "0.7rem" }}
          >
            {formatTime(match.time)}
          </span>
          <span className={period.className}>
            {period.emoji} {period.label.split(" ")[0]}
          </span>
        </div>
        <div
          className="flex items-center gap-1.5 text-right"
          style={{ color: "#ffffff" }}
        >
          <MapPin size={10} style={{ flexShrink: 0 }} />
          <span className="truncate" style={{ maxWidth: "145px" }}>
            {match.venue}, {match.city}
          </span>
        </div>
      </div>
    </div>
  );
}
