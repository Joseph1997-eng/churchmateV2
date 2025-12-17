import React from 'react';
import { View, StyleSheet } from 'react-native';
import BulletinBoard from '../components/BulletinBoard';
import { theme } from '../styles/theme';
import { useTheme } from '../contexts/ThemeContext';

export default function BulletinScreen() {
    const { colors } = useTheme();

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <BulletinBoard />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
});
