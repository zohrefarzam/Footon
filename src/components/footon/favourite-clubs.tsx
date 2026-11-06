"use client";

import { useDeferredValue, useState } from "react";
import { Check, Plus, Search, X } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import type { Team } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import { TeamCrest } from "./team-crest";

/**
 * Your clubs on Profile: picked in onboarding, changed here any time. Each club
 * is a chip with ✕ to drop it; "Add club" opens a sheet with the onboarding
 * crest grid (soft-lime when picked), searchable by name or code.
 */
export function FavouriteClubs({ clubs, initial }: { clubs: Team[]; initial: string[] }) {
  const [picked, setPicked] = useState<string[]>(initial);
  const reduce = useReducedMotion();
  const toggle = (code: string) => setPicked((p) => (p.includes(code) ? p.filter((c) => c !== code) : [...p, code]));
  const mine = picked.flatMap((code) => clubs.filter((c) => c.code === code));
  const [query, setQuery] = useState("");
  const q = useDeferredValue(query).trim().toLowerCase();
  const results = q ? clubs.filter((c) => c.name.toLowerCase().includes(q) || c.code.toLowerCase().includes(q)) : clubs;

  return (
    <section aria-labelledby="clubs-title" className="flex flex-col gap-2.5">
      <h2 id="clubs-title" className="text-[13px] font-medium text-muted-foreground">
        Your clubs
      </h2>
      <Card className="gap-3 p-3">
        <ul className="flex flex-wrap gap-2" aria-live="polite">
          <AnimatePresence initial={false} mode="popLayout">
            {mine.map((c) => (
              <motion.li
                key={c.code}
                layout={!reduce}
                initial={reduce ? false : { opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.85 }}
                transition={{ type: "spring", stiffness: 420, damping: 30 }}
                className="flex h-11 items-center gap-2 rounded-full border border-line-strong bg-surface-2 ps-1.5 pe-1"
              >
                <TeamCrest code={c.code} colors={c.colors} size="xs" />
                <span className="text-sm font-semibold">{c.name}</span>
                <Button variant="ghost" size="icon-sm" className="size-8 rounded-full" aria-label={`Remove ${c.name}`} onClick={() => toggle(c.code)}>
                  <X />
                </Button>
              </motion.li>
            ))}
          </AnimatePresence>
          <li>
            <Dialog onOpenChange={(o) => !o && setQuery("")}>
              <DialogTrigger asChild>
                <Button variant="outline" className="h-11 rounded-full px-4">
                  <Plus strokeWidth={2.4} aria-hidden="true" />
                  Add club
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogTitle>Your clubs</DialogTitle>
                <DialogDescription>Follow as many as you like. Their matches show up first.</DialogDescription>
                <div className="relative mt-2">
                  <label htmlFor="club-search" className="sr-only">
                    Search clubs
                  </label>
                  <Search className="pointer-events-none absolute start-3.5 top-1/2 size-[18px] -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
                  <Input
                    id="club-search"
                    type="search"
                    inputMode="search"
                    autoComplete="off"
                    placeholder="Search clubs"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="ps-10 pe-11 [&::-webkit-search-cancel-button]:hidden"
                  />
                  {query && (
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      className="absolute end-1.5 top-1/2 size-9 -translate-y-1/2 rounded-full"
                      aria-label="Clear search"
                      onClick={() => setQuery("")}
                    >
                      <X />
                    </Button>
                  )}
                </div>
                <p className="sr-only" aria-live="polite">
                  {q ? `${results.length} ${results.length === 1 ? "club" : "clubs"} found` : ""}
                </p>
                {results.length === 0 && (
                  <p className="bg-dots rounded-xl border border-dashed border-line-strong px-6 py-8 text-center text-sm text-muted-foreground">
                    No club matches &ldquo;{query.trim()}&rdquo;.
                  </p>
                )}
                <ul className="-mx-1 grid max-h-[min(52vh,420px)] grid-cols-4 gap-2 overflow-y-auto px-1 pt-2 pb-1 max-[359px]:grid-cols-3">
                  {results.map((club) => {
                    const on = picked.includes(club.code);
                    return (
                      <li key={club.code}>
                        <button
                          type="button"
                          aria-pressed={on}
                          onClick={() => toggle(club.code)}
                          className={cn(
                            "relative flex w-full flex-col items-center gap-2 rounded-xl border px-1 pt-3.5 pb-2.5 outline-none transition-[transform,background-color,border-color] duration-200 ease-spring active:scale-95 focus-visible:ring-[3px] focus-visible:ring-ring/60",
                            on ? "border-primary-line bg-primary-soft" : "border-line bg-surface hover:bg-[#141417]",
                          )}
                        >
                          <TeamCrest code={club.code} colors={club.colors} size="lg" />
                          <span className={cn("w-full truncate text-center text-xs font-medium", on ? "text-primary" : "text-muted-foreground")}>{club.name}</span>
                          {on && (
                            <span
                              className="absolute -end-1.5 -top-1.5 flex size-5 animate-in zoom-in-50 items-center justify-center rounded-full bg-primary text-primary-foreground ring-4 ring-background duration-200"
                              aria-hidden="true"
                            >
                              <Check className="size-3" strokeWidth={3.2} />
                            </span>
                          )}
                        </button>
                      </li>
                    );
                  })}
                </ul>
                <DialogClose asChild>
                  <Button size="lg" className="mt-3 w-full">
                    Done
                  </Button>
                </DialogClose>
              </DialogContent>
            </Dialog>
          </li>
        </ul>
        {mine.length === 0 && <p className="px-1 text-xs text-muted-foreground">No clubs yet. Add one to see their matches first.</p>}
      </Card>
    </section>
  );
}
