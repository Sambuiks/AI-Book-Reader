import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Theme, ChatMessage, AICommand, AIVoiceProfile } from '../types';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';
import { useSpeech } from '../hooks/useSpeech';
import Icon from './Icon';

interface AICommandModalProps {
  isOpen: boolean;
  onClose: () => void;
  theme: Theme;
  isOnline: boolean;
  geminiKey: string;
  elevenLabsKey: string;
  onOpenSettings: () => void;
  onProcessCommand: (command: string) => Promise<AICommand>;
  selectedVoice: AIVoiceProfile;
}

type Status = 'idle' | 'listening' | 'processing' | 'speaking';

const AICommandModal: React.FC<AICommandModalProps> = ({ 
  isOpen, onClose, theme, isOnline, geminiKey, elevenLabsKey, onOpenSettings, onProcessCommand, selectedVoice 
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [status, setStatus] = useState<Status>('idle');
  const [micError, setMicError] = useState<string | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const handleSpeechResult = useCallback(async (transcript: string) => {
    if (!transcript) {
        setStatus('idle');
        return;
    }
    
    setStatus('processing');
    stopListening();

    const userMessage: ChatMessage = {
      role: 'user',
      content: transcript,
      timestamp: new Date().toISOString()
    };
    setMessages(prev => [...prev, userMessage]);
    
    const result = await onProcessCommand(transcript);

    if(result.action === 'CONVERSE' || result.action === 'UNKNOWN') {
        const responseText = result.payload.response || 'I am not sure how to respond to that.';
        const modelMessage: ChatMessage = {
            role: 'model',
            content: responseText,
            timestamp: new Date().toISOString()
        };
        setMessages(prev => [...prev, modelMessage]);
        setStatus('speaking');
        
        // Speak the response, and when done, start listening again
        speech.play(responseText, selectedVoice, { 
            splitSentences: false,
            onPlaybackEnd: () => {
                // To avoid instant re-triggering if mic picks up end of speech
                setTimeout(() => startListening(), 100); 
            }
        });
    } else {
        const commandMessage: ChatMessage = {
            role: 'command',
            content: `Command executed: ${result.action}`,
            timestamp: new Date().toISOString()
        };
        setMessages(prev => [...prev, commandMessage]);
        // After a successful command, close the modal.
        if (result.action !== 'PAUSE' && result.action !== 'RESUME' && result.action !== 'READ') {
          setTimeout(() => onClose(), 1000);
        }
        setStatus('idle');
    }
  }, [onProcessCommand, selectedVoice, onClose]);

  const { isListening, isSupported, startListening, stopListening } = useSpeechRecognition({
      onResult: handleSpeechResult,
      onError: (error) => {
        setMicError(error);
        setStatus('idle');
      },
      onEnd: () => {
        if (status === 'listening') {
          setStatus('idle');
        }
      }
  });

  const speech = useSpeech(() => { 
      // Default onEnd for speech hook if no specific onPlaybackEnd is provided
      if (status === 'speaking') setStatus('idle');
  }, elevenLabsKey);

  useEffect(() => {
    speech.setVoice(selectedVoice);
  }, [selectedVoice, speech]);


  const themeClasses = {
    bg: theme === 'light' ? 'bg-white' : 'bg-dark-bg-panel',
    text: theme === 'light' ? 'text-gray-800' : 'text-dark-text',
    userBubble: 'bg-primary text-white',
    modelBubble: theme === 'light' ? 'bg-gray-200 text-gray-800' : 'bg-gray-700 text-dark-text',
    commandBubble: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  useEffect(() => {
    if (isOpen) {
      setMicError(null);
      setMessages([]);
      handleMicClick();
    } else {
      if(isListening) stopListening();
      speech.stop();
      setStatus('idle');
    }
  }, [isOpen]);

  // Update status when `isListening` from the hook changes
  useEffect(() => {
    if (isListening && status !== 'listening') {
      setStatus('listening');
    }
  }, [isListening, status]);

  const handleMicClick = () => {
      setMicError(null);
      if (!isOnline) {
          setMicError("Voice commands are unavailable offline.");
          return;
      }
      if (!geminiKey) {
          onClose();
          onOpenSettings();
          return;
      }
      if (status === 'speaking') {
          speech.stop();
          setStatus('idle');
          return;
      }
      if (isListening) {
          stopListening();
          setStatus('idle');
      } else {
          startListening();
      }
  }

  if (!isOpen) return null;

  let statusText = "Tap the mic to issue a command or speak.";
  let micIcon: React.ReactNode = <Icon name="microphone" className="w-10 h-10" />;
  let micClass = 'bg-primary text-white hover:bg-primary-focus';

  switch(status) {
      case 'listening':
          statusText = "Listening...";
          micClass = 'bg-red-500 text-white scale-110 animate-pulse';
          break;
      case 'processing':
          statusText = "Thinking...";
          micIcon = <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin"></div>;
          micClass = 'bg-primary text-white';
          break;
      case 'speaking':
          statusText = "Speaking... (Tap to interrupt)";
          micIcon = <Icon name="pause" className="w-10 h-10" />;
          micClass = 'bg-secondary text-white';
          break;
  }
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-40 flex justify-center items-center backdrop-blur-sm" onClick={onClose}>
        <div 
            className={`w-full max-w-2xl h-[80vh] flex flex-col rounded-xl shadow-2xl overflow-hidden ${themeClasses.bg} ${themeClasses.text}`}
            onClick={e => e.stopPropagation()}
        >
            <header className="flex items-center justify-between p-4 shadow-md shrink-0">
                <h3 className="font-bold text-lg">AI Command Center</h3>
                <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"><Icon name="close" /></button>
            </header>
            
            <div className="flex-grow p-4 overflow-y-auto">
                <div className="flex flex-col gap-4">
                  {messages.length === 0 && (
                    <div className="text-center text-gray-500 italic mt-8">
                      {isSupported ? 'Press the mic to start.' : 'Speech recognition not supported.'}
                    </div>
                  )}
                  {messages.map((msg, index) => (
                    <div key={index} className={`flex items-start gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      {msg.role === 'user' && (
                        <div className={`max-w-xs md:max-w-md rounded-lg p-3 ${themeClasses.userBubble}`}>
                          <p className="whitespace-pre-wrap">{msg.content}</p>
                        </div>
                      )}
                      {msg.role === 'model' && (
                        <div className="flex items-start gap-3">
                           <div className="w-8 h-8 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0 mt-1">AI</div>
                           <div className={`max-w-xs md:max-w-md rounded-lg p-3 ${themeClasses.modelBubble}`}>
                               <p className="whitespace-pre-wrap">{msg.content}</p>
                           </div>
                        </div>
                      )}
                      {msg.role === 'command' && (
                          <div className={`w-full text-center text-xs italic p-2 rounded-md ${themeClasses.commandBubble}`}>
                              {msg.content}
                          </div>
                      )}
                    </div>
                  ))}
                   <div ref={messagesEndRef} />
                </div>
            </div>

            <div className="p-6 shrink-0 border-t dark:border-gray-700 flex flex-col items-center justify-center">
                <button 
                    onClick={handleMicClick} 
                    disabled={!isSupported || !isOnline}
                    className={`w-20 h-20 rounded-full transition-all duration-300 flex items-center justify-center shadow-lg disabled:opacity-50 disabled:cursor-not-allowed ${micClass}`}
                >
                    {micIcon}
                </button>
                <p className="mt-4 text-sm text-gray-500 dark:text-gray-400 h-5">
                    {micError || statusText}
                </p>
            </div>
        </div>
    </div>
  );
};

export default AICommandModal;