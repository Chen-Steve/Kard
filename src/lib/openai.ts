import axios from 'axios';

interface OpenAIResponse {
  text: string;
}

export const generateFlashcards = async (description: string): Promise<{ question: string, answer: string }[]> => {
  try {
    const response = await axios.post<OpenAIResponse>('/api/generate', {
      prompt: `Generate flashcards based on the following description: "${description}". 
      Each flashcard should be formatted as follows:
      Question: What is the capital of France?
      Answer: Paris.
      ---
      Question: Define photosynthesis.
      Answer: Photosynthesis is the process by which green plants and some other organisms use sunlight to synthesize foods with the help of chlorophyll.
      ---
      Continue this format for the entire description provided.`,
      max_tokens: 500,
    }, { timeout: 30000 });

    console.log('OpenAI API response:', response.data.text);

    // Parse the AI's response into flashcards
    const flashcardsText = response.data.text.trim();
    const flashcards = flashcardsText.split('---').map(block => {
      const [questionPart, answerPart] = block.split('Answer:');
      const question = questionPart ? questionPart.replace('Question:', '').trim() : '';
      const answer = answerPart ? answerPart.trim() : '';
      return { question, answer };
    });

    // Filter out invalid flashcards
    const validFlashcards = flashcards.filter(flashcard => flashcard.question && flashcard.answer);

    console.log('Valid flashcards:', validFlashcards); // Log the valid flashcards

    return validFlashcards;
  } catch (error) {
    console.error('Error generating flashcards:', error);
    throw error;
  }
};