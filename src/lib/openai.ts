import axios from 'axios';

interface OpenAIResponse {
  text: string;
}

export interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export const generateAIResponse = async (message: string, flashcards: any[], history: Message[]): Promise<string> => {
  try {
    const response = await axios.post<OpenAIResponse>('/api/aichat', {
      message,
      flashcards,
      history,
    }, { timeout: 30000 });

    console.log('AI Chat API response:', response.data.text);

    return response.data.text;
  } catch (error) {
    console.error('Error in AI chat:', error);
    throw error;
  }
};

export const generateQuiz = async (flashcards: any[]): Promise<string> => {
  try {
    const response = await axios.post<OpenAIResponse>('/api/aichat', {
      message: "Generate a quiz based on these flashcards.",
      flashcards,
      history: [],
    }, { timeout: 30000 });

    return response.data.text;
  } catch (error) {
    console.error('Error generating quiz:', error);
    throw error;
  }
};

export const generateFlashcards = async (description: string, userId: string): Promise<{ question: string, answer: string }[]> => {
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
      userId,
    }, { timeout: 30000 });

    console.log('OpenAI API response:', response.data.text);

    const flashcardsText = response.data.text.trim();
    const flashcards = flashcardsText.split('---').map(block => {
      const [questionPart, answerPart] = block.split('Answer:');
      const question = questionPart ? questionPart.replace('Question:', '').trim() : '';
      const answer = answerPart ? answerPart.trim() : '';
      return { question, answer };
    });

    const validFlashcards = flashcards.filter(flashcard => flashcard.question && flashcard.answer);

    console.log('Valid flashcards:', validFlashcards);

    return validFlashcards;
  } catch (error) {
    console.error('Error generating flashcards:', error);
    throw error;
  }
};

export const generateStudyPlan = async (userId: string, performanceData: any[]): Promise<string> => {
  try {
    const response = await axios.post<OpenAIResponse>('/api/aichat', {
      message: "Generate a personalized study plan based on this performance data.",
      flashcards: [],
      history: performanceData,
    }, { timeout: 30000 });

    return response.data.text;
  } catch (error) {
    console.error('Error generating study plan:', error);
    throw error;
  }
};