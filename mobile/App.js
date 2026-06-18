import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, View, SafeAreaView, Platform, TouchableOpacity, StatusBar, TextInput } from 'react-native';
import { Calendar, ShieldAlert, Award, FileCheck, CheckCircle2, Settings } from 'lucide-react-native';

import TrackerScreen from './screens/TrackerScreen';
import ApprovalScreen from './screens/ApprovalScreen';
import ProofPackScreen from './screens/ProofPackScreen';
import ServicePassportScreen from './screens/ServicePassportScreen';

export default function App() {
  const [activeTab, setActiveTab] = useState('Tracker'); // 'Tracker' | 'Approvals' | 'Proof' | 'Passport'
  const [appointments, setAppointments] = useState([]);
  const [messages, setMessages] = useState([]);
  const [online, setOnline] = useState(false);
  const [serverUrl, setServerUrl] = useState('http://localhost:3001/api/data');
  const [showSettings, setShowSettings] = useState(false);

  const serverUrlRef = useRef(serverUrl);
  useEffect(() => {
    serverUrlRef.current = serverUrl;
  }, [serverUrl]);

  // Sync state from Shared database server
  const fetchState = async () => {
    try {
      const response = await fetch(serverUrlRef.current);
      if (response.ok) {
        const data = await response.json();
        setAppointments(data.appointments || []);
        setMessages(data.messages || []);
        setOnline(true);
      }
    } catch (err) {
      // Offline mode
      setOnline(false);
    }
  };

  const pushState = async (newApps) => {
    try {
      await fetch(serverUrlRef.current, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ appointments: newApps, messages: messages })
      });
      setOnline(true);
    } catch (err) {
      setOnline(false);
    }
  };

  useEffect(() => {
    fetchState();
    const interval = setInterval(fetchState, 2000);
    return () => clearInterval(interval);
  }, []);

  const activeRo = appointments.find(a => a.customerName === 'Sarah Jenkins' || a.customerName === 'John Doe');

  const handleApprove = (recId) => {
    const newApps = appointments.map(app => {
      const recIndex = app.recommendations?.findIndex(r => r.id === recId);
      if (recIndex !== undefined && recIndex !== -1) {
        const updatedRecs = [...app.recommendations];
        updatedRecs[recIndex] = { ...updatedRecs[recIndex], status: 'approved' };
        
        // If all approved/declined, transition status
        const pendingCount = updatedRecs.filter(r => r.status === 'pending').length;
        const newStatus = pendingCount === 0 ? 'in_progress' : app.status;

        return {
          ...app,
          recommendations: updatedRecs,
          status: newStatus
        };
      }
      return app;
    });
    setAppointments(newApps);
    pushState(newApps);
  };

  const handleDecline = (recId) => {
    const newApps = appointments.map(app => {
      const recIndex = app.recommendations?.findIndex(r => r.id === recId);
      if (recIndex !== undefined && recIndex !== -1) {
        const updatedRecs = [...app.recommendations];
        updatedRecs[recIndex] = { ...updatedRecs[recIndex], status: 'declined' };

        // Recalculate cost
        const baseCost = app.service.includes('Advanced') ? 240 : app.service.includes('Braking') ? 450 : 120;
        const approvedCost = updatedRecs
          .filter(r => r.status === 'approved')
          .reduce((acc, r) => acc + r.cost, 0);

        const pendingCount = updatedRecs.filter(r => r.status === 'pending').length;
        const newStatus = pendingCount === 0 ? 'in_progress' : app.status;

        return {
          ...app,
          recommendations: updatedRecs,
          estimatedCost: baseCost + approvedCost,
          status: newStatus
        };
      }
      return app;
    });
    setAppointments(newApps);
    pushState(newApps);
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
          <TouchableOpacity onPress={() => setShowSettings(!showSettings)} style={{ padding: 4, marginLeft: 4 }}>
            <Settings size={16} color={showSettings ? '#e11d48' : '#94a3b8'} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Settings Panel */}
      {showSettings && (
        <View style={styles.settingsPanel}>
          <Text style={styles.settingsLabel}>API Server URL:</Text>
          <TextInput
            style={styles.settingsInput}
            value={serverUrl}
            onChangeText={setServerUrl}
            placeholder="http://localhost:3001/api/data"
            placeholderTextColor="#475569"
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>
      )}

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
  },
  settingsPanel: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#0d1322',
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b',
  },
  settingsLabel: {
    color: '#94a3b8',
    fontSize: 11,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  settingsInput: {
    height: 36,
    backgroundColor: '#1e293b',
    borderColor: '#334155',
    borderWidth: 1,
    borderRadius: 6,
    color: '#ffffff',
    paddingHorizontal: 10,
    fontSize: 12,
  }
});
