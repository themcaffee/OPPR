import type { Command } from 'commander';
import inquirer from 'inquirer';
import ora from 'ora';
import type { LoginResponse } from '@opprs/rest-api-client';
import { createClient, getApiUrl, type GlobalOptions } from '../client.js';
import { saveTokens, clearTokens, loadConfig } from '../config/index.js';
import { success, error, info, output } from '../utils/index.js';
import { wrapCommand } from '../utils/index.js';

interface LoginOptions {
  email?: string;
  password?: string;
}

interface RegisterOptions {
  email?: string;
  name?: string;
  password?: string;
}

export function registerAuthCommands(program: Command): void {
  program
    .command('login')
    .description('Authenticate with the OPPRS API')
    .option('-e, --email <email>', 'Email address')
    .option('-p, --password <password>', 'Password (not recommended, use interactive prompt)')
    .action(
      wrapCommand(async (options: LoginOptions, cmd: Command) => {
        const globalOpts = cmd.optsWithGlobals<GlobalOptions>();
        const apiUrl = getApiUrl(globalOpts);

        let email = options.email;
        let password = options.password;

        if (!email || !password) {
          const answers = await inquirer.prompt<{ email?: string; password?: string }>([
            {
              type: 'input',
              name: 'email',
              message: 'Email:',
              when: !email,
              validate: (input: string) => input.includes('@') || 'Please enter a valid email',
            },
            {
              type: 'password',
              name: 'password',
              message: 'Password:',
              when: !password,
              mask: '*',
            },
          ]);
          email = email ?? answers.email;
          password = password ?? answers.password;
        }

        if (!email || !password) {
          error('Email and password are required');
          process.exit(1);
        }

        const spinner = ora('Logging in...').start();

        const client = createClient(apiUrl);
        const response = (await client.login({ email, password })) as LoginResponse;

        saveTokens(
          {
            accessToken: response.accessToken,
            refreshToken: response.refreshToken,
            expiresIn: response.expiresIn,
          },
          email
        );

        spinner.stop();
        success(`Logged in as ${email}`);
      })
    );

  program
    .command('logout')
    .description('Log out and clear stored credentials')
    .action(
      wrapCommand(async (_options: object, cmd: Command) => {
        const globalOpts = cmd.optsWithGlobals<GlobalOptions>();
        const apiUrl = getApiUrl(globalOpts);

        const spinner = ora('Logging out...').start();

        try {
          const client = createClient(apiUrl);
          await client.logout();
        } catch {
          // Ignore errors, just clear local tokens
        }

        clearTokens();
        spinner.stop();
        success('Logged out successfully');
      })
    );

  program
    .command('whoami')
    .description('Show current authenticated user')
    .action(
      wrapCommand(async (_options: object, cmd: Command) => {
        const globalOpts = cmd.optsWithGlobals<GlobalOptions>();
        const apiUrl = getApiUrl(globalOpts);
        const config = loadConfig();

        if (!config.tokens) {
          error('Not logged in');
          info('Run "opprs login" to authenticate');
          process.exit(1);
        }

        const client = createClient(apiUrl);
        const user = await client.getMe();

        if (globalOpts.json) {
          output(user, { json: true });
        } else {
          info(`Logged in as: ${config.userEmail}`);
          output(user, { json: false });
        }
      })
    );

  program
    .command('register')
    .description('Register a new account')
    .option('-e, --email <email>', 'Email address')
    .option('-n, --name <name>', 'Display name')
    .option('-p, --password <password>', 'Password (not recommended, use interactive prompt)')
    .action(
      wrapCommand(async (options: RegisterOptions, cmd: Command) => {
        const globalOpts = cmd.optsWithGlobals<GlobalOptions>();
        const apiUrl = getApiUrl(globalOpts);

        const answers = await inquirer.prompt<{
          email?: string;
          name?: string;
          password?: string;
          confirmPassword?: string;
        }>([
          {
            type: 'input',
            name: 'email',
            message: 'Email:',
            when: !options.email,
            validate: (input: string) => input.includes('@') || 'Please enter a valid email',
          },
          {
            type: 'input',
            name: 'name',
            message: 'Display name:',
            when: !options.name,
          },
          {
            type: 'password',
            name: 'password',
            message: 'Password:',
            when: !options.password,
            mask: '*',
          },
          {
            type: 'password',
            name: 'confirmPassword',
            message: 'Confirm password:',
            when: !options.password,
            mask: '*',
          },
        ]);

        const email = options.email ?? answers.email;
        const name = options.name ?? answers.name;
        const password = options.password ?? answers.password;

        if (!email || !name || !password) {
          error('Email, name, and password are required');
          process.exit(1);
        }

        if (!options.password && answers.password !== answers.confirmPassword) {
          error('Passwords do not match');
          process.exit(1);
        }

        // Parse name into firstName and lastName
        const nameParts = name.trim().split(/\s+/);
        const firstName = nameParts[0] ?? 'Unknown';
        const lastName = nameParts.length > 1 ? nameParts[nameParts.length - 1]! : 'Player';
        const middleInitial = nameParts.length > 2 ? nameParts[1]!.charAt(0).toUpperCase() : undefined;

        const spinner = ora('Registering...').start();

        const client = createClient(apiUrl);
        await client.register({ email, password, firstName, middleInitial, lastName });

        spinner.stop();
        success(`Account created for ${email}`);
        info('You can now log in with "opprs login"');
      })
    );
}
