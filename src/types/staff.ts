export type StaffRole = 'manager' | 'receptionist' | 'housekeeper' | 'maintenance' | 'security' | 'chef' | 'waiter';

export interface Staff {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: StaffRole;
  propertyId: string;
  propertyName: string;
  startDate: Date;
  status: 'active' | 'inactive';
  schedule?: {
    sunday?: { start?: string; end?: string };
    monday?: { start?: string; end?: string };
    tuesday?: { start?: string; end?: string };
    wednesday?: { start?: string; end?: string };
    thursday?: { start?: string; end?: string };
    friday?: { start?: string; end?: string };
    saturday?: { start?: string; end?: string };
  };
  emergencyContact?: {
    name: string;
    relationship: string;
    phone: string;
  };
  documents?: {
    name: string;
    url: string;
    type: string;
    uploadedAt: Date;
  }[];
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface StaffFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: StaffRole;
  propertyId: string;
  propertyName: string;
  startDate: Date;
  status: 'active' | 'inactive';
  schedule?: {
    sunday?: { start?: string; end?: string };
    monday?: { start?: string; end?: string };
    tuesday?: { start?: string; end?: string };
    wednesday?: { start?: string; end?: string };
    thursday?: { start?: string; end?: string };
    friday?: { start?: string; end?: string };
    saturday?: { start?: string; end?: string };
  };
  emergencyContact?: {
    name: string;
    relationship: string;
    phone: string;
  };
  notes?: string;
}
