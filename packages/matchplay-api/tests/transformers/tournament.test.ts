import { describe, it, expect } from 'vitest';
import { toOPPRTournament, inferTGPConfig } from '../../src/transformers/tournament.js';
import { sampleTournament, sampleStandings } from '../fixtures/index.js';

describe('inferTGPConfig', () => {
  it('should infer TGP config for matchplay format', () => {
    const config = inferTGPConfig(sampleTournament, sampleStandings);

    expect(config.qualifying.type).toBe('none');
    expect(config.finals.formatType).toBe('match-play');
    expect(config.finals.finalistCount).toBe(4);
  });

  it('should map knockout to single-elimination', () => {
    const knockoutTournament = {
      ...sampleTournament,
      type: 'knockout',
    };
    const config = inferTGPConfig(knockoutTournament);

    expect(config.finals.formatType).toBe('single-elimination');
  });

  it('should map double_elimination correctly', () => {
    const deTournament = {
      ...sampleTournament,
      type: 'double_elimination',
    };
    const config = inferTGPConfig(deTournament);

    expect(config.finals.formatType).toBe('double-elimination');
  });

  it('should map best_game correctly', () => {
    const bestGameTournament = {
      ...sampleTournament,
      type: 'best_game',
    };
    const config = inferTGPConfig(bestGameTournament);

    expect(config.finals.formatType).toBe('best-game');
  });

  it('should use hybrid for unknown format types', () => {
    const unknownTournament = {
      ...sampleTournament,
      type: 'custom_unknown_format',
    };
    const config = inferTGPConfig(unknownTournament);

    expect(config.finals.formatType).toBe('hybrid');
  });
});

describe('toOPPRTournament', () => {
  it('should transform tournament with standings', () => {
    const tournament = toOPPRTournament(sampleTournament, sampleStandings);

    expect(tournament.id).toBe('12345');
    expect(tournament.name).toBe('Weekly Pinball League');
    expect(tournament.date).toBeInstanceOf(Date);
    expect(tournament.players).toHaveLength(4);
    expect(tournament.eventBooster).toBe('none'); // Default
  });

  it('should parse date correctly', () => {
    const tournament = toOPPRTournament(sampleTournament, sampleStandings);

    expect(tournament.date.toISOString()).toBe('2024-01-15T19:00:00.000Z');
  });

  it('should use provided event booster', () => {
    const tournament = toOPPRTournament(sampleTournament, sampleStandings, {
      eventBooster: 'major',
    });

    expect(tournament.eventBooster).toBe('major');
  });

  it('should filter unrated players when configured', () => {
    const tournament = toOPPRTournament(sampleTournament, sampleStandings, {
      includeUnrated: false,
    });

    // Should exclude Charlie Brown who has no IFPA ID
    expect(tournament.players).toHaveLength(3);
  });

  it('should include all players by default', () => {
    const tournament = toOPPRTournament(sampleTournament, sampleStandings);

    expect(tournament.players).toHaveLength(4);
  });

  it('should handle empty standings', () => {
    const tournament = toOPPRTournament(sampleTournament, []);

    expect(tournament.players).toHaveLength(0);
    expect(tournament.tgpConfig.finals.finalistCount).toBe(0);
  });
});
