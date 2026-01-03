import type { Command } from 'commander';
import ora from 'ora';
import type { EventBoosterType } from '@opprs/rest-api-client';
import { createClient, getApiUrl, type GlobalOptions } from '../client.js';
import { output, success, info } from '../utils/index.js';
import { wrapCommand } from '../utils/index.js';

interface MatchplayOptions {
  eventBooster?: string;
  apiToken?: string;
}

export function registerImportCommands(program: Command): void {
  const importCmd = program.command('import').description('Import data from external sources');

  importCmd
    .command('matchplay <tournamentId>')
    .description('Import a tournament from Matchplay')
    .option(
      '--event-booster <type>',
      'Event booster type (NONE, CERTIFIED, CERTIFIED_PLUS, CHAMPIONSHIP_SERIES, MAJOR)'
    )
    .option('--api-token <token>', 'Matchplay API token (for private tournaments)')
    .action(
      wrapCommand(async (tournamentId: string, options: MatchplayOptions, cmd: Command) => {
        const globalOpts = cmd.optsWithGlobals<GlobalOptions>();
        const client = createClient(getApiUrl(globalOpts));

        const spinner = ora('Importing from Matchplay...').start();
        const result = await client.import.matchplayTournament(parseInt(tournamentId), {
          eventBooster: options.eventBooster as EventBoosterType,
          apiToken: options.apiToken,
        });
        spinner.stop();

        success(result.created ? 'Tournament imported' : 'Tournament updated');
        info(`Players created: ${result.playersCreated}`);
        info(`Players updated: ${result.playersUpdated}`);
        info(`Results: ${result.resultsCount}`);
        output(result.tournament, { json: globalOpts.json });
      })
    );
}
