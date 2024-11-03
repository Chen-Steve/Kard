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
      prompt: `Generate comprehensive flashcards based on the following description: "${description}".

Instructions:
1. Create clear, focused questions that test a single concept
2. Provide detailed, accurate answers that fully explain the concept
3. Use a variety of question types:
   - Definitions
   - Compare/contrast
   - Cause/effect
   - Process explanation
   - Application of concepts
4. Avoid yes/no questions
5. Make answers concise but complete
6. Use proper terminology

Format each flashcard as follows:
Question: What is photosynthesis?
Answer: Photosynthesis is the process by which plants convert light energy into chemical energy. It uses sunlight, water, and carbon dioxide to produce glucose and oxygen as a byproduct.
---
Question: Compare and contrast mitosis and meiosis.
Answer: Mitosis produces two identical daughter cells for growth/repair, while meiosis produces four genetically diverse cells for reproduction. Mitosis maintains chromosome count, meiosis halves it.
---
Continue this format for the entire description provided.`,
      max_tokens: 1000,
      userId,
    }, { timeout: 45000 });

    const flashcardsText = response.data.text.trim();
    const flashcards = flashcardsText.split('---').map(block => {
      const [questionPart, answerPart] = block.split('Answer:');
      const question = questionPart ? questionPart.replace('Question:', '').trim() : '';
      const answer = answerPart ? answerPart.trim() : '';
      return { question, answer };
    });

    const validFlashcards = flashcards.filter(flashcard => {
      const isValid = 
        flashcard.question.length >= 10 &&
        flashcard.answer.length >= 20 &&
        !flashcard.question.toLowerCase().startsWith('what is') &&
        !flashcard.question.toLowerCase().includes('yes or no') &&
        flashcard.question.trim().endsWith('?');
      return isValid;
    });

    console.log('Generated flashcards:', validFlashcards);
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