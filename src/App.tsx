/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  ShoppingBag, 
  ClipboardCheck, 
  Truck, 
  Users, 
  HeartPulse, 
  Activity,
  Menu,
  X,
  LogOut,
  ShieldAlert
} from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';

// Domain imports
import { Medication, Patient, RefillRequest, Delivery, InteractionNote } from './types';
import { 
  INITIAL_MEDICATIONS, 
  INITIAL_PATIENTS, 
  INITIAL_REFILLS, 
  INITIAL_DELIVERIES 
} from './data/mockData';

// Component imports
import Dashboard from './components/Dashboard';
import MedicationCatalog from './components/MedicationCatalog';
import RefillManager from './components/RefillManager';
import DeliveryTracker from './components/DeliveryTracker';
import CRMHub from './components/CRMHub';
import DispensingModule from './components/DispensingModule';
import LoginPage, { UserSession } from './components/LoginPage';

export default function App() {
  const [session, setSession] = useState<UserSession | null>(() => {
    const saved = localStorage.getItem('rx_session');
    return saved ? JSON.parse(saved) : null;
  });

  const [activeTab, setActiveTab] = useState<'dashboard' | 'medications' | 'dispensing' | 'refills' | 'deliveries' | 'crm'>('dashboard');
  const [selectedRefillId, setSelectedRefillId] = useState<string | null>(null);
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Persistent States
  const [medications, setMedications] = useState<Medication[]>(() => {
    const saved = localStorage.getItem('rx_medications');
    return saved ? JSON.parse(saved) : INITIAL_MEDICATIONS;
  });

  const [patients, setPatients] = useState<Patient[]>(() => {
    const saved = localStorage.getItem('rx_patients');
    const parsed = saved ? JSON.parse(saved) : INITIAL_PATIENTS;
    return parsed.map((p: any) => ({
      ...p,
      allergies: p.allergies || [],
      chronicConditions: p.chronicConditions || [],
      tags: p.tags || [],
      notes: p.notes || []
    }));
  });

  const [refills, setRefills] = useState<RefillRequest[]>(() => {
    const saved = localStorage.getItem('rx_refills');
    return saved ? JSON.parse(saved) : INITIAL_REFILLS;
  });

  const [deliveries, setDeliveries] = useState<Delivery[]>(() => {
    const saved = localStorage.getItem('rx_deliveries');
    return saved ? JSON.parse(saved) : INITIAL_DELIVERIES;
  });

  // Sync state changes to local storage
  useEffect(() => {
    localStorage.setItem('rx_medications', JSON.stringify(medications));
  }, [medications]);

  useEffect(() => {
    localStorage.setItem('rx_patients', JSON.stringify(patients));
  }, [patients]);

  useEffect(() => {
    localStorage.setItem('rx_refills', JSON.stringify(refills));
  }, [refills]);

  useEffect(() => {
    localStorage.setItem('rx_deliveries', JSON.stringify(deliveries));
  }, [deliveries]);

  useEffect(() => {
    if (session) {
      localStorage.setItem('rx_session', JSON.stringify(session));
    } else {
      localStorage.removeItem('rx_session');
    }
  }, [session]);

  const handleLoginSuccess = (userSession: UserSession) => {
    setSession(userSession);
    if (userSession.scope.includes('dashboard')) {
      setActiveTab('dashboard');
    } else if (userSession.scope.includes('deliveries')) {
      setActiveTab('deliveries');
    } else {
      setActiveTab(userSession.scope[0] as any);
    }
  };

  const handleLogout = () => {
    setSession(null);
    setSelectedRefillId(null);
    setSelectedPatientId(null);
  };

  // Handle inventory updates
  const handleUpdateStock = (medId: string, amount: number) => {
    setMedications(prev => prev.map(med => {
      if (med.id === medId) {
        return {
          ...med,
          stock: Math.max(0, med.stock + amount)
        };
      }
      return med;
    }));
  };

  const handleAddMedication = (newMed: Omit<Medication, 'id'>) => {
    const nextId = `med-${medications.length + 1}`;
    setMedications(prev => [...prev, { ...newMed, id: nextId }]);
  };

  // Handle Prescription Refill status transition
  const handleUpdateRefillStatus = (refillId: string, status: RefillRequest['status'], notes?: string) => {
    setRefills(prev => prev.map(ref => {
      if (ref.id === refillId) {
        return {
          ...ref,
          status,
          notes: notes || ref.notes
        };
      }
      return ref;
    }));

    // INTERACTIVE REACTION:
    // If the refill changes to "dispensed" (packaged), deduct stock automatically!
    if (status === 'dispensed') {
      const targetRefill = refills.find(r => r.id === refillId);
      if (targetRefill) {
        // Find medication
        const med = medications.find(m => m.id === targetRefill.medicationId);
        if (med) {
          // Deduct a standard package amount (e.g. 30 units because standard prescription bottles carry 30 pills)
          handleUpdateStock(med.id, -30);
          
          // Append log to patient history indicating prescription successfully dispensed and boxed
          handleAppendPatientNote(targetRefill.patientId, {
            type: 'system',
            summary: `Automated Prescription Dispensing: 30-day supply of ${med.name} ${med.dosage} was checked, boxed for shipment, and inventory stock level reduced automatically.`,
            agentName: 'System Core'
          });
        }
      }
    }
  };

  // Dispatch delivery provisioner
  const handleCreateDelivery = (
    refillRequestId: string, 
    priority: 'standard' | 'urgent', 
    paymentMode?: 'cash' | 'credit', 
    paymentStatus?: 'unpaid' | 'paid'
  ) => {
    const refill = refills.find(r => r.id === refillRequestId);
    if (!refill) return;

    // Prevent duplicate dispatches
    if (deliveries.some(d => d.refillRequestId === refillRequestId)) return;

    const targetPatient = patients.find(p => p.id === refill.patientId);
    const courierOptions = ['Driver A', 'Driver B', 'Driver C', 'Driver D', 'Driver E'];
    const randomCourier = courierOptions[Math.floor(Math.random() * courierOptions.length)];

    const finalPaymentMode = paymentMode || refill.paymentMode || 'cash';
    const finalPaymentStatus = paymentStatus || refill.paymentStatus || 'unpaid';

    const newDelivery: Delivery = {
      id: `del-${deliveries.length + 1}`,
      refillRequestId,
      patientId: refill.patientId,
      address: targetPatient ? '742 Evergreen Terrace, Sector 7G' : 'Standard Address, Lane 12',
      status: 'pending_dispatch',
      courierName: randomCourier,
      estimatedDelivery: 'Today, 6:00 PM',
      latitude: 34.0522,
      longitude: -118.2437,
      progress: 0,
      priority,
      deliveryFee: priority === 'urgent' ? 9.99 : 4.99,
      paymentMode: finalPaymentMode,
      paymentStatus: finalPaymentStatus,
      communicationLogs: [],
      area: 'AREA 1'
    };

    setDeliveries(prev => [...prev, newDelivery]);
  };

  // Re-assign Courier and Area
  const handleUpdateDeliveryDriverAndArea = (deliveryId: string, courierName: string, areaName: string) => {
    setDeliveries(prev => prev.map(del => {
      if (del.id === deliveryId) {
        return {
          ...del,
          courierName,
          area: areaName
        };
      }
      return del;
    }));
  };

  // Handle Delivery Status
  const handleUpdateDeliveryStatus = (deliveryId: string, status: Delivery['status']) => {
    setDeliveries(prev => prev.map(del => {
      if (del.id === deliveryId) {
        // If driver completed delivery with cash payment, resolve bill immediately
        const resolvedPayStatus = (status === 'delivered' && del.paymentMode === 'cash') ? 'paid' : del.paymentStatus;
        return { 
          ...del, 
          status,
          paymentStatus: resolvedPayStatus
        };
      }
      return del;
    }));

    // INTERACTIVE REACTION:
    // If delivery status turns to "delivered", log automated note in patient CRM file
    const targetDel = deliveries.find(d => d.id === deliveryId);
    if (status === 'delivered' && targetDel) {
      const modeText = targetDel.paymentMode === 'cash' ? 'Cash collected by driver at doorstep' : 'Pre-paid via Credit Card';
      handleAppendPatientNote(targetDel.patientId, {
        type: 'system',
        summary: `Delivery Completed: Courier ${targetDel.courierName} successfully delivered medicine. Payment mode: ${targetDel.paymentMode?.toUpperCase()} (${modeText}).`,
        agentName: 'Logistics Core'
      });
    }
  };

  // Send WhatsApp or Simulated SMS directly from driver dashboard
  const handleSendDriverMessage = (deliveryId: string, channel: 'whatsapp' | 'sms', msgText: string) => {
    const delivery = deliveries.find(d => d.id === deliveryId);
    if (!delivery) return;

    const targetPatient = patients.find(p => p.id === delivery.patientId);
    const recipientPhone = targetPatient ? targetPatient.phone : 'Unknown';

    const newMessage = {
      id: `msg-${Date.now()}`,
      timestamp: new Date().toISOString(),
      sender: `${delivery.courierName} (Driver)`,
      recipientPhone,
      channel,
      message: msgText
    };

    setDeliveries(prev => prev.map(del => {
      if (del.id === deliveryId) {
        return {
          ...del,
          communicationLogs: [...(del.communicationLogs || []), newMessage]
        };
      }
      return del;
    }));

    // Append to CRM patient record for real-time CRM updates
    handleAppendPatientNote(delivery.patientId, {
      type: channel === 'whatsapp' ? 'whatsapp' : 'sms',
      summary: `[Driver WhatsApp/SMS] Driver sent ${channel.toUpperCase()}: "${msgText}"`,
      agentName: `${delivery.courierName} (Driver)`
    });
  };

  // Direct state modifications for payments
  const handleUpdateDeliveryPaymentState = (deliveryId: string, paymentMode: 'cash' | 'credit', paymentStatus: 'unpaid' | 'paid') => {
    setDeliveries(prev => prev.map(del => {
      if (del.id === deliveryId) {
        return { ...del, paymentMode, paymentStatus };
      }
      return del;
    }));
  };

  const handleUpdateRefillPaymentState = (refillId: string, paymentMode: 'cash' | 'credit', paymentStatus: 'unpaid' | 'paid') => {
    setRefills(prev => prev.map(ref => {
      if (ref.id === refillId) {
        return { ...ref, paymentMode, paymentStatus };
      }
      return ref;
    }));
  };

  const handleUpdateDeliveryProgress = (deliveryId: string, progress: number) => {
    setDeliveries(prev => prev.map(del => {
      if (del.id === deliveryId) {
        return { ...del, progress };
      }
      return del;
    }));
  };

  // CRM Patient Management Operations
  const handleAppendPatientNote = (patientId: string, noteData: Omit<InteractionNote, 'id' | 'date'>) => {
    const newNote: InteractionNote = {
      ...noteData,
      id: `note-${Date.now()}`,
      date: new Date().toISOString()
    };

    setPatients(prev => prev.map(pat => {
      if (pat.id === patientId) {
        return {
          ...pat,
          notes: [newNote, ...pat.notes] // Append to start
        };
      }
      return pat;
    }));
  };

  const handleAddPatient = (newPat: Omit<Patient, 'id' | 'notes'>) => {
    const nextId = `pat-${patients.length + 1}`;
    setPatients(prev => [...prev, {
      ...newPat,
      allergies: newPat.allergies || [],
      chronicConditions: newPat.chronicConditions || [],
      tags: newPat.tags || [],
      id: nextId,
      notes: [{
        id: `note-init-${Date.now()}`,
        date: new Date().toISOString(),
        type: 'system',
        summary: 'Patient medical record registered on portal. Allergy tags assigned.',
        agentName: 'System Registration'
      }]
    }]);
  };

  const handleDeleteMedication = (id: string) => {
    setMedications(prev => prev.filter(m => m.id !== id));
    if (selectedRefillId) {
      const deletedMedRefill = refills.find(r => r.id === selectedRefillId);
      if (deletedMedRefill && deletedMedRefill.medicationId === id) {
        setSelectedRefillId(null);
      }
    }
  };

  const handleEditMedication = (updatedMed: Medication) => {
    setMedications(prev => prev.map(m => m.id === updatedMed.id ? updatedMed : m));
  };

  const handleDeletePatient = (id: string) => {
    setPatients(prev => prev.filter(p => p.id !== id));
    if (selectedPatientId === id) {
      setSelectedPatientId(null);
    }
  };

  const handleDeleteRefill = (id: string) => {
    setRefills(prev => prev.filter(r => r.id !== id));
    if (selectedRefillId === id) {
      setSelectedRefillId(null);
    }
  };

  const handleDeleteDelivery = (id: string) => {
    setDeliveries(prev => prev.filter(d => d.id !== id));
  };

  const handleEditPatient = (updatedPat: Patient) => {
    setPatients(prev => prev.map(p => p.id === updatedPat.id ? updatedPat : p));
  };

  const handleImportMedications = (imported: Omit<Medication, 'id'>[]) => {
    setMedications(prev => {
      let currentLength = prev.length;
      const updated = [...prev];
      imported.forEach(newItem => {
        const existingIdx = updated.findIndex(m => m.name.toLowerCase() === newItem.name.toLowerCase());
        if (existingIdx !== -1) {
          updated[existingIdx] = {
            ...updated[existingIdx],
            stock: updated[existingIdx].stock + newItem.stock,
            price: newItem.price || updated[existingIdx].price,
            shelfLocation: (newItem.shelfLocation && newItem.shelfLocation !== 'Unassigned') ? newItem.shelfLocation : updated[existingIdx].shelfLocation,
          };
        } else {
          currentLength++;
          updated.push({
            ...newItem,
            id: `med-${currentLength}`
          });
        }
      });
      return updated;
    });
  };

  const handleImportRefills = (importedRefills: Omit<RefillRequest, 'id'>[], importedPatients: Omit<Patient, 'id' | 'notes'>[]) => {
    setPatients(prevPats => {
      const patsCopy = [...prevPats];
      const patientIdMap: Record<string, string> = {};

      importedPatients.forEach(newPat => {
        const existing = patsCopy.find(p => p.name.toLowerCase() === newPat.name.toLowerCase());
        if (existing) {
          patientIdMap[newPat.name.toLowerCase()] = existing.id;
        } else {
          const nextId = `pat-${patsCopy.length + 1}`;
          patsCopy.push({
            ...newPat,
            allergies: newPat.allergies || [],
            chronicConditions: newPat.chronicConditions || [],
            tags: newPat.tags || [],
            id: nextId,
            notes: [{
              id: `note-imported-${Date.now()}`,
              date: new Date().toISOString(),
              type: 'system',
              summary: 'Patient medical record imported from external CSV/Excel sheet.',
              agentName: 'System Registration'
            }]
          });
          patientIdMap[newPat.name.toLowerCase()] = nextId;
        }
      });

      setRefills(prevRefills => {
        let currentLength = prevRefills.length;
        const refillsCopy = [...prevRefills];

        importedRefills.forEach(newRef => {
          let matchedPatientId = newRef.patientId;
          if (newRef.patientId.startsWith('NAME:')) {
            const nameKey = newRef.patientId.replace('NAME:', '').trim().toLowerCase();
            matchedPatientId = patientIdMap[nameKey] || `pat-${patsCopy.length}`;
          }

          currentLength++;
          refillsCopy.unshift({
            ...newRef,
            patientId: matchedPatientId,
            id: `refill-${currentLength}`,
            requestDate: newRef.requestDate || new Date().toISOString()
          });
        });
        return refillsCopy;
      });

      return patsCopy;
    });
  };

  // Navigation Tabs configuration
  const navigationItems = [
    { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
    { id: 'medications', label: 'Inventory', icon: ShoppingBag },
    { id: 'dispensing', label: 'Dispensing Unit', icon: Activity },
    { id: 'refills', label: 'Rx Refills', icon: ClipboardCheck },
    { id: 'deliveries', label: 'Courier Map', icon: Truck },
    { id: 'crm', label: 'Patient CRM', icon: Users },
  ];

  if (!session) {
    return <LoginPage onLoginSuccess={handleLoginSuccess} />;
  }

  // Filter navigation items based on authenticated role permissions
  const permittedNavigationItems = navigationItems.filter(item => 
    session.scope.includes(item.id)
  );

  return (
    <div className="min-h-screen bg-slate-50/50 flex flex-col md:flex-row font-sans" id="app-root-workflow">
      
      {/* Dynamic Desktop Sidebar Panel */}
      <aside className="w-64 bg-slate-900 text-slate-100 hidden md:flex flex-col shrink-0 border-r border-slate-800">
        {/* Healthcare Branding Header */}
        <div className="p-6 border-b border-slate-800 flex items-center gap-3">
          <div className="p-2 bg-emerald-500 rounded-xl text-white">
            <HeartPulse className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <span className="font-bold text-lg leading-none block text-white font-sans tracking-tight">RxFlow Management</span>
            <span className="text-[10px] text-emerald-400 font-mono flex items-center gap-1.5 mt-0.5">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping"></span>
              CORE SECURE ONLINE
            </span>
          </div>
        </div>

        {/* Dynamic Authenticated User Badge Indicator */}
        <div className="p-4 mx-3 my-3 bg-slate-950/60 rounded-xl border border-slate-800 text-left">
          <span className="text-[9px] font-mono font-bold text-emerald-450 uppercase tracking-widest block">Logged in as:</span>
          <span className="text-xs font-bold text-slate-100 block truncate mt-0.5">{session.fullName}</span>
          <div className="flex items-center justify-between mt-1 text-[10px] text-slate-400 font-mono">
            <span>{session.badgeId}</span>
            <span className={`px-1 rounded text-[8px] font-semibold border ${
              session.role === 'admin' ? 'border-amber-500/30 text-amber-400 bg-amber-500/5' :
              session.role === 'pharmacist' ? 'border-teal-500/30 text-teal-400 bg-teal-500/5' :
              'border-sky-500/30 text-sky-400 bg-sky-500/5'
            }`}>
              {session.role.toUpperCase()}
            </span>
          </div>
        </div>

        {/* Desktop Tab links list */}
        <nav className="flex-1 p-4 space-y-1">
          {permittedNavigationItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id as any);
                  setSelectedRefillId(null);
                  setSelectedPatientId(null);
                }}
                className={`w-full px-4 py-3 text-sm font-medium rounded-xl flex items-center gap-3.5 transition cursor-pointer ${
                  isActive 
                    ? 'bg-emerald-600 text-white shadow-sm' 
                    : 'text-slate-400 hover:bg-slate-800/80 hover:text-slate-100'
                }`}
              >
                <Icon className="w-5 h-5 shrink-0" />
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Logout Control and Version Info */}
        <div className="p-4 border-t border-slate-800 space-y-3">
          <button 
            onClick={handleLogout}
            className="w-full text-left px-4 py-2.5 bg-slate-850 hover:bg-rose-950/30 hover:text-rose-450 text-slate-400 text-xs font-semibold rounded-xl flex items-center gap-3 transition cursor-pointer border border-transparent hover:border-rose-900/40"
          >
            <LogOut className="w-4 h-4 text-rose-500 shrink-0" />
            <span>Logout Portal</span>
          </button>

          <div className="text-[10px] text-slate-500 font-mono tracking-wide">
            <p>RxPortal v2.10.4</p>
            <p className="mt-0.5">&copy; 2026 Cloud Pharmacy Inc.</p>
          </div>
        </div>
      </aside>

      {/* Mobile Top Navigation Bar */}
      <header className="md:hidden bg-slate-900 text-slate-100 px-4 py-3 flex items-center justify-between shadow-md shrink-0">
        <div className="flex items-center gap-2 text-left">
          <div className="p-1.5 bg-emerald-500 text-white rounded-lg">
            <HeartPulse className="w-5 h-5" />
          </div>
          <div>
            <span className="font-bold text-sm tracking-tight block">RxFlow Portal</span>
            <span className="text-[8px] text-slate-400 font-mono block">{session.fullName} ({session.role.toUpperCase()})</span>
          </div>
        </div>

        <button 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-1.5 hover:bg-slate-800 text-slate-400 rounded-lg cursor-pointer"
        >
          {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </header>

      {/* Mobile Sidebar dropdown Drawer */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="md:hidden absolute top-[52px] left-0 right-0 bg-slate-900 border-b border-slate-800 p-4 z-50 space-y-3 shadow-lg"
          >
            <div className="space-y-1">
              {permittedNavigationItems.map(item => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id as any);
                      setSelectedRefillId(null);
                      setSelectedPatientId(null);
                      setIsMobileMenuOpen(false);
                    }}
                    className={`w-full px-4 py-2.5 text-xs font-semibold rounded-lg flex items-center gap-3 transition cursor-pointer ${
                      isActive 
                        ? 'bg-emerald-600 text-white' 
                        : 'text-slate-400 hover:bg-slate-800'
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    {item.label}
                  </button>
                );
              })}
            </div>

            <div className="pt-3 border-t border-slate-800">
              <button 
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  handleLogout();
                }}
                className="w-full text-left px-4 py-2 bg-slate-850 hover:bg-rose-950/40 hover:text-rose-400 text-slate-400 text-xs font-semibold rounded-lg flex items-center gap-3 transition cursor-pointer"
              >
                <LogOut className="w-4 h-4 text-rose-500 shrink-0" />
                <span>Logout Session</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Core View Area */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto max-w-7xl mx-auto w-full transition-all">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.15 }}
          >
            {activeTab === 'dashboard' && (
              <Dashboard 
                medications={medications}
                patients={patients}
                refills={refills}
                deliveries={deliveries}
                setView={(v: any) => setActiveTab(v)}
                setSelectedRefillId={setSelectedRefillId}
                setSelectedPatientId={setSelectedPatientId}
              />
            )}

            {activeTab === 'medications' && (
              <MedicationCatalog 
                medications={medications}
                onUpdateStock={handleUpdateStock}
                onAddMedication={handleAddMedication}
                onDeleteMedication={handleDeleteMedication}
                onEditMedication={handleEditMedication}
                onImportMedications={handleImportMedications}
              />
            )}

            {activeTab === 'dispensing' && (
              <DispensingModule 
                refills={refills}
                patients={patients}
                medications={medications}
                onUpdateRefillStatus={handleUpdateRefillStatus}
                onAddPatient={handleAddPatient}
                onImportRefills={handleImportRefills}
              />
            )}

            {activeTab === 'refills' && (
              <RefillManager 
                refills={refills}
                patients={patients}
                medications={medications}
                onUpdateRefillStatus={handleUpdateRefillStatus}
                onCreateDelivery={handleCreateDelivery}
                onUpdateRefillPaymentState={handleUpdateRefillPaymentState}
                selectedRefillId={selectedRefillId}
                setSelectedRefillId={setSelectedRefillId}
                onImportRefills={handleImportRefills}
                onDeleteRefill={handleDeleteRefill}
              />
            )}

            {activeTab === 'deliveries' && (
              <DeliveryTracker 
                deliveries={deliveries}
                patients={patients}
                refills={refills}
                onUpdateDeliveryStatus={handleUpdateDeliveryStatus}
                onUpdateDeliveryProgress={handleUpdateDeliveryProgress}
                onUpdateDeliveryPaymentState={handleUpdateDeliveryPaymentState}
                onSendDriverMessage={handleSendDriverMessage}
                onUpdateDeliveryDriverAndArea={handleUpdateDeliveryDriverAndArea}
                onDeleteDelivery={handleDeleteDelivery}
              />
            )}

            {activeTab === 'crm' && (
              <CRMHub 
                patients={patients}
                onAddPatientNote={handleAppendPatientNote}
                onAddPatient={handleAddPatient}
                onDeletePatient={handleDeletePatient}
                onEditPatient={handleEditPatient}
                selectedPatientId={selectedPatientId}
                setSelectedPatientId={setSelectedPatientId}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Quick Mobile Sticky Foot-rail for hand access (Optional overlay) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 py-1.5 px-3 flex justify-around items-center z-45 shadow-lg">
        {permittedNavigationItems.map(item => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id as any);
                setSelectedRefillId(null);
                setSelectedPatientId(null);
              }}
              className={`flex flex-col items-center gap-0.5 p-1 transition cursor-pointer ${
                isActive ? 'text-emerald-600 font-bold' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <Icon className="w-5 h-5 shrink-0" />
              <span className="text-[9px] tracking-tight">{item.label.replace('Courier ', '')}</span>
            </button>
          );
        })}
      </nav>
      {/* Spacer to protect visual floor elements from being hidden behind sticky on mobile layout */}
      <div className="md:hidden h-14 shrink-0" />
    </div>
  );
}
