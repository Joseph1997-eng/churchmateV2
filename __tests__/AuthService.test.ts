import AuthService from '../src/services/AuthService';

jest.mock('firebase/auth', () => ({
  createUserWithEmailAndPassword: jest.fn(),
  signInWithEmailAndPassword: jest.fn(),
  signOut: jest.fn(),
  updateProfile: jest.fn(),
}));

jest.mock('firebase/firestore', () => ({
  doc: jest.fn(),
  setDoc: jest.fn(),
  getDoc: jest.fn(),
  updateDoc: jest.fn(),
  collection: jest.fn(),
  addDoc: jest.fn(),
  Timestamp: {
    fromDate: (date: Date) => ({ toDate: () => date }),
    now: () => ({ toDate: () => new Date() }),
  },
}));

jest.mock('../src/config/firebase', () => ({
  auth: { currentUser: { uid: 'user-1' } },
  db: {},
}));

const authModule = require('firebase/auth');
const firestoreModule = require('firebase/firestore');

describe('AuthService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('signs in and returns user data', async () => {
    authModule.signInWithEmailAndPassword.mockResolvedValue({
      user: { uid: 'user-1' },
    });
    firestoreModule.getDoc.mockResolvedValue({
      exists: () => true,
      data: () => ({
        id: 'user-1',
        email: 'test@example.com',
        displayName: 'Test User',
        role: 'user',
        createdAt: { toDate: () => new Date('2024-01-01') },
        updatedAt: { toDate: () => new Date('2024-01-02') },
      }),
    });

    const result = await AuthService.signIn('test@example.com', 'password');

    expect(result.email).toBe('test@example.com');
    expect(authModule.signInWithEmailAndPassword).toHaveBeenCalled();
  });

  it('signs up and creates a user document', async () => {
    authModule.createUserWithEmailAndPassword.mockResolvedValue({
      user: { uid: 'user-2' },
    });

    const result = await AuthService.signUp('new@example.com', 'password', 'New User');

    expect(result.displayName).toBe('New User');
    expect(firestoreModule.setDoc).toHaveBeenCalled();
  });
});
