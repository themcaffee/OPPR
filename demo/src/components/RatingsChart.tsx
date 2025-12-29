import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { PlayerResultWithName } from '../utils/calculations';
import { calculateRatingChanges, formatNumber, formatRatingChange } from '../utils/calculations';

interface RatingsChartProps {
  results: PlayerResultWithName[];
  maxPlayers?: number;
}

export function RatingsChart({ results, maxPlayers = 10 }: RatingsChartProps) {
  if (!results || results.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Rating Changes</h2>
        <p className="text-gray-600">Enter tournament results to see rating changes.</p>
      </div>
    );
  }

  const ratingChanges = calculateRatingChanges(results);
  const topResults = results.slice(0, maxPlayers);

  // Prepare chart data
  const chartData = topResults.map((result) => {
    const change = ratingChanges.get(result.player.id);
    return {
      player: result.player.name,
      position: result.position,
      'Old Rating': change?.oldRating || result.player.rating,
      'New Rating': change?.newRating || result.player.rating,
    };
  });

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-gray-900">Rating Changes</h2>
        <p className="text-sm text-gray-600">
          Showing top {topResults.length} players
        </p>
      </div>

      {/* Chart */}
      <div className="mb-6">
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="player"
              angle={-45}
              textAnchor="end"
              height={80}
              interval={0}
            />
            <YAxis
              label={{ value: 'Rating', angle: -90, position: 'insideLeft' }}
              domain={['dataMin - 50', 'dataMax + 50']}
            />
            <Tooltip />
            <Legend />
            <Line
              type="monotone"
              dataKey="Old Rating"
              stroke="#94a3b8"
              strokeWidth={2}
              dot={{ r: 4 }}
            />
            <Line
              type="monotone"
              dataKey="New Rating"
              stroke="#3b82f6"
              strokeWidth={2}
              dot={{ r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                Position
              </th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                Player
              </th>
              <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase">
                Old Rating
              </th>
              <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase">
                New Rating
              </th>
              <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase">
                Change
              </th>
              <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase">
                New RD
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {topResults.map((result, index) => {
              const change = ratingChanges.get(result.player.id);
              if (!change) return null;

              const isPositive = change.change >= 0;

              return (
                <tr
                  key={result.player.id}
                  className={`hover:bg-gray-50 ${
                    index < 3 ? 'bg-yellow-50' : ''
                  }`}
                >
                  <td className="px-3 py-2 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-900">
                        {result.position}
                      </span>
                      {index < 3 && (
                        <span className="text-lg">
                          {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {result.player.name}
                    </div>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-right">
                    <span className="text-sm text-gray-600">
                      {formatNumber(change.oldRating, 0)}
                    </span>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-right">
                    <span className="text-sm font-bold text-gray-900">
                      {formatNumber(change.newRating, 0)}
                    </span>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-right">
                    <span
                      className={`text-sm font-bold ${
                        isPositive ? 'text-green-600' : 'text-red-600'
                      }`}
                    >
                      {formatRatingChange(change.change)}
                    </span>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-right">
                    <span className="text-sm text-gray-600">
                      {formatNumber(change.newRD, 0)}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {results.length > maxPlayers && (
        <div className="mt-4 text-center">
          <p className="text-sm text-gray-500">
            ... and {results.length - maxPlayers} more players
          </p>
        </div>
      )}

      {/* Summary */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-green-50 rounded-lg p-4">
          <p className="text-sm text-green-700">Largest Gain</p>
          <p className="text-2xl font-bold text-green-900">
            {(() => {
              const maxGain = Array.from(ratingChanges.values())
                .sort((a, b) => b.change - a.change)[0];
              return maxGain ? formatRatingChange(maxGain.change) : 'N/A';
            })()}
          </p>
        </div>
        <div className="bg-blue-50 rounded-lg p-4">
          <p className="text-sm text-blue-700">Average Change</p>
          <p className="text-2xl font-bold text-blue-900">
            {(() => {
              const changes = Array.from(ratingChanges.values()).map((c) => c.change);
              const avg = changes.reduce((a, b) => a + b, 0) / changes.length;
              return formatRatingChange(avg);
            })()}
          </p>
        </div>
        <div className="bg-red-50 rounded-lg p-4">
          <p className="text-sm text-red-700">Largest Drop</p>
          <p className="text-2xl font-bold text-red-900">
            {(() => {
              const maxDrop = Array.from(ratingChanges.values())
                .sort((a, b) => a.change - b.change)[0];
              return maxDrop ? formatRatingChange(maxDrop.change) : 'N/A';
            })()}
          </p>
        </div>
      </div>
    </div>
  );
}
