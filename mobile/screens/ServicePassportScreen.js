import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView, TouchableOpacity } from 'react-native';
import { ShieldCheck, Calendar, Wrench, CheckCircle2, ChevronRight, Award } from 'lucide-react-native';

export default function ServicePassportScreen() {
  const [vin, setVin] = useState('5YJ3E1EBXLF8902A');
  const [showHistory, setShowHistory] = useState(true);

  // Static history records simulating tamper-resistant records
  const pastServices = [
    {
      date: "Oct 12, 2025",
      odometer: "18,421 miles",
      type: "Annual Scheduled Maintenance",
      dealer: "Tesla Noida Service Hub",
      items: ["Cabin Air Filter Replaced", "Tire Rotation & Balance", "Brake Caliper Lubrication"],
      status: "Verified Passport Stamp",
      certId: "SP-990219A"
    },
    {
      date: "Apr 04, 2025",
      odometer: "9,850 miles",
      type: "First Safety Check & Oil Service",
      dealer: "Verified Independent Workshop",
      items: ["Engine Oil & Filter Changed", "Multi-point inspection check"],
      status: "Verified Passport Stamp",
      certId: "SP-882019F"
    }
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.header}>
        <Award size={36} color="#e11d48" />
        <Text style={styles.title}>Service Passport</Text>
        <Text style={styles.subtitle}>Verified digital passport linking historical service events directly to your vehicle's VIN.</Text>
      </View>

      {/* VIN Lookup Bar */}
      <View style={styles.searchCard}>
        <Text style={styles.searchTitle}>Active Passport VIN</Text>
        <View style={styles.searchRow}>
          <TextInput 
            value={vin} 
            onChangeText={setVin}
            style={styles.input}
            placeholder="Enter 17-digit VIN"
            placeholderTextColor="#64748b"
          />
          <TouchableOpacity 
            style={styles.searchBtn}
            onPress={() => setShowHistory(true)}
          >
            <Text style={styles.searchBtnText}>Load</Text>
          </TouchableOpacity>
        </View>
      </View>

      {showHistory && (
        <View style={styles.historySection}>
          <Text style={styles.sectionHeader}>Service History Passport Records ({pastServices.length})</Text>
          
          {pastServices.map((service, i) => (
            <View key={i} style={styles.historyCard}>
              <View style={styles.historyHeader}>
                <View className="flex-row items-center">
                  <Calendar size={13} color="#e11d48" />
                  <Text style={styles.historyDate}> {service.date}</Text>
                </View>
                <Text style={styles.historyOdo}>{service.odometer}</Text>
              </View>

              <Text style={styles.serviceType}>{service.type}</Text>
              <Text style={styles.dealerName}>{service.dealer}</Text>

              <View style={styles.itemsList}>
                {service.items.map((item, idx) => (
                  <View key={idx} style={styles.itemRow}>
                    <CheckCircle2 size={12} color="#10b981" />
                    <Text style={styles.itemText}>{item}</Text>
                  </View>
                ))}
              </View>

              <View style={styles.footer}>
                <Text style={styles.certText}>Stamp ID: {service.certId}</Text>
                <View style={styles.verifiedBadge}>
                  <ShieldCheck size={10} color="#10b981" />
                  <Text style={styles.verifiedText}>Verified</Text>
                </View>
              </View>
            </View>
          ))}
        </View>
      )}
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
  searchCard: {
    backgroundColor: '#131c2e',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1e293b',
    padding: 16,
    marginBottom: 24,
  },
  searchTitle: {
    color: '#f8fafc',
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  searchRow: {
    flexDirection: 'row',
    gap: 10,
  },
  input: {
    flex: 1,
    backgroundColor: '#0b0f19',
    borderColor: '#1e293b',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    color: '#f8fafc',
    fontSize: 13,
    height: 40,
    fontFamily: 'SpaceMono_400Regular',
  },
  searchBtn: {
    backgroundColor: '#e11d48',
    borderRadius: 8,
    paddingHorizontal: 16,
    justifyContent: 'center',
    alignItems: 'center',
    height: 40,
  },
  searchBtnText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  historySection: {
    marginTop: 10,
  },
  sectionHeader: {
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 12,
    textTransform: 'uppercase',
  },
  historyCard: {
    backgroundColor: '#131c2e',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#1e293b',
    padding: 16,
    marginBottom: 16,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b',
    paddingBottom: 8,
    marginBottom: 10,
  },
  historyDate: {
    color: '#f8fafc',
    fontSize: 11,
    fontWeight: 'bold',
  },
  historyOdo: {
    color: '#64748b',
    fontSize: 11,
  },
  serviceType: {
    color: '#f8fafc',
    fontSize: 13,
    fontWeight: 'bold',
  },
  dealerName: {
    color: '#94a3b8',
    fontSize: 11,
    marginTop: 2,
    marginBottom: 12,
  },
  itemsList: {
    marginBottom: 14,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  itemText: {
    color: '#94a3b8',
    fontSize: 11.5,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#1e293b',
    paddingTop: 10,
  },
  certText: {
    color: '#64748b',
    fontSize: 9,
    fontFamily: 'SpaceMono_400Regular',
  },
  verifiedBadge: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  verifiedText: {
    color: '#10b981',
    fontSize: 9,
    fontWeight: 'bold',
  }
});
