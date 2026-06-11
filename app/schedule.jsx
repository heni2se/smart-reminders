import React, { useState, useEffect } from "react";
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
} from "react-native";
import { useClasses } from "../store/ClassContext";
import { getUpcomingEvents, formatEventTime, formatEventDateLabel } from "../services/calendarService";
import AddClassModal from "../components/AddClassModal";
import EditClassModal from "../components/EditClassModal";

import COLORS, { FONTS } from "../constants/colors";

export default function ScheduleScreen() {
  const { classes, getAttendanceRate, getTodaysClasses, markAttendance, deleteClass } = useClasses();
  const [modalVisible, setModalVisible] = useState(false);
  const [editClass, setEditClass] = useState(null);
  const [calendarEvents, setCalendarEvents] = useState([]);
  const [calendarLoading, setCalendarLoading] = useState(true);
  const [showCalendar, setShowCalendar] = useState(true);
  const [expandedClassId, setExpandedClassId] = useState(null);

  const todaysClasses = getTodaysClasses();
  const displayClasses = todaysClasses.length > 0 ? todaysClasses : classes;
  const isShowingAll = todaysClasses.length === 0;

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long", month: "long", day: "numeric",
  });

  useEffect(() => {
    async function loadEvents() {
      setCalendarLoading(true);
      const events = await getUpcomingEvents();
      setCalendarEvents(events);
      setCalendarLoading(false);
    }
    loadEvents();
  }, []);

  function getAttendanceBadge(cls) {
    const rate = getAttendanceRate(cls);
    if (rate === null) return null;
    if (rate >= 80) return { label: `${rate}% attendance`, bg: COLORS.successLight, color: COLORS.success };
    if (rate >= 60) return { label: `${rate}% attendance ⚠️`, bg: COLORS.warningLight, color: COLORS.warning };
    return { label: `${rate}% attendance — at risk`, bg: COLORS.dangerLight, color: COLORS.danger };
  }

  const groupedEvents = calendarEvents.reduce((acc, event) => {
    const label = formatEventDateLabel(event.startDate);
    if (!acc[label]) acc[label] = [];
    acc[label].push(event);
    return acc;
  }, {});

  return (
    <View style={styles.wrapper}>
      <AddClassModal visible={modalVisible} onClose={() => setModalVisible(false)} />
      {editClass && (
        <EditClassModal
          visible={!!editClass}
          onClose={() => setEditClass(null)}
          cls={editClass}
        />
      )}

      <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Schedule</Text>
          <Text style={styles.headerDate}>{today}</Text>
        </View>

        {isShowingAll && (
          <View style={styles.noClassBanner}>
            <Text style={styles.noClassText}>📭 No classes scheduled today — showing full schedule</Text>
          </View>
        )}

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Classes</Text>
        </View>

        {displayClasses.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No classes yet. Tap + to add one!</Text>
          </View>
        ) : (
          displayClasses.map((cls, index) => {
            const badge = getAttendanceBadge(cls);
            const isExpanded = expandedClassId === cls.id;
            return (
              <View key={cls.id} style={styles.timelineRow}>
                <View style={styles.timeColumn}>
                  <Text style={styles.timeText}>{cls.startTime}</Text>
                  <Text style={styles.timeTextEnd}>{cls.endTime}</Text>
                </View>
                <View style={styles.lineColumn}>
                  <View style={[styles.dot, { backgroundColor: cls.color }]} />
                  {index < displayClasses.length - 1 && <View style={styles.verticalLine} />}
                </View>
                <View style={[styles.classCard, { borderLeftColor: cls.color }]}>
                  <TouchableOpacity onPress={() => setExpandedClassId(isExpanded ? null : cls.id)}>
                    <View style={styles.cardTopRow}>
                      <Text style={styles.className}>{cls.name}</Text>
                      <Text style={styles.courseCode}>{cls.courseCode}</Text>
                    </View>
                    <Text style={styles.roomText}>📍 {cls.room}</Text>
                    <Text style={styles.daysText}>🗓 {cls.days.join(", ")}</Text>
                    {badge && (
                      <View style={[styles.badge, { backgroundColor: badge.bg }]}>
                        <Text style={[styles.badgeText, { color: badge.color }]}>{badge.label}</Text>
                      </View>
                    )}
                  </TouchableOpacity>

                  {/* Expanded actions */}
                  {isExpanded && (
                    <View style={styles.expandedSection}>
                      <Text style={styles.expandedLabel}>Mark Attendance</Text>
                      <View style={styles.attendanceRow}>
                        <TouchableOpacity
                          style={[styles.attendBtn, { backgroundColor: COLORS.successLight, borderColor: COLORS.success }]}
                          onPress={() => { markAttendance(cls.id, true); setExpandedClassId(null); }}
                        >
                          <Text style={[styles.attendBtnText, { color: COLORS.success }]}>✓ Attended</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={[styles.attendBtn, { backgroundColor: COLORS.dangerLight, borderColor: COLORS.danger }]}
                          onPress={() => { markAttendance(cls.id, false); setExpandedClassId(null); }}
                        >
                          <Text style={[styles.attendBtnText, { color: COLORS.danger }]}>✗ Missed</Text>
                        </TouchableOpacity>
                      </View>
                      <View style={styles.actionRow}>
                        <TouchableOpacity style={styles.actionBtn}
                          onPress={() => { setEditClass(cls); setExpandedClassId(null); }}>
                          <Text style={styles.actionBtnText}>✏️ Edit</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.actionBtn, styles.actionBtnDanger]}
                          onPress={() => deleteClass(cls.id)}>
                          <Text style={[styles.actionBtnText, { color: COLORS.danger }]}>🗑 Delete</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  )}
                </View>
              </View>
            );
          })
        )}

        {/* Calendar Events */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Calendar Events</Text>
          <TouchableOpacity onPress={() => setShowCalendar((p) => !p)}>
            <Text style={styles.toggleText}>{showCalendar ? "Hide" : "Show"}</Text>
          </TouchableOpacity>
        </View>

        {showCalendar && (
          <>
            {calendarLoading ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>Loading calendar...</Text>
              </View>
            ) : calendarEvents.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>No upcoming events — allow calendar access to see them here</Text>
              </View>
            ) : (
              Object.entries(groupedEvents).map(([dateLabel, events]) => (
                <View key={dateLabel}>
                  <Text style={styles.dateLabelText}>{dateLabel}</Text>
                  {events.map((event) => (
                    <View key={event.id} style={styles.eventCard}>
                      <View style={styles.eventTimeCol}>
                        <Text style={styles.eventTime}>{formatEventTime(event.startDate)}</Text>
                        <Text style={styles.eventTimeEnd}>{formatEventTime(event.endDate)}</Text>
                      </View>
                      <View style={styles.eventContent}>
                        <Text style={styles.eventTitle} numberOfLines={1}>{event.title}</Text>
                        {event.location ? <Text style={styles.eventDetail}>📍 {event.location}</Text> : null}
                        {event.calendarName ? <Text style={styles.eventDetail}>🗓 {event.calendarName}</Text> : null}
                      </View>
                    </View>
                  ))}
                </View>
              ))
            )}
          </>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      <TouchableOpacity style={styles.fab} onPress={() => setModalVisible(true)} activeOpacity={0.85}>
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { flex: 1, backgroundColor: COLORS.background },
  container: { flex: 1 },
  content: { padding: 20, paddingTop: 56 },
  header: { marginBottom: 20 },
  headerTitle: { fontSize: 26, fontFamily: FONTS.bold, color: COLORS.textPrimary },
  headerDate: { fontSize: 14, color: COLORS.textSecondary, marginTop: 2 },
  noClassBanner: { backgroundColor: COLORS.warningLight, borderRadius: 12, padding: 12, marginBottom: 20 },
  noClassText: { fontSize: 13, color: COLORS.warning, fontFamily: FONTS.medium },
  sectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12, marginTop: 8 },
  sectionTitle: { fontSize: 17, fontFamily: FONTS.bold, color: COLORS.textPrimary },
  toggleText: { fontSize: 13, color: COLORS.primary, fontFamily: FONTS.semibold },
  timelineRow: { flexDirection: "row", marginBottom: 20, alignItems: "flex-start" },
  timeColumn: { width: 52, alignItems: "flex-end", paddingRight: 8, paddingTop: 2 },
  timeText: { fontSize: 12, fontFamily: FONTS.semibold, color: COLORS.textPrimary },
  timeTextEnd: { fontSize: 11, color: COLORS.textMuted, marginTop: 2 },
  lineColumn: { width: 20, alignItems: "center", paddingTop: 4 },
  dot: { width: 12, height: 12, borderRadius: 6, zIndex: 1 },
  verticalLine: { width: 2, flex: 1, backgroundColor: COLORS.border, marginTop: 4, minHeight: 60 },
  classCard: { flex: 1, backgroundColor: COLORS.surface, borderRadius: 14, padding: 14, borderLeftWidth: 4, marginLeft: 8, shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 6, elevation: 2 },
  cardTopRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 6 },
  className: { fontSize: 15, fontFamily: FONTS.bold, color: COLORS.textPrimary, flex: 1 },
  courseCode: { fontSize: 12, fontFamily: FONTS.semibold, color: COLORS.textSecondary, backgroundColor: COLORS.background, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  roomText: { fontSize: 13, color: COLORS.textSecondary, marginBottom: 3 },
  daysText: { fontSize: 13, color: COLORS.textSecondary, marginBottom: 8 },
  badge: { alignSelf: "flex-start", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  badgeText: { fontSize: 12, fontFamily: FONTS.semibold },
  expandedSection: { marginTop: 10, borderTopWidth: 1, borderTopColor: COLORS.border, paddingTop: 10 },
  expandedLabel: { fontSize: 11, fontFamily: FONTS.bold, color: COLORS.textSecondary, marginBottom: 8, textTransform: "uppercase", letterSpacing: 0.5 },
  attendanceRow: { flexDirection: "row", gap: 8, marginBottom: 10 },
  attendBtn: { flex: 1, paddingVertical: 8, borderRadius: 8, borderWidth: 1, alignItems: "center" },
  attendBtnText: { fontSize: 13, fontFamily: FONTS.bold },
  actionRow: { flexDirection: "row", gap: 8 },
  actionBtn: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 8, backgroundColor: COLORS.background, borderWidth: 1, borderColor: COLORS.border },
  actionBtnDanger: { borderColor: COLORS.dangerLight, backgroundColor: COLORS.dangerLight },
  actionBtnText: { fontSize: 12, fontFamily: FONTS.semibold, color: COLORS.textSecondary },
  dateLabelText: { fontSize: 13, fontFamily: FONTS.bold, color: COLORS.textSecondary, marginBottom: 8, marginTop: 4, textTransform: "uppercase", letterSpacing: 0.5 },
  eventCard: { flexDirection: "row", backgroundColor: COLORS.surface, borderRadius: 12, padding: 12, marginBottom: 8, borderLeftWidth: 3, borderLeftColor: COLORS.primary, shadowColor: "#000", shadowOpacity: 0.04, shadowRadius: 4, elevation: 1 },
  eventTimeCol: { width: 60, marginRight: 10 },
  eventTime: { fontSize: 12, fontFamily: FONTS.semibold, color: COLORS.textPrimary },
  eventTimeEnd: { fontSize: 11, color: COLORS.textMuted, marginTop: 2 },
  eventContent: { flex: 1 },
  eventTitle: { fontSize: 14, fontFamily: FONTS.semibold, color: COLORS.textPrimary, marginBottom: 3 },
  eventDetail: { fontSize: 12, color: COLORS.textSecondary, marginTop: 1 },
  emptyState: { alignItems: "center", paddingVertical: 20 },
  emptyText: { fontSize: 14, color: COLORS.textMuted, textAlign: "center" },
  fab: { position: "absolute", bottom: 32, right: 24, width: 58, height: 58, borderRadius: 29, backgroundColor: COLORS.primary, justifyContent: "center", alignItems: "center", shadowColor: COLORS.primary, shadowOpacity: 0.4, shadowRadius: 12, shadowOffset: { width: 0, height: 4 }, elevation: 8 },
  fabText: { color: "#fff", fontSize: 28, lineHeight: 32 },
});