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

    // console.log('AI Chat API response:', response.data.text);

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
    // Extract number of flashcards from description
    const numberMatch = description.match(/(\d+)\s*(flashcards?|cards?|facts?)/i);
    const requestedCount = numberMatch ? parseInt(numberMatch[1]) : 5;
    const finalCount = Math.min(Math.max(1, requestedCount), 20);

    // console.log('Generating flashcards for:', description);
    // console.log('Requested count:', requestedCount, 'Final count:', finalCount);

    const response = await axios.post<OpenAIResponse>('/api/generate', {
      prompt: `Generate ${finalCount} specific, fact-based flashcards about: "${description}"

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

Example Format:
[
  {
    "question": "What is the Chernobyl mushroom and where was it discovered?",
    "answer": "The Cryptococcus neoformans fungus, discovered in 2020 inside the Chernobyl reactor, is a black fungus that feeds on radiation through radiosynthesis. It was found growing on the reactor walls."
  }
]

Generate exactly ${finalCount} specific, fact-based flashcards about the topic. Return them in a JSON array format.`,
      userId,
    }, { timeout: 45000 });

    // console.log('Raw API response:', response.data);

    if (!response.data || !response.data.text) {
      throw new Error('Invalid response from API');
    }

    try {
      const parsedFlashcards = JSON.parse(response.data.text);
      if (Array.isArray(parsedFlashcards) && parsedFlashcards.length > 0) {
        // Validate the generated count
        if (parsedFlashcards.length !== finalCount) {
          console.warn(`Expected ${finalCount} flashcards but received ${parsedFlashcards.length}`);
        }
        return parsedFlashcards;
      }
    } catch (e) {
      console.error('Failed to parse JSON response:', e);
      throw new Error('Invalid response format from AI');
    }

    throw new Error('Invalid response format');
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