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

const PILOT_DEALERS = [
  { id: "d1", name: "Maruti Suzuki Sector 63 Noida Hub", address: "H-224, Sector 63, Noida, UP", pincode: "201301", lat: 28.627, lng: 77.378 },
  { id: "d2", name: "Hyundai Care Sector 62 Noida Hub", address: "C-56, Sector 62, Noida, UP", pincode: "201309", lat: 28.622, lng: 77.364 },
  { id: "d3", name: "Mahindra Dealership Hub Delhi", address: "Okhla Industrial Area Phase III, New Delhi", pincode: "110020", lat: 28.538, lng: 77.271 },
  { id: "d4", name: "Tata Motors Gurugram Service Center", address: "IDC, Sector 14, Gurugram, Haryana", pincode: "122001", lat: 28.473, lng: 77.042 },
  { id: "d5", name: "Honda Care Connaught Place", address: "Connaught Place, Radial Road 4, New Delhi", pincode: "110001", lat: 28.630, lng: 77.220 }
];

const MOCK_MECHANICS = [
  { id: "m1", name: "Amit Kumar", workshopId: "d1" },
  { id: "m2", name: "Sanjay Singh", workshopId: "d1" },
  { id: "m3", name: "Vikram Rathore", workshopId: "d1" },
  { id: "m4", name: "Rajesh Sharma", workshopId: "d5" },
  { id: "m5", name: "Anil Verma", workshopId: "d5" },
  { id: "m6", name: "Sunil Dutt", workshopId: "d2" },
  { id: "m7", name: "Karan Johar", workshopId: "d3" }
];

