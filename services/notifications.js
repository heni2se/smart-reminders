import { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ClassContext = createContext();

const SAMPLE_CLASSES = [
  {
    id: '1',
    name: 'Calculus II',
    courseCode: 'MATH201',
    room: 'Room 204-A',
    days: ['Mon', 'Wed'],
    startTime: '8:00 AM',
    endTime: '9:30 AM',
    color: '#534AB7',
    attendanceHistory: [true, true, true, true, true, true],
  },
  {
    id: '2',
    name: 'Intro to CS',
    courseCode: 'CS101',
    room: 'Lab 3, Eng Bldg',
    days: ['Tue', 'Thu'],
    startTime: '10:30 AM',
    endTime: '12:00 PM',
    color: '#A32D2D',
    attendanceHistory: [true, false, true, false, true, false, true, false],
  },
  {
    id: '3',
    name: 'Technical Writing',
    courseCode: 'ENG310',
    room: 'Rm 101-B',
    days: ['Tue', 'Fri'],
    startTime: '2:00 PM',
    endTime: '3:30 PM',
    color: '#3B6D11',
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
    const updated = [...classes, entry];
    await saveClasses(updated);
  };

  const markAttendance = async (id, attended) => {
    const updated = classes.map((c) =>
      c.id === id
        ? { ...c, attendanceHistory: [...c.attendanceHistory, attended] }
        : c
    );
    await saveClasses(updated);
  };

  const getAttendanceRate = (classItem) => {
    if (!classItem.attendanceHistory.length) return 100;
    const attended = classItem.attendanceHistory.filter(Boolean).length;
    return Math.round((attended / classItem.attendanceHistory.length) * 100);
  };

  // Uses short day names to match what AddClassModal saves: "Mon", "Tue", etc.
  const getTodaysClasses = () => {
    const today = new Date().toLocaleDateString('en-US', { weekday: 'short' });
    return classes.filter((c) => c.days.includes(today));
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