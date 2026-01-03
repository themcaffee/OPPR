import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { TournamentCalculation, PlayerWithName } from '../utils/calculations';
import { formatNumber, calculatePointsPercentage, getPlayerRating } from '../utils/calculations';

interface PointsDistributionProps {
  calculation: TournamentCalculation | null;
  showChart?: boolean;
  maxRows?: number;
}

export function PointsDistribution({
  calculation,
  showChart = true,
  maxRows = 20,
}: PointsDistributionProps) {
  if (!calculation || !calculation.distributions || calculation.distributions.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Points Distribution</h2>
        <p className="text-gray-600">Enter tournament results to see point distribution.</p>
      </div>
    );
  }

  const { distributions, firstPlaceValue } = calculation;
  const displayDistributions = distributions.slice(0, maxRows);

  // Prepare chart data
  const chartData = displayDistributions.map((d) => ({
    position: `${d.position}`,
    name: (d.player as PlayerWithName).name,
    Linear: Number(formatNumber(d.linearPoints, 2)),
    Dynamic: Number(formatNumber(d.dynamicPoints, 2)),
    Total: Number(formatNumber(d.totalPoints, 2)),
  }));

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-gray-900">Points Distribution</h2>
        <p className="text-sm text-gray-600">
          Showing top {displayDistributions.length} of {distributions.length} players
        </p>
      </div>

      {/* Chart */}
      {showChart && (
        <div className="mb-6">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="position" label={{ value: 'Position', position: 'insideBottom', offset: -5 }} />
              <YAxis label={{ value: 'Points', angle: -90, position: 'insideLeft' }} />
              <Tooltip />
              <Legend />
              <Bar dataKey="Linear" stackId="a" fill="#60a5fa" />
              <Bar dataKey="Dynamic" stackId="a" fill="#a78bfa" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

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
                Linear (10%)
              </th>
              <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase">
                Dynamic (90%)
              </th>
              <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase">
                Total Points
              </th>
              <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase">
                % of 1st
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {displayDistributions.map((distribution, index) => {
              const percentage = calculatePointsPercentage(
                distribution.totalPoints,
                firstPlaceValue
              );

              return (
                <tr
                  key={distribution.player.id}
                  className={`hover:bg-gray-50 ${
                    index < 3 ? 'bg-yellow-50' : index < 10 ? 'bg-blue-50' : ''
                  }`}
                >
                  <td className="px-3 py-2 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-900">
                        {distribution.position}
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
                      {(distribution.player as PlayerWithName).name}
                    </div>
                    <div className="text-xs text-gray-500">
                      Rating: {getPlayerRating(distribution.player)} | Rank: #{distribution.player.ranking}
                    </div>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-right">
                    <span className="text-sm text-blue-600">
                      {formatNumber(distribution.linearPoints)}
                    </span>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-right">
                    <span className="text-sm text-purple-600">
                      {formatNumber(distribution.dynamicPoints)}
                    </span>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-right">
                    <span className="text-sm font-bold text-gray-900">
                      {formatNumber(distribution.totalPoints)}
                    </span>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-right">
                    <span className="text-sm text-gray-600">{formatNumber(percentage)}%</span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {distributions.length > maxRows && (
        <div className="mt-4 text-center">
          <p className="text-sm text-gray-500">
            ... and {distributions.length - maxRows} more players
          </p>
        </div>
      )}

      {/* Summary */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-blue-50 rounded-lg p-4">
          <p className="text-sm text-blue-700">First Place</p>
          <p className="text-2xl font-bold text-blue-900">
            {formatNumber(distributions[0].totalPoints)}
          </p>
          <p className="text-xs text-blue-600 mt-1">100% of max value</p>
        </div>
        <div className="bg-purple-50 rounded-lg p-4">
          <p className="text-sm text-purple-700">Median (Position {Math.floor(distributions.length / 2)})</p>
          <p className="text-2xl font-bold text-purple-900">
            {formatNumber(distributions[Math.floor(distributions.length / 2) - 1]?.totalPoints || 0)}
          </p>
          <p className="text-xs text-purple-600 mt-1">
            {formatNumber(
              calculatePointsPercentage(
                distributions[Math.floor(distributions.length / 2) - 1]?.totalPoints || 0,
                firstPlaceValue
              )
            )}
            % of max value
          </p>
        </div>
        <div className="bg-green-50 rounded-lg p-4">
          <p className="text-sm text-green-700">Last Place</p>
          <p className="text-2xl font-bold text-green-900">
            {formatNumber(distributions[distributions.length - 1].totalPoints)}
          </p>
          <p className="text-xs text-green-600 mt-1">
            {formatNumber(
              calculatePointsPercentage(
                distributions[distributions.length - 1].totalPoints,
                firstPlaceValue
              )
            )}
            % of max value
          </p>
        </div>
      </div>
    </div>
  );
}
