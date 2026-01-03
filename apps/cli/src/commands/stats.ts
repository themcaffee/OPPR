import type { Command } from 'commander';
import ora from 'ora';
import { createClient, getApiUrl, type GlobalOptions } from '../client.js';
import { output } from '../utils/index.js';
import { wrapCommand } from '../utils/index.js';

interface LeaderboardOptions {
  limit?: string;
  type?: string;
}

export function registerStatsCommands(program: Command): void {
  const stats = program.command('stats').description('View system statistics');

  stats
    .command('overview')
    .description('Get system-wide statistics')
    .action(
      wrapCommand(async (_options: object, cmd: Command) => {
        const globalOpts = cmd.optsWithGlobals<GlobalOptions>();
        const client = createClient(getApiUrl(globalOpts));

        const spinner = ora('Fetching overview...').start();
        const overview = await client.stats.overview();
        spinner.stop();

        output(overview, { json: globalOpts.json });
      })
    );

  stats
    .command('leaderboard')
    .description('Get player leaderboard')
    .option('--limit <number>', 'Number of players', '10')
    .option('--type <type>', 'Leaderboard type (ranking, rating)', 'ranking')
    .action(
      wrapCommand(async (options: LeaderboardOptions, cmd: Command) => {
        const globalOpts = cmd.optsWithGlobals<GlobalOptions>();
        const client = createClient(getApiUrl(globalOpts));

        const spinner = ora('Fetching leaderboard...').start();
        const leaderboard = await client.stats.leaderboard({
          limit: parseInt(options.limit ?? '10'),
          type: options.type as 'ranking' | 'rating',
        });
        spinner.stop();

        output(leaderboard, { json: globalOpts.json });
      })
    );
}
