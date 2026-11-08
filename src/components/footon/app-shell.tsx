import { cn } from "@/lib/utils";

/**
 * Mobile-first column (430px; 560px from tablet up), centred on larger screens.
 * `wide` opens it to a 1080px desktop grid for screens that lay out in two
 * columns there (Home, Profile, Leaderboard); they own their `lg:` grid.
 * `dock={false}` for focus mode (live match, flows with their own CTA). The dock
 * itself is rendered once by `app/(tabs)/layout.tsx`; `dock` here only reserves room for it.
 */
export function AppShell({
  children,
  dock = true,
  wide = false,
  className,
}: {
  children: React.ReactNode;
  dock?: boolean;
  wide?: boolean;
  className?: string;
}) {
  return (
    <div className={cn("bg-background", !dock && "min-h-dvh")}>
      <main
        className={cn(
          "relative mx-auto flex w-full max-w-[430px] flex-col gap-[18px] px-5 pt-3 md:max-w-[560px]",
          wide && "lg:max-w-[1080px]",
          // dock tabs sit under the sticky island from the (tabs) layout
          dock ? "pb-[calc(110px+env(safe-area-inset-bottom))]" : "min-h-dvh pb-6",
          className,
        )}
      >
        {children}
      </main>
    </div>
  );
}
