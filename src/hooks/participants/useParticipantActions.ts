import { useState } from 'react';
import { Registration, Participant } from '@/types';
import { usePaymentActions } from '../usePaymentActions';
import { useParticipantHealth } from '../useParticipantHealth';
import type { HealthDeclarationSendInfo } from '@/components/participants/SendHealthDeclarationDialog';

/**
 * Participant action handlers — simplified to a single layer.
 *
 * Uses usePaymentActions directly instead of the former 5-layer chain:
 *   useRegistrationManagement → usePaymentHandlers → useRegistrationHandlers
 *   → useParticipantAdapters → useParticipantHandlers
 */
export const useParticipantActions = (
  productId: string | undefined,
  dataContext: any,
  participants: Participant[],
  registrations: Registration[],
  product: any,
  setRefreshTrigger: (value: React.SetStateAction<number>) => void,
  newParticipant: any,
  registrationData: any,
  getParticipantForRegistration: (registration: Registration) => Participant | undefined,
  setIsAddParticipantOpen: (value: boolean) => void,
  setIsAddPaymentOpen: (value: boolean) => void,
  setNewPayment: (value: any) => void,
  newPayment: any,
  resetForm: () => void,
  currentRegistration: Registration | null
) => {
  const { updateParticipant, getHealthDeclarationForRegistration, addHealthDeclaration } =
    dataContext;

  const {
    registerWithInitialPayment,
    addPaymentToRegistration,
    applyDiscountToRegistration,
    deleteRegistrationWithCleanup,
  } = usePaymentActions(dataContext);

  // pendingHealthSend: shown after a new registration so the user can send the
  // health-form link via WhatsApp / email / copy.
  const [pendingHealthSend, setPendingHealthSend] = useState<HealthDeclarationSendInfo | null>(null);

  // ── Health declaration handling ────────────────────────────────────────────
  const { handleOpenHealthForm, handleUpdateHealthApproval } = useParticipantHealth(
    getHealthDeclarationForRegistration,
    addHealthDeclaration,
    async (id: string, data: Partial<Participant>): Promise<Participant> => {
      const participantToUpdate = {
        id,
        firstName: data.firstName || '',
        lastName: data.lastName || '',
        phone: data.phone || '',
        healthApproval: data.healthApproval !== undefined ? data.healthApproval : false,
        idNumber: data.idNumber || '',
        ...data,
      } as Participant;
      await updateParticipant(participantToUpdate);
      return participantToUpdate;
    },
    participants,
    registrations
  );

  // ── handleAddParticipant ───────────────────────────────────────────────────
  const handleAddParticipant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productId) return;

    const result = await registerWithInitialPayment(productId, newParticipant, registrationData);
    if (!result) return;   // error toast already shown inside registerWithInitialPayment

    // healthSendInfo is set when the health declaration was created successfully
    if (result.healthSendInfo) {
      setPendingHealthSend(result.healthSendInfo);
    }

    resetForm();
    setIsAddParticipantOpen(false);
    setRefreshTrigger((prev) => prev + 1);
  };

  // ── handleAddPayment ───────────────────────────────────────────────────────
  const handleAddPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    const registrationId = newPayment.registrationId || currentRegistration?.id;
    if (!registrationId) return;

    const success = await addPaymentToRegistration(
      registrationId,
      newPayment.amount,
      newPayment.receiptNumber,
      newPayment.paymentDate
    );
    if (success) {
      setIsAddPaymentOpen(false);
      setNewPayment({
        amount: 0,
        receiptNumber: '',
        paymentDate: new Date().toISOString().split('T')[0],
      });
    }
  };

  // ── handleApplyDiscount ────────────────────────────────────────────────────
  const handleApplyDiscount = async (discountAmount: number, registrationId?: string) => {
    const regId = registrationId || currentRegistration?.id;
    if (!regId) return;
    const success = await applyDiscountToRegistration(regId, discountAmount);
    if (success) setIsAddPaymentOpen(false);
  };

  // ── handleDeleteRegistration ───────────────────────────────────────────────
  const handleDeleteRegistration = async (registrationId: string) => {
    await deleteRegistrationWithCleanup(registrationId, registrations);
    setRefreshTrigger((prev) => prev + 1);
  };

  return {
    handleAddParticipant,
    handleAddPayment,
    handleApplyDiscount,
    handleDeleteRegistration,
    handleUpdateHealthApproval,
    handleOpenHealthForm,
    pendingHealthSend,
    clearPendingHealthSend: () => setPendingHealthSend(null),
  };
};
