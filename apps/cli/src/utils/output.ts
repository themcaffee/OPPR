import Table from 'cli-table3';
import chalk from 'chalk';

export interface OutputOptions {
  json?: boolean;
  noColor?: boolean;
}

export function formatTable(
  headers: string[],
  rows: (string | number | null | undefined)[][],
  _options: OutputOptions = {}
): string {
  const table = new Table({
    head: headers.map((h) => chalk.bold(h)),
    style: { head: ['cyan'] },
  });

  rows.forEach((row) => {
    table.push(row.map((cell) => (cell ?? '-').toString()));
  });

  return table.toString();
}

export function output<T>(data: T, options: OutputOptions = {}): void {
  if (options.json) {
    console.log(JSON.stringify(data, null, 2));
    return;
  }

  if (Array.isArray(data)) {
    if (data.length === 0) {
      console.log(chalk.yellow('No results found'));
      return;
    }
    const headers = Object.keys(data[0] as object);
    const rows = data.map((item) =>
      headers.map((h) => (item as Record<string, unknown>)[h])
    );
    console.log(formatTable(headers, rows as (string | number)[][], options));
  } else if (typeof data === 'object' && data !== null) {
    const obj = data as Record<string, unknown>;
    const table = new Table();
    Object.entries(obj).forEach(([key, value]) => {
      const displayValue =
        typeof value === 'object' ? JSON.stringify(value) : String(value ?? '-');
      table.push({ [chalk.bold(key)]: displayValue });
    });
    console.log(table.toString());
  } else {
    console.log(data);
  }
}

export function success(message: string): void {
  console.log(chalk.green('✓'), message);
}

export function error(message: string): void {
  console.error(chalk.red('✗'), message);
}

export function warn(message: string): void {
  console.warn(chalk.yellow('!'), message);
}

export function info(message: string): void {
  console.log(chalk.blue('i'), message);
}
