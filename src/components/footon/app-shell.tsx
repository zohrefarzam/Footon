import { cn } from "@/lib/utils";

/**
 * The phone column (430px), centred on any larger screen. Footon is a
 * mobile app: there is no tablet or desktop layout, every screen is this column.
 * `dock={false}` for focus mode (live match, flows with their own CTA). The dock
 * itself is rendered once by `app/(tabs)/layout.tsx`; `dock` here only reserves room for it.
 */
export function AppShell({
  children,
  dock = true,
  className,
}: {
  children: React.ReactNode;
  dock?: boolean;
  className?: string;
}) {
  return (
    <div className={cn("bg-background", !dock && "min-h-dvh")}>
      <main
        className={cn(
          "relative mx-auto flex w-full max-w-[430px] flex-col gap-[18px] px-5 pt-3",
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
