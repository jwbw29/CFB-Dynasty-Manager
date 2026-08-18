/**
 * Recruiting Blueprint Constants
 *
 * Pure data file containing CFB team names, playbook types, player positions,
 * and archetype mappings used throughout the recruiting and team management system.
 * No React code or side effects — this is a static data layer only.
 *
 * Imported by: src/components/RecruitingClassTracker.tsx
 */

/**
 * OFFENSIVE_TEAM_PLAYBOOKS
 * 138 FBS/FCS college football team names in alphabetical order.
 * Used for team selection dropdowns and team-based filtering in recruiting workflows.
 * Source: 2024-2025 CFB roster (FBS + select FCS programs)
 */
export const OFFENSIVE_TEAM_PLAYBOOKS: string[] = [
  "Air Force",
  "Akron",
  "Alabama",
  "Appalachian State",
  "Arizona",
  "Arizona State",
  "Arkansas",
  "Arkansas State",
  "Army",
  "Auburn",
  "Ball State",
  "Baylor",
  "Boise State",
  "Boston College",
  "Bowling Green",
  "Buffalo",
  "BYU",
  "California",
  "Central Michigan",
  "Charlotte",
  "Cincinnati",
  "Clemson",
  "Coastal Carolina",
  "Colorado",
  "Colorado State",
  "Delaware",
  "Duke",
  "East Carolina",
  "Eastern Michigan",
  "Florida",
  "Florida Atlantic",
  "Florida International",
  "Florida State",
  "Fresno State",
  "Georgia",
  "Georgia Southern",
  "Georgia State",
  "Georgia Tech",
  "Hawaii",
  "Houston",
  "Illinois",
  "Indiana",
  "Iowa",
  "Iowa State",
  "Jacksonville State",
  "James Madison",
  "Kansas",
  "Kansas State",
  "Kennesaw State",
  "Kent State",
  "Kentucky",
  "Liberty",
  "Louisiana",
  "Louisiana Tech",
  "Louisville",
  "LSU",
  "Marshall",
  "Maryland",
  "Memphis",
  "Miami FL",
  "Miami OH",
  "Michigan",
  "Michigan State",
  "Middle Tennessee",
  "Minnesota",
  "Mississippi State",
  "Missouri",
  "Missouri State",
  "Navy",
  "NC State",
  "Nebraska",
  "Nevada",
  "New Mexico",
  "New Mexico State",
  "North Carolina",
  "North Dakota State",
  "North Texas",
  "Northern Illinois",
  "Northwestern",
  "Notre Dame",
  "Ohio",
  "Ohio State",
  "Oklahoma",
  "Oklahoma State",
  "Old Dominion",
  "Ole Miss",
  "Oregon",
  "Oregon State",
  "Penn State",
  "Pittsburgh",
  "Purdue",
  "Rice",
  "Rutgers",
  "Sacramento State",
  "Sam Houston",
  "San Diego State",
  "San Jose State",
  "SMU",
  "South Alabama",
  "South Carolina",
  "Southern Miss",
  "Stanford",
  "Syracuse",
  "TCU",
  "Temple",
  "Tennessee",
  "Texas",
  "Texas A&M",
  "Texas State",
  "Texas Tech",
  "Toledo",
  "Troy",
  "Tulane",
  "Tulsa",
  "UAB",
  "UCF",
  "UCLA",
  "UConn",
  "UL Monroe",
  "UMass",
  "UNLV",
  "USC",
  "USF",
  "Utah",
  "Utah State",
  "UTEP",
  "UTSA",
  "Vanderbilt",
  "Virginia",
  "Virginia Tech",
  "Wake Forest",
  "Washington",
  "Washington State",
  "West Virginia",
  "Western Kentucky",
  "Western Michigan",
  "Wisconsin",
  "Wyoming",
];

/**
 * ALTERNATE_OFFENSE_PLAYBOOKS
 * 11 alternative offensive scheme types used in CFB.
 * Represents different offensive philosophies and play-calling styles.
 * Source: Common CFB offensive taxonomy (Air Raid, Option, Spread variants, etc.)
 */
export const ALTERNATE_OFFENSE_PLAYBOOKS: string[] = [
  "Air Raid",
  "Go Go",
  "Multiple",
  "Option",
  "Pistol",
  "Power Spread",
  "Pro Style",
  "Run & Shoot",
  "Spread",
  "Spread Option",
  "Veer & Shoot",
];

/**
 * DEFENSIVE_PLAYBOOKS
 * 31 defensive scheme types in alphabetical order.
 * Covers base formations (3-4, 4-3, 4-2-5, 3-3-5) and their coverage/pressure variants.
 * Source: Standard CFB defensive taxonomy with man/zone/shell/pressure modifiers
 */
