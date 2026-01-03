import type { Command } from 'commander';
import { registerAuthCommands } from './auth.js';
import { registerPlayerCommands } from './players.js';
import { registerTournamentCommands } from './tournaments.js';
import { registerResultCommands } from './results.js';
import { registerStatsCommands } from './stats.js';
import { registerImportCommands } from './import.js';
import { registerUserCommands } from './users.js';

export function registerCommands(program: Command): void {
  registerAuthCommands(program);
  registerPlayerCommands(program);
  registerTournamentCommands(program);
  registerResultCommands(program);
  registerStatsCommands(program);
  registerImportCommands(program);
  registerUserCommands(program);
}
