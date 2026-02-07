import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ActivityIndicator,
    RefreshControl,
    FlatList,
    useWindowDimensions,
} from 'react-native';
import BulletinService from '../services/BulletinService';
import { BulletinItem } from '../types';
import { theme } from '../styles/theme';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';

export default function BulletinBoard() {
    const { colors } = useTheme();
    const { width } = useWindowDimensions();
    const [bulletins, setBulletins] = useState<BulletinItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        loadBulletins();
    }, []);

    const loadBulletins = useCallback(async () => {
        try {
            setLoading(true);
            const bulletinsData = await BulletinService.getCurrentWeekBulletins();
            setBulletins(bulletinsData);
        } catch (error) {
            console.error('Error loading bulletins:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await loadBulletins();
        setRefreshing(false);
    }, [loadBulletins]);

    const getCategoryIcon = useCallback((category: BulletinItem['category']) => {
        switch (category) {
            case 'announcement':
                return 'megaphone-outline';
            case 'event':
                return 'calendar-outline';
            case 'prayer':
                return 'heart-outline';
            default:
                return 'information-circle-outline';
        }
    }, []);

    const getCategoryColor = useCallback((category: BulletinItem['category']) => {
        switch (category) {
            case 'announcement':
                return colors.primary;
            case 'event':
                return colors.success;
            case 'prayer':
                return '#E91E63';
            default:
                return colors.textSecondary;
        }
    }, [colors]);

    const getPriorityBadge = useCallback((priority?: BulletinItem['priority']) => {
        if (!priority || priority === 'low') return null;

        return (
            <View style={[
                styles.priorityBadge,
                { backgroundColor: priority === 'high' ? colors.error : '#FF9800' }
            ]}>
                <Text style={styles.priorityText}>
                    {priority === 'high' ? 'URGENT' : 'IMPORTANT'}
                </Text>
            </View>
        );
    }, []);

    const formatDate = useCallback((date: Date) => {
        const options: Intl.DateTimeFormatOptions = {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        };
        return date.toLocaleDateString('en-US', options);
    }, []);

    const headerDate = useMemo(
        () => new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
        []
    );

    const cardWidth = Math.min(width - theme.spacing.md * 2, 720);

    if (loading) {
        return (
            <View style={[styles.centerContainer, { backgroundColor: colors.background }]}>
                <ActivityIndicator size="large" color={colors.primary} />
            </View>
        );
    }

    const renderItem = ({ item }: { item: BulletinItem }) => (
        <View style={[styles.bulletinCard, { backgroundColor: colors.surface, width: cardWidth }]}>
            <View style={styles.bulletinHeader}>
                <View style={styles.categoryContainer}>
                    <Ionicons
                        name={getCategoryIcon(item.category) as any}
                        size={24}
                        color={getCategoryColor(item.category)}
                    />
                    <Text style={[styles.categoryText, { color: getCategoryColor(item.category) }]}>
                        {item.category?.toUpperCase() || 'GENERAL'}
                    </Text>
                </View>
                {getPriorityBadge(item.priority)}
            </View>

            <Text style={[styles.bulletinTitle, { color: colors.text }]}>{item.title}</Text>
            <Text style={[styles.bulletinDescription, { color: colors.textSecondary }]}>{item.description}</Text>

            <View style={styles.bulletinFooter}>
                <Ionicons name="time-outline" size={16} color={colors.textSecondary} />
                <Text style={[styles.bulletinDate, { color: colors.textSecondary }]}>{formatDate(item.date)}</Text>
            </View>
        </View>
    );

    return (
        <FlatList
            style={[styles.container, { backgroundColor: colors.background }]}
            contentContainerStyle={styles.contentContainer}
            data={bulletins}
            renderItem={renderItem}
            keyExtractor={item => item.id}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            ListHeaderComponent={
                <View style={[styles.header, { backgroundColor: colors.surface }]}>
                    <Text style={[styles.headerTitle, { color: colors.text }]}>This Week's Bulletin</Text>
                    <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>{headerDate}</Text>
                </View>
            }
            ListEmptyComponent={
                <View style={styles.emptyContainer}>
                    <Ionicons name="document-text-outline" size={64} color={colors.textSecondary} />
                    <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No bulletins this week</Text>
                </View>
            }
        />
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    contentContainer: {
        padding: theme.spacing.md,
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        marginBottom: theme.spacing.lg,
    },
    headerTitle: {
        fontSize: theme.typography.fontSize.xxl,
        fontWeight: theme.typography.fontWeight.bold,
        color: theme.colors.text,
        marginBottom: theme.spacing.xs,
    },
    headerSubtitle: {
        fontSize: theme.typography.fontSize.md,
        color: theme.colors.textSecondary,
    },
    bulletinCard: {
        backgroundColor: theme.colors.surface,
        borderRadius: theme.borderRadius.lg,
        padding: theme.spacing.lg,
        marginBottom: theme.spacing.md,
        ...theme.shadows.md,
    },
    bulletinHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: theme.spacing.md,
    },
    categoryContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    categoryText: {
        fontSize: theme.typography.fontSize.xs,
        fontWeight: theme.typography.fontWeight.bold,
        marginLeft: theme.spacing.xs,
    },
    priorityBadge: {
        paddingHorizontal: theme.spacing.sm,
        paddingVertical: 4,
        borderRadius: theme.borderRadius.sm,
    },
    priorityText: {
        fontSize: theme.typography.fontSize.xs,
        fontWeight: theme.typography.fontWeight.bold,
        color: '#FFFFFF',
    },
    bulletinTitle: {
        fontSize: theme.typography.fontSize.lg,
        fontWeight: theme.typography.fontWeight.bold,
        color: theme.colors.text,
        marginBottom: theme.spacing.sm,
    },
    bulletinDescription: {
        fontSize: theme.typography.fontSize.md,
        color: theme.colors.text,
        lineHeight: 22,
        marginBottom: theme.spacing.md,
    },
    bulletinFooter: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    bulletinDate: {
        fontSize: theme.typography.fontSize.sm,
        color: theme.colors.textSecondary,
        marginLeft: theme.spacing.xs,
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
    },
});
