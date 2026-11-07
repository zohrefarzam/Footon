import { AchievementBadge } from "@/components/footon/achievement-badge";
import { CoinBadge } from "@/components/footon/coin";
import { DivisionCard } from "@/components/footon/division-card";
import { EmptyState } from "@/components/footon/empty-state";
import { LeagueBadge } from "@/components/footon/league-badge";
import { MatchHero } from "@/components/footon/match-hero";
import { PitchMarkings } from "@/components/footon/pitch-markings";
import { PromoBanner } from "@/components/footon/promo-banner";
import { SectionHeading } from "@/components/footon/section-heading";
import { Standings } from "@/components/footon/standings";
import { FantasyUnlock } from "@/components/footon/fantasy-unlock";
import { FormBars } from "@/components/footon/form-bars";
import { LiveDot, LiveMinute } from "@/components/footon/live";
import { MatchFilter } from "@/components/footon/match-filter";
import { ChallengesIcon, HomeIcon, LiveIcon, ProfileIcon } from "@/components/footon/nav-icons";
import { ProgressRing } from "@/components/footon/progress-ring";
import { TeamCrest } from "@/components/footon/team-crest";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardRow } from "@/components/ui/card";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { achievements, division, league, matches, promos } from "@/lib/mock-data";

const swatches = [
  ["background", "#06140F", "Stadium ground"],
  ["surface", "#0B1E17", "Cards, lists"],
  ["surface-2", "#11281F", "Raised, dock"],
  ["surface-3", "#183327", "Secondary buttons"],
  ["line", "#15302A", "Hairlines"],
  ["line-strong", "#224236", "Raised borders"],
  ["foreground", "#F3F8F4", "Text"],
  ["muted-foreground", "#9DB1A6", "Secondary text"],
  ["primary", "#43B883", "Main CTA, wins, you"],
  ["live", "#FFA83E", "Live, timers, coins"],
  ["gold", "#F5C451", "Trophies, 1st, achievements"],
  ["silver", "#C9D4CE", "2nd, Silver division"],
  ["bronze", "#D9925E", "3rd"],
  ["loss", "#F87171", "Losses, wrong"],
  ["pitch", "#0D2C1D", "Line-ups, fantasy"],
] as const;

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-[13px] font-medium tracking-[0.06em] text-muted-foreground uppercase">{title}</h2>
      {children}
    </section>
  );
}

