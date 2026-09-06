// src/components/TransferPortalTracker.tsx
"use client";

import { Pencil, Trash2 } from "lucide-react";
import { type FC, useCallback, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { HeroHeader } from "@/components/ui/HeroHeader";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Table } from "@/components/ui/table";
import { ARCHETYPE_COLORS } from "@/components/ArchetypeSelector";
import {
	getArchetypesForPosition,
	getArchetypeColorIndex,
} from "@/data/recruitingBlueprint";
import useLocalStorage from "@/hooks/useLocalStorage";
import type { Player, Transfer } from "@/types/playerTypes";
import { generalPositions } from "@/types/playerTypes";
import { capitalizeName, formatDisplayName } from "@/utils";
import { fbsTeams } from "@/utils/fbsTeams";
import { setPlayers } from "@/utils/localStorage";
import {
	MESSAGES,
	notifyError,
	notifySuccess,
} from "@/utils/notification-utils";
// --- MODIFICATION START: Import TeamLogo ---
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
import { TeamLogo } from "./ui/TeamLogo";

// --- MODIFICATION END ---

const starOptions = ["5", "4", "3", "2", "1"];

// Column keys the transfer table can be sorted by. Values are the lowercased
// header labels so a single header.toLowerCase() lookup drives both sort + arrow.
type TransferSortField =
	| "stars"
	| "name"
	| "position"
	| "archetype"
	| "direction"
	| "school";

