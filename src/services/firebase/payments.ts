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
import { Payment } from '@/types';

const COL = 'payments';

function fromDoc(id: string, data: Record<string, unknown>): Payment {
  return {
    id,
    registrationId: data.registrationId as string,
    amount: data.amount as number,
    paymentDate: data.paymentDate as string,
    receiptNumber: data.receiptNumber as string,
  };
}

export async function getPayments(): Promise<Payment[]> {
  const snap = await getDocs(query(collection(db, COL), orderBy('paymentDate', 'desc')));
  return snap.docs.map((d) => fromDoc(d.id, d.data()));
}

export async function getPaymentsByRegistration(registrationId: string): Promise<Payment[]> {
  // Note: no orderBy here — combining where() on one field with orderBy() on another
  // requires a composite Firestore index. We sort in JS instead.
  const q = query(
    collection(db, COL),
    where('registrationId', '==', registrationId),
  );
  const snap = await getDocs(q);
  const payments = snap.docs.map((d) => fromDoc(d.id, d.data()));
  return payments.sort((a, b) => b.paymentDate.localeCompare(a.paymentDate));
}

export async function createPayment(data: Omit<Payment, 'id'>): Promise<Payment> {
  const ref = await addDoc(collection(db, COL), { ...data, createdAt: serverTimestamp() });
  return { id: ref.id, ...data };
}

export async function updatePayment(id: string, data: Partial<Omit<Payment, 'id'>>): Promise<void> {
  await updateDoc(doc(db, COL, id), { ...data, updatedAt: serverTimestamp() });
}

export async function deletePayment(id: string): Promise<void> {
  await deleteDoc(doc(db, COL, id));
}

export function subscribeToPayments(callback: (payments: Payment[]) => void): () => void {
  const q = query(collection(db, COL), orderBy('paymentDate', 'desc'));
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => fromDoc(d.id, d.data())));
  });
}
