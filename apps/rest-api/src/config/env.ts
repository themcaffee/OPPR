export interface EnvConfig {
  host: string;
  port: number;
  logLevel: string;
  jwtSecret: string;
  jwtRefreshSecret: string;
  jwtAccessExpiresIn: string;
  jwtRefreshExpiresIn: string;
  nodeEnv: string;
}

function getEnvVar(name: string, defaultValue?: string): string {
  const value = process.env[name] ?? defaultValue;
  if (value === undefined) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export function loadEnvConfig(): EnvConfig {
  return {
    host: getEnvVar('HOST', '0.0.0.0'),
    port: parseInt(getEnvVar('PORT', '3000'), 10),
    logLevel: getEnvVar('LOG_LEVEL', 'info'),
    jwtSecret: getEnvVar('JWT_SECRET', 'development-secret-change-in-production'),
    jwtRefreshSecret: getEnvVar(
      'JWT_REFRESH_SECRET',
      'development-refresh-secret-change-in-production'
    ),
    jwtAccessExpiresIn: getEnvVar('JWT_ACCESS_EXPIRES_IN', '15m'),
    jwtRefreshExpiresIn: getEnvVar('JWT_REFRESH_EXPIRES_IN', '7d'),
    nodeEnv: getEnvVar('NODE_ENV', 'development'),
  };
}

export const env = loadEnvConfig();
