import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import AuthService from '../services/AuthService';
import { User, AuthContextType } from '../types';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {
        // Subscribe to auth state changes
        const unsubscribe = onAuthStateChanged(AuthService.getAuth(), async (firebaseUser) => {
            if (firebaseUser) {
                try {
                    const userData = await AuthService.getCurrentUser();
                    setUser(userData);
                    setIsAdmin(userData?.role === 'admin');
                } catch (error) {
                    console.error('Error loading user data:', error);
                    setUser(null);
                    setIsAdmin(false);
                }
            } else {
                setUser(null);
                setIsAdmin(false);
            }
            setLoading(false);
        });

        // Cleanup subscription
        return unsubscribe;
    }, []);

    const signIn = async (email: string, password: string) => {
        try {
            const userData = await AuthService.signIn(email, password);
            setUser(userData);
            setIsAdmin(userData.role === 'admin');
        } catch (error) {
            console.error('Sign in error:', error);
            throw error;
        }
    };

    const signUp = async (email: string, password: string, displayName: string) => {
        try {
            const userData = await AuthService.signUp(email, password, displayName);
            setUser(userData);
            setIsAdmin(false); // New users are not admins by default
        } catch (error) {
            console.error('Sign up error:', error);
            throw error;
        }
    };

    const signOut = async () => {
        try {
            await AuthService.signOut();
            setUser(null);
            setIsAdmin(false);
        } catch (error) {
            console.error('Sign out error:', error);
            throw error;
        }
    };

    const updateProfile = async (data: Partial<User>) => {
        try {
            if (!user) {
                throw new Error('No user logged in');
            }

            await AuthService.updateProfile(user.id, data);
            const updatedUser = await AuthService.getCurrentUser();
            setUser(updatedUser);
        } catch (error) {
            console.error('Update profile error:', error);
            throw error;
        }
    };

    const value: AuthContextType = {
        user,
        loading,
        isAdmin,
        signIn,
        signUp,
        signOut,
        updateProfile,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

/**
 * Hook to use auth context
 * Must be used within AuthProvider
 */
export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);

    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }

    return context;
};

export default AuthContext;
