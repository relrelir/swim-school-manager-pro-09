import {
  collection,
  doc,
  getDocs,
  getDoc,
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
import { Product } from '@/types';

const COL = 'products';

function fromDoc(id: string, data: Record<string, unknown>): Product {
  return {
    id,
    name: data.name as string,
    description: data.description as string | undefined,
    price: data.price as number,
    active: (data.active as boolean) ?? true,
    startDate: data.startDate as string,
    endDate: data.endDate as string,
    maxParticipants: data.maxParticipants as number,
    notes: data.notes as string | undefined,
    seasonId: data.seasonId as string,
    poolId: (data.poolId as string | null) ?? null,
    type: data.type as Product['type'],
    meetingsCount: data.meetingsCount as number | undefined,
    startTime: data.startTime as string | undefined,
    daysOfWeek: (data.daysOfWeek as string[]) ?? [],
    discountAmount: (data.discountAmount as number | null) ?? null,
    effectivePrice: (data.effectivePrice as number | null) ?? null,
  };
}

export async function getProducts(): Promise<Product[]> {
  const snap = await getDocs(query(collection(db, COL), orderBy('name')));
  return snap.docs.map((d) => fromDoc(d.id, d.data()));
}

export async function getProduct(id: string): Promise<Product | null> {
  const snap = await getDoc(doc(db, COL, id));
  return snap.exists() ? fromDoc(snap.id, snap.data()) : null;
}

export async function getProductsBySeason(seasonId: string): Promise<Product[]> {
  const q = query(collection(db, COL), where('seasonId', '==', seasonId));
  const snap = await getDocs(q);
  return snap.docs.map((d) => fromDoc(d.id, d.data())).sort((a, b) => a.name.localeCompare(b.name, 'he'));
}

export async function getProductsByPool(poolId: string): Promise<Product[]> {
  const q = query(collection(db, COL), where('poolId', '==', poolId), orderBy('name'));
  const snap = await getDocs(q);
  return snap.docs.map((d) => fromDoc(d.id, d.data()));
}

export async function createProduct(data: Omit<Product, 'id'>): Promise<Product> {
  const ref = await addDoc(collection(db, COL), { ...data, createdAt: serverTimestamp() });
  return { id: ref.id, ...data };
}

export async function updateProduct(id: string, data: Partial<Omit<Product, 'id'>>): Promise<void> {
  const clean = Object.fromEntries(Object.entries(data).filter(([, v]) => v !== undefined));
  await updateDoc(doc(db, COL, id), { ...clean, updatedAt: serverTimestamp() });
}

export async function deleteProduct(id: string): Promise<void> {
  await deleteDoc(doc(db, COL, id));
}

export function subscribeToProducts(callback: (products: Product[]) => void): () => void {
  const q = query(collection(db, COL), orderBy('name'));
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => fromDoc(d.id, d.data())));
  });
}
