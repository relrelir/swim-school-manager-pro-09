
import { useState } from 'react';
import { Product, Participant, Registration, RegistrationWithDetails } from '@/types';

/**
 * Hook for managing participant-related state
 */
export const useParticipantState = (product?: Product) => {
  const [isAddParticipantOpen, setIsAddParticipantOpen] = useState(false);
  const [isAddPaymentOpen, setIsAddPaymentOpen] = useState(false);
  const [isLinkDialogOpen, setIsLinkDialogOpen] = useState(false);
  const [currentRegistration, setCurrentRegistration] = useState<RegistrationWithDetails | null>(null);
  const [currentHealthDeclaration, setCurrentHealthDeclaration] = useState<{
    registrationId: string;
    participantName: string;
    phone: string;
    declaration?: any;
  } | null>(null);
  const [newParticipant, setNewParticipant] = useState<Omit<Participant, 'id'>>({
    firstName: '',
    lastName: '',
    phone: '',
    idNumber: '',
    healthApproval: false
  });
  const [registrationData, setRegistrationData] = useState({
    requiredAmount: product ? (product.effectivePrice ?? product.price) : 0,
    discountApproved: false,
    discountAmount: null as number | null
  });
  const [newPayment, setNewPayment] = useState({
    amount: 0,
    receiptNumber: '',
    paymentDate: new Date().toISOString().split('T')[0],
  });

  // Update registration data when product changes
  const effectiveProductPrice = product ? (product.effectivePrice ?? product.price) : 0;
  if (product && registrationData.requiredAmount !== effectiveProductPrice) {
    setRegistrationData(prev => ({
      ...prev,
      requiredAmount: effectiveProductPrice
    }));
  }

  // Reset form helper
  const resetForm = () => {
    setNewParticipant({
      firstName: '',
      lastName: '',
      phone: '',
      idNumber: '',
      healthApproval: false
    });
    setRegistrationData({
      requiredAmount: product ? (product.effectivePrice ?? product.price) : 0,
      discountApproved: false,
      discountAmount: null as number | null,
    });
  };

  return {
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
    resetForm
  };
};
