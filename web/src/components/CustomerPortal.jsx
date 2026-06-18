import React, { useState } from 'react';
import { 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  XCircle, 
  ShieldAlert,
  ThumbsUp,
  ThumbsDown,
  Calendar,
  Wrench,
  Camera,
  Play,
  FileText,
  FileCheck,
  QrCode
} from 'lucide-react';

export default function CustomerPortal({ 
  appointment, 
  allCustomerAppointments = [],
  onSelectAppointment,
  onApproveRecommendation, 
  onDeclineRecommendation,
  onScheduleAppointment
}) {
  const [activeTab, setActiveTab] = useState('status'); // 'status' | 'schedule'
  const [selectedProofItem, setSelectedProofItem] = useState(null);

  // Schedule Form State
  const [vehicleModel, setVehicleModel] = useState('');
  const [selectedService, setSelectedService] = useState('Standard Service Package');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');

  if (!appointment) {
    return (
      <div className="animate-fade-in p-6 glass-card text-center max-w-xl mx-auto mt-12">
        <Calendar className="h-12 w-12 text-rose-500 mx-auto mb-4" />
        <h2 className="text-xl font-bold mb-2">No Active Vehicle Service</h2>
        <p className="text-slate-500 dark:text-slate-400 mb-6">
          You don't currently have an active service order. Book an appointment to get started.
        </p>
        <button 
          onClick={() => setActiveTab('schedule')}
          className="btn-primary"
        >
          Book Appointment
        </button>
      </div>
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
    // Custom mapping for layout steps
    if (appointment.status === 'scheduled') return 0;
    if (appointment.status === 'checked_in') return 1;
    if (appointment.status === 'inspecting') return 2;
    if (appointment.status === 'in_progress') return 3;
    if (appointment.status === 'ready') return 5;
    return 4; // default for qc
  };

  const handleScheduleSubmit = (e) => {
    e.preventDefault();
    if (!vehicleModel || !selectedDate || !selectedTime) return;
    onScheduleAppointment({
      customerName: appointment ? appointment.customerName : 'John Doe',
      vehicle: vehicleModel,
      service: selectedService,
      date: selectedDate,
      time: selectedTime
    });
    setVehicleModel('');
    setSelectedDate('');
    setSelectedTime('');
    setActiveTab('status');
  };

  // Group recommendations by Category
  const recs = appointment.recommendations || [];
  const pendingRecs = recs.filter(r => r.status === 'pending');
  const approvedRecs = recs.filter(r => r.status === 'approved');

  // Hardcoded execution proofs for demonstration
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
    <div className="animate-fade-in space-y-6">
      {/* Header and Portal Tabs */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <span className="text-xs uppercase tracking-widest font-mono text-rose-500">Live Service Passport</span>
          <div className="flex flex-wrap items-center gap-3 mt-1">
            <h1 className="text-2xl font-bold">{appointment.customerName}'s Vehicle Portal</h1>
            {allCustomerAppointments.length > 1 && (
              <select
                value={appointment.id}
                onChange={(e) => onSelectAppointment(e.target.value)}
                className="px-2.5 py-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-semibold focus:outline-none cursor-pointer text-slate-800 dark:text-slate-200"
              >
                {allCustomerAppointments.map(app => (
                  <option key={app.id} value={app.id}>
                    {app.vehicle} ({app.status.replace('_', ' ')})
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>
        <div className="flex bg-slate-100 dark:bg-slate-800/50 p-1 rounded-lg border border-slate-200 dark:border-slate-700">
          <button 
            onClick={() => setActiveTab('status')}
            className={`px-4 py-2 text-sm font-semibold rounded-md transition-all ${
              activeTab === 'status' ? 'bg-white dark:bg-slate-700 text-rose-500 shadow-sm' : 'text-slate-500 dark:text-slate-400'
            }`}
          >
            Track My Car
          </button>
          <button 
            onClick={() => setActiveTab('schedule')}
            className={`px-4 py-2 text-sm font-semibold rounded-md transition-all ${
              activeTab === 'schedule' ? 'bg-white dark:bg-slate-700 text-rose-500 shadow-sm' : 'text-slate-500 dark:text-slate-400'
            }`}
          >
            Book Appointment
          </button>
        </div>
      </div>

      {activeTab === 'status' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Tracker Timeline & Details */}
          <div className="lg:col-span-2 space-y-6">
            <div className="glass-card">
              <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                <Wrench className="h-5 w-5 text-rose-500" />
                Live Service Timeline
              </h3>

              {/* Progress Pipeline */}
              <div className="relative flex flex-col md:flex-row justify-between items-center gap-4 md:gap-2 mb-8 mt-4">
                <div className="absolute top-1/2 left-0 right-0 h-1 bg-slate-200 dark:bg-slate-800 -translate-y-1/2 hidden md:block z-0"></div>
                
                {steps.map((step, idx) => {
                  const currentIdx = getCurrentStepIndex();
                  const isCompleted = idx < currentIdx;
                  const isActive = idx === currentIdx;

                  return (
                    <div key={step.key} className="flex flex-row md:flex-col items-center gap-3 md:gap-2 z-10 w-full md:w-auto relative">
                      <div className={`h-10 w-10 rounded-full flex items-center justify-center border-2 transition-all ${
                        isCompleted 
                          ? 'bg-rose-500 border-rose-500 text-white' 
                          : isActive 
                            ? 'bg-white dark:bg-slate-900 border-rose-500 text-rose-500 scale-110 shadow-lg' 
                            : 'bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-400'
                      }`}>
                        {isCompleted ? <CheckCircle2 className="h-5 w-5" /> : <Clock className="h-4 w-4" />}
                      </div>
                      <div className="text-left md:text-center">
                        <span className={`block text-xs font-mono font-bold uppercase tracking-wider ${
                          isActive ? 'text-rose-500 font-extrabold' : 'text-slate-500 dark:text-slate-400'
                        }`}>
                          {step.label}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Vehicle specs banner */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700/60">
                <div>
                  <span className="text-xs text-slate-400 dark:text-slate-500 uppercase font-mono">Vehicle VIN</span>
                  <h4 className="text-sm font-bold font-mono">5YJ3E1EBXLF8902A</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{appointment.vehicle}</p>
                </div>
                <div className="mt-2 sm:mt-0 text-left sm:text-right">
                  <span className="text-xs text-slate-400 dark:text-slate-500 uppercase font-mono">Current Estimate</span>
                  <h4 className="text-lg font-bold text-rose-500 font-mono">₹{appointment.estimatedCost}</h4>
                </div>
              </div>
            </div>

            {/* Proof of Work Execution Pack */}
            {appointment.status === 'ready' && (
              <div className="glass-card">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <FileCheck className="h-5 w-5 text-rose-500" />
                  Execution Proof Pack
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
                  Here is the verified evidence trail of all repairs performed on your vehicle.
                </p>

                <div className="space-y-4">
                  {executionProofs.map((proof, i) => (
                    <div key={i} className="p-4 bg-slate-50 dark:bg-slate-800/30 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row gap-4 items-start">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-sm">{proof.title}</h4>
                          <span className="text-[10px] bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 px-2 py-0.5 rounded font-mono">
                            Verified Execution
                          </span>
                        </div>
                        <p className="text-xs text-slate-400">Completed: {proof.timestamp}</p>
                        
                        <ul className="space-y-1 mt-2">
                          {proof.checklist.map((item, idx) => (
                            <li key={idx} className="text-xs text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
                              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> {item.label}
                            </li>
                          ))}
                        </ul>

                        <div className="flex items-center gap-1.5 mt-3 text-[10px] font-mono text-slate-400">
                          <QrCode className="h-4 w-4 text-rose-500" /> Consumable ID: {proof.barcode}
                        </div>
                      </div>

                      {/* Proof Media Preview */}
                      <div 
                        onClick={() => setSelectedProofItem(proof)}
                        className="relative rounded-lg overflow-hidden cursor-pointer group w-full md:w-36 h-24 shrink-0 bg-slate-200"
                      >
                        {proof.media.type === 'video' ? (
                          <>
                            <img src={proof.media.thumbnail} alt="" className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                              <Play className="h-6 w-6 text-white bg-rose-500 rounded-full p-1 shadow-md" />
                            </div>
                          </>
                        ) : (
                          <img src={proof.media.after} alt="" className="w-full h-full object-cover" />
                        )}
                        <div className="absolute bottom-1 left-1 right-1 bg-black/60 text-[9px] text-white p-1 rounded text-center truncate">
                          {proof.media.label}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Safety Inspection Report */}
            {appointment.inspection && (
              <div className="glass-card">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <ShieldAlert className="h-5 w-5 text-rose-500" />
                  Multi-Point Inspection Diagnostic
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
                  Certified technician diagnostic checks:
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(appointment.inspection).map(([key, value]) => {
                    const statusClass = 
                      value.status === 'red' ? 'border-red-500 bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-400' :
                      value.status === 'yellow' ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-950/20 text-yellow-700 dark:text-yellow-400' :
                      'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400';

                    const StatusIcon = 
                      value.status === 'red' ? XCircle :
                      value.status === 'yellow' ? AlertTriangle :
                      CheckCircle2;

                    return (
                      <div key={key} className={`p-4 rounded-xl border-l-4 ${statusClass} flex items-start justify-between`}>
                        <div>
                          <h4 className="font-bold text-sm capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</h4>
                          <p className="text-xs mt-1 text-slate-500 dark:text-slate-400">{value.comment}</p>
                        </div>
                        <StatusIcon className="h-5 w-5 flex-shrink-0" />
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Service Recommendations / Category breakups */}
          <div className="space-y-6">
            <div className="glass-card">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <ShieldAlert className="h-5 w-5 text-rose-500" />
                Required Approvals
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
                Review the items and make remote selections (OEM-mandatory vs. optional upgrades).
              </p>

              {recs.length > 0 ? (
                <div className="space-y-4">
                  {recs.map((rec) => (
                    <div key={rec.id} className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700/60 space-y-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-bold text-sm">{rec.service}</h4>
                          <span className={`inline-block text-[9px] font-mono uppercase px-2 py-0.5 rounded mt-1.5 ${
                            rec.category === 'vas' ? 'bg-amber-100 dark:bg-amber-950/40 text-amber-600' : 'bg-red-100 dark:bg-red-950/40 text-rose-600'
                          }`}>
                            {rec.category === 'vas' ? 'Optional (VAS)' : 'Required Repair'}
                          </span>
                        </div>
                        <span className="font-bold text-sm text-rose-500 font-mono">₹{rec.cost}</span>
                      </div>

                      {rec.proofUrl && (
                        <div className="relative rounded-lg overflow-hidden group">
                          <img 
                            src={rec.proofUrl} 
                            alt="Visual Proof" 
                            className="w-full h-32 object-cover"
                          />
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <span className="text-white text-xs font-semibold flex items-center gap-1.5">
                              <Camera className="h-4 w-4" /> View HD Proof Image
                            </span>
                          </div>
                        </div>
                      )}

                      <p className="text-xs text-slate-500 dark:text-slate-400">{rec.details}</p>

                      {rec.status === 'pending' ? (
                        <div className="flex gap-2 mt-2">
                          <button 
                            onClick={() => onApproveRecommendation(rec.id)}
                            className="flex-1 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                          >
                            <ThumbsUp className="h-3.5 w-3.5" /> Approve
                          </button>
                          <button 
                            onClick={() => onDeclineRecommendation(rec.id)}
                            className="flex-1 py-2 bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                          >
                            <ThumbsDown className="h-3.5 w-3.5" /> Decline
                          </button>
                        </div>
                      ) : (
                        <div className={`py-1.5 px-3 rounded-lg text-xs font-bold text-center ${
                          rec.status === 'approved' ? 'bg-emerald-100 dark:bg-emerald-950/30 text-emerald-600' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                        }`}>
                          {rec.status === 'approved' ? '✓ Approved for Service' : '✗ Declined by Owner'}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-slate-400">
                  <CheckCircle2 className="h-10 w-10 text-emerald-500 mx-auto mb-3" />
                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">No Pending Approvals</p>
                  <p className="text-xs mt-1 text-slate-500">Your vehicle has no additional recommended repairs.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'schedule' && (
        <div className="glass-card max-w-xl mx-auto">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Calendar className="h-5 w-5 text-rose-500" />
            Book a Service Appointment
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
            Select a service, date, and time slot for your vehicle's maintenance check.
          </p>

          <form onSubmit={handleScheduleSubmit} className="space-y-4 text-left">
            <div>
              <label className="block text-xs uppercase tracking-wider font-mono font-bold text-slate-400 mb-1.5">
                Vehicle Model
              </label>
              <input 
                type="text" 
                placeholder="e.g. Maruti Suzuki Swift"
                value={vehicleModel}
                onChange={(e) => setVehicleModel(e.target.value)}
                required
                className="w-full px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent text-sm"
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider font-mono font-bold text-slate-400 mb-1.5">
                Service Package
              </label>
              <select 
                value={selectedService}
                onChange={(e) => setSelectedService(e.target.value)}
                className="w-full px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent text-sm"
              >
                <option value="Standard Service Package">Standard Maintenance Package (₹3,500)</option>
                <option value="Advanced Safety Inspection">Advanced Safety Diagnostic (₹7,500)</option>
                <option value="Braking System Overhaul">Full Braking System Diagnostic (₹12,500)</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs uppercase tracking-wider font-mono font-bold text-slate-400 mb-1.5">
                  Select Date
                </label>
                <input 
                  type="date" 
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  required
                  className="w-full px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent text-sm"
                />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-wider font-mono font-bold text-slate-400 mb-1.5">
                  Select Time
                </label>
                <select 
                  value={selectedTime}
                  onChange={(e) => setSelectedTime(e.target.value)}
                  required
                  className="w-full px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent text-sm"
                >
                  <option value="">Select Time Slot</option>
                  <option value="09:00 AM">09:00 AM</option>
                  <option value="11:30 AM">11:30 AM</option>
                  <option value="02:00 PM">02:00 PM</option>
                  <option value="04:30 PM">04:30 PM</option>
                </select>
              </div>
            </div>

            <button 
              type="submit" 
              className="w-full btn-primary justify-center mt-6"
            >
              Confirm Appointment Booking
            </button>
          </form>
        </div>
      )}

      {/* Proof Overlay Modal */}
      {selectedProofItem && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedProofItem(null)}
        >
          <div 
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            <h3 className="text-lg font-bold">{selectedProofItem.title} - Video/Photo Proof</h3>
            
            {selectedProofItem.media.type === 'video' ? (
              <div className="relative rounded-xl overflow-hidden aspect-video bg-black flex-center">
                <img src={selectedProofItem.media.thumbnail} alt="" className="w-full h-full object-cover opacity-60" />
                <div className="absolute flex flex-col items-center gap-2">
                  <Play className="h-12 w-12 text-white bg-rose-500 rounded-full p-2.5 shadow-lg animate-pulse" />
                  <span className="text-white text-xs font-bold">Simulated Video Stream</span>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="block text-xs text-slate-400 mb-1 font-mono uppercase">Before</span>
                  <img src={selectedProofItem.media.before} alt="Before" className="rounded-lg w-full h-32 object-cover border border-slate-200 dark:border-slate-700" />
                </div>
                <div>
                  <span className="block text-xs text-slate-400 mb-1 font-mono uppercase">After</span>
                  <img src={selectedProofItem.media.after} alt="After" className="rounded-lg w-full h-32 object-cover border border-slate-200 dark:border-slate-700" />
                </div>
              </div>
            )}
            
            <p className="text-xs text-slate-500 dark:text-slate-400 text-center italic">{selectedProofItem.media.label}</p>

            <div className="flex justify-end">
              <button 
                onClick={() => setSelectedProofItem(null)}
                className="btn-secondary py-1.5 px-4 text-xs"
              >
                Close Proof
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
