import React from 'react';
import { Check, X, Book, AlertTriangle, ArrowLeft } from 'lucide-react';
import { isBookInLibrary, getBookFromLibrary } from '../services/storageService';

export default function BookPreview({ book, onAdd, onDiscard }) {
  if (!book) return null;

  const alreadyInLibrary = isBookInLibrary(book.isbn);
  const existingBook = alreadyInLibrary ? getBookFromLibrary(book.isbn) : null;
  const currentCount = existingBook ? existingBook.count : 0;

  return (
    <div className="flex flex-col min-h-screen max-w-md mx-auto px-4 py-6">
      {/* Horní lišta */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={onDiscard}
          className="flex items-center gap-2 px-3 py-2 text-sm text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700 rounded-lg border border-slate-700 transition cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Zpět na skener</span>
        </button>
        <span className="text-xs text-blue-400 font-medium bg-blue-950/60 px-3 py-1 rounded-full border border-blue-800/50">
          Nalezená kniha
        </span>
      </div>

      <div className="flex-1 flex flex-col justify-center">
        {/* Upozornění na duplicitu */}
        {alreadyInLibrary && (
          <div className="mb-4 p-4 rounded-xl bg-amber-950/40 border border-amber-500/40 text-amber-200 flex items-start gap-3 shadow-lg">
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-semibold text-amber-300">Tato kniha už je ve vaší knihovně.</p>
              <p className="text-xs text-amber-200/80 mt-1">
                V knihovně máte aktuálně <strong>{currentCount}x</strong> tento výtisk. Přidáním se počet zvýší na <strong>{currentCount + 1}x</strong>.
              </p>
            </div>
          </div>
        )}

        {/* Karta s informacemi o knize */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-2xl flex flex-col items-center text-center">
          {/* Obálka knihy */}
          <div className="relative w-36 h-52 mb-6 rounded-lg overflow-hidden bg-slate-950 border border-slate-700/80 shadow-xl flex items-center justify-center shrink-0">
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
            <div
              className={`flex flex-col items-center justify-center p-4 text-slate-500 ${book.cover ? 'hidden' : 'flex'}`}
            >
              <Book className="w-12 h-12 mb-2 stroke-1" />
              <span className="text-xs">Bez obálky</span>
            </div>
          </div>

          {/* Název knihy (velkým písmem) */}
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight leading-snug mb-3">
            {book.title}
          </h2>

          {/* Detailnější informace (menším písmem, s vynecháním dostupných polí) */}
          <div className="space-y-1.5 text-sm text-slate-300 w-full border-t border-slate-800/80 pt-4 mt-1">
            {book.author ? (
              <p className="font-medium text-slate-200">
                <span className="text-slate-400 text-xs uppercase tracking-wider block mb-0.5">Autor</span>
                {book.author}
              </p>
            ) : null}

            {book.publisher ? (
              <p className="text-xs text-slate-400 pt-1">
                <span className="text-slate-500">Nakladatelství:</span> {book.publisher}
              </p>
            ) : null}

            {book.year ? (
              <p className="text-xs text-slate-400">
                <span className="text-slate-500">Rok vydání:</span> {book.year}
              </p>
            ) : null}

            <p className="text-xs text-slate-500 font-mono pt-2">
              ISBN: {book.isbn}
            </p>
          </div>
        </div>
      </div>

      {/* Akční tlačítka - Zelené Přidat a Červené Zahodit */}
      <div className="grid grid-cols-2 gap-4 mt-6">
        <button
          onClick={onDiscard}
          className="flex items-center justify-center gap-2 py-4 px-4 rounded-xl bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-500/40 font-semibold transition transform active:scale-98 cursor-pointer"
        >
          <X className="w-5 h-5" />
          <span>Zahodit</span>
        </button>

        <button
          onClick={() => onAdd(book)}
          className="flex items-center justify-center gap-2 py-4 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold shadow-lg shadow-emerald-600/30 transition transform active:scale-98 cursor-pointer"
        >
          <Check className="w-5 h-5" />
          <span>Přidat do knihovny</span>
        </button>
      </div>
    </div>
  );
}
