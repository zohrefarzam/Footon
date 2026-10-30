import { cn } from "@/lib/utils";
import { Dock } from "./dock";

/**
 * Mobile-first column (max 430px), centred on larger screens.
 * `dock={false}` for focus mode (live match, flows with their own CTA).
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
    <div className="min-h-dvh bg-background">
      <main
        className={cn(
          "relative mx-auto flex min-h-dvh w-full max-w-[430px] flex-col gap-[18px] px-5 pt-3",
          dock ? "pb-[calc(110px+env(safe-area-inset-bottom))]" : "pb-6",
          className,
        )}
      >
        {children}
      </main>
      {dock && <Dock />}
    </div>
  );
}
