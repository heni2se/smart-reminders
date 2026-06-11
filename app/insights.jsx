import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import {
  getBehaviorSummary,
  getCourseBreakdown,
  getAdaptiveOffset,
} from "../services/behaviorEngine";
import { useTasks } from "../store/TaskContext";
import { useClasses } from "../store/ClassContext";
import COLORS from "../constants/colors";

export default function InsightsScreen() {
  const [summary, setSummary] = useState(null);
  const [courseBreakdown, setCourseBreakdown] = useState([]);
  const [adaptiveOffset, setAdaptiveOffset] = useState(0);
  const [activeTab, setActiveTab] = useState("overview");

  const { tasks, getUrgency, toggleComplete } = useTasks();
  const { classes, getAttendanceRate } = useClasses();

  useEffect(() => {
    async function load() {
      const s = await getBehaviorSummary();
      const c = await getCourseBreakdown();
      const o = await getAdaptiveOffset();
      setSummary(s);
      setCourseBreakdown(c);
      setAdaptiveOffset(o);
    }
    load();
  }, []);

  // Compute task stats
  const incompleteTasks = tasks.filter((t) => !t.completed);
  const completedTasks = tasks.filter((t) => t.completed);
  const overdueTasks = incompleteTasks.filter(
    (t) => new Date(t.deadline) < new Date()
  );
  const highUrgencyTasks = incompleteTasks.filter(
    (t) => getUrgency(t.deadline) === "high"
  );

  // Compute attendance stats
  const atRiskClasses = classes.filter(
    (c) => getAttendanceRate(c) < 80
  );

  // Generate AI recommendations based on all data
  function getRecommendations() {
    const recs = [];

    if (overdueTasks.length > 0) {
      recs.push({
        type: "danger",
        icon: "🚨",
        title: "Overdue tasks",
        body: `You have ${overdueTasks.length} overdue task${overdueTasks.length > 1 ? "s" : ""}. Address these immediately.`,
      });
    }

    if (highUrgencyTasks.length > 0) {
      recs.push({
        type: "warning",
        icon: "⏰",
        title: "High urgency tasks due soon",
        body: `${highUrgencyTasks.map((t) => t.title).join(", ")} ${highUrgencyTasks.length === 1 ? "is" : "are"} due within 6 hours.`,
      });
    }

    if (atRiskClasses.length > 0) {
      recs.push({
        type: "warning",
        icon: "📉",
        title: "Attendance at risk",
        body: `${atRiskClasses.map((c) => c.courseCode).join(", ")} ${atRiskClasses.length === 1 ? "is" : "are"} below 80% attendance.`,
      });
    }

    if (adaptiveOffset >= 4) {
      recs.push({
        type: "warning",
        icon: "🔁",
        title: "Chronic late submissions",
        body: "Your reminders have been shifted +4h earlier based on your habits. Try starting tasks sooner.",
      });
    } else if (adaptiveOffset === 2) {
      recs.push({
        type: "info",
        icon: "📌",
        title: "Cutting it close",
        body: "You tend to finish tasks just before deadlines. Reminders adjusted +2h to give you more buffer.",
      });
    }

    if (completedTasks.length >= 5 && overdueTasks.length === 0) {
      recs.push({
        type: "success",
        icon: "🏆",
        title: "Great momentum",
        body: `You've completed ${completedTasks.length} tasks with no overdue items. Keep it up!`,
      });
    }

    if (recs.length === 0) {
      recs.push({
        type: "success",
        icon: "✅",
        title: "All caught up",
        body: "No urgent issues. Stay consistent and keep checking your schedule.",
      });
    }

    return recs;
  }

  const recommendations = getRecommendations();

  const recColors = {
    danger: { bg: COLORS.dangerLight, color: COLORS.danger, border: COLORS.danger },
    warning: { bg: COLORS.warningLight, color: COLORS.warning, border: COLORS.warning },
    success: { bg: COLORS.successLight, color: COLORS.success, border: COLORS.success },
    info: { bg: COLORS.primaryLight, color: COLORS.primary, border: COLORS.primary },
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>

      <Text style={styles.pageTitle}>Insights</Text>

      {/* ── Tab selector ── */}
      <View style={styles.tabRow}>
        {["overview", "tasks", "attendance"].map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.tabActive]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* ══ OVERVIEW TAB ══ */}
      {activeTab === "overview" && (
        <>
          {/* Behavior summary card */}
          {summary ? (
            <View style={styles.summaryCard}>
              <Text style={styles.summaryLabel}>YOUR PATTERN</Text>
              <Text style={styles.summaryPattern}>{summary.pattern}</Text>
              <Text style={styles.summaryDetail}>
                Avg. {summary.avgHoursBeforeDeadline}h before deadline · {summary.latePercent}% submitted late
              </Text>
              <Text style={styles.summaryDetail}>
                Based on {summary.totalTracked} completed tasks
              </Text>
              {adaptiveOffset > 0 && (
                <View style={styles.offsetBadge}>
                  <Text style={styles.offsetBadgeText}>
                    ⚡ Reminders adjusted +{adaptiveOffset}h for your habits
                  </Text>
                </View>
              )}
            </View>
          ) : (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyTitle}>No behavior data yet</Text>
              <Text style={styles.emptyText}>
                Complete a few tasks and your patterns will appear here.
              </Text>
            </View>
          )}

          {/* Quick stats row */}
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{incompleteTasks.length}</Text>
              <Text style={styles.statLabel}>Pending</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={[styles.statValue, overdueTasks.length > 0 && { color: COLORS.danger }]}>
                {overdueTasks.length}
              </Text>
              <Text style={styles.statLabel}>Overdue</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{completedTasks.length}</Text>
              <Text style={styles.statLabel}>Completed</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={[styles.statValue, atRiskClasses.length > 0 && { color: COLORS.warning }]}>
                {atRiskClasses.length}
              </Text>
              <Text style={styles.statLabel}>At-risk classes</Text>
            </View>
          </View>

          {/* AI Recommendations */}
          <Text style={styles.sectionTitle}>Recommendations</Text>
          {recommendations.map((rec, i) => {
            const c = recColors[rec.type];
            return (
              <View key={i} style={[styles.recCard, {
                backgroundColor: c.bg,
                borderLeftColor: c.border,
              }]}>
                <Text style={styles.recTitle}>
                  {rec.icon} {rec.title}
                </Text>
                <Text style={[styles.recBody, { color: c.color }]}>
                  {rec.body}
                </Text>
              </View>
            );
          })}
        </>
      )}

      {/* ══ TASKS TAB ══ */}
      {activeTab === "tasks" && (
        <>
          <Text style={styles.sectionTitle}>By Course</Text>
          {courseBreakdown.length === 0 ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyText}>
                Complete tasks to see course-level breakdown.
              </Text>
            </View>
          ) : (
            courseBreakdown.map((course) => (
              <View key={course.courseCode} style={styles.courseCard}>
                <View style={styles.courseTopRow}>
                  <Text style={styles.courseCode}>{course.courseCode}</Text>
                  <Text style={[
                    styles.courseLate,
                    { color: course.latePercent > 50 ? COLORS.danger : COLORS.success },
                  ]}>
                    {course.latePercent}% late
                  </Text>
                </View>
                <Text style={styles.courseDetail}>
                  Avg. {course.avgHoursBeforeDeadline}h before deadline · {course.totalTracked} tasks tracked
                </Text>
                <View style={styles.progressBg}>
                  <View style={[styles.progressFill, {
                    width: `${Math.min(100, 100 - course.latePercent)}%`,
                    backgroundColor: course.latePercent > 50 ? COLORS.danger : COLORS.success,
                  }]} />
                </View>
              </View>
            ))
          )}

          <Text style={styles.sectionTitle}>All Tasks</Text>
          {tasks.length === 0 ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyText}>No tasks yet.</Text>
            </View>
          ) : (
            tasks.map((task) => {
              const urgency = getUrgency(task.deadline);
              const urgencyColor =
                task.completed ? COLORS.textMuted :
                urgency === "high" ? COLORS.danger :
                urgency === "medium" ? COLORS.warning :
                COLORS.success;
              return (
                <View key={task.id} style={[styles.taskRow, task.completed && { opacity: 0.5 }]}>
                  <TouchableOpacity
                    onPress={() => toggleComplete(task.id)}
                    style={[styles.completeCircle, task.completed && styles.completeCircleDone]}
                  >
                    {task.completed && <Text style={styles.completeCheck}>✓</Text>}
                  </TouchableOpacity>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.taskRowTitle, task.completed && { textDecorationLine: "line-through", color: COLORS.textMuted }]} numberOfLines={1}>
                      {task.title}
                    </Text>
                    <Text style={styles.taskRowMeta}>{task.courseCode} · {task.progress}% done</Text>
                  </View>
                </View>
              );
            })
          )}
        </>
      )}

      {/* ══ ATTENDANCE TAB ══ */}
      {activeTab === "attendance" && (
        <>
          <Text style={styles.sectionTitle}>Attendance by Class</Text>
          {classes.length === 0 ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyText}>No classes added yet.</Text>
            </View>
          ) : (
            classes.map((cls) => {
              const rate = getAttendanceRate(cls);
              const color =
                rate >= 80 ? COLORS.success :
                rate >= 60 ? COLORS.warning :
                COLORS.danger;
              const sessionsAttended = cls.attendanceHistory.filter(Boolean).length;
              const totalSessions = cls.attendanceHistory.length;

              return (
                <View key={cls.id} style={styles.attendanceCard}>
                  <View style={styles.attendanceTopRow}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.attendanceName}>{cls.name}</Text>
                      <Text style={styles.attendanceCode}>{cls.courseCode}</Text>
                    </View>
                    <Text style={[styles.attendanceRate, { color }]}>{rate}%</Text>
                  </View>
                  <View style={styles.progressBg}>
                    <View style={[styles.progressFill, {
                      width: `${rate}%`,
                      backgroundColor: color,
                    }]} />
                  </View>
                  <Text style={styles.attendanceDetail}>
                    {sessionsAttended} of {totalSessions} sessions attended
                    {rate < 80 ? " — ⚠️ at risk" : ""}
                  </Text>
                </View>
              );
            })
          )}
        </>
      )}

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: 20, paddingTop: 56 },
  pageTitle: {
    fontSize: 26, fontWeight: "700",
    color: COLORS.textPrimary, marginBottom: 20,
  },
  tabRow: {
    flexDirection: "row", gap: 8,
    marginBottom: 20,
  },
  tab: {
    flex: 1, paddingVertical: 8, borderRadius: 10,
    backgroundColor: COLORS.surface, alignItems: "center",
    borderWidth: 1, borderColor: COLORS.border,
  },
  tabActive: {
    backgroundColor: COLORS.primary, borderColor: COLORS.primary,
  },
  tabText: { fontSize: 13, fontWeight: "600", color: COLORS.textSecondary },
  tabTextActive: { color: "#fff" },
  summaryCard: {
    backgroundColor: COLORS.primary,
    borderRadius: 16, padding: 20, marginBottom: 16,
  },
  summaryLabel: {
    fontSize: 11, fontWeight: "700",
    color: "rgba(255,255,255,0.7)",
    letterSpacing: 1, marginBottom: 6,
  },
  summaryPattern: {
    fontSize: 22, fontWeight: "700", color: "#fff", marginBottom: 8,
  },
  summaryDetail: {
    fontSize: 13, color: "rgba(255,255,255,0.85)", marginBottom: 2,
  },
  offsetBadge: {
    marginTop: 10, backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 8, padding: 8,
  },
  offsetBadgeText: { fontSize: 12, color: "#fff", fontWeight: "600" },
  emptyCard: {
    backgroundColor: COLORS.surface, borderRadius: 16,
    padding: 20, marginBottom: 16, alignItems: "center",
  },
  emptyTitle: {
    fontSize: 15, fontWeight: "600",
    color: COLORS.textPrimary, marginBottom: 6,
  },
  emptyText: {
    fontSize: 13, color: COLORS.textSecondary, textAlign: "center",
  },
  statsRow: {
    flexDirection: "row", gap: 8, marginBottom: 20,
  },
  statCard: {
    flex: 1, backgroundColor: COLORS.surface, borderRadius: 12,
    padding: 12, alignItems: "center",
    borderWidth: 1, borderColor: COLORS.border,
  },
  statValue: {
    fontSize: 22, fontWeight: "700", color: COLORS.textPrimary,
  },
  statLabel: {
    fontSize: 10, color: COLORS.textSecondary,
    fontWeight: "500", marginTop: 2, textAlign: "center",
  },
  sectionTitle: {
    fontSize: 17, fontWeight: "700",
    color: COLORS.textPrimary, marginBottom: 12, marginTop: 8,
  },
  recCard: {
    borderRadius: 14, padding: 14,
    marginBottom: 10, borderLeftWidth: 4,
  },
  recTitle: {
    fontSize: 14, fontWeight: "700",
    color: COLORS.textPrimary, marginBottom: 4,
  },
  recBody: { fontSize: 13, lineHeight: 18 },
  courseCard: {
    backgroundColor: COLORS.surface, borderRadius: 14,
    padding: 14, marginBottom: 10,
    shadowColor: "#000", shadowOpacity: 0.04,
    shadowRadius: 4, elevation: 1,
  },
  courseTopRow: {
    flexDirection: "row", justifyContent: "space-between",
    alignItems: "center", marginBottom: 4,
  },
  courseCode: { fontSize: 15, fontWeight: "700", color: COLORS.textPrimary },
  courseLate: { fontSize: 13, fontWeight: "600" },
  courseDetail: { fontSize: 13, color: COLORS.textSecondary, marginBottom: 8 },
  progressBg: {
    height: 6, backgroundColor: COLORS.border,
    borderRadius: 3, overflow: "hidden", marginBottom: 4,
  },
  progressFill: { height: 6, borderRadius: 3 },
  taskRow: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: COLORS.surface, borderRadius: 12,
    padding: 12, marginBottom: 8, gap: 10,
  },
  taskDot: { width: 10, height: 10, borderRadius: 5 },
  taskRowTitle: {
    fontSize: 14, fontWeight: "600", color: COLORS.textPrimary,
  },
  taskRowMeta: { fontSize: 12, color: COLORS.textSecondary, marginTop: 2 },
  attendanceCard: {
    backgroundColor: COLORS.surface, borderRadius: 14,
    padding: 14, marginBottom: 10,
    shadowColor: "#000", shadowOpacity: 0.04,
    shadowRadius: 4, elevation: 1,
  },
  attendanceTopRow: {
    flexDirection: "row", justifyContent: "space-between",
    alignItems: "center", marginBottom: 8,
  },
  attendanceName: {
    fontSize: 15, fontWeight: "600", color: COLORS.textPrimary,
  },
  attendanceCode: { fontSize: 12, color: COLORS.textMuted, marginTop: 2 },
  attendanceRate: { fontSize: 20, fontWeight: "700" },
  attendanceDetail: {
    fontSize: 12, color: COLORS.textSecondary, marginTop: 4,
  },
  completeCircle: { width: 24, height: 24, borderRadius: 12, borderWidth: 2, borderColor: COLORS.border, justifyContent: "center", alignItems: "center", marginRight: 10 },
  completeCircleDone: { backgroundColor: COLORS.success, borderColor: COLORS.success },
  completeCheck: { color: "#fff", fontSize: 12, fontWeight: "700" },
});