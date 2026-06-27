import React, { useState } from 'react';
import { 
  TrendingUp, 
  IndianRupee, 
  Users, 
  Wrench, 
  Star, 
  BarChart3, 
  Activity, 
  ChevronRight,
  TrendingDown,
  ShieldCheck,
  Award,
  FileSpreadsheet
} from 'lucide-react';

export default function ManagerAnalytics({ appointments, mechanics = [] }) {
  const [gmTab, setGmTab] = useState('volume'); // 'volume' | 'mechanics' | 'ledger'

  // Calculations
  const completedROs = appointments.filter(a => a.status === 'Completed' || a.status === 'ready');
  const activeROs = appointments.filter(a => a.status !== 'Requested' && a.status !== 'Completed' && a.status !== 'Rejected');
  
  // Total Revenue (including approved recommendations)
  const totalRevenue = appointments.reduce((acc, curr) => acc + (curr.estimatedCost || 0), 0);
  
  // Average Repair Order Value
  const avgROValue = appointments.length > 0 
    ? Math.round(totalRevenue / appointments.length) 
    : 0;

  // CSAT Score
  const csatScore = 4.8;
  const techEfficiency = 92;

  const exportLedgerJSON = () => {
    // Collect all audit trails into a single array
    const fullLedger = appointments.map(app => ({
      roId: app.id,
      customerName: app.customerName,
      vehicle: app.vehicle,
      odometer: app.odometer || '12,000 km',
      fuelLevel: app.fuelLevel || '50%',
      mechanic: app.assignedMechanic || 'Unassigned',
      auditTrail: app.auditTrail || []
    }));

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(fullLedger, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `serviceproof_global_audit_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    alert("Cryptographic Audit Ledger exported successfully as JSON!");
  };

  return (
    <div className="animate-fade-in space-y-6">
      {/* Header */}
      <div>
        <span className="text-xs uppercase tracking-widest font-mono text-rose-500">Business Panel</span>
        <h1 className="text-2xl font-bold mt-1">Manager Analytics Dashboard</h1>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Revenue */}
        <div className="glass-card">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2.5 bg-rose-50 dark:bg-rose-950/20 text-rose-500 rounded-xl">
              <IndianRupee className="h-5 w-5" />
            </div>
            <span className="text-xs font-mono font-bold text-emerald-500 flex items-center gap-0.5">
              <TrendingUp className="h-3.5 w-3.5" /> +14.2%
            </span>
          </div>
          <span className="text-xs text-slate-400 dark:text-slate-500 uppercase font-mono block">Total Revenue</span>
          <span className="text-2xl font-bold font-mono mt-1 block">₹{totalRevenue.toLocaleString('en-IN')}</span>
        </div>

        {/* Avg Repair Order */}
        <div className="glass-card">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2.5 bg-blue-50 dark:bg-blue-950/20 text-blue-500 rounded-xl">
              <Wrench className="h-5 w-5" />
            </div>
            <span className="text-xs font-mono font-bold text-emerald-500 flex items-center gap-0.5">
              <TrendingUp className="h-3.5 w-3.5" /> +5.7%
            </span>
          </div>
          <span className="text-xs text-slate-400 dark:text-slate-500 uppercase font-mono block">Average RO Value</span>
          <span className="text-2xl font-bold font-mono mt-1 block">₹{avgROValue.toLocaleString('en-IN')}</span>
        </div>

        {/* Technician Efficiency */}
        <div className="glass-card">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2.5 bg-amber-50 dark:bg-amber-950/20 text-amber-500 rounded-xl">
              <Activity className="h-5 w-5" />
            </div>
            <span className="text-xs font-mono font-bold text-red-500 flex items-center gap-0.5">
              <TrendingDown className="h-3.5 w-3.5" /> -1.2%
            </span>
          </div>
          <span className="text-xs text-slate-400 dark:text-slate-500 uppercase font-mono block">Tech Efficiency</span>
          <span className="text-2xl font-bold font-mono mt-1 block">{techEfficiency}%</span>
        </div>

        {/* CSAT Score */}
        <div className="glass-card">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-500 rounded-xl">
              <Star className="h-5 w-5" />
            </div>
            <span className="text-xs font-mono font-bold text-emerald-500 flex items-center gap-0.5">
              <TrendingUp className="h-3.5 w-3.5" /> +2.1%
            </span>
          </div>
          <span className="text-xs text-slate-400 dark:text-slate-500 uppercase font-mono block">Customer CSAT</span>
          <span className="text-2xl font-bold font-mono mt-1 block flex items-center gap-1">
            {csatScore} <span className="text-xs text-slate-400">/ 5.0</span>
          </span>
        </div>
      </div>

      {/* Sub tabs navigation */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 pb-2 gap-4 text-xs font-bold uppercase tracking-wider">
        <button 
          onClick={() => setGmTab('volume')}
          className={`pb-2 transition-all border-b-2 ${gmTab === 'volume' ? 'border-rose-500 text-rose-500' : 'border-transparent text-slate-400 hover:text-slate-200'}`}
        >
          Work Volume
        </button>
        <button 
          onClick={() => setGmTab('mechanics')}
          className={`pb-2 transition-all border-b-2 ${gmTab === 'mechanics' ? 'border-rose-500 text-rose-500' : 'border-transparent text-slate-400 hover:text-slate-200'}`}
        >
          Mechanic Utilizations
        </button>
        <button 
          onClick={() => setGmTab('ledger')}
          className={`pb-2 transition-all border-b-2 ${gmTab === 'ledger' ? 'border-rose-500 text-rose-500' : 'border-transparent text-slate-400 hover:text-slate-200'}`}
        >
          Compliance Ledger
        </button>
      </div>

      {/* Main Charts & List Layout */}
      {gmTab === 'volume' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
          {/* Dealership Operations Log */}
          <div className="lg:col-span-2 glass-card">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-rose-500" />
              Current Work Volume Status
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
              Detailed view of all active and completed vehicle services in the dealership pipeline.
            </p>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-xs font-mono uppercase tracking-wider text-slate-400">
                    <th className="pb-3">Customer & Vehicle</th>
                    <th className="pb-3">Pipeline Status</th>
                    <th className="pb-3">Main Action</th>
                    <th className="pb-3 text-right">Value</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
                  {appointments.map((app) => (
                    <tr key={app.id} className="group hover:bg-slate-50/50 dark:hover:bg-slate-800/10">
                      <td className="py-3 text-left">
                        <span className="font-semibold block">{app.customerName}</span>
                        <span className="text-xs text-slate-400 dark:text-slate-500">{app.vehicle}</span>
                      </td>
                      <td className="py-3 text-left">
                        <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-mono uppercase font-bold ${
                          app.status === 'Requested' ? 'bg-slate-100 text-slate-600 dark:bg-slate-800' :
                          app.status === 'Accepted' ? 'bg-blue-100 text-blue-600 dark:bg-blue-950/20' :
                          app.status === 'Estimate Pending' ? 'bg-amber-100 text-amber-600 dark:bg-amber-950/20' :
                          app.status === 'In Progress' ? 'bg-indigo-100 text-indigo-600 dark:bg-indigo-950/20' :
                          app.status === 'qc_check' ? 'bg-purple-100 text-purple-600 dark:bg-purple-950/20' :
                          'bg-emerald-100 text-emerald-600 dark:bg-emerald-950/20'
                        }`}>
                          {app.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="py-3 text-xs text-slate-500 dark:text-slate-400 text-left">
                        {app.service}
                      </td>
                      <td className="py-3 text-right font-mono font-bold text-rose-500">
                        ₹{app.estimatedCost.toLocaleString('en-IN')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Business Distribution Analysis */}
          <div className="glass-card flex flex-col justify-between">
            <div>
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <Activity className="h-5 w-5 text-rose-500" />
                Service Performance Indicators
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
                Track conversion metrics and throughput diagnostics.
              </p>

              <div className="space-y-5">
                {/* Job Completion Target */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500 dark:text-slate-400">Daily Volume Target</span>
                    <span className="font-bold font-mono">
                      {completedROs.length} / {appointments.length} Cars
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-2">
                    <div 
                      className="bg-rose-500 h-2 rounded-full transition-all duration-500" 
                      style={{ width: `${appointments.length > 0 ? (completedROs.length / appointments.length) * 100 : 0}%` }}
                    ></div>
                  </div>
                </div>

                {/* Recommendation Conversion Rate */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500 dark:text-slate-400">RO Recommendation Upsell</span>
                    <span className="font-bold font-mono">
                      {Math.round((appointments.filter(a => a.estimatedCost > 3500).length / Math.max(1, appointments.length)) * 100)}%
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-2">
                    <div 
                      className="bg-emerald-500 h-2 rounded-full transition-all duration-500" 
                      style={{ 
                        width: `${(appointments.filter(a => a.estimatedCost > 3500).length / Math.max(1, appointments.length)) * 100}%` 
                      }}
                    ></div>
                  </div>
                </div>

                {/* Lane capacity */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500 dark:text-slate-400">Dealership Lane Capacity</span>
                    <span className="font-bold font-mono">{activeROs.length * 20}%</span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-2">
                    <div 
                      className="bg-amber-500 h-2 rounded-full transition-all duration-500" 
                      style={{ width: `${activeROs.length * 20}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-4 border-t border-slate-200 dark:border-slate-800 text-xs text-slate-400 dark:text-slate-500 flex items-center justify-between">
              <span>Next Sync: In 1 min</span>
              <button 
                onClick={exportLedgerJSON}
                className="text-rose-500 font-semibold hover:underline flex items-center gap-0.5"
              >
                Export JSON <ChevronRight className="h-3 w-3" />
              </button>
            </div>
          </div>
        </div>
      )}

      {gmTab === 'mechanics' && (
        <div className="glass-card text-left space-y-6 animate-fade-in">
          <div>
            <h3 className="text-lg font-bold flex items-center gap-2">
              <Users className="h-5 w-5 text-rose-500" />
              Mechanic Capacity & Load Indicators
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Monitors mechanic utilization, current active assignments, and individual CSAT indicators.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {mechanics.map((mech) => {
              const activeJob = appointments.find(a => a.assignedMechanic === mech.name && !['Completed', 'Rejected', 'ready'].includes(a.status));
              const finishedJobs = appointments.filter(a => a.assignedMechanic === mech.name && a.status === 'Completed');
              
              return (
                <div key={mech.id} className="p-4 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="font-bold text-sm block">{mech.name}</span>
                      <span className="text-xs text-slate-400">{mech.workshopId === 'd1' ? 'Sector 63 Noida Hub' : 'Connaught Place'}</span>
                    </div>
                    {activeJob ? (
                      <span className="text-[10px] uppercase font-mono font-bold px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-500 border border-indigo-500/20">Active</span>
                    ) : (
                      <span className="text-[10px] uppercase font-mono font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">Available</span>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs border-t border-b border-slate-100 dark:border-slate-800 py-3 font-mono">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-mono block">Work Efficiency</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">95%</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-mono block">Finished Jobs</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">{finishedJobs.length}</span>
                    </div>
                  </div>

                  {activeJob ? (
                    <div className="text-xs p-2.5 bg-indigo-500/5 rounded-lg border border-indigo-500/10 space-y-1">
                      <span className="text-[10px] font-mono text-indigo-400 block uppercase font-bold">Assigned Active RO</span>
                      <span className="font-bold block text-slate-800 dark:text-slate-200">{activeJob.customerName}</span>
                      <span className="text-slate-400 text-[11px] block">{activeJob.vehicle} ({activeJob.service})</span>
                    </div>
                  ) : (
                    <div className="text-xs p-2.5 bg-emerald-500/5 rounded-lg border border-emerald-500/10 text-emerald-600 text-center font-semibold">
                      Idle — Ready for next Job Card
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {gmTab === 'ledger' && (
        <div className="glass-card text-left space-y-6 animate-fade-in">
          <div className="flex justify-between items-start flex-wrap gap-4">
            <div>
              <h3 className="text-lg font-bold flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-rose-500" />
                Global Transaction Compliance Ledger
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Tamper-resistant audit trails showing state transitions, authorized actors, and SHA-256 seals.
              </p>
            </div>
            
            <button
              onClick={exportLedgerJSON}
              className="btn-primary py-2 px-3 text-xs font-bold flex items-center gap-1.5"
            >
              <FileSpreadsheet className="h-4 w-4" /> Export Ledger JSON
            </button>
          </div>

          <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-slate-50/50 dark:bg-slate-800/10 divide-y divide-slate-200 dark:divide-slate-800">
            {appointments.flatMap(app => (app.auditTrail || []).map(log => ({ ...log, roId: app.id, vehicle: app.vehicle, customerName: app.customerName })))
              .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
              .map((log, idx) => (
                <div key={idx} className="p-4 flex flex-col sm:flex-row justify-between items-start gap-4 text-xs">
                  <div className="space-y-1 text-left">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono font-bold text-[10px] text-slate-400 uppercase">{log.roId}</span>
                      <span className="h-1.5 w-1.5 rounded-full bg-slate-300 dark:bg-slate-700"></span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">{log.action}</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded font-bold font-mono bg-rose-500/10 text-rose-500 border border-rose-500/20">{log.actor}</span>
                    </div>
                    <p className="text-slate-500 dark:text-slate-400 text-[11px] leading-relaxed">{log.details}</p>
                    <span className="text-[10px] text-slate-400 block font-semibold">Subject: {log.customerName} ({log.vehicle})</span>
                  </div>

                  <div className="text-right shrink-0 space-y-1">
                    <span className="text-slate-400 font-mono block">{new Date(log.timestamp).toLocaleString()}</span>
                    <span className="inline-block text-[9px] font-mono px-1.5 py-0.5 rounded bg-white dark:bg-[#0b0f19] border border-slate-200 dark:border-slate-800 text-rose-500 max-w-[150px] truncate" title={log.hash}>
                      {log.hash}
                    </span>
                  </div>
                </div>
              ))}

            {appointments.length === 0 && (
              <div className="py-12 text-center text-slate-400 text-xs">
                No ledger transaction logs recorded yet in the database.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
