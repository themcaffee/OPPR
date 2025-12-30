import { useState, useEffect, useCallback } from 'react';
import { configureOPPR, resetConfig, getDefaultConfig } from 'oppr';
import type { OPPRConfig } from 'oppr';

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
 * Hook for managing OPPR configuration with validation and persistence
 */
export function useConfiguration() {
  const [config, setConfig] = useState<OPPRConfig>(getDefaultConfig());
  const [userOverrides, setUserOverrides] = useState<PartialOPPRConfig>({});
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);

  // Deep merge utility
  const deepMerge = useCallback(<T,>(target: T, source: DeepPartial<T>): T => {
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
  }, []);

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

    // Rating: MAX_RD must be greater than MIN_RD
    if (cfg.RATING.MAX_RD <= cfg.RATING.MIN_RD) {
      errors.push({
        field: 'RATING.MAX_RD',
        message: 'Max rating deviation must be greater than min rating deviation',
        suggestedValue: cfg.RATING.MIN_RD + 50,
      });
    }

    // Rating: RD values must be positive
    if (cfg.RATING.MIN_RD <= 0) {
      errors.push({
        field: 'RATING.MIN_RD',
        message: 'Min rating deviation must be positive',
        suggestedValue: 10,
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
      const newOverrides = deepMerge(prev, partial);
      const defaults = getDefaultConfig();
      const merged = deepMerge(defaults, newOverrides);

      // Validate the new configuration
      const errors = validateConfig(merged);
      setValidationErrors(errors);

      // Only apply if no validation errors
      if (errors.length === 0) {
        configureOPPR(newOverrides);
        setConfig(merged);

        // Save to localStorage
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(newOverrides));
        } catch (e) {
          console.error('Failed to save config to localStorage:', e);
        }
      }

      return newOverrides;
    });
  }, [deepMerge, validateConfig]);

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
    const dataStr = JSON.stringify(userOverrides, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);

    const exportFileDefaultName = 'oppr-config.json';

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  }, [userOverrides]);

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
    let current: any = userOverrides;

    for (const part of parts) {
      if (current && typeof current === 'object' && part in current) {
        current = current[part];
      } else {
        return false;
      }
    }

    return current !== undefined;
  }, [userOverrides]);

  // Get value at path
  const getValue = useCallback((path: string): any => {
    const parts = path.split('.');
    let current: any = config;

    for (const part of parts) {
      if (current && typeof current === 'object' && part in current) {
        current = current[part];
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
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

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
