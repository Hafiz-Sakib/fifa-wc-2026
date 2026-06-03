import React, { useState, useMemo, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Users, Info } from "lucide-react";
import fixtures from "../data/fixtures.json";
import MatchCard from "../components/MatchCard";
import TeamSelector from "../components/TeamSelector";
import FlagIcon from "../components/FlagIcon";
import { sortByDateTime } from "../utils/dateUtils";
import { getAllTeams } from "../utils/countryUtils";

export default function FixturesByTeam() {
  const location = useLocation();
  const [selectedTeam, setSelectedTeam] = useState(null);

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

  const teamFixtures = useMemo(() => {
    if (!selectedTeam) return [];
    return sortByDateTime(
      fixtures.filter((f) => f.team1 === selectedTeam || f.team2 === selectedTeam)
    );
  }, [selectedTeam]);

  const groupMatches = teamFixtures.filter(
    (f) => !["Round of 32","Round of 16","Quarter-Final","Semi-Final","Third Place","Final"].includes(f.group)
  );

  return (
    <div style={{ background: "var(--bg, #03080A)", minHeight: "100vh" }}>
      <div className="max-w-5xl mx-auto px-4 py-10">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{
                background: "linear-gradient(135deg, rgba(0,200,83,0.3), rgba(0,200,83,0.1))",
                border: "1px solid rgba(0,200,83,0.35)",
              }}
            >
              <Users size={18} style={{ color: "#00E676" }} />
            </div>
            <h1 className="text-4xl text-white tracking-wide">Fixtures by Team</h1>
          </div>
          <p className="text-gray-400 text-sm pl-12">
            একটি দল বেছে নিন এবং Bangladesh Standard Time অনুযায়ী তাদের সব ম্যাচ দেখুন।
          </p>
        </div>

        {/* Selector */}
        <div
          className="p-5 mb-8 rounded-2xl"
          style={{
            background: "linear-gradient(135deg, rgba(10,23,16,0.95), rgba(15,32,22,0.90))",
            border: "1px solid rgba(0,200,83,0.2)",
          }}
        >
          <label className="block text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">
            Select Team
          </label>
          <TeamSelector selectedTeam={selectedTeam} onSelect={setSelectedTeam} />
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
                  {teamFixtures.length} match{teamFixtures.length !== 1 ? "es" : ""} scheduled
                  {groupMatches.length > 0 && ` · Group ${groupMatches[0].group}`}
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

        {/* Empty: no team */}
        {!selectedTeam && (
          <div className="text-center py-20 fade-in">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
              style={{ background: "rgba(0,200,83,0.08)", border: "1px solid rgba(0,200,83,0.2)" }}
            >
              <Users size={28} style={{ color: "#00C853" }} />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">কোনো দল নির্বাচিত হয়নি</h3>
            <p className="text-gray-500 text-sm max-w-sm mx-auto">
              উপরের dropdown থেকে একটি দল বেছে নিন।
            </p>
          </div>
        )}

        {/* Empty: no fixtures */}
        {selectedTeam && teamFixtures.length === 0 && (
          <div className="text-center py-16 fade-in">
            <Info size={32} className="mx-auto mb-3 text-gray-600" />
            <h3 className="text-base font-semibold text-white mb-1">No fixtures found</h3>
            <p className="text-gray-500 text-sm">No scheduled matches for {selectedTeam}.</p>
          </div>
        )}
      </div>
    </div>
  );
}
