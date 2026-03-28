
import { useState } from 'react';
import { Registration, Participant, HealthDeclaration, Payment, PaymentStatus, Product, RegistrationWithDetails } from '@/types';
import { useParticipantUtils } from '../useParticipantUtils';
import { useParticipantState } from '../useParticipantState';

/**
 * Core hook for participant data and state management.
 *
 * Uses getAllRegistrationsWithDetails() as the single source of truth so that
 * paidAmount is always computed from actual payment documents (never the stale
 * Firestore field), and paymentStatus is always accurate.
 */
export const useParticipantCore = (
  productId: string | undefined,
  dataContext: any
) => {
  const {
    products,
    participants,
    payments,
    getRegistrationsByProduct,           // kept for action hooks that still need it
    calculatePaymentStatus: _calculatePaymentStatus,
    getHealthDeclarationForRegistration,
    getAllRegistrationsWithDetails,
  } = dataContext;

  // ── Product ──────────────────────────────────────────────────────────────────
  const product: Product | undefined = productId
    ? (products as Product[]).find((p) => p.id === productId)
    : undefined;

  // ── Registrations ────────────────────────────────────────────────────────────
  // getAllRegistrationsWithDetails() computes paidAmount from payment documents
  // (not from the stale Firestore field) and pre-computes paymentStatus.
  // Filtering here avoids iterating the full collection on every render cell.
  const allWithDetails: RegistrationWithDetails[] = getAllRegistrationsWithDetails();
  const registrations: RegistrationWithDetails[] = productId
    ? allWithDetails.filter((r) => r.productId === productId)
    : [];

  // ── Summary calculations ─────────────────────────────────────────────────────
  const totalParticipants = registrations.length;
  const registrationsFilled = product
    ? (totalParticipants / (product.maxParticipants || 1)) * 100
    : 0;
  const totalExpected = registrations.reduce((sum, reg) => sum + reg.effectiveRequiredAmount, 0);
  const totalPaid = registrations.reduce((sum, reg) => sum + reg.paidAmount, 0);

  // ── calculatePaymentStatus ───────────────────────────────────────────────────
  // Returns the pre-computed status from RegistrationWithDetails when available,
  // falls back to computing from payments for raw Registration objects (e.g. new
  // registrations that haven't yet appeared in getAllRegistrationsWithDetails).
  const calculatePaymentStatus = (registration: Registration): PaymentStatus => {
    if ('paymentStatus' in registration) {
      return (registration as RegistrationWithDetails).paymentStatus;
    }
    const regPayments: Payment[] = (payments as Payment[]).filter(
      (p) => p.registrationId === registration.id
    );
    const actualPaidAmount = regPayments.reduce((pSum, p) => pSum + p.amount, 0);
    return _calculatePaymentStatus({ ...registration, paidAmount: actualPaidAmount });
  };

  // ── Participant utilities ────────────────────────────────────────────────────
  const {
    getParticipantForRegistration,
    getPaymentsForRegistration,
    getStatusClassName,
  } = useParticipantUtils(participants, payments);

  // ── refreshTrigger (kept for action-hook compatibility) ──────────────────────
  // Real-time listeners make this unnecessary for data freshness, but action hooks
  // still call setRefreshTrigger after mutations — harmless to keep.
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // ── Dialog / form state ───────────────────────────────────────────────────────
  const {
    isAddParticipantOpen,
    setIsAddParticipantOpen,
    isAddPaymentOpen,
    setIsAddPaymentOpen,
    isLinkDialogOpen,
    setIsLinkDialogOpen,
    currentRegistration,
    setCurrentRegistration,
    currentHealthDeclaration,
    setCurrentHealthDeclaration,
    newParticipant,
    setNewParticipant,
    registrationData,
    setRegistrationData,
    newPayment,
    setNewPayment,
    resetForm,
  } = useParticipantState(product);

  return {
    // Data
    participants,
    product,
    registrations,
    refreshTrigger,
    setRefreshTrigger,
    totalParticipants,
    registrationsFilled,
    totalExpected,
    totalPaid,

    // Dialog / form state
    isAddParticipantOpen,
    setIsAddParticipantOpen,
    isAddPaymentOpen,
    setIsAddPaymentOpen,
    isLinkDialogOpen,
    setIsLinkDialogOpen,
    currentRegistration,
    setCurrentRegistration,
    currentHealthDeclaration,
    setCurrentHealthDeclaration,
    newParticipant,
    setNewParticipant,
    registrationData,
    setRegistrationData,
    newPayment,
    setNewPayment,

    // Functions
    resetForm,
    getParticipantForRegistration,
    getPaymentsForRegistration,
    getStatusClassName,
    calculatePaymentStatus,
    getHealthDeclarationForRegistration,
  };
};
