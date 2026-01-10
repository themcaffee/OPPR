import {
  MatchplayClient,
  MatchplayNotFoundError,
  MatchplayApiError,
  MatchplayNetworkError,
} from '@opprs/matchplay-api';
import type { MatchplayStanding } from '@opprs/matchplay-api';
import type {
  Tournament as CoreTournament,
  PlayerResult,
  EventBoosterType as CoreEventBoosterType,
} from '@opprs/core';
import {
  calculateBaseValue,
  calculateRatingTVA,
  calculateRankingTVA,
  calculateTGP,
  getEventBoosterMultiplier,
  distributePoints,
  calculateDecayMultiplier,
} from '@opprs/core';
import {
  createTournament,
  updateTournament,
  findTournamentByExternalId,
  createPlayer,
  updatePlayer,
  findPlayerByExternalId,
  createManyStandings,
  deleteStandingsByTournament,
  getOrCreateOpprPlayerRanking,
  updateOpprPlayerRanking,
} from '@opprs/db-prisma';
import type { EventBoosterType, Tournament, Prisma } from '@opprs/db-prisma';
import { NotFoundError, ExternalServiceError } from '../utils/errors.js';
import { env } from '../config/env.js';

export interface ImportOptions {
  eventBoosterOverride?: EventBoosterType;
  apiToken?: string;
}

export interface ImportResult {
  tournament: Tournament;
  playersCreated: number;
  playersUpdated: number;
  resultsCount: number;
  created: boolean;
}

/**
 * Map core EventBoosterType (kebab-case) to database EventBoosterType (UPPER_SNAKE_CASE)
 */
function mapEventBoosterToDb(coreType: CoreEventBoosterType): EventBoosterType {
  const mapping: Record<CoreEventBoosterType, EventBoosterType> = {
    none: 'NONE',
    certified: 'CERTIFIED',
    'certified-plus': 'CERTIFIED_PLUS',
    'championship-series': 'CHAMPIONSHIP_SERIES',
    major: 'MAJOR',
  };
  return mapping[coreType] ?? 'NONE';
}

/**
 * Map database EventBoosterType (UPPER_SNAKE_CASE) to core EventBoosterType (kebab-case)
 */
function mapEventBoosterToCore(dbType: EventBoosterType): CoreEventBoosterType {
  const mapping: Record<EventBoosterType, CoreEventBoosterType> = {
    NONE: 'none',
    CERTIFIED: 'certified',
    CERTIFIED_PLUS: 'certified-plus',
    CHAMPIONSHIP_SERIES: 'championship-series',
    MAJOR: 'major',
  };
  return mapping[dbType] ?? 'none';
}

/**
 * Import a tournament from Matchplay API
 */
