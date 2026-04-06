import { Golfer } from "@/lib/types";

// Convert positive American odds → raw implied win probability (0–100)
function winPct(odds: number) { return parseFloat((100 / (odds + 100) * 100).toFixed(2)); }

// Approximate top-5 / top-10 / top-20 % from odds + Augusta finishing patterns
// Scale factors tuned so that Scheffler (+500) ≈ 55% top-5, longshots taper off correctly
function top5(odds: number)  { return Math.min(80, parseFloat((winPct(odds) * 3.0).toFixed(1))); }
function top10(odds: number) { return Math.min(90, parseFloat((winPct(odds) * 5.5).toFixed(1))); }
function top20(odds: number) { return Math.min(97, parseFloat((winPct(odds) * 10).toFixed(1))); }

function g(
  id: string, name: string, country: string, owgr: number | null,
  tier: 1 | 2 | 3 | 4, odds: number, espnId?: number
): Golfer {
  return {
    id, name, country, owgr,
    tier, odds,
    winPct: winPct(odds),
    top5Pct:  top5(odds),
    top10Pct: top10(odds),
    top20Pct: top20(odds),
    espnId,
  };
}

// ESPN headshot URL — returns null if no espnId
export function espnHeadshotUrl(espnId: number | undefined): string | null {
  if (!espnId) return null;
  return `https://a.espncdn.com/i/headshots/golf/players/full/${espnId}.png`;
}

// ─── Masters 2026 Field — FanDuel Win-Only Odds (as of Apr 6, 2026) ───────────
//
// Tier 1 (pick 2) — +500 to +1600   — elite favorites
// Tier 2 (pick 2) — +2000 to +4500  — proven contenders
// Tier 3 (pick 1) — +5000 to +10000 — dark horses
// Tier 4 (pick 1) — +12500+         — longshots & past champions
//
// OWGR = Official World Golf Ranking (approximate, April 2026)

