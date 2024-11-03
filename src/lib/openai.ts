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
      prompt: `Generate specific, fact-based flashcards about: "${description}"

Key Requirements:
1. Focus on concrete facts, specific examples, and real cases
2. Avoid generic or theoretical questions
3. Include precise details like names, dates, locations, and measurements
4. Each flashcard should teach a distinct, memorable fact
5. Prioritize unique and lesser-known information

Question Types to Use:
- Specific identification (What is the [specific item] and where is it found?)
- Historical facts (When and where was [specific item] discovered?)
- Characteristics (What unique features define [specific item]?)
- Geographic distribution (In which specific regions can [item] be found?)
- Cultural significance (How is [specific item] used in [specific culture]?)

Example Format for Your Topic:
Question: What is the Chernobyl mushroom and where was it discovered?
Answer: The Cryptococcus neoformans fungus, discovered in 2020 inside the Chernobyl reactor, is a black fungus that feeds on radiation through radiosynthesis. It was found growing on the reactor walls.
---
Question: When and where was the last wild Franklin tree (Franklinia alatamaha) documented?
Answer: The last wild Franklin tree was documented in 1803 along the Altamaha River in Georgia, USA. It has been extinct in the wild since then, surviving only through cultivation.
---

Generate 8-10 similarly specific, fact-based flashcards about ${description}. Focus on concrete information rather than general concepts or theories.`,
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
        !flashcard.question.toLowerCase().startsWith('what is the importance') &&
        !flashcard.question.toLowerCase().startsWith('how does') &&
        !flashcard.question.toLowerCase().includes('why is') &&
        !flashcard.question.toLowerCase().includes('what are the benefits') &&
        !flashcard.question.toLowerCase().includes('general') &&
        !flashcard.question.toLowerCase().includes('concept') &&
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