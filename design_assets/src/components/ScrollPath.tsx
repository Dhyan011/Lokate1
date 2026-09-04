// ScrollPath — winding amber path with low-poly terrain patches and scroll-driven truck.
// Truck position and glow progression animate with scroll in real time.

import { useEffect, useRef, useState } from "react"

const PATH_D =
  "M 720 80 C 900 200,1100 320,1060 440 C 1000 540,300 1150,340 1350 C 380 1540,1020 1980,970 2180 C 940 2360,680 2560,680 2740 C 680 2920,270 3120,310 3340 C 340 3560,730 3840,720 4050"

const WAYPOINTS = [
  { cx: 1060, cy: 440 },
  { cx: 340, cy: 1350 },
  { cx: 970, cy: 2180 },
  { cx: 680, cy: 2740 },
  { cx: 310, cy: 3340 },
  { cx: 720, cy: 4050 },
]

// Truck drawn centered at local origin (0,0); spans roughly -55..55 x, -26..26 y
function Truck({ x, y, angle }: { x: number; y: number; angle: number }) {
  return (
    <g transform={`translate(${x},${y}) rotate(${angle})`} aria-label="isometric truck moving along path">
      {/* Cargo body top face */}
      <polygon points="-39,-26 39,-26 33,-32 -45,-32" fill="#F0A070" />
      {/* Cargo body front face */}
      <rect x="-39" y="-26" width="78" height="38" rx="2" fill="#D4845A" />
      {/* Cargo body right shadow */}
      <rect x="39" y="-26" width="9" height="38" rx="1" fill="#A86038" />
      {/* Cab top */}
      <polygon points="-57,12 -39,-26 -39,12" fill="#C07646" />
      {/* Cab front */}
      <rect x="-65" y="-4" width="10" height="20" rx="1" fill="#B46A38" />
      {/* Windshield */}
      <rect x="-56" y="-2" width="11" height="12" rx="1.5" fill="rgba(14,15,22,0.88)" />
      {/* Headlight glow */}
      <circle cx="-62" cy="4" r="3.5" fill="#E08F5E" opacity="0.9" />
      <circle cx="-62" cy="4" r="9" fill="#E08F5E" opacity="0.25" />
      {/* Wheels */}
      <circle cx="-49" cy="12" r="9" fill="#13141E" />
      <circle cx="-49" cy="12" r="5" fill="#1E2030" />
      <circle cx="8" cy="12" r="9" fill="#13141E" />
      <circle cx="8" cy="12" r="5" fill="#1E2030" />
      <circle cx="32" cy="12" r="9" fill="#13141E" />
      <circle cx="32" cy="12" r="5" fill="#1E2030" />
    </g>
  )
}

