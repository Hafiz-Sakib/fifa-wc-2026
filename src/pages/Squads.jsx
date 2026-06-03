import React, { useState, useMemo } from "react";
import { Shirt, User, Building2, Ruler, ArrowLeft, Search, X } from "lucide-react";
import squadsData from "../data/fifa_wc2026_squads.json";
import FlagIcon from "../components/FlagIcon";
import { COUNTRY_CODES } from "../utils/countryUtils";

/* ── Design tokens ── */
const POSITION_COLORS = {
  GK: { bg: "rgba(234,179,8,0.14)",  border: "rgba(234,179,8,0.38)",  text: "#EAB308", label: "Goalkeeper" },
  DF: { bg: "rgba(59,130,246,0.14)", border: "rgba(59,130,246,0.38)", text: "#60A5FA", label: "Defender"   },
  MF: { bg: "rgba(22,163,74,0.14)",  border: "rgba(22,163,74,0.38)",  text: "#22C55E", label: "Midfielder" },
  FW: { bg: "rgba(239,68,68,0.14)",  border: "rgba(239,68,68,0.38)",  text: "#F87171", label: "Forward"    },
};
const POS_ORDER = { GK: 0, DF: 1, MF: 2, FW: 3 };

const GROUP_MAP = {
  Mexico:"A","South Africa":"A","South Korea":"A",Czechia:"A",
  Canada:"B","Bosnia-Herzegovina":"B",Qatar:"B",Switzerland:"B",
  Brazil:"C",Morocco:"C",Haiti:"C",Scotland:"C",
  USA:"D",Paraguay:"D",Australia:"D",Turkey:"D",
  Germany:"E",Curacao:"E","Ivory Coast":"E",Ecuador:"E",
  Netherlands:"F",Japan:"F",Sweden:"F",Tunisia:"F",
  Belgium:"G",Egypt:"G",Iran:"G","New Zealand":"G",
  Spain:"H","Cape Verde":"H","Saudi Arabia":"H",Uruguay:"H",
  France:"I",Senegal:"I",Iraq:"I",Norway:"I",
  Argentina:"J",Algeria:"J",Austria:"J",Jordan:"J",
  Portugal:"K",Congo:"K",Uzbekistan:"K",Colombia:"K",
  England:"L",Croatia:"L",Ghana:"L",Panama:"L",
};

const GROUP_COLORS = {
  A:"#22C55E",B:"#4ADE80",C:"#2DD4BF",D:"#22D3EE",
  E:"#60A5FA",F:"#818CF8",G:"#A78BFA",H:"#C084FC",
  I:"#F472B6",J:"#FB923C",K:"#FBBF24",L:"#A3E635",
};

const ALL_TEAMS = Object.keys(COUNTRY_CODES)
  .filter(t => t !== "TBD" && !t.startsWith("Winner") && !t.startsWith("Loser") &&
    !t.startsWith("1") && !t.startsWith("2") && !t.startsWith("3rd"))
  .sort((a, b) => {
    const ga = GROUP_MAP[a] || "Z", gb = GROUP_MAP[b] || "Z";
    return ga === gb ? a.localeCompare(b) : ga.localeCompare(gb);
  });

const SQUAD_MAP = Object.fromEntries(squadsData.teams.map(t => [t.team, t]));

function calcAge(dob) {
  if (!dob || dob.startsWith("1000")) return null;
  const b = new Date(dob), t = new Date();
  let a = t.getFullYear() - b.getFullYear();
  const m = t.getMonth() - b.getMonth();
  if (m < 0 || (m === 0 && t.getDate() < b.getDate())) a--;
  return a;
}

