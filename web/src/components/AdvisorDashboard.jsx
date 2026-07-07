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
  CheckSquare,
  Camera,
  Play
} from 'lucide-react';

const PILOT_DEALERS = [
  { id: "d1", name: "Maruti Suzuki Sector 63 Noida Hub", address: "H-224, Sector 63, Noida, UP", pincode: "201301", lat: 28.627, lng: 77.378 },
  { id: "d2", name: "Hyundai Care Sector 62 Noida Hub", address: "C-56, Sector 62, Noida, UP", pincode: "201309", lat: 28.622, lng: 77.364 },
  { id: "d3", name: "Mahindra Dealership Hub Delhi", address: "Okhla Industrial Area Phase III, New Delhi", pincode: "110020", lat: 28.538, lng: 77.271 },
  { id: "d4", name: "Tata Motors Gurugram Service Center", address: "IDC, Sector 14, Gurugram, Haryana", pincode: "122001", lat: 28.473, lng: 77.042 },
  { id: "d5", name: "Honda Care Connaught Place", address: "Connaught Place, Radial Road 4, New Delhi", pincode: "110001", lat: 28.630, lng: 77.220 }
];

export default function AdvisorDashboard({ 
  appointments, 
  onAcceptBooking, 
  onRejectBooking, 
  onSendMessage, 
  messages,
  mechanics = [],
  onQcSignOff,
  onPublishEstimate
}) {
  const [activeTab, setActiveTab] = useState('appointments'); // 'appointments' | 'qc' | 'workshop' | 'chat'
  const [chatMessage, setChatMessage] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState(appointments[0]?.customerName || 'John Doe');
  
  // Advisor QC Sign-off state
  const [advisorQcSign, setAdvisorQcSign] = useState('');

  // Job Card Creation Modal state
  const [checkInApp, setCheckInApp] = useState(null);
  const [odometer, setOdometer] = useState('15,000 km');
  const [fuelLevel, setFuelLevel] = useState('50%');
  const [selectedMechanicId, setSelectedMechanicId] = useState('');
  const [advisorComments, setAdvisorComments] = useState('');
  const [fuelPhoto, setFuelPhoto] = useState('');
  const [batteryPhoto, setBatteryPhoto] = useState('');

  // Reject Booking state
  const [rejectRoId, setRejectRoId] = useState('');
  const [rejectReason, setRejectReason] = useState('');

  const pendingAppointments = appointments.filter(a => a.status === 'Requested');
  const checkedInAppointments = appointments.filter(a => a.status !== 'Requested' && a.status !== 'Rejected');
  
  const qcPendingAppointments = appointments.filter(a => a.status === 'qc_check');

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
    onQcSignOff(roId, advisorQcSign);
    setAdvisorQcSign('');
    alert("Quality Control Sign-off submitted! Vehicle is marked Completed.");
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
            onClick={() => setActiveTab('workshop')}
            className={`px-4 py-2 text-sm font-semibold rounded-md transition-all ${
              activeTab === 'workshop' ? 'bg-white dark:bg-slate-700 text-rose-500 shadow-sm' : 'text-slate-500 dark:text-slate-400'
            }`}
          >
            Workshop Management
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
              {appointments.filter(a => ['Accepted', 'Estimate Pending', 'In Progress', 'qc_check'].includes(a.status)).length}
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
                <div className="divide-y divide-slate-100 dark:divide-slate-800 space-y-4">
                  {pendingAppointments.map((app) => (
                    <div key={app.id} className="py-4 flex flex-col justify-between items-start gap-4">
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center w-full gap-4">
                        <div>
                          <h4 className="font-bold text-slate-800 dark:text-slate-100">{app.customerName}</h4>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{app.vehicle} • {app.service}</p>
                          <div className="flex gap-4 mt-2 text-[11px] font-mono text-slate-400">
                            <span>Date: {app.date}</span>
                            <span>Time: {app.time}</span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button 
                            type="button"
                            onClick={() => {
                              setCheckInApp(app);
                              setOdometer('15,000 km');
                              setFuelLevel('50%');
                              setAdvisorComments('Complains of squealing front brakes.');
                              const matchingMechanics = mechanics.filter(m => app.dealerName ? m.workshopId === (app.dealerName.includes('Maruti') ? 'd1' : app.dealerName.includes('Hyundai') ? 'd2' : app.dealerName.includes('Mahindra') ? 'd3' : app.dealerName.includes('Tata') ? 'd4' : 'd5') : true);
                              setSelectedMechanicId(matchingMechanics[0]?.id || mechanics[0]?.id || '');
                            }}
                            className="btn-primary py-2 px-3 text-xs font-bold flex items-center gap-1"
                          >
                            <UserPlus className="h-4 w-4" /> Accept & Job Card
                          </button>
                          <button 
                            type="button"
                            onClick={() => setRejectRoId(app.id)}
                            className="btn-secondary py-2 px-3 text-xs font-semibold text-rose-500 hover:text-rose-600 border-rose-500/10"
                          >
                            Reject
                          </button>
                        </div>
                      </div>

                      {/* Rejection Form Input inline */}
                      {rejectRoId === app.id && (
                        <div className="w-full p-3 bg-red-500/5 border border-rose-500/10 rounded-xl space-y-2 animate-fade-in text-left">
                          <label className="block text-[10px] uppercase font-mono tracking-wider font-bold text-slate-400">Specify Rejection Reason</label>
                          <div className="flex gap-2">
                            <input 
                              type="text" 
                              placeholder="e.g. Workshop fully booked today"
                              value={rejectReason}
                              onChange={e => setRejectReason(e.target.value)}
                              className="flex-1 px-3 py-1.5 bg-[#0b0f19] border border-slate-700 rounded text-xs text-slate-200"
                            />
                            <button 
                              type="button"
                              onClick={() => {
                                onRejectBooking(app.id, rejectReason);
                                setRejectRoId('');
                                setRejectReason('');
                              }}
                              className="btn-primary bg-rose-500 hover:bg-rose-600 py-1.5 px-3 text-xs font-bold"
                            >
                              Confirm Rejection
                            </button>
                            <button 
                              type="button"
                              onClick={() => setRejectRoId('')}
                              className="btn-secondary py-1.5 px-3 text-xs"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      )}
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

            {/* Estimate Review Queue (Awaiting Advisor Release) */}
            {appointments.filter(a => a.status === 'Estimate Advisor Review').length > 0 && (
              <div className="glass-card border-rose-500/20 bg-rose-500/5">
                <h3 className="text-lg font-bold mb-2 flex items-center gap-2">
                  <FileText className="h-5 w-5 text-rose-500 animate-pulse" />
                  Estimate Review Queue
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
                  Technicians have submitted diagnostic recommendations. Review the items, adjust as necessary, and release the estimate to the customer.
                </p>

                <div className="space-y-4">
                  {appointments.filter(a => a.status === 'Estimate Advisor Review').map((app) => (
                    <div key={app.id} className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl space-y-4 text-left">
                      <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800/80 pb-2">
                        <div>
                          <span className="font-bold text-sm block text-slate-800 dark:text-slate-200">{app.customerName} • {app.vehicle}</span>
                          <span className="text-[10px] text-slate-400 font-mono">RO ID: {app.id}</span>
                        </div>
                        <span className="text-[10px] bg-amber-500/10 text-amber-500 px-2 py-0.5 rounded-full font-mono uppercase font-bold border border-amber-500/20">
                          Awaiting Review
                        </span>
                      </div>

                      {/* List of recommended items */}
                      <div className="space-y-2">
                        <span className="block text-[10px] uppercase font-mono font-bold text-slate-400">Technician Recommendations</span>
                        {(app.recommendations || []).length > 0 ? (
                          <div className="space-y-2">
                            {(app.recommendations || []).map((rec, rIdx) => (
                              <div key={rec.id || rIdx} className="flex justify-between items-center p-2.5 bg-slate-50 dark:bg-slate-850/40 rounded-lg border border-slate-150 dark:border-slate-800 text-xs">
                                <div>
                                  <span className="font-bold block text-slate-800 dark:text-slate-250">{rec.service}</span>
                                  <span className="text-[9px] text-slate-400 block mt-0.5">{rec.details}</span>
                                </div>
                                <div className="flex items-center gap-3">
                                  <span className="font-mono font-bold text-rose-500">₹{rec.cost}</span>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const updated = app.recommendations.filter(r => r.id !== rec.id);
                                      onPublishEstimate(app.id, updated);
                                    }}
                                    className="text-red-500 hover:text-red-700 font-bold px-1 text-sm"
                                    title="Remove Item"
                                  >
                                    ×
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <span className="text-xs text-slate-500">No recommended items.</span>
                        )}
                      </div>

                      <div className="pt-2">
                        <button
                          type="button"
                          onClick={() => {
                            onPublishEstimate(app.id, app.recommendations || []);
                          }}
                          className="w-full btn-primary py-2.5 justify-center text-xs font-bold uppercase tracking-wider"
                        >
                          Approve & Publish to Customer
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

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
                              app.status === 'Accepted' ? 'bg-blue-500/10 text-blue-500 border border-blue-500/20' :
                              app.status === 'inspecting' ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' :
                              app.status === 'Estimate Advisor Review' ? 'bg-orange-500/10 text-orange-500 border border-orange-500/20 animate-pulse' :
                              app.status === 'Estimate Pending' ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' :
                              app.status === 'Approved' ? 'bg-purple-500/10 text-purple-500 border border-purple-500/20' :
                              app.status === 'In Progress' ? 'bg-indigo-500/10 text-indigo-500 border border-indigo-500/20' :
                              app.status === 'qc_check' ? 'bg-pink-500/10 text-pink-500 border border-pink-500/20' :
                              app.status === 'Completed' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' :
                              'bg-slate-100 dark:bg-slate-800 text-slate-450'
                            }`}>
                              {app.status}
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

      {activeTab === 'workshop' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-left animate-fade-in">
          {/* Pilot Centers List */}
          <div className="lg:col-span-2 space-y-6">
            <div className="glass-card">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-rose-500">
                <ShieldCheck className="h-5 w-5" /> Onboarded Pilot Centers
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
                Active service workshop locations registered in the pilot network.
              </p>
              
              <div className="space-y-4">
                {PILOT_DEALERS.map((dealer) => (
                  <div key={dealer.id} className="p-4 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 rounded-xl flex justify-between items-start">
                    <div>
                      <span className="font-bold text-sm block text-slate-800 dark:text-slate-200">{dealer.name}</span>
                      <span className="text-xs text-slate-400 dark:text-slate-500 block mt-0.5">{dealer.address}</span>
                      <span className="inline-block mt-2 text-[10px] px-2 py-0.5 rounded font-mono font-bold bg-rose-500/10 text-rose-500 border border-rose-500/20 font-mono">PIN: {dealer.pincode}</span>
                    </div>
                    <span className="text-xs text-slate-400 font-mono">Geo: {dealer.lat}, {dealer.lng}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Mechanic Team Status */}
          <div className="glass-card">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-rose-500">
              <Users className="h-5 w-5" /> Workshop Team (Mechanics)
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
              Assigned technician status logs and workload allocation list.
            </p>

            <div className="space-y-3.5">
              {mechanics.map((mech) => {
                const activeJob = appointments.find(a => a.assignedMechanic === mech.name && !['Completed', 'Rejected', 'ready'].includes(a.status));
                return (
                  <div key={mech.id} className="p-3 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 rounded-xl flex items-center justify-between">
                    <div>
                      <span className="font-bold text-xs block">{mech.name}</span>
                      <span className="text-[10px] text-slate-400 block mt-0.5">Dealer ID: {mech.workshopId === 'd1' ? 'Sector 63 Noida' : 'Connaught Place'}</span>
                    </div>
                    {activeJob ? (
                      <span className="text-[10px] bg-indigo-500/10 text-indigo-500 font-bold px-2 py-0.5 rounded border border-indigo-500/20 truncate max-w-[120px]" title={`Working on ${activeJob.customerName}`}>
                        RO: {activeJob.customerName}
                      </span>
                    ) : (
                      <span className="text-[10px] bg-emerald-500/10 text-emerald-500 font-bold px-2 py-0.5 rounded border border-emerald-500/20">
                        Idle
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
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

      {/* Job Card Modal */}
      {checkInApp && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl text-left" onClick={e => e.stopPropagation()}>
            <div className="border-b border-slate-200 dark:border-slate-800 pb-3 flex justify-between items-center">
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
                <FileText className="h-5 w-5 text-rose-500" /> Create Detailed Job Card
              </h3>
              <button onClick={() => setCheckInApp(null)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 font-bold">×</button>
            </div>
            
            <div className="space-y-1.5 text-xs">
              <span className="text-slate-400 block font-mono">RO ID: {checkInApp.id}</span>
              <span className="font-bold text-slate-800 dark:text-slate-200 block text-sm">Customer: {checkInApp.customerName}</span>
              <span className="text-slate-500 dark:text-slate-400 block font-semibold">Vehicle: {checkInApp.vehicle}</span>
            </div>

            <form onSubmit={(e) => {
              e.preventDefault();
              onAcceptBooking(checkInApp.id, odometer, fuelLevel, selectedMechanicId, advisorComments, fuelPhoto, batteryPhoto);
              setCheckInApp(null);
              setFuelPhoto('');
              setBatteryPhoto('');
            }} className="space-y-4 pt-2">
              <div>
                <label className="block text-xs uppercase tracking-wider font-mono font-bold text-slate-400 mb-1.5">Odometer Reading (km)</label>
                <input 
                  type="text" 
                  value={odometer}
                  onChange={e => setOdometer(e.target.value)}
                  placeholder="e.g. 15,200 km"
                  required
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-[#0b0f19] border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider font-mono font-bold text-slate-400 mb-1.5">Current Fuel Level</label>
                <select 
                  value={fuelLevel}
                  onChange={e => setFuelLevel(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-[#0b0f19] border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
                >
                  <option value="Empty">Empty</option>
                  <option value="25% (Quarter)">25% (Quarter)</option>
                  <option value="50% (Half)">50% (Half)</option>
                  <option value="75% (Three-Quarter)">75% (Three-Quarter)</option>
                  <option value="100% (Full)">100% (Full)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider font-mono font-bold text-slate-400 mb-1.5">Allocate Mechanic</label>
                <select 
                  value={selectedMechanicId}
                  onChange={e => setSelectedMechanicId(e.target.value)}
                  required
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-[#0b0f19] border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
                >
                  <option value="">-- Assign Mechanic --</option>
                  {mechanics.filter(m => checkInApp.dealerName ? m.workshopId === (checkInApp.dealerName.includes('Maruti') ? 'd1' : checkInApp.dealerName.includes('Hyundai') ? 'd2' : checkInApp.dealerName.includes('Mahindra') ? 'd3' : checkInApp.dealerName.includes('Tata') ? 'd4' : 'd5') : true).map(m => (
                    <option key={m.id} value={m.id}>{m.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider font-mono font-bold text-slate-400 mb-1.5">Advisor Notes / Complaints</label>
                <textarea 
                  rows={2}
                  value={advisorComments}
                  onChange={e => setAdvisorComments(e.target.value)}
                  placeholder="Record customer complaints, scratches noticed, etc..."
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-[#0b0f19] border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
                />
              </div>

              {/* Mandatory Photographic Evidence */}
              <div className="space-y-3 p-3 bg-slate-50 dark:bg-slate-800/20 rounded-xl border border-slate-200 dark:border-slate-800">
                <h4 className="font-bold text-xs flex items-center gap-1.5 text-rose-500">
                  <Camera className="h-4 w-4" /> Mandatory Check-In Proof
                </h4>
                <p className="text-[10px] text-slate-500 dark:text-slate-400">
                  To activate the job card, upload clear photographs of the fuel indicator and the vehicle battery (showing battery ID/manufacturing number).
                </p>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <span className="block text-[10px] uppercase font-mono font-bold text-slate-400">Fuel Indicator</span>
                    {fuelPhoto ? (
                      <div className="relative rounded-lg overflow-hidden border border-emerald-500/30 h-20">
                        <img src={fuelPhoto} alt="Fuel proof" className="w-full h-full object-cover" />
                        <button 
                          type="button" 
                          onClick={() => setFuelPhoto('')}
                          className="absolute top-1 right-1 h-4 w-4 bg-red-500 text-white rounded-full flex items-center justify-center text-[10px]"
                        >
                          ×
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setFuelPhoto('https://images.unsplash.com/photo-1508974239320-0a029497e820?auto=format&fit=crop&w=300&q=80')}
                        className="w-full h-20 border-2 border-dashed border-slate-350 dark:border-slate-800 hover:border-rose-500 rounded-lg flex flex-col items-center justify-center text-slate-400 hover:text-rose-500 transition-all text-xs"
                      >
                        <Camera className="h-5 w-5 mb-1" />
                        <span>Upload Fuel</span>
                      </button>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <span className="block text-[10px] uppercase font-mono font-bold text-slate-400">Battery ID & Number</span>
                    {batteryPhoto ? (
                      <div className="relative rounded-lg overflow-hidden border border-emerald-500/30 h-20">
                        <img src={batteryPhoto} alt="Battery proof" className="w-full h-full object-cover" />
                        <button 
                          type="button" 
                          onClick={() => setBatteryPhoto('')}
                          className="absolute top-1 right-1 h-4 w-4 bg-red-500 text-white rounded-full flex items-center justify-center text-[10px]"
                        >
                          ×
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setBatteryPhoto('https://images.unsplash.com/photo-1548345680-f5475ea5df84?auto=format&fit=crop&w=300&q=80')}
                        className="w-full h-20 border-2 border-dashed border-slate-350 dark:border-slate-800 hover:border-rose-500 rounded-lg flex flex-col items-center justify-center text-slate-400 hover:text-rose-500 transition-all text-xs"
                      >
                        <Camera className="h-5 w-5 mb-1" />
                        <span>Upload Battery</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button 
                  type="submit" 
                  disabled={!fuelPhoto || !batteryPhoto}
                  className={`flex-1 py-2.5 rounded-lg text-xs font-bold transition-all ${
                    (!fuelPhoto || !batteryPhoto) 
                      ? 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-650 cursor-not-allowed'
                      : 'bg-rose-500 text-white hover:bg-rose-600'
                  }`}
                >
                  Accept & Create Job Card
                </button>
                <button 
                  type="button" 
                  onClick={() => { setCheckInApp(null); setFuelPhoto(''); setBatteryPhoto(''); }} 
                  className="btn-secondary px-4 justify-center"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
