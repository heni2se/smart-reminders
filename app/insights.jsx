import React, { useState, useEffect } from "react";
import { View, Text, ScrollView, StyleSheet } from "react-native";
import { getBehaviorSummary, getCourseBreakdown } from "../services/behaviorEngine";
import { useClasses } from "../store/ClassContext";
import COLORS from "../constants/colors";

export default function InsightsScreen() {
  const [summary, setSummary] = useState(null);
  const [courseBreakdown, setCourseBreakdown] = useState([]);
  const { classes, getAttendanceRate } = useClasses();

  useEffect(() => {
    async function load() {
      const s = await getBehaviorSummary();
      const c = await getCourseBreakdown();
      setSummary(s);
      setCourseBreakdown(c);
    }
    load();
  }, []);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>

      <Text style={styles.pageTitle}>Insights</Text>

      {/* ── Behavior summary card ── */}
      {summary ? (
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>YOUR PATTERN</Text>
          <Text style={styles.summaryPattern}>{summary.pattern}</Text>
          <Text style={styles.summaryDetail}>
            Avg. {summary.avgHoursBeforeDeadline}h before deadline ·{" "}
            {summary.latePercent}% submitted late
          </Text>
          <Text style={styles.summaryDetail}>
            Based on {summary.totalTracked} completed tasks
          </Text>
        </View>
      ) : (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyTitle}>No behavior data yet</Text>
          <Text style={styles.emptyText}>
            Complete a few tasks and your productivity patterns will appear here.
          </Text>
        </View>
      )}

      {/* ── Per-course breakdown ── */}
      {courseBreakdown.length > 0 && (
        <>
          <Text style={styles.sectionTitle}>By Course</Text>
          {courseBreakdown.map((course) => (
            <View key={course.courseCode} style={styles.courseCard}>
              <View style={styles.courseTopRow}>
                <Text style={styles.courseCode}>{course.courseCode}</Text>
                <Text style={[
                  styles.courseLate,
                  { color: course.latePercent > 50 ? COLORS.danger : COLORS.success }
                ]}>
                  {course.latePercent}% late
                </Text>
              </View>
              <Text style={styles.courseDetail}>
                Avg. {course.avgHoursBeforeDeadline}h before deadline · {course.totalTracked} tasks
              </Text>
            </View>
          ))}
        </>
      )}

      {/* ── Attendance breakdown ── */}
      <Text style={styles.sectionTitle}>Attendance</Text>
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
          return (
            <View key={cls.id} style={styles.attendanceCard}>
              <View style={styles.attendanceTopRow}>
                <Text style={styles.attendanceName}>{cls.name}</Text>
                <Text style={[styles.attendanceRate, { color }]}>{rate}%</Text>
              </View>
              <View style={styles.progressBg}>
                <View style={[styles.progressFill, {
                  width: `${rate}%`,
                  backgroundColor: color,
                }]} />
              </View>
              <Text style={styles.attendanceCode}>{cls.courseCode}</Text>
            </View>
          );
        })
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
  summaryCard: {
    backgroundColor: COLORS.primary,
    borderRadius: 16, padding: 20, marginBottom: 24,
  },
  summaryLabel: {
    fontSize: 11, fontWeight: "700",
    color: "rgba(255,255,255,0.7)",
    letterSpacing: 1, marginBottom: 6,
  },
  summaryPattern: {
    fontSize: 22, fontWeight: "700",
    color: "#fff", marginBottom: 8,
  },
  summaryDetail: {
    fontSize: 13, color: "rgba(255,255,255,0.85)", marginBottom: 2,
  },
  emptyCard: {
    backgroundColor: COLORS.surface, borderRadius: 16,
    padding: 20, marginBottom: 24, alignItems: "center",
  },
  emptyTitle: {
    fontSize: 15, fontWeight: "600",
    color: COLORS.textPrimary, marginBottom: 6,
  },
  emptyText: {
    fontSize: 13, color: COLORS.textSecondary, textAlign: "center",
  },
  sectionTitle: {
    fontSize: 17, fontWeight: "700",
    color: COLORS.textPrimary, marginBottom: 12, marginTop: 8,
  },
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
  courseCode: {
    fontSize: 15, fontWeight: "700", color: COLORS.textPrimary,
  },
  courseLate: { fontSize: 13, fontWeight: "600" },
  courseDetail: { fontSize: 13, color: COLORS.textSecondary },
  attendanceCard: {
    backgroundColor: COLORS.surface, borderRadius: 14,
    padding: 14, marginBottom: 10,
    shadowColor: "#000", shadowOpacity: 0.04,
    shadowRadius: 4, elevation: 1,
  },
  attendanceTopRow: {
    flexDirection: "row", justifyContent: "space-between",
    alignItems: "center", marginBottom: 6,
  },
  attendanceName: {
    fontSize: 15, fontWeight: "600", color: COLORS.textPrimary, flex: 1,
  },
  attendanceRate: { fontSize: 15, fontWeight: "700" },
  progressBg: {
    height: 6, backgroundColor: COLORS.border,
    borderRadius: 3, overflow: "hidden", marginBottom: 4,
  },
  progressFill: { height: 6, borderRadius: 3 },
  attendanceCode: { fontSize: 12, color: COLORS.textMuted },
});