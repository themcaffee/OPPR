import { useEffect, useRef } from 'react';
import type { PlayerWithName, PlayerResultWithName } from '../utils/calculations';
import { getPlayerRating } from '../utils/calculations';

interface ResultsInputProps {
  players: PlayerWithName[];
  results: PlayerResultWithName[];
  onResultsChange: (results: PlayerResultWithName[]) => void;
}

export function ResultsInput({ players, results, onResultsChange }: ResultsInputProps) {
  const onResultsChangeRef = useRef(onResultsChange);

  // Keep ref updated
  useEffect(() => {
    onResultsChangeRef.current = onResultsChange;
  }, [onResultsChange]);

  // Initialize results when players change
  useEffect(() => {
    if (players.length > 0 && (results.length === 0 || results.length !== players.length)) {
      const initialResults: PlayerResultWithName[] = players.map((player, index) => ({
        player,
        position: index + 1,
      }));
      onResultsChangeRef.current(initialResults);
    }
  }, [players, results.length]);

  // Sync player data in results when player properties change
  useEffect(() => {
    if (results.length === 0) return;

    const updatedResults = results.map((result) => {
      const currentPlayer = players.find((p) => p.id === result.player.id);
      return currentPlayer ? { ...result, player: currentPlayer } : result;
    });

    // Only update if there are actual changes to avoid infinite loops
    const hasChanges = updatedResults.some(
      (result, idx) => result.player !== results[idx]?.player
    );

    if (hasChanges) {
      onResultsChangeRef.current(updatedResults);
    }
  }, [players, results]);

  const handlePositionChange = (playerId: string, newPosition: number) => {
    // Find the player with this position
    const updatedResults = results.map((result) => {
      if (result.player.id === playerId) {
        return { ...result, position: newPosition };
      }
      return result;
    });

    // Sort by position and reassign to avoid duplicates
    updatedResults.sort((a, b) => a.position - b.position);

    // Reassign positions sequentially
    const finalResults = updatedResults.map((result, index) => ({
      ...result,
      position: index + 1,
    }));

    onResultsChange(finalResults);
  };

  const movePlayer = (playerId: string, direction: 'up' | 'down') => {
    const currentIndex = results.findIndex((r) => r.player.id === playerId);
    if (currentIndex === -1) return;

    const newResults = [...results];
    if (direction === 'up' && currentIndex > 0) {
      // Swap with previous
      [newResults[currentIndex - 1], newResults[currentIndex]] = [
        newResults[currentIndex],
        newResults[currentIndex - 1],
      ];
    } else if (direction === 'down' && currentIndex < results.length - 1) {
      // Swap with next
      [newResults[currentIndex], newResults[currentIndex + 1]] = [
        newResults[currentIndex + 1],
        newResults[currentIndex],
      ];
    }

    // Reassign positions
    const finalResults = newResults.map((result, index) => ({
      ...result,
      position: index + 1,
    }));

    onResultsChange(finalResults);
  };

  const randomizeResults = () => {
    const shuffled = [...results].sort(() => Math.random() - 0.5);
    const finalResults = shuffled.map((result, index) => ({
      ...result,
      position: index + 1,
    }));
    onResultsChange(finalResults);
  };

  const sortByRating = () => {
    const sorted = [...results].sort((a, b) => getPlayerRating(b.player) - getPlayerRating(a.player));
    const finalResults = sorted.map((result, index) => ({
      ...result,
      position: index + 1,
    }));
    onResultsChange(finalResults);
  };

  if (results.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Tournament Results</h2>
        <p className="text-gray-600">Add players to set tournament results.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-gray-900">Tournament Results</h2>
        <div className="flex gap-2">
          <button
            onClick={sortByRating}
            className="px-3 py-1 text-sm bg-purple-100 text-purple-700 rounded hover:bg-purple-200"
          >
            Sort by Rating
          </button>
          <button
            onClick={randomizeResults}
            className="px-3 py-1 text-sm bg-green-100 text-green-700 rounded hover:bg-green-200"
          >
            Randomize
          </button>
        </div>
      </div>

      <div className="overflow-x-auto max-h-96 overflow-y-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50 sticky top-0">
            <tr>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                Position
              </th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                Player
              </th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                Rating
              </th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                Ranking
              </th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {results.map((result, index) => (
              <tr
                key={result.player.id}
                className={`hover:bg-gray-50 ${
                  index < 3 ? 'bg-yellow-50' : index < 10 ? 'bg-blue-50' : ''
                }`}
              >
                <td className="px-3 py-2 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={result.position}
                      onChange={(e) => handlePositionChange(result.player.id, Number(e.target.value))}
                      min="1"
                      max={results.length}
                      className="w-16 px-2 py-1 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    {index < 3 && (
                      <span className="text-xl">
                        {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-3 py-2 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{result.player.name}</div>
                </td>
                <td className="px-3 py-2 whitespace-nowrap">
                  <div className="text-sm text-gray-600">{getPlayerRating(result.player)}</div>
                </td>
                <td className="px-3 py-2 whitespace-nowrap">
                  <div className="text-sm text-gray-600">#{result.player.ranking}</div>
                </td>
                <td className="px-3 py-2 whitespace-nowrap">
                  <div className="flex gap-1">
                    <button
                      onClick={() => movePlayer(result.player.id, 'up')}
                      disabled={index === 0}
                      className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      ↑
                    </button>
                    <button
                      onClick={() => movePlayer(result.player.id, 'down')}
                      disabled={index === results.length - 1}
                      className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      ↓
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4">
        <p className="text-sm text-gray-600">
          Showing results for {results.length} players. Use arrows or enter position number to
          adjust rankings.
        </p>
      </div>
    </div>
  );
}