/* ── Player Card ── */
function PlayerCard({ player }) {
  const [imgErr, setImgErr] = useState(false);
  const pos = POSITION_COLORS[player.pos] || POSITION_COLORS.MF;
  const age = calcAge(player.dob);

  return (
    <div
      style={{
        background:"rgba(7,36,58,0.9)", borderRadius:14,
        border:"1px solid rgba(255,255,255,0.06)",
        padding:"14px 14px 12px",
        display:"flex", flexDirection:"column", gap:10,
        transition:"border-color .2s, transform .2s, box-shadow .2s",
      }}
      onMouseEnter={e => {
        e.currentTarget.style.borderColor = pos.border;
        e.currentTarget.style.transform = "translateY(-2px)";
        e.currentTarget.style.boxShadow = "0 8px 28px rgba(0,0,0,.35)";
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)";
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "none";
      }}
    >
      <div style={{ display:"flex", alignItems:"flex-start", gap:11 }}>
        <div style={{ position:"relative", flexShrink:0 }}>
          {!imgErr ? (
            <img src={player.image} alt={player.name} onError={() => setImgErr(true)}
              style={{ width:50, height:50, borderRadius:"50%", objectFit:"cover",
                border:`2px solid ${pos.border}` }} />
          ) : (
            <div style={{ width:50, height:50, borderRadius:"50%",
              background:pos.bg, border:`2px solid ${pos.border}`,
              display:"flex", alignItems:"center", justifyContent:"center" }}>
              <User size={20} style={{ color:pos.text }} />
            </div>
          )}
          <div style={{
            position:"absolute", bottom:-4, right:-4,
            background:pos.bg, border:`1px solid ${pos.border}`,
            borderRadius:6, padding:"1px 5px",
            fontSize:10, fontWeight:700, color:pos.text, lineHeight:1.4,
          }}>{player.number}</div>
        </div>
        <div style={{ flex:1, minWidth:0 }}>
          <div style={{
            fontFamily:"'Barlow Condensed', sans-serif",
            fontSize:"0.95rem", fontWeight:700, color:"#fff",
            whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis",
          }} title={player.name}>{player.name}</div>
          <div style={{
            display:"inline-flex", alignItems:"center", marginTop:4,
            padding:"2px 8px", borderRadius:100,
            background:pos.bg, border:`1px solid ${pos.border}`,
            fontSize:10, fontWeight:600, color:pos.text,
          }}>{pos.label}</div>
        </div>
      </div>

      <div style={{
        display:"grid", gridTemplateColumns:"1fr 1fr", gap:6,
        paddingTop:8, borderTop:"1px solid rgba(255,255,255,0.06)",
      }}>
        {age !== null && (
          <div style={{ display:"flex", alignItems:"center", gap:5 }}>
            <User size={10} style={{ color:"#64748B", flexShrink:0 }} />
            <span style={{ fontSize:11, color:"#94A3B8" }}>Age {age}</span>
          </div>
        )}
        {player.height_cm && (
          <div style={{ display:"flex", alignItems:"center", gap:5 }}>
            <Ruler size={10} style={{ color:"#64748B", flexShrink:0 }} />
            <span style={{ fontSize:11, color:"#94A3B8" }}>{player.height_cm} cm</span>
          </div>
        )}
        <div style={{ gridColumn:"1/-1", display:"flex", alignItems:"center", gap:5 }}>
          <Building2 size={10} style={{ color:"#64748B", flexShrink:0 }} />
          <span style={{
            fontSize:10, color:"#64748B",
            whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis",
          }} title={player.club}>{player.club}</span>
        </div>
      </div>
    </div>
  );
}

/* ── Position Section ── */
function PositionSection({ pos, players }) {
  const c = POSITION_COLORS[pos];
  return (
    <div style={{ marginBottom:28 }}>
      <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:14 }}>
        <div style={{
          width:7, height:7, borderRadius:"50%",
          background:c.text, boxShadow:`0 0 7px ${c.text}`,
        }} />
        <span style={{
          fontFamily:"'Barlow Condensed', sans-serif",
          fontSize:"0.82rem", fontWeight:700,
          letterSpacing:"3px", textTransform:"uppercase", color:c.text,
        }}>{c.label}s</span>
        <span style={{
          fontSize:11, color:"#475569",
          padding:"1px 7px", borderRadius:100,
          background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.08)",
        }}>{players.length}</span>
      </div>
      <div style={{
        display:"grid",
        gridTemplateColumns:"repeat(auto-fill, minmax(190px, 1fr))",
        gap:10,
      }}>
        {players.map(p => <PlayerCard key={p.number} player={p} />)}
      </div>
    </div>
  );
}

