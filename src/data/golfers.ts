import { Golfer } from "@/lib/types";

// ─── Odds conversion helpers ──────────────────────────────────────────────────
// American odds (positive) → raw implied probability
function oddsToImplied(odds: number): number {
  return 100 / (odds + 100);
}

// Build golfer with computed probabilities.
// winPct/top5Pct/top10Pct/top20Pct are approximate — derived from FanDuel-style
// Masters odds and calibrated against historical Augusta finishing distributions.
function g(
  id: string, name: string, country: string, worldRank: number,
  tier: 1 | 2 | 3 | 4, odds: number,
  top5Pct: number, top10Pct: number, top20Pct: number
): Golfer {
  const winPct = parseFloat((oddsToImplied(odds) * 100).toFixed(2));
  return { id, name, country, worldRank, tier, odds, winPct, top5Pct, top10Pct, top20Pct };
}

// Masters 2026 field — tiers set by FanDuel-style outright odds.
// Odds source: FanDuel Sportsbook (approximate, pre-tournament)
//
// TIER 1  — Pick 2  — +100 to +1600  (elite favorites)
// TIER 2  — Pick 2  — +1800 to +4000 (contenders)
// TIER 3  — Pick 1  — +4500 to +9000 (dark horses)
// TIER 4  — Pick 1  — +10000+        (longshots / past champs)
//
//           id              name                     ctry  rank  tier  odds   top5%  top10%  top20%
export const GOLFERS: Golfer[] = [
  // ── TIER 1 ──────────────────────────────────────────────────────────────────
  g("scheffler",   "Scottie Scheffler",    "USA",  1,  1,   350,  58,   75,   88),
  g("mcilroy",     "Rory McIlroy",         "NIR",  2,  1,   550,  48,   64,   80),
  g("aberg",       "Ludvig Åberg",         "SWE",  3,  1,   900,  36,   52,   70),
  g("morikawa",    "Collin Morikawa",      "USA",  4,  1,  1100,  32,   48,   66),
  g("schauffele",  "Xander Schauffele",    "USA",  5,  1,  1200,  30,   46,   64),
  g("rahm",        "Jon Rahm",             "ESP",  6,  1,  1600,  26,   40,   58),

  // ── TIER 2 ──────────────────────────────────────────────────────────────────
  g("fleetwood",   "Tommy Fleetwood",      "ENG",  7,  2,  2000,  22,   34,   52),
  g("hovland",     "Viktor Hovland",       "NOR",  8,  2,  2200,  20,   32,   50),
  g("matsuyama",   "Hideki Matsuyama",     "JPN",  9,  2,  2500,  18,   29,   46),
  g("cantlay",     "Patrick Cantlay",      "USA", 10,  2,  2800,  16,   26,   43),
  g("thomas",      "Justin Thomas",        "USA", 11,  2,  3000,  15,   25,   41),
  g("dechambeau",  "Bryson DeChambeau",    "USA", 12,  2,  3000,  15,   25,   41),
  g("koepka",      "Brooks Koepka",        "USA", 13,  2,  3500,  13,   22,   38),
  g("homa",        "Max Homa",             "USA", 14,  2,  4000,  12,   20,   35),
  g("burns",       "Sam Burns",            "USA", 15,  2,  4000,  12,   20,   35),

  // ── TIER 3 ──────────────────────────────────────────────────────────────────
  g("finau",       "Tony Finau",           "USA", 16,  3,  4500,  10,   18,   32),
  g("theegala",    "Sahith Theegala",      "USA", 17,  3,  5000,   9,   16,   30),
  g("lowry",       "Shane Lowry",          "IRL", 18,  3,  5500,   8,   14,   28),
  g("young",       "Cameron Young",        "USA", 19,  3,  6000,   7,   13,   26),
  g("spieth",      "Jordan Spieth",        "USA", 20,  3,  6500,   7,   12,   25),
  g("bradley",     "Keegan Bradley",       "USA", 21,  3,  7000,   6,   11,   22),
  g("henley",      "Russell Henley",       "USA", 22,  3,  7000,   6,   11,   22),
  g("bhatia",      "Akshay Bhatia",        "USA", 23,  3,  7500,   6,   10,   21),
  g("kim",         "Tom Kim",              "KOR", 24,  3,  8000,   5,   10,   20),
  g("taylor",      "Nick Taylor",          "CAN", 25,  3,  9000,   5,    9,   18),

  // ── TIER 4 ──────────────────────────────────────────────────────────────────
  g("day",         "Jason Day",            "AUS", 26,  4, 10000,   4,    8,   16),
  g("rose",        "Justin Rose",          "ENG", 27,  4, 12000,   4,    7,   14),
  g("scott",       "Adam Scott",           "AUS", 28,  4, 12000,   4,    7,   14),
  g("fitzpatrick", "Matt Fitzpatrick",     "ENG", 29,  4, 12000,   4,    7,   14),
  g("clark",       "Wyndham Clark",        "USA", 30,  4, 15000,   3,    6,   12),
  g("fowler",      "Rickie Fowler",        "USA", 31,  4, 18000,   3,    5,   11),
  g("taylor_r",    "Ryan Fox",             "NZL", 32,  4, 20000,   2,    4,    9),
  g("power",       "Seamus Power",         "IRL", 33,  4, 20000,   2,    4,    9),
  g("detry",       "Thomas Detry",         "BEL", 34,  4, 25000,   2,    4,    8),
  g("hojgaard",    "Nicolai Højgaard",     "DEN", 35,  4, 25000,   2,    4,    8),
  g("mickelson",   "Phil Mickelson",       "USA", 36,  4, 30000,   1,    3,    7),
  g("garcia",      "Sergio Garcia",        "ESP", 37,  4, 35000,   1,    3,    6),
  g("couples",     "Fred Couples",         "USA", 38,  4, 50000,   1,    2,    4),
];

// ─── Lookup helpers ───────────────────────────────────────────────────────────
export function getGolfersByTier(tier: number): Golfer[] {
  return GOLFERS.filter((g) => g.tier === tier);
}

export function getGolferById(id: string): Golfer | undefined {
  return GOLFERS.find((g) => g.id === id);
}

export function formatOdds(odds: number): string {
  return `+${odds.toLocaleString()}`;
}

// ─── Tier metadata ────────────────────────────────────────────────────────────
export const TIER_LABELS: Record<number, string> = {
  1: "Tier 1 — Elite Favorites",
  2: "Tier 2 — Contenders",
  3: "Tier 3 — Dark Horses",
  4: "Tier 4 — Longshots",
};

export const TIER_DESCRIPTIONS: Record<number, string> = {
  1: "Pick 2 · +350 to +1600 · World top-6 favorites",
  2: "Pick 2 · +2000 to +4000 · Proven major contenders",
  3: "Pick 1 · +4500 to +9000 · Capable of an Augusta surprise",
  4: "Pick 1 · +10000+ · Past champions & big-price longshots",
};

export const TIER_PICK_COUNT: Record<number, number> = { 1: 2, 2: 2, 3: 1, 4: 1 };

export const FLAG_EMOJI: Record<string, string> = {
  USA: "🇺🇸", NIR: "🇬🇧", ENG: "🇬🇧", SCO: "🇬🇧",
  ESP: "🇪🇸", SWE: "🇸🇪", NOR: "🇳🇴", JPN: "🇯🇵",
  AUS: "🇦🇺", IRL: "🇮🇪", CAN: "🇨🇦", BEL: "🇧🇪",
  KOR: "🇰🇷", RSA: "🇿🇦", DEN: "🇩🇰", NZL: "🇳🇿",
};
