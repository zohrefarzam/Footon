/**
 * Mock data that mirrors the design canvas. Replace with real API calls.
 * Keep shapes stable: components import these types.
 */
import type { Outcome } from "@/components/footon/form-bars";
import type { LiveQuestion } from "@/components/footon/question-card";

export type Team = { code: string; name: string };

export type Match = {
  id: string;
  home: Team;
  away: Team;
  status: "live" | "upcoming" | "finished";
  minute?: number;
  score?: [number, number];
  kickoff?: string;
  caption: string;
};

export const wallet = { coins: 2450 };

export const recentForm: Outcome[] = ["W", "W", "L", "W", "V", "L"];

export const matches: Match[] = [
  {
    id: "liv-mci",
    home: { code: "LIV", name: "Liverpool" },
    away: { code: "MCI", name: "Man City" },
    status: "live",
    minute: 67,
    score: [1, 1],
    caption: "Sunday Rivals · limit 500",
  },
  {
    id: "ars-che",
    home: { code: "ARS", name: "Arsenal" },
    away: { code: "CHE", name: "Chelsea" },
    status: "upcoming",
    kickoff: "21:00",
    caption: "Tonight",
  },
];

export const invite = { from: "Sara", initial: "S", stakeLimit: 300, matchId: "ars-che" };

export const fantasyProgress = { done: 3, total: 5 };

export const league = {
  name: "Sunday Rivals",
  code: "sun9k",
  link: "t.me/footon_bot?start=sun9k",
  standings: [
    { name: "You", initial: "Y", points: 840, you: true, delta: 1 },
    { name: "Sara", initial: "S", points: 790 },
    { name: "Omid", initial: "O", points: 770 },
  ],
};

export const liveQuestion: LiveQuestion = {
  index: 4,
  total: 10,
  text: "Next corner before 75'?",
  hint: "Either team · answers lock when the timer ends",
  seconds: 38,
  yesShare: 58,
  resolvesAt: "75'",
};

export const chat = {
  messages: [{ from: "Sara", initial: "S", text: "You will miss that one." }],
  friendQuestion: { from: "Omid", initial: "O", text: "Yellow card before 80'?", closes: "80'" },
  reactions: ["VAR!", "Offside", "What a save"],
};
