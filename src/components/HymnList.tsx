import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
    View,
    Text,
    TextInput,
    FlatList,
    StyleSheet,
    TouchableOpacity,
    ActivityIndicator,
    Modal,
    ScrollView,
    useWindowDimensions,
} from 'react-native';
import HymnService from '../services/HymnService';
import { Hymn } from '../types';
import { theme } from '../styles/theme';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';

const PAGE_SIZE = 30;

export default function HymnList() {
    const { colors } = useTheme();
    const { width } = useWindowDimensions();
    const [hymns, setHymns] = useState<Hymn[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);
    const [selectedHymn, setSelectedHymn] = useState<Hymn | null>(null);
    const [modalVisible, setModalVisible] = useState(false);
    const [page, setPage] = useState(1);

    useEffect(() => {
        loadHymns();
    }, []);

    useEffect(() => {
        setPage(1);
    }, [searchQuery, hymns]);

    const loadHymns = useCallback(async () => {
        try {
            setLoading(true);
            const hymnsData = await HymnService.getAllHymns();
            setHymns(hymnsData);
        } catch (error) {
            console.error('Error loading hymns:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    const filteredHymns = useMemo(() => {
        if (!searchQuery.trim()) {
            return hymns;
        }

        const query = searchQuery.toLowerCase();
        return hymns.filter(
            hymn =>
                hymn.title.toLowerCase().includes(query) ||
                hymn.number.toString().includes(query) ||
                hymn.lyrics.toLowerCase().includes(query)
        );
    }, [hymns, searchQuery]);

    const visibleHymns = useMemo(
        () => filteredHymns.slice(0, page * PAGE_SIZE),
        [filteredHymns, page]
    );

    const canLoadMore = visibleHymns.length < filteredHymns.length;

    const openHymnModal = useCallback((hymn: Hymn) => {
        setSelectedHymn(hymn);
        setModalVisible(true);
    }, []);

    const handleLoadMore = useCallback(() => {
        if (canLoadMore) {
            setPage(prev => prev + 1);
        }
    }, [canLoadMore]);

    const renderHymnItem = useCallback(({ item }: { item: Hymn }) => (
        <TouchableOpacity
            style={[styles.hymnItem, { backgroundColor: colors.surface }]}
            onPress={() => openHymnModal(item)}
        >
            <View style={[styles.hymnNumber, { backgroundColor: colors.primary }]}>
                <Text style={styles.hymnNumberText}>{item.number}</Text>
            </View>
            <View style={styles.hymnContent}>
                <Text style={[styles.hymnTitle, { color: colors.text }]} numberOfLines={1}>
                    {item.title}
                </Text>
                {item.category && (
                    <Text style={[styles.hymnCategory, { color: colors.textSecondary }]}>{item.category}</Text>
                )}
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
        </TouchableOpacity>
    ), [colors, openHymnModal]);

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            {/* Search Bar */}
            <View style={[styles.searchContainer, { backgroundColor: colors.surface }]}>
                <Ionicons name="search" size={20} color={colors.textSecondary} style={styles.searchIcon} />
                <TextInput
                    style={[styles.searchInput, { color: colors.text }]}
                    placeholder="Search hymns by title or number..."
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    placeholderTextColor={colors.textSecondary}
                />
                {searchQuery.length > 0 && (
                    <TouchableOpacity onPress={() => setSearchQuery('')}>
                        <Ionicons name="close-circle" size={20} color={colors.textSecondary} />
                    </TouchableOpacity>
                )}
            </View>

            {/* Hymns List */}
            {loading ? (
                <ActivityIndicator size="large" color={colors.primary} style={styles.loader} />
            ) : (
                <FlatList
                    data={visibleHymns}
                    renderItem={renderHymnItem}
                    keyExtractor={item => item.id}
                    contentContainerStyle={[styles.listContainer, { paddingHorizontal: width > 600 ? theme.spacing.xl : theme.spacing.md }]}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Ionicons name="musical-notes-outline" size={64} color={colors.textSecondary} />
                            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No hymns found</Text>
                            <Text style={[styles.emptySubtext, { color: colors.textSecondary }]}>Add hymns to Firebase Firestore</Text>
                        </View>
                    }
                    onEndReached={handleLoadMore}
                    onEndReachedThreshold={0.4}
                    initialNumToRender={PAGE_SIZE}
                    maxToRenderPerBatch={PAGE_SIZE}
                    windowSize={10}
                />
            )}

            {/* Hymn Detail Modal */}
            <Modal
                visible={modalVisible}
                animationType="slide"
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={[styles.modalContainer, { backgroundColor: colors.background }]}>
                    <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
                        <TouchableOpacity onPress={() => setModalVisible(false)}>
                            <Ionicons name="close" size={28} color={colors.text} />
                        </TouchableOpacity>
                        <Text style={[styles.modalTitle, { color: colors.text }]}>Hymn {selectedHymn?.number}</Text>
                        <View style={{ width: 28 }} />
                    </View>

                    <ScrollView style={styles.modalContent}>
                        <Text style={[styles.hymnTitleLarge, { color: colors.text }]}>{selectedHymn?.title}</Text>
                        <Text style={[styles.hymnLyrics, { color: colors.text }]}>{selectedHymn?.lyrics}</Text>
                    </ScrollView>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.surface,
        margin: theme.spacing.md,
        paddingHorizontal: theme.spacing.md,
        borderRadius: theme.borderRadius.lg,
        ...theme.shadows.sm,
    },
    searchIcon: {
        marginRight: theme.spacing.sm,
    },
    searchInput: {
        flex: 1,
        height: 48,
        fontSize: theme.typography.fontSize.md,
        color: theme.colors.text,
    },
    listContainer: {
        paddingHorizontal: theme.spacing.md,
    },
    hymnItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.surface,
        padding: theme.spacing.md,
        marginBottom: theme.spacing.sm,
        borderRadius: theme.borderRadius.md,
        ...theme.shadows.sm,
    },
    hymnNumber: {
        width: 48,
        height: 48,
        borderRadius: theme.borderRadius.full,
        backgroundColor: theme.colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: theme.spacing.md,
    },
    hymnNumberText: {
        fontSize: theme.typography.fontSize.md,
        fontWeight: theme.typography.fontWeight.bold,
        color: '#FFFFFF',
    },
    hymnContent: {
        flex: 1,
    },
    hymnTitle: {
        fontSize: theme.typography.fontSize.md,
        fontWeight: theme.typography.fontWeight.semibold,
        color: theme.colors.text,
        marginBottom: 4,
    },
    hymnCategory: {
        fontSize: theme.typography.fontSize.sm,
        color: theme.colors.textSecondary,
    },
    loader: {
        marginTop: theme.spacing.xl,
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: theme.spacing.xxl,
    },
    emptyText: {
        fontSize: theme.typography.fontSize.lg,
        color: theme.colors.textSecondary,
        marginTop: theme.spacing.md,
        fontWeight: theme.typography.fontWeight.semibold,
    },
    emptySubtext: {
        fontSize: theme.typography.fontSize.sm,
        color: theme.colors.textSecondary,
        marginTop: theme.spacing.xs,
    },
    modalContainer: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    modalHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: theme.spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
    },
    modalTitle: {
        fontSize: theme.typography.fontSize.lg,
        fontWeight: theme.typography.fontWeight.bold,
        color: theme.colors.text,
    },
    modalContent: {
        flex: 1,
        padding: theme.spacing.lg,
    },
    hymnTitleLarge: {
        fontSize: theme.typography.fontSize.xxl,
        fontWeight: theme.typography.fontWeight.bold,
        color: theme.colors.text,
        marginBottom: theme.spacing.lg,
        textAlign: 'center',
    },
    hymnLyrics: {
        fontSize: theme.typography.fontSize.md,
        color: theme.colors.text,
        lineHeight: 28,
    },
});
