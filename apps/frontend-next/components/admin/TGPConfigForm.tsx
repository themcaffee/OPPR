'use client';

import type { TGPConfig, TournamentFormatType, QualifyingType } from '@opprs/core';

export type EventBoosterType =
  | 'NONE'
  | 'CERTIFIED'
  | 'CERTIFIED_PLUS'
  | 'CHAMPIONSHIP_SERIES'
  | 'MAJOR';

interface TGPConfigFormProps {
  tgpConfig: TGPConfig;
  eventBooster: EventBoosterType;
  onTGPConfigChange: (config: TGPConfig) => void;
  onEventBoosterChange: (booster: EventBoosterType) => void;
}

const formatTypes: TournamentFormatType[] = [
  'single-elimination',
  'double-elimination',
  'match-play',
  'best-game',
  'card-qualifying',
  'pin-golf',
  'flip-frenzy',
  'strike-format',
  'target-match-play',
  'hybrid',
  'none',
];

const qualifyingTypes: QualifyingType[] = ['unlimited', 'limited', 'hybrid', 'none'];

const eventBoosters: { value: EventBoosterType; label: string; multiplier: string }[] = [
  { value: 'NONE', label: 'None', multiplier: '1.0x' },
  { value: 'CERTIFIED', label: 'Certified', multiplier: '1.25x' },
  { value: 'CERTIFIED_PLUS', label: 'Certified+', multiplier: '1.5x' },
  { value: 'CHAMPIONSHIP_SERIES', label: 'Championship', multiplier: '1.5x' },
  { value: 'MAJOR', label: 'Major', multiplier: '2.0x' },
];

const ballCounts = [
  { balls: 1, multiplier: 0.33 },
  { balls: 2, multiplier: 0.66 },
  { balls: 3, multiplier: 1.0 },
];

