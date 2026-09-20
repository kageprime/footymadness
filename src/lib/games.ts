export type GameFixture = { id: string; home: string; away: string; kickoff: string };

export const gameFixtures: GameFixture[] = [
  { id: "g1", home: "Liverpool", away: "Crystal Palace", kickoff: "SAT 15:00" },
  { id: "g2", home: "Man City", away: "Everton", kickoff: "SAT 17:30" },
  { id: "g3", home: "Brentford", away: "Tottenham", kickoff: "SUN 14:00" },
];

export type BoardRow = { name: string; club: string; pts: number; you?: boolean };

export const predictorBoard: BoardRow[] = [
  { name: "@gallowgate_gal", club: "Newcastle", pts: 41 },
  { name: "@kopite_kel", club: "Liverpool", pts: 38 },
  { name: "@halfspace_hero", club: "Arsenal", pts: 35 },
  { name: "@pep_pls", club: "Man City", pts: 29 },
  { name: "@stretford_static", club: "Man United", pts: 22 },
];

export const shootoutBoard: BoardRow[] = [
  { name: "@pen_merchant", club: "Brentford", pts: 5 },
  { name: "@topbins_tess", club: "Arsenal", pts: 4 },
  { name: "@safehands_sam", club: "Everton", pts: 4 },
];

export const GAME_RULES = [
  "No stakes, no entry fees, no cash prizes — points and badges only.",
  "Leaderboards reset weekly in mock; nothing carries monetary value.",
  "One account, one entry — mock has no auth yet, so play nice.",
] as const;