export const DEFENSIVE_PLAYBOOKS: string[] = [
  "3-2-6",
  "3-3-5",
  "3-3-5 Man",
  "3-3-5 Man Pressure",
  "3-3-5 Shell",
  "3-3-5 Three High",
  "3-3-5 Tite",
  "3-3-5 Zone",
  "3-3-5 Zone Pressure",
  "3-4 Man",
  "3-4 Man Pressure",
  "3-4 Multiple",
  "3-4 Shell",
  "3-4 Zone",
  "3-4 Zone Pressure",
  "4-2-5",
  "4-2-5 Man",
  "4-2-5 Man Pressure",
  "4-2-5 Shell",
  "4-2-5 Zone",
  "4-2-5 Zone Pressure",
  "4-3 Man",
  "4-3 Man Pressure",
  "4-3 Multiple",
  "4-3 Press Quarters",
  "4-3 Shell",
  "4-3 Zone",
  "4-3 Zone Pressure",
  "Base 3-4",
  "Base 4-3",
  "Multiple",
];

/**
 * OFFENSIVE_POSITIONS
 * 7 offensive line and skill positions in CFB.
 * Used for position-based filtering and player archetype assignment.
 * Positions: QB (Quarterback), HB (Half Back), WR (Wide Receiver), TE (Tight End),
 * OT (Offensive Tackle), OG (Offensive Guard), C (Center)
 */
export const OFFENSIVE_POSITIONS: { position: string }[] = [
  { position: "QB" },
  { position: "HB" },
  { position: "WR" },
  { position: "TE" },
  { position: "OT" },
  { position: "OG" },
  { position: "C" },
];

/**
 * DEFENSIVE_POSITIONS
 * 15 defensive positions spanning edge rushers, interior linemen, linebackers, and secondary.
 * Used for position-based filtering and player archetype assignment.
 * Positions: RE/RRE/LE/RLE (Edge), DT/RDT/NT (Interior), SAM/MIKE/WILL/SUBLB (LB),
 * CB1/Slot CB (Corner), SS/FS (Safety)
 */
export const DEFENSIVE_POSITIONS: { position: string }[] = [
  { position: "RE" },
  { position: "RRE" },
  { position: "LE" },
  { position: "RLE" },
  { position: "DT" },
  { position: "RDT" },
  { position: "NT" },
  { position: "SAM" },
  { position: "MIKE" },
  { position: "WILL" },
  { position: "SUBLB" },
  { position: "CB1" },
  { position: "Slot CB" },
  { position: "SS" },
  { position: "FS" },
];

/**
 * ARCHETYPE_MAP
 * Maps each position to its available player archetypes.
 * Archetypes define playstyle, strengths, and role within the scheme.
 * Used for player evaluation, scouting, and roster construction.
 *
 * Example: A QB can be a "Pocket Passer", "Dual Threat", "Backfield Creator", or "Pure Runner"
 * Example: A CB1 can be "Boundary", "Field", "Bump and Run", or "Zone"
 *
 * Source: CFB player evaluation framework (common scouting archetypes)
 */
export const ARCHETYPE_MAP: Record<string, string[]> = {
  QB: ["Backfield Creator", "Dual Threat", "Pocket Passer", "Pure Runner"],
  HB: [
    "Backfield Threat",
    "Contact Seeker",
    "East/West Playmaker",
    "Elusive Bruiser",
    "North/South Blocker",
    "North/South Receiver",
  ],
  WR: [
    "Contested Specialist",
    "Elusive Route Runner",
    "Gadget",
    "Gritty Possession",
    "Physical Route Runner",
    "Route Artist",
    "Speedster",
  ],
  TE: [
    "Gritty Possession",
    "Physical Route Runner",
    "Possession",
    "Pure Blocker",
    "Vertical Threat",
  ],
  OT: ["Agile", "Pass Protection", "Raw Strength", "Well Rounded"],
  OG: ["Agile", "Pass Protection", "Raw Strength", "Well Rounded"],
  C: ["Agile", "Pass Protection", "Raw Strength", "Well Rounded"],
  RE: ["Edge Setter", "Power Rusher", "Pure Power", "Speed Rusher"],
  RRE: ["Edge Setter", "Power Rusher", "Pure Power", "Speed Rusher"],
  LE: ["Edge Setter", "Power Rusher", "Pure Power", "Speed Rusher"],
  RLE: ["Edge Setter", "Power Rusher", "Pure Power", "Speed Rusher"],
  DT: ["Gap Specialist", "Power Rusher", "Pure Power", "Speed Rusher"],
  RDT: ["Gap Specialist", "Power Rusher", "Pure Power", "Speed Rusher"],
  NT: ["Gap Specialist", "Power Rusher", "Pure Power", "Speed Rusher"],
  SAM: ["Lurker", "Signal Caller", "Thumper"],
  MIKE: ["Lurker", "Signal Caller", "Thumper"],
  WILL: ["Lurker", "Signal Caller", "Thumper"],
  SUBLB: ["Lurker", "Signal Caller", "Thumper"],
  CB1: ["Boundary", "Bump and Run", "Field", "Zone"],
  "Slot CB": ["Boundary", "Bump and Run", "Field", "Zone"],
  SS: ["Box Specialist", "Coverage Specialist", "Hybrid"],
  FS: ["Box Specialist", "Coverage Specialist", "Hybrid"],
};
