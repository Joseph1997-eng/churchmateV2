import React, { useState } from 'react';
import {
    View,
    TextInput,
    FlatList,
    TouchableOpacity,
    Text,
    StyleSheet,
    ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import BibleDatabase from '../../database/BibleDatabase';
import { BibleVerse } from '../../types';
import { theme } from '../../styles/theme';

interface BibleSearchScreenProps {
    navigation: any;
}

export default function BibleSearchScreen({ navigation }: BibleSearchScreenProps) {
    const { colors } = useTheme();
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<BibleVerse[]>([]);
    const [loading, setLoading] = useState(false);
    const [language, setLanguage] = useState<'myanmar' | 'hakha'>('myanmar');

    const handleSearch = async () => {
        if (!query.trim()) return;

        setLoading(true);
        try {
            const searchResults = await BibleDatabase.searchVerses(query, language);
            setResults(searchResults);
        } catch (error) {
            console.error('Search error:', error);
        } finally {
            setLoading(false);
        }
    };

    const navigateToVerse = (verse: BibleVerse) => {
        // Navigate back to Bible tab with params
        navigation.navigate('Bible', {
            screen: 'BibleMain',
            params: {
                bookId: verse.bookId,
                chapter: verse.chapter,
                highlightVerse: verse.verse,
            },
        });
    };

    // Highlight search keywords in text
    const highlightText = (text: string, searchQuery: string) => {
        if (!searchQuery.trim()) {
            return <Text style={[styles.verseText, { color: colors.text }]} numberOfLines={3}>{text}</Text>;
        }

        const parts = text.split(new RegExp(`(${searchQuery})`, 'gi'));
        return (
            <Text style={[styles.verseText, { color: colors.text }]} numberOfLines={3}>
                {parts.map((part, index) =>
                    part.toLowerCase() === searchQuery.toLowerCase() ? (
                        <Text key={index} style={{ backgroundColor: colors.primary, color: '#FFFFFF', fontWeight: 'bold' }}>
                            {part}
                        </Text>
                    ) : (
                        part
                    )
                )}
            </Text>
        );
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            {/* Header */}
            <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={colors.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.text }]}>Search Bible</Text>
            </View>

            {/* Search Input */}
            <View style={[styles.searchContainer, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
                <View style={[styles.searchBar, { backgroundColor: colors.background, borderColor: colors.border }]}>
                    <Ionicons name="search" size={20} color={colors.textSecondary} />
                    <TextInput
                        style={[styles.searchInput, { color: colors.text }]}
                        placeholder="Search verses..."
                        value={query}
                        onChangeText={setQuery}
                        onSubmitEditing={handleSearch}
                        placeholderTextColor={colors.textSecondary}
                        autoFocus
                    />
                    {query.length > 0 && (
                        <TouchableOpacity onPress={() => setQuery('')}>
                            <Ionicons name="close-circle" size={20} color={colors.textSecondary} />
                        </TouchableOpacity>
                    )}
                </View>

                {/* Language Toggle */}
                <View style={styles.languageToggle}>
                    <TouchableOpacity
                        style={[
                            styles.langButton,
                            { borderColor: colors.border },
                            language === 'myanmar' && { backgroundColor: colors.primary, borderColor: colors.primary }
                        ]}
                        onPress={() => setLanguage('myanmar')}
                    >
                        <Text style={[
                            styles.langText,
                            { color: language === 'myanmar' ? '#FFFFFF' : colors.text }
                        ]}>
                            မြန်မာ
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[
                            styles.langButton,
                            { borderColor: colors.border },
                            language === 'hakha' && { backgroundColor: colors.primary, borderColor: colors.primary }
                        ]}
                        onPress={() => setLanguage('hakha')}
                    >
                        <Text style={[
                            styles.langText,
                            { color: language === 'hakha' ? '#FFFFFF' : colors.text }
                        ]}>
                            Hakha
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Results */}
            {loading ? (
                <ActivityIndicator size="large" color={colors.primary} style={styles.loader} />
            ) : (
                <FlatList
                    data={results}
                    keyExtractor={(item) => `${item.id}`}
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            style={[styles.resultItem, { borderBottomColor: colors.border }]}
                            onPress={() => navigateToVerse(item)}
                        >
                            <Text style={[styles.reference, { color: colors.primary }]}>
                                {item.bookName} {item.chapter}:{item.verse}
                            </Text>
                            {highlightText(item.text, query)}
                        </TouchableOpacity>
                    )}
                    ListEmptyComponent={
                        <View style={styles.emptyState}>
                            <Ionicons name="search-outline" size={64} color={colors.textSecondary} />
                            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                                {query ? 'No results found' : 'Enter search query to find verses'}
                            </Text>
                        </View>
                    }
                    contentContainerStyle={results.length === 0 ? styles.emptyContainer : undefined}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: theme.spacing.lg,
        backgroundColor: theme.colors.surface,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
    },
    backButton: {
        marginRight: theme.spacing.md,
    },
    headerTitle: {
        fontSize: theme.typography.fontSize.xl,
        fontWeight: theme.typography.fontWeight.bold,
        color: theme.colors.text,
    },
    searchContainer: {
        padding: theme.spacing.md,
        backgroundColor: theme.colors.surface,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
    },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.background,
        borderRadius: theme.borderRadius.md,
        padding: theme.spacing.sm,
        marginBottom: theme.spacing.md,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    searchInput: {
        flex: 1,
        marginLeft: theme.spacing.sm,
        fontSize: theme.typography.fontSize.md,
        color: theme.colors.text,
    },
    languageToggle: {
        flexDirection: 'row',
        gap: theme.spacing.sm,
    },
    langButton: {
        flex: 1,
        padding: theme.spacing.sm,
        borderRadius: theme.borderRadius.md,
        borderWidth: 1,
        borderColor: theme.colors.border,
        alignItems: 'center',
    },
    langButtonActive: {
        backgroundColor: theme.colors.primary,
        borderColor: theme.colors.primary,
    },
    langText: {
        fontSize: theme.typography.fontSize.md,
        color: theme.colors.text,
    },
    langTextActive: {
        color: '#FFFFFF',
        fontWeight: theme.typography.fontWeight.semibold,
    },
    loader: {
        marginTop: theme.spacing.xl,
    },
    resultItem: {
        padding: theme.spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
    },
    reference: {
        fontSize: theme.typography.fontSize.sm,
        fontWeight: theme.typography.fontWeight.bold,
        color: theme.colors.primary,
        marginBottom: theme.spacing.xs,
    },
    verseText: {
        fontSize: theme.typography.fontSize.md,
        color: theme.colors.text,
        lineHeight: 22,
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
    emptyText: {
        fontSize: theme.typography.fontSize.md,
        color: theme.colors.textSecondary,
        textAlign: 'center',
        marginTop: theme.spacing.md,
    },
});
