import { Dock } from "@/components/footon/dock";
import { LevelProgressBar } from "@/components/footon/gamification/level-progress-bar";
import { matches, wallet } from "@/lib/mock-data";

/**
 * Shared shell for the dock tabs (Home, Challenges, Predictions, Live, Profile, plus their sub-pages).
 * The top bar (level • XP • streak • badges • wallet) and the dock live here, not in each page, so they
 * stay pinned and keep their state while you switch tabs.
 */
export default function TabsLayout({ children }: LayoutProps<"/">) {
  const live = matches.some((m) => m.status === "live");

  return (
    <>
      <div className="sticky top-0 z-30 mx-auto w-full max-w-[430px] bg-background px-5 pt-[calc(8px+env(safe-area-inset-top))] pb-1">
        <LevelProgressBar coins={wallet.coins} />
      </div>
      {children}
      <Dock live={live} />
    </>
  );
}
