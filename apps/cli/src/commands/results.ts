import type { Command } from 'commander';
import ora from 'ora';
import type { CreateResultRequest } from '@opprs/rest-api-client';
import { createClient, getApiUrl, type GlobalOptions } from '../client.js';
import { output, success, info } from '../utils/index.js';
import { wrapCommand } from '../utils/index.js';

interface ListOptions {
  page?: string;
  limit?: string;
  playerId?: string;
  tournamentId?: string;
  sortBy?: string;
  sortOrder?: string;
}

interface CreateOptions {
  playerId?: string;
  tournamentId?: string;
  position?: string;
  optedOut?: boolean;
}

interface UpdateOptions {
  position?: string;
  optedOut?: boolean;
}

export function registerResultCommands(program: Command): void {
  const results = program.command('results').description('Manage tournament results');

  results
    .command('list')
    .description('List results with pagination')
    .option('--page <number>', 'Page number', '1')
    .option('--limit <number>', 'Items per page', '20')
    .option('--player-id <id>', 'Filter by player ID')
    .option('--tournament-id <id>', 'Filter by tournament ID')
    .option('--sort-by <field>', 'Sort by field (position, totalPoints, decayedPoints, createdAt)')
    .option('--sort-order <order>', 'Sort order (asc, desc)')
    .action(
      wrapCommand(async (options: ListOptions, cmd: Command) => {
        const globalOpts = cmd.optsWithGlobals<GlobalOptions>();
        const client = createClient(getApiUrl(globalOpts));

        const spinner = ora('Fetching results...').start();
        const result = await client.results.list({
          page: parseInt(options.page ?? '1'),
          limit: parseInt(options.limit ?? '20'),
          playerId: options.playerId,
          tournamentId: options.tournamentId,
          sortBy: options.sortBy as 'position' | 'totalPoints' | 'decayedPoints' | 'createdAt',
          sortOrder: options.sortOrder as 'asc' | 'desc',
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

  results
    .command('get <id>')
    .description('Get result by ID')
    .action(
      wrapCommand(async (id: string, _options: object, cmd: Command) => {
        const globalOpts = cmd.optsWithGlobals<GlobalOptions>();
        const client = createClient(getApiUrl(globalOpts));

        const spinner = ora('Fetching result...').start();
        const resultData = await client.results.get(id);
        spinner.stop();

        output(resultData, { json: globalOpts.json });
      })
    );

  results
    .command('create')
    .description('Create a new result')
    .option('--player-id <id>', 'Player ID')
    .option('--tournament-id <id>', 'Tournament ID')
    .option('--position <number>', 'Position')
    .option('--opted-out', 'Player opted out')
    .action(
      wrapCommand(async (options: CreateOptions, cmd: Command) => {
        const globalOpts = cmd.optsWithGlobals<GlobalOptions>();
        const client = createClient(getApiUrl(globalOpts));

        if (!options.playerId || !options.tournamentId || !options.position) {
          console.error('--player-id, --tournament-id, and --position are required');
          process.exit(1);
        }

        const spinner = ora('Creating result...').start();
        const resultData = await client.results.create({
          playerId: options.playerId,
          tournamentId: options.tournamentId,
          position: parseInt(options.position),
          optedOut: options.optedOut ?? false,
        });
        spinner.stop();

        success(`Result created with ID: ${resultData.id}`);
        output(resultData, { json: globalOpts.json });
      })
    );

  results
    .command('batch-create')
    .description('Create multiple results from JSON (reads from stdin)')
    .action(
      wrapCommand(async (_options: object, cmd: Command) => {
        const globalOpts = cmd.optsWithGlobals<GlobalOptions>();
        const client = createClient(getApiUrl(globalOpts));

        info('Reading JSON from stdin...');

        const chunks: Buffer[] = [];
        for await (const chunk of process.stdin) {
          chunks.push(chunk as Buffer);
        }
        const input = Buffer.concat(chunks).toString('utf-8');

        let resultsData: CreateResultRequest[];
        try {
          resultsData = JSON.parse(input) as CreateResultRequest[];
        } catch {
          console.error('Invalid JSON input');
          process.exit(1);
        }

        if (!Array.isArray(resultsData)) {
          console.error('Input must be a JSON array');
          process.exit(1);
        }

        const spinner = ora(`Creating ${resultsData.length} results...`).start();
        const response = await client.results.createBatch(resultsData);
        spinner.stop();

        success(`Created ${response.count} results`);
        output(response, { json: globalOpts.json });
      })
    );

  results
    .command('update <id>')
    .description('Update a result')
    .option('--position <number>', 'Position')
    .option('--opted-out', 'Player opted out')
    .action(
      wrapCommand(async (id: string, options: UpdateOptions, cmd: Command) => {
        const globalOpts = cmd.optsWithGlobals<GlobalOptions>();
        const client = createClient(getApiUrl(globalOpts));

        const spinner = ora('Updating result...').start();
        const resultData = await client.results.update(id, {
          position: options.position ? parseInt(options.position) : undefined,
          optedOut: options.optedOut,
        });
        spinner.stop();

        success('Result updated');
        output(resultData, { json: globalOpts.json });
      })
    );

  results
    .command('delete <id>')
    .description('Delete a result')
    .action(
      wrapCommand(async (id: string, _options: object, cmd: Command) => {
        const globalOpts = cmd.optsWithGlobals<GlobalOptions>();
        const client = createClient(getApiUrl(globalOpts));

        const spinner = ora('Deleting result...').start();
        await client.results.delete(id);
        spinner.stop();

        success(`Result ${id} deleted`);
      })
    );

  results
    .command('recalculate-decay')
    .description('Recalculate time decay for all results')
    .action(
      wrapCommand(async (_options: object, cmd: Command) => {
        const globalOpts = cmd.optsWithGlobals<GlobalOptions>();
        const client = createClient(getApiUrl(globalOpts));

        const spinner = ora('Recalculating decay...').start();
        const response = await client.results.recalculateDecay();
        spinner.stop();

        success(response.message);
        info(`Updated ${response.count} results`);
      })
    );
}
