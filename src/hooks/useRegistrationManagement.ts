import { useState } from 'react';
import { Registration, Participant, Payment } from '@/types';
import type { HealthDeclarationSendInfo } from '@/components/participants/SendHealthDeclarationDialog';
import { usePaymentHandlers } from './usePaymentHandlers';
import { useRegistrationHandlers } from './useRegistrationHandlers';

export const useRegistrationManagement = (
  product: any,
  productId: string | undefined,
  participants: Participant[],
  addParticipant: (participant: Omit<Participant, 'id'>) => Promise<Participant | undefined> | void,
  addRegistration: (registration: Omit<Registration, 'id'>) => Promise<Registration | undefined> | void,
  updateRegistration: (registration: Registration) => void,
  deleteRegistration: (id: string) => void,
  addPayment: (payment: Omit<Payment, 'id'>) => Promise<Payment | undefined> | void,
  getPaymentsByRegistration: (registrationId: string) => any[],
  getRegistrationsByProduct: (productId: string) => Registration[],
  updateParticipant: (participant: Participant) => void,
  addHealthDeclaration: (declaration: Omit<any, 'id'>) => void
) => {
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [pendingHealthSend, setPendingHealthSend] = useState<HealthDeclarationSendInfo | null>(null);

  // Import sub-hooks
  const {
    currentRegistration,
    setCurrentRegistration,
    handleAddPayment: baseHandleAddPayment,
    handleApplyDiscount: baseHandleApplyDiscount
  } = usePaymentHandlers(addPayment, updateRegistration, getRegistrationsByProduct);
  
  const {
    handleAddParticipant: baseHandleAddParticipant,
    handleDeleteRegistration: baseHandleDeleteRegistration,
  } = useRegistrationHandlers(
    addParticipant,
    addRegistration,
    updateParticipant,
    deleteRegistration,
    addPayment,
    getPaymentsByRegistration,
    getRegistrationsByProduct
  );

  // Handler for adding a new participant with health declaration
  const handleAddParticipant = async (
    e: React.FormEvent, 
    newParticipant: any, 
    registrationData: any, 
    resetForm: () => void, 
    setIsAddParticipantOpen: (open: boolean) => void,
    getParticipantForRegistration: (registration: Registration) => Participant | undefined
  ) => {
    e.preventDefault();
    
    if (!productId) return [];
    
    const result = await baseHandleAddParticipant(
      e, 
      productId,
      newParticipant,
      registrationData,
      resetForm,
      setIsAddParticipantOpen
    );
    
    if (result && result.length > 0) {
      // Find the new registration (should be the last one added)
      const newRegistration = result[result.length - 1];

      // Auto-create health declaration link for the new participant
      if (newRegistration) {
        const participant = getParticipantForRegistration(newRegistration);
        if (participant) {
          try {
            const healthDecl = await addHealthDeclaration({
              participantId: participant.id,
              token: '',
              formStatus: 'pending',
              submissionDate: null,
              notes: null,
              signature: null,
              parentName: null,
              parentId: null,
              createdAt: new Date().toISOString(),
              sentAt: null,
            });
            if (healthDecl) {
              const healthFormUrl = `${window.location.origin}/health-form/${healthDecl.token}`;
              setPendingHealthSend({
                participantId: participant.id,
                participantName: `${participant.firstName} ${participant.lastName}`,
                phone: participant.phone,
                healthFormUrl,
              });
            }
          } catch (err) {
            console.error('Error creating health declaration on registration:', err);
          }
        }
      }

      setRegistrations(result);
      setRefreshTrigger(prev => prev + 1);
      return result;
    }
    
    return [];
  };

  // Wrap other handlers with local state
  const handleAddPayment = async (
    e: React.FormEvent,
    newPayment: any,
    setIsAddPaymentOpen: (open: boolean) => void,
    setNewPayment: (payment: any) => void
  ) => {
    e.preventDefault();
    
    const updatedRegistrations = await baseHandleAddPayment(
      e,
      newPayment,
      setIsAddPaymentOpen,
      setNewPayment,
      productId
    );
    
    if (updatedRegistrations && updatedRegistrations.length > 0) {
      setRegistrations(updatedRegistrations);
      return updatedRegistrations;
    }
    
    return registrations;
  };

  // Updated to accept registrationId parameter
  const handleApplyDiscount = async (
    discountAmount: number,
    setIsAddPaymentOpen: (open: boolean) => void,
    registrationId?: string // Added registrationId parameter
  ) => {
    const updatedRegistrations = await baseHandleApplyDiscount(
      discountAmount,
      setIsAddPaymentOpen,
      productId,
      registrationId // Pass the registrationId to the base handler
    );
    
    if (updatedRegistrations && updatedRegistrations.length > 0) {
      setRegistrations(updatedRegistrations);
      return updatedRegistrations;
    }
    
    return registrations;
  };

  const handleDeleteRegistration = async (registrationId: string) => {
    const result = await baseHandleDeleteRegistration(
      registrationId,
      registrations,
      productId
    );
    
    if (result) {
      setRegistrations(result);
      return result;
    }
    
    return registrations;
  };

  return {
    registrations,
    setRegistrations,
    refreshTrigger,
    setRefreshTrigger,
    currentRegistration,
    setCurrentRegistration,
    handleAddParticipant,
    handleAddPayment,
    handleApplyDiscount,
    handleDeleteRegistration,
    pendingHealthSend,
    clearPendingHealthSend: () => setPendingHealthSend(null),
  };
};
