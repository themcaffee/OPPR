import { useState, useEffect, useCallback } from 'react';
import { configureOPPR, resetConfig, getDefaultConfig } from '@opprs/core';
import type { OPPRConfig } from '@opprs/core';

const STORAGE_KEY = 'oppr-demo-config';

/**
 * Validation error type
 */
export interface ValidationError {
  field: string;
  message: string;
  suggestedValue?: number;
}

/**
 * Deep partial type for configuration
 */
type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type PartialOPPRConfig = DeepPartial<OPPRConfig>;

/**
 * Deep merge utility function
 */
function deepMerge<T>(target: T, source: DeepPartial<T>): T {
  const result = { ...target };

  for (const key in source) {
    const sourceValue = source[key];
    const targetValue = result[key];

    if (
      sourceValue !== undefined &&
      targetValue !== null &&
      typeof targetValue === 'object' &&
      !Array.isArray(targetValue) &&
      typeof sourceValue === 'object' &&
      !Array.isArray(sourceValue)
    ) {
      result[key] = deepMerge(targetValue, sourceValue as DeepPartial<typeof targetValue>);
    } else if (sourceValue !== undefined) {
      result[key] = sourceValue as T[Extract<keyof T, string>];
    }
  }

  return result;
}

/**
 * Auto-calculate derived configuration values from core parameters
 */
function calculateDerivedValues(partial: PartialOPPRConfig): PartialOPPRConfig {
  const derived: PartialOPPRConfig = { ...partial };

  // Fixed constants that should never change
  const FIXED_CONSTANTS = {
    POINTS_PER_PLAYER: 0.5,
    BASE_GAME_VALUE: 0.04,
    PERFECT_RATING: 2000,
    RATED_PLAYER_THRESHOLD: 5,
    THREE_PLUS_BALL: 1,
    NONE_BOOSTER: 1,
    YEAR_0_TO_1: 1,
    YEAR_3_PLUS: 0,
    DAYS_PER_YEAR: 365,
    Q: Math.LN10 / 400,
  };

  // Initialize nested objects if they don't exist
  if (!derived.BASE_VALUE) derived.BASE_VALUE = {};
  if (!derived.TGP) derived.TGP = {};
  if (!derived.TGP.BALL_ADJUSTMENTS) derived.TGP.BALL_ADJUSTMENTS = {};
  if (!derived.TVA) derived.TVA = {};
  if (!derived.TVA.RATING) derived.TVA.RATING = {};
  if (!derived.TVA.RANKING) derived.TVA.RANKING = {};
  if (!derived.EVENT_BOOSTERS) derived.EVENT_BOOSTERS = {};
  if (!derived.TIME_DECAY) derived.TIME_DECAY = {};

  // Apply fixed constants
  derived.BASE_VALUE.POINTS_PER_PLAYER = FIXED_CONSTANTS.POINTS_PER_PLAYER;
  derived.BASE_VALUE.RATED_PLAYER_THRESHOLD = FIXED_CONSTANTS.RATED_PLAYER_THRESHOLD;
  derived.TGP.BASE_GAME_VALUE = FIXED_CONSTANTS.BASE_GAME_VALUE;
  derived.TGP.BALL_ADJUSTMENTS.THREE_PLUS_BALL = FIXED_CONSTANTS.THREE_PLUS_BALL;
  derived.TVA.RATING.PERFECT_RATING = FIXED_CONSTANTS.PERFECT_RATING;
  derived.EVENT_BOOSTERS.NONE = FIXED_CONSTANTS.NONE_BOOSTER;
  derived.TIME_DECAY.YEAR_0_TO_1 = FIXED_CONSTANTS.YEAR_0_TO_1;
  derived.TIME_DECAY.YEAR_3_PLUS = FIXED_CONSTANTS.YEAR_3_PLUS;
  derived.TIME_DECAY.DAYS_PER_YEAR = FIXED_CONSTANTS.DAYS_PER_YEAR;

  // Get default config to fill in missing values
  const defaults = getDefaultConfig();

  // Calculate MAX_PLAYER_COUNT from MAX_BASE_VALUE
  const maxBaseValue = partial.BASE_VALUE?.MAX_BASE_VALUE ?? defaults.BASE_VALUE.MAX_BASE_VALUE;
  derived.BASE_VALUE.MAX_PLAYER_COUNT = maxBaseValue / FIXED_CONSTANTS.POINTS_PER_PLAYER;

  // Calculate MAX_GAMES_FOR_200_PERCENT from MAX_WITH_FINALS
  const maxWithFinals = partial.TGP?.MAX_WITH_FINALS ?? defaults.TGP.MAX_WITH_FINALS;
  derived.TGP.MAX_GAMES_FOR_200_PERCENT = maxWithFinals / FIXED_CONSTANTS.BASE_GAME_VALUE;

  // Calculate TVA Rating coefficients
  const ratingMaxValue = partial.TVA?.RATING?.MAX_VALUE ?? defaults.TVA.RATING.MAX_VALUE;
  const maxPlayersConsidered = partial.TVA?.MAX_PLAYERS_CONSIDERED ?? defaults.TVA.MAX_PLAYERS_CONSIDERED;

  const perPlayerContribution = ratingMaxValue / maxPlayersConsidered;
  const zeroRating = FIXED_CONSTANTS.PERFECT_RATING * (9 / 14); // 64.3% of perfect rating
  const ratingCoefficient = perPlayerContribution / (FIXED_CONSTANTS.PERFECT_RATING - zeroRating);
  const ratingOffset = zeroRating * ratingCoefficient;

  derived.TVA.RATING.COEFFICIENT = ratingCoefficient;
  derived.TVA.RATING.OFFSET = ratingOffset;
  derived.TVA.RATING.MIN_EFFECTIVE_RATING = zeroRating;

  // Calculate TVA Ranking coefficients (scale from defaults)
  const rankingMaxValue = partial.TVA?.RANKING?.MAX_VALUE ?? defaults.TVA.RANKING.MAX_VALUE;
  const rankingScale = rankingMaxValue / 50; // 50 is the baseline MAX_VALUE

  derived.TVA.RANKING.COEFFICIENT = -0.211675054 * rankingScale;
  derived.TVA.RANKING.OFFSET = 1.459827968 * rankingScale;

  return derived;
}