/* ── Team Tile ── */
function TeamTile({ teamName, hasSquad, onSelect }) {
  const grp = GROUP_MAP[teamName] || "?";
  const grpColor = GROUP_COLORS[grp] || "#64748B";
  const [hov, setHov] = useState(false);

  return (
    <button
      onClick={() => onSelect(teamName)}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      title={hasSquad ? `View ${teamName} squad` : `${teamName} squad coming soon`}
      style={{
        background: hov && hasSquad ? "rgba(22,163,74,0.08)" : "rgba(7,36,58,0.75)",
        border: hov && hasSquad
          ? "1px solid rgba(22,163,74,0.35)"
          : "1px solid rgba(255,255,255,0.06)",
        borderRadius:14, padding:"14px 12px",
        display:"flex", flexDirection:"column", alignItems:"center", gap:9,
        cursor: hasSquad ? "pointer" : "default",
        transition:"all .2s",
        transform: hov && hasSquad ? "translateY(-3px)" : "translateY(0)",
        boxShadow: hov && hasSquad ? "0 10px 30px rgba(0,0,0,.35)" : "none",
        position:"relative", overflow:"hidden",
        opacity: hasSquad ? 1 : 0.6,
      }}
    >
      {/* Group badge */}
      <div style={{
        position:"absolute", top:8, right:8,
        fontSize:9, fontWeight:800, letterSpacing:1,
        color:grpColor, opacity:.9,
        fontFamily:"'Barlow Condensed', sans-serif",
      }}>GRP {grp}</div>

      {/* Flag */}
      <div style={{
        width:50, height:50, borderRadius:"50%", overflow:"hidden",
        border:`2px solid ${hov && hasSquad ? "rgba(22,163,74,0.5)" : "rgba(255,255,255,0.1)"}`,
        flexShrink:0, transition:"border-color .2s",
      }}>
        <FlagIcon teamName={teamName} size={50} />
      </div>

      {/* Name */}
      <div style={{
        fontFamily:"'Barlow Condensed', sans-serif",
        fontSize:"0.85rem", fontWeight:700,
        color: hov && hasSquad ? "#fff" : "#CBD5E1",
        textTransform:"uppercase", letterSpacing:"0.06em",
        textAlign:"center", lineHeight:1.2, transition:"color .2s",
      }}>{teamName}</div>

      {/* Status badge */}
      {hasSquad ? (
        <div style={{
          fontSize:9, fontWeight:600, letterSpacing:.5,
          color:"#22C55E", background:"rgba(22,163,74,0.1)",
          border:"1px solid rgba(22,163,74,0.25)",
          borderRadius:100, padding:"2px 8px",
        }}>View Squad</div>
      ) : (
        <div style={{
          fontSize:9, fontWeight:600, letterSpacing:.5,
          color:"#475569", background:"rgba(255,255,255,0.03)",
          border:"1px solid rgba(255,255,255,0.06)",
          borderRadius:100, padding:"2px 8px",
        }}>Coming Soon</div>
      )}
    </button>
  );
}

