import type { Player } from '@opprs/core';
import type {
  MatchplayUserWithDetails,
  MatchplayStanding,
  MatchplayRating,
} from '../types/api-responses.js';
import type { PlayerTransformOptions } from '../types/client-options.js';

const DEFAULT_OPTIONS: Required<PlayerTransformOptions> = {
  preferMatchplayRating: true,
  defaultRating: 1500,
  defaultRanking: 99999,
  defaultRD: 350,
};

/**
 * Transform a Matchplay user to an OPPR Player
 */
export function toOPPRPlayer(
  user: MatchplayUserWithDetails,
  options: PlayerTransformOptions = {}
): Player {
  const opts = { ...DEFAULT_OPTIONS, ...options };

  // Determine rating - prefer Matchplay rating if available and configured
  let rating = opts.defaultRating;
  let ratingDeviation = opts.defaultRD;

  if (opts.preferMatchplayRating && user.rating) {
    rating = user.rating.rating;
    ratingDeviation = user.rating.rd;
  } else if (user.ifpa) {
    rating = user.ifpa.rating;
    // IFPA doesn't provide RD, use default
  } else if (user.rating) {
    rating = user.rating.rating;
    ratingDeviation = user.rating.rd;
  }

  // Determine ranking from IFPA data
  const ranking = user.ifpa?.rank ?? opts.defaultRanking;

  // Determine event count for isRated calculation
  const eventCount = user.ifpa?.totalEvents ?? user.userCounts?.tournaments ?? 0;

  // A player is rated if they have participated in 5+ events
  const isRated = eventCount >= 5;

  return {
    id: String(user.userId),
    rating,
    ranking,
    isRated,
    ratingDeviation,
    eventCount,
  };
}

/**
 * Transform multiple Matchplay users to OPPR Players
 */
export function toOPPRPlayers(
  users: MatchplayUserWithDetails[],
  options: PlayerTransformOptions = {}
): Player[] {
  return users.map((user) => toOPPRPlayer(user, options));
}

/**
 * Transform a Matchplay standing to a partial Player
 * Note: This creates a minimal Player without full rating/ranking data
 * since standings don't include that information
 */
export function standingToPlayer(
  standing: MatchplayStanding,
  options: PlayerTransformOptions = {}
): Player {
  const opts = { ...DEFAULT_OPTIONS, ...options };

  return {
    id: standing.userId ? String(standing.userId) : String(standing.playerId),
    rating: opts.defaultRating,
    ranking: opts.defaultRanking,
    isRated: standing.ifpaId !== undefined && standing.ifpaId !== null,
    ratingDeviation: opts.defaultRD,
  };
}

/**
 * Transform a Matchplay rating to an OPPR Player
 */
export function ratingToPlayer(
  rating: MatchplayRating,
  options: PlayerTransformOptions = {}
): Player {
  const opts = { ...DEFAULT_OPTIONS, ...options };

  return {
    id: String(rating.userId),
    rating: rating.rating,
    ranking: opts.defaultRanking, // Ratings don't include IFPA ranking
    isRated: true, // If they have a rating, they're rated
    ratingDeviation: rating.rd,
  };
}