export default function ScrollPath() {
  const pathRef = useRef<SVGPathElement>(null)
  const [pathLength, setPathLength] = useState(0)
  const [progress, setProgress] = useState(0)
  const [truck, setTruck] = useState({ x: 720, y: 80, angle: 0 })

  // Measure path length once mounted
  useEffect(() => {
    const path = pathRef.current
    if (!path) return
    const total = path.getTotalLength()
    setPathLength(total)
  }, [])

  // Drive truck along path on scroll
  useEffect(() => {
    if (!pathLength) return
    const path = pathRef.current
    if (!path) return

    const onScroll = () => {
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight
      const p = maxScroll > 0 ? Math.max(0, Math.min(1, window.scrollY / maxScroll)) : 0
      setProgress(p)

      const len = p * pathLength
      const pt = path.getPointAtLength(len)

      // Tangent angle from two nearby samples
      const delta = 4
      const a = path.getPointAtLength(Math.max(0, len - delta))
      const b = path.getPointAtLength(Math.min(pathLength, len + delta))
      const angle = (Math.atan2(b.y - a.y, b.x - a.x) * 180) / Math.PI

      setTruck({ x: pt.x, y: pt.y, angle })
    }

    window.addEventListener("scroll", onScroll, { passive: true })
    onScroll() // seed initial position
    return () => window.removeEventListener("scroll", onScroll)
  }, [pathLength])

  // Traveled portion = first (progress * pathLength) units drawn
  const traveled = pathLength * progress

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 1440 4500"
      aria-hidden="true"
      style={{ width: "100%", height: "4500px", position: "absolute", top: 0, left: 0, overflow: "visible" }}
    >
      <defs>
        <filter id="path-glow" x="-50%" y="-2%" width="200%" height="104%">
          <feGaussianBlur stdDeviation="14" result="gb" />
          <feMerge>
            <feMergeNode in="gb" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <filter id="dot-glow" x="-200%" y="-200%" width="500%" height="500%">
          <feGaussianBlur stdDeviation="5" result="gb" />
          <feMerge>
            <feMergeNode in="gb" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <filter id="truck-glow" x="-80%" y="-80%" width="260%" height="260%">
          <feGaussianBlur stdDeviation="8" result="gb" />
          <feMerge>
            <feMergeNode in="gb" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* ── PATH LAYERS ── */}

      {/* Full path — dim "future" track */}
      <path
        d={PATH_D}
        fill="none"
        stroke="#E08F5E"
        strokeWidth="48"
        strokeOpacity="0.035"
        strokeLinecap="round"
        filter="url(#path-glow)"
      />
      <path
        d={PATH_D}
        fill="none"
        stroke="#E08F5E"
        strokeWidth="1.5"
        strokeOpacity="0.18"
        strokeLinecap="round"
        strokeDasharray="11 8"
      />

      {/* Traveled portion — brighter, solid glow that fills in as you scroll */}
      {pathLength > 0 && (
        <>
          <path
            d={PATH_D}
            fill="none"
            stroke="#E08F5E"
            strokeWidth="22"
            strokeOpacity="0.10"
            strokeLinecap="round"
            strokeDasharray={`${pathLength}`}
            strokeDashoffset={`${pathLength - traveled}`}
            filter="url(#path-glow)"
          />
          <path
            d={PATH_D}
            fill="none"
            stroke="#E08F5E"
            strokeWidth="1.8"
            strokeOpacity="0.55"
            strokeLinecap="round"
            strokeDasharray={`${pathLength}`}
            strokeDashoffset={`${pathLength - traveled}`}
          />
        </>
      )}

      {/* Hidden path used for measurements — must be in DOM */}
      <path ref={pathRef} d={PATH_D} fill="none" stroke="none" strokeWidth="0" />

      {/* Waypoint dots */}
      {WAYPOINTS.map((wp, i) => (
        <g key={`wp-dot-${i}`}>
          <circle cx={wp.cx} cy={wp.cy} r="22" fill="#E08F5E" opacity="0.06" />
          <circle cx={wp.cx} cy={wp.cy} r="10" fill="#E08F5E" opacity="0.12" />
          <circle
            cx={wp.cx}
            cy={wp.cy}
            r="4"
            fill="#E08F5E"
            opacity="0.65"
            filter="url(#dot-glow)"
          />
        </g>
      ))}

      {/* ═══ WAYPOINT 1 — Hero terrain patch ═══ */}
      <g transform="translate(858, 272)" aria-label="waypoint 1">
        <ellipse cx="118" cy="200" rx="132" ry="20" fill="rgba(0,0,0,0.30)" />
        <polygon points="0,188 52,92 196,70 268,118 272,188" fill="#1F2133" />
        <polygon points="0,188 52,92 52,188" fill="#191B2A" />
        <polygon points="52,92 196,70 268,118 196,136 52,92" fill="#2E3048" />
        <polygon points="196,70 268,118 272,188 196,188 196,136" fill="#252638" />
        {/* Prop 1: stacked boxes */}
        <rect x="62" y="162" width="36" height="24" rx="2" fill="#29293E" />
        <rect x="62" y="162" width="36" height="5" rx="1" fill="#363650" />
        <rect x="65" y="143" width="30" height="21" rx="2" fill="#333348" />
        <rect x="68" y="127" width="24" height="18" rx="2" fill="#3D3D58" />
        <rect x="62" y="161" width="36" height="3" rx="1" fill="#464662" opacity="0.8" />
        {/* Prop 2: signpost + amber pin */}
        <line x1="192" y1="70" x2="192" y2="124" stroke="#2C2E44" strokeWidth="4" strokeLinecap="round" />
        <rect x="174" y="80" width="38" height="20" rx="4" fill="#252538" />
        <text x="193" y="93" fontSize="9" fill="#8B8778" textAnchor="middle" fontFamily="Inter, sans-serif" fontWeight="600" letterSpacing="1.2">BIN A3</text>
        <circle cx="192" cy="67" r="9" fill="#E08F5E" opacity="0.88" />
        <circle cx="192" cy="67" r="4.5" fill="#12131A" />
        <circle cx="192" cy="67" r="15" fill="#E08F5E" opacity="0.14" />
      </g>

      {/* ═══ WAYPOINT 2 — Features terrain patch ═══ */}
      <g transform="translate(108, 1168)" aria-label="waypoint 2">
        <ellipse cx="116" cy="192" rx="126" ry="18" fill="rgba(0,0,0,0.28)" />
        <polygon points="4,178 52,86 192,64 244,108 248,178" fill="#1E2032" />
        <polygon points="4,178 52,86 52,178" fill="#181A28" />
        <polygon points="52,86 192,64 244,108 192,124 52,86" fill="#2C2E46" />
        <polygon points="192,64 244,108 248,178 192,178 192,124" fill="#242438" />
        {/* Prop 1: scanner post + green glow */}
        <rect x="76" y="116" width="18" height="28" rx="3" fill="#232438" />
        <line x1="85" y1="84" x2="85" y2="116" stroke="#282A3E" strokeWidth="4.5" strokeLinecap="round" />
        <circle cx="85" cy="79" r="7.5" fill="#5FA374" opacity="0.85" />
        <circle cx="85" cy="79" r="4" fill="#12131A" />
        <circle cx="85" cy="79" r="14" fill="#5FA374" opacity="0.18" />
        <circle cx="85" cy="79" r="22" fill="#5FA374" opacity="0.06" />
        {/* Prop 2: mini loading dock */}
        <rect x="126" y="112" width="68" height="50" rx="2.5" fill="#212234" />
        <rect x="126" y="112" width="68" height="11" rx="2.5" fill="#2A2C42" />
        <rect x="135" y="128" width="18" height="34" rx="1.5" fill="#14151F" />
        <rect x="163" y="128" width="18" height="34" rx="1.5" fill="#14151F" />
        {/* Prop 3: small tree */}
        <rect x="212" y="124" width="7" height="32" rx="1.5" fill="#212234" />
        <polygon points="215,80 198,126 232,126" fill="#1B2E22" />
        <polygon points="215,90 200,124 230,124" fill="#213428" opacity="0.65" />
      </g>

      {/* ═══ WAYPOINT 3 — Warehouse showcase, largest terrain patch ═══ */}
      <g transform="translate(718, 1932)" aria-label="waypoint 3">
        <ellipse cx="188" cy="285" rx="210" ry="28" fill="rgba(0,0,0,0.36)" />
        <polygon points="-8,268 52,106 218,70 400,120 412,268" fill="#1D1F30" />
        <polygon points="-8,268 52,106 52,268" fill="#17192A" />
        <polygon points="52,106 218,70 400,120 218,142 52,106" fill="#2A2C44" />
        <polygon points="218,70 400,120 412,268 218,268 218,142" fill="#222336" />
        {/* Warehouse building */}
        <rect x="186" y="118" width="22" height="140" rx="1" fill="#171929" />
        <rect x="46" y="118" width="144" height="140" rx="3" fill="#212234" />
        <polygon points="36,118 192,118 180,95 48,95" fill="#2E3048" />
        <rect x="46" y="116" width="144" height="6" rx="1" fill="#E08F5E" opacity="0.62" />
        <rect x="58" y="136" width="26" height="16" rx="1.5" fill="#13141E" />
        <rect x="96" y="136" width="26" height="16" rx="1.5" fill="#5FA374" opacity="0.42" />
        <rect x="134" y="136" width="26" height="16" rx="1.5" fill="#13141E" />
        <line x1="46" y1="162" x2="186" y2="162" stroke="#2A2C42" strokeWidth="1.5" />
        <rect x="64" y="172" width="64" height="86" rx="2" fill="#13141E" />
        <rect x="64" y="172" width="64" height="11" rx="2" fill="#282A3E" />
        <line x1="84" y1="183" x2="84" y2="258" stroke="#1E2030" strokeWidth="2" />
        <line x1="96" y1="183" x2="96" y2="258" stroke="#1E2030" strokeWidth="2" />
        <line x1="108" y1="183" x2="108" y2="258" stroke="#1E2030" strokeWidth="2" />
        <rect x="142" y="186" width="30" height="72" rx="1.5" fill="#13141E" />
        {/* Pallets */}
        <rect x="208" y="232" width="48" height="13" rx="1.5" fill="#282A3E" />
        <rect x="210" y="219" width="44" height="15" rx="1.5" fill="#323448" />
        <rect x="212" y="208" width="40" height="13" rx="1.5" fill="#3C3E58" />
        {/* Amber location pin */}
        <line x1="340" y1="120" x2="340" y2="178" stroke="#282A3E" strokeWidth="3.5" strokeLinecap="round" />
        <circle cx="340" cy="113" r="11" fill="#E08F5E" opacity="0.85" />
        <circle cx="340" cy="113" r="5.5" fill="#12131A" />
        <circle cx="340" cy="113" r="20" fill="#E08F5E" opacity="0.12" />
        <circle cx="340" cy="113" r="32" fill="#E08F5E" opacity="0.05" />
      </g>

      {/* ═══ WAYPOINT 4 — Stats band, no terrain ═══ */}
      <circle cx="680" cy="2740" r="6" fill="#E08F5E" opacity="0.20" />

      {/* ═══ WAYPOINT 5 — Cold storage terrain patch ═══ */}
      <g transform="translate(68, 3148)" aria-label="waypoint 5">
        <ellipse cx="138" cy="200" rx="152" ry="19" fill="rgba(0,0,0,0.26)" />
        <polygon points="0,186 56,84 202,62 284,106 288,186" fill="#1E2032" />
        <polygon points="0,186 56,84 56,186" fill="#181A28" />
        <polygon points="56,84 202,62 284,106 202,122 56,84" fill="#2B2D46" />
        <polygon points="202,62 284,106 288,186 202,186 202,122" fill="#232436" />
        {/* Cold storage unit */}
        <rect x="62" y="94" width="86" height="70" rx="2.5" fill="#20223A" />
        <rect x="62" y="94" width="86" height="11" rx="2.5" fill="#2A2C44" />
        <line x1="74" y1="114" x2="74" y2="155" stroke="#282A3E" strokeWidth="2" />
        <line x1="87" y1="114" x2="87" y2="155" stroke="#282A3E" strokeWidth="2" />
        <line x1="100" y1="114" x2="100" y2="155" stroke="#282A3E" strokeWidth="2" />
        <line x1="113" y1="114" x2="113" y2="155" stroke="#282A3E" strokeWidth="2" />
        <line x1="126" y1="114" x2="126" y2="155" stroke="#282A3E" strokeWidth="2" />
        <circle cx="136" cy="100" r="4.5" fill="#5FA374" opacity="0.88" />
        <circle cx="136" cy="100" r="9" fill="#5FA374" opacity="0.18" />
        {/* Trees */}
        <rect x="192" y="108" width="8" height="36" rx="1.5" fill="#202234" />
        <polygon points="196,62 178,110 214,110" fill="#1A2C20" />
        <polygon points="196,73 180,108 212,108" fill="#1E3226" opacity="0.7" />
        <rect x="228" y="122" width="7" height="30" rx="1.5" fill="#202234" />
        <polygon points="231,84 215,124 247,124" fill="#1A2C20" />
      </g>

      {/* ═══ WAYPOINT 6 — Footer destination marker ═══ */}
      <g transform="translate(690, 4004)" aria-label="waypoint 6 — destination">
        <circle cx="30" cy="48" r="56" fill="#E08F5E" opacity="0.04" />
        <circle cx="30" cy="48" r="30" fill="#E08F5E" opacity="0.06" />
        <line x1="30" y1="8" x2="30" y2="76" stroke="#2E3048" strokeWidth="3.5" strokeLinecap="round" />
        <polygon points="30,11 66,24 30,37" fill="#E08F5E" opacity="0.86" />
        <ellipse cx="30" cy="76" rx="15" ry="5.5" fill="#252538" />
        <ellipse cx="30" cy="76" rx="15" ry="5.5" fill="none" stroke="#E08F5E" strokeWidth="1" strokeOpacity="0.28" />
        <circle cx="30" cy="88" r="4" fill="#5FA374" opacity="0.78" />
        <circle cx="30" cy="88" r="8" fill="#5FA374" opacity="0.14" />
      </g>

      {/* ═══ SCROLL-DRIVEN TRUCK ═══ */}
      <g filter="url(#truck-glow)">
        <Truck x={truck.x} y={truck.y} angle={truck.angle} />
      </g>
    </svg>
  )
}
