
import { useState } from 'react';
import { HealthDeclaration, Registration, RegistrationWithDetails } from '@/types';

/**
 * Hook for handling health declaration state and UI operations
 */
export const useHealthDeclarationHandling = () => {
  const [isLinkDialogOpen, setIsLinkDialogOpen] = useState(false);
  const [currentHealthDeclaration, setCurrentHealthDeclaration] = useState<{
    participantId: string;
    participantName: string;
    phone: string;
    declaration?: HealthDeclaration;
    productType?: string;
    productName?: string;
    registration?: Registration | RegistrationWithDetails;
  } | null>(null);

  return {
    isLinkDialogOpen,
    setIsLinkDialogOpen,
    currentHealthDeclaration,
    setCurrentHealthDeclaration
  };
};
