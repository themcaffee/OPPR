import type { PlayerWithName } from '../utils/calculations';
import { exampleTournaments, generatePlayerNames } from '../data/examples';

interface PlayerInputProps {
  players: PlayerWithName[];
  onPlayersChange: (players: PlayerWithName[]) => void;
}

export function PlayerInput({ players, onPlayersChange }: PlayerInputProps) {

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

  const handleUpdatePlayer = (id: string, field: keyof PlayerWithName, value: any) => {
    onPlayersChange(
      players.map((p) =>
        p.id === id
          ? {
              ...p,
              [field]: value,
              // Auto-update isRated based on eventCount
              ...(field === 'eventCount' ? { isRated: value >= 5 } : {}),
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
        </div>
      </div>

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
