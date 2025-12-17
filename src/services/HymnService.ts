import {
    collection,
    query,
    getDocs,
    doc,
    getDoc,
    where,
    orderBy,
    onSnapshot,
    Unsubscribe
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { Hymn } from '../types';

class HymnService {
    private hymnsCollection = collection(db, 'hymns');

    /**
     * Get all hymns
     */
    async getAllHymns(): Promise<Hymn[]> {
        try {
            const q = query(this.hymnsCollection, orderBy('number', 'asc'));
            const querySnapshot = await getDocs(q);

            return querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            } as Hymn));
        } catch (error) {
            console.error('Error fetching hymns:', error);
            throw error;
        }
    }

    /**
     * Get a single hymn by ID
     */
    async getHymnById(id: string): Promise<Hymn | null> {
        try {
            const docRef = doc(db, 'hymns', id);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                return {
                    id: docSnap.id,
                    ...docSnap.data()
                } as Hymn;
            }

            return null;
        } catch (error) {
            console.error('Error fetching hymn:', error);
            throw error;
        }
    }

    /**
     * Search hymns by title or lyrics
     */
    async searchHymns(searchTerm: string): Promise<Hymn[]> {
        try {
            // Note: Firestore doesn't support full-text search natively
            // For production, consider using Algolia or similar
            // This is a simple client-side filter after fetching all hymns
            const allHymns = await this.getAllHymns();

            const searchLower = searchTerm.toLowerCase();
            return allHymns.filter(hymn =>
                hymn.title.toLowerCase().includes(searchLower) ||
                hymn.lyrics.toLowerCase().includes(searchLower) ||
                hymn.number.toString().includes(searchTerm)
            );
        } catch (error) {
            console.error('Error searching hymns:', error);
            throw error;
        }
    }

    /**
     * Get hymns by category
     */
    async getHymnsByCategory(category: string): Promise<Hymn[]> {
        try {
            const q = query(
                this.hymnsCollection,
                where('category', '==', category),
                orderBy('number', 'asc')
            );
            const querySnapshot = await getDocs(q);

            return querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            } as Hymn));
        } catch (error) {
            console.error('Error fetching hymns by category:', error);
            throw error;
        }
    }

    /**
     * Listen to real-time hymn updates
     */
    subscribeToHymns(callback: (hymns: Hymn[]) => void): Unsubscribe {
        const q = query(this.hymnsCollection, orderBy('number', 'asc'));

        return onSnapshot(q, (querySnapshot) => {
            const hymns = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            } as Hymn));

            callback(hymns);
        }, (error) => {
            console.error('Error in hymns subscription:', error);
        });
    }
}

export default new HymnService();
