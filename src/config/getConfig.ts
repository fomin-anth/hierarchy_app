import { ConfigError } from '@/config/ConfigError';

const envKeys = { api_url: 'NEXT_PUBLIC_API_URL' };

type Config = {
  [key in keyof typeof envKeys]: string;
};

export function getConfig(): Config {
  const config: Partial<Config> = {
    api_url: process.env.NEXT_PUBLIC_API_URL,
  };

  for (const [key, value] of Object.entries(config)) {
    if (typeof value === 'undefined') {
      throw new ConfigError(`Missing environment variable: ${key}`);
    }
  }

  return config as Config;
}
