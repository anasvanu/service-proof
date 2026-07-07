import React, { useState, useEffect } from 'react';
import { 
  Wrench, 
  ClipboardList, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Camera, 
  PlusCircle, 
  QrCode,
  AlertCircle
} from 'lucide-react';

export default function TechnicianWorkbench({ 
  appointments, 
  onSubmitInspection, 
  onCompleteRepairs,
  onStartInspection,
  onStartRepairs
}) {
  const activeROs = appointments.filter(a => a.status !== 'Requested' && a.status !== 'Completed' && a.status !== 'Rejected');
  const [selectedRoId, setSelectedRoId] = useState(activeROs[0]?.id || '');

  // Auto-sync selected RO when activeROs list changes
  useEffect(() => {
    if (activeROs.length > 0) {
      const exists = activeROs.some(ro => ro.id === selectedRoId);
      if (!selectedRoId || !exists) {
        setSelectedRoId(activeROs[0].id);
      }
    } else if (selectedRoId !== '') {
      setSelectedRoId('');
    }
  }, [activeROs, selectedRoId]);
  
  // Active Appointment
  const app = appointments.find(a => a.id === selectedRoId);

  // Inspection Checklist State
  const [brakingSystem, setBrakingSystem] = useState('green');
  const [brakingComment, setBrakingComment] = useState('Brakes are in excellent condition.');
  
  const [batteryHealth, setBatteryHealth] = useState('green');
  const [batteryComment, setBatteryComment] = useState('Battery charge is at 94%.');
  
  const [tireTread, setTireTread] = useState('green');
  const [tireComment, setTireComment] = useState('Treads are at 7/32", safe for all conditions.');

  const [engineFluids, setEngineFluids] = useState('green');
  const [engineComment, setEngineComment] = useState('All fluids topped off and clean.');

  // Mandatory Inspection Photo Proofs
  const [brakingPhoto, setBrakingPhoto] = useState('');
  const [batteryPhoto, setBatteryPhoto] = useState('');
  const [tirePhoto, setTirePhoto] = useState('');
  const [enginePhoto, setEnginePhoto] = useState('');

  // Signature
  const [techSign, setTechSign] = useState('');

  // Barcode Scan simulation
  const [oilBarcode, setOilBarcode] = useState('SKU-992019-HELIX');
  const [scanStatus, setScanStatus] = useState('scanned');

  // GoMechanic standard items list
  const [standardTasks, setStandardTasks] = useState({
    carScanning: false,
    batteryWater: false,
    wiperFluid: false,
    engineOil: false,
    frontBrakePads: false,
    oilFilter: false,
    fuelFilter: false,
    sparkPlug: false,
    brakeFluid: false,
    acFilter: false,
    airFilter: false,
    carWash: false,
    interiorVacuum: false
  });

  // Recommendations state
  const [recService, setRecService] = useState('');
  const [recDetails, setRecDetails] = useState('');
  const [recCost, setRecCost] = useState('');
  const [recProof, setRecProof] = useState(''); // Selected preset
  const [recCategory, setRecCategory] = useState('repair'); // 'oem' | 'repair' | 'vas'
  const [addedRecs, setAddedRecs] = useState([]);

  // Preset proof images corresponding to problems
  const proofPresets = [
    { label: "Worn Brake Pads", url: "https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&w=400&q=80" },
    { label: "Corroded Battery Terminals", url: "https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?auto=format&fit=crop&w=400&q=80" },
    { label: "Balding Tire Tread", url: "https://images.unsplash.com/photo-1191010313-0ea10c4f1cfa?auto=format&fit=crop&w=400&q=80" },
    { label: "Oil Leakage underneath", url: "https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?auto=format&fit=crop&w=400&q=80" }
  ];

  const handleAddRecommendation = (e) => {
    e.preventDefault();
    if (!recService || !recCost) return;
    
    const proofUrl = proofPresets.find(p => p.label === recProof)?.url || '';
    const lat = (28.627 + (Math.random() - 0.5) * 0.005).toFixed(5);
    const lng = (77.378 + (Math.random() - 0.5) * 0.005).toFixed(5);
    const seal = "sha256-" + Math.random().toString(36).substring(2, 10) + Math.random().toString(36).substring(2, 10);

    const newRec = {
      id: Date.now().toString(),
      service: recService,
      details: recDetails,
      cost: parseFloat(recCost),
      proofUrl: proofUrl,
      status: 'pending',
      category: recCategory,
      executionProof: "",
      lat: lat,
      lng: lng,
      seal: seal,
      timestamp: new Date().toISOString()
    };
    
    setAddedRecs([...addedRecs, newRec]);
    setRecService('');
    setRecDetails('');
    setRecCost('');
    setRecProof('');
    setRecCategory('repair');
  };

  const handleSubmitInspectionReport = () => {
    if (!selectedRoId) return;
    if (!techSign) {
      alert("Please provide technician digital signature sign-off.");
      return;
    }
    if (!brakingPhoto || !batteryPhoto || !tirePhoto || !enginePhoto) {
      alert("Please upload photographic evidence for all 4 inspection checkpoints to verify transparency.");
      return;
    }
    onSubmitInspection(selectedRoId, {
      brakingSystem: { status: brakingSystem, comment: brakingComment, type: 'repair', proofUrl: brakingPhoto },
      batteryHealth: { status: batteryHealth, comment: batteryComment, type: 'oem', proofUrl: batteryPhoto },
      tireTread: { status: tireTread, comment: tireComment, type: 'repair', proofUrl: tirePhoto },
      engineFluids: { status: engineFluids, comment: engineComment, type: 'oem', proofUrl: enginePhoto }
    }, addedRecs, techSign);
    setAddedRecs([]);
    setBrakingPhoto('');
    setBatteryPhoto('');
    setTirePhoto('');
    setEnginePhoto('');
  };

  return (
    <div className="animate-fade-in space-y-6">
      {/* Header and Vehicle Selector */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <span className="text-xs uppercase tracking-widest font-mono text-rose-500">Service Lane</span>
          <h1 className="text-2xl font-bold mt-1">Technician Workbench</h1>
        </div>
        
        {activeROs.length > 0 && (
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-slate-400">Select Vehicle:</span>
            <select 
              value={selectedRoId}
              onChange={(e) => {
                setSelectedRoId(e.target.value);
                setAddedRecs([]);
              }}
              className="px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-bold focus:outline-none"
            >
              {activeROs.map(ro => (
                <option key={ro.id} value={ro.id}>{ro.vehicle} ({ro.customerName})</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {app ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* MPI Form Panel */}
          <div className="lg:col-span-2 space-y-6">
            {/* Job Card Details Panel */}
            <div className="glass-card grid grid-cols-2 sm:grid-cols-4 gap-4 text-left">
              <div>
                <span className="text-[10px] uppercase font-mono tracking-wider font-bold text-slate-400 block">Check-in Odometer</span>
                <span className="font-bold text-sm text-slate-800 dark:text-slate-200">{app.odometer || '18,420 km'}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-mono tracking-wider font-bold text-slate-400 block">Fuel Level Status</span>
                <span className="font-bold text-sm text-slate-800 dark:text-slate-200">{app.fuelLevel || '55%'}</span>
              </div>
              <div className="col-span-2">
                <span className="text-[10px] uppercase font-mono tracking-wider font-bold text-slate-400 block">Advisor Comments / Complaints</span>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{app.advisorComments || 'No complaints registered.'}</p>
              </div>
            </div>

            <div className="glass-card">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold flex items-center gap-2">
                  <ClipboardList className="h-5 w-5 text-rose-500" />
                  Multi-Point Inspection Sheet
                </h3>
                
                {app.status === 'Accepted' && (
                  <button 
                    onClick={() => onStartInspection(app.id)}
                    className="btn-primary py-2 px-4 text-xs font-bold"
                  >
                    Start Inspection Diagnostics
                  </button>
                )}
              </div>

              {app.status === 'Accepted' ? (
                <div className="text-center py-10 text-slate-400">
                  <ClipboardList className="h-10 w-10 text-rose-500 mx-auto mb-3" />
                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">Awaiting Diagnostics</p>
                  <p className="text-xs mt-1 text-slate-500 mb-4">Click below to start active vehicle diagnostics in the bay.</p>
                  <button 
                    type="button"
                    onClick={() => onStartInspection(app.id)}
                    className="btn-primary py-2 px-4 text-xs font-bold mx-auto flex items-center gap-1.5"
                  >
                    <Play className="h-4 w-4" /> Start Inspection Diagnostics
                  </button>
                </div>
              ) : (
                /* Status checklist rows */
                <div className="space-y-6">
                  {/* 1. Braking System */}
                  <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700/60 space-y-3">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                      <h4 className="font-bold text-sm text-slate-800 dark:text-slate-250">1. Braking System & Pads</h4>
                      <div className="flex bg-slate-200 dark:bg-slate-750 p-0.5 rounded-lg text-[10px] font-bold">
                        <button 
                          type="button"
                          onClick={() => { setBrakingSystem('green'); setBrakingComment('Brakes are in excellent condition.'); }}
                          className={`px-3 py-1 rounded-md transition-colors ${
                            brakingSystem === 'green' ? 'bg-emerald-500 text-white' : 'text-slate-500 dark:text-slate-400'
                          }`}
                        >
                          Green (Safe)
                        </button>
                        <button 
                          type="button"
                          onClick={() => { setBrakingSystem('yellow'); setBrakingComment('Pads are at 4/32". Monitor soon.'); }}
                          className={`px-3 py-1 rounded-md transition-colors ${
                            brakingSystem === 'yellow' ? 'bg-yellow-500 text-white' : 'text-slate-500 dark:text-slate-400'
                          }`}
                        >
                          Yellow (Caution)
                        </button>
                        <button 
                          type="button"
                          onClick={() => { setBrakingSystem('red'); setBrakingComment('Pads are at 2/32". Replace immediately.'); }}
                          className={`px-3 py-1 rounded-md transition-colors ${
                            brakingSystem === 'red' ? 'bg-red-500 text-white' : 'text-slate-500 dark:text-slate-400'
                          }`}
                        >
                          Red (Urgent)
                        </button>
                      </div>
                    </div>
                    <input 
                      type="text" 
                      value={brakingComment}
                      onChange={(e) => setBrakingComment(e.target.value)}
                      className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-semibold focus:outline-none text-slate-800 dark:text-slate-100"
                    />
                    <div className="flex items-center gap-3 mt-2">
                      <span className="text-[10px] uppercase font-mono font-bold text-slate-400">Photo Proof (Mandatory):</span>
                      {brakingPhoto ? (
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-emerald-500 font-semibold">✓ Attached</span>
                          <button type="button" onClick={() => setBrakingPhoto('')} className="text-red-500 font-bold text-xs">Remove</button>
                        </div>
                      ) : (
                        <button 
                          type="button" 
                          onClick={() => setBrakingPhoto('https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&w=400&q=80')}
                          className="py-1 px-3 bg-rose-500/10 text-rose-500 hover:bg-rose-500/25 border border-rose-500/20 rounded text-[11px] font-bold transition-all"
                        >
                          Attach Brake Photo
                        </button>
                      )}
                    </div>
                  </div>

                  {/* 2. Battery Health */}
                  <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700/60 space-y-3">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                      <h4 className="font-bold text-sm text-slate-800 dark:text-slate-250">2. Battery & Charging Health</h4>
                      <div className="flex bg-slate-200 dark:bg-slate-750 p-0.5 rounded-lg text-[10px] font-bold">
                        <button 
                          type="button"
                          onClick={() => { setBatteryHealth('green'); setBatteryComment('Battery charge is at 94%.'); }}
                          className={`px-3 py-1 rounded-md transition-colors ${
                            batteryHealth === 'green' ? 'bg-emerald-500 text-white' : 'text-slate-500 dark:text-slate-400'
                          }`}
                        >
                          Green (Safe)
                        </button>
                        <button 
                          type="button"
                          onClick={() => { setBatteryHealth('yellow'); setBatteryComment('Voltage slightly low. Charging recommended.'); }}
                          className={`px-3 py-1 rounded-md transition-colors ${
                            batteryHealth === 'yellow' ? 'bg-yellow-500 text-white' : 'text-slate-500 dark:text-slate-400'
                          }`}
                        >
                          Yellow (Caution)
                        </button>
                        <button 
                          type="button"
                          onClick={() => { setBatteryHealth('red'); setBatteryComment('Battery test failed. Needs replacement.'); }}
                          className={`px-3 py-1 rounded-md transition-colors ${
                            batteryHealth === 'red' ? 'bg-red-500 text-white' : 'text-slate-500 dark:text-slate-400'
                          }`}
                        >
                          Red (Urgent)
                        </button>
                      </div>
                    </div>
                    <input 
                      type="text" 
                      value={batteryComment}
                      onChange={(e) => setBatteryComment(e.target.value)}
                      className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-semibold focus:outline-none text-slate-800 dark:text-slate-100"
                    />
                    <div className="flex items-center gap-3 mt-2">
                      <span className="text-[10px] uppercase font-mono font-bold text-slate-400">Photo Proof (Mandatory):</span>
                      {batteryPhoto ? (
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-emerald-500 font-semibold">✓ Attached</span>
                          <button type="button" onClick={() => setBatteryPhoto('')} className="text-red-500 font-bold text-xs">Remove</button>
                        </div>
                      ) : (
                        <button 
                          type="button" 
                          onClick={() => setBatteryPhoto('https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?auto=format&fit=crop&w=400&q=80')}
                          className="py-1 px-3 bg-rose-500/10 text-rose-500 hover:bg-rose-500/25 border border-rose-500/20 rounded text-[11px] font-bold transition-all"
                        >
                          Attach Battery Photo
                        </button>
                      )}
                    </div>
                  </div>

                  {/* 3. Tire Condition */}
                  <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700/60 space-y-3">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                      <h4 className="font-bold text-sm text-slate-800 dark:text-slate-250">3. Tire Tread & Alignment</h4>
                      <div className="flex bg-slate-200 dark:bg-slate-750 p-0.5 rounded-lg text-[10px] font-bold">
                        <button 
                          type="button"
                          onClick={() => { setTireTread('green'); setTireComment('Treads are at 7/32", safe for all conditions.'); }}
                          className={`px-3 py-1 rounded-md transition-colors ${
                            tireTread === 'green' ? 'bg-emerald-500 text-white' : 'text-slate-500 dark:text-slate-400'
                          }`}
                        >
                          Green (Safe)
                        </button>
                        <button 
                          type="button"
                          onClick={() => { setTireTread('yellow'); setTireComment('Inner tread wearing down. Alignment needed.'); }}
                          className={`px-3 py-1 rounded-md transition-colors ${
                            tireTread === 'yellow' ? 'bg-yellow-500 text-white' : 'text-slate-500 dark:text-slate-400'
                          }`}
                        >
                          Yellow (Caution)
                        </button>
                        <button 
                          type="button"
                          onClick={() => { setTireTread('red'); setTireComment('Treads are at 2/32". Dangerous balding.'); }}
                          className={`px-3 py-1 rounded-md transition-colors ${
                            tireTread === 'red' ? 'bg-red-500 text-white' : 'text-slate-500 dark:text-slate-400'
                          }`}
                        >
                          Red (Urgent)
                        </button>
                      </div>
                    </div>
                    <input 
                      type="text" 
                      value={tireComment}
                      onChange={(e) => setTireComment(e.target.value)}
                      className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-semibold focus:outline-none text-slate-850 dark:text-slate-100"
                    />
                    <div className="flex items-center gap-3 mt-2">
                      <span className="text-[10px] uppercase font-mono font-bold text-slate-400">Photo Proof (Mandatory):</span>
                      {tirePhoto ? (
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-emerald-500 font-semibold">✓ Attached</span>
                          <button type="button" onClick={() => setTirePhoto('')} className="text-red-500 font-bold text-xs">Remove</button>
                        </div>
                      ) : (
                        <button 
                          type="button" 
                          onClick={() => setTirePhoto('https://images.unsplash.com/photo-1191010313-0ea10c4f1cfa?auto=format&fit=crop&w=400&q=80')}
                          className="py-1 px-3 bg-rose-500/10 text-rose-500 hover:bg-rose-500/25 border border-rose-500/20 rounded text-[11px] font-bold transition-all"
                        >
                          Attach Tire Photo
                        </button>
                      )}
                    </div>
                  </div>

                  {/* 4. Engine Fluids */}
                  <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700/60 space-y-3">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                      <h4 className="font-bold text-sm text-slate-800 dark:text-slate-250">4. Fluids & Leak Diagnostics</h4>
                      <div className="flex bg-slate-200 dark:bg-slate-750 p-0.5 rounded-lg text-[10px] font-bold">
                        <button 
                          type="button"
                          onClick={() => { setEngineFluids('green'); setEngineComment('All fluids topped off and clean.'); }}
                          className={`px-3 py-1 rounded-md transition-colors ${
                            engineFluids === 'green' ? 'bg-emerald-500 text-white' : 'text-slate-500 dark:text-slate-400'
                          }`}
                        >
                          Green (Safe)
                        </button>
                        <button 
                          type="button"
                          onClick={() => { setEngineFluids('yellow'); setEngineComment('Brake fluid starting to darken.'); }}
                          className={`px-3 py-1 rounded-md transition-colors ${
                            engineFluids === 'yellow' ? 'bg-yellow-500 text-white' : 'text-slate-500 dark:text-slate-400'
                          }`}
                        >
                          Yellow (Caution)
                        </button>
                        <button 
                          type="button"
                          onClick={() => { setEngineFluids('red'); setEngineComment('Coolant fluid leak detected near radiator.'); }}
                          className={`px-3 py-1 rounded-md transition-colors ${
                            engineFluids === 'red' ? 'bg-red-500 text-white' : 'text-slate-500 dark:text-slate-400'
                          }`}
                        >
                          Red (Urgent)
                        </button>
                      </div>
                    </div>
                    <input 
                      type="text" 
                      value={engineComment}
                      onChange={(e) => setEngineComment(e.target.value)}
                      className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-semibold focus:outline-none text-slate-850 dark:text-slate-100"
                    />
                    <div className="flex items-center gap-3 mt-2">
                      <span className="text-[10px] uppercase font-mono font-bold text-slate-400">Photo Proof (Mandatory):</span>
                      {enginePhoto ? (
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-emerald-500 font-semibold">✓ Attached</span>
                          <button type="button" onClick={() => setEnginePhoto('')} className="text-red-500 font-bold text-xs">Remove</button>
                        </div>
                      ) : (
                        <button 
                          type="button" 
                          onClick={() => setEnginePhoto('https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?auto=format&fit=crop&w=400&q=80')}
                          className="py-1 px-3 bg-rose-500/10 text-rose-500 hover:bg-rose-500/25 border border-rose-500/20 rounded text-[11px] font-bold transition-all"
                        >
                          Attach Fluid Photo
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Digital Barcode Evidence capture */}
              {(app.status === 'inspecting' || app.status === 'Estimate Pending') && (
                <div className="mt-6 p-4 border border-slate-200 dark:border-slate-800 rounded-xl space-y-4 text-left">
                  <h4 className="font-bold text-sm flex items-center gap-1.5">
                    <QrCode className="h-5 w-5 text-rose-500" />
                    Consumable Barcode Verification (Level 1 Proof)
                  </h4>
                  
                  <div className="flex gap-3 items-center">
                    <input 
                      type="text" 
                      value={oilBarcode} 
                      onChange={e => setOilBarcode(e.target.value)}
                      className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-2 rounded text-xs font-mono w-48 text-slate-850 dark:text-slate-100"
                    />
                    <button 
                      type="button"
                      onClick={() => setScanStatus('scanned')}
                      className="btn-secondary py-1.5 px-3 text-xs"
                    >
                      Scan Barcode
                    </button>
                    {scanStatus === 'scanned' && (
                      <span className="text-xs text-emerald-500 font-bold flex items-center gap-1">
                        <CheckCircle2 className="h-4 w-4" /> Scanned & Linked
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Signature sign-off */}
              {(app.status === 'inspecting' || app.status === 'Estimate Pending') && (
                <div className="mt-6 p-4 border border-slate-200 dark:border-slate-800 rounded-xl space-y-3 text-left">
                  <label className="block text-xs uppercase tracking-wider font-mono font-bold text-slate-400">
                    Technician Digital Signature
                  </label>
                  <input 
                    type="text" 
                    placeholder="Type 'Tech #402' or your name to sign off"
                    value={techSign}
                    onChange={(e) => setTechSign(e.target.value)}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
                  />
                </div>
              )}

              {/* Submit inspection banner */}
              {(app.status === 'inspecting' || app.status === 'Estimate Pending') && (
                <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-800 flex justify-end">
                  <button 
                    type="button"
                    onClick={handleSubmitInspectionReport}
                    className="btn-primary"
                  >
                    Send Inspection & Recommendations
                  </button>
                </div>
              )}
            </div>

            {/* Approved - Start repairs action */}
            {app.status === 'Approved' && (
              <div className="glass-card bg-rose-500/5 border-rose-500/10 text-slate-800 dark:text-slate-200">
                <h3 className="text-lg font-bold mb-2 flex items-center gap-2">
                  <Wrench className="h-5 w-5 text-rose-500 animate-bounce" />
                  Repairs Authorized by Customer
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
                  Sarah Jenkins has authorized the estimate using digital signature. Click below to begin physical repair operations.
                </p>
                <button 
                  type="button"
                  onClick={() => onStartRepairs(app.id)}
                  className="py-3 px-6 bg-rose-500 hover:bg-rose-600 text-white font-bold rounded-lg transition-all text-sm flex items-center gap-2"
                >
                  <Play className="h-4 w-4" /> Start Active Repairs
                </button>
              </div>
            )}

            {/* Repair Order Complete Action */}
            {app.status === 'In Progress' && (() => {
              const STANDARD_ITEMS = [
                { key: 'carScanning', label: 'Car scanning' },
                { key: 'batteryWater', label: 'Battery water top up' },
                { key: 'wiperFluid', label: 'Wiper fluid replacement' },
                { key: 'engineOil', label: 'Engine oil replacement' },
                { key: 'frontBrakePads', label: 'Front brake pads serviced' },
                { key: 'oilFilter', label: 'Oil filter replacement' },
                { key: 'fuelFilter', label: 'Fuel filter checking' },
                { key: 'sparkPlug', label: 'Spark plug checking' },
                { key: 'brakeFluid', label: 'Brake fluid top up' },
                { key: 'acFilter', label: 'AC filter cleaning' },
                { key: 'airFilter', label: 'Air filter replacement' },
                { key: 'carWash', label: 'Car wash' },
                { key: 'interiorVacuum', label: 'Interior vacuuming carpets and seats' }
              ];
              const completedCount = Object.values(standardTasks).filter(Boolean).length;

              return (
                <div className="glass-card bg-emerald-500/5 border-emerald-500/10 text-slate-800 dark:text-slate-200 text-left space-y-4">
                  <h3 className="text-lg font-bold flex items-center gap-2 text-slate-800 dark:text-slate-100">
                    <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                    Perform Standard Service Checkpoints
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Check off all GoMechanic Standard Service items as they are finished in the bay. This builds live proof evidence for the customer.
                  </p>

                  <div className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-800">
                    <span className="text-[10px] uppercase font-mono font-bold text-slate-450 block mb-1">Standard Checklist Progress</span>
                    <div className="w-full bg-slate-200 dark:bg-slate-850 rounded-full h-2 mb-1">
                      <div className="bg-emerald-500 h-2 rounded-full transition-all duration-300" style={{ width: `${(completedCount / STANDARD_ITEMS.length) * 100}%` }}></div>
                    </div>
                    <span className="text-[10px] font-mono text-slate-400">{completedCount} of {STANDARD_ITEMS.length} completed</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    {STANDARD_ITEMS.map((item) => (
                      <label key={item.key} className="flex items-center gap-2 p-2.5 bg-white dark:bg-[#0b0f19] border border-slate-150 dark:border-slate-800 rounded-lg cursor-pointer hover:border-emerald-500 transition-all select-none">
                        <input 
                          type="checkbox" 
                          checked={standardTasks[item.key] || false}
                          onChange={(e) => setStandardTasks({ ...standardTasks, [item.key]: e.target.checked })}
                          className="rounded text-emerald-500 focus:ring-emerald-500 h-3.5 w-3.5"
                        />
                        <span className={`${standardTasks[item.key] ? 'line-through text-slate-400 font-normal' : 'font-semibold text-slate-700 dark:text-slate-200'}`}>
                          {item.label}
                        </span>
                      </label>
                    ))}
                  </div>

                  <div className="pt-2">
                    <button 
                      type="button"
                      onClick={() => onCompleteRepairs(app.id)}
                      className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-lg transition-all text-xs flex items-center justify-center gap-2 uppercase tracking-wider"
                    >
                      <Wrench className="h-4 w-4" /> Mark Repairs Completed (Ready)
                    </button>
                  </div>
                </div>
              );
            })()}
          </div>

          {/* Add Additional Repair Recommendation with Proof */}
          <div className="space-y-6">
            <div className="glass-card">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <PlusCircle className="h-5 w-5 text-rose-500" />
                Add Recommendation
              </h3>
              
              <form onSubmit={handleAddRecommendation} className="space-y-4 text-left">
                <div>
                  <label className="block text-xs uppercase tracking-wider font-mono font-bold text-slate-400 mb-1">
                    Service Name
                  </label>
                  <input 
                    type="text" 
                    placeholder="e.g. Front Brake Pad Replacement"
                    value={recService}
                    onChange={(e) => setRecService(e.target.value)}
                    required
                    className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider font-mono font-bold text-slate-400 mb-1">
                    Details / Rationale
                  </label>
                  <textarea 
                    placeholder="Provide details on why this is recommended..."
                    value={recDetails}
                    onChange={(e) => setRecDetails(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs uppercase tracking-wider font-mono font-bold text-slate-400 mb-1">
                      Estimated Cost (₹)
                    </label>
                    <input 
                      type="number" 
                      placeholder="e.g. 299"
                      value={recCost}
                      onChange={(e) => setRecCost(e.target.value)}
                      required
                      className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs focus:outline-none"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-xs uppercase tracking-wider font-mono font-bold text-slate-400 mb-1">
                      Visual Proof Preset
                    </label>
                    <select 
                      value={recProof}
                      onChange={(e) => setRecProof(e.target.value)}
                      className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs focus:outline-none"
                    >
                      <option value="">No Proof Image</option>
                      {proofPresets.map((p, i) => (
                        <option key={i} value={p.label}>{p.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider font-mono font-bold text-slate-400 mb-1">
                    Recommendation Category
                  </label>
                  <select 
                    value={recCategory}
                    onChange={(e) => setRecCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs focus:outline-none"
                  >
                    <option value="repair">Wear & Tear Repair (Condition-based)</option>
                    <option value="vas">Value Added Service (VAS Upsell)</option>
                    <option value="oem">OEM Scheduled Maintenance (Fixed)</option>
                  </select>
                </div>

                <button 
                  type="submit" 
                  className="w-full btn-secondary py-2 justify-center text-xs font-bold"
                >
                  <PlusCircle className="h-3.5 w-3.5" /> Queue Recommendation
                </button>
              </form>

              {/* Added recommendations queue list */}
              {addedRecs.length > 0 && (
                <div className="mt-6 space-y-3">
                  <span className="block text-xs uppercase tracking-wider font-mono font-bold text-slate-400">
                    Recommendations Queue ({addedRecs.length})
                  </span>
                  
                  <div className="space-y-2">
                    {addedRecs.map((r, i) => (
                      <div key={i} className="flex justify-between items-center p-2 bg-slate-50 dark:bg-slate-800/40 rounded border border-slate-200 dark:border-slate-700 text-xs">
                        <div className="truncate pr-2">
                          <span className="font-bold block truncate">{r.service}</span>
                          <span className="text-[10px] uppercase text-rose-500 font-semibold">{r.category}</span>
                        </div>
                        <span className="font-mono font-bold text-rose-500">₹{r.cost}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="glass-card text-center max-w-xl mx-auto py-16">
          <AlertCircle className="h-12 w-12 text-slate-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">No Active Repairs / Inspections</h2>
          <p className="text-slate-500 dark:text-slate-400">
            There are currently no checked-in vehicles in the service lane. Once an advisor checks in an appointment, it will show up here.
          </p>
        </div>
      )}
    </div>
  );
}
