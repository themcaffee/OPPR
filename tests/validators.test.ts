import { describe, it, expect } from 'vitest';
import {
  ValidationError,
  validateMinimumPlayers,
  validatePrivateTournament,
  validatePlayer,
  validatePlayers,
  validateTGPConfig,
  validateTournament,
  validatePlayerResults,
  validateFinalsRequirements,
  validateDateNotFuture,
  validatePercentage,
} from '../src/validators.js';
import type { Player, Tournament, TGPConfig, PlayerResult } from '../src/types.js';

describe('ValidationError', () => {
  it('should create a ValidationError with correct name and message', () => {
    const error = new ValidationError('Test error message');
    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(ValidationError);
    expect(error.name).toBe('ValidationError');
    expect(error.message).toBe('Test error message');
  });

  it('should be catchable as Error', () => {
    try {
      throw new ValidationError('Test');
    } catch (error) {
      expect(error).toBeInstanceOf(Error);
    }
  });
});

describe('validateMinimumPlayers', () => {
  it('should not throw for exactly minimum players (3)', () => {
    expect(() => validateMinimumPlayers(3)).not.toThrow();
  });

  it('should not throw for more than minimum players', () => {
    expect(() => validateMinimumPlayers(4)).not.toThrow();
    expect(() => validateMinimumPlayers(100)).not.toThrow();
  });

  it('should throw for fewer than minimum players', () => {
    expect(() => validateMinimumPlayers(2)).toThrow(ValidationError);
    expect(() => validateMinimumPlayers(2)).toThrow(
      'Tournament must have at least 3 players (got 2)'
    );
  });

  it('should throw for zero players', () => {
    expect(() => validateMinimumPlayers(0)).toThrow(ValidationError);
    expect(() => validateMinimumPlayers(0)).toThrow(
      'Tournament must have at least 3 players (got 0)'
    );
  });

  it('should throw for negative player count', () => {
    expect(() => validateMinimumPlayers(-1)).toThrow(ValidationError);
  });
});

describe('validatePrivateTournament', () => {
  it('should not throw for public tournaments with any player count', () => {
    expect(() => validatePrivateTournament(1, false)).not.toThrow();
    expect(() => validatePrivateTournament(10, false)).not.toThrow();
  });

  it('should not throw for private tournament with exactly minimum players (16)', () => {
    expect(() => validatePrivateTournament(16, true)).not.toThrow();
  });

  it('should not throw for private tournament with more than minimum players', () => {
    expect(() => validatePrivateTournament(20, true)).not.toThrow();
    expect(() => validatePrivateTournament(100, true)).not.toThrow();
  });

  it('should throw for private tournament with fewer than minimum players', () => {
    expect(() => validatePrivateTournament(15, true)).toThrow(ValidationError);
    expect(() => validatePrivateTournament(15, true)).toThrow(
      'Private tournament must have at least 16 players (got 15)'
    );
  });

  it('should throw for private tournament with very low player count', () => {
    expect(() => validatePrivateTournament(5, true)).toThrow(ValidationError);
    expect(() => validatePrivateTournament(0, true)).toThrow(ValidationError);
  });
});

describe('validatePlayer', () => {
  const validPlayer: Player = {
    id: 'player1',
    rating: 1500,
    ranking: 100,
    isRated: true,
  };

  it('should not throw for valid player', () => {
    expect(() => validatePlayer(validPlayer)).not.toThrow();
  });

  it('should not throw for player with zero rating and ranking', () => {
    expect(() => validatePlayer({ ...validPlayer, rating: 0, ranking: 0 })).not.toThrow();
  });

  it('should not throw for player with isRated false', () => {
    expect(() => validatePlayer({ ...validPlayer, isRated: false })).not.toThrow();
  });

  it('should throw for player without ID', () => {
    expect(() => validatePlayer({ ...validPlayer, id: '' })).toThrow(ValidationError);
    expect(() => validatePlayer({ ...validPlayer, id: '' })).toThrow('Player must have an ID');
  });

  it('should throw for player with negative rating', () => {
    expect(() => validatePlayer({ ...validPlayer, rating: -1 })).toThrow(ValidationError);
    expect(() => validatePlayer({ ...validPlayer, rating: -1 })).toThrow(
      'Player player1 has invalid rating: -1'
    );
  });

  it('should throw for player with non-number type rating', () => {
    expect(() =>
      validatePlayer({ ...validPlayer, rating: 'invalid' as unknown as number })
    ).toThrow(ValidationError);
  });

  it('should throw for player with negative ranking', () => {
    expect(() => validatePlayer({ ...validPlayer, ranking: -1 })).toThrow(ValidationError);
    expect(() => validatePlayer({ ...validPlayer, ranking: -1 })).toThrow(
      'Player player1 has invalid ranking: -1'
    );
  });

  it('should throw for player with non-number type ranking', () => {
    expect(() =>
      validatePlayer({ ...validPlayer, ranking: 'invalid' as unknown as number })
    ).toThrow(ValidationError);
  });

  it('should throw for player without isRated boolean', () => {
    const playerWithoutIsRated = { ...validPlayer } as unknown as Record<string, unknown>;
    delete playerWithoutIsRated.isRated;
    expect(() => validatePlayer(playerWithoutIsRated as unknown as Player)).toThrow(
      ValidationError
    );
    expect(() => validatePlayer(playerWithoutIsRated as unknown as Player)).toThrow(
      'Player player1 must have isRated boolean property'
    );
  });

  it('should throw for player with non-boolean isRated', () => {
    expect(() => validatePlayer({ ...validPlayer, isRated: 'true' as unknown as boolean })).toThrow(
      ValidationError
    );
  });
});

