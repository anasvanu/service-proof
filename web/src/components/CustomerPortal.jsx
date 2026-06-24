import React, { useState, useEffect } from 'react';
import { jsPDF } from 'jspdf';
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
  QrCode,
  MapPin,
  Compass,
  User,
  History
} from 'lucide-react';

const INDIAN_VEHICLES = {
  "Maruti Suzuki": ["Swift", "Baleno", "Brezza", "Ertiga", "Dzire", "Alto", "WagonR"],
  "Mahindra": ["XUV700", "Scorpio-N", "Thar", "Bolero", "XUV300", "Scorpio Classic"],
  "Tata Motors": ["Nexon", "Punch", "Harrier", "Safari", "Altroz", "Tiago", "Tigor"],
  "Hyundai": ["Creta", "i20", "Venue", "Verna", "Alcazar", "Exter", "Tucson"],
  "Honda": ["City", "Amaze", "Elevate", "Civic"],
  "Toyota": ["Fortuner", "Innova Crysta", "Glanza", "Urban Cruiser Taisor", "Hilux", "Camry"]
};

const PILOT_DEALERS = [
  { id: "d1", name: "Maruti Suzuki Sector 63 Noida Hub", address: "H-224, Sector 63, Noida, UP", pincode: "201301", lat: 28.627, lng: 77.378 },
  { id: "d2", name: "Hyundai Care Sector 62 Noida Hub", address: "C-56, Sector 62, Noida, UP", pincode: "201309", lat: 28.622, lng: 77.364 },
  { id: "d3", name: "Mahindra Dealership Hub Delhi", address: "Okhla Industrial Area Phase III, New Delhi", pincode: "110020", lat: 28.538, lng: 77.271 },
  { id: "d4", name: "Tata Motors Gurugram Service Center", address: "IDC, Sector 14, Gurugram, Haryana", pincode: "122001", lat: 28.473, lng: 77.042 },
  { id: "d5", name: "Honda Care Connaught Place", address: "Connaught Place, Radial Road 4, New Delhi", pincode: "110001", lat: 28.630, lng: 77.220 }
];

const calculateDistance = (dealer, userLocation) => {
  if (userLocation.type === 'gps') {
    const dLat = (dealer.lat - userLocation.lat) * Math.PI / 180;
    const dLng = (dealer.lng - userLocation.lng) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(dealer.lat * Math.PI / 180) * Math.cos(userLocation.lat * Math.PI / 180) * 
              Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const d = 6371 * c; // Distance in km
    return parseFloat(d.toFixed(1));
  } else if (userLocation.type === 'pincode') {
    const p1 = parseInt(dealer.pincode);
    const p2 = parseInt(userLocation.pincode);
    if (isNaN(p2)) return 99.9;
    const diff = Math.abs(p1 - p2);
    if (diff === 0) return 0.5;
    if (diff < 10) return parseFloat((diff * 0.8 + 0.5).toFixed(1));
    if (diff < 1000) return parseFloat((diff * 0.1 + 1.2).toFixed(1));
    return parseFloat((diff * 0.005 + 2.5).toFixed(1));
  }
  return 99.9;
};

