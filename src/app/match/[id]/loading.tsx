import { AppShell } from "@/components/footon/app-shell";
import { PitchMarkings } from "@/components/footon/pitch-markings";
import { Skeleton } from "@/components/ui/skeleton";

/** Match page while it loads: the scoreboard's shape on the pitch canvas, then the section bar and two rows. */
export default function MatchLoading() {
  return (
    <AppShell dock={false} className="gap-0 pt-0">
      <p className="sr-only" role="status">
        در حال باز کردن بازی
      </p>
      <div className="h-14" />
      <div className="floodlight relative isolate -mx-5 flex items-center justify-between gap-3 overflow-hidden border-b border-line px-8 pt-3 pb-6">
        <PitchMarkings className="-z-10" />
        {[0, 1].map((i) => (
          <div key={i} className="flex flex-col items-center gap-2" style={{ order: i * 2 }}>
            <Skeleton className="size-14 rounded-full" />
            <Skeleton className="h-3 w-16" />
          </div>
        ))}
        <Skeleton className="order-1 h-14 w-24" />
      </div>
      <div className="-mx-5 flex gap-4 border-b border-line px-5 py-3">
        {[56, 44, 48, 52].map((w) => (
          <Skeleton key={w} className="h-4" style={{ width: w }} />
        ))}
      </div>
      <div className="mt-4 flex flex-col gap-3">
        <Skeleton className="h-44 rounded-2xl" />
        <Skeleton className="h-24 rounded-xl" />
      </div>
    </AppShell>
  );
}
