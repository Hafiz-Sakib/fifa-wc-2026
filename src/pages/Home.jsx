import React, {
  useState,
  useEffect,
  useRef,
  useMemo,
  useCallback,
} from "react";
import { useNavigate } from "react-router-dom";
import {
  Trophy,
  Users,
  CalendarDays,
  Globe,
  Search,
  ChevronRight,
  Zap,
  MapPin,
  Clock,
  Flame,
  Star,
  ArrowRight,
  Shield,
  Shirt,
  TrendingUp,
  Award,
  Target,
} from "lucide-react";
import fixtures from "../data/fixtures.json";
import MatchCard from "../components/MatchCard";
import FlagIcon from "../components/FlagIcon";
import { getAllTeams } from "../utils/countryUtils";
import { sortByDateTime } from "../utils/dateUtils";

const TOURNAMENT_START = "2026-06-12";
const TOURNAMENT_END = "2026-07-20";
const GROUP_STAGE = fixtures.filter(
  (f) =>
    ![
      "Round of 32",
      "Round of 16",
      "Quarter-Final",
      "Semi-Final",
      "Third Place",
      "Final",
    ].includes(f.group),
);
const TEAM_COUNT = getAllTeams().length;
const GROUPS = [...new Set(GROUP_STAGE.map((f) => f.group))].sort();
const GROUP_TEAMS = {};
GROUP_STAGE.forEach((f) => {
  if (!GROUP_TEAMS[f.group]) GROUP_TEAMS[f.group] = new Set();
  if (f.team1 && f.team1 !== "TBD") GROUP_TEAMS[f.group].add(f.team1);
  if (f.team2 && f.team2 !== "TBD") GROUP_TEAMS[f.group].add(f.team2);
});

function getTodayBDT() {
  const now = new Date();
  const bdt = new Date(now.getTime() + 6 * 60 * 60 * 1000);
  return bdt.toISOString().slice(0, 10);
}
function getCountdown(targetDateStr) {
  const now = new Date();
  const target = new Date(targetDateStr + "T00:00:00+06:00");
  const diff = target - now;
  if (diff <= 0) return null;
  return {
    days: Math.floor(diff / 86400000),
    hours: Math.floor((diff % 86400000) / 3600000),
    minutes: Math.floor((diff % 3600000) / 60000),
    seconds: Math.floor((diff % 60000) / 1000),
  };
}

function AnimCounter({ value, duration = 1400 }) {
  const [display, setDisplay] = useState(0);
  const raf = useRef(null);
  useEffect(() => {
    const start = performance.now();
    const animate = (now) => {
      const p = Math.min((now - start) / duration, 1);
      const e = 1 - Math.pow(1 - p, 3);
      setDisplay(Math.round(e * value));
      if (p < 1) raf.current = requestAnimationFrame(animate);
    };
    raf.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf.current);
  }, [value, duration]);
  return <>{display}</>;
}

function useInView(options = {}) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          obs.disconnect();
        }
      },
      { threshold: 0.15, ...options },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return [ref, inView];
}

function ScrollProgress() {
  const [pct, setPct] = useState(0);
  useEffect(() => {
    const onScroll = () => {
      const total = document.documentElement.scrollHeight - window.innerHeight;
      setPct(total > 0 ? (window.scrollY / total) * 100 : 0);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        height: 3,
        background: "rgba(0,0,0,0.3)",
        zIndex: 9999,
        pointerEvents: "none",
      }}
    >
      <div
        style={{
          height: "100%",
          width: `${pct}%`,
          background: "linear-gradient(90deg,#16A34A,#22C55E,#4ADE80)",
          transition: "width 0.05s linear",
          boxShadow: "0 0 10px rgba(34,197,94,0.6)",
        }}
      />
    </div>
  );
}

/* ── Enhanced Particles with soccer field elements ── */
function Particles() {
  const particles = useMemo(
    () =>
      Array.from({ length: 28 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 3 + 0.8,
        delay: Math.random() * 8,
        duration: Math.random() * 10 + 8,
        opacity: Math.random() * 0.35 + 0.06,
      })),
    [],
  );
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {particles.map((p) => (
        <div
          key={p.id}
          className="particle-dot"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
            opacity: p.opacity,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
          }}
        />
      ))}
      {[0, 1, 2, 3, 4].map((i) => (
        <div
          key={`ball-${i}`}
          className="particle-ball"
          style={{
            left: `${8 + i * 20}%`,
            animationDelay: `${i * 2.5}s`,
            animationDuration: `${14 + i * 2.5}s`,
            fontSize: `${12 + i * 4}px`,
          }}
        >
          ⚽
        </div>
      ))}
    </div>
  );
}

/* ── Animated pitch SVG overlay ── */
function PitchOverlay() {
  return (
    <div
      className="absolute inset-0 pointer-events-none overflow-hidden"
      style={{ opacity: 0.04 }}
    >
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 800 500"
        preserveAspectRatio="xMidYMid slice"
      >
        <rect
          x="40"
          y="30"
          width="720"
          height="440"
          fill="none"
          stroke="#22C55E"
          strokeWidth="1.5"
        />
        <line
          x1="400"
          y1="30"
          x2="400"
          y2="470"
          stroke="#22C55E"
          strokeWidth="1"
        />
        <circle
          cx="400"
          cy="250"
          r="70"
          fill="none"
          stroke="#22C55E"
          strokeWidth="1"
        />
        <circle cx="400" cy="250" r="4" fill="#22C55E" />
        <rect
          x="40"
          y="175"
          width="100"
          height="150"
          fill="none"
          stroke="#22C55E"
          strokeWidth="1"
        />
        <rect
          x="660"
          y="175"
          width="100"
          height="150"
          fill="none"
          stroke="#22C55E"
          strokeWidth="1"
        />
        <rect
          x="40"
          y="210"
          width="50"
          height="80"
          fill="none"
          stroke="#22C55E"
          strokeWidth="1"
        />
        <rect
          x="710"
          y="210"
          width="50"
          height="80"
          fill="none"
          stroke="#22C55E"
          strokeWidth="1"
        />
        <path
          d="M140 175 Q175 250 140 325"
          fill="none"
          stroke="#22C55E"
          strokeWidth="1"
        />
        <path
          d="M660 175 Q625 250 660 325"
          fill="none"
          stroke="#22C55E"
          strokeWidth="1"
        />
        <circle cx="140" cy="250" r="3" fill="#22C55E" />
        <circle cx="660" cy="250" r="3" fill="#22C55E" />
      </svg>
    </div>
  );
}

/* ── Countdown Box with flip animation ── */
function CountdownBox({ label, value }) {
  const [prev, setPrev] = useState(value);
  const [flip, setFlip] = useState(false);
  useEffect(() => {
    if (value !== prev) {
      setFlip(true);
      const t = setTimeout(() => {
        setFlip(false);
        setPrev(value);
      }, 300);
      return () => clearTimeout(t);
    }
  }, [value, prev]);
  return (
    <div
      className="countdown-box"
      style={{ position: "relative", overflow: "hidden" }}
    >
      <div
        className="countdown-num"
        style={{
          transition: flip ? "transform 0.3s, opacity 0.3s" : "none",
          transform: flip ? "translateY(-8px)" : "translateY(0)",
          opacity: flip ? 0 : 1,
        }}
      >
        {String(value).padStart(2, "0")}
      </div>
      <div className="countdown-label">{label}</div>
    </div>
  );
}

