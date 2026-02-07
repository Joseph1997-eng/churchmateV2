import AsyncStorage from '@react-native-async-storage/async-storage';

interface CacheEntry<T> {
    data: T;
    timestamp: number;
    ttl: number;
}

const CACHE_PREFIX = '@cache:';

const getCacheKey = (key: string) => `${CACHE_PREFIX}${key}`;

export async function setCachedData<T>(key: string, data: T, ttl: number): Promise<void> {
    const entry: CacheEntry<T> = {
        data,
        timestamp: Date.now(),
        ttl,
    };

    await AsyncStorage.setItem(getCacheKey(key), JSON.stringify(entry));
}

export async function getCachedData<T>(key: string): Promise<T | null> {
    const raw = await AsyncStorage.getItem(getCacheKey(key));
    if (!raw) return null;

    try {
        const entry = JSON.parse(raw) as CacheEntry<T>;
        if (!entry.timestamp || !entry.ttl) {
            return null;
        }
        if (Date.now() - entry.timestamp > entry.ttl) {
            await AsyncStorage.removeItem(getCacheKey(key));
            return null;
        }
        return entry.data;
    } catch (error) {
        console.error('Cache parse error:', error);
        return null;
    }
}

export async function clearCachedData(key: string): Promise<void> {
    await AsyncStorage.removeItem(getCacheKey(key));
}
