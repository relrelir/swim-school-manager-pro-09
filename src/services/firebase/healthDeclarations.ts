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
  onSnapshot,
  writeBatch,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '@/config/firebase';
import { HealthDeclaration } from '@/types';
import { v4 as uuidv4 } from 'uuid';

const COL = 'healthDeclarations';

function fromDoc(id: string, data: Record<string, unknown>): HealthDeclaration {
  return {
    id,
    participantId: data.participantId as string,
    token: data.token as string,
    formStatus: (data.formStatus as HealthDeclaration['formStatus']) ?? 'pending',
    submissionDate: (data.submissionDate as string | null) ?? null,
    notes: (data.notes as string | null) ?? null,
    signature: (data.signature as string | null) ?? null,
    parentName: (data.parentName as string | null) ?? null,
    parentId: (data.parentId as string | null) ?? null,
    createdAt: (data.createdAt as string) ?? '',
    sentAt: (data.sentAt as string | null) ?? null,
  };
}

export async function getHealthDeclarations(): Promise<HealthDeclaration[]> {
  const snap = await getDocs(collection(db, COL));
  return snap.docs.map((d) => fromDoc(d.id, d.data()));
}

export async function getHealthDeclarationByParticipant(participantId: string): Promise<HealthDeclaration | null> {
  const q = query(collection(db, COL), where('participantId', '==', participantId));
  const snap = await getDocs(q);
  if (snap.empty) return null;
  const d = snap.docs[0];
  return fromDoc(d.id, d.data());
}

export async function getHealthDeclarationByToken(token: string): Promise<HealthDeclaration | null> {
  const q = query(collection(db, COL), where('token', '==', token));
  const snap = await getDocs(q);
  if (snap.empty) return null;
  const d = snap.docs[0];
  return fromDoc(d.id, d.data());
}

export async function createHealthDeclarationLink(participantId: string): Promise<HealthDeclaration> {
  const token = uuidv4();
  // Check if one already exists and reset it
  const existing = await getHealthDeclarationByParticipant(participantId);
  if (existing) {
    await updateDoc(doc(db, COL, existing.id), {
      token,
      formStatus: 'pending',
      submissionDate: null,
      notes: null,
      signature: null,
      parentName: null,
      parentId: null,
      sentAt: null,
    });
    return { ...existing, token, formStatus: 'pending' };
  }

  const ref = await addDoc(collection(db, COL), {
    participantId,
    token,
    formStatus: 'pending',
    submissionDate: null,
    notes: null,
    signature: null,
    parentName: null,
    parentId: null,
    sentAt: null,
    createdAt: serverTimestamp(),
  });
  return {
    id: ref.id,
    participantId,
    token,
    formStatus: 'pending',
    submissionDate: null,
    notes: null,
    signature: null,
    parentName: null,
    parentId: null,
    createdAt: new Date().toISOString(),
    sentAt: null,
  };
}

/**
 * Atomically marks the health declaration as signed AND sets participant.healthApproval = true.
 * Uses a Firestore batch to avoid the race condition that existed in the original code.
 */
export async function submitHealthForm(
  token: string,
  formData: {
    signature: string;
    notes?: string;
    parentName?: string;
    parentId?: string;
  }
): Promise<boolean> {
  const declaration = await getHealthDeclarationByToken(token);
  if (!declaration) return false;

  const batch = writeBatch(db);

  // Update health declaration
  batch.update(doc(db, COL, declaration.id), {
    formStatus: 'signed',
    submissionDate: new Date().toISOString(),
    signature: formData.signature,
    notes: formData.notes ?? null,
    parentName: formData.parentName ?? null,
    parentId: formData.parentId ?? null,
  });

  // Atomically update participant health approval
  batch.update(doc(db, 'participants', declaration.participantId), {
    healthApproval: true,
    updatedAt: serverTimestamp(),
  });

  await batch.commit();
  return true;
}

export async function updateHealthDeclaration(
  id: string,
  data: Partial<Omit<HealthDeclaration, 'id'>>
): Promise<void> {
  await updateDoc(doc(db, COL, id), { ...data, updatedAt: serverTimestamp() });
}

export async function deleteHealthDeclaration(id: string): Promise<void> {
  await deleteDoc(doc(db, COL, id));
}

export function subscribeToHealthDeclarations(callback: (declarations: HealthDeclaration[]) => void): () => void {
  return onSnapshot(collection(db, COL), (snap) => {
    callback(snap.docs.map((d) => fromDoc(d.id, d.data())));
  });
}
