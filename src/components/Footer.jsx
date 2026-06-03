import React from "react";
import { Trophy, Globe, Zap, CalendarDays, Users } from "lucide-react";
import { NavLink } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="mt-16 relative overflow-hidden"
      style={{ borderTop:"1px solid rgba(0,216,76,0.1)", background:"rgba(3,6,4,0.99)" }}>

      {/* Subtle glow top */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-px"
        style={{background:"linear-gradient(90deg, transparent, rgba(0,216,76,0.5), transparent)"}}/>
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-16 -translate-y-full"
        style={{background:"radial-gradient(ellipse at 50% 100%, rgba(0,216,76,0.06) 0%, transparent 70%)", pointerEvents:"none"}}/>

      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">

          {/* Brand */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl flex-shrink-0"
                style={{ background:"linear-gradient(135deg, #00A83A, #00D84C)" }}>
                <Trophy size={20} color="#030A07" strokeWidth={2.5}/>
              </div>
              <div>
                <div className="text-base text-white tracking-wider">FIFA World Cup 2026</div>
                <div className="text-xs text-gray-500">Fixture Tracker · Bangladesh Time</div>
              </div>
            </div>
            <p className="text-xs text-gray-600 leading-relaxed">
              All match times displayed in Bangladesh Standard Time (UTC+6). 
              The ultimate fixture companion for the 2026 World Cup.
            </p>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="text-sm tracking-widest uppercase text-gray-400 mb-4">Navigation</h4>
            <div className="space-y-2">
              {[
                { to:"/",        label:"Home",          icon:Trophy       },
                { to:"/by-team", label:"Fixtures by Team", icon:Users     },
                { to:"/by-date", label:"Fixtures by Date", icon:CalendarDays },
              ].map(({ to, label, icon:Icon }) => (
                <NavLink key={to} to={to}
                  className="flex items-center gap-2 text-sm text-gray-500 hover:text-green-400 transition-colors no-underline">
                  <Icon size={13}/> {label}
                </NavLink>
              ))}
            </div>
          </div>

          {/* Hosts */}
          <div>
            <h4 className="text-sm tracking-widest uppercase text-gray-400 mb-4">Host Nations</h4>
            <div className="space-y-2">
              {[
                { flag:"🇺🇸", country:"United States", venues:"11 venues" },
                { flag:"🇲🇽", country:"Mexico",         venues:"3 venues"  },
                { flag:"🇨🇦", country:"Canada",         venues:"2 venues"  },
              ].map((h) => (
                <div key={h.country} className="flex items-center gap-2.5">
                  <span className="text-base">{h.flag}</span>
                  <span className="text-sm text-gray-400">{h.country}</span>
                  <span className="text-xs text-gray-600">· {h.venues}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="h-px" style={{background:"linear-gradient(90deg, transparent, rgba(0,216,76,0.2), transparent)"}}/>

        <div className="mt-6 flex flex-col md:flex-row items-center justify-between gap-2 text-xs text-gray-600">
          <span>© 2026 FIFA World Cup Fixture Tracker. Personal use only.</span>
          <div className="flex items-center gap-1.5">
            <Zap size={11} style={{color:"#00D84C"}}/>
            <span>All times in Bangladesh Standard Time (UTC+6)</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