/* ── Squad Detail ── */
function SquadDetail({ teamData, onBack }) {
  const [posFilter, setPosFilter] = useState("ALL");
  const [search, setSearch] = useState("");

  const grouped = useMemo(() => {
    let players = posFilter === "ALL"
      ? teamData.players
      : teamData.players.filter(p => p.pos === posFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      players = players.filter(p =>
        p.name.toLowerCase().includes(q) || p.club.toLowerCase().includes(q)
      );
    }
    return players.reduce((acc, p) => {
      acc[p.pos] = acc[p.pos] || [];
      acc[p.pos].push(p);
      return acc;
    }, {});
  }, [teamData, posFilter, search]);

  const sortedPos = Object.keys(grouped).sort((a,b) => (POS_ORDER[a]??99)-(POS_ORDER[b]??99));

  return (
    <div className="fade-in">
      {/* Back button */}
      <button onClick={onBack} style={{
        display:"inline-flex", alignItems:"center", gap:8,
        background:"rgba(255,255,255,0.04)",
        border:"1px solid rgba(255,255,255,0.1)",
        borderRadius:10, padding:"8px 14px",
        color:"#94A3B8", cursor:"pointer", fontSize:13, fontWeight:500,
        marginBottom:20, transition:"all .2s",
      }}
        onMouseEnter={e => { e.currentTarget.style.color="#fff"; e.currentTarget.style.borderColor="rgba(22,163,74,0.4)"; }}
        onMouseLeave={e => { e.currentTarget.style.color="#94A3B8"; e.currentTarget.style.borderColor="rgba(255,255,255,0.1)"; }}
      >
        <ArrowLeft size={15}/> All Teams
      </button>

      {/* Team header */}
      <div style={{ marginBottom:28 }}>
        <div style={{ display:"flex", alignItems:"center", gap:16, marginBottom:16 }}>
          <div style={{
            width:64, height:64, borderRadius:"50%",
            border:"2px solid rgba(22,163,74,0.45)",
            overflow:"hidden", flexShrink:0,
          }}>
            <FlagIcon teamName={teamData.team} size={64} />
          </div>
          <div style={{ flex:1 }}>
            <h2 style={{
              fontFamily:"'Barlow Condensed', sans-serif",
              fontSize:"clamp(1.6rem,4vw,2.2rem)", fontWeight:800,
              color:"#fff", textTransform:"uppercase", letterSpacing:"0.05em",
            }}>{teamData.team}</h2>
            <div style={{ display:"flex", flexWrap:"wrap", gap:"6px 16px", marginTop:5 }}>
              <span style={{ fontSize:12, color:"#64748B" }}>
                <span style={{ color:"#22C55E", fontWeight:600 }}>{teamData.players.length}</span> Players
              </span>
              <span style={{ fontSize:12, color:"#475569" }}>·</span>
              <span style={{ fontSize:12, color:"#64748B" }}>
                Coach: <span style={{ color:"#94A3B8", fontWeight:500 }}>{teamData.head_coach.name}</span>
              </span>
              <span style={{ fontSize:12, color:"#475569" }}>·</span>
              <span style={{ fontSize:12, color:"#64748B" }}>{teamData.head_coach.nationality}</span>
            </div>
          </div>
        </div>
        <hr style={{ border:"none", borderTop:"1px solid rgba(244,197,66,0.22)" }}/>
      </div>

      {/* Controls */}
      <div style={{
        display:"flex", flexWrap:"wrap", gap:10, marginBottom:24,
        alignItems:"center", justifyContent:"space-between",
      }}>
        <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
          {["ALL","GK","DF","MF","FW"].map(f => {
            const c = f === "ALL" ? null : POSITION_COLORS[f];
            const active = posFilter === f;
            const count = f === "ALL"
              ? teamData.players.length
              : teamData.players.filter(p => p.pos === f).length;
            return (
              <button key={f} onClick={() => setPosFilter(f)} style={{
                padding:"6px 13px", borderRadius:100, cursor:"pointer",
                border: active
                  ? `1px solid ${c ? c.border : "rgba(22,163,74,0.5)"}`
                  : "1px solid rgba(255,255,255,0.08)",
                background: active
                  ? (c ? c.bg : "rgba(22,163,74,0.12)")
                  : "rgba(255,255,255,0.03)",
                color: active ? (c ? c.text : "#22C55E") : "#64748B",
                fontSize:11, fontWeight:600, transition:"all .2s",
              }}>
                {f === "ALL" ? "All Players" : POSITION_COLORS[f].label + "s"}
                <span style={{ marginLeft:5, fontSize:10, opacity:.7 }}>{count}</span>
              </button>
            );
          })}
        </div>

        <div style={{
          display:"flex", alignItems:"center", gap:7,
          background:"rgba(255,255,255,0.04)",
          border:"1px solid rgba(255,255,255,0.08)",
          borderRadius:10, padding:"7px 12px", minWidth:180,
        }}>
          <Search size={13} style={{ color:"#64748B", flexShrink:0 }} />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search player or club..."
            style={{ background:"none", border:"none", outline:"none",
              color:"#fff", fontSize:12, width:"100%" }} />
          {search && (
            <button onClick={() => setSearch("")}
              style={{ background:"none", border:"none", cursor:"pointer", color:"#64748B", padding:0 }}>
              <X size={12}/>
            </button>
          )}
        </div>
      </div>

      {sortedPos.length > 0
        ? sortedPos.map(pos => <PositionSection key={pos} pos={pos} players={grouped[pos]} />)
        : <div style={{ textAlign:"center", padding:48, color:"#475569" }}>No players found.</div>
      }
    </div>
  );
}

