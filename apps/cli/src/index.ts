#!/usr/bin/env node
import { Command } from 'commander';
import { registerCommands } from './commands/index.js';

const program = new Command();

program
  .name('opprs')
  .description('CLI for OPPRS (Open Pinball Player Ranking System)')
  .version('1.0.0')
  .option('--api-url <url>', 'API base URL', 'http://localhost:3000/api/v1')
  .option('--json', 'Output as JSON instead of table format')
  .option('--no-color', 'Disable colored output');

registerCommands(program);

program.parseAsync(process.argv).catch((err: Error) => {
  console.error('Fatal error:', err.message);
  process.exit(1);
});
