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
import CustomerPortal from './components/CustomerPortal';
import AdvisorDashboard from './components/AdvisorDashboard';
import TechnicianWorkbench from './components/TechnicianWorkbench';
import ManagerAnalytics from './components/ManagerAnalytics';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api/data';

export default function App() {
  const [isDark, setIsDark] = useState(true);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [activeRole, setActiveRole] = useState('manager'); // 'customer' | 'advisor' | 'technician' | 'manager'
  
  const [appointments, setAppointments] = useState([]);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch data from local API server
  const fetchLocalData = async () => {
    try {
      const response = await fetch(API_URL);
      if (response.ok) {
        const data = await response.json();
        setAppointments(data.appointments || []);
        setMessages(data.messages || []);
      }
    } catch (err) {
      console.error("Failed to connect to API server. Using offline state.", err);
    } finally {
      setLoading(false);
    }
  };

  // Push data to local API server
  const pushLocalData = async (newApps, newMsgs) => {
    try {
      await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ appointments: newApps, messages: newMsgs })
      });
    } catch (err) {
      console.error("Failed to push data to API server", err);
    }
  };

  // Initial Fetch
  useEffect(() => {
    fetchLocalData();
  }, []);

  // Polling for real-time synchronization with Mobile App
  useEffect(() => {
    const interval = setInterval(() => {
      fetchLocalData();
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  // Sync dark class on body
  useEffect(() => {
    if (isDark) {
      document.body.classList.add('dark');
    } else {
      document.body.classList.remove('dark');
    }
  }, [isDark]);

  const updateStateAndSync = (newApps, newMsgs) => {
    setAppointments(newApps);
    setMessages(newMsgs);
    pushLocalData(newApps, newMsgs);
  };

  // Advisor Check In Action
  const handleCheckIn = (id) => {
    const newApps = appointments.map(app => {
      if (app.id === id) {
        return { ...app, status: 'checked_in' };
      }
      return app;
    });
    
    const targetApp = appointments.find(a => a.id === id);
    const newMsgs = [...messages];
    if (targetApp) {
      newMsgs.push({
        sender: 'Advisor',
        recipient: targetApp.customerName,
        text: `Welcome! Your ${targetApp.vehicle} has been checked in for service. Our technicians will inspect it shortly.`,
        timestamp: new Date().toISOString()
      });
    }
    updateStateAndSync(newApps, newMsgs);
  };

  // Tech Start Inspection Action
  const handleStartInspection = (id) => {
    const newApps = appointments.map(app => {
      if (app.id === id) {
        return { ...app, status: 'inspecting' };
      }
      return app;
    });
    updateStateAndSync(newApps, messages);
  };

  // Tech Submit Inspection Action
  const handleSubmitInspection = (id, report, recommendations) => {
    const newApps = appointments.map(app => {
      if (app.id === id) {
        const baseCost = app.service.includes('Advanced') ? 240 : app.service.includes('Braking') ? 450 : 120;
        const recommendationsCost = recommendations.reduce((acc, r) => acc + r.cost, 0);
        return {
          ...app,
          status: 'inspecting', // Awaiting customer review
          inspection: report,
          recommendations: recommendations,
          estimatedCost: baseCost + recommendationsCost,
          techSignature: "Tech #402"
        };
      }
      return app;
    });

    const targetApp = appointments.find(a => a.id === id);
    const newMsgs = [...messages];
    if (targetApp) {
      newMsgs.push({
        sender: 'Advisor',
        recipient: targetApp.customerName,
        text: `Hi ${targetApp.customerName}, our technician has completed your vehicle safety inspection. Please log into the portal to review findings & approvals.`,
        timestamp: new Date().toISOString()
      });
    }
    updateStateAndSync(newApps, newMsgs);
  };

  // Customer Approve Recommendation
  const handleApproveRecommendation = (recId) => {
    const newApps = appointments.map(app => {
      const recIndex = app.recommendations.findIndex(r => r.id === recId);
      if (recIndex !== -1) {
        const updatedRecs = [...app.recommendations];
        updatedRecs[recIndex] = { ...updatedRecs[recIndex], status: 'approved' };
        
        // If all approvals are completed, move status to in_progress
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
    updateStateAndSync(newApps, messages);
  };

  // Customer Decline Recommendation
  const handleDeclineRecommendation = (recId) => {
    const newApps = appointments.map(app => {
      const recIndex = app.recommendations.findIndex(r => r.id === recId);
      if (recIndex !== -1) {
        const updatedRecs = [...app.recommendations];
        updatedRecs[recIndex] = { ...updatedRecs[recIndex], status: 'declined' };

        // Subtract cost from estimate
        const baseCost = app.service.includes('Advanced') ? 240 : app.service.includes('Braking') ? 450 : 120;
        const approvedRecsCost = updatedRecs
          .filter(r => r.status === 'approved')
          .reduce((acc, r) => acc + r.cost, 0);

        const pendingCount = updatedRecs.filter(r => r.status === 'pending').length;
        const newStatus = pendingCount === 0 ? 'in_progress' : app.status;

        return {
          ...app,
          recommendations: updatedRecs,
          estimatedCost: baseCost + approvedRecsCost,
          status: newStatus
        };
      }
      return app;
    });
    updateStateAndSync(newApps, messages);
  };

  // Tech Complete Repairs
  const handleCompleteRepairs = (id) => {
    const newApps = appointments.map(app => {
      if (app.id === id) {
        return { ...app, status: 'ready' };
      }
      return app;
    });
    
    const targetApp = appointments.find(a => a.id === id);
    const newMsgs = [...messages];
    if (targetApp) {
      newMsgs.push({
        sender: 'Advisor',
        recipient: targetApp.customerName,
        text: `Good news! All authorized repairs for your ${targetApp.vehicle} are completed. Your vehicle is ready for pickup.`,
        timestamp: new Date().toISOString()
      });
    }
    updateStateAndSync(newApps, newMsgs);
  };

  // Chat message addition
  const handleSendMessage = (msg) => {
    const newMsgs = [...messages, { ...msg, timestamp: new Date().toISOString() }];
    updateStateAndSync(appointments, newMsgs);
  };

  // Customer Book Appointment
  const handleScheduleAppointment = (newApp) => {
    const formattedApp = {
      id: `ro-${Date.now()}`,
      customerName: 'John Doe',
      vehicle: newApp.vehicle,
      service: newApp.service,
      date: newApp.date,
      time: newApp.time,
      status: 'scheduled',
      estimatedCost: newApp.service.includes('Advanced') ? 240 : newApp.service.includes('Braking') ? 450 : 120,
      inspection: null,
      recommendations: [],
      techSignature: '',
      qcSignature: ''
    };
    const newApps = [...appointments, formattedApp];
    updateStateAndSync(newApps, messages);
  };

  // Clear simulated database
  const handleResetData = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ appointments: [], messages: [] })
      });
      if (response.ok) {
        fetchLocalData();
      }
    } catch (err) {
      console.error(err);
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
