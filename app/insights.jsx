import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../constants/colors';

export default function InsightsScreen() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.pageTitle}>Your patterns</Text>
        <Text style={styles.pageSubtitle}>Based on 6 weeks of behavior</Text>
      </View>

      {/* Pattern Card 1 — Struggling */}
      <View style={styles.patternCard}>
        <View style={styles.patternRow}>
          <Text style={styles.patternName}>CS 101 (Tues)</Text>
          <View style={styles.trackContainer}>
            <View style={[styles.trackFill, { width: '38%', backgroundColor: Colors.danger }]} />
          </View>
          <Text style={[styles.patternPct, { color: Colors.danger }]}>38%</Text>
        </View>
        <View style={styles.insightRow}>
          <Ionicons name="alert-circle-outline" size={14} color={Colors.danger} />
          <Text style={styles.insightText}>
            Missed 3 of 8 Tuesdays. Reminders escalated: now 3 alerts at 60 min, 30 min, and 10 min before.
          </Text>
        </View>
      </View>

      {/* Pattern Card 2 — Doing well */}
      <View style={styles.patternCard}>
        <View style={styles.patternRow}>
          <Text style={styles.patternName}>Math 201 (Mon/Wed)</Text>
          <View style={styles.trackContainer}>
            <View style={[styles.trackFill, { width: '92%', backgroundColor: Colors.success }]} />
          </View>
          <Text style={[styles.patternPct, { color: Colors.success }]}>92%</Text>
        </View>
        <View style={styles.insightRow}>
          <Ionicons name="checkmark-circle-outline" size={14} color={Colors.success} />
          <Text style={styles.insightText}>
            Strong attendance. Single reminder 15 min before is enough.
          </Text>
        </View>
      </View>

      {/* Pattern Card 3 — Behavior pattern */}
      <View style={styles.patternCard}>
        <View style={styles.patternRow}>
          <Text style={styles.patternName}>Task completion (eve)</Text>
          <View style={styles.trackContainer}>
            <View style={[styles.trackFill, { width: '71%', backgroundColor: Colors.primary }]} />
          </View>
          <Text style={[styles.patternPct, { color: Colors.primary }]}>71%</Text>
        </View>
        <View style={styles.insightRow}>
          <Ionicons name="sparkles-outline" size={14} color={Colors.primary} />
          <Text style={styles.insightText}>
            You complete 2× more tasks between 8–10 PM. Suggestions now prioritize that window.
          </Text>
        </View>
      </View>

      {/* AI Recommendation */}
      <View style={styles.aiCard}>
        <View style={styles.aiLabel}>
          <Ionicons name="bulb-outline" size={16} color={Colors.primary} />
          <Text style={styles.aiLabelText}>AI recommendation</Text>
        </View>
        <Text style={styles.aiText}>
          Set a Sunday night 5-min prep ritual for Tuesday classes — reviewing your notes reduces missed attendance by ~40% based on your pattern data.
        </Text>
      </View>

      {/* Weekly Summary */}
      <View style={styles.summaryCard}>
        <Text style={styles.summaryTitle}>This week</Text>
        <View style={styles.summaryRow}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryNumber}>8</Text>
            <Text style={styles.summaryLabel}>Tasks completed</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryItem}>
            <Text style={styles.summaryNumber}>5h 20m</Text>
            <Text style={styles.summaryLabel}>Focus time</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryItem}>
            <Text style={styles.summaryNumber}>83%</Text>
            <Text style={styles.summaryLabel}>Attendance</Text>
          </View>
        </View>
      </View>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    padding: 20,
    paddingTop: 60,
  },
  header: {
    marginBottom: 20,
  },
  pageTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  pageSubtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  patternCard: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 0.5,
    borderColor: Colors.border,
  },
  patternRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  patternName: {
    fontSize: 13,
    fontWeight: '500',
    color: Colors.textPrimary,
    width: 110,
  },
  trackContainer: {
    flex: 1,
    height: 6,
    backgroundColor: Colors.border,
    borderRadius: 3,
    overflow: 'hidden',
  },
  trackFill: {
    height: 6,
    borderRadius: 3,
  },
  patternPct: {
    fontSize: 13,
    fontWeight: '500',
    width: 36,
    textAlign: 'right',
  },
  insightRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
  },
  insightText: {
    fontSize: 12,
    color: Colors.textSecondary,
    flex: 1,
    lineHeight: 18,
  },
  aiCard: {
    backgroundColor: Colors.primaryLight,
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
    borderWidth: 0.5,
    borderColor: '#AFA9EC',
  },
  aiLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  aiLabelText: {
    fontSize: 13,
    fontWeight: '500',
    color: Colors.primary,
  },
  aiText: {
    fontSize: 13,
    color: Colors.primaryDark,
    lineHeight: 20,
  },
  summaryCard: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    borderWidth: 0.5,
    borderColor: Colors.border,
  },
  summaryTitle: {
    fontSize: 13,
    fontWeight: '500',
    color: Colors.textSecondary,
    marginBottom: 14,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryNumber: {
    fontSize: 20,
    fontWeight: '500',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  summaryLabel: {
    fontSize: 11,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  summaryDivider: {
    width: 0.5,
    height: 40,
    backgroundColor: Colors.border,
  },
});