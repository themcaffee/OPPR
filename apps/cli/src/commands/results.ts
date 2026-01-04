import type { Command } from 'commander';
import ora from 'ora';
import type { CreateStandingRequest } from '@opprs/rest-api-client';
import { createClient, getApiUrl, type GlobalOptions } from '../client.js';
import { output, success, info } from '../utils/index.js';
import { wrapCommand } from '../utils/index.js';

interface ListOptions {
  page?: string;
  limit?: string;
  playerId?: string;
  tournamentId?: string;
  isFinals?: boolean;
  sortBy?: string;
  sortOrder?: string;
}

interface CreateOptions {
  playerId?: string;
  tournamentId?: string;
  position?: string;
  isFinals?: boolean;
  optedOut?: boolean;
}

interface UpdateOptions {
  position?: string;
  optedOut?: boolean;
}

export function registerResultCommands(program: Command): void {
  const standings = program.command('standings').description('Manage tournament standings');

  standings
    .command('list')
    .description('List standings with pagination')
    .option('--page <number>', 'Page number', '1')
    .option('--limit <number>', 'Items per page', '20')
    .option('--player-id <id>', 'Filter by player ID')
    .option('--tournament-id <id>', 'Filter by tournament ID')
    .option('--is-finals', 'Filter by finals standings only')
    .option('--sort-by <field>', 'Sort by field (position, totalPoints, decayedPoints, createdAt)')
    .option('--sort-order <order>', 'Sort order (asc, desc)')
    .action(
      wrapCommand(async (options: ListOptions, cmd: Command) => {
        const globalOpts = cmd.optsWithGlobals<GlobalOptions>();
        const client = createClient(getApiUrl(globalOpts));

        const spinner = ora('Fetching standings...').start();
        const result = await client.standings.list({
          page: parseInt(options.page ?? '1'),
          limit: parseInt(options.limit ?? '20'),
          playerId: options.playerId,
          tournamentId: options.tournamentId,
          isFinals: options.isFinals,
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

  standings
    .command('get <id>')
    .description('Get standing by ID')
    .action(
      wrapCommand(async (id: string, _options: object, cmd: Command) => {
        const globalOpts = cmd.optsWithGlobals<GlobalOptions>();
        const client = createClient(getApiUrl(globalOpts));

        const spinner = ora('Fetching standing...').start();
        const standingData = await client.standings.get(id);
        spinner.stop();

        output(standingData, { json: globalOpts.json });
      })
    );

  standings
    .command('create')
    .description('Create a new standing')
    .option('--player-id <id>', 'Player ID')
    .option('--tournament-id <id>', 'Tournament ID')
    .option('--position <number>', 'Position')
    .option('--is-finals', 'Finals standing')
    .option('--opted-out', 'Player opted out')
    .action(
      wrapCommand(async (options: CreateOptions, cmd: Command) => {
        const globalOpts = cmd.optsWithGlobals<GlobalOptions>();
        const client = createClient(getApiUrl(globalOpts));

        if (!options.playerId || !options.tournamentId || !options.position) {
          console.error('--player-id, --tournament-id, and --position are required');
          process.exit(1);
        }

        const spinner = ora('Creating standing...').start();
        const standingData = await client.standings.create({
          playerId: options.playerId,
          tournamentId: options.tournamentId,
          position: parseInt(options.position),
          isFinals: options.isFinals ?? false,
          optedOut: options.optedOut ?? false,
        });
        spinner.stop();

        success(`Standing created with ID: ${standingData.id}`);
        output(standingData, { json: globalOpts.json });
      })
    );

  standings
    .command('batch-create')
    .description('Create multiple standings from JSON (reads from stdin)')
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

        let standingsData: CreateStandingRequest[];
        try {
          standingsData = JSON.parse(input) as CreateStandingRequest[];
        } catch {
          console.error('Invalid JSON input');
          process.exit(1);
        }

        if (!Array.isArray(standingsData)) {
          console.error('Input must be a JSON array');
          process.exit(1);
        }

        const spinner = ora(`Creating ${standingsData.length} standings...`).start();
        const response = await client.standings.createBatch(standingsData);
        spinner.stop();

        success(`Created ${response.count} standings`);
        output(response, { json: globalOpts.json });
      })
    );

  standings
    .command('update <id>')
    .description('Update a standing')
    .option('--position <number>', 'Position')
    .option('--opted-out', 'Player opted out')
    .action(
      wrapCommand(async (id: string, options: UpdateOptions, cmd: Command) => {
        const globalOpts = cmd.optsWithGlobals<GlobalOptions>();
        const client = createClient(getApiUrl(globalOpts));

        const spinner = ora('Updating standing...').start();
        const standingData = await client.standings.update(id, {
          position: options.position ? parseInt(options.position) : undefined,
          optedOut: options.optedOut,
        });
        spinner.stop();

        success('Standing updated');
        output(standingData, { json: globalOpts.json });
      })
    );

  standings
    .command('delete <id>')
    .description('Delete a standing')
    .action(
      wrapCommand(async (id: string, _options: object, cmd: Command) => {
        const globalOpts = cmd.optsWithGlobals<GlobalOptions>();
        const client = createClient(getApiUrl(globalOpts));

        const spinner = ora('Deleting standing...').start();
        await client.standings.delete(id);
        spinner.stop();

        success(`Standing ${id} deleted`);
      })
    );

  standings
    .command('recalculate-decay')
    .description('Recalculate time decay for all standings')
    .action(
      wrapCommand(async (_options: object, cmd: Command) => {
        const globalOpts = cmd.optsWithGlobals<GlobalOptions>();
        const client = createClient(getApiUrl(globalOpts));

        const spinner = ora('Recalculating decay...').start();
        const response = await client.standings.recalculateDecay();
        spinner.stop();

        success(response.message);
        info(`Updated ${response.count} standings`);
      })
    );
}
