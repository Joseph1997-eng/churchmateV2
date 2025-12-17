import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import AdminDashboard from '../screens/admin/AdminDashboard';
import AddHymnScreen from '../screens/admin/AddHymnScreen';
import CreateBulletinScreen from '../screens/admin/CreateBulletinScreen';
import ChurchSettingsScreen from '../screens/admin/ChurchSettingsScreen';
import LogoUploadScreen from '../screens/admin/LogoUploadScreen';

const Stack = createStackNavigator();

export default function AdminNavigator() {
    return (
        <Stack.Navigator
            screenOptions={{
                headerShown: false,
            }}
        >
            <Stack.Screen name="AdminDashboard" component={AdminDashboard} />
            <Stack.Screen name="AddHymn" component={AddHymnScreen} />
            <Stack.Screen name="CreateBulletin" component={CreateBulletinScreen} />
            <Stack.Screen name="ChurchSettings" component={ChurchSettingsScreen} />
            <Stack.Screen name="LogoUpload" component={LogoUploadScreen} />
        </Stack.Navigator>
    );
}