function formatTypeName(type: string): string {
  return type
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export function TGPConfigForm({
  tgpConfig,
  eventBooster,
  onTGPConfigChange,
  onEventBoosterChange,
}: TGPConfigFormProps) {
  const updateQualifying = (field: string, value: string | number | boolean | undefined) => {
    onTGPConfigChange({
      ...tgpConfig,
      qualifying: {
        ...tgpConfig.qualifying,
        [field]: value,
      },
    });
  };

  const updateFinals = (field: string, value: string | number | boolean | undefined) => {
    onTGPConfigChange({
      ...tgpConfig,
      finals: {
        ...tgpConfig.finals,
        [field]: value,
      },
    });
  };

  const inputClasses =
    'w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500';
  const disabledInputClasses = 'disabled:bg-gray-100 disabled:text-gray-500 disabled:opacity-50';
  const labelClasses = 'block text-sm font-medium text-gray-700 mb-1';

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Tournament Format Configuration</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Qualifying Section */}
        <div className="space-y-4">
          <h4 className="text-md font-semibold text-gray-800 border-b pb-2">Qualifying</h4>

          <div>
            <label htmlFor="qualifyingType" className={labelClasses}>
              Type
            </label>
            <select
              id="qualifyingType"
              value={tgpConfig.qualifying.type}
              onChange={(e) => updateQualifying('type', e.target.value)}
              className={inputClasses}
            >
              {qualifyingTypes.map((type) => (
                <option key={type} value={type}>
                  {formatTypeName(type)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="qualifyingGames" className={labelClasses}>
              Meaningful Games
            </label>
            <input
              id="qualifyingGames"
              type="number"
              value={tgpConfig.qualifying.meaningfulGames}
              onChange={(e) => updateQualifying('meaningfulGames', Number(e.target.value))}
              min="0"
              className={inputClasses}
            />
          </div>

          {tgpConfig.qualifying.type === 'unlimited' && (
            <div>
              <label htmlFor="qualifyingHours" className={labelClasses}>
                Hours
              </label>
              <input
                id="qualifyingHours"
                type="number"
                value={tgpConfig.qualifying.hours || 0}
                onChange={(e) => updateQualifying('hours', Number(e.target.value))}
                min="0"
                className={inputClasses}
              />
              <p className="text-xs text-gray-500 mt-1">
                +1% per hour (max 20%). 20+ hours enables 4x multiplier.
              </p>
            </div>
          )}

          <div className="space-y-2">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={tgpConfig.qualifying.fourPlayerGroups || false}
                onChange={(e) => updateQualifying('fourPlayerGroups', e.target.checked)}
                className="mr-2 w-4 h-4 text-blue-600 rounded"
              />
              <span className="text-sm text-gray-700">4-Player Groups (2.0x)</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={tgpConfig.qualifying.threePlayerGroups || false}
                onChange={(e) => updateQualifying('threePlayerGroups', e.target.checked)}
                className="mr-2 w-4 h-4 text-blue-600 rounded"
              />
              <span className="text-sm text-gray-700">3-Player Groups (1.5x)</span>
            </label>
          </div>
        </div>

        {/* Finals Section */}
        <div className="space-y-4">
          <h4 className="text-md font-semibold text-gray-800 border-b pb-2">Finals</h4>

          <div>
            <label htmlFor="finalsFormatType" className={labelClasses}>
              Format Type
            </label>
            <select
              id="finalsFormatType"
              value={tgpConfig.finals.formatType}
              onChange={(e) => updateFinals('formatType', e.target.value)}
              className={inputClasses}
            >
              {formatTypes.map((type) => (
                <option key={type} value={type}>
                  {formatTypeName(type)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="finalsGames" className={labelClasses}>
              Meaningful Games
            </label>
            <input
              id="finalsGames"
              type="number"
              value={tgpConfig.finals.meaningfulGames}
              onChange={(e) => updateFinals('meaningfulGames', Number(e.target.value))}
              min="0"
              disabled={tgpConfig.finals.formatType === 'none'}
              className={`${inputClasses} ${disabledInputClasses}`}
            />
          </div>

          <div>
            <label htmlFor="finalistCount" className={labelClasses}>
              Finalist Count (Optional)
            </label>
            <input
              id="finalistCount"
              type="number"
              value={tgpConfig.finals.finalistCount || ''}
              onChange={(e) =>
                updateFinals('finalistCount', e.target.value ? Number(e.target.value) : undefined)
              }
              min="0"
              placeholder="Auto"
              disabled={tgpConfig.finals.formatType === 'none'}
              className={`${inputClasses} ${disabledInputClasses}`}
            />
            <p className="text-xs text-gray-500 mt-1">Must be 10-50% of total participants.</p>
          </div>

          <div className="space-y-2">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={tgpConfig.finals.fourPlayerGroups || false}
                onChange={(e) => updateFinals('fourPlayerGroups', e.target.checked)}
                disabled={tgpConfig.finals.formatType === 'none'}
                className="mr-2 w-4 h-4 text-blue-600 rounded disabled:opacity-50"
              />
              <span
                className={`text-sm ${tgpConfig.finals.formatType === 'none' ? 'text-gray-400' : 'text-gray-700'}`}
              >
                4-Player Groups (2.0x)
              </span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={tgpConfig.finals.threePlayerGroups || false}
                onChange={(e) => updateFinals('threePlayerGroups', e.target.checked)}
                disabled={tgpConfig.finals.formatType === 'none'}
                className="mr-2 w-4 h-4 text-blue-600 rounded disabled:opacity-50"
              />
              <span
                className={`text-sm ${tgpConfig.finals.formatType === 'none' ? 'text-gray-400' : 'text-gray-700'}`}
              >
                3-Player Groups (1.5x)
              </span>
            </label>
          </div>
        </div>
      </div>

      {/* Event Booster */}
      <div className="mt-6 pt-6 border-t">
        <h4 className="text-md font-semibold text-gray-800 mb-3">Event Booster</h4>
        <div className="flex flex-wrap gap-2">
          {eventBoosters.map((booster) => (
            <button
              key={booster.value}
              type="button"
              onClick={() => onEventBoosterChange(booster.value)}
              className={`px-4 py-2 rounded-md transition-colors text-sm ${
                eventBooster === booster.value
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {booster.label} ({booster.multiplier})
            </button>
          ))}
        </div>
      </div>

      {/* Ball Count Adjustment */}
      <div className="mt-6 pt-6 border-t">
        <h4 className="text-md font-semibold text-gray-800 mb-3">Ball Count Adjustment</h4>
        <div className="flex gap-2">
          {ballCounts.map(({ balls, multiplier }) => (
            <button
              key={balls}
              type="button"
              onClick={() =>
                onTGPConfigChange({
                  ...tgpConfig,
                  ballCountAdjustment: multiplier,
                })
              }
              className={`px-4 py-2 rounded-md transition-colors text-sm ${
                (tgpConfig.ballCountAdjustment || 1.0) === multiplier
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {balls} Ball ({multiplier}x)
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export const defaultTGPConfig: TGPConfig = {
  qualifying: {
    type: 'limited',
    meaningfulGames: 5,
  },
  finals: {
    formatType: 'single-elimination',
    meaningfulGames: 4,
  },
  ballCountAdjustment: 1.0,
};