describe('validatePlayers', () => {
  const validPlayer1: Player = {
    id: 'player1',
    rating: 1500,
    ranking: 100,
    isRated: true,
  };

  const validPlayer2: Player = {
    id: 'player2',
    rating: 1600,
    ranking: 50,
    isRated: true,
  };

  it('should not throw for valid players array', () => {
    expect(() => validatePlayers([validPlayer1])).not.toThrow();
    expect(() => validatePlayers([validPlayer1, validPlayer2])).not.toThrow();
  });

  it('should throw for non-array input', () => {
    expect(() => validatePlayers('not an array' as unknown as Player[])).toThrow(ValidationError);
    expect(() => validatePlayers('not an array' as unknown as Player[])).toThrow(
      'Players must be an array'
    );
  });

  it('should throw for empty array', () => {
    expect(() => validatePlayers([])).toThrow(ValidationError);
    expect(() => validatePlayers([])).toThrow('Players array cannot be empty');
  });

  it('should throw if any player is invalid', () => {
    const invalidPlayer = { ...validPlayer1, rating: -1 };
    expect(() => validatePlayers([validPlayer1, invalidPlayer])).toThrow(ValidationError);
  });

  it('should throw for duplicate player IDs', () => {
    const duplicate = { ...validPlayer1 };
    expect(() => validatePlayers([validPlayer1, duplicate])).toThrow(ValidationError);
    expect(() => validatePlayers([validPlayer1, duplicate])).toThrow(
      'Duplicate player IDs found: player1'
    );
  });

  it('should throw for multiple duplicate player IDs', () => {
    const player3 = { ...validPlayer2, id: 'player1' };
    expect(() => validatePlayers([validPlayer1, validPlayer2, player3])).toThrow(ValidationError);
    expect(() => validatePlayers([validPlayer1, validPlayer2, player3])).toThrow(
      'Duplicate player IDs found'
    );
  });
});

