import React, { useState, useMemo, useCallback, useEffect, forwardRef, useImperativeHandle } from 'react';
import { Book, Theme, AIVoiceProfile, ReaderControls } from '../types';
import { FONT_SIZES, AI_VOICES } from '../constants';
import { useSpeech } from '../hooks/useSpeech';
import Icon from './Icon';
import SettingsModal from './SettingsModal';

interface ReaderProps {
  book: Book;
  onExit: () => void;
  toggleTheme: () => void;
  onOpenCommandModal: () => void;
  onOpenSettings: () => void;
  theme: Theme;
  isOnline: boolean;
  elevenLabsKey: string;
  geminiKey: string;
  selectedVoice: AIVoiceProfile;
  onSetSelectedVoice: (voice: AIVoiceProfile) => void;
}

const Reader = forwardRef<ReaderControls, ReaderProps>(({ 
  book, onExit, toggleTheme, onOpenCommandModal, onOpenSettings,
  theme, isOnline, elevenLabsKey, geminiKey, selectedVoice, onSetSelectedVoice
}, ref) => {
  const [currentChapterIndex, setCurrentChapterIndex] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [fontSizeClass, setFontSizeClass] = useState('text-lg');
  const [localError, setLocalError] = useState<string | null>(null);

  const readingPanelRef = React.useRef<HTMLDivElement>(null);

  const handlePlaybackEnd = useCallback(() => {
    if (currentPage < pages.length - 1) {
      handleNavigatePage('next', { keepPlaybackState: true });
    }
  }, [currentPage]);

  const speech = useSpeech(handlePlaybackEnd, elevenLabsKey);
  const { isPlaying, isLoading, error: speechError, currentSentenceIndex, play, pause, resume, stop, setVoice, sentences } = speech;
  
  const currentChapter = useMemo(() => book.chapters[currentChapterIndex], [book.chapters, currentChapterIndex]);
  const combinedError = localError || speechError;

  const pages = useMemo(() => {
    if (!currentChapter?.content) return [''];
    const content = currentChapter.content.replace(/\s+/g, ' ').trim();
    if (!content) return [''];
    const wordsPerPage = 250 - FONT_SIZES.findIndex(f => f.class === fontSizeClass) * 25;
    const words = content.split(' ');
    const pageArray: string[] = [];
    for (let i = 0; i < words.length; i += wordsPerPage) {
      pageArray.push(words.slice(i, i + wordsPerPage).join(' '));
    }
    return pageArray;
  }, [currentChapter, fontSizeClass]);

  useEffect(() => {
    if (!isOnline && selectedVoice.provider === 'elevenlabs') {
      onSetSelectedVoice(AI_VOICES.find(v => v.provider === 'browser') || AI_VOICES[0]);
    }
  }, [isOnline, selectedVoice, onSetSelectedVoice]);

  useEffect(() => {
    setVoice(selectedVoice);
  }, [selectedVoice, setVoice]);
  
  useEffect(() => {
    setCurrentChapterIndex(0);
    setCurrentPage(0);
    stop();
    setLocalError(null);
  }, [book, stop]);
  
  const handleNavigatePage = (direction: 'next' | 'previous', options?: { keepPlaybackState?: boolean }) => {
    if (!options?.keepPlaybackState) {
      stop();
    }
    setCurrentPage(p => {
        if (direction === 'next' && p < pages.length - 1) return p + 1;
        if (direction === 'previous' && p > 0) return p - 1;
        return p;
    });
  };
  
  const handleSetChapter = (chapterIndex: number) => {
      if (chapterIndex >= 0 && chapterIndex < book.chapters.length) {
          stop();
          setCurrentChapterIndex(chapterIndex);
          setCurrentPage(0);
          return true;
      }
      return false;
  }
  
  const handleReadPage = (onEndCallback?: () => void) => {
      setLocalError(null);
      if(selectedVoice.provider === 'elevenlabs') {
        if (!isOnline) {
            setLocalError("ElevenLabs voices are unavailable offline.");
            return false;
        }
        if (!elevenLabsKey) {
            setLocalError("ElevenLabs API key is missing. Please add it in settings.");
            onOpenSettings();
            return false;
        }
      }
      play(pages[currentPage], selectedVoice, { onPlaybackEnd: onEndCallback });
      return true;
  };

  useImperativeHandle(ref, () => ({
    read: () => handleReadPage(),
    pause,
    resume,
    navigatePage: (direction) => handleNavigatePage(direction),
    setChapter: (index) => handleSetChapter(index),
    getCurrentPage: () => currentPage,
    getCurrentChapterIndex: () => currentChapterIndex,
  }));

  const themeClasses = useMemo(() => ({
    bg: theme === 'light' ? 'bg-light-bg' : 'bg-dark-bg',
    text: theme === 'light' ? 'text-light-text' : 'text-dark-text',
    panelBg: theme === 'light' ? 'bg-white' : 'bg-dark-bg-panel',
    button: `rounded-full p-2 transition-colors ${theme === 'light' ? 'hover:bg-gray-200' : 'hover:bg-gray-600'}`,
    highlight: theme === 'light' ? 'bg-highlight' : 'bg-dark-highlight',
  }), [theme]);

  const ReaderContent = useCallback(() => {
    if (!pages || pages.length === 0 || !pages[currentPage]) return <p className="text-center italic">This chapter is empty.</p>;
    
    if (!isPlaying && !isLoading) {
      return <p>{pages[currentPage]}</p>;
    }
    
    const highlightClass = selectedVoice.provider === 'elevenlabs' && isPlaying ? themeClasses.highlight : '';

    return (
      <p className={highlightClass}>
        {sentences.map((sentence, index) => (
          <span key={index} className={`${index === currentSentenceIndex && selectedVoice.provider === 'browser' ? themeClasses.highlight : ''}`}>
            {sentence}
          </span>
        ))}
      </p>
    );
  }, [pages, currentPage, isPlaying, sentences, currentSentenceIndex, themeClasses.highlight, selectedVoice.provider, isLoading]);

  return (
    <>
    <div className={`flex h-screen overflow-hidden ${themeClasses.bg} ${themeClasses.text}`}>
      <div className={`flex-grow flex flex-col transition-all duration-300`}>
        {/* Header */}
        <header className={`${themeClasses.panelBg} shadow-md p-4 flex justify-between items-center z-10`}>
          <div className="flex items-center gap-2 sm:gap-4">
            <button onClick={onExit} className={themeClasses.button}><Icon name="bookOpen" /></button>
            <div className="min-w-0">
              <h1 className="text-lg sm:text-xl font-bold truncate">{book.title}</h1>
              <h2 className="text-sm opacity-70 truncate">{currentChapter?.title || 'No Chapters'}</h2>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            <button onClick={toggleTheme} className={themeClasses.button}>
                <Icon name={theme === 'light' ? 'moon' : 'sun'} />
            </button>
            <button onClick={onOpenSettings} className={themeClasses.button}><Icon name="key" /></button>
          </div>
        </header>

        {/* Reader */}
        <div ref={readingPanelRef} className="flex-grow p-4 sm:p-8 md:p-12 lg:p-16 overflow-y-auto relative">
            <div className={`font-serif leading-relaxed ${fontSizeClass} `}>
               <ReaderContent />
               {isLoading && <div className="absolute inset-0 bg-black bg-opacity-10 flex items-center justify-center"><p>Generating audio...</p></div>}
               {combinedError && <div className="mt-4 text-red-500 text-center"><p>{combinedError}</p></div>}
            </div>
        </div>

        {/* Footer */}
        <footer className={`${themeClasses.panelBg} shadow-inner p-2 sm:p-4 flex flex-col sm:flex-row justify-between items-center z-10 gap-2`}>
            <div className="w-full sm:w-1/3 flex justify-start">
                <select value={currentChapterIndex} onChange={e => handleSetChapter(parseInt(e.target.value))} className={`border rounded p-2 text-sm w-full sm:w-auto ${theme === 'light' ? 'bg-gray-50' : 'bg-gray-700 border-gray-600'}`}>
                    {book.chapters.map((chap, index) => <option key={index} value={index}>{chap.title}</option>)}
                    {book.chapters.length === 0 && <option>No Chapters</option>}
                </select>
            </div>

            <div className="w-full sm:w-auto flex items-center justify-center gap-4">
                <button onClick={() => handleNavigatePage('previous')} className={themeClasses.button} disabled={currentPage === 0}>
                    <Icon name="chevronLeft" className="w-7 h-7" />
                </button>
                <button onClick={onOpenCommandModal} disabled={!isOnline || !geminiKey} className="bg-primary text-white rounded-full p-4 hover:bg-primary-focus transition-colors shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-400">
                    <Icon name={'microphone'} className="w-8 h-8" />
                </button>
                <button onClick={() => handleNavigatePage('next')} className={themeClasses.button} disabled={currentPage >= pages.length - 1}>
                    <Icon name="chevronRight" className="w-7 h-7" />
                </button>
            </div>

            <div className="w-full sm:w-1/3 flex items-center justify-end gap-2">
                <span className="text-sm opacity-70 hidden md:inline">Page {pages.length > 0 ? currentPage + 1 : 0}/{pages.length}</span>
                 <select value={selectedVoice.id} onChange={e => onSetSelectedVoice(AI_VOICES.find(v => v.id === e.target.value) || AI_VOICES[0])} className={`border rounded p-2 text-sm w-full sm:w-auto ${theme === 'light' ? 'bg-gray-50' : 'bg-gray-700 border-gray-600'}`}>
                  {AI_VOICES.map(v => <option key={v.id} value={v.id} disabled={v.provider === 'elevenlabs' && !isOnline}>{v.name} {v.provider === 'elevenlabs' && !isOnline ? '(Offline)' : ''}</option>)}
                </select>
            </div>
        </footer>
      </div>
    </div>
    </>
  );
});

export default Reader;