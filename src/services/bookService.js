/**
 * Služba pro získávání informací o knize podle ISBN z několika zdrojů:
 * 1. Knihovny.cz
 * 2. Google Books API
 * 3. Open Library API
 */

// Pomocná funkce pro vyčištění ISBN od pomlček a mezer
export function normalizeIsbn(isbn) {
  if (!isbn) return '';
  return isbn.replace(/[^0-9X]/gi, '').toUpperCase();
}

/**
 * 1. Knihovny.cz API
 */
async function fetchFromKnihovnyCz(isbn) {
  const cleanIsbn = normalizeIsbn(isbn);
  if (!cleanIsbn) return null;

  try {
    const url = `https://www.knihovny.cz/api/v1/search?lookfor=${encodeURIComponent(cleanIsbn)}&type=Isbn`;
    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json'
      }
    });

    if (!response.ok) return null;

    const data = await response.json();
    if (!data || !data.records || data.records.length === 0) {
      return null;
    }

    const rec = data.records[0];

    // Formátování dat z Knihovny.cz
    const title = rec.title || rec.shortTitle || null;
    let author = null;
    if (rec.authors) {
      if (typeof rec.authors === 'string') author = rec.authors;
      else if (Array.isArray(rec.authors)) {
        if (rec.authors.length > 0) {
          author = typeof rec.authors[0] === 'string' ? rec.authors[0] : rec.authors[0].name;
        }
      } else if (rec.authors.primary) {
        author = Object.keys(rec.authors.primary)[0] || null;
      }
    }

    const year = rec.publishDate || (rec.publicationDates && rec.publicationDates[0]) || null;
    let publisher = null;
    if (rec.publishers && rec.publishers.length > 0) {
      publisher = rec.publishers[0];
    } else if (rec.publisher) {
      publisher = rec.publisher;
    }

    let cover = null;
    if (rec.images && rec.images.medium) {
      cover = rec.images.medium;
    } else if (rec.cover) {
      cover = rec.cover;
    } else if (rec.id) {
      cover = `https://www.knihovny.cz/Cover/Show?id=${encodeURIComponent(rec.id)}&size=medium`;
    }

    if (!title) return null;

    return {
      title,
      author,
      year: year ? String(year) : null,
      publisher,
      cover,
      source: 'Knihovny.cz'
    };
  } catch (error) {
    console.warn('Chyba při načítání z Knihovny.cz:', error);
    return null;
  }
}

/**
 * 2. Google Books API
 */
async function fetchFromGoogleBooks(isbn) {
  const cleanIsbn = normalizeIsbn(isbn);
  if (!cleanIsbn) return null;

  try {
    const url = `https://www.googleapis.com/books/v1/volumes?q=isbn:${encodeURIComponent(cleanIsbn)}`;
    const response = await fetch(url);
    if (!response.ok) return null;

    const data = await response.json();
    if (!data.items || data.items.length === 0) return null;

    const volumeInfo = data.items[0].volumeInfo || {};
    const title = volumeInfo.title || null;
    const author = volumeInfo.authors ? volumeInfo.authors.join(', ') : null;
    const year = volumeInfo.publishedDate ? volumeInfo.publishedDate.substring(0, 4) : null;
    const publisher = volumeInfo.publisher || null;

    let cover = null;
    if (volumeInfo.imageLinks) {
      cover = volumeInfo.imageLinks.thumbnail || volumeInfo.imageLinks.smallThumbnail || null;
      if (cover && cover.startsWith('http:')) {
        cover = cover.replace('http:', 'https:');
      }
    }

    if (!title) return null;

    return {
      title,
      author,
      year,
      publisher,
      cover,
      source: 'Google Books'
    };
  } catch (error) {
    console.warn('Chyba při načítání z Google Books API:', error);
    return null;
  }
}

/**
 * 3. Open Library API
 */
async function fetchFromOpenLibrary(isbn) {
  const cleanIsbn = normalizeIsbn(isbn);
  if (!cleanIsbn) return null;

  try {
    const url = `https://openlibrary.org/api/books?bibkeys=ISBN:${cleanIsbn}&format=json&jscmd=data`;
    const response = await fetch(url);
    if (!response.ok) return null;

    const data = await response.json();
    const key = `ISBN:${cleanIsbn}`;
    if (!data[key]) return null;

    const book = data[key];
    const title = book.title || null;
    const author = book.authors ? book.authors.map(a => a.name).join(', ') : null;
    const year = book.publish_date ? book.publish_date.match(/\d{4}/)?.[0] || book.publish_date : null;
    const publisher = book.publishers ? book.publishers.map(p => p.name).join(', ') : null;

    let cover = null;
    if (book.cover) {
      cover = book.cover.medium || book.cover.large || book.cover.small || null;
    }

    if (!title) return null;

    return {
      title,
      author,
      year,
      publisher,
      cover,
      source: 'Open Library'
    };
  } catch (error) {
    console.warn('Chyba při načítání z Open Library API:', error);
    return null;
  }
}

/**
 * Hlavní exportovaná funkce pro hledání knihy.
 * Vyzkouší postupně zdroje v pořadí: Knihovny.cz -> Google Books API -> Open Library API
 * a pokud v prvním nalezeném zdroji chybí některé informace, zkusí je doplnit z dalších zdrojů.
 */
export async function fetchBookByIsbn(isbn) {
  const cleanIsbn = normalizeIsbn(isbn);
  if (!cleanIsbn) {
    throw new Error('Neplatné ISBN.');
  }

  // Spustíme požadavky postupně podle specifikace
  const res1 = await fetchFromKnihovnyCz(cleanIsbn);
  const res2 = await fetchFromGoogleBooks(cleanIsbn);
  const res3 = await fetchFromOpenLibrary(cleanIsbn);

  const sources = [res1, res2, res3].filter(Boolean);

  if (sources.length === 0) {
    return null;
  }

  // Sloučení informací: název a hlavní atributy z prvního funkčního zdroje, doplnění chybějících polí z ostatních
  const mergedBook = {
    isbn: cleanIsbn,
    title: sources.find(s => s.title)?.title || null,
    author: sources.find(s => s.author)?.author || null,
    year: sources.find(s => s.year)?.year || null,
    publisher: sources.find(s => s.publisher)?.publisher || null,
    cover: sources.find(s => s.cover)?.cover || null,
    sourcesUsed: sources.map(s => s.source)
  };

  if (!mergedBook.title) {
    return null;
  }

  return mergedBook;
}
