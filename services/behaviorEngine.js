import AsyncStorage from '@react-native-async-storage/async-storage';

const BEHAVIOR_KEY = 'behavior_log';
const MAX_LOG_SIZE = 20; // only keep last 20 completed tasks for analysis

// Called when a task is completed — logs how early/late it was finished
export async function logTaskCompletion(task) {
  try {
    const deadline = new Date(task.deadline);
    const completedAt = new Date();
    const hoursBeforeDeadline = (deadline - completedAt) / (1000 * 60 * 60);

    const entry = {
      taskId: task.id,
      courseCode: task.courseCode,
      estimatedMinutes: task.estimatedMinutes,
      hoursBeforeDeadline, // positive = finished early, negative = finished late
      completedAt: completedAt.toISOString(),
    };

    const stored = await AsyncStorage.getItem(BEHAVIOR_KEY);
    const log = stored ? JSON.parse(stored) : [];

    // Keep only the most recent entries
    const updated = [...log, entry].slice(-MAX_LOG_SIZE);
    await AsyncStorage.setItem(BEHAVIOR_KEY, JSON.stringify(updated));

    return entry;
  } catch (error) {
    console.error('Failed to log behavior:', error);
  }
}

// Analyze the log and return how many extra hours of buffer this user needs
export async function getAdaptiveOffset() {
  try {
    const stored = await AsyncStorage.getItem(BEHAVIOR_KEY);
    if (!stored) return 0;

    const log = JSON.parse(stored);
    if (log.length < 3) return 0; // not enough data yet

    const avg =
      log.reduce((sum, e) => sum + e.hoursBeforeDeadline, 0) / log.length;

    // avg > 2  → user finishes well ahead → no extra buffer needed
    // avg 0-2  → user cuts it close → add 2hr buffer
    // avg < 0  → user misses deadlines → add 4hr buffer
    if (avg > 2) return 0;
    if (avg >= 0) return 2;
    return 4;
  } catch (error) {
    return 0;
  }
}

// Returns a human-readable summary of the user's behavior pattern
export async function getBehaviorSummary() {
  try {
    const stored = await AsyncStorage.getItem(BEHAVIOR_KEY);
    if (!stored) return null;

    const log = JSON.parse(stored);
    if (log.length < 3) return null;

    const avg =
      log.reduce((sum, e) => sum + e.hoursBeforeDeadline, 0) / log.length;

    const lateCount = log.filter((e) => e.hoursBeforeDeadline < 0).length;
    const latePercent = Math.round((lateCount / log.length) * 100);

    return {
      avgHoursBeforeDeadline: Math.round(avg * 10) / 10,
      latePercent,
      totalTracked: log.length,
      pattern:
        avg > 4
          ? 'Early finisher 🟢'
          : avg > 1
          ? 'On track 🟡'
          : avg > 0
          ? 'Cutting it close 🟠'
          : 'Often late 🔴',
    };
  } catch (error) {
    return null;
  }
}

// Get per-course breakdown of behavior
export async function getCourseBreakdown() {
  try {
    const stored = await AsyncStorage.getItem(BEHAVIOR_KEY);
    if (!stored) return [];

    const log = JSON.parse(stored);
    const courses = {};

    for (const entry of log) {
      if (!courses[entry.courseCode]) {
        courses[entry.courseCode] = { total: 0, sumHours: 0, late: 0 };
      }
      courses[entry.courseCode].total++;
      courses[entry.courseCode].sumHours += entry.hoursBeforeDeadline;
      if (entry.hoursBeforeDeadline < 0) courses[entry.courseCode].late++;
    }

    return Object.entries(courses).map(([code, data]) => ({
      courseCode: code,
      avgHoursBeforeDeadline: Math.round((data.sumHours / data.total) * 10) / 10,
      latePercent: Math.round((data.late / data.total) * 100),
      totalTracked: data.total,
    }));
  } catch (error) {
    return [];
  }
}