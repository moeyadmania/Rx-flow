/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  UserPlus, 
  UploadCloud, 
  FileText, 
  CheckCircle, 
  AlertCircle, 
  Package, 
  Coins, 
  IdCard, 
  Layers, 
  ArrowRight,
  ShieldAlert,
  UserCheck,
  Globe,
  Activity,
  Shield,
  HeartPulse,
  History,
  Send,
  Check,
  FileCode,
  Sparkles,
  Cpu,
  Trash2
} from 'lucide-react';
import { Patient, Medication, RefillRequest } from '../types';

interface DispensingModuleProps {
  refills: RefillRequest[];
  patients: Patient[];
  medications: Medication[];
  onUpdateRefillStatus: (id: string, status: RefillRequest['status'], notes?: string) => void;
  onAddPatient: (patient: Omit<Patient, 'id' | 'notes'>) => void;
  onImportRefills: (refills: any[], patients: any[]) => void;
}

// Pre-defined pharmacists list for on-duty selection
const pharmacistsList = [
  { id: 'pharm-1', name: 'Dr. Moeyad, PharmD', license: 'PH-992841', status: 'On Duty', role: 'Head Pharmacist' },
  { id: 'pharm-2', name: 'Dr. A, PharmD', license: 'PH-110294', status: 'On Duty', role: 'Operations Lead' },
  { id: 'pharm-3', name: 'Dr. B, RPh', license: 'PH-443209', status: 'On Duty', role: 'Staff Compounder' }
];

// Prescriptions submitted online telehealth orders
const initialOnlinePrescriptions = [
  { id: 'erx-1', patientName: 'Gwen Stacy', phone: '+1 (555) 102-4912', email: 'gwen@midtown-high.edu', dob: '2001-08-11', medicationName: 'Amoxicillin', dosage: '250mg thrice daily', quantity: 30, copay: 5.00, clinicName: 'Midtown Telehealth Care', physician: 'Dr. Helen Cho', urgency: 'Urgent', date: 'Just now' },
  { id: 'erx-2', patientName: 'Clark Kent', phone: '+1 (555) 700-1938', email: 'ckent@dailyplanet.com', dob: '1981-05-18', medicationName: 'Atorvastatin', dosage: '20mg nightly', quantity: 90, copay: 12.00, clinicName: 'Metropolis Health Trust', physician: 'Dr. Emil Hamilton', urgency: 'Standard', date: '10 mins ago' },
  { id: 'erx-3', patientName: 'Diana Prince', phone: '+1 (555) 808-0192', email: 'diana@themyscira.gov', dob: '1976-11-22', medicationName: 'Lisinopril', dosage: '20mg once daily', quantity: 30, copay: 0.00, clinicName: 'Sears Urgent Telemedicine', physician: 'Dr. Charles McNider', urgency: 'Standard', date: '1 hour ago' },
];

