import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';

const globalForPrisma = globalThis;

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL is not defined');
}

const pool =
  globalForPrisma.__communityos_pg_pool ||
  new pg.Pool({
    connectionString,
    ssl: {
      rejectUnauthorized: false,
    },
    max: 1,
    connectionTimeoutMillis: 20000,
  });

const adapter =
  globalForPrisma.__communityos_prisma_adapter ||
  new PrismaPg(pool);

export const prisma =
  globalForPrisma.__communityos_prisma ||
  new PrismaClient({
    adapter,
    log:
      process.env.NODE_ENV === 'development'
        ? ['warn', 'error']
        : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.__communityos_prisma = prisma;
  globalForPrisma.__communityos_pg_pool = pool;
  globalForPrisma.__communityos_prisma_adapter = adapter;
}

export function getDb() {
  return prisma;
}

export async function connectDatabase() {
  await prisma.$connect();
  console.log('Database connected');
}

export async function disconnectDatabase() {
  await prisma.$disconnect();
  await pool.end();
}

export default prisma;
