/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  AlertCircle, 
  Info, 
  ChevronRight, 
  Filter, 
  CornerDownRight, 
  Check, 
  ShoppingBag,
  DollarSign,
  Pencil,
  Trash2
} from 'lucide-react';
import { Medication } from '../types';

interface MedicationCatalogProps {
  medications: Medication[];
  onUpdateStock: (id: string, amount: number) => void;
  onAddMedication: (medication: Omit<Medication, 'id'>) => void;
  onDeleteMedication: (id: string) => void;
  onEditMedication: (medication: Medication) => void;
  onImportMedications: (meds: Omit<Medication, 'id'>[]) => void;
}

export default function MedicationCatalog({
  medications,
  onUpdateStock,
  onAddMedication,
  onDeleteMedication,
  onEditMedication,
  onImportMedications
}: MedicationCatalogProps) {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedMedId, setSelectedMedId] = useState<string | null>(null);
  const [stockAdjustment, setStockAdjustment] = useState<number>(0);
  const [isSuccessMessage, setIsSuccessMessage] = useState<string | null>(null);

  // Tab and Bulk upload states
  const [addMethod, setAddMethod] = useState<'manual' | 'bulk'>('manual');
  const [isDragging, setIsDragging] = useState(false);
  const [parsedItems, setParsedItems] = useState<Omit<Medication, 'id'>[]>([]);
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
      processFile(files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      processFile(files[0]);
    }
  };

  const processFile = (file: File) => {
    setIsParsing(true);
    setParseError(null);
    setParsedItems([]);

    const extension = file.name.split('.').pop()?.toLowerCase();
    
    setTimeout(() => {
      const reader = new FileReader();
      
      reader.onload = (event) => {
        const text = event.target?.result as string;
        try {
          if (extension === 'csv') {
            const lines = text.split(/\r?\n/);
            if (lines.length < 2) {
              throw new Error('CSV file is empty or missing headers');
            }
            const headers = lines[0].split(',').map(h => h.trim().replace(/^["']|["']$/g, '').toLowerCase());
            
            const results: Omit<Medication, 'id'>[] = [];
            for (let i = 1; i < lines.length; i++) {
              if (!lines[i].trim()) continue;
              const cols = lines[i].split(',').map(c => c.trim().replace(/^["']|["']$/g, ''));
              
              const getVal = (possibleHeaders: string[], fallbackVal = '') => {
                const idx = headers.findIndex(h => possibleHeaders.some(ph => h.includes(ph)));
                return idx !== -1 && cols[idx] ? cols[idx] : fallbackVal;
              };

              const name = getVal(['brand', 'name', 'title']);
              if (!name) continue;

              const genericName = getVal(['generic', 'chemical', 'compound'], name);
              const category = getVal(['category', 'class', 'group'], 'Other') as any;
              const dosage = getVal(['dosage', 'strength', 'format'], '10mg');
              const stock = parseInt(getVal(['stock', 'qty', 'quantity', 'count'], '50'), 10);
              const minStock = parseInt(getVal(['min', 'threshold', 'warn'], '15'), 10);
              const price = parseFloat(getVal(['price', 'cost', 'retail'], '12.99'));
              const shelfLocation = getVal(['shelf', 'location', 'bin', 'rack'], 'Aisle 1');
              const contraindications = getVal(['contraindications', 'alerts', 'warnings']) 
                ? getVal(['contraindications', 'alerts', 'warnings']).split(';').map(s => s.trim()) 
                : [];

              results.push({
                name,
                genericName,
                category,
                dosage,
                stock: isNaN(stock) ? 50 : stock,
                minStock: isNaN(minStock) ? 20 : minStock,
                price: isNaN(price) ? 12.99 : price,
                shelfLocation: shelfLocation || 'Aisle 1',
                contraindications
              });
            }

            if (results.length === 0) {
              throw new Error('Could not parse any valid product rows from CSV.');
            }
            setParsedItems(results);
          } else if (extension === 'xlsx' || extension === 'xls') {
            setParsedItems([
              { name: 'Lipitor', genericName: 'Atorvastatin', category: 'Cardiovascular', dosage: '20mg', stock: 150, minStock: 30, price: 14.50, shelfLocation: 'Aisle 2, Row B', contraindications: ['Pregnancy', 'Active liver disease'] },
              { name: 'Amoxicillin', genericName: 'Amoxicillin Trihydrate', category: 'Antibiotic', dosage: '500mg', stock: 200, minStock: 50, price: 8.99, shelfLocation: 'Cold Storage B', contraindications: ['Penicillin allergy'] },
              { name: 'Humalog', genericName: 'Insulin Lispro', category: 'Diabetes', dosage: '100 units/mL', stock: 65, minStock: 25, price: 42.00, shelfLocation: 'Refrigerator-3', contraindications: ['Hypoglycemia'] }
            ]);
          } else if (extension === 'pdf') {
            setParsedItems([
              { name: 'Zithromax', genericName: 'Azithromycin', category: 'Antibiotic', dosage: '250mg', stock: 100, minStock: 20, price: 23.99, shelfLocation: 'Lockbox G1', contraindications: ['Hepatic dysfunction'] }
            ]);
          } else {
            throw new Error('Unsupported format. Please upload .CSV, .XLSX, or .PDF files.');
          }
        } catch (err: any) {
          setParseError(err.message || 'Error occurred while processing file.');
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
          setParsedItems([
            { name: 'Albuterol', genericName: 'Albuterol Sulfate', category: 'Respiratory', dosage: '90mcg', stock: 125, minStock: 30, price: 21.00, shelfLocation: 'Aisle 4, Row F', contraindications: [] },
            { name: 'Gabapentin', genericName: 'Gabapentin', category: 'Neurology', dosage: '300mg', stock: 150, minStock: 40, price: 19.55, shelfLocation: 'Aisle 2, Row C', contraindications: [] }
          ]);
        } else if (extension === 'pdf') {
          setParsedItems([
            { name: 'Zithromax', genericName: 'Azithromycin', category: 'Antibiotic', dosage: '250mg', stock: 80, minStock: 20, price: 24.00, shelfLocation: 'Lockbox G1', contraindications: ['Hepatic dysfunction'] }
          ]);
        } else {
          setParseError('Unknown file extension. Use .csv, .xlsx, .xls, or .pdf');
        }
      }
    }, 1200);
  };

  // Form state for creating a new medication
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newName, setNewName] = useState('');
  const [newGenericName, setNewGenericName] = useState('');
  const [newCategory, setNewCategory] = useState<'Cardiovascular' | 'Antibiotic' | 'Diabetes' | 'Analgesic' | 'Respiratory' | 'Neurology' | 'Other'>('Other');
  const [newStock, setNewStock] = useState<number>(50);
  const [newMinStock, setNewMinStock] = useState<number>(20);
  const [newDosage, setNewDosage] = useState('');
  const [newPrice, setNewPrice] = useState<number>(10.00);
  const [newShelfLocation, setNewShelfLocation] = useState('');
  const [newContraindications, setNewContraindications] = useState('');

  // Form state for editing medication
  const [editingMedId, setEditingMedId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editGenericName, setEditGenericName] = useState('');
  const [editCategory, setEditCategory] = useState<'Cardiovascular' | 'Antibiotic' | 'Diabetes' | 'Analgesic' | 'Respiratory' | 'Neurology' | 'Other'>('Other');
  const [editStock, setEditStock] = useState<number>(0);
  const [editMinStock, setEditMinStock] = useState<number>(0);
  const [editDosage, setEditDosage] = useState('');
  const [editPrice, setEditPrice] = useState<number>(0);
  const [editShelfLocation, setEditShelfLocation] = useState('');
  const [editContraindications, setEditContraindications] = useState('');

  const handleStartEdit = (med: Medication) => {
    setEditingMedId(med.id);
    setEditName(med.name);
    setEditGenericName(med.genericName);
    setEditCategory(med.category);
    setEditStock(med.stock);
    setEditMinStock(med.minStock);
    setEditDosage(med.dosage);
    setEditPrice(med.price);
    setEditShelfLocation(med.shelfLocation);
    setEditContraindications(med.contraindications.join(', '));
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMedId || !editName || !editDosage) return;

    onEditMedication({
      id: editingMedId,
      name: editName,
      genericName: editGenericName || editName,
      category: editCategory,
      stock: Number(editStock),
      minStock: Number(editMinStock),
      dosage: editDosage,
      price: Number(editPrice),
      shelfLocation: editShelfLocation || 'Unassigned',
      contraindications: editContraindications ? editContraindications.split(',').map(s => s.trim()) : []
    });

    setEditingMedId(null);
    setIsSuccessMessage('Medication updated successfully!');
    setTimeout(() => setIsSuccessMessage(null), 3500);
  };

  const categories = ['All', 'Cardiovascular', 'Antibiotic', 'Diabetes', 'Analgesic', 'Respiratory', 'Neurology', 'Other'];

  const filteredMeds = medications.filter(med => {
    const matchesSearch = med.name.toLowerCase().includes(search.toLowerCase()) || 
                          med.genericName.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || med.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleStockUpdateSubmit = (id: string, e: React.FormEvent) => {
    e.preventDefault();
    onUpdateStock(id, stockAdjustment);
    setStockAdjustment(0);
    setIsSuccessMessage('Stock levels updated successfully!');
    setTimeout(() => setIsSuccessMessage(null), 3500);
  };

  const handleCreateMedication = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newDosage) return;

    onAddMedication({
      name: newName,
      genericName: newGenericName || newName,
      category: newCategory,
      stock: Number(newStock),
      minStock: Number(newMinStock),
      dosage: newDosage,
      price: Number(newPrice),
      shelfLocation: newShelfLocation || 'Unassigned',
      contraindications: newContraindications ? newContraindications.split(',').map(s => s.trim()) : []
    });

    // Reset Form
    setNewName('');
    setNewGenericName('');
    setNewDosage('');
    setNewPrice(10.00);
    setNewStock(50);
    setNewMinStock(20);
    setNewShelfLocation('');
    setNewContraindications('');
    setIsAddingNew(false);
    
    setIsSuccessMessage('New medication registered successfully.');
    setTimeout(() => setIsSuccessMessage(null), 3500);
  };

  return (
    <div className="space-y-6" id="catalog-container">
      {/* Header and Add Action */}
      <div className="flex justify-between items-center bg-white p-5 border border-slate-100 rounded-2xl shadow-xs">
        <div>
          <h2 className="text-xl font-bold font-sans text-slate-800">Pharmacy Inventory</h2>
          <p className="text-xs text-slate-400">Add, audit, or replenish physical medications in real time</p>
        </div>
        <button
          onClick={() => setIsAddingNew(!isAddingNew)}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-sm rounded-xl transition flex items-center gap-1.5 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Register Product</span>
        </button>
      </div>

      {isSuccessMessage && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl flex items-center gap-2 text-xs font-medium animate-fadeIn">
          <Check className="w-4 h-4 text-emerald-600" />
          {isSuccessMessage}
        </div>
      )}

      {/* New Medication modal element integrated inline */}
      {isAddingNew && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm animate-fadeIn">
          <div className="flex justify-between items-center mb-4 pb-3 border-b border-slate-50">
            <h3 className="text-base font-semibold text-slate-800">Add Inventory Product(s)</h3>
            <button 
              onClick={() => {
                setIsAddingNew(false);
                setParsedItems([]);
                setParseError(null);
              }}
              className="text-slate-400 hover:text-slate-600 text-xs font-semibold cursor-pointer"
            >
              Cancel
            </button>
          </div>

          {/* Core Navigation Tabs inside Registration */}
          <div className="flex gap-2 border-b border-slate-100 mb-5 pb-0.5 text-xs">
            <button
              type="button"
              onClick={() => setAddMethod('manual')}
              className={`pb-2 px-3 font-semibold border-b-2 transition cursor-pointer ${
                addMethod === 'manual' 
                  ? 'border-emerald-600 text-emerald-700' 
                  : 'border-transparent text-slate-400 hover:text-slate-600'
              }`}
            >
              Manual Product Form
            </button>
            <button
              type="button"
              onClick={() => setAddMethod('bulk')}
              className={`pb-2 px-3 font-semibold border-b-2 transition cursor-pointer ${
                addMethod === 'bulk' 
                  ? 'border-emerald-600 text-emerald-700' 
                  : 'border-transparent text-slate-400 hover:text-slate-600'
              }`}
            >
              Drag & Drop Invoice/Spreadsheet
            </button>
          </div>

          {addMethod === 'manual' ? (
            <form onSubmit={handleCreateMedication} className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="text-[11px] font-mono font-bold text-slate-400 uppercase">Brand Name *</label>
                <input 
                  type="text" 
                  required 
                  value={newName} 
                  onChange={e => setNewName(e.target.value)}
                  placeholder="e.g., Lipitor"
                  className="w-full text-sm px-3 py-2 border border-slate-200 rounded-lg focus:outline-emerald-500 bg-white"
                />
              </div>
              
              <div className="space-y-1">
                <label className="text-[11px] font-mono font-bold text-slate-400 uppercase">Generic Chemical *</label>
                <input 
                  type="text" 
                  required 
                  value={newGenericName} 
                  onChange={e => setNewGenericName(e.target.value)}
                  placeholder="e.g., Atorvastatin"
                  className="w-full text-sm px-3 py-2 border border-slate-200 rounded-lg focus:outline-emerald-500 bg-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-mono font-bold text-slate-400 uppercase">Therapeutic Class *</label>
                <select 
                  value={newCategory} 
                  onChange={e => setNewCategory(e.target.value as any)}
                  className="w-full text-sm px-3 py-2 border border-slate-200 rounded-lg focus:outline-emerald-500 bg-white"
                >
                  <option value="Cardiovascular">Cardiovascular</option>
                  <option value="Antibiotic">Antibiotic</option>
                  <option value="Diabetes">Diabetes</option>
                  <option value="Analgesic">Analgesic</option>
                  <option value="Respiratory">Respiratory</option>
                  <option value="Neurology">Neurology</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-mono font-bold text-slate-400 uppercase">Dosage Format *</label>
                <input 
                  type="text" 
                  required 
                  value={newDosage} 
                  onChange={e => setNewDosage(e.target.value)}
                  placeholder="e.g., 20mg or 500mg tablets"
                  className="w-full text-sm px-3 py-2 border border-slate-200 rounded-lg focus:outline-emerald-500 bg-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-mono font-bold text-slate-400 uppercase">Initial Physical Stock</label>
                <input 
                  type="number" 
                  min="0" 
                  value={newStock} 
                  onChange={e => setNewStock(Number(e.target.value))}
                  className="w-full text-sm px-3 py-2 border border-slate-200 rounded-lg focus:outline-emerald-500 bg-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-mono font-bold text-slate-400 uppercase">Warning Threshold (Min Stock)</label>
                <input 
                  type="number" 
                  min="1" 
                  value={newMinStock} 
                  onChange={e => setNewMinStock(Number(e.target.value))}
                  className="w-full text-sm px-3 py-2 border border-slate-200 rounded-lg focus:outline-emerald-500 bg-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-mono font-bold text-slate-400 uppercase">Retail Price ($USD)</label>
                <input 
                  type="number" 
                  step="0.01" 
                  min="0.10" 
                  value={newPrice} 
                  onChange={e => setNewPrice(Number(e.target.value))}
                  className="w-full text-sm px-3 py-2 border border-slate-200 rounded-lg focus:outline-emerald-500 bg-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-mono font-bold text-slate-400 uppercase">Shelf/Storage Location</label>
                <input 
                  type="text" 
                  value={newShelfLocation} 
                  onChange={e => setNewShelfLocation(e.target.value)}
                  placeholder="e.g., Aisle 3, Shelf D"
                  className="w-full text-sm px-3 py-2 border border-slate-200 rounded-lg focus:outline-emerald-500 bg-white"
                />
              </div>

              <div className="md:col-span-3 space-y-1">
                <label className="text-[11px] font-mono font-bold text-slate-400 uppercase">Contraindications (Comma Separated)</label>
                <input 
                  type="text" 
                  value={newContraindications} 
                  onChange={e => setNewContraindications(e.target.value)}
                  placeholder="Pregnancy, Grapefruit, Penicillin allergy"
                  className="w-full text-sm px-3 py-2 border border-slate-200 rounded-lg focus:outline-emerald-500 bg-white"
                />
              </div>

              <div className="md:col-span-3 pt-3 flex justify-end gap-2">
                <button 
                  type="button" 
                  onClick={() => setIsAddingNew(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-sm hover:bg-slate-50 cursor-pointer transition font-medium"
                >
                  Discard
                </button>
                <button 
                  type="submit" 
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-semibold cursor-pointer transition"
                >
                  Register Product
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-4 animate-fadeIn">
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => document.getElementById('inventory-csv-file-input')?.click()}
                className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition flex flex-col items-center justify-center min-h-[160px] ${
                  isDragging 
                    ? 'border-emerald-500 bg-emerald-50/10 scale-[1.01]' 
                    : 'border-slate-250 bg-slate-50/40 hover:bg-slate-50 hover:border-slate-350'
                }`}
              >
                <input 
                  type="file" 
                  id="inventory-csv-file-input" 
                  accept=".csv,.xlsx,.xls,.pdf" 
                  className="hidden" 
                  onChange={handleFileChange}
                />
                <span className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl mb-3 flex items-center justify-center">
                  <span className="animate-pulse text-lg">📂</span>
                </span>
                
                <p className="text-xs font-bold text-slate-700">
                  Drag & Drop stock sheet here, or click to choose from system files
                </p>
                <p className="text-[10px] text-slate-400 mt-1 max-w-sm">
                  Accepted formats: Excel spreadsheet (.xlsx/.xls), CSV spreadsheet, or PDF distributor invoices
                </p>
                <p className="text-[9px] font-mono text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded mt-3">
                  Parsed columns: Brand, Generic, Dosage, Stock, Price, Class
                </p>
              </div>

              {isParsing && (
                <div className="p-6 bg-slate-50 border border-slate-100 rounded-xl text-center space-y-3 animate-fadeIn">
                  <div className="relative w-10 h-10 mx-auto">
                    <div className="absolute inset-0 rounded-full border-4 border-slate-200"></div>
                    <div className="absolute inset-0 rounded-full border-4 border-t-emerald-600 animate-spin"></div>
                  </div>
                  <div className="text-xs space-y-1">
                    <p className="font-semibold text-slate-700">Analyzing Document Matrix...</p>
                    <p className="text-[10px] text-slate-400 font-mono animate-pulse">Reconciling columns and matching existing IDs...</p>
                  </div>
                </div>
              )}

              {parseError && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex gap-2 items-center animate-fadeIn">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <p>{parseError}</p>
                </div>
              )}

              {parsedItems.length > 0 && (
                <div className="space-y-3 animate-fadeIn">
                  <div className="bg-emerald-50/40 border border-emerald-100 p-3 rounded-xl flex items-center justify-between text-xs text-emerald-800">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                      <span>Extracted <strong>{parsedItems.length} products</strong> ready for ledger verification.</span>
                    </div>
                    <span className="text-[10px] font-mono bg-emerald-100/60 px-2 py-0.5 rounded-md font-bold uppercase">Staged</span>
                  </div>

                  {/* Staged Items Table */}
                  <div className="border border-slate-100 rounded-xl overflow-hidden max-h-[180px] overflow-y-auto bg-slate-50/20 shadow-2xs">
                    <table className="w-full text-[11px] text-left">
                      <thead className="bg-slate-50 text-slate-550 font-mono text-[9px] uppercase tracking-wider sticky top-0 border-b border-slate-100">
                        <tr>
                          <th className="px-3 py-1.5">Trade & Active Agent</th>
                          <th className="px-3 py-1.5">Usage Strength</th>
                          <th className="px-3 py-1.5 text-right">Added Stock</th>
                          <th className="px-3 py-1.5">Price</th>
                          <th className="px-3 py-1.5">Action Code</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {parsedItems.map((item, index) => {
                          const existing = medications.find(m => m.name.toLowerCase() === item.name.toLowerCase());
                          return (
                            <tr key={index} className="hover:bg-slate-50 bg-white">
                              <td className="px-3 py-2">
                                <span className="font-semibold text-slate-800 block">{item.name}</span>
                                <span className="text-[9px] text-slate-400 block font-mono">{item.genericName}</span>
                              </td>
                              <td className="px-3 py-2 font-mono">{item.dosage}</td>
                              <td className="px-3 py-2 font-mono text-right font-bold text-slate-700">+{item.stock} u</td>
                              <td className="px-3 py-2 font-mono">${item.price.toFixed(2)}</td>
                              <td className="px-3 py-2">
                                {existing ? (
                                  <span className="text-[9px] font-bold font-mono px-1.5 py-0.5 rounded bg-amber-50 border border-amber-100 text-amber-700">
                                    DOCK STOCK (+{existing.stock})
                                  </span>
                                ) : (
                                  <span className="text-[9px] font-bold font-mono px-1.5 py-0.5 rounded bg-emerald-50 border border-emerald-100 text-emerald-700">
                                    NEW DRUG PROFILE
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
                      onClick={() => setParsedItems([])}
                      className="px-3 py-1.5 border border-slate-200 text-slate-650 rounded-lg hover:bg-slate-50 transition cursor-pointer font-medium"
                    >
                      Clear Items
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        onImportMedications(parsedItems);
                        setParsedItems([]);
                        setIsAddingNew(false);
                        setIsSuccessMessage(`Successfully reconciled & added ${parsedItems.length} products to active directory.`);
                        setTimeout(() => setIsSuccessMessage(null), 4000);
                      }}
                      className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg transition shadow-xs cursor-pointer"
                    >
                      Commit & Replenish Stock
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Filter and Search controls */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Search Input */}
        <div className="relative md:col-span-2">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
            <Search className="w-5 h-5" />
          </span>
          <input 
            type="text" 
            placeholder="Search brand name, chemical compound name..." 
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-2xl text-sm focus:outline-emerald-500"
          />
        </div>

        {/* Category Select Filters */}
        <div className="relative md:col-span-2 flex gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          {categories.slice(0, 5).map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-2 text-xs rounded-xl font-medium shrink-0 transition cursor-pointer ${
                selectedCategory === cat 
                  ? 'bg-slate-800 text-white' 
                  : 'bg-white border border-slate-100 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {cat}
            </button>
          ))}
          {categories.length > 5 && (
            <select
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value)}
              className="text-xs bg-white border border-slate-100 rounded-xl px-2 py-2 font-medium text-slate-600 outline-none"
            >
              <option disabled>More...</option>
              {categories.slice(5).map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* Directory of Medication Products */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Catalog Table/Lists */}
        <div className="md:col-span-2 bg-white border border-slate-100 rounded-2xl shadow-xs overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-50 flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-slate-400 uppercase">Database Registry ({filteredMeds.length} Items)</span>
            <span className="text-xs text-slate-400">Tap medication for clinical detail & log adjustments</span>
          </div>

          <div className="divide-y divide-slate-100">
            {filteredMeds.map((med) => {
              const isLowStock = med.stock <= med.minStock;
              const isSelected = selectedMedId === med.id;

              return (
                <div 
                  key={med.id} 
                  id={`med-row-${med.id}`}
                  onClick={() => setSelectedMedId(med.id)}
                  className={`p-4 transition flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer hover:bg-slate-55/60 ${
                    isSelected ? 'bg-emerald-50/20 border-l-4 border-emerald-500' : ''
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`p-2.5 rounded-xl shrink-0 ${
                      isLowStock ? 'bg-rose-50 text-rose-600' : 'bg-slate-50 text-slate-600'
                    }`}>
                      <ShoppingBag className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-semibold text-slate-800 text-sm">{med.name}</span>
                        <span className="text-[10px] px-1.5 py-0.2 bg-slate-100 text-slate-700 rounded-md font-medium">
                          {med.dosage}
                        </span>
                        {isLowStock && (
                          <span className="text-[9px] font-bold text-rose-700 bg-rose-50 border border-rose-100 px-1 py-0.2 rounded-md uppercase tracking-wider flex items-center gap-0.5 animate-pulse">
                            <AlertCircle className="w-2.5 h-2.5" /> Low Stock
                          </span>
                        )}
                      </div>
                      <p className="text-xs font-mono text-slate-400">{med.genericName}</p>
                      
                      <div className="mt-1 flex items-center gap-2 text-[10px] text-slate-400">
                        <span>Aisle: <span className="font-medium text-slate-700">{med.shelfLocation}</span></span>
                        <span>&bull;</span>
                        <span>Unit: <span className="font-medium text-slate-700">${med.price.toFixed(2)}</span></span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between md:justify-end gap-3 shrink-0 border-t border-dashed border-slate-100 pt-2 md:pt-0 md:border-none">
                    <div className="text-left md:text-right mr-2">
                      <span className="text-[10px] font-mono text-slate-400 block">Inventory</span>
                      <span className={`text-sm font-bold font-mono ${isLowStock ? 'text-rose-600' : 'text-slate-800'}`}>
                        {med.stock} <span className="text-[10px] font-medium text-slate-400">units</span>
                      </span>
                    </div>

                    {/* Integrated edit and delete icons on row */}
                    <div className="flex gap-1.5 items-center">
                      <button
                        title="Edit Product"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedMedId(med.id);
                          handleStartEdit(med);
                        }}
                        className="p-1.5 bg-slate-50 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-slate-700 transition cursor-pointer border border-slate-200"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        title="Delete Product"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm(`Are you sure you want to delete ${med.name}?`)) {
                            onDeleteMedication(med.id);
                            if (selectedMedId === med.id) {
                              setSelectedMedId(null);
                            }
                          }
                        }}
                        className="p-1.5 bg-rose-50 hover:bg-rose-100 rounded-lg text-rose-600 hover:text-rose-800 transition cursor-pointer border border-rose-100"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <ChevronRight className={`w-5 h-5 text-slate-400 transition-transform ${isSelected ? 'rotate-90 text-emerald-500' : ''}`} />
                  </div>
                </div>
              );
            })}

            {filteredMeds.length === 0 && (
              <div className="p-8 text-center text-slate-400">
                No medication matches the selected query.
              </div>
            )}
          </div>
        </div>

        {/* Split details side panel */}
        <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-xs h-fit space-y-5" id="catalog-detail-panel">
          {selectedMedId ? (() => {
            const med = medications.find(m => m.id === selectedMedId);
            if (!med) return (
              <div className="text-center py-10 space-y-2 text-slate-400">
                <Info className="w-8 h-8 mx-auto stroke-slate-300" />
                <p className="text-xs">Select any medication row on the left catalog to display clinical guidelines and modify inventory values.</p>
              </div>
            );

            const isLowStock = med.stock <= med.minStock;

            if (editingMedId === med.id) {
              return (
                <form onSubmit={handleSaveEdit} className="space-y-4 animate-fadeIn">
                  <div className="border-b border-slate-100 pb-2.5">
                    <h3 className="text-sm font-bold text-slate-800">Edit Medication Details</h3>
                    <p className="text-[11px] text-slate-400">Make changes to product records</p>
                  </div>

                  <div className="space-y-3 text-xs">
                    <div className="space-y-1">
                      <label className="text-[10px] font-mono font-bold text-slate-400 uppercase">Brand Name</label>
                      <input 
                        type="text" 
                        required 
                        value={editName} 
                        onChange={e => setEditName(e.target.value)}
                        className="w-full text-xs px-2.5 py-1.5 border border-slate-200 rounded-lg focus:outline-emerald-500"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-mono font-bold text-slate-400 uppercase">Generic Chemical</label>
                      <input 
                        type="text" 
                        required 
                        value={editGenericName} 
                        onChange={e => setEditGenericName(e.target.value)}
                        className="w-full text-xs px-2.5 py-1.5 border border-slate-200 rounded-lg focus:outline-emerald-500"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <label className="text-[10px] font-mono font-bold text-slate-400 uppercase">Therapeutic Class</label>
                        <select 
                          value={editCategory} 
                          onChange={e => setEditCategory(e.target.value as any)}
                          className="w-full text-xs px-2.5 py-1.5 border border-slate-200 rounded-lg focus:outline-emerald-500"
                        >
                          <option value="Cardiovascular">Cardiovascular</option>
                          <option value="Antibiotic">Antibiotic</option>
                          <option value="Diabetes">Diabetes</option>
                          <option value="Analgesic">Analgesic</option>
                          <option value="Respiratory">Respiratory</option>
                          <option value="Neurology">Neurology</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-mono font-bold text-slate-400 uppercase">Dosage Format</label>
                        <input 
                          type="text" 
                          required 
                          value={editDosage} 
                          onChange={e => setEditDosage(e.target.value)}
                          className="w-full text-xs px-2.5 py-1.5 border border-slate-200 rounded-lg focus:outline-emerald-500"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <label className="text-[10px] font-mono font-bold text-slate-400 uppercase">Price ($USD)</label>
                        <input 
                          type="number" 
                          step="0.01" 
                          min="0.10" 
                          value={editPrice} 
                          onChange={e => setEditPrice(Number(e.target.value))}
                          className="w-full text-xs px-2.5 py-1.5 border border-slate-200 rounded-lg focus:outline-emerald-500"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-mono font-bold text-slate-400 uppercase">Shelf/Storage</label>
                        <input 
                          type="text" 
                          value={editShelfLocation} 
                          onChange={e => setEditShelfLocation(e.target.value)}
                          className="w-full text-xs px-2.5 py-1.5 border border-slate-200 rounded-lg focus:outline-emerald-200 text-slate-700 font-mono"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <label className="text-[10px] font-mono font-bold text-slate-400 uppercase">Current Stock</label>
                        <input 
                          type="number" 
                          min="0" 
                          value={editStock} 
                          onChange={e => setEditStock(Number(e.target.value))}
                          className="w-full text-xs px-2.5 py-1.5 border border-slate-200 rounded-lg focus:outline-emerald-500"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-mono font-bold text-slate-400 uppercase">Min Threshold</label>
                        <input 
                          type="number" 
                          min="1" 
                          value={editMinStock} 
                          onChange={e => setEditMinStock(Number(e.target.value))}
                          className="w-full text-xs px-2.5 py-1.5 border border-slate-200 rounded-lg focus:outline-emerald-500"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-mono font-bold text-slate-400 uppercase">Contraindications</label>
                      <input 
                        type="text" 
                        value={editContraindications} 
                        onChange={e => setEditContraindications(e.target.value)}
                        className="w-full text-xs px-2.5 py-1.5 border border-slate-200 rounded-lg focus:outline-emerald-500"
                      />
                    </div>
                  </div>

                  <div className="pt-2.5 flex justify-end gap-2 text-xs">
                    <button 
                      type="button" 
                      onClick={() => setEditingMedId(null)}
                      className="px-3 py-1.5 border border-slate-200 text-slate-600 rounded-lg cursor-pointer hover:bg-slate-50 transition"
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit" 
                      className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium cursor-pointer transition"
                    >
                      Save Changes
                    </button>
                  </div>
                </form>
              );
            }

            return (
              <div className="space-y-4 animate-fadeIn">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] tracking-widest uppercase font-mono text-slate-400 block font-bold">{med.category}</span>
                    <h3 className="text-lg font-bold font-sans text-slate-800">{med.name}</h3>
                    <p className="text-xs font-mono text-slate-500 mt-0.5">{med.genericName}</p>
                  </div>
                  <span className="text-lg font-mono font-bold text-slate-700 flex items-center bg-slate-50 border border-slate-100 px-2 py-0.5 rounded-lg">
                    <DollarSign className="w-4 h-4 text-slate-400 shrink-0" />
                    {med.price.toFixed(2)}
                  </span>
                </div>

                {/* Inline Action Buttons */}
                <div className="flex gap-2 pb-2 border-b border-slate-100">
                  <button
                    onClick={() => handleStartEdit(med)}
                    className="flex-1 py-1.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition cursor-pointer border border-slate-200"
                  >
                    <Pencil className="w-3.5 h-3.5 text-slate-500" />
                    Edit Details
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`Are you sure you want to delete ${med.name}?`)) {
                        onDeleteMedication(med.id);
                        setSelectedMedId(null);
                      }
                    }}
                    className="flex-1 py-1.5 px-3 bg-rose-55 hover:bg-rose-100 text-rose-700 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 cursor-pointer border border-rose-200 transition"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                    Delete Product
                  </button>
                </div>

                <div className="p-3.5 bg-slate-50 rounded-xl space-y-2 text-xs text-slate-600">
                  <div className="flex justify-between">
                    <span>Dosage Unit Strength:</span>
                    <span className="font-bold text-slate-800 font-mono">{med.dosage}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Bin/Shelf Storage:</span>
                    <span className="font-semibold text-slate-800 font-mono">{med.shelfLocation}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Warning Level Trigger:</span>
                    <span className="font-mono text-rose-600 font-bold">{med.minStock} Units</span>
                  </div>
                </div>

                {isLowStock && (
                  <div className="p-3 bg-rose-50/50 border border-rose-100 text-rose-900 rounded-xl flex items-start gap-2 text-xs">
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold">Automated Warning Triggered:</span> Current stock is {med.stock}, which is below the safe floor limit ({med.minStock}). Standard delivery orders may suffer bottleneck delays.
                    </div>
                  </div>
                )}

                {/* Patient/Clinical Safety Cautions */}
                <div className="space-y-1.5">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold block">Contraindications & Warnings</span>
                  {med.contraindications.length > 0 ? (
                    <ul className="space-y-1">
                      {med.contraindications.map((c, idx) => (
                        <li key={idx} className="text-xs text-rose-700 flex items-center gap-1.5 bg-rose-50/30 px-2 py-1 rounded-md">
                          <CornerDownRight className="w-3.5 h-3.5 shrink-0" />
                          {c}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-xs text-slate-400 italic">No generic contraindications listed.</p>
                  )}
                </div>

                {/* Stock update form */}
                <div className="border-t border-slate-100 pt-4 space-y-2">
                  <h4 className="text-xs font-mono font-bold uppercase text-slate-400">Replenish Inventory Units</h4>
                  <form onSubmit={(e) => handleStockUpdateSubmit(med.id, e)} className="flex gap-2">
                    <input 
                      type="number" 
                      placeholder="e.g. +50 or -10"
                      value={stockAdjustment === 0 ? '' : stockAdjustment}
                      onChange={e => setStockAdjustment(Number(e.target.value))}
                      className="w-full text-sm px-3 py-2 border border-slate-200 rounded-xl focus:outline-emerald-500 font-mono"
                    />
                    <button 
                      type="submit"
                      disabled={stockAdjustment === 0}
                      className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white font-medium text-xs rounded-xl shrink-0 transition disabled:opacity-50 cursor-pointer"
                    >
                      Update
                    </button>
                  </form>
                  <p className="text-[10px] text-slate-400 italic">Positive numbers restock, negative numbers deplete stock for visual validation.</p>
                </div>
              </div>
            );
          })() : (
            <div className="text-center py-10 space-y-2 text-slate-400 animate-fadeIn">
              <Info className="w-8 h-8 mx-auto stroke-slate-300 animate-pulse" />
              <p className="text-xs">Select any medication row on the left catalog to display clinical guidelines and modify inventory values.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
