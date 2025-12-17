import React, { useState, useEffect } from 'react';
import {
    View,
    Image,
    TouchableOpacity,
    Text,
    StyleSheet,
    Alert,
    ActivityIndicator,
    ScrollView,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import LogoService from '../../services/LogoService';
import { theme } from '../../styles/theme';

const CHURCH_ID = 'default'; // TODO: Get from context/settings

export default function LogoUploadScreen() {
    const [logoUrl, setLogoUrl] = useState<string | null>(null);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [uploading, setUploading] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadLogo();
        requestPermissions();
    }, []);

    const requestPermissions = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permission Required', 'Please grant photo library access to upload logo');
        }
    };

    const loadLogo = async () => {
        setLoading(true);
        try {
            const url = await LogoService.getLogoUrl(CHURCH_ID);
            setLogoUrl(url);
        } catch (error) {
            console.error('Load logo error:', error);
        } finally {
            setLoading(false);
        }
    };

    const pickImage = async () => {
        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.8,
            });

            if (!result.canceled) {
                setSelectedImage(result.assets[0].uri);
            }
        } catch (error) {
            console.error('Pick image error:', error);
            Alert.alert('Error', 'Failed to pick image');
        }
    };

    const uploadLogo = async () => {
        if (!selectedImage) return;

        setUploading(true);
        try {
            const url = await LogoService.uploadLogo(CHURCH_ID, selectedImage);
            setLogoUrl(url);
            setSelectedImage(null);
            Alert.alert('Success', 'Logo uploaded successfully!');
        } catch (error) {
            console.error('Upload error:', error);
            Alert.alert('Error', 'Failed to upload logo. Please try again.');
        } finally {
            setUploading(false);
        }
    };

    const deleteLogo = () => {
        Alert.alert(
            'Delete Logo',
            'Are you sure you want to delete the church logo?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        setUploading(true);
                        try {
                            await LogoService.deleteLogo(CHURCH_ID);
                            setLogoUrl(null);
                            setSelectedImage(null);
                            Alert.alert('Success', 'Logo deleted successfully');
                        } catch (error) {
                            console.error('Delete error:', error);
                            Alert.alert('Error', 'Failed to delete logo');
                        } finally {
                            setUploading(false);
                        }
                    },
                },
            ]
        );
    };

    const cancelSelection = () => {
        setSelectedImage(null);
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
            </View>
        );
    }

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
            <Text style={styles.title}>Church Logo</Text>
            <Text style={styles.subtitle}>
                Upload a custom logo for your church. Recommended size: 512x512px
            </Text>

            {/* Logo Preview */}
            <View style={styles.previewContainer}>
                {selectedImage || logoUrl ? (
                    <Image
                        source={{ uri: selectedImage || logoUrl! }}
                        style={styles.logoPreview}
                        resizeMode="contain"
                    />
                ) : (
                    <View style={styles.placeholderContainer}>
                        <Ionicons name="church" size={80} color={theme.colors.textSecondary} />
                        <Text style={styles.placeholderText}>No logo uploaded</Text>
                    </View>
                )}
            </View>

            {/* Action Buttons */}
            {selectedImage ? (
                // Show upload/cancel when image is selected
                <View style={styles.buttonContainer}>
                    <TouchableOpacity
                        style={[styles.button, styles.uploadButton]}
                        onPress={uploadLogo}
                        disabled={uploading}
                    >
                        {uploading ? (
                            <ActivityIndicator color="#FFFFFF" />
                        ) : (
                            <>
                                <Ionicons name="cloud-upload" size={20} color="#FFFFFF" />
                                <Text style={styles.buttonText}>Upload Logo</Text>
                            </>
                        )}
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.button, styles.cancelButton]}
                        onPress={cancelSelection}
                        disabled={uploading}
                    >
                        <Ionicons name="close" size={20} color={theme.colors.text} />
                        <Text style={[styles.buttonText, styles.cancelButtonText]}>Cancel</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                // Show pick/delete when no image selected
                <View style={styles.buttonContainer}>
                    <TouchableOpacity
                        style={[styles.button, styles.pickButton]}
                        onPress={pickImage}
                        disabled={uploading}
                    >
                        <Ionicons name="images" size={20} color="#FFFFFF" />
                        <Text style={styles.buttonText}>
                            {logoUrl ? 'Change Logo' : 'Select Logo'}
                        </Text>
                    </TouchableOpacity>
                    {logoUrl && (
                        <TouchableOpacity
                            style={[styles.button, styles.deleteButton]}
                            onPress={deleteLogo}
                            disabled={uploading}
                        >
                            {uploading ? (
                                <ActivityIndicator color="#FFFFFF" />
                            ) : (
                                <>
                                    <Ionicons name="trash" size={20} color="#FFFFFF" />
                                    <Text style={styles.buttonText}>Delete Logo</Text>
                                </>
                            )}
                        </TouchableOpacity>
                    )}
                </View>
            )}

            {/* Info */}
            <View style={styles.infoContainer}>
                <Ionicons name="information-circle" size={20} color={theme.colors.primary} />
                <Text style={styles.infoText}>
                    The logo will appear in the app header and other locations throughout the app.
                </Text>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: theme.colors.background,
    },
    content: {
        padding: theme.spacing.lg,
    },
    title: {
        fontSize: theme.typography.fontSize.xxl,
        fontWeight: theme.typography.fontWeight.bold,
        color: theme.colors.text,
        marginBottom: theme.spacing.xs,
    },
    subtitle: {
        fontSize: theme.typography.fontSize.md,
        color: theme.colors.textSecondary,
        marginBottom: theme.spacing.xl,
    },
    previewContainer: {
        width: '100%',
        aspectRatio: 1,
        backgroundColor: theme.colors.surface,
        borderRadius: theme.borderRadius.lg,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: theme.spacing.xl,
        ...theme.shadows.md,
    },
    logoPreview: {
        width: '80%',
        height: '80%',
    },
    placeholderContainer: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    placeholderText: {
        fontSize: theme.typography.fontSize.md,
        color: theme.colors.textSecondary,
        marginTop: theme.spacing.md,
    },
    buttonContainer: {
        gap: theme.spacing.md,
        marginBottom: theme.spacing.xl,
    },
    button: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: theme.spacing.md,
        borderRadius: theme.borderRadius.md,
        gap: theme.spacing.sm,
        ...theme.shadows.sm,
    },
    uploadButton: {
        backgroundColor: theme.colors.primary,
    },
    pickButton: {
        backgroundColor: theme.colors.primary,
    },
    deleteButton: {
        backgroundColor: theme.colors.error,
    },
    cancelButton: {
        backgroundColor: theme.colors.surface,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    buttonText: {
        fontSize: theme.typography.fontSize.md,
        fontWeight: theme.typography.fontWeight.semibold,
        color: '#FFFFFF',
    },
    cancelButtonText: {
        color: theme.colors.text,
    },
    infoContainer: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        backgroundColor: theme.colors.surface,
        padding: theme.spacing.md,
        borderRadius: theme.borderRadius.md,
        gap: theme.spacing.sm,
    },
    infoText: {
        flex: 1,
        fontSize: theme.typography.fontSize.sm,
        color: theme.colors.textSecondary,
        lineHeight: 20,
    },
});
