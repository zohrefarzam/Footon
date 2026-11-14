import { useId } from "react";

import { cn } from "@/lib/utils";

/*
 * Winky, the Lucky Fan mascot: a football that winks, with a lucky four-leaf
 * clover sprouting on its head. Cartoon "sticker" style: flat colours, a thick
 * ink outline and a white sticker border, so it reads on the dark ground and
 * on light. Masters and usage: docs/brand/.
 *
 * Parts carry data attributes so the splash can animate them:
 *   data-winky-clover  the sprout (pops in)       data-winky-body  ball + face
 *   data-winky-eye-r   the right eye, open        data-winky-wink  the right eye, winking
 * `wink={false}` draws both eyes open and `sprouted={false}` hides the clover (the splash's first frame).
 */
const INK = "#04170E";
const LIME = "#43B883";
const LIME_D = "#2E8F63";
const AMBER = "#FFA83E";
const WHITE = "#F3F8F4";
const SHADE = "#C9D4CE";
const STICKER = "#FFFFFF";

const STEM = "M128,56 C127,46 136,38 148,34";
const LEAF = "M0,0 L-21.8,-12.7 A12.9,12.9 0 0 1 0,-21.8 A12.9,12.9 0 0 1 21.8,-12.7 Z";
const LEAF_ANGLES = [45, 135, 225, 315];
const leaves = LEAF_ANGLES.map((a) => <path key={a} d={LEAF} transform={`translate(152 30) rotate(${a})`} />);

/** Rim patches of the ball (pentagons, partly cut by the edge). */
const PATCHES = [
  "72.0,93.6 50.6,98.1 39.7,79.2 54.3,63.0 74.3,71.9",
  "184.0,93.6 181.7,71.9 201.7,63.0 216.3,79.2 205.4,98.1",
  "50.8,141.3 37.3,158.5 16.8,151.0 17.5,129.2 38.5,123.2",
  "205.2,141.3 217.5,123.2 238.5,129.2 239.2,151.0 218.7,158.5",
];

const part = { transformBox: "fill-box", transformOrigin: "center" } as const;

export function Winky({ wink = true, sprouted = true, className, title }: { wink?: boolean; sprouted?: boolean; className?: string; title?: string }) {
  const clip = useId();
  return (
    <svg
      // square box with room above for the clover's sticker border; overflow for the splash's pop overshoot
      viewBox="-8 -16 272 272"
      overflow="visible"
      className={cn("block", className)}
      role={title ? "img" : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
    >
      <g data-winky-clover style={{ transformBox: "view-box", transformOrigin: "128px 60px", transform: sprouted ? undefined : "scale(0)" }}>
        <path d={STEM} fill="none" stroke={STICKER} strokeWidth="28" strokeLinecap="round" />
        <g fill={STICKER} stroke={STICKER} strokeWidth="20" strokeLinejoin="round">
          {leaves}
        </g>
        <path d={STEM} fill="none" stroke={INK} strokeWidth="12" strokeLinecap="round" />
        <path d={STEM} fill="none" stroke={LIME_D} strokeWidth="5" strokeLinecap="round" />
        <g fill={INK} stroke={INK} strokeWidth="10" strokeLinejoin="round">
          {leaves}
        </g>
        <g fill={LIME}>{leaves}</g>
        <g stroke={INK} strokeWidth="3.5" strokeLinecap="round">
          <line x1="157" y1="30" x2="171" y2="30" />
          <line x1="152" y1="35" x2="152" y2="49" />
          <line x1="147" y1="30" x2="133" y2="30" />
          <line x1="152" y1="25" x2="152" y2="11" />
        </g>
        <circle cx="152" cy="30" r="4" fill={INK} />
      </g>

      <g data-winky-body>
        <circle cx="128" cy="144" r="102" fill={STICKER} />
        <clipPath id={clip}>
          <circle cx="128" cy="144" r="90" />
        </clipPath>
        <circle cx="128" cy="144" r="90" fill={WHITE} />
        <g clipPath={`url(#${clip})`}>
          <path d="M146,238.5 A90,90 0 0 0 222.5,157.5 A103.5,103.5 0 0 1 146,238.5Z" fill={SHADE} />
          <polygon points="128,73.2 145.7,86.1 138.9,106.8 117.1,106.8 110.3,86.1" fill={INK} stroke={INK} strokeWidth="3.9" strokeLinejoin="round" />
          <g stroke={INK} strokeWidth="4.9" strokeLinecap="round">
            <line x1="128" y1="73.2" x2="128" y2="46.8" />
            <line x1="145.7" y1="86.1" x2="170.8" y2="77.9" />
            <line x1="110.3" y1="86.1" x2="85.2" y2="77.9" />
          </g>
          <g fill={INK} stroke={INK} strokeWidth="3.9" strokeLinejoin="round">
            {PATCHES.map((p) => (
              <polygon key={p} points={p} />
            ))}
          </g>
        </g>
        <circle cx="128" cy="144" r="90" fill="none" stroke={INK} strokeWidth="10" />

        {/* face */}
        <g style={part} data-winky-eye-l>
          <ellipse cx="100" cy="132" rx="12" ry="17" fill={INK} />
          <circle cx="104" cy="125" r="4.5" fill="#FFFFFF" />
        </g>
        <g style={{ ...part, opacity: wink ? 0 : 1 }} data-winky-eye-r>
          <ellipse cx="158" cy="132" rx="12" ry="17" fill={INK} />
          <circle cx="162" cy="125" r="4.5" fill="#FFFFFF" />
        </g>
        <path
          data-winky-wink
          style={{ opacity: wink ? 1 : 0 }}
          d="M144,134 Q158,118 172,134"
          fill="none"
          stroke={INK}
          strokeWidth="9"
          strokeLinecap="round"
        />
        <ellipse cx="82" cy="160" rx="10" ry="6" fill={AMBER} />
        <ellipse cx="176" cy="160" rx="10" ry="6" fill={AMBER} />
        <path d="M100,164 Q130,166 158,158 Q156,198 126,198 Q102,196 100,164Z" fill={INK} stroke={INK} strokeWidth="6" strokeLinejoin="round" />
        <path d="M112,186 Q128,176 146,184 Q140,196 126,196 Q116,194 112,186Z" fill={AMBER} />
      </g>
    </svg>
  );
}
