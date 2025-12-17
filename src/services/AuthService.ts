import { initializeApp } from 'firebase/app';
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut as firebaseSignOut,
    updateProfile as firebaseUpdateProfile,
    User as FirebaseUser,
    onAuthStateChanged
} from 'firebase/auth';
import {
    doc,
    setDoc,
    getDoc,
    updateDoc,
    collection,
    addDoc,
    Timestamp
} from 'firebase/firestore';
import { User } from '../types';
import { auth, db } from '../config/firebase';

class AuthService {
    /**
     * Sign up new user with email and password
     */
    async signUp(email: string, password: string, displayName: string): Promise<User> {
        try {
            // Create user in Firebase Auth
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const { uid } = userCredential.user;

            // Update display name
            await firebaseUpdateProfile(userCredential.user, { displayName });

            // Create user document in Firestore (default role: user)
            const userData: User = {
                id: uid,
                email,
                displayName,
                role: 'user',
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            await setDoc(doc(db, 'users', uid), {
                ...userData,
                createdAt: Timestamp.fromDate(userData.createdAt),
                updatedAt: Timestamp.fromDate(userData.updatedAt),
            });

            return userData;
        } catch (error: any) {
            console.error('Sign up error:', error);
            throw new Error(error.message || 'Failed to sign up');
        }
    }

    /**
     * Sign in with email and password
     */
    async signIn(email: string, password: string): Promise<User> {
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const { uid } = userCredential.user;

            // Get user data from Firestore
            const userDoc = await getDoc(doc(db, 'users', uid));

            if (!userDoc.exists()) {
                throw new Error('User data not found');
            }

            const data = userDoc.data();
            return {
                ...data,
                createdAt: data.createdAt?.toDate() || new Date(),
                updatedAt: data.updatedAt?.toDate() || new Date(),
            } as User;
        } catch (error: any) {
            console.error('Sign in error:', error);
            throw new Error(error.message || 'Failed to sign in');
        }
    }

    /**
     * Sign out current user
     */
    async signOut(): Promise<void> {
        try {
            await firebaseSignOut(auth);
        } catch (error: any) {
            console.error('Sign out error:', error);
            throw new Error(error.message || 'Failed to sign out');
        }
    }

    /**
     * Get current user data from Firestore
     */
    async getCurrentUser(): Promise<User | null> {
        try {
            const currentUser = auth.currentUser;

            if (!currentUser) {
                return null;
            }

            const userDoc = await getDoc(doc(db, 'users', currentUser.uid));

            if (!userDoc.exists()) {
                return null;
            }

            const data = userDoc.data();
            return {
                ...data,
                createdAt: data.createdAt?.toDate() || new Date(),
                updatedAt: data.updatedAt?.toDate() || new Date(),
            } as User;
        } catch (error) {
            console.error('Get current user error:', error);
            return null;
        }
    }

    /**
     * Update user profile
     */
    async updateProfile(userId: string, data: Partial<User>): Promise<void> {
        try {
            await updateDoc(doc(db, 'users', userId), {
                ...data,
                updatedAt: Timestamp.now(),
            });

            // Update Firebase Auth profile if displayName or photoURL changed
            const currentUser = auth.currentUser;
            if (currentUser && (data.displayName || data.photoURL)) {
                await firebaseUpdateProfile(currentUser, {
                    displayName: data.displayName,
                    photoURL: data.photoURL,
                });
            }
        } catch (error: any) {
            console.error('Update profile error:', error);
            throw new Error(error.message || 'Failed to update profile');
        }
    }

    /**
     * Check if user is admin
     */
    async isAdmin(userId: string): Promise<boolean> {
        try {
            const userDoc = await getDoc(doc(db, 'users', userId));
            return userDoc.exists() && userDoc.data()?.role === 'admin';
        } catch (error) {
            console.error('Check admin error:', error);
            return false;
        }
    }

    /**
     * Promote user to admin (admin only)
     */
    async promoteToAdmin(userId: string, currentAdminId: string): Promise<void> {
        try {
            // Check if current user is admin
            const isCurrentUserAdmin = await this.isAdmin(currentAdminId);

            if (!isCurrentUserAdmin) {
                throw new Error('Only admins can promote users');
            }

            await updateDoc(doc(db, 'users', userId), {
                role: 'admin',
                updatedAt: Timestamp.now(),
            });

            // Log action
            await this.logAdminAction(
                currentAdminId,
                'promote_user',
                `Promoted user ${userId} to admin`
            );
        } catch (error: any) {
            console.error('Promote to admin error:', error);
            throw new Error(error.message || 'Failed to promote user');
        }
    }

    /**
     * Demote admin to user (admin only)
     */
    async demoteToUser(userId: string, currentAdminId: string): Promise<void> {
        try {
            // Check if current user is admin
            const isCurrentUserAdmin = await this.isAdmin(currentAdminId);

            if (!isCurrentUserAdmin) {
                throw new Error('Only admins can demote users');
            }

            await updateDoc(doc(db, 'users', userId), {
                role: 'user',
                updatedAt: Timestamp.now(),
            });

            // Log action
            await this.logAdminAction(
                currentAdminId,
                'demote_user',
                `Demoted user ${userId} to regular user`
            );
        } catch (error: any) {
            console.error('Demote to user error:', error);
            throw new Error(error.message || 'Failed to demote user');
        }
    }

    /**
     * Log admin actions
     */
    async logAdminAction(userId: string, action: string, details: string): Promise<void> {
        try {
            const user = await this.getCurrentUser();

            if (!user) {
                throw new Error('User not found');
            }

            await addDoc(collection(db, 'adminLogs'), {
                userId,
                userName: user.displayName,
                action,
                details,
                timestamp: Timestamp.now(),
            });
        } catch (error) {
            console.error('Log admin action error:', error);
            // Don't throw error for logging failures
        }
    }

    /**
     * Get Firebase Auth instance
     */
    getAuth() {
        return auth;
    }
}

export default new AuthService();
