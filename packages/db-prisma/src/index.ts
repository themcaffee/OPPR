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
  searchTournaments,
  getTournamentStats,
} from './tournaments.js';

// Export result functions
export {
  createResult,
  createManyResults,
  findResultById,
  findResultByPlayerAndTournament,
  findResults,
  getPlayerResults,
  getTournamentResults,
  getPlayerTopFinishes,
  updateResult,
  updateResultPoints,
  deleteResult,
  deleteResultsByTournament,
  countResults,
  getPlayerStats,
  recalculateTimeDecay,
} from './results.js';

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
} from './users.js';

// Export all types
export * from './types.js';
