import React from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity } from 'react-native';
import { ShieldCheck, FileCheck, CheckCircle2, QrCode } from 'lucide-react-native';

export default function ProofPackScreen({ appointment }) {
  // Static verified proofs in line with database structure
  const executionProofs = [
    {
      title: "Engine Oil Replaced",
      timestamp: "10:14 AM",
      checklist: [
        { label: "Drain old oil", status: "completed" },
        { label: "Replace gasket & plug", status: "completed" },
        { label: "Fill 5.5L Shell Helix 5W-30", status: "completed" }
      ],
      media: {
        type: "video",
        thumbnail: "https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&w=400&q=80",
        label: "Oil drain stream"
      },
      barcode: "SKU-992019-HELIX"
    },
    {
      title: "Cabin Air Filter Replaced",
      timestamp: "10:28 AM",
      checklist: [
        { label: "Extract old clogged filter", status: "completed" },
        { label: "Clean intake compartment", status: "completed" },
        { label: "Install OEM replacement filter", status: "completed" }
      ],
      media: {
        type: "image",
        before: "https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?auto=format&fit=crop&w=200&q=80",
        after: "https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?auto=format&fit=crop&w=200&q=80",
        label: "Clogged vs Fresh filter comparison"
      },
      barcode: "PART-88902A"
    }
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.header}>
        <ShieldCheck size={36} color="#e11d48" />
        <Text style={styles.title}>Verified Service Passport</Text>
        <Text style={styles.subtitle}>Below is the tamper-resistant execution history for your Tesla service.</Text>
      </View>

      <View style={styles.signaturesCard}>
        <Text style={styles.cardHeader}>Dealership Signatures</Text>
        <View style={styles.sigRow}>
          <View>
            <Text style={styles.sigLabel}>Technician Signature</Text>
            <Text style={styles.sigValue}>{appointment?.techSignature || 'Tech #402'}</Text>
          </View>
          <View>
            <Text style={styles.sigLabel}>QC Inspector Signature</Text>
            <Text style={styles.sigValue}>{appointment?.qcSignature || 'Signed Off'}</Text>
          </View>
        </View>
      </View>

      {executionProofs.map((proof, i) => (
        <View key={i} style={styles.proofCard}>
          <View style={styles.proofHeader}>
            <Text style={styles.proofTitle}>{proof.title}</Text>
            <Text style={styles.proofTime}>{proof.timestamp}</Text>
          </View>
          
          <View style={styles.badgeRow}>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>Verified execution</Text>
            </View>
            <View style={[styles.badge, styles.barcodeBadge]}>
              <QrCode size={10} color="#e11d48" />
              <Text style={styles.barcodeText}>{proof.barcode}</Text>
            </View>
          </View>

          <View style={styles.checklist}>
            {proof.checklist.map((item, idx) => (
              <View key={idx} style={styles.checkItem}>
                <CheckCircle2 size={14} color="#10b981" />
                <Text style={styles.checkText}>{item.label}</Text>
              </View>
            ))}
          </View>

          {/* Media render */}
          {proof.media.type === 'video' ? (
            <View style={styles.mediaContainer}>
              <Image source={{ uri: proof.media.thumbnail }} style={styles.mediaImage} />
              <View style={styles.videoOverlay}>
                <Text style={styles.playText}>▶ Play Proof Video</Text>
              </View>
            </View>
          ) : (
            <View style={styles.grid}>
              <View style={styles.gridHalf}>
                <Text style={styles.gridLabel}>Before</Text>
                <Image source={{ uri: proof.media.before }} style={styles.gridImage} />
              </View>
              <View style={styles.gridHalf}>
                <Text style={styles.gridLabel}>After</Text>
                <Image source={{ uri: proof.media.after }} style={styles.gridImage} />
              </View>
            </View>
          )}
          <Text style={styles.mediaCaption}>{proof.media.label}</Text>
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
  signaturesCard: {
    backgroundColor: '#131c2e',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1e293b',
    padding: 16,
    marginBottom: 20,
  },
  cardHeader: {
    color: '#f8fafc',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  sigRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  sigLabel: {
    color: '#94a3b8',
    fontSize: 10,
  },
  sigValue: {
    color: '#e11d48',
    fontSize: 13,
    fontWeight: 'bold',
    marginTop: 2,
    fontFamily: 'SpaceMono_400Regular',
  },
  proofCard: {
    backgroundColor: '#131c2e',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#1e293b',
    padding: 16,
    marginBottom: 20,
  },
  proofHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  proofTitle: {
    color: '#f8fafc',
    fontSize: 14,
    fontWeight: 'bold',
  },
  proofTime: {
    color: '#64748b',
    fontSize: 11,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 6,
    marginBottom: 14,
  },
  badge: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  badgeText: {
    color: '#10b981',
    fontSize: 9,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  barcodeBadge: {
    backgroundColor: 'rgba(225, 29, 72, 0.1)',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  barcodeText: {
    color: '#e11d48',
    fontSize: 9,
    fontWeight: 'bold',
    fontFamily: 'SpaceMono_400Regular',
  },
  checklist: {
    marginBottom: 14,
  },
  checkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  checkText: {
    color: '#94a3b8',
    fontSize: 12,
  },
  mediaContainer: {
    borderRadius: 8,
    overflow: 'hidden',
    height: 140,
    backgroundColor: '#0b0f19',
    position: 'relative',
  },
  mediaImage: {
    width: '100%',
    height: '100%',
    opacity: 0.6,
  },
  videoOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playText: {
    color: '#ffffff',
    backgroundColor: '#e11d48',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    fontSize: 11,
    fontWeight: 'bold',
  },
  grid: {
    flexDirection: 'row',
    gap: 12,
  },
  gridHalf: {
    flex: 1,
  },
  gridLabel: {
    color: '#64748b',
    fontSize: 10,
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  gridImage: {
    width: '100%',
    height: 90,
    borderRadius: 6,
  },
  mediaCaption: {
    color: '#64748b',
    fontSize: 10,
    textAlign: 'center',
    marginTop: 8,
    fontStyle: 'italic',
  }
});
