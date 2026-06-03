import * as Calendar from 'expo-calendar';
import { Platform } from 'react-native';

// Request calendar permissions
export async function requestCalendarPermission() {
  const { status } = await Calendar.requestCalendarPermissionsAsync();
  return status === 'granted';
}

// Get all calendar events for today and the next 7 days
export async function getUpcomingEvents() {
  try {
    const granted = await requestCalendarPermission();
    if (!granted) return [];

    const calendars = await Calendar.getCalendarsAsync(
      Calendar.EntityTypes.EVENT
    );

    const calendarIds = calendars.map((c) => c.id);
    if (calendarIds.length === 0) return [];

    const start = new Date();
    start.setHours(0, 0, 0, 0);

    const end = new Date();
    end.setDate(end.getDate() + 7);
    end.setHours(23, 59, 59, 999);

    const events = await Calendar.getEventsAsync(calendarIds, start, end);

    return events
      .filter((e) => e.title && !e.allDay)
      .map((e) => ({
        id: e.id,
        title: e.title,
        startDate: e.startDate,
        endDate: e.endDate,
        location: e.location || null,
        notes: e.notes || null,
        calendarName: calendars.find((c) => c.id === e.calendarId)?.title || '',
      }))
      .sort((a, b) => new Date(a.startDate) - new Date(b.startDate));
  } catch (error) {
    console.error('Calendar error:', error);
    return [];
  }
}

// Add a task deadline as a calendar event
export async function addTaskToCalendar(task) {
  try {
    const granted = await requestCalendarPermission();
    if (!granted) return { success: false, message: 'Permission denied' };

    // Find a writable calendar
    const calendars = await Calendar.getCalendarsAsync(
      Calendar.EntityTypes.EVENT
    );

    const writable = calendars.find(
      (c) => c.allowsModifications && c.type !== 'birthday'
    );

    if (!writable) return { success: false, message: 'No writable calendar found' };

    const deadline = new Date(task.deadline);
    const startDate = new Date(deadline.getTime() - 60 * 60 * 1000); // 1hr before

    await Calendar.createEventAsync(writable.id, {
      title: `📚 ${task.title}`,
      startDate,
      endDate: deadline,
      notes: `Course: ${task.courseCode}\nEstimated: ${task.estimatedMinutes} min`,
      alarms: [{ relativeOffset: -60 }], // reminder 1hr before
    });

    return { success: true };
  } catch (error) {
    console.error('Calendar add error:', error);
    return { success: false, message: error.message };
  }
}

// Format event time for display
export function formatEventTime(dateStr) {
  return new Date(dateStr).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

// Format event date label (Today / Tomorrow / day name)
export function formatEventDateLabel(dateStr) {
  const date = new Date(dateStr);
  const today = new Date();
  const tomorrow = new Date();
  tomorrow.setDate(today.getDate() + 1);

  if (date.toDateString() === today.toDateString()) return 'Today';
  if (date.toDateString() === tomorrow.toDateString()) return 'Tomorrow';
  return date.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
}