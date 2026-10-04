const STORAGE_KEY = 'knihovna_books_v1';

export function getLibraryBooks() {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (err) {
    console.error('Chyba při čtení knihovny z localStorage:', err);
    return [];
  }
}

export function saveLibraryBooks(books) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(books));
  } catch (err) {
    console.error('Chyba při ukládání knihovny do localStorage:', err);
  }
}

export function isBookInLibrary(isbn) {
  const books = getLibraryBooks();
  return books.some(b => b.isbn === isbn);
}

export function getBookFromLibrary(isbn) {
  const books = getLibraryBooks();
  return books.find(b => b.isbn === isbn);
}

export function addBookToLibrary(book) {
  const books = getLibraryBooks();
  const existingIndex = books.findIndex(b => b.isbn === book.isbn);

  if (existingIndex >= 0) {
    books[existingIndex].count = (books[existingIndex].count || 1) + 1;
    // Aktualizujeme případné doplněné informace
    if (!books[existingIndex].cover && book.cover) books[existingIndex].cover = book.cover;
    if (!books[existingIndex].author && book.author) books[existingIndex].author = book.author;
  } else {
    books.push({
      ...book,
      count: 1,
      addedAt: new Date().toISOString()
    });
  }

  saveLibraryBooks(books);
  return books;
}

export function decreaseBookCount(isbn) {
  let books = getLibraryBooks();
  const existingIndex = books.findIndex(b => b.isbn === isbn);

  if (existingIndex >= 0) {
    if (books[existingIndex].count > 1) {
      books[existingIndex].count -= 1;
    } else {
      books = books.filter(b => b.isbn !== isbn);
    }
    saveLibraryBooks(books);
  }
  return books;
}

export function removeBookFromLibrary(isbn) {
  const books = getLibraryBooks().filter(b => b.isbn !== isbn);
  saveLibraryBooks(books);
  return books;
}

export function clearLibrary() {
  localStorage.removeItem(STORAGE_KEY);
  return [];
}
