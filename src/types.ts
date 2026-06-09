/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Medication {
  id: string;
  name: string;
  genericName: string;
  category: 'Cardiovascular' | 'Antibiotic' | 'Diabetes' | 'Analgesic' | 'Respiratory' | 'Neurology' | 'Other';
  stock: number;
  minStock: number; // For low stock triggers
  dosage: string;
  price: number;
  shelfLocation: string;
  contraindications: string[];
}

export interface InteractionNote {
  id: string;
  date: string;
  type: 'phone' | 'sms' | 'whatsapp' | 'email' | 'in-person' | 'system';
  summary: string;
  agentName: string;
}

export interface Patient {
  id: string;
  name: string;
  phone: string;
  email: string;
  dob: string;
  allergies: string[];
  chronicConditions: string[];
  tags: string[]; // e.g., 'Senior Citizen', 'High Priority', 'Allergic Risk'
  notes: InteractionNote[];
  insuranceProvider?: string;
}

export interface RefillRequest {
  id: string;
  patientId: string;
  medicationId: string;
  refillNumber: number;
  maxRefills: number;
  requestDate: string;
  rxNumber: string;
  status: 'pending' | 'review' | 'approved' | 'dispensed' | 'rejected';
  notes?: string;
  physicianName: string;
  paymentMode?: 'cash' | 'credit';
  paymentStatus?: 'unpaid' | 'paid';
  copay?: number;
}

export interface DriverMessage {
  id: string;
  timestamp: string;
  sender: string;
  recipientPhone: string;
  channel: 'whatsapp' | 'sms';
  message: string;
}

export interface Delivery {
  id: string;
  refillRequestId: string;
  patientId: string;
  address: string;
  status: 'pending_dispatch' | 'in_transit' | 'delivered' | 'delayed';
  courierName: string;
  estimatedDelivery: string;
  latitude: number; // for path simulation
  longitude: number;
  progress: number; // 0 to 100 representing journey completion
  priority: 'standard' | 'urgent';
  deliveryFee: number;
  paymentMode?: 'cash' | 'credit';
  paymentStatus?: 'unpaid' | 'paid';
  communicationLogs?: DriverMessage[];
  area?: string;
}
