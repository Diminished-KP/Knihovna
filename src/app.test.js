import { describe, it, expect, beforeEach } from 'vitest';
import { normalizeIsbn } from './services/bookService';
import {
  getLibraryBooks,
  addBookToLibrary,
  decreaseBookCount,
  removeBookFromLibrary,
  clearLibrary
} from './services/storageService';

describe('Normalize ISBN', () => {
  it('cleans non-numeric characters except X', () => {
    expect(normalizeIsbn('978-80-207-1821-1')).toBe('9788020718211');
    expect(normalizeIsbn('0-385-47257-9')).toBe('0385472579');
    expect(normalizeIsbn('978 80 00 05882 5')).toBe('9788000058825');
  });
});

describe('Storage Service', () => {
  beforeEach(() => {
    clearLibrary();
  });

  it('adds book and updates count for duplicates', () => {
    const book1 = { isbn: '1234567890', title: 'Test Book 1' };
    addBookToLibrary(book1);

    let books = getLibraryBooks();
    expect(books.length).toBe(1);
    expect(books[0].count).toBe(1);

    // Add duplicate
    addBookToLibrary(book1);
    books = getLibraryBooks();
    expect(books.length).toBe(1);
    expect(books[0].count).toBe(2);
  });

  it('decreases count correctly and removes when count becomes 0', () => {
    const book1 = { isbn: '1234567890', title: 'Test Book 1' };
    addBookToLibrary(book1);
    addBookToLibrary(book1); // count = 2

    decreaseBookCount('1234567890');
    let books = getLibraryBooks();
    expect(books[0].count).toBe(1);

    decreaseBookCount('1234567890');
    books = getLibraryBooks();
    expect(books.length).toBe(0);
  });

  it('removes all copies of a book', () => {
    const book1 = { isbn: '1234567890', title: 'Test Book 1' };
    addBookToLibrary(book1);
    addBookToLibrary(book1); // count = 2

    removeBookFromLibrary('1234567890');
    const books = getLibraryBooks();
    expect(books.length).toBe(0);
  });
});
