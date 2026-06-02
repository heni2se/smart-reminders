import AsyncStorage from '@react-native-async-storage/async-storage';

const SHARED_TASKS_KEY = 'shared_tasks';
const MY_SHARE_CODES_KEY = 'my_share_codes';

// Generate a random 6-character share code
export function generateShareCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

// Share a task — stores it with a code others can use to join
export async function shareTask(task) {
  try {
    const code = generateShareCode();
    const sharedEntry = {
      code,
      task: { ...task, shareCode: code, sharedAt: new Date().toISOString() },
    };

    const stored = await AsyncStorage.getItem(SHARED_TASKS_KEY);
    const all = stored ? JSON.parse(stored) : [];
    all.push(sharedEntry);
    await AsyncStorage.setItem(SHARED_TASKS_KEY, JSON.stringify(all));

    // Track my own share codes
    const myStored = await AsyncStorage.getItem(MY_SHARE_CODES_KEY);
    const myCodes = myStored ? JSON.parse(myStored) : [];
    myCodes.push(code);
    await AsyncStorage.setItem(MY_SHARE_CODES_KEY, JSON.stringify(myCodes));

    return code;
  } catch (error) {
    console.error('Failed to share task:', error);
    return null;
  }
}

// Join a shared task by entering its code
export async function joinSharedTask(code) {
  try {
    const stored = await AsyncStorage.getItem(SHARED_TASKS_KEY);
    const all = stored ? JSON.parse(stored) : [];
    const entry = all.find((e) => e.code === code.toUpperCase().trim());
    if (!entry) return { success: false, message: 'Code not found' };
    return { success: true, task: entry.task };
  } catch (error) {
    return { success: false, message: 'Error looking up code' };
  }
}

// Get all tasks I have shared
export async function getMySharedTasks() {
  try {
    const myStored = await AsyncStorage.getItem(MY_SHARE_CODES_KEY);
    const myCodes = myStored ? JSON.parse(myStored) : [];
    const stored = await AsyncStorage.getItem(SHARED_TASKS_KEY);
    const all = stored ? JSON.parse(stored) : [];
    return all.filter((e) => myCodes.includes(e.code)).map((e) => e.task);
  } catch (error) {
    return [];
  }
}

// Get all tasks I have joined via code
export async function getJoinedTasks() {
  try {
    const stored = await AsyncStorage.getItem('joined_tasks');
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    return [];
  }
}

// Save a joined task locally
export async function saveJoinedTask(task) {
  try {
    const stored = await AsyncStorage.getItem('joined_tasks');
    const all = stored ? JSON.parse(stored) : [];
    const already = all.find((t) => t.shareCode === task.shareCode);
    if (already) return { success: false, message: 'Already joined' };
    all.push(task);
    await AsyncStorage.setItem('joined_tasks', JSON.stringify(all));
    return { success: true };
  } catch (error) {
    return { success: false, message: 'Failed to save' };
  }
}