export default function DispensingModule({
  refills,
  patients,
  medications,
  onUpdateRefillStatus,
  onAddPatient,
  onImportRefills
}: DispensingModuleProps) {
  // Navigation tabs within dispensing module: 'queue' | 'add-patient' | 'bulk-import' | 'online-meds' | 'insurance'
  const [innerTab, setInnerTab] = useState<'queue' | 'add-patient' | 'bulk-import' | 'online-meds' | 'insurance'>('queue');
  
  // Active selected pharmacist managing session
  const [activePharmacist, setActivePharmacist] = useState(pharmacistsList[0]);
  
  // Selected prescription card in dispensing queue
  const [selectedRefillId, setSelectedRefillId] = useState<string | null>(null);
  const [dispenseResult, setDispenseResult] = useState<string | null>(null);
  const [dispenseError, setDispenseError] = useState<string | null>(null);
  const [packagingNote, setPackagingNote] = useState('');

  // Multi-step workflow state for selected prescription
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1);
  
  // Step 1 checkmarks
  const [step1CheckRx, setStep1CheckRx] = useState(false);
  const [step1CheckId, setStep1CheckId] = useState(false);
  
  // Step 2 parameters (Medication to be Dispensed details)
  const [compoundedLotNumber, setCompoundedLotNumber] = useState('LOT-2026-X4A');
  const [compoundedExpiryDate, setCompoundedExpiryDate] = useState('2028-12-15');
  const [verifiedTabletCount, setVerifiedTabletCount] = useState<number>(30);
  const [labelVerified, setLabelVerified] = useState(false);
  
  // Step 3 parameter
  const [claimVerified, setClaimVerified] = useState(false);

  // Manual Patient form states
  const [patName, setPatName] = useState('');
  const [patDob, setPatDob] = useState('');
  const [patPhone, setPatPhone] = useState('');
  const [patEmail, setPatEmail] = useState('');
  const [patInsurance, setPatInsurance] = useState('');
  const [patAllergies, setPatAllergies] = useState('');
  const [patConditions, setPatConditions] = useState('');
  const [patientSuccess, setPatientSuccess] = useState<string | null>(null);

  // File drag-and-drop state
  const [isDragging, setIsDragging] = useState(false);
  const [isParsing, setIsParsing] = useState(false);
  const [parsedData, setParsedData] = useState<{patients: any[], refills: any[]} | null>(null);
  const [fileParseError, setFileParseError] = useState<string | null>(null);

  // Online Medications Module state
  const [onlineEprescriptions, setOnlineEprescriptions] = useState(initialOnlinePrescriptions);
  const [showManualOnlineForm, setShowManualOnlineForm] = useState(false);
  const [onlineName, setOnlineName] = useState('');
  const [onlineDob, setOnlineDob] = useState('');
  const [onlinePhone, setOnlinePhone] = useState('');
  const [onlineEmail, setOnlineEmail] = useState('');
  const [onlineMedName, setOnlineMedName] = useState('');
  const [onlineDosage, setOnlineDosage] = useState('');
  const [onlineQty, setOnlineQty] = useState(30);
  const [onlineCopay, setOnlineCopay] = useState(10.00);
  const [onlineClinic, setOnlineClinic] = useState('Online Telehealth Portal');
  const [onlinePhysician, setOnlinePhysician] = useState('Dr. Moeyad M.');
  const [onlineUrgency, setOnlineUrgency] = useState<'Standard' | 'Urgent'>('Standard');

  const [consultSelectedPatient, setConsultSelectedPatient] = useState('Gwen Stacy');
  const [consultNotes, setConsultNotes] = useState('');
  const [consultHistory, setConsultHistory] = useState([
    { id: 1, sender: 'Gwen Stacy', message: 'Hello! Will the Amoxicillin interact with my morning probiotics?', timestamp: '5 mins ago' },
    { id: 2, sender: 'Pharmacist', message: 'Hi Gwen! Probiotics can be taken, but wait at least 2 hours after the Amoxicillin to ensure therapeutic effect.', timestamp: '4 mins ago' }
  ]);

  // Insurance Claims Module state
  const [insurancePayerSelected, setInsurancePayerSelected] = useState('Blue Cross Blue Shield Gold PPO');
  const [claimPatientId, setClaimPatientId] = useState('');
  const [claimMedId, setClaimMedId] = useState('');
  const [billingIcdCode, setBillingIcdCode] = useState('ICD-10-CM J45.909 (Asthma)');
  const [isAdjudicating, setIsAdjudicating] = useState(false);
  const [adjudicateStatusLog, setAdjudicateStatusLog] = useState<string[]>([]);
  const [claimSuccessMsg, setClaimSuccessMsg] = useState<string | null>(null);
  const [claimHistoryList, setClaimHistoryList] = useState([
    { id: 'CLM-582910', patientName: 'Bruce Wayne', medication: 'Atorvastatin 20mg', carrier: 'Medicare Platinum Plan', status: 'Approved', billingCode: 'ICD-10-CM E78.5', payerCovered: 48.00, patientCopay: 12.00, timestamp: '12 Mins Ago', authCode: 'AUTH-MC-449102' },
    { id: 'CLM-382901', patientName: 'Peter Parker', medication: 'ProAir HFA 90mcg', carrier: 'Shield Mutual HSA', status: 'Approved', billingCode: 'ICD-10-CM J45.909', payerCovered: 55.00, patientCopay: 10.00, timestamp: '1 Hour Ago', authCode: 'AUTH-SH-112204' }
  ]);
  const [priorAuthsList, setPriorAuthsList] = useState([
    { id: 'PA-8041', patientName: 'Peggy Carter', medication: 'Humira (Adalimumab)', carrier: 'Vance Shield', status: 'Pending Review Code', reason: 'High-cost Specialty Tier 4' },
    { id: 'PA-9011', patientName: 'Selina Kyle', medication: 'Ozempic 1mg Pen', carrier: 'Blue Cross Blue Shield', status: 'Approved Override', reason: 'Diagnostic charts validated' }
  ]);

  // Handle refill selection reset
  useEffect(() => {
    if (selectedRefillId) {
      setCurrentStep(1);
      setStep1CheckRx(false);
      setStep1CheckId(false);
      setLabelVerified(false);
      setClaimVerified(false);
      
      const refill = refills.find(r => r.id === selectedRefillId);
      if (refill) {
        setVerifiedTabletCount(30);
        // Generate pseudo lot and expiry for authenticity
        const baseNum = Math.floor(100 + Math.random() * 900);
        setCompoundedLotNumber(`LOT-2026-X${baseNum}`);
        setCompoundedExpiryDate('2028-11-30');
      }
    }
  }, [selectedRefillId]);

  // Filter queues that are ready to be dispensed ('approved' or 'pending' or 'review')
  const dispensingQueue = refills.filter(r => r.status === 'approved' || r.status === 'pending' || r.status === 'review');

  // Submit manual patient registration
  const handleRegisterPatientSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!patName.trim() || !patPhone.trim()) {
      setDispenseError("Patient Name and Contact number are required.");
      return;
    }

    const allergyList = patAllergies.split(',').map(a => a.trim()).filter(Boolean);
    const conditionList = patConditions.split(',').map(c => c.trim()).filter(Boolean);
    
    onAddPatient({
      name: patName,
      phone: patPhone,
      email: patEmail || `${patName.replace(/\s+/g, '').toLowerCase()}@cloudrx-crm.com`,
      dob: patDob || '1990-01-01',
      insuranceProvider: patInsurance || 'Self-Insured',
      allergies: allergyList,
      chronicConditions: conditionList,
      tags: allergyList.length > 0 ? ['Allergy Alert', 'Active Care'] : ['Active Care']
    });

    setPatientSuccess(`Patient "${patName}" registered successfully! They are now ready for medication requests.`);
    
    // Clear fields
    setPatName('');
    setPatDob('');
    setPatPhone('');
    setPatEmail('');
    setPatInsurance('');
    setPatAllergies('');
    setPatConditions('');

    setTimeout(() => {
      setPatientSuccess(null);
      setInnerTab('queue'); // return to dispensing queue automatic trigger
    }, 3000);
  };

  // Perform chemical package verification & Mark as dispensed
  const handleDispenseRefill = (refillId: string) => {
    const refill = refills.find(r => r.id === refillId);
    if (!refill) return;

    const med = medications.find(m => m.id === refill.medicationId);
    if (!med) {
      setDispenseError("Target drug profile not found in active inventory registry.");
      return;
    }

    // Safety checks / Contraindication alerts
    const patient = patients.find(p => p.id === refill.patientId);
    const matchedAllergy = patient?.allergies.some(allergy => 
      med.name.toLowerCase().includes(allergy.toLowerCase()) || 
      med.genericName.toLowerCase().includes(allergy.toLowerCase())
    );

    if (matchedAllergy) {
      const proceed = confirm(`⚠️ CLINICAL SECURITY ALERT: Patient ${patient?.name} is flagged with allergies list: [${patient?.allergies.join(', ')}]. This drug (${med.name}) may trigger a severe clinical reaction. Are you sure you wish to override FDA warnings?`);
      if (!proceed) {
        setDispenseError(`Dispensing aborted. FDA conflict: ${med.name} contains chemicals the client is allergic to.`);
        return;
      }
    }

    if (med.stock < 30) {
      const proceed = confirm(`⚠️ INVENTORY SHORTAGE ALERT: Active registry stocks are down to ${med.stock} units. Warning threshold is ${med.minStock}. Do you want to check out this bottle?`);
      if (!proceed) return;
    }

    // Capture signoff information
    const formattedSignoffNotes = `${packagingNote || 'Lot compound barcodes verified.'} (Dispensed Lot: ${compoundedLotNumber}, Exp: ${compoundedExpiryDate}, Verified Pill Tally: ${verifiedTabletCount}, Authorized Pharmacist Session Signoff: ${activePharmacist.name} (License Code: ${activePharmacist.license}))`;

    // Call onUpdateRefillStatus to trigger state transition
    onUpdateRefillStatus(refillId, 'dispensed', formattedSignoffNotes);
    
    setDispenseResult(`Prescription ${refill.rxNumber} has been safely bottled, chemical barcodes validated under ${activePharmacist.name}, and registered as DISPENSED. Stock level updated.`);
    setPackagingNote('');
    setSelectedRefillId(null);
    setDispenseError(null);

    // Reset workflow stepper
    setCurrentStep(1);

    setTimeout(() => setDispenseResult(null), 5000);
  };

  // Telehealth e-Rx integration
  const handleIngestEprescription = (erxId: string) => {
    const order = onlineEprescriptions.find(o => o.id === erxId);
    if (!order) return;

    // Map medication name to medicine database ID
    let foundMed = medications.find(m => m.name.toLowerCase().includes(order.medicationName.toLowerCase()));
    if (!foundMed) {
      // Create fallback match
      foundMed = medications[0];
    }

    const rxNumberGen = 'RX-' + Math.floor(100000 + Math.random() * 900000);
    
    const parsedRef = [{
      patientName: order.patientName,
      medicationName: foundMed?.name || order.medicationName,
      quantity: order.quantity,
      copay: order.copay,
      dosage: order.dosage,
      phone: order.phone,
      insuranceProvider: 'Medicare Platinum',
      rxNumber: rxNumberGen
    }];

    const parsedPat = [{
      name: order.patientName,
      phone: order.phone,
      email: order.email,
      dob: order.dob,
      insuranceProvider: 'Medicare Platinum',
      allergies: [],
      chronicConditions: []
    }];

    onImportRefills(
      [{
        patientId: `NAME:${order.patientName}`,
        medicationId: foundMed?.id || 'med-1',
        refillNumber: 1,
        maxRefills: 3,
        requestDate: new Date().toISOString(),
        rxNumber: rxNumberGen,
        status: 'approved' as const,
        notes: `Auto ingested via secure Telehealth Online Ingestion. Clinic: ${order.clinicName}. Practitioner: ${order.physician}.`,
        physicianName: order.physician,
        paymentMode: 'credit' as const,
        paymentStatus: 'paid' as const
      }],
      parsedPat
    );

    // Remove from incoming list
    setOnlineEprescriptions(prev => prev.filter(o => o.id !== erxId));
    setDispenseResult(`Telehealth e-Rx ingested! Connected patient "${order.patientName}" and scheduled high priority prescription ${rxNumberGen} inside the Dispensing Queue.`);
    
    setTimeout(() => setDispenseResult(null), 5000);
  };

  // Delete/dismiss telehealth prescription
  const handleDeleteEprescription = (erxId: string) => {
    const rx = onlineEprescriptions.find(o => o.id === erxId);
    setOnlineEprescriptions(prev => prev.filter(o => o.id !== erxId));
    setDispenseResult(`Telehealth e-Rx request dismissed and removed for patient "${rx?.patientName || 'Unknown Patient'}".`);
    setTimeout(() => setDispenseResult(null), 4000);
  };

  // Submit manual e-Rx telehealth registration
  const handleAddManualOnlineEprescription = (e: React.FormEvent) => {
    e.preventDefault();
    if (!onlineName.trim() || !onlineMedName.trim()) {
      setDispenseError("Please fill in both Patient Name and Medication Name.");
      return;
    }
    const newErx = {
      id: `erx-manual-${Date.now()}`,
      patientName: onlineName,
      phone: onlinePhone || '+1 (555) 555-0199',
      email: onlineEmail || `${onlineName.toLowerCase().replace(/\s+/g, '')}@online-portal.com`,
      dob: onlineDob || '1995-12-12',
      medicationName: onlineMedName,
      dosage: onlineDosage || '1 tablet daily',
      quantity: Number(onlineQty) || 30,
      copay: Number(onlineCopay) || 10.00,
      clinicName: onlineClinic || 'Local Telehealth Portal',
      physician: onlinePhysician || 'Dr. Moeyad M.',
      urgency: onlineUrgency,
      date: 'Just now'
    };
    setOnlineEprescriptions(prev => [newErx, ...prev]);
    
    // Clear fields
    setOnlineName('');
    setOnlineDob('');
    setOnlinePhone('');
    setOnlineEmail('');
    setOnlineMedName('');
    setOnlineDosage('');
    setOnlineQty(30);
    setOnlineCopay(10.00);
    setOnlineUrgency('Standard');
    setShowManualOnlineForm(false);
    
    setDispenseResult(`Successfully added online telehealth e-Rx for patient "${onlineName}".`);
    setDispenseError(null);
    setTimeout(() => setDispenseResult(null), 4500);
  };

  // Simulate incoming e-prescription ordered online
  const handleSimulateIncomingErx = () => {
    const listNames = ['Selina Kyle', 'Stephen Strange', 'Diana Prince', 'Arthur Curry', 'Barry Allen', 'Hal Jordan'];
    const listMeds = ['Lipitor', 'Amoxicillin', 'Lisinopril', 'Metformin', 'Gabapentin', 'Albuterol'];
    const listCli = ['Gotham City Clinic', 'St. Jude Health Network', 'Metropolitan Care Desk', 'Horizon Telemedicine'];
    const listDocs = ['Dr. Leslie Thompkins', 'Dr. Donald Blake', 'Dr. Leonard McCoy', 'Dr. Julius No'];

    const chosenName = listNames[Math.floor(Math.random() * listNames.length)];
    const chosenMed = listMeds[Math.floor(Math.random() * listMeds.length)];
    const chosenClinic = listCli[Math.floor(Math.random() * listCli.length)];
    const chosenDoc = listDocs[Math.floor(Math.random() * listDocs.length)];
    const randomId = 'erx-' + Date.now();

    const newErx = {
      id: randomId,
      patientName: chosenName,
      phone: '+1 (555) ' + Math.floor(100 + Math.random() * 900) + '-' + Math.floor(1000 + Math.random() * 9000),
      email: `${chosenName.toLowerCase().replace(' ', '')}@telehealth-intake.com`,
      dob: '1988-04-' + Math.floor(10 + Math.random() * 18),
      medicationName: chosenMed,
      dosage: '1 capsule daily with food',
      quantity: 30,
      copay: parseFloat((5 + Math.random() * 20).toFixed(2)),
      clinicName: chosenClinic,
      physician: chosenDoc,
      urgency: Math.random() > 0.5 ? 'Urgent' : 'Standard',
      date: 'Just now'
    };

    setOnlineEprescriptions(prev => [newErx, ...prev]);
  };

  // Live Chat advisor simulation
  const handleSendLiveAdvice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!consultNotes.trim()) return;

    const userMsg = { id: Date.now(), sender: 'Pharmacist', message: consultNotes, timestamp: 'Just now' };
    setConsultHistory(prev => [...prev, userMsg]);
    setConsultNotes('');

    // Simulate patient response
    setTimeout(() => {
      const answers = [
        "Thank you so much, Doctor! That gives me absolute peace of mind.",
        "Understood. I will adjust my schedule and set an alarm for taking this properly.",
        "Will do. If I experience any odd reactions, I will contact this help desk immediately.",
        "Perfect. I appreciate the online guidance, let the logistics team dispatch it soon."
      ];
      const randomAnswer = answers[Math.floor(Math.random() * answers.length)];
      setConsultHistory(prev => [...prev, {
        id: Date.now() + 1,
        sender: consultSelectedPatient,
        message: randomAnswer,
        timestamp: 'Just now'
      }]);
    }, 1500);
  };

  // Insurance Adjudication Simulation run
  const handleExecuteLiveAdjudication = (e: React.FormEvent) => {
    e.preventDefault();
    if (!claimPatientId || !claimMedId) {
      alert('Please select both a patient profile and medication structure to perform the claim simulation.');
      return;
    }

    setIsAdjudicating(true);
    setAdjudicateStatusLog([]);
    setClaimSuccessMsg(null);

    const targetPatient = patients.find(p => p.id === claimPatientId);
    const targetMed = medications.find(m => m.id === claimMedId);

    const steps = [
      `Connecting to PBM switch using gateway IP 10.231.42.1...`,
      `Validating Cardholder ID & Group ID under Plan sponsor: ${insurancePayerSelected}...`,
      `Locating National Drug Code (NDC) for: ${targetMed?.name || 'Medication'}...`,
      `Refining pharmacy formulary tier coverage matrix (ICD code check: ${billingIcdCode})...`,
      `Calculating co-insurance payout ratios & deductible threshold parameters...`,
    ];

    let currentLogIndex = 0;
    const interval = setInterval(() => {
      if (currentLogIndex < steps.length) {
        setAdjudicateStatusLog(prev => [...prev, steps[currentLogIndex]]);
        currentLogIndex++;
      } else {
        clearInterval(interval);
        
        // Complete claim with mock figures
        const baseCost = targetMed?.price || 45.0;
        const patientCopayPct = Math.random() > 0.5 ? 0.2 : 0.15;
        const exactCopay = parseFloat((baseCost * patientCopayPct).toFixed(2));
        const exactPayer = parseFloat((baseCost - exactCopay).toFixed(2));
        const randAuth = 'AUTH-AD-' + Math.floor(100000 + Math.random() * 900000);
        const randClmId = 'CLM-' + Math.floor(100000 + Math.random() * 900000);

        const newClaim = {
          id: randClmId,
          patientName: targetPatient?.name || 'Walk-in Client',
          medication: `${targetMed?.name || 'Formulation'} ${targetMed?.dosage || ''}`,
          carrier: insurancePayerSelected,
          status: 'Approved',
          billingCode: billingIcdCode,
          payerCovered: exactPayer,
          patientCopay: exactCopay,
          timestamp: 'Just Now',
          authCode: randAuth
        };

        setClaimHistoryList(prev => [newClaim, ...prev]);
        setClaimSuccessMsg(`Claim Successfully APPROVED! Auth Code: ${randAuth}. Copay adjusted to $${exactCopay.toFixed(2)}. This data has been synchronized with the patient's continuous billing schedule.`);
        
        // If there happens to be a matching refill for this patient & medication, update its copay value!
        const matchingRefill = refills.find(r => r.patientId === claimPatientId && r.medicationId === claimMedId && (r.status === 'pending' || r.status === 'approved'));
        if (matchingRefill) {
          matchingRefill.copay = exactCopay;
        }

        setIsAdjudicating(false);
      }
    }, 700);
  };

  // Oversee Prior Authorization list overrides
  const handleApprovePriorAuthOverride = (paId: string) => {
    setPriorAuthsList(prev => prev.map(pa => {
      if (pa.id === paId) {
        return { ...pa, status: 'Approved Override' };
      }
      return pa;
    }));
    setDispenseResult(`Specialty drug Clinical Override has been electronically signed. Insurance will cover Tier 4 copay rate.`);
    setTimeout(() => setDispenseResult(null), 3000);
  };

  // Drag and drop processing
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      processDispensingFile(files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      processDispensingFile(files[0]);
    }
  };

  const processDispensingFile = (file: File) => {
    setIsParsing(true);
    setFileParseError(null);
    setParsedData(null);

    const ext = file.name.split('.').pop()?.toLowerCase();

    setTimeout(() => {
      const reader = new FileReader();
      
      reader.onload = (event) => {
        const text = event.target?.result as string;
        try {
          if (ext === 'csv') {
            const lines = text.split(/\r?\n/);
            if (lines.length < 2) {
              throw new Error('Spreadsheet file is missing column configurations.');
            }
            
            const headers = lines[0].split(',').map(h => h.trim().replace(/^["']|["']$/g, '').toLowerCase());
            const parsedPatients: any[] = [];
            const parsedRefills: any[] = [];

            for (let i = 1; i < lines.length; i++) {
              if (!lines[i].trim()) continue;
              const cols = lines[i].split(',').map(c => c.trim().replace(/^["']|["']$/g, ''));

              const getVal = (possibleHeaders: string[], fallbackVal = '') => {
                const idx = headers.findIndex(h => possibleHeaders.some(ph => h.includes(ph)));
                return idx !== -1 && cols[idx] ? cols[idx] : fallbackVal;
              };

              const name = getVal(['patient', 'name', 'client', 'full_name']);
              const phone = getVal(['phone', 'mobile', 'sms_number', 'contact'], '+1 (555) 304-4921');
              const medicine = getVal(['medication', 'drug', 'item', 'medicine']);
              
              if (!name || !medicine) continue;

              const allergens = getVal(['allergies', 'allergic_to', 'warnings'], '')
                ? getVal(['allergies', 'allergic_to', 'warnings']).split(';').map(s => s.trim()) 
                : [];

              parsedPatients.push({
                name,
                phone,
                email: getVal(['email', 'mail'], `${name.replace(/\s+/g, '').toLowerCase()}@clinical-import.com`),
                dob: getVal(['dob', 'birthdate', 'birth'], '1984-06-18'),
                insuranceProvider: getVal(['insurance', 'carrier', 'plan'], 'Medicare Platinum'),
                allergies: allergens,
                chronicConditions: getVal(['chronic', 'conditions'], 'None').split(';').map(s => s.trim())
              });

              parsedRefills.push({
                patientName: name,
                medicationName: medicine,
                quantity: parseInt(getVal(['quantity', 'qty', 'count'], '30'), 10),
                copay: parseFloat(getVal(['copay', 'price', 'fee'], '15.00')),
                dosage: getVal(['dosage', 'strength', 'format'], '1 tablet daily'),
                phone: phone,
                insuranceProvider: getVal(['insurance', 'carrier', 'plan'], 'Medicare Platinum'),
                rxNumber: getVal(['rx', 'prescription', 'rx_id'], 'RX-' + Math.floor(100000 + Math.random() * 900000))
              });
            }

            if (parsedPatients.length === 0) {
              throw new Error('Could not identify any valid clinical rows (Patient, Medication structure matching).');
            }

            setParsedData({ patients: parsedPatients, refills: parsedRefills });
          } else {
            if (ext === 'xlsx' || ext === 'xls') {
              setParsedData({
                patients: [
                  { name: 'Peter Quill', phone: '+1 (555) 893-1029', email: 'starlord@guardians.org', dob: '1979-11-04', insuranceProvider: 'Aegis Health', allergies: ['Penicillin'], chronicConditions: ['None'] },
                  { name: 'Peggy Carter', phone: '+1 (555) 743-9182', email: 'pcarter@ssr.gov', dob: '1921-04-09', insuranceProvider: 'Vance Shield', allergies: [], chronicConditions: ['Arthritis'] }
                ],
                refills: [
                  { patientName: 'Peter Quill', medicationName: 'Amoxil', quantity: 30, copay: 10.00, dosage: '500mg daily', phone: '+1 (555) 893-1029', insuranceProvider: 'Aegis Health', rxNumber: 'RX-888492' },
                  { patientName: 'Peggy Carter', medicationName: 'Lipitor', quantity: 90, copay: 0.00, dosage: '20mg nightly', phone: '+1 (555) 743-9182', insuranceProvider: 'Vance Shield', rxNumber: 'RX-111002' }
                ]
              });
            } else if (ext === 'pdf') {
              setParsedData({
                patients: [
                  { name: 'Stephen Strange', phone: '+1 (555) 911-3829', email: 'doctor@strange.org', dob: '1969-12-14', insuranceProvider: 'Metropolitan Gold', allergies: ['Sulfa Drugs'], chronicConditions: ['Spinal Trauma'] }
                ],
                refills: [
                  { patientName: 'Stephen Strange', medicationName: 'Neurontin', quantity: 60, copay: 25.00, dosage: '300mg - 2 times daily', phone: '+1 (555) 911-3829', insuranceProvider: 'Metropolitan Gold', rxNumber: 'RX-434291' }
                ]
              });
            } else {
              throw new Error('Unsupported format. Please drop valid spreadsheet (.csv, .xlsx) or PDF medical orders.');
            }
          }
        } catch (err: any) {
          setFileParseError(err.message || 'Error occurred while analyzing clinical file.');
        } finally {
          setIsParsing(false);
        }
      };

      reader.onerror = () => {
        setFileParseError('Failed to read selected diagnostic file.');
        setIsParsing(false);
      };

      if (ext === 'csv') {
        reader.readAsText(file);
      } else {
        setIsParsing(false);
        if (ext === 'xlsx' || ext === 'xls') {
          setParsedData({
            patients: [
              { name: 'Arthur Curry', phone: '+1 (555) 238-1920', email: 'acurry@atlantis-marine.com', dob: '1982-01-29', insuranceProvider: 'Oceanic PPO', allergies: [], chronicConditions: [] }
            ],
            refills: [
              { patientName: 'Arthur Curry', medicationName: 'Zestril', quantity: 30, copay: 5.00, dosage: '10mg once daily', phone: '+1 (555) 238-1920', insuranceProvider: 'Oceanic PPO', rxNumber: 'RX-893049' }
            ]
          });
        } else if (ext === 'pdf') {
          setParsedData({
            patients: [
              { name: 'Wanda Maximoff', phone: '+1 (555) 616-1999', email: 'wanda@westview-tele.com', dob: '1989-10-10', insuranceProvider: 'S.W.O.R.D. Health', allergies: ['NSAIDs'], chronicConditions: ['High Stress'] }
            ],
            refills: [
              { patientName: 'Wanda Maximoff', medicationName: 'Glucophage', quantity: 60, copay: 15.00, dosage: '850mg once daily', phone: '+1 (555) 616-1999', insuranceProvider: 'S.W.O.R.D. Health', rxNumber: 'RX-777321' }
            ]
          });
        } else {
          setFileParseError('Unsupported extension. Use .csv, .xlsx, .xls, or .pdf');
        }
      }
    }, 1200);
  };

  const handleCommitBulkData = () => {
    if (!parsedData) return;

    const simpleRefills = parsedData.refills.map(r => {
      const drugMatch = medications.find(m => m.name.toLowerCase() === r.medicationName.toLowerCase());
      return {
        patientId: `NAME:${r.patientName}`,
        medicationId: drugMatch ? drugMatch.id : (medications[0]?.id || 'med-1'),
        refillNumber: 1,
        maxRefills: 4,
        requestDate: new Date().toISOString(),
        rxNumber: r.rxNumber,
        status: 'pending' as const,
        notes: `Imported via clinical drug dispensing file drag & drop. Strength: ${r.dosage}.`,
        physicianName: 'Dr. Auto Import',
        paymentMode: 'cash' as const,
        paymentStatus: 'unpaid' as const
      };
    });

    const simplePatients = parsedData.patients.map(p => ({
      name: p.name,
      phone: p.phone,
      email: p.email,
      dob: p.dob,
      insuranceProvider: p.insuranceProvider,
      allergies: p.allergies,
      chronicConditions: p.chronicConditions,
      tags: p.allergies.length > 0 ? ['Imported', 'Allergy Alert'] : ['Imported']
    }));

    onImportRefills(simpleRefills, simplePatients);
    
    setDispenseResult(`Processed file: Successfully registered ${parsedData.patients.length} patients and staged ${parsedData.refills.length} prescriptions in the dispensing queue.`);
    setParsedData(null);
    setInnerTab('queue');
    
    setTimeout(() => setDispenseResult(null), 5000);
  };

  return (
    <div className="space-y-6" id="dispensing-flow-panel">
      
      {/* Dynamic Upper Header Card with Pharmacist Selector */}
      <div className="bg-white p-5 border border-slate-100 rounded-2xl shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-5">
        <div>
          <h2 className="text-xl font-bold font-sans text-slate-800 flex items-center gap-2">
            <Package className="text-emerald-600 w-6 h-6 shrink-0" />
            Clinical Dispense Registry
          </h2>
          <p className="text-xs text-slate-400">Perform formulation lot checkouts, handle real-time insurance claims, manage online telehealth intakes, and sign safety validations.</p>
        </div>

        {/* Selected Pharmacist Selector on duty */}
        <div className="flex items-center gap-3 bg-slate-50 border border-slate-100 p-2.5 rounded-xl self-start lg:self-auto shadow-2xs">
          <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-extrabold text-[13px] uppercase font-mono">
            {activePharmacist.name.replace('Dr. ', '').charAt(0) || 'P'}
          </div>
          <div className="space-y-0.5 text-left">
            <label className="text-[9px] font-mono font-bold text-slate-400 block tracking-wider uppercase">Active Session Pharmacist</label>
            <select
              value={activePharmacist.id}
              onChange={(e) => {
                const matched = pharmacistsList.find(p => p.id === e.target.value);
                if (matched) setActivePharmacist(matched);
              }}
              className="text-xs font-semibold bg-transparent text-slate-800 focus:outline-none cursor-pointer border-none p-0 pr-6 font-sans select-none"
            >
              {pharmacistsList.map(p => (
                <option key={p.id} value={p.id}>{p.name} ({p.role})</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Main Module Tab Selectors */}
      <div className="flex flex-wrap gap-2 text-xs border-b border-slate-100 pb-2">
        <button
          onClick={() => setInnerTab('queue')}
          className={`px-4 py-2 font-semibold rounded-xl border transition cursor-pointer flex items-center gap-2 ${
            innerTab === 'queue' 
              ? 'bg-slate-800 text-white border-slate-800' 
              : 'bg-white text-slate-650 border-slate-205 hover:bg-slate-50'
          }`}
          id="tab-dispensing-queue"
        >
          <span>💊</span> Dispensing Queue ({dispensingQueue.length})
        </button>

        <button
          onClick={() => setInnerTab('online-meds')}
          className={`px-4 py-2 font-semibold rounded-xl border transition cursor-pointer flex items-center gap-2 ${
            innerTab === 'online-meds' 
              ? 'bg-indigo-600 text-white border-indigo-600' 
              : 'bg-white text-slate-650 border-slate-205 hover:bg-slate-50'
          }`}
          id="tab-online-meds"
        >
          <Globe className="w-4 h-4 text-indigo-50" />
          <span>🌐 Online Med Desk ({onlineEprescriptions.length})</span>
        </button>

        <button
          onClick={() => setInnerTab('insurance')}
          className={`px-4 py-2 font-semibold rounded-xl border transition cursor-pointer flex items-center gap-2 ${
            innerTab === 'insurance' 
              ? 'bg-sky-600 text-white border-sky-600' 
              : 'bg-white text-slate-650 border-slate-205 hover:bg-slate-50'
          }`}
          id="tab-insurance-claims"
        >
          <Shield className="w-4 h-4 text-sky-50" />
          <span>🛡️ Insurance Claims</span>
        </button>

        <button
          onClick={() => setInnerTab('add-patient')}
          className={`px-4 py-2 font-semibold rounded-xl border transition cursor-pointer flex items-center gap-2 ${
            innerTab === 'add-patient' 
              ? 'bg-emerald-600 text-white border-emerald-600' 
              : 'bg-white text-slate-650 border-slate-205 hover:bg-slate-50'
          }`}
          id="tab-register-patient"
        >
          <UserPlus className="w-4 h-4" />
          <span>Register Patient</span>
        </button>

        <button
          onClick={() => setInnerTab('bulk-import')}
          className={`px-4 py-2 font-semibold rounded-xl border transition cursor-pointer flex items-center gap-2 ${
            innerTab === 'bulk-import' 
              ? 'bg-purple-650 text-white border-purple-650' 
              : 'bg-white text-slate-650 border-slate-205 hover:bg-slate-50'
          }`}
          id="tab-document-importer"
        >
          <UploadCloud className="w-4 h-4" />
          <span>Clinic Doc Importer</span>
        </button>
      </div>

      {/* Global Success / Conflict notices */}
      {dispenseResult && (
        <div className="p-4 bg-emerald-50 border border-emerald-250 text-emerald-800 rounded-2xl text-xs sm:text-sm font-medium flex items-center gap-3 animate-fadeIn shadow-2xs">
          <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
          <p>{dispenseResult}</p>
        </div>
      )}

      {dispenseError && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl text-xs sm:text-sm font-medium flex items-center gap-3 animate-fadeIn shadow-2xs">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          <p>{dispenseError}</p>
        </div>
      )}

      {/* Workspace Panel switcher logic */}
      {innerTab === 'queue' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Column: Active Prescription List (4 Cols) */}
          <div className="lg:col-span-4 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest block">Approved Pharmacy Queue</span>
              <span className="text-[10px] font-mono font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                {dispensingQueue.length} Active Rx
              </span>
            </div>
            
            <div className="space-y-3 max-h-[550px] overflow-y-auto pr-1">
              {dispensingQueue.map(ref => {
                const patient = patients.find(p => p.id === ref.patientId);
                const med = medications.find(m => m.id === ref.medicationId);
                const isSelected = selectedRefillId === ref.id;

                return (
                  <div
                    key={ref.id}
                    onClick={() => {
                      setSelectedRefillId(ref.id);
                      setDispenseError(null);
                    }}
                    className={`p-4 bg-white border rounded-2xl shadow-xs cursor-pointer transition-all hover:bg-slate-50/50 block text-left ${
                      isSelected ? 'ring-2 ring-slate-800 border-transparent bg-slate-50/10' : 'border-slate-100'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-[9px] font-mono bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded-md font-bold uppercase tracking-wider">
                          {ref.rxNumber}
                        </span>
                        <h4 className="font-bold text-slate-850 text-sm mt-1 leading-snug">{patient?.name || 'Unknown Patient'}</h4>
                        <p className="text-xs text-slate-400 font-mono mt-0.5">DOB: {patient?.dob || 'N/A'}</p>
                      </div>

                      <span className={`text-[10px] font-bold font-mono px-2 py-0.5 rounded-lg ${
                        ref.status === 'approved' ? 'bg-emerald-50 text-emerald-700' :
                        ref.status === 'review' ? 'bg-amber-50 text-amber-700' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {ref.status.toUpperCase()}
                      </span>
                    </div>

                    <div className="mt-3 pt-3 border-t border-slate-50 flex items-center justify-between text-xs text-slate-600">
                      <div className="font-semibold text-slate-700">
                        {med?.name} <span className="font-mono text-[10px] text-slate-400 font-normal">({med?.dosage})</span>
                      </div>
                      <span className="font-mono bg-slate-100 text-[10px] px-1.5 py-0.5 rounded text-slate-700">Qty: 30</span>
                    </div>
                  </div>
                );
              })}

              {dispensingQueue.length === 0 && (
                <div className="p-8 text-center bg-white border border-dashed border-slate-200 rounded-2xl text-slate-400 text-xs">
                  No pending or approved prescriptions currently require dispensing. Everything packed!
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Interactive 4-step Verification & Dispensing Console (8 Cols) */}
          <div className="lg:col-span-8">
            {selectedRefillId ? (() => {
              const refill = refills.find(r => r.id === selectedRefillId)!;
              const patient = patients.find(p => p.id === refill.patientId)!;
              const med = medications.find(m => m.id === refill.medicationId)!;

              // Check for clinical allergy alert
              const hasAllergy = patient?.allergies.some(a => 
                med.name.toLowerCase().includes(a.toLowerCase()) || 
                med.genericName.toLowerCase().includes(a.toLowerCase())
              );

              return (
                <div className="bg-white border border-slate-100 p-6 rounded-2xl shadow-xs space-y-5 animate-fadeIn">
                  
                  {/* Console Header */}
                  <div className="flex justify-between items-center pb-4 border-b border-slate-100">
                    <div>
                      <h3 className="font-bold text-slate-800 text-base flex items-center gap-1.5">
                        <Activity className="w-5 h-5 text-emerald-600" />
                        Clinical Dispense Console
                      </h3>
                      <p className="text-xs text-slate-400">Step-by-step chemical clearance conducted by {activePharmacist.name}</p>
                    </div>

                    <span className="text-xs font-mono font-bold bg-slate-950 text-emerald-400 px-3 py-1 rounded-xl">
                      Prescription Barcode: {refill.rxNumber}
                    </span>
                  </div>

                  {/* Interactive Steps Indicators */}
                  <div className="grid grid-cols-4 gap-2 text-center text-[10px] font-bold">
                    {[
                      { step: 1, label: '1. Rx Integrity' },
                      { step: 2, label: '2. Drug Compound' },
                      { step: 3, label: '3. Insurance Claim' },
                      { step: 4, label: '4. Lot Release' }
                    ].map(st => (
                      <div
                        key={st.step}
                        onClick={() => {
                          // Allow free movement back and forth to inspect if they want
                          setCurrentStep(st.step as any);
                        }}
                        className={`py-2 rounded-xl border transition cursor-pointer ${
                          currentStep === st.step
                            ? 'bg-slate-800 text-white border-slate-800'
                            : currentStep > st.step
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                              : 'bg-slate-50 text-slate-400 border-slate-200'
                        }`}
                      >
                        {st.label}
                      </div>
                    ))}
                  </div>

                  {/* STEP 1 WORKFLOW CONTENT */}
                  {currentStep === 1 && (
                    <div className="space-y-4 animate-fadeIn text-xs">
                      <div className="bg-slate-50 p-4 rounded-xl space-y-3 border border-slate-100">
                        <h4 className="font-bold text-slate-700 flex items-center gap-1.5">
                          <span>🔍</span> Stage 1: Prescription Integrity & Demographics Audit
                        </h4>
                        <p className="text-slate-400 leading-normal">
                          Perform diagnostic verification on the physician prescription signature, patient credentials and clinical warnings before preparing chemicals.
                        </p>
                      </div>

                      {hasAllergy && (
                        <div className="p-4 bg-amber-50 border border-amber-250 text-amber-900 rounded-xl flex items-start gap-3 leading-relaxed">
                          <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                          <div>
                            <p className="font-bold">CRITICAL CLINICAL SECURE ALERT: PATIENT ALLERGY DETECTED</p>
                            <p className="mt-1">
                              Patient {patient.name} has recorded allergy flags list: <strong>[{patient.allergies.join(', ')}]</strong>. 
                              Dispensing {med.name} ({med.genericName}) will trigger conflict warnings.
                            </p>
                          </div>
                        </div>
                      )}

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="border border-slate-100 p-4 rounded-xl space-y-1.5 h-full">
                          <span className="text-[9px] font-bold font-mono text-slate-400 uppercase">Patient Profile</span>
                          <p className="text-sm font-bold text-slate-800">{patient?.name}</p>
                          <p className="text-slate-500">Contact: {patient?.phone}</p>
                          <p className="text-slate-500">Carrier: {patient?.insuranceProvider || 'Self-Sponsor'}</p>
                          <p className="text-slate-500">Allergies: {patient?.allergies.length ? patient.allergies.join(', ') : 'None'}</p>
                        </div>

                        <div className="border border-slate-100 p-4 rounded-xl space-y-1.5 h-full">
                          <span className="text-[9px] font-bold font-mono text-slate-400 uppercase">Physician Rx Parameters</span>
                          <p className="text-sm font-bold text-slate-800">{refill.physicianName}</p>
                          <p className="text-slate-500">Refill Staged Number: {refill.refillNumber} / {refill.maxRefills}</p>
                          <p className="text-slate-500">Request Date: {new Date(refill.requestDate).toLocaleDateString()}</p>
                          <p className="text-slate-500">System Notes: {refill.notes || 'None'}</p>
                        </div>
                      </div>

                      {/* Step 1 Signoffs */}
                      <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl space-y-3">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Required Audit Clearances</span>
                        
                        <label className="flex items-center gap-2.5 font-medium text-slate-700 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={step1CheckRx}
                            onChange={(e) => setStep1CheckRx(e.target.checked)}
                            className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300"
                          />
                          <span>Confirm original medical Rx signature is verified (Dr. {refill.physicianName})</span>
                        </label>

                        <label className="flex items-center gap-2.5 font-medium text-slate-700 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={step1CheckId}
                            onChange={(e) => setStep1CheckId(e.target.checked)}
                            className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300"
                          />
                          <span>Confirm patient date of birth ({patient?.dob}) belongs to recipient cardholder</span>
                        </label>
                      </div>

                      <div className="flex justify-end pt-2">
                        <button
                          type="button"
                          onClick={() => {
                            if (!step1CheckRx || !step1CheckId) {
                              alert('Please check both verification clearances to proceed to molecular compounding stage.');
                              return;
                            }
                            setCurrentStep(2);
                          }}
                          className="px-5 py-2.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl font-bold flex items-center gap-2 transition"
                        >
                          Proceed to Step 2: Compounding Check <ArrowRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* STEP 2 WORKFLOW CONTENT (Medications to be Dispensed Detailed View) */}
                  {currentStep === 2 && (
                    <div className="space-y-4 animate-fadeIn text-xs">
                      <div className="bg-slate-50 p-4 rounded-xl space-y-3 border border-slate-100">
                        <h4 className="font-bold text-slate-700 flex items-center gap-1.5">
                          <span>📦</span> Stage 2: Physical Compound & Barcode Verification
                        </h4>
                        <p className="text-slate-400">
                          Verify physical tablet dimensions, check current inventory safety thresholds, and enter lot code attributes for chemical tracking codes.
                        </p>
                      </div>

                      <div className="border border-slate-100 p-4 rounded-xl space-y-4">
                        <h5 className="font-bold text-slate-400 uppercase text-[9px] tracking-wider">Medication to be Dispensed</h5>
                        
                        {/* Live Drug Profile Card */}
                        <div className="flex flex-col sm:flex-row justify-between items-start gap-4 p-3.5 bg-slate-50 rounded-xl border border-slate-100">
                          <div className="space-y-1">
                            <span className="bg-indigo-50 text-indigo-700 text-[9px] px-1.5 py-0.5 rounded font-mono font-bold uppercase">
                              NDC 0006-0117-31
                            </span>
                            <p className="text-sm font-black text-slate-800 mt-1">{med.name}</p>
                            <p className="text-slate-500">Chemical Formula: <span className="font-mono">{med.genericName}</span></p>
                            <p className="text-slate-500">Therapeutic Target: {med.category}</p>
                            <p className="text-slate-550 flex items-center gap-1.5 text-[11px] font-medium pt-1">
                              <span>💊 Physical ID:</span>
                              <span className="text-slate-700 underline font-mono">
                                {med.id === 'med-1' ? 'White, Oval, Debossed "PD 15"' : 
                                 med.id === 'med-2' ? 'Blue, Round, Debossed "A-30"' : 
                                 med.id === 'med-3' ? 'Yellow, Capsule shape, Debossed "L-20"' : 'Standard pharmaceutical debossed tablet'}
                              </span>
                            </p>
                          </div>

                          <div className="text-left sm:text-right shrink-0">
                            <p className="text-[9px] font-mono uppercase text-slate-400">Inventory Stock Status</p>
                            <p className={`font-mono font-extrabold text-sm ${
                              med.stock < med.minStock ? 'text-rose-600' : 'text-emerald-700'
                            }`}>
                              {med.stock} Pills Left (Min: {med.minStock})
                            </p>
                          </div>
                        </div>

                        {/* Compound Lot Inputs */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-slate-500 block uppercase">Compound Lot Tracking Number</label>
                            <input
                              type="text"
                              value={compoundedLotNumber}
                              onChange={(e) => setCompoundedLotNumber(e.target.value)}
                              placeholder="e.g. LOT-2026-X8"
                              className="w-full bg-white border border-slate-205 rounded-lg p-2 font-mono text-[11px] text-slate-800"
                            />
                            <p className="text-[9px] text-slate-400">Lot assigned to this pill bottle dispensation.</p>
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-slate-500 block uppercase">chemical Expiration Date</label>
                            <input
                              type="date"
                              value={compoundedExpiryDate}
                              onChange={(e) => setCompoundedExpiryDate(e.target.value)}
                              className="w-full bg-white border border-slate-205 rounded-lg p-2 font-mono text-[11px] text-slate-800"
                            />
                            <p className="text-[9px] text-slate-400">Federal expiration check. Must exceed current date.</p>
                          </div>
                        </div>

                        {/* Quantity verify */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-slate-500 block uppercase">Pill Dispensing Tally Count</label>
                            <div className="flex items-center gap-2">
                              <input
                                type="number"
                                value={verifiedTabletCount}
                                onChange={(e) => setVerifiedTabletCount(parseInt(e.target.value, 10) || 0)}
                                className="w-24 bg-white border border-slate-205 rounded-lg p-2 font-semibold text-xs text-slate-800"
                              />
                              <span className="text-slate-400 text-xs">/ 30 pieces checked</span>
                            </div>
                            <p className="text-[9px] text-slate-400">Verifying count aligns with prescription instruction dosage.</p>
                          </div>

                          <div className="flex items-end">
                            <label className="flex items-center gap-2.5 font-medium text-slate-700 cursor-pointer p-2 bg-slate-50 border border-slate-100 rounded-lg w-full">
                              <input
                                type="checkbox"
                                checked={labelVerified}
                                onChange={(e) => setLabelVerified(e.target.checked)}
                                className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300"
                              />
                              <span className="text-[10px] leading-tight">Patient identification warning label printed & matched safely on the bottle</span>
                            </label>
                          </div>
                        </div>
                      </div>

                      <div className="flex justify-between pt-2">
                        <button
                          type="button"
                          onClick={() => setCurrentStep(1)}
                          className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 transition"
                        >
                          Back to Step 1
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            if (!compoundedLotNumber.trim() || !compoundedExpiryDate.trim() || verifiedTabletCount !== 30) {
                              alert(`Verify correct pill dispensing checklist. Please adjust pill tally count to exactly 30 tablets to match the prescription, and enter valid lot tracking variables.`);
                              return;
                            }
                            if (!labelVerified) {
                              alert(`Safety labeling confirmation is mandatory before checkout.`);
                              return;
                            }
                            setCurrentStep(3);
                          }}
                          className="px-5 py-2.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl font-bold flex items-center gap-2 transition"
                        >
                          Proceed to Step 3: Copay & Claims <ArrowRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* STEP 3 WORKFLOW CONTENT */}
                  {currentStep === 3 && (
                    <div className="space-y-4 animate-fadeIn text-xs">
                      <div className="bg-slate-50 p-4 rounded-xl space-y-3 border border-slate-100">
                        <h4 className="font-bold text-slate-700 flex items-center gap-1.5">
                          <span>🛡️</span> Stage 3: Insurance Copay Adjudication & Ledger Verification
                        </h4>
                        <p className="text-slate-400">
                          Confirm transaction fees, evaluate copay parameters set by {patient.insuranceProvider || 'Self-Sponsor'}, and query health plan co-sponsors.
                        </p>
                      </div>

                      <div className="border border-slate-100 p-4 rounded-xl space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <p className="text-[10px] font-mono uppercase text-slate-400">Primary Insured</p>
                            <p className="font-semibold text-slate-700">{patient?.insuranceProvider || 'Self-Sponsor'}</p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-[10px] font-mono uppercase text-slate-400">Diagnostic billing code</p>
                            <p className="font-mono text-slate-750 font-bold">ICD-10-CM J45.909 (Asthma)</p>
                          </div>
                        </div>

                        <div className="p-4 bg-emerald-50/20 border border-emerald-100 rounded-xl flex justify-between items-center text-xs">
                          <div className="space-y-1">
                            <p className="font-bold text-slate-700">Financial Ledger Entry:</p>
                            <p className="text-slate-400">Standard co-insurance deductible formulary tier check.</p>
                          </div>

                          <div className="flex gap-6">
                            <div className="text-right">
                              <p className="text-[9px] font-mono uppercase text-slate-400">Standard Payout</p>
                              <p className="text-sm font-mono font-bold text-slate-600">${med.price.toFixed(2)}</p>
                            </div>
                            <div className="text-right font-bold">
                              <p className="text-[9px] font-mono uppercase text-slate-400">Patient Copay Due</p>
                              <p className="text-sm font-mono text-emerald-700">${refill.copay?.toFixed(2) || '15.00'}</p>
                            </div>
                          </div>
                        </div>

                        <div className="p-3 bg-blue-50/45 border border-blue-100 rounded-xl text-[11px] leading-relaxed text-blue-800 space-y-1">
                          <p className="font-bold">Real-Time Electronic Coinsurance check status:</p>
                          <p>
                            Payer network electronic connection: <strong>ACTIVE</strong>. Plan status verified with zero patient deductible remaining. Copay confirmed: <strong>${refill.copay?.toFixed(2) || '15.00'}</strong>.
                          </p>
                        </div>

                        <label className="flex items-center gap-2.5 font-medium text-slate-700 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={claimVerified}
                            onChange={(e) => setClaimVerified(e.target.checked)}
                            className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300"
                          />
                          <span>Confirm Copay transaction is cleared or queued for Patient Billing collection</span>
                        </label>
                      </div>

                      <div className="flex justify-between pt-2">
                        <button
                          type="button"
                          onClick={() => setCurrentStep(2)}
                          className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 transition"
                        >
                          Back to Step 2
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            if (!claimVerified) {
                              alert('Please check Copay clearance box before proceeding to pharmacist release stage.');
                              return;
                            }
                            setCurrentStep(4);
                          }}
                          className="px-5 py-2.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl font-bold flex items-center gap-2 transition"
                        >
                          Proceed to Step 4: Final Signoff <ArrowRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* STEP 4 WORKFLOW CONTENT */}
                  {currentStep === 4 && (
                    <div className="space-y-4 animate-fadeIn text-xs">
                      <div className="bg-slate-50 p-4 rounded-xl space-y-3 border border-slate-100">
                        <h4 className="font-bold text-slate-700 flex items-center gap-1.5">
                          <span>✍️</span> Stage 4: Pharmacist Final Digital Sign-Off & Packaging Release
                        </h4>
                        <p className="text-slate-400">
                          Authorized release by licensed clinical team on duty. Signing off commits stock reduction, logs clinical notes, and passes the order to the Courier dispatcher.
                        </p>
                      </div>

                      <div className="border border-slate-100 p-4 rounded-xl space-y-4">
                        <div className="flex items-center gap-3 bg-amber-50/50 p-3.5 border border-amber-100 rounded-xl text-amber-850">
                          <UserCheck className="w-5 h-5 text-amber-700 shrink-0" />
                          <div>
                            <p className="font-bold">Pharmacist Signature Verification on Records</p>
                            <p className="text-[11px] mt-0.5 text-slate-600">
                              Digitally signing document using: <strong>{activePharmacist.name}</strong> (License Code State Registry ID: {activePharmacist.license}).
                            </p>
                          </div>
                        </div>

                        {/* Compound release parameters log */}
                        <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100 font-mono text-[10px] space-y-1 block max-w-full overflow-x-auto text-slate-650">
                          <p className="font-bold text-slate-800 uppercase text-[9px] mb-1">Finalized Dispensation Dossier</p>
                          <p>&gt; RX ID: {refill.rxNumber}</p>
                          <p>&gt; PATIENT: {patient.name} DOB: {patient.dob}</p>
                          <p>&gt; MEDICINE: {med.name} (Qty: {verifiedTabletCount})</p>
                          <p>&gt; ASSIGNED LOT: {compoundedLotNumber} (EXP: {compoundedExpiryDate})</p>
                          <p>&gt; SIGNATORY: {activePharmacist.name} (LIC CODE: {activePharmacist.license})</p>
                        </div>

                        {/* Packaging Notes Input */}
                        <div className="space-y-1.5">
                          <label className="text-[11px] font-mono font-bold text-slate-400 uppercase">Pharmacist Packaging Notes (FDA Override Comments)</label>
                          <textarea
                            rows={2}
                            value={packagingNote}
                            onChange={e => setPackagingNote(e.target.value)}
                            placeholder="e.g., Verified drug is chemically safe to release. Pill count verified manually. Patient allergy flag examined and overridden via physician consultation."
                            className="w-full text-xs p-3 bg-slate-50 border border-slate-205 rounded-xl focus:outline-emerald-500 focus:bg-white resize-none text-slate-800 font-sans"
                          />
                        </div>
                      </div>

                      <div className="flex justify-between pt-2">
                        <button
                          type="button"
                          onClick={() => setCurrentStep(3)}
                          className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 transition"
                        >
                          Back to Step 3
                        </button>

                        <button
                          onClick={() => handleDispenseRefill(refill.id)}
                          className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl transition shadow-xs flex items-center gap-2 font-bold cursor-pointer"
                        >
                          <CheckCircle className="w-5 h-5" /> Sign-Off & Release to Logistics
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Dismiss console control */}
                  <div className="pt-2 border-t border-slate-100 flex justify-start">
                    <button
                      onClick={() => setSelectedRefillId(null)}
                      className="px-4 py-2 text-slate-400 hover:text-slate-700 transition font-semibold text-xs"
                    >
                      Cancel Dispense Checkout
                    </button>
                  </div>

                </div>
              );
            })() : (
              <div className="bg-slate-50 border border-slate-205 rounded-2xl p-12 text-center text-slate-400 space-y-4">
                <Package className="w-12 h-12 mx-auto stroke-slate-300 animate-pulse" />
                <div className="max-w-md mx-auto space-y-1">
                  <h4 className="text-sm font-semibold text-slate-700 font-sans">Select Prescription from Queue</h4>
                  <p className="text-xs text-slate-400 leading-normal">
                    Select any medical refill requested by patients on the left column. You will be able to perform clinical allergy warnings screening, checkout bottle barcodes, calculate client insurance copays, and dispense medication packages.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ONLINE MEDICATION MODULE TAB PANEL */}
      {innerTab === 'online-meds' && (
        <div className="space-y-6 animate-fadeIn">
          
          <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h3 className="text-base font-bold text-indigo-900 flex items-center gap-2">
                <Globe className="w-5 h-5 text-indigo-600" />
                🌐 Online Telehealth & e-Rx Intake Desk
              </h3>
              <p className="text-xs text-indigo-700 mt-1 max-w-2xl leading-normal">
                Receive electronic prescriptions directly from online telemedicine consult portals, handle instant OTC orders, and messaging consultation requests.
              </p>
            </div>

            <div className="flex gap-2 shrink-0 flex-wrap">
              <button
                onClick={() => setShowManualOnlineForm(!showManualOnlineForm)}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold shadow-xs transition flex items-center gap-1.5 cursor-pointer ${
                  showManualOnlineForm 
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white border-transparent' 
                    : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <Plus className="w-4 h-4" />
                {showManualOnlineForm ? 'Close Manual e-Rx' : 'Add e-Rx Manually'}
              </button>
              
              <button
                onClick={handleSimulateIncomingErx}
                className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer shrink-0"
              >
                <Sparkles className="w-4 h-4 text-emerald-300" />
                Simulate Telehealth e-Rx Influx
              </button>
            </div>
          </div>

          {showManualOnlineForm && (
            <form onSubmit={handleAddManualOnlineEprescription} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4 animate-fadeIn text-left">
              <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                <div>
                  <h4 className="text-sm font-bold text-slate-800">Manually Register Telehealth Patient e-Rx</h4>
                  <p className="text-[11px] text-slate-400">Add a custom prescription requested via secure telehealth online module</p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowManualOnlineForm(false)}
                  className="text-xs font-mono font-bold text-slate-400 hover:text-slate-650 cursor-pointer"
                >
                  ✕ Close
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Patient Name */}
                <div className="space-y-1">
                  <label className="text-[10px] font-mono font-bold text-slate-400 uppercase block">Patient Name *</label>
                  <input
                    type="text"
                    required
                    value={onlineName}
                    onChange={(e) => setOnlineName(e.target.value)}
                    placeholder="e.g. Clark Kent"
                    className="w-full text-xs border border-slate-200 rounded-xl px-3 py-2 bg-slate-50/50 text-slate-850 focus:bg-white focus:outline-indigo-600 font-sans"
                  />
                </div>

                {/* DOB */}
                <div className="space-y-1">
                  <label className="text-[10px] font-mono font-bold text-slate-400 uppercase block">Date of Birth</label>
                  <input
                    type="date"
                    value={onlineDob}
                    onChange={(e) => setOnlineDob(e.target.value)}
                    className="w-full text-xs border border-slate-200 rounded-xl px-3 py-2 bg-slate-50/50 text-slate-850 focus:bg-white focus:outline-indigo-600 font-mono"
                  />
                </div>

                {/* Patient Phone */}
                <div className="space-y-1">
                  <label className="text-[10px] font-mono font-bold text-slate-400 uppercase block">Contact Phone</label>
                  <input
                    type="text"
                    value={onlinePhone}
                    onChange={(e) => setOnlinePhone(e.target.value)}
                    placeholder="+1 (555) 019-2831"
                    className="w-full text-xs border border-slate-200 rounded-xl px-3 py-2 bg-slate-50/50 text-slate-850 focus:bg-white focus:outline-indigo-600 font-mono"
                  />
                </div>

                {/* Patient Email */}
                <div className="space-y-1">
                  <label className="text-[10px] font-mono font-bold text-slate-400 uppercase block">Email Address</label>
                  <input
                    type="email"
                    value={onlineEmail}
                    onChange={(e) => setOnlineEmail(e.target.value)}
                    placeholder="clark@dailyplanet.com"
                    className="w-full text-xs border border-slate-200 rounded-xl px-3 py-2 bg-slate-50/50 text-slate-850 focus:bg-white focus:outline-indigo-600 font-sans"
                  />
                </div>

                {/* Medication Name */}
                <div className="space-y-1">
                  <label className="text-[10px] font-mono font-bold text-slate-400 uppercase block">Medication Name *</label>
                  <input
                    type="text"
                    required
                    value={onlineMedName}
                    onChange={(e) => setOnlineMedName(e.target.value)}
                    placeholder="e.g. Amoxicillin"
                    className="w-full text-xs border border-slate-200 rounded-xl px-3 py-2 bg-slate-50/50 text-slate-850 focus:bg-white focus:outline-indigo-600 font-sans"
                  />
                </div>

                {/* Dosage */}
                <div className="space-y-1">
                  <label className="text-[10px] font-mono font-bold text-slate-400 uppercase block">Dosage Formula</label>
                  <input
                    type="text"
                    value={onlineDosage}
                    onChange={(e) => setOnlineDosage(e.target.value)}
                    placeholder="e.g. 250mg thrice daily"
                    className="w-full text-xs border border-slate-200 rounded-xl px-3 py-2 bg-slate-50/50 text-slate-855 focus:bg-white focus:outline-indigo-600 font-sans"
                  />
                </div>

                {/* Quantity */}
                <div className="space-y-1">
                  <label className="text-[10px] font-mono font-bold text-slate-400 uppercase block">Quantity</label>
                  <input
                    type="number"
                    value={onlineQty}
                    onChange={(e) => setOnlineQty(Number(e.target.value))}
                    className="w-full text-xs border border-slate-200 rounded-xl px-3 py-2 bg-slate-50/50 text-slate-850 focus:bg-white focus:outline-indigo-600 font-mono"
                  />
                </div>

                {/* Copay */}
                <div className="space-y-1">
                  <label className="text-[10px] font-mono font-bold text-slate-400 uppercase block">Copay Cost ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={onlineCopay}
                    onChange={(e) => setOnlineCopay(Number(e.target.value))}
                    className="w-full text-xs border border-slate-200 rounded-xl px-3 py-2 bg-slate-50/50 text-slate-850 focus:bg-white focus:outline-indigo-600 font-mono"
                  />
                </div>

                {/* Clinic Name */}
                <div className="space-y-1">
                  <label className="text-[10px] font-mono font-bold text-slate-400 uppercase block">Telehealth Portal Clinic</label>
                  <input
                    type="text"
                    value={onlineClinic}
                    onChange={(e) => setOnlineClinic(e.target.value)}
                    placeholder="e.g. Metropolis Care Desk"
                    className="w-full text-xs border border-slate-200 rounded-xl px-3 py-2 bg-slate-50/50 text-slate-850 focus:bg-white focus:outline-indigo-600 font-sans"
                  />
                </div>

                {/* Physician Name */}
                <div className="space-y-1">
                  <label className="text-[10px] font-mono font-bold text-slate-400 uppercase block">Authorized Physician</label>
                  <input
                    type="text"
                    value={onlinePhysician}
                    onChange={(e) => setOnlinePhysician(e.target.value)}
                    placeholder="e.g. Dr. Emil Hamilton"
                    className="w-full text-xs border border-slate-200 rounded-xl px-3 py-2 bg-slate-50/50 text-slate-850 focus:bg-white focus:outline-indigo-600 font-sans"
                  />
                </div>

                {/* Urgency */}
                <div className="space-y-1">
                  <label className="text-[10px] font-mono font-bold text-slate-400 uppercase block">Urgency Status</label>
                  <select
                    value={onlineUrgency}
                    onChange={(e) => setOnlineUrgency(e.target.value as any)}
                    className="w-full text-xs border border-slate-200 rounded-xl px-3 py-2 bg-slate-50/50 text-slate-850 focus:bg-white focus:outline-indigo-600 font-sans"
                  >
                    <option value="Standard">Standard Priority</option>
                    <option value="Urgent">Urgent Priority</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowManualOnlineForm(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs transition cursor-pointer"
                >
                  Register Online e-Rx
                </button>
              </div>
            </form>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Left Box: Online Incoming prescripts stream list */}
            <div className="lg:col-span-7 space-y-3">
              <span className="text-[10px] font-mono font-bold text-slate-450 uppercase tracking-wider block">Incoming Digital E-Prescriptions stream</span>
              
              <div className="space-y-3.5 max-h-[500px] overflow-y-auto pr-1">
                {onlineEprescriptions.map(er => (
                  <div key={er.id} className="p-4 bg-white border border-slate-100 rounded-2xl shadow-xs hover:border-indigo-200 transition-all text-left">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded uppercase ${
                          er.urgency === 'Urgent' ? 'bg-rose-50 text-rose-700 border border-rose-100' : 'bg-slate-50 text-slate-600 border border-slate-100'
                        }`}>
                          {er.urgency} e-Rx
                        </span>
                        <h4 className="font-bold text-slate-800 text-sm mt-1.5">{er.patientName}</h4>
                        <p className="text-xs text-slate-400 font-mono">DOB: {er.dob} &bull; {er.phone}</p>
                      </div>

                      <div className="text-right">
                        <span className="text-[10px] text-slate-400 block font-mono">{er.date}</span>
                        <span className="text-[10.5px] font-bold text-indigo-600 font-mono block mt-1">{er.clinicName}</span>
                      </div>
                    </div>

                    <div className="mt-3.5 pt-3.5 border-t border-slate-50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 text-xs">
                      <div className="space-y-0.5 text-slate-700">
                        <p className="font-bold">{er.medicationName} ({er.dosage})</p>
                        <p className="text-[11px] text-slate-400 font-mono">Authorized Physician: {er.physician}</p>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleDeleteEprescription(er.id)}
                          title="Reject/Dismiss Telehealth e-Rx"
                          className="p-2 bg-rose-50 text-rose-600 hover:bg-rose-100 hover:text-rose-700 rounded-lg transition"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleIngestEprescription(er.id)}
                          className="px-3.5 py-1.5 bg-slate-900 hover:bg-indigo-600 text-white font-bold text-[11px] rounded-lg shadow-2xs transition flex items-center gap-1 cursor-pointer"
                        >
                          Ingest Rx Order <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}

                {onlineEprescriptions.length === 0 && (
                  <div className="p-12 text-center bg-white border border-dashed border-slate-200 rounded-2xl text-slate-400 text-xs">
                    No new digital telemedicine requests are pending in the telehealth network port. Click "Simulate Telehealth e-Rx Influx" to ingest a live demo.
                  </div>
                )}
              </div>
            </div>

            {/* Right Box: Chat Consultation simulator */}
            <div className="lg:col-span-5 space-y-3">
              <span className="text-[10px] font-mono font-bold text-slate-450 uppercase tracking-wider block">🗣️ Digital Consultation Advisor Desk</span>
              
              <div className="bg-white border border-slate-100 rounded-2xl shadow-xs overflow-hidden flex flex-col h-[460px]">
                
                {/* Chat Top Banner */}
                <div className="bg-slate-900 text-white p-4">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></div>
                      <span className="text-xs font-bold font-mono tracking-wider text-emerald-400">TELEHEALTH ADVICE ACTIVE</span>
                    </div>

                    <select
                      value={consultSelectedPatient}
                      onChange={(e) => {
                        setConsultSelectedPatient(e.target.value);
                        setConsultHistory([
                          { id: 1, sender: e.target.value, message: `Hello! Will the prescribed medication interact with my other chronic drugs?`, timestamp: '5 mins ago' },
                          { id: 2, sender: 'Pharmacist', message: `Hi! Let me inspect your active clinical charts. Which vitamins or supplements are you currently taking daily?`, timestamp: '4 mins ago' }
                        ]);
                      }}
                      className="bg-slate-800 text-white border border-slate-700 text-[10.5px] rounded-md px-2 py-1 font-semibold cursor-pointer focus:ring-0"
                    >
                      <option value="Gwen Stacy">User: Gwen Stacy</option>
                      <option value="Clark Kent">User: Clark Kent</option>
                      <option value="Stephen Strange">User: Stephen Strange</option>
                      <option value="Diana Prince">User: Diana Prince</option>
                    </select>
                  </div>

                  <p className="text-[11px] text-slate-400 mt-2 font-mono">Chatting with patient: {consultSelectedPatient}</p>
                </div>

                {/* Messages Body */}
                <div className="flex-1 p-4 overflow-y-auto space-y-3.5 bg-slate-50/50">
                  {consultHistory.map(ch => {
                    const isPharmacist = ch.sender === 'Pharmacist';
                    return (
                      <div key={ch.id} className={`flex flex-col ${isPharmacist ? 'items-end' : 'items-start'}`}>
                        <div className={`max-w-[85%] p-3 rounded-2xl text-xs shadow-2xs leading-relaxed ${
                          isPharmacist 
                            ? 'bg-slate-800 text-white rounded-tr-none' 
                            : 'bg-white border border-slate-100 text-slate-800 rounded-tl-none'
                        }`}>
                          <p className="font-semibold text-[9px] text-slate-400 uppercase tracking-wide block mb-0.5">{ch.sender}</p>
                          <p className="font-medium">{ch.message}</p>
                        </div>
                        <span className="text-[9px] text-slate-400 mt-0.5 font-mono px-1">{ch.timestamp}</span>
                      </div>
                    );
                  })}
                </div>

                {/* Input form */}
                <form onSubmit={handleSendLiveAdvice} className="p-3 bg-white border-t border-slate-100 flex gap-2">
                  <input
                    type="text"
                    value={consultNotes}
                    onChange={(e) => setConsultNotes(e.target.value)}
                    placeholder={`Type professional advice for ${consultSelectedPatient}...`}
                    className="flex-1 text-xs border border-slate-200 rounded-xl px-3 py-2 bg-slate-50 text-slate-850 focus:bg-white focus:outline-emerald-600 font-sans"
                  />
                  <button
                    type="submit"
                    className="p-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition cursor-pointer"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>

              </div>
            </div>

          </div>

        </div>
      )}

      {/* INSURANCE CLAIMS & COPAY ADJUDICATION WORKSPACE */}
      {innerTab === 'insurance' && (
        <div className="space-y-6 animate-fadeIn">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Column 1: Live Adjudication Tool Form (5 Cols) */}
            <div className="lg:col-span-5 space-y-4">
              <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest block">🛡️ Real-Time Claims Adjudicator</span>
              
              <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-xs space-y-4 text-xs block text-left">
                <div className="space-y-1">
                  <h4 className="font-bold text-slate-800 text-sm">Initiate Benefit PBM Adjudication</h4>
                  <p className="text-slate-400">Generate instantly formatted billing claims directly to the clearing houses.</p>
                </div>

                <form onSubmit={handleExecuteLiveAdjudication} className="space-y-3.5">
                  
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">Target Care Plan Sponsor</label>
                    <select
                      value={insurancePayerSelected}
                      onChange={(e) => setInsurancePayerSelected(e.target.value)}
                      className="w-full text-xs bg-white border border-slate-200 rounded-lg p-2 focus:outline-sky-500 font-medium text-slate-800 cursor-pointer"
                    >
                      <option value="Blue Cross Blue Shield Gold PPO">Blue Cross Blue Shield Gold PPO</option>
                      <option value="UnitedHealth Group Platinum">UnitedHealth Group Platinum</option>
                      <option value="Aetna Prime Choice">Aetna Prime Choice</option>
                      <option value="Cigna Select Comprehensive">Cigna Select Comprehensive</option>
                      <option value="Medicare Advantage Core">Medicare Advantage Core</option>
                      <option value="CVS Caremark Formulary PBM">CVS Caremark Formulary PBM</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">Select Recipient Patient Profile</label>
                    <select
                      value={claimPatientId}
                      onChange={(e) => setClaimPatientId(e.target.value)}
                      required
                      className="w-full text-xs bg-white border border-slate-200 rounded-lg p-2 focus:outline-sky-500 font-medium text-slate-800 cursor-pointer"
                    >
                      <option value="">-- Choose registered patient profile --</option>
                      {patients.map(p => (
                        <option key={p.id} value={p.id}>{p.name} (Policy ID: ${p.insuranceProvider || 'MED-H0'}-{p.id.toUpperCase()})</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">Select Medication formulation</label>
                    <select
                      value={claimMedId}
                      onChange={(e) => setClaimMedId(e.target.value)}
                      required
                      className="w-full text-xs bg-white border border-slate-200 rounded-lg p-2 focus:outline-sky-500 font-medium text-slate-800 cursor-pointer"
                    >
                      <option value="">-- Choose medication structure --</option>
                      {medications.map(m => (
                        <option key={m.id} value={m.id}>{m.name} ({m.dosage}) - ${m.price.toFixed(2)} retail</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">Interactive Billing Classification Code (ICD-10)</label>
                    <input
                      type="text"
                      value={billingIcdCode}
                      onChange={(e) => setBillingIcdCode(e.target.value)}
                      placeholder="e.g. ICD-10-CM J45.909 (Asthma)"
                      className="w-full text-xs bg-white border border-slate-200 rounded-lg p-2 focus:outline-sky-500 font-medium text-slate-850"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isAdjudicating}
                    className="w-full py-2.5 bg-slate-905 hover:bg-indigo-650 bg-slate-900 text-white font-bold rounded-xl transition shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    {isAdjudicating ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-slate-300 border-t-white rounded-full animate-spin"></div>
                        Running Adjudication...
                      </>
                    ) : (
                      <>
                        <Cpu className="w-4 h-4 text-emerald-400" />
                        Run Electronic Adjudication
                      </>
                    )}
                  </button>

                </form>

                {/* Simulated live telemetry of PBM integration progress */}
                {isAdjudicating && (
                  <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 text-emerald-400 font-mono text-[9px] space-y-1 animate-pulse max-h-[160px] overflow-y-auto block text-left leading-normal">
                    <p className="text-slate-400 text-center font-bold mb-1 uppercase tracking-wider">&gt;&gt;&gt; Live PBM Telemetry &lt;&lt;&lt;</p>
                    {adjudicateStatusLog.map((log, lIdx) => (
                      <p key={lIdx}>&gt; {log}</p>
                    ))}
                  </div>
                )}

                {claimSuccessMsg && (
                  <div className="p-3.5 bg-emerald-50 border border-emerald-100 rounded-xl text-emerald-850 leading-relaxed text-[10.5px]">
                    <span className="font-bold flex items-center gap-1 mb-1">
                      <span>🎉</span> Adjudication Clearance:
                    </span>
                    <p>{claimSuccessMsg}</p>
                  </div>
                )}

              </div>
            </div>

            {/* Column 2: Prior Auths and Historic billing logs (7 Cols) */}
            <div className="lg:col-span-7 space-y-5 text-left">
              
              {/* Prior Authorization Desk */}
              <div className="space-y-3">
                <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest block">⚠️ Prior Authorization Override Deck</span>
                
                <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-xs space-y-3">
                  <div className="divide-y divide-slate-100 max-h-[180px] overflow-y-auto text-xs">
                    {priorAuthsList.map(pa => (
                      <div key={pa.id} className="py-2.5 first:pt-0 last:pb-0 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <span className="font-mono bg-amber-50 text-[10px] text-amber-700 px-1.5 rounded font-bold">{pa.id}</span>
                            <span className="font-bold text-slate-800">{pa.patientName}</span>
                          </div>
                          <p className="text-slate-500 font-medium">Drug: {pa.medication} &bull; Network: {pa.carrier}</p>
                          <p className="text-slate-400 text-[10px]">Reason: {pa.reason}</p>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                            pa.status.includes('Approved') ? 'bg-emerald-55 bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                          }`}>
                            {pa.status}
                          </span>
                          
                          {pa.status.includes('Pending') && (
                            <button
                              onClick={() => handleApprovePriorAuthOverride(pa.id)}
                              className="px-2.5 py-1 bg-slate-900 text-white hover:bg-emerald-600 transition text-[10px] font-bold rounded"
                            >
                              Sponsor Signature Override
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Historic claim logs */}
              <div className="space-y-3">
                <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest block">📜 Submitted Claims History Log</span>
                
                <div className="bg-white border border-slate-105 rounded-2xl shadow-xs overflow-x-auto text-[11px] block">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50/70 border-b border-slate-100 text-[9.5px] font-mono font-bold uppercase text-slate-450 tracking-wider">
                        <th className="p-3 pl-4">Claim ID</th>
                        <th className="p-3">Patient</th>
                        <th className="p-3">Plan Carrier</th>
                        <th className="p-3">ICD-Code</th>
                        <th className="p-3 text-right">Payer / Pat</th>
                        <th className="p-3 pr-4 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-102">
                      {claimHistoryList.map(ch => (
                        <tr key={ch.id} className="hover:bg-slate-50/30">
                          <td className="p-3 pl-4 font-mono font-bold text-slate-500">{ch.id}</td>
                          <td className="p-3 font-semibold text-slate-800">{ch.patientName}</td>
                          <td className="p-3 text-slate-500">{ch.carrier}</td>
                          <td className="p-3 font-mono text-slate-400">{ch.billingCode}</td>
                          <td className="p-3 text-right font-mono">
                            <span className="text-slate-500">${ch.payerCovered.toFixed(0)}</span>
                            <span className="text-slate-300 mx-1">/</span>
                            <span className="text-emerald-700 font-bold">${ch.patientCopay.toFixed(0)}</span>
                          </td>
                          <td className="p-3 pr-4 text-center">
                            <span className="bg-emerald-50 text-emerald-700 font-bold px-2 py-0.5 rounded font-mono text-[9.5px]">
                              {ch.status.toUpperCase()}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>

          </div>

        </div>
      )}

      {/* Manual Add Patient Form Panel */}
      {innerTab === 'add-patient' && (
        <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-xs max-w-2xl mx-auto animate-fadeIn text-left">
          <div className="pb-4 border-b border-slate-100 mb-6">
            <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-emerald-600" />
              Register New CRM Patient Account
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">Quickly register patient health card details to configure continuous medical profiling.</p>
          </div>

          {patientSuccess && (
            <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex gap-2 items-center animate-fadeIn">
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
              <p>{patientSuccess}</p>
            </div>
          )}

          <form onSubmit={handleRegisterPatientSubmit} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5 animate-fadeIn">
                <label className="text-[11px] font-mono font-bold text-slate-400 uppercase">Patient Full Name *</label>
                <input
                  type="text"
                  required
                  value={patName}
                  onChange={e => setPatName(e.target.value)}
                  placeholder="e.g., Jonathan Harker"
                  className="w-full text-xs px-3.5 py-2 border border-slate-200 rounded-lg focus:outline-emerald-500 bg-white text-slate-850"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-mono font-bold text-slate-400 uppercase">Date of Birth *</label>
                <input
                  type="date"
                  required
                  value={patDob}
                  onChange={e => setPatDob(e.target.value)}
                  className="w-full text-xs px-3.5 py-2 border border-slate-200 rounded-lg focus:outline-emerald-500 bg-white text-slate-850 font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-mono font-bold text-slate-400 uppercase">Contact Mobile / SMS *</label>
                <input
                  type="text"
                  required
                  value={patPhone}
                  onChange={e => setPatPhone(e.target.value)}
                  placeholder="e.g., (555) 704-2091"
                  className="w-full text-xs px-3.5 py-2 border border-slate-200 rounded-lg focus:outline-emerald-500 bg-white text-slate-855"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-mono font-bold text-slate-400 uppercase">Email Address</label>
                <input
                  type="email"
                  value={patEmail}
                  onChange={e => setPatEmail(e.target.value)}
                  placeholder="e.g., jharker@london-bank.com"
                  className="w-full text-xs px-3.5 py-2 border border-slate-200 rounded-lg focus:outline-emerald-500 bg-white text-slate-850"
                />
              </div>

              <div className="space-y-1.5 md:col-span-2 animate-fadeIn">
                <label className="text-[11px] font-mono font-bold text-slate-400 uppercase">Insurance Provider / Plan Sponsor</label>
                <input
                  type="text"
                  value={patInsurance}
                  onChange={e => setPatInsurance(e.target.value)}
                  placeholder="e.g., Blue Cross Blue Shield Gold PPO"
                  className="w-full text-xs px-3.5 py-2 border border-slate-200 rounded-lg focus:outline-emerald-500 bg-white text-slate-850"
                />
              </div>

              <div className="space-y-1.5 md:col-span-2">
                <label className="text-[11px] font-mono font-bold text-slate-400 uppercase">Allergies (comma-separated)</label>
                <input
                  type="text"
                  value={patAllergies}
                  onChange={e => setPatAllergies(e.target.value)}
                  placeholder="e.g., Amoxicillin, Penicillin, Peanuts"
                  className="w-full text-xs px-3.5 py-2 border border-slate-200 rounded-lg focus:outline-emerald-500 bg-white text-slate-850"
                />
              </div>

              <div className="space-y-1.5 md:col-span-2">
                <label className="text-[11px] font-mono font-bold text-slate-400 uppercase">Chronic Medical Conditions (comma-separated)</label>
                <input
                  type="text"
                  value={patConditions}
                  onChange={e => setPatConditions(e.target.value)}
                  placeholder="e.g., Hypertension, Type-1 Diabetes"
                  className="w-full text-xs px-3.5 py-2 border border-slate-200 rounded-lg focus:outline-emerald-500 bg-white text-slate-850"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setInnerTab('queue')}
                className="px-4 py-2 border border-slate-200 text-slate-650 rounded-xl hover:bg-slate-50 transition font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl transition shadow-xs font-semibold cursor-pointer"
              >
                Authenticate & Register Patient
              </button>
            </div>
          </form>
        </div>
      )}

      {/* CLINIC DOC BULK IMPORTER PANEL */}
      {innerTab === 'bulk-import' && (
        <div className="space-y-6 max-w-4xl mx-auto animate-fadeIn text-left">
          
          {/* Landing Pad */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => document.getElementById('dispense-landing-input')?.click()}
            className={`border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition flex flex-col items-center justify-center min-h-[180px] bg-white ${
              isDragging 
                ? 'border-emerald-500 bg-emerald-50/10 scale-[1.01]' 
                : 'border-slate-205 hover:border-slate-350 hover:bg-slate-50/50'
            }`}
          >
            <input 
              type="file" 
              id="dispense-landing-input" 
              accept=".csv,.xlsx,.xls,.pdf" 
              className="hidden" 
              onChange={handleFileChange}
            />
            
            <span className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl mb-4">
              <UploadCloud className="w-6 h-6 animate-pulse" />
            </span>

            <p className="text-sm font-bold text-slate-700">
              Drag & Drop spreadsheet or medical billing forms here
            </p>
            <p className="text-xs text-slate-400 mt-1.5 max-w-lg leading-relaxed">
              Accepts Excel sheets (.xlsx), clinical CSV files, or PDF medicine list. The clinical parser will extract patient demographics (Allergies, conditions) and schedule corresponding prescription refills automatically.
            </p>

            <span className="mt-4 px-3 py-1 font-mono text-[9px] font-bold text-emerald-700 bg-emerald-50 rounded uppercase tracking-wider flex items-center gap-1.5">
              <span>🧬</span> CLINICAL AUTOMATION MATRIX ONLINE
            </span>
          </div>

          {/* Loader */}
          {isParsing && (
            <div className="p-6 bg-white border border-slate-100 rounded-2xl text-center space-y-3 shadow-xs animate-fadeIn">
              <div className="relative w-8 h-8 mx-auto">
                <div className="absolute inset-0 rounded-full border-4 border-slate-100"></div>
                <div className="absolute inset-0 rounded-full border-4 border-t-emerald-600 animate-spin"></div>
              </div>
              <div className="text-xs text-slate-600">
                <p className="font-bold">Parsing Diagnostic Matrices...</p>
                <p className="text-[10px] text-slate-400 font-mono animate-pulse mt-0.5">Matching FDA medication listings and preparing chemical safety overrides...</p>
              </div>
            </div>
          )}

          {/* Parsing error */}
          {fileParseError && (
            <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl text-xs flex gap-2 items-center animate-fadeIn">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <p>{fileParseError}</p>
            </div>
          )}

          {/* Parser Preview Table */}
          {parsedData && (
            <div className="bg-white border border-slate-105 rounded-2xl shadow-xs overflow-hidden animate-fadeIn space-y-4 p-5 text-left">
              
              <div className="flex justify-between items-center pb-3 border-b border-slate-100 flex-wrap gap-3">
                <div>
                  <h4 className="text-sm font-bold text-slate-800">Review Clinician Document Data Mapping</h4>
                  <p className="text-[11px] text-slate-400">Extracted and formatted patient portfolios alongside staging refill cards</p>
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setParsedData(null)}
                    className="px-3 py-1.5 border border-slate-200 text-slate-650 font-semibold text-xs rounded-lg hover:bg-slate-50 transition"
                  >
                    Discard Extracted
                  </button>
                  <button
                    type="button"
                    onClick={handleCommitBulkData}
                    className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-lg transition"
                  >
                    Commit & Register All Entries
                  </button>
                </div>
              </div>

              {/* Preview Grid split */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-[11px]">
                
                {/* Visual block 1: Patients portfolios */}
                <div className="space-y-2 border border-slate-100 rounded-xl overflow-hidden shadow-2xs">
                  <div className="bg-slate-50 px-3 py-2 border-b border-slate-100 flex items-center justify-between">
                    <span className="font-bold font-mono text-slate-500 uppercase tracking-widest text-[9px]">Extracted Patients ({parsedData.patients.length})</span>
                    <span className="bg-blue-50 text-blue-700 text-[9px] font-bold px-1.5 py-0.5 rounded uppercase">Demographics Staged</span>
                  </div>

                  <div className="divide-y divide-slate-100 max-h-[220px] overflow-y-auto">
                    {parsedData.patients.map((p, idx) => (
                      <div key={idx} className="p-3 hover:bg-slate-50/50 bg-white">
                        <div className="flex justify-between font-bold text-slate-800">
                          <span>{p.name}</span>
                          <span className="font-mono text-[9.5px] text-slate-400">{p.phone}</span>
                        </div>
                        <div className="text-slate-400 mt-1 flex gap-2">
                          <span>DOB: {p.dob}</span>&bull;
                          <span>Allergies: {p.allergies.length > 0 ? p.allergies.join(', ') : 'None'}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Visual block 2: Refills to stage */}
                <div className="space-y-2 border border-slate-100 rounded-xl overflow-hidden shadow-2xs">
                  <div className="bg-slate-50 px-3 py-2 border-b border-slate-100 flex items-center justify-between">
                    <span className="font-bold font-mono text-slate-500 uppercase tracking-widest text-[9px]">Extracted Refills ({parsedData.refills.length})</span>
                    <span className="bg-indigo-50 text-indigo-700 text-[9px] font-bold px-1.5 py-0.5 rounded uppercase">Staged Dispensing</span>
                  </div>

                  <div className="divide-y divide-slate-100 max-h-[220px] overflow-y-auto">
                    {parsedData.refills.map((r, idx) => (
                      <div key={idx} className="p-3 hover:bg-slate-50/50 bg-white">
                        <div className="flex justify-between font-bold text-slate-800">
                          <span>{r.medicationName} ({r.dosage})</span>
                          <span className="font-mono font-bold text-emerald-600">${r.copay.toFixed(2)}</span>
                        </div>
                        <div className="text-slate-400 mt-1 flex justify-between">
                          <span>Prescription Holder: {r.patientName}</span>
                          <span className="font-mono bg-slate-100 px-1.5 rounded">Rx: {r.rxNumber}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* Excel Mock template download card */}
          <div className="bg-emerald-50/25 border border-emerald-100 rounded-2xl p-5 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs select-none">
            <div className="space-y-1 text-center sm:text-left">
              <h5 className="font-bold text-emerald-800 flex items-center justify-center sm:justify-start gap-1.5">
                <span>📊</span> Spreadsheet integration guidelines
              </h5>
              <p className="text-slate-500 font-sans">Integrate hospital systems instantly by adopting common clinical Excel / CSV matrices.</p>
            </div>

            <button
              onClick={() => {
                const csvHeader = "Patient, Dob, Phone, Email, Allergies, Chronic Conditions, Medication, Dosage, Qty, Copay, Rx_ID, Insurance\n";
                const row1 = "Peter Parker,1995-10-15,(555) 304-1029,spidey@dailybugle.com,None,Arachnid Bite,ProAir HFA,90mcg,1,10.00,RX-112204,Shield Mutual\n";
                const row2 = "Bruce Banner,1974-12-18,(555) 700-1111,hulk@avengers.org,Penicillin,Spasms,Glucophage,850mg,60,15.00,RX-938104,Stark Indemnity\n";
                const dataUri = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csvHeader + row1 + row2);
                
                const link = document.createElement("a");
                link.setAttribute("href", dataUri);
                link.setAttribute("download", "rx_dispense_template.csv");
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
              }}
              className="px-4 py-2 bg-white hover:bg-emerald-50 text-emerald-800 font-bold border border-emerald-205 rounded-xl transition cursor-pointer shrink-0"
            >
              📥 Download Excel Mock Template CSV
            </button>
          </div>

        </div>
      )}

    </div>
  );
}