export const GOLFERS: Golfer[] = [
  // ── TIER 1 ──────────────────────────────────────────────────────────────────
  //                                                               espnId ↓
  g("scheffler",    "Scottie Scheffler",      "USA",  1,  1,    500,  9478),
  g("rahm",         "Jon Rahm",               "ESP",  6,  1,    950,  9261),
  g("mcilroy",      "Rory McIlroy",           "NIR",  2,  1,   1200,  3470),
  g("dechambeau",   "Bryson DeChambeau",      "USA", 10,  1,   1200,  5767),
  g("aberg",        "Ludvig Åberg",           "SWE",  5,  1,   1500, 11074),
  g("schauffele",   "Xander Schauffele",      "USA",  3,  1,   1600, 10604),

  // ── TIER 2 ──────────────────────────────────────────────────────────────────
  g("fitzpatrick",  "Matt Fitzpatrick",       "ENG", 11,  2,   2000, 10064),
  g("young",        "Cameron Young",          "USA",  9,  2,   2200, 10580),
  g("fleetwood",    "Tommy Fleetwood",        "ENG",  7,  2,   2200,  5225),
  g("morikawa",     "Collin Morikawa",        "USA",  4,  2,   3000, 10354),
  g("rose",         "Justin Rose",            "ENG", 17,  2,   3000,  2164),
  g("macintyre",    "Robert MacIntyre",       "SCO", 18,  2,   3300, 10936),
  g("matsuyama",    "Hideki Matsuyama",       "JPN", 15,  2,   3500,  4848),
  g("reed",         "Patrick Reed",           "USA", 40,  2,   3500,  6589),
  g("minwoo",       "Min Woo Lee",            "AUS", 13,  2,   3500, 11189),
  g("spieth",       "Jordan Spieth",          "USA", 32,  2,   4000,  5467),
  g("koepka",       "Brooks Koepka",          "USA", 23,  2,   4000,  7278),
  g("gotterup",     "Chris Gotterup",         "USA", 28,  2,   4500, 11327),

  // ── TIER 3 ──────────────────────────────────────────────────────────────────
  g("hovland",      "Viktor Hovland",         "NOR",  8,  3,   5000, 11057),
  g("lowry",        "Shane Lowry",            "IRL", 19,  3,   5500,  3700),
  g("siwoo",        "Si Woo Kim",             "KOR", 30,  3,   5500,  9987),
  g("henley",       "Russell Henley",         "USA", 25,  3,   5500,  3523),
  g("bhatia",       "Akshay Bhatia",          "USA", 21,  3,   6000, 11167),
  g("spaun",        "J.J. Spaun",             "USA", 35,  3,   6500,  7877),
  g("cantlay",      "Patrick Cantlay",        "USA", 12,  3,   6500, 10223),
  g("thomas",       "Justin Thomas",          "USA", 14,  3,   6500,  9780),
  g("straka",       "Sepp Straka",            "AUT", 50,  3,   7000, 11124),
  g("knapp",        "Jake Knapp",             "USA", 55,  3,   7000, 11416),
  g("scott",        "Adam Scott",             "AUS", 45,  3,   7000,  1222),
  g("hatton",       "Tyrrell Hatton",         "ENG", 42,  3,   7000,  5765),
  g("bridgeman",    "Jacob Bridgeman",        "USA", 60,  3,   7000, 11548),
  g("nhojgaard",    "Nicolai Højgaard",       "DEN", 48,  3,   7000, 11173),
  g("conners",      "Corey Conners",          "CAN", 62,  3,   8000,  9988),
  g("penge",        "Marco Penge",            "ENG", 70,  3,   8000),
  g("day",          "Jason Day",              "AUS", 65,  3,   8000,  3236),
  g("finau",        "Tony Finau",             "USA", 20,  3,   8000,  6798),
  g("niemann",      "Joaquin Niemann",        "CHI", 22,  3,   8000, 10588),
  g("tomkim",       "Tom Kim",                "KOR", 27,  3,   9000, 11378),
  g("theegala",     "Sahith Theegala",        "USA", 36,  3,  10000, 11138),
  g("dunlap",       "Nick Dunlap",            "USA", 38,  3,  10000, 11558),

  // ── TIER 4 ──────────────────────────────────────────────────────────────────
  g("burns",        "Sam Burns",              "USA", 80,  4,  10000, 10356),
  g("im",           "Sungjae Im",             "KOR", 85,  4,  10000, 10792),
  g("english",      "Harris English",         "USA", 88,  4,  10000,  3742),
  g("csmith",       "Cameron Smith",          "AUS", 90,  4,  10000,  9593),
  g("mcnealy",      "Maverick McNealy",       "USA", 95,  4,  10000, 10547),
  g("woodland",     "Gary Woodland",          "USA",100,  4,  10000,  3213),
  g("kitayama",     "Kurt Kitayama",          "USA",105,  4,  12500, 11143),
  g("homa",         "Max Homa",               "USA",110,  4,  12500,  7382),
  g("harman",       "Brian Harman",           "USA",112,  4,  12500,  3372),
  g("berger",       "Daniel Berger",          "USA",115,  4,  15000,  6442),
  g("rhojgaard",    "Rasmus Højgaard",        "DEN",118,  4,  15000, 11174),
  g("griffin",      "Ben Griffin",            "USA",120,  4,  15000, 11336),
  g("rai",          "Aaron Rai",              "ENG",122,  4,  15000, 10816),
  g("fox",          "Ryan Fox",               "NZL",125,  4,  17500, 10395),
  g("jarvis",       "Casey Jarvis",           "RSA",130,  4,  17500),
  g("noren",        "Alex Noren",             "SWE",135,  4,  17500,  4231),
  g("hall",         "Harry Hall",             "ENG",140,  4,  17500, 11015),
  g("gerard",       "Ryan Gerard",            "USA",145,  4,  17500),
  g("taylor",       "Nick Taylor",            "CAN",148,  4,  22500,  6149),
  g("bradley",      "Keegan Bradley",         "USA",150,  4,  22500,  3258),
  g("djohnson",     "Dustin Johnson",         "USA",155,  4,  22500,  3284),
  g("clark",        "Wyndham Clark",          "USA",160,  4,  22500, 11175),
  g("garcia",       "Sergio Garcia",          "ESP",165,  4,  25000,   890),
  g("greyserman",   "Max Greyserman",         "USA", 43,  4,  20000, 11413),
  g("mckibbin",     "Tom McKibbin",           "NIR", 52,  4,  20000, 11474),
  g("eckroat",      "Austin Eckroat",         "USA", 58,  4,  25000, 11159),
  g("potgieter",    "Aldrich Potgieter",      "RSA", 62,  4,  25000),
  g("pavon",        "Matthieu Pavon",         "FRA", 68,  4,  30000, 11249),
  g("driley",       "Davis Riley",            "USA", 72,  4,  30000, 11087),
  g("dmccarthy",    "Denny McCarthy",         "USA", 75,  4,  40000,  9956),
  g("novak",        "Andrew Novak",           "USA", 82,  4,  50000, 11348),
  g("ecole",        "Eric Cole",              "USA", 88,  4,  50000, 11304),
  g("power",        "Seamus Power",           "IRL", 95,  4,  50000,  9816),
  g("cortiz",       "Carlos Ortiz",           "MEX",105,  4,  75000, 10157),
  g("reitan",       "Kristoffer Reitan",      "NOR",110,  4,  75000),
  g("tlawrence",    "Thriston Lawrence",      "RSA",118,  4, 100000),
  g("mccarty",      "Matt McCarty",           "USA",122,  4, 100000, 11590),
  g("watson",       "Bubba Watson",           "USA",200,  4,  50000,  1974),
  g("schwartzel",   "Charl Schwartzel",       "RSA",210,  4,  75000,  3285),
  g("zjohnson",     "Zach Johnson",           "USA",215,  4,  75000,  1430),
  g("couples",      "Fred Couples",           "USA",220,  4, 100000,   249),
  g("willett",      "Danny Willett",          "ENG",225,  4, 100000,  5851),
  g("weir",         "Mike Weir",              "CAN",230,  4, 100000,   545),
  g("olazabal",     "Jose Maria Olazabal",    "ESP",235,  4, 100000,   280),
  g("singh",        "Vijay Singh",            "FIJ",240,  4, 100000,   407),
  // ── Amateurs ────────────────────────────────────────────────────────────────
  g("mhowell",      "Mason Howell",           "USA",null, 4, 500000),
  g("jherrington",  "Jackson Herrington",     "USA",null, 4, 500000),
  g("bholtz",       "Brandon Holtz",          "USA",null, 4, 500000),
  g("efang",        "Ethan Fang",             "USA",null, 4, 500000),
  g("flaopakdee",   "Fifa Laopakdee",         "THA",null, 4, 500000),
  g("mpulcini",     "Mateo Pulcini",          "ARG",null, 4, 500000),
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
  1: "Pick 2 · +500 to +1600 · The pre-tournament favorites",
  2: "Pick 2 · +2000 to +4500 · Proven major-level contenders",
  3: "Pick 1 · +5000 to +8000 · Capable of a surprise Augusta run",
  4: "Pick 1 · +10000+ · Longshots, past champions & legends",
};
export const TIER_PICK_COUNT: Record<number, number> = { 1: 2, 2: 2, 3: 1, 4: 1 };

export const FLAG_EMOJI: Record<string, string> = {
  USA: "🇺🇸", NIR: "🇬🇧", ENG: "🇬🇧", SCO: "🇬🇧",
  ESP: "🇪🇸", SWE: "🇸🇪", NOR: "🇳🇴", JPN: "🇯🇵",
  AUS: "🇦🇺", IRL: "🇮🇪", CAN: "🇨🇦", BEL: "🇧🇪",
  KOR: "🇰🇷", RSA: "🇿🇦", DEN: "🇩🇰", NZL: "🇳🇿",
  AUT: "🇦🇹", FIJ: "🇫🇯", CHI: "🇨🇱", MEX: "🇲🇽",
  THA: "🇹🇭", ARG: "🇦🇷", FRA: "🇫🇷",
};
