import {
  MatchplayClient,
  MatchplayNotFoundError,
  MatchplayApiError,
  MatchplayNetworkError,
} from '@opprs/matchplay-api';
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
  createManyResults,
  deleteResultsByTournament,
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

  try {
    [matchplayTournament, matchplayResults] = await Promise.all([
      client.getTournament(matchplayId),
      client.getTournamentResults(matchplayId),
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

  for (const player of players) {
    const playerExternalId = `matchplay:${player.id}`;
    let dbPlayer = await findPlayerByExternalId(playerExternalId);

    if (dbPlayer) {
      dbPlayer = await updatePlayer(dbPlayer.id, {
        rating: player.rating,
        ratingDeviation: player.ratingDeviation,
        ranking: player.ranking,
        isRated: player.isRated,
        eventCount: player.eventCount,
      });
      playersUpdated++;
    } else {
      dbPlayer = await createPlayer({
        externalId: playerExternalId,
        rating: player.rating,
        ratingDeviation: player.ratingDeviation,
        ranking: player.ranking,
        isRated: player.isRated,
        eventCount: player.eventCount,
      });
      playersCreated++;
    }

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
    await deleteResultsByTournament(existingTournament.id);
    tournament = await updateTournament(existingTournament.id, tournamentData);
  } else {
    tournament = await createTournament(tournamentData);
  }

  // Distribute points
  const pointDistributions = distributePoints(matchplayResults, firstPlaceValue);

  // Calculate decay and create results
  const resultData = pointDistributions.map((dist) => {
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
      optedOut: false,
      linearPoints: dist.linearPoints,
      dynamicPoints: dist.dynamicPoints,
      totalPoints: dist.totalPoints,
      decayMultiplier,
      decayedPoints,
      efficiency,
    };
  });

  await createManyResults(resultData);

  return {
    tournament,
    playersCreated,
    playersUpdated,
    resultsCount: resultData.length,
    created: !isUpdate,
  };
}
