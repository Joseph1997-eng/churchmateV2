import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    ActivityIndicator,
    Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { theme } from '../../styles/theme';

export default function ProfileScreen() {
    const { user, isAdmin, signOut, updateProfile } = useAuth();
    const { colors } = useTheme();
    const [displayName, setDisplayName] = useState(user?.displayName || '');
    const [loading, setLoading] = useState(false);
    const [editing, setEditing] = useState(false);

    const handleUpdateProfile = async () => {
        if (!displayName.trim()) {
            Alert.alert('Error', 'Name cannot be empty');
            return;
        }

        setLoading(true);
        try {
            await updateProfile({ displayName });
            Alert.alert('Success', 'Profile updated successfully');
            setEditing(false);
        } catch (error: any) {
            Alert.alert('Error', error.message || 'Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    const handleSignOut = () => {
        Alert.alert(
            'Sign Out',
            'Are you sure you want to sign out?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Sign Out',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await signOut();
                        } catch (error: any) {
                            Alert.alert('Error', error.message || 'Failed to sign out');
                        }
                    },
                },
            ]
        );
    };

    if (!user) {
        return (
            <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
            </View>
        );
    }

    return (
        <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
            {/* Profile Header */}
            <View style={[styles.header, { backgroundColor: colors.surface }]}>
                <View style={styles.avatarContainer}>
                    <Ionicons name="person-circle" size={100} color={colors.primary} />
                    {isAdmin && (
                        <View style={styles.adminBadge}>
                            <Ionicons name="shield-checkmark" size={20} color="#FFFFFF" />
                        </View>
                    )}
                </View>
                <Text style={[styles.name, { color: colors.text }]}>{user.displayName}</Text>
                <Text style={[styles.email, { color: colors.textSecondary }]}>{user.email}</Text>
                {isAdmin && (
                    <View style={styles.roleBadge}>
                        <Text style={styles.roleText}>ADMIN</Text>
                    </View>
                )}
            </View>

            {/* Profile Info */}
            <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>Profile Information</Text>

                <View style={[styles.infoCard, { backgroundColor: colors.surface }]}>
                    <View style={styles.infoRow}>
                        <Ionicons name="person-outline" size={20} color={colors.textSecondary} />
                        <View style={styles.infoContent}>
                            <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Display Name</Text>
                            {editing ? (
                                <TextInput
                                    style={styles.editInput}
                                    value={displayName}
                                    onChangeText={setDisplayName}
                                    placeholder="Enter your name"
                                    placeholderTextColor={colors.textSecondary}
                                />
                            ) : (
                                <Text style={[styles.infoValue, { color: colors.text }]}>{user.displayName}</Text>
                            )}
                        </View>
                    </View>

                    <View style={styles.infoRow}>
                        <Ionicons name="mail-outline" size={20} color={colors.textSecondary} />
                        <View style={styles.infoContent}>
                            <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Email</Text>
                            <Text style={[styles.infoValue, { color: colors.text }]}>{user.email}</Text>
                        </View>
                    </View>

                    <View style={styles.infoRow}>
                        <Ionicons name="shield-outline" size={20} color={colors.textSecondary} />
                        <View style={styles.infoContent}>
                            <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Role</Text>
                            <Text style={[styles.infoValue, { color: colors.text }]}>{isAdmin ? 'Administrator' : 'User'}</Text>
                        </View>
                    </View>
                </View>

                {/* Edit/Save Button */}
                {editing ? (
                    <View style={styles.buttonRow}>
                        <TouchableOpacity
                            style={[styles.button, styles.cancelButton]}
                            onPress={() => {
                                setEditing(false);
                                setDisplayName(user.displayName);
                            }}
                        >
                            <Text style={styles.cancelButtonText}>Cancel</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.button, styles.saveButton]}
                            onPress={handleUpdateProfile}
                            disabled={loading}
                        >
                            {loading ? (
                                <ActivityIndicator color="#FFFFFF" size="small" />
                            ) : (
                                <Text style={styles.saveButtonText}>Save</Text>
                            )}
                        </TouchableOpacity>
                    </View>
                ) : (
                    <TouchableOpacity
                        style={styles.editButton}
                        onPress={() => setEditing(true)}
                    >
                        <Ionicons name="create-outline" size={20} color={theme.colors.primary} />
                        <Text style={styles.editButtonText}>Edit Profile</Text>
                    </TouchableOpacity>
                )}
            </View>

            {/* Sign Out Button */}
            <View style={styles.section}>
                <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
                    <Ionicons name="log-out-outline" size={20} color={theme.colors.error} />
                    <Text style={styles.signOutButtonText}>Sign Out</Text>
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
    },
    header: {
        alignItems: 'center',
        paddingVertical: theme.spacing.xxl,
        backgroundColor: theme.colors.surface,
    },
    avatarContainer: {
        position: 'relative',
    },
    adminBadge: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: theme.colors.success,
        borderRadius: theme.borderRadius.full,
        padding: 4,
    },
    name: {
        fontSize: theme.typography.fontSize.xxl,
        fontWeight: theme.typography.fontWeight.bold,
        color: theme.colors.text,
        marginTop: theme.spacing.md,
    },
    email: {
        fontSize: theme.typography.fontSize.md,
        color: theme.colors.textSecondary,
        marginTop: theme.spacing.xs,
    },
    roleBadge: {
        backgroundColor: theme.colors.primary,
        paddingHorizontal: theme.spacing.md,
        paddingVertical: theme.spacing.xs,
        borderRadius: theme.borderRadius.full,
        marginTop: theme.spacing.sm,
    },
    roleText: {
        color: '#FFFFFF',
        fontSize: theme.typography.fontSize.xs,
        fontWeight: theme.typography.fontWeight.bold,
    },
    section: {
        padding: theme.spacing.lg,
    },
    sectionTitle: {
        fontSize: theme.typography.fontSize.lg,
        fontWeight: theme.typography.fontWeight.semibold,
        color: theme.colors.text,
        marginBottom: theme.spacing.md,
    },
    infoCard: {
        backgroundColor: theme.colors.surface,
        borderRadius: theme.borderRadius.lg,
        padding: theme.spacing.lg,
        ...theme.shadows.sm,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: theme.spacing.lg,
    },
    infoContent: {
        flex: 1,
        marginLeft: theme.spacing.md,
    },
    infoLabel: {
        fontSize: theme.typography.fontSize.sm,
        color: theme.colors.textSecondary,
        marginBottom: 4,
    },
    infoValue: {
        fontSize: theme.typography.fontSize.md,
        color: theme.colors.text,
        fontWeight: theme.typography.fontWeight.medium,
    },
    editInput: {
        fontSize: theme.typography.fontSize.md,
        color: theme.colors.text,
        fontWeight: theme.typography.fontWeight.medium,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.primary,
        paddingVertical: 4,
    },
    editButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: theme.colors.surface,
        borderRadius: theme.borderRadius.md,
        padding: theme.spacing.md,
        marginTop: theme.spacing.md,
        borderWidth: 1,
        borderColor: theme.colors.primary,
    },
    editButtonText: {
        color: theme.colors.primary,
        fontSize: theme.typography.fontSize.md,
        fontWeight: theme.typography.fontWeight.semibold,
        marginLeft: theme.spacing.xs,
    },
    buttonRow: {
        flexDirection: 'row',
        marginTop: theme.spacing.md,
        gap: theme.spacing.sm,
    },
    button: {
        flex: 1,
        borderRadius: theme.borderRadius.md,
        padding: theme.spacing.md,
        alignItems: 'center',
    },
    cancelButton: {
        backgroundColor: theme.colors.surface,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    cancelButtonText: {
        color: theme.colors.text,
        fontSize: theme.typography.fontSize.md,
        fontWeight: theme.typography.fontWeight.semibold,
    },
    saveButton: {
        backgroundColor: theme.colors.primary,
    },
    saveButtonText: {
        color: '#FFFFFF',
        fontSize: theme.typography.fontSize.md,
        fontWeight: theme.typography.fontWeight.semibold,
    },
    signOutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: theme.colors.surface,
        borderRadius: theme.borderRadius.md,
        padding: theme.spacing.md,
        borderWidth: 1,
        borderColor: theme.colors.error,
    },
    signOutButtonText: {
        color: theme.colors.error,
        fontSize: theme.typography.fontSize.md,
        fontWeight: theme.typography.fontWeight.semibold,
        marginLeft: theme.spacing.xs,
    },
});
