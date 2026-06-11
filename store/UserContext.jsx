import { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const UserContext = createContext();

export function UserProvider({ children }) {
  const [userName, setUserName] = useState('');
  const [avatarColor, setAvatarColor] = useState('#534AB7');

  useEffect(() => {
    async function load() {
      try {
        const stored = await AsyncStorage.getItem('user_profile');
        if (stored) {
          const { name, color } = JSON.parse(stored);
          if (name) setUserName(name);
          if (color) setAvatarColor(color);
        }
      } catch (e) {}
    }
    load();
  }, []);

  async function saveProfile(name, color) {
    setUserName(name);
    setAvatarColor(color);
    await AsyncStorage.setItem('user_profile', JSON.stringify({ name, color }));
  }

  return (
    <UserContext.Provider value={{ userName, avatarColor, saveProfile }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
}