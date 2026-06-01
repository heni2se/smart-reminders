import { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { TaskProvider } from './store/TaskContext';
import { ClassProvider } from './store/ClassContext';
import { requestNotificationPermission } from './services/notifications';
import AppNavigator from './navigation';

export default function App() {
  useEffect(() => {
    requestNotificationPermission();
  }, []);

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