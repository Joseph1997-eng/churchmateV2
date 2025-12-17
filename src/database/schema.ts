// SQLite database schema for Bible data

export const CREATE_BOOKS_TABLE = `
  CREATE TABLE IF NOT EXISTS books (
    id INTEGER PRIMARY KEY,
    language TEXT NOT NULL DEFAULT 'hakha',
    name TEXT NOT NULL,
    chapters INTEGER NOT NULL,
    UNIQUE(language, name)
  );
`;

export const CREATE_VERSES_TABLE = `
  CREATE TABLE IF NOT EXISTS verses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    language TEXT NOT NULL DEFAULT 'hakha',
    book_id INTEGER NOT NULL,
    book_name TEXT NOT NULL,
    chapter INTEGER NOT NULL,
    verse INTEGER NOT NULL,
    text TEXT NOT NULL,
    UNIQUE(language, book_name, chapter, verse)
  );
`;

export const CREATE_INDEXES = `
  CREATE INDEX IF NOT EXISTS idx_verses_book_chapter ON verses(language, book_id, chapter);
  CREATE INDEX IF NOT EXISTS idx_verses_search ON verses(language, text);
  CREATE INDEX IF NOT EXISTS idx_books_language ON books(language);
`;

export const CREATE_BOOKMARKS_TABLE = `
  CREATE TABLE IF NOT EXISTS bookmarks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL,
    verse_id INTEGER NOT NULL,
    note TEXT,
    created_at INTEGER NOT NULL,
    FOREIGN KEY (verse_id) REFERENCES verses(id)
  );
`;

export const CREATE_BOOKMARK_INDEXES = `
  CREATE INDEX IF NOT EXISTS idx_bookmarks_user ON bookmarks(user_id);
  CREATE INDEX IF NOT EXISTS idx_bookmarks_verse ON bookmarks(verse_id);
  CREATE INDEX IF NOT EXISTS idx_bookmarks_user_verse ON bookmarks(user_id, verse_id);
`;

export const DROP_TABLES = `
  DROP TABLE IF EXISTS bookmarks;
  DROP TABLE IF EXISTS verses;
  DROP TABLE IF EXISTS books;
`;
