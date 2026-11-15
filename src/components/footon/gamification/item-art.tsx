import { useId } from "react";

import type { ItemLook } from "@/lib/gamification/schemas";
import { cn } from "@/lib/utils";

/*
 * Cartoon pictures of the shop's cosmetics, in the same flat "sticker" style as
 * Winky: flat colours, an ink outline, one flat shade, no gradients or glows.
 * Every colour comes from the item's `look` (data, like a club's kit colours);
 * `look.pattern` picks the design and `look.accent` is an optional third colour.
 */
const INK = "#04170E";
const NEUTRAL: ItemLook = { primary: "#2E4B3F", secondary: "#9DB1A6" };

// ---------------------------------------------------------------- kit

/** Jersey: shoulders, short sleeves, body. viewBox 0 0 100 100. */
const JERSEY = "M31,13 L42,9 Q50,17 58,9 L69,13 L91,27 L82,44 L72,39 L72,89 Q50,94 28,89 L28,39 L18,44 L9,27 Z";

function kitPattern(pattern: string | undefined, c: string) {
  switch (pattern) {
    case "stripes":
      return [24, 40, 56, 72].map((x) => <rect key={x} x={x} y="0" width="8" height="100" fill={c} />);
    case "hoops":
      return [34, 52, 70, 88].map((y) => <rect key={y} x="0" y={y} width="100" height="9" fill={c} />);
    case "halves":
      return <rect x="50" y="0" width="50" height="100" fill={c} />;
    case "sash":
      return <polygon points="22,22 38,22 82,92 66,92" fill={c} />;
    case "chevron":
      return <polygon points="20,34 50,58 80,34 80,46 50,70 20,46" fill={c} />;
    default:
      return null;
  }
}

export function KitArt({ look = NEUTRAL, className }: { look?: ItemLook; className?: string }) {
  const clip = useId();
  const accent = look.accent ?? look.secondary;
  return (
    <svg viewBox="0 0 100 100" aria-hidden="true" className={cn("block", className)}>
      <clipPath id={clip}>
        <path d={JERSEY} />
      </clipPath>
      <path d={JERSEY} fill={look.primary} />
      <g clipPath={`url(#${clip})`}>
        {kitPattern(look.pattern, look.secondary)}
        {/* flat shade down the wearer's left side, and the sleeves' cuffs */}
        <path d="M58,30 L72,30 L72,89 Q64,92 58,92 Z" fill="#000" opacity=".14" />
        <path d="M86,35 L91,27 L82,44 L77,41 Z M14,35 L9,27 L18,44 L23,41 Z" fill={accent} />
      </g>
      {/* collar and a small crest on the chest */}
      <path d="M42,9 Q50,22 58,9" fill="none" stroke={accent} strokeWidth="5" strokeLinecap="round" />
      <path d="M61,36 h8 v5 q0,5 -4,7 q-4,-2 -4,-7 z" fill={accent} stroke={INK} strokeWidth="1.5" strokeLinejoin="round" />
      <path d={JERSEY} fill="none" stroke={INK} strokeWidth="3.2" strokeLinejoin="round" />
    </svg>
  );
}

// ---------------------------------------------------------------- boots

/** One boot, side on, toe to the left. viewBox 0 0 100 64. */
export function BootArt({ look = NEUTRAL, className }: { look?: ItemLook; className?: string }) {
  const high = look.pattern === "high";
  const accent = look.accent ?? look.secondary;
  const upper = high
    ? "M10,40 Q6,30 20,27 L48,22 L56,8 Q58,4 64,4 L84,4 Q90,4 90,10 L90,44 L12,46 Q8,44 10,40 Z"
    : "M10,40 Q6,30 20,27 L48,22 Q56,10 68,10 L84,11 Q90,12 90,18 L90,44 L12,46 Q8,44 10,40 Z";
  return (
    <svg viewBox="0 0 100 64" aria-hidden="true" className={cn("block", className)}>
      {/* sole and studs */}
      <rect x="8" y="43" width="84" height="7" rx="3.5" fill={accent} stroke={INK} strokeWidth="2.6" />
      {[18, 32, 60, 76].map((x) => (
        <rect key={x} x={x} y="50" width="6" height="6" rx="1.5" fill={INK} />
      ))}
      <path d={upper} fill={look.primary} stroke={INK} strokeWidth="2.8" strokeLinejoin="round" />
      {/* the stripe on the side: a swoosh, or a lightning flash for speed boots */}
      {look.pattern === "speed" ? (
        <path d="M30,40 L52,28 L50,34 L70,26 L44,42 L46,36 Z" fill={look.secondary} stroke={INK} strokeWidth="1.6" strokeLinejoin="round" />
      ) : (
        <path d="M26,40 Q52,40 76,24" fill="none" stroke={look.secondary} strokeWidth="5" strokeLinecap="round" />
      )}
      {/* laces */}
      <g stroke={look.secondary} strokeWidth="2.2" strokeLinecap="round">
        <line x1="50" y1="24" x2="56" y2="20" />
        <line x1="44" y1="25.5" x2="50" y2="21.5" />
        <line x1="38" y1="27" x2="44" y2="23" />
      </g>
      {/* flat shade on the heel */}
      <path d={high ? "M78,4 L84,4 Q90,4 90,10 L90,44 L78,44 Z" : "M78,11 L84,11 Q90,12 90,18 L90,44 L78,44 Z"} fill="#000" opacity=".14" />
    </svg>
  );
}

