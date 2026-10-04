import React, { useState } from 'react';
import { ArrowLeft, Plus, Minus, Trash2, Book, ScanLine, AlertTriangle } from 'lucide-react';
import { getLibraryBooks, addBookToLibrary, decreaseBookCount, removeBookFromLibrary } from '../services/storageService';

export default function LibraryView({ onNavigate, onBooksUpdated }) {
  const [books, setBooks] = useState(() => getLibraryBooks());
  const [selectedBookForDelete, setSelectedBookForDelete] = useState(null);

  const refreshBooks = () => {
    const updated = getLibraryBooks();
    setBooks(updated);
    if (onBooksUpdated) onBooksUpdated(updated);
  };

  const handleAddOne = (book) => {
    addBookToLibrary(book);
    refreshBooks();
  };

  const handleDecreaseOne = (isbn) => {
    decreaseBookCount(isbn);
    refreshBooks();
    setSelectedBookForDelete(null);
  };

  const handleRemoveAll = (isbn) => {
    removeBookFromLibrary(isbn);
    refreshBooks();
    setSelectedBookForDelete(null);
  };

  const totalCopies = books.reduce((acc, b) => acc + (b.count || 1), 0);

  return (
    <div className="flex flex-col min-h-screen max-w-2xl mx-auto px-4 py-6">
      {/* Horní lišta */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => onNavigate('main')}
          className="flex items-center gap-2 px-3 py-2 text-sm text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700 rounded-lg border border-slate-700 transition cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Hlavní menu</span>
        </button>

        <div className="text-right">
          <h2 className="text-lg font-bold text-white">Moje Knihovna</h2>
          <p className="text-xs text-slate-400">
            {books.length} {books.length === 1 ? 'titul' : (books.length >= 2 && books.length <= 4) ? 'tituly' : 'titulů'} &bull; {totalCopies} {totalCopies === 1 ? 'ks' : 'ks'}
          </p>
        </div>
      </div>

      {/* Seznam knih nebo prázdný stav */}
      {books.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center py-16 px-4 bg-slate-900/40 border border-slate-800/80 rounded-2xl">
          <div className="w-16 h-16 rounded-2xl bg-slate-800/80 text-slate-500 flex items-center justify-center mb-4 border border-slate-700/50">
            <Book className="w-8 h-8 stroke-1" />
          </div>
          <h3 className="text-lg font-semibold text-white">Vaše knihovna je prázdná</h3>
          <p className="text-sm text-slate-400 mt-1 max-w-xs mb-6">
            Zatím jste nenaskenovali žádné knihy. Můžete začít skenovat naskenováním čárového kódu.
          </p>
          <button
            onClick={() => onNavigate('scanner')}
            className="flex items-center gap-2 px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium text-sm transition shadow-lg shadow-blue-600/20 cursor-pointer"
          >
            <ScanLine className="w-4 h-4" />
            <span>Spustit skener</span>
          </button>
        </div>
      ) : (
        <div className="space-y-4 flex-1">
          {books.map((book) => (
            <div
              key={book.isbn}
              className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-lg flex gap-4 items-center relative overflow-hidden"
            >
              {/* Obálka */}
              <div className="w-16 h-24 shrink-0 rounded-lg overflow-hidden bg-slate-950 border border-slate-800 flex items-center justify-center">
                {book.cover ? (
                  <img
                    src={book.cover}
                    alt={book.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                ) : null}
                <div className={`flex flex-col items-center text-slate-600 ${book.cover ? 'hidden' : 'flex'}`}>
                  <Book className="w-6 h-6 stroke-1" />
                </div>
              </div>

              {/* Informace */}
              <div className="flex-1 min-w-0 pr-2">
                <h3 className="font-bold text-white text-base leading-snug truncate">
                  {book.title}
                </h3>

                {book.author && (
                  <p className="text-xs text-slate-300 mt-0.5 truncate">
                    {book.author}
                  </p>
                )}

                <div className="flex items-center gap-2 text-xs text-slate-400 mt-2 flex-wrap">
                  {book.publisher && <span>{book.publisher}</span>}
                  {book.publisher && book.year && <span>&bull;</span>}
                  {book.year && <span>{book.year}</span>}
                </div>

                <p className="text-[11px] font-mono text-slate-500 mt-1">
                  ISBN: {book.isbn}
                </p>
              </div>

              {/* Počet a Akce */}
              <div className="flex flex-col items-end justify-between self-stretch shrink-0">
                <div className="inline-flex items-center px-2.5 py-1 rounded-full bg-blue-950/80 border border-blue-500/30 text-blue-300 font-bold text-xs">
                  {book.count || 1}x
                </div>

                <div className="flex items-center gap-1 mt-auto">
                  <button
                    onClick={() => handleAddOne(book)}
                    title="Přidat další kus"
                    className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => setSelectedBookForDelete(book)}
                    title="Smazat nebo odebrat kus"
                    className="p-2 rounded-lg bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border border-rose-800/50 transition cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Dialog pro smazání / snížení počtu */}
      {selectedBookForDelete && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-sm w-full shadow-2xl animate-in fade-in zoom-in duration-150">
            <div className="flex items-center gap-3 text-rose-400 mb-3">
              <div className="p-2 rounded-lg bg-rose-950 border border-rose-800/60">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-lg text-white">Odebrat z knihovny</h3>
            </div>

            <p className="text-sm text-slate-300 mb-2">
              Kniha: <strong className="text-white">{selectedBookForDelete.title}</strong>
            </p>
            <p className="text-xs text-slate-400 mb-6">
              V knihovně máte celkem <strong>{selectedBookForDelete.count || 1}x</strong> tento výtisk.
            </p>

            <div className="space-y-2">
              {selectedBookForDelete.count > 1 && (
                <button
                  onClick={() => handleDecreaseOne(selectedBookForDelete.isbn)}
                  className="w-full py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-sm border border-slate-700 flex items-center justify-center gap-2 transition cursor-pointer"
                >
                  <Minus className="w-4 h-4 text-amber-400" />
                  <span>Snížit počet o 1 ks (zanechat {(selectedBookForDelete.count || 1) - 1}x)</span>
                </button>
              )}

              <button
                onClick={() => handleRemoveAll(selectedBookForDelete.isbn)}
                className="w-full py-3 px-4 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-medium text-sm shadow-lg shadow-rose-600/20 flex items-center justify-center gap-2 transition cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                <span>Smazat úplně všechny kusy</span>
              </button>

              <button
                onClick={() => setSelectedBookForDelete(null)}
                className="w-full py-2.5 px-4 rounded-xl text-slate-400 hover:text-white font-medium text-xs text-center transition cursor-pointer mt-1"
              >
                Zrušit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
