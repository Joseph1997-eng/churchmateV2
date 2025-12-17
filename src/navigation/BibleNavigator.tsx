import React from 'react';
import { TouchableOpacity } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import BibleScreen from '../screens/BibleScreen';
import BibleSearchScreen from '../screens/bible/BibleSearchScreen';
import { theme } from '../styles/theme';

const Stack = createStackNavigator();

export default function BibleNavigator() {
    return (
        <Stack.Navigator
            screenOptions={{
                headerStyle: {
                    backgroundColor: theme.colors.primary,
                },
                headerTintColor: '#FFFFFF',
                headerTitleStyle: {
                    fontWeight: '700',
                    fontSize: 18,
                },
            }}
        >
            <Stack.Screen
                name="BibleMain"
                component={BibleScreen}
                options={({ navigation }) => ({
                    headerTitle: 'Holy Bible',
                    headerRight: () => (
                        <TouchableOpacity
                            onPress={() => navigation.navigate('BibleSearch')}
                            style={{ marginRight: 16 }}
                        >
                            <Ionicons name="search" size={24} color="#FFFFFF" />
                        </TouchableOpacity>
                    ),
                })}
            />
            <Stack.Screen
                name="BibleSearch"
                component={BibleSearchScreen}
                options={{
                    headerTitle: 'Search Bible',
                    headerShown: false, // BibleSearchScreen has its own header
                }}
            />
        </Stack.Navigator>
    );
}
