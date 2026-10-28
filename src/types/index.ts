export type CEFRLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1';

export type PrebuiltVoice = 'Zephyr' | 'Puck' | 'Charon' | 'Kore' | 'Fenrir';

export interface LanguageOption {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
  defaultVoice: PrebuiltVoice;
  greetingSample: string;
  availableVoices: PrebuiltVoice[];
}

export interface Scenario {
  id: string;
  title: string;
  category: 'Dining' | 'Travel' | 'Daily Life' | 'Professional' | 'Social' | 'Emergency';
  targetLevel: CEFRLevel;
  description: string;
  partnerRole: string;
  userRole: string;
  suggestedStarter: string;
  image?: string;
  keywords: string[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
  audioBase64?: string;
  isStreaming?: boolean;
}

export interface VocabularyItem {
  id: string;
  word: string;
  translation: string;
  note?: string;
  targetLanguage: string;
  exampleSentence?: string;
  addedAt: number;
  mastered?: boolean;
}

export interface TurnCorrection {
  isCorrect: boolean;
  betterAlternative: string;
  explanation: string;
  detectedLevel: string;
  vocabulary: {
    word: string;
    translation: string;
    note?: string;
  }[];
  suggestedNextPhrases: {
    phrase: string;
    translation: string;
  }[];
}

export interface SessionMetrics {
  durationSeconds: number;
  userTurns: number;
  modelTurns: number;
  userWordsSpoken: number;
  correctionsGiven: number;
  vocabularyLearned: number;
}

export interface SessionDebrief {
  fluencyScore: number;
  grammarScore: number;
  vocabularyScore: number;
  overallAssessment: string;
  strengths: string[];
  improvements: string[];
  keyVocabularyToReview: {
    term: string;
    meaning: string;
    usageExample: string;
  }[];
}
