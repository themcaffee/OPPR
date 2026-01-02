import { homedir } from 'node:os';
import { join } from 'node:path';

export const DEFAULT_API_URL = 'http://localhost:3000/api/v1';
export const CONFIG_DIR = join(homedir(), '.opprs');
export const CONFIG_FILE = join(CONFIG_DIR, 'config.json');
