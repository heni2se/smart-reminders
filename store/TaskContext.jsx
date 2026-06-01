import { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  scheduleTaskReminders,
  cancelTaskReminders,
} from '../services/notifications';
import { logTaskCompletion } from '../services/behaviorEngine';
const TaskContext = createContext();

const SAMPLE_TASKS = [
  {
    id: '1',
    title: 'Calculus Problem Set 4',
    courseCode: 'MATH201',
    estimatedMinutes: 90,
    deadline: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
    progress: 40,
    completed: false,
    notificationIds: [],
  },
  {
    id: '2',
    title: 'CS Lab Report',
    courseCode: 'CS101',
    estimatedMinutes: 60,
    deadline: new Date(Date.now() + 26 * 60 * 60 * 1000).toISOString(),
    progress: 10,
    completed: false,
    notificationIds: [],
  },
  {
    id: '3',
    title: 'Technical Writing Draft',
    courseCode: 'ENG310',
    estimatedMinutes: 45,
    deadline: new Date(Date.now() + 50 * 60 * 60 * 1000).toISOString(),
    progress: 75,
    completed: false,
    notificationIds: [],
  },
];

export function TaskProvider({ children }) {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    try {
      const stored = await AsyncStorage.getItem('tasks');
      if (stored) {
        setTasks(JSON.parse(stored));
      } else {
        setTasks(SAMPLE_TASKS);
        await AsyncStorage.setItem('tasks', JSON.stringify(SAMPLE_TASKS));
      }
    } catch (error) {
      setTasks(SAMPLE_TASKS);
    } finally {
      setLoading(false);
    }
  };

  const saveTasks = async (updated) => {
    try {
      await AsyncStorage.setItem('tasks', JSON.stringify(updated));
      setTasks(updated);
    } catch (error) {
      console.error('Failed to save tasks:', error);
    }
  };

  const addTask = async (newTask) => {
    // Schedule reminders and store the notification IDs with the task
    const notificationIds = await scheduleTaskReminders(newTask);
    const entry = {
      ...newTask,
      id: Date.now().toString(),
      progress: 0,
      completed: false,
      notificationIds,
    };
    await saveTasks([...tasks, entry]);
  };

  const updateProgress = async (id, progress) => {
    const updated = tasks.map((t) =>
      t.id === id ? { ...t, progress } : t
    );
    await saveTasks(updated);
  };

  const completeTask = async (id) => {
  const task = tasks.find((t) => t.id === id);
  if (task) {
    await cancelTaskReminders(task.notificationIds);
    await logTaskCompletion(task); // log behavior for adaptive engine
  }
  const updated = tasks.map((t) =>
    t.id === id ? { ...t, completed: true, progress: 100 } : t
  );
  await saveTasks(updated);
  };

  const deleteTask = async (id) => {
    const task = tasks.find((t) => t.id === id);
    if (task) await cancelTaskReminders(task.notificationIds);
    await saveTasks(tasks.filter((t) => t.id !== id));
  };

  const getUrgency = (deadline) => {
    const hours = (new Date(deadline) - new Date()) / (1000 * 60 * 60);
    if (hours < 6) return 'high';
    if (hours < 24) return 'medium';
    return 'low';
  };

  const getTimeLeft = (deadline) => {
    const diff = new Date(deadline) - new Date();
    if (diff <= 0) return 'Overdue';
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    if (hours >= 24) {
      const days = Math.floor(hours / 24);
      return `${days}d left`;
    }
    if (hours > 0) return `${hours}h ${minutes}m left`;
    return `${minutes}m left`;
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

export function useTasks() {
  return useContext(TaskContext);
}