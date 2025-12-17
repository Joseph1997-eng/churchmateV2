import AsyncStorage from '@react-native-async-storage/async-storage';

const FIRST_LAUNCH_KEY = '@church_mate_first_launch';

export async function isFirstLaunch(): Promise<boolean> {
    try {
        const hasLaunched = await AsyncStorage.getItem(FIRST_LAUNCH_KEY);
        return hasLaunched === null;
    } catch (error) {
        console.error('Error checking first launch:', error);
        return false;
    }
}

export async function setFirstLaunchComplete(): Promise<void> {
    try {
        await AsyncStorage.setItem(FIRST_LAUNCH_KEY, 'true');
    } catch (error) {
        console.error('Error setting first launch complete:', error);
    }
}
