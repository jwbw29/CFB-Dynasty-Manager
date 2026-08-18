"use client";

import React, { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";

/**
 * ArchetypeSelector — A reusable component for selecting multiple archetypes per position.
 *
 * Renders a dropdown to select available archetypes (filtered to exclude already-selected ones),
 * a "+" button to add the selected archetype, and removable chips for each selected archetype.
 * Hides the dropdown row when all archetypes are already selected.
 *
 * @param position - The position label (for context, not rendered)
 * @param availableArchetypes - List of all possible archetypes to choose from
 * @param selectedArchetypes - Currently selected archetypes for this position
 * @param onAdd - Callback when an archetype is added
 * @param onRemove - Callback when an archetype is removed
 */
export const ArchetypeSelector: React.FC<ArchetypeSelectorProps> = ({
  position,
  availableArchetypes,
  selectedArchetypes,
  onAdd,
  onRemove,
}) => {
  // Track the currently selected (but not yet added) dropdown value
  const [dropdownValue, setDropdownValue] = useState<string>("");

  // Filter to show only archetypes not already selected
  const unselectedArchetypes = availableArchetypes.filter(
    (archetype) => !selectedArchetypes.includes(archetype)
  );

  // Determine if all archetypes are selected
  const allSelected = unselectedArchetypes.length === 0;

  // Handle adding an archetype
  const handleAdd = () => {
    if (dropdownValue) {
      onAdd(dropdownValue);
      setDropdownValue(""); // Reset dropdown after adding
    }
  };

  return (
    <div className="flex flex-col gap-2">
      {/* Dropdown + Add Button Row — hidden if all archetypes are selected */}
      {!allSelected && (
        <div className="flex gap-1">
          {/* Dropdown for selecting an archetype */}
          <Select value={dropdownValue} onValueChange={setDropdownValue}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select archetype" />
            </SelectTrigger>
            <SelectContent>
              {unselectedArchetypes.map((archetype) => (
                <SelectItem key={archetype} value={archetype}>
                  {archetype}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Add Button — disabled if no value selected or all archetypes selected */}
          <Button
            size="icon"
            variant="outline"
            onClick={handleAdd}
            disabled={!dropdownValue || allSelected}
            aria-label="Add archetype"
          >
            +
          </Button>
        </div>
      )}

      {/* Chips for selected archetypes — shown only if any are selected */}
      {selectedArchetypes.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-1">
          {selectedArchetypes.map((archetype) => (
            <span
              key={archetype}
              className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium bg-primary/10 text-primary border border-primary/20"
            >
              {archetype}
              {/* Remove button — small × character */}
              <button
                className="ml-0.5 hover:text-destructive"
                onClick={() => onRemove(archetype)}
                aria-label={`Remove ${archetype}`}
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

interface ArchetypeSelectorProps {
  position: string;
  availableArchetypes: string[];
  selectedArchetypes: string[];
  onAdd: (archetype: string) => void;
  onRemove: (archetype: string) => void;
}
