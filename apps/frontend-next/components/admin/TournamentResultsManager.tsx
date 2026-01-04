'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { apiClient } from '@/lib/api-client';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ConfirmDialog } from '@/components/admin/ConfirmDialog';
import { PlayerSelector } from '@/components/admin/PlayerSelector';
import type { TournamentResult, Player } from '@opprs/rest-api-client';
import { formatPlayerName } from '@/lib/utils/player';

interface TournamentResultsManagerProps {
  tournamentId: string;
  tournamentName?: string;
}

interface AddResultForm {
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

  const [addForm, setAddForm] = useState<AddResultForm>({
    playerId: '',
    player: null,
    position: 1,
    optedOut: false,
  });

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

  const handleAddResult = async () => {
    if (!addForm.playerId) return;

    setIsSaving(true);
    try {
      await apiClient.results.create({
        tournamentId,
        playerId: addForm.playerId,
        position: addForm.position,
        optedOut: addForm.optedOut,
      });
      await loadResults();
      setShowAddForm(false);
      setAddForm({ playerId: '', player: null, position: results.length + 1, optedOut: false });
    } catch (error) {
      console.error('Failed to add result:', error);
      alert('Failed to add result. The player may already have a result in this tournament.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleEditResult = async (resultId: string) => {
    setIsSaving(true);
    try {
      await apiClient.results.update(resultId, {
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
      await apiClient.results.delete(deleteResultId);
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
    return formatPlayerName(result.player);
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
        <Button type="button" onClick={() => setShowAddForm(true)} disabled={showAddForm}>
          Add Result
        </Button>
      </div>

      {/* Add Result Form */}
      {showAddForm && (
        <Card>
          <div className="p-4 space-y-4 bg-blue-50 border-l-4 border-blue-500">
            <h4 className="font-medium text-gray-900">Add New Result</h4>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Player</label>
                <PlayerSelector
                  value={addForm.playerId}
                  onChange={(playerId, player) =>
                    setAddForm({ ...addForm, playerId, player })
                  }
                  excludePlayerIds={existingPlayerIds}
                  placeholder="Search for a player..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Position</label>
                <input
                  type="number"
                  value={addForm.position}
                  onChange={(e) => setAddForm({ ...addForm, position: Number(e.target.value) })}
                  min="1"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="addOptedOut"
                checked={addForm.optedOut}
                onChange={(e) => setAddForm({ ...addForm, optedOut: e.target.checked })}
                className="h-4 w-4 rounded border-gray-300"
              />
              <label htmlFor="addOptedOut" className="ml-2 text-sm text-gray-700">
                Opted Out (player will not receive ranking points)
              </label>
            </div>

            <div className="flex justify-end space-x-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowAddForm(false);
                  setAddForm({
                    playerId: '',
                    player: null,
                    position: results.length + 1,
                    optedOut: false,
                  });
                }}
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleAddResult}
                disabled={!addForm.playerId || isSaving}
                isLoading={isSaving}
              >
                Add Result
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
