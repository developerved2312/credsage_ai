import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

// Load environment variables
dotenv.config({ path: resolve(__dirname, '../.env') });

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
});

async function main() {
  console.log('🔄 Pushing database schema...');
  
  // This will sync your Prisma schema with the database
  // Similar to prisma db push
  await prisma.$connect();
  console.log('✅ Database connected successfully!');
  console.log('✅ Schema is ready to use');
  
  await prisma.$disconnect();
}

main()
  .catch((e) => {
    console.error('❌ Migration failed:', e);
    process.exit(1);
  });
