import { describe, it, expect } from 'vitest';
import {
  getEventBoosterMultiplier,
  qualifiesForCertified,
  qualifiesForCertifiedPlus,
  determineEventBooster,
  applyEventBooster,
} from '../src/event-boosters.js';
import { EVENT_BOOSTERS } from '../src/constants.js';

describe('getEventBoosterMultiplier', () => {
  it('should return correct multiplier for none', () => {
    expect(getEventBoosterMultiplier('none')).toBe(EVENT_BOOSTERS.NONE);
    expect(getEventBoosterMultiplier('none')).toBe(1.0);
  });

  it('should return correct multiplier for certified', () => {
    expect(getEventBoosterMultiplier('certified')).toBe(EVENT_BOOSTERS.CERTIFIED);
    expect(getEventBoosterMultiplier('certified')).toBe(1.25);
  });

  it('should return correct multiplier for certified-plus', () => {
    expect(getEventBoosterMultiplier('certified-plus')).toBe(EVENT_BOOSTERS.CERTIFIED_PLUS);
    expect(getEventBoosterMultiplier('certified-plus')).toBe(1.5);
  });

  it('should return correct multiplier for championship-series', () => {
    expect(getEventBoosterMultiplier('championship-series')).toBe(
      EVENT_BOOSTERS.CHAMPIONSHIP_SERIES
    );
    expect(getEventBoosterMultiplier('championship-series')).toBe(1.5);
  });

  it('should return correct multiplier for major', () => {
    expect(getEventBoosterMultiplier('major')).toBe(EVENT_BOOSTERS.MAJOR);
    expect(getEventBoosterMultiplier('major')).toBe(2.0);
  });
});

describe('qualifiesForCertified', () => {
  it('should return true for valid certified event', () => {
    const result = qualifiesForCertified(
      50, // ratedPlayerCount (not checked for Certified)
      true, // hasValidQualifying
      true, // hasValidFinals
      24, // finalistCount (minimum)
      4 // durationDays (maximum)
    );
    expect(result).toBe(true);
  });

  it('should return true for event with more than 24 finalists', () => {
    const result = qualifiesForCertified(50, true, true, 32, 3);
    expect(result).toBe(true);
  });

  it('should return true for event with fewer than 4 days', () => {
    const result = qualifiesForCertified(50, true, true, 24, 1);
    expect(result).toBe(true);
  });

  it('should return false for too few finalists', () => {
    const result = qualifiesForCertified(50, true, true, 23, 3);
    expect(result).toBe(false);
  });

  it('should return false for too many days', () => {
    const result = qualifiesForCertified(50, true, true, 24, 5);
    expect(result).toBe(false);
  });

  it('should return false without valid qualifying', () => {
    const result = qualifiesForCertified(50, false, true, 24, 3);
    expect(result).toBe(false);
  });

  it('should return false without valid finals', () => {
    const result = qualifiesForCertified(50, true, false, 24, 3);
    expect(result).toBe(false);
  });

  it('should return false without valid qualifying or finals', () => {
    const result = qualifiesForCertified(50, false, false, 24, 3);
    expect(result).toBe(false);
  });

  it('should return false if multiple requirements fail', () => {
    const result = qualifiesForCertified(50, false, false, 20, 5);
    expect(result).toBe(false);
  });

  it('should ignore rated player count (not checked for Certified)', () => {
    // Certified doesn't check rated player count, only Certified+ does
    const result1 = qualifiesForCertified(0, true, true, 24, 3);
    const result2 = qualifiesForCertified(1000, true, true, 24, 3);
    expect(result1).toBe(true);
    expect(result2).toBe(true);
  });

  it('should handle edge case at finalistCount threshold', () => {
    expect(qualifiesForCertified(50, true, true, 23, 3)).toBe(false);
    expect(qualifiesForCertified(50, true, true, 24, 3)).toBe(true);
  });

  it('should handle edge case at duration threshold', () => {
    expect(qualifiesForCertified(50, true, true, 24, 4)).toBe(true);
    expect(qualifiesForCertified(50, true, true, 24, 5)).toBe(false);
  });
});

describe('qualifiesForCertifiedPlus', () => {
  it('should return true for valid certified+ event', () => {
    const result = qualifiesForCertifiedPlus(
      128, // ratedPlayerCount (minimum)
      true, // hasValidQualifying
      true, // hasValidFinals
      24, // finalistCount (minimum)
      4 // durationDays (maximum)
    );
    expect(result).toBe(true);
  });

  it('should return true for event with more than 128 rated players', () => {
    const result = qualifiesForCertifiedPlus(200, true, true, 32, 3);
    expect(result).toBe(true);
  });

  it('should return false for too few rated players', () => {
    const result = qualifiesForCertifiedPlus(127, true, true, 24, 3);
    expect(result).toBe(false);
  });

  it('should return false if certified requirements not met', () => {
    // Even with enough rated players, must meet Certified requirements
    const result = qualifiesForCertifiedPlus(128, true, true, 20, 3);
    expect(result).toBe(false);
  });

  it('should return false for too few finalists', () => {
    const result = qualifiesForCertifiedPlus(128, true, true, 23, 3);
    expect(result).toBe(false);
  });

  it('should return false for too many days', () => {
    const result = qualifiesForCertifiedPlus(128, true, true, 24, 5);
    expect(result).toBe(false);
  });

  it('should return false without valid qualifying', () => {
    const result = qualifiesForCertifiedPlus(128, false, true, 24, 3);
    expect(result).toBe(false);
  });

  it('should return false without valid finals', () => {
    const result = qualifiesForCertifiedPlus(128, true, false, 24, 3);
    expect(result).toBe(false);
  });

  it('should return false if all requirements fail', () => {
    const result = qualifiesForCertifiedPlus(50, false, false, 20, 5);
    expect(result).toBe(false);
  });

  it('should handle edge case at rated player threshold', () => {
    expect(qualifiesForCertifiedPlus(127, true, true, 24, 3)).toBe(false);
    expect(qualifiesForCertifiedPlus(128, true, true, 24, 3)).toBe(true);
  });

  it('should require both rated players AND certified requirements', () => {
    // Has rated players but fails Certified requirements
    expect(qualifiesForCertifiedPlus(128, false, true, 24, 3)).toBe(false);
    // Meets Certified requirements but not enough rated players
    expect(qualifiesForCertifiedPlus(127, true, true, 24, 3)).toBe(false);
  });
});

