import chalk from 'chalk';
import {
  OpprsApiError,
  OpprsAuthError,
  OpprsForbiddenError,
  OpprsNotFoundError,
  OpprsValidationError,
  OpprsNetworkError,
  OpprsTimeoutError,
  OpprsExternalServiceError,
} from '@opprs/rest-api-client';

export function handleError(err: unknown): never {
  if (err instanceof OpprsAuthError) {
    console.error(chalk.red('Authentication Error:'), err.message);
    console.error(chalk.yellow('Hint: Run "opprs login" to authenticate'));
    process.exit(1);
  }

  if (err instanceof OpprsForbiddenError) {
    console.error(chalk.red('Access Denied:'), err.message);
    console.error(chalk.yellow('You do not have permission to perform this action'));
    process.exit(1);
  }

  if (err instanceof OpprsNotFoundError) {
    console.error(
      chalk.red('Not Found:'),
      `${err.resource} with ID "${err.resourceId}" was not found`
    );
    process.exit(1);
  }

  if (err instanceof OpprsValidationError) {
    console.error(chalk.red('Validation Error:'), err.message);
    if (err.details) {
      console.error(chalk.gray('Details:'), JSON.stringify(err.details, null, 2));
    }
    process.exit(1);
  }

  if (err instanceof OpprsTimeoutError) {
    console.error(chalk.red('Timeout:'), `Request timed out after ${err.timeout}ms`);
    console.error(chalk.yellow('Hint: The server may be unavailable'));
    process.exit(1);
  }

  if (err instanceof OpprsNetworkError) {
    console.error(chalk.red('Network Error:'), err.message);
    console.error(chalk.yellow('Hint: Check your internet connection and API URL'));
    process.exit(1);
  }

  if (err instanceof OpprsExternalServiceError) {
    console.error(chalk.red('External Service Error:'), err.message);
    console.error(chalk.gray(`Service: ${err.service}`));
    process.exit(1);
  }

  if (err instanceof OpprsApiError) {
    console.error(chalk.red(`API Error (${err.statusCode}):`), err.message);
    process.exit(1);
  }

  // Unknown error
  console.error(chalk.red('Unexpected Error:'), err instanceof Error ? err.message : String(err));
  process.exit(1);
}

export function wrapCommand<T extends unknown[]>(
  fn: (...args: T) => Promise<void>
): (...args: T) => Promise<void> {
  return async (...args: T) => {
    try {
      await fn(...args);
    } catch (err) {
      handleError(err);
    }
  };
}
