import { NavigationContainer } from '@react-navigation/native';
import Navigation from './navigation';
import { TaskProvider } from './store/TaskContext';
import { ClassProvider } from './store/ClassContext';

export default function App() {
  return (
    <TaskProvider>
      <ClassProvider>
        <NavigationContainer>
          <Navigation />
        </NavigationContainer>
      </ClassProvider>
    </TaskProvider>
  );
}