// ---------------------------------------------------------------- stadium

/** A night match: floodlights, the stands in the stadium's colours, and the pitch. viewBox 0 0 160 100. */
export function StadiumArt({ look = NEUTRAL, className }: { look?: ItemLook; className?: string }) {
  const accent = look.accent ?? "#FFA83E";
  const p = look.pattern;
  const top = p === "bowl" ? 34 : p === "arena" ? 30 : 44;
  const stand =
    p === "bowl"
      ? `M0,${top + 8} Q80,${top - 10} 160,${top + 8} L160,74 L0,74 Z`
      : `M0,${top} L160,${top} L160,74 L0,74 Z`;
  const rows = [0, 1, 2, 3, 4].map((i) => top + 8 + i * ((74 - top - 8) / 5));
  // a few fans in the stands, in the accent colour: fixed positions, so the picture never jitters.
  // On the bowl they sit on its curved rows (the same quadratic as the row lines).
  const onRow = (x: number, row: number) => {
    if (p !== "bowl") return row - 2;
    const t = x / 160;
    return (1 - t) ** 2 * (row + 6) + 2 * t * (1 - t) * (row - 8) + t ** 2 * (row + 6) - 2;
  };
  const fans = [12, 26, 41, 57, 70, 88, 103, 118, 131, 146].map((x, i) => [x, onRow(x, rows[(i * 3) % 5])] as const);
  return (
    <svg viewBox="0 0 160 100" preserveAspectRatio="xMidYMid slice" aria-hidden="true" className={cn("block", className)}>
      <rect width="160" height="100" fill="#0B1E17" />
      {/* floodlight beams: flat, faint, like the app's floodlight texture */}
      <polygon points="20,12 0,74 52,74" fill="#FFFFFF" opacity=".05" />
      <polygon points="140,12 108,74 160,74" fill="#FFFFFF" opacity=".05" />
      {/* stands */}
      <path d={stand} fill={look.primary} />
      <g stroke={look.secondary} strokeWidth="1.4" opacity=".55">
        {rows.map((y) => (p === "bowl" ? <path key={y} d={`M0,${y + 6} Q80,${y - 8} 160,${y + 6}`} fill="none" /> : <line key={y} x1="0" y1={y} x2="160" y2={y} />))}
      </g>
      {fans.map(([x, y]) => (
        <circle key={x} cx={x} cy={y} r="1.8" fill={accent} />
      ))}
      {/* a roof on the arena, a gable on the classic ground */}
      {p === "arena" && <path d="M0,22 L160,22 L160,30 L0,30 Z" fill={look.secondary} stroke={INK} strokeWidth="1.6" />}
      {p === "classic" && <path d="M56,44 L80,32 L104,44 Z" fill={look.secondary} stroke={INK} strokeWidth="1.6" strokeLinejoin="round" />}
      {/* floodlight towers */}
      {[20, 140].map((x) => (
        <g key={x}>
          <line x1={x} y1="14" x2={x} y2="74" stroke={INK} strokeWidth="2.4" />
          <rect x={x - 7} y="6" width="14" height="8" rx="1.5" fill={INK} />
          {[-4, 0, 4].map((d) => (
            <circle key={d} cx={x + d} cy="10" r="1.6" fill="#FFF6D6" />
          ))}
        </g>
      ))}
      {/* pitch with mown stripes and the centre line */}
      <rect y="74" width="160" height="26" fill="#2F7D4D" />
      {[0, 32, 64, 96, 128].map((x) => (
        <rect key={x} x={x} y="74" width="16" height="26" fill="#FFFFFF" opacity=".06" />
      ))}
      <line x1="80" y1="74" x2="80" y2="100" stroke="#FFFFFF" strokeOpacity=".7" strokeWidth="1.2" />
      <ellipse cx="80" cy="88" rx="16" ry="6" fill="none" stroke="#FFFFFF" strokeOpacity=".7" strokeWidth="1.2" />
      <line x1="0" y1="74" x2="160" y2="74" stroke={INK} strokeWidth="1.6" />
    </svg>
  );
}

