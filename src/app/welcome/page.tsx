import type { Metadata } from "next";

import { onboarding } from "@/lib/mock-data";
import { OnboardingFlow } from "./onboarding-flow";

export const metadata: Metadata = {
  title: "Welcome to Footon",
};

/** First run: brand splash, then three steps (try a question, pick clubs, claim coins). */
export default function WelcomePage() {
  return (
    <main className="min-h-dvh bg-background">
      <OnboardingFlow data={onboarding} />
    </main>
  );
}