/* ── Main Page ── */
export default function Squads() {
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [groupFilter, setGroupFilter] = useState("ALL");
  const [search, setSearch] = useState("");

  const visibleTeams = useMemo(() =>
    ALL_TEAMS.filter(t => {
      if (groupFilter !== "ALL" && GROUP_MAP[t] !== groupFilter) return false;
      if (search.trim() && !t.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    }),
    [groupFilter, search]
  );

  const teamData = useMemo(() =>
    selectedTeam ? SQUAD_MAP[selectedTeam] : null,
    [selectedTeam]
  );

  const handleSelect = (name) => {
    if (!SQUAD_MAP[name]) return;
    setSelectedTeam(name);
    window.scrollTo({ top:0, behavior:"smooth" });
  };

  return (
    <div className="page-bg" style={{ minHeight:"100vh" }}>
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-10">

        {/* Header */}
        <div style={{ marginBottom:32 }}>
          <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:8 }}>
            <div style={{
              width:40, height:40, borderRadius:12,
              background:"rgba(22,163,74,0.12)",
              border:"1px solid rgba(22,163,74,0.28)",
              display:"flex", alignItems:"center", justifyContent:"center",
            }}>
              <Shirt size={20} style={{ color:"#22C55E" }} />
            </div>
            <h1 style={{
              fontFamily:"'Barlow Condensed', sans-serif",
              fontSize:"clamp(2rem,5vw,3rem)", fontWeight:800,
              color:"#fff", textTransform:"uppercase", letterSpacing:"0.04em",
            }}>
              {selectedTeam ? `${selectedTeam} Squad` : "Team Squads"}
            </h1>
          </div>
          <p className="text-sm pl-14" style={{ color:"#64748B" }}>
            {selectedTeam
              ? `FIFA World Cup 2026 — Full squad for ${selectedTeam}`
              : "FIFA World Cup 2026 — একটি দল বেছে নিন এবং তাদের পূর্ণ স্কোয়াড দেখুন"}
          </p>
        </div>

        {/* Squad detail */}
        {teamData && <SquadDetail teamData={teamData} onBack={() => setSelectedTeam(null)} />}

        {/* 48-team grid */}
        {!selectedTeam && (
          <div className="fade-in">
            {/* Filter bar */}
            <div style={{
              padding:"14px 16px", marginBottom:20,
              background:"var(--card)", borderRadius:16,
              border:"1px solid rgba(255,255,255,0.06)",
              display:"flex", flexWrap:"wrap", gap:10,
              alignItems:"center", justifyContent:"space-between",
            }}>
              <div style={{ display:"flex", flexWrap:"wrap", gap:5 }}>
                {["ALL","A","B","C","D","E","F","G","H","I","J","K","L"].map(g => {
                  const active = groupFilter === g;
                  const gc = g !== "ALL" ? GROUP_COLORS[g] : "#22C55E";
                  return (
                    <button key={g} onClick={() => setGroupFilter(g)} style={{
                      padding:"5px 11px", borderRadius:100, cursor:"pointer",
                      border: active ? `1px solid ${gc}55` : "1px solid rgba(255,255,255,0.07)",
                      background: active ? `${gc}18` : "rgba(255,255,255,0.03)",
                      color: active ? gc : "#64748B",
                      fontSize:11, fontWeight:700,
                      fontFamily:"'Barlow Condensed', sans-serif",
                      letterSpacing:1, transition:"all .18s",
                    }}>
                      {g === "ALL" ? "ALL GROUPS" : `GRP ${g}`}
                    </button>
                  );
                })}
              </div>

              <div style={{
                display:"flex", alignItems:"center", gap:7,
                background:"rgba(255,255,255,0.04)",
                border:"1px solid rgba(255,255,255,0.08)",
                borderRadius:10, padding:"7px 12px", minWidth:170,
              }}>
                <Search size={13} style={{ color:"#64748B", flexShrink:0 }} />
                <input value={search} onChange={e => setSearch(e.target.value)}
                  placeholder="Search country..."
                  style={{ background:"none", border:"none", outline:"none",
                    color:"#fff", fontSize:12, width:"100%" }} />
                {search && (
                  <button onClick={() => setSearch("")}
                    style={{ background:"none", border:"none", cursor:"pointer", color:"#64748B", padding:0 }}>
                    <X size={12}/>
                  </button>
                )}
              </div>
            </div>

            {/* Info row */}
            <div style={{ display:"flex", alignItems:"center", gap:16, marginBottom:14 }}>
              <p style={{ fontSize:12, color:"#475569" }}>
                Showing <span style={{ color:"#fff", fontWeight:600 }}>{visibleTeams.length}</span> teams
              </p>
              <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                <div style={{ width:8, height:8, borderRadius:"50%", background:"#22C55E" }}/>
                <span style={{ fontSize:11, color:"#475569" }}>
                  {Object.keys(SQUAD_MAP).length} squads available
                </span>
              </div>
              <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                <div style={{ width:8, height:8, borderRadius:"50%", background:"#334155" }}/>
                <span style={{ fontSize:11, color:"#475569" }}>
                  {48 - Object.keys(SQUAD_MAP).length} coming soon
                </span>
              </div>
            </div>

            {/* Grid */}
            <div style={{
              display:"grid",
              gridTemplateColumns:"repeat(auto-fill, minmax(148px, 1fr))",
              gap:12,
            }}>
              {visibleTeams.map(name => (
                <TeamTile
                  key={name}
                  teamName={name}
                  hasSquad={!!SQUAD_MAP[name]}
                  onSelect={handleSelect}
                />
              ))}
            </div>

            {visibleTeams.length === 0 && (
              <div style={{ textAlign:"center", padding:64, color:"#475569" }}>
                No teams found.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
