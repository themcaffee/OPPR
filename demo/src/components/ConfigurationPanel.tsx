import { useRef, useState } from 'react';
import { useConfiguration } from '../hooks/useConfiguration';
import type { PartialOPPRConfig } from '../hooks/useConfiguration';

interface ConfigSectionProps {
  title: string;
  description: string;
  children: React.ReactNode;
  defaultExpanded?: boolean;
}

function ConfigSection({ title, description, children, defaultExpanded = false }: ConfigSectionProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  return (
    <div className="border-b border-gray-200 last:border-b-0">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors"
      >
        <div className="flex flex-col items-start">
          <span className="font-medium text-gray-900">{title}</span>
          <span className="text-sm text-gray-600">{description}</span>
        </div>
        <svg
          className={`w-5 h-5 text-gray-500 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {isExpanded && <div className="px-4 py-3 space-y-4 bg-gray-50">{children}</div>}
    </div>
  );
}

interface NumberInputProps {
  label: string;
  value: number;
  path: string;
  description: string;
  min?: number;
  max?: number;
  step?: number;
  onChange: (path: string, value: number) => void;
  isModified?: boolean;
  hasError?: boolean;
}

function NumberInput({
  label,
  value,
  path,
  description,
  min,
  max,
  step = 0.01,
  onChange,
  isModified = false,
  hasError = false,
}: NumberInputProps) {
  return (
    <div className="flex flex-col space-y-1">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-gray-900 flex items-center gap-2">
          {label}
          {isModified && (
            <span className="text-xs px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded">
              Modified
            </span>
          )}
        </label>
        <input
          type="number"
          value={value}
          min={min}
          max={max}
          step={step}
          onChange={(e) => onChange(path, parseFloat(e.target.value))}
          className={`px-3 py-1.5 bg-white border rounded text-gray-900 w-32 ${
            hasError
              ? 'border-red-500 focus:border-red-400'
              : 'border-gray-300 focus:border-blue-500'
          } focus:outline-none focus:ring-1 focus:ring-blue-500`}
        />
      </div>
      <p className="text-xs text-gray-600">{description}</p>
    </div>
  );
}

interface ReadOnlyValueProps {
  label: string;
  value: number | string;
  description: string;
}

function ReadOnlyValue({ label, value, description }: ReadOnlyValueProps) {
  const displayValue = typeof value === 'number' ? value.toFixed(6).replace(/\.?0+$/, '') : value;

  return (
    <div className="flex flex-col space-y-1">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-gray-700">{label}</label>
        <div className="px-3 py-1.5 bg-gray-100 border border-gray-200 rounded text-gray-700 w-32 text-right font-mono text-sm">
          {displayValue}
        </div>
      </div>
      <p className="text-xs text-gray-600">{description}</p>
    </div>
  );
}

export function ConfigurationPanel() {
  const {
    config,
    validationErrors,
    updateConfig,
    reset,
    exportConfig,
    importConfig,
    copyURLToClipboard,
    isModified,
  } = useConfiguration();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showCopySuccess, setShowCopySuccess] = useState(false);

  const handleNumberChange = (path: string, value: number) => {
    const keys = path.split('.');
    const update: any = {};
    let current = update;

    keys.forEach((key, index) => {
      if (index === keys.length - 1) {
        current[key] = value;
      } else {
        current[key] = {};
        current = current[key];
      }
    });

    updateConfig(update as PartialOPPRConfig);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      importConfig(file);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleCopyURL = async () => {
    const success = await copyURLToClipboard();
    if (success) {
      setShowCopySuccess(true);
      setTimeout(() => setShowCopySuccess(false), 2000);
    }
  };

  const hasError = (path: string) => {
    return validationErrors.some((error) => error.field === path);
  };

  return (
    <div className="bg-white rounded-lg shadow-lg h-full flex flex-col">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-xl font-bold text-gray-900 mb-2">Configuration</h2>
        <p className="text-sm text-gray-600">
          Customize core OPPR ranking parameters. Derived values are calculated automatically.
        </p>

        {/* Action Buttons */}
        <div className="flex gap-2 mt-4 flex-wrap">
          <button
            onClick={reset}
            className="px-3 py-1.5 bg-gray-200 hover:bg-gray-300 text-gray-900 rounded text-sm transition-colors"
          >
            Reset to Defaults
          </button>
          <button
            onClick={exportConfig}
            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded text-sm transition-colors"
          >
            Export Config
          </button>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded text-sm transition-colors"
          >
            Import Config
          </button>
          <button
            onClick={handleCopyURL}
            className="px-3 py-1.5 bg-green-600 hover:bg-green-500 text-white rounded text-sm transition-colors relative"
          >
            {showCopySuccess ? 'Copied!' : 'Copy Shareable URL'}
          </button>
        </div>

        {/* Validation Errors */}
        {validationErrors.length > 0 && (
          <div className="mt-4 p-3 bg-red-50 border border-red-300 rounded">
            <p className="text-sm font-medium text-red-800 mb-2">Validation Errors:</p>
            <ul className="text-xs text-red-700 space-y-1">
              {validationErrors.map((error, index) => (
                <li key={index}>
                  <strong>{error.field}:</strong> {error.message}
                  {error.suggestedValue !== undefined && (
                    <span className="text-red-600"> (Suggested: {error.suggestedValue})</span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Configuration Sections */}
      <div className="px-6 py-4 overflow-y-auto flex-1">
        {/* System Caps */}
        <ConfigSection
          title="System Caps"
          description="High-level tournament value limits"
          defaultExpanded={true}
        >
          <NumberInput
            label="Max Base Value"
            value={config.BASE_VALUE.MAX_BASE_VALUE}
            path="BASE_VALUE.MAX_BASE_VALUE"
            isModified={isModified('BASE_VALUE.MAX_BASE_VALUE')}
            description="Maximum base value cap (auto-calculates max player count at 0.5 points/player)"
            min={1}
            step={1}
            onChange={handleNumberChange}
            hasError={hasError('BASE_VALUE.MAX_BASE_VALUE')}
          />
          <NumberInput
            label="Max TVA from Ratings"
            value={config.TVA.RATING.MAX_VALUE}
            path="TVA.RATING.MAX_VALUE"
            isModified={isModified('TVA.RATING.MAX_VALUE')}
            description="Maximum TVA points from player ratings (auto-calculates coefficients)"
            min={0}
            step={1}
            onChange={handleNumberChange}
            hasError={hasError('TVA.RATING.MAX_VALUE')}
          />
          <NumberInput
            label="Max TVA from Rankings"
            value={config.TVA.RANKING.MAX_VALUE}
            path="TVA.RANKING.MAX_VALUE"
            isModified={isModified('TVA.RANKING.MAX_VALUE')}
            description="Maximum TVA points from player rankings (auto-calculates coefficients)"
            min={0}
            step={1}
            onChange={handleNumberChange}
            hasError={hasError('TVA.RANKING.MAX_VALUE')}
          />
          <NumberInput
            label="Max Players for TVA"
            value={config.TVA.MAX_PLAYERS_CONSIDERED}
            path="TVA.MAX_PLAYERS_CONSIDERED"
            isModified={isModified('TVA.MAX_PLAYERS_CONSIDERED')}
            description="Maximum players considered in TVA calculation"
            min={1}
            step={1}
            onChange={handleNumberChange}
            hasError={hasError('TVA.MAX_PLAYERS_CONSIDERED')}
          />
          <NumberInput
            label="Max TGP Without Finals"
            value={config.TGP.MAX_WITHOUT_FINALS}
            path="TGP.MAX_WITHOUT_FINALS"
            isModified={isModified('TGP.MAX_WITHOUT_FINALS')}
            description="Max TGP for single-format events (typically 100%)"
            min={0.5}
            step={0.1}
            onChange={handleNumberChange}
            hasError={hasError('TGP.MAX_WITHOUT_FINALS')}
          />
          <NumberInput
            label="Max TGP With Finals"
            value={config.TGP.MAX_WITH_FINALS}
            path="TGP.MAX_WITH_FINALS"
            isModified={isModified('TGP.MAX_WITH_FINALS')}
            description="Max TGP with qualifying and finals (typically 200%, auto-calculates games needed at 0.04/game)"
            min={1}
            step={0.1}
            onChange={handleNumberChange}
            hasError={hasError('TGP.MAX_WITH_FINALS')}
          />
        </ConfigSection>

        {/* TGP Format Multipliers */}
        <ConfigSection
          title="TGP - Format Multipliers"
          description="Difficulty multipliers for different tournament formats"
        >
          <NumberInput
            label="4-Player Groups"
            value={config.TGP.MULTIPLIERS.FOUR_PLAYER_GROUPS}
            path="TGP.MULTIPLIERS.FOUR_PLAYER_GROUPS"
            isModified={isModified('TGP.MULTIPLIERS.FOUR_PLAYER_GROUPS')}
            description="PAPA-style 4-player group matches"
            min={1}
            max={5}
            step={0.1}
            onChange={handleNumberChange}
            hasError={hasError('TGP.MULTIPLIERS.FOUR_PLAYER_GROUPS')}
          />
          <NumberInput
            label="3-Player Groups"
            value={config.TGP.MULTIPLIERS.THREE_PLAYER_GROUPS}
            path="TGP.MULTIPLIERS.THREE_PLAYER_GROUPS"
            isModified={isModified('TGP.MULTIPLIERS.THREE_PLAYER_GROUPS')}
            description="3-player group matches"
            min={1}
            max={5}
            step={0.1}
            onChange={handleNumberChange}
            hasError={hasError('TGP.MULTIPLIERS.THREE_PLAYER_GROUPS')}
          />
          <NumberInput
            label="Unlimited Best Game"
            value={config.TGP.MULTIPLIERS.UNLIMITED_BEST_GAME}
            path="TGP.MULTIPLIERS.UNLIMITED_BEST_GAME"
            isModified={isModified('TGP.MULTIPLIERS.UNLIMITED_BEST_GAME')}
            description="Unlimited qualifying with best game scoring (min 20 hours)"
            min={1}
            max={5}
            step={0.1}
            onChange={handleNumberChange}
            hasError={hasError('TGP.MULTIPLIERS.UNLIMITED_BEST_GAME')}
          />
          <NumberInput
            label="Hybrid Best Game"
            value={config.TGP.MULTIPLIERS.HYBRID_BEST_GAME}
            path="TGP.MULTIPLIERS.HYBRID_BEST_GAME"
            isModified={isModified('TGP.MULTIPLIERS.HYBRID_BEST_GAME')}
            description="Hybrid qualifying format"
            min={1}
            max={5}
            step={0.1}
            onChange={handleNumberChange}
            hasError={hasError('TGP.MULTIPLIERS.HYBRID_BEST_GAME')}
          />
          <NumberInput
            label="Unlimited Card"
            value={config.TGP.MULTIPLIERS.UNLIMITED_CARD}
            path="TGP.MULTIPLIERS.UNLIMITED_CARD"
            isModified={isModified('TGP.MULTIPLIERS.UNLIMITED_CARD')}
            description="Unlimited qualifying with scorecard format"
            min={1}
            max={5}
            step={0.1}
            onChange={handleNumberChange}
            hasError={hasError('TGP.MULTIPLIERS.UNLIMITED_CARD')}
          />
          <NumberInput
            label="1-Ball Adjustment"
            value={config.TGP.BALL_ADJUSTMENTS.ONE_BALL}
            path="TGP.BALL_ADJUSTMENTS.ONE_BALL"
            isModified={isModified('TGP.BALL_ADJUSTMENTS.ONE_BALL')}
            description="Multiplier for 1-ball formats (less variance)"
            min={0.1}
            max={1}
            step={0.01}
            onChange={handleNumberChange}
            hasError={hasError('TGP.BALL_ADJUSTMENTS.ONE_BALL')}
          />
          <NumberInput
            label="2-Ball Adjustment"
            value={config.TGP.BALL_ADJUSTMENTS.TWO_BALL}
            path="TGP.BALL_ADJUSTMENTS.TWO_BALL"
            isModified={isModified('TGP.BALL_ADJUSTMENTS.TWO_BALL')}
            description="Multiplier for 2-ball formats (reduced variance)"
            min={0.1}
            max={1}
            step={0.01}
            onChange={handleNumberChange}
            hasError={hasError('TGP.BALL_ADJUSTMENTS.TWO_BALL')}
          />
        </ConfigSection>

        {/* Event Boosters */}
        <ConfigSection
          title="Event Boosters"
          description="Multipliers for different tournament certification levels"
        >
          <NumberInput
            label="Certified Events"
            value={config.EVENT_BOOSTERS.CERTIFIED}
            path="EVENT_BOOSTERS.CERTIFIED"
            isModified={isModified('EVENT_BOOSTERS.CERTIFIED')}
            description="IFPA certified events (typically 125%)"
            min={1}
            max={3}
            step={0.05}
            onChange={handleNumberChange}
            hasError={hasError('EVENT_BOOSTERS.CERTIFIED')}
          />
          <NumberInput
            label="Certified+ Events"
            value={config.EVENT_BOOSTERS.CERTIFIED_PLUS}
            path="EVENT_BOOSTERS.CERTIFIED_PLUS"
            isModified={isModified('EVENT_BOOSTERS.CERTIFIED_PLUS')}
            description="Certified+ events (typically 150%)"
            min={1}
            max={3}
            step={0.05}
            onChange={handleNumberChange}
            hasError={hasError('EVENT_BOOSTERS.CERTIFIED_PLUS')}
          />
          <NumberInput
            label="Championship Series"
            value={config.EVENT_BOOSTERS.CHAMPIONSHIP_SERIES}
            path="EVENT_BOOSTERS.CHAMPIONSHIP_SERIES"
            isModified={isModified('EVENT_BOOSTERS.CHAMPIONSHIP_SERIES')}
            description="Championship series events (typically 150%)"
            min={1}
            max={3}
            step={0.05}
            onChange={handleNumberChange}
            hasError={hasError('EVENT_BOOSTERS.CHAMPIONSHIP_SERIES')}
          />
          <NumberInput
            label="Major Championships"
            value={config.EVENT_BOOSTERS.MAJOR}
            path="EVENT_BOOSTERS.MAJOR"
            isModified={isModified('EVENT_BOOSTERS.MAJOR')}
            description="Major championships (typically 200%)"
            min={1}
            max={3}
            step={0.05}
            onChange={handleNumberChange}
            hasError={hasError('EVENT_BOOSTERS.MAJOR')}
          />
        </ConfigSection>

        {/* Time Decay */}
        <ConfigSection
          title="Time Decay"
          description="How point values depreciate over time"
        >
          <NumberInput
            label="Year 1-2 Decay"
            value={config.TIME_DECAY.YEAR_1_TO_2}
            path="TIME_DECAY.YEAR_1_TO_2"
            isModified={isModified('TIME_DECAY.YEAR_1_TO_2')}
            description="Value multiplier for results 1-2 years old (0-100% = 0.0-1.0)"
            min={0}
            max={1}
            step={0.05}
            onChange={handleNumberChange}
            hasError={hasError('TIME_DECAY.YEAR_1_TO_2')}
          />
          <NumberInput
            label="Year 2-3 Decay"
            value={config.TIME_DECAY.YEAR_2_TO_3}
            path="TIME_DECAY.YEAR_2_TO_3"
            isModified={isModified('TIME_DECAY.YEAR_2_TO_3')}
            description="Value multiplier for results 2-3 years old (0-100% = 0.0-1.0)"
            min={0}
            max={1}
            step={0.05}
            onChange={handleNumberChange}
            hasError={hasError('TIME_DECAY.YEAR_2_TO_3')}
          />
          <div className="text-xs text-gray-600 italic px-4 py-2 bg-gray-100 rounded">
            Note: Events 0-1 years old are at 100%, events 3+ years are at 0% (expired)
          </div>
        </ConfigSection>

        {/* Point Distribution */}
        <ConfigSection
          title="Point Distribution"
          description="How points are allocated across player positions"
        >
          <NumberInput
            label="Linear Percentage"
            value={config.POINT_DISTRIBUTION.LINEAR_PERCENTAGE}
            path="POINT_DISTRIBUTION.LINEAR_PERCENTAGE"
            isModified={isModified('POINT_DISTRIBUTION.LINEAR_PERCENTAGE')}
            description="Portion distributed linearly (must sum with dynamic to 1.0)"
            min={0}
            max={1}
            step={0.05}
            onChange={handleNumberChange}
            hasError={hasError('POINT_DISTRIBUTION.LINEAR_PERCENTAGE')}
          />
          <NumberInput
            label="Dynamic Percentage"
            value={config.POINT_DISTRIBUTION.DYNAMIC_PERCENTAGE}
            path="POINT_DISTRIBUTION.DYNAMIC_PERCENTAGE"
            isModified={isModified('POINT_DISTRIBUTION.DYNAMIC_PERCENTAGE')}
            description="Portion distributed dynamically (must sum with linear to 1.0)"
            min={0}
            max={1}
            step={0.05}
            onChange={handleNumberChange}
            hasError={hasError('POINT_DISTRIBUTION.DYNAMIC_PERCENTAGE')}
          />
          <NumberInput
            label="Position Exponent"
            value={config.POINT_DISTRIBUTION.POSITION_EXPONENT}
            path="POINT_DISTRIBUTION.POSITION_EXPONENT"
            isModified={isModified('POINT_DISTRIBUTION.POSITION_EXPONENT')}
            description="Exponent for position decay in dynamic formula (lower = steeper)"
            min={0.1}
            max={2}
            step={0.05}
            onChange={handleNumberChange}
            hasError={hasError('POINT_DISTRIBUTION.POSITION_EXPONENT')}
          />
          <NumberInput
            label="Value Exponent"
            value={config.POINT_DISTRIBUTION.VALUE_EXPONENT}
            path="POINT_DISTRIBUTION.VALUE_EXPONENT"
            isModified={isModified('POINT_DISTRIBUTION.VALUE_EXPONENT')}
            description="Final value shaping exponent (higher = more to top finishers)"
            min={1}
            max={5}
            step={0.1}
            onChange={handleNumberChange}
            hasError={hasError('POINT_DISTRIBUTION.VALUE_EXPONENT')}
          />
        </ConfigSection>

        {/* Ranking */}
        <ConfigSection
          title="Ranking Rules"
          description="How player rankings are calculated"
        >
          <NumberInput
            label="Top Events Count"
            value={config.RANKING.TOP_EVENTS_COUNT}
            path="RANKING.TOP_EVENTS_COUNT"
            isModified={isModified('RANKING.TOP_EVENTS_COUNT')}
            description="Number of best events counted toward player ranking"
            min={1}
            max={50}
            step={1}
            onChange={handleNumberChange}
            hasError={hasError('RANKING.TOP_EVENTS_COUNT')}
          />
          <div className="text-xs text-gray-600 italic px-4 py-2 bg-gray-100 rounded">
            Note: Only events within the active time window (0-3 years) are considered
          </div>
        </ConfigSection>

        {/* Computed Values */}
        <ConfigSection
          title="Computed Values"
          description="Auto-calculated constants and derived values (read-only)"
        >
          <div className="mb-4 px-4 py-3 bg-blue-50 border border-blue-200 rounded">
            <p className="text-xs text-gray-700">
              <strong>Note:</strong> These values are automatically calculated from the editable parameters above.
              Fixed constants define core system behavior, while derived values are computed based on your configuration.
            </p>
          </div>

          {/* Fixed Constants */}
          <div className="space-y-4">
            <div className="text-sm font-semibold text-gray-900 border-b border-gray-300 pb-1">
              Fixed Constants
            </div>
            <ReadOnlyValue
              label="Points Per Player"
              value={0.5}
              description="Base points awarded per player in event (constant)"
            />
            <ReadOnlyValue
              label="Base Game Value"
              value={0.04}
              description="TGP value per game played (constant)"
            />
            <ReadOnlyValue
              label="Perfect Rating"
              value={2000}
              description="Maximum player rating value (constant)"
            />
            <ReadOnlyValue
              label="Rated Player Threshold"
              value={5}
              description="Minimum players needed for rating-based TVA (constant)"
            />
            <ReadOnlyValue
              label="Three+ Ball Multiplier"
              value={1}
              description="Ball count multiplier for 3+ balls (constant)"
            />
            <ReadOnlyValue
              label="None Booster"
              value={1}
              description="Event booster for non-certified events (constant)"
            />
            <ReadOnlyValue
              label="Year 0-1 Decay"
              value={1}
              description="Events 0-1 years old retain 100% value (constant)"
            />
            <ReadOnlyValue
              label="Year 3+ Decay"
              value={0}
              description="Events 3+ years old have expired (constant)"
            />
            <ReadOnlyValue
              label="Days Per Year"
              value={365}
              description="Days used for time decay calculations (constant)"
            />
            <ReadOnlyValue
              label="Q Constant"
              value={Math.LN10 / 400}
              description="Elo-style rating calculation constant (ln(10)/400)"
            />
          </div>

          {/* Derived Values */}
          <div className="space-y-4 mt-6">
            <div className="text-sm font-semibold text-gray-900 border-b border-gray-300 pb-1">
              Derived Values
            </div>
            <ReadOnlyValue
              label="Max Player Count"
              value={config.BASE_VALUE.MAX_PLAYER_COUNT}
              description="Maximum players for max base value (MAX_BASE_VALUE / 0.5)"
            />
            <ReadOnlyValue
              label="Max Games for 200% TGP"
              value={config.TGP.MAX_GAMES_FOR_200_PERCENT}
              description="Games needed to reach max TGP with finals (MAX_WITH_FINALS / 0.04)"
            />
            <ReadOnlyValue
              label="TVA Rating: Coefficient"
              value={config.TVA.RATING.COEFFICIENT}
              description="Coefficient for converting player ratings to TVA points"
            />
            <ReadOnlyValue
              label="TVA Rating: Offset"
              value={config.TVA.RATING.OFFSET}
              description="Offset adjustment for rating-based TVA calculation"
            />
            <ReadOnlyValue
              label="TVA Rating: Min Effective Rating"
              value={config.TVA.RATING.MIN_EFFECTIVE_RATING}
              description="Minimum rating that contributes to TVA (64.3% of perfect)"
            />
            <ReadOnlyValue
              label="TVA Ranking: Coefficient"
              value={config.TVA.RANKING.COEFFICIENT}
              description="Coefficient for converting player rankings to TVA points"
            />
            <ReadOnlyValue
              label="TVA Ranking: Offset"
              value={config.TVA.RANKING.OFFSET}
              description="Offset adjustment for ranking-based TVA calculation"
            />
          </div>
        </ConfigSection>
      </div>
    </div>
  );
}