describe('validateTGPConfig', () => {
  const validConfig: TGPConfig = {
    qualifying: {
      type: 'limited',
      meaningfulGames: 12,
      machineCount: 4,
    },
    finals: {
      formatType: 'single-elimination',
      meaningfulGames: 6,
    },
  };

  it('should not throw for valid TGP config', () => {
    expect(() => validateTGPConfig(validConfig)).not.toThrow();
  });

  it('should not throw for config with zero meaningful games', () => {
    expect(() =>
      validateTGPConfig({
        ...validConfig,
        qualifying: { ...validConfig.qualifying, meaningfulGames: 0 },
      })
    ).not.toThrow();
  });

  it('should not throw for config with hours', () => {
    expect(() =>
      validateTGPConfig({
        ...validConfig,
        qualifying: { ...validConfig.qualifying, hours: 20 },
      })
    ).not.toThrow();
  });

  it('should not throw for valid ball count adjustment', () => {
    expect(() => validateTGPConfig({ ...validConfig, ballCountAdjustment: 0.33 })).not.toThrow();
    expect(() => validateTGPConfig({ ...validConfig, ballCountAdjustment: 0.66 })).not.toThrow();
    expect(() => validateTGPConfig({ ...validConfig, ballCountAdjustment: 1.0 })).not.toThrow();
  });

  it('should throw for negative qualifying meaningful games', () => {
    expect(() =>
      validateTGPConfig({
        ...validConfig,
        qualifying: { ...validConfig.qualifying, meaningfulGames: -1 },
      })
    ).toThrow(ValidationError);
    expect(() =>
      validateTGPConfig({
        ...validConfig,
        qualifying: { ...validConfig.qualifying, meaningfulGames: -1 },
      })
    ).toThrow('Qualifying meaningful games cannot be negative');
  });

  it('should throw for negative qualifying hours', () => {
    expect(() =>
      validateTGPConfig({
        ...validConfig,
        qualifying: { ...validConfig.qualifying, hours: -1 },
      })
    ).toThrow(ValidationError);
    expect(() =>
      validateTGPConfig({
        ...validConfig,
        qualifying: { ...validConfig.qualifying, hours: -1 },
      })
    ).toThrow('Qualifying hours cannot be negative');
  });

  it('should throw for negative finals meaningful games', () => {
    expect(() =>
      validateTGPConfig({
        ...validConfig,
        finals: { ...validConfig.finals, meaningfulGames: -1 },
      })
    ).toThrow(ValidationError);
    expect(() =>
      validateTGPConfig({
        ...validConfig,
        finals: { ...validConfig.finals, meaningfulGames: -1 },
      })
    ).toThrow('Finals meaningful games cannot be negative');
  });

  it('should throw for ball count adjustment below 0', () => {
    expect(() => validateTGPConfig({ ...validConfig, ballCountAdjustment: -0.1 })).toThrow(
      ValidationError
    );
    expect(() => validateTGPConfig({ ...validConfig, ballCountAdjustment: -0.1 })).toThrow(
      'Ball count adjustment must be between 0 and 1'
    );
  });

  it('should throw for ball count adjustment above 1', () => {
    expect(() => validateTGPConfig({ ...validConfig, ballCountAdjustment: 1.1 })).toThrow(
      ValidationError
    );
    expect(() => validateTGPConfig({ ...validConfig, ballCountAdjustment: 1.1 })).toThrow(
      'Ball count adjustment must be between 0 and 1'
    );
  });

  it('should throw for too many games per machine', () => {
    expect(() =>
      validateTGPConfig({
        ...validConfig,
        qualifying: { ...validConfig.qualifying, meaningfulGames: 13, machineCount: 4 },
      })
    ).toThrow(ValidationError);
    expect(() =>
      validateTGPConfig({
        ...validConfig,
        qualifying: { ...validConfig.qualifying, meaningfulGames: 13, machineCount: 4 },
      })
    ).toThrow('Cannot exceed 3 games per machine (got 3.25)');
  });

  it('should not throw when exactly at max games per machine', () => {
    expect(() =>
      validateTGPConfig({
        ...validConfig,
        qualifying: { ...validConfig.qualifying, meaningfulGames: 12, machineCount: 4 },
      })
    ).not.toThrow();
  });
});

describe('validateTournament', () => {
  const validPlayer: Player = {
    id: 'player1',
    rating: 1500,
    ranking: 100,
    isRated: true,
  };

  const validTGPConfig: TGPConfig = {
    qualifying: {
      type: 'limited',
      meaningfulGames: 12,
    },
    finals: {
      formatType: 'single-elimination',
      meaningfulGames: 6,
    },
  };

  const validTournament: Tournament = {
    id: 'tournament1',
    name: 'Test Tournament',
    date: new Date('2024-01-15'),
    players: [validPlayer, { ...validPlayer, id: 'player2' }, { ...validPlayer, id: 'player3' }],
    tgpConfig: validTGPConfig,
    eventBooster: 'none',
  };

  it('should not throw for valid tournament', () => {
    expect(() => validateTournament(validTournament)).not.toThrow();
  });

  it('should throw for tournament without ID', () => {
    expect(() => validateTournament({ ...validTournament, id: '' })).toThrow(ValidationError);
    expect(() => validateTournament({ ...validTournament, id: '' })).toThrow(
      'Tournament must have an ID'
    );
  });

  it('should throw for tournament without name', () => {
    expect(() => validateTournament({ ...validTournament, name: '' })).toThrow(ValidationError);
    expect(() => validateTournament({ ...validTournament, name: '' })).toThrow(
      'Tournament must have a name'
    );
  });

  it('should throw for tournament with invalid date', () => {
    expect(() => validateTournament({ ...validTournament, date: new Date('invalid') })).toThrow(
      ValidationError
    );
    expect(() => validateTournament({ ...validTournament, date: new Date('invalid') })).toThrow(
      'Tournament must have a valid date'
    );
  });

  it('should throw for tournament with non-Date date', () => {
    expect(() =>
      validateTournament({ ...validTournament, date: '2024-01-15' as unknown as Date })
    ).toThrow(ValidationError);
  });

  it('should throw for tournament with too few players', () => {
    expect(() => validateTournament({ ...validTournament, players: [validPlayer] })).toThrow(
      ValidationError
    );
  });

  it('should throw for tournament with invalid players', () => {
    const invalidPlayer = { ...validPlayer, rating: -1 };
    expect(() =>
      validateTournament({ ...validTournament, players: [validPlayer, invalidPlayer, validPlayer] })
    ).toThrow(ValidationError);
  });

  it('should throw for tournament with invalid TGP config', () => {
    const invalidConfig = {
      ...validTGPConfig,
      qualifying: { ...validTGPConfig.qualifying, meaningfulGames: -1 },
    };
    expect(() => validateTournament({ ...validTournament, tgpConfig: invalidConfig })).toThrow(
      ValidationError
    );
  });
});

