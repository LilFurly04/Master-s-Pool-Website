import { Golfer } from "@/lib/types";

// Masters 2026 Field — tiered by world ranking / expected contention level
// Tier 1: Elite favorites  |  Tier 2: Contenders
// Tier 3: Dark horses      |  Tier 4: Longshots / past champions

export const GOLFERS: Golfer[] = [
  // ─── TIER 1 — Elite Favorites ──────────────────────────────────────────────
  { id: "scheffler",    name: "Scottie Scheffler",    country: "USA", worldRank: 1,  tier: 1 },
  { id: "mcilroy",      name: "Rory McIlroy",         country: "NIR", worldRank: 2,  tier: 1 },
  { id: "schauffele",   name: "Xander Schauffele",    country: "USA", worldRank: 3,  tier: 1 },
  { id: "morikawa",     name: "Collin Morikawa",      country: "USA", worldRank: 4,  tier: 1 },
  { id: "aberg",        name: "Ludvig Åberg",         country: "SWE", worldRank: 5,  tier: 1 },
  { id: "hovland",      name: "Viktor Hovland",       country: "NOR", worldRank: 6,  tier: 1 },

  // ─── TIER 2 — Contenders ───────────────────────────────────────────────────
  { id: "fleetwood",    name: "Tommy Fleetwood",      country: "ENG", worldRank: 7,  tier: 2 },
  { id: "rahm",         name: "Jon Rahm",             country: "ESP", worldRank: 8,  tier: 2 },
  { id: "cantlay",      name: "Patrick Cantlay",      country: "USA", worldRank: 9,  tier: 2 },
  { id: "matsuyama",    name: "Hideki Matsuyama",     country: "JPN", worldRank: 10, tier: 2 },
  { id: "koepka",       name: "Brooks Koepka",        country: "USA", worldRank: 11, tier: 2 },
  { id: "thomas",       name: "Justin Thomas",        country: "USA", worldRank: 12, tier: 2 },
  { id: "homa",         name: "Max Homa",             country: "USA", worldRank: 13, tier: 2 },
  { id: "finau",        name: "Tony Finau",           country: "USA", worldRank: 14, tier: 2 },
  { id: "burns",        name: "Sam Burns",            country: "USA", worldRank: 15, tier: 2 },

  // ─── TIER 3 — Dark Horses ──────────────────────────────────────────────────
  { id: "theegala",     name: "Sahith Theegala",      country: "USA", worldRank: 16, tier: 3 },
  { id: "lowry",        name: "Shane Lowry",          country: "IRL", worldRank: 17, tier: 3 },
  { id: "bradley",      name: "Keegan Bradley",       country: "USA", worldRank: 18, tier: 3 },
  { id: "henley",       name: "Russell Henley",       country: "USA", worldRank: 19, tier: 3 },
  { id: "bhatia",       name: "Akshay Bhatia",        country: "USA", worldRank: 20, tier: 3 },
  { id: "day",          name: "Jason Day",            country: "AUS", worldRank: 21, tier: 3 },
  { id: "taylor",       name: "Nick Taylor",          country: "CAN", worldRank: 22, tier: 3 },
  { id: "power",        name: "Seamus Power",         country: "IRL", worldRank: 23, tier: 3 },
  { id: "detry",        name: "Thomas Detry",         country: "BEL", worldRank: 24, tier: 3 },
  { id: "kim",          name: "Tom Kim",              country: "KOR", worldRank: 25, tier: 3 },
  { id: "young",        name: "Cameron Young",        country: "USA", worldRank: 26, tier: 3 },

  // ─── TIER 4 — Longshots & Past Champions ───────────────────────────────────
  { id: "scott",        name: "Adam Scott",           country: "AUS", worldRank: 27, tier: 4 },
  { id: "spieth",       name: "Jordan Spieth",        country: "USA", worldRank: 28, tier: 4 },
  { id: "rose",         name: "Justin Rose",          country: "ENG", worldRank: 29, tier: 4 },
  { id: "garcia",       name: "Sergio Garcia",        country: "ESP", worldRank: 30, tier: 4 },
  { id: "fowler",       name: "Rickie Fowler",        country: "USA", worldRank: 31, tier: 4 },
  { id: "mickelson",    name: "Phil Mickelson",       country: "USA", worldRank: 32, tier: 4 },
  { id: "couples",      name: "Fred Couples",         country: "USA", worldRank: 33, tier: 4 },
  { id: "els",          name: "Ernie Els",            country: "RSA", worldRank: 34, tier: 4 },
  { id: "fitzpatrick",  name: "Matt Fitzpatrick",     country: "ENG", worldRank: 35, tier: 4 },
  { id: "clark",        name: "Wyndham Clark",        country: "USA", worldRank: 36, tier: 4 },
  { id: "harman",       name: "Brian Harman",         country: "USA", worldRank: 37, tier: 4 },
  { id: "noren",        name: "Alex Noren",           country: "SWE", worldRank: 38, tier: 4 },
  { id: "higgo",        name: "Garrick Higgo",        country: "RSA", worldRank: 39, tier: 4 },
  { id: "hojgaard",     name: "Nicolai Højgaard",     country: "DEN", worldRank: 40, tier: 4 },
  { id: "thompson",     name: "Davis Thompson",       country: "USA", worldRank: 41, tier: 4 },
  { id: "mcnealy",      name: "Maverick McNealy",     country: "USA", worldRank: 42, tier: 4 },
];

export const TIER_LABELS: Record<number, string> = {
  1: "Tier 1 — Elite Favorites",
  2: "Tier 2 — Contenders",
  3: "Tier 3 — Dark Horses",
  4: "Tier 4 — Longshots",
};

export const TIER_DESCRIPTIONS: Record<number, string> = {
  1: "World top-6 — the biggest names and shortest odds",
  2: "World 7–15 — proven major contenders",
  3: "World 16–26 — capable of a surprise run",
  4: "Past champions & veterans — history on their side",
};

export function getGolfersByTier(tier: number): Golfer[] {
  return GOLFERS.filter((g) => g.tier === tier);
}

export function getGolferById(id: string): Golfer | undefined {
  return GOLFERS.find((g) => g.id === id);
}

export const FLAG_EMOJI: Record<string, string> = {
  USA: "🇺🇸", NIR: "🇬🇧", ENG: "🇬🇧", SCO: "🇬🇧",
  ESP: "🇪🇸", SWE: "🇸🇪", NOR: "🇳🇴", JPN: "🇯🇵",
  AUS: "🇦🇺", IRL: "🇮🇪", CAN: "🇨🇦", BEL: "🇧🇪",
  KOR: "🇰🇷", RSA: "🇿🇦", DEN: "🇩🇰",
};
