"use client";

import { motion } from "motion/react";

import { StadiumArt } from "@/components/footon/gamification/item-art";
import { Winky } from "@/components/footon/winky";

const ARENA = { primary: "#1F3D30", secondary: "#9DB1A6", accent: "#FFA83E", pattern: "arena" };

/** The cup, in Winky's sticker style: flat gold, ink outline, one flat shade. */
function TrophyArt({ className }: { className?: string }) {
  const ink = "#04170E";
  return (
    <svg viewBox="0 0 60 84" aria-hidden="true" className={className}>
      <path d="M12,14 H4 Q2,34 18,38 M48,14 H56 Q58,34 42,38" fill="none" stroke={ink} strokeWidth="8" strokeLinecap="round" />
      <path d="M12,14 H4 Q2,34 18,38 M48,14 H56 Q58,34 42,38" fill="none" stroke="#F5C451" strokeWidth="3.5" strokeLinecap="round" />
      <path d="M10,6 H50 V28 Q50,48 30,50 Q10,48 10,28 Z" fill="#F5C451" stroke={ink} strokeWidth="3" strokeLinejoin="round" />
      <path d="M36,6 H50 V28 Q50,48 30,50 Q38,40 36,28 Z" fill="#000" opacity=".14" />
      <path d="M26,50 H34 V62 H26 Z" fill="#F5C451" stroke={ink} strokeWidth="3" strokeLinejoin="round" />
      <path d="M14,62 H46 V76 H14 Z" fill="#43B883" stroke={ink} strokeWidth="3" strokeLinejoin="round" />
      <path d="M17,18 Q17,32 24,38" fill="none" stroke="#FFF6D6" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

/** Auth hero: a night match with the cup and Winky on the pitch. */
export function LoginHero({ sent }: { sent: boolean }) {
  return (
    <div className="relative isolate h-56 shrink-0 overflow-hidden rounded-3xl border border-line bg-surface">
      <StadiumArt look={ARENA} className="absolute inset-0 -z-10 size-full" />

      {/* dim the crowd so the two characters read first */}
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-background/55" />

      <TrophyArt className="absolute bottom-4 end-6 w-12" />
      <motion.div
        key={String(sent)}
        initial={{ y: -50, rotate: sent ? 12 : -12, scale: 0.8 }}
        animate={{ y: 0, rotate: 0, scale: 1 }}
        transition={{ type: "spring", stiffness: 380, damping: 14 }}
        className="absolute inset-x-0 bottom-2 mx-auto w-28"
      >
        <Winky wink={sent} />
      </motion.div>
    </div>
  );
}
