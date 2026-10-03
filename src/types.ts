
export type Role = 'Admin' | 'Doctor' | 'Data Entry';

export interface UserProfile {
  id: string;
  fullName: string;
  role: string;
  phone?: string;
  createdAt?: string;
}

export interface User {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  role: Role;
}

export interface Animal {
  id: string;
  name: string;
  species: string;
  breed?: string;
  age?: number;
  gender?: string;
  healthStatus?: string;
  location?: string;
  imageUrl?: string;
  status: string;
  createdAt?: string;
}

export enum CaseStatus {
  OPEN = 'open',
  CLOSED = 'closed',
  UNDER_TREATMENT = 'under_treatment',
  RECOVERY = 'recovery',
  CRITICAL = 'critical',
  RELEASED = 'released',
  PERMANENT = 'permanent',
  DECEASED = 'deceased'
}

export interface Case {
  id: string;
  title: string;
  description: string;
  location: string;
  status: CaseStatus | string;
  reportedById?: string; 
  imageUrl?: string;
  videoUrl?: string;
  createdAt?: string;
}

export interface ClinicalEntry {
  id: string;
  caseId: string;
  date: string;
  symptoms?: string;
  diagnosis: string;
  treatment: string;
  doctorName: string;
  createdAt?: string;
}

export interface WildlifeCase {
  id: string;
  caseNumber: string;
  dateTime: string;
  animal: string;
  species: string;
  schedule: string;
  location: string;
  status: string;
  complainantName: string;
  complainantPhone: string;
  forestDeptContact?: string;
  releasePlan?: string;
  isReadyForRelease: boolean;
  sentFor?: string;
  destination?: string;
  correspondence?: string;
  signature?: string;
  reportedDate?: string;
  resolvedDate?: string;
  imageUrl?: string;
  createdAt?: string;
}

export interface ABCRecord {
  id: string;
  animalId?: string;
  animalType?: string;
  maleCount?: number;
  femaleCount?: number;
  area?: string;
  sterilized: boolean;
  vaccinationDone: boolean;
  surgeryDate: string;
  remarks?: string;
  createdAt?: string;
}

export interface AdoptionApplication {
  id: string;
  appNumber: string;
  adopterName: string;
  adopterAge: string;
  adopterGender: string;
  address: string;
  phone: string;
  email: string;
  animalType: string;
  targetGender: string;
  targetColor: string;
  status: string;
  date: string;
  time: string;
  description?: string;
  idProof?: string;
  houseType?: string;
  hasOtherPets?: string;
  vetName?: string;
  reason?: string;
  location?: string;
  createdAt?: string;
}

export interface Adoption {
  id: string;
  animalId: string;
  userId: string;
  status: string;
  notes?: string;
  createdAt?: string;
}

export interface Declaration {
  id: string;
  formNo: string;
  declarerName: string;
  address: string;
  phone: string;
  email: string;
  species: string;
  gender: string;
  age: string;
  description: string;
  date: string;
  createdAt?: string;
}

export interface Donation {
  id: string;
  donorName: string;
  amount: number;
  date?: string;
  message?: string;
  paymentId?: string;
  createdAt?: string;
}

export interface HousekeepingSupply {
  id: string;
  name: string;
  quantity: number;
  minStockLevel: number;
  unit: string;
  createdAt?: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  minStockLevel?: number;
  lastRestocked?: string;
  createdAt?: string;
}

export interface Medicine {
  id: string;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  expiryDate?: string;
  minStockLevel: number;
  createdAt?: string;
}

export interface MedicineUsage {
  id: string;
  medicineId: string;
  medicineName: string;
  quantity: string;
  takenBy: string;
  dateTime: string;
  purpose: string;
  ward?: string;
  createdAt?: string;
}

export interface StaffMember {
  id: string;
  name: string;
  type?: string;
  role: string;
  phone: string;
  joinedDate: string;
  bankFullName?: string;
  bankName?: string;
  bankBranch?: string;
  ifscCode?: string;
  accountNumber?: string;
  salary?: number;
  createdAt?: string;
}