describe('validatePlayerResults', () => {
  const validPlayer: Player = {
    id: 'player1',
    rating: 1500,
    ranking: 100,
    isRated: true,
  };

  const validResult1: PlayerResult = {
    player: validPlayer,
    position: 1,
  };

  const validResult2: PlayerResult = {
    player: { ...validPlayer, id: 'player2' },
    position: 2,
  };

  it('should not throw for valid results', () => {
    expect(() => validatePlayerResults([validResult1])).not.toThrow();
    expect(() => validatePlayerResults([validResult1, validResult2])).not.toThrow();
  });

  it('should throw for non-array input', () => {
    expect(() => validatePlayerResults('not an array' as unknown as PlayerResult[])).toThrow(
      ValidationError
    );
    expect(() => validatePlayerResults('not an array' as unknown as PlayerResult[])).toThrow(
      'Results must be an array'
    );
  });

  it('should throw for empty array', () => {
    expect(() => validatePlayerResults([])).toThrow(ValidationError);
    expect(() => validatePlayerResults([])).toThrow('Results array cannot be empty');
  });

  it('should throw for result with invalid player', () => {
    const invalidResult = { ...validResult1, player: { ...validPlayer, rating: -1 } };
    expect(() => validatePlayerResults([invalidResult])).toThrow(ValidationError);
  });

  it('should throw for result with invalid position (zero)', () => {
    const invalidResult = { ...validResult1, position: 0 };
    expect(() => validatePlayerResults([invalidResult])).toThrow(ValidationError);
    expect(() => validatePlayerResults([invalidResult])).toThrow(
      'Result 0 has invalid position: 0'
    );
  });

  it('should throw for result with negative position', () => {
    const invalidResult = { ...validResult1, position: -1 };
    expect(() => validatePlayerResults([invalidResult])).toThrow(ValidationError);
  });

  it('should throw for result with non-numeric position', () => {
    const invalidResult = { ...validResult1, position: NaN };
    expect(() => validatePlayerResults([invalidResult])).toThrow(ValidationError);
  });

  it('should throw when no player in 1st place', () => {
    const result1 = { ...validResult1, position: 2 };
    const result2 = { ...validResult2, position: 3 };
    expect(() => validatePlayerResults([result1, result2])).toThrow(ValidationError);
    expect(() => validatePlayerResults([result1, result2])).toThrow(
      'Must have exactly one player in 1st place (found 0)'
    );
  });

  it('should throw when multiple players tied for 1st place', () => {
    const result1 = { ...validResult1, position: 1 };
    const result2 = { ...validResult2, position: 1 };
    expect(() => validatePlayerResults([result1, result2])).toThrow(ValidationError);
    expect(() => validatePlayerResults([result1, result2])).toThrow(
      'Must have exactly one player in 1st place (found 2)'
    );
  });

  it('should allow ties for positions other than 1st', () => {
    const result1 = { ...validResult1, position: 1 };
    const result2 = { ...validResult2, position: 2 };
    const result3 = { player: { ...validPlayer, id: 'player3' }, position: 2 };
    expect(() => validatePlayerResults([result1, result2, result3])).not.toThrow();
  });
});

