import type { Player, TGPConfig, PointDistribution } from '@opprs/core';
import {
  calculateBaseValue,
  calculateRatingTVA,
  calculateRankingTVA,
  calculateTGP,
  distributePoints,
  getEventBoosterMultiplier,
} from '@opprs/core';
import {
  GlickoRatingSystem,
  type GlickoRatingData,
} from '@opprs/glicko-rating-system';

// Create an instance of the Glicko rating system
const glickoSystem = new GlickoRatingSystem();

export interface TournamentCalculation {
  baseValue: number;
  ratingTVA: number;
  rankingTVA: number;
  totalTVA: number;
  tgp: number;
  boosterMultiplier: number;
  firstPlaceValue: number;
  distributions: PointDistribution[];
}

export interface PlayerWithName extends Player {
  name: string;
}

// Helper to get the Glicko rating value from a PlayerWithName
export function getPlayerRating(player: PlayerWithName | Player): number {
  const glicko = player.ratings?.glicko as GlickoRatingData | undefined;
  return glicko?.value ?? 1500;
}

// Helper to get the Glicko rating deviation from a PlayerWithName
export function getPlayerRD(player: PlayerWithName | Player): number {
  const glicko = player.ratings?.glicko as GlickoRatingData | undefined;
  return glicko?.ratingDeviation ?? 200;
}

// Helper to create a new PlayerWithName with Glicko ratings
export function createPlayerWithName(
  id: string,
  name: string,
  rating: number,
  ranking: number,
  isRated: boolean,
  ratingDeviation: number,
  eventCount: number
): PlayerWithName {
  return {
    id,
    name,
    ranking,
    isRated,
    eventCount,
    ratings: {
      glicko: { value: rating, ratingDeviation } as GlickoRatingData,
    },
  };
}

// Helper to update a player's Glicko rating value
export function updatePlayerRating(player: PlayerWithName, rating: number): PlayerWithName {
  const currentGlicko = player.ratings?.glicko as GlickoRatingData | undefined;
  return {
    ...player,
    ratings: {
      ...player.ratings,
      glicko: {
        value: rating,
        ratingDeviation: currentGlicko?.ratingDeviation ?? 200,
      } as GlickoRatingData,
    },
  };
}

// Helper to update a player's rating deviation
export function updatePlayerRD(player: PlayerWithName, ratingDeviation: number): PlayerWithName {
  const currentGlicko = player.ratings?.glicko as GlickoRatingData | undefined;
  return {
    ...player,
    ratings: {
      ...player.ratings,
      glicko: {
        value: currentGlicko?.value ?? 1500,
        ratingDeviation,
      } as GlickoRatingData,
    },
  };
}

export interface PlayerResultWithName {
  player: PlayerWithName;
  position: number;
}

/**
 * Calculate complete tournament results including value and point distribution
 */
export function calculateTournamentResults(
  players: PlayerWithName[],
  results: PlayerResultWithName[],
  tgpConfig: TGPConfig,
  eventBooster: 'none' | 'certified' | 'certified-plus' | 'major' = 'none'
): TournamentCalculation {
  // Calculate base value
  const baseValue = calculateBaseValue(players);

  // Calculate TVA components
  const ratingTVA = calculateRatingTVA(players);
  const rankingTVA = calculateRankingTVA(players);
  const totalTVA = ratingTVA + rankingTVA;

  // Calculate TGP
  const tgp = calculateTGP(tgpConfig);

  // Get booster multiplier
  const boosterMultiplier = getEventBoosterMultiplier(eventBooster);

  // Calculate first place value
  const firstPlaceValue = (baseValue + totalTVA) * tgp * boosterMultiplier;

  // Distribute points
  const distributions = distributePoints(results, firstPlaceValue);

  return {
    baseValue,
    ratingTVA,
    rankingTVA,
    totalTVA,
    tgp,
    boosterMultiplier,
    firstPlaceValue,
    distributions,
  };
}

// Helper to get Glicko rating from a player
function getGlickoRating(player: Player): GlickoRatingData {
  const glicko = player.ratings?.glicko as GlickoRatingData | undefined;
  return glicko ?? { value: 1500, ratingDeviation: 200 };
}

/**
 * Calculate rating changes for all players based on tournament results
 */
export function calculateRatingChanges(
  results: PlayerResultWithName[]
): Map<string, { oldRating: number; newRating: number; newRD: number; change: number }> {
  const ratingChanges = new Map<
    string,
    { oldRating: number; newRating: number; newRD: number; change: number }
  >();

  // Convert results to the format expected by simulateTournamentMatches
  const playerRatingResults = results.map((r) => ({
    position: r.position,
    rating: getGlickoRating(r.player),
  }));

  // For each player, simulate their matches and update rating
  results.forEach((playerResult) => {
    const { player, position } = playerResult;
    const currentRating = getGlickoRating(player);

    // Simulate matches based on tournament position
    const matches = glickoSystem.simulateTournamentMatches(position, playerRatingResults);

    // Update rating
    const { newRating } = glickoSystem.updateRating(currentRating, matches);
    const oldValue = currentRating.value;
    const change = newRating.value - oldValue;

    ratingChanges.set(player.id, {
      oldRating: oldValue,
      newRating: newRating.value,
      newRD: newRating.ratingDeviation,
      change,
    });
  });

  return ratingChanges;
}

/**
 * Format a number to a fixed number of decimal places
 */
export function formatNumber(value: number, decimals: number = 2): string {
  return value.toFixed(decimals);
}

/**
 * Format rating with +/- prefix for changes
 */
export function formatRatingChange(change: number): string {
  const prefix = change >= 0 ? '+' : '';
  return `${prefix}${formatNumber(change, 0)}`;
}

/**
 * Calculate percentage breakdown of points
 */
export function calculatePointsPercentage(points: number, firstPlaceValue: number): number {
  if (firstPlaceValue === 0) return 0;
  return (points / firstPlaceValue) * 100;
}