export async function importTournament(
  matchplayId: number,
  options: ImportOptions = {}
): Promise<ImportResult> {
  const apiToken = options.apiToken ?? env.matchplayApiToken;
  const client = new MatchplayClient({ apiToken });

  let matchplayTournament: CoreTournament;
  let matchplayResults: PlayerResult[];
  let standings: MatchplayStanding[];

  try {
    [matchplayTournament, matchplayResults, standings] = await Promise.all([
      client.getTournament(matchplayId),
      client.getTournamentResults(matchplayId),
      client.getStandings(matchplayId),
    ]);
  } catch (error: unknown) {
    if (error instanceof MatchplayNotFoundError) {
      throw new NotFoundError('Matchplay Tournament', String(matchplayId));
    }
    if (error instanceof MatchplayApiError || error instanceof MatchplayNetworkError) {
      throw new ExternalServiceError('Matchplay API', error.message);
    }
    throw error;
  }

  const externalId = `matchplay:${matchplayId}`;
  const existingTournament = await findTournamentByExternalId(externalId);
  const isUpdate = !!existingTournament;

  // Determine event booster: use override, or map from matchplay data
  const eventBooster =
    options.eventBoosterOverride ?? mapEventBoosterToDb(matchplayTournament.eventBooster);

  // Calculate OPPRS values
  const players = matchplayTournament.players;
  const baseValue = calculateBaseValue(players);
  const tvaRating = calculateRatingTVA(players);
  const tvaRanking = calculateRankingTVA(players);
  const totalTVA = tvaRating + tvaRanking;
  const tgp = calculateTGP(matchplayTournament.tgpConfig);
  const eventBoosterMultiplier = getEventBoosterMultiplier(mapEventBoosterToCore(eventBooster));
  const firstPlaceValue = (baseValue + totalTVA) * tgp * eventBoosterMultiplier;

  // Create/update players in database
  let playersCreated = 0;
  let playersUpdated = 0;
  const playerIdMap = new Map<string, string>(); // matchplay ID -> database ID

  // Create a map of matchplay user ID -> name for setting player names
  const playerNameMap = new Map<string, string>();
  for (const standing of standings) {
    const id = standing.userId ? String(standing.userId) : String(standing.playerId);
    playerNameMap.set(id, standing.name);
  }

  for (const player of players) {
    const playerExternalId = `matchplay:${player.id}`;
    let dbPlayer = await findPlayerByExternalId(playerExternalId);
    const playerName = playerNameMap.get(player.id);

    if (dbPlayer) {
      // Only update name if not already set
      dbPlayer = await updatePlayer(dbPlayer.id, {
        eventCount: player.eventCount,
        ...(playerName && !dbPlayer.name ? { name: playerName } : {}),
      });
      playersUpdated++;
    } else {
      dbPlayer = await createPlayer({
        externalId: playerExternalId,
        eventCount: player.eventCount,
        name: playerName,
      });
      playersCreated++;
    }

    // Create or update OPPR ranking for the player
    await getOrCreateOpprPlayerRanking(dbPlayer.id);
    await updateOpprPlayerRanking(dbPlayer.id, {
      rating: player.rating,
      ratingDeviation: player.ratingDeviation,
      ranking: player.ranking ?? undefined,
      isRated: player.isRated,
    });

    playerIdMap.set(player.id, dbPlayer.id);
  }

  // Tournament data object
  const tournamentData = {
    externalId,
    name: matchplayTournament.name,
    date: matchplayTournament.date,
    tgpConfig: matchplayTournament.tgpConfig as unknown as Prisma.InputJsonValue,
    eventBooster,
    allowsOptOut: matchplayTournament.allowsOptOut ?? false,
    baseValue,
    tvaRating,
    tvaRanking,
    totalTVA,
    tgp,
    eventBoosterMultiplier,
    firstPlaceValue,
  };

  let tournament: Tournament;

  if (isUpdate) {
    await deleteStandingsByTournament(existingTournament.id);
    tournament = await updateTournament(existingTournament.id, tournamentData);
  } else {
    tournament = await createTournament(tournamentData);
  }

  // Distribute points
  const pointDistributions = distributePoints(matchplayResults, firstPlaceValue);

  // Calculate decay and create standings
  // Note: For now we create qualifying standings (isFinals: false)
  // Future: Import match data and create finals standings separately
  const standingData = pointDistributions.map((dist) => {
    const dbPlayerId = playerIdMap.get(dist.player.id);
    if (!dbPlayerId) {
      throw new Error(`Player mapping not found for ${dist.player.id}`);
    }

    const decayMultiplier = calculateDecayMultiplier(matchplayTournament.date);
    const decayedPoints = dist.totalPoints * decayMultiplier;
    const efficiency = firstPlaceValue > 0 ? (dist.totalPoints / firstPlaceValue) * 100 : 0;

    return {
      playerId: dbPlayerId,
      tournamentId: tournament.id,
      position: dist.position,
      isFinals: false, // Currently importing as qualifying standings
      optedOut: false,
      linearPoints: dist.linearPoints,
      dynamicPoints: dist.dynamicPoints,
      totalPoints: dist.totalPoints,
      decayMultiplier,
      decayedPoints,
      efficiency,
    };
  });

  await createManyStandings(standingData);

  return {
    tournament,
    playersCreated,
    playersUpdated,
    resultsCount: standingData.length,
    created: !isUpdate,
  };
}
