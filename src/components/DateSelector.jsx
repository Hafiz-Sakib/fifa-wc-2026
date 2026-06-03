import React, { useState } from "react";
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react";
import {
  getUniqueDates,
  formatDateShort,
  getDayAbbr,
  groupDatesByMonth,
} from "../utils/dateUtils";
import dayjs from "dayjs";

/**
 * DateSelector – shows match dates grouped by month as scrollable chips.
 * Props:
 *   fixtures: array of fixture objects
 *   selectedDate: string | null  (e.g. "2026-06-11")
 *   onSelect: (date: string | null) => void
 */
export default function DateSelector({ fixtures, selectedDate, onSelect }) {
  const dates = getUniqueDates(fixtures);
  const monthGroups = groupDatesByMonth(dates);
  const monthKeys = Object.keys(monthGroups);
  const [monthIdx, setMonthIdx] = useState(0);

  const currentMonth = monthKeys[monthIdx];
  const datesInMonth = monthGroups[currentMonth] || [];

  return (
    <div className="w-full">
      {/* Month navigator */}
      <div className="flex items-center justify-between mb-3">
        <button
          type="button"
          disabled={monthIdx === 0}
          onClick={() => setMonthIdx((i) => i - 1)}
          className="p-2 rounded-lg transition-all disabled:opacity-30 disabled:cursor-not-allowed"
          style={{ color: "#00C853" }}
          onMouseEnter={(e) => {
            if (monthIdx > 0)
              e.currentTarget.style.background = "rgba(0,200,83,0.1)";
          }}
          onMouseLeave={(e) =>
            (e.currentTarget.style.background = "transparent")
          }
        >
          <ChevronLeft size={18} />
        </button>

        <div className="flex items-center gap-2">
          <Calendar size={15} style={{ color: "#00C853" }} />
          <span className="font-semibold text-white text-sm">
            {currentMonth}
          </span>
        </div>

        <button
          type="button"
          disabled={monthIdx === monthKeys.length - 1}
          onClick={() => setMonthIdx((i) => i + 1)}
          className="p-2 rounded-lg transition-all disabled:opacity-30 disabled:cursor-not-allowed"
          style={{ color: "#00C853" }}
          onMouseEnter={(e) => {
            if (monthIdx < monthKeys.length - 1)
              e.currentTarget.style.background = "rgba(0,200,83,0.1)";
          }}
          onMouseLeave={(e) =>
            (e.currentTarget.style.background = "transparent")
          }
        >
          <ChevronRight size={18} />
        </button>
      </div>

      {/* Date chips */}
      <div className="flex flex-wrap gap-2">
        {datesInMonth.map((date) => {
          const isActive = date === selectedDate;
          const dayNum = dayjs(date).format("D");
          const dayAbbr = getDayAbbr(date);
          return (
            <button
              key={date}
              type="button"
              onClick={() => onSelect(isActive ? null : date)}
              className="flex flex-col items-center px-3 py-2 rounded-xl text-xs font-medium transition-all"
              style={{
                minWidth: "52px",
                background: isActive
                  ? "linear-gradient(135deg, #00C853, #00E676)"
                  : "rgba(15,22,40,0.85)",
                color: isActive ? "#0A0E1A" : "#94a3b8",
                border: isActive
                  ? "1px solid #00E676"
                  : "1px solid rgba(0,200,83,0.18)",
                fontWeight: isActive ? 700 : 500,
              }}
            >
              <span style={{ fontSize: "0.65rem", opacity: 0.75 }}>
                {dayAbbr}
              </span>
              <span style={{ fontSize: "1rem", fontWeight: 700 }}>
                {dayNum}
              </span>
            </button>
          );
        })}
      </div>

      {/* All dates dropdown fallback for smaller screens */}
      <div className="mt-3">
        <select
          className="field-input w-full px-3 py-2.5 text-sm"
          value={selectedDate || ""}
          onChange={(e) => onSelect(e.target.value || null)}
        >
          <option value="">— All Dates —</option>
          {dates.map((d) => (
            <option key={d} value={d}>
              {dayjs(d).format("ddd, D MMM YYYY")}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
