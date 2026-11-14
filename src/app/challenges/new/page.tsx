import Link from "next/link";
import { X } from "lucide-react";

import { AppShell } from "@/components/footon/app-shell";
import { LockedFeatureGate } from "@/components/footon/gamification/locked-feature-gate";
import { Button } from "@/components/ui/button";
import { wallet } from "@/lib/mock-data";
import { CreateLeagueForm } from "./create-league-form";

export default function NewChallengePage() {
  return (
    <AppShell dock={false} className="pt-3.5">
      <header className="flex h-11 items-center gap-3">
        <Button asChild variant="secondary" size="icon" aria-label="بستن" className="size-10">
          <Link href="/challenges">
            <X className="size-4" />
          </Link>
        </Button>
        <h1 className="flex-1 text-center text-lg font-semibold">چالش تازه</h1>
        <span className="w-10" />
      </header>
      <LockedFeatureGate feature="createLeague" title="ساختن لیگ" className="mt-4">
        <CreateLeagueForm balance={wallet.coins} />
      </LockedFeatureGate>
    </AppShell>
  );
}
