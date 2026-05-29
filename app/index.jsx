import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { useTasks } from "../store/TaskContext";
import { useClasses } from "../store/ClassContext";
import AddTaskModal from "../components/AddTaskModal";
import COLORS from "../constants/colors";

export default function HomeScreen() {
  const { tasks, getUrgency, getTimeLeft, loading } = useTasks();
  const { getTodaysClasses } = useClasses();
  const todaysClasses = getTodaysClasses();

  const [modalVisible, setModalVisible] = useState(false);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  // Pick the most urgent incomplete task for the AI suggestion card
  const topTask = tasks.find((t) => !t.completed);

  return (
    <View style={styles.wrapper}>

      {/* Modal — sits here but only shows when modalVisible = true */}
      <AddTaskModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
      />

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Header ── */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Good morning 👋</Text>
            <Text style={styles.subGreeting}>Let's get things done.</Text>
          </View>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>U</Text>
          </View>
        </View>

        {/* ── Weather strip ── */}
        <View style={styles.weatherStrip}>
          <Text style={styles.weatherText}>🌧 Rain expected at 3PM — move outdoor tasks earlier</Text>
        </View>

        {/* ── AI Suggestion Card ── */}
        {topTask && (
          <View style={styles.aiCard}>
            <Text style={styles.aiLabel}>AI SUGGESTION</Text>
            <Text style={styles.aiTitle}>Start "{topTask.title}" now</Text>
            <Text style={styles.aiSub}>
              ~{topTask.estimatedMinutes} min · {getTimeLeft(topTask.deadline)}
            </Text>
          </View>
        )}

        {/* ── Today's Classes ── */}
        {todaysClasses.length > 0 && (
          <>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Today's Classes</Text>
            </View>
            {todaysClasses.map((cls) => (
              <View key={cls.id} style={[styles.classCard, { borderLeftColor: cls.color }]}>
                <Text style={styles.classTitle}>{cls.name}</Text>
                <Text style={styles.classMeta}>
                  {cls.courseCode} · {cls.room} · {cls.startTime}–{cls.endTime}
                </Text>
              </View>
            ))}
          </>
        )}

        {/* ── Tasks ── */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Your Tasks</Text>
          <Text style={styles.seeAll}>See all</Text>
        </View>

        {tasks.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No tasks yet. Tap + to add one!</Text>
          </View>
        ) : (
          tasks.map((task) => {
            const urgency = getUrgency(task.deadline);
            const timeLeft = getTimeLeft(task.deadline);
            const urgencyColor =
              urgency === "high"
                ? COLORS.danger
                : urgency === "medium"
                ? COLORS.warning
                : COLORS.success;
            const urgencyBg =
              urgency === "high"
                ? COLORS.dangerLight
                : urgency === "medium"
                ? COLORS.warningLight
                : COLORS.successLight;

            return (
              <View key={task.id} style={styles.taskCard}>
                {/* Top row: title + urgency badge */}
                <View style={styles.taskTopRow}>
                  <Text style={styles.taskTitle} numberOfLines={1}>
                    {task.title}
                  </Text>
                  <View style={[styles.urgencyBadge, { backgroundColor: urgencyBg }]}>
                    <Text style={[styles.urgencyText, { color: urgencyColor }]}>
                      {urgency.toUpperCase()}
                    </Text>
                  </View>
                </View>

                {/* Meta row: course + time left */}
                <Text style={styles.taskMeta}>
                {task.courseCode} · Due {new Date(task.deadline).toLocaleString("en-US", {
                    month: "short",
                    day: "numeric",
                    hour: "numeric",
                    minute: "2-digit",
                    hour12: true,
                })} · {timeLeft}
                </Text>

                {/* Progress bar */}
                <View style={styles.progressBarBg}>
                  <View
                    style={[
                      styles.progressBarFill,
                      {
                        width: `${task.progress || 0}%`,
                        backgroundColor: COLORS.primary,
                      },
                    ]}
                  />
                </View>
                <Text style={styles.progressLabel}>{task.progress || 0}% complete</Text>
              </View>
            );
          })
        )}

        {/* Bottom padding so FAB doesn't cover last card */}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* ── Floating "+" Button ── */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => setModalVisible(true)}
        activeOpacity={0.85}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>

    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.background,
  },
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingTop: 56,
  },

  // Header
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  greeting: {
    fontSize: 24,
    fontWeight: "700",
    color: COLORS.textPrimary,
  },
  subGreeting: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },

  // Weather
  weatherStrip: {
    backgroundColor: COLORS.primaryLight,
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  weatherText: {
    fontSize: 13,
    color: COLORS.primaryDark,
    fontWeight: "500",
  },

  // AI Card
  aiCard: {
    backgroundColor: COLORS.primary,
    borderRadius: 16,
    padding: 18,
    marginBottom: 24,
  },
  aiLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: "rgba(255,255,255,0.7)",
    letterSpacing: 1,
    marginBottom: 6,
  },
  aiTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 4,
  },
  aiSub: {
    fontSize: 13,
    color: "rgba(255,255,255,0.8)",
  },

  // Section headers
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: COLORS.textPrimary,
  },
  seeAll: {
    fontSize: 13,
    color: COLORS.primary,
    fontWeight: "600",
  },

  // Class cards
  classCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderLeftWidth: 4,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  classTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: COLORS.textPrimary,
    marginBottom: 3,
  },
  classMeta: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },

  // Task cards
  taskCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  taskTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  taskTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: COLORS.textPrimary,
    flex: 1,
    marginRight: 8,
  },
  urgencyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  urgencyText: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  taskMeta: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: 10,
  },
  progressBarBg: {
    height: 6,
    backgroundColor: COLORS.border,
    borderRadius: 3,
    overflow: "hidden",
  },
  progressBarFill: {
    height: 6,
    borderRadius: 3,
  },
  progressLabel: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 4,
  },

  // Empty state
  emptyState: {
    alignItems: "center",
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 15,
    color: COLORS.textMuted,
  },

  // Floating action button
  fab: {
    position: "absolute",
    bottom: 32,
    right: 24,
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: COLORS.primary,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: COLORS.primary,
    shadowOpacity: 0.4,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  },
  fabText: {
    color: "#fff",
    fontSize: 28,
    fontWeight: "300",
    lineHeight: 32,
  },
});