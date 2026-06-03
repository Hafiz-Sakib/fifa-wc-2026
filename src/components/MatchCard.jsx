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
    match.group === "Round of 32" ? "R32"
    : match.group === "Round of 16" ? "R16"
    : match.group === "Quarter-Final" ? "QF"
    : match.group === "Semi-Final" ? "SF"
    : match.group === "Third Place" ? "3rd Place"
    : match.group === "Final" ? "🏆 FINAL"
    : `Group ${match.group}`;

  return (
    <div className={`${cardClass} p-4 fade-in`}>
      {/* Header: Group badge + date */}
      <div className="flex items-center justify-between mb-3">
        <span className={`group-badge ${groupColor} border-current`}>
          {groupLabel}
        </span>
        <div
          className="flex items-center gap-1 text-gray-500"
          style={{ fontSize: "0.7rem" }}
        >
          <Calendar size={10} />
          <span>{formatDateCard(match.date)}</span>
        </div>
      </div>

      {/* Teams row */}
      <div className="flex items-center justify-between gap-2 py-2">
        {/* Team 1 */}
        <div className="flex flex-col items-center gap-1.5 flex-1 min-w-0">
          <div className="flag-circle">
            <FlagIcon teamName={match.team1} size={36} />
          </div>
          <span
            className="text-center font-semibold text-sm leading-tight text-white"
            style={{ wordBreak: "break-word", maxWidth: "90px" }}
          >
            {match.team1}
          </span>
        </div>

        {/* VS */}
        <div className="flex flex-col items-center gap-1 flex-shrink-0">
          <span className="vs-badge">VS</span>
          {match.group === "Final" && (
            <span style={{ fontSize: "1.1rem" }}>🏆</span>
          )}
        </div>

        {/* Team 2 */}
        <div className="flex flex-col items-center gap-1.5 flex-1 min-w-0">
          <div className="flag-circle">
            <FlagIcon teamName={match.team2} size={36} />
          </div>
          <span
            className="text-center font-semibold text-sm leading-tight text-white"
            style={{ wordBreak: "break-word", maxWidth: "90px" }}
          >
            {match.team2}
          </span>
        </div>
      </div>

      {/* Divider */}
      <hr className="gold-line my-2.5" />

      {/* Footer: Time + period + Venue */}
      <div className="flex items-center justify-between gap-2 flex-wrap" style={{ fontSize: "0.72rem" }}>
        {/* Time block */}
        <div className="flex items-center gap-1.5">
          <Clock size={11} style={{ color: "#00C853", flexShrink: 0 }} />
          <span className="font-bold" style={{ color: "#00E676" }}>
            {formatTime(match.time)}
          </span>
          <span className={period.className}>
            {period.emoji} {period.label.split(" ")[0]}
          </span>
        </div>

        {/* Venue */}
        <div className="flex items-center gap-1 text-gray-500 text-right">
          <MapPin size={11} style={{ flexShrink: 0 }} />
          <span className="truncate" style={{ maxWidth: "150px" }}>
            {match.venue}, {match.city}
          </span>
        </div>
      </div>
    </div>
  );
}
