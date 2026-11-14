import { Card } from "@/components/ui/card";
import type { TableRow } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import { formatNumber, formatSigned } from "@/lib/format";

/** League table rows around this match. The two teams playing are raised, not coloured. */
export function MatchTable({ rows, playing, competition }: { rows: TableRow[]; playing: string[]; competition: string }) {
  return (
    <Card className="overflow-hidden">
      <table className="w-full text-sm">
        <caption className="px-4 pt-3.5 pb-2 text-start text-[13px] font-medium text-muted-foreground">{competition}</caption>
        <thead>
          <tr className="text-[11px] font-semibold tracking-[0.08em] text-muted-foreground uppercase">
            <th scope="col" className="w-10 py-1.5 ps-4 text-start font-semibold">
              <span className="sr-only">رتبه</span>#
            </th>
            <th scope="col" className="py-1.5 text-start font-semibold">
              تیم
            </th>
            <th scope="col" className="w-10 py-1.5 text-end font-semibold">
              <abbr title="بازی‌ها">بازی</abbr>
            </th>
            <th scope="col" className="w-12 py-1.5 text-end font-semibold">
              <abbr title="تفاضل گل">تفاضل</abbr>
            </th>
            <th scope="col" className="w-14 py-1.5 pe-4 text-end font-semibold">
              <abbr title="امتیاز">امتیاز</abbr>
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => {
            const on = playing.includes(r.code);
            return (
              <tr key={r.code} className={cn("border-t border-line", on && "bg-surface-2")}>
                <td className="py-2.5 ps-4 font-display text-base font-bold text-muted-foreground">{formatNumber(r.pos)}</td>
                <th scope="row" className={cn("py-2.5 text-start font-display text-base tracking-wide", on ? "font-bold" : "font-semibold")}>
                  {r.code}
                </th>
                <td className="py-2.5 text-end font-display text-base text-muted-foreground tabular-nums">{formatNumber(r.played)}</td>
                <td className="py-2.5 text-end font-display text-base text-muted-foreground tabular-nums">
                  {formatSigned(r.gd)}
                </td>
                <td className="py-2.5 pe-4 text-end font-display text-base font-bold tabular-nums">{formatNumber(r.points)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </Card>
  );
}

/** Last meetings from the home side's view, as one split bar. */
export function HeadToHead({ h2h, home, away }: { h2h: { won: number; drawn: number; lost: number }; home: string; away: string }) {
  const total = h2h.won + h2h.drawn + h2h.lost;
  const cells = [
    { n: h2h.won, label: `برد ${home}` },
    { n: h2h.drawn, label: "مساوی" },
    { n: h2h.lost, label: `برد ${away}` },
  ];
  return (
    <Card className="gap-3 p-4">
      <h3 className="text-[13px] font-medium text-muted-foreground">{formatNumber(total)} دیدار اخیر</h3>
      <dl className="grid grid-cols-3 text-center">
        {cells.map((c) => (
          <div key={c.label} className="flex flex-col-reverse items-center gap-0.5">
            <dt className="text-xs text-muted-foreground">{c.label}</dt>
            <dd className="font-display text-[28px] leading-none font-bold">{formatNumber(c.n)}</dd>
          </div>
        ))}
      </dl>
      <div className="flex h-1.5 gap-[3px]" aria-hidden="true">
        {cells.map((c, i) => (
          <span
            key={c.label}
            className={cn("rounded-full", i === 1 ? "bg-dim" : "bg-foreground", i === 2 && "bg-muted-foreground")}
            style={{ width: `${(c.n / total) * 100}%` }}
          />
        ))}
      </div>
    </Card>
  );
}
