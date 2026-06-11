import React, { useState, useEffect, useMemo } from "react";
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  ActivityIndicator, TextInput, Platform,
} from "react-native";
import { useTasks } from "../store/TaskContext";
import { useClasses } from "../store/ClassContext";
import { useUser } from "../store/UserContext";
import { getSuggestionMessage } from "../services/suggestionEngine";
import { getWeather } from "../services/weatherService";
import { addTaskToCalendar } from "../services/calendarService";
import AddTaskModal from "../components/AddTaskModal";
import EditTaskModal from "../components/EditTaskModal";
import EditProfileModal from "../components/EditProfileModal";
import COLORS, { FONTS } from "../constants/colors";

function useCourseColorMap(classes) {
  const map = {};
  classes.forEach((cls) => { map[cls.courseCode] = cls.color; });
  return map;
}

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning 👋";
  if (hour < 17) return "Good afternoon 👋";
  return "Good evening 👋";
}

const SORT_OPTIONS = ["Deadline", "Urgency", "Progress", "Course"];
const FILTER_OPTIONS = ["All", "Incomplete", "Completed", "Overdue"];

export default function HomeScreen() {
  const {
    tasks, getUrgency, getTimeLeft, loading,
    shareTaskById, joinTaskByCode, deleteTask,
    toggleComplete, updateProgress,
  } = useTasks();
  const { getTodaysClasses, classes } = useClasses();
  const { userName, avatarColor } = useUser();
  const todaysClasses = getTodaysClasses();
  const courseColorMap = useCourseColorMap(classes);

  const [modalVisible, setModalVisible] = useState(false);
  const [editTask, setEditTask] = useState(null);
  const [profileVisible, setProfileVisible] = useState(false);
  const [suggestion, setSuggestion] = useState(null);
  const [weather, setWeather] = useState(null);
  const [weatherLoading, setWeatherLoading] = useState(true);
  const [joinCode, setJoinCode] = useState("");
  const [joinMessage, setJoinMessage] = useState("");
  const [shareMessage, setShareMessage] = useState("");
  const [showCollab, setShowCollab] = useState(false);
  const [expandedTaskId, setExpandedTaskId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("Deadline");
  const [filterBy, setFilterBy] = useState("All");
  const [showSortFilter, setShowSortFilter] = useState(false);

  useEffect(() => {
    async function loadWeather() {
      setWeatherLoading(true);
      const w = await getWeather();
      setWeather(w);
      setWeatherLoading(false);
    }
    loadWeather();
  }, []);

  useEffect(() => {
    async function loadSuggestion() {
      const s = await getSuggestionMessage(tasks, todaysClasses);
      setSuggestion(s);
    }
    if (!loading) loadSuggestion();
  }, [tasks, loading]);

  // Filter + sort tasks
  const processedTasks = useMemo(() => {
    let result = [...tasks];

    // Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (t) => t.title.toLowerCase().includes(q) || t.courseCode.toLowerCase().includes(q)
      );
    }

    // Filter
    const now = new Date();
    if (filterBy === "Incomplete") result = result.filter((t) => !t.completed);
    else if (filterBy === "Completed") result = result.filter((t) => t.completed);
    else if (filterBy === "Overdue") result = result.filter((t) => !t.completed && new Date(t.deadline) < now);

    // Sort
    if (sortBy === "Deadline") {
      result.sort((a, b) => new Date(a.deadline) - new Date(b.deadline));
    } else if (sortBy === "Urgency") {
      const urgencyOrder = { high: 0, medium: 1, low: 2 };
      result.sort((a, b) => urgencyOrder[getUrgency(a.deadline)] - urgencyOrder[getUrgency(b.deadline)]);
    } else if (sortBy === "Progress") {
      result.sort((a, b) => (a.progress || 0) - (b.progress || 0));
    } else if (sortBy === "Course") {
      result.sort((a, b) => a.courseCode.localeCompare(b.courseCode));
    }

    // Completed always at bottom unless filtering for completed
    if (filterBy !== "Completed") {
      const incomplete = result.filter((t) => !t.completed);
      const completed = result.filter((t) => t.completed);
      result = [...incomplete, ...completed];
    }

    return result;
  }, [tasks, searchQuery, sortBy, filterBy]);

  const completedCount = tasks.filter((t) => t.completed).length;

  async function handleShare(taskId) {
    const code = await shareTaskById(taskId);
    if (code) { setShareMessage(`Share code: ${code}`); setShowCollab(true); }
  }

  async function handleJoin() {
    if (!joinCode.trim()) return;
    const result = await joinTaskByCode(joinCode.trim());
    if (result.success) { setJoinMessage("✅ Task joined successfully!"); setJoinCode(""); }
    else setJoinMessage(`❌ ${result.message}`);
  }

  async function handleAddToCalendar(task) {
    const result = await addTaskToCalendar(task);
    alert(result.success ? "✅ Added to your calendar!" : `❌ ${result.message}`);
  }

  function weatherBg() {
    if (!weather || !weather.isReal) return COLORS.primaryLight;
    const c = weather.condition;
    if (c === 'Thunderstorm') return '#E8E0F0';
    if (c === 'Rain' || c === 'Drizzle') return '#E0EAF8';
    if (c === 'Snow') return '#EAF4FB';
    if (c === 'Clear' && weather.temp >= 28) return '#FEF3E2';
    if (c === 'Clear') return '#FFFBEB';
    if (c === 'Clouds') return '#F0F0F0';
    return COLORS.primaryLight;
  }

  function weatherTextColor() {
    if (!weather || !weather.isReal) return COLORS.primaryDark;
    const c = weather.condition;
    if (c === 'Thunderstorm') return '#5B3A8A';
    if (c === 'Rain' || c === 'Drizzle') return '#1A4A8A';
    if (c === 'Snow') return '#1A6A8A';
    if (c === 'Clear') return '#854F0B';
    if (c === 'Clouds') return '#4A4A4A';
    return COLORS.primaryDark;
  }

  function renderWeatherStrip() {
    const bg = weatherBg();
    const tc = weatherTextColor();
    if (weatherLoading) return (
      <View style={[styles.weatherStrip, { backgroundColor: bg }]}>
        <Text style={[styles.weatherText, { color: tc }]}>Loading weather...</Text>
      </View>
    );
    if (!weather || !weather.isReal) return (
      <View style={[styles.weatherStrip, { backgroundColor: bg }]}>
        <Text style={[styles.weatherText, { color: tc }]}>🌤 Weather unavailable — enable location for updates</Text>
      </View>
    );
    return (
      <View style={[styles.weatherStrip, { backgroundColor: bg }]}>
        <View style={styles.weatherRow}>
          <Text style={[styles.weatherMain, { color: tc }]}>{weather.emoji} {weather.temp}°C — {weather.description}</Text>
          <Text style={[styles.weatherCity, { color: tc, opacity: 0.7 }]}>📍 {weather.cityName}</Text>
        </View>
        {weather.warning && <Text style={[styles.weatherWarning, { color: tc }]}>⚠️ {weather.warning}</Text>}
        <Text style={[styles.weatherDetail, { color: tc, opacity: 0.7 }]}>
          Feels like {weather.feelsLike}°C · {weather.humidity}% humidity · {weather.windSpeed} km/h wind
        </Text>
      </View>
    );
  }

  if (loading) return (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color={COLORS.primary} />
    </View>
  );

  const displayName = userName || "there";
  const avatarLetter = userName ? userName.charAt(0).toUpperCase() : "U";

  return (
    <View style={styles.wrapper}>
      <AddTaskModal visible={modalVisible} onClose={() => setModalVisible(false)} />
      {editTask && <EditTaskModal visible={!!editTask} onClose={() => setEditTask(null)} task={editTask} />}
      <EditProfileModal visible={profileVisible} onClose={() => setProfileVisible(false)} />

      <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={styles.header}>
          <View style={{ flex: 1 }}>
            <Text style={styles.greeting}>{getGreeting()}</Text>
            <Text style={styles.subGreeting}>Welcome back, {displayName}.</Text>
          </View>
          <TouchableOpacity onPress={() => setProfileVisible(true)}>
            <View style={[styles.avatar, { backgroundColor: avatarColor }]}>
              <Text style={styles.avatarText}>{avatarLetter}</Text>
            </View>
          </TouchableOpacity>
        </View>

        {renderWeatherStrip()}

        {/* AI Suggestion */}
        {suggestion && (
          <View style={styles.aiCard}>
            <Text style={styles.aiLabel}>AI SUGGESTION</Text>
            <Text style={styles.aiTitle}>Start "{suggestion.title}" now</Text>
            <Text style={styles.aiSub}>~{suggestion.estimatedMinutes} min · {suggestion.hoursLeft}h until deadline</Text>
            {suggestion.timeContext ? <Text style={styles.aiContext}>📅 {suggestion.timeContext}</Text> : null}
            {suggestion.urgencyNote ? <Text style={styles.aiContext}>⚡ {suggestion.urgencyNote}</Text> : null}
          </View>
        )}

        {/* Today's Classes */}
        {todaysClasses.length > 0 && (
          <>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Today's Classes</Text>
            </View>
            {todaysClasses.map((cls) => (
              <View key={cls.id} style={[styles.classCard, { borderLeftColor: cls.color }]}>
                <Text style={styles.classTitle}>{cls.name}</Text>
                <Text style={styles.classMeta}>{cls.courseCode} · {cls.room} · {cls.startTime}–{cls.endTime}</Text>
              </View>
            ))}
          </>
        )}

        {/* Collaboration */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Collaboration</Text>
          <TouchableOpacity onPress={() => setShowCollab((p) => !p)}>
            <Text style={styles.seeAll}>{showCollab ? "Hide" : "Show"}</Text>
          </TouchableOpacity>
        </View>

        {showCollab && (
          <View style={styles.collabCard}>
            <Text style={styles.collabSubtitle}>Join a shared task</Text>
            {Platform.OS === "web" ? (
              <input type="text" placeholder="Enter 6-character code" value={joinCode}
                onChange={(e) => setJoinCode(e.target.value.toUpperCase())} maxLength={6}
                style={{
                  width: "100%", padding: 12, borderRadius: 10,
                  border: `1px solid ${COLORS.border}`, fontSize: 15,
                  backgroundColor: COLORS.background, boxSizing: "border-box",
                  fontFamily: "inherit", letterSpacing: 3, marginBottom: 8, outline: "none",
                }} />
            ) : (
              <TextInput style={styles.codeInput} placeholder="Enter 6-character code"
                placeholderTextColor={COLORS.textMuted} value={joinCode}
                onChangeText={(t) => setJoinCode(t.toUpperCase())} maxLength={6} autoCapitalize="characters" />
            )}
            <TouchableOpacity style={styles.joinBtn} onPress={handleJoin}>
              <Text style={styles.joinBtnText}>Join Task</Text>
            </TouchableOpacity>
            {joinMessage ? <Text style={styles.joinMessage}>{joinMessage}</Text> : null}
            {shareMessage ? (
              <View style={styles.shareCodeBox}>
                <Text style={styles.shareCodeText}>{shareMessage}</Text>
                <Text style={styles.shareCodeHint}>Share this code with a classmate</Text>
              </View>
            ) : null}
          </View>
        )}

        {/* Tasks header + search + sort/filter */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            Your Tasks
            {completedCount > 0 && <Text style={styles.taskCount}> · {completedCount} done</Text>}
          </Text>
          <TouchableOpacity onPress={() => setShowSortFilter((p) => !p)}>
            <Text style={styles.seeAll}>{showSortFilter ? "Hide filters" : "Sort & Filter"}</Text>
          </TouchableOpacity>
        </View>

        {/* Search bar */}
        {Platform.OS === "web" ? (
          <input
            type="text"
            placeholder="🔍  Search tasks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: "100%", padding: "12px 14px", borderRadius: 12,
              border: `1px solid ${COLORS.border}`, fontSize: 14,
              backgroundColor: COLORS.surface, boxSizing: "border-box",
              fontFamily: "inherit", outline: "none", marginBottom: 10, color: COLORS.textPrimary,
            }}
          />
        ) : (
          <View style={styles.searchBar}>
            <TextInput
              style={styles.searchInput}
              placeholder="🔍  Search tasks..."
              placeholderTextColor={COLORS.textMuted}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
        )}

        {/* Sort + Filter pills */}
        {showSortFilter && (
          <View style={styles.sortFilterContainer}>
            <Text style={styles.sortFilterLabel}>SORT BY</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 10 }}>
              <View style={styles.pillRow}>
                {SORT_OPTIONS.map((opt) => (
                  <TouchableOpacity
                    key={opt}
                    onPress={() => setSortBy(opt)}
                    style={[styles.pill, sortBy === opt && styles.pillActive]}
                  >
                    <Text style={[styles.pillText, sortBy === opt && styles.pillTextActive]}>{opt}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
            <Text style={styles.sortFilterLabel}>FILTER</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.pillRow}>
                {FILTER_OPTIONS.map((opt) => (
                  <TouchableOpacity
                    key={opt}
                    onPress={() => setFilterBy(opt)}
                    style={[styles.pill, filterBy === opt && styles.pillActive]}
                  >
                    <Text style={[styles.pillText, filterBy === opt && styles.pillTextActive]}>{opt}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>
        )}

        {/* Task list */}
        {processedTasks.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>
              {searchQuery ? "🔍" : filterBy !== "All" ? "📂" : "📭"}
            </Text>
            <Text style={styles.emptyTitle}>
              {searchQuery ? "No results found" : filterBy !== "All" ? `No ${filterBy.toLowerCase()} tasks` : "No tasks yet"}
            </Text>
            <Text style={styles.emptyText}>
              {searchQuery ? "Try a different search term" : filterBy !== "All" ? "Try a different filter" : "Tap + to add your first task"}
            </Text>
          </View>
        ) : (
          processedTasks.map((task) => {
            const urgency = getUrgency(task.deadline);
            const timeLeft = getTimeLeft(task.deadline);
            const urgencyColor = urgency === "high" ? COLORS.danger : urgency === "medium" ? COLORS.warning : COLORS.success;
            const urgencyBg = urgency === "high" ? COLORS.dangerLight : urgency === "medium" ? COLORS.warningLight : COLORS.successLight;
            const isExpanded = expandedTaskId === task.id;
            const courseColor = courseColorMap[task.courseCode] || COLORS.primary;

            return (
              <View key={task.id} style={[
                styles.taskCard,
                { borderLeftColor: task.completed ? COLORS.border : courseColor },
                task.completed && styles.taskCardCompleted,
              ]}>
                <TouchableOpacity onPress={() => setExpandedTaskId(isExpanded ? null : task.id)}>
                  <View style={styles.taskTopRow}>
                    <TouchableOpacity
                      onPress={() => toggleComplete(task.id)}
                      style={[styles.completeCircle, task.completed && styles.completeCircleDone]}
                    >
                      {task.completed && <Text style={styles.completeCheck}>✓</Text>}
                    </TouchableOpacity>
                    <Text style={[styles.taskTitle, task.completed && styles.taskTitleDone]} numberOfLines={1}>
                      {task.title}
                    </Text>
                    {!task.completed && (
                      <View style={[styles.urgencyBadge, { backgroundColor: urgencyBg }]}>
                        <Text style={[styles.urgencyText, { color: urgencyColor }]}>
                          {urgency.toUpperCase()}
                        </Text>
                      </View>
                    )}
                  </View>
                </TouchableOpacity>

                {!task.completed && (
                  <Text style={styles.taskMeta}>
                    {task.courseCode} · Due {new Date(task.deadline).toLocaleString("en-US", {
                      month: "short", day: "numeric", hour: "numeric", minute: "2-digit", hour12: true,
                    })} · {timeLeft}
                  </Text>
                )}

                {!task.completed && (
                  <>
                    <View style={styles.progressBarBg}>
                      <View style={[styles.progressBarFill, {
                        width: `${task.progress || 0}%`,
                        backgroundColor: courseColor,
                      }]} />
                    </View>
                    <Text style={styles.progressLabel}>{task.progress || 0}% complete</Text>
                  </>
                )}

                {isExpanded && (
                  <View style={styles.expandedSection}>
                    {!task.completed && (
                      <>
                        <Text style={styles.expandedLabel}>Update Progress</Text>
                        <View style={styles.progressBtnRow}>
                          {[0, 25, 50, 75, 100].map((val) => (
                            <TouchableOpacity
                              key={val}
                              style={[styles.progressBtn, task.progress === val && { backgroundColor: courseColor, borderColor: courseColor }]}
                              onPress={() => updateProgress(task.id, val)}
                            >
                              <Text style={[styles.progressBtnText, task.progress === val && styles.progressBtnTextActive]}>
                                {val}%
                              </Text>
                            </TouchableOpacity>
                          ))}
                        </View>
                      </>
                    )}
                    <View style={styles.actionRow}>
                      <TouchableOpacity style={styles.actionBtn} onPress={() => { setEditTask(task); setExpandedTaskId(null); }}>
                        <Text style={styles.actionBtnText}>✏️ Edit</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.actionBtn} onPress={() => handleAddToCalendar(task)}>
                        <Text style={styles.actionBtnText}>📅 Calendar</Text>
                      </TouchableOpacity>
                      {!task.shareCode && (
                        <TouchableOpacity style={styles.actionBtn} onPress={() => handleShare(task.id)}>
                          <Text style={styles.actionBtnText}>🔗 Share</Text>
                        </TouchableOpacity>
                      )}
                      <TouchableOpacity style={[styles.actionBtn, styles.actionBtnDanger]} onPress={() => deleteTask(task.id)}>
                        <Text style={[styles.actionBtnText, { color: COLORS.danger }]}>🗑 Delete</Text>
                      </TouchableOpacity>
                    </View>
                    {task.isShared && task.shareCode && (
                      <View style={styles.sharedBadge}>
                        <Text style={styles.sharedBadgeText}>🔗 Shared · Code: {task.shareCode}</Text>
                      </View>
                    )}
                    {task.shareCode && !task.isShared && (
                      <View style={[styles.sharedBadge, { backgroundColor: COLORS.successLight }]}>
                        <Text style={[styles.sharedBadgeText, { color: COLORS.success }]}>👥 Joined task</Text>
                      </View>
                    )}
                  </View>
                )}
              </View>
            );
          })
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
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: COLORS.background },
  container: { flex: 1 },
  content: { padding: 20, paddingTop: 56 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 },
  greeting: { fontSize: 24, fontFamily: FONTS.bold, color: COLORS.textPrimary },
  subGreeting: { fontSize: 14, fontFamily: FONTS.regular, color: COLORS.textSecondary, marginTop: 2 },
  avatar: { width: 44, height: 44, borderRadius: 22, justifyContent: "center", alignItems: "center" },
  avatarText: { color: "#fff", fontFamily: FONTS.bold, fontSize: 16 },
  weatherStrip: { borderRadius: 14, padding: 14, marginBottom: 16 },
  weatherRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 4 },
  weatherMain: { fontSize: 14, fontFamily: FONTS.semibold },
  weatherCity: { fontSize: 12, fontFamily: FONTS.medium },
  weatherWarning: { fontSize: 13, fontFamily: FONTS.medium, marginBottom: 4 },
  weatherDetail: { fontSize: 11, fontFamily: FONTS.regular },
  weatherText: { fontSize: 13, fontFamily: FONTS.medium },
  aiCard: { backgroundColor: COLORS.primary, borderRadius: 16, padding: 18, marginBottom: 24 },
  aiLabel: { fontSize: 11, fontFamily: FONTS.bold, color: "rgba(255,255,255,0.7)", letterSpacing: 1, marginBottom: 6 },
  aiTitle: { fontSize: 17, fontFamily: FONTS.bold, color: "#fff", marginBottom: 4 },
  aiSub: { fontSize: 13, fontFamily: FONTS.regular, color: "rgba(255,255,255,0.8)", marginBottom: 4 },
  aiContext: { fontSize: 12, fontFamily: FONTS.regular, color: "rgba(255,255,255,0.75)", marginTop: 2 },
  sectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  sectionTitle: { fontSize: 17, fontFamily: FONTS.bold, color: COLORS.textPrimary },
  taskCount: { fontSize: 14, fontFamily: FONTS.regular, color: COLORS.textMuted },
  seeAll: { fontSize: 13, fontFamily: FONTS.semibold, color: COLORS.primary },
  classCard: { backgroundColor: COLORS.surface, borderRadius: 12, padding: 14, marginBottom: 10, borderLeftWidth: 4, shadowColor: "#000", shadowOpacity: 0.04, shadowRadius: 4, elevation: 1 },
  classTitle: { fontSize: 15, fontFamily: FONTS.semibold, color: COLORS.textPrimary, marginBottom: 3 },
  classMeta: { fontSize: 13, fontFamily: FONTS.regular, color: COLORS.textSecondary },
  collabCard: { backgroundColor: COLORS.surface, borderRadius: 16, padding: 16, marginBottom: 20, borderWidth: 1, borderColor: COLORS.border },
  collabSubtitle: { fontSize: 13, fontFamily: FONTS.semibold, color: COLORS.textSecondary, marginBottom: 10 },
  codeInput: { backgroundColor: COLORS.background, borderRadius: 10, padding: 12, fontSize: 15, color: COLORS.textPrimary, borderWidth: 1, borderColor: COLORS.border, letterSpacing: 3, marginBottom: 8 },
  joinBtn: { backgroundColor: COLORS.primary, borderRadius: 10, padding: 12, alignItems: "center" },
  joinBtnText: { color: "#fff", fontFamily: FONTS.bold, fontSize: 14 },
  joinMessage: { marginTop: 8, fontSize: 13, fontFamily: FONTS.regular, color: COLORS.textSecondary, textAlign: "center" },
  shareCodeBox: { marginTop: 12, backgroundColor: COLORS.primaryLight, borderRadius: 10, padding: 12, alignItems: "center" },
  shareCodeText: { fontSize: 18, fontFamily: FONTS.bold, color: COLORS.primary, letterSpacing: 3 },
  shareCodeHint: { fontSize: 12, fontFamily: FONTS.regular, color: COLORS.textSecondary, marginTop: 4 },
  searchBar: { backgroundColor: COLORS.surface, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10, borderWidth: 1, borderColor: COLORS.border, marginBottom: 10 },
  searchInput: { fontSize: 14, fontFamily: FONTS.regular, color: COLORS.textPrimary },
  sortFilterContainer: { backgroundColor: COLORS.surface, borderRadius: 14, padding: 14, marginBottom: 12, borderWidth: 1, borderColor: COLORS.border },
  sortFilterLabel: { fontSize: 10, fontFamily: FONTS.bold, color: COLORS.textMuted, letterSpacing: 1, marginBottom: 8, textTransform: "uppercase" },
  pillRow: { flexDirection: "row", gap: 8, paddingBottom: 4 },
  pill: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, backgroundColor: COLORS.background, borderWidth: 1, borderColor: COLORS.border },
  pillActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  pillText: { fontSize: 13, fontFamily: FONTS.medium, color: COLORS.textSecondary },
  pillTextActive: { color: "#fff" },
  taskCard: { backgroundColor: COLORS.surface, borderRadius: 16, padding: 16, marginBottom: 12, borderLeftWidth: 4, shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 6, elevation: 2 },
  taskCardCompleted: { opacity: 0.6 },
  taskTopRow: { flexDirection: "row", alignItems: "center", marginBottom: 6, gap: 8 },
  completeCircle: { width: 24, height: 24, borderRadius: 12, borderWidth: 2, borderColor: COLORS.border, justifyContent: "center", alignItems: "center" },
  completeCircleDone: { backgroundColor: COLORS.success, borderColor: COLORS.success },
  completeCheck: { color: "#fff", fontSize: 12, fontFamily: FONTS.bold },
  taskTitle: { fontSize: 15, fontFamily: FONTS.semibold, color: COLORS.textPrimary, flex: 1 },
  taskTitleDone: { textDecorationLine: "line-through", color: COLORS.textMuted },
  urgencyBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  urgencyText: { fontSize: 10, fontFamily: FONTS.bold, letterSpacing: 0.5 },
  taskMeta: { fontSize: 12, fontFamily: FONTS.regular, color: COLORS.textSecondary, marginBottom: 10 },
  progressBarBg: { height: 6, backgroundColor: COLORS.border, borderRadius: 3, overflow: "hidden" },
  progressBarFill: { height: 6, borderRadius: 3 },
  progressLabel: { fontSize: 11, fontFamily: FONTS.regular, color: COLORS.textMuted, marginTop: 4 },
  expandedSection: { marginTop: 12, borderTopWidth: 1, borderTopColor: COLORS.border, paddingTop: 12 },
  expandedLabel: { fontSize: 11, fontFamily: FONTS.bold, color: COLORS.textSecondary, marginBottom: 8, textTransform: "uppercase", letterSpacing: 0.5 },
  progressBtnRow: { flexDirection: "row", gap: 6, marginBottom: 12 },
  progressBtn: { flex: 1, paddingVertical: 6, borderRadius: 8, backgroundColor: COLORS.background, borderWidth: 1, borderColor: COLORS.border, alignItems: "center" },
  progressBtnText: { fontSize: 11, fontFamily: FONTS.semibold, color: COLORS.textSecondary },
  progressBtnTextActive: { color: "#fff" },
  actionRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 8 },
  actionBtn: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 8, backgroundColor: COLORS.background, borderWidth: 1, borderColor: COLORS.border },
  actionBtnDanger: { borderColor: COLORS.dangerLight, backgroundColor: COLORS.dangerLight },
  actionBtnText: { fontSize: 12, fontFamily: FONTS.semibold, color: COLORS.textSecondary },
  sharedBadge: { alignSelf: "flex-start", backgroundColor: COLORS.primaryLight, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  sharedBadgeText: { fontSize: 12, fontFamily: FONTS.semibold, color: COLORS.primary },
  emptyState: { alignItems: "center", paddingVertical: 48 },
  emptyIcon: { fontSize: 40, marginBottom: 12 },
  emptyTitle: { fontSize: 16, fontFamily: FONTS.semibold, color: COLORS.textPrimary, marginBottom: 4 },
  emptyText: { fontSize: 14, fontFamily: FONTS.regular, color: COLORS.textMuted },
  fab: { position: "absolute", bottom: 32, right: 24, width: 58, height: 58, borderRadius: 29, backgroundColor: COLORS.primary, justifyContent: "center", alignItems: "center", shadowColor: COLORS.primary, shadowOpacity: 0.4, shadowRadius: 12, shadowOffset: { width: 0, height: 4 }, elevation: 8 },
  fabText: { color: "#fff", fontSize: 28, fontWeight: "300", lineHeight: 32 },
});