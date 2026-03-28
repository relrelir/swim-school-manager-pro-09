
import { Product, Registration, RegistrationWithDetails } from '@/types';

export const useSummaryCalculations = (registrations: RegistrationWithDetails[], product?: Product) => {
  const totalParticipants = registrations.length;
  const registrationsFilled = product ? (totalParticipants / (product.maxParticipants || 1)) * 100 : 0;

  // effectiveRequiredAmount and paidAmount are both pre-computed by getAllRegistrationsWithDetails:
  // - effectiveRequiredAmount = requiredAmount minus any approved discount
  // - paidAmount              = sum of all payment docs (never stale)
  const totalExpected = registrations.reduce((sum, reg) => sum + reg.effectiveRequiredAmount, 0);
  const totalPaid     = registrations.reduce((sum, reg) => sum + reg.paidAmount, 0);

  return {
    totalParticipants,
    registrationsFilled,
    totalExpected,
    totalPaid
  };
};
