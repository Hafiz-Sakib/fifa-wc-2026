import React, { useState, useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { Menu, X, Trophy, Users, CalendarDays } from "lucide-react";

const NAV_LINKS = [
  { to: "/",        label: "Home",    icon: Trophy      },
  { to: "/by-team", label: "By Team", icon: Users       },
  { to: "/by-date", label: "By Date", icon: CalendarDays },
];

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled]   = useState(false);
  const location = useLocation();

  useEffect(() => setMenuOpen(false), [location]);

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", h);
    return () => window.removeEventListener("scroll", h);
  }, []);

  return (
    <header
      className="sticky top-0 z-50 navbar-bg"
      style={{ boxShadow: scrolled ? "0 4px 24px rgba(0,0,0,0.5)" : "none" }}
    >
      <div className="max-w-6xl mx-auto px-4 flex items-center justify-between h-14">
        {/* Logo */}
        <NavLink to="/" className="flex items-center gap-2.5 no-underline">
          <div
            className="flex items-center justify-center w-8 h-8 rounded-lg flex-shrink-0"
            style={{ background: "linear-gradient(135deg, #00C853, #00E676)" }}
          >
            <Trophy size={16} color="#050d0a" strokeWidth={2.5} />
          </div>
          <div className="leading-none">
            <div
              className="text-xs font-semibold tracking-widest uppercase"
              style={{ color: "#00C853", letterSpacing: "2px" }}
            >
              FIFA
            </div>
            <div className="text-sm font-bold text-white leading-none">
              World Cup 2026
            </div>
          </div>
        </NavLink>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1">
          {NAV_LINKS.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === "/"}
              className={({ isActive }) =>
                `flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all no-underline ${
                  isActive
                    ? "text-green-300 bg-green-400/10"
                    : "text-gray-400 hover:text-white hover:bg-white/5"
                }`
              }
            >
              <Icon size={15} />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* BST badge */}
        <div className="hidden md:flex items-center gap-2">
          <span
            className="text-xs font-semibold px-2.5 py-1 rounded-full"
            style={{
              background: "rgba(0,200,83,0.1)",
              color: "#00C853",
              border: "1px solid rgba(0,200,83,0.25)",
            }}
          >
            🕐 BST UTC+6
          </span>
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden p-2 rounded-lg transition-colors text-gray-400 hover:text-white"
          onClick={() => setMenuOpen((m) => !m)}
          aria-label="Toggle menu"
        >
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden mobile-menu px-4 pb-4 fade-in">
          {NAV_LINKS.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === "/"}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl mb-1 text-sm font-medium transition-all no-underline ${
                  isActive
                    ? "text-green-300 bg-green-400/10"
                    : "text-gray-300 hover:text-white hover:bg-white/5"
                }`
              }
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
          <div className="mt-2 px-4">
            <span
              className="text-xs font-semibold px-2.5 py-1 rounded-full"
              style={{
                background: "rgba(0,200,83,0.1)",
                color: "#00C853",
                border: "1px solid rgba(0,200,83,0.25)",
              }}
            >
              🕐 সব সময় Bangladesh Standard Time (BST / UTC+6)
            </span>
          </div>
        </div>
      )}
    </header>
  );
}
