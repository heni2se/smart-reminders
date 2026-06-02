import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const API_KEY = process.env.EXPO_PUBLIC_WEATHER_API_KEY;
const CACHE_KEY = 'weather_cache';
const CACHE_DURATION_MS = 30 * 60 * 1000; // 30 minutes

// Get coordinates — uses browser geolocation on web, expo-location on native
function getCoordinates() {
  if (Platform.OS === 'web') {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation not supported'));
        return;
      }
      navigator.geolocation.getCurrentPosition(
        (pos) => resolve({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        }),
        (err) => reject(err),
        { timeout: 10000, enableHighAccuracy: false }
      );
    });
  } else {
    // Native — use expo-location
    const Location = require('expo-location');
    return Location.requestForegroundPermissionsAsync().then(({ status }) => {
      if (status !== 'granted') throw new Error('Permission denied');
      return Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
    }).then((loc) => ({
      latitude: loc.coords.latitude,
      longitude: loc.coords.longitude,
    }));
  }
}

export async function getWeather() {
  try {
    // Check cache first
    const cached = await AsyncStorage.getItem(CACHE_KEY);
    if (cached) {
      const { data, timestamp } = JSON.parse(cached);
      if (Date.now() - timestamp < CACHE_DURATION_MS) {
        return data;
      }
    }

    const { latitude, longitude } = await getCoordinates();

    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&units=metric`
    );

    if (!response.ok) return getFallbackWeather('Weather fetch failed');

    const raw = await response.json();
    const data = parseWeatherData(raw);

    await AsyncStorage.setItem(
      CACHE_KEY,
      JSON.stringify({ data, timestamp: Date.now() })
    );

    return data;
  } catch (error) {
    console.error('Weather error:', error.message);
    return getFallbackWeather('Could not load weather');
  }
}

function parseWeatherData(raw) {
  const temp = Math.round(raw.main.temp);
  const feelsLike = Math.round(raw.main.feels_like);
  const condition = raw.weather[0].main;
  const description = raw.weather[0].description;
  const humidity = raw.main.humidity;
  const windSpeed = Math.round(raw.wind.speed * 3.6);
  const cityName = raw.name;
  const warning = getWeatherWarning(condition, temp, windSpeed, humidity);
  const emoji = getWeatherEmoji(condition);

  return {
    temp, feelsLike, condition, description,
    humidity, windSpeed, cityName, warning, emoji,
    isReal: true,
  };
}

function getWeatherWarning(condition, temp, windSpeed, humidity) {
  if (condition === 'Thunderstorm') return 'Thunderstorm alert — stay indoors and focus on tasks';
  if (condition === 'Rain' || condition === 'Drizzle') return 'Rain today — good day to stay in and get work done';
  if (condition === 'Snow') return 'Snow expected — check if classes are cancelled';
  if (temp >= 35) return 'Extreme heat today — stay hydrated and work in cool spaces';
  if (temp <= 5) return 'Very cold today — dress warmly for classes';
  if (windSpeed >= 50) return 'Strong winds today — allow extra travel time';
  if (humidity >= 85) return 'High humidity today — take breaks and stay cool';
  if (condition === 'Clear' && temp >= 20 && temp <= 30) return 'Great weather — consider studying outside during breaks';
  return null;
}

function getWeatherEmoji(condition) {
  const map = {
    Thunderstorm: '⛈', Drizzle: '🌦', Rain: '🌧',
    Snow: '🌨', Mist: '🌫', Fog: '🌫',
    Clear: '☀️', Clouds: '☁️', Haze: '🌫',
  };
  return map[condition] || '🌤';
}

function getFallbackWeather(reason) {
  return {
    temp: null, condition: 'Unknown',
    description: reason, warning: null,
    emoji: '🌤', cityName: null, isReal: false,
  };
}