export interface Chapter {
  title: string;
  content: string;
}

export interface Book {
  id: string;
  title:string;
  author: string;
  coverImage: string;
  chapters: Chapter[];
}

export interface AIVoiceProfile {
  id: string;
  name: string;
  description: string;
  provider: 'browser' | 'elevenlabs';
  // For browser voices
  voiceURI?: string;
  // For ElevenLabs voices
  voiceId?: string; 
}

export interface ChatMessage {
  role: 'user' | 'model' | 'system' | 'command';
  content: string;
  timestamp: string;
}

export type Theme = 'light' | 'dark';

export type AICommandAction = 
  | 'READ' 
  | 'PAUSE' 
  | 'RESUME'
  | 'NAVIGATE_PAGE' 
  | 'NAVIGATE_CHAPTER' 
  | 'SWITCH_BOOK' 
  | 'CONVERSE' 
  | 'UNKNOWN';

export interface AICommand {
  action: AICommandAction;
  payload: {
    bookTitle?: string;
    chapterIndex?: number;
    pageDirection?: 'next' | 'previous';
    response?: string; // For conversational replies or errors
  };
}

export interface ReaderControls {
  read: () => void;
  pause: () => void;
  resume: () => void;
  navigatePage: (direction: 'next' | 'previous') => void;
  setChapter: (index: number) => void;
  getCurrentPage: () => number;
  getCurrentChapterIndex: () => number;
}