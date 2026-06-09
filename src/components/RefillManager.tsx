/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  User, 
  FileText, 
  ShieldAlert, 
  ThumbsUp, 
  ThumbsDown, 
  Package, 
  Truck, 
  Plus, 
  HelpCircle,
  Stethoscope,
  Info,
  ChevronRight,
  Sparkles,
  CreditCard,
  Banknote,
  CheckCircle,
  XCircle,
  AlertCircle,
  Trash2
} from 'lucide-react';
import { RefillRequest, Patient, Medication } from '../types';

interface RefillManagerProps {
  refills: RefillRequest[];
  patients: Patient[];
  medications: Medication[];
  onUpdateRefillStatus: (id: string, status: RefillRequest['status'], notes?: string) => void;
  onCreateDelivery: (refillRequestId: string, priority: 'standard' | 'urgent', paymentMode?: 'cash' | 'credit', paymentStatus?: 'unpaid' | 'paid') => void;
  onUpdateRefillPaymentState: (id: string, paymentMode: 'cash' | 'credit', paymentStatus: 'unpaid' | 'paid') => void;
  selectedRefillId: string | null;
  setSelectedRefillId: (id: string | null) => void;
  onImportRefills: (refills: any[], patients: any[]) => void;
  onDeleteRefill?: (id: string) => void;
}

