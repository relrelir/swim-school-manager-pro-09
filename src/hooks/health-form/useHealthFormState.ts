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
}

interface CustomFormEvent extends React.FormEvent {
  signature?: string;
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!token) {
      toast({ title: 'שגיאה', description: 'מזהה הצהרת בריאות חסר', variant: 'destructive' });
      return;
    }
    if (!formState.agreement) {
      toast({ title: 'שגיאה', description: 'יש לאשר את הצהרת הבריאות כדי להמשיך', variant: 'destructive' });
      return;
    }
    if (!formState.parentName || !formState.parentId) {
      toast({ title: 'שגיאה', description: 'יש למלא את פרטי ההורה/אפוטרופוס', variant: 'destructive' });
      return;
    }

    const signature = (e as CustomFormEvent).signature || formState.signature;
    if (!signature) {
      toast({ title: 'שגיאה', description: 'יש להוסיף חתימה כדי להמשיך', variant: 'destructive' });
      return;
    }

    setIsLoading(true);
    try {
      await submitHealthForm(token, {
        signature,
        notes: formState.notes,
        parentName: formState.parentName,
        parentId: formState.parentId,
      });
      toast({ title: 'הצהרת הבריאות נשלחה בהצלחה', description: 'תודה על מילוי הטופס' });
      navigate('/form-success');
    } catch (err) {
      console.error('Error submitting health form:', err);
      toast({ title: 'שגיאה', description: 'אירעה שגיאה בשליחת הצהרת הבריאות', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading, formState,
    handleAgreementChange, handleNotesChange, handleParentNameChange,
    handleParentIdChange, handleSignatureChange, handleSubmit,
  };
};
