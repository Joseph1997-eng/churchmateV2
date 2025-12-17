import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    Alert,
    ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { doc, setDoc, Timestamp } from 'firebase/firestore';
import { useAuth } from '../../contexts/AuthContext';
import { theme } from '../../styles/theme';
import { db } from '../../config/firebase';

interface ChurchSettingsScreenProps {
    navigation: any;
}

export default function ChurchSettingsScreen({ navigation }: ChurchSettingsScreenProps) {
    const { user } = useAuth();
    const [churchName, setChurchName] = useState('Church Mate');
    const [primaryColor, setPrimaryColor] = useState('#4A90E2');
    const [secondaryColor, setSecondaryColor] = useState('#7B68EE');
    const [loading, setLoading] = useState(false);

    const handleSaveSettings = async () => {
        if (!churchName.trim()) {
            Alert.alert('Error', 'Church name cannot be empty');
            return;
        }

        if (!user) {
            Alert.alert('Error', 'You must be logged in');
            return;
        }

        setLoading(true);
        try {
            await setDoc(doc(db, 'settings', 'main'), {
                id: 'main',
                churchName: churchName.trim(),
                primaryColor,
                secondaryColor,
                logoURL: '',
                iconURL: '',
                splashURL: '',
                updatedAt: Timestamp.now(),
                updatedBy: user.id,
            });

            Alert.alert('Success', 'Settings saved successfully!\\n\\nNote: App restart required for theme changes to take effect.', [
                {
                    text: 'OK',
                    onPress: () => navigation.goBack(),
                },
            ]);
        } catch (error: any) {
            console.error('Save settings error:', error);
            Alert.alert('Error', error.message || 'Failed to save settings');
        } finally {
            setLoading(false);
        }
    };

    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Church Settings</Text>
            </View>

            <View style={styles.form}>
                {/* Church Name */}
                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Church Name *</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="e.g., First Baptist Church"
                        value={churchName}
                        onChangeText={setChurchName}
                        placeholderTextColor={theme.colors.textSecondary}
                    />
                </View>

                {/* Primary Color */}
                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Primary Color</Text>
                    <View style={styles.colorInputContainer}>
                        <TextInput
                            style={[styles.input, styles.colorInput]}
                            placeholder="#4A90E2"
                            value={primaryColor}
                            onChangeText={setPrimaryColor}
                            placeholderTextColor={theme.colors.textSecondary}
                        />
                        <View style={[styles.colorPreview, { backgroundColor: primaryColor }]} />
                    </View>
                </View>

                {/* Secondary Color */}
                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Secondary Color</Text>
                    <View style={styles.colorInputContainer}>
                        <TextInput
                            style={[styles.input, styles.colorInput]}
                            placeholder="#7B68EE"
                            value={secondaryColor}
                            onChangeText={setSecondaryColor}
                            placeholderTextColor={theme.colors.textSecondary}
                        />
                        <View style={[styles.colorPreview, { backgroundColor: secondaryColor }]} />
                    </View>
                </View>

                {/* Logo Upload Notice */}
                <View style={styles.notice}>
                    <Ionicons name="information-circle" size={20} color={theme.colors.primary} />
                    <Text style={styles.noticeText}>
                        Logo & Icon Upload: Photo upload feature will be available in the next update. For now, you can configure colors and church name.
                    </Text>
                </View>

                {/* Save Button */}
                <View style={styles.buttonContainer}>
                    <TouchableOpacity
                        style={[styles.saveButton, loading && styles.saveButtonDisabled]}
                        onPress={handleSaveSettings}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color="#FFFFFF" />
                        ) : (
                            <>
                                <Ionicons name="save" size={20} color="#FFFFFF" />
                                <Text style={styles.saveButtonText}>Save Settings</Text>
                            </>
                        )}
                    </TouchableOpacity>
                </View>
            </View>
        </ScrollView>
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
    form: {
        padding: theme.spacing.lg,
    },
    inputGroup: {
        marginBottom: theme.spacing.lg,
    },
    label: {
        fontSize: theme.typography.fontSize.md,
        fontWeight: theme.typography.fontWeight.semibold,
        color: theme.colors.text,
        marginBottom: theme.spacing.sm,
    },
    input: {
        backgroundColor: theme.colors.surface,
        borderWidth: 1,
        borderColor: theme.colors.border,
        borderRadius: theme.borderRadius.md,
        padding: theme.spacing.md,
        fontSize: theme.typography.fontSize.md,
        color: theme.colors.text,
    },
    colorInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.spacing.sm,
    },
    colorInput: {
        flex: 1,
    },
    colorPreview: {
        width: 50,
        height: 50,
        borderRadius: theme.borderRadius.md,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    notice: {
        flexDirection: 'row',
        backgroundColor: theme.colors.surface,
        padding: theme.spacing.md,
        borderRadius: theme.borderRadius.md,
        marginBottom: theme.spacing.lg,
        gap: theme.spacing.sm,
    },
    noticeText: {
        flex: 1,
        fontSize: theme.typography.fontSize.sm,
        color: theme.colors.textSecondary,
        lineHeight: 20,
    },
    buttonContainer: {
        marginTop: theme.spacing.md,
    },
    saveButton: {
        backgroundColor: theme.colors.primary,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: theme.spacing.md,
        borderRadius: theme.borderRadius.md,
        gap: theme.spacing.sm,
    },
    saveButtonDisabled: {
        opacity: 0.6,
    },
    saveButtonText: {
        color: '#FFFFFF',
        fontSize: theme.typography.fontSize.md,
        fontWeight: theme.typography.fontWeight.semibold,
    },
});
