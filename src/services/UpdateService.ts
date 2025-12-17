import * as Updates from 'expo-updates';
import { Alert } from 'react-native';

/**
 * UpdateService - Handles over-the-air (OTA) updates using Expo Updates
 * 
 * Features:
 * - Check for available updates
 * - Download and apply updates
 * - User prompts for update installation
 * - Get current update information
 */
class UpdateService {
    /**
     * Check if an update is available
     * @returns Promise<boolean> - True if update is available
     */
    async checkForUpdates(): Promise<boolean> {
        if (!Updates.isEnabled) {
            console.log('Updates are not enabled');
            return false;
        }

        try {
            const update = await Updates.checkForUpdateAsync();
            if (update.isAvailable) {
                console.log('Update available:', update.manifest);
                return true;
            }
            console.log('No updates available');
            return false;
        } catch (error) {
            console.error('Update check failed:', error);
            return false;
        }
    }

    /**
     * Fetch and apply available update
     * @returns Promise<void>
     */
    async fetchAndApplyUpdate(): Promise<void> {
        try {
            const update = await Updates.fetchUpdateAsync();
            if (update.isNew) {
                console.log('New update downloaded, reloading app...');
                await Updates.reloadAsync();
            }
        } catch (error) {
            console.error('Update fetch failed:', error);
            throw error;
        }
    }

    /**
     * Check for updates and prompt user to install
     * @returns Promise<void>
     */
    async checkAndPromptUpdate(): Promise<void> {
        const hasUpdate = await this.checkForUpdates();

        if (hasUpdate) {
            Alert.alert(
                'Update Available',
                'A new version of Church Mate is available. Would you like to update now?',
                [
                    {
                        text: 'Later',
                        style: 'cancel',
                        onPress: () => console.log('Update postponed')
                    },
                    {
                        text: 'Update Now',
                        onPress: async () => {
                            try {
                                await this.fetchAndApplyUpdate();
                            } catch (error) {
                                Alert.alert(
                                    'Update Failed',
                                    'Failed to download update. Please try again later.',
                                    [{ text: 'OK' }]
                                );
                            }
                        }
                    }
                ]
            );
        }
    }

    /**
     * Get current update information
     * @returns Object with update details
     */
    getCurrentUpdateInfo() {
        return {
            isEnabled: Updates.isEnabled,
            updateId: Updates.updateId,
            createdAt: Updates.createdAt,
            runtimeVersion: Updates.runtimeVersion,
            channel: Updates.channel,
        };
    }

    /**
     * Log current update status
     */
    logUpdateStatus() {
        const info = this.getCurrentUpdateInfo();
        console.log('=== Update Status ===');
        console.log('Enabled:', info.isEnabled);
        console.log('Update ID:', info.updateId);
        console.log('Created At:', info.createdAt);
        console.log('Runtime Version:', info.runtimeVersion);
        console.log('Channel:', info.channel);
        console.log('====================');
    }
}

export default new UpdateService();
