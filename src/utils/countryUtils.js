export const COUNTRY_CODES = {
  // Group A
  Mexico: "MX", Poland: "PL", "South Africa": "ZA", Cameroon: "CM",
  // Group B
  USA: "US", Honduras: "HN", Panama: "PA", Uruguay: "UY",
  // Group C
  Germany: "DE", Japan: "JP", Australia: "AU", "New Zealand": "NZ",
  // Group D
  France: "FR", "Saudi Arabia": "SA", Denmark: "DK", Peru: "PE",
  // Group E
  Spain: "ES", Venezuela: "VE", Portugal: "PT", Algeria: "DZ",
  // Group F
  Brazil: "BR", Serbia: "RS", Croatia: "HR", "Trinidad and Tobago": "TT",
  // Group G
  Netherlands: "NL", Senegal: "SN", "South Korea": "KR", Nigeria: "NG",
  // Group H
  Argentina: "AR", Iran: "IR", Morocco: "MA", Haiti: "HT",
  // Group I
  England: "GB-ENG", Egypt: "EG", Colombia: "CO", Turkey: "TR",
  // Group J
  Belgium: "BE", Ukraine: "UA", Switzerland: "CH", Mali: "ML",
  // Group K
  Ecuador: "EC", "Costa Rica": "CR", Hungary: "HU", "Côte d'Ivoire": "CI",
  // Group L
  Italy: "IT", Cuba: "CU", Norway: "NO", TBD: null,
};

export function getCountryCode(teamName) {
  return COUNTRY_CODES[teamName] || null;
}

export function getAllTeams() {
  return Object.keys(COUNTRY_CODES).filter(
    (t) =>
      t !== "TBD" &&
      !t.startsWith("Winner") &&
      !t.startsWith("Loser") &&
      !t.startsWith("1") &&
      !t.startsWith("2") &&
      !t.startsWith("3rd"),
  );
}

export function getGroupColorClass(group) {
  const map = {
    A: "text-emerald-400",
    B: "text-green-300",
    C: "text-teal-400",
    D: "text-cyan-400",
    E: "text-sky-400",
    F: "text-blue-400",
    G: "text-violet-400",
    H: "text-purple-400",
    I: "text-fuchsia-400",
    J: "text-rose-400",
    K: "text-orange-400",
    L: "text-yellow-300",
    "Round of 32": "text-sky-300",
    "Round of 16": "text-cyan-300",
    "Quarter-Final": "text-teal-300",
    "Semi-Final": "text-green-300",
    "Third Place": "text-emerald-300",
    Final: "text-green-400",
  };
  return map[group] || "text-gray-400";
}

export function isKnockoutRound(group) {
  return [
    "Round of 32", "Round of 16", "Quarter-Final",
    "Semi-Final", "Third Place", "Final",
  ].includes(group);
}
