import { PrismaClient } from '@prisma/client';

declare global {
  namespace NodeJS {
    interface Global {
      prisma: PrismaClient | undefined;
    }
  }
}

// Create a variable to hold the global object with the correct type assertion
const globalForPrisma = global as unknown as NodeJS.Global & { prisma?: PrismaClient };

// Use the variable to initialize prisma
const prisma = globalForPrisma.prisma || new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

export default prisma;
