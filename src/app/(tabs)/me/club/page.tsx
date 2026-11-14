import { AppShell } from "@/components/footon/app-shell";
import { BackButton } from "@/components/footon/back-button";
import { ClubPage } from "@/components/footon/gamification/club-page";

/** My Club: your kit, stadium, boots, frame, badges, level and streak; share it as an image. */
export default function MyClubPage() {
  return (
    <AppShell className="pt-3.5">
      <header className="flex items-center gap-3">
        <BackButton href="/me" />
        <h1 className="text-[26px] font-bold tracking-[-0.03em]">باشگاه من</h1>
      </header>
      <ClubPage />
    </AppShell>
  );
}
