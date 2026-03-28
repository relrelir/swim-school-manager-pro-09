
import { Participant, PaymentStatus, Registration, Payment } from '@/types';

export const useParticipantUtils = (
  participants: Participant[], 
  payments: Payment[]
) => {
  
  // Get participant for a registration
  const getParticipantForRegistration = (registration: Registration): Participant | undefined => {
    return participants.find(p => p.id === registration.participantId);
  };

  // Get payments for a registration
  const getPaymentsForRegistration = (registration: Registration): Payment[] => {
    return payments.filter(payment => payment.registrationId === registration.id);
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
