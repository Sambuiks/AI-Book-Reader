import React, { useState, useEffect } from 'react';
import { Theme } from '../types';
import Icon from './Icon';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (keys: { elevenLabs: string; gemini: string }) => void;
  theme: Theme;
  currentElevenLabsKey: string;
  currentGeminiKey: string;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, onSave, theme, currentElevenLabsKey, currentGeminiKey }) => {
  const [keys, setKeys] = useState({
      elevenLabs: currentElevenLabsKey,
      gemini: currentGeminiKey
  });

  useEffect(() => {
    setKeys({
        elevenLabs: currentElevenLabsKey,
        gemini: currentGeminiKey
    })
  }, [currentElevenLabsKey, currentGeminiKey, isOpen])

  if (!isOpen) return null;
  
  const handleSave = () => {
    onSave(keys);
  };
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target;
      setKeys(prev => ({ ...prev, [name]: value }));
  }

  const modalBg = theme === 'light' ? 'bg-white' : 'bg-dark-bg-panel';
  const textClass = theme === 'light' ? 'text-light-text' : 'text-dark-text';
  const inputBg = theme === 'light' ? 'bg-gray-100' : 'bg-gray-800';
  const inputBorder = theme === 'light' ? 'border-gray-300' : 'border-gray-600';

  return (
    <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center"
        onClick={onClose}
        aria-modal="true"
        role="dialog"
    >
      <div 
        className={`relative w-full max-w-md p-8 rounded-lg shadow-2xl ${modalBg} ${textClass}`}
        onClick={e => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">
          <Icon name="close" />
        </button>
        <h2 className="text-2xl font-bold mb-4">API Key Settings</h2>
        
        <div className="space-y-6">
           <div>
            <label htmlFor="elevenLabs" className="block text-sm font-medium mb-1">ElevenLabs API Key</label>
            <input 
              type="password"
              id="elevenLabs"
              name="elevenLabs"
              value={keys.elevenLabs}
              onChange={handleChange}
              className={`w-full p-2 border rounded-md ${inputBg} ${inputBorder}`}
              placeholder="For premium voices"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Your key is stored only in your browser. Get one from the <a href="https://elevenlabs.io/" target="_blank" rel="noopener noreferrer" className="text-primary underline">ElevenLabs website</a>.
            </p>
          </div>
          <div>
            <label htmlFor="gemini" className="block text-sm font-medium mb-1">Google AI API Key</label>
            <input 
              type="password"
              id="gemini"
              name="gemini"
              value={keys.gemini}
              onChange={handleChange}
              className={`w-full p-2 border rounded-md ${inputBg} ${inputBorder}`}
              placeholder="For AI chat conversations"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Your key is stored only in your browser. Get one from <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-primary underline">Google AI Studio</a>.
            </p>
          </div>
        </div>

        <div className="mt-8 flex justify-end gap-4">
          <button 
            onClick={onClose}
            className="py-2 px-4 rounded-md bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
            >
              Cancel
            </button>
          <button 
            onClick={handleSave}
            className="py-2 px-4 rounded-md bg-primary text-white hover:bg-primary-focus transition-colors"
          >
            Save Keys
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;