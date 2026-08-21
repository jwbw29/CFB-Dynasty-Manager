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
import { X, Plus } from "lucide-react";

/**
 * Color palette applied to archetype pills.
 *
 * Colors are assigned by the archetype's INDEX in the position's `availableArchetypes`
 * array (modulo palette length), so:
 *   - Same archetype in the same position → always the same color (stable).
 *   - Different archetypes in the same position → different colors (up to 7 unique
 *     before wrapping — WR has the max of 7 archetypes, so no in-position collisions).
 *   - Same color values CAN repeat across different positions (each position keeps its
 *     own independent index space), which is intentional and acceptable.
 *
 * Every entry ships a light/dark variant for background, text, and border so pills
 * remain legible in both themes without extra runtime logic.
 */
export const ARCHETYPE_COLORS = [
  { bg: "bg-blue-100 dark:bg-blue-900/40", text: "text-blue-800 dark:text-blue-200", border: "border-blue-200 dark:border-blue-700" },
  { bg: "bg-green-100 dark:bg-green-900/40", text: "text-green-800 dark:text-green-200", border: "border-green-200 dark:border-green-700" },
  { bg: "bg-purple-100 dark:bg-purple-900/40", text: "text-purple-800 dark:text-purple-200", border: "border-purple-200 dark:border-purple-700" },
  { bg: "bg-amber-100 dark:bg-amber-900/40", text: "text-amber-800 dark:text-amber-200", border: "border-amber-200 dark:border-amber-700" },
  { bg: "bg-red-100 dark:bg-red-900/40", text: "text-red-800 dark:text-red-200", border: "border-red-200 dark:border-red-700" },
  { bg: "bg-teal-100 dark:bg-teal-900/40", text: "text-teal-800 dark:text-teal-200", border: "border-teal-200 dark:border-teal-700" },
  { bg: "bg-orange-100 dark:bg-orange-900/40", text: "text-orange-800 dark:text-orange-200", border: "border-orange-200 dark:border-orange-700" },
];

/**
 * Props for {@link ArchetypeSelector}. Kept identical to the previous public
 * interface so callers (position-level UIs) don't need to change.
 */
interface ArchetypeSelectorProps {
  position: string;
  availableArchetypes: string[];
  selectedArchetypes: string[];
  onAdd: (archetype: string) => void;
  onRemove: (archetype: string) => void;
}

/**
 * ArchetypeSelector — inline pill-based multi-select for position archetypes.
 *
 * UX flow:
 *   1. Empty state: renders a full-width Select ("Select archetype ▼"). Choosing
 *      a value immediately calls `onAdd` (no separate confirm button).
 *   2. With selections: each chosen archetype renders as a colored rounded pill
 *      with an inline "×" (removes via `onRemove`). To the right, a compact "+"
 *      button appears when more archetypes are still available.
 *   3. Clicking "+" swaps that button for an inline Select limited to the
 *      currently *unselected* archetypes. Picking a value adds it and collapses
 *      the Select back to the "+" button.
 *   4. When every archetype is selected, the "+" button is hidden entirely.
 *
 * Pill colors are derived from the archetype's index in `availableArchetypes`
 * so the same archetype in the same position always renders the same color.
 *
 * @param position - Position label (accepted for API parity; not rendered here).
 * @param availableArchetypes - Full ordered list of archetypes for this position.
 * @param selectedArchetypes - Currently selected archetypes (source of truth from parent).
 * @param onAdd - Called with the archetype string when the user adds one.
 * @param onRemove - Called with the archetype string when the user removes one.
 */
