import React from "react";
import { Trophy, Globe } from "lucide-react";
import { NavLink } from "react-router-dom";

/**
 * Footer – site footer with links and info.
 */
export default function Footer() {
  return (
    <footer
      className="mt-16 border-t"
      style={{
        borderColor: "rgba(0,200,83,0.12)",
        background: "rgba(6,9,17,0.98)",
      }}
    >
      <div className="max-w-6xl mx-auto px-4 py-10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <div
              className="flex items-center justify-center w-10 h-10 rounded-xl"
              style={{
                background: "linear-gradient(135deg, #00C853, #00E676)",
              }}
            >
              <Trophy size={20} color="#0A0E1A" strokeWidth={2.5} />
            </div>
            <div>
              <div className="font-bold text-white text-sm">
                FIFA World Cup 2026
              </div>
              <div className="text-xs text-gray-500">
                Fixtures · Bangladesh Time (BST)
              </div>
            </div>
          </div>

          {/* Nav links */}
          <div className="flex items-center gap-6">
            {[
              { to: "/", label: "Home" },
              { to: "/by-team", label: "By Team" },
              { to: "/by-date", label: "By Date" },
            ].map(({ to, label }) => (
              <NavLink
                key={to}
                to={to}
                className="text-sm text-gray-400 hover:text-yellow-400 transition-colors no-underline"
              >
                {label}
              </NavLink>
            ))}
          </div>

          {/* Hosts */}
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Globe size={14} />
            <span>USA · Canada · Mexico</span>
          </div>
        </div>

        {/* Bottom bar */}
        <hr className="gold-line my-6" />
        <div className="flex flex-col md:flex-row items-center justify-between gap-2 text-xs text-gray-600">
          <span>© 2026 FIFA World Cup Fixture Tracker. Personal use only.</span>
          <span>
            All match times displayed in Bangladesh Standard Time (UTC+6)
          </span>
        </div>
      </div>
    </footer>
  );
}
