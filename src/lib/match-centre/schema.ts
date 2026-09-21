// Tracking types for the match centre (extracted from the Touchline
// prototype's shared schema; the drizzle users table did not come over).
// Tracking coordinates are normalized to a 105 × 68 metre pitch.

export type Team = "home" | "away";

export interface TrackingPoint {
  time: number;
  x: number;
  y: number;
  team: Team;
  player: number;
}

export interface MatchEvent {
  time: number;
  type: "goal" | "shot" | "card";
  team: Team;
  player: string;
  detail: string;
}

export interface DemoMatch {
  id: string;
  home: string;
  away: string;
  homeCode: string;
  awayCode: string;
  venue: string;
  homePlayers: string[];
  awayPlayers: string[];
  events: MatchEvent[];
  seed: number;
}