/**
 * Hook for managing OPPR configuration with validation and persistence
 */
export function useConfiguration() {
  const [config, setConfig] = useState<OPPRConfig>(getDefaultConfig());
  const [userOverrides, setUserOverrides] = useState<PartialOPPRConfig>({});
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);

  // Validate configuration
  const validateConfig = useCallback((cfg: OPPRConfig): ValidationError[] => {
    const errors: ValidationError[] = [];

    // Point Distribution: LINEAR + DYNAMIC must equal 1.0
    const totalPercentage = cfg.POINT_DISTRIBUTION.LINEAR_PERCENTAGE + cfg.POINT_DISTRIBUTION.DYNAMIC_PERCENTAGE;
    if (Math.abs(totalPercentage - 1.0) > 0.001) {
      errors.push({
        field: 'POINT_DISTRIBUTION.LINEAR_PERCENTAGE',
        message: `Linear + Dynamic percentages must equal 1.0 (currently ${totalPercentage.toFixed(3)})`,
        suggestedValue: 1.0 - cfg.POINT_DISTRIBUTION.DYNAMIC_PERCENTAGE,
      });
    }

    // TGP: MAX_WITH_FINALS must be greater than MAX_WITHOUT_FINALS
    if (cfg.TGP.MAX_WITH_FINALS <= cfg.TGP.MAX_WITHOUT_FINALS) {
      errors.push({
        field: 'TGP.MAX_WITH_FINALS',
        message: 'Max TGP with finals must be greater than without finals',
        suggestedValue: cfg.TGP.MAX_WITHOUT_FINALS + 0.5,
      });
    }

    // Base Value: MAX_PLAYER_COUNT should equal max that can be achieved
    const maxPlayersByPoints = cfg.BASE_VALUE.MAX_BASE_VALUE / cfg.BASE_VALUE.POINTS_PER_PLAYER;
    if (cfg.BASE_VALUE.MAX_PLAYER_COUNT !== maxPlayersByPoints) {
      errors.push({
        field: 'BASE_VALUE.MAX_PLAYER_COUNT',
        message: `Should equal MAX_BASE_VALUE / POINTS_PER_PLAYER (${maxPlayersByPoints})`,
        suggestedValue: maxPlayersByPoints,
      });
    }

    // TGP: Ball adjustments should be in valid range
    if (cfg.TGP.BALL_ADJUSTMENTS.ONE_BALL <= 0 || cfg.TGP.BALL_ADJUSTMENTS.ONE_BALL > 1) {
      errors.push({
        field: 'TGP.BALL_ADJUSTMENTS.ONE_BALL',
        message: 'Ball adjustment must be between 0 and 1',
        suggestedValue: 0.33,
      });
    }
    if (cfg.TGP.BALL_ADJUSTMENTS.TWO_BALL <= 0 || cfg.TGP.BALL_ADJUSTMENTS.TWO_BALL > 1) {
      errors.push({
        field: 'TGP.BALL_ADJUSTMENTS.TWO_BALL',
        message: 'Ball adjustment must be between 0 and 1',
        suggestedValue: 0.66,
      });
    }

    // Event Boosters: Should be in ascending order and >= 1.0
    const boosters = [
      cfg.EVENT_BOOSTERS.NONE,
      cfg.EVENT_BOOSTERS.CERTIFIED,
      cfg.EVENT_BOOSTERS.CERTIFIED_PLUS,
      cfg.EVENT_BOOSTERS.MAJOR,
    ];

    if (cfg.EVENT_BOOSTERS.NONE !== 1.0) {
      errors.push({
        field: 'EVENT_BOOSTERS.NONE',
        message: 'None booster must be 1.0 (no boost)',
        suggestedValue: 1.0,
      });
    }

    for (let i = 1; i < boosters.length; i++) {
      if (boosters[i] < boosters[i - 1]) {
        const boosterNames = ['NONE', 'CERTIFIED', 'CERTIFIED_PLUS', 'MAJOR'];
        errors.push({
          field: `EVENT_BOOSTERS.${boosterNames[i]}`,
          message: `Event boosters should be in ascending order`,
          suggestedValue: boosters[i - 1] + 0.25,
        });
      }
    }

    // Time Decay: Should be in descending order from 1.0 to 0.0
    if (cfg.TIME_DECAY.YEAR_0_TO_1 !== 1.0) {
      errors.push({
        field: 'TIME_DECAY.YEAR_0_TO_1',
        message: 'First year decay must be 1.0 (100%)',
        suggestedValue: 1.0,
      });
    }

    if (cfg.TIME_DECAY.YEAR_1_TO_2 > cfg.TIME_DECAY.YEAR_0_TO_1 || cfg.TIME_DECAY.YEAR_1_TO_2 < 0) {
      errors.push({
        field: 'TIME_DECAY.YEAR_1_TO_2',
        message: 'Year 1-2 decay must be between 0 and year 0-1 decay',
        suggestedValue: 0.75,
      });
    }

    if (cfg.TIME_DECAY.YEAR_2_TO_3 > cfg.TIME_DECAY.YEAR_1_TO_2 || cfg.TIME_DECAY.YEAR_2_TO_3 < 0) {
      errors.push({
        field: 'TIME_DECAY.YEAR_2_TO_3',
        message: 'Year 2-3 decay must be between 0 and year 1-2 decay',
        suggestedValue: 0.5,
      });
    }

    if (cfg.TIME_DECAY.YEAR_3_PLUS !== 0.0) {
      errors.push({
        field: 'TIME_DECAY.YEAR_3_PLUS',
        message: 'Year 3+ decay must be 0.0 (expired)',
        suggestedValue: 0.0,
      });
    }

    // Validation: Positive minimums
    if (cfg.VALIDATION.MIN_PLAYERS < 1) {
      errors.push({
        field: 'VALIDATION.MIN_PLAYERS',
        message: 'Minimum players must be at least 1',
        suggestedValue: 3,
      });
    }

    // TVA: Rating coefficient relationship
    // TVA from perfect rating should not exceed max
    const tvaFromPerfectRating = (cfg.TVA.RATING.PERFECT_RATING * cfg.TVA.RATING.COEFFICIENT) - cfg.TVA.RATING.OFFSET;
    if (tvaFromPerfectRating > cfg.TVA.RATING.MAX_VALUE / 64) {
      errors.push({
        field: 'TVA.RATING.COEFFICIENT',
        message: 'Rating coefficient may produce values exceeding max TVA',
      });
    }

    // Finals requirements
    if (cfg.TGP.FINALS_REQUIREMENTS.MIN_FINALISTS_PERCENT >= cfg.TGP.FINALS_REQUIREMENTS.MAX_FINALISTS_PERCENT) {
      errors.push({
        field: 'TGP.FINALS_REQUIREMENTS.MAX_FINALISTS_PERCENT',
        message: 'Max finalists percentage must be greater than min',
        suggestedValue: cfg.TGP.FINALS_REQUIREMENTS.MIN_FINALISTS_PERCENT + 0.1,
      });
    }

    return errors;
  }, []);

  // Update configuration
  const updateConfig = useCallback((partial: PartialOPPRConfig) => {
    setUserOverrides(prev => {
      // Merge user input with previous overrides
      const newOverrides = deepMerge(prev, partial);

      // Auto-calculate derived values
      const withDerived = calculateDerivedValues(newOverrides);

      // Merge with defaults to get full config
      const defaults = getDefaultConfig();
      const merged = deepMerge(defaults, withDerived);

      // Validate the new configuration
      const errors = validateConfig(merged);
      setValidationErrors(errors);

      // Only apply if no validation errors
      if (errors.length === 0) {
        configureOPPR(withDerived);
        setConfig(merged);

        // Save to localStorage (save user overrides, not derived values)
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(newOverrides));
        } catch (e) {
          console.error('Failed to save config to localStorage:', e);
        }
      }

      return newOverrides;
    });
  }, [validateConfig]);

  // Reset to defaults
  const reset = useCallback(() => {
    resetConfig();
    setUserOverrides({});
    setConfig(getDefaultConfig());
    setValidationErrors([]);

    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      console.error('Failed to clear config from localStorage:', e);
    }
  }, []);

  // Export configuration
  const exportConfig = useCallback(() => {
    // Export full config including derived values for completeness
    const dataStr = JSON.stringify(config, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);

    const exportFileDefaultName = 'oppr-config.json';

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  }, [config]);

  // Import configuration
  const importConfig = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const imported = JSON.parse(e.target?.result as string);
        updateConfig(imported);
      } catch (error) {
        console.error('Failed to import config:', error);
        alert('Failed to import configuration file. Please check the file format.');
      }
    };
    reader.readAsText(file);
  }, [updateConfig]);

  // Encode config to URL
  const encodeToURL = useCallback(() => {
    const encoded = encodeURIComponent(JSON.stringify(userOverrides));
    const url = new URL(window.location.href);
    url.searchParams.set('config', encoded);
    return url.toString();
  }, [userOverrides]);

  // Copy URL to clipboard
  const copyURLToClipboard = useCallback(async () => {
    const url = encodeToURL();
    try {
      await navigator.clipboard.writeText(url);
      return true;
    } catch (error) {
      console.error('Failed to copy URL:', error);
      return false;
    }
  }, [encodeToURL]);

  // Check if value is modified from default
  const isModified = useCallback((path: string): boolean => {
    const parts = path.split('.');
    let current: unknown = userOverrides;

    for (const part of parts) {
      if (current && typeof current === 'object' && part in current) {
        current = (current as Record<string, unknown>)[part];
      } else {
        return false;
      }
    }

    return current !== undefined;
  }, [userOverrides]);

  // Get value at path
  const getValue = useCallback((path: string): unknown => {
    const parts = path.split('.');
    let current: unknown = config;

    for (const part of parts) {
      if (current && typeof current === 'object' && part in current) {
        current = (current as Record<string, unknown>)[part];
      } else {
        return undefined;
      }
    }

    return current;
  }, [config]);

  // Load from localStorage on mount
  useEffect(() => {
    // Check URL params first
    const urlParams = new URLSearchParams(window.location.search);
    const configParam = urlParams.get('config');

    if (configParam) {
      try {
        const decoded = JSON.parse(decodeURIComponent(configParam));
        updateConfig(decoded);
        return;
      } catch (error) {
        console.error('Failed to load config from URL:', error);
      }
    }

    // Fall back to localStorage
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        updateConfig(parsed);
      }
    } catch (error) {
      console.error('Failed to load config from localStorage:', error);
    }
    // This effect intentionally runs only once on mount to load initial config from URL params or localStorage
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    config,
    userOverrides,
    validationErrors,
    updateConfig,
    reset,
    exportConfig,
    importConfig,
    encodeToURL,
    copyURLToClipboard,
    isModified,
    getValue,
  };
}
