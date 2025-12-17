import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { storage, db } from '../config/firebase';

class LogoService {
    /**
     * Upload church logo to Firebase Storage
     */
    async uploadLogo(churchId: string, imageUri: string): Promise<string> {
        try {
            // Convert image URI to blob
            const response = await fetch(imageUri);
            const blob = await response.blob();

            // Create storage reference
            const storageRef = ref(storage, `logos/${churchId}.png`);

            // Upload blob to Firebase Storage
            await uploadBytes(storageRef, blob);

            // Get download URL
            const downloadUrl = await getDownloadURL(storageRef);

            // Update church settings in Firestore
            await updateDoc(doc(db, 'churches', churchId), {
                logoUrl: downloadUrl,
                updatedAt: new Date(),
            });

            console.log('Logo uploaded successfully:', downloadUrl);
            return downloadUrl;
        } catch (error) {
            console.error('Upload logo error:', error);
            throw error;
        }
    }

    /**
     * Delete church logo from Firebase Storage
     */
    async deleteLogo(churchId: string): Promise<void> {
        try {
            // Delete from Storage
            const storageRef = ref(storage, `logos/${churchId}.png`);
            await deleteObject(storageRef);

            // Remove URL from Firestore
            await updateDoc(doc(db, 'churches', churchId), {
                logoUrl: null,
                updatedAt: new Date(),
            });

            console.log('Logo deleted successfully');
        } catch (error) {
            console.error('Delete logo error:', error);
            throw error;
        }
    }

    /**
     * Get logo URL from Firestore
     */
    async getLogoUrl(churchId: string): Promise<string | null> {
        try {
            const churchDoc = await getDoc(doc(db, 'churches', churchId));

            if (churchDoc.exists()) {
                const data = churchDoc.data();
                return data.logoUrl || null;
            }

            return null;
        } catch (error) {
            console.error('Get logo URL error:', error);
            return null;
        }
    }

    /**
     * Check if logo exists
     */
    async hasLogo(churchId: string): Promise<boolean> {
        const logoUrl = await this.getLogoUrl(churchId);
        return !!logoUrl;
    }
}

export default new LogoService();
