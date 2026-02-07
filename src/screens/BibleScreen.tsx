import React from 'react';
import { View, StyleSheet } from 'react-native';
import BibleReader from '../components/BibleReader';
import { theme } from '../styles/theme';
import { useTheme } from '../contexts/ThemeContext';

interface BibleScreenProps {
    route?: unknown;
}

export default function BibleScreen({ route }: BibleScreenProps) {
    const { colors } = useTheme();
    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <BibleReader route={route} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
});
