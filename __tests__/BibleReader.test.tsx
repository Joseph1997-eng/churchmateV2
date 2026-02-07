import React from 'react';
import { render, waitFor } from '@testing-library/react-native';
import BibleReader from '../src/components/BibleReader';

jest.mock('../src/database/BibleDatabase', () => ({
  __esModule: true,
  default: {
    getBooks: jest.fn(),
    getVerses: jest.fn(),
    getBookmarks: jest.fn(),
    toggleBookmark: jest.fn(),
  },
}));

jest.mock('../src/contexts/AuthContext', () => ({
  useAuth: () => ({ user: { id: 'user-1' } }),
}));

jest.mock('../src/contexts/ThemeContext', () => ({
  useTheme: () => ({
    colors: {
      primary: '#000',
      surface: '#fff',
      border: '#ccc',
      text: '#111',
      textSecondary: '#666',
      background: '#fff',
      error: '#f00',
      success: '#0f0',
      secondary: '#00f',
    },
  }),
}));

jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useFocusEffect: (callback: () => void) => callback(),
}));

const bibleDatabase = require('../src/database/BibleDatabase').default;

describe('BibleReader', () => {
  it('renders verses from the database', async () => {
    bibleDatabase.getBooks.mockResolvedValue([
      { id: 1, name: 'Genesis', chapters: 1 },
    ]);
    bibleDatabase.getVerses.mockResolvedValue([
      {
        id: 1,
        bookId: 1,
        bookName: 'Genesis',
        chapter: 1,
        verse: 1,
        text: 'In the beginning...',
      },
    ]);
    bibleDatabase.getBookmarks.mockResolvedValue([]);

    const { getByText } = render(<BibleReader />);

    await waitFor(() => {
      expect(getByText('Book:')).toBeTruthy();
      expect(getByText('In the beginning...')).toBeTruthy();
    });
  });
});
