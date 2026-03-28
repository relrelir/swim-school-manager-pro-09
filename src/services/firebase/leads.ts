import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '@/config/firebase';
import { Lead } from '@/types';

const COL = 'leads';

function fromDoc(id: string, data: Record<string, unknown>): Lead {
  return {
    id,
    name: (data.name as string) ?? '',
    idNumber: (data.idNumber as string) ?? '',
    phone: (data.phone as string) ?? '',
    email: (data.email as string) ?? '',
    status: (data.status as Lead['status']) ?? 'חדש',
    requestedProductType: (data.requestedProductType as Lead['requestedProductType']) ?? null,
    notes: (data.notes as string | null) ?? null,
    convertedToParticipantId: (data.convertedToParticipantId as string | null) ?? null,
    createdAt: (data.createdAt as string) ?? new Date().toISOString(),
    updatedAt: (data.updatedAt as string) ?? undefined,
  };
}

export async function getLeads(): Promise<Lead[]> {
  const q = query(collection(db, COL), orderBy('createdAt', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map((d) => fromDoc(d.id, d.data()));
}

export async function getLead(id: string): Promise<Lead | null> {
  const snap = await getDoc(doc(db, COL, id));
  return snap.exists() ? fromDoc(snap.id, snap.data()) : null;
}


export async function createLead(data: Omit<Lead, 'id' | 'createdAt' | 'updatedAt'>): Promise<Lead> {
  const now = new Date().toISOString();
  const ref = await addDoc(collection(db, COL), {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return { id: ref.id, ...data, createdAt: now };
}

export async function updateLead(id: string, data: Partial<Omit<Lead, 'id' | 'createdAt'>>): Promise<void> {
  await updateDoc(doc(db, COL, id), { ...data, updatedAt: serverTimestamp() });
}

export async function deleteLead(id: string): Promise<void> {
  await deleteDoc(doc(db, COL, id));
}

export function subscribeToLeads(callback: (leads: Lead[]) => void): () => void {
  const q = query(collection(db, COL), orderBy('createdAt', 'desc'));
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => fromDoc(d.id, d.data())));
  });
}
