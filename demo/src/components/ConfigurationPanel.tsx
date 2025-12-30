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
    <div className="border border-gray-200 rounded-lg mb-4">
      <button
        className="w-full px-6 py-4 flex justify-between items-center hover:bg-gray-50 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="text-left">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <p className="text-sm text-gray-600 mt-1">{description}</p>
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
      {isExpanded && (
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {children}
          </div>
        </div>
      )}
    </div>
  );
}

interface NumberInputProps {
  label: string;
  value: number;
  path: string;
  isModified: boolean;
  description?: string;
  min?: number;
  max?: number;
  step?: number;
  onChange: (path: string, value: number) => void;
  hasError?: boolean;
}

function NumberInput({
  label,
  value,
  path,
  isModified,
  description,
  min,
  max,
  step = 0.01,
  onChange,
  hasError,
}: NumberInputProps) {
  return (
    <div className="flex flex-col">
      <label className="text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
        {label}
        {isModified && (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
            Modified
          </span>
        )}
      </label>
      {description && <p className="text-xs text-gray-500 mb-2">{description}</p>}
      <input
        type="number"
        value={value}
        min={min}
        max={max}
        step={step}
        onChange={(e) => onChange(path, parseFloat(e.target.value))}
        className={`px-3 py-2 border rounded-md text-sm ${
          hasError
            ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
            : isModified
            ? 'border-blue-500 focus:ring-blue-500 focus:border-blue-500'
            : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
        }`}
      />
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
  const [urlCopied, setUrlCopied] = useState(false);

  const handleNumberChange = (path: string, value: number) => {
    if (isNaN(value)) return;

    const parts = path.split('.');
    const update: any = {};

    let current = update;
    for (let i = 0; i < parts.length - 1; i++) {
      current[parts[i]] = {};
      current = current[parts[i]];
    }
    current[parts[parts.length - 1]] = value;

    updateConfig(update as PartialOPPRConfig);
  };

  const hasError = (path: string) => {
    return validationErrors.some(error => error.field === path);
  };

  const handleImport = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      importConfig(file);
    }
  };

  const handleCopyURL = async () => {
    const success = await copyURLToClipboard();
    if (success) {
      setUrlCopied(true);
      setTimeout(() => setUrlCopied(false), 2000);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Configuration</h2>
            <p className="text-sm text-gray-600 mt-1">
              Customize OPPR calculation constants. Values with dependencies are validated automatically.
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleCopyURL}
              className="px-4 py-2 text-sm font-medium text-blue-700 bg-blue-50 rounded-md hover:bg-blue-100 transition-colors"
            >
              {urlCopied ? 'Copied!' : 'Share URL'}
            </button>
            <button
              onClick={exportConfig}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
            >
              Export
            </button>
            <button
              onClick={handleImport}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
            >
              Import
            </button>
            <button
              onClick={reset}
              className="px-4 py-2 text-sm font-medium text-red-700 bg-red-50 rounded-md hover:bg-red-100 transition-colors"
            >
              Reset All
            </button>
          </div>
        </div>

        {/* Validation Errors */}
        {validationErrors.length > 0 && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
            <h3 className="text-sm font-semibold text-red-800 mb-2">Validation Errors:</h3>
            <ul className="space-y-1">
              {validationErrors.map((error, idx) => (
                <li key={idx} className="text-sm text-red-700">
                  <span className="font-medium">{error.field}:</span> {error.message}
                  {error.suggestedValue !== undefined && (
                    <span className="text-red-600"> (suggested: {error.suggestedValue})</span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Configuration Sections */}
      <div className="px-6 py-4">
        {/* Base Value Constants */}
        <ConfigSection
          title="Base Value"
          description="Controls the base tournament value before adjustments"
          defaultExpanded={true}
        >
          <NumberInput
            label="Points Per Player"
            value={config.BASE_VALUE.POINTS_PER_PLAYER}
            path="BASE_VALUE.POINTS_PER_PLAYER"
            isModified={isModified('BASE_VALUE.POINTS_PER_PLAYER')}
            description="Base points awarded per rated player"
            min={0}
            step={0.1}
            onChange={handleNumberChange}
            hasError={hasError('BASE_VALUE.POINTS_PER_PLAYER')}
          />
          <NumberInput
            label="Max Base Value"
            value={config.BASE_VALUE.MAX_BASE_VALUE}
            path="BASE_VALUE.MAX_BASE_VALUE"
            isModified={isModified('BASE_VALUE.MAX_BASE_VALUE')}
            description="Maximum base value cap"
            min={0}
            step={1}
            onChange={handleNumberChange}
            hasError={hasError('BASE_VALUE.MAX_BASE_VALUE')}
          />
          <NumberInput
            label="Max Player Count"
            value={config.BASE_VALUE.MAX_PLAYER_COUNT}
            path="BASE_VALUE.MAX_PLAYER_COUNT"
            isModified={isModified('BASE_VALUE.MAX_PLAYER_COUNT')}
            description="Player count at which max base value is reached"
            min={1}
            step={1}
            onChange={handleNumberChange}
            hasError={hasError('BASE_VALUE.MAX_PLAYER_COUNT')}
          />
          <NumberInput
            label="Rated Player Threshold"
            value={config.BASE_VALUE.RATED_PLAYER_THRESHOLD}
            path="BASE_VALUE.RATED_PLAYER_THRESHOLD"
            isModified={isModified('BASE_VALUE.RATED_PLAYER_THRESHOLD')}
            description="Minimum events to become a rated player"
            min={1}
            step={1}
            onChange={handleNumberChange}
            hasError={hasError('BASE_VALUE.RATED_PLAYER_THRESHOLD')}
          />
        </ConfigSection>

        {/* TVA Rating Constants */}
        <ConfigSection
          title="TVA - Rating"
          description="Tournament Value Adjustment based on player ratings"
        >
          <NumberInput
            label="Max Value"
            value={config.TVA.RATING.MAX_VALUE}
            path="TVA.RATING.MAX_VALUE"
            isModified={isModified('TVA.RATING.MAX_VALUE')}
            description="Maximum TVA points from ratings"
            min={0}
            step={1}
            onChange={handleNumberChange}
            hasError={hasError('TVA.RATING.MAX_VALUE')}
          />
          <NumberInput
            label="Coefficient"
            value={config.TVA.RATING.COEFFICIENT}
            path="TVA.RATING.COEFFICIENT"
            isModified={isModified('TVA.RATING.COEFFICIENT')}
            description="Rating multiplier in TVA formula"
            min={0}
            step={0.000001}
            onChange={handleNumberChange}
            hasError={hasError('TVA.RATING.COEFFICIENT')}
          />
          <NumberInput
            label="Offset"
            value={config.TVA.RATING.OFFSET}
            path="TVA.RATING.OFFSET"
            isModified={isModified('TVA.RATING.OFFSET')}
            description="Rating offset constant in TVA formula"
            step={0.01}
            onChange={handleNumberChange}
            hasError={hasError('TVA.RATING.OFFSET')}
          />
          <NumberInput
            label="Perfect Rating"
            value={config.TVA.RATING.PERFECT_RATING}
            path="TVA.RATING.PERFECT_RATING"
            isModified={isModified('TVA.RATING.PERFECT_RATING')}
            description="Rating of a perfect player"
            min={0}
            step={50}
            onChange={handleNumberChange}
            hasError={hasError('TVA.RATING.PERFECT_RATING')}
          />
          <NumberInput
            label="Min Effective Rating"
            value={config.TVA.RATING.MIN_EFFECTIVE_RATING}
            path="TVA.RATING.MIN_EFFECTIVE_RATING"
            isModified={isModified('TVA.RATING.MIN_EFFECTIVE_RATING')}
            description="Minimum rating that contributes to TVA"
            min={0}
            step={10}
            onChange={handleNumberChange}
            hasError={hasError('TVA.RATING.MIN_EFFECTIVE_RATING')}
          />
        </ConfigSection>

        {/* TVA Ranking Constants */}
        <ConfigSection
          title="TVA - Ranking"
          description="Tournament Value Adjustment based on player rankings"
        >
          <NumberInput
            label="Max Value"
            value={config.TVA.RANKING.MAX_VALUE}
            path="TVA.RANKING.MAX_VALUE"
            isModified={isModified('TVA.RANKING.MAX_VALUE')}
            description="Maximum TVA points from rankings"
            min={0}
            step={1}
            onChange={handleNumberChange}
            hasError={hasError('TVA.RANKING.MAX_VALUE')}
          />
          <NumberInput
            label="Coefficient"
            value={config.TVA.RANKING.COEFFICIENT}
            path="TVA.RANKING.COEFFICIENT"
            isModified={isModified('TVA.RANKING.COEFFICIENT')}
            description="Natural log coefficient in ranking formula"
            step={0.001}
            onChange={handleNumberChange}
            hasError={hasError('TVA.RANKING.COEFFICIENT')}
          />
          <NumberInput
            label="Offset"
            value={config.TVA.RANKING.OFFSET}
            path="TVA.RANKING.OFFSET"
            isModified={isModified('TVA.RANKING.OFFSET')}
            description="Constant offset in ranking formula"
            step={0.001}
            onChange={handleNumberChange}
            hasError={hasError('TVA.RANKING.OFFSET')}
          />
          <NumberInput
            label="Max Players Considered"
            value={config.TVA.MAX_PLAYERS_CONSIDERED}
            path="TVA.MAX_PLAYERS_CONSIDERED"
            isModified={isModified('TVA.MAX_PLAYERS_CONSIDERED')}
            description="Maximum players for TVA calculation"
            min={1}
            step={1}
            onChange={handleNumberChange}
            hasError={hasError('TVA.MAX_PLAYERS_CONSIDERED')}
          />
        </ConfigSection>

        {/* TGP Constants */}
        <ConfigSection
          title="TGP - Tournament Grading"
          description="Tournament Grading Percentage calculation constants"
        >
          <NumberInput
            label="Base Game Value"
            value={config.TGP.BASE_GAME_VALUE}
            path="TGP.BASE_GAME_VALUE"
            isModified={isModified('TGP.BASE_GAME_VALUE')}
            description="TGP percentage per meaningful game (4% = 0.04)"
            min={0}
            max={1}
            step={0.01}
            onChange={handleNumberChange}
            hasError={hasError('TGP.BASE_GAME_VALUE')}
          />
          <NumberInput
            label="Max Without Finals"
            value={config.TGP.MAX_WITHOUT_FINALS}
            path="TGP.MAX_WITHOUT_FINALS"
            isModified={isModified('TGP.MAX_WITHOUT_FINALS')}
            description="Maximum TGP for events without finals"
            min={0}
            max={2}
            step={0.1}
            onChange={handleNumberChange}
            hasError={hasError('TGP.MAX_WITHOUT_FINALS')}
          />
          <NumberInput
            label="Max With Finals"
            value={config.TGP.MAX_WITH_FINALS}
            path="TGP.MAX_WITH_FINALS"
            isModified={isModified('TGP.MAX_WITH_FINALS')}
            description="Maximum TGP for events with finals"
            min={0}
            max={3}
            step={0.1}
            onChange={handleNumberChange}
            hasError={hasError('TGP.MAX_WITH_FINALS')}
          />
          <NumberInput
            label="Max Games for 200%"
            value={config.TGP.MAX_GAMES_FOR_200_PERCENT}
            path="TGP.MAX_GAMES_FOR_200_PERCENT"
            isModified={isModified('TGP.MAX_GAMES_FOR_200_PERCENT')}
            description="Meaningful games to reach 200% TGP"
            min={1}
            step={1}
            onChange={handleNumberChange}
            hasError={hasError('TGP.MAX_GAMES_FOR_200_PERCENT')}
          />
        </ConfigSection>

        {/* TGP Multipliers */}
        <ConfigSection
          title="TGP - Format Multipliers"
          description="Multipliers for different tournament formats"
        >
          <NumberInput
            label="4-Player Groups"
            value={config.TGP.MULTIPLIERS.FOUR_PLAYER_GROUPS}
            path="TGP.MULTIPLIERS.FOUR_PLAYER_GROUPS"
            isModified={isModified('TGP.MULTIPLIERS.FOUR_PLAYER_GROUPS')}
            description="PAPA-style 4-player groups"
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
            description="3-player group format"
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
            description="Unlimited qualifying (min 20 hours)"
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
            description="Hybrid best game qualifying"
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
            description="Unlimited card qualifying (min 20 hours)"
            min={1}
            max={5}
            step={0.1}
            onChange={handleNumberChange}
            hasError={hasError('TGP.MULTIPLIERS.UNLIMITED_CARD')}
          />
        </ConfigSection>

        {/* TGP Ball Adjustments */}
        <ConfigSection
          title="TGP - Ball Adjustments"
          description="TGP adjustments based on balls per game"
        >
          <NumberInput
            label="1-Ball"
            value={config.TGP.BALL_ADJUSTMENTS.ONE_BALL}
            path="TGP.BALL_ADJUSTMENTS.ONE_BALL"
            isModified={isModified('TGP.BALL_ADJUSTMENTS.ONE_BALL')}
            description="1-ball format adjustment"
            min={0}
            max={1}
            step={0.01}
            onChange={handleNumberChange}
            hasError={hasError('TGP.BALL_ADJUSTMENTS.ONE_BALL')}
          />
          <NumberInput
            label="2-Ball"
            value={config.TGP.BALL_ADJUSTMENTS.TWO_BALL}
            path="TGP.BALL_ADJUSTMENTS.TWO_BALL"
            isModified={isModified('TGP.BALL_ADJUSTMENTS.TWO_BALL')}
            description="2-ball format adjustment"
            min={0}
            max={1}
            step={0.01}
            onChange={handleNumberChange}
            hasError={hasError('TGP.BALL_ADJUSTMENTS.TWO_BALL')}
          />
          <NumberInput
            label="3+ Ball"
            value={config.TGP.BALL_ADJUSTMENTS.THREE_PLUS_BALL}
            path="TGP.BALL_ADJUSTMENTS.THREE_PLUS_BALL"
            isModified={isModified('TGP.BALL_ADJUSTMENTS.THREE_PLUS_BALL')}
            description="3 or more balls (standard)"
            min={0}
            max={1}
            step={0.01}
            onChange={handleNumberChange}
            hasError={hasError('TGP.BALL_ADJUSTMENTS.THREE_PLUS_BALL')}
          />
        </ConfigSection>

        {/* TGP Unlimited Qualifying */}
        <ConfigSection
          title="TGP - Unlimited Qualifying"
          description="Time-based bonuses for unlimited qualifying"
        >
          <NumberInput
            label="Percent Per Hour"
            value={config.TGP.UNLIMITED_QUALIFYING.PERCENT_PER_HOUR}
            path="TGP.UNLIMITED_QUALIFYING.PERCENT_PER_HOUR"
            isModified={isModified('TGP.UNLIMITED_QUALIFYING.PERCENT_PER_HOUR')}
            description="TGP bonus per hour (1% = 0.01)"
            min={0}
            max={0.1}
            step={0.001}
            onChange={handleNumberChange}
            hasError={hasError('TGP.UNLIMITED_QUALIFYING.PERCENT_PER_HOUR')}
          />
          <NumberInput
            label="Max Bonus"
            value={config.TGP.UNLIMITED_QUALIFYING.MAX_BONUS}
            path="TGP.UNLIMITED_QUALIFYING.MAX_BONUS"
            isModified={isModified('TGP.UNLIMITED_QUALIFYING.MAX_BONUS')}
            description="Maximum time bonus (20% = 0.2)"
            min={0}
            max={1}
            step={0.05}
            onChange={handleNumberChange}
            hasError={hasError('TGP.UNLIMITED_QUALIFYING.MAX_BONUS')}
          />
          <NumberInput
            label="Min Hours for Multiplier"
            value={config.TGP.UNLIMITED_QUALIFYING.MIN_HOURS_FOR_MULTIPLIER}
            path="TGP.UNLIMITED_QUALIFYING.MIN_HOURS_FOR_MULTIPLIER"
            isModified={isModified('TGP.UNLIMITED_QUALIFYING.MIN_HOURS_FOR_MULTIPLIER')}
            description="Minimum hours to get format multiplier"
            min={1}
            step={1}
            onChange={handleNumberChange}
            hasError={hasError('TGP.UNLIMITED_QUALIFYING.MIN_HOURS_FOR_MULTIPLIER')}
          />
        </ConfigSection>

        {/* TGP Flip Frenzy */}
        <ConfigSection
          title="TGP - Flip Frenzy"
          description="Flip Frenzy format grading divisors"
        >
          <NumberInput
            label="3-Ball Divisor"
            value={config.TGP.FLIP_FRENZY.THREE_BALL_DIVISOR}
            path="TGP.FLIP_FRENZY.THREE_BALL_DIVISOR"
            isModified={isModified('TGP.FLIP_FRENZY.THREE_BALL_DIVISOR')}
            description="Divisor for 3-ball Flip Frenzy"
            min={1}
            step={1}
            onChange={handleNumberChange}
            hasError={hasError('TGP.FLIP_FRENZY.THREE_BALL_DIVISOR')}
          />
          <NumberInput
            label="1-Ball Divisor"
            value={config.TGP.FLIP_FRENZY.ONE_BALL_DIVISOR}
            path="TGP.FLIP_FRENZY.ONE_BALL_DIVISOR"
            isModified={isModified('TGP.FLIP_FRENZY.ONE_BALL_DIVISOR')}
            description="Divisor for 1-ball Flip Frenzy"
            min={1}
            step={1}
            onChange={handleNumberChange}
            hasError={hasError('TGP.FLIP_FRENZY.ONE_BALL_DIVISOR')}
          />
        </ConfigSection>

        {/* TGP Finals Requirements */}
        <ConfigSection
          title="TGP - Finals Requirements"
          description="Finals eligibility percentage constraints"
        >
          <NumberInput
            label="Min Finalists Percent"
            value={config.TGP.FINALS_REQUIREMENTS.MIN_FINALISTS_PERCENT}
            path="TGP.FINALS_REQUIREMENTS.MIN_FINALISTS_PERCENT"
            isModified={isModified('TGP.FINALS_REQUIREMENTS.MIN_FINALISTS_PERCENT')}
            description="Minimum % of participants in finals (10% = 0.1)"
            min={0}
            max={1}
            step={0.05}
            onChange={handleNumberChange}
            hasError={hasError('TGP.FINALS_REQUIREMENTS.MIN_FINALISTS_PERCENT')}
          />
          <NumberInput
            label="Max Finalists Percent"
            value={config.TGP.FINALS_REQUIREMENTS.MAX_FINALISTS_PERCENT}
            path="TGP.FINALS_REQUIREMENTS.MAX_FINALISTS_PERCENT"
            isModified={isModified('TGP.FINALS_REQUIREMENTS.MAX_FINALISTS_PERCENT')}
            description="Maximum % of participants in finals (50% = 0.5)"
            min={0}
            max={1}
            step={0.05}
            onChange={handleNumberChange}
            hasError={hasError('TGP.FINALS_REQUIREMENTS.MAX_FINALISTS_PERCENT')}
          />
        </ConfigSection>

        {/* Event Boosters */}
        <ConfigSection
          title="Event Boosters"
          description="Multipliers for different event certification levels"
        >
          <NumberInput
            label="None"
            value={config.EVENT_BOOSTERS.NONE}
            path="EVENT_BOOSTERS.NONE"
            isModified={isModified('EVENT_BOOSTERS.NONE')}
            description="No booster (baseline 1.0)"
            min={1}
            max={1}
            step={0.01}
            onChange={handleNumberChange}
            hasError={hasError('EVENT_BOOSTERS.NONE')}
          />
          <NumberInput
            label="Certified"
            value={config.EVENT_BOOSTERS.CERTIFIED}
            path="EVENT_BOOSTERS.CERTIFIED"
            isModified={isModified('EVENT_BOOSTERS.CERTIFIED')}
            description="Certified events (125% = 1.25)"
            min={1}
            max={3}
            step={0.05}
            onChange={handleNumberChange}
            hasError={hasError('EVENT_BOOSTERS.CERTIFIED')}
          />
          <NumberInput
            label="Certified Plus"
            value={config.EVENT_BOOSTERS.CERTIFIED_PLUS}
            path="EVENT_BOOSTERS.CERTIFIED_PLUS"
            isModified={isModified('EVENT_BOOSTERS.CERTIFIED_PLUS')}
            description="Certified+ events (150% = 1.5)"
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
            description="Championship Series (150% = 1.5)"
            min={1}
            max={3}
            step={0.05}
            onChange={handleNumberChange}
            hasError={hasError('EVENT_BOOSTERS.CHAMPIONSHIP_SERIES')}
          />
          <NumberInput
            label="Major"
            value={config.EVENT_BOOSTERS.MAJOR}
            path="EVENT_BOOSTERS.MAJOR"
            isModified={isModified('EVENT_BOOSTERS.MAJOR')}
            description="Major championships (200% = 2.0)"
            min={1}
            max={3}
            step={0.05}
            onChange={handleNumberChange}
            hasError={hasError('EVENT_BOOSTERS.MAJOR')}
          />
        </ConfigSection>

        {/* Point Distribution */}
        <ConfigSection
          title="Point Distribution"
          description="Formula constants for distributing points to players"
        >
          <NumberInput
            label="Linear Percentage"
            value={config.POINT_DISTRIBUTION.LINEAR_PERCENTAGE}
            path="POINT_DISTRIBUTION.LINEAR_PERCENTAGE"
            isModified={isModified('POINT_DISTRIBUTION.LINEAR_PERCENTAGE')}
            description="Linear distribution % (10% = 0.1, must sum to 1.0 with dynamic)"
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
            description="Dynamic distribution % (90% = 0.9, must sum to 1.0 with linear)"
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
            description="Exponent for position in dynamic formula"
            min={0}
            max={2}
            step={0.1}
            onChange={handleNumberChange}
            hasError={hasError('POINT_DISTRIBUTION.POSITION_EXPONENT')}
          />
          <NumberInput
            label="Value Exponent"
            value={config.POINT_DISTRIBUTION.VALUE_EXPONENT}
            path="POINT_DISTRIBUTION.VALUE_EXPONENT"
            isModified={isModified('POINT_DISTRIBUTION.VALUE_EXPONENT')}
            description="Exponent for final value calculation"
            min={1}
            max={5}
            step={0.1}
            onChange={handleNumberChange}
            hasError={hasError('POINT_DISTRIBUTION.VALUE_EXPONENT')}
          />
          <NumberInput
            label="Max Dynamic Players"
            value={config.POINT_DISTRIBUTION.MAX_DYNAMIC_PLAYERS}
            path="POINT_DISTRIBUTION.MAX_DYNAMIC_PLAYERS"
            isModified={isModified('POINT_DISTRIBUTION.MAX_DYNAMIC_PLAYERS')}
            description="Maximum players for dynamic calculation cap"
            min={1}
            step={1}
            onChange={handleNumberChange}
            hasError={hasError('POINT_DISTRIBUTION.MAX_DYNAMIC_PLAYERS')}
          />
        </ConfigSection>

        {/* Time Decay */}
        <ConfigSection
          title="Time Decay"
          description="Point value decay over time (must be descending from 1.0 to 0.0)"
        >
          <NumberInput
            label="Year 0-1"
            value={config.TIME_DECAY.YEAR_0_TO_1}
            path="TIME_DECAY.YEAR_0_TO_1"
            isModified={isModified('TIME_DECAY.YEAR_0_TO_1')}
            description="Points worth 100% (must be 1.0)"
            min={1}
            max={1}
            step={0.01}
            onChange={handleNumberChange}
            hasError={hasError('TIME_DECAY.YEAR_0_TO_1')}
          />
          <NumberInput
            label="Year 1-2"
            value={config.TIME_DECAY.YEAR_1_TO_2}
            path="TIME_DECAY.YEAR_1_TO_2"
            isModified={isModified('TIME_DECAY.YEAR_1_TO_2')}
            description="Points worth 75% (0.75)"
            min={0}
            max={1}
            step={0.05}
            onChange={handleNumberChange}
            hasError={hasError('TIME_DECAY.YEAR_1_TO_2')}
          />
          <NumberInput
            label="Year 2-3"
            value={config.TIME_DECAY.YEAR_2_TO_3}
            path="TIME_DECAY.YEAR_2_TO_3"
            isModified={isModified('TIME_DECAY.YEAR_2_TO_3')}
            description="Points worth 50% (0.5)"
            min={0}
            max={1}
            step={0.05}
            onChange={handleNumberChange}
            hasError={hasError('TIME_DECAY.YEAR_2_TO_3')}
          />
          <NumberInput
            label="Year 3+"
            value={config.TIME_DECAY.YEAR_3_PLUS}
            path="TIME_DECAY.YEAR_3_PLUS"
            isModified={isModified('TIME_DECAY.YEAR_3_PLUS')}
            description="Points worth 0% (must be 0.0)"
            min={0}
            max={0}
            step={0.01}
            onChange={handleNumberChange}
            hasError={hasError('TIME_DECAY.YEAR_3_PLUS')}
          />
          <NumberInput
            label="Days Per Year"
            value={config.TIME_DECAY.DAYS_PER_YEAR}
            path="TIME_DECAY.DAYS_PER_YEAR"
            isModified={isModified('TIME_DECAY.DAYS_PER_YEAR')}
            description="Days in a year for calculations"
            min={1}
            step={1}
            onChange={handleNumberChange}
            hasError={hasError('TIME_DECAY.DAYS_PER_YEAR')}
          />
        </ConfigSection>

        {/* Ranking */}
        <ConfigSection
          title="Player Ranking"
          description="Constants for calculating player rankings"
        >
          <NumberInput
            label="Top Events Count"
            value={config.RANKING.TOP_EVENTS_COUNT}
            path="RANKING.TOP_EVENTS_COUNT"
            isModified={isModified('RANKING.TOP_EVENTS_COUNT')}
            description="Number of events that count toward ranking"
            min={1}
            step={1}
            onChange={handleNumberChange}
            hasError={hasError('RANKING.TOP_EVENTS_COUNT')}
          />
          <NumberInput
            label="Entry Ranking Percentile"
            value={config.RANKING.ENTRY_RANKING_PERCENTILE}
            path="RANKING.ENTRY_RANKING_PERCENTILE"
            isModified={isModified('RANKING.ENTRY_RANKING_PERCENTILE')}
            description="Percentile for new player entry ranking (10% = 0.1)"
            min={0}
            max={1}
            step={0.05}
            onChange={handleNumberChange}
            hasError={hasError('RANKING.ENTRY_RANKING_PERCENTILE')}
          />
        </ConfigSection>

        {/* Rating (Glicko) */}
        <ConfigSection
          title="Rating System (Glicko)"
          description="Glicko rating system constants"
        >
          <NumberInput
            label="Default Rating"
            value={config.RATING.DEFAULT_RATING}
            path="RATING.DEFAULT_RATING"
            isModified={isModified('RATING.DEFAULT_RATING')}
            description="Starting rating for new players"
            min={0}
            step={50}
            onChange={handleNumberChange}
            hasError={hasError('RATING.DEFAULT_RATING')}
          />
          <NumberInput
            label="Min RD"
            value={config.RATING.MIN_RD}
            path="RATING.MIN_RD"
            isModified={isModified('RATING.MIN_RD')}
            description="Minimum rating deviation"
            min={1}
            step={1}
            onChange={handleNumberChange}
            hasError={hasError('RATING.MIN_RD')}
          />
          <NumberInput
            label="Max RD"
            value={config.RATING.MAX_RD}
            path="RATING.MAX_RD"
            isModified={isModified('RATING.MAX_RD')}
            description="Maximum rating deviation"
            min={1}
            step={10}
            onChange={handleNumberChange}
            hasError={hasError('RATING.MAX_RD')}
          />
          <NumberInput
            label="RD Decay Per Day"
            value={config.RATING.RD_DECAY_PER_DAY}
            path="RATING.RD_DECAY_PER_DAY"
            isModified={isModified('RATING.RD_DECAY_PER_DAY')}
            description="Rating deviation increase per day inactive"
            min={0}
            step={0.1}
            onChange={handleNumberChange}
            hasError={hasError('RATING.RD_DECAY_PER_DAY')}
          />
          <NumberInput
            label="Opponents Range"
            value={config.RATING.OPPONENTS_RANGE}
            path="RATING.OPPONENTS_RANGE"
            isModified={isModified('RATING.OPPONENTS_RANGE')}
            description="Players above/below used for rating calc"
            min={1}
            step={1}
            onChange={handleNumberChange}
            hasError={hasError('RATING.OPPONENTS_RANGE')}
          />
          <NumberInput
            label="Q Constant"
            value={config.RATING.Q}
            path="RATING.Q"
            isModified={isModified('RATING.Q')}
            description="Glicko system constant (ln(10)/400)"
            min={0}
            step={0.0001}
            onChange={handleNumberChange}
            hasError={hasError('RATING.Q')}
          />
        </ConfigSection>

        {/* Validation */}
        <ConfigSection
          title="Tournament Validation"
          description="Constants for tournament validation rules"
        >
          <NumberInput
            label="Min Players"
            value={config.VALIDATION.MIN_PLAYERS}
            path="VALIDATION.MIN_PLAYERS"
            isModified={isModified('VALIDATION.MIN_PLAYERS')}
            description="Minimum players for sanctioned event"
            min={1}
            step={1}
            onChange={handleNumberChange}
            hasError={hasError('VALIDATION.MIN_PLAYERS')}
          />
          <NumberInput
            label="Min Private Players"
            value={config.VALIDATION.MIN_PRIVATE_PLAYERS}
            path="VALIDATION.MIN_PRIVATE_PLAYERS"
            isModified={isModified('VALIDATION.MIN_PRIVATE_PLAYERS')}
            description="Minimum players for private tournament"
            min={1}
            step={1}
            onChange={handleNumberChange}
            hasError={hasError('VALIDATION.MIN_PRIVATE_PLAYERS')}
          />
          <NumberInput
            label="Max Games Per Machine"
            value={config.VALIDATION.MAX_GAMES_PER_MACHINE}
            path="VALIDATION.MAX_GAMES_PER_MACHINE"
            isModified={isModified('VALIDATION.MAX_GAMES_PER_MACHINE')}
            description="Maximum games per machine per round"
            min={1}
            step={1}
            onChange={handleNumberChange}
            hasError={hasError('VALIDATION.MAX_GAMES_PER_MACHINE')}
          />
          <NumberInput
            label="Min Participation Percent"
            value={config.VALIDATION.MIN_PARTICIPATION_PERCENT}
            path="VALIDATION.MIN_PARTICIPATION_PERCENT"
            isModified={isModified('VALIDATION.MIN_PARTICIPATION_PERCENT')}
            description="Minimum participation % for inclusion (50% = 0.5)"
            min={0}
            max={1}
            step={0.05}
            onChange={handleNumberChange}
            hasError={hasError('VALIDATION.MIN_PARTICIPATION_PERCENT')}
          />
        </ConfigSection>
      </div>
    </div>
  );
}
