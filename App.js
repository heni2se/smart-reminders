import { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { TaskProvider } from './store/TaskContext';
import { ClassProvider } from './store/ClassContext';
import { requestNotificationPermission } from './services/notifications';
import {
  useFonts,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from '@expo-google-fonts/inter';
import { View, ActivityIndicator } from 'react-native';
import AppNavigator from './navigation';
import COLORS from './constants/colors';

export default function App() {
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  useEffect(() => {
    requestNotificationPermission();
  }, []);

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.background }}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <TaskProvider>
      <ClassProvider>
        <NavigationContainer>
          <AppNavigator />
        </NavigationContainer>
      </ClassProvider>
    </TaskProvider>
  );
}