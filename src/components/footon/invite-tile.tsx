import Link from "next/link";
import { ChevronRight } from "lucide-react";

import { Avatar, AvatarFallback, AvatarGroup } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import type { Invite } from "@/lib/mock-data";

/**
 * Pending invites as a compact Home tile: "Invites N" over the senders'
 * avatars. Joining and declining happen on /invites.
 */
export function InviteTile({ invites, className }: { invites: Invite[]; className?: string }) {
  const names = invites.map((i) => i.from);

  return (
    <Link
      href="/invites"
      aria-label={`${invites.length} invites from ${names.join(", ")}`}
      className={cn(
        "group flex min-w-0 flex-col justify-between gap-2 rounded-xl border border-line bg-surface px-3.5 py-3 outline-none transition-colors duration-300 hover:bg-surface-hover focus-visible:ring-[3px] focus-visible:ring-ring/60",
        className,
      )}
    >
      <span className="flex items-center gap-1">
        <span className="text-[13px] font-semibold">Invites</span>
        <span className="ms-auto font-display text-base leading-none font-bold">{invites.length}</span>
        <ChevronRight className="size-3.5 text-muted-foreground transition-transform duration-200 ease-spring group-hover:translate-x-0.5 rtl:rotate-180" aria-hidden="true" />
      </span>

      <span aria-hidden="true" className="flex items-center gap-2">
        <AvatarGroup className="[&>[data-slot=avatar]]:ring-surface">
          {invites.slice(0, 3).map((i) => (
            <Avatar key={i.id} className="size-5">
              <AvatarFallback className="text-[11px]">{i.initial}</AvatarFallback>
            </Avatar>
          ))}
        </AvatarGroup>
        <span className="truncate text-xs text-muted-foreground">
          {names[0]}
          {names.length > 1 && ` +${names.length - 1}`}
        </span>
      </span>
    </Link>
  );
}
