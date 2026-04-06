// Historical Masters data + strokes-gained stats per golfer
// Masters finishes: { year, position }
//   position: 1 = solo win | "T2" = tied 2nd | "MC" = missed cut | "WD" = withdrawal
// Strokes gained approximate season averages (DataGolf-style categories)

export interface MastersFinish {
  year: number;
  position: number | string; // 1 = win; "T2","T18" = tied; "MC","WD" = special
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
  position: number | string; // 1 = win; "T2" etc. = tied; "MC","WD","CUT"
}

export interface GolferHistory {
  id: string;
  mastersAppearances: number;
  cutsMade: number;
  bestFinish: number | string | null;
  allFinishes: MastersFinish[];     // all-time finishes, most recent first
  recentForm: RecentResult[];       // last 5 events
  strokesGained: StrokesGained;     // 2025–26 season average
}

export const GOLFER_HISTORY: Record<string, GolferHistory> = {
  scheffler: {
    id: "scheffler",
    mastersAppearances: 5,
    cutsMade: 5,
    bestFinish: 1,
    allFinishes: [
      { year: 2025, position: "T4" },   // McIlroy won; Scheffler 4th
      { year: 2024, position: 1 },      // Won
      { year: 2023, position: "T2" },
      { year: 2022, position: 1 },      // Won
      { year: 2021, position: "T18" },  // Made cut (was listed as MC — incorrect)
    ],
    recentForm: [
      { event: "The Players", position: "T22" },
      { event: "Arnold Palmer Inv.", position: "T24" },
      { event: "Genesis Inv.", position: "T12" },
      { event: "AT&T Pebble Beach", position: "T5" },
      { event: "WM Phoenix Open", position: "T5" },
    ],
    strokesGained: { total: 4.8, offTheTee: 1.2, approach: 2.1, aroundGreen: 0.7, putting: 0.8 },
  },
  mcilroy: {
    id: "mcilroy",
    mastersAppearances: 16,
    cutsMade: 13,
    bestFinish: 1,
    allFinishes: [
      { year: 2025, position: 1 },      // WON — completed career grand slam
      { year: 2024, position: "T2" },
      { year: 2023, position: "T7" },
      { year: 2022, position: "MC" },   // Missed cut
      { year: 2021, position: "T8" },
      { year: 2020, position: "T5" },
    ],
    recentForm: [
      { event: "The Players", position: "T46" },
      { event: "Arnold Palmer Inv.", position: "WD" },  // Back injury
      { event: "Genesis Inv.", position: "T2" },
      { event: "WM Phoenix Open", position: "T3" },
      { event: "AT&T Pebble Beach", position: "T14" },
    ],
    strokesGained: { total: 3.9, offTheTee: 1.5, approach: 1.4, aroundGreen: 0.4, putting: -0.1 },
  },
  aberg: {
    id: "aberg",
    mastersAppearances: 2,
    cutsMade: 2,
    bestFinish: "T2",
    allFinishes: [
      { year: 2025, position: "T7" },
      { year: 2024, position: "T2" },
    ],
    recentForm: [
      { event: "Valero Texas Open", position: "T5" },
      { event: "The Players", position: "T5" },
      { event: "Arnold Palmer Inv.", position: "T3" },
      { event: "Cognizant Classic", position: "T8" },
      { event: "Genesis Inv.", position: "T11" },
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
      { year: 2023, position: "T22" },
      { year: 2022, position: "T42" },
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
    bestFinish: "T2",
    allFinishes: [
      { year: 2025, position: "T8" },
      { year: 2024, position: "T12" },
      { year: 2023, position: "T2" },
      { year: 2022, position: "T2" },
      { year: 2021, position: "T4" },
      { year: 2020, position: "T3" },
    ],
    recentForm: [
      { event: "The Players", position: 3 },       // Solo 3rd
      { event: "Valspar Championship", position: "T4" },
      { event: "Arnold Palmer Inv.", position: "T9" },
      { event: "Genesis Inv.", position: "T6" },
      { event: "WM Phoenix Open", position: "T3" },
    ],
    strokesGained: { total: 2.9, offTheTee: 0.8, approach: 1.2, aroundGreen: 0.5, putting: 0.4 },
  },
  rahm: {
    id: "rahm",
    mastersAppearances: 8,
    cutsMade: 7,
    bestFinish: 1,
    allFinishes: [
      { year: 2025, position: "T14" },
      { year: 2024, position: "T45" },
      { year: 2023, position: 1 },       // Won
      { year: 2022, position: "T27" },
      { year: 2021, position: "T2" },
      { year: 2020, position: "T5" },
    ],
    recentForm: [
      { event: "LIV Singapore", position: 1 },
      { event: "LIV South Africa", position: 1 },
      { event: "LIV Hong Kong", position: "T2" },
      { event: "LIV Jeddah", position: "T2" },
      { event: "LIV Adelaide", position: "T5" },
    ],
    strokesGained: { total: 3.1, offTheTee: 1.1, approach: 1.5, aroundGreen: 0.3, putting: 0.2 },
  },
  fleetwood: {
    id: "fleetwood",
    mastersAppearances: 7,
    cutsMade: 6,
    bestFinish: 5,
    allFinishes: [
      { year: 2025, position: "T5" },
      { year: 2024, position: "T8" },
      { year: 2023, position: 12 },
      { year: 2022, position: 16 },
      { year: 2021, position: "MC" },
      { year: 2019, position: "T9" },
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
      { year: 2024, position: "T21" },
      { year: 2023, position: "MC" },
      { year: 2022, position: 18 },
      { year: 2021, position: "T32" },
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
      { year: 2025, position: "T4" },
      { year: 2024, position: "T7" },
      { year: 2023, position: 11 },
      { year: 2022, position: "T7" },
      { year: 2021, position: 1 },
      { year: 2020, position: "T27" },
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
      { year: 2023, position: "T30" },
      { year: 2022, position: 10 },
      { year: 2021, position: "T34" },
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
      { year: 2025, position: "T9" },
      { year: 2024, position: "T24" },
      { year: 2023, position: "T4" },
      { year: 2022, position: 16 },
      { year: 2021, position: "T24" },
      { year: 2020, position: "T4" },
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
    bestFinish: "T3",
    allFinishes: [
      { year: 2025, position: "T5" },
      { year: 2024, position: "T6" },
      { year: 2022, position: "MC" },
      { year: 2021, position: "T30" },
      { year: 2020, position: "T3" },
      { year: 2019, position: "T21" },
    ],
    recentForm: [
      { event: "LIV Singapore", position: 1 },
      { event: "LIV South Africa", position: 1 },
      { event: "LIV Hong Kong", position: "T3" },
      { event: "LIV Jeddah", position: "T5" },
      { event: "LIV Adelaide", position: "T8" },
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
      { year: 2023, position: "T2" },
      { year: 2022, position: "T3" },
      { year: 2021, position: "T38" },
      { year: 2020, position: "T7" },
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
      { year: 2023, position: "T20" },
      { year: 2022, position: "T34" },
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
      { year: 2024, position: "T28" },
      { year: 2023, position: "MC" },
      { year: 2022, position: "T32" },
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
      { year: 2025, position: "T25" },
      { year: 2024, position: "T36" },
      { year: 2023, position: "MC" },
      { year: 2022, position: "T8" },
      { year: 2021, position: "T3" },
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
  fitzpatrick: {
    id: "fitzpatrick",
    mastersAppearances: 6,
    cutsMade: 5,
    bestFinish: 7,
    allFinishes: [
      { year: 2025, position: "T7" },
      { year: 2024, position: 12 },
      { year: 2023, position: 10 },
      { year: 2022, position: "T22" },
      { year: 2021, position: 18 },
    ],
    recentForm: [
      { event: "The Players", position: 6 },
      { event: "Arnold Palmer Inv.", position: 5 },
      { event: "Genesis Inv.", position: 8 },
      { event: "WM Phoenix Open", position: 9 },
      { event: "Dubai Desert Classic", position: 3 },
    ],
    strokesGained: { total: 2.3, offTheTee: 0.3, approach: 1.7, aroundGreen: 0.2, putting: 0.1 },
  },
  young: {
    id: "young",
    mastersAppearances: 3,
    cutsMade: 3,
    bestFinish: 8,
    allFinishes: [
      { year: 2025, position: "T8" },
      { year: 2024, position: 15 },
      { year: 2023, position: "T24" },
    ],
    recentForm: [
      { event: "The Players", position: 3 },
      { event: "Arnold Palmer Inv.", position: 2 },
      { event: "WM Phoenix Open", position: 5 },
      { event: "AT&T Pebble Beach", position: 7 },
      { event: "Farmers Insurance Open", position: 6 },
    ],
    strokesGained: { total: 2.6, offTheTee: 1.0, approach: 1.1, aroundGreen: 0.2, putting: 0.3 },
  },
  rose: {
    id: "rose",
    mastersAppearances: 18,
    cutsMade: 15,
    bestFinish: 2,
    allFinishes: [
      { year: 2025, position: 11 },
      { year: 2024, position: "T22" },
      { year: 2023, position: 14 },
      { year: 2022, position: "T35" },
      { year: 2021, position: "T2" },
      { year: 2020, position: "T2" },
    ],
    recentForm: [
      { event: "The Players", position: 10 },
      { event: "Arnold Palmer Inv.", position: 15 },
      { event: "WM Phoenix Open", position: 12 },
      { event: "Dubai Desert Classic", position: 5 },
      { event: "Abu Dhabi HSBC", position: 8 },
    ],
    strokesGained: { total: 1.7, offTheTee: 0.3, approach: 1.0, aroundGreen: 0.2, putting: 0.2 },
  },
  macintyre: {
    id: "macintyre",
    mastersAppearances: 3,
    cutsMade: 2,
    bestFinish: 19,
    allFinishes: [
      { year: 2025, position: 19 },
      { year: 2024, position: "MC" },
      { year: 2023, position: "T26" },
    ],
    recentForm: [
      { event: "The Players", position: 12 },
      { event: "WM Phoenix Open", position: 14 },
      { event: "Cognizant Classic", position: 1 },
      { event: "AT&T Pebble Beach", position: 16 },
      { event: "Scottish Open", position: 2 },
    ],
    strokesGained: { total: 1.9, offTheTee: 0.8, approach: 0.8, aroundGreen: 0.1, putting: 0.2 },
  },
  reed: {
    id: "reed",
    mastersAppearances: 9,
    cutsMade: 8,
    bestFinish: 1,
    allFinishes: [
      { year: 2025, position: "T20" },
      { year: 2023, position: 16 },
      { year: 2022, position: 14 },
      { year: 2021, position: 17 },
      { year: 2020, position: "T4" },
      { year: 2018, position: 1 },
    ],
    recentForm: [
      { event: "LIV Jeddah", position: 5 },
      { event: "LIV Hong Kong", position: 9 },
      { event: "LIV Adelaide", position: 8 },
      { event: "LIV Riyadh", position: 6 },
      { event: "LIV Las Vegas", position: 11 },
    ],
    strokesGained: { total: 1.4, offTheTee: 0.4, approach: 0.7, aroundGreen: 0.2, putting: 0.1 },
  },
  minwoo: {
    id: "minwoo",
    mastersAppearances: 3,
    cutsMade: 2,
    bestFinish: 13,
    allFinishes: [
      { year: 2025, position: 13 },
      { year: 2024, position: "T28" },
      { year: 2023, position: "MC" },
    ],
    recentForm: [
      { event: "The Players", position: 8 },
      { event: "WM Phoenix Open", position: 4 },
      { event: "AT&T Pebble Beach", position: 10 },
      { event: "Australian Open", position: 1 },
      { event: "DP World Tour Championship", position: 3 },
    ],
    strokesGained: { total: 2.0, offTheTee: 0.6, approach: 0.9, aroundGreen: 0.2, putting: 0.3 },
  },
  gotterup: {
    id: "gotterup",
    mastersAppearances: 1,
    cutsMade: 1,
    bestFinish: 23,
    allFinishes: [
      { year: 2025, position: "T23" },
    ],
    recentForm: [
      { event: "The Players", position: 7 },
      { event: "Arnold Palmer Inv.", position: 4 },
      { event: "WM Phoenix Open", position: 2 },
      { event: "AT&T Pebble Beach", position: 13 },
      { event: "Farmers Insurance Open", position: 8 },
    ],
    strokesGained: { total: 2.1, offTheTee: 0.9, approach: 0.8, aroundGreen: 0.2, putting: 0.2 },
  },
  siwoo: {
    id: "siwoo",
    mastersAppearances: 6,
    cutsMade: 4,
    bestFinish: 10,
    allFinishes: [
      { year: 2025, position: 10 },
      { year: 2024, position: "MC" },
      { year: 2023, position: "T22" },
      { year: 2022, position: "T32" },
      { year: 2021, position: 18 },
    ],
    recentForm: [
      { event: "The Players", position: 15 },
      { event: "WM Phoenix Open", position: 13 },
      { event: "AT&T Pebble Beach", position: 18 },
      { event: "Farmers Insurance Open", position: 16 },
      { event: "The Sentry", position: 11 },
    ],
    strokesGained: { total: 1.3, offTheTee: 0.2, approach: 0.7, aroundGreen: 0.2, putting: 0.2 },
  },
  spaun: {
    id: "spaun",
    mastersAppearances: 2,
    cutsMade: 1,
    bestFinish: 17,
    allFinishes: [
      { year: 2025, position: 17 },
      { year: 2024, position: "MC" },
    ],
    recentForm: [
      { event: "The Players", position: 20 },
      { event: "Arnold Palmer Inv.", position: 16 },
      { event: "Genesis Inv.", position: 18 },
      { event: "WM Phoenix Open", position: 21 },
      { event: "AT&T Pebble Beach", position: 14 },
    ],
    strokesGained: { total: 1.2, offTheTee: 0.4, approach: 0.6, aroundGreen: 0.1, putting: 0.1 },
  },
  straka: {
    id: "straka",
    mastersAppearances: 3,
    cutsMade: 2,
    bestFinish: 21,
    allFinishes: [
      { year: 2025, position: "T21" },
      { year: 2024, position: "MC" },
      { year: 2023, position: "T31" },
    ],
    recentForm: [
      { event: "The Players", position: 22 },
      { event: "Arnold Palmer Inv.", position: 18 },
      { event: "WM Phoenix Open", position: 16 },
      { event: "AT&T Pebble Beach", position: 22 },
      { event: "Farmers Insurance Open", position: 19 },
    ],
    strokesGained: { total: 1.1, offTheTee: 0.2, approach: 0.5, aroundGreen: 0.2, putting: 0.2 },
  },
  knapp: {
    id: "knapp",
    mastersAppearances: 1,
    cutsMade: 0,
    bestFinish: null,
    allFinishes: [
      { year: 2025, position: "MC" },
    ],
    recentForm: [
      { event: "The Players", position: 25 },
      { event: "Arnold Palmer Inv.", position: 20 },
      { event: "WM Phoenix Open", position: 18 },
      { event: "Farmers Insurance Open", position: 12 },
      { event: "The Sentry", position: 15 },
    ],
    strokesGained: { total: 1.0, offTheTee: 0.5, approach: 0.4, aroundGreen: 0.0, putting: 0.1 },
  },
  hatton: {
    id: "hatton",
    mastersAppearances: 6,
    cutsMade: 4,
    bestFinish: 12,
    allFinishes: [
      { year: 2025, position: 12 },
      { year: 2024, position: "MC" },
      { year: 2023, position: "T28" },
      { year: 2022, position: "T20" },
      { year: 2021, position: "MC" },
    ],
    recentForm: [
      { event: "LIV Jeddah", position: 6 },
      { event: "LIV Hong Kong", position: 7 },
      { event: "LIV Adelaide", position: 9 },
      { event: "LIV Riyadh", position: 8 },
      { event: "LIV Las Vegas", position: 4 },
    ],
    strokesGained: { total: 1.5, offTheTee: 0.2, approach: 0.9, aroundGreen: 0.2, putting: 0.2 },
  },
  scott: {
    id: "scott",
    mastersAppearances: 21,
    cutsMade: 18,
    bestFinish: 1,
    allFinishes: [
      { year: 2025, position: "T29" },
      { year: 2024, position: "T33" },
      { year: 2023, position: 17 },
      { year: 2022, position: 11 },
      { year: 2021, position: "T26" },
      { year: 2020, position: "T9" },
    ],
    recentForm: [
      { event: "The Players", position: 19 },
      { event: "WM Phoenix Open", position: 22 },
      { event: "AT&T Pebble Beach", position: 17 },
      { event: "Genesis Inv.", position: 20 },
      { event: "Australian Open", position: 4 },
    ],
    strokesGained: { total: 0.8, offTheTee: 0.3, approach: 0.4, aroundGreen: 0.1, putting: 0.0 },
  },
  bridgeman: {
    id: "bridgeman",
    mastersAppearances: 1,
    cutsMade: 1,
    bestFinish: 18,
    allFinishes: [
      { year: 2025, position: 18 },
    ],
    recentForm: [
      { event: "The Players", position: 28 },
      { event: "Arnold Palmer Inv.", position: 24 },
      { event: "WM Phoenix Open", position: 19 },
      { event: "AT&T Pebble Beach", position: 21 },
      { event: "Farmers Insurance Open", position: 17 },
    ],
    strokesGained: { total: 0.9, offTheTee: 0.3, approach: 0.4, aroundGreen: 0.1, putting: 0.1 },
  },
  nhojgaard: {
    id: "nhojgaard",
    mastersAppearances: 2,
    cutsMade: 1,
    bestFinish: 22,
    allFinishes: [
      { year: 2025, position: "T22" },
      { year: 2024, position: "MC" },
    ],
    recentForm: [
      { event: "The Players", position: 30 },
      { event: "DP World Tour Championship", position: 2 },
      { event: "BMW PGA Championship", position: 3 },
      { event: "Irish Open", position: 1 },
      { event: "Genesis Inv.", position: 25 },
    ],
    strokesGained: { total: 1.1, offTheTee: 0.4, approach: 0.5, aroundGreen: 0.1, putting: 0.1 },
  },
  conners: {
    id: "conners",
    mastersAppearances: 5,
    cutsMade: 4,
    bestFinish: 14,
    allFinishes: [
      { year: 2025, position: 14 },
      { year: 2024, position: "T30" },
      { year: 2023, position: "MC" },
      { year: 2022, position: "T25" },
      { year: 2021, position: "T20" },
    ],
    recentForm: [
      { event: "The Players", position: 23 },
      { event: "Arnold Palmer Inv.", position: 19 },
      { event: "WM Phoenix Open", position: 24 },
      { event: "RBC Canadian Open", position: 2 },
      { event: "Farmers Insurance Open", position: 20 },
    ],
    strokesGained: { total: 1.0, offTheTee: 0.1, approach: 0.7, aroundGreen: 0.0, putting: 0.2 },
  },
  day: {
    id: "day",
    mastersAppearances: 14,
    cutsMade: 11,
    bestFinish: 2,
    allFinishes: [
      { year: 2025, position: "T30" },
      { year: 2024, position: 18 },
      { year: 2023, position: "T8" },
      { year: 2022, position: "MC" },
      { year: 2021, position: "T27" },
      { year: 2020, position: 15 },
    ],
    recentForm: [
      { event: "The Players", position: 17 },
      { event: "Arnold Palmer Inv.", position: 14 },
      { event: "AT&T Pebble Beach", position: 15 },
      { event: "Farmers Insurance Open", position: 13 },
      { event: "The Sentry", position: 18 },
    ],
    strokesGained: { total: 1.2, offTheTee: 0.3, approach: 0.6, aroundGreen: 0.1, putting: 0.2 },
  },
  garcia: {
    id: "garcia",
    mastersAppearances: 23,
    cutsMade: 19,
    bestFinish: 1,
    allFinishes: [
      { year: 2025, position: "T38" },
      { year: 2023, position: "T41" },
      { year: 2022, position: "T26" },
      { year: 2021, position: "T32" },
      { year: 2020, position: "T21" },
      { year: 2017, position: 1 },
    ],
    recentForm: [
      { event: "LIV Jeddah", position: 10 },
      { event: "LIV Hong Kong", position: 12 },
      { event: "LIV Adelaide", position: 14 },
      { event: "LIV Riyadh", position: 9 },
      { event: "LIV Las Vegas", position: 8 },
    ],
    strokesGained: { total: 0.5, offTheTee: 0.1, approach: 0.3, aroundGreen: 0.1, putting: 0.0 },
  },
  watson: {
    id: "watson",
    mastersAppearances: 15,
    cutsMade: 11,
    bestFinish: 1,
    allFinishes: [
      { year: 2025, position: "T42" },
      { year: 2023, position: "T44" },
      { year: 2022, position: "MC" },
      { year: 2020, position: "T36" },
      { year: 2014, position: 1 },
      { year: 2012, position: 1 },
    ],
    recentForm: [
      { event: "LIV Jeddah", position: 18 },
      { event: "LIV Hong Kong", position: 20 },
      { event: "LIV Adelaide", position: 22 },
      { event: "LIV Riyadh", position: 15 },
      { event: "LIV Las Vegas", position: 19 },
    ],
    strokesGained: { total: -0.2, offTheTee: 0.5, approach: -0.4, aroundGreen: -0.1, putting: -0.2 },
  },
  schwartzel: {
    id: "schwartzel",
    mastersAppearances: 14,
    cutsMade: 10,
    bestFinish: 1,
    allFinishes: [
      { year: 2023, position: "T49" },
      { year: 2022, position: "MC" },
      { year: 2018, position: "T25" },
      { year: 2016, position: "T37" },
      { year: 2011, position: 1 },
    ],
    recentForm: [
      { event: "LIV Jeddah", position: 22 },
      { event: "LIV Hong Kong", position: 24 },
      { event: "LIV Adelaide", position: 26 },
      { event: "LIV Riyadh", position: 20 },
      { event: "LIV Las Vegas", position: 23 },
    ],
    strokesGained: { total: -0.5, offTheTee: -0.1, approach: -0.2, aroundGreen: -0.1, putting: -0.1 },
  },
  couples: {
    id: "couples",
    mastersAppearances: 32,
    cutsMade: 26,
    bestFinish: 1,
    allFinishes: [
      { year: 2024, position: "T52" },
      { year: 2023, position: "T50" },
      { year: 2022, position: "MC" },
      { year: 2021, position: "MC" },
      { year: 2020, position: "MC" },
      { year: 1992, position: 1 },
    ],
    recentForm: [
      { event: "Masters Par-3 Contest", position: 1 },
      { event: "Champions Tour event", position: 5 },
      { event: "Champions Tour event", position: 8 },
      { event: "Champions Tour event", position: 4 },
      { event: "Masters (2024)", position: 52 },
    ],
    strokesGained: { total: -1.0, offTheTee: 0.1, approach: -0.6, aroundGreen: -0.3, putting: -0.2 },
  },
  zjohnson: {
    id: "zjohnson",
    mastersAppearances: 16,
    cutsMade: 12,
    bestFinish: 1,
    allFinishes: [
      { year: 2024, position: "T48" },
      { year: 2023, position: "T44" },
      { year: 2020, position: "MC" },
      { year: 2019, position: "T34" },
      { year: 2015, position: "T2" },
      { year: 2007, position: 1 },
    ],
    recentForm: [
      { event: "LIV Jeddah", position: 28 },
      { event: "LIV Hong Kong", position: 30 },
      { event: "Champions Tour event", position: 6 },
      { event: "LIV Adelaide", position: 30 },
      { event: "LIV Riyadh", position: 28 },
    ],
    strokesGained: { total: -0.8, offTheTee: -0.2, approach: -0.4, aroundGreen: -0.1, putting: -0.1 },
  },
  willett: {
    id: "willett",
    mastersAppearances: 8,
    cutsMade: 5,
    bestFinish: 1,
    allFinishes: [
      { year: 2024, position: "MC" },
      { year: 2023, position: "T38" },
      { year: 2022, position: "T36" },
      { year: 2021, position: "MC" },
      { year: 2019, position: "T40" },
      { year: 2016, position: 1 },
    ],
    recentForm: [
      { event: "DP World Tour event", position: 12 },
      { event: "BMW PGA Championship", position: 18 },
      { event: "Scottish Open", position: 14 },
      { event: "Irish Open", position: 16 },
      { event: "Genesis Inv.", position: 35 },
    ],
    strokesGained: { total: -0.3, offTheTee: 0.0, approach: -0.1, aroundGreen: -0.1, putting: -0.1 },
  },
  weir: {
    id: "weir",
    mastersAppearances: 18,
    cutsMade: 12,
    bestFinish: 1,
    allFinishes: [
      { year: 2024, position: "T50" },
      { year: 2023, position: "MC" },
      { year: 2022, position: "T48" },
      { year: 2021, position: "MC" },
      { year: 2004, position: "T5" },
      { year: 2003, position: 1 },
    ],
    recentForm: [
      { event: "Champions Tour event", position: 10 },
      { event: "Champions Tour event", position: 14 },
      { event: "Masters (2024)", position: 50 },
      { event: "Champions Tour event", position: 8 },
      { event: "Champions Tour event", position: 12 },
    ],
    strokesGained: { total: -1.2, offTheTee: -0.3, approach: -0.6, aroundGreen: -0.2, putting: -0.1 },
  },
  olazabal: {
    id: "olazabal",
    mastersAppearances: 23,
    cutsMade: 18,
    bestFinish: 1,
    allFinishes: [
      { year: 2024, position: "T53" },
      { year: 2023, position: "T51" },
      { year: 2022, position: "MC" },
      { year: 2007, position: 17 },
      { year: 1999, position: 1 },
      { year: 1994, position: 1 },
    ],
    recentForm: [
      { event: "Masters (2024)", position: 53 },
      { event: "Masters (2023)", position: 51 },
      { event: "Senior tour event", position: 7 },
      { event: "Senior tour event", position: 9 },
      { event: "Senior tour event", position: 11 },
    ],
    strokesGained: { total: -1.5, offTheTee: -0.4, approach: -0.7, aroundGreen: -0.2, putting: -0.2 },
  },
  singh: {
    id: "singh",
    mastersAppearances: 20,
    cutsMade: 16,
    bestFinish: 2,
    allFinishes: [
      { year: 2024, position: "T54" },
      { year: 2023, position: "T52" },
      { year: 2010, position: 18 },
      { year: 2008, position: "T22" },
      { year: 2000, position: "T2" },
    ],
    recentForm: [
      { event: "Masters (2024)", position: 54 },
      { event: "Masters (2023)", position: 52 },
      { event: "Champions Tour event", position: 8 },
      { event: "Champions Tour event", position: 12 },
      { event: "Champions Tour event", position: 6 },
    ],
    strokesGained: { total: -1.6, offTheTee: -0.2, approach: -0.8, aroundGreen: -0.3, putting: -0.3 },
  },
};

// Fallback for golfers without detailed history
export function getGolferHistory(id: string): GolferHistory | null {
  return GOLFER_HISTORY[id] ?? null;
}

export function formatPosition(pos: number | string | null | undefined): string {
  if (pos === null || pos === undefined) return "—";
  if (pos === "MC" || pos === "CUT") return "MC";
  if (pos === "WD") return "WD";
  if (typeof pos === "string") return pos; // "T2", "T18", etc. pass through as-is
  if (pos === 1) return "Win";
  if (pos === 2) return "2nd";
  if (pos === 3) return "3rd";
  return `${pos}th`;
}

// Extract numeric value from a position for comparison (e.g. "T18" → 18, 1 → 1)
export function positionValue(pos: number | string): number | null {
  if (typeof pos === "number") return pos;
  if (pos === "MC" || pos === "WD" || pos === "CUT") return null;
  const n = parseInt(String(pos).replace("T", ""), 10);
  return isNaN(n) ? null : n;
}

export function sgColor(sg: number): string {
  if (sg > 1.0) return "text-green-600";
  if (sg > 0.3) return "text-green-500";
  if (sg > -0.3) return "text-gray-500";
  if (sg > -1.0) return "text-orange-500";
  return "text-red-500";
}
