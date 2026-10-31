import { cn } from "@/lib/utils";

/*
 * A classic 32-panel ball seen face-on: one centre pentagon, five patches
 * around it (clipped by the edge) and the seams between them. Geometry is
 * computed once at module load, so the SVG stays small and exact.
 */
type Pt = [number, number];
const C = 50;
const rad = (d: number) => (d * Math.PI) / 180;
const at = (r: number, deg: number, cx = C, cy = C): Pt => [cx + r * Math.cos(rad(deg)), cy + r * Math.sin(rad(deg))];
const pts = (p: Pt[]) => p.map(([x, y]) => `${x.toFixed(2)},${y.toFixed(2)}`).join(" ");

const R = 13.5; // pentagon radius
const D = 39; // distance of outer patches from centre
const angles = [0, 1, 2, 3, 4].map((k) => -90 + 72 * k);

const centre = angles.map((a) => at(R, a));
const outer = angles.map((a) => {
  const [cx, cy] = at(D, a);
  return [0, 1, 2, 3, 4].map((j) => at(R, a + 180 + 72 * j, cx, cy));
});

const seams: [Pt, Pt][] = [];
angles.forEach((_, k) => {
  // centre vertex → the patch vertex that points back at it
  seams.push([centre[k], outer[k][0]]);
  // patch → its neighbour (the closest pair of vertices)
  const a = outer[k];
  const b = outer[(k + 1) % 5];
  let best: [Pt, Pt] = [a[0], b[0]];
  let d = Infinity;
  for (const p of a)
    for (const q of b) {
      const dd = (p[0] - q[0]) ** 2 + (p[1] - q[1]) ** 2;
      if (dd < d) {
        d = dd;
        best = [p, q];
      }
    }
  seams.push(best);
  // the two outer vertices run off the edge
  for (const j of [2, 3]) {
    const [x, y] = a[j];
    const dx = x - C;
    const dy = y - C;
    const len = Math.hypot(dx, dy);
    seams.push([a[j], [C + (dx / len) * 52, C + (dy / len) * 52]]);
  }
});

/** The rotating part: panels and seams. Layer `FootballShade` on top. */
export function FootballPattern({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" aria-hidden="true" className={cn("block size-full", className)}>
      <defs>
        <clipPath id="footon-ball-clip">
          <circle cx={C} cy={C} r="48" />
        </clipPath>
      </defs>
      <circle cx={C} cy={C} r="48" fill="#f4f4f5" />
      <g clipPath="url(#footon-ball-clip)" strokeLinejoin="round">
        <g stroke="#a1a1aa" strokeWidth="1.4" strokeLinecap="round">
          {seams.map(([p, q], i) => (
            <line key={i} x1={p[0]} y1={p[1]} x2={q[0]} y2={q[1]} />
          ))}
        </g>
        <g fill="#18181b" stroke="#18181b" strokeWidth="2">
          <polygon points={pts(centre)} />
          {outer.map((p, i) => (
            <polygon key={i} points={pts(p)} />
          ))}
        </g>
      </g>
    </svg>
  );
}

/** Static light and shadow, so the ball reads as round while the pattern spins. */
export function FootballShade({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" aria-hidden="true" className={cn("block size-full", className)}>
      <defs>
        <clipPath id="footon-ball-shade">
          <circle cx={C} cy={C} r="48" />
        </clipPath>
      </defs>
      <g clipPath="url(#footon-ball-shade)">
        {/* core shadow: an offset circle subtracted from the ball */}
        <path
          d="M2 50a48 48 0 1 0 96 0a48 48 0 1 0-96 0ZM-6 40a52 52 0 1 1 104 0a52 52 0 1 1-104 0Z"
          fill="#09090b"
          fillRule="evenodd"
          opacity=".38"
        />
        <ellipse cx="34" cy="28" rx="14" ry="8" transform="rotate(-30 34 28)" fill="#fff" opacity=".22" />
      </g>
      <circle cx={C} cy={C} r="47.5" fill="none" stroke="#09090b" strokeOpacity=".35" />
    </svg>
  );
}

/** Static ball, e.g. as an icon-sized brand mark. */
export function Football({ className }: { className?: string }) {
  return (
    <span className={cn("relative inline-block size-12 shrink-0", className)} aria-hidden="true">
      <FootballPattern className="absolute inset-0" />
      <FootballShade className="absolute inset-0" />
    </span>
  );
}
