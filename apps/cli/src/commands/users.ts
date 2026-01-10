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
}

interface UpdateOptions {
  role?: string;
}

export function registerUserCommands(program: Command): void {
  const users = program
    .command('users')
    .description('Manage users (admin only)');

  users
    .command('list')
    .description('List users with pagination')
    .option('--page <number>', 'Page number', '1')
    .option('--limit <number>', 'Items per page', '20')
    .option('--sort-by <field>', 'Sort by field (email, role, createdAt)')
    .option('--sort-order <order>', 'Sort order (asc, desc)')
    .action(
      wrapCommand(async (options: ListOptions, cmd: Command) => {
        const globalOpts = cmd.optsWithGlobals<GlobalOptions>();
        const client = createClient(getApiUrl(globalOpts));

        const spinner = ora('Fetching users...').start();
        const result = await client.users.list({
          page: parseInt(options.page ?? '1'),
          limit: parseInt(options.limit ?? '20'),
          sortBy: options.sortBy as 'email' | 'role' | 'createdAt',
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

  users
    .command('get <id>')
    .description('Get user by ID')
    .action(
      wrapCommand(async (id: string, _options: object, cmd: Command) => {
        const globalOpts = cmd.optsWithGlobals<GlobalOptions>();
        const client = createClient(getApiUrl(globalOpts));

        const spinner = ora('Fetching user...').start();
        const user = await client.users.get(id);
        spinner.stop();

        output(user, { json: globalOpts.json });
      })
    );

  users
    .command('update <id>')
    .description('Update user role')
    .option('--role <role>', 'User role (USER, ADMIN)')
    .action(
      wrapCommand(async (id: string, options: UpdateOptions, cmd: Command) => {
        const globalOpts = cmd.optsWithGlobals<GlobalOptions>();
        const client = createClient(getApiUrl(globalOpts));

        if (!options.role) {
          console.error('--role is required');
          process.exit(1);
        }

        const role = options.role.toUpperCase();
        if (role !== 'USER' && role !== 'ADMIN') {
          console.error('--role must be USER or ADMIN');
          process.exit(1);
        }

        const spinner = ora('Updating user...').start();
        const user = await client.users.update(id, { role: role as 'USER' | 'ADMIN' });
        spinner.stop();

        success('User updated');
        output(user, { json: globalOpts.json });
      })
    );

  users
    .command('delete <id>')
    .description('Delete a user')
    .action(
      wrapCommand(async (id: string, _options: object, cmd: Command) => {
        const globalOpts = cmd.optsWithGlobals<GlobalOptions>();
        const client = createClient(getApiUrl(globalOpts));

        const spinner = ora('Deleting user...').start();
        await client.users.delete(id);
        spinner.stop();

        success(`User ${id} deleted`);
      })
    );
}
