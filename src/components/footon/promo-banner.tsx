import { ArrowRight, ArrowUpRight, Trophy } from "lucide-react";

import type { Promo } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import { Football } from "./football";
import { PromoLink } from "./promo-link";

/** The banner's picture, drawn in the partner's ink and accent. Decorative. */
function PromoArt({ art, ink, accent }: { art: Promo["art"]; ink: string; accent: string }) {
  if (art === "trophy")
    return (
      <span className="relative flex size-full items-center justify-center">
        <span className="absolute size-[84px] rounded-full border" style={{ borderColor: `${ink}26` }} />
        <span className="absolute size-[62px] rounded-full" style={{ background: `${accent}1f` }} />
        <Trophy className="relative size-10" strokeWidth={1.6} style={{ color: accent }} />
        <Football className="absolute end-0 bottom-3 size-8" />
      </span>
    );
  if (art === "boot")
    return (
      <svg viewBox="0 0 120 100" className="size-full" fill="none">
        {/* speed lines */}
        <path d="M6 44h22M2 56h20M10 68h16" stroke={accent} strokeWidth="3" strokeLinecap="round" opacity=".7" />
        {/* boot */}
        <path
          d="M34 70c-3-12 2-22 12-26l10-22c1-3 4-4 7-4h12c3 0 5 2 5 5l1 15 22 9c9 4 13 11 11 19l-1 4H38c-2 0-3 0-4 0Z"
          fill={ink}
        />
        <path d="M62 28l12 0M60 36l14 0M58 44l16 0" stroke={accent} strokeWidth="3" strokeLinecap="round" />
        <path d="M86 52c8 2 16 6 18 12" stroke={accent} strokeWidth="3" strokeLinecap="round" />
        {/* studs */}
        {[46, 60, 82, 98].map((x) => (
          <rect key={x} x={x} y="70" width="6" height="7" rx="2" fill={ink} />
        ))}
      </svg>
    );
  return (
    <svg viewBox="0 0 120 100" className="size-full" fill="none">
      {/* a TV showing the pitch, with the live dot */}
      <rect x="10" y="16" width="100" height="62" rx="8" stroke={ink} strokeWidth="3" />
      <rect x="17" y="23" width="86" height="48" rx="3" fill={accent} opacity=".2" />
      <path d="M60 23v48" stroke={ink} strokeOpacity=".5" strokeWidth="1.5" />
      <circle cx="60" cy="47" r="10" stroke={ink} strokeOpacity=".5" strokeWidth="1.5" />
      <path d="M17 37h9v20h-9M103 37h-9v20h9" stroke={ink} strokeOpacity=".5" strokeWidth="1.5" />
      <circle cx="96" cy="30" r="3.5" fill={accent} />
      <path d="M44 88h32M60 78v10" stroke={ink} strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

/**
 * One sponsor banner: the partner's own colours, a "Sponsored" label and the
 * partner name always visible, a display headline, one line, a pill that says
 * where the tap goes, and a drawn picture. The whole card is the link.
 * Commercial rules: labelled, no countdowns or "last chance", never after a
 * loss; prizes go by points.
 */
export function PromoBanner({ promo: p, slot, className }: { promo: Promo; slot: number; className?: string }) {
  const [ground, ink, accent] = p.colors;
  const Arrow = p.external ? ArrowUpRight : ArrowRight;
  return (
    <PromoLink
      id={p.id}
      slot={slot}
      href={p.href}
      external={p.external}
      aria-label={`تبلیغ ${p.partner}: ${p.headline}. ${p.body} ${p.cta}${p.external ? "، سایت شریک باز میشه" : ""}`}
      className={cn(
        "group relative isolate grid h-[172px] grid-cols-[minmax(0,1fr)_88px] gap-2 overflow-hidden rounded-2xl p-4 outline-none transition-transform duration-200 ease-spring active:scale-[0.98] focus-visible:ring-[3px] focus-visible:ring-ring/60",
        className,
      )}
    >
      <span aria-hidden="true" className="absolute inset-0 -z-10" style={{ background: ground }} />
      {/* one quiet accent band along the bottom, in the partner's colour */}
      <span aria-hidden="true" className="absolute inset-x-0 bottom-0 -z-10 h-1" style={{ background: accent }} />

      <span aria-hidden="true" className="flex min-w-0 flex-col" style={{ color: ink }}>
        <span className="truncate pe-2 text-[11px] font-semibold tracking-[0.08em] uppercase">{p.partner}</span>
        <span className="mt-2 line-clamp-2 font-display text-[25px] max-[359px]:text-[21px] leading-[0.95] font-bold tracking-[0.01em] text-balance uppercase">{p.headline}</span>
        <span className="mt-1.5 line-clamp-2 text-[12px] leading-snug opacity-80 max-[359px]:line-clamp-1">{p.body}</span>
        <span
          className="mt-auto inline-flex h-8 w-fit items-center gap-1 rounded-full px-3 text-[13px] font-semibold whitespace-nowrap transition-transform duration-200 ease-spring group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5"
          style={{ background: ink, color: ground }}
        >
          {p.cta}
          <Arrow className="size-3.5 rtl:-scale-x-100" strokeWidth={2.4} />
        </span>
      </span>

      {/* the disclosure sits in the corner above the picture, always visible */}
      <span
        aria-hidden="true"
        className="absolute end-3 top-3 rounded-full border px-1.5 py-px text-[11px] font-medium opacity-80"
        style={{ borderColor: `${ink}40`, color: ink }}
      >
        تبلیغ
      </span>
      <span aria-hidden="true" className="flex items-center justify-center pt-5">
        <PromoArt art={p.art} ink={ink} accent={accent} />
      </span>
    </PromoLink>
  );
}

/**
 * Home's partner slot: banners in a snap row where the next one peeks in, so
 * there's always a hint of more. One banner takes the full width.
 */
export function PromoCarousel({ promos, className }: { promos: Promo[]; className?: string }) {
  if (!promos.length) return null;
  const single = promos.length === 1;
  return (
    <section aria-label="شرکا" className={className}>
      <ul className={cn(!single && "-mx-5 flex snap-x snap-mandatory scroll-px-5 gap-3 overflow-x-auto px-5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden")}>
        {promos.map((p, i) => (
          <li key={p.id} className={cn(!single && "w-[88%] max-w-[380px] shrink-0 snap-start")}>
            <PromoBanner promo={p} slot={i + 1} />
          </li>
        ))}
      </ul>
    </section>
  );
}
