import React, { useState } from 'react';
import { Book, Theme } from '../types';
import Icon from './Icon';
import AddBookModal from './AddBookModal';

interface LibraryProps {
  books: Book[];
  onSelectBook: (book: Book) => void;
  onAddBook: (book: Book) => void;
  onOpenCommandModal: () => void;
  onOpenSettings: () => void;
  theme: Theme;
}

const Library: React.FC<LibraryProps> = ({ books, onSelectBook, onAddBook, onOpenCommandModal, onOpenSettings, theme }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const cardBg = theme === 'light' ? 'bg-white' : 'bg-dark-bg-panel';
  const textColor = theme === 'light' ? 'text-gray-800' : 'text-dark-text';
  const authorColor = theme === 'light' ? 'text-gray-500' : 'text-dark-text-muted';

  return (
    <>
      <div className="container mx-auto px-4 py-12 relative">
        <button
          onClick={onOpenSettings}
          className="absolute top-12 right-4 p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors z-10"
          aria-label="Settings"
        >
          <Icon name="key" className="w-6 h-6" />
        </button>
        <header className="text-center mb-12">
          <div className="flex justify-center items-center gap-4 mb-4">
              <Icon name="bookOpen" className={`w-12 h-12 ${theme === 'light' ? 'text-primary' : 'text-indigo-400'}`} />
              <h1 className="text-5xl font-bold font-serif">AI Ebook Reader</h1>
          </div>
          <p className={`text-xl ${authorColor} mb-6`}>Choose a book or use the AI to open one for you.</p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-primary text-white font-bold py-2 px-6 rounded-full inline-flex items-center gap-2 hover:bg-primary-focus transition-colors shadow-md"
          >
            <Icon name="plus" className="w-5 h-5" />
            Add Book
          </button>
        </header>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-8">
          {books.map(book => (
            <div
              key={book.id}
              onClick={() => onSelectBook(book)}
              className={`group cursor-pointer transform hover:-translate-y-2 transition-transform duration-300 rounded-lg shadow-lg hover:shadow-2xl overflow-hidden ${cardBg}`}
            >
              <img src={book.coverImage} alt={`Cover of ${book.title}`} className="w-full h-auto object-cover aspect-[2/3]" />
              <div className="p-4">
                <h3 className={`font-bold text-lg truncate ${textColor}`}>{book.title}</h3>
                <p className={`text-sm ${authorColor}`}>{book.author}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
      <button 
        onClick={onOpenCommandModal} 
        className="fixed bottom-8 right-8 bg-primary text-white rounded-full p-4 hover:bg-primary-focus transition-colors shadow-lg z-20"
        aria-label="Open AI Command Center"
      >
        <Icon name={'microphone'} className="w-8 h-8" />
      </button>
      <AddBookModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={onAddBook}
        theme={theme}
      />
    </>
  );
};

export default Library;