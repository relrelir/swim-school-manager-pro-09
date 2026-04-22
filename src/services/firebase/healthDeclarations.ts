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
    participantName: (data.participantName as string | null) ?? null,
    participantIdNumber: (data.participantIdNumber as string | null) ?? null,
    participantPhone: (data.participantPhone as string | null) ?? null,
    termsSignature: (data.termsSignature as string | null) ?? null,
    termsSignedDate: (data.termsSignedDate as string | null) ?? null,
    productType: (data.productType as HealthDeclaration['productType']) ?? null,
    productName: (data.productName as string | null) ?? null,
    afterCare: (data.afterCare as boolean | null) ?? null,
    registrationId: (data.registrationId as string | null) ?? null,
    registrationDate: (data.registrationDate as string | null) ?? null,
    requiredAmount: (data.requiredAmount as number | null) ?? null,
    discountAmount: (data.discountAmount as number | null) ?? null,
    discountApproved: (data.discountApproved as boolean | null) ?? null,
    effectiveRequiredAmount: (data.effectiveRequiredAmount as number | null) ?? null,
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

export async function createHealthDeclarationLink(
  participantId: string,
  participantData?: { name: string; idNumber: string; phone: string },
  productContext?: { productType?: string; productName?: string },
  registrationContext?: {
    registrationId?: string;
    registrationDate?: string;
    requiredAmount?: number;
    discountAmount?: number | null;
    discountApproved?: boolean;
    effectiveRequiredAmount?: number;
  }
): Promise<HealthDeclaration> {
  const token = uuidv4();
  const displayFields: Record<string, unknown> = {
    participantName: participantData?.name ?? null,
    participantIdNumber: participantData?.idNumber ?? null,
    participantPhone: participantData?.phone ?? null,
  };
  // Only overwrite product context if explicitly provided — avoids clearing existing values
  if (productContext) {
    displayFields.productType = productContext.productType ?? null;
    displayFields.productName = productContext.productName ?? null;
  }
  if (registrationContext) {
    displayFields.registrationId = registrationContext.registrationId ?? null;
    displayFields.registrationDate = registrationContext.registrationDate ?? null;
    displayFields.requiredAmount = registrationContext.requiredAmount ?? null;
    displayFields.discountAmount = registrationContext.discountAmount ?? null;
    displayFields.discountApproved = registrationContext.discountApproved ?? null;
    displayFields.effectiveRequiredAmount = registrationContext.effectiveRequiredAmount ?? null;
  }

  const termsReset = { termsSignature: null, termsSignedDate: null, afterCare: null };

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
      ...termsReset,
      ...displayFields,
    });
    return { ...existing, token, formStatus: 'pending', ...termsReset, ...displayFields };
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
    ...termsReset,
    createdAt: serverTimestamp(),
    ...displayFields,
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
    ...displayFields,
  };
}

/**
 * Atomically marks the health declaration as signed AND sets participant.healthApproval + termsApproval = true.
 * Uses a Firestore batch to avoid race conditions.
 */
export async function submitHealthForm(
  token: string,
  formData: {
    signature: string;
    termsSignature: string;
    notes?: string;
    parentName?: string;
    parentId?: string;
    afterCare?: boolean;
  }
): Promise<boolean> {
  const declaration = await getHealthDeclarationByToken(token);
  if (!declaration) return false;

  const batch = writeBatch(db);

  batch.update(doc(db, COL, declaration.id), {
    formStatus: 'signed',
    submissionDate: new Date().toISOString(),
    signature: formData.signature,
    notes: formData.notes ?? null,
    parentName: formData.parentName ?? null,
    parentId: formData.parentId ?? null,
    termsSignature: formData.termsSignature,
    termsSignedDate: new Date().toISOString(),
    afterCare: formData.afterCare ?? null,
  });

  batch.update(doc(db, 'participants', declaration.participantId), {
    healthApproval: true,
    termsApproval: true,
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
