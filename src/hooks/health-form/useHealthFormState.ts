
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { submitHealthFormService } from '@/context/data/healthDeclarations/submitHealthForm';
import { toast } from "@/components/ui/use-toast";

interface FormState {
  agreement: boolean;
  notes: string;
  parentName: string;
  parentId: string;
  signature: string;
}

export const useHealthFormState = (healthDeclarationId: string | null) => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [formState, setFormState] = useState<FormState>({
    agreement: false,
    notes: '',
    parentName: '',
    parentId: '',
    signature: ''
  });
  
  const handleAgreementChange = (value: boolean) => {
    setFormState(prev => ({ ...prev, agreement: value }));
  };
  
  const handleNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setFormState(prev => ({ ...prev, notes: e.target.value }));
  };
  
  const handleParentNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormState(prev => ({ ...prev, parentName: e.target.value }));
  };
  
  const handleParentIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormState(prev => ({ ...prev, parentId: e.target.value }));
  };
  
  const handleSignatureChange = (signatureData: string) => {
    setFormState(prev => ({ ...prev, signature: signatureData }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!healthDeclarationId) {
      toast({
        title: "שגיאה",
        description: "מזהה הצהרת בריאות חסר",
        variant: "destructive",
      });
      return;
    }
    
    if (!formState.agreement) {
      toast({
        title: "שגיאה",
        description: "יש לאשר את הצהרת הבריאות כדי להמשיך",
        variant: "destructive",
      });
      return;
    }
    
    if (!formState.parentName || !formState.parentId) {
      toast({
        title: "שגיאה",
        description: "יש למלא את פרטי ההורה/אפוטרופוס",
        variant: "destructive",
      });
      return;
    }
    
    if (!formState.signature) {
      toast({
        title: "שגיאה",
        description: "יש להוסיף חתימה כדי להמשיך",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      // We'll pass the parentId separately but it will be added to the notes field
      await submitHealthFormService(
        healthDeclarationId,
        formState.agreement,
        formState.notes,
        formState.signature,
        formState.parentName,
        formState.parentId
      );
      
      toast({
        title: "הצהרת הבריאות נשלחה בהצלחה",
        description: "תודה על מילוי הטופס",
      });
      
      navigate('/form-success');
    } catch (error) {
      console.error('Error submitting health form:', error);
      toast({
        title: "שגיאה",
        description: "אירעה שגיאה בשליחת הצהרת הבריאות",
        variant: "destructive",
      });
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
    handleSubmit
  };
};
