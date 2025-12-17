import * as SQLite from 'expo-sqlite';
import { BibleBook, BibleVerse, Bookmark } from '../types';
import {
    CREATE_BOOKS_TABLE,
    CREATE_VERSES_TABLE,
    CREATE_INDEXES,
    CREATE_BOOKMARKS_TABLE,
    CREATE_BOOKMARK_INDEXES
} from './schema';

const CURRENT_SCHEMA_VERSION = 2; // Increment when schema changes

class BibleDatabase {
    private db: SQLite.SQLiteDatabase | null = null;

    async init(): Promise<void> {
        try {
            this.db = await SQLite.openDatabaseAsync('church.db');

            // Get current schema version
            const currentVersion = await this.getSchemaVersion();
            console.log(`Current schema version: ${currentVersion}`);

            if (currentVersion < CURRENT_SCHEMA_VERSION) {
                // Migration needed
                await this.migrateSchema(currentVersion, CURRENT_SCHEMA_VERSION);
            } else {
                // Just ensure tables exist (no data loss)
                await this.createTables();
            }

            console.log('Bible database initialized successfully');
        } catch (error) {
            console.error('Error initializing database:', error);
            throw error;
        }
    }

    private async getSchemaVersion(): Promise<number> {
        if (!this.db) return 0;

        try {
            // Create version table if doesn't exist
            await this.db.execAsync(`
                CREATE TABLE IF NOT EXISTS schema_version (
                    version INTEGER PRIMARY KEY
                )
            `);

            const result = await this.db.getFirstAsync<{ version: number }>(
                'SELECT version FROM schema_version LIMIT 1'
            );

            return result?.version || 0;
        } catch (error) {
            console.error('Error getting schema version:', error);
            return 0;
        }
    }

    private async migrateSchema(from: number, to: number): Promise<void> {
        if (!this.db) throw new Error('Database not initialized');

        console.log(`Migrating schema from v${from} to v${to}`);

        try {
            // Migration v0 -> v1: Initial schema (books + verses)
            if (from < 1) {
                console.log('Migration v0->v1: Creating initial schema');
                await this.db.execAsync('DROP TABLE IF EXISTS verses');
                await this.db.execAsync('DROP TABLE IF EXISTS books');
                await this.db.execAsync(CREATE_BOOKS_TABLE);
                await this.db.execAsync(CREATE_VERSES_TABLE);
                await this.db.execAsync(CREATE_INDEXES);
            }

            // Migration v1 -> v2: Add bookmarks table (Phase 3A)
            if (from < 2) {
                console.log('Migration v1->v2: Adding bookmarks table');
                // Don't drop existing tables, just add new one
                await this.db.execAsync(CREATE_BOOKMARKS_TABLE);
                await this.db.execAsync(CREATE_BOOKMARK_INDEXES);
            }

            // Update version
            await this.db.execAsync('DELETE FROM schema_version');
            await this.db.execAsync(`INSERT INTO schema_version (version) VALUES (${to})`);

            console.log(`Schema migration completed: v${from} -> v${to}`);
        } catch (error) {
            console.error('Schema migration error:', error);
            throw error;
        }
    }

    private async createTables(): Promise<void> {
        if (!this.db) throw new Error('Database not initialized');

        // Create tables if they don't exist (idempotent)
        await this.db.execAsync(CREATE_BOOKS_TABLE);
        await this.db.execAsync(CREATE_VERSES_TABLE);
        await this.db.execAsync(CREATE_INDEXES);
        await this.db.execAsync(CREATE_BOOKMARKS_TABLE);
        await this.db.execAsync(CREATE_BOOKMARK_INDEXES);
    }

    async isDatabaseSeeded(language: string = 'hakha'): Promise<boolean> {
        if (!this.db) return false;

        try {
            const result = await this.db.getFirstAsync<{ count: number }>(
                'SELECT COUNT(*) as count FROM books WHERE language = ?',
                [language]
            );
            return (result?.count ?? 0) > 0;
        } catch (error) {
            return false;
        }
    }

    async seedDatabase(
        language: string,
        books: BibleBook[],
        verses: BibleVerse[]
    ): Promise<void> {
        if (!this.db) throw new Error('Database not initialized');

        console.log(`Starting ${language} Bible database seeding...`);

        try {
            // Insert books
            for (const book of books) {
                await this.db.runAsync(
                    'INSERT OR REPLACE INTO books (id, language, name, chapters) VALUES (?, ?, ?, ?)',
                    [book.id, language, book.name, book.chapters]
                );
            }

            // Insert verses in batches for better performance
            const batchSize = 2000; // Increased from 500 for faster import
            for (let i = 0; i < verses.length; i += batchSize) {
                const batch = verses.slice(i, i + batchSize);

                for (const verse of batch) {
                    await this.db.runAsync(
                        'INSERT OR REPLACE INTO verses (language, book_id, book_name, chapter, verse, text) VALUES (?, ?, ?, ?, ?, ?)',
                        [language, verse.bookId, verse.bookName, verse.chapter, verse.verse, verse.text]
                    );
                }

                console.log(`Seeded ${Math.min(i + batchSize, verses.length)} / ${verses.length} ${language} verses`);
            }

            console.log(`${language} Bible database seeding completed successfully`);
        } catch (error) {
            console.error(`Error seeding ${language} database:`, error);
            throw error;
        }
    }