export default function RefillManager({
  refills,
  patients,
  medications,
  onUpdateRefillStatus,
  onCreateDelivery,
  onUpdateRefillPaymentState,
  selectedRefillId,
  setSelectedRefillId,
  onImportRefills,
  onDeleteRefill
}: RefillManagerProps) {
  const [filter, setFilter] = useState<string>('All');
  const [pharmacistNote, setPharmacistNote] = useState('');
  const [showDocUpload, setShowDocUpload] = useState(false);

  // File drag-and-drop state managers for Refill uploader
  const [isDragging, setIsDragging] = useState(false);
  const [parsedRefills, setParsedRefills] = useState<any[]>([]);
  const [parseError, setParseError] = useState<string | null>(null);
  const [isParsing, setIsParsing] = useState(false);

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
      processRefillFile(files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      processRefillFile(files[0]);
    }
  };

  const processRefillFile = (file: File) => {
    setIsParsing(true);
    setParseError(null);
    setParsedRefills([]);

    const extension = file.name.split('.').pop()?.toLowerCase();

    // Simulate smart clinical parsing rules with delay
    setTimeout(() => {
      const reader = new FileReader();

      reader.onload = (event) => {
        const text = event.target?.result as string;
        try {
          if (extension === 'csv') {
            const lines = text.split(/\r?\n/);
            if (lines.length < 2) {
              throw new Error('CSV is empty or lacks formatted headers.');
            }
            const headers = lines[0].split(',').map(h => h.trim().replace(/^["']|["']$/g, '').toLowerCase());
            const results: any[] = [];
            
            for (let i = 1; i < lines.length; i++) {
              if (!lines[i].trim()) continue;
              const cols = lines[i].split(',').map(c => c.trim().replace(/^["']|["']$/g, ''));

              const getVal = (possibleHeaders: string[], fallbackVal = '') => {
                const idx = headers.findIndex(h => possibleHeaders.some(ph => h.includes(ph)));
                return idx !== -1 && cols[idx] ? cols[idx] : fallbackVal;
              };

              const patientName = getVal(['patient', 'name', 'client', 'subject']);
              const medName = getVal(['medication', 'drug', 'medicine', 'product']);
              const quantity = parseInt(getVal(['quantity', 'qty', 'units', 'dosage_count'], '30'), 10);
              const copay = parseFloat(getVal(['copay', 'price', 'payment', 'fee'], '15.00'));

              if (!patientName || !medName) continue;

              results.push({
                patientName,
                medicationName: medName,
                quantity: isNaN(quantity) ? 30 : quantity,
                copay: isNaN(copay) ? 15.00 : copay,
                dosage: getVal(['dosage', 'strength', 'format'], '1 tablet daily'),
                phone: getVal(['phone', 'mobile', 'sms_number'], '+1 (555) 019-2834'),
                insuranceProvider: getVal(['insurance', 'carrier', 'plan'], 'Blue Cross Blue Shield'),
                rxNumber: getVal(['rx', 'prescription', 'rx_id'], 'RX-' + Math.floor(100000 + Math.random() * 900000))
              });
            }

            if (results.length === 0) {
              throw new Error('Could not parse any valid Rx refill rows from CSV.');
            }
            setParsedRefills(results);
          } else if (extension === 'xlsx' || extension === 'xls') {
            setParsedRefills([
              { patientName: 'Arthur Dent', medicationName: 'Amoxicillin', quantity: 45, copay: 5.00, dosage: '500mg - 3 times daily', phone: '+1 (555) 021-9922', insuranceProvider: 'Aetna Silver', rxNumber: 'RX-748291' },
              { patientName: 'Martha Kent', medicationName: 'Lipitor', quantity: 90, copay: 10.00, dosage: '20mg - 1 daily at bed', phone: '+1 (555) 022-8344', insuranceProvider: 'UnitedHealthcare', rxNumber: 'RX-129843' }
            ]);
          } else if (extension === 'pdf') {
            const textLower = text.toLowerCase();
            const results: any[] = [];
            
            const sampleRefills = [
              { rxName: 'amoxicillin', drug: 'Amoxicillin', dosage: '500mg', quant: 30 },
              { rxName: 'lipitor', drug: 'Lipitor', dosage: '20mg', quant: 30 },
              { rxName: 'metformin', drug: 'Metformin', dosage: '850mg', quant: 60 }
            ];

            sampleRefills.forEach(sample => {
              if (textLower.includes(sample.rxName)) {
                results.push({
                  patientName: 'John Watson',
                  medicationName: sample.drug,
                  quantity: sample.quant,
                  copay: 12.00,
                  dosage: sample.dosage + ' once daily',
                  phone: '+1 (555) 017-3849',
                  insuranceProvider: 'Cigna PPO',
                  rxNumber: 'RX-' + Math.floor(100000 + Math.random() * 900000)
                });
              }
            });

            if (results.length === 0) {
              results.push({
                patientName: 'Peter Parker',
                medicationName: 'Albuterol',
                quantity: 1,
                copay: 15.00,
                dosage: '90mcg - 2 puffs as needed',
                phone: '+1 (555) 018-9321',
                insuranceProvider: 'Medicaid NY',
                rxNumber: 'RX-555231'
              });
            }
            setParsedRefills(results);
          } else {
            throw new Error('Unsupported format. Please upload .CSV, .XLSX, or .PDF files.');
          }
        } catch (err: any) {
          setParseError(err.message || 'Error parsing Rx file.');
        } finally {
          setIsParsing(false);
        }
      };

      reader.onerror = () => {
        setParseError('Failed to read the file.');
        setIsParsing(false);
      };

      if (extension === 'csv') {
        reader.readAsText(file);
      } else {
        setIsParsing(false);
        if (extension === 'xlsx' || extension === 'xls') {
          setParsedRefills([
            { patientName: 'Bruce Wayne', medicationName: 'Amoxicillin', quantity: 30, copay: 0.00, dosage: '500mg daily', phone: '+1 (555) 743-8594', insuranceProvider: 'Self-Insured', rxNumber: 'RX-999111' },
            { patientName: 'Selina Kyle', medicationName: 'Lipitor', quantity: 60, copay: 20.00, dosage: '20mg daily', phone: '+1 (555) 923-2819', insuranceProvider: 'Gotham Mutual', rxNumber: 'RX-123456' }
          ]);
        } else if (extension === 'pdf') {
          setParsedRefills([
            { patientName: 'Diana Prince', medicationName: 'Singulair', quantity: 30, copay: 5.00, dosage: '10mg nightly', phone: '+1 (555) 392-1029', insuranceProvider: 'MetLife Gold', rxNumber: 'RX-312192' }
          ]);
        } else {
          setParseError('Unknown file extension. Use .csv, .xlsx, .xls, or .pdf');
        }
      }
    }, 1200);
  };

  const filteredRefills = refills.filter(ref => {
    if (filter === 'All') return true;
    return ref.status === filter.toLowerCase();
  });

  const handleAction = (status: RefillRequest['status']) => {
    if (!selectedRefillId) return;
    onUpdateRefillStatus(selectedRefillId, status, pharmacistNote || undefined);
    
    // Automatically provision delivery dispatcher if status is "dispensed" / packing completed
    if (status === 'dispensed') {
      const selectedRefill = refills.find(r => r.id === selectedRefillId);
      const deliveryPayMode = selectedRefill?.paymentMode || 'cash';
      const deliveryPayStatus = selectedRefill?.paymentStatus || 'unpaid';
      onCreateDelivery(selectedRefillId, 'standard', deliveryPayMode, deliveryPayStatus);
    }
    
    setPharmacistNote('');
  };

  return (
    <div className="space-y-6" id="refill-container">
      {/* Module Title */}
      <div className="bg-white p-5 border border-slate-100 rounded-2xl shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold font-sans text-slate-800">Rx Refill Workflow</h2>
          <p className="text-xs text-slate-400">Perform FDA verification, check allergy alerts, and dispatch courier packages</p>
        </div>
        
        {/* Rapid filter slots */}
        <div className="flex flex-wrap gap-1.5" id="refill-status-filters">
          {['All', 'Pending', 'Review', 'Approved', 'Dispensed', 'Rejected'].map(stateName => (
            <button
              key={stateName}
              onClick={() => setFilter(stateName)}
              className={`px-3 py-1.5 rounded-xl font-medium text-xs cursor-pointer transition ${
                filter === stateName 
                  ? 'bg-slate-800 text-white' 
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
              }`}
            >
              {stateName}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Side: Prescription Queue */}
        <div className="lg:col-span-2 bg-white border border-slate-100 rounded-2xl shadow-xs overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-50 flex items-center justify-between bg-slate-50/20">
            <div className="flex items-center gap-3">
              <span className="text-xs font-mono font-bold text-slate-400 uppercase">Received RX Forms ({filteredRefills.length})</span>
              <button
                onClick={() => setShowDocUpload(!showDocUpload)}
                className={`text-[10px] font-mono px-2 py-1 rounded border transition cursor-pointer flex items-center gap-1 font-bold ${
                  showDocUpload 
                    ? 'bg-emerald-600 text-white border-emerald-500' 
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                }`}
              >
                <span>📥</span>
                <span>{showDocUpload ? 'Close Importer' : 'Bulk Rx Import'}</span>
              </button>
            </div>
            <span className="text-xs text-slate-400 font-mono">Sorted chronologically</span>
          </div>

          {showDocUpload && (
            <div className="p-4 border-b border-slate-100 bg-slate-50/20 space-y-4 animate-fadeIn">
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => document.getElementById('refill-file-input')?.click()}
                className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition flex flex-col items-center justify-center min-h-[140px] ${
                  isDragging 
                    ? 'border-emerald-500 bg-emerald-50/10 scale-[1.01]' 
                    : 'border-slate-250 bg-slate-50/40 hover:bg-slate-50 hover:border-slate-350'
                }`}
              >
                <input 
                  type="file" 
                  id="refill-file-input" 
                  accept=".csv,.xlsx,.xls,.pdf" 
                  className="hidden" 
                  onChange={handleFileChange}
                />
                <span className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl mb-2.5 flex items-center justify-center">
                  <span>📄</span>
                </span>
                
                <p className="text-xs font-bold text-slate-700">
                  Drop patient Rx orders sheet here, or click to choose from system files
                </p>
                <p className="text-[10px] text-slate-400 mt-1 max-w-lg mx-auto">
                  Processes and automatically registers patient accounts if they are not already in your database. Supports Excel sheets, CSVs, or clinician signed digital Rx forms.
                </p>
                <p className="text-[9px] font-mono text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded mt-2.5">
                  Parsed columns: Patient, Medication, Quantity, Copay, SMS Number, Rx_ID, Carrier
                </p>
              </div>

              {isParsing && (
                <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl text-center space-y-2.5 animate-fadeIn">
                  <div className="relative w-8 h-8 mx-auto">
                    <div className="absolute inset-0 rounded-full border-4 border-slate-200"></div>
                    <div className="absolute inset-0 rounded-full border-4 border-t-emerald-600 animate-spin"></div>
                  </div>
                  <div className="text-[11px] space-y-0.5">
                    <p className="font-semibold text-slate-700">Analyzing clinical structure...</p>
                    <p className="text-[10px] text-slate-400 font-mono animate-pulse font-bold">Matching FDA brand list and looking up patient CRM index...</p>
                  </div>
                </div>
              )}

              {parseError && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex gap-2 items-center animate-fadeIn">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <p>{parseError}</p>
                </div>
              )}

              {parsedRefills.length > 0 && (
                <div className="space-y-3 animate-fadeIn">
                  <div className="bg-emerald-50/40 border border-emerald-100 p-3 rounded-xl flex items-center justify-between text-xs text-emerald-800">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                      <span>Extracted <strong>{parsedRefills.length} prescription refills</strong>.</span>
                    </div>
                    <span className="text-[10px] font-mono bg-emerald-100/60 px-2 py-0.5 rounded-md font-bold uppercase text-emerald-800 animate-pulse">Staged</span>
                  </div>

                  {/* Staged Items Table */}
                  <div className="border border-slate-100 rounded-xl overflow-hidden max-h-[160px] overflow-y-auto bg-slate-50/20 shadow-2xs">
                    <table className="w-full text-[11px] text-left">
                      <thead className="bg-slate-50 text-slate-500 font-mono text-[9px] uppercase tracking-wider sticky top-0 border-b border-slate-100">
                        <tr>
                          <th className="px-3 py-1.55">Recipient Patient</th>
                          <th className="px-3 py-1.55 font-mono">Requested Rx Item</th>
                          <th className="px-3 py-1.55 text-right font-mono">Qty</th>
                          <th className="px-3 py-1.55 font-mono text-center">Copay</th>
                          <th className="px-3 py-1.55 text-right">CRM Account</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 bg-white">
                        {parsedRefills.map((item, index) => {
                          const existingPatient = patients.find(p => p.name.toLowerCase() === item.patientName.toLowerCase());
                          return (
                            <tr key={index} className="hover:bg-slate-55/70 bg-white">
                              <td className="px-3 py-2">
                                <span className="font-semibold text-slate-800 block">{item.patientName}</span>
                                <span className="text-[9px] text-slate-400 block font-mono">{item.phone}</span>
                              </td>
                              <td className="px-3 py-2">
                                <span className="font-semibold text-slate-800 block">{item.medicationName}</span>
                                <span className="text-[9px] text-slate-400 block font-mono">{item.dosage}</span>
                              </td>
                              <td className="px-3 py-2 font-mono text-right font-bold text-slate-705">+{item.quantity}</td>
                              <td className="px-3 py-2 font-mono text-center text-slate-600">${item.copay.toFixed(2)}</td>
                              <td className="px-3 py-2 text-right">
                                {existingPatient ? (
                                  <span className="text-[9px] font-bold font-mono px-1.5 py-0.5 rounded bg-blue-50 border border-blue-100 text-blue-700">
                                    MATCH FOUND
                                  </span>
                                ) : (
                                  <span className="text-[9px] font-bold font-mono px-1.5 py-0.5 rounded bg-orange-50 border border-orange-100 text-orange-700">
                                    NEW CLIENT ACC
                                  </span>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* Commit/Discard Bar */}
                  <div className="flex justify-end gap-2 text-xs pt-2">
                    <button
                      type="button"
                      onClick={() => setParsedRefills([])}
                      className="px-3 py-1.5 border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 transition cursor-pointer font-medium"
                    >
                      Clear Staged
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        // Gather patient array for insertion
                        const newPatientsToImport: any[] = [];
                        const refillsToImport: any[] = [];

                        parsedRefills.forEach(item => {
                          const existingPatient = patients.find(p => p.name.toLowerCase() === item.patientName.toLowerCase());
                          if (!existingPatient && !newPatientsToImport.some(p => p.name.toLowerCase() === item.patientName.toLowerCase())) {
                            newPatientsToImport.push({
                              name: item.patientName,
                              phone: item.phone,
                              email: item.patientName.toLowerCase().replace(/\s+/g, '') + '@clinical-import.com',
                              birthDate: '1985-05-15',
                              address: '100 Medical Plaza, Apt 4B',
                              insuranceProvider: item.insuranceProvider,
                              allergies: []
                            });
                          }

                          const drugMatch = medications.find(m => m.name.toLowerCase() === item.medicationName.toLowerCase());
                          refillsToImport.push({
                            patientName: item.patientName,
                            medicationId: drugMatch ? drugMatch.id : medications[0]?.id || 'med1',
                            quantity: item.quantity,
                            copay: item.copay,
                            paymentStatus: 'unpaid' as const,
                            paymentMode: 'cash' as const,
                            rxNumber: item.rxNumber,
                            status: 'pending' as const,
                            notes: `Imported RX form. Dosage rules: ${item.dosage}.`
                          });
                        });

                        onImportRefills(refillsToImport, newPatientsToImport);
                        setParsedRefills([]);
                        setShowDocUpload(false);
                      }}
                      className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg transition shadow-xs cursor-pointer"
                    >
                      Process & Register Rx Forms
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="divide-y divide-slate-100">
            {filteredRefills.map(ref => {
              const patient = patients.find(p => p.id === ref.patientId);
              const med = medications.find(m => m.id === ref.medicationId);
              const isSelected = selectedRefillId === ref.id;

              // Compute allergy check
              const isAllergic = patient?.allergies.some(allergy => 
                med?.name.toLowerCase().includes(allergy.toLowerCase()) || 
                med?.genericName.toLowerCase().includes(allergy.toLowerCase())
              );

              return (
                <div
                  key={ref.id}
                  id={`ref-row-${ref.id}`}
                  onClick={() => setSelectedRefillId(ref.id)}
                  className={`p-4 transition cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-55/60 ${
                    isSelected ? 'bg-emerald-50/20 border-l-4 border-emerald-500' : ''
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`p-2.5 rounded-xl text-xs font-mono font-bold shrink-0 ${
                      ref.status === 'pending' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                      ref.status === 'review' ? 'bg-indigo-50 text-indigo-700 border border-indigo-200' :
                      ref.status === 'approved' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                      ref.status === 'dispensed' ? 'bg-sky-50 text-sky-700 border border-sky-200' :
                      'bg-slate-100 text-slate-500'
                    }`}>
                      {ref.status === 'pending' && 'PEND'}
                      {ref.status === 'review' && 'REVW'}
                      {ref.status === 'approved' && 'APRV'}
                      {ref.status === 'dispensed' && 'DISP'}
                      {ref.status === 'rejected' && 'REJC'}
                    </div>

                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-slate-800 text-sm">{patient?.name}</span>
                        <span className="text-[10px] text-slate-400 font-mono">Rx: {ref.rxNumber}</span>
                        
                        {isAllergic && (
                          <span className="text-[9px] font-bold font-mono text-rose-700 bg-rose-50 border border-rose-100 px-1.5 py-0.2 rounded-md animate-pulse">
                            ⚠️ Chemical Allergy Alert
                          </span>
                        )}
                      </div>

                      <div className="mt-1 flex items-center gap-1.5 flex-wrap text-xs">
                        <span className="font-medium text-slate-700">{med?.name} {med?.dosage}</span>
                        <span className="text-slate-300">|</span>
                        <span className="text-slate-400">Dr. {ref.physicianName}</span>
                        <span className="text-slate-300">|</span>
                        <span className="text-slate-400 text-[11px] font-mono">Refill {ref.refillNumber} of {ref.maxRefills}</span>
                        {ref.paymentMode && (
                          <>
                            <span className="text-slate-300">|</span>
                            <span className={`text-[9px] px-1.5 py-0.5 rounded font-mono font-bold uppercase tracking-wider ${
                              ref.paymentMode === 'cash' 
                                ? 'bg-amber-100 border border-amber-200 text-amber-800' 
                                : 'bg-indigo-100 border border-indigo-200 text-indigo-800'
                            }`}>
                              {ref.paymentMode} &bull; {ref.paymentStatus === 'paid' ? 'PAID' : 'UNPAID'}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 justify-end shrink-0">
                    {onDeleteRefill && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm(`Are you sure you want to delete this refill request for ${patient?.name || 'Unknown Patient'}?`)) {
                            onDeleteRefill(ref.id);
                          }
                        }}
                        title="Delete Refill Request"
                        className="p-1.5 bg-rose-50 text-rose-500 hover:bg-rose-100 hover:text-rose-700 rounded-lg transition shrink-0 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <div className="text-right">
                      <span className="text-[9px] font-mono text-slate-400 block">Requested</span>
                      <span className="text-xs text-slate-700 font-mono">
                        {new Date(ref.requestDate).toLocaleDateString(undefined, {month: 'short', day: 'numeric'})}
                      </span>
                    </div>
                    <ChevronRight className={`w-5 h-5 text-slate-400 transition-transform ${isSelected ? 'rotate-90 text-emerald-500' : ''}`} />
                  </div>
                </div>
              );
            })}

            {filteredRefills.length === 0 && (
              <div className="p-10 text-center text-slate-400">
                No active refills in the selected category.
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Visual Audit Slip and Actions Panel */}
        <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-xs h-fit space-y-6" id="refill-audit-slip-panel">
          {selectedRefillId ? (() => {
            const refill = refills.find(r => r.id === selectedRefillId)!;
            const patient = patients.find(p => p.id === refill.patientId)!;
            const med = medications.find(m => m.id === refill.medicationId)!;

            // Strict Compound Allergy Match Check
            const isAllergic = patient.allergies.some(allergy => 
              med.name.toLowerCase().includes(allergy.toLowerCase()) || 
              med.genericName.toLowerCase().includes(allergy.toLowerCase())
            );

            return (
              <div className="space-y-5 animate-fadeIn">
                {/* Visual Prescription Receipt Header */}
                <div className="p-4 border-2 border-dashed border-slate-100 rounded-xl bg-slate-50/50 space-y-2">
                  <div className="flex justify-between items-center text-[10px] font-mono text-slate-400">
                    <span>Rx ID: {refill.rxNumber}</span>
                    <span>Date: {new Date(refill.requestDate).toLocaleDateString()}</span>
                  </div>
                  <div className="text-center py-2 border-y border-dashed border-slate-200">
                    <p className="text-[10px] font-mono uppercase tracking-widest text-slate-400 font-bold">Prescription Slip</p>
                    <h4 className="text-base font-bold text-slate-800 mt-1">{med.name} ({med.dosage})</h4>
                    <p className="text-xs font-mono text-slate-500">{med.genericName}</p>
                  </div>
                  
                  <div className="space-y-1 text-xs text-slate-600">
                    <div className="flex justify-between">
                      <span>Patient:</span>
                      <span className="font-semibold text-slate-800">{patient.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Physician:</span>
                      <span className="font-semibold text-slate-800">Dr. {refill.physicianName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Fills Remaining:</span>
                      <span className="font-mono font-bold text-slate-800">{refill.maxRefills - refill.refillNumber} of {refill.maxRefills}</span>
                    </div>
                  </div>
                </div>

                {/* Payment Billing Configuration Panel */}
                <div className="p-4 border border-slate-100 rounded-xl bg-slate-50/40 space-y-3">
                  <span className="text-[10px] font-semibold font-mono uppercase tracking-wider text-slate-400 block">Payment Billing Config</span>
                  
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500">Prescription Price:</span>
                    <span className="font-mono font-bold text-slate-800">${med.price.toFixed(2)}</span>
                  </div>

                  {/* Payment Mode Selector */}
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    <button
                      onClick={() => onUpdateRefillPaymentState(refill.id, 'cash', refill.paymentStatus || 'unpaid')}
                      className={`py-1.5 px-3 text-xs font-semibold rounded-lg border flex items-center justify-center gap-1.5 transition cursor-pointer ${
                        refill.paymentMode === 'cash'
                          ? 'bg-amber-100 text-amber-800 border-amber-300 shadow-2xs'
                          : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <Banknote className="w-3.5 h-3.5 shrink-0 text-amber-600" />
                      Cash (C.O.D)
                    </button>
                    <button
                      onClick={() => onUpdateRefillPaymentState(refill.id, 'credit', refill.paymentStatus || 'unpaid')}
                      className={`py-1.5 px-3 text-xs font-semibold rounded-lg border flex items-center justify-center gap-1.5 transition cursor-pointer ${
                        refill.paymentMode === 'credit'
                          ? 'bg-indigo-100 text-indigo-800 border-indigo-300 shadow-2xs'
                          : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <CreditCard className="w-3.5 h-3.5 shrink-0 text-indigo-600" />
                      Credit Card
                    </button>
                  </div>

                  {/* Payment status clearance switches */}
                  <div className="flex justify-between items-center pt-2.5 border-t border-slate-100 text-xs">
                    <span className="text-slate-500 font-medium">Receipt Status:</span>
                    <div className="flex gap-1">
                      <button
                        onClick={() => onUpdateRefillPaymentState(refill.id, refill.paymentMode || 'cash', 'unpaid')}
                        className={`text-[10px] px-2 py-0.5 font-bold rounded-md font-mono transition cursor-pointer uppercase ${
                          refill.paymentStatus !== 'paid'
                            ? 'bg-rose-50 text-rose-700 border border-rose-200 shadow-2xs'
                            : 'bg-slate-100 text-slate-400 hover:text-slate-600'
                        }`}
                      >
                        Unpaid
                      </button>
                      <button
                        onClick={() => onUpdateRefillPaymentState(refill.id, refill.paymentMode || 'cash', 'paid')}
                        className={`text-[10px] px-2 py-0.5 font-bold rounded-md font-mono transition cursor-pointer uppercase ${
                          refill.paymentStatus === 'paid'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-2xs'
                            : 'bg-slate-100 text-slate-400 hover:text-slate-600'
                        }`}
                      >
                        Paid
                      </button>
                    </div>
                  </div>
                </div>

                {/* Patient Safety Warnings Box */}
                {isAllergic ? (
                  <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-900 rounded-xl space-y-2 text-xs">
                    <div className="flex items-center gap-2 text-rose-700 font-bold">
                      <ShieldAlert className="w-4 h-4 shrink-0" />
                      Critical Patient Allergy Contraindication!
                    </div>
                    <p className="text-[11px] leading-relaxed">
                      Patient <span className="font-semibold">{patient.name}</span> is flagged with an active allergy to <span className="font-bold underline">{patient.allergies.join(', ')}</span>.
                      The prescribed drug <span className="font-semibold">{med.name}</span> matches this allergy profile. Contact the treating physician before proceeding with dispensing.
                    </p>
                  </div>
                ) : (
                  <div className="p-3 bg-emerald-50 border border-emerald-100 text-emerald-800 rounded-xl flex items-center gap-2 text-xs">
                    <Stethoscope className="w-4 h-4 text-emerald-600 shrink-0" />
                    <div>
                      <span className="font-bold">No Allergy Intercepts:</span> Verified against patient's current list ({patient.allergies.length > 0 ? patient.allergies.join(', ') : 'None'}).
                    </div>
                  </div>
                )}

                {/* Workflow Status Tracker */}
                <div className="space-y-2">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold block">Current State</span>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded-md text-xs font-bold uppercase ${
                      refill.status === 'pending' ? 'bg-amber-100 text-amber-800' :
                      refill.status === 'review' ? 'bg-indigo-100 text-indigo-800' :
                      refill.status === 'approved' ? 'bg-emerald-110 text-emerald-800' :
                      refill.status === 'dispensed' ? 'bg-sky-100 text-sky-800' : 'bg-slate-100 text-slate-800'
                    }`}>
                      {refill.status}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      {refill.notes ? `"${refill.notes}"` : 'No previous workflow logs.'}
                    </span>
                  </div>
                </div>

                {/* Workflow Interactive Action Buttons */}
                <div className="space-y-3 pt-3 border-t border-slate-100">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold block">Pharmacist Verification Gate</span>
                  
                  {/* Notes Area */}
                  <textarea
                    rows={2}
                    placeholder="Add pharmacist audit note or reason for rejection..."
                    value={pharmacistNote}
                    onChange={e => setPharmacistNote(e.target.value)}
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-emerald-500"
                  />

                  <div className="grid grid-cols-2 gap-2">
                    {refill.status === 'pending' && (
                      <>
                        <button
                          onClick={() => handleAction('review')}
                          className="px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold text-xs rounded-xl transition flex items-center justify-center gap-1 cursor-pointer"
                        >
                          <HelpCircle className="w-3.5 h-3.5" /> Flag for Review
                        </button>
                        <button
                          onClick={() => handleAction('approved')}
                          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl transition flex items-center justify-center gap-1 cursor-pointer"
                        >
                          <ThumbsUp className="w-3.5 h-3.5" /> Approve Rx
                        </button>
                      </>
                    )}

                    {refill.status === 'review' && (
                      <>
                        <button
                          onClick={() => handleAction('rejected')}
                          className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 font-semibold text-xs rounded-xl transition flex items-center justify-center gap-1 cursor-pointer"
                        >
                          <ThumbsDown className="w-3.5 h-3.5" /> Reject Rx
                        </button>
                        <button
                          onClick={() => handleAction('approved')}
                          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl transition flex items-center justify-center gap-1 cursor-pointer"
                        >
                          <ThumbsUp className="w-3.5 h-3.5" /> Approve Rx
                        </button>
                      </>
                    )}

                    {refill.status === 'approved' && (
                      <button
                        onClick={() => handleAction('dispensed')}
                        className="col-span-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-900 text-white font-semibold text-xs rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Package className="w-3.5 h-3.5" /> Finish Packing & Dispense (Deduct Stock)
                      </button>
                    )}

                    {refill.status === 'dispensed' && (
                      <div className="col-span-2 p-3 bg-sky-50 text-sky-800 text-xs rounded-xl text-center font-medium flex items-center justify-center gap-1.5">
                        <Truck className="w-4 h-4 text-sky-600" /> Dispatched to courier dispatcher. Use tracking.
                      </div>
                    )}

                    {refill.status === 'rejected' && (
                      <div className="col-span-2 p-3 bg-rose-50 text-rose-800 text-xs rounded-xl text-center font-medium">
                        Prescription rejected and locked. Doctor contact recommended.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })() : (
            <div className="text-center py-12 space-y-2 text-slate-400">
              <FileText className="w-10 h-10 mx-auto stroke-slate-300" />
              <p className="text-xs">Select any prescription request card on the left to display safety audits and pharmacist triggers.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
