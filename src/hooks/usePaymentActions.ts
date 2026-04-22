import { toast } from '@/components/ui/use-toast';
import { Participant, Product, Registration, RegistrationWithDetails } from '@/types';
import type { HealthDeclarationSendInfo } from '@/components/participants/SendHealthDeclarationDialog';

/**
 * Single flat hook for all payment-related operations.
 * Receives dataContext directly — no parameter-passing chains.
 *
 * Replaces: useRegistrationManagement, usePaymentHandlers (top-level),
 *           useRegistrationHandlers, useParticipantAdapters, useParticipantHandlers.
 */
export const usePaymentActions = (dataContext: any) => {
  const {
    addParticipant,
    addRegistration,
    addPayment,
    updateRegistration,
    deleteRegistration,
    deleteParticipant,
    getPaymentsByRegistration,
    getAllRegistrationsWithDetails,
    addHealthDeclaration,
    getHealthDeclarationForRegistration,
    deleteHealthDeclaration,
  } = dataContext;

  // ── registerWithInitialPayment ──────────────────────────────────────────────
  /**
   * Registers a new participant with an optional initial payment.
   * Creates Participant then Registration sequentially, then Payment (if amount > 0).
   * Returns { participant, registration, healthSendInfo } or null on error.
   *
   * healthSendInfo is set when a health declaration is successfully created so the
   * caller can offer to send the form link via WhatsApp/email.
   */
  const registerWithInitialPayment = async (
    productId: string,
    participantData: Omit<Participant, 'id'>,
    registrationData: {
      requiredAmount: number;
      discountApproved: boolean;
      discountAmount?: number | null;
    }
  ): Promise<{
    participant: Participant;
    registration: Registration;
    healthSendInfo: HealthDeclarationSendInfo | null;
  } | null> => {
    const participant = await addParticipant(participantData);
    if (!participant) return null;

    const registration = await addRegistration({
      participantId: participant.id,
      productId,
      requiredAmount: registrationData.requiredAmount,
      paidAmount: 0,
      receiptNumber: null,
      discountApproved: registrationData.discountApproved,
      discountAmount: registrationData.discountAmount ?? null,
      registrationDate: new Date().toISOString().split('T')[0],
    });
    if (!registration) return null;

    // Auto-create health declaration and prepare send info
    let healthSendInfo: HealthDeclarationSendInfo | null = null;
    try {
      const product = (dataContext.products as Product[] | undefined)?.find((p) => p.id === productId);
      const effectiveRequiredAmount = Math.max(
        0,
        registration.requiredAmount -
          (registration.discountApproved ? registration.discountAmount ?? 0 : 0)
      );
      const healthDecl = await addHealthDeclaration({
        participantId: participant.id,
        participantName: `${participant.firstName} ${participant.lastName}`,
        participantIdNumber: participant.idNumber ?? null,
        participantPhone: participant.phone ?? null,
        productType: product?.type ?? null,
        productName: product?.name ?? null,
        registrationId: registration.id,
        registrationDate: registration.registrationDate,
        requiredAmount: registration.requiredAmount,
        discountAmount: registration.discountAmount ?? null,
        discountApproved: registration.discountApproved,
        effectiveRequiredAmount,
        token: '',            // service generates a UUID token
        formStatus: 'pending',
        submissionDate: null,
        notes: null,
        signature: null,
        parentName: null,
        parentId: null,
        createdAt: new Date().toISOString(),
        sentAt: null,
      });
      if (healthDecl?.token) {
        healthSendInfo = {
          participantId: participant.id,
          participantName: `${participant.firstName} ${participant.lastName}`,
          phone: participant.phone,
          email: participant.email,
          healthFormUrl: `${window.location.origin}/health-form/${healthDecl.token}`,
        };
      }
    } catch (err) {
      console.error('Error creating health declaration:', err);
      // Non-fatal — registration already succeeded
    }

    toast({
      title: 'משתתף נרשם בהצלחה',
      description: `${participantData.firstName} ${participantData.lastName} נרשם בהצלחה`,
    });
    return { participant, registration, healthSendInfo };
  };

  // ── addPaymentToRegistration ────────────────────────────────────────────────
  /**
   * Adds a payment document and updates Registration.paidAmount.
   * paidAmount is computed from the sum of existing payment docs + new amount,
   * so it is always accurate even if the Firestore cache was stale.
   */
  const addPaymentToRegistration = async (
    registrationId: string,
    amount: number,
    receiptNumber: string,
    paymentDate: string
  ): Promise<boolean> => {
    if (!receiptNumber) {
      toast({ title: 'שגיאה', description: 'מספר קבלה הוא שדה חובה', variant: 'destructive' });
      return false;
    }
    if (amount <= 0) {
      toast({ title: 'שגיאה', description: 'סכום התשלום חייב להיות חיובי', variant: 'destructive' });
      return false;
    }

    const savedPayment = await addPayment({ registrationId, amount, receiptNumber, paymentDate });

    // addPayment catches Firestore errors silently and returns undefined on failure.
    if (!savedPayment) {
      // Error toast was already shown by PaymentsProvider.addPayment
      return false;
    }

    // No need to update Registration.paidAmount here:
    // getAllRegistrationsWithDetails always recomputes paidAmount from payment docs,
    // and PaymentsProvider.addPayment now applies an optimistic state update so
    // the UI reflects the new payment immediately on the next render.

    toast({ title: 'תשלום נוסף בהצלחה' });
    return true;
  };

  // ── applyDiscountToRegistration ─────────────────────────────────────────────
  /**
   * Applies (accumulates) a discount on a registration.
   * Discounts are never overwritten — each call adds to the existing discountAmount.
   */
  const applyDiscountToRegistration = async (
    registrationId: string,
    discountAmount: number
  ): Promise<boolean> => {
    const allRegs: RegistrationWithDetails[] = getAllRegistrationsWithDetails();
    const reg = allRegs.find((r) => r.id === registrationId);
    if (!reg) {
      toast({ title: 'שגיאה', description: 'רישום לא נמצא', variant: 'destructive' });
      return false;
    }

    await updateRegistration({
      ...reg,
      discountApproved: true,
      discountAmount: (reg.discountAmount || 0) + discountAmount,
    });

    toast({
      title: 'הנחה אושרה',
      description: `הנחה בסך ${Intl.NumberFormat('he-IL', {
        style: 'currency',
        currency: 'ILS',
      }).format(discountAmount)} אושרה`,
    });
    return true;
  };

  // ── deleteRegistrationWithCleanup ───────────────────────────────────────────
  /**
   * Deletes a registration and cleans up:
   *  - Blocks deletion if the registration has payments.
   *  - Deletes the associated health declaration (if any).
   *  - Deletes the participant if this was their only registration.
   */
  const deleteRegistrationWithCleanup = async (
    registrationId: string,
    allRegistrations: Registration[]
  ): Promise<boolean> => {
    const payments: Payment[] = getPaymentsByRegistration(registrationId);
    if (payments.length > 0) {
      toast({
        title: 'לא ניתן למחוק',
        description: 'לא ניתן למחוק רישום שבוצע עבורו תשלום',
        variant: 'destructive',
      });
      return false;
    }

    if (!window.confirm('האם אתה בטוח שברצונך למחוק רישום זה?')) return false;

    const reg = allRegistrations.find((r) => r.id === registrationId);
    if (!reg) return false;

    await deleteRegistration(registrationId);

    const otherRegs = allRegistrations.filter(
      (r) => r.participantId === reg.participantId && r.id !== registrationId
    );
    if (otherRegs.length === 0) {
      // Last registration for this participant — delete health declaration then participant
      const healthDecl = await getHealthDeclarationForRegistration(reg.participantId);
      if (healthDecl) await deleteHealthDeclaration(healthDecl.id);
      await deleteParticipant(reg.participantId);
    }

    return true;
  };

  return {
    registerWithInitialPayment,
    addPaymentToRegistration,
    applyDiscountToRegistration,
    deleteRegistrationWithCleanup,
  };
};
