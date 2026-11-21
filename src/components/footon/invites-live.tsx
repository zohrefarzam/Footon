"use client";

import { PageLoader } from "./page-loader";
import { useSyncExternalStore } from "react";

import { InviteRow } from "@/components/footon/invite-row";
import { dateKey } from "@/lib/football/fixtures";
import { toInvite, useChallenges, useJoinChallenge } from "@/lib/slips/challenges";

const noop = () => () => {};

/** The /invites list on the backend's pending invites. */
export function InvitesLive() {
  const today = useSyncExternalStore(noop, () => dateKey(new Date()), () => null);
  const { invites, loading, error } = useChallenges(today);
  const join = useJoinChallenge();

  if (error) return <p className="text-center text-sm text-muted-foreground">الان نمی‌تونیم دعوت‌هات را بیاریم. چند لحظهٔ دیگه دوباره بیا.</p>;
  if (loading) return <PageLoader />;
  if (!invites.length) return <p className="bg-dots rounded-[20px] border border-dashed border-line-strong px-6 py-10 text-center text-sm text-muted-foreground">دعوتی در انتظار نیست.</p>;
  return (
    <ul className="flex flex-col divide-y divide-line overflow-hidden rounded-[20px] border border-line bg-surface">
      {invites.map((c) => (
        <InviteRow key={c.id} invite={toInvite(c)} onJoin={join} />
      ))}
    </ul>
  );
}

