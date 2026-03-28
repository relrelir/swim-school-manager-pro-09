import { Registration, Participant } from '@/types';
import { useParticipantHandlers } from '../useParticipantHandlers';
import { useRegistrationManagement } from '../useRegistrationManagement';
import { useParticipantHealth } from '../useParticipantHealth';
import { useParticipantAdapters } from '../useParticipantAdapters';
import { toast } from "@/components/ui/use-toast";

/**
 * Hook for participant-related actions and handlers
 */
export const useParticipantActions = (
  productId: string | undefined,
  dataContext: any,
  participants: Participant[],
  registrations: Registration[],
  product: any,
  setRefreshTrigger: (value: React.SetStateAction<number>) => void,
  newParticipant: any,
  registrationData: any,
  getParticipantForRegistration: (registration: Registration) => Participant | undefined,
  setIsAddParticipantOpen: (value: boolean) => void,
  setIsAddPaymentOpen: (value: boolean) => void,
  setNewPayment: (value: any) => void,
  newPayment: any,
  resetForm: () => void,
  currentRegistration: Registration | null
) => {
  const {
    updateParticipant,
    addParticipant,
    addRegistration,
    updateRegistration,
    deleteRegistration,
    deleteParticipant,
    addPayment,
    getPaymentsByRegistration,
    getRegistrationsByProduct,
    addHealthDeclaration,
    updateHealthDeclaration: baseUpdateHealthDeclaration,
    getHealthDeclarationForRegistration,
    deleteHealthDeclaration
  } = dataContext;

  const updateHealthDeclaration = (declaration: any) => {
    return baseUpdateHealthDeclaration(declaration.id, declaration);
  };

  const {
    handleOpenHealthForm: baseHandleOpenHealthForm,
    handleUpdateHealthApproval
  } = useParticipantHealth(
    getHealthDeclarationForRegistration,
    addHealthDeclaration,
    async (id: string, data: Partial<Participant>): Promise<Participant> => {
      const participantToUpdate = {
        id,
        firstName: data.firstName || '',
        lastName: data.lastName || '',
        phone: data.phone || '',
        healthApproval: data.healthApproval !== undefined ? data.healthApproval : false,
        idNumber: data.idNumber || '',
        ...data
      } as Participant;

      await updateParticipant(participantToUpdate);
      return participantToUpdate;
    },
    participants,
    registrations
  );

  const {
    handleAddParticipant: baseHandleAddParticipant,
    handleAddPayment: baseHandleAddPayment,
    handleApplyDiscount: baseHandleApplyDiscount,
    handleDeleteRegistration: managementHandleDeleteRegistration,
    pendingHealthSend,
    clearPendingHealthSend,
  } = useRegistrationManagement(
    product,
    productId,
    participants,
    addParticipant,
    addRegistration,
    updateRegistration,
    deleteRegistration,
    addPayment,
    getPaymentsByRegistration,
    getRegistrationsByProduct,
    updateParticipant,
    addHealthDeclaration
  );

  const {
    adaptedHandleOpenHealthForm,
    handleAddParticipantWrapper,
    handleAddPaymentWrapper,
    handleApplyDiscountAdapter
  } = useParticipantAdapters(
    updateParticipant,
    baseHandleOpenHealthForm,
    baseHandleAddParticipant,
    baseHandleAddPayment,
    baseHandleApplyDiscount
  );

  const {
    handleOpenHealthForm,
    handleAddParticipant: wrapperHandleAddParticipant,
    handleAddPayment: wrapperHandleAddPayment,
    handleApplyDiscount
  } = useParticipantHandlers(
    adaptedHandleOpenHealthForm || baseHandleOpenHealthForm,
    baseHandleAddParticipant,
    baseHandleAddPayment,
    baseHandleApplyDiscount,
    newParticipant,
    registrationData,
    getParticipantForRegistration,
    registrations
  );

  const handleAddParticipant = (e: React.FormEvent) => {
    return wrapperHandleAddParticipant(e, resetForm, setIsAddParticipantOpen);
  };

  const handleAddPayment = (e: React.FormEvent) => {
    return wrapperHandleAddPayment(e, newPayment, setIsAddPaymentOpen, setNewPayment);
  };

  const handleDeleteRegistration = async (registrationId: string) => {
    try {
      const payments = await getPaymentsByRegistration(registrationId);
      if (payments.length > 0) {
        toast({
          title: "לא ניתן למחוק",
          description: "לא ניתן למחוק רישום שבוצע עבורו תשלום",
          variant: "destructive",
        });
        return;
      }

      const confirmDelete = window.confirm("האם אתה בטוח שברצונך למחוק את המשתתף?");
      if (!confirmDelete) {
        return;
      }

      const registration = registrations.find(r => r.id === registrationId);
      if (!registration) {
        console.error("Registration not found:", registrationId);
        return;
      }

      const participantId = registration.participantId;

      const healthDecl = await getHealthDeclarationForRegistration(registrationId);
      if (healthDecl) {
        await deleteHealthDeclaration(healthDecl.id);
      }

      await deleteRegistration(registrationId);

      const otherRegistrations = registrations.filter(
        r => r.participantId === participantId && r.id !== registrationId
      );

      if (otherRegistrations.length === 0) {
        await deleteParticipant(participantId);
      }

      setRefreshTrigger(prev => prev + 1);
    } catch (error) {
      console.error("Error deleting registration:", error);
      toast({
        title: "שגיאה במחיקת רישום",
        description: "אירעה שגיאה בעת מחיקת הרישום",
        variant: "destructive",
      });
    }
  };

  return {
    handleAddParticipant,
    handleAddPayment,
    handleApplyDiscount,
    handleDeleteRegistration,
    handleUpdateHealthApproval,
    handleOpenHealthForm,
    pendingHealthSend,
    clearPendingHealthSend,
  };
};