export default function StyleguidePage() {
  return (
    <main className="mx-auto flex max-w-3xl flex-col gap-12 px-5 py-12">
      <header>
        <p className="font-display text-lg font-bold text-primary">FOOTON</p>
        <h1 className="mt-1 text-4xl font-bold tracking-[-0.035em]">Design system</h1>
        <p className="mt-2 max-w-prose text-muted-foreground">
          Tokens and components used across the app. Rules live in <code className="font-mono text-foreground">AGENTS.md</code>.
        </p>
      </header>

      <Section title="Colour">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {swatches.map(([name, hex, use]) => (
            <div key={name} className="overflow-hidden rounded-lg border border-line">
              <div className="h-16 border-b border-line" style={{ background: hex }} />
              <div className="bg-surface p-3">
                <p className="font-mono text-xs">{name}</p>
                <p className="font-mono text-[11px] text-muted-foreground">{hex}</p>
                <p className="mt-1 text-xs text-muted-foreground">{use}</p>
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Type">
        <div className="flex flex-col gap-3">
          <p className="font-display text-[88px] leading-none font-bold">+450</p>
          <p className="font-display text-2xl font-bold">LIV 1–1 MCI · 67&apos; — Barlow Condensed, scores and coins</p>
          <p className="text-[32px] leading-tight font-bold tracking-[-0.035em]">Call the next moment. — Geist 700</p>
          <p className="text-[15px] font-semibold">Body strong 15/600 — Geist</p>
          <p className="text-[13px] text-muted-foreground">Secondary 13/400 — muted-foreground</p>
          <p className="font-mono text-xs">t.me/footon_bot?start=sun9k — Geist Mono</p>
        </div>
      </Section>

      <Section title="Partner banners">
        <div className="grid max-w-md gap-3">
          {promos.map((p, i) => (
            <PromoBanner key={p.id} promo={p} slot={i + 1} />
          ))}
        </div>
      </Section>

      <Section title="Football language">
        <div className="max-w-md">
          <SectionHeading title="Big matches" action={{ label: "All matches", href: "/live" }} />
        </div>
        <div className="max-w-md">
          <MatchHero
            match={matches.find((m) => m.id === "ars-che")!}
            eyebrow="Matchday · Tuesday 3 November"
            cta={{ label: "Make your predictions", href: "/match/ars-che" }}
          />
        </div>
        <div className="flex items-center gap-3">
          <LeagueBadge name="Sunday Rivals" size="lg" />
          <LeagueBadge name="Derby night" />
          <LeagueBadge name="Seaside" size="sm" />
          <LeagueBadge name="Silver" tone="silver" />
          <TeamCrest code="LIV" colors={["#C8102E", "#F6EB61"]} size="lg" />
        </div>
        <Card className="max-w-md overflow-hidden pb-1">
          <Standings rows={division.rows} caption="Division table" zones={{ promote: division.promote, relegate: division.relegate, size: division.size }} />
        </Card>
        <Card className="max-w-md overflow-hidden">
          <Standings rows={league.standings} caption="Compact league table" compact />
        </Card>
        <DivisionCard division={division} className="max-w-md" />
        <ul className="grid max-w-md grid-cols-3 gap-2">
          {achievements.slice(0, 6).map((a) => (
            <li key={a.id} className="flex">
              <AchievementBadge achievement={a} className="flex-1" />
            </li>
          ))}
        </ul>
        <div className="floodlight relative isolate h-28 max-w-md overflow-hidden rounded-2xl border border-line-strong bg-surface">
          <PitchMarkings />
        </div>
        <div className="max-w-md">
          <EmptyState title="Nothing on yet" body="Every fixture is on the Live tab." action={{ label: "Browse matches", href: "/live" }} />
        </div>
        <div className="flex max-w-md items-center gap-3">
          <Skeleton className="size-10 rounded-full" />
          <Skeleton className="h-4 flex-1" />
          <Skeleton className="h-6 w-12" />
        </div>
      </Section>

      <Section title="Buttons">
        <div className="flex flex-wrap items-center gap-3">
          <Button size="lg">Claim 1,000 coins</Button>
          <Button>Yes</Button>
          <Button variant="secondary">No</Button>
          <Button variant="outline">Not this time</Button>
          <Button variant="soft" size="sm">I&apos;m in</Button>
          <Button variant="ghost">Skip</Button>
          <Button variant="destructive">Leave league</Button>
        </div>
      </Section>

      <Section title="Status">
        <div className="flex flex-wrap items-center gap-3">
          <LiveMinute minute={67} />
          <Badge variant="live">
            <LiveDot /> LIVE
          </Badge>
          <Badge variant="soft">2x ready</Badge>
          <Badge variant="default">Q4 open</Badge>
          <Badge variant="neutral">21:00</Badge>
          <Badge variant="loss">Wrong</Badge>
          <CoinBadge value={2450} />
        </div>
        <div className="flex items-center gap-6">
          <FormBars results={["W", "W", "L", "W", "V", "L"]} />
          <ProgressRing value={3} max={5} />
          <TeamCrest code="LIV" />
          <TeamCrest code="MCI" size="lg" />
        </div>
        <div className="grid max-w-sm gap-3">
          <FantasyUnlock done={3} total={5} />
          <FantasyUnlock done={5} total={5} />
        </div>
      </Section>

      <Section title="Controls">
        <div className="max-w-sm">
          <MatchFilter />
        </div>
        <div className="flex max-w-sm flex-col gap-2">
          <Label htmlFor="sg-name">League name</Label>
          <Input id="sg-name" defaultValue="Sunday Rivals" />
        </div>
        <Card className="max-w-sm overflow-hidden">
          <CardRow>
            <label htmlFor="sg-sw1" className="flex-1 text-[15px] font-semibold">System live questions</label>
            <Switch id="sg-sw1" defaultChecked />
          </CardRow>
          <CardRow>
            <label htmlFor="sg-sw2" className="flex-1 text-[15px] font-semibold">Pre-match picks</label>
            <Switch id="sg-sw2" />
          </CardRow>
        </Card>
        <Progress value={70} className="max-w-sm" />
      </Section>

      <Section title="Dock icons">
        <div className="grid max-w-sm grid-cols-4 gap-3 rounded-[24px] border border-line-strong bg-surface-2 p-4 text-center text-[11px]">
          {[HomeIcon, ChallengesIcon, LiveIcon, ProfileIcon].map((Icon, i) => (
            <div key={i} className="flex flex-col items-center gap-3">
              <Icon className="text-nav-muted" />
              <Icon active className="text-foreground" />
            </div>
          ))}
        </div>
        <p className="text-xs text-muted-foreground">Top: inactive (outline). Bottom: active (filled).</p>
      </Section>

      <Section title="Tabs">
        <Tabs defaultValue="predictions" className="max-w-sm">
          <TabsList aria-label="Match sections" className="mx-0 px-0">
            {["Predictions", "Timeline", "Stats", "Lineups", "Chat"].map((t) => (
              <TabsTrigger key={t} value={t.toLowerCase()}>
                {t}
              </TabsTrigger>
            ))}
          </TabsList>
          {["predictions", "timeline", "stats", "lineups", "chat"].map((t) => (
            <TabsContent key={t} value={t} className="pt-4 text-sm text-muted-foreground">
              The {t} section.
            </TabsContent>
          ))}
        </Tabs>
      </Section>

      <Section title="Sheets">
        <div className="flex flex-wrap gap-3">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="secondary">Open sheet</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>3 new invites</DialogTitle>
                <DialogDescription>Sara, Omid and Lena want you in tonight.</DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <DialogClose asChild>
                  <Button size="lg">See invites</Button>
                </DialogClose>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline">Open dialog</Button>
            </DialogTrigger>
            <DialogContent variant="center">
              <DialogHeader>
                <DialogTitle>Leave Derby night?</DialogTitle>
                <DialogDescription>Your 300 coins stay in the pot.</DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="destructive">Leave</Button>
                </DialogClose>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </Section>
    </main>
  );
}
