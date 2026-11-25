
import { Animal, Case, Medicine, Donation, ABCRecord, WildlifeCase, HousekeepingSupply, MedicineUsage, AdoptionApplication, StaffMember, Declaration } from '../types';

export const INITIAL_STAFF: StaffMember[] = [
  {
    id: '1',
    name: 'Dr. Anita Desai', 
    phone: '9876543210', 
    role: 'Senior Vet', 
    joinedDate: '2023-01-10',
  },
  {
    id: '2',
    name: 'Prateek Yadav', 
    phone: '9876543211', 
    role: 'Rescue Lead', 
    joinedDate: '2023-02-01',
  },
];

export const INITIAL_ANIMALS: Animal[] = [
  {
    id: 'a1',
    name: 'Buddy',
    species: 'Dog',
    breed: 'Golden Retriever',
    age: 3,
    gender: 'Male',
    healthStatus: 'Healthy',
    location: 'Sanctuary',
    imageUrl: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80&w=800',
    status: 'available'
  },
  {
    id: 'a2',
    name: 'Misty',
    species: 'Cat',
    breed: 'Calico',
    age: 2,
    gender: 'Female',
    healthStatus: 'Recovering',
    location: 'Ward B',
    imageUrl: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?q=80&w=1000&auto=format&fit=crop',
    status: 'available'
  }
];

export const INITIAL_CASES: Case[] = [
  {
    id: '1',
    caseNumber: 'PFA-2026-001',
    title: 'Golden Retriever Rescue',
    description: 'Golden Retriever, limping on front left leg, possibly a hairline fracture.',
    location: 'Central Park, Delhi',
    status: 'open',
    imageUrl: 'https://images.unsplash.com/photo-1544568100-847a948585b9?q=80&w=1000&auto=format&fit=crop',
  },
  {
    id: '2',
    caseNumber: 'PFA-2026-002',
    title: 'Calico Cat Recovery',
    description: 'Calico cat found with severe dehydration and skin infection.',
    location: 'Sector 15, Rohini',
    status: 'open',
    imageUrl: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?q=80&w=1000&auto=format&fit=crop',
  }
];

export const INITIAL_WILDLIFE: WildlifeCase[] = [
  {
    id: 'w1',
    caseNumber: 'WILD-2024-001',
    dateTime: '2024-02-15 09:00',
    location: 'Asola Bhatti Sanctuary',
    animal: 'Monkey',
    species: 'Rhesus Macaque',
    schedule: 'Schedule I',
    status: 'Under Treatment',
    complainantName: 'Forest Ranger Sunil',
    complainantPhone: '9988776655',
    isReadyForRelease: false,
  }
];

export const INITIAL_HOUSEKEEPING_SUPPLIES: HousekeepingSupply[] = [
  { id: 'hk1', name: 'White Phenyl', quantity: 25, minStockLevel: 10, unit: 'Liters' },
  { id: 'hk2', name: 'Bleaching powder', quantity: 15, minStockLevel: 5, unit: 'Kg' },
];

export const INITIAL_ABC_RECORDS: ABCRecord[] = [
  { id: 'abc1', animalId: 'a1', sterilized: true, vaccinationDone: true, surgeryDate: '2023-11-01', remarks: 'Community camp successful' }
];

export const INITIAL_MEDS: Medicine[] = [
  { id: 'ab1', name: 'Injection Amoxycillin Cloxacillin', category: 'Antibiotic', quantity: 50, unit: 'Vials', expiryDate: '2025-12-31', minStockLevel: 10 },
  { id: 'ab2', name: 'Injection Ceftriaxone tazobactum', category: 'Antibiotic', quantity: 8, unit: 'Vials', expiryDate: '2025-12-31', minStockLevel: 5 },
];

export const INITIAL_MEDICINE_USAGE: MedicineUsage[] = [
  { id: 'u1', medicineId: 'ab1', medicineName: 'Amoxycillin Cloxacillin Inj', quantity: '2 Vials', takenBy: 'Dr. Anita Desai', dateTime: '20/05/2025 10:15', purpose: 'Scheduled dose for CASE-2024-001', ward: 'Ward A' },
];

export const INITIAL_ADOPTION_APPLICATIONS: AdoptionApplication[] = [
  {
    id: 'APP-101',
    appNumber: '2024-101',
    adopterName: 'Rahul Verma',
    address: '22/B, Indiranagar, Mysuru',
    phone: '9845012345',
    email: 'rahul.v@gmail.com',
    animalType: 'Dog',
    targetGender: 'Male',
    targetColor: 'Golden Brown',
    status: 'Pending Review',
    date: '2024-05-15',
    time: '10:30',
    reason: 'Loves dogs, has a large fenced backyard.',
    adopterAge: '32',
    adopterGender: 'Male'
  }
];

export const INITIAL_DECLARATIONS: Declaration[] = [
  {
    id: '1',
    formNo: 'FORM-2024-001',
    declarerName: 'Rahul Sharma',
    address: '123, MG Road, Mysuru',
    phone: '9876543210',
    email: 'rahul@example.com',
    species: 'Dog',
    gender: 'Male',
    age: '3 years',
    description: 'Golden Retriever, healthy but aggressive towards strangers.',
    date: '2024-05-20',
    createdAt: '2024-05-20T10:00:00Z'
  }
];

export const INITIAL_DONATIONS: Donation[] = [
  { id: 'D102', donorName: 'Sameer Malhotra', amount: 25000, message: 'For the animals' }
];
