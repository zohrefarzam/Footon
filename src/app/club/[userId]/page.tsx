import { AppShell } from "@/components/footon/app-shell";
import { BackButton } from "@/components/footon/back-button";
import { ClubPage } from "@/components/footon/gamification/club-page";

/** The mock server's friends; the real app links here from league members. */
export function generateStaticParams() {
  return [{ userId: "sara" }, { userId: "omid" }];
}

/** A friend's club (focus mode): the same view as yours, without the shop or share. */
export default async function FriendClubPage({ params }: PageProps<"/club/[userId]">) {
  const { userId } = await params;
  return (
    <AppShell dock={false} className="pt-3.5">
      <header className="flex items-center gap-3">
        <BackButton href="/challenges" />
        <h1 className="text-[26px] font-bold tracking-[-0.03em]">باشگاه</h1>
      </header>
      <ClubPage userId={userId} />
    </AppShell>
  );
}
