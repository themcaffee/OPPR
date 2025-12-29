import { describe, it, expect } from 'vitest';
import {
  calculateQualifyingTGP,
  calculateFinalsTGP,
  calculateTGP,
  calculateUnlimitedCardTGP,
  calculateFlipFrenzyTGP,
  validateFinalsEligibility,
} from '../src/tgp.js';
import type { TGPConfig } from '../src/types.js';
import { TGP } from '../src/constants.js';

describe('calculateQualifyingTGP', () => {
  it('should return 0 for no qualifying', () => {
    const config: TGPConfig = {
      qualifying: {
        type: 'none',
        meaningfulGames: 0,
      },
      finals: {
        formatType: 'match-play',
        meaningfulGames: 12,
      },
    };

    const tgp = calculateQualifyingTGP(config);
    expect(tgp).toBe(0);
  });

  it('should calculate limited qualifying TGP', () => {
    const config: TGPConfig = {
      qualifying: {
        type: 'limited',
        meaningfulGames: 7,
      },
      finals: {
        formatType: 'match-play',
        meaningfulGames: 12,
      },
    };

    const tgp = calculateQualifyingTGP(config);
    expect(tgp).toBeCloseTo(0.28, 2); // 7 * 4% = 28%
  });

  it('should apply 4-player group multiplier', () => {
    const config: TGPConfig = {
      qualifying: {
        type: 'limited',
        meaningfulGames: 10,
        fourPlayerGroups: true,
      },
      finals: {
        formatType: 'match-play',
        meaningfulGames: 12,
      },
    };

    const tgp = calculateQualifyingTGP(config);
    expect(tgp).toBeCloseTo(0.8, 2); // 10 * 4% * 2 = 80%
  });

  it('should handle unlimited qualifying with time bonus', () => {
    const config: TGPConfig = {
      qualifying: {
        type: 'unlimited',
        meaningfulGames: 5,
        hours: 20,
      },
      finals: {
        formatType: 'match-play',
        meaningfulGames: 12,
      },
    };

    const tgp = calculateQualifyingTGP(config);
    // 5 * 4% * 2 (unlimited multiplier) + 20% (time bonus)
    expect(tgp).toBeCloseTo(0.6, 1); // 40% + 20% = 60%
  });

  it('should handle hybrid qualifying', () => {
    const config: TGPConfig = {
      qualifying: {
        type: 'hybrid',
        meaningfulGames: 5,
      },
      finals: {
        formatType: 'match-play',
        meaningfulGames: 12,
      },
    };

    const tgp = calculateQualifyingTGP(config);
    expect(tgp).toBeCloseTo(0.6, 2); // 5 * 4% * 3 = 60%
  });
});

describe('calculateFinalsTGP', () => {
  it('should calculate finals TGP', () => {
    const config: TGPConfig = {
      qualifying: {
        type: 'none',
        meaningfulGames: 0,
      },
      finals: {
        formatType: 'match-play',
        meaningfulGames: 12,
      },
    };

    const tgp = calculateFinalsTGP(config);
    expect(tgp).toBeCloseTo(0.48, 2); // 12 * 4% = 48%
  });

  it('should apply 4-player group multiplier for finals', () => {
    const config: TGPConfig = {
      qualifying: {
        type: 'none',
        meaningfulGames: 0,
      },
      finals: {
        formatType: 'match-play',
        meaningfulGames: 12,
        fourPlayerGroups: true,
      },
    };

    const tgp = calculateFinalsTGP(config);
    expect(tgp).toBeCloseTo(0.96, 2); // 12 * 4% * 2 = 96%
  });
});

describe('calculateTGP', () => {
  it('should cap at 100% for events without qualifying', () => {
    const config: TGPConfig = {
      qualifying: {
        type: 'none',
        meaningfulGames: 0,
      },
      finals: {
        formatType: 'strike-format',
        meaningfulGames: 30, // Would be 120% but capped
      },
    };

    const tgp = calculateTGP(config);
    expect(tgp).toBe(1.0); // Capped at 100%
  });

  it('should allow up to 200% with qualifying and finals', () => {
    const config: TGPConfig = {
      qualifying: {
        type: 'limited',
        meaningfulGames: 25,
        fourPlayerGroups: true,
      },
      finals: {
        formatType: 'match-play',
        meaningfulGames: 25,
        fourPlayerGroups: true,
      },
    };

    const tgp = calculateTGP(config);
    // Qualifying: 25 * 4% * 2 = 200%
    // Finals: 25 * 4% * 2 = 200%
    // Total: 400%, capped at 200%
    expect(tgp).toBe(2.0);
  });

  it('should sum qualifying and finals TGP', () => {
    const config: TGPConfig = {
      qualifying: {
        type: 'limited',
        meaningfulGames: 7,
      },
      finals: {
        formatType: 'match-play',
        meaningfulGames: 12,
        fourPlayerGroups: true,
      },
    };

    const tgp = calculateTGP(config);
    // Qualifying: 7 * 4% = 28%
    // Finals: 12 * 4% * 2 = 96%
    // Total: 124%
    expect(tgp).toBeCloseTo(1.24, 2);
  });
});

