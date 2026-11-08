"use client";

import { useEffect, useRef, useState } from "react";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

export type MatchSection = { value: string; label: string; badge?: React.ReactNode; content: React.ReactNode };

/**
 * Match page frame, after FotMob's match flow:
 *   top bar (back · title · live minute) — sticky
 *   big scoreboard — scrolls away; once it's gone the top bar swaps the title for
 *     the compact score, so the score is never off screen
 *   section tabs — sticky under the top bar; one tap between Predict, Chat,
 *     Facts, Stats, Lineups, Table
 * Sections are server-rendered and passed in; only the frame is client.
 */
export function MatchCentre({
  back,
  title,
  live,
  compactScore,
  scoreboard,
  sections,
  defaultSection,
}: {
  back: React.ReactNode;
  title: string;
  live?: React.ReactNode;
  compactScore: React.ReactNode;
  scoreboard: React.ReactNode;
  sections: MatchSection[];
  defaultSection?: string;
}) {
  const boardRef = useRef<HTMLDivElement>(null);
  const tabsTopRef = useRef<HTMLDivElement>(null);
  const [compact, setCompact] = useState(false);
  const [tab, setTab] = useState(defaultSection ?? sections[0]?.value);

  useEffect(() => {
    const el = boardRef.current;
    if (!el) return;
    // 56px = the sticky top bar; the board counts as gone once it's under it
    const io = new IntersectionObserver(([e]) => setCompact(!e.isIntersecting), { rootMargin: "-56px 0px 0px 0px" });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // deep links: `/challenges/ch-1#league` opens on that section (read after mount, so SSR stays on the default)
  useEffect(() => {
    const open = () => {
      const v = window.location.hash.slice(1);
      if (sections.some((s) => s.value === v)) setTab(v);
    };
    const raf = requestAnimationFrame(open);
    window.addEventListener("hashchange", open);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("hashchange", open);
    };
  }, [sections]);

  const changeTab = (v: string) => {
    setTab(v);
    // keep the tab bar where it is: if the board has scrolled away, jump to the top of the section
    if (compact) tabsTopRef.current?.scrollIntoView({ block: "start" });
  };

  return (
    <>
      <header className="sticky top-0 z-30 -mx-5 flex h-14 items-center gap-2.5 bg-background px-5 pt-[env(safe-area-inset-top)]">
        {back}
        <div className="grid min-w-0 flex-1 items-center">
          <span
            className={cn(
              "col-start-1 row-start-1 truncate text-[13px] text-muted-foreground transition-opacity duration-200",
              compact && "opacity-0",
            )}
            aria-hidden={compact}
          >
            {title}
          </span>
          <div
            className={cn(
              "col-start-1 row-start-1 transition-[opacity,transform] duration-300 ease-out-soft",
              compact ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-1 opacity-0",
            )}
            aria-hidden={!compact}
          >
            {compactScore}
          </div>
        </div>
        {live}
      </header>

      <div ref={boardRef}>{scoreboard}</div>
      <div ref={tabsTopRef} aria-hidden="true" className="scroll-mt-14" />

      <Tabs value={tab} onValueChange={changeTab} className="flex flex-col gap-4">
        <TabsList aria-label="Match sections" className="sticky top-14 z-20 bg-background">
          {sections.map((s) => (
            <TabsTrigger key={s.value} value={s.value} className="gap-1.5">
              {s.label}
              {s.badge}
            </TabsTrigger>
          ))}
        </TabsList>
        {sections.map((s) => (
          <TabsContent key={s.value} value={s.value} className="flex flex-col gap-4">
            {s.content}
          </TabsContent>
        ))}
      </Tabs>
    </>
  );
}
