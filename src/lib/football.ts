export type MockPlayer = {
  id: number;
  positionType: "goalkeeper" | "defender" | "midfielder" | "attacker";
  alternativePositions: string;
  name: string;
  shirtNumber: number;
};

// Mock XI + bench — editorial placeholders, shaped like future API data.
export const mockXI: MockPlayer[] = [
  { id: 1, positionType: "goalkeeper", alternativePositions: "", name: "A. Becker", shirtNumber: 1 },
  { id: 2, positionType: "defender", alternativePositions: "", name: "T. Alexander", shirtNumber: 66 },
  { id: 3, positionType: "defender", alternativePositions: "", name: "V. van Dijk", shirtNumber: 4 },
  { id: 4, positionType: "defender", alternativePositions: "midfielder", name: "J. Gomez", shirtNumber: 2 },
  { id: 5, positionType: "defender", alternativePositions: "", name: "A. Robertson", shirtNumber: 26 },
  { id: 6, positionType: "midfielder", alternativePositions: "", name: "D. Szoboszlai", shirtNumber: 8 },
  { id: 7, positionType: "midfielder", alternativePositions: "attacker", name: "A. Mac Allister", shirtNumber: 10 },
  { id: 8, positionType: "midfielder", alternativePositions: "", name: "R. Gravenberch", shirtNumber: 38 },
  { id: 9, positionType: "attacker", alternativePositions: "", name: "M. Salah", shirtNumber: 11 },
  { id: 10, positionType: "attacker", alternativePositions: "midfielder", name: "L. Diaz", shirtNumber: 7 },
  { id: 11, positionType: "attacker", alternativePositions: "", name: "D. Nunez", shirtNumber: 9 },
  { id: 12, positionType: "midfielder", alternativePositions: "", name: "C. Jones", shirtNumber: 17 },
  { id: 13, positionType: "defender", alternativePositions: "", name: "I. Konate", shirtNumber: 5 },
  { id: 14, positionType: "attacker", alternativePositions: "", name: "C. Gakpo", shirtNumber: 18 },
];

// Adapter layer: pages read mock data here today, live APIs tomorrow.
// Keep shapes stable so swapping the source never touches the UI.
