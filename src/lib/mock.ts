export type Referee = {
  id: string;
  name: string;
  matches: number;
  penaltiesPerMatch: number;
  leagueAvgPenalties: number;
  homeFoulPct: number;
  awayFoulPct: number;
  cardsPerMatch: number;
  homeWinPct: number;
  biasFlag: string;
};

export const referees: Referee[] = [
  { id: "ref-1", name: "M. Oliver", matches: 28, penaltiesPerMatch: 0.32, leagueAvgPenalties: 0.24, homeFoulPct: 42, awayFoulPct: 58, cardsPerMatch: 3.8, homeWinPct: 48, biasFlag: "Slight home lean on fouls" },
  { id: "ref-2", name: "A. Taylor", matches: 26, penaltiesPerMatch: 0.19, leagueAvgPenalties: 0.24, homeFoulPct: 49, awayFoulPct: 51, cardsPerMatch: 4.5, homeWinPct: 44, biasFlag: "High card rate" },
  { id: "ref-3", name: "P. Tierney", matches: 24, penaltiesPerMatch: 0.29, leagueAvgPenalties: 0.24, homeFoulPct: 38, awayFoulPct: 62, cardsPerMatch: 3.2, homeWinPct: 51, biasFlag: "Away fouls elevated" },
  { id: "ref-4", name: "C. Kavanagh", matches: 22, penaltiesPerMatch: 0.22, leagueAvgPenalties: 0.24, homeFoulPct: 51, awayFoulPct: 49, cardsPerMatch: 3.0, homeWinPct: 43, biasFlag: "Neutral profile" },
];

export type Breakdown = {
  id: string;
  author: string;
  match: string;
  title: string;
  originality: number;
  insight: number;
  clarity: number;
  earnings: number;
  status: "top" | "review" | "new";
};

export const breakdowns: Breakdown[] = [
  { id: "b1", author: "@halfspace_hero", match: "ARS vs MCI", title: "How Arsenal's left overload forced City's 4-4-2 block", originality: 88, insight: 92, clarity: 84, earnings: 142.5, status: "top" },
  { id: "b2", author: "@lowblockliz", match: "NEW vs LIV", title: "Newcastle mid-press triggers in minute 30-60", originality: 76, insight: 81, clarity: 79, earnings: 64.2, status: "review" },
  { id: "b3", author: "@setpiece_sam", match: "BRE vs TOT", title: "Brentford near-post corners vs man-marking", originality: 91, insight: 87, clarity: 90, earnings: 188.0, status: "top" },
  { id: "b4", author: "@pubtactico", match: "CHE vs MUN", title: "Why Chelsea's rest defence collapsed after 70'", originality: 62, insight: 68, clarity: 71, earnings: 12.0, status: "new" },
];

export type SentimentTeam = {
  team: string;
  mentions: number;
  positivity: number;
  pessimism: number;
  tension: number;
  trend: string;
};

export const sentiment: SentimentTeam[] = [
  { team: "Arsenal", mentions: 48210, positivity: 62, pessimism: 21, tension: 71, trend: "Cautiously optimistic" },
  { team: "Man City", mentions: 39880, positivity: 48, pessimism: 33, tension: 66, trend: "Nervous after away form" },
  { team: "Liverpool", mentions: 51200, positivity: 55, pessimism: 26, tension: 74, trend: "Derby anxiety spike" },
  { team: "Man United", mentions: 61450, positivity: 31, pessimism: 52, tension: 89, trend: "Overwhelming pessimism" },
  { team: "Newcastle", mentions: 22100, positivity: 58, pessimism: 19, tension: 60, trend: "Quiet confidence" },
];

export type StyleMatchup = {
  id: string;
  home: string;
  away: string;
  homeStyle: string;
  awayStyle: string;
  cornerLean: string;
  cardsLean: string;
  mismatch: string;
  confidence: number;
};

export const matchups: StyleMatchup[] = [
  { id: "m1", home: "Liverpool", away: "Crystal Palace", homeStyle: "High press + direct", awayStyle: "Low block + long ball", cornerLean: "Over 10.5 corners", cardsLean: "Palace over 2.5 cards", mismatch: "Press vs poor build-up = turnovers in final third", confidence: 78 },
  { id: "m2", home: "Man City", away: "Everton", homeStyle: "Positional possession", awayStyle: "Deep 4-5-1", cornerLean: "City over 7.5 corners", cardsLean: "Under 3.5 cards", mismatch: "Sustained pressure vs deep block = set-piece volume", confidence: 71 },
  { id: "m3", home: "Brentford", away: "Tottenham", homeStyle: "Direct + set-piece heavy", awayStyle: "High line + aggressive", cornerLean: "Over 9.5 corners", cardsLean: "Over 4.5 cards", mismatch: "Aerial threat vs weak cross defence", confidence: 69 },
];

export type Debate = {
  id: string;
  club: string;
  rivalClub?: string;
  author: string;
  kind: "text" | "audio" | "video";
  title: string;
  body: string;
  duration?: string;
  seconds?: number;
  likes: number;
  replies: number;
  heat: number;
  time: string;
  tag: string;
};