/* ── Trophy Graphic ── */
function TrophyGraphic() {
  const [pulse, setPulse] = useState(false);
  useEffect(() => {
    const id = setInterval(() => {
      setPulse((p) => !p);
    }, 2500);
    return () => clearInterval(id);
  }, []);

  return (
    <div
      className="relative flex items-center justify-center"
      style={{ width: "100%", maxWidth: "420px" }}
    >
      {/* Animated rings */}
      {[280, 220, 160].map((s, i) => (
        <div
          key={i}
          className="absolute"
          style={{
            width: s,
            height: s,
            borderRadius: "50%",
            border: `1px solid rgba(22,163,74,${0.06 + i * 0.04})`,
            top: "50%",
            left: "50%",
            transform: "translate(-50%,-50%)",
            animation: `spin ${20 + i * 8}s linear infinite${i % 2 ? " reverse" : ""}`,
          }}
        />
      ))}
      {/* Glow blobs */}
      <div
        className="absolute"
        style={{
          width: 280,
          height: 280,
          borderRadius: "50%",
          background:
            "radial-gradient(circle,rgba(22,163,74,0.18) 0%,rgba(30,58,138,0.2) 50%,transparent 70%)",
          filter: "blur(40px)",
          top: "50%",
          left: "50%",
          transform: "translate(-50%,-50%)",
        }}
      />
      <div
        className="absolute"
        style={{
          width: 180,
          height: 180,
          borderRadius: "50%",
          background:
            "radial-gradient(circle,rgba(244,197,66,0.14) 0%,transparent 70%)",
          filter: "blur(30px)",
          top: "30%",
          left: "60%",
          transform: "translate(-50%,-50%)",
        }}
      />
      {/* Trophy */}
      <div
        className="trophy-float relative z-10 select-none text-center"
        style={{
          fontSize: "clamp(6rem,15vw,10rem)",
          lineHeight: 1,
          filter: pulse
            ? "drop-shadow(0 0 60px rgba(244,197,66,0.95)) drop-shadow(0 20px 80px rgba(0,0,0,0.6))"
            : "drop-shadow(0 0 40px rgba(244,197,66,0.7)) drop-shadow(0 20px 60px rgba(0,0,0,0.5))",
          transition: "filter 1s ease",
        }}
      >
        🏆
      </div>
      {/* Host flags */}
      <div
        className="absolute bottom-0 left-1/2 flex items-center gap-3"
        style={{ transform: "translateX(-50%)" }}
      >
        {["🇺🇸", "🇨🇦", "🇲🇽"].map((flag, i) => (
          <div
            key={i}
            className="flex items-center justify-center text-2xl"
            style={{
              width: 44,
              height: 44,
              borderRadius: "50%",
              background: "rgba(8,38,61,0.9)",
              border: "2px solid rgba(255,255,255,0.1)",
              backdropFilter: "blur(8px)",
              boxShadow: "0 4px 16px rgba(0,0,0,0.3)",
              animation: `floatBob ${2 + i * 0.5}s ease-in-out infinite alternate`,
              animationDelay: `${i * 0.3}s`,
            }}
          >
            {flag}
          </div>
        ))}
      </div>
      <div
        className="absolute top-4 right-4 flex items-center gap-1.5 px-3 py-1.5 rounded-full"
        style={{
          background: "rgba(22,163,74,0.12)",
          border: "1px solid rgba(22,163,74,0.28)",
          fontSize: "0.65rem",
          color: "#22C55E",
          fontWeight: 700,
          letterSpacing: "1px",
          fontFamily: "'Barlow Condensed','Hind Siliguri',sans-serif",
          textTransform: "uppercase",
        }}
      >
        <Zap size={9} /> 48 Teams
      </div>
      <div
        className="absolute top-4 left-4 flex items-center gap-1.5 px-3 py-1.5 rounded-full"
        style={{
          background: "rgba(244,197,66,0.1)",
          border: "1px solid rgba(244,197,66,0.28)",
          fontSize: "0.65rem",
          color: "#F4C542",
          fontWeight: 700,
          letterSpacing: "1px",
          fontFamily: "'Barlow Condensed','Hind Siliguri',sans-serif",
          textTransform: "uppercase",
        }}
      >
        <Star size={9} fill="#F4C542" /> Finals 2026
      </div>
    </div>
  );
}

