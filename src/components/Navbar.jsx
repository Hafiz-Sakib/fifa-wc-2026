import React, { useState, useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { Menu, X, Trophy, Users, CalendarDays, Zap } from "lucide-react";

const NAV_LINKS = [
  { to: "/",        label: "Home",    icon: Trophy       },
  { to: "/by-team", label: "By Team", icon: Users        },
  { to: "/by-date", label: "By Date", icon: CalendarDays },
];

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled]  = useState(false);
  const location = useLocation();

  useEffect(() => setMenuOpen(false), [location]);
  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 12);
    window.addEventListener("scroll", h);
    return () => window.removeEventListener("scroll", h);
  }, []);

  return (
    <header
      className="sticky top-0 z-50 navbar-bg"
      style={{ boxShadow: scrolled ? "0 8px 32px rgba(0,0,0,0.6)" : "none",
               transition: "box-shadow 0.3s ease" }}
    >
      <div className="max-w-6xl mx-auto px-4 flex items-center justify-between h-15" style={{height:"58px"}}>

        {/* Logo */}
        <NavLink to="/" className="flex items-center gap-3 no-underline group">
          <div className="flex items-center justify-center w-9 h-9 rounded-xl flex-shrink-0 relative overflow-hidden"
            style={{ background: "linear-gradient(135deg, #00A83A, #00D84C)" }}>
            <Trophy size={17} color="#030A07" strokeWidth={2.5}/>
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              style={{background:"linear-gradient(135deg, rgba(255,255,255,0.15), transparent)"}}/>
          </div>
          <div className="leading-none">
            <div className="text-xs font-bold tracking-widest uppercase"
              style={{ color: "#00D84C", letterSpacing: "2.5px", fontSize:"0.65rem" }}>FIFA</div>
            <div className="text-base text-white leading-tight tracking-wider">World Cup 2026</div>
          </div>
        </NavLink>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1">
          {NAV_LINKS.map(({ to, label, icon: Icon }) => (
            <NavLink key={to} to={to} end={to === "/"}
              className={({ isActive }) =>
                `flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-all no-underline ` +
                (isActive
                  ? "text-green-300 bg-green-400/10 border border-green-400/20"
                  : "text-gray-400 hover:text-white hover:bg-white/5 border border-transparent")
              }>
              <Icon size={14}/> {label}
            </NavLink>
          ))}
        </nav>

        {/* BST badge */}
        <div className="hidden md:flex items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full"
            style={{ background:"rgba(0,216,76,0.07)", color:"#00D84C", border:"1px solid rgba(0,216,76,0.22)" }}>
            <Zap size={10}/>
            <span>BST UTC+6</span>
          </div>
        </div>

        {/* Mobile hamburger */}
        <button className="md:hidden p-2 rounded-xl transition-colors text-gray-400 hover:text-white hover:bg-white/5"
          onClick={() => setMenuOpen((m) => !m)} aria-label="Toggle menu">
          {menuOpen ? <X size={22}/> : <Menu size={22}/>}
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden mobile-menu px-4 pb-5 fade-in">
          <div className="pt-2 space-y-1">
            {NAV_LINKS.map(({ to, label, icon: Icon }) => (
              <NavLink key={to} to={to} end={to === "/"}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all no-underline ` +
                  (isActive ? "text-green-300 bg-green-400/10" : "text-gray-300 hover:text-white hover:bg-white/5")
                }>
                <Icon size={17}/> {label}
              </NavLink>
            ))}
          </div>
          <div className="mt-3 px-2">
            <span className="text-xs font-semibold px-3 py-1.5 rounded-full inline-flex items-center gap-1.5"
              style={{ background:"rgba(0,216,76,0.07)", color:"#00D84C", border:"1px solid rgba(0,216,76,0.22)" }}>
              <Zap size={10}/> Bangladesh Standard Time (BST / UTC+6)
            </span>
          </div>
        </div>
      )}
    </header>
  );
}
