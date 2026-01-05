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
  updatePlayer,
  deletePlayer,
  countPlayers,
  getPlayerWithResults,
  searchPlayers,
} from './players.js';

// Export OPPR ranking functions
export {
  getOrCreateOpprPlayerRanking,
  createOpprPlayerRanking,
  findOpprPlayerRankingById,
  findOpprPlayerRankingByPlayerId,
  findOpprPlayerRankings,
  getTopPlayersByOpprRating,
  getTopPlayersByOpprRanking,
  getRatedOpprPlayers,
  updateOpprPlayerRanking,
  updateOpprRatingAfterTournament,
  updateWorldRankings,
  applyRDDecayForInactivePlayers,
  deleteOpprPlayerRanking,
  countOpprPlayerRankings,
  createOpprRankingHistory,
  getOpprRankingHistory,
  getOpprRankingHistoryByDateRange,
  getLatestOpprRankingHistory,
  countOpprRankingHistory,
} from './oppr-rankings.js';

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

// Export blog post functions
export {
  createBlogPost,
  findBlogPostById,
  findBlogPostBySlug,
  findBlogPosts,
  findPublishedBlogPosts,
  searchBlogPosts,
  updateBlogPost,
  deleteBlogPost,
  countBlogPosts,
  countPublishedBlogPosts,
} from './blog-posts.js';

// Export blog tag functions
export {
  createBlogTag,
  findBlogTagById,
  findBlogTagBySlug,
  findBlogTags,
  searchBlogTags,
  updateBlogTag,
  deleteBlogTag,
  countBlogTags,
  getBlogTagWithPostCount,
  getBlogTagsWithPostCounts,
} from './blog-tags.js';

// Export blog types
export type {
  BlogPostWithRelations,
  CreateBlogPostInput,
  UpdateBlogPostInput,
  FindBlogPostsOptions,
} from './blog-posts.js';

export type {
  CreateBlogTagInput,
  UpdateBlogTagInput,
  FindBlogTagsOptions,
} from './blog-tags.js';

// Export all types
export * from './types.js';
