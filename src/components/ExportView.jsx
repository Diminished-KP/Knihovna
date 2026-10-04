import React, { useState } from 'react';
import { ArrowLeft, Download, Share2, FileSpreadsheet, FileText, CheckCircle2 } from 'lucide-react';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { getLibraryBooks } from '../services/storageService';

export default function ExportView({ onNavigate }) {
  const [exportSuccessMsg, setExportSuccessMsg] = useState('');

  const books = getLibraryBooks();

  const handleExportExcel = (format = 'xlsx') => {
    if (books.length === 0) {
      alert('Knihovna je prázdná, není co exportovat.');
      return;
    }

    const exportData = books.map((b, idx) => ({
      'Číslo': idx + 1,
      'Název knihy': b.title || '',
      'Autor': b.author || '',
      'Rok vydání': b.year || '',
      'Nakladatelství': b.publisher || '',
      'ISBN': b.isbn || '',
      'Počet kusů': b.count || 1
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Knihy');

    const filename = `knihovna_seznam_${new Date().toISOString().slice(0, 10)}.${format}`;
    XLSX.writeFile(workbook, filename, { bookType: format === 'csv' ? 'csv' : 'xlsx' });

    setExportSuccessMsg(`Seznam byl úspěšně vyexportován jako .${format.toUpperCase()}`);
    setTimeout(() => setExportSuccessMsg(''), 4000);
  };

  const handleExportPdf = () => {
    if (books.length === 0) {
      alert('Knihovna je prázdná, není co exportovat.');
      return;
    }

    const doc = new jsPDF();

    // Nadpis a hlavička
    doc.setFontSize(18);
    doc.text('Seznam knih v osobní knihovně', 14, 20);
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Vygenerováno: ${new Date().toLocaleDateString('cs-CZ')} | Celkem titulů: ${books.length}`, 14, 27);

    // Tabulka
    const tableHeaders = [['#', 'Název knihy', 'Autor', 'Rok', 'Nakladatelství', 'ISBN', 'Ks']];
    const tableData = books.map((b, idx) => [
      idx + 1,
      b.title || '',
      b.author || '',
      b.year || '',
      b.publisher || '',
      b.isbn || '',
      `${b.count || 1}x`
    ]);

    doc.autoTable({
      head: tableHeaders,
      body: tableData,
      startY: 32,
      styles: { fontSize: 9, cellPadding: 3 },
      headStyles: { fillColor: [15, 23, 42], textColor: [255, 255, 255] },
      alternateRowStyles: { fillColor: [245, 247, 250] }
    });

    const filename = `knihovna_seznam_${new Date().toISOString().slice(0, 10)}.pdf`;
    doc.save(filename);

    setExportSuccessMsg('Seznam byl úspěšně vyexportován jako .PDF');
    setTimeout(() => setExportSuccessMsg(''), 4000);
  };

  const handleShare = async () => {
    if (navigator.share && books.length > 0) {
      const summary = books.map((b, i) => `${i + 1}. ${b.title} (${b.author || 'Neznámý autor'}) - ${b.count || 1}x`).join('\n');
      try {
        await navigator.share({
          title: 'Můj seznam knih',
          text: `Seznam knih v mé knihovně (${books.length} titulů):\n\n${summary}`
        });
      } catch (err) {
        console.warn('Sdílení bylo zrušeno nebo selhalo:', err);
      }
    } else {
      alert('Sdílení není v tomto prohlížeči podporováno.');
    }
  };

  return (
    <div className="flex flex-col min-h-screen max-w-md mx-auto px-4 py-6">
      {/* Horní lišta */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => onNavigate('main')}
          className="flex items-center gap-2 px-3 py-2 text-sm text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700 rounded-lg border border-slate-700 transition cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Hlavní menu</span>
        </button>
        <span className="text-xs text-emerald-400 font-medium bg-emerald-950/60 px-3 py-1 rounded-full border border-emerald-800/50">
          Export
        </span>
      </div>

      <div className="flex-1 flex flex-col justify-center">
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-2xl">
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-emerald-500/20 text-emerald-400 mb-3 border border-emerald-500/30">
              <Download className="w-7 h-7" />
            </div>
            <h2 className="text-2xl font-bold text-white">Export Seznamu Knih</h2>
            <p className="text-xs text-slate-400 mt-1">
              Vyberte formát a cíl pro vyexportování vašich {books.length} knih.
            </p>
          </div>

          {exportSuccessMsg && (
            <div className="mb-6 p-4 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-200 flex items-center gap-3 text-sm animate-in fade-in">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              <span>{exportSuccessMsg}</span>
            </div>
          )}

          <div className="space-y-3">
            {/* Excel / CSV */}
            <button
              onClick={() => handleExportExcel('xlsx')}
              className="w-full flex items-center justify-between p-4 rounded-xl bg-slate-800 hover:bg-slate-750 text-white font-medium border border-slate-700 transition cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <FileSpreadsheet className="w-5 h-5 text-emerald-400" />
                <div className="text-left">
                  <span className="block text-sm font-semibold">Excel tabulka (.xlsx)</span>
                  <span className="block text-xs text-slate-400">Vhodné pro MS Excel, Google Sheets</span>
                </div>
              </div>
              <Download className="w-4 h-4 text-slate-400" />
            </button>

            <button
              onClick={() => handleExportExcel('csv')}
              className="w-full flex items-center justify-between p-4 rounded-xl bg-slate-800 hover:bg-slate-750 text-white font-medium border border-slate-700 transition cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <FileSpreadsheet className="w-5 h-5 text-teal-400" />
                <div className="text-left">
                  <span className="block text-sm font-semibold">CSV Soubor (.csv)</span>
                  <span className="block text-xs text-slate-400">Univerzální tabulkový formát</span>
                </div>
              </div>
              <Download className="w-4 h-4 text-slate-400" />
            </button>

            {/* PDF */}
            <button
              onClick={handleExportPdf}
              className="w-full flex items-center justify-between p-4 rounded-xl bg-slate-800 hover:bg-slate-750 text-white font-medium border border-slate-700 transition cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-rose-400" />
                <div className="text-left">
                  <span className="block text-sm font-semibold">Dokument PDF (.pdf)</span>
                  <span className="block text-xs text-slate-400">Přehledná tisková sestava</span>
                </div>
              </div>
              <Download className="w-4 h-4 text-slate-400" />
            </button>

            {/* Web Share */}
            {typeof navigator !== 'undefined' && 'share' in navigator && (
              <button
                onClick={handleShare}
                className="w-full flex items-center justify-between p-4 rounded-xl bg-blue-950/60 hover:bg-blue-900/60 text-blue-200 font-medium border border-blue-800/60 transition cursor-pointer mt-2"
              >
                <div className="flex items-center gap-3">
                  <Share2 className="w-5 h-5 text-blue-400" />
                  <div className="text-left">
                    <span className="block text-sm font-semibold">Sdílet v telefonu</span>
                    <span className="block text-xs text-blue-300/80">Odeslat e-mailem, WhatsApp apod.</span>
                  </div>
                </div>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
