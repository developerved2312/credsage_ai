import dotenv from 'dotenv';
import { z } from 'zod';
import { Logger } from '../utils/logger';

dotenv.config();

const logger = new Logger('EnvConfig');

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().transform(Number).default('3000'),
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  DIRECT_URL: z.string().optional(),
  
  // Better Auth
  BETTER_AUTH_SECRET: z.string().min(32, 'BETTER_AUTH_SECRET must be at least 32 characters'),
  BETTER_AUTH_URL: z.string().url().default('http://localhost:3000'),
  BETTER_AUTH_TRUST_HOST: z.string().default('true'),
  BETTER_AUTH_API_KEY: z.string().optional(),
  
  // Google OAuth
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
  
  // External Services
  ML_SERVICE_URL: z.string().url().default('http://localhost:8000'),
  GEMINI_API_KEY: z.string().optional(),
  OPENAI_API_KEY: z.string().optional(),
  CORS_ORIGIN: z.string().default('http://localhost:5173'),
});

type EnvConfig = z.infer<typeof envSchema>;

let config: EnvConfig;

try {
  config = envSchema.parse(process.env);
  logger.info('Environment configuration loaded successfully');
} catch (error) {
  if (error instanceof z.ZodError) {
    logger.error('Environment validation failed:', error);
    console.error('Missing or invalid environment variables:');
    error.errors.forEach((err) => {
      console.error(`  - ${err.path.join('.')}: ${err.message}`);
    });
    process.exit(1);
  }
  throw error;
}

export const env = config;
