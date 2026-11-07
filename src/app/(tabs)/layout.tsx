import { Dock } from "@/components/footon/dock";
import { LevelBar } from "@/components/footon/level-bar";
import { LiveIsland } from "@/components/footon/live-island";
import { liveQuestion, matches, profile, wallet } from "@/lib/mock-data";

/**
 * Shared shell for the dock tabs (Home, Challenges, Live, Profile, plus Fantasy).
 * The island, the level bar and the dock live here, not in each page, so they stay pinned and
 * keep their state while you switch tabs.
 */
export default function TabsLayout({ children }: LayoutProps<"/">) {
  const live = matches.find((m) => m.status === "live");

  return (
    <>
      {/* reserves the collapsed height; the island floats, so expanding it overlays the page instead of pushing it */}
      <div className="pointer-events-none sticky top-0 z-30 mx-auto h-[calc(54px+env(safe-area-inset-top))] w-full max-w-[430px] md:max-w-[560px]">
        {/* solid strip above the pill so scrolled content never peeks through the top gap */}
        <div aria-hidden="true" className="absolute inset-x-0 top-0 h-[calc(30px+env(safe-area-inset-top))] bg-background" />
        <div className="absolute inset-x-5 top-[calc(8px+env(safe-area-inset-top))]">
          <LiveIsland
            coins={wallet.coins}
            live={
              live && {
                minute: live.minute!,
                home: live.home.code,
                away: live.away.code,
                score: live.score!,
                questionLabel: `Q${liveQuestion.index}`,
                question: liveQuestion.text,
                resolvesAt: liveQuestion.resolvesAt,
                href: "/play",
              }
            }
          />
        </div>
      </div>
      {/* XP · level · badges: scrolls with the page, under the island */}
      <div className="mx-auto w-full max-w-[430px] bg-background px-5 pt-1 md:max-w-[560px]">
        <LevelBar level={profile.level} xp={profile.xp} xpNext={profile.xpNext} badges={profile.badges} />
      </div>
      {children}
      <Dock live={!!live} />
    </>
  );
}
