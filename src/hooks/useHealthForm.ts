
import { useHealthDeclarationLoader } from './health-form/useHealthDeclarationLoader';
import { useHealthFormState } from './health-form/useHealthFormState';

export const useHealthForm = () => {
  const {
    isLoadingData,
    participantName,
    participantId,
    participantPhone,
    error,
    healthDeclarationId,
    productType,
    productName,
  } = useHealthDeclarationLoader();

  const {
    isLoading,
    formState,
    handleAgreementChange,
    handleNotesChange,
    handleParentNameChange,
    handleParentIdChange,
    handleSignatureChange,
    handleTermsAgreementChange,
    handleTermsSignatureChange,
    handleAfterCareChange,
    handleSubmit
  } = useHealthFormState(healthDeclarationId);

  return {
    isLoading,
    isLoadingData,
    participantName,
    participantId,
    participantPhone,
    error,
    formState,
    productType,
    productName,
    handleAgreementChange,
    handleNotesChange,
    handleParentNameChange,
    handleParentIdChange,
    handleSignatureChange,
    handleTermsAgreementChange,
    handleTermsSignatureChange,
    handleAfterCareChange,
    handleSubmit
  };
};
