import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { useTasks } from "../store/TaskContext";
import COLORS from "../constants/colors";

const POMODORO_MINUTES = 25;
const SHORT_BREAK_MINUTES = 5;
const LONG_BREAK_MINUTES = 15;
const SESSIONS_BEFORE_LONG_BREAK = 4;

export default function FocusScreen() {
  const { tasks, updateProgress, completeTask } = useTasks();
  const incompleteTasks = tasks.filter((t) => !t.completed);

  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [mode, setMode] = useState("focus"); // "focus" | "shortBreak" | "longBreak"
  const [secondsLeft, setSecondsLeft] = useState(POMODORO_MINUTES * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [sessionsCompleted, setSessions] = useState(0);
  const [totalFocusMinutes, setTotalFocusMinutes] = useState(0);
  const [showTaskPicker, setShowTaskPicker] = useState(false);

  const intervalRef = useRef(null);

  const selectedTask = tasks.find((t) => t.id === selectedTaskId) || null;

  // Timer durations per mode
  const modeDurations = {
    focus: POMODORO_MINUTES * 60,
    shortBreak: SHORT_BREAK_MINUTES * 60,
    longBreak: LONG_BREAK_MINUTES * 60,
  };

  const modeLabels = {
    focus: "Focus",
    shortBreak: "Short Break",
    longBreak: "Long Break",
  };

  const modeColors = {
    focus: COLORS.primary,
    shortBreak: COLORS.success,
    longBreak: COLORS.warning,
  };

  // Tick the timer every second
  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setSecondsLeft((prev) => {
          if (prev <= 1) {
            clearInterval(intervalRef.current);
            handleSessionEnd();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [isRunning, mode]);

  function handleSessionEnd() {
    setIsRunning(false);

    if (mode === "focus") {
      const newSessions = sessionsCompleted + 1;
      setSessions(newSessions);
      setTotalFocusMinutes((prev) => prev + POMODORO_MINUTES);

      // Update task progress if one is selected
      if (selectedTask) {
        const newProgress = Math.min(
          100,
          (selectedTask.progress || 0) + 20
        );
        updateProgress(selectedTask.id, newProgress);
      }

      // Switch to break mode
      if (newSessions % SESSIONS_BEFORE_LONG_BREAK === 0) {
        switchMode("longBreak");
      } else {
        switchMode("shortBreak");
      }
    } else {
      // Break ended — go back to focus
      switchMode("focus");
    }
  }

  function switchMode(newMode) {
    setMode(newMode);
    setSecondsLeft(modeDurations[newMode]);
    setIsRunning(false);
  }

  function handleStartPause() {
    setIsRunning((prev) => !prev);
  }

  function handleReset() {
    setIsRunning(false);
    setSecondsLeft(modeDurations[mode]);
  }

  function handleSkip() {
    clearInterval(intervalRef.current);
    handleSessionEnd();
  }

  // Format seconds as MM:SS
  function formatTime(seconds) {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  }

  // Progress percentage for the ring
  const totalSeconds = modeDurations[mode];
  const progressPercent = ((totalSeconds - secondsLeft) / totalSeconds) * 100;

  // Ring dimensions
  const RING_SIZE = 220;
  const STROKE = 10;
  const RADIUS = (RING_SIZE - STROKE) / 2;
  const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
  const strokeDashoffset = CIRCUMFERENCE - (progressPercent / 100) * CIRCUMFERENCE;

  return (
    <View style={styles.wrapper}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.pageTitle}>Focus</Text>

        {/* ── Mode selector ── */}
        <View style={styles.modeRow}>
          {["focus", "shortBreak", "longBreak"].map((m) => (
            <TouchableOpacity
              key={m}
              onPress={() => switchMode(m)}
              style={[
                styles.modeBtn,
                mode === m && { backgroundColor: modeColors[m] },
              ]}
            >
              <Text style={[
                styles.modeBtnText,
                mode === m && { color: "#fff" },
              ]}>
                {modeLabels[m]}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* ── Timer ring ── */}
        <View style={styles.ringContainer}>
          {/* SVG ring — web only */}
          {typeof document !== "undefined" ? (
            <svg
              width={RING_SIZE}
              height={RING_SIZE}
              style={{ position: "absolute" }}
            >
              {/* Background ring */}
              <circle
                cx={RING_SIZE / 2}
                cy={RING_SIZE / 2}
                r={RADIUS}
                fill="none"
                stroke={COLORS.border}
                strokeWidth={STROKE}
              />
              {/* Progress ring */}
              <circle
                cx={RING_SIZE / 2}
                cy={RING_SIZE / 2}
                r={RADIUS}
                fill="none"
                stroke={modeColors[mode]}
                strokeWidth={STROKE}
                strokeDasharray={CIRCUMFERENCE}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                transform={`rotate(-90 ${RING_SIZE / 2} ${RING_SIZE / 2})`}
              />
            </svg>
          ) : (
            // Native fallback ring (simple border)
            <View style={[styles.nativeRing, { borderColor: modeColors[mode] }]} />
          )}

          {/* Timer text in center */}
          <View style={styles.timerCenter}>
            <Text style={[styles.timerText, { color: modeColors[mode] }]}>
              {formatTime(secondsLeft)}
            </Text>
            <Text style={styles.modeLabel}>{modeLabels[mode]}</Text>
          </View>
        </View>

        {/* ── Controls ── */}
        <View style={styles.controls}>
          <TouchableOpacity style={styles.secondaryBtn} onPress={handleReset}>
            <Text style={styles.secondaryBtnText}>Reset</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.primaryBtn, { backgroundColor: modeColors[mode] }]}
            onPress={handleStartPause}
          >
            <Text style={styles.primaryBtnText}>
              {isRunning ? "Pause" : "Start"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.secondaryBtn} onPress={handleSkip}>
            <Text style={styles.secondaryBtnText}>Skip</Text>
          </TouchableOpacity>
        </View>

        {/* ── Selected task ── */}
        <View style={styles.taskSelectorRow}>
          <TouchableOpacity
            style={[styles.taskSelector, { flex: 1 }]}
            onPress={() => setShowTaskPicker((prev) => !prev)}
          >
            <Text style={styles.taskSelectorLabel}>FOCUSING ON</Text>
            <Text style={styles.taskSelectorValue} numberOfLines={1}>
              {selectedTask ? selectedTask.title : "Tap to select a task"}
            </Text>
          </TouchableOpacity>
          {selectedTask && (
            <TouchableOpacity
              style={styles.completeTaskBtn}
              onPress={() => { completeTask(selectedTaskId); setSelectedTaskId(null); }}
            >
              <Text style={styles.completeTaskBtnText}>✓ Done</Text>
            </TouchableOpacity>
          )}
        </View>

        

        {/* ── Task picker dropdown ── */}
        {showTaskPicker && (
          <View style={styles.taskPicker}>
            {incompleteTasks.length === 0 ? (
              <Text style={styles.noTasksText}>No incomplete tasks</Text>
            ) : (
              incompleteTasks.map((task) => (
                <TouchableOpacity
                  key={task.id}
                  style={[
                    styles.taskPickerItem,
                    selectedTaskId === task.id && styles.taskPickerItemActive,
                  ]}
                  onPress={() => {
                    setSelectedTaskId(task.id);
                    setShowTaskPicker(false);
                  }}
                >
                  <Text style={[
                    styles.taskPickerText,
                    selectedTaskId === task.id && styles.taskPickerTextActive,
                  ]}>
                    {task.title}
                  </Text>
                  <Text style={styles.taskPickerMeta}>{task.courseCode}</Text>
                </TouchableOpacity>
              ))
            )}
          </View>
        )}

        {/* ── Session stats ── */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{sessionsCompleted}</Text>
            <Text style={styles.statLabel}>Sessions</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{totalFocusMinutes}m</Text>
            <Text style={styles.statLabel}>Focus time</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>
              {Math.floor(sessionsCompleted / SESSIONS_BEFORE_LONG_BREAK)}
            </Text>
            <Text style={styles.statLabel}>Cycles done</Text>
          </View>
        </View>

        {/* Pomodoro info */}
        <View style={styles.infoCard}>
          <Text style={styles.infoText}>
            🍅 Pomodoro: {POMODORO_MINUTES} min focus → {SHORT_BREAK_MINUTES} min break.
            Every {SESSIONS_BEFORE_LONG_BREAK} sessions → {LONG_BREAK_MINUTES} min long break.
            Each completed session adds 20% progress to your selected task.
          </Text>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const RING_SIZE = 220;

const styles = StyleSheet.create({
  wrapper: { flex: 1, backgroundColor: COLORS.background },
  container: { flex: 1 },
  content: { padding: 20, paddingTop: 56, alignItems: "center" },
  pageTitle: {
    fontSize: 26, fontWeight: "700",
    color: COLORS.textPrimary, marginBottom: 20,
    alignSelf: "flex-start",
  },
  modeRow: {
    flexDirection: "row", gap: 8,
    marginBottom: 32, alignSelf: "stretch",
  },
  modeBtn: {
    flex: 1, paddingVertical: 8, borderRadius: 10,
    backgroundColor: COLORS.surface,
    alignItems: "center",
    borderWidth: 1, borderColor: COLORS.border,
  },
  modeBtnText: {
    fontSize: 12, fontWeight: "600",
    color: COLORS.textSecondary,
  },
  ringContainer: {
    width: RING_SIZE, height: RING_SIZE,
    justifyContent: "center", alignItems: "center",
    marginBottom: 32,
  },
  nativeRing: {
    position: "absolute",
    width: RING_SIZE - 10, height: RING_SIZE - 10,
    borderRadius: (RING_SIZE - 10) / 2,
    borderWidth: 10,
  },
  timerCenter: { alignItems: "center" },
  timerText: {
    fontSize: 52, fontWeight: "700", letterSpacing: 2,
  },
  modeLabel: {
    fontSize: 14, color: COLORS.textSecondary,
    fontWeight: "500", marginTop: 4,
  },
  controls: {
    flexDirection: "row", gap: 12,
    alignItems: "center", marginBottom: 28,
  },
  primaryBtn: {
    width: 100, height: 48, borderRadius: 24,
    justifyContent: "center", alignItems: "center",
    shadowOpacity: 0.3, shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  primaryBtnText: { color: "#fff", fontSize: 16, fontWeight: "700" },
  secondaryBtn: {
    width: 72, height: 40, borderRadius: 20,
    justifyContent: "center", alignItems: "center",
    backgroundColor: COLORS.surface,
    borderWidth: 1, borderColor: COLORS.border,
  },
  secondaryBtnText: { fontSize: 13, color: COLORS.textSecondary, fontWeight: "600" },
  taskSelector: {
    alignSelf: "stretch",
    backgroundColor: COLORS.surface,
    borderRadius: 14, padding: 14,
    borderWidth: 1, borderColor: COLORS.border,
    marginBottom: 8,
  },
  taskSelectorLabel: {
    fontSize: 10, fontWeight: "700",
    color: COLORS.textMuted, letterSpacing: 1, marginBottom: 4,
  },
  taskSelectorValue: {
    fontSize: 15, fontWeight: "600", color: COLORS.textPrimary,
  },
  taskPicker: {
    alignSelf: "stretch",
    backgroundColor: COLORS.surface,
    borderRadius: 14, overflow: "hidden",
    borderWidth: 1, borderColor: COLORS.border,
    marginBottom: 20,
  },
  taskPickerItem: {
    padding: 14,
    borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  taskPickerItemActive: { backgroundColor: COLORS.primaryLight },
  taskPickerText: {
    fontSize: 14, fontWeight: "600", color: COLORS.textPrimary,
  },
  taskPickerTextActive: { color: COLORS.primary },
  taskPickerMeta: {
    fontSize: 12, color: COLORS.textSecondary, marginTop: 2,
  },
  noTasksText: {
    padding: 16, fontSize: 14,
    color: COLORS.textMuted, textAlign: "center",
  },
  statsRow: {
    flexDirection: "row", gap: 12,
    alignSelf: "stretch", marginBottom: 16,
  },
  statCard: {
    flex: 1, backgroundColor: COLORS.surface,
    borderRadius: 14, padding: 14, alignItems: "center",
    borderWidth: 1, borderColor: COLORS.border,
  },
  statValue: {
    fontSize: 22, fontWeight: "700", color: COLORS.textPrimary,
  },
  statLabel: {
    fontSize: 11, color: COLORS.textSecondary,
    fontWeight: "500", marginTop: 2,
  },
  infoCard: {
    alignSelf: "stretch",
    backgroundColor: COLORS.primaryLight,
    borderRadius: 14, padding: 14,
  },
  infoText: {
    fontSize: 12, color: COLORS.primaryDark,
    lineHeight: 18, fontWeight: "500",
  },
  taskSelectorRow: { flexDirection: "row", alignSelf: "stretch", gap: 8, marginBottom: 8 },
  completeTaskBtn: { backgroundColor: COLORS.success, borderRadius: 14, paddingHorizontal: 16, justifyContent: "center", alignItems: "center" },
  completeTaskBtnText: { color: "#fff", fontWeight: "700", fontSize: 13 },
});