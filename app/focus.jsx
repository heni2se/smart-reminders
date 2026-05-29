import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../constants/colors';

export default function FocusScreen() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.pageTitle}>Focus Mode</Text>
        <Text style={styles.pageSubtitle}>Working on</Text>
        <Text style={styles.taskName}>Math Problem Set 4</Text>
      </View>

      {/* Timer Ring */}
      <View style={styles.timerWrapper}>
        <View style={styles.timerRing}>
          <Text style={styles.timerText}>24:37</Text>
          <Text style={styles.timerLabel}>remaining</Text>
        </View>
      </View>

      {/* Pomodoro Info */}
      <Text style={styles.pomodoroInfo}>Pomodoro 2 of 3 · 1 break left</Text>

      {/* Controls */}
      <View style={styles.controls}>
        <TouchableOpacity style={styles.btnSecondary}>
          <Text style={styles.btnSecondaryText}>Skip break</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.btnPrimary}>
          <Ionicons name="pause" size={16} color={Colors.primaryLight} />
          <Text style={styles.btnPrimaryText}>Pause</Text>
        </TouchableOpacity>
      </View>

      {/* Collaborators Online */}
      <View style={styles.collabCard}>
        <Text style={styles.collabTitle}>Collaborators online</Text>
        <View style={styles.collabRow}>
          <View style={[styles.avatar, { backgroundColor: Colors.successLight }]}>
            <Text style={[styles.avatarText, { color: Colors.success }]}>JM</Text>
          </View>
          <View style={[styles.avatar, { backgroundColor: Colors.primaryLight, marginLeft: -6 }]}>
            <Text style={[styles.avatarText, { color: Colors.primary }]}>KS</Text>
          </View>
          <Text style={styles.collabStatus}>Both in focus mode</Text>
        </View>
      </View>

      {/* Stats Row */}
      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>3</Text>
          <Text style={styles.statLabel}>Sessions today</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>1h 20m</Text>
          <Text style={styles.statLabel}>Focus time</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>2</Text>
          <Text style={styles.statLabel}>Tasks done</Text>
        </View>
      </View>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    padding: 20,
    paddingTop: 60,
    alignItems: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  pageTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 12,
  },
  pageSubtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  taskName: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.textPrimary,
    marginTop: 4,
  },
  timerWrapper: {
    marginBottom: 16,
  },
  timerRing: {
    width: 160,
    height: 160,
    borderRadius: 80,
    borderWidth: 6,
    borderColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timerText: {
    fontSize: 36,
    fontWeight: '500',
    color: Colors.textPrimary,
  },
  timerLabel: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  pomodoroInfo: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginBottom: 20,
  },
  controls: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  btnSecondary: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
    borderWidth: 0.5,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  btnSecondaryText: {
    fontSize: 14,
    color: Colors.textPrimary,
  },
  btnPrimary: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
    backgroundColor: Colors.primary,
  },
  btnPrimaryText: {
    fontSize: 14,
    color: Colors.primaryLight,
    fontWeight: '500',
  },
  collabCard: {
    width: '100%',
    backgroundColor: Colors.successLight,
    borderRadius: 12,
    padding: 14,
    borderWidth: 0.5,
    borderColor: '#C0DD97',
    marginBottom: 16,
  },
  collabTitle: {
    fontSize: 13,
    fontWeight: '500',
    color: Colors.success,
    marginBottom: 8,
  },
  collabRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  avatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.surface,
  },
  avatarText: {
    fontSize: 10,
    fontWeight: '500',
  },
  collabStatus: {
    fontSize: 13,
    color: Colors.success,
    marginLeft: 4,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    width: '100%',
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    borderWidth: 0.5,
    borderColor: Colors.border,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: '500',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 11,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
});