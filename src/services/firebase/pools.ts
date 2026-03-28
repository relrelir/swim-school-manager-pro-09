import {
  collection,
  doc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '@/config/firebase';
import { Pool } from '@/types';

const COL = 'pools';

function fromDoc(id: string, data: Record<string, unknown>): Pool {
  return {
    id,
    name: data.name as string,
    seasonId: (data.seasonId as string) ?? null,
    createdAt: (data.createdAt as string) ?? '',
    updatedAt: (data.updatedAt as string) ?? '',
  };
}

export async function getPools(): Promise<Pool[]> {
  const snap = await getDocs(query(collection(db, COL), orderBy('name')));
  return snap.docs.map((d) => fromDoc(d.id, d.data()));
}

export async function getPoolsBySeason(seasonId: string): Promise<Pool[]> {
  const q = query(collection(db, COL), where('seasonId', '==', seasonId), orderBy('name'));
  const snap = await getDocs(q);
  return snap.docs.map((d) => fromDoc(d.id, d.data()));
}

export async function createPool(data: Omit<Pool, 'id' | 'createdAt' | 'updatedAt'>): Promise<Pool> {
  const now = new Date().toISOString();
  const ref = await addDoc(collection(db, COL), {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return { id: ref.id, ...data, createdAt: now, updatedAt: now };
}

export async function updatePool(id: string, data: Partial<Omit<Pool, 'id'>>): Promise<void> {
  await updateDoc(doc(db, COL, id), { ...data, updatedAt: serverTimestamp() });
}

export async function deletePool(id: string): Promise<void> {
  await deleteDoc(doc(db, COL, id));
}

export function subscribeToPools(callback: (pools: Pool[]) => void): () => void {
  const q = query(collection(db, COL), orderBy('name'));
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => fromDoc(d.id, d.data())));
  });
}
