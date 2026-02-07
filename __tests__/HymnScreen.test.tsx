import React from 'react';
import { render, waitFor } from '@testing-library/react-native';
import HymnScreen from '../src/screens/HymnScreen';
import { ThemeProvider } from '../src/contexts/ThemeContext';

jest.mock('../src/services/HymnService', () => ({
  __esModule: true,
  default: {
    getAllHymns: jest.fn(),
  },
}));

const hymnService = require('../src/services/HymnService').default;

describe('HymnScreen', () => {
  it('renders hymn list items', async () => {
    hymnService.getAllHymns.mockResolvedValue([
      { id: '1', number: 1, title: 'Amazing Grace', lyrics: 'Amazing grace...' },
    ]);

    const { getByText } = render(
      <ThemeProvider>
        <HymnScreen />
      </ThemeProvider>
    );

    await waitFor(() => {
      expect(getByText('Amazing Grace')).toBeTruthy();
    });
  });
});
