import React, { useState, useEffect } from 'react';
import {
    View,
    FlatList,
    TouchableOpacity,
    Text,
    Alert,
    StyleSheet,
    ActivityIndicator,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import BibleDatabase from '../../database/BibleDatabase';
import { Bookmark } from '../../types';
import { theme } from '../../styles/theme';

interface BookmarksScreenProps {
    navigation: any;
}

export default function BookmarksScreen({ navigation }: BookmarksScreenProps) {
    const { user } = useAuth();
    const { colors } = useTheme();
    const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
    const [loading, setLoading] = useState(true);

    // Auto-refresh bookmarks when tab is focused
    useFocusEffect(
        React.useCallback(() => {
            loadBookmarks();
        }, [user])
    );

    const loadBookmarks = async () => {
        if (!user) return;

        setLoading(true);
        try {
            const data = await BibleDatabase.getBookmarks(user.id);
            setBookmarks(data);
        } catch (error) {
            console.error('Load bookmarks error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleRemove = async (bookmarkId: number) => {
        Alert.alert(
            'Remove Bookmark',
            'Are you sure you want to remove this bookmark?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Remove',
                    style: 'destructive',
                    onPress: async () => {
                        await BibleDatabase.removeBookmark(bookmarkId);
                        loadBookmarks();
                    },
                },
            ]
        );
    };

    const navigateToVerse = (bookmark: Bookmark) => {
        navigation.navigate('Bible', {
            bookId: bookmark.verse.bookId,
            chapter: bookmark.verse.chapter,
            highlightVerse: bookmark.verse.verse,
        });
    };

    if (loading) {
        return (
            <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
                <ActivityIndicator size="large" color={colors.primary} />
            </View>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <FlatList
                data={bookmarks}
                keyExtractor={(item) => `${item.id}`}
                renderItem={({ item }) => (
                    <View style={[styles.bookmarkItem, { backgroundColor: colors.surface }]}>
                        <TouchableOpacity
                            style={styles.bookmarkContent}
                            onPress={() => navigateToVerse(item)}
                        >
                            <View style={styles.bookmarkHeader}>
                                <Text style={[styles.reference, { color: colors.text }]}>
                                    {item.verse.bookName} {item.verse.chapter}:{item.verse.verse}
                                </Text>
                                <TouchableOpacity
                                    style={styles.removeButton}
                                    onPress={() => handleRemove(item.id)}
                                >
                                    <Ionicons name="trash-outline" size={20} color={colors.error} />
                                </TouchableOpacity>
                            </View>
                            <Text style={[styles.verseText, { color: colors.textSecondary }]} numberOfLines={3}>
                                {item.verse.text}
                            </Text>
                            {item.note && (
                                <View style={styles.noteContainer}>
                                    <Ionicons name="document-text-outline" size={16} color={colors.textSecondary} />
                                    <Text style={[styles.note, { color: colors.textSecondary }]} numberOfLines={2}>
                                        {item.note}
                                    </Text>
                                </View>
                            )}
                        </TouchableOpacity>
                    </View>
                )}
                ListEmptyComponent={
                    <View style={styles.emptyState}>
                        <Ionicons name="bookmark-outline" size={64} color={colors.textSecondary} />
                        <Text style={[styles.emptyTitle, { color: colors.text }]}>No Bookmarks Yet</Text>
                        <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                            Tap the bookmark icon on any verse to save it here
                        </Text>
                    </View>
                }
                contentContainerStyle={bookmarks.length === 0 ? styles.emptyContainer : styles.listContent}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: theme.colors.background,
    },
    listContent: {
        padding: theme.spacing.sm,
    },
    bookmarkItem: {
        marginBottom: theme.spacing.sm,
        backgroundColor: theme.colors.surface,
        borderRadius: theme.borderRadius.md,
        ...theme.shadows.sm,
    },
    bookmarkContent: {
        padding: theme.spacing.md,
    },
    bookmarkHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: theme.spacing.sm,
    },
    reference: {
        fontSize: theme.typography.fontSize.md,
        fontWeight: theme.typography.fontWeight.bold,
        color: theme.colors.primary,
    },
    removeButton: {
        padding: theme.spacing.xs,
    },
    verseText: {
        fontSize: theme.typography.fontSize.md,
        color: theme.colors.text,
        lineHeight: 22,
        marginBottom: theme.spacing.sm,
    },
    noteContainer: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        backgroundColor: theme.colors.background,
        padding: theme.spacing.sm,
        borderRadius: theme.borderRadius.sm,
        marginTop: theme.spacing.xs,
    },
    note: {
        flex: 1,
        fontSize: theme.typography.fontSize.sm,
        color: theme.colors.textSecondary,
        marginLeft: theme.spacing.xs,
        fontStyle: 'italic',
    },
    emptyContainer: {
        flex: 1,
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
    },
});
