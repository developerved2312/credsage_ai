import { defineConfig } from 'prisma/config';
import 'dotenv/config';

/**
 * Prisma 7 Configuration File
 * This file provides advanced configuration for Prisma Client generation
 * Learn more: https://www.prisma.io/docs/orm/prisma-client/setup-and-configuration/client-configuration
 */
export default defineConfig({
  generator: {
    // Enable preview features
    previewFeatures: [
      'typedSql',           // Type-safe raw SQL queries
      'relationJoins',      // Optimized relation joins
      'fullTextSearch',     // PostgreSQL full-text search
      'views',              // Database views support
    ],
    
    // Performance optimizations
    engineType: 'library', // Use library engine (faster than binary)
    
    // Custom output configuration
    binaryTargets: [
      'native',
      'darwin-arm64',  // Apple Silicon
      'linux-musl',    // Docker Alpine
    ],
  },
  
  // Client extensions configuration
  client: {
    // Enable runtime type checking in development
    errorFormat: 'pretty',
    
    // Log queries in development
    log: [
      { level: 'query', emit: 'event' },
      { level: 'error', emit: 'stdout' },
      { level: 'info', emit: 'stdout' },
      { level: 'warn', emit: 'stdout' },
    ],
  },
  
  // Datasource configuration
  datasource: {
    url: process.env.DATABASE_URL,
  },
});
