import React from 'react';
import { View, StyleSheet } from 'react-native';
import HymnList from '../components/HymnList';
import { theme } from '../styles/theme';
import { useTheme } from '../contexts/ThemeContext';

export default function HymnScreen() {
    const { colors } = useTheme();

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <HymnList />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
});
