import { PredictionsBoard } from "@/components/footon/predictions-board";
import { PredictionsLive } from "@/components/footon/predictions-live";
import { matches, predictionSlips } from "@/lib/mock-data";

/** Predictions tab: your coupon. Real predictions when a backend is set, the mock coupon otherwise. */
export default function PredictionsPage() {
  if (process.env.NEXT_PUBLIC_GAMIFICATION_API) return <PredictionsLive />;
  const entries = matches
    .filter((m) => predictionSlips[m.id]?.length && m.status !== "live")
    .map((m) => ({ match: m, slip: predictionSlips[m.id], settled: m.status === "finished" }));
  return <PredictionsBoard entries={entries} />;
}
