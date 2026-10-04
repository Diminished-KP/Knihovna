import React from 'react';
import { BookOpen, ScanLine, FileSpreadsheet } from 'lucide-react';

export default function MainMenu({ onNavigate, totalBooksCount }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] px-4 py-8 text-center">
      <div className="mb-8">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-blue-600/20 text-blue-400 mb-4 border border-blue-500/30 shadow-lg shadow-blue-500/10">
          <BookOpen className="w-10 h-10" />
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
          Knihovnický Skener
        </h1>
        <p className="text-slate-400 text-sm sm:text-base mt-2 max-w-sm mx-auto">
          Rychlé skenování čárových kódů, automatické načítání knih a správu osobní knihovny.
        </p>
      </div>

      <div className="w-full max-w-sm space-y-4">
        <button
          onClick={() => onNavigate('scanner')}
          className="w-full flex items-center justify-between px-6 py-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold shadow-lg shadow-blue-600/30 transition-all transform active:scale-98 cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <ScanLine className="w-6 h-6 text-blue-100" />
            <span className="text-lg">Skener čárových kódů</span>
          </div>
          <span className="text-xs bg-blue-700/60 text-blue-200 px-2.5 py-1 rounded-full border border-blue-400/30">
            Skenovat
          </span>
        </button>

        <button
          onClick={() => onNavigate('library')}
          className="w-full flex items-center justify-between px-6 py-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-100 font-semibold border border-slate-700/80 shadow-md transition-all transform active:scale-98 cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <BookOpen className="w-6 h-6 text-blue-400" />
            <span className="text-lg">Osobní knihovna</span>
          </div>
          <span className="text-xs bg-slate-700 text-slate-300 px-2.5 py-1 rounded-full font-medium">
            {totalBooksCount} {totalBooksCount === 1 ? 'kniha' : (totalBooksCount >= 2 && totalBooksCount <= 4) ? 'knihy' : 'knih'}
          </span>
        </button>

        <button
          onClick={() => onNavigate('export')}
          className="w-full flex items-center justify-between px-6 py-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-100 font-semibold border border-slate-700/80 shadow-md transition-all transform active:scale-98 cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <FileSpreadsheet className="w-6 h-6 text-emerald-400" />
            <span className="text-lg">Exportovat seznam</span>
          </div>
          <span className="text-xs bg-emerald-950/60 text-emerald-300 px-2.5 py-1 rounded-full border border-emerald-500/30">
            Excel / PDF
          </span>
        </button>
      </div>

      <footer className="mt-12 text-xs text-slate-500">
        PWA Aplikace pro knihovníky &bull; Verze 1.0
      </footer>
    </div>
  );
}
