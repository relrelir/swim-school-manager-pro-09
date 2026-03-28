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
    // Number() converts undefined/null/string to a real number; || 0 guards NaN.
    requiredAmount: Number(data.requiredAmount) || 0,
    paidAmount: Number(data.paidAmount) || 0,
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

export async function updateRegistration(id: string, data: any): Promise<void> {
  // Whitelist only known Registration fields. This prevents nested objects from
  // RegistrationWithDetails (product, participant, season …) from reaching Firestore,
  // and converts undefined optional fields to null (Firestore rejects undefined).
  const safeData: Record<string, unknown> = {
    updatedAt: serverTimestamp(),
  };
  if (data.participantId  !== undefined) safeData.participantId  = data.participantId;
  if (data.productId      !== undefined) safeData.productId      = data.productId;
  if (data.registrationDate !== undefined) safeData.registrationDate = data.registrationDate;
  if (data.requiredAmount !== undefined) safeData.requiredAmount = data.requiredAmount;
  if (data.paidAmount     !== undefined) safeData.paidAmount     = data.paidAmount;
  if (data.discountApproved !== undefined) safeData.discountApproved = data.discountApproved;
  safeData.discountAmount = data.discountAmount ?? null;
  safeData.receiptNumber  = data.receiptNumber  ?? null;
  await updateDoc(doc(db, COL, id), safeData);
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
  // Defensive coercion: Firestore legacy docs may store amounts as strings or omit fields.
  const paidAmount = Number(registration.paidAmount) || 0;
  const requiredAmount = Number(registration.requiredAmount) || 0;
  const { discountApproved, discountAmount } = registration;
  const effectiveRequired = discountApproved && discountAmount
    ? Math.max(0, requiredAmount - discountAmount)
    : requiredAmount;

  // Full discount (100%) with no actual payment → dedicated 'הנחה' status
  // Must be checked before the >= comparison since effectiveRequired is 0 in this case
  if (paidAmount === 0 && discountApproved && discountAmount && discountAmount >= requiredAmount) {
    return 'הנחה';
  }
  if (paidAmount > effectiveRequired) {
    return 'יתר';
  }
  if (paidAmount >= effectiveRequired) {
    return discountApproved ? 'מלא / הנחה' : 'מלא';
  }
  if (paidAmount > 0) {
    return discountApproved ? 'חלקי / הנחה' : 'חלקי';
  }
  return 'לא שולם';
}
