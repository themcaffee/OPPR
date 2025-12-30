import type { TGPConfig } from '@oppr/core';

interface TournamentConfigProps {
  tgpConfig: TGPConfig;
  eventBooster: 'none' | 'certified' | 'certified-plus' | 'major';
  onTGPConfigChange: (config: TGPConfig) => void;
  onEventBoosterChange: (booster: 'none' | 'certified' | 'certified-plus' | 'major') => void;
}

const formatTypes = [
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
] as const;

const qualifyingTypes = ['unlimited', 'limited', 'hybrid', 'none'] as const;

export function TournamentConfig({
  tgpConfig,
  eventBooster,
  onTGPConfigChange,
  onEventBoosterChange,
}: TournamentConfigProps) {
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

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">Tournament Configuration</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Qualifying Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Qualifying</h3>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
            <select
              value={tgpConfig.qualifying.type}
              onChange={(e) => updateQualifying('type', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {qualifyingTypes.map((type) => (
                <option key={type} value={type}>
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Meaningful Games
            </label>
            <input
              type="number"
              value={tgpConfig.qualifying.meaningfulGames}
              onChange={(e) => updateQualifying('meaningfulGames', Number(e.target.value))}
              min="0"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {tgpConfig.qualifying.type === 'unlimited' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Hours</label>
              <input
                type="number"
                value={tgpConfig.qualifying.hours || 0}
                onChange={(e) => updateQualifying('hours', Number(e.target.value))}
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}

          <div className="flex items-center gap-4">
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
          <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Finals</h3>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Format Type</label>
            <select
              value={tgpConfig.finals.formatType}
              onChange={(e) => updateFinals('formatType', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {formatTypes.map((type) => (
                <option key={type} value={type}>
                  {type
                    .split('-')
                    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                    .join(' ')}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Meaningful Games
            </label>
            <input
              type="number"
              value={tgpConfig.finals.meaningfulGames}
              onChange={(e) => updateFinals('meaningfulGames', Number(e.target.value))}
              min="0"
              disabled={tgpConfig.finals.formatType === 'none'}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:text-gray-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Finalist Count (Optional)
            </label>
            <input
              type="number"
              value={tgpConfig.finals.finalistCount || ''}
              onChange={(e) =>
                updateFinals('finalistCount', e.target.value ? Number(e.target.value) : undefined)
              }
              min="0"
              placeholder="Auto"
              disabled={tgpConfig.finals.formatType === 'none'}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:text-gray-500"
            />
          </div>

          <div className="flex items-center gap-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={tgpConfig.finals.fourPlayerGroups || false}
                onChange={(e) => updateFinals('fourPlayerGroups', e.target.checked)}
                disabled={tgpConfig.finals.formatType === 'none'}
                className="mr-2 w-4 h-4 text-blue-600 rounded disabled:opacity-50"
              />
              <span className={`text-sm ${tgpConfig.finals.formatType === 'none' ? 'text-gray-400' : 'text-gray-700'}`}>4-Player Groups (2.0x)</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={tgpConfig.finals.threePlayerGroups || false}
                onChange={(e) => updateFinals('threePlayerGroups', e.target.checked)}
                disabled={tgpConfig.finals.formatType === 'none'}
                className="mr-2 w-4 h-4 text-blue-600 rounded disabled:opacity-50"
              />
              <span className={`text-sm ${tgpConfig.finals.formatType === 'none' ? 'text-gray-400' : 'text-gray-700'}`}>3-Player Groups (1.5x)</span>
            </label>
          </div>
        </div>
      </div>

      {/* Event Booster */}
      <div className="mt-6 pt-6 border-t">
        <h3 className="text-lg font-semibold text-gray-800 mb-3">Event Booster</h3>
        <div className="flex gap-2">
          {(['none', 'certified', 'certified-plus', 'major'] as const).map((booster) => (
            <button
              key={booster}
              onClick={() => onEventBoosterChange(booster)}
              className={`px-4 py-2 rounded-md transition-colors ${
                eventBooster === booster
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {booster === 'none'
                ? 'None (1.0x)'
                : booster === 'certified'
                  ? 'Certified (1.25x)'
                  : booster === 'certified-plus'
                    ? 'Certified+ (1.5x)'
                    : 'Major (2.0x)'}
            </button>
          ))}
        </div>
      </div>

      {/* Ball Count Adjustment */}
      <div className="mt-6 pt-6 border-t">
        <h3 className="text-lg font-semibold text-gray-800 mb-3">Ball Count Adjustment</h3>
        <div className="flex gap-2">
          {[
            { balls: 1, multiplier: 0.33 },
            { balls: 2, multiplier: 0.66 },
            { balls: 3, multiplier: 1.0 },
          ].map(({ balls, multiplier }) => (
            <button
              key={balls}
              onClick={() =>
                onTGPConfigChange({
                  ...tgpConfig,
                  ballCountAdjustment: multiplier,
                })
              }
              className={`px-4 py-2 rounded-md transition-colors ${
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
