import Link from "next/link";
import { ChevronLeft } from "lucide-react";

import { AppShell } from "@/components/footon/app-shell";
import { InviteRow } from "@/components/footon/invite-row";
import { Button } from "@/components/ui/button";
import { invites, matches } from "@/lib/mock-data";

export default function InvitesPage() {
  const pending = invites.flatMap((i) => {
    const match = matches.find((m) => m.id === i.matchId);
    return match ? [{ ...i, match }] : [];
  });

  return (
    <AppShell>
      <header className="flex items-center gap-3">
        <Button asChild variant="secondary" size="icon-sm" aria-label="بازگشت به خانه" className="rounded-[11px]">
          <Link href="/">
            <ChevronLeft className="rtl:rotate-180" />
          </Link>
        </Button>
        <h1 className="text-[26px] font-bold tracking-[-0.03em]">دعوت‌ها</h1>
      </header>

      <ul className="flex flex-col divide-y divide-line overflow-hidden rounded-[20px] border border-line bg-surface">
        {pending.map((inv) => (
          <InviteRow key={inv.id} invite={inv} />
        ))}
      </ul>
    </AppShell>
  );
}
