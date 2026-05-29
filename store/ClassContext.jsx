import { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ClassContext = createContext();

const SAMPLE_CLASSES = [
  {
    id: '1',
    name: 'Calculus II',
    courseCode: 'MATH 201',
    room: 'Room 204-A',
    days: ['Monday', 'Wednesday'],
    startTime: '08:00',
    endTime: '09:30',
    color: 'primary',
    attendanceHistory: [true, true, true, true, true, true],
  },
  {
    id: '2',
    name: 'Intro to CS',
    courseCode: 'CS 101',
    room: 'Lab 3, Eng Bldg',
    days: ['Tuesday', 'Thursday'],
    startTime: '10:30',
    endTime: '12:00',
    color: 'danger',
    attendanceHistory: [true, false, true, false, true, false, true, false],
  },
  {
    id: '3',
    name: 'Technical Writing',
    courseCode: 'ENG 310',
    room: 'Rm 101-B',
    days: ['Tuesday', 'Friday'],
    startTime: '14:00',
    endTime: '15:30',
    color: 'success',
    attendanceHistory: [true, true, true, true, true],
  },
];

export function ClassProvider({ children }) {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadClasses();
  }, []);

  const loadClasses = async () => {
    try {
      const stored = await AsyncStorage.getItem('classes');
      if (stored) {
        setClasses(JSON.parse(stored));
      } else {
        setClasses(SAMPLE_CLASSES);
        await AsyncStorage.setItem('classes', JSON.stringify(SAMPLE_CLASSES));
      }
    } catch (error) {
      setClasses(SAMPLE_CLASSES);
    } finally {
      setLoading(false);
    }
  };

  const saveClasses = async (updated) => {
    try {
      await AsyncStorage.setItem('classes', JSON.stringify(updated));
      setClasses(updated);
    } catch (error) {
      console.error('Failed to save classes:', error);
    }
  };

  const addClass = async (newClass) => {
    const entry = {
      ...newClass,
      id: Date.now().toString(),
      attendanceHistory: [],
    };
    await saveClasses([...classes, entry]);
  };

  const markAttendance = async (id, attended) => {
    const updated = classes.map((c) =>
      c.id === id
        ? { ...c, attendanceHistory: [...c.attendanceHistory, attended] }
        : c
    );
    await saveClasses(updated);
  };

  // Get attendance rate as a percentage
  const getAttendanceRate = (classItem) => {
    if (!classItem.attendanceHistory.length) return 100;
    const attended = classItem.attendanceHistory.filter(Boolean).length;
    return Math.round((attended / classItem.attendanceHistory.length) * 100);
  };

  // Get today's classes sorted by start time
  const getTodaysClasses = () => {
    const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
    return classes
      .filter((c) => c.days.includes(today))
      .sort((a, b) => a.startTime.localeCompare(b.startTime));
  };

  return (
    <ClassContext.Provider
      value={{
        classes,
        loading,
        addClass,
        markAttendance,
        getAttendanceRate,
        getTodaysClasses,
      }}
    >
      {children}
    </ClassContext.Provider>
  );
}

export function useClasses() {
  return useContext(ClassContext);
}