import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { submitHealthForm } from '@/services/firebase/healthDeclarations';
import { toast } from '@/components/ui/use-toast';

interface FormState {
  agreement: boolean;
  notes: string;
  parentName: string;
  parentId: string;
  signature: string;
  termsAgreement: boolean;
  termsSignature: string;
  afterCare: boolean;
}

export const useHealthFormState = (token: string | null) => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [formState, setFormState] = useState<FormState>({
    agreement: false,
    notes: '',
    parentName: '',
    parentId: '',
    signature: '',
    termsAgreement: false,
    termsSignature: '',
    afterCare: false,
  });

  const handleAgreementChange = (value: boolean) =>
    setFormState((prev) => ({ ...prev, agreement: value }));

  const handleNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) =>
    setFormState((prev) => ({ ...prev, notes: e.target.value }));

  const handleParentNameChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setFormState((prev) => ({ ...prev, parentName: e.target.value }));

  const handleParentIdChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setFormState((prev) => ({ ...prev, parentId: e.target.value }));

  const handleSignatureChange = (signatureData: string) =>
    setFormState((prev) => ({ ...prev, signature: signatureData }));

  const handleTermsAgreementChange = (value: boolean) =>
    setFormState((prev) => ({ ...prev, termsAgreement: value }));

  const handleTermsSignatureChange = (signatureData: string) =>
    setFormState((prev) => ({ ...prev, termsSignature: signatureData }));

  const handleAfterCareChange = (value: boolean) =>
    setFormState((prev) => ({ ...prev, afterCare: value }));

  const handleSubmit = async (
    signature: string,
    termsSignature: string,
    navExtra?: Record<string, unknown>
  ) => {
    if (!token) {
      toast({ title: 'שגיאה', description: 'מזהה הצהרת בריאות חסר', variant: 'destructive' });
      return;
    }

    setIsLoading(true);
    try {
      await submitHealthForm(token, {
        signature,
        termsSignature,
        notes: formState.notes,
        parentName: formState.parentName,
        parentId: formState.parentId,
        afterCare: formState.afterCare,
      });
      toast({ title: 'הצהרת הבריאות והתקנון נשלחו בהצלחה', description: 'תודה על מילוי הטופס' });
      navigate('/form-success', { state: { token, ...navExtra } });
    } catch (err) {
      console.error('Error submitting health form:', err);
      toast({ title: 'שגיאה', description: 'אירעה שגיאה בשליחת הצהרת הבריאות', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  return {
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
    handleSubmit,
  };
};
