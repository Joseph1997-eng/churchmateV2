import React from 'react';
import { render, waitFor } from '@testing-library/react-native';
import BulletinScreen from '../src/screens/BulletinScreen';
import { ThemeProvider } from '../src/contexts/ThemeContext';

jest.mock('../src/services/BulletinService', () => ({
  __esModule: true,
  default: {
    getCurrentWeekBulletins: jest.fn(),
  },
}));

const bulletinService = require('../src/services/BulletinService').default;

describe('BulletinScreen', () => {
  it('renders bulletin entries', async () => {
    bulletinService.getCurrentWeekBulletins.mockResolvedValue([
      {
        id: 'b1',
        title: 'Sunday Service',
        description: 'Join us for worship.',
        date: new Date('2024-01-01'),
        category: 'announcement',
        priority: 'high',
      },
    ]);

    const { getByText } = render(
      <ThemeProvider>
        <BulletinScreen />
      </ThemeProvider>
    );

    await waitFor(() => {
      expect(getByText("This Week's Bulletin")).toBeTruthy();
      expect(getByText('Sunday Service')).toBeTruthy();
    });
  });
});
