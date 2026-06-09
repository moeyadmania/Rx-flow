/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  Activity, 
  AlertTriangle, 
  Truck, 
  Users, 
  Sparkles, 
  ArrowRight, 
  CheckCircle2, 
  Clock, 
  HeartHandshake,
  LayoutDashboard,
  ShoppingBag,
  ClipboardCheck
} from 'lucide-react';
import { Medication, Patient, RefillRequest, Delivery } from '../types';

interface DashboardProps {
  medications: Medication[];
  patients: Patient[];
  refills: RefillRequest[];
  deliveries: Delivery[];
  setView: (view: 'dashboard' | 'medications' | 'dispensing' | 'refills' | 'deliveries' | 'crm') => void;
  setSelectedRefillId?: (id: string | null) => void;
  setSelectedPatientId?: (id: string | null) => void;
}

export default function Dashboard({
  medications,
  patients,
  refills,
  deliveries,
  setView,
  setSelectedRefillId,
  setSelectedPatientId
}: DashboardProps) {
  // Compute analytics
  const totalMedications = medications.length;
  const lowStockItems = medications.filter(m => m.stock <= m.minStock);
  const pendingRefills = refills.filter(r => r.status === 'pending' || r.status === 'review');
  const activeDeliveries = deliveries.filter(d => d.status === 'in_transit' || d.status === 'pending_dispatch');
  const totalPatients = patients.length;

  // Refill breakdown
  const statusCounts = {
    pending: refills.filter(r => r.status === 'pending').length,
    review: refills.filter(r => r.status === 'review').length,
    approved: refills.filter(r => r.status === 'approved').length,
    dispensed: refills.filter(r => r.status === 'dispensed').length,
  };

  const totalRefillRequests = refills.length;
  const pendingPercentage = totalRefillRequests ? Math.round((statusCounts.pending / totalRefillRequests) * 100) : 0;
  const approvedPercentage = totalRefillRequests ? Math.round((statusCounts.approved / totalRefillRequests) * 100) : 0;
  const dispensedPercentage = totalRefillRequests ? Math.round((statusCounts.dispensed / totalRefillRequests) * 100) : 0;
  const reviewPercentage = totalRefillRequests ? Math.round((statusCounts.review / totalRefillRequests) * 100) : 0;

  // Handle viewing specific item
  const handleReviewRefill = (id: string) => {
    if (setSelectedRefillId) {
      setSelectedRefillId(id);
    }
    setView('refills');
  };

  const handleViewPatient = (id: string) => {
    if (setSelectedPatientId) {
      setSelectedPatientId(id);
    }
    setView('crm');
  };

  return (
    <div className="space-y-6" id="dashboard-container">
      {/* Upper Welcome Banner */}
      <div className="p-6 bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-700 rounded-2xl text-white shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-white/20 rounded-lg text-emerald-100">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </span>
            <span className="text-xs uppercase font-mono tracking-widest text-emerald-100">AI-Assisted Operations</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-sans font-semibold tracking-tight">RxFlow Pharmacy Portal</h1>
          <p className="text-emerald-50 text-sm max-w-xl">
            Streamlining prescription processing, medication stocking, dispatch tracking, and relationship intelligence in one unified workflow.
          </p>
        </div>
        <div className="flex flex-wrap gap-2 pt-2 md:pt-0">
          <button 
            onClick={() => setView('refills')}
            className="px-4 py-2 bg-white text-emerald-800 font-medium text-sm rounded-xl hover:bg-emerald-50 transition cursor-pointer flex items-center gap-1.5"
            id="quick-refills-btn"
          >
            Process Refills
            <ArrowRight className="w-4 h-4" />
          </button>
          <button 
            onClick={() => setView('deliveries')}
            className="px-4 py-2 bg-emerald-700/50 backdrop-blur-md border border-white/20 text-white font-medium text-sm rounded-xl hover:bg-emerald-700/75 transition cursor-pointer"
            id="quick-deliveries-btn"
          >
            Map Dispatcher
          </button>
        </div>
      </div>

      {/* Grid of KPI Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4" id="dashboard-kpi-grid">
        {/* KPI 1 */}
        <div className="p-5 bg-white border border-slate-100 rounded-2xl shadow-xs hover:shadow-md transition flex flex-col justify-between" id="kpi-refills">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold uppercase text-slate-400">Refill Backlog</span>
            <span className="p-2 bg-amber-50 text-amber-600 rounded-xl">
              <Clock className="w-5 h-5" />
            </span>
          </div>
          <div className="mt-4">
            <span className="text-3xl font-sans font-bold text-slate-800">{pendingRefills.length}</span>
            <div className="text-xs text-amber-600 mt-1 flex items-center gap-1">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping"></span>
              {statusCounts.pending} Pending approval
            </div>
          </div>
        </div>

        {/* KPI 2 */}
        <div className="p-5 bg-white border border-slate-100 rounded-2xl shadow-xs hover:shadow-md transition flex flex-col justify-between" id="kpi-deliveries">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold uppercase text-slate-400">Active Dispatches</span>
            <span className="p-2 bg-sky-50 text-sky-600 rounded-xl">
              <Truck className="w-5 h-5" />
            </span>
          </div>
          <div className="mt-4">
            <span className="text-3xl font-sans font-bold text-slate-800">{activeDeliveries.length}</span>
            <p className="text-xs text-sky-600 mt-1">
              {deliveries.filter(d => d.status === 'in_transit').length} Out on road
            </p>
          </div>
        </div>

        {/* KPI 3 */}
        <div className="p-5 bg-white border border-slate-100 rounded-2xl shadow-xs hover:shadow-md transition flex flex-col justify-between" id="kpi-stock">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold uppercase text-slate-400">Restock Warnings</span>
            <span className={`p-2 rounded-xl ${lowStockItems.length > 0 ? 'bg-rose-50 text-rose-600 animate-pulse' : 'bg-green-50 text-green-600'}`}>
              <AlertTriangle className="w-5 h-5" />
            </span>
          </div>
          <div className="mt-4">
            <span className={`text-3xl font-sans font-bold ${lowStockItems.length > 0 ? 'text-rose-600' : 'text-slate-800'}`}>
              {lowStockItems.length}
            </span>
            <p className="text-xs text-slate-500 mt-1">
              {lowStockItems.length > 0 ? `${lowStockItems.length} item(s) below threshold` : 'All stocks optimal'}
            </p>
          </div>
        </div>

        {/* KPI 4 */}
        <div className="p-5 bg-white border border-slate-100 rounded-2xl shadow-xs hover:shadow-md transition flex flex-col justify-between" id="kpi-crm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold uppercase text-slate-400">CRM Patients</span>
            <span className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
              <Users className="w-5 h-5" />
            </span>
          </div>
          <div className="mt-4">
            <span className="text-3xl font-sans font-bold text-slate-800">{totalPatients}</span>
            <p className="text-xs text-emerald-600 mt-1 flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5" />
              100% Client retention
            </p>
          </div>
        </div>
      </div>

      {/* Operational Module Matrix */}
      <div className="space-y-3" id="operational-module-matrix">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <h2 className="text-base font-sans font-semibold text-slate-800">Operational Module Matrix</h2>
            <p className="text-xs text-slate-400 font-medium">Directly navigate and check real-time signals across all integrated workspaces</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Card 1: Overview */}
          <div 
            onClick={() => setView('dashboard')}
            className="p-4 bg-emerald-50/40 border border-emerald-100/80 rounded-2xl cursor-pointer hover:bg-emerald-50 hover:shadow-2xs transition-all duration-200 group text-left"
          >
            <div className="flex justify-between items-start">
              <div className="p-2.5 bg-emerald-100 text-emerald-800 rounded-xl">
                <LayoutDashboard className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-md font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800">
                Active
              </span>
            </div>
            <div className="mt-3.5 space-y-1">
              <h3 className="text-xs font-bold text-slate-800 group-hover:text-emerald-700 transition">Overview Dashboard</h3>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Central command room. High-level performance KPIs, real-time metrics, history alerts, and attention queues.
              </p>
            </div>
          </div>

          {/* Card 2: Inventory */}
          <div 
            onClick={() => setView('medications')}
            className="p-4 bg-white border border-slate-100 rounded-2xl cursor-pointer hover:bg-slate-50 hover:border-slate-200 hover:shadow-2xs transition-all duration-200 group text-left"
          >
            <div className="flex justify-between items-start">
              <div className="p-2.5 bg-slate-100 text-slate-700 rounded-xl">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded-md font-bold uppercase tracking-wider ${
                lowStockItems.length > 0 ? 'bg-rose-50 text-rose-700 border border-rose-100' : 'bg-slate-100 text-slate-700'
              }`}>
                {lowStockItems.length > 0 ? `${lowStockItems.length} Low` : 'Optimal'}
              </span>
            </div>
            <div className="mt-3.5 space-y-1">
              <h3 className="text-xs font-bold text-slate-800 group-hover:text-emerald-600 transition">Inventory & Stockroom</h3>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Chemical stockroom ledger. Track formula dosages, reorder critical levels, and manage automatic imports.
              </p>
            </div>
          </div>

          {/* Card 3: Dispensing Unit */}
          <div 
            onClick={() => setView('dispensing')}
            className="p-4 bg-white border border-slate-100 rounded-2xl cursor-pointer hover:bg-slate-50 hover:border-slate-200 hover:shadow-2xs transition-all duration-200 group text-left"
          >
            <div className="flex justify-between items-start">
              <div className="p-2.5 bg-indigo-50 text-indigo-700 rounded-xl">
                <Activity className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-md font-bold uppercase tracking-wider bg-indigo-50 text-indigo-700">
                Secured
              </span>
            </div>
            <div className="mt-3.5 space-y-1">
              <h3 className="text-xs font-bold text-slate-800 group-hover:text-indigo-600 transition">Molecular Dispensing</h3>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Pharmacist sign-offs, step-by-step chemical barcode clearance, and online telehealth portals.
              </p>
            </div>
          </div>

          {/* Card 4: Rx Refills */}
          <div 
            onClick={() => setView('refills')}
            className="p-4 bg-white border border-slate-100 rounded-2xl cursor-pointer hover:bg-slate-50 hover:border-slate-200 hover:shadow-2xs transition-all duration-200 group text-left"
          >
            <div className="flex justify-between items-start">
              <div className="p-2.5 bg-amber-50 text-amber-700 rounded-xl">
                <ClipboardCheck className="w-5 h-5" />
              </div>
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded-md font-bold uppercase tracking-wider ${
                pendingRefills.length > 0 ? 'bg-amber-100 text-amber-800 animate-pulse' : 'bg-slate-100 text-slate-700'
              }`}>
                {pendingRefills.length} Pending
              </span>
            </div>
            <div className="mt-3.5 space-y-1">
              <h3 className="text-xs font-bold text-slate-800 group-hover:text-amber-600 transition">Prescription Refills</h3>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Audit telehealth requests, run automatic allergy checks, download clinical forms, and dispatch couriers.
              </p>
            </div>
          </div>

          {/* Card 5: Courier Map */}
          <div 
            onClick={() => setView('deliveries')}
            className="p-4 bg-white border border-slate-100 rounded-2xl cursor-pointer hover:bg-slate-50 hover:border-slate-200 hover:shadow-2xs transition-all duration-200 group text-left"
          >
            <div className="flex justify-between items-start">
              <div className="p-2.5 bg-sky-50 text-sky-700 rounded-xl">
                <Truck className="w-5 h-5" />
              </div>
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded-md font-bold uppercase tracking-wider ${
                activeDeliveries.length > 0 ? 'bg-sky-100 text-sky-800' : 'bg-slate-100 text-slate-700'
              }`}>
                {activeDeliveries.length} Active
              </span>
            </div>
            <div className="mt-3.5 space-y-1">
              <h3 className="text-xs font-bold text-slate-800 group-hover:text-sky-650 transition">Logistics & Courier Map</h3>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Courier matching and route coordinates. Simulate transit milestones, and trigger instant system messages.
              </p>
            </div>
          </div>

          {/* Card 6: Patient CRM */}
          <div 
            onClick={() => setView('crm')}
            className="p-4 bg-white border border-slate-100 rounded-2xl cursor-pointer hover:bg-slate-50 hover:border-slate-200 hover:shadow-2xs transition-all duration-200 group text-left"
          >
            <div className="flex justify-between items-start">
              <div className="p-2.5 bg-teal-50 text-teal-800 rounded-xl">
                <Users className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-md font-bold uppercase tracking-wider bg-teal-100 text-teal-700">
                {totalPatients} Profiles
              </span>
            </div>
            <div className="mt-3.5 space-y-1">
              <h3 className="text-xs font-bold text-slate-800 group-hover:text-teal-700 transition">Patient CRM & Records</h3>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Track patient timeline, customize demographic tags, log medical status, allergy risks, and chronic condition logs.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Core Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Urgent Workflows & Alert Center */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Action Center Queue */}
          <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-xs" id="action-center-queue">
            <div className="flex items-center justify-between mb-4">
              <div className="space-y-0.5">
                <h3 className="text-base font-sans font-semibold text-slate-800">Priority Dispatch Queue</h3>
                <p className="text-xs text-slate-400">Prescriptions waiting for pharmacist sign-off or visual verification</p>
              </div>
              <span className="px-2 py-1 bg-amber-50 text-amber-700 text-xs font-mono rounded-lg font-semibold">
                Requires Pharmacist Review
              </span>
            </div>

            {pendingRefills.length === 0 ? (
              <div className="p-8 border border-dashed border-slate-200 rounded-xl text-center space-y-2">
                <div className="inline-flex p-3 bg-emerald-50 text-emerald-600 rounded-full">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <h4 className="text-sm font-semibold text-slate-700">Refill Queue Cleared</h4>
                <p className="text-xs text-slate-400">All received refill requests are processed, packed, or dispatched.</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100 max-h-[300px] overflow-y-auto pr-1">
                {pendingRefills.map((refill) => {
                  const patient = patients.find(p => p.id === refill.patientId);
                  const med = medications.find(m => m.id === refill.medicationId);
                  return (
                    <div key={refill.id} className="py-3 flex items-center justify-between gap-4 first:pt-0 last:pb-0 group">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-slate-800 text-sm hover:underline cursor-pointer" onClick={() => handleViewPatient(patient?.id || '')}>
                            {patient?.name}
                          </span>
                          <span className={`text-[10px] px-1.5 py-0.5 font-bold uppercase rounded-md tracking-wider ${
                            refill.status === 'review' ? 'bg-amber-100 text-amber-800' : 'bg-teal-50 text-teal-800'
                          }`}>
                            {refill.status}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500">
                          Prescribed: <span className="font-semibold text-slate-700">{med?.name} ({med?.dosage})</span> &bull; Rx: {refill.rxNumber}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleReviewRefill(refill.id)}
                          className="px-3 py-1.5 bg-slate-50 hover:bg-emerald-50 hover:text-emerald-700 border border-slate-100 hover:border-emerald-200 text-xs font-medium text-slate-600 rounded-lg transition"
                        >
                          Review Rx
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Low Stock Attention List */}
          <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-xs" id="inventory-alert-card">
            <div className="flex items-center justify-between mb-4">
              <div className="space-y-0.5">
                <h3 className="text-base font-sans font-semibold text-slate-800">Critical Medication Reorder List</h3>
                <p className="text-xs text-rose-500 font-mono font-medium">Automatic Alerts triggered based on daily consumption rates</p>
              </div>
              <button 
                onClick={() => setView('medications')}
                className="text-xs font-medium text-emerald-600 hover:text-emerald-700 flex items-center gap-1 group"
              >
                Stock Room
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>

            {lowStockItems.length === 0 ? (
              <div className="p-8 bg-green-50/40 border border-green-100 rounded-xl flex items-center gap-3 text-green-800">
                <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0" />
                <div className="text-xs">
                  <span className="font-bold">Inventory Safe:</span> All core cardiovascular, diabetic, antibiotic, and analgesic chemicals are optimally stocked above critical reorder levels.
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {lowStockItems.map((med) => {
                  const stockPercentage = Math.round((med.stock / (med.minStock * 2)) * 100);
                  return (
                    <div key={med.id} className="p-3 bg-rose-50/50 border border-rose-100 rounded-xl flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <h4 className="text-xs font-bold text-slate-800 truncate">{med.name}</h4>
                        <p className="text-[10px] text-slate-500 font-mono truncate">{med.genericName}</p>
                        <div className="mt-1 flex items-center gap-2">
                          <span className="text-[10px] font-bold text-rose-700 font-mono">Stock: {med.stock} units</span>
                          <span className="text-[10px] text-slate-400">Min: {med.minStock}</span>
                        </div>
                      </div>
                      <div className="w-12 shrink-0 text-right">
                        <div className="text-[10px] font-mono text-rose-600 font-semibold mb-1">
                          {stockPercentage}% left
                        </div>
                        <div className="w-full bg-rose-100 rounded-full h-1">
                          <div 
                            className="bg-rose-500 h-1 rounded-full transition-all" 
                            style={{ width: `${Math.min(stockPercentage, 100)}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>

        {/* Column 3: Analytical Charts, Activity Timeline */}
        <div className="space-y-6">
          
          {/* Pharmacy Performance Ring (Custom SVG) */}
          <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-xs flex flex-col justify-between" id="performance-chart">
            <div className="space-y-0.5">
              <h3 className="text-base font-sans font-semibold text-slate-800 font-medium">Refill Status Analysis</h3>
              <p className="text-xs text-slate-400">Breakdown of refills processed this session</p>
            </div>

            <div className="flex items-center justify-center py-6 gap-6">
              {/* Custom SVG ring chart */}
              <div className="relative w-32 h-32 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90">
                  <circle
                    cx="64"
                    cy="64"
                    r="48"
                    className="stroke-slate-100 fill-none"
                    strokeWidth="12"
                  />
                  {/* Arc for Approved / Dispensed */}
                  <circle
                    cx="64"
                    cy="64"
                    r="48"
                    className="stroke-emerald-500 fill-none transition-all duration-1000"
                    strokeWidth="12"
                    strokeDasharray={301.6}
                    strokeDashoffset={301.6 - (301.6 * (approvedPercentage + dispensedPercentage)) / 100}
                    strokeLinecap="round"
                  />
                  {/* Arc for Pending / Review */}
                  <circle
                    cx="64"
                    cy="64"
                    r="48"
                    className="stroke-amber-500 fill-none transition-all duration-1000"
                    strokeWidth="12"
                    strokeDasharray={301.6}
                    strokeDashoffset={301.6 - (301.6 * (pendingPercentage + reviewPercentage)) / 100}
                    strokeLinecap="round"
                    style={{ transformOrigin: 'center' }}
                  />
                </svg>
                <div className="absolute text-center">
                  <span className="text-2xl font-bold font-sans text-slate-800">{totalRefillRequests}</span>
                  <p className="text-[10px] text-slate-400">Total RXs</p>
                </div>
              </div>

              {/* Chart Legend with Metrics */}
              <div className="space-y-2 text-xs">
                <div className="flex items-center gap-1.5 text-slate-600">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span>
                  <div>
                    <span className="font-semibold">{approvedPercentage + dispensedPercentage}%</span> Ready/Filled
                  </div>
                </div>
                <div className="flex items-center gap-1.5 text-slate-600">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block"></span>
                  <div>
                    <span className="font-semibold">{pendingPercentage + reviewPercentage}%</span> Review Backlog
                  </div>
                </div>
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl space-y-1.5 text-[11px] text-slate-500">
              <div className="flex justify-between font-mono">
                <span>Completed / Dispensed</span>
                <span className="font-bold text-slate-700">{statusCounts.dispensed}</span>
              </div>
              <div className="flex justify-between font-mono">
                <span>Approved & Packing</span>
                <span className="font-bold text-slate-700">{statusCounts.approved}</span>
              </div>
              <div className="flex justify-between font-mono">
                <span>Awaiting Audit</span>
                <span className="font-bold text-slate-700">{statusCounts.pending + statusCounts.review}</span>
              </div>
            </div>
          </div>

          {/* CRM Quick Notes Timeline */}
          <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-xs flex flex-col" id="recent-patient-timeline">
            <h3 className="text-base font-sans font-semibold text-slate-800 mb-3">Recent CRM Activity</h3>
            
            <div className="space-y-4 max-h-[310px] overflow-y-auto pr-1">
              {patients.flatMap(p => p.notes.map(n => ({...n, patientName: p.name, patientId: p.id})))
                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                .slice(0, 4)
                .map((note) => (
                  <div key={note.id} className="relative pl-5 before:absolute before:left-1.5 before:top-1.5 before:bottom-0 before:w-0.5 before:bg-slate-100 last:before:hidden">
                    <div className="absolute left-0 top-1 w-3.5 h-3.5 bg-white border border-emerald-500 text-emerald-600 rounded-full flex items-center justify-center">
                      <HeartHandshake className="w-2 h-2" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-[11px]">
                        <span 
                          onClick={() => handleViewPatient(note.patientId)}
                          className="font-bold text-slate-700 hover:underline cursor-pointer"
                        >
                          {note.patientName}
                        </span>
                        <span className="text-slate-400 font-mono">
                          {new Date(note.date).toLocaleDateString(undefined, {month: 'short', day: 'numeric'})}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed bg-slate-50 border border-slate-100/50 p-2 rounded-lg">
                        {note.summary}
                      </p>
                      <div className="flex items-center justify-between text-[10px] text-slate-400">
                        <span className="font-mono text-[9px] uppercase tracking-wider">{note.type} interaction</span>
                        <span>Logged by {note.agentName}</span>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
