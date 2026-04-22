
import React, { Suspense, lazy, useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ErrorState, LoadingState } from '@/components/health-form/HealthFormStates';
import { useHealthForm } from '@/hooks/useHealthForm';
import SignaturePadComponent from '@/components/health-form/SignaturePad';
import TermsContent from '@/components/health-form/TermsContent';

const HealthDeclarationContent = lazy(() => import('@/components/health-form/HealthDeclarationContent'));

type FormStep = 'health-form' | 'health-sig' | 'terms' | 'terms-sig';

const HealthFormPage: React.FC = () => {
  const {
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
  } = useHealthForm();

  const [step, setStep] = useState<FormStep>('health-form');
  const [healthSignature, setHealthSignature] = useState('');

  if (isLoadingData) return <LoadingState />;
  if (error) return <ErrorState error={error} />;

  // Step 1 → 2: validate health form and show signature pad
  const handleHealthFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formState.agreement) {
      alert('יש לאשר את הצהרת הבריאות כדי להמשיך');
      return;
    }
    if (!formState.parentName || !formState.parentId) {
      alert('יש למלא את פרטי ההורה/אפוטרופוס');
      return;
    }
    setStep('health-sig');
  };

  // Step 2 → 3: save health signature, show terms
  const handleHealthSignatureConfirm = (signatureData: string) => {
    handleSignatureChange(signatureData);
    setHealthSignature(signatureData);
    setStep('terms');
  };

  // Step 3 → 4: validate terms agreement, show terms signature pad
  const handleTermsFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formState.termsAgreement) {
      alert('יש לאשר את קריאת התקנון כדי להמשיך');
      return;
    }
    setStep('terms-sig');
  };

  // Step 4: save terms signature and submit both
  const handleTermsSignatureConfirm = async (signatureData: string) => {
    handleTermsSignatureChange(signatureData);
    try {
      await handleSubmit(healthSignature, signatureData, {
        participantName,
        participantPhone,
        participantIdNumber: participantId, // participantId here is the ID number from the loader
        productType,
        productName,
        afterCare: formState.afterCare,
      });
    } catch {
      alert('אירעה שגיאה בשליחת הטופס. אנא נסה שנית');
    }
  };

  const stepLabel = step === 'health-form' || step === 'health-sig'
    ? 'שלב 1 מתוך 2 – הצהרת בריאות'
    : 'שלב 2 מתוך 2 – תקנון הפעילות';

  return (
    <div className="container mx-auto py-10 px-4">
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle>
            {step === 'health-form' || step === 'health-sig' ? 'הצהרת בריאות' : 'תקנון הפעילות'}
          </CardTitle>
          <CardDescription>
            {participantName ? `עבור ${participantName}` : 'אנא מלא את הפרטים הבאים'}
            <span className="block text-xs text-muted-foreground mt-1">{stepLabel}</span>
          </CardDescription>
        </CardHeader>

        {/* Step 1: Health declaration form */}
        {step === 'health-form' && (
          <form onSubmit={handleHealthFormSubmit}>
            <CardContent>
              <Suspense fallback={<div className="p-4 text-center">טוען תוכן טופס...</div>}>
                <HealthDeclarationContent
                  participantName={participantName}
                  participantId={participantId}
                  participantPhone={participantPhone}
                  formState={formState}
                  handleAgreementChange={handleAgreementChange}
                  handleNotesChange={handleNotesChange}
                  handleParentNameChange={handleParentNameChange}
                  handleParentIdChange={handleParentIdChange}
                />
              </Suspense>
            </CardContent>
            <CardFooter>
              <Button type="submit" className="w-full" disabled={isLoading}>
                המשך לחתימה
              </Button>
            </CardFooter>
          </form>
        )}

        {/* Step 2: Health declaration signature */}
        {step === 'health-sig' && (
          <CardContent>
            <SignaturePadComponent
              onSignatureConfirm={handleHealthSignatureConfirm}
              onCancel={() => setStep('health-form')}
            />
          </CardContent>
        )}

        {/* Step 3: Terms content + agreement */}
        {step === 'terms' && (
          <form onSubmit={handleTermsFormSubmit}>
            <CardContent>
              <TermsContent
                termsAgreement={formState.termsAgreement}
                onTermsAgreementChange={handleTermsAgreementChange}
                productType={productType}
                afterCare={formState.afterCare}
                onAfterCareChange={handleAfterCareChange}
              />
            </CardContent>
            <CardFooter>
              <Button type="submit" className="w-full" disabled={isLoading}>
                המשך לחתימה על התקנון
              </Button>
            </CardFooter>
          </form>
        )}

        {/* Step 4: Terms signature → submit */}
        {step === 'terms-sig' && (
          <CardContent>
            <SignaturePadComponent
              onSignatureConfirm={handleTermsSignatureConfirm}
              onCancel={() => setStep('terms')}
            />
          </CardContent>
        )}
      </Card>
    </div>
  );
};

export default HealthFormPage;