// ---------------------------------------------------------------- frame

/** A badge frame round your club, with its trim. viewBox 0 0 100 100. */
export function FrameArt({ look = NEUTRAL, className }: { look?: ItemLook; className?: string }) {
  const accent = look.accent ?? look.secondary;
  const p = look.pattern;
  return (
    <svg viewBox="0 0 100 100" aria-hidden="true" className={cn("block", className)}>
      <rect x="14" y="14" width="72" height="72" rx="18" fill="#0B1E17" stroke={INK} strokeWidth="13" />
      <rect x="14" y="14" width="72" height="72" rx="18" fill="none" stroke={look.primary} strokeWidth="8" />
      {p === "double" && <rect x="24" y="24" width="52" height="52" rx="10" fill="none" stroke={look.secondary} strokeWidth="3" />}
      {p !== "double" && <rect x="21" y="21" width="58" height="58" rx="12" fill="none" stroke={look.secondary} strokeWidth="1.8" />}
      {p === "laurel" &&
        [24, 36, 48, 60, 72].flatMap((y) => [
          <ellipse key={`l${y}`} cx="10" cy={y} rx="3.5" ry="6" transform={`rotate(-30 10 ${y})`} fill={accent} stroke={INK} strokeWidth="1.4" />,
          <ellipse key={`r${y}`} cx="90" cy={y} rx="3.5" ry="6" transform={`rotate(30 90 ${y})`} fill={accent} stroke={INK} strokeWidth="1.4" />,
        ])}
      {p === "stars" &&
        [
          [14, 14],
          [86, 14],
          [14, 86],
          [86, 86],
        ].map(([x, y]) => (
          <path
            key={`${x}${y}`}
            d={`M${x},${y - 8} L${x + 2.4},${y - 2.4} L${x + 8},${y} L${x + 2.4},${y + 2.4} L${x},${y + 8} L${x - 2.4},${y + 2.4} L${x - 8},${y} L${x - 2.4},${y - 2.4} Z`}
            fill={accent}
            stroke={INK}
            strokeWidth="1.6"
            strokeLinejoin="round"
          />
        ))}
      {/* the club inside: a quiet shirt */}
      <path d="M40,38 L46,35 Q50,40 54,35 L60,38 L66,44 L62,50 L58,48 L58,66 L42,66 L42,48 L38,50 L34,44 Z" fill={look.secondary} opacity=".35" />
    </svg>
  );
}

// ---------------------------------------------------------------- streak freeze

/** The streak freeze: the match-day calendar frozen in a block of ice. viewBox 0 0 100 100. */
export function FreezeArt({ look = { primary: "#BFE7F7", secondary: "#5BB6DE" }, className }: { look?: ItemLook; className?: string }) {
  return (
    <svg viewBox="0 0 100 100" aria-hidden="true" className={cn("block", className)}>
      {/* ice block */}
      <path d="M22,26 L50,14 L80,24 L82,72 L52,86 L20,76 Z" fill={look.primary} stroke={INK} strokeWidth="3.2" strokeLinejoin="round" />
      <path d="M50,14 L52,40 L80,24 M52,40 L52,86 M52,40 L22,26" fill="none" stroke={look.secondary} strokeWidth="2" strokeLinejoin="round" />
      {/* the calendar inside, with its check */}
      <rect x="32" y="44" width="30" height="26" rx="4" fill="#F3F8F4" stroke={INK} strokeWidth="2.4" transform="rotate(-6 47 57)" />
      <rect x="32" y="44" width="30" height="7" rx="3" fill="#FFA83E" stroke={INK} strokeWidth="2.4" transform="rotate(-6 47 57)" />
      <path d="M40,60 L45,65 L55,55" fill="none" stroke={INK} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" transform="rotate(-6 47 57)" />
      {/* frost glints */}
      <g fill="#FFFFFF">
        <path d="M28,34 l2,-6 l2,6 l6,2 l-6,2 l-2,6 l-2,-6 l-6,-2 z" />
        <circle cx="72" cy="36" r="2.4" />
        <circle cx="70" cy="64" r="1.8" />
      </g>
      <path d="M62,30 L76,36" stroke="#FFFFFF" strokeWidth="2.4" strokeLinecap="round" opacity=".8" />
    </svg>
  );
}
