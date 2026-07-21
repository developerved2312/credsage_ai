import { PrismaClient, Prisma } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import { Logger } from '../utils/logger';

const logger = new Logger('PrismaClient');

// Prisma 7 enhanced configuration with driver adapter
const prismaClientSingleton = () => {
  // Create PostgreSQL connection pool
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });
  
  // Create Prisma adapter
  const adapter = new PrismaPg(pool);
  
  const client = new PrismaClient({
    adapter,
    log: [
      {
        emit: 'event',
        level: 'query',
      },
      {
        emit: 'event',
        level: 'error',
      },
      {
        emit: 'event',
        level: 'info',
      },
      {
        emit: 'event',
        level: 'warn',
      },
    ],
    errorFormat: 'pretty',
  });

  // Prisma 7 event listeners with enhanced logging
  client.$on('query', (e: Prisma.QueryEvent) => {
    if (process.env.NODE_ENV === 'development') {
      logger.debug(`Query: ${e.query}`);
      logger.debug(`Params: ${e.params}`);
      logger.debug(`Duration: ${e.duration}ms`);
      
      // Log slow queries (> 1000ms)
      if (e.duration > 1000) {
        logger.warn(`Slow query detected (${e.duration}ms): ${e.query}`);
      }
    }
  });

  client.$on('error', (e: Prisma.LogEvent) => {
    logger.error(`Prisma Error: ${e.message}`);
  });

  client.$on('info', (e: Prisma.LogEvent) => {
    logger.info(`Prisma Info: ${e.message}`);
  });

  client.$on('warn', (e: Prisma.LogEvent) => {
    logger.warn(`Prisma Warning: ${e.message}`);
  });

  return client;
};

declare global {
  // eslint-disable-next-line no-var
  var prismaGlobal: undefined | ReturnType<typeof prismaClientSingleton>;
}

const prisma = globalThis.prismaGlobal ?? prismaClientSingleton();

if (process.env.NODE_ENV !== 'production') {
  globalThis.prismaGlobal = prisma;
}

// Prisma 7: Enhanced connection management
export const connectDatabase = async () => {
  try {
    await prisma.$connect();
    logger.info('✅ Database connected successfully (Prisma 7)');
    
    // Test query to verify connection
    await prisma.$queryRaw`SELECT 1`;
    logger.info('✅ Database query test successful');
  } catch (error) {
    logger.error('❌ Database connection failed:', error);
    throw error;
  }
};

export const disconnectDatabase = async () => {
  try {
    await prisma.$disconnect();
    logger.info('Database disconnected successfully');
  } catch (error) {
    logger.error('Error disconnecting database:', error);
    throw error;
  }
};

// Graceful shutdown handlers
process.on('beforeExit', async () => {
  await disconnectDatabase();
});

process.on('SIGINT', async () => {
  await disconnectDatabase();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await disconnectDatabase();
  process.exit(0);
});

export { prisma };
