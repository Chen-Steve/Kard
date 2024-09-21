import { NextApiRequest, NextApiResponse } from 'next';
import supabase from '../../../lib/supabaseClient';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { flashcardId, sourceDeckId, destinationDeckId } = req.body;

  console.log('API Request Body:', req.body);

  try {
    // Get the user's session from the request headers
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ message: 'No authorization header' });
    }

    const token = authHeader.split(' ')[1];
    const { data, error: userError } = await supabase.auth.getUser(token);

    if (userError || !data.user) {
      console.error('Error getting user:', userError);
      return res.status(401).json({ message: 'Unauthorized', error: userError });
    }

    console.log('Authenticated User ID:', data.user.id);
    console.log('Flashcard ID:', flashcardId);
    console.log('Source Deck ID:', sourceDeckId);
    console.log('Destination Deck ID:', destinationDeckId);

    // Supabase Query: Update the flashcard's deckId
    const { data: updateData, error } = await supabase
      .from('flashcards')
      .update({ deckId: destinationDeckId })
      .eq('id', flashcardId)
      .eq('userId', data.user.id);

    if (error) {
      console.error('Error moving flashcard:', error);
      return res.status(500).json({ message: 'Failed to move flashcard', error });
    }

    res.status(200).json({ message: 'Flashcard moved successfully', data: updateData });
  } catch (error) {
    console.error('Error moving flashcard:', error);
    res.status(500).json({ message: 'Failed to move flashcard', error });
  }
}