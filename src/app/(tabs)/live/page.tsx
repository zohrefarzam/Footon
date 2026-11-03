import Link from "next/link";
import { ArrowRight, ChevronDown } from "lucide-react";

import { AppShell } from "@/components/footon/app-shell";
import { EmptyState } from "@/components/footon/empty-state";
import { LiveDot } from "@/components/footon/live";
import { MatchRow } from "@/components/footon/match-row";
import { Button } from "@/components/ui/button";
import type { Match } from "@/lib/mock-data";
import { matches } from "@/lib/mock-data";

const href = (m: Match) => (m.status === "live" && m.league ? "/play" : `/match/${m.id}`);

/** One collapsible group (FotMob's competition blocks): header row + divided match rows. */
function Group({ title, list, live }: { title: string; list: Match[]; live?: boolean }) {
  return (
    <details open className="group overflow-hidden rounded-[20px] border border-line bg-surface">
      <summary className="flex h-11 cursor-pointer list-none items-center gap-2 px-4 text-[13px] font-semibold outline-none select-none focus-visible:ring-[3px] focus-visible:ring-inset focus-visible:ring-ring/60 [&::-webkit-details-marker]:hidden">
        {live && <LiveDot />}
        <span className="flex-1 truncate">{title}</span>
        <span className="font-display text-sm text-muted-foreground">{list.length}</span>
        <ChevronDown
          aria-hidden="true"
          className="size-4 text-muted-foreground transition-transform duration-200 ease-spring group-open:rotate-180"
        />
      </summary>
      <div className="border-t border-line">
        {list.map((m) => (
          <MatchRow key={m.id} match={m} href={href(m)} />
        ))}
      </div>
    </details>
  );
}

/**
 * Live tab, after FotMob's live filter: what's on right now, your matches pinned
 * first, the rest grouped by competition (each group folds), then what kicks off
 * later today. The one lime action takes you into your own match.
 */
export default function LivePage() {
  const live = matches.filter((m) => m.status === "live");
  const yours = live.filter((m) => m.league);
  const others = live.filter((m) => !m.league);
  const competitions = [...new Set(others.map((m) => m.competition))];
  const later = matches.filter((m) => m.status === "upcoming" && !m.day).toSorted((a, b) => (a.kickoff ?? "").localeCompare(b.kickoff ?? ""));
  const first = yours[0];

  return (
    <AppShell>
      <div>
        <h1 className="text-[26px] font-bold tracking-[-0.03em]">Live</h1>
        <p className="text-[13px] text-muted-foreground" aria-live="polite">
          {live.length ? `${live.length} ${live.length === 1 ? "match" : "matches"} on now` : "Nothing on right now"}
        </p>
      </div>

      {live.length ? (
        <>
          {first && (
            <>
              <Group title="Your leagues" list={yours} live />
              <Button asChild size="lg">
                <Link href="/play">
                  Play {first.home.code} v {first.away.code}
                  <ArrowRight className="rtl:rotate-180" aria-hidden="true" />
                </Link>
              </Button>
            </>
          )}
          {competitions.map((c) => (
            <Group key={c} title={c} list={others.filter((m) => m.competition === c)} live />
          ))}
        </>
      ) : (
        <EmptyState title="Nothing live" body="Matches show up here the moment they kick off." action={{ label: "See fixtures", href: "/" }} />
      )}

      {later.length > 0 && <Group title="Later today" list={later} />}
    </AppShell>
  );
}
