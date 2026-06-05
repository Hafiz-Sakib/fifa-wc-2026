import React, { useState, useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  Menu,
  X,
  Trophy,
  Users,
  CalendarDays,
  Zap,
  Shirt,
  Brain,
} from "lucide-react";

const NAV_LINKS = [
  { to: "/", label: "Home", icon: Trophy },
  { to: "/by-team", label: "Teams", icon: Users },
  { to: "/by-date", label: "Dates", icon: CalendarDays },
  { to: "/squads", label: "Squads", icon: Shirt },
  { to: "/quiz", label: "Quiz", icon: Brain },
];

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => setMenuOpen(false), [location]);
  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", h);
    return () => window.removeEventListener("scroll", h);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${scrolled ? "navbar-scrolled" : "navbar-bg"}`}
    >
      <div
        className="max-w-6xl mx-auto px-4 md:px-6 flex items-center justify-between"
        style={{ height: "62px" }}
      >
        {/* Logo */}
        <NavLink to="/" className="flex items-center gap-3 no-underline group">
          <div
            className="flex items-center justify-center w-9 h-9 rounded-xl flex-shrink-0 relative overflow-hidden"
            style={{ background: "linear-gradient(135deg, #15803D, #16A34A)" }}
          >
            <Trophy size={17} color="#fff" strokeWidth={2.5} />
          </div>
          <div className="leading-none">
            <div
              className="text-xs font-bold tracking-widest uppercase"
              style={{
                color: "#22C55E",
                letterSpacing: "3px",
                fontSize: "0.62rem",
              }}
            >
              FIFA
            </div>
            <div
              className="text-sm text-white tracking-wide font-semibold"
              style={{
                fontFamily: "'Barlow Condensed', 'Hind Siliguri', sans-serif",
                fontSize: "1rem",
                letterSpacing: "0.04em",
              }}
            >
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
                `flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all no-underline ` +
                (isActive
                  ? "text-white bg-green-600/20 border border-green-500/30"
                  : "text-slate-400 hover:text-white hover:bg-white/5 border border-transparent")
              }
            >
              <Icon size={14} /> {label}
            </NavLink>
          ))}
        </nav>

        {/* BST badge */}
        <div className="hidden md:flex items-center gap-2">
          <div
            className="flex items-center gap-2 text-xs font-semibold px-3 py-2 rounded-full"
            style={{
              background: "rgba(22,163,74,0.1)",
              color: "#22C55E",
              border: "1px solid rgba(22,163,74,0.25)",
            }}
          >
            <Zap size={10} />
            <span>BST UTC+6</span>
          </div>
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden p-2 rounded-xl transition-colors"
          style={{ color: "#94A3B8" }}
          onClick={() => setMenuOpen((m) => !m)}
          aria-label="Toggle menu"
        >
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden mobile-menu px-4 pb-5 fade-in">
          <div className="pt-2 space-y-1">
            {NAV_LINKS.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                end={to === "/"}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all no-underline ` +
                  (isActive
                    ? "text-white bg-green-600/15 border border-green-500/25"
                    : "text-slate-300 hover:text-white hover:bg-white/5 border border-transparent")
                }
              >
                <Icon size={17} /> {label}
              </NavLink>
            ))}
          </div>
          <div className="mt-3 px-2">
            <span
              className="text-xs font-semibold px-3 py-2 rounded-full inline-flex items-center gap-2"
              style={{
                background: "rgba(22,163,74,0.1)",
                color: "#22C55E",
                border: "1px solid rgba(22,163,74,0.22)",
              }}
            >
              <Zap size={10} /> Bangladesh Standard Time (BST / UTC+6)
            </span>
          </div>
        </div>
      )}
    </header>
  );
}
