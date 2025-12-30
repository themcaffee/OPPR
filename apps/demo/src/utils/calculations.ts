import type { Player, TGPConfig, PointDistribution } from '@oppr/core';
import {
  calculateBaseValue,
  calculateRatingTVA,
  calculateRankingTVA,
  calculateTGP,
  distributePoints,
  getEventBoosterMultiplier,
  updateRating,
  simulateTournamentMatches,
  type RatingUpdate,
} from '@oppr/core';

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

  // For each player, simulate their matches and update rating
  results.forEach((playerResult) => {
    const { player, position } = playerResult;

    // Simulate matches based on tournament position
    const matches = simulateTournamentMatches(position, results);

    // Update rating
    const ratingUpdate: RatingUpdate = {
      currentRating: player.rating,
      currentRD: player.ratingDeviation || 100,
      results: matches,
    };

    const { newRating, newRD } = updateRating(ratingUpdate);
    const change = newRating - player.rating;

    ratingChanges.set(player.id, {
      oldRating: player.rating,
      newRating,
      newRD,
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
