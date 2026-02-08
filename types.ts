export interface StudyPlanEntry {
  day: number;
  date: string; // YYYY-MM-DD
  topic: string;
  activities: string[];
}

export interface Flashcard {
  question: string;
  answer: string;
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
  userAnswerIndex?: number; // User's selected option index
  isCorrect?: boolean; // Whether the user's answer was correct
}

export interface ChatMessage {
  role: 'user' | 'model';
  content: string;
}

export type ToolType = 'plan' | 'analyze' | 'flashcards' | 'quiz' | 'chat' | 'progress';
