import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Clock, CheckCircle2, ShieldAlert, AlertCircle } from 'lucide-react-native';

export default function TrackerScreen({ appointment, onNavigate }) {
  if (!appointment) {
    return (
      <View style={styles.emptyContainer}>
        <AlertCircle size={48} color="#ef4444" />
        <Text style={styles.emptyTitle}>No Active Vehicle Tracking</Text>
        <Text style={styles.emptySubtitle}>There are currently no active repair orders registered for your account.</Text>
      </View>
    );
  }

  const steps = [
    { label: 'Received', key: 'scheduled' },
    { label: 'Checked In', key: 'checked_in' },
    { label: 'Inspecting', key: 'inspecting' },
    { label: 'Repairs Active', key: 'in_progress' },
    { label: 'QC Sign-off', key: 'qc_check' },
    { label: 'Ready', key: 'ready' }
  ];

  const getCurrentStepIndex = () => {
    if (appointment.status === 'scheduled') return 0;
    if (appointment.status === 'checked_in') return 1;
    if (appointment.status === 'inspecting') return 2;
    if (appointment.status === 'in_progress') return 3;
    if (appointment.status === 'ready') return 5;
    return 4; // qc_check
  };

  const currentStepIdx = getCurrentStepIndex();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.header}>
        <Text style={styles.vinLabel}>VIN: 5YJ3E1EBXLF8902A</Text>
        <Text style={styles.modelText}>{appointment.vehicle}</Text>
        <Text style={styles.serviceText}>{appointment.service}</Text>
      </View>

      {/* Timeline Card */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Live Service Tracking</Text>
        
        <View style={styles.timeline}>
          {steps.map((step, idx) => {
            const isCompleted = idx < currentStepIdx;
            const isActive = idx === currentStepIdx;
            
            return (
              <View key={step.key} style={styles.timelineItem}>
                <View style={styles.indicatorContainer}>
                  <View style={[
                    styles.circle,
                    isCompleted && styles.completedCircle,
                    isActive && styles.activeCircle
                  ]}>
                    {isCompleted ? (
                      <CheckCircle2 size={16} color="#ffffff" />
                    ) : (
                      <Clock size={16} color={isActive ? '#e11d48' : '#94a3b8'} />
                    )}
                  </View>
                  {idx < steps.length - 1 && (
                    <View style={[
                      styles.line,
                      idx < currentStepIdx && styles.completedLine
                    ]} />
                  )}
                </View>
                <View style={styles.timelineTextContainer}>
                  <Text style={[
                    styles.stepLabel,
                    isActive && styles.activeStepLabel
                  ]}>
                    {step.label}
                  </Text>
                  {isActive && (
                    <Text style={styles.activeTag}>Current Stage</Text>
                  )}
                </View>
              </View>
            );
          })}
        </View>
      </View>

      {/* Summary Card */}
      <View style={styles.card}>
        <View style={styles.row}>
          <Text style={styles.summaryLabel}>Estimate Value:</Text>
          <Text style={styles.summaryValue}>${appointment.estimatedCost}</Text>
        </View>
        
        {appointment.recommendations && appointment.recommendations.filter(r => r.status === 'pending').length > 0 && (
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => onNavigate('Approvals')}
          >
            <ShieldAlert size={16} color="#ffffff" />
            <Text style={styles.actionButtonText}>Review Required Approvals</Text>
          </TouchableOpacity>
        )}

        {appointment.status === 'ready' && (
          <TouchableOpacity 
            style={[styles.actionButton, styles.successButton]}
            onPress={() => onNavigate('Proof')}
          >
            <CheckCircle2 size={16} color="#ffffff" />
            <Text style={styles.actionButtonText}>View Execution Proof Pack</Text>
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0b0f19',
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 24,
  },
  vinLabel: {
    color: '#e11d48',
    fontFamily: 'SpaceMono_400Regular',
    fontSize: 12,
    textTransform: 'uppercase',
  },
  modelText: {
    color: '#f8fafc',
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 4,
  },
  serviceText: {
    color: '#94a3b8',
    fontSize: 14,
    marginTop: 2,
  },
  card: {
    backgroundColor: '#131c2e',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  cardTitle: {
    color: '#f8fafc',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  timeline: {
    paddingLeft: 8,
  },
  timelineItem: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  indicatorContainer: {
    alignItems: 'center',
    marginRight: 16,
    width: 24,
  },
  circle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#1e293b',
    backgroundColor: '#0b0f19',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  completedCircle: {
    borderColor: '#e11d48',
    backgroundColor: '#e11d48',
  },
  activeCircle: {
    borderColor: '#e11d48',
  },
  line: {
    width: 2,
    flex: 1,
    backgroundColor: '#1e293b',
    position: 'absolute',
    top: 32,
    bottom: -16,
    left: 15,
    zIndex: 1,
  },
  completedLine: {
    backgroundColor: '#e11d48',
  },
  timelineTextContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingTop: 6,
  },
  stepLabel: {
    color: '#94a3b8',
    fontSize: 14,
    fontWeight: '600',
  },
  activeStepLabel: {
    color: '#e11d48',
    fontWeight: 'bold',
  },
  activeTag: {
    color: '#e11d48',
    fontSize: 10,
    marginTop: 2,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  summaryLabel: {
    color: '#94a3b8',
    fontSize: 14,
  },
  summaryValue: {
    color: '#f8fafc',
    fontSize: 20,
    fontWeight: 'bold',
  },
  actionButton: {
    backgroundColor: '#e11d48',
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 8,
  },
  actionButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  successButton: {
    backgroundColor: '#10b981',
  },
  emptyContainer: {
    flex: 1,
    backgroundColor: '#0b0f19',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
  },
  emptyTitle: {
    color: '#f8fafc',
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    color: '#94a3b8',
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
  }
});
