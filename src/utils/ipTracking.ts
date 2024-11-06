import prisma from '../lib/prisma';

// Add the interface
interface RateLimitResponse {
  canProceed: boolean;
  remainingAttempts: number;
}

export async function checkAndUpdateIPUsage(ip: string, limit: number = 5): Promise<RateLimitResponse> {
  const now = new Date();

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

    // Check if the stored date is from a different day than today
    const lastResetDate = new Date(ipUsage.lastReset);
    const isDifferentDay = 
      lastResetDate.getFullYear() !== now.getFullYear() ||
      lastResetDate.getMonth() !== now.getMonth() ||
      lastResetDate.getDate() !== now.getDate();

    if (isDifferentDay) {
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