import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import BottomTabNavigator from './src/navigation/BottomTabNavigator';
import AuthNavigator from './src/navigation/AuthNavigator';
import { AuthProvider, useAuth } from './src/contexts/AuthContext';
import { ThemeProvider } from './src/contexts/ThemeContext';
import ErrorBoundary from './src/components/ErrorBoundary';
import BibleDatabase from './src/database/BibleDatabase';
import { isFirstLaunch, setFirstLaunchComplete } from './src/utils/firstLaunch';
import { theme } from './src/styles/theme';

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [loadingMessage, setLoadingMessage] = useState('Initializing...');

  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      setLoadingMessage('Initializing database...');

      // Initialize database
      await BibleDatabase.init();

      // Check if this is the first launch
      const firstLaunch = await isFirstLaunch();

      if (firstLaunch) {
        setLoadingMessage('First launch detected. Preparing Bible data...');
        console.log('First launch - Bible import will start');

        // Check if both Bibles are already seeded
        const myanmarSeeded = await BibleDatabase.isDatabaseSeeded('myanmar');
        const hakhaSeeded = await BibleDatabase.isDatabaseSeeded('hakha');

        if (!myanmarSeeded || !hakhaSeeded) {
          setLoadingMessage('Importing Bibles from XML files...');
          await seedSampleData();
        } else {
          console.log('Bibles already imported');
        }

        await setFirstLaunchComplete();
      }

      setLoadingMessage('Loading app...');

      // Small delay to show the loading message
      await new Promise(resolve => setTimeout(resolve, 500));

      setIsLoading(false);
    } catch (error) {
      console.error('Error initializing app:', error);
      console.error('Error details:', JSON.stringify(error, null, 2));
      if (error instanceof Error) {
        console.error('Error stack:', error.stack);
      }
      setLoadingMessage(`Error: ${error instanceof Error ? error.message : 'Unknown error'}. Please restart.`);
      // Don't set isLoading to false so user can see the error message
    }
  };

  const seedSampleData = async () => {
    // Sample data for testing - replace with actual XML parsing
    const sampleBooks = [
      { id: 1, name: 'Genesis', chapters: 50 },
      { id: 2, name: 'Exodus', chapters: 40 },
      { id: 3, name: 'Matthew', chapters: 28 },
      { id: 4, name: 'John', chapters: 21 },
    ];
    try {
      setLoadingMessage('Importing Myanmar Bible...');

      // Import both Bibles
      const { parseAllBibles } = await import('./src/utils/bibleParser');
      const { myanmar, hakha } = await parseAllBibles();

      // Seed Myanmar Bible
      setLoadingMessage(`Importing Myanmar Bible (${myanmar.verses.length} verses)...`);
      await BibleDatabase.seedDatabase('myanmar', myanmar.books, myanmar.verses);

      // Seed Hakha Bible
      setLoadingMessage(`Importing Hakha Bible (${hakha.verses.length} verses)...`);
      await BibleDatabase.seedDatabase('hakha', hakha.books, hakha.verses);

      setLoadingMessage('Bible import completed!');
      console.log('All Bibles imported successfully');
    } catch (error) {
      console.error('Error importing Bibles:', error);
      setLoadingMessage('Error importing Bibles. Using sample data...');

      // Fallback to sample data
      const sampleBooks = [
        { id: 1, name: 'Genesis', chapters: 50 },
        { id: 2, name: 'Exodus', chapters: 40 },
      ];

      const sampleVerses = [
        {
          id: 1,
          bookId: 1,
          bookName: 'Genesis',
          chapter: 1,
          verse: 1,
          text: 'In the beginning God created the heaven and the earth.',
        },
      ];

      await BibleDatabase.seedDatabase('hakha', sampleBooks, sampleVerses);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.appTitle}>Church Mate</Text>
        <ActivityIndicator size="large" color={theme.colors.primary} style={styles.loader} />
        <Text style={styles.loadingText}>{loadingMessage}</Text>
      </View>
    );
  }

  return (
    <ThemeProvider>
      <ErrorBoundary>
        <AuthProvider>
          <NavigationContainer>
            <StatusBar style="light" />
            <AppContent />
          </NavigationContainer>
        </AuthProvider>
      </ErrorBoundary>
    </ThemeProvider>
  );
}

function AppContent() {
  const { user, loading: authLoading } = useAuth();

  if (authLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.appTitle}>Church Mate</Text>
        <ActivityIndicator size="large" color={theme.colors.primary} style={styles.loader} />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  // Show auth screens if not logged in
  if (!user) {
    return <AuthNavigator />;
  }

  // Show main app if logged in
  return <BottomTabNavigator />;
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
  },
  appTitle: {
    fontSize: theme.typography.fontSize.xxxl,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.primary,
    marginBottom: theme.spacing.xl,
  },
  loader: {
    marginVertical: theme.spacing.lg,
  },
  loadingText: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.md,
  },
});
