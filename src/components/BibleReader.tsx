import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    ScrollView,
    StyleSheet,
    ActivityIndicator,
    TouchableOpacity,
    Alert,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Picker } from '@react-native-picker/picker';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import BibleDatabase from '../database/BibleDatabase';
import { BibleBook, BibleVerse } from '../types';
import { theme } from '../styles/theme';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';

const LANGUAGE_STORAGE_KEY = '@bible_language';

interface BibleReaderProps {
    route?: any;
}

export default function BibleReader({ route }: BibleReaderProps = {}) {
    const { user } = useAuth();
    const { colors } = useTheme();
    const [language, setLanguage] = useState<'myanmar' | 'hakha'>('hakha');
    const [books, setBooks] = useState<BibleBook[]>([]);
    const [selectedBook, setSelectedBook] = useState<number | null>(null);
    const [selectedChapter, setSelectedChapter] = useState<number>(1);
    const [verses, setVerses] = useState<BibleVerse[]>([]);
    const [loading, setLoading] = useState(true);
    const [bookmarkedVerses, setBookmarkedVerses] = useState<Set<number>>(new Set());

    // Load saved language preference
    useEffect(() => {
        loadLanguage();
    }, []);

    // Load books when language changes
    useEffect(() => {
        if (language) {
            loadBooks();
        }
    }, [language]);

    // Handle navigation params from search
    useEffect(() => {
        if (route?.params?.bookId && books.length > 0) {
            const { bookId, chapter } = route.params;
            setSelectedBook(bookId);
            setSelectedChapter(chapter || 1);
        }
    }, [route?.params, books]);

    const highlightVerse = route?.params?.highlightVerse;

    // Load verses when book or chapter changes
    useEffect(() => {
        if (selectedBook !== null) {
            loadVerses(selectedBook, selectedChapter);
        }
    }, [selectedBook, selectedChapter, language]);

    // Load bookmarks when user or verses change
    useEffect(() => {
        if (user) {
            loadBookmarks();
        }
    }, [user, verses]);

    // Reload bookmarks when tab is focused (to sync with Bookmarks tab)
    useFocusEffect(
        React.useCallback(() => {
            if (user) {
                loadBookmarks();
            }
        }, [user])
    );

    const loadLanguage = async () => {
        try {
            const savedLanguage = await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY);
            if (savedLanguage === 'myanmar' || savedLanguage === 'hakha') {
                setLanguage(savedLanguage);
            }
        } catch (error) {
            console.error('Error loading language:', error);
        }
    };

    const saveLanguage = async (lang: 'myanmar' | 'hakha') => {
        try {
            await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
            setLanguage(lang);
            setSelectedBook(null);
            setSelectedChapter(1);
        } catch (error) {
            console.error('Error saving language:', error);
        }
    };

    const loadBooks = async () => {
        try {
            setLoading(true);
            console.log(`Loading books for language: ${language}`);
            const booksData = await BibleDatabase.getBooks(language);
            console.log(`Loaded ${booksData.length} books:`, booksData.slice(0, 3)); // Log first 3 books
            setBooks(booksData);
            if (booksData.length > 0) {
                setSelectedBook(booksData[0].id);
            }
        } catch (error) {
            console.error('Error loading books:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadVerses = async (bookId: number, chapter: number) => {
        setLoading(true);
        try {
            console.log(`Loading verses for bookId: ${bookId}, chapter: ${chapter}, language: ${language}`);
            const versesData = await BibleDatabase.getVerses(bookId, chapter, language);
            console.log(`Loaded ${versesData.length} verses:`, versesData.slice(0, 2)); // Log first 2 verses
            setVerses(versesData);
        } catch (error) {
            console.error('Error loading verses:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadBookmarks = async () => {
        if (!user) return;

        try {
            const bookmarks = await BibleDatabase.getBookmarks(user.id);
            const verseIds = new Set(bookmarks.map(b => b.verseId));
            setBookmarkedVerses(verseIds);
        } catch (error) {
            console.error('Error loading bookmarks:', error);
        }
    };

    const toggleBookmark = async (verseId: number) => {
        if (!user) {
            Alert.alert('Sign In Required', 'Please sign in to bookmark verses');
            return;
        }

        try {
            const isNowBookmarked = await BibleDatabase.toggleBookmark(user.id, verseId);

            // Update local state
            setBookmarkedVerses(prev => {
                const newSet = new Set(prev);
                if (isNowBookmarked) {
                    newSet.add(verseId);
                } else {
                    newSet.delete(verseId);
                }
                return newSet;
            });
        } catch (error) {
            console.error('Error toggling bookmark:', error);
            Alert.alert('Error', 'Failed to bookmark verse');
        }
    };

    const selectedBookData = books.find(b => b.id === selectedBook);
    const chapters = selectedBookData
        ? Array.from({ length: selectedBookData.chapters }, (_, i) => i + 1)
        : [];

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            {/* Language Selector */}
            <View style={[styles.languageContainer, { backgroundColor: colors.surface }]}>
                <TouchableOpacity
                    style={[
                        styles.languageButton,
                        language === 'myanmar'
                            ? { backgroundColor: colors.primary, borderColor: colors.primary }
                            : { backgroundColor: colors.surface, borderColor: colors.border },
                    ]}
                    onPress={() => saveLanguage('myanmar')}
                >
                    <Text
                        style={[
                            styles.languageText,
                            language === 'myanmar' ? { color: '#FFFFFF' } : { color: colors.text },
                        ]}
                    >
                        မြန်မာ
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[
                        styles.languageButton,
                        language === 'hakha'
                            ? { backgroundColor: colors.primary, borderColor: colors.primary }
                            : { backgroundColor: colors.surface, borderColor: colors.border },
                    ]}
                    onPress={() => saveLanguage('hakha')}
                >
                    <Text
                        style={[
                            styles.languageText,
                            language === 'hakha' ? { color: '#FFFFFF' } : { color: colors.text },
                        ]}
                    >
                        Hakha
                    </Text>
                </TouchableOpacity>
            </View>

            {/* Book Selector */}
            <View style={[styles.selectorContainer, { backgroundColor: colors.background }]}>
                <Text style={[styles.label, { color: colors.text }]}>Book:</Text>
                <View style={[styles.pickerWrapper, { borderColor: colors.border, backgroundColor: colors.surface }]}>
                    <Picker
                        selectedValue={selectedBook}
                        onValueChange={(value) => {
                            setSelectedBook(value);
                            setSelectedChapter(1);
                        }}
                        style={[styles.picker, { color: colors.text }]}
                        itemStyle={{ color: colors.text }}
                    >
                        {books.map(book => (
                            <Picker.Item key={book.id} label={book.name} value={book.id} />
                        ))}
                    </Picker>
                </View>
            </View>

            {/* Chapter Selector */}
            <View style={[styles.selectorContainer, { backgroundColor: colors.background }]}>
                <Text style={[styles.label, { color: colors.text }]}>Chapter:</Text>
                <View style={[styles.pickerWrapper, { borderColor: colors.border, backgroundColor: colors.surface }]}>
                    <Picker
                        selectedValue={selectedChapter}
                        onValueChange={setSelectedChapter}
                        style={[styles.picker, { color: colors.text }]}
                        itemStyle={{ color: colors.text }}
                    >
                        {chapters.map(chapter => (
                            <Picker.Item key={chapter} label={String(chapter)} value={chapter} />
                        ))}
                    </Picker>
                </View>
            </View>

            {/* Verses Display */}
            <ScrollView style={styles.versesContainer}>
                {loading ? (
                    <ActivityIndicator size="large" color={colors.primary} style={styles.loader} />
                ) : books.length === 0 ? (
                    <View style={styles.emptyState}>
                        <Ionicons name="book-outline" size={64} color={colors.textSecondary} />
                        <Text style={[styles.emptyTitle, { color: colors.text }]}>No Bible Data Found</Text>
                        <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                            The Bible database is empty. Please import Bible data to continue.
                        </Text>
                        <TouchableOpacity
                            style={[styles.importButton, { backgroundColor: colors.primary }]}
                            onPress={async () => {
                                setLoading(true);
                                try {
                                    console.log('Manual Bible import started...');
                                    const { parseAllBibles } = await import('../utils/bibleParser');
                                    const { myanmar, hakha } = await parseAllBibles();

                                    console.log(`Importing Myanmar Bible (${myanmar.verses.length} verses)...`);
                                    await BibleDatabase.seedDatabase('myanmar', myanmar.books, myanmar.verses);

                                    console.log(`Importing Hakha Bible (${hakha.verses.length} verses)...`);
                                    await BibleDatabase.seedDatabase('hakha', hakha.books, hakha.verses);

                                    console.log('Bible import completed!');
                                    await loadBooks(); // Reload books
                                } catch (error) {
                                    console.error('Bible import error:', error);
                                    Alert.alert('Error', 'Failed to import Bible data. Please check logs.');
                                } finally {
                                    setLoading(false);
                                }
                            }}
                        >
                            <Ionicons name="download" size={20} color="#FFFFFF" />
                            <Text style={styles.importButtonText}>Import Bible Data</Text>
                        </TouchableOpacity>
                    </View>
                ) : verses.length === 0 ? (
                    <View style={styles.emptyState}>
                        <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No verses found for this chapter.</Text>
                    </View>
                ) : (
                    verses.map(verse => (
                        <View
                            key={verse.id}
                            style={[
                                styles.verseRow,
                                highlightVerse === verse.verse && { backgroundColor: colors.primary + '20' }
                            ]}
                        >
                            <Text style={[styles.verseNumber, { color: colors.primary }]}>{verse.verse}</Text>
                            <Text style={[styles.verseText, { color: colors.text }]}>{verse.text}</Text>
                            <TouchableOpacity
                                onPress={() => toggleBookmark(verse.id)}
                                style={styles.bookmarkButton}
                            >
                                <Ionicons
                                    name={bookmarkedVerses.has(verse.id) ? 'bookmark' : 'bookmark-outline'}
                                    size={20}
                                    color={bookmarkedVerses.has(verse.id) ? colors.primary : colors.textSecondary}
                                />
                            </TouchableOpacity>
                        </View>
                    ))
                )}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    languageContainer: {
        flexDirection: 'row',
        padding: theme.spacing.md,
        backgroundColor: theme.colors.surface,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
        gap: theme.spacing.sm,
    },
    languageButton: {
        flex: 1,
        paddingVertical: theme.spacing.sm,
        paddingHorizontal: theme.spacing.md,
        borderRadius: theme.borderRadius.md,
        borderWidth: 1,
        borderColor: theme.colors.border,
        backgroundColor: theme.colors.background,
        alignItems: 'center',
    },
    languageButtonActive: {
        backgroundColor: theme.colors.primary,
        borderColor: theme.colors.primary,
    },
    languageText: {
        fontSize: theme.typography.fontSize.md,
        fontWeight: theme.typography.fontWeight.semibold,
        color: theme.colors.text,
    },
    languageTextActive: {
        color: '#FFFFFF',
    },
    selectorContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: theme.spacing.md,
        paddingVertical: theme.spacing.sm,
        backgroundColor: theme.colors.surface,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
    },
    label: {
        fontSize: theme.typography.fontSize.md,
        fontWeight: theme.typography.fontWeight.semibold,
        color: '#FFFFFF', // White for dark mode visibility
        marginRight: theme.spacing.sm,
        minWidth: 70,
    },
    pickerWrapper: {
        flex: 1,
        borderWidth: 1,
        borderColor: theme.colors.border,
        borderRadius: theme.borderRadius.md,
        backgroundColor: theme.colors.background,
    },
    picker: {
        height: 50,
    },
    versesContainer: {
        flex: 1,
        padding: theme.spacing.md,
    },
    verseRow: {
        flexDirection: 'row',
        marginBottom: theme.spacing.md,
        alignItems: 'center',
    },
    verseNumber: {
        fontSize: theme.typography.fontSize.sm,
        fontWeight: theme.typography.fontWeight.bold,
        color: theme.colors.primary,
        marginRight: theme.spacing.sm,
        minWidth: 30,
    },
    verseText: {
        flex: 1,
        fontSize: theme.typography.fontSize.md,
        color: '#1F2937', // Dark gray for better visibility
        lineHeight: 24,
    },
    bookmarkButton: {
        padding: theme.spacing.xs,
        marginLeft: theme.spacing.sm,
    },
    loader: {
        marginTop: theme.spacing.xl,
    },
    emptyState: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: theme.spacing.xl,
    },
    emptyTitle: {
        fontSize: theme.typography.fontSize.xl,
        fontWeight: theme.typography.fontWeight.bold,
        color: theme.colors.text,
        marginTop: theme.spacing.md,
        marginBottom: theme.spacing.sm,
    },
    emptyText: {
        fontSize: theme.typography.fontSize.md,
        color: theme.colors.textSecondary,
        textAlign: 'center',
        marginBottom: theme.spacing.lg,
    },
    importButton: {
        backgroundColor: theme.colors.primary,
        borderRadius: theme.borderRadius.md,
        padding: theme.spacing.md,
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.spacing.sm,
        ...theme.shadows.md,
    },
    importButtonText: {
        color: '#FFFFFF',
        fontSize: theme.typography.fontSize.md,
        fontWeight: theme.typography.fontWeight.semibold,
        marginLeft: theme.spacing.sm,
    },
});
