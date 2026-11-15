import Link from "next/link";
import { Plus, Swords } from "lucide-react";

import { AppShell } from "@/components/footon/app-shell";
import { ChallengeList } from "@/components/footon/challenge-list";
import { InviteStrip } from "@/components/footon/invite-strip";
import { LockedFeatureGate } from "@/components/footon/gamification/locked-feature-gate";
import { challengesWithMatch } from "@/lib/challenges";
import { invites, matches } from "@/lib/mock-data";

/**
 * Challenges hub: pending invites to answer, then every challenge you're part
 * of as Joined • Invited • Expired. The one lime action, start a new one, is a
 * card at the top (no visible title: the dock already names the tab).
 * Each row opens the challenge's own page (accept, predict, chat).
 */
export default function ChallengesPage() {
  const pending = invites.flatMap((i) => {
    const match = matches.find((m) => m.id === i.matchId);
    return match ? [{ ...i, match }] : [];
  });

  return (
    <AppShell>
      <h1 className="sr-only">چالش‌ها</h1>

      {/* the page's one action, as a card you tap: no title bar above it, the dock already says where you are */}
      <LockedFeatureGate feature="createLeague" title="چالش تازه">
        <Link
          href="/challenges/new"
          className="group flex items-center gap-3 rounded-xl border border-line bg-surface p-3.5 outline-none transition-[transform,background-color] duration-200 ease-spring hover:bg-surface-hover focus-visible:ring-[3px] focus-visible:ring-ring/60 active:scale-[0.98]"
        >
          <span aria-hidden="true" className="flex size-11 shrink-0 items-center justify-center rounded-md bg-surface-3 text-foreground">
            <Swords className="size-5" strokeWidth={2.2} />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-[15px] font-semibold">چالش خودت را بساز</span>
            <span className="mt-0.5 block truncate text-xs text-muted-foreground">دوستات را بیار و رقابت کنید.</span>
          </span>
          <span
            aria-hidden="true"
            className="flex size-11 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground transition-transform duration-200 ease-spring group-hover:scale-105"
          >
            <Plus className="size-5" strokeWidth={2.6} />
          </span>
        </Link>
      </LockedFeatureGate>

      <div id="invites" className="scroll-mt-20">
        <InviteStrip invites={pending} />
      </div>

      <ChallengeList challenges={challengesWithMatch()} />
    </AppShell>
  );
}
