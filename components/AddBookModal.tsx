import React, { useState, useEffect } from 'react';
import * as uuid from 'uuid';
import * as pdfjsLib from 'pdfjs-dist/build/pdf';
import { Book, Theme } from '../types';
import Icon from './Icon';

// Set up the worker for pdf.js
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://esm.sh/pdfjs-dist@4.5.136/build/pdf.worker.mjs';

interface AddBookModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (book: Book) => void;
  theme: Theme;
}

type Tab = 'text' | 'pdf';

const generateCoverDataUri = (title: string, seed: string): string => {
  const colors = [
    ['#6366F1', '#A5B4FC'], // Indigo
    ['#10B981', '#6EE7B7'], // Emerald
    ['#F59E0B', '#FCD34D'], // Amber
    ['#EC4899', '#F9A8D4'], // Pink
    ['#8B5CF6', '#C4B5FD'], // Violet
    ['#EF4444', '#FCA5A5'], // Red
    ['#3B82F6', '#93C5FD'], // Blue
  ];
  const hash = seed.split('').reduce((acc, char) => char.charCodeAt(0) + ((acc << 5) - acc), 0);
  const colorPair = colors[Math.abs(hash) % colors.length];
  
  const words = title.split(' ');
  const initials = (words.length > 1 
      ? words[0][0] + words[1][0] 
      : title.substring(0, 2)
    ).toUpperCase();

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 600" width="400" height="600">
    <defs>
      <linearGradient id="grad-${seed.replace(/[^a-zA-Z0-9-]/g, '')}" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:${colorPair[0]};stop-opacity:1" />
        <stop offset="100%" style="stop-color:${colorPair[1]};stop-opacity:1" />
      </linearGradient>
    </defs>
    <rect width="400" height="600" fill="url(#grad-${seed.replace(/[^a-zA-Z0-9-]/g, '')})" />
    <text x="50%" y="50%" dominant-baseline="central" text-anchor="middle" font-family="Poppins, sans-serif" font-size="120" font-weight="bold" fill="white" fill-opacity="0.8">
      ${initials}
    </text>
  </svg>`;
  
  return `data:image/svg+xml;base64,${btoa(svg)}`;
};


const AddBookModal: React.FC<AddBookModalProps> = ({ isOpen, onClose, onSave, theme }) => {
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [content, setContent] = useState('');
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<Tab>('text');
  const [isParsing, setIsParsing] = useState(false);

  if (!isOpen) return null;

  const resetForm = () => {
    setTitle('');
    setAuthor('');
    setContent('');
    setError('');
    setIsParsing(false);
  };
  
  const handleClose = () => {
      resetForm();
      onClose();
  }

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      setIsParsing(true);
      setError('');
      setContent('');
      if (!title && file.name) {
          setTitle(file.name.replace(/\.pdf$/i, ''));
      }

      try {
          const arrayBuffer = await file.arrayBuffer();
          const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
          const numPages = pdf.numPages;
          let fullText = '';
          
          for (let i = 1; i <= numPages; i++) {
              const page = await pdf.getPage(i);
              const textContent = await page.getTextContent();
              const pageText = textContent.items.map(item => ('str' in item ? item.str : '')).join(' ');
              fullText += pageText + '\n\n';
          }
          setContent(fullText.trim());
      } catch (e) {
          console.error("Failed to parse PDF:", e);
          setError("Could not parse the PDF file. It might be corrupted or protected.");
      } finally {
          setIsParsing(false);
      }
  };


  const handleSave = () => {
    if (!title.trim() || !content.trim()) {
      setError('Title and Content are required.');
      return;
    }
    
    const trimmedTitle = title.trim();
    const slug = trimmedTitle.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    const newBook: Book = {
      id: `${slug}-${uuid.v4()}`, // Using uuid library
      title: trimmedTitle,
      author: author.trim() || 'Unknown Author',
      coverImage: generateCoverDataUri(trimmedTitle, slug),
      chapters: [
        {
          title: 'Chapter 1',
          content: content.trim(),
        },
      ],
    };
    onSave(newBook);
    handleClose();
  };

  const modalBg = theme === 'light' ? 'bg-white' : 'bg-dark-bg-panel';
  const textClass = theme === 'light' ? 'text-light-text' : 'text-dark-text';
  const inputBg = theme === 'light' ? 'bg-gray-100' : 'bg-gray-800';
  const inputBorder = theme === 'light' ? 'border-gray-300' : 'border-gray-600';
  const activeTabClass = 'border-primary text-primary';
  const inactiveTabClass = 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300';

  return (
    <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center"
        onClick={handleClose}
        aria-modal="true"
        role="dialog"
    >
      <div 
        className={`relative w-full max-w-2xl p-8 rounded-lg shadow-2xl ${modalBg} ${textClass}`}
        onClick={e => e.stopPropagation()}
      >
        <button onClick={handleClose} className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">
          <Icon name="close" />
        </button>
        <h2 className="text-2xl font-bold mb-6">Add a New Book</h2>
        
        <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
            <nav className="-mb-px flex space-x-6" aria-label="Tabs">
                <button onClick={() => setActiveTab('text')} className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'text' ? activeTabClass : inactiveTabClass}`}>Paste Text</button>
                <button onClick={() => setActiveTab('pdf')} className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'pdf' ? activeTabClass : inactiveTabClass}`}>Upload PDF</button>
            </nav>
        </div>

        {error && <p className="bg-red-100 text-red-700 p-3 rounded-md mb-4">{error}</p>}
        
        <div className="space-y-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium mb-1">Title *</label>
            <input 
              type="text"
              id="title"
              value={title}
              onChange={e => setTitle(e.target.value)}
              className={`w-full p-2 border rounded-md ${inputBg} ${inputBorder}`}
            />
          </div>
          <div>
            <label htmlFor="author" className="block text-sm font-medium mb-1">Author</label>
            <input 
              type="text"
              id="author"
              value={author}
              onChange={e => setAuthor(e.target.value)}
              className={`w-full p-2 border rounded-md ${inputBg} ${inputBorder}`}
            />
          </div>
          
          {activeTab === 'text' && (
             <div>
                <label htmlFor="content" className="block text-sm font-medium mb-1">Book Content *</label>
                <textarea
                  id="content"
                  value={content}
                  onChange={e => setContent(e.target.value)}
                  rows={10}
                  className={`w-full p-2 border rounded-md font-serif ${inputBg} ${inputBorder}`}
                  placeholder="Paste the full content of your book here. The app will treat this as a single chapter."
                ></textarea>
            </div>
          )}

          {activeTab === 'pdf' && (
              <div>
                <label htmlFor="pdf-upload" className="block text-sm font-medium mb-1">PDF File *</label>
                <input
                    type="file"
                    id="pdf-upload"
                    accept=".pdf"
                    onChange={handleFileChange}
                    className={`w-full text-sm rounded-lg border cursor-pointer ${inputBg} ${inputBorder} file:mr-4 file:py-2 file:px-4 file:rounded-l-md file:border-0 file:bg-gray-200 file:dark:bg-gray-700 hover:file:bg-gray-300 dark:hover:file:bg-gray-600`}
                />
                 {isParsing && <p className="text-primary mt-2 animate-pulse">Parsing PDF, please wait...</p>}
                 {content && !isParsing && <p className="text-green-600 mt-2">✓ PDF content extracted successfully!</p>}
              </div>
          )}
        </div>

        <div className="mt-8 flex justify-end gap-4">
          <button 
            onClick={handleClose}
            className="py-2 px-4 rounded-md bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
            >
              Cancel
            </button>
          <button 
            onClick={handleSave}
            disabled={isParsing}
            className="py-2 px-4 rounded-md bg-primary text-white hover:bg-primary-focus transition-colors disabled:opacity-50 disabled:cursor-wait"
          >
            {isParsing ? 'Parsing...' : 'Save Book'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddBookModal;