import { challenges, matches, type Challenge, type Match } from "@/lib/mock-data";

export type ChallengeWithMatch = Challenge & { match: Match };

/** Every challenge with its match attached (dropping any whose match is unknown). */
export const challengesWithMatch = (list: Challenge[] = challenges): ChallengeWithMatch[] =>
  list.flatMap((c) => {
    const match = matches.find((m) => m.id === c.matchId);
    return match ? [{ ...c, match }] : [];
  });

/** Your league's live match plays at /play; every other challenge has its own page. */
export const challengeHref = (c: ChallengeWithMatch) => (c.status === "joined" && c.match.status === "live" ? "/play" : `/challenges/${c.id}`);