export default function App() {
  const [isDark, setIsDark] = useState(true);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [activeRole, setActiveRole] = useState('manager'); // 'customer' | 'advisor' | 'technician' | 'manager'
  
  // Auth state
  const [currentUser, setCurrentUser] = useState(null); // { name: 'Sarah Jenkins', role: 'customer' } or workshop staff

  const [appointments, setAppointments] = useState([]);
  const [messages, setMessages] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCustAppId, setSelectedCustAppId] = useState('');

  // Cryptographic audit logger helper
  const logAuditEvent = async (roId, action, actor, details) => {
    try {
      const timestamp = new Date().toISOString();
      const stringToHash = `${roId}-${action}-${actor}-${timestamp}-${details}`;
      let hash = 0;
      for (let i = 0; i < stringToHash.length; i++) {
        const char = stringToHash.charCodeAt(i);
        hash = (hash << 5) - hash + char;
        hash = hash & hash;
      }
      const sha256Hex = "sha256-" + Math.abs(hash).toString(16).padStart(16, '0') + Math.random().toString(36).substring(2, 8);
      
      const targetApp = appointments.find(a => a.id === roId);
      if (!targetApp) return;

      const currentTrail = targetApp.auditTrail || [];
      const newEvent = {
        timestamp,
        action,
        actor,
        details,
        hash: sha256Hex
      };

      await setDoc(doc(db, "appointments", roId), {
        auditTrail: [...currentTrail, newEvent]
      }, { merge: true });
    } catch (err) {
      console.error("Error writing audit event:", err);
    }
  };

  // Notification sender helper
  const sendNotification = async (recipient, title, message) => {
    try {
      const notifId = `notif-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
      await setDoc(doc(db, "notifications", notifId), {
        recipient,
        title,
        message,
        timestamp: new Date().toISOString(),
        read: false
      });
    } catch (err) {
      console.error("Error creating notification:", err);
    }
  };


  // Default/sync selected customer appointment when appointments list updates
  useEffect(() => {
    if (appointments.length > 0) {
      const appExists = appointments.some(a => a.id === selectedCustAppId);
      if (!selectedCustAppId || !appExists) {
        const defaultApp = appointments.find(a => a.customerName === 'Sarah Jenkins' || a.customerName === 'John Doe');
        if (defaultApp) {
          setSelectedCustAppId(defaultApp.id);
        }
      }
    } else {
      setSelectedCustAppId('');
    }
  }, [appointments, selectedCustAppId]);

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

    // Listen for profiles
    const unsubscribeProfiles = onSnapshot(collection(db, "profiles"), (snapshot) => {
      const profs = [];
      snapshot.forEach((doc) => {
        profs.push({ customerName: doc.id, ...doc.data() });
      });
      setProfiles(profs);
    }, (err) => {
      console.error("Profiles listener error:", err);
    });

    // Listen for notifications
    const unsubscribeNotifications = onSnapshot(collection(db, "notifications"), (snapshot) => {
      const list = [];
      snapshot.forEach((doc) => {
        list.push({ id: doc.id, ...doc.data() });
      });
      list.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      setNotifications(list);
    }, (err) => {
      console.error("Notifications listener error:", err);
    });

    return () => {
      unsubscribeAppointments();
      unsubscribeMessages();
      unsubscribeProfiles();
      unsubscribeNotifications();
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

  // Advisor Accept Booking & Create Job Card Action
  const handleAcceptAndCreateJobCard = async (id, odometer, fuelLevel, mechanicId, comments, fuelPhoto, batteryPhoto) => {
    try {
      const targetApp = appointments.find(a => a.id === id);
      if (!targetApp) return;

      const mechanic = MOCK_MECHANICS.find(m => m.id === mechanicId) || MOCK_MECHANICS[0];

      await setDoc(doc(db, "appointments", id), {
        status: 'Accepted',
        odometer: odometer || '12,000 km',
        fuelLevel: fuelLevel || '50%',
        assignedMechanic: mechanic.name,
        assignedMechanicId: mechanic.id,
        advisorComments: comments || 'None',
        jobCardCreated: new Date().toISOString(),
        fuelPhoto: fuelPhoto || '',
        batteryPhoto: batteryPhoto || ''
      }, { merge: true });
      
      await logAuditEvent(id, "Job Card Created", "Advisor", `Vehicle checked in. Odometer: ${odometer || '12,000 km'}, Fuel: ${fuelLevel || '50%'}, Mechanic: ${mechanic.name} allocated. Photos attached: Fuel Indicator & Battery ID.`);
      
      await setDoc(doc(collection(db, "messages")), {
        sender: 'Advisor',
        recipient: targetApp.customerName,
        text: `Your vehicle is checked in! Job Card created. Mechanic ${mechanic.name} is assigned to inspect your vehicle.`,
        timestamp: new Date().toISOString()
      });

      await sendNotification(targetApp.customerName, "Booking Accepted", `Your service request for ${targetApp.vehicle} has been accepted and assigned to ${mechanic.name}.`);
    } catch (err) {
      console.error("Firestore check-in and accept error:", err);
    }
  };

  // Advisor Reject Booking Action
  const handleRejectBooking = async (id, reason) => {
    try {
      const targetApp = appointments.find(a => a.id === id);
      if (!targetApp) return;

      await setDoc(doc(db, "appointments", id), {
        status: 'Rejected',
        rejectionReason: reason || 'Capacity limit reached'
      }, { merge: true });

      await logAuditEvent(id, "Booking Rejected", "Advisor", `Booking rejected. Reason: ${reason}`);
      await sendNotification(targetApp.customerName, "Booking Rejected", `Your service request for ${targetApp.vehicle} was rejected. Reason: ${reason}`);
    } catch (err) {
      console.error("Firestore reject booking error:", err);
    }
  };

  // Tech Start Inspection Action
  const handleStartInspection = async (id) => {
    try {
      await setDoc(doc(db, "appointments", id), {
        status: 'inspecting'
      }, { merge: true });
      await logAuditEvent(id, "Inspection Started", "Technician", "Multi-point inspection and diagnostics check initiated in bay.");
    } catch (err) {
      console.error("Firestore StartInspection error:", err);
    }
  };

  // Tech Submit Inspection Action
  const handleSubmitInspection = async (id, report, recommendations, techSignatureName) => {
    try {
      const targetApp = appointments.find(a => a.id === id);
      if (!targetApp) return;

      const baseCost = targetApp.service === 'General Service' ? 3500 : 2000;
      const recommendationsCost = recommendations.reduce((acc, r) => acc + r.cost, 0);

      await setDoc(doc(db, "appointments", id), {
        status: 'Estimate Advisor Review',
        inspection: report,
        recommendations: recommendations,
        estimatedCost: baseCost + recommendationsCost,
        techSignature: techSignatureName || "Tech #402"
      }, { merge: true });

      await logAuditEvent(id, "Diagnostics Submitted", "Technician", `MPI diagnostics completed. Sent estimate to Service Advisor for review.`);
      await sendNotification(targetApp.customerName, "Diagnostics Completed", `Diagnostics completed for ${targetApp.vehicle}. Our Service Advisor is currently reviewing the recommendations.`);
      
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
      const newStatus = pendingCount === 0 ? 'In Progress' : targetApp.status;

      await setDoc(doc(db, "appointments", targetApp.id), {
        recommendations: updatedRecs,
        status: newStatus
      }, { merge: true });

      const approvedItem = targetApp.recommendations.find(r => r.id === recId);
      await logAuditEvent(targetApp.id, "Recommendation Approved", "Customer", `Customer approved: ${approvedItem?.service} (₹${approvedItem?.cost})`);

      if (pendingCount === 0) {
        await logAuditEvent(targetApp.id, "Repairs Authorized", "System", "All recommended estimates resolved. Repair work started in bay.");
        await sendNotification(targetApp.customerName, "Repairs In Progress", `Work has officially started on your ${targetApp.vehicle}.`);
      }
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

      const baseCost = targetApp.service === 'General Service' ? 3500 : 2000;
      const approvedRecsCost = updatedRecs
        .filter(r => r.status === 'approved')
        .reduce((acc, r) => acc + r.cost, 0);

      const pendingCount = updatedRecs.filter(r => r.status === 'pending').length;
      const newStatus = pendingCount === 0 ? 'In Progress' : targetApp.status;

      await setDoc(doc(db, "appointments", targetApp.id), {
        recommendations: updatedRecs,
        estimatedCost: baseCost + approvedRecsCost,
        status: newStatus
      }, { merge: true });

      const declinedItem = targetApp.recommendations.find(r => r.id === recId);
      await logAuditEvent(targetApp.id, "Recommendation Declined", "Customer", `Customer declined: ${declinedItem?.service} (₹${declinedItem?.cost})`);

      if (pendingCount === 0) {
        await logAuditEvent(targetApp.id, "Repairs Authorized", "System", "All recommended estimates resolved. Repair work started in bay.");
        await sendNotification(targetApp.customerName, "Repairs In Progress", `Work has officially started on your ${targetApp.vehicle}.`);
      }
    } catch (err) {
      console.error("Firestore DeclineRecommendation error:", err);
    }
  };

  // Customer final authorization of the estimate
  const handleAuthorizeRepairs = async (id, signatureName, updatedRecs) => {
    try {
      const targetApp = appointments.find(a => a.id === id);
      if (!targetApp) return;

      const baseCost = targetApp.service === 'General Service' ? 3500 : 2000;
      const approvedCost = updatedRecs
        .filter(r => r.status === 'approved')
        .reduce((acc, r) => acc + r.cost, 0);

      await setDoc(doc(db, "appointments", id), {
        status: 'Approved',
        recommendations: updatedRecs,
        estimatedCost: baseCost + approvedCost,
        customerSignature: signatureName || 'Sarah Jenkins'
      }, { merge: true });

      await logAuditEvent(id, "Estimate Approved", "Customer", `Authorized repair work with signature: ${signatureName}. Approved: ${updatedRecs.filter(r => r.status === 'approved').map(r => r.service).join(', ') || 'None'}`);
      await sendNotification(targetApp.customerName, "Estimate Authorized", `Your service estimate has been approved. Repairs are ready to start.`);
    } catch (err) {
      console.error("Firestore AuthorizeRepairs error:", err);
    }
  };

  // Technician start active repairs
  const handleStartRepairs = async (id) => {
    try {
      const targetApp = appointments.find(a => a.id === id);
      if (!targetApp) return;

      await setDoc(doc(db, "appointments", id), {
        status: 'In Progress'
      }, { merge: true });

      await logAuditEvent(id, "Repairs Started", "Technician", "Technician commenced physical repair operations in the bay.");
      await sendNotification(targetApp.customerName, "Repairs In Progress", `Work has officially started on your ${targetApp.vehicle}.`);
    } catch (err) {
      console.error("Firestore StartRepairs error:", err);
    }
  };

  // Advisor Publish Estimate to Customer
  const handlePublishEstimate = async (id, finalRecs) => {
    try {
      const targetApp = appointments.find(a => a.id === id);
      if (!targetApp) return;

      const baseCost = targetApp.service === 'General Service' ? 3500 : 2000;
      const recsCost = finalRecs.reduce((acc, r) => acc + r.cost, 0);

      await setDoc(doc(db, "appointments", id), {
        status: 'Estimate Pending',
        recommendations: finalRecs,
        estimatedCost: baseCost + recsCost
      }, { merge: true });

      await logAuditEvent(id, "Estimate Released", "Advisor", `Service Advisor reviewed technician recommendations and released estimate to customer.`);
      await sendNotification(targetApp.customerName, "Repair Estimate Ready", `Diagnostics report and repair estimates are ready for your review and approval.`);
    } catch (err) {
      console.error("Firestore PublishEstimate error:", err);
    }
  };

  // Tech Complete Repairs
  const handleCompleteRepairs = async (id) => {
    try {
      const targetApp = appointments.find(a => a.id === id);
      if (!targetApp) return;

      await setDoc(doc(db, "appointments", id), {
        status: 'qc_check'
      }, { merge: true });

      await logAuditEvent(id, "Repairs Completed", "Technician", "All repairs finished. Vehicle moved to Quality Control bay for inspection.");
      await sendNotification(targetApp.customerName, "Repairs Under QC Review", "Repairs are complete! Your vehicle is undergoing final Quality Control checks.");
    } catch (err) {
      console.error("Firestore CompleteRepairs error:", err);
    }
  };

  // Advisor Quality Control Sign-off
  const handleQcSignOff = async (id, qcSignName) => {
    try {
      const targetApp = appointments.find(a => a.id === id);
      if (!targetApp) return;

      await setDoc(doc(db, "appointments", id), {
        status: 'Completed',
        qcSignature: qcSignName || 'Signed Off'
      }, { merge: true });

      await logAuditEvent(id, "QC Sign-Off Complete", "Advisor", `Quality Control check passed. Signed by inspector: ${qcSignName}.`);
      await sendNotification(targetApp.customerName, "Vehicle Ready for Pickup", `Great news! Your ${targetApp.vehicle} passed QC and is ready for collection.`);
      
      await setDoc(doc(collection(db, "messages")), {
        sender: 'Advisor',
        recipient: targetApp.customerName,
        text: `Hi ${targetApp.customerName}, your vehicle has passed final quality QC inspection and is ready for pickup!`,
        timestamp: new Date().toISOString()
      });
    } catch (err) {
      console.error("Firestore QcSignOff error:", err);
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
      const baseCost = newApp.service === 'General Service' ? 3500 : 2000;
      const formattedApp = {
        id: id,
        customerName: newApp.customerName || 'John Doe',
        vehicle: newApp.vehicle,
        fuelType: newApp.fuelType || '',
        licensePlate: newApp.licensePlate || '',
        service: newApp.service,
        dealerName: newApp.dealerName || '',
        pickupDropoff: newApp.pickupDropoff || false,
        pickupAddress: newApp.pickupAddress || '',
        date: newApp.date,
        time: newApp.time,
        status: 'Requested',
        estimatedCost: baseCost,
        inspection: null,
        recommendations: [],
        techSignature: '',
        qcSignature: '',
        auditTrail: [{
          timestamp: new Date().toISOString(),
          action: "Booking Created",
          actor: "Customer",
          details: `Requested ${newApp.service} at ${newApp.dealerName}. Pick-up: ${newApp.pickupDropoff ? 'Yes' : 'No'}.`,
          hash: "sha256-init" + Math.random().toString(36).substring(2, 8)
        }]
      };
      await setDoc(doc(db, "appointments", id), formattedApp);
      await sendNotification(formattedApp.customerName, "Booking Requested", `Your service booking for ${formattedApp.vehicle} is under review.`);
      setSelectedCustAppId(id);
    } catch (err) {
      console.error("Firestore ScheduleAppointment error:", err);
    }
  };

  // Save Customer Profile Vehicles List
  const handleSaveProfile = async (customerName, vehiclesList) => {
    try {
      await setDoc(doc(db, "profiles", customerName), {
        vehicles: vehiclesList
      });
    } catch (err) {
      console.error("Firestore SaveProfile error:", err);
    }
  };

  // Clear simulated database
  const handleResetData = async () => {
    try {
      setLoading(true);
      const appSnapshot = await getDocs(collection(db, "appointments"));
      const appPromises = appSnapshot.docs.map(doc => deleteDoc(doc.ref));
      await Promise.all(appPromises);

      const msgSnapshot = await getDocs(collection(db, "messages"));
      const msgPromises = msgSnapshot.docs.map(doc => deleteDoc(doc.ref));
      await Promise.all(msgPromises);

      const profSnapshot = await getDocs(collection(db, "profiles"));
      const profPromises = profSnapshot.docs.map(doc => deleteDoc(doc.ref));
      await Promise.all(profPromises);

      const defaultApps = [
        {
          id: "ro-1",
          customerName: "John Doe",
          vehicle: "Maruti Swift (Petrol)",
          fuelType: "Petrol",
          licensePlate: "DL3C-CA-1920",
          service: "General Service",
          date: new Date().toISOString().split('T')[0],
          time: "11:30 AM",
          status: "Requested",
          estimatedCost: 3500,
          inspection: null,
          recommendations: [],
          techSignature: "",
          qcSignature: "",
          auditTrail: [{
            timestamp: new Date().toISOString(),
            action: "Booking Created",
            actor: "Customer",
            details: "Requested General Service at Maruti Suzuki Sector 63 Noida Hub.",
            hash: "sha256-seed-ro1"
          }]
        },
        {
          id: "ro-2",
          customerName: "Sarah Jenkins",
          vehicle: "Mahindra XUV700 (Diesel)",
          fuelType: "Diesel",
          licensePlate: "UP16-BM-2023",
          service: "General Service",
          date: new Date().toISOString().split('T')[0],
          time: "09:00 AM",
          status: "inspecting",
          estimatedCost: 3500,
          techSignature: "",
          qcSignature: "",
          assignedMechanic: "Amit Kumar",
          assignedMechanicId: "m1",
          dealerName: "Maruti Suzuki Sector 63 Noida Hub",
          inspection: null,
          recommendations: [],
          auditTrail: [
            {
              timestamp: new Date().toISOString(),
              action: "Booking Created",
              actor: "Customer",
              details: "Requested General Service.",
              hash: "sha256-seed-ro2-init"
            },
            {
              timestamp: new Date().toISOString(),
              action: "Job Card Created",
              actor: "Advisor",
              details: "Vehicle checked in. Odometer: 15,200 km, Fuel: 50%. Mechanic Amit Kumar allocated.",
              hash: "sha256-seed-ro2-jc"
            }
          ]
        }
      ];

      const defaultMsgs = [
        { sender: "Advisor", recipient: "Sarah Jenkins", text: "Hi Sarah, your XUV700 is in the bay. Technician is performing the Multi-Point Inspection now.", timestamp: new Date().toISOString() }
      ];

      for (const app of defaultApps) {
        await setDoc(doc(db, "appointments", app.id), app);
      }
      for (const msg of defaultMsgs) {
        await setDoc(doc(collection(db, "messages")), msg);
      }

      console.log("Firestore reset complete.");
      alert("Database has been reset to default sandbox demo values!");
      window.location.reload();
    } catch (err) {
      console.error("Firestore ResetData error:", err);
      alert("Error resetting database: " + err.message);
      setLoading(false);
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
        const customerApps = appointments.filter(a => a.customerName === currentUser?.name);
        const currentCustApp = appointments.find(a => a.id === selectedCustAppId && a.customerName === currentUser?.name) || customerApps[0];
        const activeCustomerName = currentUser?.name || 'Sarah Jenkins';
        
        const rawProfile = profiles.find(p => p.customerName === activeCustomerName) || {
          customerName: activeCustomerName,
          vehicles: []
        };

        // Backward compatibility: Convert old single-vehicle profile to vehicles array
        const customerVehicles = rawProfile.vehicles || [];
        if (customerVehicles.length === 0 && rawProfile.make) {
          customerVehicles.push({
            id: 'legacy-car',
            make: rawProfile.make,
            model: rawProfile.model,
            fuelType: rawProfile.fuelType,
            licensePlate: rawProfile.licensePlate,
            isDefault: true
          });
        }

        const activeProfile = {
          customerName: activeCustomerName,
          vehicles: customerVehicles
        };

        return (
          <CustomerPortal 
            appointment={currentCustApp} 
            allCustomerAppointments={customerApps}
            onSelectAppointment={setSelectedCustAppId}
            onApproveRecommendation={handleApproveRecommendation}
            onDeclineRecommendation={handleDeclineRecommendation}
            onScheduleAppointment={handleScheduleAppointment}
            profile={activeProfile}
            onSaveProfile={(vList) => handleSaveProfile(activeCustomerName, vList)}
            currentUser={currentUser}
            setCurrentUser={setCurrentUser}
            notifications={notifications}
            onAuthorizeRepairs={handleAuthorizeRepairs}
          />
        );
      case 'advisor':
        const advisorApps = appointments.filter(a => a.dealerName === currentUser?.name);
        const advisorMessages = messages.filter(m => m.sender === currentUser?.name || m.recipient === currentUser?.name);
        return (
          <AdvisorDashboard 
            appointments={advisorApps} 
            onAcceptBooking={handleAcceptAndCreateJobCard}
            onRejectBooking={handleRejectBooking}
            onSendMessage={handleSendMessage}
            messages={advisorMessages}
            mechanics={MOCK_MECHANICS}
            onQcSignOff={handleQcSignOff}
            onPublishEstimate={handlePublishEstimate}
          />
        );
      case 'technician':
        const techApps = appointments.filter(a => a.assignedMechanic === currentUser?.name);
        return (
          <TechnicianWorkbench 
            appointments={techApps}
            onSubmitInspection={handleSubmitInspection}
            onCompleteRepairs={handleCompleteRepairs}
            onStartInspection={handleStartInspection}
            onStartRepairs={handleStartRepairs}
          />
        );
      case 'manager':
      default:
        return (
          <ManagerAnalytics appointments={appointments} mechanics={MOCK_MECHANICS} />
        );
    }
  };

  if (!currentUser) {
    return (
      <AuthPortal 
        onLogin={(user) => {
          setCurrentUser(user);
          setActiveRole(user.role);
          const defaultApp = appointments.find(a => a.customerName === user.name);
          if (defaultApp) {
            setSelectedCustAppId(defaultApp.id);
          }
        }} 
      />
    );
  }

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
            {currentUser && currentUser.role === 'manager' && (
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
            )}
            
            {currentUser && currentUser.role === 'advisor' && (
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
            )}

            {currentUser && currentUser.role === 'technician' && (
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
            )}

            {currentUser && currentUser.role === 'customer' && (
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
            )}
          </div>
        </div>

        {/* Footer Sidebar actions */}
        <div className="space-y-4">
          {!isCollapsed && currentUser && (
            <div className="p-3 bg-slate-50 dark:bg-rose-950/10 rounded-xl border border-slate-100 dark:border-rose-950/20 text-xs space-y-2">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 bg-emerald-500 rounded-full"></div>
                <span className="font-bold text-slate-500 dark:text-slate-400 truncate block max-w-[120px]">{currentUser.name}</span>
              </div>
              <button 
                onClick={() => {
                  setCurrentUser(null);
                  setActiveRole('customer');
                }}
                className="text-rose-500 hover:underline font-bold block"
              >
                Sign Out
              </button>
            </div>
          )}
          
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

function AuthPortal({ onLogin }) {
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState('customer');
  const [name, setName] = useState('Sarah Jenkins');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState(1); // 1: credentials, 2: OTP
  
  const handleSendOtp = (e) => {
    e.preventDefault();
    if (!phone || phone.length < 10) {
      alert("Please enter a valid 10-digit mobile number.");
      return;
    }
    setStep(2);
  };

  const handleVerifyOtp = (e) => {
    e.preventDefault();
    if (otp === '1234') {
      onLogin({ name, role });
    } else {
      alert("Invalid OTP code. Use '1234' for sandbox verification.");
    }
  };

  return (
    <div className="fixed inset-0 bg-[#0b0f19] flex items-center justify-center z-50 p-4 font-sans text-slate-200">
      <div className="w-full max-w-md bg-[#0d1322] border border-slate-800 rounded-2xl p-8 space-y-6 shadow-2xl text-left">
        <div className="text-center space-y-2">
          <div className="inline-flex h-12 w-12 bg-rose-500/10 text-rose-500 rounded-xl items-center justify-center border border-rose-500/20 mb-2">
            <span className="font-extrabold text-lg">SP</span>
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">ServiceProof Authentication</h2>
          <p className="text-xs text-slate-400">Secure Tamper-Resistant Vehicle Service Passport</p>
        </div>

        {step === 1 ? (
          <form onSubmit={handleSendOtp} className="space-y-4">
            <div>
              <label className="block text-xs uppercase tracking-wider font-mono font-bold text-slate-500 mb-1.5">
                Select Portal Access Role
              </label>
              <select
                value={role}
                onChange={(e) => {
                  const r = e.target.value;
                  setRole(r);
                  setName(r === 'customer' ? 'Sarah Jenkins' : r === 'technician' ? 'Amit Kumar' : r === 'advisor' ? 'Maruti Suzuki Sector 63 Noida Hub' : 'General Manager');
                }}
                className="w-full px-4 py-2.5 bg-[#0b0f19] border border-slate-800 rounded-lg text-sm text-slate-200 focus:outline-none"
              >
                <option value="customer">Customer Portal</option>
                <option value="advisor">Service Advisor Desk</option>
                <option value="technician">Technician Workbench</option>
                <option value="manager">Manager Operations Dashboard</option>
              </select>
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider font-mono font-bold text-slate-500 mb-1.5">
                Authorized Identity Name
              </label>
              {role === 'customer' ? (
                <select
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2.5 bg-[#0b0f19] border border-slate-800 rounded-lg text-sm text-slate-200 focus:outline-none"
                >
                  <option value="Sarah Jenkins">Sarah Jenkins (Mahindra XUV700)</option>
                  <option value="John Doe">John Doe (Maruti Swift)</option>
                </select>
              ) : role === 'technician' ? (
                <select
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2.5 bg-[#0b0f19] border border-slate-800 rounded-lg text-sm text-slate-200 focus:outline-none"
                >
                  <option value="Amit Kumar">Amit Kumar (Noida Sector 63)</option>
                  <option value="Rajesh Sharma">Rajesh Sharma (Connaught Place)</option>
                </select>
              ) : role === 'advisor' ? (
                <select
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2.5 bg-[#0b0f19] border border-slate-800 rounded-lg text-sm text-slate-200 focus:outline-none"
                >
                  <option value="Maruti Suzuki Sector 63 Noida Hub">Maruti Suzuki Sector 63 Noida Hub</option>
                  <option value="Hyundai Care Sector 62 Noida Hub">Hyundai Care Sector 62 Noida Hub</option>
                  <option value="Mahindra Dealership Hub Delhi">Mahindra Dealership Hub Delhi</option>
                  <option value="Tata Motors Gurugram Service Center">Tata Motors Gurugram Service Center</option>
                  <option value="Honda Care Connaught Place">Honda Care Connaught Place</option>
                </select>
              ) : (
                <input
                  type="text"
                  value={name}
                  disabled
                  className="w-full px-4 py-2.5 bg-[#0b0f19] border border-slate-800 rounded-lg text-sm text-slate-400 focus:outline-none cursor-not-allowed"
                />
              )}
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider font-mono font-bold text-slate-500 mb-1.5">
                Mobile Phone Number
              </label>
              <input
                type="text"
                placeholder="e.g. 9999988888"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                maxLength={10}
                required
                className="w-full px-4 py-2.5 bg-[#0b0f19] border border-slate-800 rounded-lg text-sm text-slate-200 focus:outline-none font-mono"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all"
            >
              Request OTP Code
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <div className="text-center space-y-1">
              <p className="text-xs text-slate-400">One-Time Passcode sent to mobile</p>
              <p className="text-xs font-mono font-bold text-rose-500">+91 {phone.substring(0, 5)} {phone.substring(5)}</p>
            </div>
            
            <div>
              <label className="block text-xs uppercase tracking-wider font-mono font-bold text-slate-500 mb-1.5 text-center">
                Enter 4-Digit Verification Code
              </label>
              <input
                type="text"
                placeholder="Hint: Type 1234"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                maxLength={4}
                required
                className="w-full px-4 py-2.5 bg-[#0b0f19] border border-slate-800 rounded-lg text-center text-lg tracking-widest text-slate-200 focus:outline-none font-mono"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all"
            >
              Verify & Log In
            </button>

            <button
              type="button"
              onClick={() => setStep(1)}
              className="w-full text-center text-xs text-slate-500 hover:text-slate-400 font-semibold mt-2 block"
            >
              ← Edit Credentials
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
