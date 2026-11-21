import { AppShell } from "@/components/footon/app-shell";
import { LiveDays } from "@/components/footon/live-days";
import { MatchDays } from "@/components/footon/match-days";
import { matches } from "@/lib/mock-data";

/** Live tab: FotMob-style day strip + Live filter over every match, grouped by competition. Real fixtures when a backend is set. */
export default function LivePage() {
  return <AppShell>{process.env.NEXT_PUBLIC_GAMIFICATION_API ? <LiveDays /> : <MatchDays matches={matches} />}</AppShell>;
}
