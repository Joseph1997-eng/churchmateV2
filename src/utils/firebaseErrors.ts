import { FirebaseError } from 'firebase/app';

export const getFirebaseErrorMessage = (error: unknown, fallback: string): string => {
    if (error instanceof FirebaseError) {
        switch (error.code) {
            case 'auth/email-already-in-use':
                return 'This email is already registered.';
            case 'auth/invalid-email':
                return 'Please enter a valid email address.';
            case 'auth/weak-password':
                return 'Password should be at least 6 characters.';
            case 'auth/user-not-found':
            case 'auth/wrong-password':
                return 'Invalid email or password.';
            case 'auth/too-many-requests':
                return 'Too many attempts. Please try again later.';
            default:
                return error.message || fallback;
        }
    }

    if (error instanceof Error) {
        return error.message || fallback;
    }

    return fallback;
};
