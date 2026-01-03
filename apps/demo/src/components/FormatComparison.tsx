import { useState } from 'react';
import type { TGPConfig } from '@opprs/core';
import type { PlayerWithName, PlayerResultWithName } from '../utils/calculations';
import { calculateTournamentResults, formatNumber, getPlayerRating } from '../utils/calculations';

interface FormatComparisonProps {
  players: PlayerWithName[];
  results: PlayerResultWithName[];
  baseConfig: TGPConfig;
  eventBooster: 'none' | 'certified' | 'certified-plus' | 'major';
}

interface ComparisonScenario {
  name: string;
  config: TGPConfig;
}

export function FormatComparison({ players, results, baseConfig, eventBooster }: FormatComparisonProps) {
  const [selectedScenarios, setSelectedScenarios] = useState<string[]>(['current', 'matchplay', 'bestgame']);

  const scenarios: Record<string, ComparisonScenario> = {
    current: {
      name: 'Current Config',
      config: baseConfig,
    },
    matchplay: {
      name: 'PAPA Match Play',
      config: {
        qualifying: {
          type: 'limited',
          meaningfulGames: 16,
          fourPlayerGroups: true,
        },
        finals: {
          formatType: 'match-play',
          meaningfulGames: 12,
          fourPlayerGroups: true,
        },
      },
    },
    bestgame: {
      name: 'Best Game (Unlimited)',
      config: {
        qualifying: {
          type: 'unlimited',
          meaningfulGames: 20,
          hours: 20,
        },
        finals: {
          formatType: 'match-play',
          meaningfulGames: 8,
          fourPlayerGroups: true,
        },
      },
    },
    strikeFormat: {
      name: 'Strike/Knockout',
      config: {
        qualifying: {
          type: 'limited',
          meaningfulGames: 8,
        },
        finals: {
          formatType: 'strike-format',
          meaningfulGames: 6,
        },
      },
    },
    doubleElim: {
      name: 'Double Elimination',
      config: {
        qualifying: {
          type: 'none',
          meaningfulGames: 0,
        },
        finals: {
          formatType: 'double-elimination',
          meaningfulGames: 16,
        },
      },
    },
  };

  if (!players.length || !results.length) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Format Comparison</h2>
        <p className="text-gray-600">Set up players and results to compare tournament formats.</p>
      </div>
    );
  }

  const calculations = selectedScenarios.map((key) => {
    const scenario = scenarios[key];
    return {
      name: scenario.name,
      calculation: calculateTournamentResults(players, results, scenario.config, eventBooster),
    };
  });

  const topPlayers = results.slice(0, 5);

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Format Comparison</h2>
        <p className="text-sm text-gray-600 mb-4">
          Compare how different tournament formats affect point values and distribution
        </p>

        {/* Scenario Selection */}
        <div className="flex flex-wrap gap-2">
          {Object.keys(scenarios).map((key) => (
            <button
              key={key}
              onClick={() => {
                if (selectedScenarios.includes(key)) {
                  setSelectedScenarios(selectedScenarios.filter((k) => k !== key));
                } else {
                  setSelectedScenarios([...selectedScenarios, key]);
                }
              }}
              className={`px-3 py-1 rounded-md text-sm transition-colors ${
                selectedScenarios.includes(key)
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {scenarios[key].name}
            </button>
          ))}
        </div>
      </div>

      {/* Tournament Value Comparison */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Tournament Value Comparison</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                  Format
                </th>
                <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase">
                  TGP
                </th>
                <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase">
                  1st Place Value
                </th>
                <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase">
                  5th Place Value
                </th>
                <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase">
                  Last Place Value
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {calculations.map(({ name, calculation }) => (
                <tr key={name} className="hover:bg-gray-50">
                  <td className="px-3 py-2 whitespace-nowrap">
                    <span className="text-sm font-medium text-gray-900">{name}</span>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-right">
                    <span className="text-sm text-gray-600">
                      {formatNumber(calculation.tgp * 100)}%
                    </span>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-right">
                    <span className="text-sm font-bold text-blue-600">
                      {formatNumber(calculation.firstPlaceValue)}
                    </span>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-right">
                    <span className="text-sm text-gray-900">
                      {formatNumber(calculation.distributions[4]?.totalPoints || 0)}
                    </span>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-right">
                    <span className="text-sm text-gray-600">
                      {formatNumber(
                        calculation.distributions[calculation.distributions.length - 1]?.totalPoints || 0
                      )}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Top 5 Players Point Comparison */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Top 5 Players Point Comparison</h3>
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
                {calculations.map(({ name }) => (
                  <th
                    key={name}
                    className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase"
                  >
                    {name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {topPlayers.map((result, index) => (
                <tr key={result.player.id} className="hover:bg-gray-50">
                  <td className="px-3 py-2 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-900">{index + 1}</span>
                      {index < 3 && (
                        <span className="text-lg">
                          {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{result.player.name}</div>
                    <div className="text-xs text-gray-500">Rating: {getPlayerRating(result.player)}</div>
                  </td>
                  {calculations.map(({ name, calculation }) => {
                    const dist = calculation.distributions[index];
                    return (
                      <td key={name} className="px-3 py-2 whitespace-nowrap text-right">
                        <span className="text-sm font-bold text-gray-900">
                          {formatNumber(dist?.totalPoints || 0)}
                        </span>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Insights */}
      <div className="mt-6 bg-blue-50 rounded-lg p-4">
        <h4 className="text-sm font-semibold text-blue-900 mb-2">💡 Comparison Insights</h4>
        <ul className="text-xs text-blue-800 space-y-1">
          <li>• TGP (Tournament Grading Percentage) directly affects tournament value</li>
          <li>• 4-player match play groups provide 2.0x multiplier to TGP</li>
          <li>• More meaningful games = higher TGP = higher point values</li>
          <li>• Point distribution percentages remain constant across formats</li>
        </ul>
      </div>
    </div>
  );
}
