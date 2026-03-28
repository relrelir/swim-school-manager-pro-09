
import { useState, useEffect } from 'react';
import { Participant, Product } from '@/types';

export const useParticipantForm = (product?: Product) => {
  const [isAddParticipantOpen, setIsAddParticipantOpen] = useState(false);
  const [isAddPaymentOpen, setIsAddPaymentOpen] = useState(false);
  
  const [newParticipant, setNewParticipant] = useState<Omit<Participant, 'id'>>({
    firstName: '',
    lastName: '',
    idNumber: '',
    phone: '',
    healthApproval: false,
  });
  
  const [registrationData, setRegistrationData] = useState({
    requiredAmount: product?.price || 0,
    paidAmount: 0,
    receiptNumber: '',
    discountApproved: false,
    discountAmount: null as number | null,
  });
  
  const [newPayment, setNewPayment] = useState({
    amount: 0,
    receiptNumber: '',
    paymentDate: new Date().toISOString().substring(0, 10),
  });

  // Update requiredAmount whenever product changes
  useEffect(() => {
    if (product?.price) {
      setRegistrationData(prev => ({
        ...prev,
        requiredAmount: product.price,
      }));
    }
  }, [product]);

  // Reset form data
  const resetForm = () => {
    setNewParticipant({
      firstName: '',
      lastName: '',
      idNumber: '',
      phone: '',
      healthApproval: false,
    });
    
    setRegistrationData({
      requiredAmount: product?.price || 0,
      paidAmount: 0,
      receiptNumber: '',
      discountApproved: false,
    discountAmount: null as number | null,
    });
  };

  return {
    isAddParticipantOpen,
    setIsAddParticipantOpen,
    isAddPaymentOpen,
    setIsAddPaymentOpen,
    newParticipant,
    setNewParticipant,
    registrationData,
    setRegistrationData,
    newPayment,
    setNewPayment,
    resetForm,
  };
};
