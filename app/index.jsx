import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../constants/colors';

export default function HomeScreen() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Good morning, Alex</Text>
          <Text style={styles.subGreeting}>3 tasks due today · Tuesday</Text>
        </View>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>A</Text>
        </View>
      </View>

      {/* Weather Strip */}
      <View style={styles.weatherStrip}>
        <Ionicons name="rainy-outline" size={18} color={Colors.primary} />
        <Text style={styles.weatherTemp}>27°C</Text>
        <Text style={styles.weatherText}>· Rain at 3 PM — </Text>
        <Text style={styles.weatherWarning}>leave early for CS101</Text>
      </View>

      {/* AI Suggestion */}
      <View style={styles.aiCard}>
        <View style={styles.aiLabel}>
          <Ionicons name="sparkles-outline" size={14} color={Colors.primary} />
          <Text style={styles.aiLabelText}>Smart suggestion</Text>
        </View>
        <Text style={styles.aiText}>
          You have 90 min before Calculus. Good window to finish your Math problem set (est. 45 min).
        </Text>
      </View>

      {/* Section Header */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Due today</Text>
        <TouchableOpacity>
          <Text style={styles.seeAll}>See all</Text>
        </TouchableOpacity>
      </View>

      {/* Task Card 1 */}
      <View style={styles.taskCard}>
        <View style={styles.taskHeader}>
          <Text style={styles.taskTitle}>Math Problem Set 4</Text>
          <View style={styles.badgeUrgent}>
            <Text style={styles.badgeUrgentText}>Due 11:59 PM</Text>
          </View>
        </View>
        <View style={styles.taskMeta}>
          <Ionicons name="time-outline" size={13} color={Colors.textSecondary} />
          <Text style={styles.taskMetaText}>~45 min left</Text>
          <Ionicons name="trending-up-outline" size={13} color={Colors.textSecondary} />
          <Text style={styles.taskMetaText}>60% done</Text>
        </View>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: '60%', backgroundColor: Colors.primary }]} />
        </View>
        <View style={styles.collabRow}>
          <View style={[styles.collabAvatar, { backgroundColor: Colors.primaryLight }]}>
            <Text style={[styles.collabAvatarText, { color: Colors.primary }]}>JM</Text>
          </View>
          <View style={[styles.collabAvatar, { backgroundColor: Colors.successLight, marginLeft: -6 }]}>
            <Text style={[styles.collabAvatarText, { color: Colors.success }]}>KS</Text>
          </View>
          <Text style={styles.collabText}>2 collaborators</Text>
        </View>
      </View>

      {/* Task Card 2 */}
      <View style={styles.taskCard}>
        <View style={styles.taskHeader}>
          <Text style={styles.taskTitle}>CS101 Lab Report</Text>
          <View style={styles.badgeSoon}>
            <Text style={styles.badgeSoonText}>Due Fri</Text>
          </View>
        </View>
        <View style={styles.taskMeta}>
          <Ionicons name="time-outline" size={13} color={Colors.textSecondary} />
          <Text style={styles.taskMetaText}>3 days left</Text>
          <Ionicons name="trending-up-outline" size={13} color={Colors.textSecondary} />
          <Text style={styles.taskMetaText}>20% done</Text>
        </View>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: '20%', backgroundColor: '#EF9F27' }]} />
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  greeting: {
    fontSize: 22,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  subGreeting: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 15,
    fontWeight: '500',
    color: Colors.primary,
  },
  weatherStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 10,
    padding: 10,
    marginBottom: 12,
    borderWidth: 0.5,
    borderColor: Colors.border,
    gap: 4,
  },
  weatherTemp: {
    fontWeight: '500',
    color: Colors.textPrimary,
    fontSize: 13,
  },
  weatherText: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  weatherWarning: {
    fontSize: 13,
    color: Colors.danger,
    fontWeight: '500',
  },
  aiCard: {
    backgroundColor: Colors.primaryLight,
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
    borderWidth: 0.5,
    borderColor: '#AFA9EC',
  },
  aiLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 6,
  },
  aiLabelText: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.primary,
  },
  aiText: {
    fontSize: 13,
    color: Colors.primaryDark,
    lineHeight: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '500',
    color: Colors.textSecondary,
  },
  seeAll: {
    fontSize: 12,
    color: Colors.primary,
  },
  taskCard: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 0.5,
    borderColor: Colors.border,
  },
  taskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  taskTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.textPrimary,
    flex: 1,
    marginRight: 8,
  },
  badgeUrgent: {
    backgroundColor: Colors.dangerLight,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
  },
  badgeUrgentText: {
    fontSize: 11,
    color: Colors.danger,
    fontWeight: '500',
  },
  badgeSoon: {
    backgroundColor: Colors.warningLight,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
  },
  badgeSoonText: {
    fontSize: 11,
    color: Colors.warning,
    fontWeight: '500',
  },
  taskMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 8,
  },
  taskMetaText: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginRight: 6,
  },
  progressBar: {
    height: 3,
    backgroundColor: Colors.border,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: 3,
    borderRadius: 2,
  },
  collabRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    gap: 4,
  },
  collabAvatar: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.surface,
  },
  collabAvatarText: {
    fontSize: 9,
    fontWeight: '500',
  },
  collabText: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginLeft: 4,
  },
});