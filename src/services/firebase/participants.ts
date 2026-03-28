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
import { Participant } from '@/types';

const COL = 'participants';

function fromDoc(id: string, data: Record<string, unknown>): Participant {
  return {
    id,
    firstName: data.firstName as string,
    lastName: data.lastName as string,
    idNumber: data.idNumber as string,
    phone: data.phone as string,
    healthApproval: (data.healthApproval as boolean) ?? false,
  };
}

export async function getParticipants(): Promise<Participant[]> {
  const q = query(collection(db, COL), orderBy('lastName'));
  const snap = await getDocs(q);
  return snap.docs.map((d) => fromDoc(d.id, d.data()));
}

export async function getParticipant(id: string): Promise<Participant | null> {
  const snap = await getDoc(doc(db, COL, id));
  return snap.exists() ? fromDoc(snap.id, snap.data()) : null;
}

export async function createParticipant(data: Omit<Participant, 'id'>): Promise<Participant> {
  const ref = await addDoc(collection(db, COL), { ...data, createdAt: serverTimestamp() });
  return { id: ref.id, ...data };
}

export async function updateParticipant(id: string, data: Partial<Omit<Participant, 'id'>>): Promise<void> {
  await updateDoc(doc(db, COL, id), { ...data, updatedAt: serverTimestamp() });
}

export async function deleteParticipant(id: string): Promise<void> {
  await deleteDoc(doc(db, COL, id));
}

export function subscribeToParticipants(callback: (participants: Participant[]) => void): () => void {
  const q = query(collection(db, COL), orderBy('lastName'));
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => fromDoc(d.id, d.data())));
  });
}
