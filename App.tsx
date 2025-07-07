import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Book, Theme, AICommand, ReaderControls, AIVoiceProfile } from './types';
import { books as staticBooks } from './data/books';
import { AI_VOICES } from './constants';
import { geminiService } from './services/geminiService';
import Library from './components/Library';
import Reader from './components/Reader';
import AICommandModal from './components/ChatModal';
import SettingsModal from './components/SettingsModal';

function App() {
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [theme, setTheme] = useState<Theme>(() => (localStorage.getItem('ebook-theme') as Theme) || 'light');
  const [books, setBooks] = useState<Book[]>(() => {
    const savedBooks = localStorage.getItem('custom-books');
    const customBooks = savedBooks ? JSON.parse(savedBooks) : [];
    return [...staticBooks, ...customBooks];
  });
  const [isOnline, setIsOnline] = useState<boolean>(() => navigator.onLine);
  const [isCommandModalOpen, setIsCommandModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [geminiKey, setGeminiKey] = useState(() => localStorage.getItem('gemini-api-key') || '');
  const [elevenLabsKey, setElevenLabsKey] = useState(() => localStorage.getItem('elevenlabs-api-key') || '');
  const [selectedVoice, setSelectedVoice] = useState<AIVoiceProfile>(AI_VOICES[0]);

  const readerControlsRef = useRef<ReaderControls>(null);

  useEffect(() => {
    localStorage.setItem('ebook-theme', theme);
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);
  
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleAddBook = (book: Book) => {
    setBooks(prevBooks => {
        const newBooks = [...prevBooks, book];
        const customBooks = newBooks.filter(b => !staticBooks.some(sb => sb.id === b.id));
        localStorage.setItem('custom-books', JSON.stringify(customBooks));
        return newBooks;
    });
    setSelectedBook(book);
  };

  const handleSelectBook = (book: Book) => {
    setSelectedBook(book);
  };

  const handleSwitchBook = (bookTitle: string) => {
    const bookToSelect = books.find(b => b.title.toLowerCase().includes(bookTitle.toLowerCase()));
    if (bookToSelect) {
      setSelectedBook(bookToSelect);
      setIsCommandModalOpen(false); // Close modal on successful switch
      return true;
    }
    return false;
  };

  const handleExitBook = () => {
    setSelectedBook(null);
  };

  const toggleTheme = () => {
    setTheme(currentTheme => (currentTheme === 'light' ? 'dark' : 'light'));
  };
  
  const handleSaveApiKeys = (keys: { elevenLabs: string; gemini: string }) => {
    setElevenLabsKey(keys.elevenLabs);
    localStorage.setItem('elevenlabs-api-key', keys.elevenLabs);
    setGeminiKey(keys.gemini);
    localStorage.setItem('gemini-api-key', keys.gemini);
    setIsSettingsOpen(false);
  };
  
  const processAndExecuteCommand = async (command: string): Promise<AICommand> => {
      const context = {
        currentBook: selectedBook,
        currentChapterIndex: readerControlsRef.current?.getCurrentChapterIndex() ?? 0,
        currentPage: readerControlsRef.current?.getCurrentPage() ?? 0,
        library: books,
      };
      const result = await geminiService.processCommand(command, context, geminiKey);
      const reader = readerControlsRef.current;

      // Execute book-specific commands only if a book is open and reader is available
      if (selectedBook && reader) {
          switch(result.action) {
              case 'READ': reader.read(); break;
              case 'PAUSE': reader.pause(); break;
              case 'RESUME': reader.resume(); break;
              case 'NAVIGATE_PAGE':
                  if (result.payload.pageDirection) reader.navigatePage(result.payload.pageDirection);
                  break;
              case 'NAVIGATE_CHAPTER':
                  if (result.payload.chapterIndex !== undefined) reader.setChapter(result.payload.chapterIndex);
                  break;
          }
      }

      // Execute global commands
      switch(result.action) {
          case 'SWITCH_BOOK':
              if (result.payload.bookTitle) {
                  handleSwitchBook(result.payload.bookTitle);
              }
              break;
      }
      return result;
  }

  const appClassName = useMemo(() => {
    return theme === 'light' ? 'bg-light-bg text-light-text' : 'bg-dark-bg text-dark-text';
  }, [theme]);

  return (
    <>
      <main className={`min-h-screen font-sans transition-colors duration-300 ${appClassName}`}>
        {selectedBook ? (
          <Reader 
            ref={readerControlsRef}
            book={selectedBook} 
            theme={theme} 
            isOnline={isOnline}
            elevenLabsKey={elevenLabsKey}
            geminiKey={geminiKey}
            onExit={handleExitBook} 
            toggleTheme={toggleTheme}
            onOpenCommandModal={() => setIsCommandModalOpen(true)}
            onOpenSettings={() => setIsSettingsOpen(true)}
            selectedVoice={selectedVoice}
            onSetSelectedVoice={setSelectedVoice}
          />
        ) : (
          <Library 
            books={books} 
            onSelectBook={handleSelectBook} 
            onAddBook={handleAddBook} 
            theme={theme}
            onOpenCommandModal={() => setIsCommandModalOpen(true)}
            onOpenSettings={() => setIsSettingsOpen(true)}
          />
        )}
      </main>
      
      <AICommandModal
          isOpen={isCommandModalOpen}
          onClose={() => setIsCommandModalOpen(false)}
          theme={theme}
          isOnline={isOnline}
          geminiKey={geminiKey}
          elevenLabsKey={elevenLabsKey}
          onOpenSettings={() => setIsSettingsOpen(true)}
          onProcessCommand={processAndExecuteCommand}
          selectedVoice={selectedVoice}
        />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onSave={handleSaveApiKeys}
        theme={theme}
        currentElevenLabsKey={elevenLabsKey}
        currentGeminiKey={geminiKey}
      />
    </>
  );
}

export default App;