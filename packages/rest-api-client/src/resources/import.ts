import type {
  ImportMatchplayTournamentRequest,
  ImportTournamentResponse,
} from '../types/index.js';

 
type RequestFn = <T>(p: string, o?: RequestInit, r?: boolean) => Promise<T>;
 

/**
 * Import resource methods
 */
export class ImportResource {
  constructor(private readonly _request: RequestFn) {}

  /**
   * Import a tournament from Matchplay
   */
  async matchplayTournament(
    matchplayId: number,
    options: ImportMatchplayTournamentRequest = {},
  ): Promise<ImportTournamentResponse> {
    return this._request<ImportTournamentResponse>(`/import/matchplay/tournament/${matchplayId}`, {
      method: 'POST',
      body: JSON.stringify(options),
    });
  }
}
