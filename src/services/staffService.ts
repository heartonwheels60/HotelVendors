import { db } from '../config/firebase';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  serverTimestamp,
  DocumentData,
  Timestamp
} from 'firebase/firestore';
import type { Staff, StaffFormData } from '../types/staff';
import { auth } from '../config/firebase';

const STAFF_COLLECTION = 'staff';

// Helper function to convert Firestore timestamp to Date
const convertTimestamp = (timestamp: any): Date => {
  if (timestamp instanceof Timestamp) {
    return timestamp.toDate();
  }
  return new Date(timestamp);
};

// Helper function to convert Firestore data to Staff type
const convertStaffData = (docData: DocumentData, id: string): Staff => {
  return {
    id,
    ownerId: docData.ownerId,
    firstName: docData.firstName,
    lastName: docData.lastName,
    email: docData.email,
    phone: docData.phone,
    role: docData.role,
    propertyId: docData.propertyId,
    propertyName: docData.propertyName,
    startDate: convertTimestamp(docData.startDate),
    status: docData.status,
    schedule: docData.schedule,
    emergencyContact: docData.emergencyContact,
    documents: docData.documents?.map((doc: any) => ({
      ...doc,
      uploadedAt: convertTimestamp(doc.uploadedAt)
    })),
    notes: docData.notes,
    createdAt: convertTimestamp(docData.createdAt),
    updatedAt: convertTimestamp(docData.updatedAt)
  };
};

export const staffService = {
  async getStaffMembers(): Promise<Staff[]> {
    try {
      const { currentUser } = auth;
      if (!currentUser) {
        throw new Error('No authenticated user');
      }

      // First get all documents where ownerId matches
      const q = query(
        collection(db, STAFF_COLLECTION),
        where('ownerId', '==', currentUser.uid)
      );
      const querySnapshot = await getDocs(q);
      
      // Then sort the results in memory
      return querySnapshot.docs
        .map(doc => convertStaffData(doc.data(), doc.id))
        .sort((a, b) => a.lastName.localeCompare(b.lastName));
    } catch (error) {
      console.error('Error getting staff members:', error);
      throw new Error('Failed to load staff members');
    }
  },

  async getStaffByPropertyId(propertyId: string): Promise<Staff[]> {
    try {
      const { currentUser } = auth;
      if (!currentUser) {
        throw new Error('No authenticated user');
      }

      const q = query(
        collection(db, STAFF_COLLECTION),
        where('ownerId', '==', currentUser.uid),
        where('propertyId', '==', propertyId)
      );
      const querySnapshot = await getDocs(q);
      
      // Sort in memory instead of using orderBy
      return querySnapshot.docs
        .map(doc => convertStaffData(doc.data(), doc.id))
        .sort((a, b) => a.lastName.localeCompare(b.lastName));
    } catch (error) {
      console.error('Error getting staff members:', error);
      throw new Error('Failed to load staff members');
    }
  },

  async getStaffMemberById(id: string): Promise<Staff | null> {
    try {
      const docRef = doc(db, STAFF_COLLECTION, id);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) {
        return null;
      }

      return convertStaffData(docSnap.data(), docSnap.id);
    } catch (error) {
      console.error('Error getting staff member:', error);
      throw new Error('Failed to load staff member');
    }
  },

  async createStaffMember(data: StaffFormData): Promise<Staff> {
    try {
      const { currentUser } = auth;
      if (!currentUser) {
        throw new Error('No authenticated user');
      }

      // Ensure all required fields are present
      const requiredFields = ['firstName', 'lastName', 'email', 'phone', 'role', 'propertyId', 'propertyName', 'startDate', 'status'];
      const missingFields = requiredFields.filter(field => !data[field as keyof StaffFormData]);
      
      if (missingFields.length > 0) {
        throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
      }

      const staffData = {
        ...data,
        ownerId: currentUser.uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      // Add the document to Firestore
      const docRef = await addDoc(collection(db, STAFF_COLLECTION), staffData);
      console.log('Staff member created with ID:', docRef.id);

      // Return the created staff member
      return {
        id: docRef.id,
        ...staffData,
        createdAt: new Date(),
        updatedAt: new Date()
      } as Staff;
    } catch (error) {
      console.error('Error creating staff member:', error);
      if (error instanceof Error) {
        throw new Error(`Failed to create staff member: ${error.message}`);
      }
      throw new Error('Failed to create staff member');
    }
  },

  async updateStaffMember(id: string, data: Partial<StaffFormData>): Promise<void> {
    try {
      const docRef = doc(db, STAFF_COLLECTION, id);
      
      const updateData = {
        ...data,
        updatedAt: serverTimestamp()
      };

      await updateDoc(docRef, updateData);
    } catch (error) {
      console.error('Error updating staff member:', error);
      throw new Error('Failed to update staff member');
    }
  },

  async deleteStaffMember(id: string): Promise<void> {
    try {
      const docRef = doc(db, STAFF_COLLECTION, id);
      await deleteDoc(docRef);
    } catch (error) {
      console.error('Error deleting staff member:', error);
      throw new Error('Failed to delete staff member');
    }
  },

  async addStaffDocument(id: string, document: { name: string; url: string; type: string }): Promise<void> {
    try {
      const docRef = doc(db, STAFF_COLLECTION, id);
      const staffMember = await this.getStaffMemberById(id);
      
      if (!staffMember) {
        throw new Error('Staff member not found');
      }

      const documents = staffMember.documents || [];
      documents.push({
        ...document,
        uploadedAt: new Date()
      });

      await updateDoc(docRef, {
        documents,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error adding staff document:', error);
      throw new Error('Failed to add staff document');
    }
  },

  async updateStaffSchedule(id: string, schedule: Staff['schedule']): Promise<void> {
    try {
      const docRef = doc(db, STAFF_COLLECTION, id);
      
      await updateDoc(docRef, {
        schedule,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error updating staff schedule:', error);
      throw new Error('Failed to update staff schedule');
    }
  }
};
