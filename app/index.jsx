import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  Platform,
} from "react-native";
import { useTasks } from "../store/TaskContext";
import { useClasses } from "../store/ClassContext";
import { getSuggestionMessage } from "../services/suggestionEngine";
import { getWeather } from "../services/weatherService";
import AddTaskModal from "../components/AddTaskModal";
import COLORS from "../constants/colors";

export default function HomeScreen() {
  const { tasks, getUrgency, getTimeLeft, loading, shareTaskById, joinTaskByCode } = useTasks();
  const { getTodaysClasses } = useClasses();
  const todaysClasses = getTodaysClasses();

  const [modalVisible, setModalVisible] = useState(false);
  const [suggestion, setSuggestion] = useState(null);
  const [weather, setWeather] = useState(null);
  const [weatherLoading, setWeatherLoading] = useState(true);
  const [joinCode, setJoinCode] = useState("");
  const [joinMessage, setJoinMessage] = useState("");
  const [shareMessage, setShareMessage] = useState("");
  const [showCollab, setShowCollab] = useState(false);

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

  async function handleShare(taskId) {
    const code = await shareTaskById(taskId);
    if (code) {
      setShareMessage(`Share code: ${code}`);
      setShowCollab(true);
    }
  }

  async function handleJoin() {
    if (!joinCode.trim()) return;
    const result = await joinTaskByCode(joinCode.trim());
    if (result.success) {
      setJoinMessage("✅ Task joined successfully!");
      setJoinCode("");
    } else {
      setJoinMessage(`❌ ${result.message}`);
    }
  }

  // Build the weather strip text
  function renderWeatherStrip() {
    if (weatherLoading) {
      return (
        <View style={styles.weatherStrip}>
          <Text style={styles.weatherText}>Loading weather...</Text>
        </View>
      );
    }

    if (!weather || !weather.isReal) {
      return (
        <View style={styles.weatherStrip}>
          <Text style={styles.weatherText}>
            🌤 Weather unavailable — enable location for updates
          </Text>
        </View>
      );
    }

    return (
      <View style={styles.weatherStrip}>
        <View style={styles.weatherRow}>
          <Text style={styles.weatherMain}>
            {weather.emoji} {weather.temp}°C — {weather.description}
          </Text>
          <Text style={styles.weatherCity}>{weather.cityName}</Text>
        </View>
        {weather.warning && (
          <Text style={styles.weatherWarning}>⚠️ {weather.warning}</Text>
        )}
        <Text style={styles.weatherDetail}>
          Feels like {weather.feelsLike}°C · {weather.humidity}% humidity · {weather.windSpeed} km/h wind
        </Text>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <View style={styles.wrapper}>

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

        {/* ── Real Weather Strip ── */}
        {renderWeatherStrip()}

        {/* ── Smart AI Suggestion Card ── */}
        {suggestion && (
          <View style={styles.aiCard}>
            <Text style={styles.aiLabel}>AI SUGGESTION</Text>
            <Text style={styles.aiTitle}>Start "{suggestion.title}" now</Text>
            <Text style={styles.aiSub}>
              ~{suggestion.estimatedMinutes} min · {suggestion.hoursLeft}h until deadline
            </Text>
            {suggestion.timeContext ? (
              <Text style={styles.aiContext}>📅 {suggestion.timeContext}</Text>
            ) : null}
            {suggestion.urgencyNote ? (
              <Text style={styles.aiContext}>⚡ {suggestion.urgencyNote}</Text>
            ) : null}
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

        {/* ── Collaboration panel ── */}
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
              <input
                type="text"
                placeholder="Enter 6-character code"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                maxLength={6}
                style={{
                  width: "100%",
                  padding: 12,
                  borderRadius: 10,
                  border: `1px solid ${COLORS.border}`,
                  fontSize: 15,
                  backgroundColor: COLORS.background,
                  boxSizing: "border-box",
                  fontFamily: "inherit",
                  letterSpacing: 3,
                  marginBottom: 8,
                  outline: "none",
                }}
              />
            ) : (
              <TextInput
                style={styles.codeInput}
                placeholder="Enter 6-character code"
                placeholderTextColor={COLORS.textMuted}
                value={joinCode}
                onChangeText={(t) => setJoinCode(t.toUpperCase())}
                maxLength={6}
                autoCapitalize="characters"
              />
            )}
            <TouchableOpacity style={styles.joinBtn} onPress={handleJoin}>
              <Text style={styles.joinBtnText}>Join Task</Text>
            </TouchableOpacity>
            {joinMessage ? (
              <Text style={styles.joinMessage}>{joinMessage}</Text>
            ) : null}
            {shareMessage ? (
              <View style={styles.shareCodeBox}>
                <Text style={styles.shareCodeText}>{shareMessage}</Text>
                <Text style={styles.shareCodeHint}>Share this code with a classmate</Text>
              </View>
            ) : null}
          </View>
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
              urgency === "high" ? COLORS.danger :
              urgency === "medium" ? COLORS.warning :
              COLORS.success;
            const urgencyBg =
              urgency === "high" ? COLORS.dangerLight :
              urgency === "medium" ? COLORS.warningLight :
              COLORS.successLight;

            return (
              <View key={task.id} style={styles.taskCard}>
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
                <Text style={styles.taskMeta}>
                  {task.courseCode} · Due {new Date(task.deadline).toLocaleString("en-US", {
                    month: "short", day: "numeric",
                    hour: "numeric", minute: "2-digit", hour12: true,
                  })} · {timeLeft}
                </Text>
                <View style={styles.progressBarBg}>
                  <View style={[styles.progressBarFill, {
                    width: `${task.progress || 0}%`,
                    backgroundColor: COLORS.primary,
                  }]} />
                </View>
                <Text style={styles.progressLabel}>{task.progress || 0}% complete</Text>

                {!task.shareCode && (
                  <TouchableOpacity
                    style={styles.shareBtn}
                    onPress={() => handleShare(task.id)}
                  >
                    <Text style={styles.shareBtnText}>🔗 Share</Text>
                  </TouchableOpacity>
                )}
                {task.isShared && task.shareCode && (
                  <View style={styles.sharedBadge}>
                    <Text style={styles.sharedBadgeText}>
                      🔗 Shared · Code: {task.shareCode}
                    </Text>
                  </View>
                )}
                {task.shareCode && !task.isShared && (
                  <View style={[styles.sharedBadge, { backgroundColor: COLORS.successLight }]}>
                    <Text style={[styles.sharedBadgeText, { color: COLORS.success }]}>
                      👥 Joined task
                    </Text>
                  </View>
                )}
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
  wrapper: { flex: 1, backgroundColor: COLORS.background },
  loadingContainer: {
    flex: 1, justifyContent: "center",
    alignItems: "center", backgroundColor: COLORS.background,
  },
  container: { flex: 1 },
  content: { padding: 20, paddingTop: 56 },
  header: {
    flexDirection: "row", justifyContent: "space-between",
    alignItems: "center", marginBottom: 16,
  },
  greeting: { fontSize: 24, fontWeight: "700", color: COLORS.textPrimary },
  subGreeting: { fontSize: 14, color: COLORS.textSecondary, marginTop: 2 },
  avatar: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: COLORS.primary,
    justifyContent: "center", alignItems: "center",
  },
  avatarText: { color: "#fff", fontWeight: "700", fontSize: 16 },
  weatherStrip: {
    backgroundColor: COLORS.primaryLight,
    borderRadius: 12, padding: 12, marginBottom: 16,
  },
  weatherRow: {
    flexDirection: "row", justifyContent: "space-between",
    alignItems: "center", marginBottom: 4,
  },
  weatherMain: {
    fontSize: 14, fontWeight: "600", color: COLORS.primaryDark,
  },
  weatherCity: {
    fontSize: 12, color: COLORS.primary, fontWeight: "500",
  },
  weatherWarning: {
    fontSize: 13, color: COLORS.warning,
    fontWeight: "500", marginBottom: 4,
  },
  weatherDetail: {
    fontSize: 11, color: COLORS.textSecondary,
  },
  weatherText: {
    fontSize: 13, color: COLORS.primaryDark, fontWeight: "500",
  },
  aiCard: {
    backgroundColor: COLORS.primary,
    borderRadius: 16, padding: 18, marginBottom: 24,
  },
  aiLabel: {
    fontSize: 11, fontWeight: "700",
    color: "rgba(255,255,255,0.7)",
    letterSpacing: 1, marginBottom: 6,
  },
  aiTitle: { fontSize: 17, fontWeight: "700", color: "#fff", marginBottom: 4 },
  aiSub: { fontSize: 13, color: "rgba(255,255,255,0.8)", marginBottom: 4 },
  aiContext: { fontSize: 12, color: "rgba(255,255,255,0.75)", marginTop: 2 },
  sectionHeader: {
    flexDirection: "row", justifyContent: "space-between",
    alignItems: "center", marginBottom: 12,
  },
  sectionTitle: { fontSize: 17, fontWeight: "700", color: COLORS.textPrimary },
  seeAll: { fontSize: 13, color: COLORS.primary, fontWeight: "600" },
  classCard: {
    backgroundColor: COLORS.surface, borderRadius: 12,
    padding: 14, marginBottom: 10, borderLeftWidth: 4,
    shadowColor: "#000", shadowOpacity: 0.04,
    shadowRadius: 4, elevation: 1,
  },
  classTitle: { fontSize: 15, fontWeight: "600", color: COLORS.textPrimary, marginBottom: 3 },
  classMeta: { fontSize: 13, color: COLORS.textSecondary },
  collabCard: {
    backgroundColor: COLORS.surface, borderRadius: 16,
    padding: 16, marginBottom: 20,
    borderWidth: 1, borderColor: COLORS.border,
  },
  collabSubtitle: {
    fontSize: 13, fontWeight: "600",
    color: COLORS.textSecondary, marginBottom: 10,
  },
  codeInput: {
    backgroundColor: COLORS.background, borderRadius: 10,
    padding: 12, fontSize: 15, color: COLORS.textPrimary,
    borderWidth: 1, borderColor: COLORS.border,
    letterSpacing: 3, marginBottom: 8,
  },
  joinBtn: {
    backgroundColor: COLORS.primary, borderRadius: 10,
    padding: 12, alignItems: "center",
  },
  joinBtnText: { color: "#fff", fontWeight: "700", fontSize: 14 },
  joinMessage: {
    marginTop: 8, fontSize: 13,
    color: COLORS.textSecondary, textAlign: "center",
  },
  shareCodeBox: {
    marginTop: 12, backgroundColor: COLORS.primaryLight,
    borderRadius: 10, padding: 12, alignItems: "center",
  },
  shareCodeText: {
    fontSize: 18, fontWeight: "700",
    color: COLORS.primary, letterSpacing: 3,
  },
  shareCodeHint: {
    fontSize: 12, color: COLORS.textSecondary, marginTop: 4,
  },
  taskCard: {
    backgroundColor: COLORS.surface, borderRadius: 16,
    padding: 16, marginBottom: 12,
    shadowColor: "#000", shadowOpacity: 0.05,
    shadowRadius: 6, elevation: 2,
  },
  taskTopRow: {
    flexDirection: "row", justifyContent: "space-between",
    alignItems: "center", marginBottom: 6,
  },
  taskTitle: {
    fontSize: 15, fontWeight: "600",
    color: COLORS.textPrimary, flex: 1, marginRight: 8,
  },
  urgencyBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  urgencyText: { fontSize: 10, fontWeight: "700", letterSpacing: 0.5 },
  taskMeta: { fontSize: 12, color: COLORS.textSecondary, marginBottom: 10 },
  progressBarBg: {
    height: 6, backgroundColor: COLORS.border,
    borderRadius: 3, overflow: "hidden",
  },
  progressBarFill: { height: 6, borderRadius: 3 },
  progressLabel: { fontSize: 11, color: COLORS.textMuted, marginTop: 4 },
  shareBtn: {
    marginTop: 10, alignSelf: "flex-start",
    paddingHorizontal: 12, paddingVertical: 6,
    borderRadius: 8, borderWidth: 1, borderColor: COLORS.border,
  },
  shareBtnText: { fontSize: 12, color: COLORS.textSecondary, fontWeight: "600" },
  sharedBadge: {
    marginTop: 8, alignSelf: "flex-start",
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8,
  },
  sharedBadgeText: { fontSize: 12, color: COLORS.primary, fontWeight: "600" },
  emptyState: { alignItems: "center", paddingVertical: 40 },
  emptyText: { fontSize: 15, color: COLORS.textMuted },
  fab: {
    position: "absolute", bottom: 32, right: 24,
    width: 58, height: 58, borderRadius: 29,
    backgroundColor: COLORS.primary,
    justifyContent: "center", alignItems: "center",
    shadowColor: COLORS.primary, shadowOpacity: 0.4,
    shadowRadius: 12, shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  },
  fabText: { color: "#fff", fontSize: 28, fontWeight: "300", lineHeight: 32 },
});