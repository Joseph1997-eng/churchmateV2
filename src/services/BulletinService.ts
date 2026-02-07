import {
    collection,
    query,
    getDocs,
    orderBy,
    where,
    Timestamp
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { BulletinItem } from '../types';
import { getCachedData, setCachedData } from '../utils/cache';

class BulletinService {
    private bulletinCollection = collection(db, 'bulletins');
    private readonly cacheKey = 'bulletins:week';
    private readonly cacheTTL = 1000 * 60 * 30; // 30 minutes

    /**
     * Get all bulletin items
     */
    async getAllBulletins(): Promise<BulletinItem[]> {
        try {
            const q = query(this.bulletinCollection, orderBy('date', 'desc'));
            const querySnapshot = await getDocs(q);

            return querySnapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    id: doc.id,
                    ...data,
                    date: data.date instanceof Timestamp ? data.date.toDate() : new Date(data.date)
                } as BulletinItem;
            });
        } catch (error) {
            console.error('Error fetching bulletins:', error);
            throw error;
        }
    }

    /**
     * Get current week's bulletins
     */
    async getCurrentWeekBulletins(): Promise<BulletinItem[]> {
        try {
            const now = new Date();
            const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

            const q = query(
                this.bulletinCollection,
                where('date', '>=', Timestamp.fromDate(weekAgo)),
                orderBy('date', 'desc')
            );

            const querySnapshot = await getDocs(q);

            const bulletins = querySnapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    id: doc.id,
                    ...data,
                    date: data.date instanceof Timestamp ? data.date.toDate() : new Date(data.date)
                } as BulletinItem;
            });
            await setCachedData(this.cacheKey, bulletins, this.cacheTTL);
            return bulletins;
        } catch (error) {
            console.error('Error fetching current week bulletins:', error);
            const cached = await getCachedData<BulletinItem[]>(this.cacheKey);
            if (cached) {
                return cached;
            }
            throw error;
        }
    }

    /**
     * Get bulletins by category
     */
    async getBulletinsByCategory(category: BulletinItem['category']): Promise<BulletinItem[]> {
        try {
            const q = query(
                this.bulletinCollection,
                where('category', '==', category),
                orderBy('date', 'desc')
            );

            const querySnapshot = await getDocs(q);

            return querySnapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    id: doc.id,
                    ...data,
                    date: data.date instanceof Timestamp ? data.date.toDate() : new Date(data.date)
                } as BulletinItem;
            });
        } catch (error) {
            console.error('Error fetching bulletins by category:', error);
            throw error;
        }
    }
}

export default new BulletinService();
