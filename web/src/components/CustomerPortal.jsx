import React, { useState, useEffect, useRef } from 'react';
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
  History,
  Trash2,
  Edit3,
  Plus,
  Bell
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
  onSaveProfile,
  currentUser,
  setCurrentUser,
  notifications = [],
  onAuthorizeRepairs
}) {
  const [activeTab, setActiveTab] = useState('status'); // 'status' | 'schedule' | 'history' | 'profile'
  const [selectedProofItem, setSelectedProofItem] = useState(null);
  const [showNotifications, setShowNotifications] = useState(false);

  // Estimate approval states
  const [localRecStatuses, setLocalRecStatuses] = useState({});
  const [customerSignature, setCustomerSignature] = useState('');

  // Sync recommendation local state
  useEffect(() => {
    if (appointment?.recommendations) {
      const initial = {};
      appointment.recommendations.forEach(r => {
        initial[r.id] = r.status || 'pending';
      });
      setLocalRecStatuses(initial);
    }
  }, [appointment]);

  // Profile fleet state
  const [vehicles, setVehicles] = useState(profile?.vehicles || []);
  const [editingVehicleId, setEditingVehicleId] = useState(null);

  // Profile Form State
  const [profileMake, setProfileMake] = useState('');
  const [profileModel, setProfileModel] = useState('');
  const [profileFuel, setProfileFuel] = useState('Petrol');
  const [profilePlate, setProfilePlate] = useState('');

  // Booking Form State
  const [useProfileVehicle, setUseProfileVehicle] = useState(false);
  const [selectedBookVehId, setSelectedBookVehId] = useState('');
  
  // Manual booking vehicle states (if useProfileVehicle is false)
  const [bookMake, setBookMake] = useState('');
  const [bookModel, setBookModel] = useState('');
  const [bookFuel, setBookFuel] = useState('Petrol');
  const [bookPlate, setBookPlate] = useState('');

  const [selectedService, setSelectedService] = useState('General Service');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  
  // Dealer Locator State
  const [pinCode, setPinCode] = useState('');
  const [userLocation, setUserLocation] = useState({ type: 'default' });
  const [selectedDealerId, setSelectedDealerId] = useState(PILOT_DEALERS[0].id);

  // Map state
  const [mapReady, setMapReady] = useState(false);
  const mapRef = useRef(null);
  const leafletMapInstance = useRef(null);
  const markersGroupRef = useRef(null);

  // Pickup Dropoff State
  const [pickupDropoff, setPickupDropoff] = useState(false);
  const [pickupAddress, setPickupAddress] = useState('');
  const [expandedAuditLogRoId, setExpandedAuditLogRoId] = useState('');

  // Sync profile vehicle list
  useEffect(() => {
    if (profile?.vehicles) {
      setVehicles(profile.vehicles);
    }
  }, [profile]);

  // Set default selected vehicle on booking form
  useEffect(() => {
    if (vehicles.length > 0) {
      const defaultVeh = vehicles.find(v => v.isDefault) || vehicles[0];
      setSelectedBookVehId(defaultVeh.id);
      setUseProfileVehicle(true);
    } else {
      setSelectedBookVehId('manual');
      setUseProfileVehicle(false);
    }
  }, [vehicles]);

  // Adjust model list when make selection changes (profile)
  useEffect(() => {
    const models = INDIAN_VEHICLES[profileMake] || [];
    if (!models.includes(profileModel)) {
      setProfileModel('');
    }
  }, [profileMake]);

  // Adjust model list when make selection changes (booking manual)
  useEffect(() => {
    const models = INDIAN_VEHICLES[bookMake] || [];
    if (!models.includes(bookModel)) {
      setBookModel('');
    }
  }, [bookMake]);

  // Load Leaflet dynamically via CDN
  useEffect(() => {
    if (!document.getElementById('leaflet-css')) {
      const link = document.createElement('link');
      link.id = 'leaflet-css';
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);
    }

    if (!window.L) {
      const script = document.createElement('script');
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      script.async = true;
      script.onload = () => {
        setMapReady(true);
      };
      document.body.appendChild(script);
    } else {
      setMapReady(true);
    }
  }, []);

  // Cleanup Leaflet Map when scheduling tab closes
  useEffect(() => {
    return () => {
      if (leafletMapInstance.current) {
        leafletMapInstance.current.remove();
        leafletMapInstance.current = null;
        markersGroupRef.current = null;
      }
    };
  }, [activeTab]);

  // Draw Leaflet map markers and polyline
  useEffect(() => {
    if (!mapReady || !mapRef.current || activeTab !== 'schedule') return;

    if (!leafletMapInstance.current) {
      leafletMapInstance.current = window.L.map(mapRef.current).setView([28.6139, 77.2090], 10);
      window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap'
      }).addTo(leafletMapInstance.current);
      markersGroupRef.current = window.L.layerGroup().addTo(leafletMapInstance.current);
    }

    markersGroupRef.current.clearLayers();

    const selectedDealer = PILOT_DEALERS.find(d => d.id === selectedDealerId);
    if (!selectedDealer) return;

    // Dealer Custom Marker
    const dealerIcon = window.L.divIcon({
      className: 'custom-div-icon',
      html: `<div class="bg-rose-500 text-white p-2 rounded-full shadow-lg border border-white flex items-center justify-center w-8 h-8"><svg xmlns="http://www.w3.org/2000/svg" class="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg></div>`,
      iconSize: [32, 32],
      iconAnchor: [16, 32]
    });

    const dealerMarker = window.L.marker([selectedDealer.lat, selectedDealer.lng], { icon: dealerIcon })
      .bindPopup(`<b>${selectedDealer.name}</b><br/>${selectedDealer.address}`)
      .addTo(markersGroupRef.current);

    let bounds = [[selectedDealer.lat, selectedDealer.lng]];

    if (userLocation.type === 'gps' && userLocation.lat) {
      const userIcon = window.L.divIcon({
        className: 'custom-div-icon',
        html: `<div class="bg-blue-500 text-white p-1.5 rounded-full shadow-lg border border-white flex items-center justify-center w-6 h-6 animate-pulse"><div class="h-2.5 w-2.5 bg-white rounded-full"></div></div>`,
        iconSize: [24, 24],
        iconAnchor: [12, 12]
      });

      window.L.marker([userLocation.lat, userLocation.lng], { icon: userIcon })
        .bindPopup("<b>Your GPS Location</b>")
        .addTo(markersGroupRef.current);

      bounds.push([userLocation.lat, userLocation.lng]);

      // Draw route connecting line
      window.L.polyline([[userLocation.lat, userLocation.lng], [selectedDealer.lat, selectedDealer.lng]], {
        color: '#e11d48',
        weight: 3,
        dashArray: '6, 12'
      }).addTo(markersGroupRef.current);
    }

    if (bounds.length > 1) {
      leafletMapInstance.current.fitBounds(bounds, { padding: [50, 50] });
    } else {
      leafletMapInstance.current.setView([selectedDealer.lat, selectedDealer.lng], 13);
    }

    dealerMarker.openPopup();
  }, [mapReady, selectedDealerId, userLocation, activeTab]);

  // Profile CRUD Actions
  const handleProfileSubmit = (e) => {
    e.preventDefault();
    if (!profileMake || !profileModel || !profileFuel || !profilePlate) {
      alert("Please fill out all vehicle profile fields.");
      return;
    }

    let updatedVehicles = [];
    if (editingVehicleId) {
      updatedVehicles = vehicles.map(v => {
        if (v.id === editingVehicleId) {
          return {
            ...v,
            make: profileMake,
            model: profileModel,
            fuelType: profileFuel,
            licensePlate: profilePlate
          };
        }
        return v;
      });
      setEditingVehicleId(null);
    } else {
      const newVeh = {
        id: `veh-${Date.now()}`,
        make: profileMake,
        model: profileModel,
        fuelType: profileFuel,
        licensePlate: profilePlate,
        isDefault: vehicles.length === 0
      };
      updatedVehicles = [...vehicles, newVeh];
    }

    onSaveProfile(updatedVehicles);
    
    // Reset Form fields
    setProfileMake('');
    setProfileModel('');
    setProfileFuel('Petrol');
    setProfilePlate('');
  };

  const handleEditVehicle = (veh) => {
    setEditingVehicleId(veh.id);
    setProfileMake(veh.make);
    setProfileModel(veh.model);
    setProfileFuel(veh.fuelType);
    setProfilePlate(veh.licensePlate);
  };

  const handleDeleteVehicle = (id) => {
    if (window.confirm("Are you sure you want to remove this vehicle from your profile?")) {
      const updatedVehicles = vehicles.filter(v => v.id !== id);
      if (vehicles.find(v => v.id === id)?.isDefault && updatedVehicles.length > 0) {
        updatedVehicles[0].isDefault = true;
      }
      onSaveProfile(updatedVehicles);
      if (editingVehicleId === id) {
        setEditingVehicleId(null);
        setProfileMake('');
        setProfileModel('');
        setProfileFuel('Petrol');
        setProfilePlate('');
      }
    }
  };

  const handleSetDefaultVehicle = (id) => {
    const updatedVehicles = vehicles.map(v => ({
      ...v,
      isDefault: v.id === id
    }));
    onSaveProfile(updatedVehicles);
  };

  // Location Proximity Action
  const handleGpsSearch = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          type: 'gps',
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
      },
      (error) => {
        console.error("GPS retrieval error:", error);
        alert("GPS permission denied or unavailable. Falling back to Noida mock center.");
        setUserLocation({
          type: 'gps',
          lat: 28.625,
          lng: 77.370
        });
      },
      { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
    );
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
    let finalFuel = '';
    let finalPlate = '';

    if (useProfileVehicle && selectedBookVehId !== 'manual') {
      const activeVeh = vehicles.find(v => v.id === selectedBookVehId);
      if (activeVeh) {
        finalVehicle = `${activeVeh.make} ${activeVeh.model}`;
        finalFuel = activeVeh.fuelType;
        finalPlate = activeVeh.licensePlate;
      }
    } else {
      if (!bookMake || !bookModel || !bookPlate) {
        alert("Please select manual vehicle Make, Model, and License Plate.");
        return;
      }
      finalVehicle = `${bookMake} ${bookModel}`;
      finalFuel = bookFuel;
      finalPlate = bookPlate;
    }

    const selectedDealer = PILOT_DEALERS.find(d => d.id === selectedDealerId);

    onScheduleAppointment({
      customerName: appointment ? appointment.customerName : (profile?.customerName || 'Sarah Jenkins'),
      vehicle: `${finalVehicle} (${finalFuel})`,
      fuelType: finalFuel,
      licensePlate: finalPlate,
      service: selectedService,
      dealerName: selectedDealer ? selectedDealer.name : PILOT_DEALERS[0].name,
      pickupDropoff: pickupDropoff,
      pickupAddress: pickupDropoff ? pickupAddress : '',
      date: selectedDate,
      time: selectedTime
    });

    setBookMake('');
    setBookModel('');
    setBookPlate('');
    setPickupAddress('');
    setPickupDropoff(false);
    setActiveTab('status');
  };

  const generateInvoicePDF = (app) => {
    const doc = new jsPDF();
    
    // Header Branding
    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.setTextColor(225, 29, 72); 
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
    
    // Plate & Fuel info
    const fuel = app.fuelType || "N/A";
    const plate = app.licensePlate || "N/A";
    doc.text(`Fuel Type: ${fuel} | Plate: ${plate}`, 110, 70);
    
    const selectedDealer = app.dealerName || "Maruti Suzuki Sector 63 Noida Hub";
    const dealerInfo = PILOT_DEALERS.find(d => d.name === selectedDealer) || PILOT_DEALERS[0];
    doc.text(`Servicing Hub: ${selectedDealer}`, 20, 78);
    doc.text(`Address: ${dealerInfo.address}`, 20, 84);
    
    doc.line(20, 90, 190, 90);
    
    // Invoice Table Headers
    doc.setFont("helvetica", "bold");
    doc.text("Service Item / Repair Description", 20, 100);
    doc.text("Status", 130, 100);
    doc.text("Cost (INR)", 165, 100);
    doc.line(20, 104, 190, 104);
    
    doc.setFont("helvetica", "normal");
    let y = 112;
    
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
    { label: 'Requested', key: 'Requested' },
    { label: 'Accepted', key: 'Accepted' },
    { label: 'Estimate Pending', key: 'Estimate Pending' },
    { label: 'In Progress', key: 'In Progress' },
    { label: 'QC Sign-off', key: 'qc_check' },
    { label: 'Completed', key: 'Completed' }
  ];

  const getCurrentStepIndex = () => {
    if (!appointment) return 0;
    const stat = appointment.status;
    if (stat === 'Requested') return 0;
    if (stat === 'Accepted') return 1;
    if (stat === 'Estimate Pending') return 2;
    if (stat === 'In Progress' || stat === 'Approved') return 3;
    if (stat === 'qc_check') return 4;
    if (stat === 'Completed' || stat === 'ready') return 5;
    return 0;
  };

  // Group recommendations
  const activeRecs = appointment?.recommendations || [];
  const pendingRecs = activeRecs.filter(r => r.status === 'pending');

  // Completed history list
  const completedAppointments = allCustomerAppointments.filter(a => a.status === 'Completed');

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
        <div className="flex items-center gap-3">
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
              History & Compliance
            </button>
            <button 
              onClick={() => setActiveTab('profile')}
              className={`px-4 py-2 text-sm font-semibold rounded-md transition-all whitespace-nowrap ${
                activeTab === 'profile' ? 'bg-white dark:bg-slate-700 text-rose-500 shadow-sm' : 'text-slate-500 dark:text-slate-400'
              }`}
            >
              Profile ({vehicles.length})
            </button>
          </div>

          {/* Notifications Drawer */}
          <div className="relative shrink-0">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2.5 bg-slate-100 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 relative transition-colors"
            >
              <Bell className="h-4.5 w-4.5" />
              {notifications.filter(n => n.recipient === (appointment?.customerName || profile?.customerName) && !n.read).length > 0 && (
                <span className="absolute top-1.5 right-1.5 h-2 w-2 bg-rose-500 rounded-full border-1 border-white dark:border-[#0d1322] animate-pulse"></span>
              )}
            </button>

            {/* Notifications Dropdown Panel */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-[#0d1322] border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl z-50 p-4 space-y-3 text-left">
                <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-2">
                  <span className="font-bold text-xs uppercase tracking-wider font-mono text-slate-400">Live Service Notifications</span>
                  <button 
                    onClick={() => setShowNotifications(false)}
                    className="text-[10px] text-rose-500 hover:underline font-semibold"
                  >
                    Close
                  </button>
                </div>
                <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
                  {notifications.filter(n => n.recipient === (appointment?.customerName || profile?.customerName)).length > 0 ? (
                    notifications.filter(n => n.recipient === (appointment?.customerName || profile?.customerName)).map((notif, idx) => (
                      <div key={idx} className="p-2.5 bg-slate-50 dark:bg-slate-800/40 rounded-lg border border-slate-100 dark:border-slate-800 space-y-1 text-xs">
                        <span className="font-bold text-slate-800 dark:text-slate-200 block">{notif.title}</span>
                        <p className="text-slate-500 dark:text-slate-400 text-[11px] leading-relaxed">{notif.message}</p>
                        <span className="text-[9px] text-slate-400 font-mono block pt-0.5">{new Date(notif.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-6 text-slate-400 text-xs">
                      No notifications available
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
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
                    {appointment.licensePlate && (
                      <p className="text-xs text-slate-400 dark:text-slate-500 font-mono mt-0.5">Plate No: {appointment.licensePlate}</p>
                    )}
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
              <div className="glass-card text-left">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <ShieldAlert className="h-5 w-5 text-rose-500" />
                  Service Recommendations & Approvals
                </h3>

                {appointment.status === 'Estimate Pending' ? (
                  <>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
                      Our certified technician recommends the following maintenance items. Review the proof, choose to Approve/Decline, and provide your digital signature to authorize repairs.
                    </p>

                    {activeRecs.length > 0 ? (
                      <div className="space-y-4">
                        {activeRecs.map((rec) => {
                          const currentStatus = localRecStatuses[rec.id] || 'pending';
                          return (
                            <div key={rec.id} className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3">
                              <div className="flex justify-between items-start flex-wrap gap-2">
                                <div>
                                  <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200">{rec.service}</h4>
                                  <span className={`inline-block text-[9px] font-mono uppercase px-2 py-0.5 rounded mt-1.5 ${
                                    rec.category === 'vas' ? 'bg-amber-100 dark:bg-amber-950/40 text-amber-600' :
                                    rec.category === 'oem' ? 'bg-blue-100 dark:bg-blue-950/40 text-blue-600' :
                                    'bg-red-100 dark:bg-red-950/40 text-rose-600'
                                  }`}>
                                    {rec.category === 'vas' ? 'Optional Upsell (VAS)' : 
                                     rec.category === 'oem' ? 'Fixed OEM Schedule' : 'Wear & Tear Repair'}
                                  </span>
                                </div>
                                <span className="font-bold text-sm text-rose-500 font-mono">₹{rec.cost.toLocaleString('en-IN')}</span>
                              </div>

                              {rec.proofUrl && (
                                <div className="space-y-1">
                                  <div className="relative rounded-lg overflow-hidden group border border-slate-200 dark:border-slate-800">
                                    <img 
                                      src={rec.proofUrl} 
                                      alt="Visual Proof" 
                                      className="w-full h-32 object-cover"
                                    />
                                  </div>
                                  <div className="flex justify-between items-center text-[9px] font-mono text-slate-400 px-1">
                                    <span>Geo-tag: {rec.lat}, {rec.lng}</span>
                                    <span>Seal: {rec.seal ? rec.seal.substring(0, 15) : 'N/A'}...</span>
                                  </div>
                                </div>
                              )}

                              <p className="text-xs text-slate-500 dark:text-slate-400">{rec.details}</p>

                              <div className="flex gap-2 pt-1">
                                <button 
                                  type="button"
                                  onClick={() => setLocalRecStatuses(prev => ({ ...prev, [rec.id]: 'approved' }))}
                                  className={`flex-1 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                                    currentStatus === 'approved' 
                                      ? 'bg-emerald-500 text-white shadow-sm' 
                                      : 'bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700/80'
                                  }`}
                                >
                                  <ThumbsUp className="h-3.5 w-3.5" /> Approve
                                </button>
                                <button 
                                  type="button"
                                  onClick={() => setLocalRecStatuses(prev => ({ ...prev, [rec.id]: 'declined' }))}
                                  className={`flex-1 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                                    currentStatus === 'declined' 
                                      ? 'bg-rose-500 text-white shadow-sm' 
                                      : 'bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700/80'
                                  }`}
                                >
                                  <ThumbsDown className="h-3.5 w-3.5" /> Decline
                                </button>
                              </div>
                            </div>
                          );
                        })}

                        {/* Signature Authorization Block */}
                        <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-4">
                          <div>
                            <label className="block text-xs uppercase tracking-wider font-mono font-bold text-slate-400 mb-1.5">
                              Customer Digital Signature
                            </label>
                            <input 
                              type="text" 
                              placeholder="Type your full name to authorize"
                              value={customerSignature}
                              onChange={e => setCustomerSignature(e.target.value)}
                              className="w-full px-3 py-2.5 bg-white dark:bg-[#0b0f19] border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-800 dark:text-slate-100"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              if (!customerSignature) {
                                alert("Please enter your signature to authorize the estimate.");
                                return;
                              }
                              const updatedRecs = appointment.recommendations.map(r => ({
                                ...r,
                                status: localRecStatuses[r.id] || 'pending'
                              }));
                              onAuthorizeRepairs(appointment.id, customerSignature, updatedRecs);
                            }}
                            className="w-full btn-primary py-3 justify-center text-xs font-bold uppercase tracking-wider"
                          >
                            Submit Approvals & Authorize Repairs
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-12 text-slate-400">
                        <CheckCircle2 className="h-10 w-10 text-emerald-500 mx-auto mb-3" />
                        <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">No Pending Approvals</p>
                        <p className="text-xs mt-1">There are no recommended items currently registered.</p>
                      </div>
                    )}
                  </>
                ) : (
                  // Display Read-only authorized list
                  <div className="space-y-4">
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">
                      Estimate authorization contract details:
                    </p>
                    
                    {activeRecs.length > 0 ? (
                      <div className="space-y-3">
                        {activeRecs.map((rec) => (
                          <div key={rec.id} className="p-3 bg-slate-50 dark:bg-slate-800/20 border border-slate-200 dark:border-slate-800 rounded-xl flex justify-between items-center text-xs">
                            <div className="text-left">
                              <span className="font-bold block">{rec.service}</span>
                              <span className="text-[10px] text-slate-400 block mt-0.5 capitalize">Category: {rec.category}</span>
                            </div>
                            <div className="text-right">
                              <span className="font-bold block text-rose-500 font-mono">₹{rec.cost}</span>
                              <span className={`inline-block text-[9px] font-bold mt-1 px-2 py-0.5 rounded font-mono ${
                                rec.status === 'approved' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                              }`}>
                                {rec.status === 'approved' ? 'Approved' : 'Declined'}
                              </span>
                            </div>
                          </div>
                        ))}

                        <div className="p-3 bg-slate-50 dark:bg-slate-800/10 rounded-xl border border-slate-150 dark:border-slate-800 text-xs text-left space-y-1">
                          <span className="text-[10px] text-slate-400 uppercase font-mono block">Customer Digital Signature</span>
                          <span className="font-bold text-slate-800 dark:text-slate-200 block">{appointment.customerSignature || 'Sarah Jenkins'}</span>
                          <span className="text-[9px] text-slate-400 block font-mono">Verified Authenticity Status: Signed & Authorized</span>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-6 text-slate-400 text-xs">
                        No additional recommendations were made for this service.
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )
      )}

      {/* 2. SCHEDULE TAB */}
      {activeTab === 'schedule' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-left">
          {/* Booking Inputs */}
          <div className="lg:col-span-2 space-y-6">
            <div className="glass-card text-slate-800 dark:text-slate-200">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-rose-500">
                <Calendar className="h-5 w-5" />
                Book a Service Appointment
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
                Configure vehicle, select package, choose proximity dealer, and book your service.
              </p>

              <form onSubmit={handleScheduleSubmit} className="space-y-6">
                
                {/* Vehicle Selection */}
                <div className="p-4 bg-slate-50/50 dark:bg-slate-800/20 rounded-xl border border-slate-200 dark:border-slate-800 space-y-4">
                  <h3 className="font-bold text-sm flex items-center gap-1.5 text-slate-800 dark:text-slate-100">
                    <Wrench className="h-4 w-4 text-rose-500" /> Vehicle Choice
                  </h3>
                  
                  {vehicles.length > 0 && (
                    <div className="space-y-2">
                      <label className="block text-xs uppercase tracking-wider font-mono font-bold text-slate-400">
                        Choose Saved Vehicle
                      </label>
                      <select
                        value={selectedBookVehId}
                        onChange={(e) => {
                          const val = e.target.value;
                          setSelectedBookVehId(val);
                          setUseProfileVehicle(val !== 'manual');
                        }}
                        className="w-full px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none text-slate-800 dark:text-slate-100"
                      >
                        {vehicles.map(v => (
                          <option key={v.id} value={v.id}>
                            {v.make} {v.model} (${v.fuelType}) [${v.licensePlate}] ${v.isDefault ? '(Default)' : ''}
                          </option>
                        ))}
                        <option value="manual">-- Book for a Different Vehicle --</option>
                      </select>
                    </div>
                  )}

                  {(!useProfileVehicle || vehicles.length === 0) && (
                    <div className="space-y-4 animate-fade-in">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs uppercase tracking-wider font-mono font-bold text-slate-400 mb-1.5">
                            Fuel Type
                          </label>
                          <select 
                            value={bookFuel}
                            onChange={(e) => setBookFuel(e.target.value)}
                            required={!useProfileVehicle}
                            className="w-full px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none text-slate-800 dark:text-slate-100"
                          >
                            <option value="Petrol">Petrol</option>
                            <option value="Diesel">Diesel</option>
                            <option value="CNG">CNG</option>
                            <option value="EV">EV</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs uppercase tracking-wider font-mono font-bold text-slate-400 mb-1.5">
                            License Plate
                          </label>
                          <input 
                            type="text" 
                            placeholder="e.g. MH-12-AB-1234"
                            value={bookPlate}
                            onChange={e => setBookPlate(e.target.value.toUpperCase())}
                            required={!useProfileVehicle}
                            className="w-full px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none text-slate-800 dark:text-slate-100 font-mono"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Service Package Selector */}
                <div className="p-4 bg-slate-50/50 dark:bg-slate-800/20 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3">
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
                <div className="p-4 bg-slate-50/50 dark:bg-slate-800/20 rounded-xl border border-slate-200 dark:border-slate-800 space-y-4">
                  <h3 className="font-bold text-sm flex items-center gap-1.5 text-slate-800 dark:text-slate-100">
                    <MapPin className="h-4 w-4 text-rose-500" /> Dealer Selection
                  </h3>
                  
                  <div className="flex flex-col sm:flex-row gap-3">
                    <div className="flex-1 flex gap-2">
                      <input 
                        type="text" 
                        placeholder="Enter 6-digit PIN code"
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
                      <Compass className="h-3.5 w-3.5 animate-spin-slow" /> Use GPS
                    </button>
                  </div>

                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
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

                {/* Pick-up and Drop-off */}
                <div className="p-4 bg-slate-50/50 dark:bg-slate-800/20 rounded-xl border border-slate-200 dark:border-slate-800 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200">Pick-up & Drop-off</h4>
                      <p className="text-xs text-slate-400">Doorstep vehicle logistics managed by verified pilot dealer.</p>
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
                        Address
                      </label>
                      <textarea
                        rows={2}
                        value={pickupAddress}
                        onChange={(e) => setPickupAddress(e.target.value)}
                        placeholder="Type address for vehicle collection..."
                        required={pickupDropoff}
                        className="w-full px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none"
                      />
                    </div>
                  )}
                </div>

                {/* Date & Time */}
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
                  className="w-full btn-primary justify-center py-3.5 font-bold uppercase text-xs tracking-wider"
                >
                  Confirm Appointment Booking
                </button>
              </form>
            </div>
          </div>

          {/* Interactive Map Visualizer */}
          <div className="space-y-6">
            <div className="glass-card space-y-4">
              <h3 className="font-bold text-sm flex items-center gap-1.5 text-slate-800 dark:text-slate-100">
                <Compass className="h-4 w-4 text-rose-500" /> Proximity Map Visualizer
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Live interactive workshop navigation. Centers on your selected pilot dealer.
              </p>
              
              <div className="h-80 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden relative" style={{ zIndex: 1 }}>
                <div ref={mapRef} className="w-full h-full bg-slate-100 dark:bg-slate-900" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. HISTORY TAB */}
      {activeTab === 'history' && (
        <div className="glass-card max-w-2xl mx-auto text-slate-800 dark:text-slate-200">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-rose-500">
            <History className="h-5 w-5" />
            Service History & Compliance Passport
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
            View completed services, inspect verified cryptographic audit trails, and download PDF invoices.
          </p>

          {completedAppointments.length > 0 ? (
            <div className="space-y-4">
              {completedAppointments.map(app => {
                const isExpanded = expandedAuditLogRoId === app.id;
                return (
                  <div 
                    key={app.id} 
                    className="p-4 bg-slate-50/50 dark:bg-slate-800/20 rounded-xl border border-slate-200 dark:border-slate-800 space-y-4 text-left"
                  >
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      <div className="flex-1 space-y-1">
                        <span className="text-[9px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-500 border border-emerald-500/20">
                          Completed Service Passport
                        </span>
                        <h4 className="font-bold text-sm pt-1 text-slate-800 dark:text-slate-200">{app.service}</h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold">{app.vehicle}</p>
                        <p className="text-xs text-slate-400 dark:text-slate-500">{app.dealerName || PILOT_DEALERS[0].name}</p>
                        
                        <div className="flex gap-4 mt-2 text-[10px] font-mono text-slate-400">
                          <span>Date: {app.date}</span>
                          <span>Total: ₹{app.estimatedCost.toLocaleString()}</span>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                        <button
                          type="button"
                          onClick={() => setExpandedAuditLogRoId(isExpanded ? '' : app.id)}
                          className="btn-secondary py-2 px-3 text-xs font-semibold flex items-center gap-1.5"
                        >
                          <Award className="h-4 w-4 text-rose-500" />
                          {isExpanded ? 'Hide Ledger' : 'View Ledger'}
                        </button>
                        <button
                          type="button"
                          onClick={() => generateInvoicePDF(app)}
                          className="btn-primary py-2 px-3 text-xs font-bold flex items-center gap-1.5 whitespace-nowrap"
                        >
                          <FileText className="h-4 w-4" /> Download PDF
                        </button>
                      </div>
                    </div>

                    {/* Audit Ledger Trail */}
                    {isExpanded && (
                      <div className="animate-fade-in border-t border-slate-200 dark:border-slate-800 pt-4 mt-2 space-y-4">
                        <h5 className="text-xs uppercase tracking-wider font-mono font-bold text-slate-400">Tamper-Resistant Compliance Ledger</h5>
                        
                        <div className="grid grid-cols-2 gap-4 text-xs bg-white dark:bg-slate-900/40 p-3 rounded-lg border border-slate-150 dark:border-slate-800/80">
                          <div>
                            <span className="text-[10px] text-slate-400 font-mono block">Odometer Check-in</span>
                            <span className="font-semibold text-slate-800 dark:text-slate-200">{app.odometer || '12,000 km'}</span>
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-400 font-mono block">Fuel Level Status</span>
                            <span className="font-semibold text-slate-800 dark:text-slate-200">{app.fuelLevel || '50%'}</span>
                          </div>
                          <div className="col-span-2">
                            <span className="text-[10px] text-slate-400 font-mono block">Assigned Service Mechanic</span>
                            <span className="font-semibold text-slate-800 dark:text-slate-200">{app.assignedMechanic || 'Amit Kumar'}</span>
                          </div>
                        </div>

                        {/* Logs Pipeline */}
                        <div className="relative pl-4 border-l border-slate-200 dark:border-slate-800 space-y-4 ml-2">
                          {(app.auditTrail || [
                            { timestamp: app.date, action: "Booking Created", actor: "Customer", details: "Initial service request registered.", hash: "sha256-legacy-init" },
                            { timestamp: app.date, action: "QC Complete Sign-off", actor: "Advisor", details: "Quality check approved and ready.", hash: "sha256-legacy-complete" }
                          ]).map((log, idx) => (
                            <div key={idx} className="relative space-y-1">
                              {/* Dot indicator */}
                              <div className="absolute -left-[21px] top-1.5 h-2 w-2 rounded-full bg-rose-500 border border-white dark:border-[#0b0f19]"></div>
                              
                              <div className="flex justify-between items-start text-[11px] gap-2 flex-wrap sm:flex-nowrap">
                                <div className="text-left">
                                  <span className="font-bold text-slate-700 dark:text-slate-200">{log.action}</span>
                                  <span className="text-slate-400 font-normal"> by {log.actor}</span>
                                  <p className="text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">{log.details}</p>
                                </div>
                                <div className="text-right shrink-0">
                                  <span className="text-slate-400 font-mono block">{new Date(log.timestamp).toLocaleDateString()} {new Date(log.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                                  <span className="inline-block mt-1 text-[9px] font-mono px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-rose-500 max-w-[120px] truncate" title={log.hash}>
                                    {log.hash.substring(0, 15)}...
                                  </span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>

                        <div className="text-[10px] text-slate-400 dark:text-slate-500 font-mono flex items-center gap-1 bg-rose-500/5 p-2 rounded border border-rose-500/10">
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                          <span>Authenticity cryptographically verified using SHA-256 seal stamp passport SP-{app.id.toUpperCase()}.</span>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-left">
          {/* Active Fleet List */}
          <div className="lg:col-span-2 space-y-6">
            <div className="glass-card text-slate-800 dark:text-slate-200">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-rose-500">
                <Wrench className="h-5 w-5" /> Saved Vehicle Fleet (${vehicles.length})
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
                Register multiple vehicles to manage maintenance stamps, link service history passports, and speed up bookings.
              </p>

              {vehicles.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {vehicles.map(veh => (
                    <div 
                      key={veh.id}
                      className={`p-4 rounded-xl border relative transition-all flex flex-col justify-between h-40 ${
                        veh.isDefault 
                          ? 'border-rose-500 bg-rose-500/5 dark:bg-rose-500/10'
                          : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50/50 dark:hover:bg-slate-800/10'
                      }`}
                    >
                      <div>
                        <div className="flex justify-between items-start">
                          <span className="font-bold text-sm block text-slate-800 dark:text-slate-100">
                            {veh.make} {veh.model}
                          </span>
                          {veh.isDefault && (
                            <span className="text-[9px] font-bold font-mono bg-rose-500/10 text-rose-500 px-2 py-0.5 rounded border border-rose-500/20">
                              Default
                            </span>
                          )}
                        </div>
                        <span className="text-xs text-slate-500 dark:text-slate-400 block mt-1 font-mono">
                          Plate: {veh.licensePlate}
                        </span>
                        <span className="text-xs text-slate-400 block mt-0.5">
                          Fuel: {veh.fuelType}
                        </span>
                      </div>

                      <div className="flex gap-2 items-center justify-between border-t border-slate-200 dark:border-slate-800 pt-3 mt-3">
                        {!veh.isDefault ? (
                          <button
                            onClick={() => handleSetDefaultVehicle(veh.id)}
                            className="text-[10px] font-bold text-rose-500 hover:underline"
                          >
                            Set Default
                          </button>
                        ) : (
                          <span className="text-[10px] font-bold text-slate-400 font-mono">Active default</span>
                        )}

                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => handleEditVehicle(veh)}
                            title="Edit Vehicle Specs"
                            className="text-slate-400 hover:text-rose-500 transition-colors"
                          >
                            <Edit3 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteVehicle(veh.id)}
                            title="Delete Vehicle"
                            className="text-slate-400 hover:text-red-500 transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-slate-400 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
                  <User className="h-10 w-10 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">No Vehicles Registered</p>
                  <p className="text-xs mt-1 text-slate-500">Your fleet is empty. Use the builder on the right to register your first vehicle.</p>
                </div>
              )}
            </div>
          </div>

          {/* Add / Edit Form */}
          <div className="space-y-6">
            <div className="glass-card text-slate-800 dark:text-slate-200">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-rose-500">
                {editingVehicleId ? <Edit3 className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
                {editingVehicleId ? 'Modify Vehicle' : 'Register Vehicle'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
                {editingVehicleId ? 'Update specs and registration details for this vehicle.' : 'Add details to build a new vehicle profile stamp.'}
              </p>

              <form onSubmit={handleProfileSubmit} className="space-y-4">
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
                    placeholder="e.g. MH-12-AB-1234"
                    value={profilePlate}
                    onChange={(e) => setProfilePlate(e.target.value.toUpperCase())}
                    required
                    className="w-full px-4 py-2 bg-white dark:bg-[#0b0f19] border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none font-mono"
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button 
                    type="submit" 
                    className="flex-1 btn-primary justify-center"
                  >
                    {editingVehicleId ? 'Update Vehicle' : 'Add Vehicle'}
                  </button>
                  {editingVehicleId && (
                    <button 
                      type="button" 
                      onClick={() => {
                        setEditingVehicleId(null);
                        setProfileMake('');
                        setProfileModel('');
                        setProfileFuel('Petrol');
                        setProfilePlate('');
                      }}
                      className="btn-secondary px-4 justify-center"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>
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
