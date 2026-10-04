import React, { useState, useEffect } from 'react';
import MainMenu from './components/MainMenu';
import ScannerView from './components/ScannerView';
import BookPreview from './components/BookPreview';
import LibraryView from './components/LibraryView';
import ExportView from './components/ExportView';
import { getLibraryBooks, addBookToLibrary } from './services/storageService';
import { AlertCircle, ArrowLeft } from 'lucide-react';

export default function App() {
  const [currentView, setCurrentView] = useState('main'); // 'main' | 'scanner' | 'preview' | 'library' | 'export' | 'error'
  const [scannedBook, setScannedBook] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [libraryBooks, setLibraryBooks] = useState(() => getLibraryBooks());

  const refreshLibrary = () => {
    setLibraryBooks(getLibraryBooks());
  };

  useEffect(() => {
    refreshLibrary();
  }, [currentView]);

  const handleBookFound = (book) => {
    setScannedBook(book);
    setCurrentView('preview');
  };

  const handleErrorFound = (msg) => {
    setErrorMessage(msg);
    setCurrentView('error');
  };

  const handleAddBookToLibrary = (book) => {
    addBookToLibrary(book);
    refreshLibrary();
    setScannedBook(null);
    setCurrentView('library');
  };

  const handleDiscardBook = () => {
    setScannedBook(null);
    setCurrentView('scanner');
  };

  const totalBooksCount = libraryBooks.reduce((sum, b) => sum + (b.count || 1), 0);

  return (
    <div className="min-h-screen bg-[#0b132b] text-[#e0e1dd] flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      {/* Vykreslení pohledu podle currentView */}
      {currentView === 'main' && (
        <MainMenu
          onNavigate={(view) => setCurrentView(view)}
          totalBooksCount={totalBooksCount}
        />
      )}

      {currentView === 'scanner' && (
        <ScannerView
          onNavigate={(view) => setCurrentView(view)}
          onBookFound={handleBookFound}
          onErrorFound={handleErrorFound}
        />
      )}

      {currentView === 'preview' && (
        <BookPreview
          book={scannedBook}
          onAdd={handleAddBookToLibrary}
          onDiscard={handleDiscardBook}
        />
      )}

      {currentView === 'library' && (
        <LibraryView
          onNavigate={(view) => setCurrentView(view)}
          onBooksUpdated={setLibraryBooks}
        />
      )}

      {currentView === 'export' && (
        <ExportView
          onNavigate={(view) => setCurrentView(view)}
        />
      )}

      {/* Chybová stránek / okno při nenalezení ISBN -> po zavření / tlačítkem Zpět vrátí na skener podle požadavku */}
      {currentView === 'error' && (
        <div className="flex flex-col min-h-screen max-w-md mx-auto px-4 py-8 items-center justify-center text-center">
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-8 shadow-2xl w-full flex flex-col items-center">
            <div className="w-16 h-16 rounded-2xl bg-rose-950/80 border border-rose-800/60 text-rose-400 flex items-center justify-center mb-4">
              <AlertCircle className="w-10 h-10" />
            </div>

            <h2 className="text-xl font-bold text-white mb-2">Kniha nenalezena</h2>
            <p className="text-sm text-slate-300 mb-6 leading-relaxed">
              {errorMessage || 'Zadaný čárový kód nebo ISBN se nepodařilo vyhledat v žádné z dostupných databází.'}
            </p>

            <button
              onClick={() => setCurrentView('scanner')}
              className="w-full py-3.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 transition cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Zpět na skener</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
