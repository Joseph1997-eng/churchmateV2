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
import { Picker } from '@react-native-picker/picker';
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { theme } from '../../styles/theme';
import { db } from '../../config/firebase';

interface CreateBulletinScreenProps {
    navigation: any;
}

export default function CreateBulletinScreen({ navigation }: CreateBulletinScreenProps) {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState<'announcement' | 'event' | 'prayer' | 'general'>('announcement');
    const [priority, setPriority] = useState<'high' | 'medium' | 'low'>('medium');
    const [loading, setLoading] = useState(false);

    const handleCreateBulletin = async () => {
        // Validation
        if (!title || !description) {
            Alert.alert('Error', 'Please fill in Title and Description');
            return;
        }

        setLoading(true);
        try {
            await addDoc(collection(db, 'bulletins'), {
                title: title.trim(),
                description: description.trim(),
                category,
                priority,
                date: Timestamp.now(),
            });

            Alert.alert('Success', 'Bulletin created successfully!', [
                {
                    text: 'OK',
                    onPress: () => navigation.goBack(),
                },
            ]);
        } catch (error: any) {
            console.error('Create bulletin error:', error);
            Alert.alert('Error', error.message || 'Failed to create bulletin');
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
                <Text style={styles.headerTitle}>Create Bulletin</Text>
            </View>

            <View style={styles.form}>
                {/* Title */}
                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Title *</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="e.g., Sunday Service"
                        value={title}
                        onChangeText={setTitle}
                        placeholderTextColor={theme.colors.textSecondary}
                    />
                </View>

                {/* Category */}
                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Category *</Text>
                    <View style={styles.pickerContainer}>
                        <Picker
                            selectedValue={category}
                            onValueChange={(value) => setCategory(value)}
                            style={styles.picker}
                        >
                            <Picker.Item label="Announcement" value="announcement" />
                            <Picker.Item label="Event" value="event" />
                            <Picker.Item label="Prayer Request" value="prayer" />
                            <Picker.Item label="General" value="general" />
                        </Picker>
                    </View>
                </View>

                {/* Priority */}
                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Priority *</Text>
                    <View style={styles.pickerContainer}>
                        <Picker
                            selectedValue={priority}
                            onValueChange={(value) => setPriority(value)}
                            style={styles.picker}
                        >
                            <Picker.Item label="High" value="high" />
                            <Picker.Item label="Medium" value="medium" />
                            <Picker.Item label="Low" value="low" />
                        </Picker>
                    </View>
                </View>

                {/* Description */}
                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Description *</Text>
                    <TextInput
                        style={[styles.input, styles.textArea]}
                        placeholder="Enter bulletin details here..."
                        value={description}
                        onChangeText={setDescription}
                        multiline
                        numberOfLines={8}
                        textAlignVertical="top"
                        placeholderTextColor={theme.colors.textSecondary}
                    />
                </View>

                {/* Create Button */}
                <TouchableOpacity
                    style={[styles.createButton, loading && styles.createButtonDisabled]}
                    onPress={handleCreateBulletin}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color="#FFFFFF" />
                    ) : (
                        <>
                            <Ionicons name="create" size={20} color="#FFFFFF" />
                            <Text style={styles.createButtonText}>Create Bulletin</Text>
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
        minHeight: 120,
        paddingTop: theme.spacing.md,
    },
    pickerContainer: {
        backgroundColor: theme.colors.surface,
        borderRadius: theme.borderRadius.md,
        borderWidth: 1,
        borderColor: theme.colors.border,
        overflow: 'hidden',
    },
    picker: {
        color: theme.colors.text,
    },
    createButton: {
        backgroundColor: theme.colors.primary,
        borderRadius: theme.borderRadius.md,
        padding: theme.spacing.md,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: theme.spacing.md,
        ...theme.shadows.md,
    },
    createButtonDisabled: {
        opacity: 0.6,
    },
    createButtonText: {
        color: '#FFFFFF',
        fontSize: theme.typography.fontSize.md,
        fontWeight: theme.typography.fontWeight.semibold,
        marginLeft: theme.spacing.sm,
    },
});
