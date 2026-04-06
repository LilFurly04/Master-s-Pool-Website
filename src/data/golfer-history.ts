// Historical Masters data + strokes-gained stats per golfer
// Masters finishes: { year, position } — "MC" = missed cut, "WD" = withdrawal
// Strokes gained approximate season averages (DataGolf-style categories)

export interface MastersFinish {
  year: number;
  position: number | "MC" | "WD";
}

export interface StrokesGained {
  total: number;
  offTheTee: number;
  approach: number;
  aroundGreen: number;
  putting: number;
}

export interface RecentResult {
  event: string;
  position: number | "MC" | "WD" | "CUT";
}

export interface GolferHistory {
  id: string;
  mastersAppearances: number;
  cutsMade: number;
  bestFinish: number | null;
  allFinishes: MastersFinish[];     // all-time finishes, most recent first
  recentForm: RecentResult[];       // last 5–6 events
  strokesGained: StrokesGained;     // 2025–26 season average
}

export const GOLFER_HISTORY: Record<string, GolferHistory> = {
  scheffler: {
    id: "scheffler",
    mastersAppearances: 5,
    cutsMade: 5,
    bestFinish: 1,
    allFinishes: [
      { year: 2025, position: 1 },
      { year: 2024, position: 1 },
      { year: 2023, position: 2 },
      { year: 2022, position: 1 },
      { year: 2021, position: "MC" },
    ],
    recentForm: [
      { event: "The Players", position: 2 },
      { event: "Arnold Palmer Inv.", position: 1 },
      { event: "Genesis Inv.", position: 1 },
      { event: "AT&T Pebble Beach", position: 4 },
      { event: "WM Phoenix Open", position: 3 },
    ],
    strokesGained: { total: 4.8, offTheTee: 1.2, approach: 2.1, aroundGreen: 0.7, putting: 0.8 },
  },
  mcilroy: {
    id: "mcilroy",
    mastersAppearances: 15,
    cutsMade: 12,
    bestFinish: 2,
    allFinishes: [
      { year: 2025, position: 2 },
      { year: 2024, position: 2 },
      { year: 2023, position: 7 },
      { year: 2022, position: "MC" },
      { year: 2021, position: 8 },
      { year: 2020, position: 5 },
    ],
    recentForm: [
      { event: "The Players", position: 1 },
      { event: "Genesis Inv.", position: 4 },
      { event: "Dubai Desert Classic", position: 1 },
      { event: "AT&T Pebble Beach", position: 12 },
      { event: "Abu Dhabi HSBC", position: 2 },
    ],
    strokesGained: { total: 3.9, offTheTee: 1.5, approach: 1.4, aroundGreen: 0.4, putting: 0.6 },
  },
  aberg: {
    id: "aberg",
    mastersAppearances: 2,
    cutsMade: 2,
    bestFinish: 2,
    allFinishes: [
      { year: 2025, position: 5 },
      { year: 2024, position: 2 },
    ],
    recentForm: [
      { event: "The Players", position: 8 },
      { event: "Arnold Palmer Inv.", position: 6 },
      { event: "Cognizant Classic", position: 3 },
      { event: "Genesis Inv.", position: 11 },
      { event: "WM Phoenix Open", position: 7 },
    ],
    strokesGained: { total: 2.8, offTheTee: 0.9, approach: 1.3, aroundGreen: 0.2, putting: 0.4 },
  },
  morikawa: {
    id: "morikawa",
    mastersAppearances: 5,
    cutsMade: 5,
    bestFinish: 18,
    allFinishes: [
      { year: 2025, position: 18 },
      { year: 2024, position: 14 },
      { year: 2023, position: 22 },
      { year: 2022, position: 42 },
      { year: 2021, position: 18 },
    ],
    recentForm: [
      { event: "The Players", position: 5 },
      { event: "Arnold Palmer Inv.", position: 3 },
      { event: "Genesis Inv.", position: 7 },
      { event: "AT&T Pebble Beach", position: 2 },
      { event: "Farmers Insurance Open", position: 4 },
    ],
    strokesGained: { total: 2.4, offTheTee: 0.3, approach: 1.8, aroundGreen: 0.1, putting: 0.2 },
  },
  schauffele: {
    id: "schauffele",
    mastersAppearances: 7,
    cutsMade: 6,
    bestFinish: 2,
    allFinishes: [
      { year: 2025, position: 6 },
      { year: 2024, position: 12 },
      { year: 2023, position: 2 },
      { year: 2022, position: 2 },
      { year: 2021, position: 4 },
      { year: 2020, position: 3 },
    ],
    recentForm: [
      { event: "The Players", position: 3 },
      { event: "WM Phoenix Open", position: 1 },
      { event: "AT&T Pebble Beach", position: 8 },
      { event: "Farmers Insurance Open", position: 2 },
      { event: "The Sentry", position: 5 },
    ],
    strokesGained: { total: 2.9, offTheTee: 0.8, approach: 1.2, aroundGreen: 0.5, putting: 0.4 },
  },
  rahm: {
    id: "rahm",
    mastersAppearances: 8,
    cutsMade: 7,
    bestFinish: 1,
    allFinishes: [
      { year: 2025, position: 10 },
      { year: 2024, position: 3 },
      { year: 2023, position: 1 },
      { year: 2022, position: 27 },
      { year: 2021, position: 2 },
      { year: 2020, position: 5 },
    ],
    recentForm: [
      { event: "LIV Jeddah", position: 1 },
      { event: "LIV Hong Kong", position: 3 },
      { event: "LIV Adelaide", position: 2 },
      { event: "LIV Las Vegas", position: 5 },
      { event: "LIV Riyadh", position: 4 },
    ],
    strokesGained: { total: 3.1, offTheTee: 1.1, approach: 1.5, aroundGreen: 0.3, putting: 0.2 },
  },
  fleetwood: {
    id: "fleetwood",
    mastersAppearances: 7,
    cutsMade: 6,
    bestFinish: 5,
    allFinishes: [
      { year: 2025, position: 5 },
      { year: 2024, position: 8 },
      { year: 2023, position: 12 },
      { year: 2022, position: 16 },
      { year: 2021, position: "MC" },
      { year: 2019, position: 9 },
    ],
    recentForm: [
      { event: "The Players", position: 7 },
      { event: "Arnold Palmer Inv.", position: 11 },
      { event: "Genesis Inv.", position: 5 },
      { event: "Dubai Desert Classic", position: 4 },
      { event: "Abu Dhabi HSBC", position: 3 },
    ],
    strokesGained: { total: 2.2, offTheTee: 0.4, approach: 1.1, aroundGreen: 0.3, putting: 0.4 },
  },
  hovland: {
    id: "hovland",
    mastersAppearances: 5,
    cutsMade: 4,
    bestFinish: 14,
    allFinishes: [
      { year: 2025, position: 14 },
      { year: 2024, position: 21 },
      { year: 2023, position: "MC" },
      { year: 2022, position: 18 },
      { year: 2021, position: 32 },
    ],
    recentForm: [
      { event: "The Players", position: 4 },
      { event: "WM Phoenix Open", position: 6 },
      { event: "AT&T Pebble Beach", position: 3 },
      { event: "Dubai Desert Classic", position: 8 },
      { event: "Genesis Inv.", position: 9 },
    ],
    strokesGained: { total: 2.5, offTheTee: 0.9, approach: 1.0, aroundGreen: 0.1, putting: 0.5 },
  },
  matsuyama: {
    id: "matsuyama",
    mastersAppearances: 12,
    cutsMade: 10,
    bestFinish: 1,
    allFinishes: [
      { year: 2025, position: 4 },
      { year: 2024, position: 7 },
      { year: 2023, position: 11 },
      { year: 2022, position: 7 },
      { year: 2021, position: 1 },
      { year: 2020, position: 27 },
    ],
    recentForm: [
      { event: "The Players", position: 9 },
      { event: "Genesis Inv.", position: 14 },
      { event: "Sony Open", position: 2 },
      { event: "The Sentry", position: 8 },
      { event: "ZOZO Championship", position: 1 },
    ],
    strokesGained: { total: 2.0, offTheTee: 0.6, approach: 1.1, aroundGreen: 0.1, putting: 0.2 },
  },
  cantlay: {
    id: "cantlay",
    mastersAppearances: 7,
    cutsMade: 6,
    bestFinish: 13,
    allFinishes: [
      { year: 2025, position: 13 },
      { year: 2024, position: 19 },
      { year: 2023, position: 30 },
      { year: 2022, position: 10 },
      { year: 2021, position: 34 },
      { year: 2020, position: 18 },
    ],
    recentForm: [
      { event: "The Players", position: 11 },
      { event: "Arnold Palmer Inv.", position: 8 },
      { event: "AT&T Pebble Beach", position: 5 },
      { event: "WM Phoenix Open", position: 10 },
      { event: "Farmers Insurance Open", position: 7 },
    ],
    strokesGained: { total: 1.8, offTheTee: 0.3, approach: 0.9, aroundGreen: 0.2, putting: 0.4 },
  },
  thomas: {
    id: "thomas",
    mastersAppearances: 9,
    cutsMade: 8,
    bestFinish: 4,
    allFinishes: [
      { year: 2025, position: 9 },
      { year: 2024, position: 24 },
      { year: 2023, position: 4 },
      { year: 2022, position: 16 },
      { year: 2021, position: 24 },
      { year: 2020, position: 4 },
    ],
    recentForm: [
      { event: "The Players", position: 6 },
      { event: "Arnold Palmer Inv.", position: 9 },
      { event: "Genesis Inv.", position: 12 },
      { event: "WM Phoenix Open", position: 4 },
      { event: "AT&T Pebble Beach", position: 6 },
    ],
    strokesGained: { total: 2.1, offTheTee: 0.7, approach: 1.0, aroundGreen: 0.1, putting: 0.3 },
  },
  dechambeau: {
    id: "dechambeau",
    mastersAppearances: 7,
    cutsMade: 6,
    bestFinish: 3,
    allFinishes: [
      { year: 2025, position: 8 },
      { year: 2024, position: 3 },
      { year: 2022, position: "MC" },
      { year: 2021, position: 30 },
      { year: 2020, position: 3 },
      { year: 2019, position: 21 },
    ],
    recentForm: [
      { event: "LIV Jeddah", position: 4 },
      { event: "LIV Hong Kong", position: 2 },
      { event: "US Open 2025", position: 1 },
      { event: "LIV Adelaide", position: 6 },
      { event: "LIV Riyadh", position: 3 },
    ],
    strokesGained: { total: 2.7, offTheTee: 2.0, approach: 0.8, aroundGreen: -0.2, putting: 0.1 },
  },
  koepka: {
    id: "koepka",
    mastersAppearances: 9,
    cutsMade: 8,
    bestFinish: 2,
    allFinishes: [
      { year: 2025, position: 15 },
      { year: 2024, position: 11 },
      { year: 2023, position: 2 },
      { year: 2022, position: 3 },
      { year: 2021, position: 38 },
      { year: 2020, position: 7 },
    ],
    recentForm: [
      { event: "LIV Jeddah", position: 7 },
      { event: "LIV Hong Kong", position: 8 },
      { event: "LIV Adelaide", position: 10 },
      { event: "LIV Riyadh", position: 5 },
      { event: "LIV Las Vegas", position: 3 },
    ],
    strokesGained: { total: 1.9, offTheTee: 1.2, approach: 0.7, aroundGreen: -0.1, putting: 0.1 },
  },
  homa: {
    id: "homa",
    mastersAppearances: 4,
    cutsMade: 3,
    bestFinish: 10,
    allFinishes: [
      { year: 2025, position: 10 },
      { year: 2024, position: "MC" },
      { year: 2023, position: 20 },
      { year: 2022, position: 34 },
    ],
    recentForm: [
      { event: "The Players", position: 14 },
      { event: "Arnold Palmer Inv.", position: 7 },
      { event: "Genesis Inv.", position: 4 },
      { event: "AT&T Pebble Beach", position: 9 },
      { event: "WM Phoenix Open", position: 11 },
    ],
    strokesGained: { total: 1.6, offTheTee: 0.5, approach: 0.8, aroundGreen: 0.1, putting: 0.2 },
  },
  burns: {
    id: "burns",
    mastersAppearances: 4,
    cutsMade: 3,
    bestFinish: 16,
    allFinishes: [
      { year: 2025, position: 16 },
      { year: 2024, position: 28 },
      { year: 2023, position: "MC" },
      { year: 2022, position: 32 },
    ],
    recentForm: [
      { event: "The Players", position: 16 },
      { event: "Arnold Palmer Inv.", position: 13 },
      { event: "WM Phoenix Open", position: 8 },
      { event: "AT&T Pebble Beach", position: 11 },
      { event: "Farmers Insurance Open", position: 9 },
    ],
    strokesGained: { total: 1.5, offTheTee: 0.4, approach: 0.7, aroundGreen: 0.2, putting: 0.2 },
  },
  spieth: {
    id: "spieth",
    mastersAppearances: 12,
    cutsMade: 11,
    bestFinish: 1,
    allFinishes: [
      { year: 2025, position: 25 },
      { year: 2024, position: 36 },
      { year: 2023, position: "MC" },
      { year: 2022, position: 8 },
      { year: 2021, position: 3 },
      { year: 2020, position: 13 },
    ],
    recentForm: [
      { event: "The Players", position: 18 },
      { event: "Arnold Palmer Inv.", position: 22 },
      { event: "WM Phoenix Open", position: 15 },
      { event: "AT&T Pebble Beach", position: 20 },
      { event: "Farmers Insurance Open", position: 14 },
    ],
    strokesGained: { total: 0.9, offTheTee: 0.1, approach: 0.6, aroundGreen: 0.3, putting: -0.1 },
  },
};

// Fallback for golfers without detailed history
export function getGolferHistory(id: string): GolferHistory | null {
  return GOLFER_HISTORY[id] ?? null;
}

export function formatPosition(pos: number | "MC" | "WD" | "CUT"): string {
  if (pos === "MC" || pos === "CUT") return "MC";
  if (pos === "WD") return "WD";
  if (pos === 1) return "1st";
  if (pos === 2) return "2nd";
  if (pos === 3) return "3rd";
  return `${pos}th`;
}

export function sgColor(sg: number): string {
  if (sg > 1.0) return "text-green-600";
  if (sg > 0.3) return "text-green-500";
  if (sg > -0.3) return "text-gray-500";
  if (sg > -1.0) return "text-orange-500";
  return "text-red-500";
}
