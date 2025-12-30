import { useState } from 'react';
import type { PlayerWithName } from '../utils/calculations';
import { exampleTournaments, generatePlayerNames } from '../data/examples';
import { parsePlayerCSV, ValidationError } from '@oppr/core';

interface PlayerInputProps {
  players: PlayerWithName[];
  onPlayersChange: (players: PlayerWithName[]) => void;
}

export function PlayerInput({ players, onPlayersChange }: PlayerInputProps) {
  const [showImportCSV, setShowImportCSV] = useState(false);
  const [csvText, setCsvText] = useState('');
  const [useRankingData, setUseRankingData] = useState(true);

  const handleAddPlayer = () => {
    const newId = String(players.length + 1);
    const newPlayer: PlayerWithName = {
      id: newId,
      name: `Player ${newId}`,
      rating: 1300,
      ranking: 1000,
      isRated: false,
      ratingDeviation: 200,
      eventCount: 0,
    };
    onPlayersChange([...players, newPlayer]);
  };

  const handleRemovePlayer = (id: string) => {
    onPlayersChange(players.filter((p) => p.id !== id));
  };

  const handleUpdatePlayer = (id: string, field: keyof PlayerWithName, value: string | number | boolean) => {
    onPlayersChange(
      players.map((p) =>
        p.id === id
          ? {
              ...p,
              [field]: value,
              // Auto-update isRated based on eventCount
              ...(field === 'eventCount' ? { isRated: (value as number) >= 5 } : {}),
            }
          : p
      )
    );
  };

  const loadExample = (type: 'local' | 'regional' | 'major') => {
    const example = exampleTournaments[type];
    const names = generatePlayerNames(example.players.length);
    const playersWithNames: PlayerWithName[] = example.players.map((p, i) => ({
      ...p,
      name: names[i],
    }));
    onPlayersChange(playersWithNames);
  };

  const handleImportCSV = () => {
    if (!csvText.trim()) {
      alert('Please paste CSV data into the text area');
      return;
    }

    try {
      const parsedPlayers = parsePlayerCSV(csvText, { useRankingData });
      const playersWithNames: PlayerWithName[] = parsedPlayers.map((p) => ({
        ...p.player,
        name: p.name,
      }));
      onPlayersChange(playersWithNames);

      // Clear and hide the import UI after successful import
      setCsvText('');
      setShowImportCSV(false);
    } catch (error) {
      if (error instanceof ValidationError) {
        alert(`Import failed: ${error.message}`);
      } else {
        alert(`Import failed: ${error instanceof Error ? error.message : String(error)}`);
      }
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-gray-900">Players</h2>
        <div className="flex gap-2">
          <button
            onClick={() => loadExample('local')}
            className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
          >
            Load Local (20)
          </button>
          <button
            onClick={() => loadExample('regional')}
            className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
          >
            Load Regional (60)
          </button>
          <button
            onClick={() => loadExample('major')}
            className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
          >
            Load Major (400)
          </button>
          <button
            onClick={() => setShowImportCSV(!showImportCSV)}
            className={`px-3 py-1 text-sm rounded ${
              showImportCSV
                ? 'bg-green-100 text-green-700 hover:bg-green-200'
                : 'bg-purple-100 text-purple-700 hover:bg-purple-200'
            }`}
          >
            {showImportCSV ? 'Hide Import' : 'Import from CSV'}
          </button>
        </div>
      </div>

      {showImportCSV && (
        <div className="mb-4 p-4 bg-gray-50 rounded border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Import Player Data from CSV</h3>
          <p className="text-sm text-gray-600 mb-3">
            Paste CSV data with columns: Name, ID, Rank, Rating (first line will be skipped as header)
          </p>
          <textarea
            value={csvText}
            onChange={(e) => setCsvText(e.target.value)}
            placeholder="Paste CSV data here..."
            className="w-full h-32 px-3 py-2 text-sm font-mono border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          <div className="mt-3 flex items-center justify-between">
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={useRankingData}
                onChange={(e) => setUseRankingData(e.target.checked)}
                className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
              />
              Use ranking and rating from CSV
            </label>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setCsvText('');
                  setShowImportCSV(false);
                }}
                className="px-4 py-2 text-sm bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleImportCSV}
                className="px-4 py-2 text-sm bg-purple-600 text-white rounded hover:bg-purple-700"
              >
                Parse and Import
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="overflow-x-auto max-h-96 overflow-y-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50 sticky top-0">
            <tr>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                Name
              </th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                Rating
              </th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                Ranking
              </th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                Events
              </th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                RD
              </th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                Rated
              </th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {players.map((player) => (
              <tr key={player.id} className="hover:bg-gray-50">
                <td className="px-3 py-2 whitespace-nowrap">
                  <input
                    type="text"
                    value={player.name}
                    onChange={(e) => handleUpdatePlayer(player.id, 'name', e.target.value)}
                    className="w-full px-2 py-1 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </td>
                <td className="px-3 py-2 whitespace-nowrap">
                  <input
                    type="number"
                    value={player.rating}
                    onChange={(e) =>
                      handleUpdatePlayer(player.id, 'rating', Number(e.target.value))
                    }
                    className="w-20 px-2 py-1 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </td>
                <td className="px-3 py-2 whitespace-nowrap">
                  <input
                    type="number"
                    value={player.ranking}
                    onChange={(e) =>
                      handleUpdatePlayer(player.id, 'ranking', Number(e.target.value))
                    }
                    className="w-20 px-2 py-1 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </td>
                <td className="px-3 py-2 whitespace-nowrap">
                  <input
                    type="number"
                    value={player.eventCount || 0}
                    onChange={(e) =>
                      handleUpdatePlayer(player.id, 'eventCount', Number(e.target.value))
                    }
                    className="w-16 px-2 py-1 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </td>
                <td className="px-3 py-2 whitespace-nowrap">
                  <input
                    type="number"
                    value={player.ratingDeviation || 100}
                    onChange={(e) =>
                      handleUpdatePlayer(player.id, 'ratingDeviation', Number(e.target.value))
                    }
                    className="w-16 px-2 py-1 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </td>
                <td className="px-3 py-2 whitespace-nowrap text-center">
                  <span
                    className={`inline-block w-3 h-3 rounded-full ${
                      player.isRated ? 'bg-green-500' : 'bg-gray-300'
                    }`}
                  />
                </td>
                <td className="px-3 py-2 whitespace-nowrap">
                  <button
                    onClick={() => handleRemovePlayer(player.id)}
                    className="text-red-600 hover:text-red-800 text-sm"
                  >
                    Remove
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex justify-between items-center">
        <button
          onClick={handleAddPlayer}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Add Player
        </button>
        <p className="text-sm text-gray-600">
          Total: {players.length} players ({players.filter((p) => p.isRated).length} rated)
        </p>
      </div>
    </div>
  );
}
