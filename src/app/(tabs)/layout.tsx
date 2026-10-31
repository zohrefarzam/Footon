import { LiveIsland } from "@/components/footon/live-island";
import { liveQuestion, matches, wallet } from "@/lib/mock-data";

/**
 * Shared shell for the dock tabs (Home, Team, Me). The island lives here, not
 * in each page, so it stays pinned and keeps its state while you switch tabs.
 */
export default function TabsLayout({ children }: LayoutProps<"/">) {
  const live = matches.find((m) => m.status === "live");

  return (
    <>
      {/* reserves the collapsed height; the island floats, so expanding it overlays the page instead of pushing it */}
      <div className="pointer-events-none sticky top-0 z-30 mx-auto h-[calc(54px+env(safe-area-inset-top))] w-full max-w-[430px]">
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
      {children}
    </>
  );
}
