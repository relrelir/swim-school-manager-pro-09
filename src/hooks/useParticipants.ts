
import { useParams } from 'react-router-dom';
import { useData } from '@/context/DataContext';
import { Registration } from '@/types';
import { useParticipantCore } from './participants/useParticipantCore';
import { useParticipantActions } from './participants/useParticipantActions';

/**
 * Main hook for participants management - now acts as a composition layer
 * for more focused participant-related hooks
 */
export const useParticipants = () => {
  const { productId } = useParams<{ productId: string }>();
  const dataContext = useData();
  
  // Separate core functionality (data loading, state management)
  const core = useParticipantCore(productId, dataContext);
  
  // Separate actions (handlers, operations)
  const actions = useParticipantActions(
    productId,
    dataContext,
    core.participants,
    core.registrations,
    core.product,
    core.setRefreshTrigger,
    core.newParticipant,
    core.registrationData,
    core.getParticipantForRegistration,
    core.setIsAddParticipantOpen,
    core.setIsAddPaymentOpen,
    core.setNewPayment,
    core.newPayment,
    core.resetForm,
    core.currentRegistration // Add the missing argument
  );

  return {
    // Core data and state
    product: core.product,
    registrations: core.registrations,
    isAddParticipantOpen: core.isAddParticipantOpen,
    setIsAddParticipantOpen: core.setIsAddParticipantOpen,
    isAddPaymentOpen: core.isAddPaymentOpen,
    setIsAddPaymentOpen: core.setIsAddPaymentOpen,
    isLinkDialogOpen: core.isLinkDialogOpen,
    setIsLinkDialogOpen: core.setIsLinkDialogOpen,
    currentHealthDeclaration: core.currentHealthDeclaration,
    setCurrentHealthDeclaration: core.setCurrentHealthDeclaration,
    newParticipant: core.newParticipant,
    setNewParticipant: core.setNewParticipant,
    currentRegistration: core.currentRegistration,
    setCurrentRegistration: core.setCurrentRegistration,
    registrationData: core.registrationData,
    setRegistrationData: core.setRegistrationData,
    newPayment: core.newPayment,
    setNewPayment: core.setNewPayment,
    totalParticipants: core.totalParticipants,
    registrationsFilled: core.registrationsFilled,
    totalExpected: core.totalExpected,
    totalPaid: core.totalPaid,
    participants: core.participants,

    // Actions and handlers
    handleAddParticipant: actions.handleAddParticipant,
    handleAddPayment: actions.handleAddPayment,
    handleApplyDiscount: actions.handleApplyDiscount,
    handleDeleteRegistration: actions.handleDeleteRegistration,
    handleUpdateHealthApproval: actions.handleUpdateHealthApproval,
    handleOpenHealthForm: actions.handleOpenHealthForm,
    pendingHealthSend: actions.pendingHealthSend,
    clearPendingHealthSend: actions.clearPendingHealthSend,
    
    // Utility functions
    resetForm: core.resetForm,
    getParticipantForRegistration: core.getParticipantForRegistration,
    getPaymentsForRegistration: core.getPaymentsForRegistration,
    getStatusClassName: core.getStatusClassName,
    calculatePaymentStatus: core.calculatePaymentStatus,
    getHealthDeclarationForRegistration: core.getHealthDeclarationForRegistration,
  };
};
