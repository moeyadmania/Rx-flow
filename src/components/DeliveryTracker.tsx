/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Truck, 
  MapPin, 
  Navigation, 
  Map, 
  User, 
  AlertTriangle, 
  CheckCircle2, 
  Play, 
  RefreshCw,
  Clock,
  Navigation2,
  MessageSquare,
  Send,
  Smartphone,
  Share2,
  CheckCircle,
  Banknote,
  CreditCard,
  Check,
  SmartphoneIcon,
  Sparkles,
  Trash2
} from 'lucide-react';
import { Delivery, Patient, RefillRequest } from '../types';

interface DeliveryTrackerProps {
  deliveries: Delivery[];
  patients: Patient[];
  refills: RefillRequest[];
  onUpdateDeliveryStatus: (id: string, status: Delivery['status']) => void;
  onUpdateDeliveryProgress: (id: string, progress: number) => void;
  onUpdateDeliveryPaymentState: (deliveryId: string, paymentMode: 'cash' | 'credit', paymentStatus: 'unpaid' | 'paid') => void;
  onSendDriverMessage: (deliveryId: string, channel: 'whatsapp' | 'sms', message: string) => void;
  onUpdateDeliveryDriverAndArea: (id: string, courierName: string, area: string) => void;
  onDeleteDelivery?: (id: string) => void;
}

