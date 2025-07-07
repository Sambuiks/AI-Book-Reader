import React, { useState, useRef, useEffect } from 'react';
import { Theme, ChatMessage, AIVoiceProfile } from '../types';
import { geminiService } from '../services/geminiService';
import Icon from './Icon';

interface ChatPanelProps {
  isOpen: boolean;
  onClose: () => void;
  theme: Theme;
  persona: AIVoiceProfile;
  isOnline: boolean;
  geminiKey: string;
  onOpenSettings: () => void;
}

const ChatPanel: React.FC<ChatPanelProps> = ({ isOpen, onClose, theme, persona, isOnline, geminiKey, onOpenSettings }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const themeClasses = {
    bg: theme === 'light' ? 'bg-gray-100 border-l border-gray-200' : 'bg-dark-bg-panel border-l border-gray-700',
    header: theme === 'light' ? 'bg-white' : 'bg-dark-bg-panel',
    inputBg: theme === 'light' ? 'bg-white' : 'bg-gray-800',
    userBubble: 'bg-primary text-white',
    modelBubble: theme === 'light' ? 'bg-gray-200 text-gray-800' : 'bg-gray-700 text-dark-text',
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  useEffect(() => {
    let systemMessageContent = '';
    if (!isOnline) {
        systemMessageContent = `You are offline. Chat with ${persona.name} is unavailable.`;
    } else if (!geminiKey) {
        systemMessageContent = `Chat with ${persona.name} requires a Google AI API key. Please add one in the settings.`;
    } else {
        systemMessageContent = `You're now chatting with ${persona.name}. Ask about the book or anything that comes to mind!`;
    }
      
    setMessages([
      {
        role: 'system',
        content: systemMessageContent,
        timestamp: new Date().toISOString()
      }
    ]);
  }, [persona, isOnline, geminiKey]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    if (!isOnline) {
        // Optionally show an alert or update the system message
        return;
    }

    if (!geminiKey) {
        onOpenSettings();
        return;
    }

    const userMessage: ChatMessage = {
      role: 'user',
      content: input,
      timestamp: new Date().toISOString()
    };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    const modelMessage: ChatMessage = {
        role: 'model',
        content: '',
        timestamp: new Date().toISOString()
    };
    
    setMessages(prev => [...prev, modelMessage]);

    await geminiService.streamChatResponse(
      input,
      (chunk) => {
          setMessages(prev => prev.map((msg, index) => 
              index === prev.length - 1 ? { ...msg, content: msg.content + chunk } : msg
          ));
      },
      (error) => {
        setMessages(prev => prev.map((msg, index) => 
            index === prev.length - 1 ? { ...msg, content: `Error: ${error}` } : msg
        ));
        setIsLoading(false);
      },
      () => {
        setIsLoading(false);
      },
      geminiKey
    );
  };

  return (
    <div className={`flex flex-col h-full transition-all duration-300 ease-in-out ${isOpen ? 'w-1/2 lg:w-1/3' : 'w-0'} ${themeClasses.bg} overflow-hidden`}>
      <header className={`flex items-center justify-between p-4 shadow-md shrink-0 ${themeClasses.header}`}>
        <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-xl">
                {persona.name.charAt(0)}
            </div>
            <div>
                <h3 className="font-bold">{persona.name}</h3>
                <p className="text-sm opacity-70">{persona.description}</p>
            </div>
        </div>
        <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"><Icon name="close" /></button>
      </header>

      <div className="flex-grow p-4 overflow-y-auto">
        <div className="flex flex-col gap-4">
          {messages.map((msg, index) => (
            <div key={index} className={`flex items-start gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}>
              {msg.role === 'model' && (
                  <div className="w-8 h-8 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0 mt-1">
                    {persona.name.charAt(0)}
                  </div>
              )}
              {msg.role !== 'system' && (
                <div className={`max-w-xs md:max-w-md rounded-lg p-3 ${msg.role === 'user' ? themeClasses.userBubble : themeClasses.modelBubble}`}>
                   {msg.role === 'model' && msg.content === '' && isLoading ? (
                     <div className="flex items-center gap-2">
                       <span className="w-2 h-2 bg-current rounded-full animate-bounce delay-0"></span>
                       <span className="w-2 h-2 bg-current rounded-full animate-bounce delay-150"></span>
                       <span className="w-2 h-2 bg-current rounded-full animate-bounce delay-300"></span>
                     </div>
                   ) : (
                     <p className="whitespace-pre-wrap">{msg.content}</p>
                   )}
                </div>
              )}
               {msg.role === 'system' && (
                <div className="text-center w-full text-xs text-gray-500 dark:text-gray-400 italic py-4">
                    <p>{msg.content}</p>
                </div>
               )}
            </div>
          ))}
           <div ref={messagesEndRef} />
        </div>
      </div>

      <div className={`p-4 shrink-0 ${themeClasses.header}`}>
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder={isOnline ? "Ask about the book..." : "Chat is unavailable offline"}
            disabled={isLoading || !isOnline}
            className={`flex-grow p-3 rounded-full border-2 border-transparent focus:border-primary focus:outline-none transition-colors ${themeClasses.inputBg} disabled:opacity-50`}
          />
          <button onClick={handleSend} disabled={isLoading || !input.trim() || !isOnline} className="bg-primary text-white rounded-full p-3 hover:bg-primary-focus transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
            <Icon name="send" className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatPanel;