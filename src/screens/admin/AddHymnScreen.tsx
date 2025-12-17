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
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { theme } from '../../styles/theme';
import { db } from '../../config/firebase';

interface AddHymnScreenProps {
    navigation: any;
}

export default function AddHymnScreen({ navigation }: AddHymnScreenProps) {
    const [number, setNumber] = useState('');
    const [title, setTitle] = useState('');
    const [lyrics, setLyrics] = useState('');
    const [category, setCategory] = useState('');
    const [loading, setLoading] = useState(false);

    const handleAddHymn = async () => {
        // Validation
        if (!number || !title || !lyrics) {
            Alert.alert('Error', 'Please fill in Number, Title, and Lyrics');
            return;
        }

        const hymnNumber = parseInt(number);
        if (isNaN(hymnNumber) || hymnNumber <= 0) {
            Alert.alert('Error', 'Hymn number must be a positive number');
            return;
        }

        setLoading(true);
        try {
            await addDoc(collection(db, 'hymns'), {
                number: hymnNumber,
                title: title.trim(),
                lyrics: lyrics.trim(),
                category: category.trim() || 'General',
                createdAt: Timestamp.now(),
            });

            Alert.alert('Success', 'Hymn added successfully!', [
                {
                    text: 'OK',
                    onPress: () => navigation.goBack(),
                },
            ]);
        } catch (error: any) {
            console.error('Add hymn error:', error);
            Alert.alert('Error', error.message || 'Failed to add hymn');
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
                <Text style={styles.headerTitle}>Add New Hymn</Text>
            </View>

            <View style={styles.form}>
                {/* Hymn Number */}
                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Hymn Number *</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="e.g., 1"
                        value={number}
                        onChangeText={setNumber}
                        keyboardType="numeric"
                        placeholderTextColor={theme.colors.textSecondary}
                    />
                </View>

                {/* Title */}
                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Title *</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="e.g., Amazing Grace"
                        value={title}
                        onChangeText={setTitle}
                        placeholderTextColor={theme.colors.textSecondary}
                    />
                </View>

                {/* Category */}
                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Category</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="e.g., Praise, Worship, Gospel"
                        value={category}
                        onChangeText={setCategory}
                        placeholderTextColor={theme.colors.textSecondary}
                    />
                </View>

                {/* Lyrics */}
                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Lyrics *</Text>
                    <TextInput
                        style={[styles.input, styles.textArea]}
                        placeholder="Enter hymn lyrics here..."
                        value={lyrics}
                        onChangeText={setLyrics}
                        multiline
                        numberOfLines={10}
                        textAlignVertical="top"
                        placeholderTextColor={theme.colors.textSecondary}
                    />
                </View>

                {/* Add Button */}
                <TouchableOpacity
                    style={[styles.addButton, loading && styles.addButtonDisabled]}
                    onPress={handleAddHymn}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color="#FFFFFF" />
                    ) : (
                        <>
                            <Ionicons name="add-circle" size={20} color="#FFFFFF" />
                            <Text style={styles.addButtonText}>Add Hymn</Text>
                        </>
                    )}
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
        borderRadius: theme.borderRadius.md,
        padding: theme.spacing.md,
        fontSize: theme.typography.fontSize.md,
        color: theme.colors.text,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    textArea: {
        minHeight: 150,
        paddingTop: theme.spacing.md,
    },
    addButton: {
        backgroundColor: theme.colors.primary,
        borderRadius: theme.borderRadius.md,
        padding: theme.spacing.md,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: theme.spacing.md,
        ...theme.shadows.md,
    },
    addButtonDisabled: {
        opacity: 0.6,
    },
    addButtonText: {
        color: '#FFFFFF',
        fontSize: theme.typography.fontSize.md,
        fontWeight: theme.typography.fontWeight.semibold,
        marginLeft: theme.spacing.sm,
    },
});
