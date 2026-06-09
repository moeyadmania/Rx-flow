/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Medication, Patient, RefillRequest, Delivery } from '../types';

export const INITIAL_MEDICATIONS: Medication[] = [
  {
    id: 'med-1',
    name: 'Lipitor',
    genericName: 'Atorvastatin',
    category: 'Cardiovascular',
    stock: 142,
    minStock: 50,
    dosage: '20mg',
    price: 45.00,
    shelfLocation: 'Aisle 3, Shelf B',
    contraindications: ['Active liver disease', 'Pregnancy', 'Grapefruit consumption']
  },
  {
    id: 'med-2',
    name: 'Amoxil',
    genericName: 'Amoxicillin',
    category: 'Antibiotic',
    stock: 12, // LOW STOCK
    minStock: 40,
    dosage: '500mg',
    price: 18.50,
    shelfLocation: 'Aisle 1, Refrigerator A',
    contraindications: ['Penicillin allergy', 'Severe renal impairment']
  },
  {
    id: 'med-3',
    name: 'Glucophage',
    genericName: 'Metformin Hydrochloride',
    category: 'Diabetes',
    stock: 210,
    minStock: 60,
    dosage: '850mg',
    price: 24.00,
    shelfLocation: 'Aisle 4, Shelf A',
    contraindications: ['Severe renal failure', 'Acute metabolic acidosis']
  },
  {
    id: 'med-4',
    name: 'Zestril',
    genericName: 'Lisinopril',
    category: 'Cardiovascular',
    stock: 95,
    minStock: 40,
    dosage: '10mg',
    price: 15.00,
    shelfLocation: 'Aisle 3, Shelf D',
    contraindications: ['History of angioedema', 'Pregnancy']
  },
  {
    id: 'med-5',
    name: 'ProAir HFA',
    genericName: 'Albuterol Inhaler',
    category: 'Respiratory',
    stock: 8, // LOW STOCK
    minStock: 15,
    dosage: '90mcg',
    price: 55.00,
    shelfLocation: 'Aisle 2, Shelf C',
    contraindications: ['Hypersensitivity to albuterol']
  },
  {
    id: 'med-6',
    name: 'Neurontin',
    genericName: 'Gabapentin',
    category: 'Neurology',
    stock: 110,
    minStock: 30,
    dosage: '300mg',
    price: 38.00,
    shelfLocation: 'Aisle 5, Shelf E',
    contraindications: ['None major, monitor renal function']
  },
  {
    id: 'med-7',
    name: 'Advil',
    genericName: 'Ibuprofen',
    category: 'Analgesic',
    stock: 350,
    minStock: 80,
    dosage: '400mg',
    price: 8.99,
    shelfLocation: 'Aisle 1, Shelf B',
    contraindications: ['Active peptic ulcer', 'Severe heart failure']
  }
];

export const INITIAL_PATIENTS: Patient[] = [
  {
    id: 'pat-1',
    name: 'Eleanor Vance',
    phone: '(555) 234-5678',
    email: 'eleanor.v@netmail.com',
    dob: '1948-11-12', // Senior
    allergies: ['Amoxicillin', 'Sulfa Drugs'],
    chronicConditions: ['Hypertension', 'High Cholesterol'],
    tags: ['Senior Citizen', 'High Priority', 'Allergy Alert'],
    notes: [
      {
        id: 'note-1',
        date: '2026-06-02T14:30:00Z',
        type: 'phone',
        summary: 'Called to confirm if she is experiencing any muscle pain from Lipitor. Patient reported feeling well and requested automated delivery for future refills.',
        agentName: 'Dr. Sarah Smith'
      },
      {
        id: 'note-2',
        date: '2026-06-08T09:15:00Z',
        type: 'system',
        summary: 'Automated SMS sent: Refill reminder for Lisinopril 10mg.',
        agentName: 'RxFlow System'
      }
    ]
  },
  {
    id: 'pat-2',
    name: 'Marcus Brody',
    phone: '(555) 876-5432',
    email: 'mbrody@museum-arch.org',
    dob: '1975-04-20',
    allergies: ['Peanuts'],
    chronicConditions: ['Type-2 Diabetes'],
    tags: ['Chronic Care'],
    notes: [
      {
        id: 'note-3',
        date: '2026-05-28T11:00:00Z',
        type: 'in-person',
        summary: 'Patient came into the pharmacy requesting consultation on Glucophage dosage timing. Advised to take with dinner to minimize gastric side effects.',
        agentName: 'Dr. Sarah Smith'
      }
    ]
  },
  {
    id: 'pat-3',
    name: 'Sarah Chen',
    phone: '(555) 432-1098',
    email: 'schen@techdesign.io',
    dob: '1989-08-05',
    allergies: ['None Reported'],
    chronicConditions: ['Asthma'],
    tags: ['Fast-Track'],
    notes: [
      {
        id: 'note-4',
        date: '2026-06-01T16:45:00Z',
        type: 'email',
        summary: 'Sent digital invoice for respiratory supplies. Patient acknowledged and requested doorstep delivery instead of standard pickup.',
        agentName: 'Clerk James'
      }
    ]
  },
  {
    id: 'pat-4',
    name: 'David Miller',
    phone: '(555) 345-6789',
    email: 'dmiller@builders-corp.com',
    dob: '1992-01-30',
    allergies: ['Penicillin', 'NSAIDs'],
    chronicConditions: ['Post-Op Dental Pain'],
    tags: ['Allergy Alert'],
    notes: [
      {
        id: 'note-5',
        date: '2026-06-05T13:10:00Z',
        type: 'phone',
        summary: 'Called patient because dentist prescribed Ibuprofen but patient allergy list flags NSAIDs. Dental clinic contacted and changed prescription to Acetaminophen.',
        agentName: 'Dr. Sarah Smith'
      }
    ]
  }
];

