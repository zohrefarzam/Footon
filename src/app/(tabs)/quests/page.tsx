import { AppShell } from "@/components/footon/app-shell";
import { BackButton } from "@/components/footon/back-button";
import { QuestList } from "@/components/footon/gamification/quests";

/**
 * Every open quest: today's, this week's (locked below its level) and the
 * long ones for the season and your league. Reached from Home's quests tile.
 * No lime CTA: quests move by playing.
 */
export default function QuestsPage() {
  return (
    <AppShell className="pt-3.5">
      <header className="flex items-center gap-3">
        <BackButton href="/" />
        <h1 className="text-[26px] font-bold tracking-[-0.03em]">Quests</h1>
      </header>
      <QuestList kinds={["daily"]} title="Today" />
      <QuestList kinds={["weekly"]} title="This week" feature="weeklyQuests" />
      <QuestList kinds={["seasonal", "group"]} title="Season and league" />
    </AppShell>
  );
}
