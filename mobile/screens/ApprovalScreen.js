import React from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, Alert } from 'react-native';
import { ThumbsUp, ThumbsDown, Camera, AlertTriangle } from 'lucide-react-native';

export default function ApprovalScreen({ appointment, onApprove, onDecline }) {
  const recs = appointment?.recommendations || [];
  const pendingRecs = recs.filter(r => r.status === 'pending');

  if (pendingRecs.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No Pending Approvals</Text>
        <Text style={styles.emptySub}>All service items and recommended repairs have been processed.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.header}>
        <AlertTriangle size={32} color="#e11d48" />
        <Text style={styles.title}>Service Recommendations</Text>
        <Text style={styles.subtitle}>Our technicians recommend these services based on your vehicle's condition.</Text>
      </View>

      {pendingRecs.map((rec) => (
        <View key={rec.id} style={styles.recCard}>
          <View style={styles.recHeader}>
            <View style={styles.titleWrapper}>
              <Text style={styles.recTitle}>{rec.service}</Text>
              <View style={[
                styles.badge,
                rec.category === 'vas' ? styles.vasBadge : styles.repairBadge
              ]}>
                <Text style={[
                  styles.badgeText,
                  rec.category === 'vas' ? styles.vasBadgeText : styles.repairBadgeText
                ]}>
                  {rec.category === 'vas' ? 'Optional (VAS)' : 'Required Repair'}
                </Text>
              </View>
            </View>
            <Text style={styles.recCost}>${rec.cost}</Text>
          </View>

          {rec.proofUrl && (
            <View style={styles.imageContainer}>
              <Image source={{ uri: rec.proofUrl }} style={styles.proofImage} />
              <View style={styles.cameraOverlay}>
                <Camera size={14} color="#ffffff" />
                <Text style={styles.overlayText}>Verified Condition Photo</Text>
              </View>
            </View>
          )}

          <Text style={styles.recDetails}>{rec.details}</Text>

          <View style={styles.buttonRow}>
            <TouchableOpacity 
              style={[styles.btn, styles.approveBtn]}
              onPress={() => onApprove(rec.id)}
            >
              <ThumbsUp size={14} color="#ffffff" />
              <Text style={styles.btnText}>Approve</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.btn, styles.declineBtn]}
              onPress={() => onDecline(rec.id)}
            >
              <ThumbsDown size={14} color="#94a3b8" />
              <Text style={[styles.btnText, styles.declineBtnText]}>Decline</Text>
            </TouchableOpacity>
          </View>
        </View>
      ))}
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
    alignItems: 'center',
    marginBottom: 24,
    marginTop: 10,
  },
  title: {
    color: '#f8fafc',
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 10,
  },
  subtitle: {
    color: '#94a3b8',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 16,
  },
  recCard: {
    backgroundColor: '#131c2e',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#1e293b',
    padding: 16,
    marginBottom: 20,
  },
  recHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  titleWrapper: {
    flex: 1,
    paddingRight: 12,
  },
  recTitle: {
    color: '#f8fafc',
    fontSize: 15,
    fontWeight: 'bold',
  },
  recCost: {
    color: '#e11d48',
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: 'SpaceMono_400Regular',
  },
  badge: {
    alignSelf: 'flex-start',
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginTop: 6,
  },
  repairBadge: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
  },
  vasBadge: {
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
  },
  badgeText: {
    fontSize: 9,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  repairBadgeText: {
    color: '#ef4444',
  },
  vasBadgeText: {
    color: '#f59e0b',
  },
  imageContainer: {
    height: 150,
    borderRadius: 10,
    overflow: 'hidden',
    marginBottom: 12,
    position: 'relative',
  },
  proofImage: {
    width: '100%',
    height: '100%',
  },
  cameraOverlay: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    backgroundColor: 'rgba(11, 15, 25, 0.7)',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  overlayText: {
    color: '#ffffff',
    fontSize: 9,
    fontWeight: 'bold',
  },
  recDetails: {
    color: '#94a3b8',
    fontSize: 12.5,
    lineHeight: 18,
    marginBottom: 16,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  btn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
  },
  approveBtn: {
    backgroundColor: '#10b981',
  },
  declineBtn: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  btnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: 'bold',
  },
  declineBtnText: {
    color: '#94a3b8',
  },
  emptyContainer: {
    flex: 1,
    backgroundColor: '#0b0f19',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
  },
  emptyText: {
    color: '#f8fafc',
    fontSize: 16,
    fontWeight: 'bold',
  },
  emptySub: {
    color: '#94a3b8',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 4,
  }
});
