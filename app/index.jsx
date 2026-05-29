import { View, Text, ScrollView, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../constants/colors';
import { useTasks } from '../store/TaskContext';
import { useClasses } from '../store/ClassContext';

export default function HomeScreen() {
  const { tasks, loading, getUrgency, getTimeLeft } = useTasks();
  const { getTodaysClasses } = useClasses();

  const todaysClasses = getTodaysClasses();
  const incompleteTasks = tasks.filter((t) => !t.completed);

  const getBadgeStyle = (urgency) => {
    if (urgency === 'urgent') return { bg: Colors.dangerLight, text: Colors.danger };
    if (urgency === 'soon') return { bg: Colors.warningLight, text: Colors.warning };
    return { bg: Colors.successLight, text: Colors.success };
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Good morning</Text>
          <Text style={styles.subGreeting}>
            {incompleteTasks.length} tasks pending · {todaysClasses.length} classes today
          </Text>
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
      {todaysClasses.length > 0 && incompleteTasks.length > 0 && (
        <View style={styles.aiCard}>
          <View style={styles.aiLabel}>
            <Ionicons name="sparkles-outline" size={14} color={Colors.primary} />
            <Text style={styles.aiLabelText}>Smart suggestion</Text>
          </View>
          <Text style={styles.aiText}>
            You have {incompleteTasks[0].estimatedMinutes} min of work on "{incompleteTasks[0].title}" before your next class. Good time to start.
          </Text>
        </View>
      )}

      {/* Tasks Section */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Pending tasks</Text>
        <TouchableOpacity>
          <Text style={styles.seeAll}>See all</Text>
        </TouchableOpacity>
      </View>

      {incompleteTasks.map((task) => {
        const urgency = getUrgency(task.deadline);
        const badge = getBadgeStyle(urgency);
        return (
          <View key={task.id} style={styles.taskCard}>
            <View style={styles.taskHeader}>
              <Text style={styles.taskTitle}>{task.title}</Text>
              <View style={[styles.badge, { backgroundColor: badge.bg }]}>
                <Text style={[styles.badgeText, { color: badge.text }]}>
                  {getTimeLeft(task.deadline)}
                </Text>
              </View>
            </View>
            <View style={styles.taskMeta}>
              <Ionicons name="time-outline" size={13} color={Colors.textSecondary} />
              <Text style={styles.taskMetaText}>~{task.estimatedMinutes} min</Text>
              <Ionicons name="trending-up-outline" size={13} color={Colors.textSecondary} />
              <Text style={styles.taskMetaText}>{task.progress}% done</Text>
            </View>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, {
                width: `${task.progress}%`,
                backgroundColor: urgency === 'urgent' ? Colors.danger : Colors.primary
              }]} />
            </View>
            {task.collaborators.length > 0 && (
              <View style={styles.collabRow}>
                {task.collaborators.map((c, i) => (
                  <View
                    key={i}
                    style={[styles.collabAvatar, {
                      backgroundColor: Colors.primaryLight,
                      marginLeft: i > 0 ? -6 : 0
                    }]}
                  >
                    <Text style={[styles.collabAvatarText, { color: Colors.primary }]}>
                      {c.initials}
                    </Text>
                  </View>
                ))}
                <Text style={styles.collabText}>{task.collaborators.length} collaborators</Text>
              </View>
            )}
          </View>
        );
      })}

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: 20, paddingTop: 60 },
  loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
  greeting: { fontSize: 22, fontWeight: '600', color: Colors.textPrimary },
  subGreeting: { fontSize: 13, color: Colors.textSecondary, marginTop: 2 },
  avatar: { width: 38, height: 38, borderRadius: 19, backgroundColor: Colors.primaryLight, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 15, fontWeight: '500', color: Colors.primary },
  weatherStrip: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.surface, borderRadius: 10, padding: 10, marginBottom: 12, borderWidth: 0.5, borderColor: Colors.border, gap: 4 },
  weatherTemp: { fontWeight: '500', color: Colors.textPrimary, fontSize: 13 },
  weatherText: { fontSize: 13, color: Colors.textSecondary },
  weatherWarning: { fontSize: 13, color: Colors.danger, fontWeight: '500' },
  aiCard: { backgroundColor: Colors.primaryLight, borderRadius: 12, padding: 14, marginBottom: 16, borderWidth: 0.5, borderColor: '#AFA9EC' },
  aiLabel: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 6 },
  aiLabelText: { fontSize: 12, fontWeight: '500', color: Colors.primary },
  aiText: { fontSize: 13, color: Colors.primaryDark, lineHeight: 20 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  sectionTitle: { fontSize: 13, fontWeight: '500', color: Colors.textSecondary },
  seeAll: { fontSize: 12, color: Colors.primary },
  taskCard: { backgroundColor: Colors.surface, borderRadius: 12, padding: 14, marginBottom: 10, borderWidth: 0.5, borderColor: Colors.border },
  taskHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 },
  taskTitle: { fontSize: 14, fontWeight: '500', color: Colors.textPrimary, flex: 1, marginRight: 8 },
  badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 },
  badgeText: { fontSize: 11, fontWeight: '500' },
  taskMeta: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 8 },
  taskMetaText: { fontSize: 12, color: Colors.textSecondary, marginRight: 6 },
  progressBar: { height: 3, backgroundColor: Colors.border, borderRadius: 2, overflow: 'hidden' },
  progressFill: { height: 3, borderRadius: 2 },
  collabRow: { flexDirection: 'row', alignItems: 'center', marginTop: 10, gap: 4 },
  collabAvatar: { width: 22, height: 22, borderRadius: 11, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: Colors.surface },
  collabAvatarText: { fontSize: 9, fontWeight: '500' },
  collabText: { fontSize: 11, color: Colors.textSecondary, marginLeft: 4 },
});