import { collection, doc, setDoc, getDocs, deleteDoc, query, where, Timestamp } from 'firebase/firestore';
import { db } from '../config/firebase';
import { Bookmark } from '../types';

class BookmarkService {
    /**
     * Sync bookmark to Firebase
     */
    async syncBookmark(userId: string, verseId: number, note?: string): Promise<void> {
        try {
            await setDoc(
                doc(db, 'bookmarks', `${userId}_${verseId}`),
                {
                    userId,
                    verseId,
                    note: note || '',
                    createdAt: Timestamp.now(),
                }
            );
        } catch (error) {
            console.error('Sync bookmark error:', error);
            throw error;
        }
    }

    /**
     * Get all cloud bookmarks for a user
     */
    async getCloudBookmarks(userId: string): Promise<any[]> {
        try {
            const q = query(
                collection(db, 'bookmarks'),
                where('userId', '==', userId)
            );
            const snapshot = await getDocs(q);
            return snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
            }));
        } catch (error) {
            console.error('Get cloud bookmarks error:', error);
            throw error;
        }
    }

    /**
     * Remove bookmark from Firebase
     */
    async removeCloudBookmark(userId: string, verseId: number): Promise<void> {
        try {
            await deleteDoc(doc(db, 'bookmarks', `${userId}_${verseId}`));
        } catch (error) {
            console.error('Remove cloud bookmark error:', error);
            throw error;
        }
    }

    /**
     * Sync all local bookmarks to cloud
     */
    async syncAllBookmarks(bookmarks: Bookmark[]): Promise<void> {
        try {
            const promises = bookmarks.map(bookmark =>
                this.syncBookmark(bookmark.userId, bookmark.verseId, bookmark.note)
            );
            await Promise.all(promises);
        } catch (error) {
            console.error('Sync all bookmarks error:', error);
            throw error;
        }
    }
}

export default new BookmarkService();
