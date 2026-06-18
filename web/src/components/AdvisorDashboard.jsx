import React, { useState } from 'react';
import { 
  Users, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  UserPlus, 
  MessageSquare, 
  AlertCircle,
  FileText,
  Send,
  Sparkles,
  ShieldCheck,
  CheckSquare
} from 'lucide-react';

export default function AdvisorDashboard({ 
  appointments, 
  onCheckIn, 
  onSendMessage, 
  messages,
  // Helper to trigger QC approval
  onSyncState
}) {
  const [activeTab, setActiveTab] = useState('appointments'); // 'appointments' | 'qc' | 'chat'
  const [chatMessage, setChatMessage] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState(appointments[0]?.customerName || 'John Doe');
  
  // Advisor QC Sign-off state
  const [advisorQcSign, setAdvisorQcSign] = useState('');

  const pendingAppointments = appointments.filter(a => a.status === 'scheduled');
  const checkedInAppointments = appointments.filter(a => a.status !== 'scheduled');
  
  // Vehicles waiting for QC Check (which in our status represents either in_progress or custom qc state, let's treat vehicles with completed technician work as ready for QC)
  const qcPendingAppointments = appointments.filter(a => a.status === 'in_progress' || (a.status === 'inspecting' && a.techSignature));

  const handleSendMessageSubmit = (e) => {
    e.preventDefault();
    if (!chatMessage.trim()) return;
    onSendMessage({
      sender: 'Advisor',
      recipient: selectedCustomer,
      text: chatMessage
    });
    setChatMessage('');
  };

  const handleQcSignOffSubmit = (roId) => {
    if (!advisorQcSign) {
      alert("Please provide Advisor/QC digital signature to verify the repairs.");
      return;
    }
    // Simulate updating appointments with QC check completed
    const targetApp = appointments.find(a => a.id === roId);
    if (targetApp) {
      targetApp.status = 'ready';
      targetApp.qcSignature = advisorQcSign;
      
      // Send chat notification
      onSendMessage({
        sender: 'Advisor',
        recipient: targetApp.customerName,
        text: `Hi ${targetApp.customerName}, your vehicle has passed our final quality QC inspection and is ready for pickup!`
      });
      
      setAdvisorQcSign('');
      alert("Quality Control Sign-off submitted! Vehicle is marked ready.");
    }
  };

  return (
    <div className="animate-fade-in space-y-6">
      {/* Header and Statistics Grid */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <span className="text-xs uppercase tracking-widest font-mono text-rose-500">Dealership Desk</span>
          <h1 className="text-2xl font-bold mt-1">Service Advisor Hub</h1>
        </div>
        <div className="flex bg-slate-100 dark:bg-slate-800/50 p-1 rounded-lg border border-slate-200 dark:border-slate-700">
          <button 
            onClick={() => setActiveTab('appointments')}
            className={`px-4 py-2 text-sm font-semibold rounded-md transition-all ${
              activeTab === 'appointments' ? 'bg-white dark:bg-slate-700 text-rose-500 shadow-sm' : 'text-slate-500 dark:text-slate-400'
            }`}
          >
            Check-In Desk
          </button>
          <button 
            onClick={() => setActiveTab('qc')}
            className={`px-4 py-2 text-sm font-semibold rounded-md transition-all ${
              activeTab === 'qc' ? 'bg-white dark:bg-slate-700 text-rose-500 shadow-sm' : 'text-slate-500 dark:text-slate-400'
            }`}
          >
            QC Inspection ({qcPendingAppointments.length})
          </button>
          <button 
            onClick={() => setActiveTab('chat')}
            className={`px-4 py-2 text-sm font-semibold rounded-md transition-all ${
              activeTab === 'chat' ? 'bg-white dark:bg-slate-700 text-rose-500 shadow-sm' : 'text-slate-500 dark:text-slate-400'
            }`}
          >
            Customer Chat ({messages.length})
          </button>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-card flex items-center gap-4 py-4">
          <div className="p-3 bg-rose-50 dark:bg-rose-950/20 rounded-xl text-rose-500">
            <Calendar className="h-6 w-6" />
          </div>
          <div>
            <span className="text-xs text-slate-400 dark:text-slate-500 uppercase font-mono block">Scheduled</span>
            <span className="text-2xl font-bold font-mono">{pendingAppointments.length}</span>
          </div>
        </div>

        <div className="glass-card flex items-center gap-4 py-4">
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/20 rounded-xl text-emerald-500">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <div>
            <span className="text-xs text-slate-400 dark:text-slate-500 uppercase font-mono block">Checked In</span>
            <span className="text-2xl font-bold font-mono">{checkedInAppointments.length}</span>
          </div>
        </div>

        <div className="glass-card flex items-center gap-4 py-4">
          <div className="p-3 bg-amber-50 dark:bg-amber-950/20 rounded-xl text-amber-500">
            <Clock className="h-6 w-6" />
          </div>
          <div>
            <span className="text-xs text-slate-400 dark:text-slate-500 uppercase font-mono block">Active ROs</span>
            <span className="text-2xl font-bold font-mono">
              {appointments.filter(a => ['inspecting', 'in_progress'].includes(a.status)).length}
            </span>
          </div>
        </div>
      </div>

      {activeTab === 'appointments' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Appointment Board */}
          <div className="lg:col-span-2 space-y-6">
            {/* Scheduled - Awaiting Arrival */}
            <div className="glass-card">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <Clock className="h-5 w-5 text-rose-500" />
                Scheduled Arrivals (Awaiting Check-in)
              </h3>
              
              {pendingAppointments.length > 0 ? (
                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                  {pendingAppointments.map((app) => (
                    <div key={app.id} className="py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      <div>
                        <h4 className="font-bold">{app.customerName}</h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{app.vehicle} • {app.service}</p>
                        <div className="flex gap-4 mt-2 text-[11px] font-mono text-slate-400">
                          <span>Date: {app.date}</span>
                          <span>Time: {app.time}</span>
                        </div>
                      </div>
                      <button 
                        onClick={() => onCheckIn(app.id)}
                        className="btn-primary py-2 px-4 text-xs font-bold"
                      >
                        <UserPlus className="h-3.5 w-3.5" /> Check In
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10 text-slate-400">
                  <CheckCircle2 className="h-8 w-8 text-emerald-500 mx-auto mb-2" />
                  <p className="text-sm font-semibold">No Pending Arrivals</p>
                  <p className="text-xs">All scheduled customers have been checked in.</p>
                </div>
              )}
            </div>

            {/* Active Repair Orders (ROs) */}
            <div className="glass-card">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <FileText className="h-5 w-5 text-rose-500" />
                Active Repair Orders
              </h3>

              {checkedInAppointments.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 dark:border-slate-800 text-xs font-mono uppercase tracking-wider text-slate-400">
                        <th className="pb-3">Customer & Vehicle</th>
                        <th className="pb-3">Status</th>
                        <th className="pb-3">MPI Status</th>
                        <th className="pb-3 text-right">Cost</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
                      {checkedInAppointments.map((app) => (
                        <tr key={app.id} className="group hover:bg-slate-50/50 dark:hover:bg-slate-800/10">
                          <td className="py-3.5">
                            <span className="font-semibold block">{app.customerName}</span>
                            <span className="text-xs text-slate-400 dark:text-slate-500">{app.vehicle}</span>
                          </td>
                          <td className="py-3.5">
                            <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                              app.status === 'checked_in' ? 'bg-blue-100 dark:bg-blue-950/40 text-blue-600' :
                              app.status === 'inspecting' ? 'bg-amber-100 dark:bg-amber-950/40 text-amber-600' :
                              app.status === 'in_progress' ? 'bg-indigo-100 dark:bg-indigo-950/40 text-indigo-600' :
                              'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600'
                            }`}>
                              {app.status.replace('_', ' ')}
                            </span>
                          </td>
                          <td className="py-3.5">
                            {app.inspection ? (
                              <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> Complete
                              </span>
                            ) : (
                              <span className="text-xs text-amber-500 dark:text-amber-400 flex items-center gap-1">
                                <Clock className="h-3.5 w-3.5" /> Pending MPI
                              </span>
                            )}
                          </td>
                          <td className="py-3.5 text-right font-mono font-bold text-rose-500">
                            ₹{app.estimatedCost}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-10 text-slate-400">
                  <AlertCircle className="h-8 w-8 mx-auto mb-2" />
                  <p className="text-sm font-semibold">No Active Repair Orders</p>
                  <p className="text-xs">Check in a customer to begin a repair cycle.</p>
                </div>
              )}
            </div>
          </div>

          {/* Quick Communication Sidebar */}
          <div className="glass-card">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-rose-500" />
              Chat Quick Actions
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
              Quickly send pre-built update notifications to active service customers.
            </p>

            <div className="space-y-3">
              {checkedInAppointments.map((app) => (
                <div key={app.id} className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700/60">
                  <h4 className="font-bold text-xs">{app.customerName} ({app.vehicle})</h4>
                  
                  <div className="grid grid-cols-2 gap-2 mt-3">
                    <button 
                      onClick={() => onSendMessage({
                        sender: 'Advisor',
                        recipient: app.customerName,
                        text: `Hello ${app.customerName}, your vehicle is checked in. Inspection starts soon.`
                      })}
                      className="py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 rounded text-[10px] font-semibold transition-colors"
                    >
                      Notify Check-in
                    </button>
                    <button 
                      onClick={() => onSendMessage({
                        sender: 'Advisor',
                        recipient: app.customerName,
                        text: `Hi ${app.customerName}, your MPI report is ready. Please check the portal to approve recommendations.`
                      })}
                      className="py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 rounded text-[10px] font-semibold transition-colors"
                    >
                      Request Approvals
                    </button>
                    <button 
                      onClick={() => onSendMessage({
                        sender: 'Advisor',
                        recipient: app.customerName,
                        text: `Hi ${app.customerName}, services are finished! Your vehicle is ready for pickup.`
                      })}
                      className="col-span-2 py-1.5 bg-rose-500 hover:bg-rose-600 text-white rounded text-[10px] font-bold transition-colors"
                    >
                      Notify Ready for Pickup
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'qc' && (
        <div className="space-y-6">
          <div className="glass-card">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-rose-500" />
              Quality Control Verification Desk
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
              Review technician evidence uploads, checkmarks, signatures, and sign off on quality control audits.
            </p>

            {qcPendingAppointments.length > 0 ? (
              <div className="space-y-6">
                {qcPendingAppointments.map((app) => (
                  <div key={app.id} className="p-5 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-bold text-base">{app.customerName}</h4>
                        <span className="text-xs text-slate-400">{app.vehicle} • {app.service}</span>
                      </div>
                      <span className="text-xs font-bold text-rose-500 font-mono">₹{app.estimatedCost}</span>
                    </div>

                    {/* Tech details */}
                    <div className="grid grid-cols-2 gap-4 bg-white dark:bg-slate-900/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
                      <div>
                        <span className="text-xs text-slate-400 font-mono uppercase block">Technician</span>
                        <span className="font-semibold text-sm">{app.techSignature || 'Signed off'}</span>
                      </div>
                      <div>
                        <span className="text-xs text-slate-400 font-mono uppercase block">Diagnostic Items</span>
                        <span className="font-semibold text-sm">
                          {app.inspection ? Object.keys(app.inspection).length : 0} items checked
                        </span>
                      </div>
                    </div>

                    {/* QC Sign-off input form */}
                    <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row gap-3 items-end">
                      <div className="flex-1 w-full text-left">
                        <label className="block text-xs uppercase tracking-wider font-mono font-bold text-slate-400 mb-1">
                          Advisor/QC Inspector Digital Signature
                        </label>
                        <input 
                          type="text" 
                          placeholder="Type your name to complete final sign-off"
                          value={advisorQcSign}
                          onChange={(e) => setAdvisorQcSign(e.target.value)}
                          className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
                        />
                      </div>
                      <button 
                        onClick={() => handleQcSignOffSubmit(app.id)}
                        className="btn-primary py-2 px-4 text-xs font-bold w-full sm:w-auto shrink-0"
                      >
                        <CheckSquare className="h-3.5 w-3.5" /> Complete QC Sign-off
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-slate-400">
                <CheckCircle2 className="h-10 w-10 text-emerald-500 mx-auto mb-3" />
                <p className="text-sm font-semibold">All Active Vehicles Passed QC</p>
                <p className="text-xs">No active repair orders require QC verification signatures at this time.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'chat' && (
        <div className="glass-card max-w-3xl mx-auto flex flex-col h-[500px]">
          {/* Chat Header */}
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-slate-200 dark:bg-slate-700 rounded-full flex items-center justify-center font-bold">
                {selectedCustomer.substring(0, 2).toUpperCase()}
              </div>
              <div>
                <h3 className="font-bold text-sm">{selectedCustomer}</h3>
                <span className="text-xs text-slate-400 flex items-center gap-1">
                  <Sparkles className="h-3 w-3 text-emerald-500" /> Active Conversation
                </span>
              </div>
            </div>
            
            <select 
              value={selectedCustomer}
              onChange={(e) => setSelectedCustomer(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-semibold focus:outline-none"
            >
              {appointments.map(a => (
                <option key={a.id} value={a.customerName}>{a.customerName}</option>
              ))}
            </select>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.filter(m => m.sender === selectedCustomer || m.recipient === selectedCustomer).length > 0 ? (
              messages.filter(m => m.sender === selectedCustomer || m.recipient === selectedCustomer).map((msg, idx) => {
                const isAdvisor = msg.sender === 'Advisor';
                return (
                  <div key={idx} className={`flex ${isAdvisor ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[70%] p-3.5 rounded-2xl text-xs space-y-1 shadow-sm ${
                      isAdvisor 
                        ? 'bg-rose-500 text-white rounded-tr-none' 
                        : 'bg-slate-100 dark:bg-slate-800/80 text-slate-800 dark:text-slate-200 rounded-tl-none border border-slate-200 dark:border-slate-700/50'
                    }`}>
                      <span className="block font-bold text-[9px] uppercase opacity-75">{msg.sender}</span>
                      <p>{msg.text}</p>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-12 text-slate-400 h-full flex flex-col justify-center items-center">
                <MessageSquare className="h-10 w-10 text-slate-300 dark:text-slate-700 mb-2" />
                <p className="text-sm font-semibold">No messages with {selectedCustomer}</p>
                <p className="text-xs">Send a message below to start chatting.</p>
              </div>
            )}
          </div>

          {/* Message Input */}
          <form onSubmit={handleSendMessageSubmit} className="p-4 border-t border-slate-200 dark:border-slate-800 flex gap-2">
            <input 
              type="text" 
              placeholder={`Send message to ${selectedCustomer}...`}
              value={chatMessage}
              onChange={(e) => setChatMessage(e.target.value)}
              className="flex-1 px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none text-xs focus:ring-1 focus:ring-rose-500"
            />
            <button 
              type="submit" 
              className="btn-primary py-2.5 px-4"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