export default function DeliveryTracker({
  deliveries,
  patients,
  refills,
  onUpdateDeliveryStatus,
  onUpdateDeliveryProgress,
  onUpdateDeliveryPaymentState,
  onSendDriverMessage,
  onUpdateDeliveryDriverAndArea,
  onDeleteDelivery
}: DeliveryTrackerProps) {
  const [selectedDelId, setSelectedDelId] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>('All');
  const [isSimulating, setIsSimulating] = useState(false);
  
  // Messaging module local states
  const [msgChannel, setMsgChannel] = useState<'whatsapp' | 'sms'>('whatsapp');
  const [customMessage, setCustomMessage] = useState('');
  const [activePreset, setActivePreset] = useState<string>('on_the_way');

  // Filtered deliveries
  const filteredDeliveries = deliveries.filter(del => {
    if (filter === 'All') return true;
    return del.status === filter.toLowerCase().replace(' ', '_');
  });

  // Automatically simulate logistics drift / progress movement
  useEffect(() => {
    let interval: any;
    if (isSimulating) {
      interval = setInterval(() => {
        deliveries.forEach(del => {
          if (del.status === 'in_transit') {
            const nextProgress = del.progress + Math.floor(Math.random() * 8) + 2;
            if (nextProgress >= 100) {
              onUpdateDeliveryProgress(del.id, 100);
              onUpdateDeliveryStatus(del.id, 'delivered');
            } else {
              onUpdateDeliveryProgress(del.id, nextProgress);
            }
          }
        });
      }, 1500);
    }
    return () => clearInterval(interval);
  }, [isSimulating, deliveries, onUpdateDeliveryProgress, onUpdateDeliveryStatus]);

  const handleStartSim = () => {
    setIsSimulating(!isSimulating);
  };

  const handleDispatch = (id: string) => {
    onUpdateDeliveryStatus(id, 'in_transit');
    onUpdateDeliveryProgress(id, 5);
  };

  const handleMarkDelivered = (id: string) => {
    onUpdateDeliveryStatus(id, 'delivered');
    onUpdateDeliveryProgress(id, 100);
  };

  // Preset message triggers
  const getPreparedPresetMessage = (presetId: string, patientName: string, amount: number, isPrepaid: boolean) => {
    switch (presetId) {
      case 'on_the_way':
        return isPrepaid 
          ? `Hi ${patientName}, your RxFlow courier is on the way with your prescription! Estimated arrival is 15 mins. This package is pre-paid, so no collection is needed.`
          : `Hi ${patientName}, your RxFlow courier is on the way with your prescription! Estimated arrival is 15 mins. Please prepare $${amount.toFixed(2)} in cash for Doorstep Cash-On-Delivery collection.`;
      case 'arrived':
        return isPrepaid
          ? `Hi ${patientName}, your RxFlow courier has arrived at your doorstep! I will drop it off safely with you now.`
          : `Hi ${patientName}, your RxFlow courier is outside your door! Please have $${amount.toFixed(2)} cash ready for doorstep parcel collection.`;
      case 'completed':
        return `Hi ${patientName}, your medication has been securely delivered by your RxFlow agent. Thank you for choosing Cloud Pharmacy!`;
      default:
        return '';
    }
  };

  // Sync custom message text block when delivery or preset alters
  useEffect(() => {
    if (selectedDelId) {
      const del = deliveries.find(d => d.id === selectedDelId);
      if (del) {
        const patient = patients.find(p => p.id === del.patientId);
        const refill = refills.find(r => r.id === del.refillRequestId);
        const medPrice = refill ? medicationsPricing(refill.medicationId) : 35.00;
        const totalCost = medPrice + del.deliveryFee;
        const isPrepaid = del.paymentMode === 'credit';
        if (patient) {
          const defaultMsg = getPreparedPresetMessage(activePreset, patient.name, totalCost, isPrepaid);
          setCustomMessage(defaultMsg);
        }
      }
    }
  }, [selectedDelId, activePreset, deliveries, refills]);

  const medicationsPricing = (medId: string) => {
    const prices: Record<string, number> = {
      'med-1': 45.00,
      'med-2': 18.50,
      'med-3': 24.00,
      'med-4': 15.00,
      'med-5': 55.00,
      'med-6': 38.00,
      'med-7': 8.99
    };
    return prices[medId] || 25.00;
  };

  // Handle WhatsApp Link launch
  const handleLaunchWhatsApp = (phone: string, text: string) => {
    if (!selectedDelId) return;
    
    // Clean phone numbers of brackets, hyphens, and spaces
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    const encodedText = encodeURIComponent(text);
    
    // Formulate deep link (standard wa.me URL format)
    const waLink = `https://wa.me/${cleanPhone || '1555000000'}?text=${encodedText}`;
    
    // Log dispatch event state
    onSendDriverMessage(selectedDelId, 'whatsapp', text);
    
    // Launch deep link in new tab safely
    window.open(waLink, '_blank');
  };

  // Handle Local Simulator Send button
  const handleSimSend = (text: string) => {
    if (!selectedDelId || !text.trim()) return;
    onSendDriverMessage(selectedDelId, msgChannel, text);
    // clear input box placeholder/preset trigger
    setCustomMessage('');
  };

  return (
    <div className="space-y-6" id="delivery-tracking-module">
      {/* Upper header */}
      <div className="bg-white p-5 border border-slate-100 rounded-2xl shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold font-sans text-slate-800">Logistics & Dispatches</h2>
          <p className="text-xs text-slate-400">Dispatch couriers, track routes, and simulate doorstep arrival states</p>
        </div>

        <div className="flex gap-2">
          {/* Simulation Toggle */}
          <button
            onClick={handleStartSim}
            className={`px-4 py-2 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition cursor-pointer ${
              isSimulating 
                ? 'bg-amber-100 text-amber-800 border border-amber-200 animate-pulse' 
                : 'bg-emerald-600 text-white hover:bg-emerald-700'
            }`}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSimulating ? 'animate-spin' : ''}`} />
            {isSimulating ? 'Pause Active GPS Telemetry' : 'Simulate Delivery GPS'}
          </button>
        </div>
      </div>

      {/* Grid containing tracking view and navigation maps */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left column: List of deliveries */}
        <div className="lg:col-span-1 space-y-4">
          
          {/* Status filtering row */}
          <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none" id="delivery-status-filters">
            {['All', 'Pending Dispatch', 'In Transit', 'Delivered', 'Delayed'].map(st => (
              <button
                key={st}
                onClick={() => setFilter(st)}
                className={`px-2.5 py-1.5 text-[11px] font-bold uppercase rounded-xl tracking-wider shrink-0 cursor-pointer ${
                  filter === st 
                    ? 'bg-slate-800 text-white' 
                    : 'bg-white border border-slate-100 text-slate-500 hover:bg-slate-50'
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          {/* Delivery cards */}
          <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
            {filteredDeliveries.map(del => {
              const patient = patients.find(p => p.id === del.patientId);
              const isSelected = selectedDelId === del.id;

              return (
                <div
                  key={del.id}
                  id={`del-card-${del.id}`}
                  onClick={() => setSelectedDelId(del.id)}
                  className={`p-4 bg-white border rounded-2xl shadow-xs transition cursor-pointer hover:border-slate-300 ${
                    isSelected ? 'ring-2 ring-emerald-500/55 border-transparent' : 'border-slate-100'
                  }`}
                >
                  <div className="flex justify-between items-start gap-2">
                    <div>
                      <span className={`text-[9px] font-bold font-mono tracking-wider uppercase px-2 py-0.5 rounded-md ${
                        del.priority === 'urgent' ? 'bg-rose-50 text-rose-700 border border-rose-100' : 'bg-slate-100 text-slate-700'
                      }`}>
                        {del.priority} Priority
                      </span>
                      <h4 className="font-semibold text-slate-800 text-sm mt-1">{patient?.name}</h4>
                      <p className="text-xs text-slate-400 font-medium truncate mt-0.5">{del.address}</p>
                      <div className="flex items-center gap-1.5 mt-1">
                        <span className="text-[10px] font-semibold text-indigo-650 bg-indigo-50/70 border border-indigo-100/40 px-2 py-0.5 rounded font-mono">
                          📍 Group Area: {del.area || 'AREA 1'}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-2 shrink-0">
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded-lg font-bold ${
                        del.status === 'pending_dispatch' ? 'bg-amber-50 text-amber-700' :
                        del.status === 'in_transit' ? 'bg-sky-50 text-sky-700 border border-sky-150 animate-pulse' :
                        del.status === 'delivered' ? 'bg-emerald-50 text-emerald-700' :
                        'bg-rose-50 text-rose-700'
                      }`}>
                        {del.status.replace('_', ' ')}
                      </span>

                      {onDeleteDelivery && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (confirm(`Are you sure you want to remove/delete this delivery dispatch route for ${patient?.name || 'Unknown Patient'}?`)) {
                              onDeleteDelivery(del.id);
                            }
                          }}
                          title="Delete/Cancel Delivery Route"
                          className="p-1.5 bg-rose-50 text-rose-500 hover:bg-rose-100 hover:text-rose-700 rounded-lg transition cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Payment Sub-badge */}
                  <div className="flex gap-1.5 mt-2">
                    {del.paymentMode && (
                      <span className={`text-[9px] font-bold font-mono px-1.5 py-0.5 rounded uppercase block border ${
                        del.paymentMode === 'cash' 
                          ? 'bg-amber-50/70 text-amber-800 border-amber-200'
                          : 'bg-indigo-50/70 text-indigo-800 border-indigo-200'
                      }`}>
                        {del.paymentMode === 'cash' ? '💵 Cash C.O.D' : '💳 Credit Card'}
                      </span>
                    )}
                    <span className={`text-[9px] font-bold font-mono px-1.5 py-0.5 rounded uppercase block border ${
                      del.paymentStatus === 'paid'
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        : 'bg-rose-50 text-rose-800 border-rose-200 animate-pulse'
                    }`}>
                      {del.paymentStatus === 'paid' ? 'Paid' : 'Unpaid'}
                    </span>
                  </div>

                  {/* Progress Line */}
                  <div className="mt-3.5 space-y-1">
                    <div className="flex justify-between items-center text-[10px] text-slate-400">
                      <span className="font-mono">Route Progress</span>
                      <span className="font-bold text-slate-700">{del.progress}%</span>
                    </div>
                    <div className="w-full bg-slate-150 rounded-full h-1.5 overflow-hidden">
                      <div 
                        className={`h-1.5 rounded-full transition-all duration-300 ${
                          del.status === 'delivered' ? 'bg-emerald-500' :
                          del.status === 'delayed' ? 'bg-rose-500' : 'bg-sky-500'
                        }`}
                        style={{ width: `${del.progress}%` }}
                      />
                    </div>
                  </div>

                  <div className="mt-3 py-2 border-t border-slate-50 flex items-center justify-between text-xs text-slate-400">
                    <div className="flex items-center gap-1">
                      <User className="w-3.5 h-3.5" />
                      <span>{del.courierName}</span>
                    </div>
                    <div className="flex items-center gap-1 font-mono text-[11px] text-slate-500">
                      <Clock className="w-3 h-3 text-slate-400" />
                      <span>{del.estimatedDelivery}</span>
                    </div>
                  </div>
                </div>
              );
            })}

            {filteredDeliveries.length === 0 && (
              <div className="p-8 text-center bg-white border border-dashed border-slate-200 rounded-2xl text-slate-400">
                No active delivery dispatches match selected filter.
              </div>
            )}
          </div>
        </div>

        {/* Right column: Interactive Visual GPS Map or detail dashboard */}
        <div className="lg:col-span-2">
          
          {selectedDelId ? (() => {
            const del = deliveries.find(d => d.id === selectedDelId)!;
            const patient = patients.find(p => p.id === del.patientId)!;
            const refill = refills.find(r => r.id === del.refillRequestId);
            
            const medPrice = refill ? medicationsPricing(refill.medicationId) : 35.00;
            const subtotal = medPrice;
            const totalCost = subtotal + del.deliveryFee;

            // Coordinates for visual map path
            const startX = 50;
            const startY = 150;
            const endX = 350;
            const endY = 50;
            const ctrlX1 = 150;
            const ctrlY1 = 120;
            const ctrlX2 = 250;
            const ctrlY2 = 80;

            const t = del.progress / 100;
            const currentX = (1-t)*(1-t)*(1-t)*startX + 3*(1-t)*(1-t)*t*ctrlX1 + 3*(1-t)*t*t*ctrlX2 + t*t*t*endX;
            const currentY = (1-t)*(1-t)*(1-t)*startY + 3*(1-t)*(1-t)*t*ctrlY1 + 3*(1-t)*t*t*ctrlY2 + t*t*t*endY;

            return (
              <div className="space-y-6 animate-fadeIn">
                {/* Visual Telemetry Box */}
                <div className="bg-slate-900 rounded-2xl shadow-md overflow-hidden relative border border-slate-800">
                  <div className="absolute top-3 left-3 bg-slate-950/80 backdrop-blur-md border border-slate-800 px-3 py-1 rounded-xl text-white text-[10px] font-mono flex items-center gap-2 z-10">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                    Interactive Transit Tracker (GPS Sim)
                  </div>

                  <div className="absolute top-3 right-3 bg-slate-950/80 backdrop-blur-md border border-slate-800 px-3 py-1 rounded-xl text-white text-[10px] font-mono z-10">
                    Scale: 1 : 20,000
                  </div>

                  {/* SVG Map Canvas */}
                  <div className="w-full h-56 bg-slate-950 relative overflow-hidden" id="gis-svg-container">
                    <svg className="w-full h-full" viewBox="0 0 400 200">
                      <rect width="100%" height="100%" fill="#0b0f19" />
                      <path 
                        d={`M ${startX} ${startY} C ${ctrlX1} ${ctrlY1}, ${ctrlX2} ${ctrlY2}, ${endX} ${endY}`} 
                        className="stroke-slate-800 fill-none" 
                        strokeWidth="12" 
                        strokeLinecap="round"
                      />
                      <path 
                        d={`M ${startX} ${startY} C ${ctrlX1} ${ctrlY1}, ${ctrlX2} ${ctrlY2}, ${endX} ${endY}`} 
                        className="stroke-amber-400/40 fill-none" 
                        strokeWidth="1.5" 
                        strokeDasharray="6,4"
                        strokeLinecap="round"
                      />
                      <path 
                        d={`M ${startX} ${startY} C ${ctrlX1} ${ctrlY1}, ${ctrlX2} ${ctrlY2}, ${endX} ${endY}`} 
                        className="stroke-emerald-500/80 fill-none" 
                        strokeWidth="4" 
                        strokeDasharray={`${(del.progress / 100) * 450} 450`}
                        strokeLinecap="round"
                      />

                      <g transform={`translate(${startX}, ${startY})`}>
                        <circle r="11" className="fill-slate-900 stroke-emerald-500" strokeWidth="2" />
                        <text y="3" className="text-[7px] font-bold fill-white" textAnchor="middle">RX</text>
                      </g>

                      <g transform={`translate(${endX}, ${endY})`}>
                        <circle r="11" className="fill-slate-900 stroke-indigo-500" strokeWidth="2" />
                        <path d="M -4 2 M -4 2 L 4 2 L 4 -2 L 0 -5 L -4 -2 Z" className="fill-indigo-500 text-indigo-400 stroke-indigo-400" strokeWidth="1" />
                      </g>

                      {del.status === 'in_transit' && (
                        <g transform={`translate(${currentX}, ${currentY})`}>
                          <circle r="8" className="fill-sky-500 stroke-white" strokeWidth="1" />
                          <polygon points="0,-3 3,3 -3,3" className="fill-white" transform="rotate(75)" />
                        </g>
                      )}
                    </svg>

                    <div className="absolute bottom-3 left-4 right-4 flex justify-between gap-4 text-xs">
                      <div className="bg-slate-950/90 border border-slate-800 p-2.5 rounded-xl text-white space-y-0.5 shrink-0">
                        <p className="text-[9px] font-mono text-slate-400">COURIER ASSIGNED</p>
                        <p className="font-bold text-sky-400 flex items-center gap-1">{del.courierName}</p>
                      </div>

                      <div className="bg-slate-950/90 border border-slate-800 p-2.5 rounded-xl text-white space-y-0.5 shrink-0 text-center">
                        <p className="text-[9px] font-mono text-slate-400">DELIVERY REGION</p>
                        <p className="font-bold text-emerald-400 flex items-center justify-center gap-1 font-mono uppercase tracking-wider">{del.area || 'AREA 1'}</p>
                      </div>

                      <div className="bg-slate-950/90 border border-slate-800 p-2.5 rounded-xl text-white space-y-0.5 text-right shrink-0">
                        <p className="text-[9px] font-mono text-slate-400">EST. TIMELINE</p>
                        <p className="font-bold text-indigo-400">{del.estimatedDelivery}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Main Action Deck: Bento grid splitting Delivery controls & Driver Messenger */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* Part 1: Dispatch Billing & Doorstep controls */}
                  <div className="bg-white border border-slate-100 p-5 rounded-2xl shadow-xs space-y-4 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-center pb-2.5 border-b border-slate-50">
                        <div>
                          <h3 className="font-bold text-slate-800 text-sm">Doorstep Delivery Console</h3>
                          <p className="text-xs text-slate-400">Courier priority & dropoff parameters</p>
                        </div>
                        <span className="px-2 py-0.5 bg-slate-50 text-slate-500 rounded-lg text-xs font-mono font-bold">
                          {del.id}
                        </span>
                      </div>

                      {/* Financial billing panel */}
                      <div className="p-3 bg-slate-50/50 rounded-xl mt-3 space-y-2 text-xs">
                        <span className="text-[9px] font-bold font-mono tracking-wider text-slate-400 block uppercase">Billing invoice data</span>
                        <div className="flex justify-between text-slate-600">
                          <span>Medication price:</span>
                          <span className="font-mono font-semibold">${subtotal.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-slate-600">
                          <span>Delivery service fee:</span>
                          <span className="font-mono font-semibold">${del.deliveryFee.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between font-bold text-slate-800 pt-1.5 border-t border-slate-200">
                          <span>Total due collection:</span>
                          <span className="font-mono text-sm">${totalCost.toFixed(2)}</span>
                        </div>

                        {/* Interactive Mode & Collect Cash toggle buttons */}
                        <div className="pt-2 border-t border-slate-200/60 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-slate-500 font-medium">Payment Mode:</span>
                            <div className="flex gap-1.5">
                              <button
                                onClick={() => onUpdateDeliveryPaymentState(del.id, 'cash', del.paymentStatus || 'unpaid')}
                                className={`px-2 py-1 text-[10px] font-bold rounded-md border transition cursor-pointer ${
                                  del.paymentMode === 'cash'
                                    ? 'bg-amber-100 border-amber-350 text-amber-900'
                                    : 'bg-white border-slate-150 text-slate-500'
                                }`}
                              >
                                Cash
                              </button>
                              <button
                                onClick={() => onUpdateDeliveryPaymentState(del.id, 'credit', del.paymentStatus || 'unpaid')}
                                className={`px-2 py-1 text-[10px] font-bold rounded-md border transition cursor-pointer ${
                                  del.paymentMode === 'credit'
                                    ? 'bg-indigo-100 border-indigo-350 text-indigo-900'
                                    : 'bg-white border-slate-150 text-slate-500'
                                }`}
                              >
                                Credit
                              </button>
                            </div>
                          </div>

                          <div className="flex items-center justify-between">
                            <span className="text-slate-500 font-medium">Payment Status:</span>
                            <button
                              onClick={() => onUpdateDeliveryPaymentState(del.id, del.paymentMode || 'cash', del.paymentStatus === 'paid' ? 'unpaid' : 'paid')}
                              className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase transition flex items-center gap-1 cursor-pointer ${
                                del.paymentStatus === 'paid'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-rose-100 text-rose-800 border border-rose-200 animate-pulse'
                              }`}
                            >
                              {del.paymentStatus === 'paid' ? (
                                <><Check className="w-3 h-3" /> PAID / COLLECTED</>
                              ) : (
                                <><AlertTriangle className="w-3 h-3" /> COLLECT CASH NOW</>
                              )}
                            </button>
                          </div>
                        </div>
                      </div>

                      <div className="text-xs space-y-1 pt-3">
                        <p className="font-bold text-slate-700">Dropoff Address:</p>
                        <p className="text-slate-500 bg-slate-50 p-2.5 rounded-lg border border-slate-100 leading-relaxed font-mono text-[11px]">{del.address}</p>
                      </div>

                      {/* Driver Selection & Delivery Area Section */}
                      <div className="pt-3 border-t border-slate-100 space-y-3.5 text-xs">
                        <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block">Assigned Logistics Parameters</span>
                        
                        <div className="grid grid-cols-2 gap-3.5">
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-slate-500 block">Select Driver Name</label>
                            <select
                              value={del.courierName}
                              onChange={(e) => onUpdateDeliveryDriverAndArea(del.id, e.target.value, del.area || 'AREA 1')}
                              className="w-full text-[11px] bg-white border border-slate-205 rounded-lg p-2 focus:outline-emerald-500 font-medium text-slate-800 cursor-pointer"
                            >
                              <option value="Driver A">Driver A</option>
                              <option value="Driver B">Driver B</option>
                              <option value="Driver C">Driver C</option>
                              <option value="Driver D">Driver D</option>
                              <option value="Driver E">Driver E</option>
                            </select>
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-slate-500 block">Deliver to Area</label>
                            <select
                              value={del.area || 'AREA 1'}
                              onChange={(e) => onUpdateDeliveryDriverAndArea(del.id, del.courierName, e.target.value)}
                              className="w-full text-[11px] bg-white border border-slate-205 rounded-lg p-2 focus:outline-emerald-500 font-medium text-slate-800 cursor-pointer"
                            >
                              <option value="AREA 1">AREA 1</option>
                              <option value="AREA 2">AREA 2</option>
                              <option value="AREA 3">AREA 3</option>
                              <option value="AREA 4">AREA 4</option>
                              <option value="AREA 5">AREA 5</option>
                              <option value="AREA 6">AREA 6</option>
                              <option value="AREA 7">AREA 7</option>
                            </select>
                          </div>
                        </div>

                        {/* Optional Text input fallback to customize name and area */}
                        <div className="grid grid-cols-2 gap-3 pb-0.5">
                          <div>
                            <input
                              type="text"
                              value={del.courierName}
                              placeholder="Or enter custom courier..."
                              className="w-full text-[10px] p-2 border border-slate-200 rounded-lg focus:outline-emerald-500 font-mono bg-slate-50/50"
                              onChange={(e) => {
                                onUpdateDeliveryDriverAndArea(del.id, e.target.value, del.area || 'AREA 1');
                              }}
                            />
                            <p className="text-[9px] text-slate-400 mt-0.5">Edit inline to customize</p>
                          </div>

                          <div>
                            <input
                              type="text"
                              value={del.area || 'AREA 1'}
                              placeholder="Or enter custom area..."
                              className="w-full text-[10px] p-2 border border-slate-200 rounded-lg focus:outline-emerald-500 font-mono bg-slate-50/50"
                              onChange={(e) => {
                                onUpdateDeliveryDriverAndArea(del.id, del.courierName, e.target.value);
                              }}
                            />
                            <p className="text-[9px] text-slate-400 mt-0.5">Edit inline to customize</p>
                          </div>
                        </div>

                      </div>
                    </div>

                    {/* Action trigger dispatch buttons */}
                    <div className="pt-3 border-t border-slate-100" id="delivery-action-triggers">
                      {del.status === 'pending_dispatch' && (
                        <button
                          onClick={() => handleDispatch(del.id)}
                          className="w-full py-2.5 bg-slate-800 hover:bg-slate-900 text-white font-semibold text-xs rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <Play className="w-3.5 h-3.5" /> Dispatch Carrier Vehicle
                        </button>
                      )}

                      {del.status === 'in_transit' && (
                        <button
                          onClick={() => handleMarkDelivered(del.id)}
                          className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <CheckCircle className="w-3.5 h-3.5" /> Complete Doorstep Dropoff
                        </button>
                      )}

                      {del.status === 'delivered' && (
                        <div className="text-xs font-semibold text-emerald-700 bg-emerald-50 p-2.5 rounded-xl flex items-center gap-2 justify-center">
                          <CheckCircle className="w-4 h-4 text-emerald-600" /> 
                          <span>Dispensed & Settled Successfully.</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Part 2: WhatsApp / Simulated SMS Communications driver console */}
                  <div className="bg-white border border-slate-100 p-5 rounded-2xl shadow-xs space-y-4">
                    <div>
                      <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                        <MessageSquare className="w-4 h-4 text-emerald-500" />
                        Driver Communication Hub
                      </h3>
                      <p className="text-xs text-slate-400">Trigger patient notices via real WhatsApp API deep link or live local simulator</p>
                    </div>

                    {/* Channel Selector */}
                    <div className="flex gap-1.5 p-1 bg-slate-100 rounded-xl" id="msg-mode-switch">
                      <button
                        onClick={() => setMsgChannel('whatsapp')}
                        className={`flex-1 py-1.5 text-[11px] font-bold uppercase rounded-lg transition-all text-center cursor-pointer ${
                          msgChannel === 'whatsapp' 
                            ? 'bg-white text-slate-800 shadow-3xs' 
                            : 'text-slate-500 hover:text-slate-800'
                        }`}
                      >
                        WhatsApp Web
                      </button>
                      <button
                        onClick={() => setMsgChannel('sms')}
                        className={`flex-1 py-1.5 text-[11px] font-bold uppercase rounded-lg transition-all text-center cursor-pointer ${
                          msgChannel === 'sms' 
                            ? 'bg-white text-slate-800 shadow-3xs' 
                            : 'text-slate-500 hover:text-slate-800'
                        }`}
                      >
                        Simulated SMS
                      </button>
                    </div>

                    {/* Presets selectors */}
                    <div className="space-y-1.5">
                      <span className="text-[9px] font-bold font-mono text-slate-400 uppercase tracking-wider block">Message Preset Templates</span>
                      <div className="grid grid-cols-3 gap-1.5">
                        {[
                          { id: 'on_the_way', label: '🚚 On Way' },
                          { id: 'arrived', label: '📍 Arrived' },
                          { id: 'completed', label: '✅ Delivered' }
                        ].map(preset => (
                          <button
                            key={preset.id}
                            onClick={() => setActivePreset(preset.id)}
                            className={`py-1 px-1 text-[10px] rounded-lg text-center font-semibold border transition cursor-pointer ${
                              activePreset === preset.id 
                                ? 'bg-indigo-50 border-indigo-300 text-indigo-700' 
                                : 'bg-white border-slate-150 text-slate-500 hover:bg-slate-50'
                            }`}
                          >
                            {preset.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Message composing box */}
                    <div className="space-y-2">
                      <textarea
                        rows={3}
                        value={customMessage}
                        onChange={e => setCustomMessage(e.target.value)}
                        className="w-full text-xs p-3 bg-slate-50 border border-slate-205 rounded-xl focus:outline-emerald-500 focus:bg-white resize-none"
                        placeholder="Write direct patient notification memo here..."
                      />

                      <div className="flex gap-2">
                        {msgChannel === 'whatsapp' ? (
                          <button
                            onClick={() => handleLaunchWhatsApp(patient.phone, customMessage)}
                            className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                          >
                            <Share2 className="w-3.5 h-3.5" /> Launch WhatsApp Web Link
                          </button>
                        ) : (
                          <button
                            onClick={() => handleSimSend(customMessage)}
                            className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                          >
                            <Send className="w-3.5 h-3.5" /> Dispatch Simulated SMS
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Simulated Smartphone Handset Sandbox display under layout */}
                <div className="bg-slate-900 rounded-2xl p-5 border border-slate-800 shadow-md">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                    <div className="flex items-center gap-2">
                      <SmartphoneIcon className="w-4 h-4 text-sky-400" />
                      <span className="text-xs font-bold text-white font-sans">Patient Smartphone Sandbox</span>
                    </div>
                    <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest bg-slate-950 px-2 py-0.5 rounded-lg">
                      {patient.phone}
                    </span>
                  </div>

                  <div className="mt-4 bg-[#0a0f1d] rounded-xl p-4 min-h-[160px] max-h-[250px] overflow-y-auto space-y-3 scrollbar-thin">
                    <p className="text-[10px] text-center text-slate-500 tracking-wider uppercase font-mono py-1">
                      &bull; Secure End-to-End Chat Thread &bull;
                    </p>

                    {/* Preloaded welcome carrier note */}
                    <div className="flex flex-col items-start max-w-[80%] space-y-1">
                      <span className="text-[9px] text-slate-500 font-mono">System Core</span>
                      <div className="bg-slate-800/80 text-slate-300 p-2.5 rounded-2xl rounded-tl-xs text-xs leading-relaxed shadow-xs">
                        Refill registered. Secure dispatcher assigned: {del.courierName} is routing transit logistics.
                      </div>
                    </div>

                    {/* Dynamic Driver Sent messages */}
                    {del.communicationLogs && del.communicationLogs.map((log) => (
                      <div 
                        key={log.id} 
                        className={`flex flex-col space-y-0.5 max-w-[80%] ${
                          log.sender.includes('Driver') || log.sender.includes('Courier') 
                            ? 'ml-auto items-end' 
                            : 'items-start'
                        }`}
                      >
                        <span className="text-[9px] text-slate-500 font-mono">
                          {log.sender} &bull; {new Date(log.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} via {log.channel.toUpperCase()}
                        </span>
                        <div className={`p-2.5 rounded-2xl text-xs leading-relaxed shadow-xs ${
                          log.channel === 'whatsapp' 
                            ? 'bg-emerald-900 border border-emerald-800 text-emerald-100 rounded-tr-xs' 
                            : 'bg-indigo-900 border border-indigo-800 text-indigo-100 rounded-tr-xs'
                        }`}>
                          {log.message}
                        </div>
                      </div>
                    ))}

                    {/* Empty thread placeholder */}
                    {(!del.communicationLogs || del.communicationLogs.length === 0) && (
                      <div className="text-center py-6 text-xs text-slate-600 font-mono">
                        No transit alerts dispatched yet. Click "Launch WhatsApp" or "Dispatch Simulated SMS" above to simulate driver communications.
                      </div>
                    )}
                  </div>
                </div>

              </div>
            );
          })() : (
            <div className="bg-slate-50 border border-slate-205 rounded-2xl p-12 text-center text-slate-400 space-y-3">
              <Map className="w-12 h-12 mx-auto stroke-slate-300" />
              <div className="max-w-sm mx-auto space-y-1">
                <h4 className="text-sm font-semibold text-slate-700">Select active shipment row</h4>
                <p className="text-xs text-slate-400">Click on any customer order card on the left list to review geographic route, courier information, update payment statuses, and trigger driver-to-patient alerts.</p>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
