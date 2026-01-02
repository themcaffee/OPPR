import type { Command } from 'commander';
import ora from 'ora';
import type { EventBoosterType } from '@opprs/rest-api-client';
import { createClient, getApiUrl, type GlobalOptions } from '../client.js';
import { output, success } from '../utils/index.js';
import { wrapCommand } from '../utils/index.js';

interface ListOptions {
  page?: string;
  limit?: string;
  sortBy?: string;
  sortOrder?: string;
  eventBooster?: string;
}

interface SearchOptions {
  limit?: string;
}

interface CreateOptions {
  name?: string;
  date?: string;
  location?: string;
  eventBooster?: string;
  externalId?: string;
}

interface UpdateOptions {
  name?: string;
  date?: string;
  location?: string;
  eventBooster?: string;
}

interface LimitOptions {
  limit?: string;
}

export function registerTournamentCommands(program: Command): void {
  const tournaments = program.command('tournaments').description('Manage tournaments');

  tournaments
    .command('list')
    .description('List tournaments with pagination')
    .option('--page <number>', 'Page number', '1')
    .option('--limit <number>', 'Items per page', '20')
    .option('--sort-by <field>', 'Sort by field (date, name, firstPlaceValue, createdAt)')
    .option('--sort-order <order>', 'Sort order (asc, desc)')
    .option('--event-booster <type>', 'Filter by event booster type')
    .action(
      wrapCommand(async (options: ListOptions, cmd: Command) => {
        const globalOpts = cmd.optsWithGlobals<GlobalOptions>();
        const client = createClient(getApiUrl(globalOpts));

        const spinner = ora('Fetching tournaments...').start();
        const result = await client.tournaments.list({
          page: parseInt(options.page ?? '1'),
          limit: parseInt(options.limit ?? '20'),
          sortBy: options.sortBy as 'date' | 'name' | 'firstPlaceValue' | 'createdAt',
          sortOrder: options.sortOrder as 'asc' | 'desc',
          eventBooster: options.eventBooster as EventBoosterType,
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

  tournaments
    .command('get <id>')
    .description('Get tournament by ID')
    .action(
      wrapCommand(async (id: string, _options: object, cmd: Command) => {
        const globalOpts = cmd.optsWithGlobals<GlobalOptions>();
        const client = createClient(getApiUrl(globalOpts));

        const spinner = ora('Fetching tournament...').start();
        const tournament = await client.tournaments.get(id);
        spinner.stop();

        output(tournament, { json: globalOpts.json });
      })
    );

  tournaments
    .command('search <query>')
    .description('Search tournaments by name or location')
    .option('--limit <number>', 'Maximum results', '10')
    .action(
      wrapCommand(async (query: string, options: SearchOptions, cmd: Command) => {
        const globalOpts = cmd.optsWithGlobals<GlobalOptions>();
        const client = createClient(getApiUrl(globalOpts));

        const spinner = ora('Searching tournaments...').start();
        const results = await client.tournaments.search({
          q: query,
          limit: parseInt(options.limit ?? '10'),
        });
        spinner.stop();

        output(results, { json: globalOpts.json });
      })
    );

  tournaments
    .command('create')
    .description('Create a new tournament')
    .option('--name <name>', 'Tournament name')
    .option('--date <date>', 'Tournament date (ISO format)')
    .option('--location <location>', 'Tournament location')
    .option('--event-booster <type>', 'Event booster type (NONE, CERTIFIED, CERTIFIED_PLUS, CHAMPIONSHIP_SERIES, MAJOR)')
    .option('--external-id <id>', 'External ID')
    .action(
      wrapCommand(async (options: CreateOptions, cmd: Command) => {
        const globalOpts = cmd.optsWithGlobals<GlobalOptions>();
        const client = createClient(getApiUrl(globalOpts));

        if (!options.name || !options.date) {
          console.error('--name and --date are required');
          process.exit(1);
        }

        const spinner = ora('Creating tournament...').start();
        const tournament = await client.tournaments.create({
          name: options.name,
          date: options.date,
          location: options.location,
          eventBooster: options.eventBooster as EventBoosterType,
          externalId: options.externalId,
        });
        spinner.stop();

        success(`Tournament created with ID: ${tournament.id}`);
        output(tournament, { json: globalOpts.json });
      })
    );

  tournaments
    .command('update <id>')
    .description('Update a tournament')
    .option('--name <name>', 'Tournament name')
    .option('--date <date>', 'Tournament date (ISO format)')
    .option('--location <location>', 'Tournament location')
    .option('--event-booster <type>', 'Event booster type')
    .action(
      wrapCommand(async (id: string, options: UpdateOptions, cmd: Command) => {
        const globalOpts = cmd.optsWithGlobals<GlobalOptions>();
        const client = createClient(getApiUrl(globalOpts));

        const spinner = ora('Updating tournament...').start();
        const tournament = await client.tournaments.update(id, {
          name: options.name,
          date: options.date,
          location: options.location,
          eventBooster: options.eventBooster as EventBoosterType,
        });
        spinner.stop();

        success('Tournament updated');
        output(tournament, { json: globalOpts.json });
      })
    );

  tournaments
    .command('delete <id>')
    .description('Delete a tournament')
    .action(
      wrapCommand(async (id: string, _options: object, cmd: Command) => {
        const globalOpts = cmd.optsWithGlobals<GlobalOptions>();
        const client = createClient(getApiUrl(globalOpts));

        const spinner = ora('Deleting tournament...').start();
        await client.tournaments.delete(id);
        spinner.stop();

        success(`Tournament ${id} deleted`);
      })
    );

  tournaments
    .command('results <id>')
    .description('Get tournament results (standings)')
    .action(
      wrapCommand(async (id: string, _options: object, cmd: Command) => {
        const globalOpts = cmd.optsWithGlobals<GlobalOptions>();
        const client = createClient(getApiUrl(globalOpts));

        const spinner = ora('Fetching results...').start();
        const results = await client.tournaments.getResults(id);
        spinner.stop();

        output(results, { json: globalOpts.json });
      })
    );

  tournaments
    .command('stats <id>')
    .description('Get tournament statistics')
    .action(
      wrapCommand(async (id: string, _options: object, cmd: Command) => {
        const globalOpts = cmd.optsWithGlobals<GlobalOptions>();
        const client = createClient(getApiUrl(globalOpts));

        const spinner = ora('Fetching stats...').start();
        const stats = await client.tournaments.getStats(id);
        spinner.stop();

        output(stats, { json: globalOpts.json });
      })
    );

  tournaments
    .command('recent')
    .description('Get recent tournaments')
    .option('--limit <number>', 'Number of tournaments', '10')
    .action(
      wrapCommand(async (options: LimitOptions, cmd: Command) => {
        const globalOpts = cmd.optsWithGlobals<GlobalOptions>();
        const client = createClient(getApiUrl(globalOpts));

        const spinner = ora('Fetching recent tournaments...').start();
        const tournamentList = await client.tournaments.recent({
          limit: parseInt(options.limit ?? '10'),
        });
        spinner.stop();

        output(tournamentList, { json: globalOpts.json });
      })
    );

  tournaments
    .command('majors')
    .description('Get major tournaments')
    .option('--limit <number>', 'Number of tournaments', '10')
    .action(
      wrapCommand(async (options: LimitOptions, cmd: Command) => {
        const globalOpts = cmd.optsWithGlobals<GlobalOptions>();
        const client = createClient(getApiUrl(globalOpts));

        const spinner = ora('Fetching major tournaments...').start();
        const tournamentList = await client.tournaments.majors({
          limit: parseInt(options.limit ?? '10'),
        });
        spinner.stop();

        output(tournamentList, { json: globalOpts.json });
      })
    );
}
