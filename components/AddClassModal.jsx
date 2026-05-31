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
import { useClasses } from "../store/ClassContext";

let DateTimePicker = null;
if (Platform.OS !== "web") {
  DateTimePicker = require("@react-native-community/datetimepicker").default;
}

const DAY_OPTIONS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const COLOR_OPTIONS = [
  "#534AB7", // purple (primary)
  "#3B6D11", // green
  "#A32D2D", // red
  "#854F0B", // orange
  "#1A6B8A", // teal
  "#7B3FA0", // violet
  "#2E6DA4", // blue
  "#A0522D", // brown
];

export default function AddClassModal({ visible, onClose }) {
  const [name, setName] = useState("");
  const [courseCode, setCourseCode] = useState("");
  const [room, setRoom] = useState("");
  const [selectedDays, setSelectedDays] = useState([]);
  const [startTime, setStartTime] = useState("08:00");
  const [endTime, setEndTime] = useState("09:00");
  const [selectedColor, setSelectedColor] = useState(COLOR_OPTIONS[0]);

  // Native time picker state
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [nativeStartTime, setNativeStartTime] = useState(new Date());
  const [nativeEndTime, setNativeEndTime] = useState(new Date());

  const { addClass } = useClasses();

  // Toggle a day on/off in the selectedDays array
  function toggleDay(day) {
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  }

  // Convert a Date object to "HH:MM" string for display
  function dateToTimeString(date) {
    const pad = (n) => String(n).padStart(2, "0");
    return pad(date.getHours()) + ":" + pad(date.getMinutes());
  }

  // Convert "HH:MM" string to a Date object (for native picker initial value)
  function timeStringToDate(str) {
    const [hours, minutes] = str.split(":").map(Number);
    const d = new Date();
    d.setHours(hours);
    d.setMinutes(minutes);
    d.setSeconds(0);
    return d;
  }

  // Format "HH:MM" to "h:MM AM/PM" for display
  function formatTime(str) {
    const [hours, minutes] = str.split(":").map(Number);
    const period = hours >= 12 ? "PM" : "AM";
    const h = hours % 12 || 12;
    return `${h}:${String(minutes).padStart(2, "0")} ${period}`;
  }

  function handleNativeStartChange(event, selectedDate) {
    setShowStartPicker(false);
    if (event.type === "dismissed" || !selectedDate) return;
    setNativeStartTime(selectedDate);
    setStartTime(dateToTimeString(selectedDate));
  }

  function handleNativeEndChange(event, selectedDate) {
    setShowEndPicker(false);
    if (event.type === "dismissed" || !selectedDate) return;
    setNativeEndTime(selectedDate);
    setEndTime(dateToTimeString(selectedDate));
  }

  function handleSubmit() {
    if (!name.trim()) return;
    if (selectedDays.length === 0) return;

    addClass({
      name: name.trim(),
      courseCode: courseCode.trim() || "GEN",
      room: room.trim() || "TBA",
      days: selectedDays,
      startTime: formatTime(startTime),
      endTime: formatTime(endTime),
      color: selectedColor,
    });

    // Reset form
    setName("");
    setCourseCode("");
    setRoom("");
    setSelectedDays([]);
    setStartTime("08:00");
    setEndTime("09:00");
    setSelectedColor(COLOR_OPTIONS[0]);
    onClose();
  }

  const canSubmit = name.trim() && selectedDays.length > 0;

  // ── Web branch ──
  if (Platform.OS === "web") {
    if (!visible) return null;

    return (
      <div
        onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
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
        <div style={{
          backgroundColor: COLORS.surface,
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          padding: 24,
          width: "100%",
          maxWidth: 600,
          maxHeight: "90vh",
          overflowY: "auto",
          boxSizing: "border-box",
        }}>

          {/* Header */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <span style={{ fontSize: 20, fontWeight: 700, color: COLORS.textPrimary }}>
              New Class
            </span>
            <button onClick={onClose} style={{
              width: 32, height: 32, borderRadius: 16,
              backgroundColor: COLORS.border, border: "none",
              cursor: "pointer", fontSize: 14, color: COLORS.textSecondary,
              fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center",
            }}>✕</button>
          </div>

          {/* Class name */}
          <label style={webStyles.label}>CLASS NAME *</label>
          <input
            type="text"
            placeholder="e.g. Calculus II"
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={webStyles.input}
          />

          {/* Course code */}
          <label style={webStyles.label}>COURSE CODE</label>
          <input
            type="text"
            placeholder="e.g. MATH201"
            value={courseCode}
            onChange={(e) => setCourseCode(e.target.value.toUpperCase())}
            style={webStyles.input}
          />

          {/* Room */}
          <label style={webStyles.label}>ROOM</label>
          <input
            type="text"
            placeholder="e.g. Room 204"
            value={room}
            onChange={(e) => setRoom(e.target.value)}
            style={webStyles.input}
          />

          {/* Days selector */}
          <label style={webStyles.label}>DAYS *</label>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 4 }}>
            {DAY_OPTIONS.map((day) => {
              const active = selectedDays.includes(day);
              return (
                <button
                  key={day}
                  onClick={() => toggleDay(day)}
                  style={{
                    padding: "8px 14px",
                    borderRadius: 10,
                    border: `2px solid ${active ? COLORS.primary : COLORS.border}`,
                    backgroundColor: active ? COLORS.primaryLight : COLORS.background,
                    color: active ? COLORS.primary : COLORS.textSecondary,
                    fontWeight: 600,
                    fontSize: 13,
                    cursor: "pointer",
                  }}
                >
                  {day}
                </button>
              );
            })}
          </div>
          {selectedDays.length === 0 && (
            <div style={{ fontSize: 12, color: COLORS.danger, marginTop: 4 }}>
              Please select at least one day
            </div>
          )}

          {/* Start time */}
          <label style={webStyles.label}>START TIME</label>
          <input
            type="time"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            style={webStyles.input}
          />
          <div style={{ fontSize: 13, color: COLORS.primary, fontWeight: 600, marginTop: 4 }}>
            🕐 {formatTime(startTime)}
          </div>

          {/* End time */}
          <label style={webStyles.label}>END TIME</label>
          <input
            type="time"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            style={webStyles.input}
          />
          <div style={{ fontSize: 13, color: COLORS.primary, fontWeight: 600, marginTop: 4 }}>
            🕐 {formatTime(endTime)}
          </div>

          {/* Color picker */}
          <label style={webStyles.label}>COLOR</label>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            {COLOR_OPTIONS.map((color) => (
              <button
                key={color}
                onClick={() => setSelectedColor(color)}
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 18,
                  backgroundColor: color,
                  border: selectedColor === color
                    ? `3px solid ${COLORS.textPrimary}`
                    : "3px solid transparent",
                  cursor: "pointer",
                  outline: "none",
                }}
              />
            ))}
          </div>

          {/* Submit */}
          <button
            onClick={handleSubmit}
            disabled={!canSubmit}
            style={{
              marginTop: 24,
              width: "100%",
              padding: "16px",
              backgroundColor: canSubmit ? COLORS.primary : COLORS.border,
              color: "#fff",
              border: "none",
              borderRadius: 14,
              fontSize: 16,
              fontWeight: 700,
              cursor: canSubmit ? "pointer" : "not-allowed",
              boxSizing: "border-box",
            }}
          >
            Add Class
          </button>

        </div>
      </div>
    );
  }

  // ── Native branch ──
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
              <Text style={styles.headerTitle}>New Class</Text>
              <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                <Text style={styles.closeBtnText}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>

              <Text style={styles.label}>Class Name *</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. Calculus II"
                placeholderTextColor={COLORS.textMuted}
                value={name}
                onChangeText={setName}
              />

              <Text style={styles.label}>Course Code</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. MATH201"
                placeholderTextColor={COLORS.textMuted}
                value={courseCode}
                onChangeText={setCourseCode}
                autoCapitalize="characters"
              />

              <Text style={styles.label}>Room</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. Room 204"
                placeholderTextColor={COLORS.textMuted}
                value={room}
                onChangeText={setRoom}
              />

              {/* Days selector */}
              <Text style={styles.label}>Days *</Text>
              <View style={styles.daysRow}>
                {DAY_OPTIONS.map((day) => {
                  const active = selectedDays.includes(day);
                  return (
                    <TouchableOpacity
                      key={day}
                      onPress={() => toggleDay(day)}
                      style={[styles.dayBtn, active && styles.dayBtnActive]}
                    >
                      <Text style={[styles.dayBtnText, active && styles.dayBtnTextActive]}>
                        {day}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Start time */}
              <Text style={styles.label}>Start Time</Text>
              <TouchableOpacity
                style={styles.timeButton}
                onPress={() => setShowStartPicker(true)}
              >
                <Text style={styles.timeButtonText}>🕐 {formatTime(startTime)}</Text>
              </TouchableOpacity>
              {showStartPicker && DateTimePicker && (
                <DateTimePicker
                  value={nativeStartTime}
                  mode="time"
                  display="default"
                  onChange={handleNativeStartChange}
                />
              )}

              {/* End time */}
              <Text style={styles.label}>End Time</Text>
              <TouchableOpacity
                style={styles.timeButton}
                onPress={() => setShowEndPicker(true)}
              >
                <Text style={styles.timeButtonText}>🕐 {formatTime(endTime)}</Text>
              </TouchableOpacity>
              {showEndPicker && DateTimePicker && (
                <DateTimePicker
                  value={nativeEndTime}
                  mode="time"
                  display="default"
                  onChange={handleNativeEndChange}
                />
              )}

              {/* Color picker */}
              <Text style={styles.label}>Color</Text>
              <View style={styles.colorRow}>
                {COLOR_OPTIONS.map((color) => (
                  <TouchableOpacity
                    key={color}
                    onPress={() => setSelectedColor(color)}
                    style={[
                      styles.colorSwatch,
                      { backgroundColor: color },
                      selectedColor === color && styles.colorSwatchSelected,
                    ]}
                  />
                ))}
              </View>

              <TouchableOpacity
                style={[styles.submitBtn, !canSubmit && styles.submitBtnDisabled]}
                onPress={handleSubmit}
                disabled={!canSubmit}
              >
                <Text style={styles.submitBtnText}>Add Class</Text>
              </TouchableOpacity>

            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

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
  avoidingView: { width: "100%" },
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
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: COLORS.border,
    justifyContent: "center", alignItems: "center",
  },
  closeBtnText: {
    fontSize: 14, color: COLORS.textSecondary, fontWeight: "600",
  },
  label: {
    fontSize: 13, fontWeight: "600", color: COLORS.textSecondary,
    marginBottom: 6, marginTop: 14,
    textTransform: "uppercase", letterSpacing: 0.5,
  },
  input: {
    backgroundColor: COLORS.background,
    borderRadius: 12, padding: 14,
    fontSize: 15, color: COLORS.textPrimary,
    borderWidth: 1, borderColor: COLORS.border,
  },
  daysRow: {
    flexDirection: "row", flexWrap: "wrap", gap: 8,
  },
  dayBtn: {
    paddingHorizontal: 14, paddingVertical: 8,
    borderRadius: 10, borderWidth: 2,
    borderColor: COLORS.border,
    backgroundColor: COLORS.background,
    marginBottom: 4,
  },
  dayBtnActive: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primaryLight,
  },
  dayBtnText: {
    fontSize: 13, fontWeight: "600", color: COLORS.textSecondary,
  },
  dayBtnTextActive: {
    color: COLORS.primary,
  },
  timeButton: {
    backgroundColor: COLORS.background,
    borderRadius: 12, padding: 14,
    borderWidth: 1, borderColor: COLORS.border,
  },
  timeButtonText: {
    fontSize: 15, color: COLORS.textPrimary,
  },
  colorRow: {
    flexDirection: "row", flexWrap: "wrap", gap: 10, marginTop: 4,
  },
  colorSwatch: {
    width: 36, height: 36, borderRadius: 18,
    borderWidth: 3, borderColor: "transparent",
  },
  colorSwatchSelected: {
    borderColor: COLORS.textPrimary,
  },
  submitBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 14, padding: 16,
    alignItems: "center", marginTop: 24, marginBottom: 8,
  },
  submitBtnDisabled: {
    backgroundColor: COLORS.border,
  },
  submitBtnText: {
    color: "#fff", fontSize: 16, fontWeight: "700",
  },
});