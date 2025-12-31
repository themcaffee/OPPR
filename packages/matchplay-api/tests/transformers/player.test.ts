import { describe, it, expect } from 'vitest';
import {
  toOPPRPlayer,
  toOPPRPlayers,
  standingToPlayer,
  ratingToPlayer,
} from '../../src/transformers/player.js';
import {
  sampleUserWithDetails,
  sampleUserWithoutRating,
  sampleStandings,
  sampleRating,
} from '../fixtures/index.js';

describe('toOPPRPlayer', () => {
  it('should transform user with rating and IFPA data', () => {
    const player = toOPPRPlayer(sampleUserWithDetails);

    expect(player.id).toBe('1001');
    expect(player.rating).toBe(1850); // Matchplay rating preferred by default
    expect(player.ranking).toBe(250); // IFPA ranking
    expect(player.isRated).toBe(true); // 120 events >= 5
    expect(player.ratingDeviation).toBe(45);
    expect(player.eventCount).toBe(120);
  });

  it('should prefer IFPA rating when configured', () => {
    const player = toOPPRPlayer(sampleUserWithDetails, {
      preferMatchplayRating: false,
    });

    expect(player.rating).toBe(1720); // IFPA rating
    expect(player.ratingDeviation).toBe(350); // Default RD since IFPA doesn't provide it
  });

  it('should handle user without rating data', () => {
    const player = toOPPRPlayer(sampleUserWithoutRating);

    expect(player.id).toBe('1005');
    expect(player.rating).toBe(1500); // Default
    expect(player.ranking).toBe(99999); // Default
    expect(player.isRated).toBe(false); // No events
    expect(player.ratingDeviation).toBe(350); // Default
    expect(player.eventCount).toBe(0);
  });

  it('should use custom default values', () => {
    const player = toOPPRPlayer(sampleUserWithoutRating, {
      defaultRating: 1400,
      defaultRanking: 50000,
      defaultRD: 300,
    });

    expect(player.rating).toBe(1400);
    expect(player.ranking).toBe(50000);
    expect(player.ratingDeviation).toBe(300);
  });

  it('should calculate isRated based on event count', () => {
    // User with 4 events (not rated)
    const userWith4Events = {
      ...sampleUserWithoutRating,
      ifpa: {
        ...sampleUserWithDetails.ifpa!,
        totalEvents: 4,
      },
    };
    expect(toOPPRPlayer(userWith4Events).isRated).toBe(false);

    // User with 5 events (rated)
    const userWith5Events = {
      ...sampleUserWithoutRating,
      ifpa: {
        ...sampleUserWithDetails.ifpa!,
        totalEvents: 5,
      },
    };
    expect(toOPPRPlayer(userWith5Events).isRated).toBe(true);
  });
});

describe('toOPPRPlayers', () => {
  it('should transform multiple users', () => {
    const users = [sampleUserWithDetails, sampleUserWithoutRating];
    const players = toOPPRPlayers(users);

    expect(players).toHaveLength(2);
    expect(players[0].id).toBe('1001');
    expect(players[1].id).toBe('1005');
  });
});

describe('standingToPlayer', () => {
  it('should create player from standing with userId', () => {
    const player = standingToPlayer(sampleStandings[0]);

    expect(player.id).toBe('1001'); // Uses userId
    expect(player.rating).toBe(1500); // Default
    expect(player.ranking).toBe(99999); // Default
    expect(player.isRated).toBe(true); // Has IFPA ID
  });

  it('should create player from standing without userId', () => {
    const standingWithoutUserId = {
      ...sampleStandings[0],
      userId: undefined,
    };
    const player = standingToPlayer(standingWithoutUserId);

    expect(player.id).toBe('1'); // Falls back to playerId
  });

  it('should mark player as unrated when no IFPA ID', () => {
    const player = standingToPlayer(sampleStandings[2]); // Charlie Brown has no IFPA ID

    expect(player.isRated).toBe(false);
  });
});

describe('ratingToPlayer', () => {
  it('should transform rating to player', () => {
    const player = ratingToPlayer(sampleRating);

    expect(player.id).toBe('1001');
    expect(player.rating).toBe(1850);
    expect(player.ranking).toBe(99999); // Ratings don't include IFPA ranking
    expect(player.isRated).toBe(true); // Has a rating, so rated
    expect(player.ratingDeviation).toBe(45);
  });
});
