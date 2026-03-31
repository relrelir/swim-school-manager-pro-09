
import { Product, RegistrationWithDetails } from '@/types';

/**
 * Aggregates financial and occupancy totals for a list of RegistrationWithDetails.
 *
 * Expects RegistrationWithDetails[] (never plain Registration[]) so that
 * effectiveRequiredAmount and paidAmount are always pre-computed by
 * getAllRegistrationsWithDetails — the single source of truth.
 */
export const useSummaryCalculations = (registrations: RegistrationWithDetails[], product?: Product) => {
  const totalParticipants = registrations.length;
  const registrationsFilled = product ? (totalParticipants / (product.maxParticipants || 1)) * 100 : 0;

  // effectiveRequiredAmount = requiredAmount minus any approved discount (pre-computed).
  // paidAmount              = sum of all payment documents (pre-computed, never stale).
  const totalExpected = registrations.reduce((sum, reg) => sum + reg.effectiveRequiredAmount, 0);
  const totalPaid     = registrations.reduce((sum, reg) => sum + reg.paidAmount, 0);

  return {
    totalParticipants,
    registrationsFilled,
    totalExpected,
    totalPaid,
  };
};