export const INITIAL_REFILLS: RefillRequest[] = [
  {
    id: 'ref-1',
    patientId: 'pat-1',
    medicationId: 'med-1', // Lipitor
    refillNumber: 2,
    maxRefills: 5,
    requestDate: '2026-06-08T10:00:00Z',
    rxNumber: 'RX-992104-A',
    status: 'approved',
    notes: 'Standard delivery requested.',
    physicianName: 'Dr. James Mercer',
    paymentMode: 'credit',
    paymentStatus: 'paid'
  },
  {
    id: 'ref-2',
    patientId: 'pat-2',
    medicationId: 'med-3', // Glucophage
    refillNumber: 5,
    maxRefills: 6,
    requestDate: '2026-06-09T08:30:00Z',
    rxNumber: 'RX-884912-B',
    status: 'pending',
    notes: 'Patient requesting quick pickup if possible.',
    physicianName: 'Dr. Gregory House',
    paymentMode: 'cash',
    paymentStatus: 'unpaid'
  },
  {
    id: 'ref-3',
    patientId: 'pat-3',
    medicationId: 'med-5', // ProAir HFA - Albuterol
    refillNumber: 1,
    maxRefills: 3,
    requestDate: '2026-06-09T14:20:00Z',
    rxNumber: 'RX-221045-C',
    status: 'review',
    notes: 'Urgent refill requested. Inhaler lost during travel.',
    physicianName: 'Dr. Gregory House',
    paymentMode: 'credit',
    paymentStatus: 'unpaid'
  },
  {
    id: 'ref-4',
    patientId: 'pat-1',
    medicationId: 'med-4', // Lisinopril
    refillNumber: 4,
    maxRefills: 4, // LAST REFILL
    requestDate: '2026-06-07T11:15:00Z',
    rxNumber: 'RX-992105-D',
    status: 'dispensed',
    notes: 'Dispatched to delivery courier.',
    physicianName: 'Dr. James Mercer',
    paymentMode: 'cash',
    paymentStatus: 'unpaid'
  }
];

export const INITIAL_DELIVERIES: Delivery[] = [
  {
    id: 'del-1',
    refillRequestId: 'ref-1', // Lipitor
    patientId: 'pat-1',
    address: '742 Evergreen Terrace, Sector 7G',
    status: 'in_transit',
    courierName: 'Driver A',
    estimatedDelivery: 'Today, 4:00 PM',
    latitude: 34.0522, // Simulation start/path variables
    longitude: -118.2437,
    progress: 45,
    priority: 'standard',
    deliveryFee: 4.99,
    paymentMode: 'cash',
    paymentStatus: 'unpaid',
    area: 'AREA 1'
  },
  {
    id: 'del-2',
    refillRequestId: 'ref-4', // Lisinopril
    patientId: 'pat-1',
    address: '742 Evergreen Terrace, Sector 7G',
    status: 'pending_dispatch',
    courierName: 'Driver B',
    estimatedDelivery: 'Tomorrow, 11:00 AM',
    latitude: 34.0522,
    longitude: -118.2437,
    progress: 0,
    priority: 'standard',
    deliveryFee: 4.99,
    paymentMode: 'credit',
    paymentStatus: 'paid',
    area: 'AREA 2'
  }
];
