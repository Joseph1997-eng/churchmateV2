import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
    Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import AuthService from '../../services/AuthService';
import { theme } from '../../styles/theme';
import { User } from '../../types';
import { db } from '../../config/firebase';

interface AdminDashboardProps {
    navigation: any;
}

export default function AdminDashboard({ navigation }: AdminDashboardProps) {
    const { user, isAdmin } = useAuth();
    const { colors } = useTheme();
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalUsers: 0,
        totalAdmins: 0,
        totalHymns: 0,
        totalBulletins: 0,
    });

    useEffect(() => {
        if (isAdmin) {
            loadData();
        }
    }, [isAdmin]);

    const loadData = async () => {
        try {
            setLoading(true);

            // Load users
            const usersSnapshot = await getDocs(collection(db, 'users'));
            const usersData = usersSnapshot.docs.map(doc => ({
                ...doc.data(),
                createdAt: doc.data().createdAt?.toDate() || new Date(),
                updatedAt: doc.data().updatedAt?.toDate() || new Date(),
            })) as User[];
            setUsers(usersData);

            // Load stats
            const hymnsSnapshot = await getDocs(collection(db, 'hymns'));
            const bulletinsSnapshot = await getDocs(collection(db, 'bulletins'));

            setStats({
                totalUsers: usersData.length,
                totalAdmins: usersData.filter(u => u.role === 'admin').length,
                totalHymns: hymnsSnapshot.size,
                totalBulletins: bulletinsSnapshot.size,
            });
        } catch (error) {
            console.error('Error loading data:', error);
            Alert.alert('Error', 'Failed to load admin data');
        } finally {
            setLoading(false);
        }
    };

    const handlePromoteUser = async (userId: string, userName: string) => {
        if (!user) return;

        Alert.alert(
            'Promote to Admin',
            `Are you sure you want to promote ${userName} to admin?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Promote',
                    onPress: async () => {
                        try {
                            await AuthService.promoteToAdmin(userId, user.id);
                            Alert.alert('Success', `${userName} is now an admin`);
                            loadData();
                        } catch (error: any) {
                            Alert.alert('Error', error.message || 'Failed to promote user');
                        }
                    },
                },
            ]
        );
    };

    const handleDemoteUser = async (userId: string, userName: string) => {
        if (!user) return;

        Alert.alert(
            'Demote to User',
            `Are you sure you want to demote ${userName} to regular user?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Demote',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await AuthService.demoteToUser(userId, user.id);
                            Alert.alert('Success', `${userName} is now a regular user`);
                            loadData();
                        } catch (error: any) {
                            Alert.alert('Error', error.message || 'Failed to demote user');
                        }
                    },
                },
            ]
        );
    };

    if (!isAdmin) {
        return (
            <View style={styles.centerContainer}>
                <Ionicons name="lock-closed" size={64} color={theme.colors.error} />
                <Text style={styles.errorText}>Access Denied</Text>
                <Text style={styles.errorSubtext}>Admin access required</Text>
            </View>
        );
    }

    if (loading) {
        return (
            <View style={[styles.centerContainer, { backgroundColor: colors.background }]}>
                <ActivityIndicator size="large" color={colors.primary} />
            </View>
        );
    }

    return (
        <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
            {/* Header */}
            <View style={[styles.header, { backgroundColor: colors.surface }]}>
                <Text style={[styles.headerTitle, { color: colors.text }]}>Admin Dashboard</Text>
                <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>Manage your church app</Text>
            </View>

            {/* Stats Cards */}
            <View style={styles.statsContainer}>
                <View style={[styles.statCard, { backgroundColor: colors.surface }]}>
                    <Ionicons name="people" size={32} color={colors.primary} />
                    <Text style={[styles.statNumber, { color: colors.text }]}>{stats.totalUsers}</Text>
                    <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Total Users</Text>
                </View>

                <View style={[styles.statCard, { backgroundColor: colors.surface }]}>
                    <Ionicons name="shield-checkmark" size={32} color={colors.success} />
                    <Text style={[styles.statNumber, { color: colors.text }]}>{stats.totalAdmins}</Text>
                    <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Admins</Text>
                </View>
            </View>

            <View style={styles.statsContainer}>
                <View style={[styles.statCard, { backgroundColor: colors.surface }]}>
                    <Ionicons name="musical-notes" size={32} color={colors.secondary} />
                    <Text style={[styles.statNumber, { color: colors.text }]}>{stats.totalHymns}</Text>
                    <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Hymns</Text>
                </View>

                <View style={[styles.statCard, { backgroundColor: colors.surface }]}>
                    <Ionicons name="newspaper" size={32} color={colors.secondary} />
                    <Text style={[styles.statNumber, { color: colors.text }]}>{stats.totalBulletins}</Text>
                    <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Bulletins</Text>
                </View>
            </View>

            {/* Quick Actions */}
            <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>Quick Actions</Text>

                <View style={styles.actionsGrid}>
                    <TouchableOpacity
                        style={[styles.actionCard, { backgroundColor: colors.surface }]}
                        onPress={() => navigation.navigate('LogoUpload')}
                    >
                        <Ionicons name="image" size={32} color={colors.primary} />
                        <Text style={[styles.actionTitle, { color: colors.text }]}>Church Logo</Text>
                        <Text style={[styles.actionSubtitle, { color: colors.textSecondary }]}>Upload branding</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.actionCard, { backgroundColor: colors.surface }]}
                        onPress={() => navigation.navigate('AddHymn')}
                    >
                        <Ionicons name="musical-note" size={32} color={colors.secondary} />
                        <Text style={[styles.actionTitle, { color: colors.text }]}>Add Hymn</Text>
                        <Text style={[styles.actionSubtitle, { color: colors.textSecondary }]}>New hymn entry</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.actionCard, { backgroundColor: colors.surface }]}
                        onPress={() => navigation.navigate('CreateBulletin')}
                    >
                        <Ionicons name="newspaper" size={32} color={colors.secondary} />
                        <Text style={[styles.actionTitle, { color: colors.text }]}>New Bulletin</Text>
                        <Text style={[styles.actionSubtitle, { color: colors.textSecondary }]}>Post announcement</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.actionCard, { backgroundColor: colors.surface }]}
                        onPress={() => navigation.navigate('ChurchSettings')}
                    >
                        <Ionicons name="settings" size={32} color={colors.textSecondary} />
                        <Text style={[styles.actionTitle, { color: colors.text }]}>Settings</Text>
                        <Text style={[styles.actionSubtitle, { color: colors.textSecondary }]}>Church info</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* User Management */}
            <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>User Management</Text>

                {users.map(u => (
                    <View key={u.id} style={[styles.userCard, { backgroundColor: colors.surface }]}>
                        <View style={styles.userInfo}>
                            <Ionicons
                                name={u.role === 'admin' ? 'shield-checkmark' : 'person'}
                                size={24}
                                color={u.role === 'admin' ? colors.success : colors.textSecondary}
                            />
                            <View style={styles.userDetails}>
                                <Text style={[styles.userName, { color: colors.text }]}>{u.displayName}</Text>
                                <Text style={[styles.userEmail, { color: colors.textSecondary }]}>{u.email}</Text>
                            </View>
                            {u.role === 'admin' && (
                                <View style={styles.adminBadge}>
                                    <Text style={styles.adminBadgeText}>ADMIN</Text>
                                </View>
                            )}
                        </View>

                        {u.id !== user?.id && (
                            <View style={styles.userActions}>
                                {u.role === 'admin' ? (
                                    <TouchableOpacity
                                        style={[styles.actionButton, styles.demoteButton]}
                                        onPress={() => handleDemoteUser(u.id, u.displayName)}
                                    >
                                        <Ionicons name="arrow-down" size={16} color={colors.error} />
                                        <Text style={styles.demoteButtonText}>Demote</Text>
                                    </TouchableOpacity>
                                ) : (
                                    <TouchableOpacity
                                        style={[styles.actionButton, styles.promoteButton]}
                                        onPress={() => handlePromoteUser(u.id, u.displayName)}
                                    >
                                        <Ionicons name="arrow-up" size={16} color={colors.success} />
                                        <Text style={styles.promoteButtonText}>Promote</Text>
                                    </TouchableOpacity>
                                )}
                            </View>
                        )}
                    </View>
                ))}
            </View>

            {/* Quick Actions */}
            <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>Quick Actions</Text>

                <TouchableOpacity
                    style={[styles.actionCard, { backgroundColor: colors.surface }]}
                    onPress={() => navigation.navigate('AddHymn')}
                >
                    <Ionicons name="add-circle" size={24} color={colors.primary} />
                    <Text style={[styles.actionCardText, { color: colors.text }]}>Add New Hymn</Text>
                    <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.actionCard, { backgroundColor: colors.surface }]}
                    onPress={() => navigation.navigate('CreateBulletin')}
                >
                    <Ionicons name="create" size={24} color={colors.primary} />
                    <Text style={[styles.actionCardText, { color: colors.text }]}>Create Bulletin</Text>
                    <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.actionCard, { backgroundColor: colors.surface }]}
                    onPress={() => navigation.navigate('ChurchSettings')}
                >
                    <Ionicons name="settings" size={24} color={colors.primary} />
                    <Text style={[styles.actionCardText, { color: colors.text }]}>Church Settings</Text>
                    <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: theme.colors.background,
    },
    header: {
        backgroundColor: theme.colors.primary,
        padding: theme.spacing.lg,
        paddingTop: theme.spacing.xl,
    },
    headerTitle: {
        fontSize: theme.typography.fontSize.xxl,
        fontWeight: theme.typography.fontWeight.bold,
        color: '#FFFFFF',
    },
    headerSubtitle: {
        fontSize: theme.typography.fontSize.md,
        color: '#FFFFFF',
        opacity: 0.9,
        marginTop: theme.spacing.xs,
    },
    statsContainer: {
        flexDirection: 'row',
        padding: theme.spacing.md,
        gap: theme.spacing.md,
    },
    statCard: {
        flex: 1,
        backgroundColor: theme.colors.surface,
        borderRadius: theme.borderRadius.lg,
        padding: theme.spacing.lg,
        alignItems: 'center',
        ...theme.shadows.sm,
    },
    statNumber: {
        fontSize: theme.typography.fontSize.xxxl,
        fontWeight: theme.typography.fontWeight.bold,
        color: theme.colors.text,
        marginTop: theme.spacing.sm,
    },
    statLabel: {
        fontSize: theme.typography.fontSize.sm,
        color: theme.colors.textSecondary,
        marginTop: theme.spacing.xs,
    },
    section: {
        padding: theme.spacing.lg,
    },
    sectionTitle: {
        fontSize: theme.typography.fontSize.lg,
        fontWeight: theme.typography.fontWeight.bold,
        color: theme.colors.text,
        marginBottom: theme.spacing.md,
    },
    userCard: {
        backgroundColor: theme.colors.surface,
        borderRadius: theme.borderRadius.md,
        padding: theme.spacing.md,
        marginBottom: theme.spacing.sm,
        ...theme.shadows.sm,
    },
    userInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: theme.spacing.sm,
    },
    userDetails: {
        flex: 1,
        marginLeft: theme.spacing.md,
    },
    userName: {
        fontSize: theme.typography.fontSize.md,
        fontWeight: theme.typography.fontWeight.semibold,
        color: theme.colors.text,
    },
    userEmail: {
        fontSize: theme.typography.fontSize.sm,
        color: theme.colors.textSecondary,
        marginTop: 2,
    },
    adminBadge: {
        backgroundColor: theme.colors.success,
        paddingHorizontal: theme.spacing.sm,
        paddingVertical: 4,
        borderRadius: theme.borderRadius.sm,
    },
    adminBadgeText: {
        color: '#FFFFFF',
        fontSize: theme.typography.fontSize.xs,
        fontWeight: theme.typography.fontWeight.bold,
    },
    userActions: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: theme.spacing.md,
        paddingVertical: theme.spacing.sm,
        borderRadius: theme.borderRadius.md,
        gap: theme.spacing.xs,
    },
    promoteButton: {
        backgroundColor: theme.colors.success + '20',
    },
    promoteButtonText: {
        color: theme.colors.success,
        fontSize: theme.typography.fontSize.sm,
        fontWeight: theme.typography.fontWeight.semibold,
    },
    demoteButton: {
        backgroundColor: theme.colors.error + '20',
    },
    demoteButtonText: {
        color: theme.colors.error,
        fontSize: theme.typography.fontSize.sm,
        fontWeight: theme.typography.fontWeight.semibold,
    },
    actionCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.surface,
        borderRadius: theme.borderRadius.md,
        padding: theme.spacing.md,
        marginBottom: theme.spacing.sm,
        ...theme.shadows.sm,
    },
    actionCardText: {
        flex: 1,
        fontSize: theme.typography.fontSize.md,
        color: theme.colors.text,
        marginLeft: theme.spacing.md,
        fontWeight: theme.typography.fontWeight.medium,
    },
    errorText: {
        fontSize: theme.typography.fontSize.xl,
        fontWeight: theme.typography.fontWeight.bold,
        color: theme.colors.error,
        marginTop: theme.spacing.md,
    },
    errorSubtext: {
        fontSize: theme.typography.fontSize.md,
        color: theme.colors.textSecondary,
        marginTop: theme.spacing.sm,
    },
    actionsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: theme.spacing.md,
    },
    actionCard: {
        flex: 1,
        minWidth: '45%',
        backgroundColor: theme.colors.surface,
        padding: theme.spacing.md,
        borderRadius: theme.borderRadius.md,
        alignItems: 'center',
        ...theme.shadows.sm,
    },
    actionTitle: {
        fontSize: theme.typography.fontSize.md,
        fontWeight: theme.typography.fontWeight.semibold,
        color: theme.colors.text,
        marginTop: theme.spacing.sm,
    },
    actionSubtitle: {
        fontSize: theme.typography.fontSize.sm,
        color: theme.colors.textSecondary,
        marginTop: theme.spacing.xs,
    },
});
