import React from 'react';
import { View, StyleSheet } from 'react-native';
import BibleReader from '../components/BibleReader';
import { theme } from '../styles/theme';

export default function BibleScreen({ route }: any) {
    return (
        <View style={styles.container}>
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
