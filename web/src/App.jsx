import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Wrench, 
  User, 
  ChevronLeft, 
  ChevronRight, 
  Sun, 
  Moon, 
  ShieldCheck, 
  BarChart3,
  AlertCircle
} from 'lucide-react';
import { 
  collection, 
  onSnapshot, 
  doc, 
  setDoc, 
  deleteDoc, 
  getDocs 
} from 'firebase/firestore';
import { db } from './firebase';
import CustomerPortal from './components/CustomerPortal';
import AdvisorDashboard from './components/AdvisorDashboard';
import TechnicianWorkbench from './components/TechnicianWorkbench';
import ManagerAnalytics from './components/ManagerAnalytics';

export default function App() {
  const [isDark, setIsDark] = useState(true);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [activeRole, setActiveRole] = useState('manager'); // 'customer' | 'advisor' | 'technician' | 'manager'
  
  const [appointments, setAppointments] = useState([]);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  // Helper to seed Firestore with default data if empty
  const seedFirestoreIfEmpty = async () => {
    try {
      console.log("Firestore is empty. Seeding default data...");
      const defaultApps = [
        {
          id: "ro-1",
          customerName: "John Doe",
          vehicle: "Maruti Suzuki Swift (2022)",
          service: "Standard Service Package",
          date: "2026-06-19",
          time: "11:30 AM",
          status: "scheduled",
          estimatedCost: 3500,
          inspection: null,
          recommendations: [],
          techSignature: "",
          qcSignature: ""
        },
        {
          id: "ro-2",
          customerName: "Sarah Jenkins",
          vehicle: "Mahindra XUV700 (2023)",
          service: "Advanced Safety Inspection",
          date: "2026-06-18",
          time: "09:00 AM",
          status: "inspecting",
          estimatedCost: 7500,
          techSignature: "Tech #402",
          qcSignature: "",
          inspection: {
            brakingSystem: { status: "yellow", comment: "Pads are at 4/32\". Recommend replacement soon.", type: "repair" },
            batteryHealth: { status: "green", comment: "Battery health test passes at 96% state-of-health.", type: "oem" },
            tireTread: { status: "red", comment: "Front right tire inner wall shows balding at 2/32\".", type: "repair" },
            engineFluids: { status: "green", comment: "All coolant/brake fluids clean and level.", type: "oem" }
          },
          recommendations: [
            {
              id: "rec-1",
              service: "Front Brake Pad Replacement",
              details: "Replace front disc brake pads to restore full stopping power before metal-on-metal wear.",
              cost: 8500,
              proofUrl: "https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&w=400&q=80",
              status: "pending",
              category: "repair",
              executionProof: ""
            },
            {
              id: "rec-2",
              service: "Front Right Tire Replacement",
              details: "Treads are critically low on the front right tire. Dangerous for wet conditions.",
              cost: 6500,
              proofUrl: "https://images.unsplash.com/photo-1191010313-0ea10c4f1cfa?auto=format&fit=crop&w=400&q=80",
              status: "pending",
              category: "repair",
              executionProof: ""
            },
            {
              id: "rec-3",
              service: "Premium AC Sanitization (VAS)",
              details: "Sanitize internal HVAC ducts to remove cabin odors and bacteria.",
              cost: 2500,
              proofUrl: "https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?auto=format&fit=crop&w=400&q=80",
              status: "pending",
              category: "vas",
              executionProof: ""
            }
          ]
        }
      ];

      const defaultMsgs = [
        { sender: "Advisor", recipient: "Sarah Jenkins", text: "Hi Sarah, your XUV700 is in the bay. Technician is performing the Multi-Point Inspection now.", timestamp: "2026-06-18T09:05:00.000Z" },
        { sender: "Sarah Jenkins", recipient: "Advisor", text: "Sounds good! Let me know what you find.", timestamp: "2026-06-18T09:07:00.000Z" }
      ];

      for (const app of defaultApps) {
        await setDoc(doc(db, "appointments", app.id), app);
      }
      for (const msg of defaultMsgs) {
        await setDoc(doc(collection(db, "messages")), msg);
      }
    } catch (err) {
      console.error("Error seeding Firestore:", err);
    }
  };

  // Real-time synchronization listeners
  useEffect(() => {
    // Listen for appointments
    const unsubscribeAppointments = onSnapshot(collection(db, "appointments"), (snapshot) => {
      if (snapshot.empty) {
        seedFirestoreIfEmpty();
      } else {
        const apps = [];
        snapshot.forEach((doc) => {
          apps.push(doc.data());
        });
        setAppointments(apps);
        setLoading(false);
      }
    }, (err) => {
      console.error("Appointments listener error:", err);
      setLoading(false);
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
      console.error("Messages listener error:", err);
    });

    return () => {
      unsubscribeAppointments();
      unsubscribeMessages();
    };
  }, []);

  // Sync dark class on body
  useEffect(() => {
    if (isDark) {
      document.body.classList.add('dark');
    } else {
      document.body.classList.remove('dark');
    }
  }, [isDark]);

  // Advisor Check In Action
  const handleCheckIn = async (id) => {
    try {
      const targetApp = appointments.find(a => a.id === id);
      if (!targetApp) return;

      await setDoc(doc(db, "appointments", id), {
        status: 'checked_in'
      }, { merge: true });
      
      await setDoc(doc(collection(db, "messages")), {
        sender: 'Advisor',
        recipient: targetApp.customerName,
        text: `Welcome! Your ${targetApp.vehicle} has been checked in for service. Our technicians will inspect it shortly.`,
        timestamp: new Date().toISOString()
      });
    } catch (err) {
      console.error("Firestore CheckIn error:", err);
    }
  };

  // Tech Start Inspection Action
  const handleStartInspection = async (id) => {
    try {
      await setDoc(doc(db, "appointments", id), {
        status: 'inspecting'
      }, { merge: true });
    } catch (err) {
      console.error("Firestore StartInspection error:", err);
    }
  };

  // Tech Submit Inspection Action
  const handleSubmitInspection = async (id, report, recommendations) => {
    try {
      const targetApp = appointments.find(a => a.id === id);
      if (!targetApp) return;

      const baseCost = targetApp.service.includes('Advanced') ? 7500 : targetApp.service.includes('Braking') ? 12500 : 3500;
      const recommendationsCost = recommendations.reduce((acc, r) => acc + r.cost, 0);

      await setDoc(doc(db, "appointments", id), {
        status: 'inspecting', // Awaiting customer review
        inspection: report,
        recommendations: recommendations,
        estimatedCost: baseCost + recommendationsCost,
        techSignature: "Tech #402"
      }, { merge: true });

      await setDoc(doc(collection(db, "messages")), {
        sender: 'Advisor',
        recipient: targetApp.customerName,
        text: `Hi ${targetApp.customerName}, our technician has completed your vehicle safety inspection. Please log into the portal to review findings & approvals.`,
        timestamp: new Date().toISOString()
      });
    } catch (err) {
      console.error("Firestore SubmitInspection error:", err);
    }
  };

  // Customer Approve Recommendation
  const handleApproveRecommendation = async (recId) => {
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
      console.error("Firestore ApproveRecommendation error:", err);
    }
  };

  // Customer Decline Recommendation
  const handleDeclineRecommendation = async (recId) => {
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
      const approvedRecsCost = updatedRecs
        .filter(r => r.status === 'approved')
        .reduce((acc, r) => acc + r.cost, 0);

      const pendingCount = updatedRecs.filter(r => r.status === 'pending').length;
      const newStatus = pendingCount === 0 ? 'in_progress' : targetApp.status;

      await setDoc(doc(db, "appointments", targetApp.id), {
        recommendations: updatedRecs,
        estimatedCost: baseCost + approvedRecsCost,
        status: newStatus
      }, { merge: true });
    } catch (err) {
      console.error("Firestore DeclineRecommendation error:", err);
    }
  };

  // Tech Complete Repairs
  const handleCompleteRepairs = async (id) => {
    try {
      const targetApp = appointments.find(a => a.id === id);
      if (!targetApp) return;

      await setDoc(doc(db, "appointments", id), {
        status: 'ready'
      }, { merge: true });

      await setDoc(doc(collection(db, "messages")), {
        sender: 'Advisor',
        recipient: targetApp.customerName,
        text: `Good news! All authorized repairs for your ${targetApp.vehicle} are completed. Your vehicle is ready for pickup.`,
        timestamp: new Date().toISOString()
      });
    } catch (err) {
      console.error("Firestore CompleteRepairs error:", err);
    }
  };

  // Chat message addition
  const handleSendMessage = async (msg) => {
    try {
      await setDoc(doc(collection(db, "messages")), {
        ...msg,
        timestamp: new Date().toISOString()
      });
    } catch (err) {
      console.error("Firestore SendMessage error:", err);
    }
  };

  // Customer Book Appointment
  const handleScheduleAppointment = async (newApp) => {
    try {
      const id = `ro-${Date.now()}`;
      const formattedApp = {
        id: id,
        customerName: 'John Doe',
        vehicle: newApp.vehicle,
        service: newApp.service,
        date: newApp.date,
        time: newApp.time,
        status: 'scheduled',
        estimatedCost: newApp.service.includes('Advanced') ? 7500 : newApp.service.includes('Braking') ? 12500 : 3500,
        inspection: null,
        recommendations: [],
        techSignature: '',
        qcSignature: ''
      };
      await setDoc(doc(db, "appointments", id), formattedApp);
    } catch (err) {
      console.error("Firestore ScheduleAppointment error:", err);
    }
  };

  // Clear simulated database
  const handleResetData = async () => {
    try {
      const appSnapshot = await getDocs(collection(db, "appointments"));
      const appPromises = appSnapshot.docs.map(doc => deleteDoc(doc.ref));
      await Promise.all(appPromises);

      const msgSnapshot = await getDocs(collection(db, "messages"));
      const msgPromises = msgSnapshot.docs.map(doc => deleteDoc(doc.ref));
      await Promise.all(msgPromises);

      console.log("Firestore reset complete.");
    } catch (err) {
      console.error("Firestore ResetData error:", err);
    }
  };

  const renderMainContent = () => {
    if (loading) {
      return (
        <div className="flex-center h-64 flex-col gap-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rose-500"></div>
          <span className="text-xs text-slate-500">Synchronizing database...</span>
        </div>
      );
    }

    switch (activeRole) {
      case 'customer':
        return (
          <CustomerPortal 
            appointment={appointments.find(a => a.customerName === 'Sarah Jenkins' || a.customerName === 'John Doe')} 
            onApproveRecommendation={handleApproveRecommendation}
            onDeclineRecommendation={handleDeclineRecommendation}
            onScheduleAppointment={handleScheduleAppointment}
          />
        );
      case 'advisor':
        return (
          <AdvisorDashboard 
            appointments={appointments} 
            onCheckIn={handleCheckIn}
            onSendMessage={handleSendMessage}
            messages={messages}
          />
        );
      case 'technician':
        return (
          <TechnicianWorkbench 
            appointments={appointments}
            onSubmitInspection={handleSubmitInspection}
            onCompleteRepairs={handleCompleteRepairs}
            onStartInspection={handleStartInspection}
          />
        );
      case 'manager':
      default:
        return (
          <ManagerAnalytics appointments={appointments} />
        );
    }
  };

  return (
    <div className="flex min-h-screen w-full bg-slate-50 dark:bg-[#0b0f19] text-slate-800 dark:text-slate-200 transition-colors duration-300">
      
      {/* Collapsible Sidebar */}
      <nav className={`shrink-0 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0d1322] p-4 flex flex-col justify-between transition-all duration-300 ease-in-out relative ${
        isCollapsed ? 'w-18' : 'w-64'
      }`}>
        <div className="space-y-6">
          {/* Logo and Brand Title */}
          <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800/80 pb-4">
            <div className="h-10 w-10 bg-gradient-to-br from-rose-500 to-rose-600 rounded-xl flex-center text-white font-extrabold shadow-md shrink-0">
              <ShieldCheck className="h-5 w-5" />
            </div>
            {!isCollapsed && (
              <div>
                <span className="font-heading text-xs tracking-wider block font-bold text-rose-500">Service</span>
                <span className="font-heading text-xs tracking-wider block font-bold text-slate-800 dark:text-white">Proof</span>
              </div>
            )}
          </div>

          {/* Navigation Links */}
          <div className="space-y-1">
            <button 
              onClick={() => setActiveRole('manager')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left text-xs font-semibold transition-all ${
                activeRole === 'manager' 
                  ? 'bg-rose-500 text-white shadow-sm' 
                  : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50'
              }`}
            >
              <BarChart3 className="h-4.5 w-4.5" />
              {!isCollapsed && <span>Dashboard Overview</span>}
            </button>
            
            <button 
              onClick={() => setActiveRole('advisor')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left text-xs font-semibold transition-all ${
                activeRole === 'advisor' 
                  ? 'bg-rose-500 text-white shadow-sm' 
                  : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50'
              }`}
            >
              <Users className="h-4.5 w-4.5" />
              {!isCollapsed && <span>Advisor Desk</span>}
            </button>

            <button 
              onClick={() => setActiveRole('technician')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left text-xs font-semibold transition-all ${
                activeRole === 'technician' 
                  ? 'bg-rose-500 text-white shadow-sm' 
                  : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50'
              }`}
            >
              <Wrench className="h-4.5 w-4.5" />
              {!isCollapsed && <span>Technician Workbench</span>}
            </button>

            <button 
              onClick={() => setActiveRole('customer')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left text-xs font-semibold transition-all ${
                activeRole === 'customer' 
                  ? 'bg-rose-500 text-white shadow-sm' 
                  : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50'
              }`}
            >
              <User className="h-4.5 w-4.5" />
              {!isCollapsed && <span>Customer Portal</span>}
            </button>
          </div>
        </div>

        {/* Footer Sidebar actions */}
        <div className="space-y-4">
          {!isCollapsed && (
            <div className="p-3 bg-slate-50 dark:bg-slate-800/20 rounded-xl border border-slate-100 dark:border-slate-800 text-xs space-y-1">
              <span className="block font-bold text-slate-500 dark:text-slate-400">Sandbox Database</span>
              <button 
                onClick={handleResetData}
                className="text-rose-500 hover:underline font-semibold"
              >
                Reset Database
              </button>
            </div>
          )}
          
          <button 
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="w-full flex items-center justify-center p-2 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-500 dark:text-slate-400 transition-colors"
          >
            {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </button>
        </div>
      </nav>

      {/* Main Panel Content */}
      <div className="flex-grow flex flex-col min-w-0 overflow-y-auto h-screen">
        
        {/* Top Header Navigation */}
        <header className="sticky top-0 bg-white/70 dark:bg-[#0b0f19]/70 backdrop-blur-md z-20 border-b border-slate-200 dark:border-slate-800 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono font-bold uppercase px-3 py-1 bg-rose-500/10 text-rose-500 rounded-full border border-rose-500/20">
              Role: {activeRole}
            </span>
          </div>

          {/* Right Header Navigation */}
          <div className="flex items-center gap-4">
            {/* Quick switcher buttons */}
            <div className="hidden sm:flex bg-slate-100 dark:bg-slate-800/40 p-0.5 rounded-lg border border-slate-200 dark:border-slate-800 text-xs font-bold">
              <button 
                onClick={() => setActiveRole('manager')}
                className={`px-3 py-1.5 rounded-md transition-all ${activeRole === 'manager' ? 'bg-white dark:bg-slate-700 text-rose-500 shadow-sm' : 'text-slate-400'}`}
              >
                Manager
              </button>
              <button 
                onClick={() => setActiveRole('advisor')}
                className={`px-3 py-1.5 rounded-md transition-all ${activeRole === 'advisor' ? 'bg-white dark:bg-slate-700 text-rose-500 shadow-sm' : 'text-slate-400'}`}
              >
                Advisor
              </button>
              <button 
                onClick={() => setActiveRole('technician')}
                className={`px-3 py-1.5 rounded-md transition-all ${activeRole === 'technician' ? 'bg-white dark:bg-slate-700 text-rose-500 shadow-sm' : 'text-slate-400'}`}
              >
                Technician
              </button>
              <button 
                onClick={() => setActiveRole('customer')}
                className={`px-3 py-1.5 rounded-md transition-all ${activeRole === 'customer' ? 'bg-white dark:bg-slate-700 text-rose-500 shadow-sm' : 'text-slate-400'}`}
              >
                Customer
              </button>
            </div>

            {/* Dark mode switcher toggle */}
            <button 
              onClick={() => setIsDark(!isDark)}
              className="p-2 border border-slate-200 dark:border-slate-800 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition-colors"
            >
              {isDark ? <Sun className="h-4.5 w-4.5" /> : <Moon className="h-4.5 w-4.5" />}
            </button>
          </div>
        </header>

        {/* Dynamic Main Workspace */}
        <main className="flex-grow p-6 max-w-6xl w-full mx-auto pb-16">
          {renderMainContent()}
        </main>
      </div>

    </div>
  );
}
