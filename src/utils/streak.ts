import supabase from '../lib/supabaseClient';

export async function updateStreak(userId: string): Promise<number> {
  const { data: userData, error } = await supabase
    .from('users')
    .select('streak, last_login')
    .eq('id', userId)
    .single();

  if (error) {
    console.error('Error fetching user data:', error);
    return 0;
  }

  const now = new Date();
  const lastLogin = userData.last_login ? new Date(userData.last_login) : null;
  let newStreak = userData.streak || 0;

  if (!lastLogin) {
    newStreak = 1;
  } else {
    const timeDiff = now.getTime() - lastLogin.getTime();
    const daysDiff = Math.floor(timeDiff / (1000 * 3600 * 24));

    if (daysDiff === 0) {
      // Same day, do nothing
    } else if (daysDiff === 1) {
      // Consecutive day
      newStreak += 1;
    } else {
      // Streak broken
      newStreak = 1;
    }
  }

  // Update user's streak only
  // Note: We're not updating last_login here as it's handled by Supabase auth
  const { error: updateError } = await supabase
    .from('users')
    .update({ streak: newStreak })
    .eq('id', userId);

  if (updateError) {
    console.error('Error updating user streak:', updateError);
  }

  return newStreak;
}