export default function CustomerPortal({ 
  appointment, 
  allCustomerAppointments = [],
  onSelectAppointment,
  onApproveRecommendation, 
  onDeclineRecommendation,
  onScheduleAppointment,
  profile,
  onSaveProfile
}) {
  const [activeTab, setActiveTab] = useState('status'); // 'status' | 'schedule' | 'history' | 'profile'
  const [selectedProofItem, setSelectedProofItem] = useState(null);

  // Profile Form State
  const [profileMake, setProfileMake] = useState(profile?.make || '');
  const [profileModel, setProfileModel] = useState(profile?.model || '');
  const [profileFuel, setProfileFuel] = useState(profile?.fuelType || '');
  const [profilePlate, setProfilePlate] = useState(profile?.licensePlate || '');

  // Booking Form State
  const [bookMake, setBookMake] = useState('');
  const [bookModel, setBookModel] = useState('');
  const [useProfileVehicle, setUseProfileVehicle] = useState(false);
  const [selectedService, setSelectedService] = useState('General Service');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  
  // Dealer Locator State
  const [pinCode, setPinCode] = useState('');
  const [userLocation, setUserLocation] = useState({ type: 'default' });
  const [selectedDealerId, setSelectedDealerId] = useState(PILOT_DEALERS[0].id);

  // Pickup Dropoff State
  const [pickupDropoff, setPickupDropoff] = useState(false);
  const [pickupAddress, setPickupAddress] = useState('');

  // Pre-fill profile state when profile prop updates
  useEffect(() => {
    if (profile) {
      setProfileMake(profile.make || '');
      setProfileModel(profile.model || '');
      setProfileFuel(profile.fuelType || '');
      setProfilePlate(profile.licensePlate || '');
      if (profile.make) {
        setUseProfileVehicle(true);
      }
    }
  }, [profile]);

  // Adjust model list when make selection changes
  useEffect(() => {
    const models = INDIAN_VEHICLES[profileMake] || [];
    if (!models.includes(profileModel)) {
      setProfileModel('');
    }
  }, [profileMake]);

  useEffect(() => {
    const models = INDIAN_VEHICLES[bookMake] || [];
    if (!models.includes(bookModel)) {
      setBookModel('');
    }
  }, [bookMake]);

  const handleProfileSubmit = (e) => {
    e.preventDefault();
    if (!profileMake || !profileModel || !profileFuel || !profilePlate) {
      alert("Please fill out all profile fields.");
      return;
    }
    onSaveProfile({
      make: profileMake,
      model: profileModel,
      fuelType: profileFuel,
      licensePlate: profilePlate
    });
    alert("Customer vehicle profile saved successfully!");
  };

  const handleGpsSearch = () => {
    setUserLocation({
      type: 'gps',
      lat: 28.625, // Mock Sector 62 Noida
      lng: 77.370
    });
  };

  const handlePincodeSearch = (e) => {
    e.preventDefault();
    if (pinCode.length >= 6) {
      setUserLocation({
        type: 'pincode',
        pincode: pinCode
      });
    } else {
      alert("Please enter a valid 6-digit PIN code.");
    }
  };

  const handleScheduleSubmit = (e) => {
    e.preventDefault();
    if (!selectedDate || !selectedTime) return;

    let finalVehicle = '';
    if (useProfileVehicle && profile?.make) {
      finalVehicle = `${profile.make} ${profile.model} (${profile.fuelType})`;
    } else {
      if (!bookMake || !bookModel) {
        alert("Please select vehicle Make and Model.");
        return;
      }
      finalVehicle = `${bookMake} ${bookModel}`;
    }

    const selectedDealer = PILOT_DEALERS.find(d => d.id === selectedDealerId);

    onScheduleAppointment({
      customerName: appointment ? appointment.customerName : (profile?.customerName || 'Sarah Jenkins'),
      vehicle: finalVehicle,
      service: selectedService,
      dealerName: selectedDealer ? selectedDealer.name : PILOT_DEALERS[0].name,
      pickupDropoff: pickupDropoff,
      pickupAddress: pickupDropoff ? pickupAddress : '',
      date: selectedDate,
      time: selectedTime
    });

    setBookMake('');
    setBookModel('');
    setPickupAddress('');
    setPickupDropoff(false);
    setActiveTab('status');
  };

  const generateInvoicePDF = (app) => {
    const doc = new jsPDF();
    
    // Header Branding
    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.setTextColor(225, 29, 72); // Rose-500
    doc.text("SERVICE PROOF", 20, 25);
    
    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139);
    doc.setFont("helvetica", "normal");
    doc.text("Verified Dealership Service Hub", 20, 31);
    doc.text("Tamper-Resistant Service Passport Stamp", 20, 36);
    
    // Line Divider
    doc.setDrawColor(226, 232, 240);
    doc.line(20, 42, 190, 42);
    
    // Service Details
    doc.setFontSize(11);
    doc.setTextColor(51, 65, 85);
    doc.setFont("helvetica", "bold");
    doc.text("SERVICE INVOICE", 20, 52);
    
    doc.setFont("helvetica", "normal");
    doc.text(`Invoice ID: INV-${app.id.toUpperCase()}`, 20, 58);
    doc.text(`Date: ${app.date}`, 20, 64);
    doc.text(`Status: Completed & QC Verified`, 20, 70);
    
    // Customer Info
    doc.setFont("helvetica", "bold");
    doc.text("CUSTOMER & VEHICLE DETAILS", 110, 52);
    doc.setFont("helvetica", "normal");
    doc.text(`Name: ${app.customerName}`, 110, 58);
    doc.text(`Vehicle: ${app.vehicle}`, 110, 64);
    
    // Retrieve plate and fuel details from app or saved profile
    const fuel = app.fuelType || (profile?.customerName === app.customerName && profile?.fuelType) || "N/A";
    const plate = app.licensePlate || (profile?.customerName === app.customerName && profile?.licensePlate) || "N/A";
    doc.text(`Fuel Type: ${fuel} | Plate: ${plate}`, 110, 70);
    
    const selectedDealer = app.dealerName || "Maruti Suzuki Sector 63 Noida Hub";
    doc.text(`Servicing Hub: ${selectedDealer}`, 20, 78);
    
    doc.line(20, 84, 190, 84);
    
    // Invoice Table Headers
    doc.setFont("helvetica", "bold");
    doc.text("Service Item / Repair Description", 20, 94);
    doc.text("Status", 130, 94);
    doc.text("Cost (INR)", 165, 94);
    doc.line(20, 98, 190, 98);
    
    doc.setFont("helvetica", "normal");
    let y = 106;
    
    // 1. Base Service Package
    doc.text(app.service, 20, y);
    doc.text("Completed", 130, y);
    const baseCost = app.service === 'General Service' ? 3500 : app.service === 'Specific Repair' ? 2000 : 3500;
    doc.text(`INR ${baseCost.toLocaleString()}`, 165, y);
    y += 10;
    
    // 2. Recommendations
    let approvedTotal = 0;
    const recs = app.recommendations || [];
    recs.forEach((rec) => {
      if (rec.status === 'approved') {
        doc.text(rec.service, 20, y);
        doc.text("Approved", 130, y);
        doc.text(`INR ${rec.cost.toLocaleString()}`, 165, y);
        approvedTotal += rec.cost;
        y += 10;
      }
    });
    
    doc.line(20, y - 4, 190, y - 4);
    
    const grandTotal = baseCost + approvedTotal;
    doc.setFont("helvetica", "bold");
    doc.text("GRAND TOTAL", 110, y + 4);
    doc.text(`INR ${grandTotal.toLocaleString()}`, 165, y + 4);
    
    y += 20;
    
    // Signatures
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("DEALERSHIP SIGNATURES", 20, y);
    
    doc.setFont("helvetica", "normal");
    doc.text(`Technician Signature: ${app.techSignature || 'Tech #402'}`, 20, y + 8);
    doc.text(`QC Inspector Signature: ${app.qcSignature || 'Signed Off'}`, 20, y + 14);
    
    doc.setFontSize(9);
    doc.setTextColor(148, 163, 184);
    doc.text(`Stamp Verification ID: SP-${app.id.toUpperCase()}`, 20, y + 26);
    doc.text("This invoice is protected by tamper-resistant digital audit logging.", 20, y + 31);
    
    doc.save(`Invoice-${app.id}.pdf`);
  };

  const steps = [
    { label: 'Received', key: 'scheduled' },
    { label: 'Checked In', key: 'checked_in' },
    { label: 'Inspecting', key: 'inspecting' },
    { label: 'Repairs Active', key: 'in_progress' },
    { label: 'QC Sign-off', key: 'qc_check' },
    { label: 'Ready', key: 'ready' }
  ];

  const getCurrentStepIndex = () => {
    if (!appointment) return 0;
    if (appointment.status === 'scheduled') return 0;
    if (appointment.status === 'checked_in') return 1;
    if (appointment.status === 'inspecting') return 2;
    if (appointment.status === 'in_progress') return 3;
    if (appointment.status === 'ready') return 5;
    return 4; 
  };

  // Group recommendations
  const recs = appointment?.recommendations || [];
  const pendingRecs = recs.filter(r => r.status === 'pending');
  const approvedRecs = recs.filter(r => r.status === 'approved');

  // Completed history list
  const completedAppointments = allCustomerAppointments.filter(a => a.status === 'ready');

  // Distance sorted dealers list
  const sortedDealers = [...PILOT_DEALERS].map(dealer => {
    const distance = calculateDistance(dealer, userLocation);
    return { ...dealer, distance };
  }).sort((a, b) => a.distance - b.distance);

  // Unpack models list
  const profileModels = INDIAN_VEHICLES[profileMake] || [];
  const bookModels = INDIAN_VEHICLES[bookMake] || [];

  // Static execution proofs
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
            <h1 className="text-2xl font-bold">
              {appointment ? `${appointment.customerName}'s Vehicle Portal` : `${profile?.customerName || 'Customer'}'s Vehicle Portal`}
            </h1>
            {allCustomerAppointments.length > 1 && (
              <select
                value={appointment?.id || ''}
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
        <div className="flex bg-slate-100 dark:bg-slate-800/50 p-1 rounded-lg border border-slate-200 dark:border-slate-700 overflow-x-auto max-w-full">
          <button 
            onClick={() => setActiveTab('status')}
            className={`px-4 py-2 text-sm font-semibold rounded-md transition-all whitespace-nowrap ${
              activeTab === 'status' ? 'bg-white dark:bg-slate-700 text-rose-500 shadow-sm' : 'text-slate-500 dark:text-slate-400'
            }`}
          >
            Track My Car
          </button>
          <button 
            onClick={() => setActiveTab('schedule')}
            className={`px-4 py-2 text-sm font-semibold rounded-md transition-all whitespace-nowrap ${
              activeTab === 'schedule' ? 'bg-white dark:bg-slate-700 text-rose-500 shadow-sm' : 'text-slate-500 dark:text-slate-400'
            }`}
          >
            Book Appointment
          </button>
          <button 
            onClick={() => setActiveTab('history')}
            className={`px-4 py-2 text-sm font-semibold rounded-md transition-all whitespace-nowrap ${
              activeTab === 'history' ? 'bg-white dark:bg-slate-700 text-rose-500 shadow-sm' : 'text-slate-500 dark:text-slate-400'
            }`}
          >
            History
          </button>
          <button 
            onClick={() => setActiveTab('profile')}
            className={`px-4 py-2 text-sm font-semibold rounded-md transition-all whitespace-nowrap ${
              activeTab === 'profile' ? 'bg-white dark:bg-slate-700 text-rose-500 shadow-sm' : 'text-slate-500 dark:text-slate-400'
            }`}
          >
            Profile
          </button>
        </div>
      </div>

      {/* 1. STATUS TAB */}
      {activeTab === 'status' && (
        !appointment ? (
          <div className="animate-fade-in p-12 glass-card text-center max-w-xl mx-auto mt-12">
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
        ) : (
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
                    <span className="text-xs text-slate-400 dark:text-slate-500 uppercase font-mono">Vehicle Name</span>
                    <h4 className="text-sm font-bold font-mono">{appointment.vehicle}</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Dealer: {appointment.dealerName || PILOT_DEALERS[0].name}</p>
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

            {/* Service Recommendations */}
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
        )
      )}

      {/* 2. SCHEDULE TAB */}
      {activeTab === 'schedule' && (
        <div className="glass-card max-w-xl mx-auto text-slate-800 dark:text-slate-200">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-rose-500">
            <Calendar className="h-5 w-5" />
            Book a Service Appointment
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
            Configure vehicle, select package, choose proximity dealer, and book your service.
          </p>

          <form onSubmit={handleScheduleSubmit} className="space-y-6 text-left">
            
            {/* Vehicle Model Selector */}
            <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700/60 space-y-4">
              <h3 className="font-bold text-sm flex items-center gap-1.5 text-slate-800 dark:text-slate-100">
                <Wrench className="h-4 w-4 text-rose-500" /> Vehicle Information
              </h3>
              
              {profile?.make && (
                <div className="flex items-center gap-2.5 pb-2 border-b border-slate-200 dark:border-slate-700">
                  <input
                    type="checkbox"
                    id="useProfileCheck"
                    checked={useProfileVehicle}
                    onChange={(e) => setUseProfileVehicle(e.target.checked)}
                    className="w-4 h-4 text-rose-500 focus:ring-rose-500 rounded cursor-pointer"
                  />
                  <label htmlFor="useProfileCheck" className="text-xs font-semibold cursor-pointer text-slate-700 dark:text-slate-300">
                    Use saved profile vehicle: <span className="text-rose-500 font-mono">{profile.make} {profile.model} ({profile.fuelType})</span>
                  </label>
                </div>
              )}

              {(!useProfileVehicle || !profile?.make) && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-fade-in">
                  <div>
                    <label className="block text-xs uppercase tracking-wider font-mono font-bold text-slate-400 mb-1.5">
                      Select Make
                    </label>
                    <select 
                      value={bookMake}
                      onChange={(e) => setBookMake(e.target.value)}
                      required={!useProfileVehicle}
                      className="w-full px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none text-slate-800 dark:text-slate-100"
                    >
                      <option value="">-- Choose Make --</option>
                      {Object.keys(INDIAN_VEHICLES).map(make => (
                        <option key={make} value={make}>{make}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs uppercase tracking-wider font-mono font-bold text-slate-400 mb-1.5">
                      Select Model
                    </label>
                    <select 
                      value={bookModel}
                      onChange={(e) => setBookModel(e.target.value)}
                      required={!useProfileVehicle}
                      disabled={!bookMake}
                      className="w-full px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none disabled:opacity-50 text-slate-800 dark:text-slate-100"
                    >
                      <option value="">-- Choose Model --</option>
                      {bookModels.map(model => (
                        <option key={model} value={model}>{model}</option>
                      ))}
                    </select>
                  </div>
                </div>
              )}
            </div>

            {/* Service Package Selector */}
            <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700/60 space-y-3">
              <label className="block text-xs uppercase tracking-wider font-mono font-bold text-slate-400 mb-1.5">
                Service Package
              </label>
              <select 
                value={selectedService}
                onChange={(e) => setSelectedService(e.target.value)}
                className="w-full px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none text-slate-800 dark:text-slate-100"
              >
                <option value="General Service">General Service Package</option>
                <option value="Specific Repair">Specific Repair Diagnostic</option>
              </select>
            </div>

            {/* Dealer Locator */}
            <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700/60 space-y-4">
              <h3 className="font-bold text-sm flex items-center gap-1.5 text-slate-800 dark:text-slate-100">
                <MapPin className="h-4 w-4 text-rose-500" /> Dealer Locator
              </h3>
              
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1 flex gap-2">
                  <input 
                    type="text" 
                    placeholder="Enter 6-digit PIN (e.g. 201301)"
                    value={pinCode}
                    maxLength={6}
                    onChange={e => setPinCode(e.target.value.replace(/\D/g, ''))}
                    className="flex-1 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none"
                  />
                  <button 
                    type="button"
                    onClick={handlePincodeSearch}
                    className="btn-secondary py-2 px-3 text-xs whitespace-nowrap"
                  >
                    Search PIN
                  </button>
                </div>
                <button 
                  type="button"
                  onClick={handleGpsSearch}
                  className="btn-secondary py-2 px-3 text-xs flex items-center gap-1 justify-center whitespace-nowrap"
                >
                  <Compass className="h-3.5 w-3.5" /> Use GPS
                </button>
              </div>

              <div>
                <span className="block text-xs uppercase tracking-wider font-mono font-bold text-slate-400 mb-1.5">
                  Select Workshop ({userLocation.type !== 'default' ? 'Sorted by Proximity' : 'Default List'})
                </span>
                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {sortedDealers.map(dealer => (
                    <div 
                      key={dealer.id}
                      onClick={() => setSelectedDealerId(dealer.id)}
                      className={`p-3 rounded-xl border transition-all cursor-pointer flex justify-between items-center ${
                        selectedDealerId === dealer.id
                          ? 'border-rose-500 bg-rose-500/5 dark:bg-rose-500/10'
                          : 'border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800/40'
                      }`}
                    >
                      <div>
                        <span className="font-bold text-xs block text-slate-800 dark:text-slate-200">{dealer.name}</span>
                        <span className="text-[10px] text-slate-400 dark:text-slate-500">{dealer.address}</span>
                      </div>
                      {userLocation.type !== 'default' && (
                        <span className="text-xs font-mono font-bold text-rose-500 pl-2 whitespace-nowrap">
                          {dealer.distance} km
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Pick-up and Drop-off option */}
            <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700/60 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200">Pick-up & Drop-off Service</h4>
                  <p className="text-xs text-slate-400">Convenient vehicle pick-up and drop-off at your location.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setPickupDropoff(!pickupDropoff)}
                  className={`w-12 h-6 rounded-full p-0.5 transition-colors relative focus:outline-none ${
                    pickupDropoff ? 'bg-rose-500' : 'bg-slate-300 dark:bg-slate-700'
                  }`}
                >
                  <div 
                    className={`bg-white w-5 h-5 rounded-full shadow transform transition-transform ${
                      pickupDropoff ? 'translate-x-6' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
              
              {pickupDropoff && (
                <div className="animate-fade-in text-left">
                  <label className="block text-xs uppercase tracking-wider font-mono font-bold text-slate-400 mb-1.5">
                    Pick-up & Drop-off Address
                  </label>
                  <textarea
                    rows={2}
                    value={pickupAddress}
                    onChange={(e) => setPickupAddress(e.target.value)}
                    placeholder="Enter complete address..."
                    required={pickupDropoff}
                    className="w-full px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none"
                  />
                </div>
              )}
            </div>

            {/* Date & Time Selectors */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs uppercase tracking-wider font-mono font-bold text-slate-400 mb-1.5">
                  Select Date
                </label>
                <input 
                  type="date" 
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  required
                  className="w-full px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none text-slate-800 dark:text-slate-100"
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
                  className="w-full px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none text-slate-800 dark:text-slate-100"
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
              className="w-full btn-primary justify-center mt-6 py-3 font-bold text-sm uppercase tracking-wider"
            >
              Confirm Appointment Booking
            </button>
          </form>
        </div>
      )}

      {/* 3. HISTORY TAB */}
      {activeTab === 'history' && (
        <div className="glass-card max-w-2xl mx-auto text-slate-800 dark:text-slate-200">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-rose-500">
            <History className="h-5 w-5" />
            Service History & Invoices
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
            View completed services for your vehicles and download tamper-resistant PDF invoices.
          </p>

          {completedAppointments.length > 0 ? (
            <div className="space-y-4">
              {completedAppointments.map(app => (
                <div 
                  key={app.id} 
                  className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-left"
                >
                  <div className="flex-1 space-y-1">
                    <span className="text-[9px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-500 border border-emerald-500/20">
                      Completed
                    </span>
                    <h4 className="font-bold text-sm pt-1 text-slate-800 dark:text-slate-200">{app.service}</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">{app.vehicle}</p>
                    <p className="text-xs text-slate-400 dark:text-slate-500">{app.dealerName || PILOT_DEALERS[0].name}</p>
                    
                    <div className="flex gap-4 mt-2 text-[10px] font-mono text-slate-400">
                      <span>Date: {app.date}</span>
                      <span>Total: ₹{app.estimatedCost.toLocaleString()}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => generateInvoicePDF(app)}
                    className="btn-primary py-2 px-4 text-xs font-bold flex items-center gap-1.5 whitespace-nowrap self-stretch sm:self-center justify-center"
                  >
                    <FileText className="h-4 w-4" /> Download PDF Invoice
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-slate-400">
              <FileText className="h-10 w-10 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">No Completed Services</p>
              <p className="text-xs mt-1 text-slate-500">There are no completed repair orders registered in your passport history yet.</p>
            </div>
          )}
        </div>
      )}

      {/* 4. PROFILE TAB */}
      {activeTab === 'profile' && (
        <div className="glass-card max-w-xl mx-auto text-slate-800 dark:text-slate-200">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-rose-500">
            <User className="h-5 w-5" />
            Customer & Vehicle Profile
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
            Register your vehicle details here to pre-populate booking parameters and link stamps.
          </p>

          <form onSubmit={handleProfileSubmit} className="space-y-4 text-left">
            <div>
              <label className="block text-xs uppercase tracking-wider font-mono font-bold text-slate-400 mb-1.5">
                Vehicle Brand / Make
              </label>
              <select 
                value={profileMake}
                onChange={(e) => setProfileMake(e.target.value)}
                required
                className="w-full px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none text-slate-800 dark:text-slate-100"
              >
                <option value="">-- Choose Make --</option>
                {Object.keys(INDIAN_VEHICLES).map(make => (
                  <option key={make} value={make}>{make}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider font-mono font-bold text-slate-400 mb-1.5">
                Vehicle Model
              </label>
              <select 
                value={profileModel}
                onChange={(e) => setProfileModel(e.target.value)}
                required
                disabled={!profileMake}
                className="w-full px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none disabled:opacity-50 text-slate-800 dark:text-slate-100"
              >
                <option value="">-- Choose Model --</option>
                {profileModels.map(model => (
                  <option key={model} value={model}>{model}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider font-mono font-bold text-slate-400 mb-1.5">
                Fuel Type
              </label>
              <select 
                value={profileFuel}
                onChange={(e) => setProfileFuel(e.target.value)}
                required
                className="w-full px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none text-slate-800 dark:text-slate-100"
              >
                <option value="">-- Select Fuel --</option>
                <option value="Petrol">Petrol</option>
                <option value="Diesel">Diesel</option>
                <option value="CNG">CNG</option>
                <option value="EV">EV (Electric Vehicle)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider font-mono font-bold text-slate-400 mb-1.5">
                License Plate Number
              </label>
              <input 
                type="text" 
                placeholder="e.g. MH-12-AB-1234 or DL-3C-CK-5678"
                value={profilePlate}
                onChange={(e) => setProfilePlate(e.target.value.toUpperCase())}
                required
                className="w-full px-4 py-2 bg-white dark:bg-[#0b0f19] border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none font-mono"
              />
            </div>

            <button 
              type="submit" 
              className="w-full btn-primary justify-center mt-6"
            >
              Save Profile Details
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
