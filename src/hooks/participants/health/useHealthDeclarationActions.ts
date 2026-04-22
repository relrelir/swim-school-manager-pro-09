
import { Participant, Registration, RegistrationWithDetails, HealthDeclaration } from '@/types';

/**
 * Hook for health declaration operations
 */
export const useHealthDeclarationActions = (
  getHealthDeclarationForRegistration: (registrationId: string) => HealthDeclaration | undefined,
  addHealthDeclaration: (declaration: Partial<HealthDeclaration>) => Promise<HealthDeclaration | undefined>,
  updateParticipant: (id: string, data: Partial<Participant>) => Promise<Participant>,
  participants: Participant[],
  registrations: Registration[],
  setCurrentHealthDeclaration: (healthDecl: {
    participantId: string;
    participantName: string;
    phone: string;
    declaration?: HealthDeclaration;
    productType?: string;
    productName?: string;
    registration?: Registration | RegistrationWithDetails;
  } | null) => void,
  setIsLinkDialogOpen: (isOpen: boolean) => void
) => {
  const handleOpenHealthForm = (registrationId: string) => {
    const registration = registrations.find(r => r.id === registrationId);
    if (!registration) {
      return;
    }

    const participant = participants.find(p => p.id === registration.participantId);
    if (!participant) {
      return;
    }

    const declaration = getHealthDeclarationForRegistration(registration.participantId);

    const withDetails = registration as RegistrationWithDetails;
    setCurrentHealthDeclaration({
      participantId: registration.participantId,
      participantName: `${participant.firstName} ${participant.lastName}`,
      phone: participant.phone || '',
      declaration,
      productType: withDetails.product?.type,
      productName: withDetails.product?.name,
      registration: withDetails,
    });
    
    setIsLinkDialogOpen(true);
  };

  const handleUpdateHealthApproval = async (registrationId: string, isApproved: boolean) => {
    const registration = registrations.find(r => r.id === registrationId);
    if (!registration) return;

    const participant = participants.find(p => p.id === registration.participantId);
    if (!participant) return;

    try {
      await updateParticipant(participant.id, {
        healthApproval: isApproved
      });
    } catch (error) {
      // Error handling is done in updateParticipant
    }
  };

  return {
    handleOpenHealthForm,
    handleUpdateHealthApproval
  };
};