/* ── Three.js Footballer Kick Animation ── */
function FootballerScene() {
  const mountRef = useRef(null);
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const animRef = useRef(null);
  const stateRef = useRef({
    kickPhase: 0,
    ballInFlight: false,
    ballVx: 0,
    ballVy: 0,
    ballVz: 0,
    ballX: 0,
    ballY: 0,
    ballZ: 0,
    ballSpin: 0,
    trail: [],
    autoKickTimer: 0,
    mouseX: 0,
    mouseY: 0,
    hovered: false,
  });
  const [label, setLabel] = useState("CLICK TO KICK!");

  const handleClick = useCallback(() => {
    const s = stateRef.current;
    if (!s.ballInFlight) {
      s.kickPhase = 1;
      setLabel("⚽ GOLAZO!");
      setTimeout(() => setLabel("CLICK TO KICK!"), 2200);
    }
  }, []);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    // Dynamic THREE import
    const script = document.createElement("script");
    script.src =
      "https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js";
    script.onload = () => initScene();
    document.head.appendChild(script);

    function initScene() {
      const THREE = window.THREE;
      const W = mount.clientWidth || 420;
      const H = mount.clientHeight || 380;

      const renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
      });
      renderer.setSize(W, H);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      mount.appendChild(renderer.domElement);
      rendererRef.current = renderer;

      const scene = new THREE.Scene();
      sceneRef.current = scene;

      const camera = new THREE.PerspectiveCamera(55, W / H, 0.1, 100);
      camera.position.set(0, 2.2, 7);
      camera.lookAt(0, 1, 0);

      // Lighting
      const ambient = new THREE.AmbientLight(0xffffff, 0.6);
      scene.add(ambient);
      const sun = new THREE.DirectionalLight(0xffffff, 1.2);
      sun.position.set(5, 10, 5);
      sun.castShadow = true;
      sun.shadow.mapSize.width = 1024;
      sun.shadow.mapSize.height = 1024;
      scene.add(sun);
      const fill = new THREE.PointLight(0x22c55e, 0.8, 20);
      fill.position.set(-4, 4, 2);
      scene.add(fill);
      const rimLight = new THREE.PointLight(0x3b82f6, 0.5, 15);
      rimLight.position.set(4, 3, -3);
      scene.add(rimLight);

      // Ground plane (grass)
      const groundGeo = new THREE.PlaneGeometry(20, 20);
      const groundMat = new THREE.MeshLambertMaterial({ color: 0x166534 });
      const ground = new THREE.Mesh(groundGeo, groundMat);
      ground.rotation.x = -Math.PI / 2;
      ground.receiveShadow = true;
      scene.add(ground);

      // Pitch lines
      const lineMat = new THREE.LineBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.25,
      });
      const mkLine = (pts) => {
        const g = new THREE.BufferGeometry().setFromPoints(
          pts.map(([x, y, z]) => new THREE.Vector3(x, y, z)),
        );
        scene.add(new THREE.Line(g, lineMat));
      };
      mkLine([
        [-4, 0.01, -3],
        [4, 0.01, -3],
        [4, 0.01, 3],
        [-4, 0.01, 3],
        [-4, 0.01, -3],
      ]);
      mkLine([
        [0, 0.01, -3],
        [0, 0.01, 3],
      ]);
      // Center circle
      const circPts = [];
      for (let i = 0; i <= 64; i++) {
        const a = (i / 64) * Math.PI * 2;
        circPts.push(
          new THREE.Vector3(Math.cos(a) * 1.2, 0.01, Math.sin(a) * 1.2),
        );
      }
      const circGeo = new THREE.BufferGeometry().setFromPoints(circPts);
      scene.add(new THREE.Line(circGeo, lineMat));

      // Goal posts (behind camera target)
      const postMat = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        metalness: 0.4,
        roughness: 0.3,
      });
      const postGeo = new THREE.CylinderGeometry(0.05, 0.05, 2.2, 8);
      const crossGeo = new THREE.CylinderGeometry(0.04, 0.04, 2.4, 8);
      const lPost = new THREE.Mesh(postGeo, postMat);
      lPost.position.set(-1.2, 1.1, -5.5);
      scene.add(lPost);
      const rPost = new THREE.Mesh(postGeo, postMat);
      rPost.position.set(1.2, 1.1, -5.5);
      scene.add(rPost);
      const cross = new THREE.Mesh(crossGeo, postMat);
      cross.rotation.z = Math.PI / 2;
      cross.position.set(0, 2.2, -5.5);
      scene.add(cross);

      // Netting (simple grid lines)
      const netMat = new THREE.LineBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.12,
      });
      for (let i = 0; i <= 6; i++) {
        const x = -1.2 + (i / 6) * 2.4;
        const pts = [
          [x, 0.01, -5.5],
          [x, 2.2, -5.5],
          [x, 2.2, -4.8],
        ];
        mkLine(pts);
      }
      for (let j = 0; j <= 5; j++) {
        const y = (j / 5) * 2.2;
        mkLine([
          [-1.2, y + 0.01, -5.5],
          [1.2, y + 0.01, -5.5],
        ]);
      }

      // ── Footballer body parts ──
      const skinMat = new THREE.MeshToonMaterial({ color: 0xf5cba7 });
      const jerseyMat = new THREE.MeshToonMaterial({ color: 0x1e3a8a });
      const shortsMat = new THREE.MeshToonMaterial({ color: 0x1e3a8a });
      const bootMat = new THREE.MeshToonMaterial({ color: 0x000000 });
      const sockMat = new THREE.MeshToonMaterial({ color: 0xffffff });
      const hairMat = new THREE.MeshToonMaterial({ color: 0x1a0a00 });

      const playerGroup = new THREE.Group();
      playerGroup.position.set(0, 0, 1.5);
      scene.add(playerGroup);

      // Torso
      const torsoGeo = new THREE.CylinderGeometry(0.22, 0.18, 0.7, 10);
      const torso = new THREE.Mesh(torsoGeo, jerseyMat);
      torso.position.set(0, 1.35, 0);
      torso.castShadow = true;
      playerGroup.add(torso);

      // Head
      const headGeo = new THREE.SphereGeometry(0.18, 12, 10);
      const head = new THREE.Mesh(headGeo, skinMat);
      head.position.set(0, 1.9, 0);
      head.castShadow = true;
      playerGroup.add(head);

      // Hair
      const hairGeo = new THREE.SphereGeometry(
        0.185,
        12,
        8,
        0,
        Math.PI * 2,
        0,
        Math.PI * 0.55,
      );
      const hair = new THREE.Mesh(hairGeo, hairMat);
      hair.position.set(0, 1.9, 0);
      playerGroup.add(hair);

      // Left upper arm
      const uArmGeo = new THREE.CylinderGeometry(0.065, 0.055, 0.34, 8);
      const lUArm = new THREE.Mesh(uArmGeo, jerseyMat);
      lUArm.position.set(-0.3, 1.42, 0);
      lUArm.rotation.z = 0.4;
      lUArm.castShadow = true;
      playerGroup.add(lUArm);

      // Right upper arm
      const rUArm = new THREE.Mesh(uArmGeo, jerseyMat);
      rUArm.position.set(0.3, 1.42, 0);
      rUArm.rotation.z = -0.4;
      rUArm.castShadow = true;
      playerGroup.add(rUArm);

      // Forearms
      const fArmGeo = new THREE.CylinderGeometry(0.055, 0.045, 0.3, 8);
      const lFArm = new THREE.Mesh(fArmGeo, skinMat);
      lFArm.position.set(-0.42, 1.2, 0);
      lFArm.rotation.z = 0.6;
      playerGroup.add(lFArm);
      const rFArm = new THREE.Mesh(fArmGeo, skinMat);
      rFArm.position.set(0.42, 1.2, 0);
      rFArm.rotation.z = -0.6;
      playerGroup.add(rFArm);

      // Hips
      const hipGeo = new THREE.CylinderGeometry(0.2, 0.16, 0.22, 10);
      const hips = new THREE.Mesh(hipGeo, shortsMat);
      hips.position.set(0, 0.95, 0);
      playerGroup.add(hips);

      // Standing leg (right) — thigh + shin + boot
      const thighGeo = new THREE.CylinderGeometry(0.1, 0.08, 0.44, 8);
      const shinGeo = new THREE.CylinderGeometry(0.075, 0.055, 0.4, 8);
      const bootGeo = new THREE.BoxGeometry(0.12, 0.1, 0.28);

      const rThigh = new THREE.Mesh(thighGeo, shortsMat);
      rThigh.position.set(0.14, 0.64, 0);
      playerGroup.add(rThigh);
      const rShin = new THREE.Mesh(shinGeo, sockMat);
      rShin.position.set(0.14, 0.26, 0);
      playerGroup.add(rShin);
      const rBoot = new THREE.Mesh(bootGeo, bootMat);
      rBoot.position.set(0.14, 0.04, 0.06);
      playerGroup.add(rBoot);

      // Kicking leg group (left) — will animate
      const kickLegGroup = new THREE.Group();
      kickLegGroup.position.set(-0.14, 0.84, 0);
      playerGroup.add(kickLegGroup);

      const lThigh = new THREE.Mesh(thighGeo, shortsMat);
      lThigh.position.set(0, -0.22, 0);
      kickLegGroup.add(lThigh);

      // Lower kicking leg group (pivots at knee)
      const lowerKickGroup = new THREE.Group();
      lowerKickGroup.position.set(0, -0.44, 0);
      kickLegGroup.add(lowerKickGroup);

      const lShin = new THREE.Mesh(shinGeo, sockMat);
      lShin.position.set(0, -0.2, 0);
      lowerKickGroup.add(lShin);
      const lBoot = new THREE.Mesh(bootGeo, bootMat);
      lBoot.position.set(0, -0.42, 0.06);
      lowerKickGroup.add(lBoot);

      // Ball
      const ballGeo = new THREE.SphereGeometry(0.16, 16, 16);
      const ballMat = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        roughness: 0.4,
        metalness: 0.05,
      });
      const ball = new THREE.Mesh(ballGeo, ballMat);
      ball.castShadow = true;

      // Pentagon patches on ball
      const patchMat = new THREE.MeshStandardMaterial({ color: 0x111111 });
      const patchPositions = [
        [0, 1, 0],
        [0, -1, 0],
        [1, 0, 0],
        [-1, 0, 0],
        [0, 0, 1],
        [0, 0, -1],
        [0.7, 0.7, 0],
        [-0.7, 0.7, 0],
        [0.7, -0.7, 0],
        [-0.7, -0.7, 0],
        [0, 0.7, 0.7],
        [0, -0.7, 0.7],
      ];
      patchPositions.forEach(([px, py, pz]) => {
        const len = Math.sqrt(px * px + py * py + pz * pz);
        const pg = new THREE.CircleGeometry(0.045, 5);
        const pm = new THREE.Mesh(pg, patchMat);
        pm.position.set(
          (px / len) * 0.162,
          (py / len) * 0.162,
          (pz / len) * 0.162,
        );
        pm.lookAt(px * 2, py * 2, pz * 2);
        ball.add(pm);
      });

      scene.add(ball);

      // Ball shadow
      const shadowGeo = new THREE.CircleGeometry(0.18, 16);
      const shadowMat = new THREE.MeshBasicMaterial({
        color: 0x000000,
        transparent: true,
        opacity: 0.35,
        depthWrite: false,
      });
      const ballShadow = new THREE.Mesh(shadowGeo, shadowMat);
      ballShadow.rotation.x = -Math.PI / 2;
      ballShadow.position.y = 0.01;
      scene.add(ballShadow);

      // Trail particles
      const trailGeo = new THREE.SphereGeometry(0.04, 6, 6);
      const trailMat = new THREE.MeshBasicMaterial({
        color: 0x22c55e,
        transparent: true,
        opacity: 0.6,
      });
      const trailMeshes = Array.from({ length: 12 }, () => {
        const m = new THREE.Mesh(trailGeo, trailMat.clone());
        m.visible = false;
        scene.add(m);
        return m;
      });

      // Stars/sparkles on goal
      const starGeo = new THREE.SphereGeometry(0.06, 6, 6);
      const starMats = [0xffd700, 0xff6b35, 0x22c55e, 0x3b82f6].map(
        (c) =>
          new THREE.MeshBasicMaterial({
            color: c,
            transparent: true,
            opacity: 0,
          }),
      );
      const stars = starMats.map((mat, i) => {
        const m = new THREE.Mesh(starGeo, mat);
        m.position.set((i - 1.5) * 0.5, 1.5, -5.3);
        scene.add(m);
        return m;
      });

      // Reset ball to kick position
      const resetBall = () => {
        const s = stateRef.current;
        s.ballInFlight = false;
        s.ballX = -0.14;
        s.ballY = 0.16;
        s.ballZ = 1.2;
        s.trail = [];
        ball.position.set(s.ballX, s.ballY, s.ballZ);
        ballShadow.position.set(s.ballX, 0.01, s.ballZ);
        trailMeshes.forEach((m) => (m.visible = false));
        stars.forEach((m) => {
          m.material.opacity = 0;
        });
      };
      resetBall();

      // Mouse interaction
      const onMouseMove = (e) => {
        const rect = mount.getBoundingClientRect();
        stateRef.current.mouseX =
          ((e.clientX - rect.left) / rect.width - 0.5) * 2;
        stateRef.current.mouseY =
          -((e.clientY - rect.top) / rect.height - 0.5) * 2;
        stateRef.current.hovered = true;
      };
      const onMouseLeave = () => {
        stateRef.current.hovered = false;
      };
      mount.addEventListener("mousemove", onMouseMove);
      mount.addEventListener("mouseleave", onMouseLeave);

      let t = 0;
      let goalFlash = 0;
      let autoKickCd = 180;

      const animate = () => {
        animRef.current = requestAnimationFrame(animate);
        t++;
        const s = stateRef.current;

        // Auto kick
        autoKickCd--;
        if (autoKickCd <= 0 && !s.ballInFlight && s.kickPhase === 0) {
          s.kickPhase = 1;
          autoKickCd = 220;
        }

        // Camera subtle parallax on hover
        if (s.hovered) {
          camera.position.x += (s.mouseX * 0.5 - camera.position.x) * 0.05;
          camera.position.y +=
            (2.2 + s.mouseY * 0.3 - camera.position.y) * 0.05;
        } else {
          camera.position.x += (0 - camera.position.x) * 0.03;
          camera.position.y += (2.2 - camera.position.y) * 0.03;
        }
        camera.lookAt(0, 1.2, 0);

        // Idle body sway
        if (!s.ballInFlight && s.kickPhase === 0) {
          playerGroup.rotation.y = Math.sin(t * 0.018) * 0.08;
          torso.rotation.z = Math.sin(t * 0.022) * 0.04;
          head.rotation.y = Math.sin(t * 0.015) * 0.15;
          kickLegGroup.rotation.x = Math.sin(t * 0.025) * 0.08;
          lowerKickGroup.rotation.x = 0.05;
          rThigh.rotation.x = Math.sin(t * 0.025 + Math.PI) * 0.05;
          lUArm.rotation.z = 0.4 + Math.sin(t * 0.025 + Math.PI) * 0.1;
          rUArm.rotation.z = -0.4 + Math.sin(t * 0.025) * 0.1;
        }

        // Kick animation phases
        if (s.kickPhase === 1) {
          // Wind up
          kickLegGroup.rotation.x += (-0.9 - kickLegGroup.rotation.x) * 0.18;
          lowerKickGroup.rotation.x +=
            (-1.2 - lowerKickGroup.rotation.x) * 0.18;
          torso.rotation.x += (0.15 - torso.rotation.x) * 0.12;
          if (kickLegGroup.rotation.x < -0.75) s.kickPhase = 2;
        } else if (s.kickPhase === 2) {
          // Swing forward
          kickLegGroup.rotation.x += (0.7 - kickLegGroup.rotation.x) * 0.28;
          lowerKickGroup.rotation.x += (0.1 - lowerKickGroup.rotation.x) * 0.28;
          torso.rotation.x += (-0.2 - torso.rotation.x) * 0.15;
          rFArm.rotation.z += (-0.9 - rFArm.rotation.z) * 0.15;
          if (kickLegGroup.rotation.x > 0.45) {
            // Launch ball!
            s.kickPhase = 3;
            s.ballInFlight = true;
            // Aim slightly random but toward goal
            const spread = (Math.random() - 0.5) * 0.4;
            s.ballVx = spread * 0.12;
            s.ballVy = 0.095 + Math.random() * 0.03;
            s.ballVz = -0.32;
            s.ballSpin = 0.18 + Math.random() * 0.1;
            s.trail = [];
          }
        } else if (s.kickPhase === 3) {
          // Follow through then recover
          kickLegGroup.rotation.x += (0.2 - kickLegGroup.rotation.x) * 0.1;
          lowerKickGroup.rotation.x += (0 - lowerKickGroup.rotation.x) * 0.1;
          torso.rotation.x += (0 - torso.rotation.x) * 0.08;
          rFArm.rotation.z += (-0.6 - rFArm.rotation.z) * 0.08;
          if (Math.abs(kickLegGroup.rotation.x - 0.2) < 0.02) {
            s.kickPhase = 0;
          }
        }

        // Ball physics
        if (s.ballInFlight) {
          s.ballVy -= 0.005; // gravity
          s.ballX += s.ballVx;
          s.ballY += s.ballVy;
          s.ballZ += s.ballVz;
          s.ballSpin *= 0.98;
          ball.rotation.x += s.ballSpin;
          ball.rotation.z += s.ballSpin * 0.3;

          // Trail
          s.trail.unshift({ x: s.ballX, y: s.ballY, z: s.ballZ });
          if (s.trail.length > 12) s.trail.pop();
          s.trail.forEach((pt, i) => {
            const m = trailMeshes[i];
            if (pt) {
              m.visible = true;
              m.position.set(pt.x, pt.y, pt.z);
              m.material.opacity = (1 - i / 12) * 0.5;
              const sc = 1 - i / 14;
              m.scale.setScalar(sc);
            }
          });

          ball.position.set(s.ballX, s.ballY, s.ballZ);
          // Shadow scales with height
          const sh = Math.max(0, 1 - s.ballY * 0.5);
          ballShadow.position.set(s.ballX, 0.01, s.ballZ);
          ballShadow.scale.setScalar(sh);
          ballShadow.material.opacity = 0.35 * sh;

          // Check goal
          const inGoal =
            s.ballZ < -5.3 &&
            Math.abs(s.ballX) < 1.1 &&
            s.ballY > 0.1 &&
            s.ballY < 2.2;
          const missed = s.ballZ < -5.8 || s.ballY < 0 || s.ballZ > 2;

          if (inGoal) {
            goalFlash = 40;
            stars.forEach((m, i) => {
              m.position.set(
                (Math.random() - 0.5) * 2.4,
                0.5 + Math.random() * 2,
                -5.2,
              );
              m.material.opacity = 1;
            });
            resetBall();
            autoKickCd = 160;
          } else if (missed) {
            resetBall();
            autoKickCd = 100;
          }
        } else {
          trailMeshes.forEach((m) => (m.visible = false));
        }

        // Goal flash
        if (goalFlash > 0) {
          goalFlash--;
          fill.intensity = 0.8 + Math.sin(goalFlash * 0.5) * 2;
          stars.forEach((m, i) => {
            m.material.opacity = Math.max(0, goalFlash / 40);
            m.position.y += 0.02;
            m.rotation.y += 0.1;
          });
        } else {
          fill.intensity = 0.8;
        }

        renderer.render(scene, camera);
      };
      animate();

      // Resize
      const onResize = () => {
        if (!mount) return;
        const w = mount.clientWidth;
        const h = mount.clientHeight;
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
      };
      window.addEventListener("resize", onResize);

      return () => {
        window.removeEventListener("resize", onResize);
        mount.removeEventListener("mousemove", onMouseMove);
        mount.removeEventListener("mouseleave", onMouseLeave);
      };
    }

    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
      if (rendererRef.current) {
        rendererRef.current.dispose();
        const canvas = rendererRef.current.domElement;
        if (canvas && canvas.parentNode) canvas.parentNode.removeChild(canvas);
      }
    };
  }, []);

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        maxWidth: 420,
        height: 380,
      }}
      onClick={handleClick}
      className="cursor-pointer"
    >
      <div
        ref={mountRef}
        style={{
          width: "100%",
          height: "100%",
          borderRadius: 16,
          overflow: "hidden",
        }}
      />
      {/* Overlay label */}
      <div
        style={{
          position: "absolute",
          bottom: 14,
          left: "50%",
          transform: "translateX(-50%)",
          background: "rgba(22,163,74,0.18)",
          border: "1px solid rgba(22,163,74,0.4)",
          borderRadius: 20,
          padding: "5px 16px",
          color: "#4ADE80",
          fontSize: "0.7rem",
          fontWeight: 800,
          letterSpacing: "0.1em",
          fontFamily: "'Barlow Condensed','Hind Siliguri',sans-serif",
          textTransform: "uppercase",
          backdropFilter: "blur(6px)",
          pointerEvents: "none",
          whiteSpace: "nowrap",
        }}
      >
        {label}
      </div>
      {/* Interactive hint */}
      <div
        style={{
          position: "absolute",
          top: 12,
          right: 12,
          background: "rgba(0,0,0,0.4)",
          borderRadius: 8,
          padding: "3px 10px",
          color: "#64748B",
          fontSize: "0.6rem",
          fontWeight: 600,
          letterSpacing: "0.08em",
          fontFamily: "'Barlow Condensed',sans-serif",
          textTransform: "uppercase",
          backdropFilter: "blur(4px)",
        }}
      >
        3D Interactive
      </div>
    </div>
  );
}

