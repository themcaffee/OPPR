import type { Command } from 'commander';
import ora from 'ora';
import { createClient, getApiUrl, type GlobalOptions } from '../client.js';
import { output, success } from '../utils/index.js';
import { wrapCommand } from '../utils/index.js';

interface ListOptions {
  page?: string;
  limit?: string;
  sortBy?: string;
  sortOrder?: string;
  rated?: boolean;
}

interface SearchOptions {
  limit?: string;
}

interface CreateOptions {
  name?: string;
  externalId?: string;
  rating?: string;
}

interface UpdateOptions {
  name?: string;
  rating?: string;
  ranking?: string;
}

interface TopOptions {
  limit?: string;
}

export function registerPlayerCommands(program: Command): void {
  const players = program.command('players').description('Manage players');

  players
    .command('list')
    .description('List players with pagination')
    .option('--page <number>', 'Page number', '1')
    .option('--limit <number>', 'Items per page', '20')
    .option('--sort-by <field>', 'Sort by field (rating, ranking, name, eventCount, createdAt)')
    .option('--sort-order <order>', 'Sort order (asc, desc)')
    .option('--rated', 'Only show rated players')
    .action(
      wrapCommand(async (options: ListOptions, cmd: Command) => {
        const globalOpts = cmd.optsWithGlobals<GlobalOptions>();
        const client = createClient(getApiUrl(globalOpts));

        const spinner = ora('Fetching players...').start();
        const result = await client.players.list({
          page: parseInt(options.page ?? '1'),
          limit: parseInt(options.limit ?? '20'),
          sortBy: options.sortBy as 'rating' | 'ranking' | 'name' | 'eventCount' | 'createdAt',
          sortOrder: options.sortOrder as 'asc' | 'desc',
          isRated: options.rated ? true : undefined,
        });
        spinner.stop();

        if (globalOpts.json) {
          output(result, { json: true });
        } else {
          output(result.data, { json: false });
          console.log(
            `\nPage ${result.pagination.page} of ${result.pagination.totalPages} (${result.pagination.total} total)`
          );
        }
      })
    );

  players
    .command('get <id>')
    .description('Get player by ID')
    .action(
      wrapCommand(async (id: string, _options: object, cmd: Command) => {
        const globalOpts = cmd.optsWithGlobals<GlobalOptions>();
        const client = createClient(getApiUrl(globalOpts));

        const spinner = ora('Fetching player...').start();
        const player = await client.players.get(id);
        spinner.stop();

        output(player, { json: globalOpts.json });
      })
    );

  players
    .command('search <query>')
    .description('Search players by name')
    .option('--limit <number>', 'Maximum results', '10')
    .action(
      wrapCommand(async (query: string, options: SearchOptions, cmd: Command) => {
        const globalOpts = cmd.optsWithGlobals<GlobalOptions>();
        const client = createClient(getApiUrl(globalOpts));

        const spinner = ora('Searching players...').start();
        const results = await client.players.search({
          q: query,
          limit: parseInt(options.limit ?? '10'),
        });
        spinner.stop();

        output(results, { json: globalOpts.json });
      })
    );

  players
    .command('create')
    .description('Create a new player')
    .option('--name <name>', 'Player name')
    .option('--external-id <id>', 'External ID (e.g., IFPA ID)')
    .option('--rating <rating>', 'Initial rating')
    .action(
      wrapCommand(async (options: CreateOptions, cmd: Command) => {
        const globalOpts = cmd.optsWithGlobals<GlobalOptions>();
        const client = createClient(getApiUrl(globalOpts));

        if (!options.name) {
          console.error('--name is required');
          process.exit(1);
        }

        const spinner = ora('Creating player...').start();
        const player = await client.players.create({
          name: options.name,
          externalId: options.externalId,
          rating: options.rating ? parseFloat(options.rating) : undefined,
        });
        spinner.stop();

        success(`Player created with ID: ${player.id}`);
        output(player, { json: globalOpts.json });
      })
    );

  players
    .command('update <id>')
    .description('Update a player')
    .option('--name <name>', 'Player name')
    .option('--rating <rating>', 'Rating')
    .option('--ranking <ranking>', 'Ranking')
    .action(
      wrapCommand(async (id: string, options: UpdateOptions, cmd: Command) => {
        const globalOpts = cmd.optsWithGlobals<GlobalOptions>();
        const client = createClient(getApiUrl(globalOpts));

        const spinner = ora('Updating player...').start();
        const player = await client.players.update(id, {
          name: options.name,
          rating: options.rating ? parseFloat(options.rating) : undefined,
          ranking: options.ranking ? parseInt(options.ranking) : undefined,
        });
        spinner.stop();

        success('Player updated');
        output(player, { json: globalOpts.json });
      })
    );

  players
    .command('delete <id>')
    .description('Delete a player')
    .action(
      wrapCommand(async (id: string, _options: object, cmd: Command) => {
        const globalOpts = cmd.optsWithGlobals<GlobalOptions>();
        const client = createClient(getApiUrl(globalOpts));

        const spinner = ora('Deleting player...').start();
        await client.players.delete(id);
        spinner.stop();

        success(`Player ${id} deleted`);
      })
    );

  players
    .command('results <id>')
    .description('Get tournament results for a player')
    .action(
      wrapCommand(async (id: string, _options: object, cmd: Command) => {
        const globalOpts = cmd.optsWithGlobals<GlobalOptions>();
        const client = createClient(getApiUrl(globalOpts));

        const spinner = ora('Fetching results...').start();
        const results = await client.players.getResults(id);
        spinner.stop();

        output(results, { json: globalOpts.json });
      })
    );

  players
    .command('stats <id>')
    .description('Get statistics for a player')
    .action(
      wrapCommand(async (id: string, _options: object, cmd: Command) => {
        const globalOpts = cmd.optsWithGlobals<GlobalOptions>();
        const client = createClient(getApiUrl(globalOpts));

        const spinner = ora('Fetching stats...').start();
        const stats = await client.players.getStats(id);
        spinner.stop();

        output(stats, { json: globalOpts.json });
      })
    );

  players
    .command('top-rating')
    .description('Get top players by rating')
    .option('--limit <number>', 'Number of players', '10')
    .action(
      wrapCommand(async (options: TopOptions, cmd: Command) => {
        const globalOpts = cmd.optsWithGlobals<GlobalOptions>();
        const client = createClient(getApiUrl(globalOpts));

        const spinner = ora('Fetching top players...').start();
        const playerList = await client.players.topByRating({
          limit: parseInt(options.limit ?? '10'),
        });
        spinner.stop();

        output(playerList, { json: globalOpts.json });
      })
    );

  players
    .command('top-ranking')
    .description('Get top players by ranking')
    .option('--limit <number>', 'Number of players', '10')
    .action(
      wrapCommand(async (options: TopOptions, cmd: Command) => {
        const globalOpts = cmd.optsWithGlobals<GlobalOptions>();
        const client = createClient(getApiUrl(globalOpts));

        const spinner = ora('Fetching top players...').start();
        const playerList = await client.players.topByRanking({
          limit: parseInt(options.limit ?? '10'),
        });
        spinner.stop();

        output(playerList, { json: globalOpts.json });
      })
    );
}
