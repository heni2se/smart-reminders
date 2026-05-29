import { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// 1. Create the context
const TaskContext = createContext();

// 2. Sample data so the app isn't empty on first load
const SAMPLE_TASKS = [
  {
    id: '1',
    title: 'Math Problem Set 4',
    deadline: new Date(Date.now() + 1000 * 60 * 60 * 8).toISOString(),
    estimatedMinutes: 45,
    progress: 60,
    collaborators: [
      { initials: 'JM', color: 'primary' },
      { initials: 'KS', color: 'success' },
    ],
    completed: false,
    courseCode: 'MATH 201',
  },
  {
    id: '2',
    title: 'CS101 Lab Report',
    deadline: new Date(Date.now() + 1000 * 60 * 60 * 72).toISOString(),
    estimatedMinutes: 120,
    progress: 20,
    collaborators: [],
    completed: false,
    courseCode: 'CS 101',
  },
  {
    id: '3',
    title: 'Technical Writing Essay',
    deadline: new Date(Date.now() + 1000 * 60 * 60 * 48).toISOString(),
    estimatedMinutes: 90,
    progress: 0,
    collaborators: [],
    completed: false,
    courseCode: 'ENG 310',
  },
];

// 3. The Provider — wraps the app and gives all screens access to the data
export function TaskProvider({ children }) {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load tasks from device storage when app starts
  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    try {
      const stored = await AsyncStorage.getItem('tasks');
      if (stored) {
        setTasks(JSON.parse(stored));
      } else {
        // First time opening — load sample data
        setTasks(SAMPLE_TASKS);
        await AsyncStorage.setItem('tasks', JSON.stringify(SAMPLE_TASKS));
      }
    } catch (error) {
      console.error('Failed to load tasks:', error);
      setTasks(SAMPLE_TASKS);
    } finally {
      setLoading(false);
    }
  };

  const saveTasks = async (updatedTasks) => {
    try {
      await AsyncStorage.setItem('tasks', JSON.stringify(updatedTasks));
      setTasks(updatedTasks);
    } catch (error) {
      console.error('Failed to save tasks:', error);
    }
  };

  // Add a new task
  const addTask = async (task) => {
    const newTask = {
      ...task,
      id: Date.now().toString(),
      progress: 0,
      completed: false,
      collaborators: [],
    };
    const updated = [...tasks, newTask];
    await saveTasks(updated);
  };

  // Update progress on a task
  const updateProgress = async (id, progress) => {
    const updated = tasks.map((t) =>
      t.id === id ? { ...t, progress } : t
    );
    await saveTasks(updated);
  };

  // Mark a task complete
  const completeTask = async (id) => {
    const updated = tasks.map((t) =>
      t.id === id ? { ...t, completed: true, progress: 100 } : t
    );
    await saveTasks(updated);
  };

  // Delete a task
  const deleteTask = async (id) => {
    const updated = tasks.filter((t) => t.id !== id);
    await saveTasks(updated);
  };

  // How urgent is this task? Returns 'urgent', 'soon', or 'ok'
  const getUrgency = (deadline) => {
    const hoursLeft = (new Date(deadline) - new Date()) / (1000 * 60 * 60);
    if (hoursLeft < 24) return 'urgent';
    if (hoursLeft < 72) return 'soon';
    return 'ok';
  };

  // How much time is left as readable text
  const getTimeLeft = (deadline) => {
    const hoursLeft = (new Date(deadline) - new Date()) / (1000 * 60 * 60);
    if (hoursLeft < 1) return 'Due soon';
    if (hoursLeft < 24) return `${Math.round(hoursLeft)}h left`;
    return `${Math.round(hoursLeft / 24)}d left`;
  };

  return (
    <TaskContext.Provider
      value={{
        tasks,
        loading,
        addTask,
        updateProgress,
        completeTask,
        deleteTask,
        getUrgency,
        getTimeLeft,
      }}
    >
      {children}
    </TaskContext.Provider>
  );
}

// 4. Custom hook — any screen calls useTasks() to get everything above
export function useTasks() {
  return useContext(TaskContext);
}