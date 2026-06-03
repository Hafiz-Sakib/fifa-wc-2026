import React, { useState, useMemo } from "react";
import { CalendarDays, Info } from "lucide-react";
import fixtures from "../data/fixtures.json";
import MatchCard from "../components/MatchCard";
import DateSelector from "../components/DateSelector";
import { groupByDate, formatDate } from "../utils/dateUtils";

/**
 * FixturesByDate – lets users pick a date and see all matches on that day.
 */
export default function FixturesByDate() {
  const [selectedDate, setSelectedDate] = useState(null);

  const groupedFixtures = useMemo(() => groupByDate(fixtures), []);

  const matchesForDate = useMemo(() => {
    if (!selectedDate) return [];
    return groupedFixtures[selectedDate] || [];
  }, [selectedDate, groupedFixtures]);

  return (
    <div style={{ background: "#0A0E1A", minHeight: "100vh" }}>
      <div className="max-w-5xl mx-auto px-4 py-10">
        {/* Page header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{
                background:
                  "linear-gradient(135deg, rgba(201,168,76,0.35), rgba(201,168,76,0.15))",
                border: "1px solid rgba(201,168,76,0.4)",
              }}
            >
              <CalendarDays size={18} style={{ color: "#C9A84C" }} />
            </div>
            <h1 className="text-2xl font-bold text-white">Fixtures by Date</h1>
          </div>
          <p className="text-gray-400 text-sm pl-12">
            Select a date to view all matches scheduled in Bangladesh Standard
            Time.
          </p>
        </div>

        {/* Date selector */}
        <div className="glass-card p-5 mb-8">
          <label className="block text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">
            Select Date
          </label>
          <DateSelector
            fixtures={fixtures}
            selectedDate={selectedDate}
            onSelect={setSelectedDate}
          />
        </div>

        {/* Selected date header */}
        {selectedDate && (
          <div className="mb-6 fade-in">
            <div className="flex items-center gap-3 mb-4">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{
                  background: "linear-gradient(135deg, #C9A84C, #F0C040)",
                }}
              >
                <CalendarDays size={18} color="#0A0E1A" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">
                  {formatDate(selectedDate)}
                </h2>
                <p className="text-sm text-gray-400">
                  {matchesForDate.length} match
                  {matchesForDate.length !== 1 ? "es" : ""} scheduled
                </p>
              </div>
            </div>
            <hr className="gold-line" />
          </div>
        )}

        {/* Fixtures grid */}
        {selectedDate && matchesForDate.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {matchesForDate.map((match) => (
              <MatchCard key={match.id} match={match} />
            ))}
          </div>
        )}

        {/* Empty state – no date selected */}
        {!selectedDate && (
          <div className="text-center py-20 fade-in">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
              style={{
                background: "rgba(201,168,76,0.12)",
                border: "1px solid rgba(201,168,76,0.22)",
              }}
            >
              <CalendarDays size={28} style={{ color: "#C9A84C" }} />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">
              No date selected
            </h3>
            <p className="text-gray-500 text-sm max-w-sm mx-auto">
              Use the date picker above to choose a match day and view all
              fixtures.
            </p>
          </div>
        )}

        {/* Empty state – date has no fixtures */}
        {selectedDate && matchesForDate.length === 0 && (
          <div className="text-center py-16 fade-in">
            <Info size={32} className="mx-auto mb-3 text-gray-600" />
            <h3 className="text-base font-semibold text-white mb-1">
              No fixtures found
            </h3>
            <p className="text-gray-500 text-sm">
              No matches scheduled for {formatDate(selectedDate)}.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
