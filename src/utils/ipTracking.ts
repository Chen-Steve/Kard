import prisma from '../lib/prisma';

interface AIUsageResponse {
  canProceed: boolean;
  remainingAttempts: number;
}

export async function checkAndUpdateAIUsage(
  userId: string,
): Promise<AIUsageResponse> {
  if (!userId) {
    return {
      canProceed: false,
      remainingAttempts: 0
    };
  }

  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Set to start of day for consistent tracking

    // Track usage in the Generation model
    await prisma.generation.upsert({
      where: {
        userId_date: {
          userId: userId,
          date: today
        }
      },
      update: {
        count: {
          increment: 1
        }
      },
      create: {
        userId: userId,
        date: today,
        count: 1
      }
    });

    // Always allow authenticated users to proceed
    return {
      canProceed: true,
      remainingAttempts: 999 // Arbitrary high number to indicate unlimited
    };
  } catch (error) {
    console.error('Error tracking AI usage:', error);
    // Still allow the user to proceed even if tracking fails
    return {
      canProceed: true,
      remainingAttempts: 999
    };
  }
} 