describe('calculateUnlimitedCardTGP', () => {
  it('should calculate TGP with 4X multiplier when hours >= 20', () => {
    const tgp = calculateUnlimitedCardTGP(5, 20, 10);
    // Qualifying: 5 * 4% * 4 (card multiplier) = 80%
    // Time bonus: 20 * 1% = 20%
    // Qualifying total: 100%
    // Finals: 10 * 4% = 40%
    // Total: 140%
    expect(tgp).toBeCloseTo(1.4, 2);
  });

  it('should apply 4X multiplier only when hours meet minimum threshold', () => {
    const tgp = calculateUnlimitedCardTGP(5, 19, 10);
    // Qualifying: 5 * 4% = 20% (no 4X multiplier)
    // Time bonus: 19 * 1% = 19%
    // Qualifying total: 39%
    // Finals: 10 * 4% = 40%
    // Total: 79%
    expect(tgp).toBeCloseTo(0.79, 2);
  });

  it('should cap time bonus at 20%', () => {
    const tgp = calculateUnlimitedCardTGP(5, 50, 10);
    // Qualifying: 5 * 4% * 4 = 80%
    // Time bonus: capped at 20% (not 50%)
    // Qualifying total: 100%
    // Finals: 10 * 4% = 40%
    // Total: 140%
    expect(tgp).toBeCloseTo(1.4, 2);
  });

  it('should cap total TGP at 200%', () => {
    const tgp = calculateUnlimitedCardTGP(25, 30, 25);
    // Qualifying: 25 * 4% * 4 = 400%
    // Time bonus: 20% (capped)
    // Qualifying total: 420%
    // Finals: 25 * 4% = 100%
    // Total: 520%, capped at 200%
    expect(tgp).toBe(2.0);
  });

  it('should handle zero meaningful games', () => {
    const tgp = calculateUnlimitedCardTGP(0, 20, 10);
    // Qualifying: 0 * 4% * 4 = 0%
    // Time bonus: 20%
    // Finals: 10 * 4% = 40%
    // Total: 60%
    expect(tgp).toBeCloseTo(0.6, 2);
  });

  it('should handle zero finals games', () => {
    const tgp = calculateUnlimitedCardTGP(5, 20, 0);
    // Qualifying: 5 * 4% * 4 = 80%
    // Time bonus: 20%
    // Total: 100%
    expect(tgp).toBeCloseTo(1.0, 2);
  });

  it('should handle minimum hours for multiplier threshold', () => {
    const tgpWith = calculateUnlimitedCardTGP(5, 20, 0);
    const tgpWithout = calculateUnlimitedCardTGP(5, 19, 0);

    // With multiplier: 5 * 4% * 4 + 20% = 100%
    expect(tgpWith).toBeCloseTo(1.0, 2);
    // Without multiplier: 5 * 4% + 19% = 39%
    expect(tgpWithout).toBeCloseTo(0.39, 2);
  });

  it('should correctly combine qualifying and finals', () => {
    const tgp = calculateUnlimitedCardTGP(10, 20, 15);
    // Qualifying: 10 * 4% * 4 = 160%
    // Time bonus: 20%
    // Qualifying total: 180%
    // Finals: 15 * 4% = 60%
    // Total: 240%, capped at 200%
    expect(tgp).toBe(2.0);
  });

  it('should use MIN_HOURS_FOR_MULTIPLIER constant correctly', () => {
    const minHours = TGP.UNLIMITED_QUALIFYING.MIN_HOURS_FOR_MULTIPLIER;
    const tgp = calculateUnlimitedCardTGP(5, minHours, 10);
    // Should apply 4X multiplier
    expect(tgp).toBeGreaterThan(0.8); // With multiplier should be higher
  });

  it('should handle decimal hours', () => {
    const tgp = calculateUnlimitedCardTGP(5, 20.5, 10);
    // Qualifying: 5 * 4% * 4 = 80%
    // Time bonus: 20% (capped)
    // Finals: 10 * 4% = 40%
    // Total: 140%
    expect(tgp).toBeCloseTo(1.4, 2);
  });

  it('should handle decimal games', () => {
    const tgp = calculateUnlimitedCardTGP(5.5, 20, 10.5);
    // Qualifying: 5.5 * 4% * 4 = 88%
    // Time bonus: 20%
    // Qualifying total: 108%
    // Finals: 10.5 * 4% = 42%
    // Total: 150%
    expect(tgp).toBeCloseTo(1.5, 2);
  });
});

describe('calculateFlipFrenzyTGP', () => {
  it('should calculate 3-ball flip frenzy TGP', () => {
    const tgp = calculateFlipFrenzyTGP(20, false);
    // 20 / 2 = 10 meaningful games
    // 10 * 4% = 40%
    expect(tgp).toBeCloseTo(0.4, 2);
  });

  it('should calculate 1-ball flip frenzy TGP', () => {
    const tgp = calculateFlipFrenzyTGP(30, true);
    // 30 / 3 = 10 meaningful games
    // 10 * 4% = 40%
    expect(tgp).toBeCloseTo(0.4, 2);
  });

  it('should cap at 100%', () => {
    const tgp = calculateFlipFrenzyTGP(100, false);
    // 100 / 2 = 50 meaningful games
    // 50 * 4% = 200%, capped at 100%
    expect(tgp).toBe(1.0);
  });
});

describe('validateFinalsEligibility', () => {
  it('should validate minimum 10% finalists', () => {
    expect(validateFinalsEligibility(100, 10)).toBe(true);
    expect(validateFinalsEligibility(100, 9)).toBe(false);
  });

  it('should validate maximum 50% finalists', () => {
    expect(validateFinalsEligibility(100, 50)).toBe(true);
    expect(validateFinalsEligibility(100, 51)).toBe(false);
  });

  it('should allow values within range', () => {
    expect(validateFinalsEligibility(100, 25)).toBe(true);
    expect(validateFinalsEligibility(50, 10)).toBe(true);
  });
});