/* ── Animated Stat Card with shimmer ── */
function StatCard({ icon: Icon, label, value, color, delay = 0 }) {
  const [ref, inView] = useInView();
  const [hov, setHov] = useState(false);
  return (
    <div
      ref={ref}
      className="stat-card px-5 py-6 text-center"
      style={{
        opacity: inView ? 1 : 0,
        transform: inView
          ? "translateY(0) scale(1)"
          : "translateY(24px) scale(0.95)",
        transition: `opacity 0.5s ease ${delay}ms, transform 0.5s ease ${delay}ms`,
        cursor: "default",
        position: "relative",
        overflow: "hidden",
      }}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
    >
      {/* shimmer on hover */}
      {hov && (
        <div
          style={{
            position: "absolute",
            top: 0,
            left: "-100%",
            width: "60%",
            height: "100%",
            background:
              "linear-gradient(90deg,transparent,rgba(255,255,255,0.04),transparent)",
            animation: "card-sweep 0.7s ease forwards",
          }}
        />
      )}
      <div className="stat-icon-wrap">
        <Icon size={20} style={{ color }} />
      </div>
      <div
        className="mb-1 text-white"
        style={{
          fontFamily: "'Barlow Condensed','Hind Siliguri',sans-serif",
          fontSize: "clamp(2rem,4vw,2.8rem)",
          fontWeight: 800,
        }}
      >
        {inView ? <AnimCounter value={value} /> : "0"}
      </div>
      <div
        className="text-xs font-semibold tracking-wide uppercase"
        style={{ color: "#64748B" }}
      >
        {label}
      </div>
      {hov && (
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: 2,
            background: `linear-gradient(90deg,transparent,${color},transparent)`,
            opacity: 0.6,
          }}
        />
      )}
    </div>
  );
}

