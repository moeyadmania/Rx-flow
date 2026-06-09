/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Users, 
  Search, 
  Phone, 
  Mail, 
  Calendar, 
  Plus, 
  Tag, 
  MessageSquare, 
  Lock, 
  Clock, 
  Activity, 
  HeartHandshake,
  Pencil,
  Trash2
} from 'lucide-react';
import { Patient, InteractionNote } from '../types';

interface CRMHubProps {
  patients: Patient[];
  onAddPatientNote: (patientId: string, note: Omit<InteractionNote, 'id' | 'date'>) => void;
  onAddPatient: (patient: Omit<Patient, 'id' | 'notes'>) => void;
  onDeletePatient: (id: string) => void;
  onEditPatient: (patient: Patient) => void;
  selectedPatientId: string | null;
  setSelectedPatientId: (id: string | null) => void;
}

export default function CRMHub({
  patients,
  onAddPatientNote,
  onAddPatient,
  onDeletePatient,
  onEditPatient,
  selectedPatientId,
  setSelectedPatientId
}: CRMHubProps) {
  const [search, setSearch] = useState('');
  const [selectedTag, setSelectedTag] = useState('All');
  
  // Note Addition States
  const [noteType, setNoteType] = useState<'phone' | 'sms' | 'email' | 'in-person'>('phone');
  const [noteSummary, setNoteSummary] = useState('');
  const [noteAgent, setNoteAgent] = useState('Dr. Sarah Smith');

  // Patient Creation States
  const [isAddingPatient, setIsAddingPatient] = useState(false);
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newDob, setNewDob] = useState('');
  const [newAllergies, setNewAllergies] = useState('');
  const [newConditions, setNewConditions] = useState('');

  // Patient Editing States
  const [editingPatientId, setEditingPatientId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editDob, setEditDob] = useState('');
  const [editAllergies, setEditAllergies] = useState('');
  const [editConditions, setEditConditions] = useState('');

  const handleStartEditPatient = (pat: Patient) => {
    setEditingPatientId(pat.id);
    setEditName(pat.name);
    setEditPhone(pat.phone);
    setEditEmail(pat.email);
    setEditDob(pat.dob || '');
    setEditAllergies(pat.allergies.join(', '));
    setEditConditions(pat.chronicConditions.join(', '));
  };

  const handleSaveEditPatient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPatientId || !editName || !editPhone || !editEmail) return;

    // Automatically assign simple tags based on updated details
    const tags: string[] = [];
    const age = new Intl.DateTimeFormat().format(new Date(editDob)) ? new Date().getFullYear() - new Date(editDob).getFullYear() : 35;
    if (age >= 65) tags.push('Senior Citizen');
    if (editAllergies.trim().length > 0) tags.push('Allergy Alert');
    if (editConditions.trim().length > 0) tags.push('Chronic Care');
    if (tags.length === 0) tags.push('Fast-Track');

    onEditPatient({
      id: editingPatientId,
      name: editName,
      phone: editPhone,
      email: editEmail,
      dob: editDob,
      allergies: editAllergies ? editAllergies.split(',').map(s => s.trim()) : [],
      chronicConditions: editConditions ? editConditions.split(',').map(s => s.trim()) : [],
      tags,
      notes: patients.find(p => p.id === editingPatientId)?.notes || []
    });

    setEditingPatientId(null);
  };
  
  const allTags = ['All', 'Senior Citizen', 'High Priority', 'Allergy Alert', 'Chronic Care'];

  const filteredPatients = patients.filter(pat => {
    const matchesSearch = pat.name.toLowerCase().includes(search.toLowerCase()) || 
                          pat.phone.includes(search) || 
                          pat.email.toLowerCase().includes(search.toLowerCase());
    const matchesTag = selectedTag === 'All' || pat.tags.includes(selectedTag);
    return matchesSearch && matchesTag;
  });

  const handleAddNoteSubmit = (patientId: string, e: React.FormEvent) => {
    e.preventDefault();
    if (!noteSummary.trim()) return;

    onAddPatientNote(patientId, {
      type: noteType,
      summary: noteSummary,
      agentName: noteAgent
    });

    setNoteSummary('');
  };

  const handleRegisterPatientSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newPhone || !newEmail || !newDob) return;

    // Automatically assign simple tags based on details
    const tags: string[] = [];
    const age = new Date().getFullYear() - new Date(newDob).getFullYear();
    if (age >= 65) tags.push('Senior Citizen');
    if (newAllergies.trim().length > 0) tags.push('Allergy Alert');
    if (newConditions.trim().length > 0) tags.push('Chronic Care');
    if (tags.length === 0) tags.push('Fast-Track');

    onAddPatient({
      name: newName,
      phone: newPhone,
      email: newEmail,
      dob: newDob,
      allergies: newAllergies ? newAllergies.split(',').map(s => s.trim()) : [],
      chronicConditions: newConditions ? newConditions.split(',').map(s => s.trim()) : [],
      tags
    });

    // Reset Form
    setNewName('');
    setNewPhone('');
    setNewEmail('');
    setNewDob('');
    setNewAllergies('');
    setNewConditions('');
    setIsAddingPatient(false);
  };

  return (
    <div className="space-y-6" id="crm-hub-module">
      
      {/* Title block */}
      <div className="bg-white p-5 border border-slate-100 rounded-2xl shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold font-sans text-slate-800">Patient CRM Central</h2>
          <p className="text-xs text-slate-400">Manage client medical histories, document phone contact, and dispatch notifications</p>
        </div>

        <button
          onClick={() => setIsAddingPatient(!isAddingPatient)}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs rounded-xl cursor-pointer transition flex items-center gap-1"
        >
          <Plus className="w-4 h-4" /> Register New Account
        </button>
      </div>

      {/* Add patient block inline */}
      {isAddingPatient && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm animate-fadeIn">
          <h3 className="text-sm font-bold text-slate-800 mb-4">Patient Demographics Registration</h3>
          <form onSubmit={handleRegisterPatientSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-mono text-slate-400 font-bold uppercase">Full Name *</label>
              <input 
                type="text" 
                required 
                value={newName} 
                onChange={e => setNewName(e.target.value)}
                placeholder="Eleanor Vance"
                className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-emerald-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-mono text-slate-400 font-bold uppercase">Phone Contact *</label>
              <input 
                type="tel" 
                required 
                value={newPhone} 
                onChange={e => setNewPhone(e.target.value)}
                placeholder="(555) 000-0000"
                className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-emerald-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-mono text-slate-400 font-bold uppercase">Email Address *</label>
              <input 
                type="email" 
                required 
                value={newEmail} 
                onChange={e => setNewEmail(e.target.value)}
                placeholder="eleanor@mail.com"
                className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-emerald-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-mono text-slate-400 font-bold uppercase">Date of Birth *</label>
              <input 
                type="date" 
                required 
                value={newDob} 
                onChange={e => setNewDob(e.target.value)}
                className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-emerald-500"
              />
            </div>

            <div className="md:col-span-2 space-y-1">
              <label className="text-[10px] font-mono text-slate-400 font-bold uppercase">Medical Allergies (comma separated)</label>
              <input 
                type="text" 
                value={newAllergies} 
                onChange={e => setNewAllergies(e.target.value)}
                placeholder="Penicillin, Sulfa, NSAIDs"
                className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-emerald-500"
              />
            </div>

            <div className="md:col-span-2 space-y-1">
              <label className="text-[10px] font-mono text-slate-400 font-bold uppercase">Chronic Medical Conditions (comma separated)</label>
              <input 
                type="text" 
                value={newConditions} 
                onChange={e => setNewConditions(e.target.value)}
                placeholder="Hypertension, Asthma, Diabetes"
                className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-emerald-500"
              />
            </div>

            <div className="md:col-span-4 pt-2 flex justify-end gap-2 text-xs">
              <button 
                type="button" 
                onClick={() => setIsAddingPatient(false)}
                className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg"
              >
                Discard
              </button>
              <button 
                type="submit" 
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium"
              >
                Create Patient File
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Directory filtering & searching */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Search Input */}
        <div className="relative md:col-span-2">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
            <Search className="w-5 h-5" />
          </span>
          <input 
            type="text" 
            placeholder="Search patients by name, telephone number..." 
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-2xl text-sm focus:outline-emerald-500"
          />
        </div>

        {/* Tag Selection Row */}
        <div className="flex gap-1 overflow-x-auto pb-1 scrollbar-none">
          {allTags.map(tag => (
            <button
              key={tag}
              onClick={() => setSelectedTag(tag)}
              className={`px-3 py-2 text-xs rounded-xl font-bold tracking-tight shrink-0 cursor-pointer ${
                selectedTag === tag 
                  ? 'bg-slate-800 text-white' 
                  : 'bg-white border border-slate-100 text-slate-500 hover:bg-slate-50'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* Patient Database listing & side CRM dashboard split */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Patient Cards List */}
        <div className="md:col-span-2 space-y-3 max-h-[500px] overflow-y-auto pr-1">
          {filteredPatients.map(pat => {
            const isSelected = selectedPatientId === pat.id;
            // Calculate birth age
            const age = new Date().getFullYear() - new Date(pat.dob).getFullYear();

            return (
              <div
                key={pat.id}
                id={`pat-card-${pat.id}`}
                onClick={() => setSelectedPatientId(pat.id)}
                className={`p-4 bg-white border rounded-2xl shadow-xs hover:border-slate-300 transition cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                  isSelected ? 'ring-2 ring-emerald-500/55 border-transparent' : 'border-slate-150'
                }`}
              >
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="font-semibold text-slate-800 text-sm">{pat.name}</h4>
                    <span className="text-[11px] font-mono text-slate-400">Age {age} &bull; DOB: {pat.dob}</span>
                  </div>

                  <div className="flex items-center gap-4 text-xs text-slate-400">
                    <div className="flex items-center gap-1">
                      <Phone className="w-3.5 h-3.5" />
                      <span>{pat.phone}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Mail className="w-3.5 h-3.5" />
                      <span className="truncate max-w-[120px]">{pat.email}</span>
                    </div>
                  </div>

                  {/* Medical Conditions overview */}
                  {pat.chronicConditions.length > 0 && (
                    <div className="flex items-center gap-1 text-[11px] text-slate-600 flex-wrap">
                      <Activity className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                      <span className="font-medium">Active conditions:</span>
                      {pat.chronicConditions.map((cond, idx) => (
                        <span key={idx} className="bg-slate-50 px-1.5 py-0.2 rounded-md border border-slate-100">
                          {cond}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Tags sequence right aligned & Action buttons */}
                <div className="flex flex-wrap gap-2.5 items-center shrink-0">
                  <div className="flex flex-wrap gap-1">
                    {(pat.tags || []).slice(0, 2).map((t, idx) => (
                      <span key={idx} className={`text-[9px] font-bold font-mono px-2 py-0.5 rounded-md uppercase border ${
                        t === 'Allergy Alert' ? 'bg-rose-50 text-rose-700 border-rose-100' :
                        t === 'Senior Citizen' ? 'bg-amber-50 text-amber-705 border-amber-100' :
                        'bg-emerald-50 text-emerald-700 border-emerald-100'
                      }`}>
                        {t}
                      </span>
                    ))}
                    {(pat.tags || []).length > 2 && (
                      <span className="text-[9px] font-bold font-mono text-slate-400">+{(pat.tags || []).length - 2}</span>
                    )}
                  </div>

                  {/* Tiny row actions in Patient CRM */}
                  <div className="flex gap-1 items-center">
                    <button
                      title="Edit Patient Card"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedPatientId(pat.id);
                        handleStartEditPatient(pat);
                      }}
                      className="p-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-slate-550 hover:text-slate-700 transition cursor-pointer"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      title="Delete Patient Card"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm(`Are you sure you want to delete ${pat.name}'s medical profile?`)) {
                          onDeletePatient(pat.id);
                          if (selectedPatientId === pat.id) {
                            setSelectedPatientId(null);
                          }
                        }
                      }}
                      className="p-1.5 bg-rose-50 hover:bg-rose-100 border border-rose-105 rounded-lg text-rose-600 hover:text-rose-800 transition cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}

          {filteredPatients.length === 0 && (
            <div className="p-8 text-center bg-white border border-dashed border-slate-200 rounded-2xl text-slate-400">
              No patient profiles match chosen filters.
            </div>
          )}
        </div>

        {/* Split Side detail Timeline & interactive note log */}
        <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-xs h-fit space-y-5" id="patient-comms-timeline">
          {selectedPatientId ? (() => {
            const pat = patients.find(p => p.id === selectedPatientId);
            if (!pat) return (
              <div className="text-center py-12 space-y-2 text-slate-400">
                <Users className="w-10 h-10 mx-auto stroke-slate-300" />
                <p className="text-xs">Select any patient profile row on the directory to display medical alerts, historic timelines, and register interaction logs.</p>
              </div>
            );

            if (editingPatientId === pat.id) {
              return (
                <form onSubmit={handleSaveEditPatient} className="space-y-4 animate-fadeIn">
                  <div className="border-b border-slate-100 pb-2.5">
                    <h3 className="text-sm font-bold text-slate-800">Edit Patient Demographics</h3>
                    <p className="text-[11px] text-slate-400">Amend personal details and medical indicators</p>
                  </div>

                  <div className="space-y-3 text-xs">
                    <div className="space-y-1">
                      <label className="text-[10px] font-mono font-bold text-slate-400 uppercase">Full Name</label>
                      <input 
                        type="text" 
                        required 
                        value={editName} 
                        onChange={e => setEditName(e.target.value)}
                        className="w-full text-xs px-2.5 py-1.5 border border-slate-200 rounded-lg focus:outline-emerald-500"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <label className="text-[10px] font-mono font-bold text-slate-400 uppercase">Phone Number</label>
                        <input 
                          type="text" 
                          required 
                          value={editPhone} 
                          onChange={e => setEditPhone(e.target.value)}
                          className="w-full text-xs px-2.5 py-1.5 border border-slate-200 rounded-lg focus:outline-emerald-500"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-mono font-bold text-slate-400 uppercase">DOB</label>
                        <input 
                          type="date" 
                          required 
                          value={editDob} 
                          onChange={e => setEditDob(e.target.value)}
                          className="w-full text-xs px-2.5 py-1.5 border border-slate-200 rounded-lg focus:outline-emerald-500"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-mono font-bold text-slate-400 uppercase">Email Address</label>
                      <input 
                        type="email" 
                        required 
                        value={editEmail} 
                        onChange={e => setEditEmail(e.target.value)}
                        className="w-full text-xs px-2.5 py-1.5 border border-slate-200 rounded-lg focus:outline-emerald-500"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-mono font-bold text-slate-400 uppercase">Allergies (comma-separated)</label>
                      <input 
                        type="text" 
                        value={editAllergies} 
                        onChange={e => setEditAllergies(e.target.value)}
                        className="w-full text-xs px-2.5 py-1.5 border border-slate-200 rounded-lg focus:outline-emerald-500"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-mono font-bold text-slate-400 uppercase">Chronic Conditions (comma-separated)</label>
                      <input 
                        type="text" 
                        value={editConditions} 
                        onChange={e => setEditConditions(e.target.value)}
                        className="w-full text-xs px-2.5 py-1.5 border border-slate-200 rounded-lg focus:outline-emerald-500"
                      />
                    </div>
                  </div>

                  <div className="pt-2 flex justify-end gap-2 text-xs">
                    <button 
                      type="button" 
                      onClick={() => setEditingPatientId(null)}
                      className="px-3 py-1.5 border border-slate-200 text-slate-600 rounded-lg cursor-pointer hover:bg-slate-50 transition"
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit" 
                      className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium cursor-pointer transition"
                    >
                      Save Profile
                    </button>
                  </div>
                </form>
              );
            }

            return (
              <div className="space-y-4 animate-fadeIn">
                <div className="pb-3 border-b border-slate-50">
                  <span className="text-[10px] tracking-widest uppercase font-mono text-slate-400 block font-bold">Comprehensive Patient File</span>
                  <h3 className="text-base font-bold text-slate-800">{pat.name}</h3>
                  <div className="mt-1 gap-1 flex flex-wrap">
                    {(pat.tags || []).map((t, idx) => (
                      <span key={idx} className="text-[9px] font-bold font-mono bg-slate-50 text-slate-600 border border-slate-100 px-1 py-0.2 rounded-md">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Patient Action Buttons */}
                <div className="flex gap-2 pb-2 border-b border-slate-100">
                  <button
                    onClick={() => handleStartEditPatient(pat)}
                    className="flex-1 py-1.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition cursor-pointer border border-slate-200"
                  >
                    <Pencil className="w-3.5 h-3.5 text-slate-500" />
                    Edit Profile
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`Are you sure you want to completely delete the patient record of ${pat.name}?`)) {
                        onDeletePatient(pat.id);
                        setSelectedPatientId(null);
                      }
                    }}
                    className="flex-1 py-1.5 px-3 bg-rose-55 hover:bg-rose-100 text-rose-700 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 cursor-pointer border border-rose-200 transition"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                    Delete Profile
                  </button>
                </div>

                {/* Demographics checklist */}
                <div className="space-y-2 text-xs text-slate-600">
                  <div className="flex justify-between items-center bg-slate-50 p-2 rounded-lg">
                    <span className="font-mono text-slate-400 text-[10px]">ALLERGEN PROFILE</span>
                    <span className="font-bold text-rose-700">{(pat.allergies || []).length > 0 ? (pat.allergies || []).join(', ') : 'None documented'}</span>
                  </div>
                  <div className="flex justify-between items-center bg-slate-50 p-2 rounded-lg">
                    <span className="font-mono text-slate-400 text-[10px]">CHRONIC ILLNESS</span>
                    <span className="font-bold text-slate-800">{(pat.chronicConditions || []).length > 0 ? (pat.chronicConditions || []).join(', ') : 'Healthy profiles'}</span>
                  </div>
                </div>

                {/* Note timelines list */}
                <div className="space-y-2 max-h-[180px] overflow-y-auto pr-1">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold block">Historic Comms Timeline</span>
                  {(pat.notes || []).length > 0 ? (
                    <div className="space-y-2">
                      {(pat.notes || []).map(note => (
                        <div key={note.id} className="p-2.5 bg-slate-50 rounded-xl space-y-1.5 border border-slate-100">
                          <p className="text-xs text-slate-700 leading-relaxed font-sans">{note.summary}</p>
                          <div className="flex justify-between items-center text-[10px] text-slate-400 font-mono">
                            <span className="uppercase tracking-wider text-[9px] bg-slate-150 px-1 py-0.2 rounded font-bold">{note.type}</span>
                            <span>{new Date(note.date).toLocaleDateString()} &bull; {note.agentName}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400 italic">No notes logged for patient.</p>
                  )}
                </div>

                {/* Form to append note interactions */}
                <div className="border-t border-slate-100 pt-4 space-y-3">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold block">Append Interaction Log</span>
                  
                  <form onSubmit={(e) => handleAddNoteSubmit(pat.id, e)} className="space-y-3">
                    <div className="flex gap-2">
                      {/* Note Channels dropdown */}
                      <select
                        value={noteType}
                        onChange={e => setNoteType(e.target.value as any)}
                        className="text-xs bg-slate-50 border border-slate-200 rounded-lg p-1.5 text-slate-700 outline-none"
                      >
                        <option value="phone">Phone Call</option>
                        <option value="sms">SMS text</option>
                        <option value="email">Email</option>
                        <option value="in-person">In Person</option>
                      </select>

                      <input 
                        type="text" 
                        placeholder="Agent/Staff Name"
                        value={noteAgent}
                        onChange={e => setNoteAgent(e.target.value)}
                        className="w-full text-xs px-2.5 py-1.5 border border-slate-201 rounded-lg focus:outline-emerald-500"
                      />
                    </div>

                    <textarea
                      rows={2}
                      required
                      placeholder="e.g. Consulted on antibiotic triggers, patient confirmed they have no history of asthma."
                      value={noteSummary}
                      onChange={e => setNoteSummary(e.target.value)}
                      className="w-full text-xs p-2.5 border border-slate-200 rounded-xl focus:outline-emerald-500"
                    />

                    <button
                      type="submit"
                      className="w-full py-2 bg-slate-800 hover:bg-slate-900 text-white font-semibold text-xs rounded-xl flex items-center justify-center gap-1.5 transition cursor-pointer"
                    >
                      <Plus className="w-4 h-4" /> Save Interaction Log
                    </button>
                  </form>
                </div>
              </div>
            );
          })() : (
            <div className="text-center py-12 space-y-2 text-slate-400">
              <Users className="w-10 h-10 mx-auto stroke-slate-300" />
              <p className="text-xs">Select any patient profile row on the directory to display medical alerts, historic timelines, and register interaction logs.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
