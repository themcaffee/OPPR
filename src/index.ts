/**
 * OPPR - Open Pinball Player Ranking System
 *
 * A TypeScript library for calculating pinball tournament rankings and player ratings.
 *
 * @packageDocumentation
 */

// Export all types
export type {
  Player,
  Tournament,
  TournamentFormatType,
  QualifyingType,
  GroupSize,
  EventBoosterType,
  TGPConfig,
  PlayerResult,
  TournamentValue,
  PointDistribution,
  TournamentResult,
  PlayerEvent,
  PlayerProfile,
  RatingUpdate,
  RatingResult,
  DecayConfig,
} from './types.js';

// Export all constants
export {
  BASE_VALUE,
  TVA,
  TGP,
  EVENT_BOOSTERS,
  POINT_DISTRIBUTION,
  TIME_DECAY,
  RANKING,
  RATING,
  VALIDATION,
} from './constants.js';

// Export base value functions
export { calculateBaseValue, countRatedPlayers, isPlayerRated } from './base-value.js';

// Export TVA rating functions
export {
  calculatePlayerRatingContribution,
  calculateRatingTVA,
  ratingContributesToTVA,
  getTopRatedPlayers,
} from './tva-rating.js';

// Export TVA ranking functions
export {
  calculatePlayerRankingContribution,
  calculateRankingTVA,
  getTopRankedPlayers,
  calculateTotalTVA,
} from './tva-ranking.js';

// Export TGP functions
export {
  calculateQualifyingTGP,
  calculateFinalsTGP,
  calculateTGP,
  calculateUnlimitedCardTGP,
  calculateFlipFrenzyTGP,
  validateFinalsEligibility,
} from './tgp.js';

// Export event booster functions
export {
  getEventBoosterMultiplier,
  qualifiesForCertified,
  qualifiesForCertifiedPlus,
  determineEventBooster,
  applyEventBooster,
} from './event-boosters.js';

// Export point distribution functions
export {
  calculateLinearPoints,
  calculateDynamicPoints,
  calculatePlayerPoints,
  distributePoints,
  getPointsForPosition,
  calculatePositionPercentage,
} from './point-distribution.js';

// Export time decay functions
export {
  calculateDaysBetween,
  calculateEventAge,
  getDecayMultiplier,
  calculateDecayMultiplier,
  applyTimeDecay,
  isEventActive,
  filterActiveEvents,
  getEventDecayInfo,
} from './time-decay.js';

// Export rating functions
export {
  updateRating,
  applyRDDecay,
  simulateTournamentMatches,
  createNewPlayerRating,
  isProvisionalRating,
} from './rating.js';

// Export efficiency functions
export {
  calculateEventEfficiency,
  calculateOverallEfficiency,
  calculateTopNEfficiency,
  calculateDecayedEfficiency,
  analyzeEfficiencyTrend,
  getEfficiencyStats,
} from './efficiency.js';

// Export validation functions and error class
export {
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
} from './validators.js';
