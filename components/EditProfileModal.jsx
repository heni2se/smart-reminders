import React, { useState } from "react";
import { Platform } from "react-native";
import { useUser } from "../store/UserContext";
import COLORS, { FONTS } from "../constants/colors";

const AVATAR_COLORS = [
  "#534AB7", "#3B6D11", "#A32D2D", "#854F0B",
  "#1A6B8A", "#7B3FA0", "#2E6DA4", "#A0522D",
];

export default function EditProfileModal({ visible, onClose }) {
  const { userName, avatarColor, saveProfile } = useUser();
  const [name, setName] = useState(userName);
  const [color, setColor] = useState(avatarColor);

  React.useEffect(() => {
    setName(userName);
    setColor(avatarColor);
  }, [userName, avatarColor]);

  function handleSave() {
    saveProfile(name.trim() || "You", color);
    onClose();
  }

  if (Platform.OS === "web") {
    if (!visible) return null;
    return (
      <div
        onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        style={{
          position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: "rgba(0,0,0,0.5)", zIndex: 9999,
          display: "flex", alignItems: "center", justifyContent: "center",
          padding: "20px 16px", boxSizing: "border-box",
        }}
      >
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            backgroundColor: COLORS.surface, borderRadius: 24, padding: 24,
            width: "100%", maxWidth: 400, boxSizing: "border-box",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
            <span style={{ fontSize: 20, fontWeight: 700, color: COLORS.textPrimary }}>Edit Profile</span>
            <button onClick={onClose} style={{
              width: 32, height: 32, borderRadius: 16, backgroundColor: COLORS.border,
              border: "none", cursor: "pointer", fontSize: 14, color: COLORS.textSecondary, fontWeight: 600,
            }}>✕</button>
          </div>

          {/* Avatar preview */}
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 20 }}>
            <div style={{
              width: 72, height: 72, borderRadius: 36,
              backgroundColor: color,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 28, fontWeight: 700, color: "#fff",
            }}>
              {name ? name.charAt(0).toUpperCase() : "U"}
            </div>
          </div>

          <label style={webStyles.label}>YOUR NAME</label>
          <input
            type="text"
            placeholder="Enter your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={webStyles.input}
          />

          <label style={webStyles.label}>AVATAR COLOR</label>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 8 }}>
            {AVATAR_COLORS.map((c) => (
              <button key={c} onClick={() => setColor(c)} style={{
                width: 40, height: 40, borderRadius: 20,
                backgroundColor: c,
                border: color === c ? `3px solid ${COLORS.textPrimary}` : "3px solid transparent",
                cursor: "pointer", outline: "none",
              }} />
            ))}
          </div>

          <button onClick={handleSave} style={{
            marginTop: 24, width: "100%", padding: "16px",
            backgroundColor: COLORS.primary, color: "#fff",
            border: "none", borderRadius: 14, fontSize: 16,
            fontWeight: 700, cursor: "pointer", boxSizing: "border-box",
          }}>Save Profile</button>
        </div>
      </div>
    );
  }

  // Native version
  const {
    Modal, View, Text, TextInput, TouchableOpacity, StyleSheet,
  } = require("react-native");

  return (
    <Modal visible={visible} animationType="fade" transparent={true} onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Edit Profile</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Text style={styles.closeBtnText}>✕</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.avatarPreview}>
            <View style={[styles.avatarCircle, { backgroundColor: color }]}>
              <Text style={styles.avatarLetter}>
                {name ? name.charAt(0).toUpperCase() : "U"}
              </Text>
            </View>
          </View>

          <Text style={styles.label}>YOUR NAME</Text>
          <TextInput style={styles.input} placeholder="Enter your name"
            placeholderTextColor={COLORS.textMuted} value={name} onChangeText={setName} />

          <Text style={styles.label}>AVATAR COLOR</Text>
          <View style={styles.colorRow}>
            {AVATAR_COLORS.map((c) => (
              <TouchableOpacity key={c} onPress={() => setColor(c)}
                style={[styles.colorSwatch, { backgroundColor: c },
                  color === c && styles.colorSwatchSelected]} />
            ))}
          </View>

          <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
            <Text style={styles.saveBtnText}>Save Profile</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const webStyles = {
  label: { display: "block", fontSize: 12, fontWeight: 700, color: COLORS.textSecondary, marginBottom: 6, marginTop: 14, letterSpacing: 0.5 },
  input: { width: "100%", backgroundColor: COLORS.background, border: `1px solid ${COLORS.border}`, borderRadius: 12, padding: 14, fontSize: 15, color: COLORS.textPrimary, boxSizing: "border-box", fontFamily: "inherit", outline: "none" },
};

const { StyleSheet } = require("react-native");
const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", alignItems: "center", padding: 24 },
  card: { backgroundColor: COLORS.surface, borderRadius: 24, padding: 24, width: "100%" },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20 },
  headerTitle: { fontSize: 20, fontFamily: FONTS.bold, color: COLORS.textPrimary },
  closeBtn: { width: 32, height: 32, borderRadius: 16, backgroundColor: COLORS.border, justifyContent: "center", alignItems: "center" },
  closeBtnText: { fontSize: 14, color: COLORS.textSecondary, fontWeight: "600" },
  avatarPreview: { alignItems: "center", marginBottom: 20 },
  avatarCircle: { width: 72, height: 72, borderRadius: 36, justifyContent: "center", alignItems: "center" },
  avatarLetter: { fontSize: 28, fontFamily: FONTS.bold, color: "#fff" },
  label: { fontSize: 12, fontFamily: FONTS.bold, color: COLORS.textSecondary, marginBottom: 6, marginTop: 14, textTransform: "uppercase", letterSpacing: 0.5 },
  input: { backgroundColor: COLORS.background, borderRadius: 12, padding: 14, fontSize: 15, color: COLORS.textPrimary, borderWidth: 1, borderColor: COLORS.border },
  colorRow: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginTop: 4 },
  colorSwatch: { width: 40, height: 40, borderRadius: 20, borderWidth: 3, borderColor: "transparent" },
  colorSwatchSelected: { borderColor: COLORS.textPrimary },
  saveBtn: { backgroundColor: COLORS.primary, borderRadius: 14, padding: 16, alignItems: "center", marginTop: 24 },
  saveBtnText: { color: "#fff", fontFamily: FONTS.bold, fontSize: 16 },
});