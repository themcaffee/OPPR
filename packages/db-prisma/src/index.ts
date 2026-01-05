/**
 * oppr-db - Database backend for OPPR using Prisma and PostgreSQL
 *
 * This library provides a complete database solution for storing and querying
 * OPPR (Open Pinball Player Ranking System) data including players, tournaments,
 * and tournament results.
 */

// Export database client and utilities
export { prisma, connect, disconnect, testConnection } from './client.js';

// Export player functions
export {
  createPlayer,
  findPlayerById,
  findPlayerByExternalId,
  findPlayerByPlayerNumber,
  findPlayerByUserEmail,
  findPlayers,
  getRatedPlayers,
  getTopPlayersByRating,
  getTopPlayersByRanking,
  updatePlayer,
  updatePlayerRating,
  deletePlayer,
  countPlayers,
  getPlayerWithResults,
  searchPlayers,
} from './players.js';

// Export player number utilities
export { generateUniquePlayerNumber, isValidPlayerNumber } from './player-number.js';

// Export tournament functions
export {
  createTournament,
  findTournamentById,
  findTournamentByExternalId,
  findTournaments,
  getRecentTournaments,
  getTournamentsByDateRange,
  getTournamentsByBoosterType,
  getMajorTournaments,
  updateTournament,
  deleteTournament,
  countTournaments,
  getTournamentWithResults,
  getTournamentWithMatches,
  searchTournaments,
  getTournamentStats,
} from './tournaments.js';

// Export round functions
export {
  createRound,
  createManyRounds,
  findRoundById,
  findRoundByTournamentAndNumber,
  findRounds,
  getTournamentRounds,
  getQualifyingRounds,
  getFinalsRounds,
  updateRound,
  deleteRound,
  deleteRoundsByTournament,
  countRounds,
  getRoundWithMatches,
} from './rounds.js';

// Export match functions
export {
  createMatch,
  createManyMatches,
  findMatchById,
  findMatches,
  getTournamentMatches,
  getRoundMatches,
  updateMatch,
  deleteMatch,
  deleteMatchesByTournament,
  deleteMatchesByRound,
  countMatches,
  getMatchWithEntries,
  getPlayerTournamentMatches,
} from './matches.js';

// Export entry functions
export {
  createEntry,
  createManyEntries,
  findEntryById,
  findEntryByMatchAndPlayer,
  findEntries,
  getMatchEntries,
  getPlayerEntries,
  getPlayerTournamentEntries,
  updateEntry,
  deleteEntry,
  deleteEntriesByMatch,
  countEntries,
  getPlayerEntryStats,
} from './entries.js';

// Export standing functions
export {
  createStanding,
  createManyStandings,
  findStandingById,
  findStandingByPlayerAndTournament,
  findStandings,
  getPlayerStandings,
  getTournamentStandings,
  getQualifyingStandings,
  getFinalsStandings,
  getMergedStandings,
  getPlayerTopFinishes,
  updateStanding,
  updateStandingPoints,
  deleteStanding,
  deleteStandingsByTournament,
  countStandings,
  getPlayerStats,
  recalculateTimeDecay,
} from './standings.js';

// Export user functions
export {
  createUser,
  createUserWithPlayer,
  findUserById,
  findUserByEmail,
  findUsers,
  getUserWithPlayer,
  getUserByEmailWithPlayer,
  updateUser,
  updateUserRefreshToken,
  deleteUser,
  countUsers,
  linkPlayerToUser,
} from './users.js';

// Export API key functions
export {
  createApiKey,
  findApiKeyById,
  findApiKeysByPrefix,
  getUserApiKeys,
  countUserApiKeys,
  updateApiKeyLastUsed,
  deleteApiKey,
  deleteUserApiKey,
  MAX_API_KEYS_PER_USER,
  type CreateApiKeyInput,
  type ApiKeyWithUser,
  type ApiKeyInfo,
} from './api-keys.js';

// Export location functions
export {
  createLocation,
  findLocationById,
  findLocationByExternalId,
  findLocations,
  searchLocations,
  updateLocation,
  deleteLocation,
  countLocations,
  getLocationWithTournaments,
} from './locations.js';

// Export all types
export * from './types.js';
