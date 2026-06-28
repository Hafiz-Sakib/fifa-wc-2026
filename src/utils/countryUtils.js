export const COUNTRY_CODES = {
  // ── FIFA WC 2026 actual 48 participants ──
  Mexico: "MX",
  "South Korea": "KR",
  Czechia: "CZ",
  Canada: "CA",
  "Bosnia-Herzegovina": "BA",
  Qatar: "QA",
  Switzerland: "CH",
  Brazil: "BR",
  Morocco: "MA",
  Haiti: "HT",
  Scotland: "GB-SCT",
  USA: "US",
  Paraguay: "PY",
  Australia: "AU",
  Turkey: "TR",
  Germany: "DE",
  Curacao: "CW",
  "Ivory Coast": "CI",
  Ecuador: "EC",
  Netherlands: "NL",
  Japan: "JP",
  Sweden: "SE",
  Tunisia: "TN",
  Belgium: "BE",
  Egypt: "EG",
  Iran: "IR",
  "New Zealand": "NZ",
  Spain: "ES",
  "Cape Verde": "CV",
  "Saudi Arabia": "SA",
  Uruguay: "UY",
  France: "FR",
  Senegal: "SN",
  Iraq: "IQ",
  Norway: "NO",
  Argentina: "AR",
  Algeria: "DZ",
  Austria: "AT",
  Jordan: "JO",
  Portugal: "PT",
  Congo: "CG",
  Uzbekistan: "UZ",
  Colombia: "CO",
  England: "GB-ENG",
  Croatia: "HR",
  Ghana: "GH",
  Panama: "PA",
  "South Africa": "ZA",
};

// Historical / non-2026 teams referenced in UI sections (past champions,
// "who are you supporting", trivia). Kept separate so getAllTeams() still
// returns exactly the 48 participants.
export const EXTRA_COUNTRY_CODES = {
  Italy: "IT",
  Denmark: "DK",
  Serbia: "RS",
  Poland: "PL",
  Ukraine: "UA",
  Chile: "CL",
  Peru: "PE",
  Venezuela: "VE",
  Wales: "GB-WLS",
  "Northern Ireland": "GB-NIR",
  "Republic of Ireland": "IE",
  Nigeria: "NG",
  Cameroon: "CM",
  Russia: "RU",
};

export function getCountryCode(teamName) {
  return COUNTRY_CODES[teamName] || EXTRA_COUNTRY_CODES[teamName] || null;
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
    "Round of 32",
    "Round of 16",
    "Quarter-Final",
    "Semi-Final",
    "Third Place",
    "Final",
  ].includes(group);
}
