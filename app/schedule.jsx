import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../constants/colors';

export default function ScheduleScreen() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.pageTitle}>Tuesday, Jan 21</Text>
        <Text style={styles.pageSubtitle}>3 classes today</Text>
      </View>

      {/* Class 1 */}
      <View style={styles.classRow}>
        <View style={styles.timeColumn}>
          <Text style={styles.timeText}>8:00</Text>
          <Text style={styles.ampmText}>AM</Text>
          <View style={[styles.dot, { backgroundColor: Colors.primary }]} />
          <View style={styles.line} />
        </View>
        <View style={styles.classCard}>
          <Text style={styles.className}>Calculus II</Text>
          <View style={styles.classMeta}>
            <Ionicons name="location-outline" size={13} color={Colors.textSecondary} />
            <Text style={styles.classMetaText}>Room 204-A · MATH 201</Text>
          </View>
          <View style={styles.badgeOk}>
            <Text style={styles.badgeOkText}>✓ Attended last 4 classes</Text>
          </View>
        </View>
      </View>

      {/* Class 2 */}
      <View style={styles.classRow}>
        <View style={styles.timeColumn}>
          <Text style={styles.timeText}>10:30</Text>
          <Text style={styles.ampmText}>AM</Text>
          <View style={[styles.dot, { backgroundColor: Colors.danger }]} />
          <View style={styles.line} />
        </View>
        <View style={styles.classCard}>
          <Text style={styles.className}>Intro to CS</Text>
          <View style={styles.classMeta}>
            <Ionicons name="location-outline" size={13} color={Colors.textSecondary} />
            <Text style={styles.classMetaText}>Lab 3, Eng Bldg · CS 101</Text>
          </View>
          <View style={styles.missedBadge}>
            <Ionicons name="alert-triangle-outline" size={13} color={Colors.danger} />
            <Text style={styles.missedBadgeText}>Missed 3 Tuesdays · +2 reminders set</Text>
          </View>
        </View>
      </View>

      {/* Class 3 */}
      <View style={styles.classRow}>
        <View style={styles.timeColumn}>
          <Text style={styles.timeText}>2:00</Text>
          <Text style={styles.ampmText}>PM</Text>
          <View style={[styles.dot, { backgroundColor: '#1D9E75' }]} />
        </View>
        <View style={styles.classCard}>
          <Text style={styles.className}>Technical Writing</Text>
          <View style={styles.classMeta}>
            <Ionicons name="location-outline" size={13} color={Colors.textSecondary} />
            <Text style={styles.classMetaText}>Rm 101-B · ENG 310</Text>
          </View>
          <View style={styles.badgeClass}>
            <Text style={styles.badgeClassText}>Task due before this</Text>
          </View>
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
  },
  header: {
    marginBottom: 24,
  },
  pageTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  pageSubtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  classRow: {
    flexDirection: 'row',
    gap: 14,
    marginBottom: 8,
  },
  timeColumn: {
    alignItems: 'center',
    width: 46,
  },
  timeText: {
    fontSize: 13,
    fontWeight: '500',
    color: Colors.textPrimary,
  },
  ampmText: {
    fontSize: 11,
    color: Colors.textSecondary,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginVertical: 4,
  },
  line: {
    width: 1,
    flex: 1,
    backgroundColor: Colors.border,
    marginBottom: -8,
  },
  classCard: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 14,
    borderWidth: 0.5,
    borderColor: Colors.border,
    marginBottom: 12,
  },
  className: {
    fontSize: 15,
    fontWeight: '500',
    color: Colors.textPrimary,
    marginBottom: 6,
  },
  classMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 8,
  },
  classMetaText: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  badgeOk: {
    backgroundColor: Colors.successLight,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  badgeOkText: {
    fontSize: 11,
    color: Colors.success,
    fontWeight: '500',
  },
  missedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.dangerLight,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  missedBadgeText: {
    fontSize: 11,
    color: Colors.danger,
    fontWeight: '500',
  },
  badgeClass: {
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  badgeClassText: {
    fontSize: 11,
    color: Colors.primary,
    fontWeight: '500',
  },
});