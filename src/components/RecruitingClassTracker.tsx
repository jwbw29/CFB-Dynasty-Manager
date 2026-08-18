// src/components/RecruitingClassTracker.tsx
"use client";

import React, { useState, useCallback, useMemo } from "react";
import {
  Card,
  CardHeader,
  CardContent,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import useLocalStorage from "@/hooks/useLocalStorage";
import { useDynasty } from "@/contexts/DynastyContext";
import { capitalizeName, formatDisplayName } from "@/utils";
import { Recruit, Player, generalPositions } from "@/types/playerTypes";
import {
  notifySuccess,
  notifyError,
  MESSAGES,
} from "@/utils/notification-utils";
import { HeroHeader } from "@/components/ui/HeroHeader";
import {
  Pencil,
  Trash2,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "./ui/alert-dialog";
import {
  OFFENSIVE_TEAM_PLAYBOOKS,
  ALTERNATE_OFFENSE_PLAYBOOKS,
  DEFENSIVE_PLAYBOOKS,
  OFFENSIVE_POSITIONS,
  DEFENSIVE_POSITIONS,
  ARCHETYPE_MAP,
} from "@/data/recruitingBlueprint";
import { ArchetypeSelector } from "@/components/ArchetypeSelector";

interface DevTraitBadgeProps {
  trait: "Normal" | "Impact" | "Star" | "Elite";
}

// Data for form dropdowns
const potentials = ["Elite", "Star", "Impact", "Normal"];
const starOptions = ["5", "4", "3", "2", "1"];
const usStates = [
  "Alabama",
  "Alaska",
  "Arizona",
  "Arkansas",
  "California",
  "Colorado",
  "Connecticut",
  "Delaware",
  "Florida",
  "Georgia",
  "Hawaii",
  "Idaho",
  "Illinois",
  "Indiana",
  "Iowa",
  "Kansas",
  "Kentucky",
  "Louisiana",
  "Maine",
  "Maryland",
  "Massachusetts",
  "Michigan",
  "Minnesota",
  "Mississippi",
  "Missouri",
  "Montana",
  "Nebraska",
  "Nevada",
  "New Hampshire",
  "New Jersey",
  "New Mexico",
  "New York",
  "North Carolina",
  "North Dakota",
  "Ohio",
  "Oklahoma",
  "Oregon",
  "Pennsylvania",
  "Rhode Island",
  "South Carolina",
  "South Dakota",
  "Tennessee",
  "Texas",
  "Utah",
  "Vermont",
  "Virginia",
  "Washington",
  "West Virginia",
  "Wisconsin",
  "Wyoming",
];
const stateOptions = [...usStates, "International"];

interface RecruitingNeed {
  position: string;
  rating: string;
  need: number;
  signed: number;
  targeted: number;
  returnersOverride?: number | null;
}

const offensivePositions: RecruitingNeed[] = [
  {
    position: "QB",
    rating: "",
    need: 0,
    signed: 0,
    targeted: 0,
    returnersOverride: null,
  },
  {
    position: "HB",
    rating: "",
    need: 0,
    signed: 0,
    targeted: 0,
    returnersOverride: null,
  },
  {
    position: "WR",
    rating: "",
    need: 0,
    signed: 0,
    targeted: 0,
    returnersOverride: null,
  },
  {
    position: "TE",
    rating: "",
    need: 0,
    signed: 0,
    targeted: 0,
    returnersOverride: null,
  },
  {
    position: "OT",
    rating: "",
    need: 0,
    signed: 0,
    targeted: 0,
    returnersOverride: null,
  },
  {
    position: "OG",
    rating: "",
    need: 0,
    signed: 0,
    targeted: 0,
    returnersOverride: null,
  },
  {
    position: "C",
    rating: "",
    need: 0,
    signed: 0,
    targeted: 0,
    returnersOverride: null,
  },
];

const defensivePositions: RecruitingNeed[] = [
  {
    position: "EDGE",
    rating: "",
    need: 0,
    signed: 0,
    targeted: 0,
    returnersOverride: null,
  },
  {
    position: "DT",
    rating: "",
    need: 0,
    signed: 0,
    targeted: 0,
    returnersOverride: null,
  },
  {
    position: "OLB",
    rating: "",
    need: 0,
    signed: 0,
    targeted: 0,
    returnersOverride: null,
  },
  {
    position: "MIKE",
    rating: "",
    need: 0,
    signed: 0,
    targeted: 0,
    returnersOverride: null,
  },
  {
    position: "CB",
    rating: "",
    need: 0,
    signed: 0,
    targeted: 0,
    returnersOverride: null,
  },
  {
    position: "FS/SS",
    rating: "",
    need: 0,
    signed: 0,
    targeted: 0,
    returnersOverride: null,
  },
  {
    position: "K/P",
    rating: "",
    need: 0,
    signed: 0,
    targeted: 0,
    returnersOverride: null,
  },
];

/** Maps each recruiting board position to the roster positions that count toward it */
const RECRUITING_POSITION_MAP: Record<string, string[]> = {
  QB: ["QB"],
  HB: ["RB", "FB"],
  WR: ["WR"],
  TE: ["TE"],
  OT: ["LT", "RT"],
  OG: ["LG", "RG"],
  C: ["C"],
  EDGE: ["LEDGE", "REDGE"],
  DT: ["DT"],
  OLB: ["SAM", "WILL"],
  MIKE: ["MIKE"],
  CB: ["CB"],
  "FS/SS": ["FS", "SS"],
  "K/P": ["K", "P"],
};

/**
 * Calculates how many roster players will return next year at each recruiting position.
 *
 * A player is a "returner" if they are NOT graduating and NOT leaving:
 * - EXCLUDE: year === "SR (RS)" (graduating redshirt senior)
 * - EXCLUDE: year === "SR" AND isRedshirted === false (graduating senior)
 * - INCLUDE: year === "SR" AND isRedshirted === true (redshirting senior, returns as SR(RS))
 * - INCLUDE: all other year values (FR, FR(RS), SO, SO(RS), JR, JR(RS), TR)
 * - EXCLUDE: isTransferring === true (leaving via transfer portal)
 * - EXCLUDE: isDrafted === true (leaving for NFL)
 * - SKIP: players with empty/missing position or year fields
 *
 * @param players - The full roster array from localStorage
 * @param positionMap - Maps recruiting positions to roster position arrays
 * @returns Record keyed by recruiting position with count of returners
 */
const calculateReturners = (
  players: Player[],
  positionMap: Record<string, string[]>,
): Record<string, number> => {
  // Filter to only returning players
  const returners = players.filter((player) => {
    // Skip players with missing data
    if (!player.position || !player.year) return false;

    // Exclude players leaving via transfer or draft
    if (player.isTransferring || player.isDrafted) return false;

    // SR (RS) always graduates — exclude
    if (player.year === "SR (RS)") return false;

    // SR who is NOT redshirting this season — graduating, exclude
    if (player.year === "SR" && !player.isRedshirted) return false;

    // All others return (including SR + isRedshirted=true, FR, SO, JR, TR, etc.)
    return true;
  });

  // Count returners per recruiting position using the position map
  const counts: Record<string, number> = {};
  for (const [recruitingPos, rosterPositions] of Object.entries(positionMap)) {
    counts[recruitingPos] = returners.filter((player) =>
      rosterPositions.includes(player.position),
    ).length;
  }

  return counts;
};

const getRowStatus = (need: number, signed: number, targeted: number) => {
  if (signed >= need) return "complete";
  if (signed + targeted >= need) return "ontrack";
  return "urgent";
};

const getTabIndex = (
  tableType: "offensive" | "defensive",
  positionIndex: number,
  fieldIndex: number,
) => {
  const baseIndex = tableType === "offensive" ? 100 : 200;
  return baseIndex + positionIndex * 10 + fieldIndex;
};

const RecruitingNeedsTable = React.memo<{
  title: string;
  needs: RecruitingNeed[];
  updateNeed: (
    position: string,
    field: "rating" | "need" | "signed" | "targeted" | "returnersOverride",
    value: string | number | null,
  ) => void;
  returnerCounts: Record<string, number>;
  rosterPlayers: Player[];
  tableType: "offensive" | "defensive";
}>(({ title, needs, updateNeed, returnerCounts, rosterPlayers, tableType }) => {
  const [hoveredPosition, setHoveredPosition] = useState<string | null>(null);

  /** Gets only returning roster players matching a recruiting position group */
  const getPlayersForPosition = (recruitingPosition: string): Player[] => {
    const rosterPositions = RECRUITING_POSITION_MAP[recruitingPosition] || [];
    return rosterPlayers
      .filter((p) => {
        // Must match this position group
        if (!p.position || !rosterPositions.includes(p.position)) return false;
        // Must have a valid year
        if (!p.year) return false;
        // Exclude players leaving via transfer or draft
        if (p.isTransferring || p.isDrafted) return false;
        // SR (RS) always graduates
        if (p.year === "SR (RS)") return false;
        // SR who is NOT redshirting this season — graduating
        if (p.year === "SR" && !p.isRedshirted) return false;
        // All others are returners
        return true;
      })
      .sort((a, b) => (parseInt(b.rating) || 0) - (parseInt(a.rating) || 0));
  };

  return (
    <div className="w-full">
      <div className="bg-red-500 text-white text-center py-2 font-semibold">
        {title}
      </div>
      <div className="grid grid-cols-6 gap-0 border border-gray-300">
        <div className="bg-gray-100 dark:bg-gray-800 p-2 text-center font-medium border-r border-gray-300">
          Position
        </div>
        <div className="bg-gray-100 dark:bg-gray-800 p-2 text-center font-medium border-r border-gray-300">
          Returners
        </div>
        <div className="bg-gray-100 dark:bg-gray-800 p-2 text-center font-medium border-r border-gray-300">
          Priority
        </div>
        <div className="bg-gray-100 dark:bg-gray-800 p-2 text-center font-medium border-r border-gray-300">
          Need
        </div>
        <div className="bg-gray-100 dark:bg-gray-800 p-2 text-center font-medium border-r border-gray-300">
          Targeted
        </div>
        <div className="bg-gray-100 dark:bg-gray-800 p-2 text-center font-medium">
          Signed
        </div>

        {needs.map((need, positionIndex) => {
          const status = getRowStatus(need.need, need.signed, need.targeted);
          const rowClass =
            status === "complete" ? "bg-green-100 dark:bg-green-900" : "";

          return (
            <React.Fragment key={need.position}>
              <div
                className={`p-2 text-center border-r border-b border-gray-300 flex items-center justify-center relative ${rowClass}`}
                onMouseEnter={() => setHoveredPosition(need.position)}
                onMouseLeave={() => setHoveredPosition(null)}
              >
                <span className="cursor-pointer">
                  {need.position}
                  {(() => {
                    const players = getPlayersForPosition(need.position);
                    if (players.length === 0) return null;
                    const avg =
                      players.reduce(
                        (sum, p) => sum + (parseInt(p.rating) || 0),
                        0,
                      ) / players.length;
                    return (
                      <span className="text-muted-foreground font-normal">
                        {" | " + avg.toFixed(1)}
                      </span>
                    );
                  })()}
                </span>
                {status === "complete" && (
                  <CheckCircle className="h-4 w-4 text-green-600 ml-2" />
                )}

                {hoveredPosition === need.position &&
                  (() => {
                    const players = getPlayersForPosition(need.position);
                    const avgRating =
                      players.length > 0
                        ? (
                            players.reduce(
                              (sum, p) => sum + (parseInt(p.rating) || 0),
                              0,
                            ) / players.length
                          ).toFixed(1)
                        : null;

                    return (
                      <div className="absolute left-full top-0 ml-2 z-50 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-xl p-3 min-w-[250px] text-left">
                        <div className="font-bold text-sm mb-2 border-b pb-1 dark:border-gray-600">
                          {need.position} Roster
                          {avgRating && (
                            <span className="font-normal text-muted-foreground ml-1">
                              (Avg: {avgRating})
                            </span>
                          )}
                        </div>
                        {players.length === 0 ? (
                          <p className="text-sm text-muted-foreground italic">
                            No players at this position
                          </p>
                        ) : (
                          <div className="space-y-1.5 max-h-[200px] overflow-y-auto">
                            {players.map((player) => (
                              <div
                                key={player.id}
                                className="text-sm flex items-start gap-2"
                              >
                                <span className="font-semibold text-primary min-w-[28px]">
                                  {player.rating}
                                </span>
                                <div className="flex-1">
                                  <span className="font-medium">
                                    {player.name}
                                  </span>
                                  <span className="text-muted-foreground ml-1 text-xs">
                                    ({player.year})
                                  </span>
                                  {player.notes && (
                                    <p className="text-xs text-muted-foreground mt-0.5 break-words whitespace-normal">
                                      {player.notes}
                                    </p>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })()}
              </div>
              <div
                className={`p-2 border-r border-b border-gray-300 ${rowClass}`}
              >
                <Input
                  key={`${need.position}-returners`}
                  type="number"
                  value={
                    need.returnersOverride != null ? need.returnersOverride : ""
                  }
                  onChange={(e) => {
                    const val = e.target.value;
                    updateNeed(
                      need.position,
                      "returnersOverride",
                      val === "" ? null : parseInt(val) || 0,
                    );
                  }}
                  className="w-full text-center border-0 bg-transparent p-1 placeholder:text-muted-foreground"
                  placeholder={String(returnerCounts[need.position] ?? 0)}
                  min="0"
                  tabIndex={getTabIndex(tableType, positionIndex, 1)}
                />
              </div>
              <div
                className={`p-2 border-r border-b border-gray-300 ${rowClass} ${
                  need.rating.toLowerCase().includes("p1") ? "ring-2 ring-inset ring-red-500" : ""
                }`}
              >
                <Input
                  key={`${need.position}-rating`}
                  value={need.rating}
                  onChange={(e) =>
                    updateNeed(need.position, "rating", e.target.value)
                  }
                  className="w-full text-center border-0 bg-transparent p-1"
                  placeholder="P1, P2, etc"
                  tabIndex={getTabIndex(tableType, positionIndex, 2)}
                />
              </div>
              <div
                className={`p-2 border-r border-b border-gray-300 ${rowClass} ${
                  status === "ontrack" ? "bg-yellow-100 dark:bg-yellow-900" : ""
                }`}
              >
                <Input
                  key={`${need.position}-need`}
                  type="number"
                  value={need.need || ""}
                  onChange={(e) =>
                    updateNeed(
                      need.position,
                      "need",
                      parseInt(e.target.value) || 0,
                    )
                  }
                  className="w-full text-center border-0 bg-transparent p-1"
                  min="0"
                  tabIndex={getTabIndex(tableType, positionIndex, 3)}
                />
              </div>
              <div
                className={`p-2 border-r border-b border-gray-300 ${rowClass} ${
                  status === "urgent" ? "bg-red-100 dark:bg-red-900" : ""
                }`}
              >
                <Input
                  key={`${need.position}-targeted`}
                  type="number"
                  value={need.targeted || ""}
                  onChange={(e) =>
                    updateNeed(
                      need.position,
                      "targeted",
                      parseInt(e.target.value) || 0,
                    )
                  }
                  className="w-full text-center border-0 bg-transparent p-1"
                  min="0"
                  tabIndex={getTabIndex(tableType, positionIndex, 4)}
                />
              </div>
              <div
                className={`p-2 border-b border-gray-300 ${rowClass} ${
                  status === "urgent" ? "bg-red-100 dark:bg-red-900" : ""
                }`}
              >
                <Input
                  key={`${need.position}-signed`}
                  type="number"
                  value={need.signed || ""}
                  onChange={(e) =>
                    updateNeed(
                      need.position,
                      "signed",
                      parseInt(e.target.value) || 0,
                    )
                  }
                  className="w-full text-center border-0 bg-transparent p-1"
                  min="0"
                  tabIndex={getTabIndex(tableType, positionIndex, 5)}
                />
              </div>
            </React.Fragment>
          );
        })}

        <div className="p-2 text-center border-r border-gray-300 bg-gray-200 dark:bg-gray-700 font-bold">
          TOTAL
        </div>
        <div className="p-2 text-center border-r border-gray-300 bg-gray-200 dark:bg-gray-700 font-bold">
          {needs.reduce(
            (sum, n) =>
              sum + (n.returnersOverride ?? returnerCounts[n.position] ?? 0),
            0,
          )}
        </div>
        <div className="p-2 border-r border-gray-300 bg-gray-200 dark:bg-gray-700" />
        <div className="p-2 text-center border-r border-gray-300 bg-gray-200 dark:bg-gray-700 font-bold">
          {needs.reduce((sum, n) => sum + n.need, 0)}
        </div>
        <div className="p-2 text-center border-r border-gray-300 bg-gray-200 dark:bg-gray-700 font-bold">
          {needs.reduce((sum, n) => sum + n.targeted, 0)}
        </div>
        <div className="p-2 text-center bg-gray-200 dark:bg-gray-700 font-bold">
          {needs.reduce((sum, n) => sum + n.signed, 0)}
        </div>
      </div>
    </div>
  );
});

RecruitingNeedsTable.displayName = "RecruitingNeedsTable";

// This type represents the state of the form, where ranks are strings from input fields.
type NewRecruitFormState = {
  name: string;
  stars: string;
  position: string;
  state: string;
  nationalRank: string;
  stateRank: string;
  potential: string;
};

// Function to sort recruits by star rating, then national rank
const sortRecruitsByStars = (recruits: Recruit[]): Recruit[] => {
  return [...recruits].sort((a, b) => {
    const starsA = parseInt(a.stars) || 0;
    const starsB = parseInt(b.stars) || 0;

    // Sort by stars descending (5 to 1)
    if (starsA !== starsB) {
      return starsB - starsA;
    }

    // If stars are equal, sort by national rank ascending (lower is better)
    // Ranks of null are sorted last
    const rankA = a.nationalRank ?? 9999;
    const rankB = b.nationalRank ?? 9999;
    return rankA - rankB;
  });
};

const RecruitingClassTracker: React.FC = () => {
  const { currentDynastyId } = useDynasty();
  const [rosterPlayers] = useLocalStorage<Player[]>("players", []);
  const [currentYear] = useLocalStorage<number>(
    "currentYear",
    new Date().getFullYear(),
  );
  const [allRecruits, setAllRecruits] = useLocalStorage<Recruit[]>(
    "allRecruits",
    [],
  );
  const [offensiveNeeds, setOffensiveNeeds] = useLocalStorage<RecruitingNeed[]>(
    currentDynastyId ? `offensiveNeeds_${currentDynastyId}` : "offensiveNeeds",
    offensivePositions,
  );
  const [defensiveNeeds, setDefensiveNeeds] = useLocalStorage<RecruitingNeed[]>(
    currentDynastyId ? `defensiveNeeds_${currentDynastyId}` : "defensiveNeeds",
    defensivePositions,
  );
  const initialFormState: NewRecruitFormState = {
    name: "",
    stars: "",
    position: "",
    state: "",
    nationalRank: "",
    stateRank: "",
    potential: "",
  };

  const [newRecruit, setNewRecruit] =
    useState<NewRecruitFormState>(initialFormState);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedYear, setSelectedYear] = useState<number>(currentYear);
  const [isNeedsExpanded, setIsNeedsExpanded] = useState<boolean>(false);

  // Recruiting Blueprint feature state
  const [isBlueprintExpanded, setIsBlueprintExpanded] = useState<boolean>(false);
  // Selected offensive playbook for the recruiting blueprint
  const [offensePlaybook, setOffensePlaybook] = useLocalStorage<string>(
    currentDynastyId ? `offensePlaybook_${currentDynastyId}` : "offensePlaybook",
    "",
  );
  // Selected defensive playbook for the recruiting blueprint
  const [defensePlaybook, setDefensePlaybook] = useLocalStorage<string>(
    currentDynastyId ? `defensePlaybook_${currentDynastyId}` : "defensePlaybook",
    "",
  );
  // Maps offensive positions to selected archetypes for blueprint targeting
  const [offenseBlueprintArchetypes, setOffenseBlueprintArchetypes] = useLocalStorage<Record<string, string[]>>(
    currentDynastyId ? `offenseBlueprintArchetypes_${currentDynastyId}` : "offenseBlueprintArchetypes",
    {},
  );
  // Maps defensive positions to selected archetypes for blueprint targeting
  const [defenseBlueprintArchetypes, setDefenseBlueprintArchetypes] = useLocalStorage<Record<string, string[]>>(
    currentDynastyId ? `defenseBlueprintArchetypes_${currentDynastyId}` : "defenseBlueprintArchetypes",
    {},
  );

  // Apply sorting to displayed recruits
  const recruitsForSelectedYear = sortRecruitsByStars(
    allRecruits.filter((recruit) => recruit.recruitedYear === selectedYear),
  );

  const returnerCounts = useMemo(
    () => calculateReturners(rosterPlayers, RECRUITING_POSITION_MAP),
    [rosterPlayers],
  );

  // Debounced save notification for recruiting needs
  const debouncedSaveNotification = useCallback(() => {
    const timeoutId = setTimeout(() => {
      notifySuccess("Recruiting needs saved");
    }, 500);
    return () => clearTimeout(timeoutId);
  }, []);

  // Update Offensive Needs
  const updateOffensiveNeed = useCallback(
    (
      position: string,
      field: "rating" | "need" | "signed" | "targeted" | "returnersOverride",
      value: string | number | null,
    ) => {
      setOffensiveNeeds((prev) =>
        prev.map((need) =>
          need.position === position ? { ...need, [field]: value } : need,
        ),
      );
      debouncedSaveNotification();
    },
    [setOffensiveNeeds, debouncedSaveNotification],
  );

  // Update Defensive Needs
  const updateDefensiveNeed = useCallback(
    (
      position: string,
      field: "rating" | "need" | "signed" | "targeted" | "returnersOverride",
      value: string | number | null,
    ) => {
      setDefensiveNeeds((prev) =>
        prev.map((need) =>
          need.position === position ? { ...need, [field]: value } : need,
        ),
      );
      debouncedSaveNotification();
    },
    [setDefensiveNeeds, debouncedSaveNotification],
  );

  const DevTraitBadge: React.FC<DevTraitBadgeProps> = ({ trait }) => {
    const colors = {
      Elite: "bg-green-500 text-white dark:bg-green-500 dark:text-white",
      Star: "bg-blue-500 text-white dark:bg-blue-500 dark:text-white",
      Impact: "bg-yellow-500 text-white dark:bg-yellow-500 dark:text-white",
      Normal: "bg-red-500 text-white dark:bg-red-500 dark:text-white",
    } as const;

    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-sm/6 font-medium ${colors[trait]}`}
      >
        {trait}
      </span>
    );
  };

  const resetForm = () => {
    setNewRecruit(initialFormState);
  };

  const addRecruit = () => {
    const recruitToAdd: Recruit = {
      id: Date.now().toString(),
      recruitedYear: selectedYear,
      name: capitalizeName(newRecruit.name),
      stars: newRecruit.stars,
      position: newRecruit.position,
      state: newRecruit.state,
      potential: newRecruit.potential,
      nationalRank: newRecruit.nationalRank
        ? parseInt(newRecruit.nationalRank, 10)
        : null,
      stateRank: newRecruit.stateRank
        ? parseInt(newRecruit.stateRank, 10)
        : null,
      commitStatus: "verbal",
    };
    setAllRecruits([...allRecruits, recruitToAdd]);
    resetForm();
    notifySuccess(MESSAGES.SAVE_SUCCESS);
  };

  const startEditing = (recruit: Recruit) => {
    setEditingId(recruit.id);
    // Convert numbers back to strings for the form input fields
    setNewRecruit({
      name: recruit.name,
      stars: recruit.stars,
      position: recruit.position,
      state: recruit.state,
      potential: recruit.potential,
      nationalRank: recruit.nationalRank?.toString() ?? "",
      stateRank: recruit.stateRank?.toString() ?? "",
    });
  };

  const saveEdit = () => {
    setAllRecruits(
      allRecruits.map((r) => {
        if (r.id !== editingId) return r;
        return {
          id: r.id,
          recruitedYear: selectedYear,
          name: capitalizeName(newRecruit.name),
          stars: newRecruit.stars,
          position: newRecruit.position,
          state: newRecruit.state,
          potential: newRecruit.potential,
          nationalRank: newRecruit.nationalRank
            ? parseInt(newRecruit.nationalRank, 10)
            : null,
          stateRank: newRecruit.stateRank
            ? parseInt(newRecruit.stateRank, 10)
            : null,
          commitStatus: r.commitStatus ?? "verbal",
        };
      }),
    );
    setEditingId(null);
    resetForm();
    notifySuccess(MESSAGES.SAVE_SUCCESS);
  };

  const cancelEdit = () => {
    setEditingId(null);
    resetForm();
  };

  const removeRecruit = (id: string) => {
    setAllRecruits(allRecruits.filter((recruit) => recruit.id !== id));
    notifySuccess(MESSAGES.SAVE_SUCCESS);
  };

  const toggleCommitStatus = (id: string) => {
    setAllRecruits(
      allRecruits.map((r) =>
        r.id === id ? { ...r, commitStatus: "hard" as const } : r,
      ),
    );
    notifySuccess("Recruit marked as hard commit");
  };

  /** Add an archetype to a position's list in the offensive blueprint */
  const addOffenseArchetype = useCallback(
    (position: string, archetype: string) => {
      setOffenseBlueprintArchetypes((prev) => ({
        ...prev,
        [position]: [...(prev[position] || []), archetype],
      }));
    },
    [setOffenseBlueprintArchetypes],
  );

  /** Remove an archetype from a position's list in the offensive blueprint */
  const removeOffenseArchetype = useCallback(
    (position: string, archetype: string) => {
      setOffenseBlueprintArchetypes((prev) => ({
        ...prev,
        [position]: (prev[position] || []).filter((a) => a !== archetype),
      }));
    },
    [setOffenseBlueprintArchetypes],
  );

  /** Add an archetype to a position's list in the defensive blueprint */
  const addDefenseArchetype = useCallback(
    (position: string, archetype: string) => {
      setDefenseBlueprintArchetypes((prev) => ({
        ...prev,
        [position]: [...(prev[position] || []), archetype],
      }));
    },
    [setDefenseBlueprintArchetypes],
  );

  /** Remove an archetype from a position's list in the defensive blueprint */
  const removeDefenseArchetype = useCallback(
    (position: string, archetype: string) => {
      setDefenseBlueprintArchetypes((prev) => ({
        ...prev,
        [position]: (prev[position] || []).filter((a) => a !== archetype),
      }));
    },
    [setDefenseBlueprintArchetypes],
  );

  return (
    <div className="space-y-8">
      {/* Hero Header */}
      <HeroHeader title="Recruiting Class Tracker" />

      {/* Recruiting Blueprint — collapsible accordion matching Recruiting Needs Board style */}
      <Card className="border-2 border-gray-200 dark:border-gray-700 shadow-xl overflow-hidden">
        <div
          className="bg-gradient-to-r from-primary to-primary/90 p-6 cursor-pointer flex flex-row items-center justify-between hover:from-primary/80 hover:to-primary/70 transition-all"
          onClick={() => setIsBlueprintExpanded(!isBlueprintExpanded)}
        >
          <span className="text-2xl font-black text-white">
            Recruiting Blueprint
          </span>
          {isBlueprintExpanded ? (
            <ChevronUp className="h-6 w-6 text-white" />
          ) : (
            <ChevronDown className="h-6 w-6 text-white" />
          )}
        </div>
        <CardHeader className="hidden"></CardHeader>
        {isBlueprintExpanded && (
          <CardContent className="bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
            <div className="flex gap-4">
              {/* Offensive Blueprint */}
              <Card className="flex flex-col w-full p-4">
                <CardHeader>
                  <CardTitle>Offense</CardTitle>
                  {/* Playbook dropdown replaces the old static CardDescription */}
                  <Select
                    value={offensePlaybook}
                    onValueChange={setOffensePlaybook}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select Playbook" />
                    </SelectTrigger>
                    <SelectContent>
                      {[
                        ...OFFENSIVE_TEAM_PLAYBOOKS,
                        ...ALTERNATE_OFFENSE_PLAYBOOKS,
                      ].map((playbook) => (
                        <SelectItem key={playbook} value={playbook}>
                          {playbook}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Position</TableHead>
                        <TableHead className="text-left">Archetype</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {OFFENSIVE_POSITIONS.map((item) => (
                        <TableRow key={item.position}>
                          <TableCell className="font-bold align-top">
                            {item.position}
                          </TableCell>
                          <TableCell className="text-left">
                            <ArchetypeSelector
                              position={item.position}
                              availableArchetypes={
                                ARCHETYPE_MAP[item.position] || []
                              }
                              selectedArchetypes={
                                offenseBlueprintArchetypes[item.position] || []
                              }
                              onAdd={(archetype) =>
                                addOffenseArchetype(item.position, archetype)
                              }
                              onRemove={(archetype) =>
                                removeOffenseArchetype(item.position, archetype)
                              }
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              {/* Defensive Blueprint */}
              <Card className="flex flex-col w-full p-4">
                <CardHeader>
                  <CardTitle>Defense</CardTitle>
                  {/* Playbook dropdown replaces the old static CardDescription */}
                  <Select
                    value={defensePlaybook}
                    onValueChange={setDefensePlaybook}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select Playbook" />
                    </SelectTrigger>
                    <SelectContent>
                      {DEFENSIVE_PLAYBOOKS.map((playbook) => (
                        <SelectItem key={playbook} value={playbook}>
                          {playbook}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Position</TableHead>
                        <TableHead className="text-left">Archetype</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {DEFENSIVE_POSITIONS.map((item) => (
                        <TableRow key={item.position}>
                          <TableCell className="font-bold align-top">
                            {item.position}
                          </TableCell>
                          <TableCell className="text-left">
                            <ArchetypeSelector
                              position={item.position}
                              availableArchetypes={
                                ARCHETYPE_MAP[item.position] || []
                              }
                              selectedArchetypes={
                                defenseBlueprintArchetypes[item.position] || []
                              }
                              onAdd={(archetype) =>
                                addDefenseArchetype(item.position, archetype)
                              }
                              onRemove={(archetype) =>
                                removeDefenseArchetype(item.position, archetype)
                              }
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Recruiting Needs Section */}
      <Card className="border-2 border-gray-200 dark:border-gray-700 shadow-xl overflow-hidden">
        <div
          className="bg-gradient-to-r from-primary to-primary/90 p-6 cursor-pointer flex flex-row items-center justify-between hover:from-primary/80 hover:to-primary/70 transition-all"
          onClick={() => setIsNeedsExpanded(!isNeedsExpanded)}
        >
          <span className="text-2xl font-black text-white">
            Recruiting Needs Board
          </span>
          {isNeedsExpanded ? (
            <ChevronUp className="h-6 w-6 text-white" />
          ) : (
            <ChevronDown className="h-6 w-6 text-white" />
          )}
        </div>
        <CardHeader className="hidden"></CardHeader>
        {isNeedsExpanded && (
          <CardContent className="bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
            <div className="space-y-6">
              <RecruitingNeedsTable
                title="OFFENSIVE NEEDS"
                needs={offensiveNeeds}
                updateNeed={updateOffensiveNeed}
                returnerCounts={returnerCounts}
                rosterPlayers={rosterPlayers}
                tableType="offensive"
              />
              <RecruitingNeedsTable
                title="DEFENSIVE NEEDS"
                needs={defensiveNeeds}
                updateNeed={updateDefensiveNeed}
                returnerCounts={returnerCounts}
                rosterPlayers={rosterPlayers}
                tableType="defensive"
              />

              {/* Combined totals row — sums both offensive and defensive needs */}
              <div className="w-full">
                <div className="bg-gray-800 text-white text-center py-2 font-semibold">
                  COMBINED TOTALS
                </div>
                <div className="grid grid-cols-6 gap-0 border border-gray-300">
                  <div className="bg-gray-200 dark:bg-gray-700 p-2 text-center font-medium border-r border-gray-300">
                    Position
                  </div>
                  <div className="bg-gray-200 dark:bg-gray-700 p-2 text-center font-medium border-r border-gray-300">
                    Returners
                  </div>
                  <div className="bg-gray-200 dark:bg-gray-700 p-2 text-center font-medium border-r border-gray-300">
                    Priority
                  </div>
                  <div className="bg-gray-200 dark:bg-gray-700 p-2 text-center font-medium border-r border-gray-300">
                    Need
                  </div>
                  <div className="bg-gray-200 dark:bg-gray-700 p-2 text-center font-medium border-r border-gray-300">
                    Targeted
                  </div>
                  <div className="bg-gray-200 dark:bg-gray-700 p-2 text-center font-medium">
                    Signed
                  </div>
                  {/* Data row */}
                  <div className="p-2 text-center border-r border-gray-300 bg-gray-100 dark:bg-gray-800 font-bold">
                    ALL
                  </div>
                  <div className="p-2 text-center border-r border-gray-300 bg-gray-100 dark:bg-gray-800 font-bold">
                    {[...offensiveNeeds, ...defensiveNeeds].reduce(
                      (sum, n) =>
                        sum +
                        (n.returnersOverride ??
                          returnerCounts[n.position] ??
                          0),
                      0,
                    )}
                  </div>
                  <div className="p-2 border-r border-gray-300 bg-gray-100 dark:bg-gray-800" />
                  <div className="p-2 text-center border-r border-gray-300 bg-gray-100 dark:bg-gray-800 font-bold">
                    {[...offensiveNeeds, ...defensiveNeeds].reduce(
                      (sum, n) => sum + n.need,
                      0,
                    )}
                  </div>
                  <div className="p-2 text-center border-r border-gray-300 bg-gray-100 dark:bg-gray-800 font-bold">
                    {[...offensiveNeeds, ...defensiveNeeds].reduce(
                      (sum, n) => sum + n.targeted,
                      0,
                    )}
                  </div>
                  <div className="p-2 text-center bg-gray-100 dark:bg-gray-800 font-bold">
                    {[...offensiveNeeds, ...defensiveNeeds].reduce(
                      (sum, n) => sum + n.signed,
                      0,
                    )}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      <Card className="border-2 border-gray-200 dark:border-gray-700 shadow-xl overflow-hidden">
        <div className="bg-gradient-to-r from-primary to-primary/90 p-6">
          <div className="flex justify-between items-center">
            <span className="text-2xl font-black text-white">
              Add New Recruit for Year: {selectedYear}
            </span>
          </div>
        </div>
        <CardHeader className="hidden"></CardHeader>
        <CardContent className="bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
          <div className="grid grid-cols-1 md:grid-cols-8 gap-4 mb-4 items-end">
            <Input
              value={newRecruit.name}
              onChange={(e) =>
                setNewRecruit({ ...newRecruit, name: e.target.value })
              }
              placeholder="Player Name"
              className="md:col-span-2"
            />
            <Select
              value={newRecruit.stars}
              onValueChange={(value) =>
                setNewRecruit({ ...newRecruit, stars: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Stars" />
              </SelectTrigger>
              <SelectContent>
                {starOptions.map((stars) => (
                  <SelectItem key={stars} value={stars}>
                    {stars} ⭐
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={newRecruit.position}
              onValueChange={(value) =>
                setNewRecruit({ ...newRecruit, position: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Position" />
              </SelectTrigger>
              <SelectContent>
                {generalPositions.map((pos) => (
                  <SelectItem key={pos} value={pos}>
                    {pos}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={newRecruit.state}
              onValueChange={(value) =>
                setNewRecruit({ ...newRecruit, state: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="State" />
              </SelectTrigger>
              <SelectContent>
                {stateOptions.map((state) => (
                  <SelectItem key={state} value={state}>
                    {state}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              value={newRecruit.nationalRank}
              onChange={(e) =>
                setNewRecruit({ ...newRecruit, nationalRank: e.target.value })
              }
              placeholder="Nat. Rank"
              type="number"
            />
            <Input
              value={newRecruit.stateRank}
              onChange={(e) =>
                setNewRecruit({ ...newRecruit, stateRank: e.target.value })
              }
              placeholder="State Rank"
              type="number"
            />
            <Select
              value={newRecruit.potential}
              onValueChange={(value) =>
                setNewRecruit({ ...newRecruit, potential: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Dev. Trait" />
              </SelectTrigger>
              <SelectContent>
                {potentials.map((potential) => (
                  <SelectItem key={potential} value={potential}>
                    {potential}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="md:col-start-8">
              {editingId ? (
                <div className="flex gap-2">
                  <Button onClick={saveEdit} size="sm">
                    Save
                  </Button>
                  <Button onClick={cancelEdit} variant="outline" size="sm">
                    Cancel
                  </Button>
                </div>
              ) : (
                <Button onClick={addRecruit} className="w-full">
                  Add Recruit
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="text-xl font-semibold">
          <div className="flex justify-between items-center">
            <span>Recruiting Class for {selectedYear}</span>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Sorted by Stars, then National Rank
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <thead>
              <tr>
                <th className="text-center">Name</th>
                <th className="text-center">Stars</th>
                <th className="text-center">Position</th>
                <th className="text-center">State</th>
                <th className="text-center">Nat. Rank</th>
                <th className="text-center">State Rank</th>
                <th className="text-center">Dev. Trait</th>
                <th className="text-center">Status</th>
                <th className="text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {recruitsForSelectedYear.map((recruit) => (
                <tr key={recruit.id}>
                  <td className="text-center">
                    {formatDisplayName(recruit.name)}
                  </td>
                  <td className="text-center">{recruit.stars} ⭐</td>
                  <td className="text-center">{recruit.position}</td>
                  <td className="text-center">{recruit.state}</td>
                  <td className="text-center">
                    {recruit.nationalRank ?? "N/A"}
                  </td>
                  <td className="text-center">{recruit.stateRank ?? "N/A"}</td>
                  <td className="text-center">
                    <DevTraitBadge
                      trait={
                        recruit.potential as
                          | "Elite"
                          | "Star"
                          | "Impact"
                          | "Normal"
                      }
                    />
                  </td>
                  <td className="text-center">
                    {(recruit.commitStatus ?? "verbal") === "verbal" ? (
                      <button
                        onClick={() => toggleCommitStatus(recruit.id)}
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border-2 border-dashed border-amber-400 bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-500 hover:bg-amber-100 dark:hover:bg-amber-900/50 transition-colors cursor-pointer"
                        title="Click to mark as hard commit"
                      >
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                        </span>
                        Verbal
                      </button>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border-2 border-solid border-green-500 bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-300 dark:border-green-400">
                        <ShieldCheck className="h-3.5 w-3.5" />
                        Hard Commit
                      </span>
                    )}
                  </td>
                  <td className="text-center">
                    <div className="flex items-center gap-1 justify-center">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => startEditing(recruit)}
                        title="Edit"
                      >
                        {" "}
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            title="Remove Player"
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Remove Player</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to remove{" "}
                              {formatDisplayName(recruit.name)}?
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => removeRecruit(recruit.id)}
                            >
                              Remove
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default RecruitingClassTracker;