const TransferPortalTracker: FC = () => {
	const [currentYear] = useLocalStorage<number>(
		"currentYear",
		new Date().getFullYear(),
	);
	const [allTransfers, setAllTransfers] = useLocalStorage<Transfer[]>(
		"allTransfers",
		[],
	);
	const [players, setPlayersState] = useLocalStorage<Player[]>("players", []);
	const [newIncomingTransfer, setNewIncomingTransfer] = useState<
		Omit<Transfer, "id" | "transferYear" | "transferDirection">
	>({
		playerName: "",
		position: "",
		archetype: "",
		stars: "",
		school: "",
	});
	const [newOutgoingTransfer, setNewOutgoingTransfer] = useState<{
		playerId: string;
		school: string;
	}>({
		playerId: "",
		school: "",
	});
	const [editingOutgoingTransfer, setEditingOutgoingTransfer] = useState<{
		playerName: string;
		position: string;
		archetype: string;
		stars: string;
		school: string;
	}>({
		playerName: "",
		position: "",
		archetype: "",
		stars: "",
		school: "",
	});
	const [editingId, setEditingId] = useState<number | null>(null);
	const [selectedYear] = useState<number>(currentYear);
	const [sortConfig, setSortConfig] = useState<{
		field: TransferSortField;
		direction: "asc" | "desc";
	}>({ field: "stars", direction: "desc" });

	// Filter transfers to the selected year, then apply the active column sort.
	const transfersForSelectedYear = useMemo(() => {
		const dir = sortConfig.direction === "asc" ? 1 : -1;
		return allTransfers
			.filter((transfer) => transfer.transferYear === selectedYear)
			.sort((a, b) => {
			switch (sortConfig.field) {
				case "stars":
					return (
						dir * ((parseInt(a.stars, 10) || 0) - (parseInt(b.stars, 10) || 0))
					);
				case "name":
					return (
						dir *
						formatDisplayName(a.playerName).localeCompare(
							formatDisplayName(b.playerName),
						)
					);
				case "position":
					return dir * a.position.localeCompare(b.position);
				case "archetype": {
					const aArch = a.archetype || "";
					const bArch = b.archetype || "";
					// Transfers without an archetype always sort to the bottom
					if (!aArch && bArch) return 1;
					if (aArch && !bArch) return -1;
					return dir * aArch.localeCompare(bArch);
				}
				case "direction":
					return dir * a.transferDirection.localeCompare(b.transferDirection);
				case "school":
					return dir * a.school.localeCompare(b.school);
				default:
					return 0;
			}
		});
	}, [selectedYear, sortConfig, allTransfers]);

	const requestSort = useCallback((field: TransferSortField) => {
		setSortConfig((prev) => ({
			field,
			direction:
				prev.field === field && prev.direction === "desc" ? "asc" : "desc",
		}));
	}, []);

	const addIncomingTransfer = () => {
		const transferToAdd = {
			...newIncomingTransfer,
			id: Date.now(),
			transferYear: selectedYear,
			transferDirection: "From" as const,
			playerName: capitalizeName(newIncomingTransfer.playerName),
		};
		setAllTransfers([...allTransfers, transferToAdd]);
		setNewIncomingTransfer({
			playerName: "",
			position: "",
			archetype: "",
			stars: "",
			school: "",
		});
		notifySuccess(MESSAGES.SAVE_SUCCESS);
	};

	const addOutgoingTransfer = () => {
		const selectedPlayer = players.find(
			(p) => p.id.toString() === newOutgoingTransfer.playerId,
		);
		if (!selectedPlayer) {
			notifyError("Please select a player");
			return;
		}

		const transferToAdd: Transfer = {
			id: Date.now(),
			transferYear: selectedYear,
			transferDirection: "To",
			playerName: selectedPlayer.name,
			position: selectedPlayer.position,
			archetype: selectedPlayer.archetype || "",
			stars: selectedPlayer.rating,
			school: newOutgoingTransfer.school,
		};

		// Add to transfers and mark player as transferring (don't remove from roster)
		setAllTransfers([...allTransfers, transferToAdd]);
		const updatedPlayers = players.map((p) =>
			p.id.toString() === newOutgoingTransfer.playerId
				? { ...p, isTransferring: true }
				: p,
		);
		setPlayersState(updatedPlayers);
		setPlayers(updatedPlayers);

		setNewOutgoingTransfer({
			playerId: "",
			school: "",
		});
		notifySuccess(MESSAGES.SAVE_SUCCESS);
	};

	const startEditing = (transfer: Transfer) => {
		setEditingId(transfer.id);
		if (transfer.transferDirection === "From") {
			setNewIncomingTransfer({
				playerName: transfer.playerName,
				position: transfer.position,
				archetype: transfer.archetype || "",
				stars: transfer.stars,
				school: transfer.school,
			});
		} else {
			setEditingOutgoingTransfer({
				playerName: transfer.playerName,
				position: transfer.position,
				archetype: transfer.archetype || "",
				stars: transfer.stars,
				school: transfer.school,
			});
		}
	};

	const saveEdit = () => {
		const transferToEdit = allTransfers.find((t) => t.id === editingId);
		if (!transferToEdit) return;

		if (transferToEdit.transferDirection === "From") {
			setAllTransfers(
				allTransfers.map((transfer) =>
					transfer.id === editingId
						? {
								...transfer,
								playerName: capitalizeName(newIncomingTransfer.playerName),
								position: newIncomingTransfer.position,
								archetype: newIncomingTransfer.archetype,
								stars: newIncomingTransfer.stars,
								school: newIncomingTransfer.school,
							}
						: transfer,
				),
			);
		} else {
			setAllTransfers(
				allTransfers.map((transfer) =>
					transfer.id === editingId
						? {
								...transfer,
								playerName: capitalizeName(editingOutgoingTransfer.playerName),
								position: editingOutgoingTransfer.position,
								archetype: editingOutgoingTransfer.archetype,
								stars: editingOutgoingTransfer.stars,
								school: editingOutgoingTransfer.school,
							}
						: transfer,
				),
			);
		}

		setEditingId(null);
		setNewIncomingTransfer({
			playerName: "",
			position: "",
			archetype: "",
			stars: "",
			school: "",
		});
		setEditingOutgoingTransfer({
			playerName: "",
			position: "",
			archetype: "",
			stars: "",
			school: "",
		});
		notifySuccess(MESSAGES.SAVE_SUCCESS);
	};

	const cancelEdit = () => {
		setEditingId(null);
		setNewIncomingTransfer({
			playerName: "",
			position: "",
			archetype: "",
			stars: "",
			school: "",
		});
		setEditingOutgoingTransfer({
			playerName: "",
			position: "",
			archetype: "",
			stars: "",
			school: "",
		});
	};

	const removeTransfer = (id: number) => {
		const transferToRemove = allTransfers.find((t) => t.id === id);

		// If removing an outgoing transfer, unmark the player as transferring
		if (transferToRemove && transferToRemove.transferDirection === "To") {
			const updatedPlayers = players.map((p) =>
				p.name === transferToRemove.playerName && p.isTransferring
					? { ...p, isTransferring: false }
					: p,
			);
			setPlayersState(updatedPlayers);
			setPlayers(updatedPlayers);
		}

		setAllTransfers(allTransfers.filter((transfer) => transfer.id !== id));
		notifySuccess(MESSAGES.SAVE_SUCCESS);
	};

	return (
		<div className="space-y-8">
			{/* Hero Header */}
			<HeroHeader title="Transfer Portal Tracker" />

			{/* Edit Transfer Form - Conditional based on what's being edited */}
			{editingId &&
				(() => {
					const transferBeingEdited = allTransfers.find(
						(t) => t.id === editingId,
					);
					if (!transferBeingEdited) return null;

					if (transferBeingEdited.transferDirection === "To") {
						return (
							<Card>
								<CardHeader className="text-xl font-semibold">
									<div className="flex justify-between items-center">
										<span>Edit Outgoing Transfer</span>
									</div>
								</CardHeader>
								<CardContent>
									<div className="grid grid-cols-1 md:grid-cols-7 gap-4 mb-4">
										<Input
											value={editingOutgoingTransfer.playerName}
											onChange={(e) =>
												setEditingOutgoingTransfer({
													...editingOutgoingTransfer,
													playerName: e.target.value,
												})
											}
											placeholder="Player Name"
										/>
										<Select
											value={editingOutgoingTransfer.position}
											onValueChange={(value) =>
												setEditingOutgoingTransfer({
													...editingOutgoingTransfer,
													position: value,
													archetype: "",
												})
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
										{(() => {
											const archetypes = getArchetypesForPosition(
												editingOutgoingTransfer.position,
											);
											if (archetypes.length === 0) return null;
											return (
												<Select
													value={editingOutgoingTransfer.archetype}
													onValueChange={(value) =>
														setEditingOutgoingTransfer({
															...editingOutgoingTransfer,
															archetype: value,
														})
													}
												>
													<SelectTrigger>
														<SelectValue placeholder="Archetype" />
													</SelectTrigger>
													<SelectContent>
														{archetypes.map((arch) => (
															<SelectItem key={arch} value={arch}>
																{arch}
															</SelectItem>
														))}
													</SelectContent>
												</Select>
											);
										})()}
										<Select
											value={editingOutgoingTransfer.stars}
											onValueChange={(value) =>
												setEditingOutgoingTransfer({
													...editingOutgoingTransfer,
													stars: value,
												})
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
										<div className="flex items-center justify-center bg-red-50 dark:bg-red-900/20 rounded border px-3">
											<span className="text-red-600 dark:text-red-400 font-medium">
												To
											</span>
										</div>
										<Select
											value={editingOutgoingTransfer.school}
											onValueChange={(value) =>
												setEditingOutgoingTransfer({
													...editingOutgoingTransfer,
													school: value,
												})
											}
										>
											<SelectTrigger>
												<SelectValue placeholder="School" />
											</SelectTrigger>
											<SelectContent>
												{fbsTeams.map((team) => (
													<SelectItem key={team.name} value={team.name}>
														<div className="flex items-center gap-2">
															<TeamLogo teamName={team.name} size="sm" />
															<span>{team.name}</span>
														</div>
													</SelectItem>
												))}
											</SelectContent>
										</Select>
										<div className="flex gap-2">
											<Button onClick={saveEdit} size="sm">
												Save
											</Button>
											<Button onClick={cancelEdit} variant="outline" size="sm">
												Cancel
											</Button>
										</div>
									</div>
								</CardContent>
							</Card>
						);
					}
					return null;
				})()}

			{/* Incoming Transfers Form - Only show when not editing outgoing transfer */}
			{(!editingId ||
				(() => {
					const transferBeingEdited = allTransfers.find(
						(t) => t.id === editingId,
					);
					return transferBeingEdited?.transferDirection === "From";
				})()) && (
				<Card>
					<CardHeader className="text-xl font-semibold">
						<div className="flex justify-between items-center">
							<span>
								{editingId
									? "Edit Incoming Transfer"
									: `Add Incoming Transfer for Year: ${selectedYear}`}
							</span>
						</div>
					</CardHeader>
					<CardContent>
						<div className="grid grid-cols-1 md:grid-cols-7 gap-4 mb-4">
							<Input
								value={newIncomingTransfer.playerName}
								onChange={(e) =>
									setNewIncomingTransfer({
										...newIncomingTransfer,
										playerName: e.target.value,
									})
								}
								placeholder="Player Name"
							/>
							<Select
								value={newIncomingTransfer.position}
								onValueChange={(value) =>
									setNewIncomingTransfer({
										...newIncomingTransfer,
										position: value,
										archetype: "",
									})
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
							{(() => {
								const archetypes = getArchetypesForPosition(
									newIncomingTransfer.position,
								);
								if (archetypes.length === 0) return null;
								return (
									<Select
										value={newIncomingTransfer.archetype}
										onValueChange={(value) =>
											setNewIncomingTransfer({
												...newIncomingTransfer,
												archetype: value,
											})
										}
									>
										<SelectTrigger>
											<SelectValue placeholder="Archetype" />
										</SelectTrigger>
										<SelectContent>
											{archetypes.map((arch) => (
												<SelectItem key={arch} value={arch}>
													{arch}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								);
							})()}
							<Select
								value={newIncomingTransfer.stars}
								onValueChange={(value) =>
									setNewIncomingTransfer({
										...newIncomingTransfer,
										stars: value,
									})
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
							<div className="flex items-center justify-center bg-green-50 dark:bg-green-900/20 rounded border px-3">
								<span className="text-green-600 dark:text-green-400 font-medium">
									From
								</span>
							</div>
							<Select
								value={newIncomingTransfer.school}
								onValueChange={(value) =>
									setNewIncomingTransfer({
										...newIncomingTransfer,
										school: value,
									})
								}
							>
								<SelectTrigger>
									<SelectValue placeholder="School" />
								</SelectTrigger>
								<SelectContent>
									{fbsTeams.map((team) => (
										<SelectItem key={team.name} value={team.name}>
											<div className="flex items-center gap-2">
												<TeamLogo teamName={team.name} size="sm" />
												<span>{team.name}</span>
											</div>
										</SelectItem>
									))}
								</SelectContent>
							</Select>
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
								<Button onClick={addIncomingTransfer}>Add Transfer</Button>
							)}
						</div>
					</CardContent>
				</Card>
			)}

			{/* Outgoing Transfers Form */}
			<Card>
				<CardHeader className="text-xl font-semibold">
					<div className="flex justify-between items-center">
						<span>Add Outgoing Transfer for Year: {selectedYear}</span>
					</div>
				</CardHeader>
				<CardContent>
					<div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
						<Select
							value={newOutgoingTransfer.playerId}
							onValueChange={(value) =>
								setNewOutgoingTransfer({
									...newOutgoingTransfer,
									playerId: value,
								})
							}
						>
							<SelectTrigger>
								<SelectValue placeholder="Select Player" />
							</SelectTrigger>
							<SelectContent>
								{players
									.filter(
										(player) => !player.isTransferring && !player.isDrafted,
									)
									.map((player) => (
										<SelectItem key={player.id} value={player.id.toString()}>
											{formatDisplayName(player.name)} - {player.position} (
											{player.rating}⭐)
										</SelectItem>
									))}
							</SelectContent>
						</Select>
						<div className="flex items-center justify-center bg-red-50 dark:bg-red-900/20 rounded border px-3">
							<span className="text-red-600 dark:text-red-400 font-medium">
								To
							</span>
						</div>
						<Select
							value={newOutgoingTransfer.school}
							onValueChange={(value) =>
								setNewOutgoingTransfer({
									...newOutgoingTransfer,
									school: value,
								})
							}
						>
							<SelectTrigger>
								<SelectValue placeholder="School" />
							</SelectTrigger>
							<SelectContent>
								{fbsTeams.map((team) => (
									<SelectItem key={team.name} value={team.name}>
										<div className="flex items-center gap-2">
											<TeamLogo teamName={team.name} size="sm" />
											<span>{team.name}</span>
										</div>
									</SelectItem>
								))}
							</SelectContent>
						</Select>
						<Button onClick={addOutgoingTransfer}>Add Transfer</Button>
					</div>
				</CardContent>
			</Card>

			<Card>
				<CardHeader className="text-xl font-semibold">
					<div className="flex justify-between items-center">
						<span>Transfer Portal for {selectedYear}</span>
						<div className="text-sm text-gray-600 dark:text-gray-400">
							Click a column header to sort
						</div>
					</div>
				</CardHeader>
				<CardContent>
					<Table>
						<thead>
							<tr>
								{[
									"Stars",
									"Name",
									"Position",
									"Archetype",
									"Direction",
									"School",
									"Actions",
								].map((header) => (
									<th
										key={header}
										className={
											header === "Actions"
												? "text-center"
												: "text-center cursor-pointer select-none"
										}
										onClick={() =>
											header !== "Actions" &&
											requestSort(header.toLowerCase() as TransferSortField)
										}
									>
										<div className="flex items-center justify-center gap-1">
											{header}
											{header !== "Actions" &&
												sortConfig.field === header.toLowerCase() &&
												(sortConfig.direction === "asc" ? " ▲" : " ▼")}
										</div>
									</th>
								))}
							</tr>
						</thead>
						<tbody>
							{transfersForSelectedYear.map((transfer) => (
								<tr key={transfer.id}>
									<td className="text-center">{transfer.stars} ⭐</td>
									<td className="text-center">
										{formatDisplayName(transfer.playerName)}
									</td>
									<td className="text-center">{transfer.position}</td>
									<td className="text-center">
										{transfer.archetype
											? (() => {
													const colorIdx = getArchetypeColorIndex(
														transfer.position,
														transfer.archetype,
													);
													const color =
														ARCHETYPE_COLORS[
															colorIdx % ARCHETYPE_COLORS.length
														];
													return (
														<span
															className={`inline-flex items-center rounded-md px-2.5 py-1 text-xs font-medium border ${color.bg} ${color.text} ${color.border}`}
														>
															{transfer.archetype}
														</span>
													);
												})()
											: "—"}
									</td>
									<td className="text-center">
										<span
											className={`font-medium ${
												transfer.transferDirection === "From"
													? "text-green-600 dark:text-green-500"
													: "text-red-600 dark:text-red-500"
											}`}
										>
											{transfer.transferDirection}
										</span>
									</td>
									{/* --- MODIFICATION START: Add TeamLogo --- */}
									<td className="text-center">
										<div className="flex items-center justify-center gap-2">
											<TeamLogo teamName={transfer.school} size="sm" />
											<span>{transfer.school}</span>
										</div>
									</td>
									{/* --- MODIFICATION END --- */}
									<td className="text-center">
										<div className="flex items-center gap-1 justify-center">
											<Button
												variant="ghost"
												size="icon"
												onClick={() => startEditing(transfer)}
												title="Edit"
											>
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
															{formatDisplayName(transfer.playerName)}?
															{transfer.transferDirection === "To" &&
																" This will restore them to your roster."}
														</AlertDialogDescription>
													</AlertDialogHeader>
													<AlertDialogFooter>
														<AlertDialogCancel>Cancel</AlertDialogCancel>
														<AlertDialogAction
															onClick={() => removeTransfer(transfer.id)}
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

export default TransferPortalTracker;
