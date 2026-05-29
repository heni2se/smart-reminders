import React, { useState } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Platform,
  ScrollView,
  KeyboardAvoidingView,
} from "react-native";
import COLORS from "../constants/colors";
import { useTasks } from "../store/TaskContext";

let DateTimePicker = null;
if (Platform.OS !== "web") {
  DateTimePicker = require("@react-native-community/datetimepicker").default;
}

export default function AddTaskModal({ visible, onClose }) {
  const [title, setTitle] = useState("");
  const [courseCode, setCourseCode] = useState("");
  const [estimatedMinutes, setEstimatedMinutes] = useState("");
  const [deadline, setDeadline] = useState(new Date());

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  const { addTask } = useTasks();

  function handleWebDateChange(e) {
    const value = e.target.value;
    if (value) setDeadline(new Date(value));
  }

  function toDatetimeLocalString(date) {
    const pad = (n) => String(n).padStart(2, "0");
    return (
      date.getFullYear() +
      "-" + pad(date.getMonth() + 1) +
      "-" + pad(date.getDate()) +
      "T" + pad(date.getHours()) +
      ":" + pad(date.getMinutes())
    );
  }

  function formatDeadline(date) {
    return date.toLocaleString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  }

  function handleNativeDateChange(event, selectedDate) {
    if (event.type === "dismissed") {
      setShowDatePicker(false);
      setShowTimePicker(false);
      return;
    }
    const picked = selectedDate || deadline;
    if (showDatePicker) {
      setShowDatePicker(false);
      const merged = new Date(deadline);
      merged.setFullYear(picked.getFullYear());
      merged.setMonth(picked.getMonth());
      merged.setDate(picked.getDate());
      setDeadline(merged);
      if (Platform.OS === "android") setShowTimePicker(true);
    } else if (showTimePicker) {
      setShowTimePicker(false);
      const merged = new Date(deadline);
      merged.setHours(picked.getHours());
      merged.setMinutes(picked.getMinutes());
      setDeadline(merged);
    }
  }

  function handleSubmit() {
    if (!title.trim()) return;
    addTask({
      title: title.trim(),
      courseCode: courseCode.trim() || "General",
      estimatedMinutes: parseInt(estimatedMinutes) || 30,
      deadline: deadline.toISOString(),
    });
    setTitle("");
    setCourseCode("");
    setEstimatedMinutes("");
    setDeadline(new Date());
    onClose();
  }

  // ── Web: render a plain div overlay instead of RN Modal ──
  // RN's Modal on web can trap focus and block pointer events unpredictably.
  // A plain absolutely-positioned div avoids all of that.
  if (Platform.OS === "web") {
    if (!visible) return null;

    return (
      <div
        onClick={(e) => {
          // Clicking the dark backdrop (not the card) closes the modal
          if (e.target === e.currentTarget) onClose();
        }}
        style={{
          position: "fixed",
          inset: 0,
          backgroundColor: "rgba(0,0,0,0.5)",
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "center",
          zIndex: 9999,
        }}
      >
        <div
          style={{
            backgroundColor: COLORS.surface,
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            padding: 24,
            width: "100%",
            maxWidth: 600,
            maxHeight: "90vh",
            overflowY: "auto",
            boxSizing: "border-box",
          }}
        >
          {/* Header */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <span style={{ fontSize: 20, fontWeight: 700, color: COLORS.textPrimary }}>
              New Task
            </span>
            <button
              onClick={onClose}
              style={{
                width: 32,
                height: 32,
                borderRadius: 16,
                backgroundColor: COLORS.border,
                border: "none",
                cursor: "pointer",
                fontSize: 14,
                color: COLORS.textSecondary,
                fontWeight: 600,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              ✕
            </button>
          </div>

          {/* Title */}
          <label style={webStyles.label}>TASK TITLE *</label>
          <input
            type="text"
            placeholder="e.g. Study for midterm"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            style={webStyles.input}
          />

          {/* Course code */}
          <label style={webStyles.label}>COURSE CODE</label>
          <input
            type="text"
            placeholder="e.g. CS101 (optional)"
            value={courseCode}
            onChange={(e) => setCourseCode(e.target.value.toUpperCase())}
            style={webStyles.input}
          />

          {/* Estimated minutes */}
          <label style={webStyles.label}>ESTIMATED MINUTES</label>
          <input
            type="number"
            placeholder="e.g. 45"
            value={estimatedMinutes}
            onChange={(e) => setEstimatedMinutes(e.target.value)}
            min="1"
            style={webStyles.input}
          />

          {/* Deadline */}
          <label style={webStyles.label}>DEADLINE</label>
          <input
            type="datetime-local"
            value={toDatetimeLocalString(deadline)}
            onChange={handleWebDateChange}
            min={toDatetimeLocalString(new Date())}
            style={webStyles.input}
          />
          {/* Formatted deadline display — always visible below the picker */}
          <div style={{
            marginTop: 6,
            marginBottom: 4,
            fontSize: 13,
            color: COLORS.primary,
            fontWeight: 600,
            paddingLeft: 2,
          }}>
            📅 {formatDeadline(deadline)}
          </div>

          {/* Submit */}
          <button
            onClick={handleSubmit}
            disabled={!title.trim()}
            style={{
              marginTop: 24,
              width: "100%",
              padding: "16px",
              backgroundColor: title.trim() ? COLORS.primary : COLORS.border,
              color: "#fff",
              border: "none",
              borderRadius: 14,
              fontSize: 16,
              fontWeight: 700,
              cursor: title.trim() ? "pointer" : "not-allowed",
              boxSizing: "border-box",
            }}
          >
            Add Task
          </button>

        </div>
      </div>
    );
  }

  // ── Native: original RN Modal (works correctly on iOS/Android) ──
  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.avoidingView}
        >
          <View style={styles.card}>
            <View style={styles.header}>
              <Text style={styles.headerTitle}>New Task</Text>
              <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                <Text style={styles.closeBtnText}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.label}>Task Title *</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. Study for midterm"
                placeholderTextColor={COLORS.textMuted}
                value={title}
                onChangeText={setTitle}
              />

              <Text style={styles.label}>Course Code</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. CS101 (optional)"
                placeholderTextColor={COLORS.textMuted}
                value={courseCode}
                onChangeText={setCourseCode}
                autoCapitalize="characters"
              />

              <Text style={styles.label}>Estimated Minutes</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. 45"
                placeholderTextColor={COLORS.textMuted}
                value={estimatedMinutes}
                onChangeText={setEstimatedMinutes}
                keyboardType="numeric"
              />

              <Text style={styles.label}>Deadline</Text>
              <TouchableOpacity
                style={styles.dateButton}
                onPress={() => setShowDatePicker(true)}
              >
                <Text style={styles.dateButtonText}>
                  📅 {formatDeadline(deadline)}
                </Text>
              </TouchableOpacity>

              {(showDatePicker || showTimePicker) && DateTimePicker && (
                <DateTimePicker
                  value={deadline}
                  mode={showDatePicker ? "date" : "time"}
                  display="default"
                  onChange={handleNativeDateChange}
                  minimumDate={new Date()}
                />
              )}

              <TouchableOpacity
                style={[styles.submitBtn, !title.trim() && styles.submitBtnDisabled]}
                onPress={handleSubmit}
                disabled={!title.trim()}
              >
                <Text style={styles.submitBtnText}>Add Task</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

// Inline styles for the web branch (plain JS objects, not StyleSheet)
const webStyles = {
  label: {
    display: "block",
    fontSize: 12,
    fontWeight: 700,
    color: COLORS.textSecondary,
    marginBottom: 6,
    marginTop: 14,
    letterSpacing: 0.5,
  },
  input: {
    width: "100%",
    backgroundColor: COLORS.background,
    border: `1px solid ${COLORS.border}`,
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    color: COLORS.textPrimary,
    boxSizing: "border-box",
    fontFamily: "inherit",
    outline: "none",
  },
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  avoidingView: {
    width: "100%",
  },
  card: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: "90%",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: COLORS.textPrimary,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.border,
    justifyContent: "center",
    alignItems: "center",
  },
  closeBtnText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontWeight: "600",
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: COLORS.textSecondary,
    marginBottom: 6,
    marginTop: 14,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  input: {
    backgroundColor: COLORS.background,
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    color: COLORS.textPrimary,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  dateButton: {
    backgroundColor: COLORS.background,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  dateButtonText: {
    fontSize: 15,
    color: COLORS.textPrimary,
  },
  submitBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 14,
    padding: 16,
    alignItems: "center",
    marginTop: 24,
    marginBottom: 8,
  },
  submitBtnDisabled: {
    backgroundColor: COLORS.border,
  },
  submitBtnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
});