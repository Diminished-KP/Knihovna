import React, { useState, useEffect, useRef } from 'react';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import { ArrowLeft, Keyboard, Camera, Loader2, AlertCircle } from 'lucide-react';
import { fetchBookByIsbn, normalizeIsbn } from '../services/bookService';

export default function ScannerView({ onNavigate, onBookFound, onErrorFound }) {
  const [manualIsbn, setManualIsbn] = useState('');
  const [showManualInput, setShowManualInput] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [cameraError, setCameraError] = useState(null);

  const scannerRef = useRef(null);
  const html5QrcodeScannerRef = useRef(null);

  useEffect(() => {
    let isMounted = true;

    async function startScanner() {
      try {
        const devices = await Html5Qrcode.getCameras();
        if (!isMounted) return;

        if (devices && devices.length > 0) {
          const html5Qrcode = new Html5Qrcode("reader");
          html5QrcodeScannerRef.current = html5Qrcode;

          const config = {
            fps: 10,
            qrbox: { width: 280, height: 180 },
            formatsToSupport: [
              Html5QrcodeSupportedFormats.EAN_13,
              Html5QrcodeSupportedFormats.EAN_8,
              Html5QrcodeSupportedFormats.CODE_128,
              Html5QrcodeSupportedFormats.UPC_A,
              Html5QrcodeSupportedFormats.UPC_E
            ]
          };

          // Použijeme zadní kameru ('environment')
          await html5Qrcode.start(
            { facingMode: "environment" },
            config,
            async (decodedText) => {
              if (html5Qrcode.isScanning) {
                await html5Qrcode.stop();
              }
              handleProcessIsbn(decodedText);
            },
            () => {
              // Ignorujeme běžné rámečky bez kódů
            }
          );
        } else {
          setCameraError('Kamera nebyla v zařízení nalezena.');
        }
      } catch (err) {
        if (isMounted) {
          console.warn('Nelze spustit kameru:', err);
          setCameraError('Chyba při spuštění kamery. Povolte přístup k fotoaparátu.');
        }
      }
    }

    if (!showManualInput && !isLoading) {
      startScanner();
    }

    return () => {
      isMounted = false;
      if (html5QrcodeScannerRef.current) {
        try {
          if (html5QrcodeScannerRef.current.isScanning) {
            html5QrcodeScannerRef.current.stop().catch(err => console.error(err));
          }
        } catch (e) {
          console.error(e);
        }
      }
    };
  }, [showManualInput]);

  const handleProcessIsbn = async (rawIsbn) => {
    const cleanIsbn = normalizeIsbn(rawIsbn);
    if (!cleanIsbn || cleanIsbn.length < 9) {
      setErrorMessage('Zadaný čárový kód nebo ISBN je neplatný.');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');

    try {
      if (html5QrcodeScannerRef.current && html5QrcodeScannerRef.current.isScanning) {
        await html5QrcodeScannerRef.current.stop();
      }
    } catch (e) {
      console.error(e);
    }

    try {
      const book = await fetchBookByIsbn(cleanIsbn);
      setIsLoading(false);

      if (book) {
        onBookFound(book);
      } else {
        // Pokud číslo ISBN nebo čárový kód nebude nalezen, vyhodíš chybovou hlášku a vrátíš uživatele na skener
        onErrorFound(`Kniha s ISBN / čárovým kódem "${cleanIsbn}" nebyla v žádné databázi nalezena.`);
      }
    } catch (err) {
      setIsLoading(false);
      onErrorFound('Při vyhledávání knihy došlo k chybě. Zkontrolujte připojení k internetu.');
    }
  };

  const handleManualSubmit = (e) => {
    e.preventDefault();
    if (manualIsbn.trim()) {
      handleProcessIsbn(manualIsbn);
    }
  };

  return (
    <div className="flex flex-col min-h-screen max-w-md mx-auto px-4 py-6">
      {/* Horní hlavička */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => onNavigate('main')}
          className="flex items-center gap-2 px-3 py-2 text-sm text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700 rounded-lg border border-slate-700 transition cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Hlavní menu</span>
        </button>
        <span className="text-xs text-blue-400 font-medium bg-blue-950/60 px-3 py-1 rounded-full border border-blue-800/50">
          Skener ISBN
        </span>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center p-8 text-center bg-slate-900/90 border border-slate-800 rounded-2xl w-full">
            <Loader2 className="w-12 h-12 text-blue-500 animate-spin mb-4" />
            <h3 className="text-lg font-semibold text-white">Vyhledávám knihu...</h3>
            <p className="text-sm text-slate-400 mt-1">
              Prohledávám Knihovny.cz, Google Books a Open Library
            </p>
          </div>
        ) : (
          <div className="w-full flex flex-col items-center">
            {/* Skenovací okno nebo manuální zadání */}
            {!showManualInput ? (
              <div className="w-full flex flex-col items-center">
                <div className="relative w-full overflow-hidden rounded-2xl border-2 border-blue-500/40 bg-slate-950 shadow-2xl">
                  <div id="reader" className="w-full min-h-[280px]"></div>

                  {cameraError && (
                    <div className="p-6 text-center text-slate-300 flex flex-col items-center justify-center">
                      <Camera className="w-10 h-10 text-slate-500 mb-2" />
                      <p className="text-sm">{cameraError}</p>
                      <p className="text-xs text-slate-500 mt-2">
                        Použijte prosím možnost ručního zadání ISBN níže.
                      </p>
                    </div>
                  )}
                </div>

                <p className="text-xs text-slate-400 text-center mt-3">
                  Namiřte fotoaparát na čárový kód na obálce knihy
                </p>
              </div>
            ) : (
              <form onSubmit={handleManualSubmit} className="w-full bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl">
                <h2 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                  <Keyboard className="w-5 h-5 text-blue-400" />
                  Ruční zadání ISBN
                </h2>
                <p className="text-xs text-slate-400 mb-4">
                  Zadejte 10 nebo 13-místné ISBN číslo knihy.
                </p>

                <input
                  type="text"
                  placeholder="např. 9788020718211"
                  value={manualIsbn}
                  onChange={(e) => setManualIsbn(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 text-lg tracking-wider mb-4"
                  autoFocus
                />

                {errorMessage && (
                  <div className="flex items-center gap-2 text-rose-400 text-xs mb-4 bg-rose-950/40 border border-rose-800/50 p-3 rounded-lg">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setShowManualInput(false)}
                    className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl border border-slate-700 text-sm transition cursor-pointer"
                  >
                    Zapnout kameru
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl text-sm transition cursor-pointer shadow-lg shadow-blue-600/20"
                  >
                    Vyhledat knihu
                  </button>
                </div>
              </form>
            )}

            {/* Tlačítko na přepnutí ručního zadaní */}
            {!showManualInput && (
              <button
                onClick={() => setShowManualInput(true)}
                className="mt-6 flex items-center justify-center gap-2 w-full py-3 px-4 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-slate-200 font-medium text-sm transition cursor-pointer shadow-md"
              >
                <Keyboard className="w-4 h-4 text-blue-400" />
                <span>Zadat ISBN číslo ručně</span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
