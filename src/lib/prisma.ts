import { PrismaClient } from '@prisma/client';

declare global {
  // Allow global variable `prisma` to be used
  var prisma: PrismaClient | undefined;
}

const isPgBouncer = process.env.PGBOUNCER === 'true';
const prisma = global.prisma || new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
  datasources: {
    db: {
      url: process.env.DATABASE_URL + (isPgBouncer ? '?pgbouncer=true' : ''),
    },
  },
});

if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma;
}

export default prisma;