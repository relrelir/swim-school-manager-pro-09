import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import PrintableRegistration from '@/components/participants/PrintableRegistration';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { getRegistration, calculatePaymentStatus } from '@/services/firebase/registrations';
import { getParticipant } from '@/services/firebase/participants';
import { getPaymentsByRegistration } from '@/services/firebase/payments';
import { getProduct } from '@/services/firebase/products';
import { Registration, Participant, Payment } from '@/types';

const PrintableRegistrationPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const registrationId = searchParams.get('registrationId');

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<{
    registration: Registration;
    participant: Participant;
    payments: Payment[];
    productName: string;
    effectiveRequiredAmount: number;
    paymentStatusText: string;
  } | null>(null);

  useEffect(() => {
    const load = async () => {
      if (!registrationId) {
        setError('מזהה רישום חסר');
        setIsLoading(false);
        return;
      }

      try {
        const registration = await getRegistration(registrationId);
        if (!registration) throw new Error('לא נמצא הרישום');

        const [participant, payments, product] = await Promise.all([
          getParticipant(registration.participantId),
          getPaymentsByRegistration(registrationId),
          getProduct(registration.productId),
        ]);

        if (!participant) throw new Error('לא נמצאו פרטי המשתתף');

        const discountAmount = registration.discountAmount || 0;
        const effectiveRequiredAmount = Math.max(
          0,
          registration.requiredAmount - (registration.discountApproved ? discountAmount : 0)
        );

        const actualPaidAmount = payments.reduce((sum, p) => sum + p.amount, 0);
        const canonicalStatus = calculatePaymentStatus({ ...registration, paidAmount: actualPaidAmount });
        const paymentStatusText =
          canonicalStatus === 'מלא' || canonicalStatus === 'מלא / הנחה' || canonicalStatus === 'הנחה'
            ? 'שולם במלואו'
            : canonicalStatus === 'יתר'
            ? 'שולם ביתר'
            : actualPaidAmount > 0
            ? 'תשלום חלקי'
            : 'טרם שולם';

        setData({
          registration,
          participant,
          payments,
          productName: product?.name ?? 'לא ידוע',
          effectiveRequiredAmount,
          paymentStatusText,
        });
      } catch (err) {
        console.error('Error loading registration:', err);
        setError(err instanceof Error ? err.message : 'אירעה שגיאה בטעינת הרישום');
      } finally {
        setIsLoading(false);
      }
    };

    load();
  }, [registrationId]);

  if (isLoading) {
    return (
      <div className="container py-10" dir="rtl">
        <Card className="max-w-3xl mx-auto">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center p-8">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
              <p className="mt-4">טוען אישור רישום...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="container py-10" dir="rtl">
        <Alert variant="destructive" className="max-w-3xl mx-auto">
          <AlertDescription>{error || 'אירעה שגיאה בטעינת הרישום'}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container py-6">
      <PrintableRegistration
        participantName={`${data.participant.firstName} ${data.participant.lastName}`}
        participantIdNumber={data.participant.idNumber}
        participantPhone={data.participant.phone}
        productName={data.productName}
        registrationDate={data.registration.registrationDate}
        effectiveRequiredAmount={data.effectiveRequiredAmount}
        healthApproval={data.participant.healthApproval}
        paymentStatusText={data.paymentStatusText}
        payments={data.payments}
      />
    </div>
  );
};

export default PrintableRegistrationPage;
