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
import { Season } from '@/types';

const COL = 'seasons';

function fromDoc(id: string, data: Record<string, unknown>): Season {
  return {
    id,
    name: data.name as string,
    startDate: data.startDate as string,
    endDate: data.endDate as string,
  };
}

export async function getSeasons(): Promise<Season[]> {
  const q = query(collection(db, COL), orderBy('startDate', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map((d) => fromDoc(d.id, d.data()));
}

export async function getSeason(id: string): Promise<Season | null> {
  const snap = await getDoc(doc(db, COL, id));
  return snap.exists() ? fromDoc(snap.id, snap.data()) : null;
}

export async function createSeason(data: Omit<Season, 'id'>): Promise<Season> {
  const ref = await addDoc(collection(db, COL), {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return { id: ref.id, ...data };
}

export async function updateSeason(id: string, data: Partial<Omit<Season, 'id'>>): Promise<void> {
  await updateDoc(doc(db, COL, id), { ...data, updatedAt: serverTimestamp() });
}

export async function deleteSeason(id: string): Promise<void> {
  await deleteDoc(doc(db, COL, id));
}

export function subscribeToSeasons(callback: (seasons: Season[]) => void): () => void {
  const q = query(collection(db, COL), orderBy('startDate', 'desc'));
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => fromDoc(d.id, d.data())));
  });
}
