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
import { Registration, PaymentStatus } from '@/types';

const COL = 'registrations';

function fromDoc(id: string, data: Record<string, unknown>): Registration {
  return {
    id,
    participantId: data.participantId as string,
    productId: data.productId as string,
    registrationDate: (data.registrationDate as string) ?? new Date().toISOString().split('T')[0],
    requiredAmount: data.requiredAmount as number,
    paidAmount: (data.paidAmount as number) ?? 0,
    discountApproved: (data.discountApproved as boolean) ?? false,
    discountAmount: (data.discountAmount as number | null) ?? null,
    receiptNumber: (data.receiptNumber as string | null) ?? null,
  };
}

export async function getRegistrations(): Promise<Registration[]> {
  const snap = await getDocs(query(collection(db, COL), orderBy('registrationDate', 'desc')));
  return snap.docs.map((d) => fromDoc(d.id, d.data()));
}

export async function getRegistration(id: string): Promise<Registration | null> {
  const snap = await getDoc(doc(db, COL, id));
  return snap.exists() ? fromDoc(snap.id, snap.data()) : null;
}

export async function getRegistrationsByProduct(productId: string): Promise<Registration[]> {
  const q = query(collection(db, COL), where('productId', '==', productId));
  const snap = await getDocs(q);
  return snap.docs.map((d) => fromDoc(d.id, d.data()));
}

export async function getRegistrationsByParticipant(participantId: string): Promise<Registration[]> {
  const q = query(collection(db, COL), where('participantId', '==', participantId));
  const snap = await getDocs(q);
  return snap.docs.map((d) => fromDoc(d.id, d.data()));
}

export async function createRegistration(data: Omit<Registration, 'id'>): Promise<Registration> {
  const ref = await addDoc(collection(db, COL), { ...data, createdAt: serverTimestamp() });
  return { id: ref.id, ...data };
}

export async function updateRegistration(id: string, data: Partial<Omit<Registration, 'id'>>): Promise<void> {
  await updateDoc(doc(db, COL, id), { ...data, updatedAt: serverTimestamp() });
}

export async function deleteRegistration(id: string): Promise<void> {
  await deleteDoc(doc(db, COL, id));
}

export function subscribeToRegistrations(callback: (registrations: Registration[]) => void): () => void {
  const q = query(collection(db, COL), orderBy('registrationDate', 'desc'));
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => fromDoc(d.id, d.data())));
  });
}

export function calculatePaymentStatus(registration: Registration): PaymentStatus {
  const { paidAmount, requiredAmount, discountApproved, discountAmount } = registration;
  const effectiveRequired = discountApproved && discountAmount
    ? Math.max(0, requiredAmount - discountAmount)
    : requiredAmount;

  if (paidAmount > effectiveRequired) {
    return 'יתר';
  }
  if (paidAmount >= effectiveRequired) {
    return discountApproved ? 'מלא / הנחה' : 'מלא';
  }
  if (paidAmount > 0) {
    return discountApproved ? 'חלקי / הנחה' : 'חלקי';
  }
  if (discountApproved && discountAmount && discountAmount >= requiredAmount) {
    return 'הנחה';
  }
  return 'לא שולם';
}
