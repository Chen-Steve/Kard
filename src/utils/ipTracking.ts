import prisma from '../lib/prisma';

// Add the interface
interface RateLimitResponse {
  canProceed: boolean;
  remainingAttempts: number;
}

export async function checkAndUpdateIPUsage(ip: string, limit: number = 5): Promise<RateLimitResponse> {
  const now = new Date();
  const dayInMs = 24 * 60 * 60 * 1000;

  try {
    const ipUsage = await prisma.iPUsage.upsert({
      where: { ip },
      update: {
        aiCount: {
          increment: 1
        }
      },
      create: {
        ip,
        aiCount: 1,
        lastReset: now
      }
    });

    // Reset count if it's been more than a day
    if (now.getTime() - ipUsage.lastReset.getTime() >= dayInMs) {
      await prisma.iPUsage.update({
        where: { ip },
        data: {
          aiCount: 1,
          lastReset: now
        }
      });
      return {
        canProceed: true,
        remainingAttempts: limit - 1
      };
    }

    return {
      canProceed: ipUsage.aiCount <= limit,
      remainingAttempts: Math.max(0, limit - ipUsage.aiCount)
    };
  } catch (error) {
    console.error('Error checking IP usage:', error);
    return {
      canProceed: false,
      remainingAttempts: 0
    };
  }
} 