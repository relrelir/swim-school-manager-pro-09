import { Registration, Payment } from '@/types';

export interface RegistrationFinancials {
  /** Amount still owed after approved discount is applied */
  effectiveRequired: number;
  /** Approved discount amount (0 when no discount) */
  discountAmount: number;
  /**
   * Total paid.
   * New registrations: sum of payment documents (initial payment is also in a doc).
   * Legacy registrations: payment docs + any undocumented initial amount stored in
   * registration.paidAmount that is not yet covered by the payment docs total.
   */
  totalPaid: number;
  /** Remaining balance: effectiveRequired − totalPaid (negative = overpaid) */
  balance: number;
}

/**
 * Single source of truth for per-registration financial math.
 *
 * Pure function — no hooks, no side-effects. Safe to call from React hooks,
 * context providers, utility functions, and tests alike.
 *
 * All consumers (DataContext, useSummaryCalculations, Dashboard, Report, Season /
 * Product pages) must call this function so the numbers are always identical.
 */
export function calcRegistrationFinancials(
  registration: Registration,
  payments: Payment[]
): RegistrationFinancials {
  // Discount only counts when explicitly approved
  const discountAmount =
    registration.discountApproved && registration.discountAmount
      ? Number(registration.discountAmount)
      : 0;

  const effectiveRequired = Math.max(0, (Number(registration.requiredAmount) || 0) - discountAmount);

  // Payment documents are the authoritative source.
  // For new registrations, the initial payment is saved as both registration.paidAmount
  // AND a payment document, so payment docs are the complete record.
  // For legacy registrations (no payment docs for the initial payment), we add the
  // registration.paidAmount as a base so it is not lost when new payment docs are added.
  const paymentDocsTotal = payments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
  const registrationPaidAmount = Number(registration.paidAmount) || 0;

  // If payment docs exist, check whether the initial registration payment is already
  // covered by a doc (new-style) or not (legacy). We detect legacy by checking if
  // the doc total is less than the stored paidAmount — meaning the original payment
  // was never backed by a doc and must be added separately.
  // Note: for new-style registrations the initial payment IS in a doc, so
  // paymentDocsTotal >= registrationPaidAmount and no extra amount is added.
  const legacyUndocumentedBase =
    payments.length > 0
      ? Math.max(0, registrationPaidAmount - paymentDocsTotal)
      : registrationPaidAmount;

  const totalPaid = paymentDocsTotal + legacyUndocumentedBase;

  const balance = effectiveRequired - totalPaid;

  return { effectiveRequired, discountAmount, totalPaid, balance };
}
