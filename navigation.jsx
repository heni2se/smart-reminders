import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import HomeScreen from './app/index';
import ScheduleScreen from './app/schedule';
import FocusScreen from './app/focus';
import InsightsScreen from './app/insights';
import COLORS, { FONTS } from './constants/colors';

const Tab = createBottomTabNavigator();

export default function AppNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarShowLabel: true,
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: styles.tabLabel,
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textMuted,
        tabBarIcon: ({ focused, color, size }) => {
          const icons = {
            Home:     focused ? 'home' : 'home-outline',
            Schedule: focused ? 'calendar' : 'calendar-outline',
            Focus:    focused ? 'timer' : 'timer-outline',
            Insights: focused ? 'bar-chart' : 'bar-chart-outline',
          };
          return (
            <View style={[styles.iconWrapper, focused && styles.iconWrapperActive]}>
              <Ionicons name={icons[route.name]} size={20} color={color} />
            </View>
          );
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Schedule" component={ScheduleScreen} />
      <Tab.Screen name="Focus" component={FocusScreen} />
      <Tab.Screen name="Insights" component={InsightsScreen} />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: COLORS.surface,
    borderTopColor: COLORS.border,
    borderTopWidth: 1,
    height: Platform.OS === 'ios' ? 88 : 64,
    paddingBottom: Platform.OS === 'ios' ? 24 : 8,
    paddingTop: 8,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: -4 },
    elevation: 12,
  },
  tabLabel: {
    fontFamily: FONTS.medium,
    fontSize: 11,
    marginTop: 2,
  },
  iconWrapper: {
    width: 40,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconWrapperActive: {
    backgroundColor: COLORS.primaryLight,
  },
});