export const ArchetypeSelector: React.FC<ArchetypeSelectorProps> = ({
  position,
  availableArchetypes,
  selectedArchetypes,
  onAdd,
  onRemove,
}) => {
  // Controls whether the inline "add another" Select is currently visible
  // (true after user clicks "+"). Reset to false after a value is chosen so
  // the "+" affordance returns for the next add.
  const [isAdding, setIsAdding] = useState<boolean>(false);

  // Archetypes still available to add — filters out anything already selected
  // so users can't pick a duplicate from either dropdown.
  const unselectedArchetypes = availableArchetypes.filter(
    (archetype) => !selectedArchetypes.includes(archetype)
  );

  return (
    // Flex-wrap row so pills + the add control flow naturally onto multiple lines
    // in narrow columns (e.g., the recruiting table cell). gap-1.5 gives breathing
    // room between pills without wasting horizontal space.
    <div className="flex flex-wrap items-center gap-1.5">
      {/* Selected archetype pills — one colored rounded rectangle per selection.
          Each pill's color is derived from the archetype's index in the full
          availableArchetypes list, ensuring stable per-archetype coloring. */}
      {selectedArchetypes.map((archetype) => {
        // Index in the ORIGINAL availableArchetypes list (not the filtered
        // unselected list) — this is what makes the color stable regardless
        // of which other archetypes are currently selected.
        const colorIndex = availableArchetypes.indexOf(archetype);
        // Fallback to 0 if somehow the archetype isn't in availableArchetypes
        // (defensive — shouldn't happen with clean data, but avoids a negative
        // index producing an undefined color entry).
        const safeIndex = colorIndex >= 0 ? colorIndex : 0;
        const color = ARCHETYPE_COLORS[safeIndex % ARCHETYPE_COLORS.length];

        return (
          // Pill — inline-flex so label and "×" share a baseline; rounded-md
          // gives it the rectangle-with-soft-corners look (not a full pill).
          <span
            key={archetype}
            className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium border ${color.bg} ${color.text} ${color.border}`}
          >
            {archetype}
            {/* Remove button — lucide X icon inside a bare <button> so it
                inherits the pill's text color for perfect contrast in both
                themes. hover:opacity-70 gives subtle feedback without a
                second color token. */}
            <button
              type="button"
              onClick={() => onRemove(archetype)}
              className="hover:opacity-70 focus:outline-none focus-visible:ring-1 focus-visible:ring-current rounded"
              aria-label={`Remove ${archetype}`}
            >
              <X className="h-3 w-3" />
            </button>
          </span>
        );
      })}

      {/* Empty state — no selections yet AND user hasn't opened an add dropdown.
          Renders a full-width Select so the initial affordance is obvious
          (matches the size of the empty cell). onValueChange fires onAdd
          immediately; no confirm step needed. */}
      {selectedArchetypes.length === 0 && !isAdding && (
        <Select
          onValueChange={(val) => {
            onAdd(val);
          }}
        >
          {/* h-8 keeps the trigger compact so it aligns with pill height when
              a selection is later added and the layout shifts. */}
          <SelectTrigger className="w-full h-8">
            <SelectValue placeholder="Select archetype" />
          </SelectTrigger>
          <SelectContent>
            {availableArchetypes.map((a) => (
              <SelectItem key={a} value={a}>
                {a}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      {/* Add-more affordance — shown only when there's at least one selection
          AND at least one archetype still available. When all archetypes are
          selected, this whole block is omitted (no "+" button rendered),
          matching the spec's "no + when full" rule. */}
      {selectedArchetypes.length > 0 && unselectedArchetypes.length > 0 && (
        isAdding ? (
          // Inline add Select — narrower fixed width (160px) so it doesn't
          // dominate a row of small pills. On value pick: add it, then
          // collapse back to the "+" button.
          <Select
            onValueChange={(val) => {
              onAdd(val);
              setIsAdding(false);
            }}
          >
            <SelectTrigger className="h-8 w-[160px]">
              <SelectValue placeholder="Select archetype" />
            </SelectTrigger>
            <SelectContent>
              {/* Only unselected archetypes appear here to prevent duplicates. */}
              {unselectedArchetypes.map((a) => (
                <SelectItem key={a} value={a}>
                  {a}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : (
          // "+" button — icon-only, sized to sit comfortably next to pills.
          // Uses lucide Plus (not a literal "+" character) per spec.
          <Button
            type="button"
            size="icon"
            variant="outline"
            className="h-7 w-7"
            onClick={() => setIsAdding(true)}
            aria-label="Add archetype"
          >
            <Plus className="h-3.5 w-3.5" />
          </Button>
        )
      )}
    </div>
  );
};
