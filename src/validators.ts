import { VALIDATION } from './constants.js';
import type { Tournament, Player, TGPConfig, PlayerResult } from './types.js';

/**
 * Validation error class for OPPR calculations
 */
export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

/**
 * Validates that a tournament has the minimum required number of players
 *
 * @param playerCount - Number of players in the tournament
 * @throws ValidationError if player count is below minimum
 */
export function validateMinimumPlayers(playerCount: number): void {
  if (playerCount < VALIDATION.MIN_PLAYERS) {
    throw new ValidationError(
      `Tournament must have at least ${VALIDATION.MIN_PLAYERS} players (got ${playerCount})`
    );
  }
}

/**
 * Validates that a private tournament has the minimum required number of players
 *
 * @param playerCount - Number of players in the tournament
 * @param isPrivate - Whether the tournament is private
 * @throws ValidationError if private tournament doesn't meet minimum
 */
export function validatePrivateTournament(playerCount: number, isPrivate: boolean): void {
  if (isPrivate && playerCount < VALIDATION.MIN_PRIVATE_PLAYERS) {
    throw new ValidationError(
      `Private tournament must have at least ${VALIDATION.MIN_PRIVATE_PLAYERS} players (got ${playerCount})`
    );
  }
}

/**
 * Validates player data
 *
 * @param player - Player object to validate
 * @throws ValidationError if player data is invalid
 */
export function validatePlayer(player: Player): void {
  if (!player.id) {
    throw new ValidationError('Player must have an ID');
  }

  if (typeof player.rating !== 'number' || player.rating < 0) {
    throw new ValidationError(`Player ${player.id} has invalid rating: ${player.rating}`);
  }

  if (typeof player.ranking !== 'number' || player.ranking < 0) {
    throw new ValidationError(`Player ${player.id} has invalid ranking: ${player.ranking}`);
  }

  if (typeof player.isRated !== 'boolean') {
    throw new ValidationError(`Player ${player.id} must have isRated boolean property`);
  }
}

/**
 * Validates an array of players
 *
 * @param players - Array of players to validate
 * @throws ValidationError if any player is invalid
 */
export function validatePlayers(players: Player[]): void {
  if (!Array.isArray(players)) {
    throw new ValidationError('Players must be an array');
  }

  if (players.length === 0) {
    throw new ValidationError('Players array cannot be empty');
  }

  players.forEach((player) => validatePlayer(player));

  // Check for duplicate player IDs
  const ids = players.map((p) => p.id);
  const duplicates = ids.filter((id, index) => ids.indexOf(id) !== index);
  if (duplicates.length > 0) {
    throw new ValidationError(`Duplicate player IDs found: ${duplicates.join(', ')}`);
  }
}

/**
 * Validates TGP configuration
 *
 * @param config - TGP configuration to validate
 * @throws ValidationError if configuration is invalid
 */
export function validateTGPConfig(config: TGPConfig): void {
  // Validate qualifying
  if (config.qualifying.meaningfulGames < 0) {
    throw new ValidationError('Qualifying meaningful games cannot be negative');
  }

  if (config.qualifying.hours !== undefined && config.qualifying.hours < 0) {
    throw new ValidationError('Qualifying hours cannot be negative');
  }

  // Validate finals
  if (config.finals.meaningfulGames < 0) {
    throw new ValidationError('Finals meaningful games cannot be negative');
  }

  // Validate ball count adjustment
  if (config.ballCountAdjustment !== undefined) {
    if (config.ballCountAdjustment < 0 || config.ballCountAdjustment > 1) {
      throw new ValidationError('Ball count adjustment must be between 0 and 1');
    }
  }

  // Validate that games per machine doesn't exceed max
  if (config.qualifying.machineCount && config.qualifying.machineCount > 0) {
    const gamesPerMachine = config.qualifying.meaningfulGames / config.qualifying.machineCount;
    if (gamesPerMachine > VALIDATION.MAX_GAMES_PER_MACHINE) {
      throw new ValidationError(
        `Cannot exceed ${VALIDATION.MAX_GAMES_PER_MACHINE} games per machine (got ${gamesPerMachine})`
      );
    }
  }
}

/**
 * Validates tournament data
 *
 * @param tournament - Tournament object to validate
 * @throws ValidationError if tournament is invalid
 */
export function validateTournament(tournament: Tournament): void {
  if (!tournament.id) {
    throw new ValidationError('Tournament must have an ID');
  }

  if (!tournament.name) {
    throw new ValidationError('Tournament must have a name');
  }

  if (!(tournament.date instanceof Date) || isNaN(tournament.date.getTime())) {
    throw new ValidationError('Tournament must have a valid date');
  }

  validatePlayers(tournament.players);
  validateMinimumPlayers(tournament.players.length);
  validateTGPConfig(tournament.tgpConfig);
}

/**
 * Validates player results
 *
 * @param results - Array of player results to validate
 * @throws ValidationError if results are invalid
 */
export function validatePlayerResults(results: PlayerResult[]): void {
  if (!Array.isArray(results)) {
    throw new ValidationError('Results must be an array');
  }

  if (results.length === 0) {
    throw new ValidationError('Results array cannot be empty');
  }

  results.forEach((result, index) => {
    validatePlayer(result.player);

    if (typeof result.position !== 'number' || result.position < 1) {
      throw new ValidationError(`Result ${index} has invalid position: ${result.position}`);
    }
  });

  // Check for duplicate positions (ties are OK if explicitly marked)
  const positions = results.map((r) => r.position);
  const positionCounts = new Map<number, number>();
  positions.forEach((pos) => {
    positionCounts.set(pos, (positionCounts.get(pos) ?? 0) + 1);
  });

  // Ensure we have a clear 1st place (no tie for first)
  const firstPlaceCount = positionCounts.get(1) ?? 0;
  if (firstPlaceCount !== 1) {
    throw new ValidationError(
      `Must have exactly one player in 1st place (found ${firstPlaceCount})`
    );
  }
}

/**
 * Validates that finals meets requirements for >100% TGP
 *
 * @param totalParticipants - Total tournament participants
 * @param finalistCount - Number of finalists
 * @throws ValidationError if requirements not met
 */
export function validateFinalsRequirements(
  totalParticipants: number,
  finalistCount: number
): void {
  const percentage = finalistCount / totalParticipants;

  if (percentage < VALIDATION.MIN_PARTICIPATION_PERCENT * 0.2) {
    // 10% minimum
    throw new ValidationError(
      `Finals must include at least 10% of participants (got ${(percentage * 100).toFixed(1)}%)`
    );
  }

  if (percentage > VALIDATION.MIN_PARTICIPATION_PERCENT) {
    // 50% maximum
    throw new ValidationError(
      `Finals cannot include more than 50% of participants (got ${(percentage * 100).toFixed(1)}%)`
    );
  }
}

/**
 * Validates a date is not in the future
 *
 * @param date - Date to validate
 * @param fieldName - Name of the field for error message
 * @throws ValidationError if date is in the future
 */
export function validateDateNotFuture(date: Date, fieldName = 'Date'): void {
  if (date.getTime() > Date.now()) {
    throw new ValidationError(`${fieldName} cannot be in the future`);
  }
}

/**
 * Validates a percentage value is between 0 and 100
 *
 * @param value - Percentage value to validate
 * @param fieldName - Name of the field for error message
 * @throws ValidationError if value is out of range
 */
export function validatePercentage(value: number, fieldName = 'Percentage'): void {
  if (value < 0 || value > 100) {
    throw new ValidationError(`${fieldName} must be between 0 and 100 (got ${value})`);
  }
}
