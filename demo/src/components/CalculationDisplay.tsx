import type { TournamentCalculation } from '../utils/calculations';
import { formatNumber } from '../utils/calculations';

interface CalculationDisplayProps {
  calculation: TournamentCalculation | null;
}

export function CalculationDisplay({ calculation }: CalculationDisplayProps) {
  if (!calculation) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Tournament Value Calculation</h2>
        <p className="text-gray-600">Set up players and tournament configuration to see calculations.</p>
      </div>
    );
  }

  const {
    baseValue,
    ratingTVA,
    rankingTVA,
    totalTVA,
    tgp,
    boosterMultiplier,
    firstPlaceValue,
  } = calculation;

  const rawValue = baseValue + totalTVA;
  const afterTGP = rawValue * tgp;

  return (
    <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Tournament Value Calculation</h2>

      <div className="space-y-4">
        {/* Base Value Section */}
        <div className="bg-blue-50 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">Base Value</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-blue-700">0.5 per rated player</p>
              <p className="text-2xl font-bold text-blue-900">{formatNumber(baseValue)}</p>
              <p className="text-xs text-blue-600 mt-1">Max: 32.00</p>
            </div>
          </div>
        </div>

        {/* TVA Section */}
        <div className="bg-purple-50 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-purple-900 mb-2">
            Tournament Value Adjustment (TVA)
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-purple-700">Rating TVA</p>
              <p className="text-2xl font-bold text-purple-900">{formatNumber(ratingTVA)}</p>
              <p className="text-xs text-purple-600 mt-1">Max: 25.00</p>
            </div>
            <div>
              <p className="text-sm text-purple-700">Ranking TVA</p>
              <p className="text-2xl font-bold text-purple-900">{formatNumber(rankingTVA)}</p>
              <p className="text-xs text-purple-600 mt-1">Max: 50.00</p>
            </div>
            <div>
              <p className="text-sm text-purple-700">Total TVA</p>
              <p className="text-2xl font-bold text-purple-900">{formatNumber(totalTVA)}</p>
              <p className="text-xs text-purple-600 mt-1">Max: 75.00</p>
            </div>
          </div>
        </div>

        {/* Raw Value */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Raw Tournament Value</h3>
          <p className="text-sm text-gray-600 mb-2">Base Value + Total TVA</p>
          <p className="text-3xl font-bold text-gray-900">
            {formatNumber(baseValue)} + {formatNumber(totalTVA)} = {formatNumber(rawValue)}
          </p>
        </div>

        {/* TGP Multiplier */}
        <div className="bg-green-50 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-green-900 mb-2">
            Tournament Grading Percentage (TGP)
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-green-700">TGP Multiplier</p>
              <p className="text-2xl font-bold text-green-900">{formatNumber(tgp, 4)}x</p>
              <p className="text-xs text-green-600 mt-1">
                ({formatNumber(tgp * 100, 2)}%)
              </p>
            </div>
            <div>
              <p className="text-sm text-green-700">After TGP</p>
              <p className="text-2xl font-bold text-green-900">{formatNumber(afterTGP)}</p>
              <p className="text-xs text-green-600 mt-1">
                {formatNumber(rawValue)} × {formatNumber(tgp, 4)}
              </p>
            </div>
          </div>
        </div>

        {/* Event Booster */}
        <div className="bg-yellow-50 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-yellow-900 mb-2">Event Booster</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-yellow-700">Booster Multiplier</p>
              <p className="text-2xl font-bold text-yellow-900">
                {formatNumber(boosterMultiplier, 2)}x
              </p>
            </div>
            <div>
              <p className="text-sm text-yellow-700">After Booster</p>
              <p className="text-2xl font-bold text-yellow-900">{formatNumber(firstPlaceValue)}</p>
              <p className="text-xs text-yellow-600 mt-1">
                {formatNumber(afterTGP)} × {formatNumber(boosterMultiplier, 2)}
              </p>
            </div>
          </div>
        </div>

        {/* Final Value */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-2">First Place Value</h3>
          <p className="text-5xl font-bold text-white">{formatNumber(firstPlaceValue)}</p>
          <p className="text-sm text-blue-100 mt-3">points</p>
          <div className="mt-4 text-xs text-blue-100">
            <p>Formula: (Base + TVA) × TGP × Booster</p>
            <p className="mt-1">
              ({formatNumber(baseValue)} + {formatNumber(totalTVA)}) × {formatNumber(tgp, 4)} ×{' '}
              {formatNumber(boosterMultiplier, 2)} = {formatNumber(firstPlaceValue)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
