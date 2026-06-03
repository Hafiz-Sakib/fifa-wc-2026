import React, { useState, useRef } from "react";
import { ChevronDown, X, Search } from "lucide-react";
import FlagIcon from "./FlagIcon";
import { getAllTeams } from "../utils/countryUtils";

/**
 * TeamSelector – searchable dropdown for picking a national team.
 * Uses onBlur/tabIndex pattern — no document event listeners needed.
 * Props:
 *   selectedTeam: string | null
 *   onSelect: (team: string | null) => void
 */
export default function TeamSelector({ selectedTeam, onSelect }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const containerRef = useRef(null);

  const teams = getAllTeams().sort();
  const filtered = query
    ? teams.filter((t) => t.toLowerCase().includes(query.toLowerCase()))
    : teams;

  const openDropdown = () => {
    setOpen(true);
  };

  const closeDropdown = () => {
    setOpen(false);
    setQuery("");
  };

  const handleSelect = (team) => {
    onSelect(team);
    closeDropdown();
  };

  const handleClear = (e) => {
    e.stopPropagation();
    onSelect(null);
    setQuery("");
  };

  // Close when focus leaves the entire container
  const handleBlur = (e) => {
    // relatedTarget is the element receiving focus
    // If it's still inside our container, don't close
    if (containerRef.current && containerRef.current.contains(e.relatedTarget)) {
      return;
    }
    closeDropdown();
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full"
      onBlur={handleBlur}
    >
      {/* ── Trigger ── */}
      <div
        role="button"
        tabIndex={0}
        className="field-input w-full flex items-center justify-between gap-3 px-4 py-3 text-sm cursor-pointer select-none"
        onClick={() => (open ? closeDropdown() : openDropdown())}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            open ? closeDropdown() : openDropdown();
          }
          if (e.key === "Escape") closeDropdown();
        }}
      >
        <div className="flex items-center gap-3 min-w-0">
          {selectedTeam ? (
            <>
              <FlagIcon teamName={selectedTeam} size={28} />
              <span className="font-semibold text-white truncate">
                {selectedTeam}
              </span>
            </>
          ) : (
            <span className="text-gray-400">Select a team…</span>
          )}
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          {selectedTeam && (
            <span
              role="button"
              tabIndex={0}
              onClick={handleClear}
              onKeyDown={(e) => e.key === "Enter" && handleClear(e)}
              className="p-1 rounded hover:bg-white/10 text-gray-400 hover:text-white transition-colors cursor-pointer"
              title="Clear selection"
            >
              <X size={14} />
            </span>
          )}
          <ChevronDown
            size={16}
            className="text-gray-400 transition-transform duration-200"
            style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)" }}
          />
        </div>
      </div>

      {/* ── Dropdown panel ── */}
      {open && (
        <div
          className="absolute left-0 right-0 mt-1 rounded-xl shadow-2xl"
          style={{
            background: "##0a1710",
            border: "1px solid rgba(0,200,83,0.3)",
            zIndex: 9999,
          }}
        >
          {/* Search input */}
          <div
            className="p-2"
            style={{ borderBottom: "1px solid rgba(0,200,83,0.15)" }}
          >
            <div className="relative">
              <Search
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                style={{ color: "#00C853" }}
              />
              <input
                type="text"
                className="field-input w-full pl-9 pr-3 py-2 text-sm"
                placeholder="Search team…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Escape" && closeDropdown()}
                autoFocus
              />
            </div>
          </div>

          {/* Team list */}
          <div
            className="overflow-y-auto"
            style={{ maxHeight: "280px" }}
          >
            {filtered.length === 0 ? (
              <div className="px-4 py-8 text-center text-gray-500 text-sm">
                No teams found for "{query}"
              </div>
            ) : (
              filtered.map((team) => {
                const isSelected = selectedTeam === team;
                return (
                  <div
                    key={team}
                    role="option"
                    aria-selected={isSelected}
                    tabIndex={0}
                    onMouseDown={(e) => {
                      // Use onMouseDown + preventDefault so the container's
                      // onBlur does NOT fire before we can call handleSelect
                      e.preventDefault();
                      handleSelect(team);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        handleSelect(team);
                      }
                    }}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm cursor-pointer transition-colors"
                    style={{
                      background: isSelected
                        ? "rgba(0,200,83,0.15)"
                        : "transparent",
                      color: isSelected ? "#00E676" : "#e2e8f0",
                    }}
                    onMouseEnter={(e) => {
                      if (!isSelected)
                        e.currentTarget.style.background =
                          "rgba(255,255,255,0.06)";
                    }}
                    onMouseLeave={(e) => {
                      if (!isSelected)
                        e.currentTarget.style.background = "transparent";
                    }}
                  >
                    <FlagIcon teamName={team} size={24} />
                    <span className="font-medium">{team}</span>
                    {isSelected && (
                      <span
                        className="ml-auto text-xs font-bold"
                        style={{ color: "#00C853" }}
                      >
                        ✓
                      </span>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
