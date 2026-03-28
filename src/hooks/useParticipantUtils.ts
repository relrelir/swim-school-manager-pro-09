
import { Participant, PaymentStatus, Registration, Payment, RegistrationWithDetails } from '@/types';

export const useParticipantUtils = (
  participants: Participant[], 
  payments: Payment[]
) => {
  
  // Get participant for a registration
  const getParticipantForRegistration = (registration: Registration): Participant | undefined => {
    return participants.find(p => p.id === registration.participantId);
  };

  // Get payments for a registration.
  // Prefer the pre-computed list embedded in RegistrationWithDetails — it was built in
  // the same render cycle as paidAmount/paymentStatus/effectiveRequiredAmount, so the
  // table display is always consistent with the summary cards and status badge.
  const getPaymentsForRegistration = (registration: Registration): Payment[] => {
    if ('payments' in registration) {
      return (registration as RegistrationWithDetails).payments;
    }
    return payments.filter(p => p.registrationId === registration.id);
  };

  // Get appropriate CSS class for payment status
  const getStatusClassName = (status: PaymentStatus): string => {
    switch (status) {
      case 'מלא':
        return 'text-green-800 bg-green-100 bg-opacity-50 px-2 py-1 rounded';
      case 'חלקי':
        return 'text-yellow-800 bg-yellow-100 bg-opacity-50 px-2 py-1 rounded';
      case 'יתר':
        return 'text-red-800 bg-red-100 bg-opacity-50 px-2 py-1 rounded';
      case 'מלא / הנחה':
        return 'text-green-800 bg-green-100 bg-opacity-50 px-2 py-1 rounded';
      case 'חלקי / הנחה':
        return 'text-yellow-800 bg-yellow-100 bg-opacity-50 px-2 py-1 rounded';
      case 'הנחה':
        return 'text-blue-800 bg-blue-100 bg-opacity-50 px-2 py-1 rounded';
      case 'לא שולם':
        return 'text-red-800 bg-red-100 bg-opacity-50 px-2 py-1 rounded';
      default:
        return '';
    }
  };

  return {
    getParticipantForRegistration,
    getPaymentsForRegistration,
    getStatusClassName
  };
};
