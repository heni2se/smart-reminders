import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import { getAdaptiveOffset } from './behaviorEngine';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export async function requestNotificationPermission() {
  if (!Device.isDevice) return false;

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') return false;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('reminders', {
      name: 'Task Reminders',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#534AB7',
    });
  }

  return true;
}

export async function scheduleTaskReminders(task) {
  if (!Device.isDevice) return [];

  const deadline = new Date(task.deadline);
  const now = new Date();

  // Get extra buffer hours based on user's past behavior
  const adaptiveOffset = await getAdaptiveOffset();

  const scheduledIds = [];

  const times = [
    {
      // Base 24hr warning + adaptive offset
      triggerDate: new Date(
        deadline.getTime() - (24 + adaptiveOffset) * 60 * 60 * 1000
      ),
      label: adaptiveOffset > 0
        ? `${24 + adaptiveOffset} hours (adjusted for your habits)`
        : '24 hours',
    },
    {
      // Base 1hr warning + adaptive offset
      triggerDate: new Date(
        deadline.getTime() - (1 + adaptiveOffset) * 60 * 60 * 1000
      ),
      label: adaptiveOffset > 0
        ? `${1 + adaptiveOffset} hours (adjusted for your habits)`
        : '1 hour',
    },
  ];

  for (const { triggerDate, label } of times) {
    if (triggerDate > now) {
      const id = await Notifications.scheduleNotificationAsync({
        content: {
          title: `⏰ Due in ${label}: ${task.title}`,
          body: `${task.courseCode} — don't forget to submit!`,
          data: { taskId: task.id },
          sound: true,
        },
        trigger: {
          date: triggerDate,
          channelId: 'reminders',
        },
      });
      scheduledIds.push(id);
    }
  }

  return scheduledIds;
}

export async function cancelTaskReminders(notificationIds = []) {
  for (const id of notificationIds) {
    await Notifications.cancelScheduledNotificationAsync(id);
  }
}

export async function cancelAllReminders() {
  await Notifications.cancelAllScheduledNotificationsAsync();
}