    async getBooks(language: string = 'hakha'): Promise<BibleBook[]> {
        if (!this.db) throw new Error('Database not initialized');

        const results = await this.db.getAllAsync<BibleBook>(
            'SELECT id, name, chapters FROM books WHERE language = ? ORDER BY id',
            [language]
        );

        return results;
    }

    async getVerses(bookId: number, chapter: number, language: string = 'hakha'): Promise<BibleVerse[]> {
        if (!this.db) throw new Error('Database not initialized');

        const results = await this.db.getAllAsync<any>(
            `SELECT v.id, v.book_id as bookId, v.book_name as bookName, v.chapter, v.verse, v.text 
       FROM verses v 
       WHERE v.language = ? AND v.book_id = ? AND v.chapter = ? 
       ORDER BY v.verse`,
            [language, bookId, chapter]
        );

        return results;
    }

    async getAvailableLanguages(): Promise<string[]> {
        if (!this.db) throw new Error('Database not initialized');

        const results = await this.db.getAllAsync<{ language: string }>(
            'SELECT DISTINCT language FROM books ORDER BY language'
        );

        return results.map(r => r.language);
    }

    // ============================================
    // Search Methods (Phase 3A)
    // ============================================

    async searchVerses(
        query: string,
        language: 'myanmar' | 'hakha',
        bookId?: number
    ): Promise<BibleVerse[]> {
        if (!this.db) throw new Error('Database not initialized');

        let sql = `
            SELECT id, book_id as bookId, book_name as bookName, chapter, verse, text
            FROM verses
            WHERE language = ? AND text LIKE ?
        `;
        const params: any[] = [language, `%${query}%`];

        if (bookId) {
            sql += ' AND book_id = ?';
            params.push(bookId);
        }

        sql += ' ORDER BY book_id, chapter, verse LIMIT 100';

        const results = await this.db.getAllAsync<BibleVerse>(sql, params);
        return results;
    }

    // ============================================
    // Bookmark Methods (Phase 3A)
    // ============================================

    async addBookmark(
        userId: string,
        verseId: number,
        note?: string
    ): Promise<number> {
        if (!this.db) throw new Error('Database not initialized');

        const result = await this.db.runAsync(
            `INSERT INTO bookmarks (user_id, verse_id, note, created_at) 
             VALUES (?, ?, ?, ?)`,
            [userId, verseId, note || '', Date.now()]
        );

        return result.lastInsertRowId;
    }

    async getBookmarks(userId: string): Promise<Bookmark[]> {
        if (!this.db) throw new Error('Database not initialized');

        const results = await this.db.getAllAsync<any>(
            `SELECT 
                b.id, b.user_id as userId, b.verse_id as verseId, b.note, b.created_at as createdAt,
                v.id as verse_id, v.book_id as verse_bookId, v.book_name as verse_bookName, 
                v.chapter as verse_chapter, v.verse as verse_verse, v.text as verse_text
             FROM bookmarks b
             JOIN verses v ON b.verse_id = v.id
             WHERE b.user_id = ?
             ORDER BY b.created_at DESC`,
            [userId]
        );

        // Transform results to match Bookmark interface
        return results.map(r => ({
            id: r.id,
            userId: r.userId,
            verseId: r.verseId,
            note: r.note,
            createdAt: r.createdAt,
            verse: {
                id: r.verse_id,
                bookId: r.verse_bookId,
                bookName: r.verse_bookName,
                chapter: r.verse_chapter,
                verse: r.verse_verse,
                text: r.verse_text,
            }
        }));
    }

    async removeBookmark(bookmarkId: number): Promise<void> {
        if (!this.db) throw new Error('Database not initialized');

        await this.db.runAsync('DELETE FROM bookmarks WHERE id = ?', [bookmarkId]);
    }

    async isBookmarked(userId: string, verseId: number): Promise<boolean> {
        if (!this.db) throw new Error('Database not initialized');

        const result = await this.db.getFirstAsync<{ id: number }>(
            'SELECT id FROM bookmarks WHERE user_id = ? AND verse_id = ?',
            [userId, verseId]
        );

        return !!result;
    }

    async toggleBookmark(userId: string, verseId: number, note?: string): Promise<boolean> {
        const isBookmarked = await this.isBookmarked(userId, verseId);

        if (isBookmarked) {
            // Remove bookmark
            await this.db!.runAsync(
                'DELETE FROM bookmarks WHERE user_id = ? AND verse_id = ?',
                [userId, verseId]
            );
            return false;
        } else {
            // Add bookmark
            await this.addBookmark(userId, verseId, note);
            return true;
        }
    }
}

export default new BibleDatabase();
