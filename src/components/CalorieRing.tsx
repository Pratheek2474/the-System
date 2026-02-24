import { useId } from "react";

/**
 * CalorieRing
 *
 * Uses the EXACT Figma SVG ring path (218×218 viewBox).
 * The ring is a filled donut arc — upper semicircle (180°):
 *   • LEFT end = 180° (9 o'clock)  RIGHT end = 0°/360° (3 o'clock)
 *   • Arc goes clockwise on screen: left → top → right
 *
 * Three visible segments via clipPath sectors:
 *   1. consumed (dark)  – fills from LEFT going clockwise
 *   2. burned   (white) – fills from RIGHT going counter-clockwise
 *   3. remaining        – the gap in between
 */

// ─── Exact Figma path for the donut ring shape ───────────────────────────────
const RING_PATH =
  "M189.372 108.626C193.619 108.626 197.097 105.176 196.729 100.944C194.93 80.304 185.925 60.8554 171.159 46.0902C154.574 29.5047 132.079 20.1871 108.624 20.1871C85.1684 20.1871 62.6737 29.5047 46.0882 46.0902C31.3229 60.8554 22.3178 80.304 20.519 100.944C20.1503 105.176 23.6281 108.626 27.8754 108.626L40.3649 108.626C44.6121 108.626 48.0048 105.169 48.5426 100.956C50.2319 87.7209 56.2597 75.333 65.7953 65.7973C77.1542 54.4385 92.56 48.0572 108.624 48.0572C124.688 48.0572 140.093 54.4385 151.452 65.7973C160.988 75.333 167.016 87.7209 168.705 100.956C169.243 105.169 172.635 108.626 176.883 108.626H189.372Z";

// ─── Geometry constants (in 218×218 viewBox coordinate space) ────────────────
const CX = 108.626;   // ring centre x
const CY = 108.626;   // ring centre y
const CLIP_R = 140;   // clip-sector radius (> outer ring radius ~80.75)

const toRad = (d: number) => (d * Math.PI) / 180;

/**
 * Clockwise SVG sector from `fromDeg` to `toDeg` (sweep-flag = 1).
 * Used as a clip mask to reveal a portion of the ring.
 *
 * The arc spans 180°:  LEFT(180°) → TOP(270°) → RIGHT(360°)
 *   • consumed fills:  180° → (180 + pct*180)°   (left to right)
 *   • burned fills:    (360 - pct*180)° → 360°   (right to left)
 */
function sectorCW(fromDeg: number, toDeg: number): string {
  const span = toDeg - fromDeg;
  if (span <= 0.01) return "M 0 0"; // invisible
  const ax = CX + CLIP_R * Math.cos(toRad(fromDeg));
  const ay = CY + CLIP_R * Math.sin(toRad(fromDeg));
  const bx = CX + CLIP_R * Math.cos(toRad(toDeg));
  const by = CY + CLIP_R * Math.sin(toRad(toDeg));
  const large: 0 | 1 = span > 180 ? 1 : 0;
  return `M ${CX} ${CY} L ${ax} ${ay} A ${CLIP_R} ${CLIP_R} 0 ${large} 1 ${bx} ${by} Z`;
}

// ─── Component ────────────────────────────────────────────────────────────────

interface CalorieRingProps {
  consumed: number;
  goal: number;
  burned?: number;
  size?: number;         // rendered width (height is auto ≈ 60% of width)
  color?: string;        // consumed arc colour  (default dark)
  burnedColor?: string;  // burned arc colour    (default white)
  bgColor?: string;      // track colour         (default #121212 @10%)
  label?: string;
  showLabel?: boolean;
  compact?: boolean;     // smaller variant for macro cards
}

const CalorieRing = ({
  consumed,
  goal,
  burned = 0,
  size = 218,
  color = "#121212",
  burnedColor = "rgba(255,255,255,0.92)",
  bgColor = "#121212",
  label,
  showLabel = true,
  compact = false,
}: CalorieRingProps) => {
  // Unique IDs so multiple rings on one page don't clash
  const uid = useId().replace(/:/g, "");
  const eatClipId = `eat-${uid}`;
  const burnClipId = `burn-${uid}`;
  const glowGradId = `glow-grad-${uid}`;
  const glowFiltId = `glow-filt-${uid}`;

  // Clamp percentages
  const eatPct = Math.min(consumed / Math.max(goal, 1), 1);
  const burnPct = Math.min(burned / Math.max(goal, 1), 1);

  // Sector angles
  const eatEndDeg = 180 + eatPct * 180; // 180° → 360°
  const burnStartDeg = 360 - burnPct * 180; // 360° → 180°

  const left = Math.max(goal - consumed - burned, 0);

  // For the compact macro-card variant we show a smaller cropped ring
  // with a single-colour (consumed) fill only.
  const vbHeight = compact ? 118 : 148; // crop the bottom empty space

  return (
    <div style={{ position: "relative", width: size, height: size * (vbHeight / 218) }}>
      <svg
        width={size}
        height={size * (vbHeight / 218)}
        viewBox={`0 0 218 ${vbHeight}`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ display: "block" }}
      >
        <defs>
          {/* ── Clip: consumed (left → clockwise) ── */}
          <clipPath id={eatClipId}>
            <path d={sectorCW(180, eatEndDeg)} />
          </clipPath>

          {/* ── Clip: burned (right ← counter-clockwise) ── */}
          <clipPath id={burnClipId}>
            <path d={sectorCW(burnStartDeg, 360)} />
          </clipPath>

          {/* ── Radial gradient + blur for inner glow ── */}
          {!compact && (
            <>
              <filter id={glowFiltId} x="0" y="0" width="217.252" height="217.252" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
                <feFlood floodOpacity="0" result="BackgroundImageFix" />
                <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha" />
                <feOffset />
                <feGaussianBlur stdDeviation="24.0323" />
                <feComposite in2="hardAlpha" operator="out" />
                <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 1 0" />
                <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow" />
                <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow" result="shape" />
              </filter>
              <radialGradient id={glowGradId} cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(108.626 108.626) rotate(90) scale(60.5613)">
                <stop stopColor="white" />
                <stop offset="1" stopColor="#121212" />
              </radialGradient>
            </>
          )}
        </defs>

        {/* ── 1. Background track (full 180° ring, translucent) ── */}
        <path d={RING_PATH} fill={bgColor} opacity={0.1} />

        {/* ── 2. Inner glow circle (Figma spec, full ring only) ── */}
        {!compact && (
          <g opacity="0.1" filter={`url(#${glowFiltId})`}>
            <circle cx={CX} cy={CY} r="60.5613" fill={`url(#${glowGradId})`} />
          </g>
        )}

        {/* ── 3. Consumed arc — dark, fills from LEFT ── */}
        {eatPct > 0.001 && (
          <path d={RING_PATH} fill={color} clipPath={`url(#${eatClipId})`} />
        )}

        {/* ── 4. Burned arc — white, fills from RIGHT ── */}
        {burnPct > 0.001 && (
          <path d={RING_PATH} fill={burnedColor} clipPath={`url(#${burnClipId})`} />
        )}
      </svg>

      {/* ── Label (HTML, centred inside the horseshoe gap) ── */}
      {showLabel && (
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            paddingBottom: size * 0.02,
          }}
        >
          <span
            style={{
              fontSize: size * 0.155,
              fontWeight: 800,
              color,
              lineHeight: 1.1,
            }}
          >
            {left}
          </span>
          <span style={{ fontSize: size * 0.075, color, opacity: 0.65 }}>
            {label ?? "Left"}
          </span>
        </div>
      )}
    </div>
  );
};

export default CalorieRing;
