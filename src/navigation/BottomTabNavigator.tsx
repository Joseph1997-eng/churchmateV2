import React, { useMemo, useState } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { TouchableOpacity, View, Text, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { theme } from '../styles/theme';

const Tab = createBottomTabNavigator();

export default function BottomTabNavigator() {
    const { isAdmin } = useAuth();
    const { colors } = useTheme();
    const screenOptions = useMemo(() => ({
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: {
            backgroundColor: colors.surface,
            borderTopColor: colors.border,
            borderTopWidth: 1,
            paddingBottom: 8,
            paddingTop: 8,
            height: 60,
        },
        headerStyle: {
            backgroundColor: colors.surface,
        },
        headerTintColor: colors.text,
        headerRight: () => <ThemeToggleButton />,
        tabBarLabelStyle: {
            fontSize: theme.typography.fontSize.sm,
            fontWeight: theme.typography.fontWeight.medium,
        },
        headerTitleStyle: {
            fontWeight: theme.typography.fontWeight.bold,
            fontSize: theme.typography.fontSize.lg,
        },
    }), [colors]);

    return (
        <Tab.Navigator
            screenOptions={screenOptions}
            lazy
        >
            <Tab.Screen
                name="Bible"
                getComponent={() => require('./BibleNavigator').default}
                options={{
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="book" size={size} color={color} />
                    ),
                    headerShown: false, // BibleNavigator has its own header
                }}
            />
            <Tab.Screen
                name="Bookmarks"
                getComponent={() => require('../screens/bible/BookmarksScreen').default}
                options={{
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="bookmark" size={size} color={color} />
                    ),
                    headerTitle: 'My Bookmarks',
                }}
            />
            <Tab.Screen
                name="Hymns"
                getComponent={() => require('../screens/HymnScreen').default}
                options={{
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="musical-notes" size={size} color={color} />
                    ),
                    headerTitle: 'Hymns',
                }}
            />
            <Tab.Screen
                name="Bulletin"
                getComponent={() => require('../screens/BulletinScreen').default}
                options={{
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="newspaper" size={size} color={color} />
                    ),
                    headerTitle: 'Church Bulletin',
                }}
            />
            <Tab.Screen
                name="Profile"
                getComponent={() => require('../screens/auth/ProfileScreen').default}
                options={{
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="person" size={size} color={color} />
                    ),
                    headerTitle: 'My Profile',
                    headerRight: () => <ThemeToggleButton />,
                }}
            />
            {isAdmin && (
                <Tab.Screen
                    name="Admin"
                    getComponent={() => require('./AdminNavigator').default}
                    options={{
                        tabBarIcon: ({ color, size }) => (
                            <Ionicons name="shield-checkmark" size={size} color={color} />
                        ),
                        headerTitle: 'Admin Dashboard',
                        headerShown: false,
                    }}
                />
            )}
        </Tab.Navigator>
    );
}

// Theme Toggle Button Component
function ThemeToggleButton() {
    const { colors, themeMode, setThemeMode } = useTheme();
    const [showModal, setShowModal] = useState(false);

    const getIcon = () => {
        if (themeMode === 'dark') return 'moon';
        if (themeMode === 'light') return 'sunny';
        return 'phone-portrait';
    };

    return (
        <>
            <TouchableOpacity
                onPress={() => setShowModal(true)}
                style={{ marginRight: 16, padding: 8 }}
            >
                <Ionicons name={getIcon()} size={24} color={colors.primary} />
            </TouchableOpacity>

            <Modal
                visible={showModal}
                transparent
                animationType="fade"
                onRequestClose={() => setShowModal(false)}
            >
                <TouchableOpacity
                    style={{
                        flex: 1,
                        backgroundColor: 'rgba(0,0,0,0.5)',
                        justifyContent: 'center',
                        alignItems: 'center',
                    }}
                    activeOpacity={1}
                    onPress={() => setShowModal(false)}
                >
                    <View
                        style={{
                            backgroundColor: colors.surface,
                            borderRadius: 16,
                            padding: 20,
                            width: '80%',
                            maxWidth: 300,
                        }}
                        onStartShouldSetResponder={() => true}
                    >
                        <Text style={{ fontSize: 20, fontWeight: 'bold', color: colors.text, marginBottom: 16 }}>
                            Choose Theme
                        </Text>

                        {(['light', 'dark', 'system'] as const).map((mode) => (
                            <TouchableOpacity
                                key={mode}
                                onPress={() => {
                                    setThemeMode(mode);
                                    setShowModal(false);
                                }}
                                style={{
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    padding: 12,
                                    borderRadius: 8,
                                    backgroundColor: themeMode === mode ? colors.primary + '20' : 'transparent',
                                    marginBottom: 8,
                                }}
                            >
                                <Ionicons
                                    name={mode === 'light' ? 'sunny' : mode === 'dark' ? 'moon' : 'phone-portrait'}
                                    size={24}
                                    color={themeMode === mode ? colors.primary : colors.textSecondary}
                                />
                                <Text style={{ marginLeft: 12, fontSize: 16, color: colors.text, textTransform: 'capitalize' }}>
                                    {mode}
                                </Text>
                                {themeMode === mode && (
                                    <Ionicons name="checkmark-circle" size={20} color={colors.primary} style={{ marginLeft: 'auto' }} />
                                )}
                            </TouchableOpacity>
                        ))}
                    </View>
                </TouchableOpacity>
            </Modal>
        </>
    );
}
