import type { OverviewStats, LeaderboardParams, Player } from '../types/index.js';

 
type RequestFn = <T>(p: string, o?: RequestInit, r?: boolean) => Promise<T>;
type BuildQueryFn = (p: Record<string, unknown>) => string;
 

/**
 * Stats resource methods
 */
export class StatsResource {
  constructor(
     
    private readonly _request: RequestFn,
    private readonly _buildQueryString: BuildQueryFn,
    ) {
     }

  /**
   * Get system-wide statistics
   */
  async overview(): Promise<OverviewStats> {
    return this._request<OverviewStats>('/stats/overview');
  }

  /**
   * Get player leaderboard
   */
  async leaderboard(params: LeaderboardParams = {}): Promise<Player[]> {
    const queryString = this._buildQueryString(params as Record<string, unknown>);
    return this._request<Player[]>(`/stats/leaderboard${queryString}`);
  }
}
