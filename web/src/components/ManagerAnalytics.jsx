import React from 'react';
import { 
  TrendingUp, 
  IndianRupee, 
  Users, 
  Wrench, 
  Star, 
  BarChart3, 
  Activity, 
  ChevronRight,
  TrendingDown
} from 'lucide-react';

export default function ManagerAnalytics({ appointments }) {
  // Calculations
  const completedROs = appointments.filter(a => a.status === 'ready');
  const activeROs = appointments.filter(a => a.status !== 'scheduled' && a.status !== 'ready');
  
  // Total Revenue (including approved recommendations)
  const totalRevenue = appointments.reduce((acc, curr) => acc + curr.estimatedCost, 0);
  
  // Average Repair Order Value
  const avgROValue = appointments.length > 0 
    ? Math.round(totalRevenue / appointments.length) 
    : 0;

  // CSAT Score
  const csatScore = 4.8;
  const techEfficiency = 92;

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
          <span className="text-2xl font-bold font-mono mt-1 block">₹{totalRevenue}</span>
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
          <span className="text-2xl font-bold font-mono mt-1 block">₹{avgROValue}</span>
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

      {/* Main Charts & List Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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
                    <td className="py-3">
                      <span className="font-semibold block">{app.customerName}</span>
                      <span className="text-xs text-slate-400 dark:text-slate-500">{app.vehicle}</span>
                    </td>
                    <td className="py-3">
                      <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-mono uppercase font-bold ${
                        app.status === 'scheduled' ? 'bg-slate-100 text-slate-600 dark:bg-slate-800' :
                        app.status === 'checked_in' ? 'bg-blue-100 text-blue-600 dark:bg-blue-950/20' :
                        app.status === 'inspecting' ? 'bg-amber-100 text-amber-600 dark:bg-amber-950/20' :
                        app.status === 'in_progress' ? 'bg-indigo-100 text-indigo-600 dark:bg-indigo-950/20' :
                        'bg-emerald-100 text-emerald-600 dark:bg-emerald-950/20'
                      }`}>
                        {app.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-3 text-xs text-slate-500 dark:text-slate-400">
                      {app.service}
                    </td>
                    <td className="py-3 text-right font-mono font-bold text-rose-500">
                      ₹{app.estimatedCost}
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
            <button className="text-rose-500 font-semibold hover:underline flex items-center gap-0.5">
              Export CSV <ChevronRight className="h-3 w-3" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