describe('validateFinalsRequirements', () => {
  it('should not throw for valid finals requirements (10-50%)', () => {
    expect(() => validateFinalsRequirements(100, 10)).not.toThrow(); // 10%
    expect(() => validateFinalsRequirements(100, 25)).not.toThrow(); // 25%
    expect(() => validateFinalsRequirements(100, 50)).not.toThrow(); // 50%
  });

  it('should not throw for exactly 10% finalists', () => {
    expect(() => validateFinalsRequirements(50, 5)).not.toThrow();
  });

  it('should not throw for exactly 50% finalists', () => {
    expect(() => validateFinalsRequirements(20, 10)).not.toThrow();
  });

  it('should throw for too few finalists (below 10%)', () => {
    expect(() => validateFinalsRequirements(100, 9)).toThrow(ValidationError);
    expect(() => validateFinalsRequirements(100, 9)).toThrow(
      'Finals must include at least 10% of participants (got 9.0%)'
    );
  });

  it('should throw for way too few finalists', () => {
    expect(() => validateFinalsRequirements(100, 1)).toThrow(ValidationError);
    expect(() => validateFinalsRequirements(100, 1)).toThrow(
      'Finals must include at least 10% of participants (got 1.0%)'
    );
  });

  it('should throw for too many finalists (above 50%)', () => {
    expect(() => validateFinalsRequirements(100, 51)).toThrow(ValidationError);
    expect(() => validateFinalsRequirements(100, 51)).toThrow(
      'Finals cannot include more than 50% of participants (got 51.0%)'
    );
  });

  it('should throw for way too many finalists', () => {
    expect(() => validateFinalsRequirements(20, 15)).toThrow(ValidationError);
    expect(() => validateFinalsRequirements(20, 15)).toThrow(
      'Finals cannot include more than 50% of participants (got 75.0%)'
    );
  });

  it('should handle edge case with small tournaments', () => {
    expect(() => validateFinalsRequirements(10, 1)).not.toThrow(); // 10%
    expect(() => validateFinalsRequirements(10, 5)).not.toThrow(); // 50%
  });
});

describe('validateDateNotFuture', () => {
  it('should not throw for past dates', () => {
    const pastDate = new Date('2020-01-01');
    expect(() => validateDateNotFuture(pastDate)).not.toThrow();
  });

  it('should not throw for current date', () => {
    const now = new Date();
    expect(() => validateDateNotFuture(now)).not.toThrow();
  });

  it('should throw for future dates', () => {
    const futureDate = new Date(Date.now() + 86400000); // Tomorrow
    expect(() => validateDateNotFuture(futureDate)).toThrow(ValidationError);
    expect(() => validateDateNotFuture(futureDate)).toThrow('Date cannot be in the future');
  });

  it('should throw for far future dates', () => {
    const farFutureDate = new Date('2099-12-31');
    expect(() => validateDateNotFuture(farFutureDate)).toThrow(ValidationError);
  });

  it('should use custom field name in error message', () => {
    const futureDate = new Date(Date.now() + 86400000);
    expect(() => validateDateNotFuture(futureDate, 'Tournament date')).toThrow(
      'Tournament date cannot be in the future'
    );
  });

  it('should use default field name when not provided', () => {
    const futureDate = new Date(Date.now() + 86400000);
    expect(() => validateDateNotFuture(futureDate)).toThrow('Date cannot be in the future');
  });
});

describe('validatePercentage', () => {
  it('should not throw for valid percentages (0-100)', () => {
    expect(() => validatePercentage(0)).not.toThrow();
    expect(() => validatePercentage(50)).not.toThrow();
    expect(() => validatePercentage(100)).not.toThrow();
  });

  it('should not throw for decimal percentages', () => {
    expect(() => validatePercentage(25.5)).not.toThrow();
    expect(() => validatePercentage(99.99)).not.toThrow();
  });

  it('should throw for negative percentages', () => {
    expect(() => validatePercentage(-1)).toThrow(ValidationError);
    expect(() => validatePercentage(-1)).toThrow('Percentage must be between 0 and 100 (got -1)');
  });

  it('should throw for percentages above 100', () => {
    expect(() => validatePercentage(101)).toThrow(ValidationError);
    expect(() => validatePercentage(101)).toThrow('Percentage must be between 0 and 100 (got 101)');
  });

  it('should throw for way out of range values', () => {
    expect(() => validatePercentage(-100)).toThrow(ValidationError);
    expect(() => validatePercentage(1000)).toThrow(ValidationError);
  });

  it('should use custom field name in error message', () => {
    expect(() => validatePercentage(101, 'Efficiency')).toThrow(
      'Efficiency must be between 0 and 100 (got 101)'
    );
  });

  it('should use default field name when not provided', () => {
    expect(() => validatePercentage(101)).toThrow('Percentage must be between 0 and 100 (got 101)');
  });
});
