import { AppShell } from "@/components/footon/app-shell";
import { MatchDays } from "@/components/footon/match-days";
import { matches } from "@/lib/mock-data";

/** Live tab: FotMob-style day strip + Live filter over every match, grouped by competition. */
export default function LivePage() {
  return (
    <AppShell>
      <MatchDays matches={matches} />
    </AppShell>
  );
}