describe('determineEventBooster', () => {
  it('should return certified-plus for qualifying event', () => {
    const result = determineEventBooster(128, true, true, 24, 3);
    expect(result).toBe('certified-plus');
  });

  it('should return certified for event without enough rated players', () => {
    const result = determineEventBooster(100, true, true, 24, 3);
    expect(result).toBe('certified');
  });

  it('should return none for event not meeting any certification', () => {
    const result = determineEventBooster(50, true, true, 20, 3);
    expect(result).toBe('none');
  });

  it('should prioritize certified-plus over certified', () => {
    // Event qualifies for both, should return certified-plus
    const result = determineEventBooster(200, true, true, 32, 2);
    expect(result).toBe('certified-plus');
  });

  it('should return certified when rated player requirement fails', () => {
    // Just below the Certified+ threshold
    const result = determineEventBooster(127, true, true, 24, 3);
    expect(result).toBe('certified');
  });

  it('should return none when finalist count too low', () => {
    const result = determineEventBooster(200, true, true, 23, 3);
    expect(result).toBe('none');
  });

  it('should return none when duration too long', () => {
    const result = determineEventBooster(200, true, true, 24, 5);
    expect(result).toBe('none');
  });

  it('should return none when qualifying invalid', () => {
    const result = determineEventBooster(200, false, true, 24, 3);
    expect(result).toBe('none');
  });

  it('should return none when finals invalid', () => {
    const result = determineEventBooster(200, true, false, 24, 3);
    expect(result).toBe('none');
  });

  it('should return none when all requirements fail', () => {
    const result = determineEventBooster(50, false, false, 10, 10);
    expect(result).toBe('none');
  });

  it('should handle edge cases at thresholds', () => {
    // Just at Certified+ threshold
    expect(determineEventBooster(128, true, true, 24, 4)).toBe('certified-plus');
    // Just below Certified+ threshold
    expect(determineEventBooster(127, true, true, 24, 4)).toBe('certified');
    // Just below Certified threshold (finalists)
    expect(determineEventBooster(127, true, true, 23, 4)).toBe('none');
  });
});

describe('applyEventBooster', () => {
  it('should apply none booster correctly', () => {
    const result = applyEventBooster(100, 'none');
    expect(result).toBe(100);
  });

  it('should apply certified booster correctly', () => {
    const result = applyEventBooster(100, 'certified');
    expect(result).toBe(125); // 100 * 1.25
  });

  it('should apply certified-plus booster correctly', () => {
    const result = applyEventBooster(100, 'certified-plus');
    expect(result).toBe(150); // 100 * 1.5
  });

  it('should apply championship-series booster correctly', () => {
    const result = applyEventBooster(100, 'championship-series');
    expect(result).toBe(150); // 100 * 1.5
  });

  it('should apply major booster correctly', () => {
    const result = applyEventBooster(100, 'major');
    expect(result).toBe(200); // 100 * 2.0
  });

  it('should handle decimal base values', () => {
    const result = applyEventBooster(75.5, 'certified');
    expect(result).toBeCloseTo(94.375, 2);
  });

  it('should handle zero base value', () => {
    const result = applyEventBooster(0, 'major');
    expect(result).toBe(0);
  });

  it('should handle large base values', () => {
    const result = applyEventBooster(1000, 'major');
    expect(result).toBe(2000);
  });

  it('should correctly multiply realistic tournament values', () => {
    // Realistic example: (base 32 + TVA 50) * TGP 1.5 = 123
    const baseValue = 123;

    expect(applyEventBooster(baseValue, 'none')).toBe(123);
    expect(applyEventBooster(baseValue, 'certified')).toBe(153.75);
    expect(applyEventBooster(baseValue, 'certified-plus')).toBe(184.5);
    expect(applyEventBooster(baseValue, 'major')).toBe(246);
  });

  it('should preserve precision for chained calculations', () => {
    const base = 50;
    const tgp = 1.5;
    const preBooster = base * tgp; // 75

    const result = applyEventBooster(preBooster, 'certified-plus');
    expect(result).toBe(112.5); // 75 * 1.5
  });

  it('should handle very small values', () => {
    const result = applyEventBooster(0.01, 'major');
    expect(result).toBe(0.02);
  });
});
