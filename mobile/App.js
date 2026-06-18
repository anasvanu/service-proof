import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, SafeAreaView, Platform, TouchableOpacity, StatusBar } from 'react-native';
import { Calendar, ShieldAlert, Award, FileCheck } from 'lucide-react-native';
import { collection, onSnapshot, doc, setDoc } from 'firebase/firestore';
import { db } from './firebase';

import TrackerScreen from './screens/TrackerScreen';
import ApprovalScreen from './screens/ApprovalScreen';
import ProofPackScreen from './screens/ProofPackScreen';
import ServicePassportScreen from './screens/ServicePassportScreen';

export default function App() {
  const [activeTab, setActiveTab] = useState('Tracker'); // 'Tracker' | 'Approvals' | 'Proof' | 'Passport'
  const [appointments, setAppointments] = useState([]);
  const [messages, setMessages] = useState([]);
  const [online, setOnline] = useState(false);

  // Sync state from Firebase Firestore
  useEffect(() => {
    // Listen for appointments
    const unsubscribeAppointments = onSnapshot(collection(db, "appointments"), (snapshot) => {
      const apps = [];
      snapshot.forEach((doc) => {
        apps.push(doc.data());
      });
      setAppointments(apps);
      setOnline(true);
    }, (err) => {
      console.error("Mobile appointments listener error:", err);
      setOnline(false);
    });

    // Listen for messages
    const unsubscribeMessages = onSnapshot(collection(db, "messages"), (snapshot) => {
      const msgs = [];
      snapshot.forEach((doc) => {
        msgs.push(doc.data());
      });
      msgs.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
      setMessages(msgs);
    }, (err) => {
      console.error("Mobile messages listener error:", err);
    });

    return () => {
      unsubscribeAppointments();
      unsubscribeMessages();
    };
  }, []);

  const activeRo = (() => {
    const customerApps = appointments.filter(a => a.customerName === 'Sarah Jenkins' || a.customerName === 'John Doe');
    const active = customerApps.find(a => a.status !== 'ready');
    return active || customerApps[0];
  })();

  const handleApprove = async (recId) => {
    try {
      const targetApp = appointments.find(app => app.recommendations?.some(r => r.id === recId));
      if (!targetApp) return;

      const updatedRecs = targetApp.recommendations.map(r => {
        if (r.id === recId) {
          return { ...r, status: 'approved' };
        }
        return r;
      });

      const pendingCount = updatedRecs.filter(r => r.status === 'pending').length;
      const newStatus = pendingCount === 0 ? 'in_progress' : targetApp.status;

      await setDoc(doc(db, "appointments", targetApp.id), {
        recommendations: updatedRecs,
        status: newStatus
      }, { merge: true });
    } catch (err) {
      console.error("Mobile handleApprove error:", err);
    }
  };

  const handleDecline = async (recId) => {
    try {
      const targetApp = appointments.find(app => app.recommendations?.some(r => r.id === recId));
      if (!targetApp) return;

      const updatedRecs = targetApp.recommendations.map(r => {
        if (r.id === recId) {
          return { ...r, status: 'declined' };
        }
        return r;
      });

      const baseCost = targetApp.service.includes('Advanced') ? 7500 : targetApp.service.includes('Braking') ? 12500 : 3500;
      const approvedCost = updatedRecs
        .filter(r => r.status === 'approved')
        .reduce((acc, r) => acc + r.cost, 0);

      const pendingCount = updatedRecs.filter(r => r.status === 'pending').length;
      const newStatus = pendingCount === 0 ? 'in_progress' : targetApp.status;

      await setDoc(doc(db, "appointments", targetApp.id), {
        recommendations: updatedRecs,
        estimatedCost: baseCost + approvedCost,
        status: newStatus
      }, { merge: true });
    } catch (err) {
      console.error("Mobile handleDecline error:", err);
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'Approvals':
        return <ApprovalScreen appointment={activeRo} onApprove={handleApprove} onDecline={handleDecline} />;
      case 'Proof':
        return <ProofPackScreen appointment={activeRo} />;
      case 'Passport':
        return <ServicePassportScreen />;
      case 'Tracker':
      default:
        return <TrackerScreen appointment={activeRo} onNavigate={setActiveTab} />;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.brandTitle}>Service Proof</Text>
        <View style={styles.statusRow}>
          <View style={[styles.dot, online ? styles.onlineDot : styles.offlineDot]} />
          <Text style={styles.statusText}>{online ? 'Online Sync' : 'Offline'}</Text>
        </View>
      </View>

      {/* Main Panel Content */}
      <View style={styles.main}>
        {renderContent()}
      </View>

      {/* Tab bar Navigation */}
      <View style={styles.tabBar}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'Tracker' && styles.activeTab]}
          onPress={() => setActiveTab('Tracker')}
        >
          <Calendar size={18} color={activeTab === 'Tracker' ? '#e11d48' : '#94a3b8'} />
          <Text style={[styles.tabLabel, activeTab === 'Tracker' && styles.activeTabLabel]}>Track</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.tab, activeTab === 'Approvals' && styles.activeTab]}
          onPress={() => setActiveTab('Approvals')}
        >
          <ShieldAlert size={18} color={activeTab === 'Approvals' ? '#e11d48' : '#94a3b8'} />
          <Text style={[styles.tabLabel, activeTab === 'Approvals' && styles.activeTabLabel]}>Approvals</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.tab, activeTab === 'Proof' && styles.activeTab]}
          onPress={() => setActiveTab('Proof')}
        >
          <FileCheck size={18} color={activeTab === 'Proof' ? '#e11d48' : '#94a3b8'} />
          <Text style={[styles.tabLabel, activeTab === 'Proof' && styles.activeTabLabel]}>Proof</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.tab, activeTab === 'Passport' && styles.activeTab]}
          onPress={() => setActiveTab('Passport')}
        >
          <Award size={18} color={activeTab === 'Passport' ? '#e11d48' : '#94a3b8'} />
          <Text style={[styles.tabLabel, activeTab === 'Passport' && styles.activeTabLabel]}>Passport</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0b0f19',
  },
  header: {
    height: 50,
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    backgroundColor: '#0d1322',
  },
  brandTitle: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  onlineDot: {
    backgroundColor: '#10b981',
  },
  offlineDot: {
    backgroundColor: '#ef4444',
  },
  statusText: {
    color: '#94a3b8',
    fontSize: 10,
    fontWeight: '600',
  },
  main: {
    flex: 1,
  },
  tabBar: {
    height: 60,
    borderTopWidth: 1,
    borderTopColor: '#1e293b',
    backgroundColor: '#0d1322',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  tab: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    height: '100%',
  },
  activeTab: {
    borderTopWidth: 2,
    borderTopColor: '#e11d48',
  },
  tabLabel: {
    color: '#94a3b8',
    fontSize: 10,
    marginTop: 4,
    fontWeight: '600',
  },
  activeTabLabel: {
    color: '#e11d48',
  }
});
