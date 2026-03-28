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
    registrationId: (data.registrationId as string) ?? '',
    // amount may be stored as string in legacy docs — coerce to number
    amount: Number(data.amount) || 0,
    // paymentDate may be missing on legacy docs — fall back to empty string so
    // the document is still included (ordering is done in JS, not Firestore)
    paymentDate: (data.paymentDate as string) ?? '',
    receiptNumber: (data.receiptNumber as string) ?? '',
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
  return payments.sort((a, b) => (b.paymentDate || '').localeCompare(a.paymentDate || ''));
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
  // Do NOT use orderBy('paymentDate') here — Firestore silently excludes any
  // document that is missing the ordered field.  Legacy payment docs without
  // paymentDate would become invisible, causing paidAmount to be under-counted
  // and payment statuses to show "חלקי" even when fully paid.
  // We fetch the whole collection and sort client-side instead.
  return onSnapshot(collection(db, COL), (snap) => {
    const payments = snap.docs.map((d) => fromDoc(d.id, d.data()));
    // Sort descending by date; empty/missing dates sort last
    payments.sort((a, b) => (b.paymentDate || '').localeCompare(a.paymentDate || ''));
    callback(payments);
  });
}
