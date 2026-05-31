import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { useClasses } from "../store/ClassContext";
import AddClassModal from "../components/AddClassModal";
import COLORS from "../constants/colors";

export default function ScheduleScreen() {
  const { classes, getAttendanceRate, getTodaysClasses } = useClasses();
  const [modalVisible, setModalVisible] = useState(false);

  const todaysClasses = getTodaysClasses();
  const displayClasses = todaysClasses.length > 0 ? todaysClasses : classes;
  const isShowingAll = todaysClasses.length === 0;

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  function getAttendanceBadge(cls) {
    const rate = getAttendanceRate(cls);
    if (rate === null) return null;
    if (rate >= 80) {
      return { label: `${rate}% attendance`, bg: COLORS.successLight, color: COLORS.success };
    } else if (rate >= 60) {
      return { label: `${rate}% attendance ⚠️`, bg: COLORS.warningLight, color: COLORS.warning };
    } else {
      return { label: `${rate}% attendance — at risk`, bg: COLORS.dangerLight, color: COLORS.danger };
    }
  }

  return (
    <View style={styles.wrapper}>

      <AddClassModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
      />

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Schedule</Text>
          <Text style={styles.headerDate}>{today}</Text>
        </View>

        {isShowingAll && (
          <View style={styles.noClassBanner}>
            <Text style={styles.noClassText}>
              📭 No classes scheduled today — showing full schedule
            </Text>
          </View>
        )}

        {displayClasses.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No classes yet. Tap + to add one!</Text>
          </View>
        ) : (
          displayClasses.map((cls, index) => {
            const badge = getAttendanceBadge(cls);
            return (
              <View key={cls.id} style={styles.timelineRow}>
                <View style={styles.timeColumn}>
                  <Text style={styles.timeText}>{cls.startTime}</Text>
                  <Text style={styles.timeTextEnd}>{cls.endTime}</Text>
                </View>
                <View style={styles.lineColumn}>
                  <View style={[styles.dot, { backgroundColor: cls.color }]} />
                  {index < displayClasses.length - 1 && (
                    <View style={styles.verticalLine} />
                  )}
                </View>
                <View style={[styles.classCard, { borderLeftColor: cls.color }]}>
                  <View style={styles.cardTopRow}>
                    <Text style={styles.className}>{cls.name}</Text>
                    <Text style={styles.courseCode}>{cls.courseCode}</Text>
                  </View>
                  <Text style={styles.roomText}>📍 {cls.room}</Text>
                  <Text style={styles.daysText}>🗓 {cls.days.join(", ")}</Text>
                  {badge && (
                    <View style={[styles.badge, { backgroundColor: badge.bg }]}>
                      <Text style={[styles.badgeText, { color: badge.color }]}>
                        {badge.label}
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            );
          })
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

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
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingTop: 56,
  },
  header: {
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: "700",
    color: COLORS.textPrimary,
  },
  headerDate: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  noClassBanner: {
    backgroundColor: COLORS.warningLight,
    borderRadius: 12,
    padding: 12,
    marginBottom: 20,
  },
  noClassText: {
    fontSize: 13,
    color: COLORS.warning,
    fontWeight: "500",
  },
  timelineRow: {
    flexDirection: "row",
    marginBottom: 20,
    alignItems: "flex-start",
  },
  timeColumn: {
    width: 52,
    alignItems: "flex-end",
    paddingRight: 8,
    paddingTop: 2,
  },
  timeText: {
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.textPrimary,
  },
  timeTextEnd: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  lineColumn: {
    width: 20,
    alignItems: "center",
    paddingTop: 4,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    zIndex: 1,
  },
  verticalLine: {
    width: 2,
    flex: 1,
    backgroundColor: COLORS.border,
    marginTop: 4,
    minHeight: 60,
  },
  classCard: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    padding: 14,
    borderLeftWidth: 4,
    marginLeft: 8,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  cardTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  className: {
    fontSize: 15,
    fontWeight: "700",
    color: COLORS.textPrimary,
    flex: 1,
  },
  courseCode: {
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.textSecondary,
    backgroundColor: COLORS.background,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  roomText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginBottom: 3,
  },
  daysText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginBottom: 8,
  },
  badge: {
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "600",
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 15,
    color: COLORS.textMuted,
  },
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