/* ── Horizontal Marquee for upcoming matches ── */
function MatchMarquee() {
  const today = getTodayBDT();
  const matches = useMemo(() => {
    const future = fixtures.filter(
      (f) => f.date >= today && f.team1 !== "TBD" && f.team2 !== "TBD",
    );
    return sortByDateTime(future).slice(0, 16);
  }, [today]);

  if (matches.length === 0) return null;
  const doubled = [...matches, ...matches];

  return (
    <div
      style={{
        overflow: "hidden",
        borderTop: "1px solid rgba(22,163,74,0.1)",
        borderBottom: "1px solid rgba(22,163,74,0.1)",
        background: "rgba(0,0,0,0.2)",
        padding: "10px 0",
        marginBottom: 24,
      }}
    >
      <div
        style={{
          display: "flex",
          gap: 0,
          animation: "marqueeScroll 40s linear infinite",
          width: "max-content",
        }}
      >
        {doubled.map((m, i) => (
          <div
            key={i}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "4px 24px",
              borderRight: "1px solid rgba(255,255,255,0.05)",
              flexShrink: 0,
            }}
          >
            <FlagIcon teamName={m.team1} size={18} />
            <span
              style={{
                fontSize: 12,
                fontWeight: 700,
                color: "#CBD5E1",
                fontFamily: "'Barlow Condensed',sans-serif",
                letterSpacing: "0.05em",
              }}
            >
              {m.team1}
            </span>
            <span
              style={{
                fontSize: 10,
                color: "#22C55E",
                fontWeight: 800,
                padding: "1px 6px",
                background: "rgba(22,163,74,0.12)",
                borderRadius: 4,
              }}
            >
              VS
            </span>
            <span
              style={{
                fontSize: 12,
                fontWeight: 700,
                color: "#CBD5E1",
                fontFamily: "'Barlow Condensed',sans-serif",
                letterSpacing: "0.05em",
              }}
            >
              {m.team2}
            </span>
            <FlagIcon teamName={m.team2} size={18} />
            <span style={{ fontSize: 10, color: "#475569", marginLeft: 4 }}>
              {m.date}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Featured Match Ticker ── */
function NextMatchTicker() {
  const today = getTodayBDT();
  const next = useMemo(() => {
    const future = fixtures.filter(
      (f) => f.date >= today && f.team1 !== "TBD" && f.team2 !== "TBD",
    );
    return sortByDateTime(future)[0] || null;
  }, [today]);
  const [ref, inView] = useInView();
  const [hov, setHov] = useState(false);

  if (!next) return null;
  return (
    <div
      ref={ref}
      className="featured-match px-6 py-5 flex flex-col md:flex-row items-center justify-between gap-4 mb-8"
      style={{
        opacity: inView ? 1 : 0,
        transform: inView ? "translateY(0)" : "translateY(20px)",
        transition: "opacity 0.5s ease, transform 0.5s ease",
        cursor: "default",
      }}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
    >
      <div className="flex items-center gap-3">
        <div
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold tracking-widest uppercase"
          style={{
            background: "rgba(22,163,74,0.1)",
            border: "1px solid rgba(22,163,74,0.28)",
            color: "#22C55E",
            fontFamily: "'Barlow Condensed','Hind Siliguri',sans-serif",
          }}
        >
          <Zap size={9} /> Next Match
        </div>
        <span className="text-sm" style={{ color: "#475569" }}>
          {new Date(next.date + "T00:00:00").toLocaleDateString("en-GB", {
            weekday: "short",
            day: "numeric",
            month: "short",
          })}{" "}
          · {next.time} BST
        </span>
      </div>
      <div className="flex items-center gap-6">
        <div
          className="flex items-center gap-3"
          style={{
            transform: hov ? "scale(1.04)" : "scale(1)",
            transition: "transform 0.2s",
          }}
        >
          <FlagIcon teamName={next.team1} size={32} />
          <span className="text-lg text-white font-semibold">{next.team1}</span>
        </div>
        <span
          className="text-xs font-bold px-3 py-1.5 rounded-lg"
          style={{
            background: "rgba(22,163,74,0.1)",
            color: "#22C55E",
            border: "1px solid rgba(22,163,74,0.2)",
            fontFamily: "'Barlow Condensed',sans-serif",
          }}
        >
          VS
        </span>
        <div
          className="flex items-center gap-3"
          style={{
            transform: hov ? "scale(1.04)" : "scale(1)",
            transition: "transform 0.2s",
          }}
        >
          <span className="text-lg text-white font-semibold">{next.team2}</span>
          <FlagIcon teamName={next.team2} size={32} />
        </div>
      </div>
      <div
        className="flex items-center gap-2 text-xs"
        style={{ color: "#475569" }}
      >
        <MapPin size={12} /> {next.venue}, {next.city}
      </div>
    </div>
  );
}

function AnimSection({ children, delay = 0, className = "" }) {
  const [ref, inView] = useInView();
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: inView ? 1 : 0,
        transform: inView ? "translateY(0)" : "translateY(32px)",
        transition: `opacity 0.6s ease ${delay}ms, transform 0.6s ease ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}

/* ── Today Section ── */
function TodaySection({ navigate }) {
  const today = getTodayBDT();
  const [countdown, setCountdown] = useState(getCountdown(TOURNAMENT_START));
  const [activeTab, setActiveTab] = useState("today");

  useEffect(() => {
    if (today < TOURNAMENT_START) {
      const id = setInterval(
        () => setCountdown(getCountdown(TOURNAMENT_START)),
        1000,
      );
      return () => clearInterval(id);
    }
  }, [today]);

  const todayMatches = useMemo(
    () => sortByDateTime(fixtures.filter((f) => f.date === today)),
    [today],
  );
  const upcomingMatches = useMemo(() => {
    const upcoming = [];
    for (let d = 1; d <= 14 && upcoming.length < 6; d++) {
      const dt = new Date(new Date(today).getTime() + d * 86400000);
      const ds = dt.toISOString().slice(0, 10);
      const ms = fixtures.filter((f) => f.date === ds);
      if (ms.length > 0) upcoming.push(...sortByDateTime(ms).slice(0, 3));
    }
    return upcoming.slice(0, 6);
  }, [today]);

  if (today < TOURNAMENT_START) {
    return (
      <section className="max-w-6xl mx-auto px-4 md:px-6 pb-16 animate-section">
        <div
          className="pre-tournament-banner"
          style={{ position: "relative", overflow: "hidden" }}
        >
          <div className="pre-tournament-glow" />
          <PitchOverlay />
          <div className="relative z-10 text-center py-14 px-6">
            <div className="hero-badge mx-auto mb-6 w-fit">
              <Zap size={10} /> Tournament Countdown
            </div>
            <h2
              className="text-white mb-2"
              style={{
                fontFamily: "'Hind Siliguri','Barlow Condensed',sans-serif",
                fontSize: "clamp(2rem,5vw,3.5rem)",
                fontWeight: 800,
                textTransform: "uppercase",
                letterSpacing: "0.03em",
              }}
            >
              টুর্নামেন্ট শুরু হতে আর
            </h2>
            <p className="text-sm mb-10" style={{ color: "#64748B" }}>
              Opening match:{" "}
              <span style={{ color: "#22C55E" }}>12 June 2026</span> — Estadio
              Azteca, Mexico City
            </p>
            {countdown && (
              <div className="flex items-center justify-center gap-4 md:gap-6 flex-wrap">
                <CountdownBox label="Days" value={countdown.days} />
                <div className="countdown-sep">:</div>
                <CountdownBox label="Hours" value={countdown.hours} />
                <div className="countdown-sep">:</div>
                <CountdownBox label="Minutes" value={countdown.minutes} />
                <div className="countdown-sep">:</div>
                <CountdownBox label="Seconds" value={countdown.seconds} />
              </div>
            )}
            <p className="mt-10 text-xs" style={{ color: "#475569" }}>
              <span
                style={{ fontFamily: "'Hind Siliguri','Inter',sans-serif" }}
              >
                সময় Bangladesh Standard Time (UTC+6) অনুযায়ী
              </span>
            </p>
            <div className="flex items-center justify-center gap-3 mt-8 flex-wrap">
              <button
                onClick={() => navigate("/squads")}
                className="btn-primary px-5 py-2.5 text-sm rounded-xl inline-flex items-center gap-2"
              >
                <Shirt size={14} /> View Squads
              </button>
              <button
                onClick={() => navigate("/by-date")}
                className="btn-ghost px-5 py-2.5 text-sm rounded-xl inline-flex items-center gap-2"
              >
                <CalendarDays size={14} /> Full Schedule
              </button>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (today > TOURNAMENT_END) {
    return (
      <section className="max-w-6xl mx-auto px-4 md:px-6 pb-16 animate-section">
        <div className="finished-banner">
          <div className="text-center py-14 px-6 relative z-10">
            <div
              className="text-6xl mb-4"
              style={{ filter: "drop-shadow(0 0 20px rgba(244,197,66,0.5))" }}
            >
              🏆
            </div>
            <h2
              className="text-white mb-3"
              style={{
                fontFamily: "'Barlow Condensed','Hind Siliguri',sans-serif",
                fontSize: "2.5rem",
                fontWeight: 800,
                textTransform: "uppercase",
              }}
            >
              Tournament Complete!
            </h2>
            <p className="text-sm mb-8" style={{ color: "#64748B" }}>
              <span style={{ fontFamily: "'Hind Siliguri',sans-serif" }}>
                FIFA World Cup 2026 শেষ হয়েছে। সকল ফিক্সচার আর্কাইভ দেখুন।
              </span>
            </p>
            <button
              onClick={() => navigate("/by-date")}
              className="btn-primary px-8 py-3 text-sm rounded-xl inline-flex items-center gap-2"
            >
              <CalendarDays size={15} />
              <span
                style={{ fontFamily: "'Hind Siliguri','Inter',sans-serif" }}
              >
                সব ম্যাচ দেখুন
              </span>
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="max-w-6xl mx-auto px-4 md:px-6 pb-16 animate-section">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="live-dot-wrapper">
            <div className="live-dot" />
            <div className="live-dot-ring" />
          </div>
          <div>
            <h2
              className="text-white leading-none"
              style={{
                fontFamily: "'Barlow Condensed','Hind Siliguri',sans-serif",
                fontSize: "1.5rem",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.04em",
              }}
            >
              Match Center
            </h2>
            <p className="text-xs mt-0.5" style={{ color: "#475569" }}>
              {new Date().toLocaleDateString("en-GB", {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric",
              })}{" "}
              · BST
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="tab-strip">
            <button
              className={`tab-btn${activeTab === "today" ? " active" : ""}`}
              onClick={() => setActiveTab("today")}
            >
              Today
            </button>
            <button
              className={`tab-btn${activeTab === "upcoming" ? " active" : ""}`}
              onClick={() => setActiveTab("upcoming")}
            >
              Upcoming
            </button>
          </div>
          <button
            onClick={() => navigate("/by-date")}
            className="btn-ghost px-4 py-2 text-xs rounded-xl inline-flex items-center gap-1.5"
          >
            <span style={{ fontFamily: "'Hind Siliguri','Inter',sans-serif" }}>
              সব
            </span>
            <ArrowRight size={12} />
          </button>
        </div>
      </div>
      {activeTab === "today" ? (
        todayMatches.length === 0 ? (
          <div className="no-matches-today">
            <div className="text-4xl mb-3">📅</div>
            <p
              className="text-xl text-white mb-1"
              style={{
                fontFamily: "'Barlow Condensed','Hind Siliguri',sans-serif",
                fontWeight: 700,
                textTransform: "uppercase",
              }}
            >
              আজ কোনো ম্যাচ নেই
            </p>
            <p className="text-sm" style={{ color: "#64748B" }}>
              No matches scheduled for today.
            </p>
            <button
              onClick={() => setActiveTab("upcoming")}
              className="mt-5 btn-primary px-6 py-2.5 text-sm rounded-xl inline-flex items-center gap-1.5"
            >
              <CalendarDays size={13} /> See Upcoming
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {todayMatches.map((match, i) => (
              <div
                key={match.id}
                className="card-stagger"
                style={{ animationDelay: `${i * 75}ms` }}
              >
                <MatchCard match={match} />
              </div>
            ))}
          </div>
        )
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {upcomingMatches.length === 0 ? (
            <div className="col-span-full no-matches-today">
              <p className="text-sm" style={{ color: "#64748B" }}>
                No upcoming matches found.
              </p>
            </div>
          ) : (
            upcomingMatches.map((match, i) => (
              <div
                key={match.id}
                className="card-stagger"
                style={{ animationDelay: `${i * 75}ms` }}
              >
                <MatchCard match={match} />
              </div>
            ))
          )}
        </div>
      )}
    </section>
  );
}

/* ── Groups Section ── */
function GroupsSection({ navigate }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
      {GROUPS.map((g, gi) => {
        const teams = Array.from(GROUP_TEAMS[g] || []).sort();
        return (
          <div
            key={g}
            className="group-card card-stagger"
            style={{ animationDelay: `${gi * 45}ms` }}
          >
            <div className="group-card-header">Group {g}</div>
            <div className="px-2 py-1.5">
              {teams.map((team) => (
                <button
                  key={team}
                  type="button"
                  onClick={() =>
                    navigate("/by-team", { state: { selectedTeam: team } })
                  }
                  className="team-row"
                >
                  <FlagIcon teamName={team} size={18} />
                  <span className="font-medium truncate text-xs">{team}</span>
                </button>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ── Tournament Timeline ── */
function TournamentTimeline() {
  const phases = [
    {
      label: "Group Stage",
      dates: "12 Jun – 2 Jul",
      matches: 72,
      icon: "⚽",
      color: "#22C55E",
    },
    {
      label: "Round of 32",
      dates: "4 Jul – 7 Jul",
      matches: 16,
      icon: "🔥",
      color: "#4ADE80",
    },
    {
      label: "Round of 16",
      dates: "9 Jul – 12 Jul",
      matches: 8,
      icon: "⚡",
      color: "#2DD4BF",
    },
    {
      label: "Quarter-Finals",
      dates: "14 Jul – 15 Jul",
      matches: 4,
      icon: "🏅",
      color: "#60A5FA",
    },
    {
      label: "Semi-Finals",
      dates: "17 Jul – 18 Jul",
      matches: 2,
      icon: "🥈",
      color: "#A78BFA",
    },
    {
      label: "Final",
      dates: "20 Jul 2026",
      matches: 1,
      icon: "🏆",
      color: "#F4C542",
    },
  ];
  const [ref, inView] = useInView();
  return (
    <div ref={ref} style={{ display: "flex", flexDirection: "column", gap: 0 }}>
      {phases.map((phase, i) => (
        <div
          key={phase.label}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            padding: "14px 0",
            borderBottom:
              i < phases.length - 1
                ? "1px solid rgba(255,255,255,0.05)"
                : "none",
            opacity: inView ? 1 : 0,
            transform: inView ? "translateX(0)" : "translateX(-24px)",
            transition: `opacity 0.5s ease ${i * 80}ms, transform 0.5s ease ${i * 80}ms`,
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              flexShrink: 0,
              width: 32,
            }}
          >
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: "50%",
                background: `${phase.color}18`,
                border: `2px solid ${phase.color}55`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 14,
              }}
            >
              {phase.icon}
            </div>
            {i < phases.length - 1 && (
              <div
                style={{
                  width: 2,
                  height: 14,
                  background: "rgba(255,255,255,0.06)",
                  marginTop: 4,
                }}
              />
            )}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                fontFamily: "'Barlow Condensed','Hind Siliguri',sans-serif",
                fontSize: "0.9rem",
                fontWeight: 700,
                color: "#fff",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
              }}
            >
              {phase.label}
            </div>
            <div style={{ fontSize: 11, color: "#64748B", marginTop: 1 }}>
              {phase.dates}
            </div>
          </div>
          <div
            style={{
              fontSize: 11,
              fontWeight: 600,
              color: phase.color,
              background: `${phase.color}12`,
              border: `1px solid ${phase.color}30`,
              borderRadius: 100,
              padding: "3px 10px",
              flexShrink: 0,
            }}
          >
            {phase.matches} {phase.matches === 1 ? "match" : "matches"}
          </div>
        </div>
      ))}
    </div>
  );
}

/* ── Highlight Matches Banner ── */
function HighlightBanner({ navigate }) {
  const today = getTodayBDT();
  const bigMatches = useMemo(() => {
    const topTeams = new Set([
      "Brazil",
      "Argentina",
      "France",
      "Germany",
      "England",
      "Spain",
      "Portugal",
      "Netherlands",
      "USA",
    ]);
    return fixtures
      .filter(
        (f) =>
          f.date >= today &&
          f.team1 !== "TBD" &&
          f.team2 !== "TBD" &&
          (topTeams.has(f.team1) || topTeams.has(f.team2)),
      )
      .slice(0, 4);
  }, [today]);

  if (bigMatches.length === 0) return null;
  const [ref, inView] = useInView();

  return (
    <div
      ref={ref}
      style={{
        opacity: inView ? 1 : 0,
        transform: inView ? "translateY(0)" : "translateY(24px)",
        transition: "opacity 0.6s ease, transform 0.6s ease",
        marginBottom: 32,
      }}
    >
      <div className="flex items-center gap-4 mb-4">
        <h3 className="section-title">
          <Flame size={16} style={{ color: "#F4C542" }} /> Marquee Matches
        </h3>
        <div className="section-line" />
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
          gap: 10,
        }}
      >
        {bigMatches.map((match, i) => (
          <button
            key={match.id}
            onClick={() => navigate("/by-date")}
            style={{
              background: "rgba(7,36,58,0.8)",
              border: "1px solid rgba(244,197,66,0.15)",
              borderRadius: 14,
              padding: "14px 16px",
              display: "flex",
              alignItems: "center",
              gap: 12,
              cursor: "pointer",
              textAlign: "left",
              width: "100%",
              transition: "all .2s",
              opacity: inView ? 1 : 0,
              transform: inView ? "translateY(0)" : "translateY(16px)",
              transitionDelay: `${i * 70}ms`,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "rgba(244,197,66,0.4)";
              e.currentTarget.style.background = "rgba(7,36,58,1)";
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.4)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "rgba(244,197,66,0.15)";
              e.currentTarget.style.background = "rgba(7,36,58,0.8)";
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "none";
            }}
          >
            <FlagIcon teamName={match.team1} size={28} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  color: "#fff",
                  fontFamily: "'Barlow Condensed','Hind Siliguri',sans-serif",
                  textTransform: "uppercase",
                  letterSpacing: "0.04em",
                }}
              >
                {match.team1} vs {match.team2}
              </div>
              <div style={{ fontSize: 10, color: "#64748B", marginTop: 2 }}>
                {new Date(match.date + "T00:00:00").toLocaleDateString(
                  "en-GB",
                  { day: "numeric", month: "short" },
                )}{" "}
                · {match.time}
              </div>
            </div>
            <FlagIcon teamName={match.team2} size={28} />
          </button>
        ))}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   HOME PAGE
   ══════════════════════════════════════════════════════════ */
export default function Home() {
  const [search, setSearch] = useState("");
  const [scrollY, setScrollY] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim())
      navigate("/by-team", { state: { searchQuery: search.trim() } });
  };

  return (
    <div className="hero-bg pitch-lines min-h-screen">
      <ScrollProgress />

      {/* ─── HERO ─── */}
      <section className="relative overflow-hidden">
        <Particles />
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="glow-orb glow-orb-blue" />
          <div className="glow-orb glow-orb-green" />
          <div className="glow-orb glow-orb-gold" />
        </div>
        <div
          className="relative max-w-6xl mx-auto px-4 md:px-6"
          style={{
            paddingTop: "clamp(56px,10vw,96px)",
            paddingBottom: "clamp(48px,8vw,80px)",
            transform: `translateY(${scrollY * 0.1}px)`,
          }}
        >
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-8">
            {/* Left */}
            <div className="flex-1 text-center lg:text-left">
              <div className="hero-badge animate-fade-down mb-6 mx-auto lg:mx-0 w-fit">
                <Zap size={10} /> Official Tournament Fixtures
              </div>
              <h1
                className="hero-title animate-fade-up mb-2"
                style={{
                  animationDelay: "0.1s",
                  fontSize: "clamp(2.8rem,7vw,5.5rem)",
                  color: "#FFFFFF",
                  textShadow: "0 0 60px rgba(22,163,74,0.15)",
                }}
              >
                FIFA
              </h1>
              <h1
                className="hero-title animate-fade-up mb-1"
                style={{
                  animationDelay: "0.14s",
                  fontSize: "clamp(2.2rem,5.5vw,4.2rem)",
                  background: "linear-gradient(135deg,#CBD5E1 0%,#94A3B8 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                World Cup
              </h1>
              <h2
                className="hero-title animate-fade-up mb-6"
                style={{
                  animationDelay: "0.18s",
                  fontSize: "clamp(5rem,14vw,10rem)",
                  letterSpacing: "-0.03em",
                  background:
                    "linear-gradient(180deg,#FFFFFF 0%,rgba(255,255,255,0.5) 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                  lineHeight: 0.85,
                }}
              >
                2026
              </h2>
              <div
                className="animate-fade-up mb-6 flex justify-center lg:justify-start"
                style={{ animationDelay: "0.22s" }}
              >
                <div className="host-strip">
                  <span
                    className="text-sm font-semibold"
                    style={{ color: "#CBD5E1" }}
                  >
                    USA
                  </span>
                  <div className="host-sep" />
                  <span
                    className="text-sm font-semibold"
                    style={{ color: "#CBD5E1" }}
                  >
                    Canada
                  </span>
                  <div className="host-sep" />
                  <span
                    className="text-sm font-semibold"
                    style={{ color: "#CBD5E1" }}
                  >
                    Mexico
                  </span>
                </div>
              </div>
              <p
                className="text-sm mb-8 animate-fade-up"
                style={{ animationDelay: "0.26s", color: "#475569" }}
              >
                <span
                  style={{ fontFamily: "'Hind Siliguri','Inter',sans-serif" }}
                >
                  সব সময়
                </span>{" "}
                <span style={{ color: "#22C55E" }}>
                  Bangladesh Standard Time (UTC+6)
                </span>{" "}
                <span
                  style={{ fontFamily: "'Hind Siliguri','Inter',sans-serif" }}
                >
                  অনুযায়ী
                </span>
              </p>
              <form
                onSubmit={handleSearch}
                className="max-w-lg mx-auto lg:mx-0 animate-fade-up"
                style={{ animationDelay: "0.32s" }}
              >
                <div className="search-wrapper">
                  <Search
                    size={18}
                    className="search-icon"
                    style={{ color: "#22C55E" }}
                  />
                  <input
                    type="text"
                    className="field-input search-input"
                    placeholder="দল খুঁজুন (যেমন Brazil, Germany…)"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                  <button type="submit" className="btn-primary search-btn">
                    <span
                      style={{
                        fontFamily: "'Hind Siliguri','Inter',sans-serif",
                      }}
                    >
                      খুঁজুন
                    </span>
                  </button>
                </div>
              </form>
              <div
                className="flex items-center gap-3 mt-5 justify-center lg:justify-start animate-fade-up"
                style={{ animationDelay: "0.38s" }}
              >
                <button
                  onClick={() => navigate("/by-date")}
                  className="btn-primary px-6 py-2.5 text-sm rounded-xl inline-flex items-center gap-2"
                  style={{ transition: "all .2s" }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.transform = "translateY(-2px)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.transform = "translateY(0)")
                  }
                >
                  <CalendarDays size={14} /> Match Schedule
                </button>
                <button
                  onClick={() => navigate("/by-team")}
                  className="btn-ghost px-6 py-2.5 text-sm rounded-xl inline-flex items-center gap-2"
                  style={{ transition: "all .2s" }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.transform = "translateY(-2px)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.transform = "translateY(0)")
                  }
                >
                  <Users size={14} /> By Team
                </button>
              </div>
            </div>
            {/* Right — 3D Footballer */}
            <div
              className="flex-1 flex items-center justify-center animate-fade-up"
              style={{ animationDelay: "0.2s", minHeight: "380px" }}
            >
              <FootballerScene />
            </div>
          </div>
        </div>
      </section>

      {/* ─── MATCH MARQUEE ─── */}
      <MatchMarquee />

      {/* ─── STATS ─── */}
      <section className="max-w-6xl mx-auto px-4 md:px-6 pb-14">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            {
              icon: CalendarDays,
              label: "Total Matches",
              value: fixtures.length,
              color: "#22C55E",
              delay: 0,
            },
            {
              icon: Users,
              label: "Participating Teams",
              value: TEAM_COUNT,
              color: "#4ADE80",
              delay: 80,
            },
            {
              icon: Trophy,
              label: "Groups",
              value: GROUPS.length,
              color: "#16A34A",
              delay: 160,
            },
            {
              icon: Globe,
              label: "Host Countries",
              value: 3,
              color: "#86EFAC",
              delay: 240,
            },
          ].map((s) => (
            <StatCard key={s.label} {...s} />
          ))}
        </div>
      </section>

      {/* ─── NEXT MATCH ─── */}
      <section className="max-w-6xl mx-auto px-4 md:px-6 pb-6">
        <NextMatchTicker />
      </section>

      {/* ─── MARQUEE MATCHES ─── */}
      <section className="max-w-6xl mx-auto px-4 md:px-6 pb-4">
        <HighlightBanner navigate={navigate} />
      </section>

      {/* ─── TODAY'S MATCHES ─── */}
      <TodaySection navigate={navigate} />

      {/* ─── QUICK NAV ─── */}
      <section className="max-w-6xl mx-auto px-4 md:px-6 pb-16 animate-section">
        <AnimSection>
          <div className="flex items-center gap-4 mb-6">
            <h3 className="section-title">
              <Flame size={16} style={{ color: "#22C55E" }} /> Browse Fixtures
            </h3>
            <div className="section-line" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              {
                path: "/by-team",
                icon: Users,
                title: "Fixtures by Team",
                desc: `All ${TEAM_COUNT} teams — select any to view their full tournament schedule`,
                iconBg: "rgba(22,163,74,0.12)",
                iconBorder: "rgba(22,163,74,0.28)",
                iconColor: "#22C55E",
                badge: "48 Teams",
              },
              {
                path: "/by-date",
                icon: CalendarDays,
                title: "Fixtures by Date",
                desc: "Browse all matches day-by-day — Group Stage through the Final",
                iconBg: "rgba(14,53,84,0.5)",
                iconBorder: "rgba(22,163,74,0.2)",
                iconColor: "#4ADE80",
                badge: "Jun–Jul",
              },
              {
                path: "/squads",
                icon: Shirt,
                title: "Team Squads",
                desc: "Explore full 26-man squads — players, positions, clubs & more",
                iconBg: "rgba(244,197,66,0.1)",
                iconBorder: "rgba(244,197,66,0.25)",
                iconColor: "#F4C542",
                badge: "9 Teams",
              },
            ].map((item) => (
              <button
                key={item.path}
                type="button"
                onClick={() => navigate(item.path)}
                className="nav-card group text-left w-full"
              >
                <div
                  className="nav-card-icon"
                  style={{
                    background: item.iconBg,
                    border: `1px solid ${item.iconBorder}`,
                  }}
                >
                  <item.icon size={24} style={{ color: item.iconColor }} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2.5 mb-1.5">
                    <span
                      className="text-white"
                      style={{
                        fontFamily:
                          "'Barlow Condensed','Hind Siliguri',sans-serif",
                        fontSize: "1.2rem",
                        fontWeight: 700,
                        textTransform: "uppercase",
                        letterSpacing: "0.04em",
                      }}
                    >
                      {item.title}
                    </span>
                    <span
                      className="text-xs font-semibold px-2 py-0.5 rounded-full"
                      style={{
                        background: "rgba(22,163,74,0.1)",
                        color: "#22C55E",
                        border: "1px solid rgba(22,163,74,0.2)",
                      }}
                    >
                      {item.badge}
                    </span>
                  </div>
                  <div className="text-sm" style={{ color: "#64748B" }}>
                    {item.desc}
                  </div>
                </div>
                <ChevronRight
                  size={20}
                  className="flex-shrink-0 nav-arrow"
                  style={{ color: "#475569" }}
                />
              </button>
            ))}
          </div>
        </AnimSection>
      </section>

      {/* ─── TOURNAMENT TIMELINE + GROUPS ─── */}
      <section className="max-w-6xl mx-auto px-4 md:px-6 pb-16">
        <div
          style={{ display: "grid", gridTemplateColumns: "1fr", gap: 32 }}
          className="lg:grid-cols-[1fr_1.6fr]"
        >
          <AnimSection>
            <div className="flex items-center gap-4 mb-6">
              <h3 className="section-title">
                <Target size={15} style={{ color: "#22C55E" }} /> Tournament
                Phases
              </h3>
              <div className="section-line" />
            </div>
            <div
              style={{
                background: "var(--card)",
                border: "1px solid rgba(255,255,255,0.06)",
                borderRadius: 16,
                padding: "20px 24px",
              }}
            >
              <TournamentTimeline />
            </div>
          </AnimSection>
          <AnimSection delay={100}>
            <div className="flex items-center gap-4 mb-6">
              <h3 className="section-title">
                <Star size={15} style={{ color: "#22C55E" }} /> Tournament
                Groups
              </h3>
              <div className="section-line" />
            </div>
            <GroupsSection navigate={navigate} />
            <p
              className="mt-5 text-sm font-medium"
              style={{ color: "#475569" }}
            >
              12 groups · 4 teams per group · 72 group stage matches total
            </p>
          </AnimSection>
        </div>
      </section>

      {/* ─── HOST STADIUMS ─── */}
      <section className="max-w-6xl mx-auto px-4 md:px-6 pb-24 animate-section">
        <AnimSection>
          <div className="flex items-center gap-4 mb-6">
            <h3 className="section-title">
              <MapPin size={15} style={{ color: "#22C55E" }} /> Host Stadiums
            </h3>
            <div className="section-line" />
          </div>
          {[
            {
              flag: "🇺🇸",
              country: "United States",
              venues: [
                { name: "MetLife Stadium", city: "New York/NJ" },
                { name: "SoFi Stadium", city: "Los Angeles" },
                { name: "AT&T Stadium", city: "Dallas" },
                { name: "Hard Rock Stadium", city: "Miami" },
                { name: "Levi's Stadium", city: "San Francisco" },
                { name: "Mercedes-Benz Stadium", city: "Atlanta" },
                { name: "Gillette Stadium", city: "Boston" },
                { name: "Arrowhead Stadium", city: "Kansas City" },
                { name: "Lincoln Financial Field", city: "Philadelphia" },
                { name: "Lumen Field", city: "Seattle" },
                { name: "NRG Stadium", city: "Houston" },
              ],
            },
            {
              flag: "🇲🇽",
              country: "Mexico",
              venues: [
                { name: "Estadio Azteca", city: "Mexico City" },
                { name: "Estadio BBVA", city: "Monterrey" },
                { name: "Estadio Akron", city: "Guadalajara" },
              ],
            },
            {
              flag: "🇨🇦",
              country: "Canada",
              venues: [
                { name: "BMO Field", city: "Toronto" },
                { name: "BC Place", city: "Vancouver" },
              ],
            },
          ].map((section, si) => (
            <div key={section.country} className="mb-8">
              <div className="flex items-center gap-2.5 mb-3">
                <span className="text-xl">{section.flag}</span>
                <span
                  className="text-sm tracking-wider font-medium"
                  style={{ color: "#CBD5E1" }}
                >
                  {section.country}
                </span>
                <div
                  className="flex-1 h-px"
                  style={{ background: "rgba(255,255,255,0.06)" }}
                />
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                {section.venues.map((v, i) => (
                  <div
                    key={v.name}
                    className="venue-card card-stagger"
                    style={{
                      animationDelay: `${(si * section.venues.length + i) * 30}ms`,
                    }}
                  >
                    <div className="font-semibold text-white text-xs leading-snug">
                      {v.name}
                    </div>
                    <div
                      className="text-xs mt-0.5"
                      style={{ color: "#475569" }}
                    >
                      {v.city}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </AnimSection>
      </section>
    </div>
  );
}
