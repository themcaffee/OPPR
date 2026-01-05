'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { apiClient } from '@/lib/api-client';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ConfirmDialog } from '@/components/admin/ConfirmDialog';
import { PlayerSelector } from '@/components/admin/PlayerSelector';
import type { TournamentResult, Player } from '@opprs/rest-api-client';

interface TournamentResultsManagerProps {
  tournamentId: string;
  tournamentName?: string;
}

interface ResultRowForm {
  id: string;
  playerId: string;
  player: Player | null;
  position: number;
  optedOut: boolean;
}

export function TournamentResultsManager({
  tournamentId,
  tournamentName,
}: TournamentResultsManagerProps) {
  const [results, setResults] = useState<TournamentResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingResultId, setEditingResultId] = useState<string | null>(null);
  const [deleteResultId, setDeleteResultId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [formRows, setFormRows] = useState<ResultRowForm[]>([]);

  const [editForm, setEditForm] = useState<{ position: number; optedOut: boolean }>({
    position: 1,
    optedOut: false,
  });

  const loadResults = useCallback(async () => {
    setIsLoading(true);
    try {
      const tournamentResults = await apiClient.tournaments.getResults(tournamentId);
      // Sort by position
      const sorted = [...tournamentResults].sort((a, b) => a.position - b.position);
      setResults(sorted);
    } catch (error) {
      console.error('Failed to load results:', error);
    } finally {
      setIsLoading(false);
    }
  }, [tournamentId]);

  useEffect(() => {
    loadResults();
  }, [loadResults]);

  // Helper functions for multi-row form
  const createNewRow = useCallback(
    (position: number): ResultRowForm => ({
      id: crypto.randomUUID(),
      playerId: '',
      player: null,
      position,
      optedOut: false,
    }),
    []
  );

  const initializeFormRows = useCallback(() => {
    const nextPosition = results.length + 1;
    setFormRows([createNewRow(nextPosition)]);
  }, [results.length, createNewRow]);

  const addFormRow = useCallback(() => {
    setFormRows((prev) => {
      const lastPosition = prev.length > 0 ? Math.max(...prev.map((r) => r.position)) : results.length;
      return [...prev, createNewRow(lastPosition + 1)];
    });
  }, [createNewRow, results.length]);

  const removeFormRow = useCallback((id: string) => {
    setFormRows((prev) => {
      const filtered = prev.filter((r) => r.id !== id);
      // Renumber positions to fill gaps
      return filtered.map((row, idx) => ({
        ...row,
        position: results.length + 1 + idx,
      }));
    });
  }, [results.length]);

  const updateFormRow = useCallback((id: string, updates: Partial<ResultRowForm>) => {
    setFormRows((prev) => prev.map((row) => (row.id === id ? { ...row, ...updates } : row)));
  }, []);

  // Validation logic
  const formValidation = useMemo(() => {
    const positionsInForm = formRows.map((r) => r.position);
    const existingPositions = results.map((r) => r.position);

    // Find duplicates within the form
    const duplicatesInForm = positionsInForm.filter(
      (pos, idx) => positionsInForm.indexOf(pos) !== idx
    );

    // Find conflicts with existing results
    const conflictsWithExisting = positionsInForm.filter((pos) => existingPositions.includes(pos));

    const allPlayersSelected = formRows.length > 0 && formRows.every((r) => r.playerId);

    return {
      isValid:
        duplicatesInForm.length === 0 && conflictsWithExisting.length === 0 && allPlayersSelected,
      duplicatesInForm: [...new Set(duplicatesInForm)],
      conflictsWithExisting: [...new Set(conflictsWithExisting)],
      allPlayersSelected,
    };
  }, [formRows, results]);

  const getPositionError = useCallback(
    (position: number, rowId: string): string | null => {
      // Check if this position conflicts with existing results
      if (formValidation.conflictsWithExisting.includes(position)) {
        return 'Position already exists';
      }
      // Check if this position is duplicated in the form (only show error on second+ occurrence)
      const rowsWithPosition = formRows.filter((r) => r.position === position);
      if (rowsWithPosition.length > 1 && rowsWithPosition[0].id !== rowId) {
        return 'Duplicate position';
      }
      return null;
    },
    [formRows, formValidation.conflictsWithExisting]
  );

  const handleAddResults = async () => {
    if (!formValidation.isValid) return;

    setIsSaving(true);
    try {
      const requests = formRows.map((row) => ({
        tournamentId,
        playerId: row.playerId,
        position: row.position,
        optedOut: row.optedOut,
      }));

      await apiClient.standings.createBatch(requests);
      await loadResults();
      setShowAddForm(false);
      setFormRows([]);
    } catch (error) {
      console.error('Failed to add results:', error);
      alert('Failed to add results. Check for duplicate positions or players.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleEditResult = async (resultId: string) => {
    setIsSaving(true);
    try {
      await apiClient.standings.update(resultId, {
        position: editForm.position,
        optedOut: editForm.optedOut,
      });
      await loadResults();
      setEditingResultId(null);
    } catch (error) {
      console.error('Failed to update result:', error);
      alert('Failed to update result.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteResult = async () => {
    if (!deleteResultId) return;

    setIsDeleting(true);
    try {
      await apiClient.standings.delete(deleteResultId);
      await loadResults();
      setDeleteResultId(null);
    } catch (error) {
      console.error('Failed to delete result:', error);
      alert('Failed to delete result.');
    } finally {
      setIsDeleting(false);
    }
  };

  const startEditing = (result: TournamentResult) => {
    setEditingResultId(result.id);
    setEditForm({
      position: result.position,
      optedOut: result.optedOut,
    });
  };

  const existingPlayerIds = results.map((r) => r.player.id);

  const getPlayerDisplayName = (result: TournamentResult) => {
    return result.player.name || result.player.id;
  };

  if (isLoading) {
    return (
      <Card>
        <div className="p-6 text-center text-gray-500">Loading results...</div>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900">
          Tournament Results
          {tournamentName && <span className="text-gray-500 font-normal"> - {tournamentName}</span>}
        </h3>
        <Button
          type="button"
          onClick={() => {
            initializeFormRows();
            setShowAddForm(true);
          }}
          disabled={showAddForm}
        >
          Add Results
        </Button>
      </div>

      {/* Add Results Form */}
      {showAddForm && (
        <Card>
          <div className="p-4 space-y-4 bg-blue-50 border-l-4 border-blue-500">
            <h4 className="font-medium text-gray-900">Add Results</h4>

            {/* Validation error banner */}
            {!formValidation.isValid && formRows.length > 0 && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-700">
                {formValidation.duplicatesInForm.length > 0 && (
                  <p>Duplicate positions in form: {formValidation.duplicatesInForm.join(', ')}</p>
                )}
                {formValidation.conflictsWithExisting.length > 0 && (
                  <p>
                    Positions already exist: {formValidation.conflictsWithExisting.join(', ')}
                  </p>
                )}
                {!formValidation.allPlayersSelected && <p>All rows must have a player selected</p>}
              </div>
            )}

            {/* Form rows */}
            <div className="space-y-3">
              {formRows.map((row, index) => {
                const positionError = getPositionError(row.position, row.id);
                // Exclude other selected players from this row's selector
                const excludeForThisRow = [
                  ...existingPlayerIds,
                  ...formRows.filter((r) => r.id !== row.id && r.playerId).map((r) => r.playerId),
                ];

                return (
                  <div
                    key={row.id}
                    className="grid grid-cols-1 md:grid-cols-12 gap-3 items-start p-3 bg-white rounded-md border border-gray-200"
                  >
                    {/* Row number */}
                    <div className="md:col-span-1 flex items-center justify-center text-sm font-medium text-gray-500 pt-2">
                      #{index + 1}
                    </div>

                    {/* Player selector */}
                    <div className="md:col-span-5">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Player</label>
                      <PlayerSelector
                        value={row.playerId}
                        onChange={(playerId, player) =>
                          updateFormRow(row.id, { playerId, player })
                        }
                        excludePlayerIds={excludeForThisRow}
                        placeholder="Search for a player..."
                      />
                    </div>

                    {/* Position */}
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Position
                      </label>
                      <input
                        type="number"
                        value={row.position}
                        onChange={(e) =>
                          updateFormRow(row.id, { position: Number(e.target.value) })
                        }
                        min="1"
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          positionError
                            ? 'border-red-500 bg-red-50'
                            : 'border-gray-300'
                        }`}
                      />
                      {positionError && (
                        <p className="mt-1 text-xs text-red-600">{positionError}</p>
                      )}
                    </div>

                    {/* Opted out */}
                    <div className="md:col-span-3 flex items-center pt-6">
                      <input
                        type="checkbox"
                        id={`optedOut-${row.id}`}
                        checked={row.optedOut}
                        onChange={(e) => updateFormRow(row.id, { optedOut: e.target.checked })}
                        className="h-4 w-4 rounded border-gray-300"
                      />
                      <label
                        htmlFor={`optedOut-${row.id}`}
                        className="ml-2 text-sm text-gray-700"
                      >
                        Opted Out
                      </label>
                    </div>

                    {/* Remove button */}
                    <div className="md:col-span-1 flex items-center justify-center pt-6">
                      {formRows.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeFormRow(row.id)}
                          className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                          title="Remove row"
                        >
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M6 18L18 6M6 6l12 12"
                            />
                          </svg>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Add another player button */}
            <button
              type="button"
              onClick={addFormRow}
              className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Add Another Player
            </button>

            {/* Form actions */}
            <div className="flex justify-end space-x-3 pt-2 border-t border-gray-200">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowAddForm(false);
                  setFormRows([]);
                }}
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleAddResults}
                disabled={!formValidation.isValid || isSaving}
                isLoading={isSaving}
              >
                Add {formRows.length} Result{formRows.length !== 1 ? 's' : ''}
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Results Table */}
      <Card>
        {results.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            No results yet. Click &quot;Add Result&quot; to add players to this tournament.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Pos
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Player
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Points
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {results.map((result) => (
                  <tr key={result.id} className="hover:bg-gray-50">
                    {editingResultId === result.id ? (
                      <>
                        <td className="px-4 py-3">
                          <input
                            type="number"
                            value={editForm.position}
                            onChange={(e) =>
                              setEditForm({ ...editForm, position: Number(e.target.value) })
                            }
                            min="1"
                            className="w-16 px-2 py-1 border border-gray-300 rounded-md text-sm"
                          />
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900">
                          {getPlayerDisplayName(result)}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-500">
                          {result.totalPoints?.toFixed(2) || '-'}
                        </td>
                        <td className="px-4 py-3">
                          <label className="flex items-center">
                            <input
                              type="checkbox"
                              checked={editForm.optedOut}
                              onChange={(e) =>
                                setEditForm({ ...editForm, optedOut: e.target.checked })
                              }
                              className="h-4 w-4 rounded border-gray-300"
                            />
                            <span className="ml-2 text-sm text-gray-700">Opted Out</span>
                          </label>
                        </td>
                        <td className="px-4 py-3 text-right space-x-2">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => setEditingResultId(null)}
                            className="text-xs px-2 py-1"
                          >
                            Cancel
                          </Button>
                          <Button
                            type="button"
                            onClick={() => handleEditResult(result.id)}
                            isLoading={isSaving}
                            className="text-xs px-2 py-1"
                          >
                            Save
                          </Button>
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">
                          {result.position === 1 && '🥇 '}
                          {result.position === 2 && '🥈 '}
                          {result.position === 3 && '🥉 '}
                          {result.position}
                        </td>
                        <td className="px-4 py-3">
                          <Link
                            href={`/players/${result.player.id}`}
                            className="text-sm font-medium text-gray-900 hover:text-blue-600"
                          >
                            {getPlayerDisplayName(result)}
                          </Link>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-500">
                          {result.totalPoints?.toFixed(2) || '-'}
                          {result.decayedPoints !== null &&
                            result.decayedPoints !== result.totalPoints && (
                              <span className="text-xs text-gray-400 ml-1">
                                ({result.decayedPoints?.toFixed(2)} decayed)
                              </span>
                            )}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          {result.optedOut ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                              Opted Out
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                              Active
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right space-x-2">
                          <button
                            type="button"
                            onClick={() => startEditing(result)}
                            className="text-blue-600 hover:text-blue-800 text-sm"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteResultId(result.id)}
                            className="text-red-600 hover:text-red-800 text-sm"
                          >
                            Delete
                          </button>
                        </td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Summary */}
      {results.length > 0 && (
        <div className="text-sm text-gray-500">
          Total: {results.length} players | Active: {results.filter((r) => !r.optedOut).length} |
          Opted Out: {results.filter((r) => r.optedOut).length}
        </div>
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deleteResultId}
        onClose={() => setDeleteResultId(null)}
        onConfirm={handleDeleteResult}
        title="Delete Result"
        message="Are you sure you want to delete this result? This action cannot be undone."
        confirmLabel="Delete"
        isLoading={isDeleting}
      />
    </div>
  );
}
