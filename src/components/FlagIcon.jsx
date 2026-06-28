import React from "react";
import { getCountryCode } from "../utils/countryUtils";

/**
 * Renders a country flag as a circular image.
 * Uses flagcdn.com which supports GB-ENG, GB-SCT via their special codes.
 * Falls back to initials placeholder if code not found.
 */
export default function FlagIcon({ teamName, size = 32, className = "" }) {
  const code = getCountryCode(teamName);

  if (!code) {
    return (
      <div
        className={`flex items-center justify-center rounded-full bg-gray-700 border border-gray-600 flex-shrink-0 ${className}`}
        style={{ width: size, height: size, minWidth: size }}
        title={teamName}
      >
        <span
          style={{
            fontSize: size * 0.36,
            color: "#9ca3af",
            fontWeight: 700,
            fontFamily: "inherit",
            lineHeight: 1,
          }}
        >
          {teamName ? teamName.slice(0, 2).toUpperCase() : "?"}
        </span>
      </div>
    );
  }

  // Build flag URL
  // flagcdn.com supports lowercase 2-letter ISO codes
  // For England (GB-ENG) and Scotland (GB-SCT), use country-flag-icons CDN
  // which hosts subdivision flags as SVGs
  let flagUrl;
  if (code.startsWith("GB-")) {
    flagUrl = `https://purecatamphetamine.github.io/country-flag-icons/3x2/${code}.svg`;
  } else {
    flagUrl = `https://flagcdn.com/w80/${code.toLowerCase()}.png`;
  }

  return (
    <div
      className={`rounded-full overflow-hidden border border-gray-600 flex-shrink-0 ${className}`}
      style={{ width: size, height: size, minWidth: size }}
      title={teamName}
    >
      <img
        src={flagUrl}
        alt={`${teamName} flag`}
        title={teamName}
        style={{ width: "100%", height: "100%", objectFit: "cover" }}
        loading="lazy"
        onError={(e) => {
          // Fallback: show initials
          e.target.style.display = "none";
          const parent = e.target.parentElement;
          if (parent) {
            parent.style.background = "#374151";
            parent.style.display = "flex";
            parent.style.alignItems = "center";
            parent.style.justifyContent = "center";
            const span = document.createElement("span");
            span.textContent = teamName ? teamName.slice(0, 2).toUpperCase() : "?";
            span.style.cssText = `font-size:${size * 0.36}px;color:#9ca3af;font-weight:700;`;
            parent.appendChild(span);
          }
        }}
      />
    </div>
  );
}