// Cross-club argument hall — mock voices siphoned from timeline wars.
export const debates: Debate[] = [
  { id: "d1", club: "Arsenal", rivalClub: "Man City", author: "@northbank_nelly", kind: "audio", title: "60 seconds: why the left overload breaks City", body: "Saliba steps, Rice covers, Martinelli pins the fullback. Press the clip, tell me where Pep hides his winger.", duration: "1:04", seconds: 64, likes: 842, replies: 213, heat: 94, time: "12m", tag: "Tactics" },
  { id: "d2", club: "Man United", author: "@stretford_static", kind: "video", title: "Watch: our press dies after 60 minutes (proof)", body: "Split screen of minute 12 vs 68. Same trigger, nobody goes. Duet this if your club does it worse.", duration: "0:47", seconds: 47, likes: 1204, replies: 389, heat: 97, time: "26m", tag: "Pressing" },
  { id: "d3", club: "Liverpool", rivalClub: "Everton", author: "@kopite_kel", kind: "text", title: "Derby week truth: derby form is a myth, numbers inside", body: "Last 10 derbies: xG gap follows league position 8 times out of 10. Agree or are derbies different?", likes: 456, replies: 178, heat: 82, time: "41m", tag: "Derby" },
  { id: "d4", club: "Man City", author: "@pep_pls", kind: "audio", title: "Voice note from the away end: Rodri is the system", body: "Three games without him, three different collapses. Change my mind in the replies.", duration: "0:58", seconds: 58, likes: 677, replies: 245, heat: 88, time: "1h", tag: "Midfield" },
  { id: "d5", club: "Newcastle", rivalClub: "Liverpool", author: "@gallowgate_gal", kind: "video", title: "St James cam: this is what 52k sounds like at 1-0 down", body: "Filmed from row 12. Play loud. Your ground could never — prove me wrong.", duration: "0:31", seconds: 31, likes: 2103, replies: 512, heat: 99, time: "2h", tag: "Atmosphere" },
  { id: "d6", club: "Arsenal", author: "@halfspace_hero", kind: "text", title: "Set-piece FC? Good. Here is the near-post routine drawn up", body: "Blocker screens the keeper, flick at the near post. Legal, repeatable, unstoppable until the law changes.", likes: 389, replies: 96, heat: 74, time: "3h", tag: "Set pieces" },
];

export type Reply = {
  id: string;
  author: string;
  club: string;
  body: string;
  votes: number;
  time: string;
  kind?: "text" | "audio" | "video";
  duration?: string;
  children?: Reply[];
};

export const debateReplies: Record<string, Reply[]> = {
  d1: [
    { id: "d1-r1", author: "@pep_pls", club: "Man City", body: "He hides him inside. Gvardiol tucks in and the winger becomes a second 10. Your overload meets a box, not a line.", votes: 214, time: "9m", children: [
      { id: "d1-r1a", author: "@northbank_nelly", club: "Arsenal", body: "Then the far-side winger is 1v1 with acres. Pick your poison — that is the point of the clip.", votes: 132, time: "6m" },
      { id: "d1-r1b", author: "@lowblockliz", club: "Newcastle", body: "Both right. It becomes a rest-defence question: who covers the turnover when the overload fails?", votes: 88, time: "4m" },
    ]},
    { id: "d1-r2", author: "@kopite_kel", club: "Liverpool", body: "Audio reply: we tried the same overload at the Etihad and got countered twice. Width has to come from the fullback, not the winger.", votes: 96, time: "7m", kind: "audio", duration: "0:42" },
  ],
  d2: [
    { id: "d2-r1", author: "@gallowgate_gal", club: "Newcastle", body: "Video duet: ours dies at 70, not 60. Howe just yells louder so nobody notices.", votes: 342, time: "18m", kind: "video", duration: "0:22", children: [
      { id: "d2-r1a", author: "@stretford_static", club: "Man United", body: "Subs win presses. Your bench has legs, ours has vibes.", votes: 187, time: "11m" },
    ]},
    { id: "d2-r2", author: "@halfspace_hero", club: "Arsenal", body: "Minute 68 is a fitness + structure problem. Triggers mean nothing if the distances are 15m instead of 8m.", votes: 158, time: "15m" },
  ],
  d5: [
    { id: "d5-r1", author: "@kopite_kel", club: "Liverpool", body: "Anfield at 1-0 down in a European night says hello. Loudest stand is decided in April, not September.", votes: 402, time: "1h", children: [
      { id: "d5-r1a", author: "@gallowgate_gal", club: "Newcastle", body: "Accepted. April, same thread, loser buys the pies.", votes: 298, time: "1h" },
    ]},
    { id: "d5-r2", author: "@stretford_static", club: "Man United", body: "Audio from Old Trafford: 75k humming anxiously is still technically sound.", votes: 121, time: "50m", kind: "audio", duration: "0:35" },
  ],
};

export function repliesFor(id: string): Reply[] {
  if (debateReplies[id]) return debateReplies[id];
  const d = debates.find((x) => x.id === id);
  return [
    { id: `${id}-r1`, author: "@halfspace_hero", club: "Arsenal", body: "Good take. The second half of this argument is where it gets interesting — what changes after 60 minutes?", votes: 84, time: "30m" },
    { id: `${id}-r2`, author: "@lowblockliz", club: "Newcastle", body: `As a neutral: ${d ? d.club : "both sides"} have a point, but the numbers favor whoever controls the second ball.`, votes: 61, time: "22m" },
  ];
}
