import React from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme, ThemeMode } from '../../contexts/ThemeContext';
import { theme } from '../../styles/theme';

export default function ThemeSettingsScreen() {
    const { themeMode, setThemeMode, colors } = useTheme();

    const options: Array<{ mode: ThemeMode; label: string; icon: any; description: string }> = [
        {
            mode: 'light',
            label: 'Light',
            icon: 'sunny',
            description: 'Always use light theme'
        },
        {
            mode: 'dark',
            label: 'Dark',
            icon: 'moon',
            description: 'Always use dark theme'
        },
        {
            mode: 'system',
            label: 'System',
            icon: 'phone-portrait',
            description: 'Follow device settings'
        },
    ];

    return (
        <ScrollView
            style={[styles.container, { backgroundColor: colors.background }]}
            contentContainerStyle={styles.content}
        >
            <Text style={[styles.title, { color: colors.text }]}>Appearance</Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                Choose how Church Mate looks to you
            </Text>

            <View style={styles.optionsContainer}>
                {options.map(option => (
                    <TouchableOpacity
                        key={option.mode}
                        style={[
                            styles.option,
                            {
                                backgroundColor: colors.surface,
                                borderColor: themeMode === option.mode ? colors.primary : colors.border,
                                borderWidth: 2,
                            }
                        ]}
                        onPress={() => setThemeMode(option.mode)}
                        activeOpacity={0.7}
                    >
                        <View style={styles.optionContent}>
                            <View style={[
                                styles.iconContainer,
                                { backgroundColor: themeMode === option.mode ? colors.primary + '20' : colors.background }
                            ]}>
                                <Ionicons
                                    name={option.icon}
                                    size={28}
                                    color={themeMode === option.mode ? colors.primary : colors.textSecondary}
                                />
                            </View>
                            <View style={styles.optionText}>
                                <Text style={[styles.optionLabel, { color: colors.text }]}>
                                    {option.label}
                                </Text>
                                <Text style={[styles.optionDescription, { color: colors.textSecondary }]}>
                                    {option.description}
                                </Text>
                            </View>
                        </View>
                        {themeMode === option.mode && (
                            <Ionicons name="checkmark-circle" size={24} color={colors.primary} />
                        )}
                    </TouchableOpacity>
                ))}
            </View>

            <View style={[styles.infoContainer, { backgroundColor: colors.surface }]}>
                <Ionicons name="information-circle" size={20} color={colors.primary} />
                <Text style={[styles.infoText, { color: colors.textSecondary }]}>
                    Dark mode reduces eye strain in low light and can help save battery on OLED screens.
                </Text>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        padding: theme.spacing.lg,
    },
    title: {
        fontSize: theme.typography.fontSize.xxl,
        fontWeight: theme.typography.fontWeight.bold,
        marginBottom: theme.spacing.xs,
    },
    subtitle: {
        fontSize: theme.typography.fontSize.md,
        marginBottom: theme.spacing.xl,
    },
    optionsContainer: {
        gap: theme.spacing.md,
        marginBottom: theme.spacing.xl,
    },
    option: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: theme.spacing.md,
        borderRadius: theme.borderRadius.lg,
        ...theme.shadows.sm,
    },
    optionContent: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    iconContainer: {
        width: 56,
        height: 56,
        borderRadius: theme.borderRadius.md,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: theme.spacing.md,
    },
    optionText: {
        flex: 1,
    },
    optionLabel: {
        fontSize: theme.typography.fontSize.lg,
        fontWeight: theme.typography.fontWeight.semibold,
        marginBottom: 2,
    },
    optionDescription: {
        fontSize: theme.typography.fontSize.sm,
    },
    infoContainer: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        padding: theme.spacing.md,
        borderRadius: theme.borderRadius.md,
        gap: theme.spacing.sm,
    },
    infoText: {
        flex: 1,
        fontSize: theme.typography.fontSize.sm,
        lineHeight: 20,
    },
});
