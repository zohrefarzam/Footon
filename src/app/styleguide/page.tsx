import { CoinBadge } from "@/components/footon/coin";
import { FantasyUnlock } from "@/components/footon/fantasy-unlock";
import { FormBars } from "@/components/footon/form-bars";
import { LiveDot, LiveMinute } from "@/components/footon/live";
import { MatchFilter } from "@/components/footon/match-filter";
import { ProgressRing } from "@/components/footon/progress-ring";
import { TeamCrest } from "@/components/footon/team-crest";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardRow } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";

const swatches = [
  ["background", "#09090B", "App ground"],
  ["surface", "#111114", "Cards, lists"],
  ["surface-2", "#18181B", "Raised, dock"],
  ["surface-3", "#232328", "Secondary buttons"],
  ["line", "#1E1E23", "Hairlines"],
  ["line-strong", "#2E2E35", "Raised borders"],
  ["foreground", "#FAFAFA", "Text"],
  ["muted-foreground", "#A1A1AA", "Secondary text"],
  ["primary", "#C8F542", "Main CTA, wins, you"],
  ["live", "#FFB547", "Live, timers, coins"],
  ["loss", "#F87171", "Losses, wrong"],
  ["pitch", "#0F1A12", "Team pitch"],
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

      <Section title="Buttons">
        <div className="flex flex-wrap items-center gap-3">
          <Button size="lg">Claim 10,000 coins</Button>
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
    </main>
  );
}
