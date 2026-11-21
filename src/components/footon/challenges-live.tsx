"use client";

import { useSyncExternalStore } from "react";

import { ChallengeList } from "@/components/footon/challenge-list";
import { JoinByCode } from "@/components/footon/join-by-code";
import { InviteStrip } from "@/components/footon/invite-strip";
import { Skeleton } from "@/components/ui/skeleton";
import { dateKey } from "@/lib/football/fixtures";
import { toInvite, useChallenges, useJoinChallenge } from "@/lib/slips/challenges";

const noop = () => () => {};

/** The Challenges tab's invites and list on the backend's challenges. */
export function ChallengesLive() {
  const today = useSyncExternalStore(noop, () => dateKey(new Date()), () => null);
  const { all, invites, loading, error } = useChallenges(today);
  const join = useJoinChallenge();

  if (error) return <p className="text-center text-sm text-muted-foreground">الان نمی‌تونیم چالش‌هات را بیاریم. چند لحظهٔ دیگه دوباره بیا.</p>;
  if (loading) return <Skeleton className="h-48 w-full rounded-2xl" />;
  return (
    <>
      <JoinByCode today={today!} />
      <div id="invites" className="scroll-mt-20">
        <InviteStrip invites={invites.map(toInvite)} onJoin={join} />
      </div>
      <ChallengeList challenges={all} />
    </>
  );
}
