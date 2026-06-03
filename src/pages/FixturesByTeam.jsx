import React, { useState, useMemo, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Users, Info } from "lucide-react";
import fixtures from "../data/fixtures.json";
import MatchCard from "../components/MatchCard";
import TeamSelector from "../components/TeamSelector";
import FlagIcon from "../components/FlagIcon";
import { sortByDateTime } from "../utils/dateUtils";
import { getAllTeams } from "../utils/countryUtils";

/**
 * FixturesByTeam – lets users pick a team and see all their fixtures.
 */
export default function FixturesByTeam() {
  const location = useLocation();
  const [selectedTeam, setSelectedTeam] = useState(null);

  // Pre-select team or apply search query passed from Home
  useEffect(() => {
    const state = location.state;
    if (!state) return;
    if (state.selectedTeam) {
      setSelectedTeam(state.selectedTeam);
    } else if (state.searchQuery) {
      const query = state.searchQuery.toLowerCase();
      const teams = getAllTeams();
      const match = teams.find((t) => t.toLowerCase().includes(query));
      if (match) setSelectedTeam(match);
    }
  }, [location.state]);

  // Filter fixtures for the selected team
  const teamFixtures = useMemo(() => {
    if (!selectedTeam) return [];
    const matches = fixtures.filter(
      (f) => f.team1 === selectedTeam || f.team2 === selectedTeam,
    );
    return sortByDateTime(matches);
  }, [selectedTeam]);

  // Group stage matches only
  const groupMatches = teamFixtures.filter(
    (f) =>
      ![
        "Round of 32",
        "Round of 16",
        "Quarter-Final",
        "Semi-Final",
        "Third Place",
        "Final",
      ].includes(f.group),
  );

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
                  "linear-gradient(135deg, rgba(42,82,152,0.5), rgba(42,82,152,0.2))",
                border: "1px solid rgba(42,82,152,0.4)",
              }}
            >
              <Users size={18} style={{ color: "#93c5fd" }} />
            </div>
            <h1 className="text-2xl font-bold text-white">Fixtures by Team</h1>
          </div>
          <p className="text-gray-400 text-sm pl-12">
            Select a team to view their complete match schedule in Bangladesh
            Standard Time.
          </p>
        </div>

        {/* Team selector */}
        <div
          className="p-5 mb-8 rounded-2xl"
          style={{
            background: "linear-gradient(135deg, rgba(15,22,40,0.92), rgba(20,28,53,0.88))",
            border: "1px solid rgba(201,168,76,0.18)",
          }}
        >
          <label className="block text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">
            Select Team
          </label>
          <TeamSelector
            selectedTeam={selectedTeam}
            onSelect={setSelectedTeam}
          />
        </div>

        {/* Selected team header */}
        {selectedTeam && (
          <div className="mb-6 fade-in">
            <div className="flex items-center gap-4 mb-4">
              <div className="flag-circle" style={{ width: 52, height: 52 }}>
                <FlagIcon teamName={selectedTeam} size={48} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">{selectedTeam}</h2>
                <p className="text-sm text-gray-400">
                  {teamFixtures.length} match
                  {teamFixtures.length !== 1 ? "es" : ""} scheduled
                  {groupMatches.length > 0 &&
                    ` · Group ${groupMatches[0].group}`}
                </p>
              </div>
            </div>
            <hr className="gold-line" />
          </div>
        )}

        {/* Fixtures grid */}
        {selectedTeam && teamFixtures.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {teamFixtures.map((match) => (
              <MatchCard key={match.id} match={match} />
            ))}
          </div>
        )}

        {/* Empty state – no team selected */}
        {!selectedTeam && (
          <div className="text-center py-20 fade-in">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
              style={{
                background: "rgba(42,82,152,0.15)",
                border: "1px solid rgba(42,82,152,0.25)",
              }}
            >
              <Users size={28} style={{ color: "#60a5fa" }} />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">
              No team selected
            </h3>
            <p className="text-gray-500 text-sm max-w-sm mx-auto">
              Use the selector above to choose a national team and view their
              fixtures.
            </p>
          </div>
        )}

        {/* Empty state – team has no fixtures (shouldn't happen) */}
        {selectedTeam && teamFixtures.length === 0 && (
          <div className="text-center py-16 fade-in">
            <Info size={32} className="mx-auto mb-3 text-gray-600" />
            <h3 className="text-base font-semibold text-white mb-1">
              No fixtures found
            </h3>
            <p className="text-gray-500 text-sm">
              No scheduled matches for {selectedTeam}.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
