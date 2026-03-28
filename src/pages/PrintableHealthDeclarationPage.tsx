
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import PrintableHealthDeclaration from '@/components/health-form/PrintableHealthDeclaration';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { getHealthDeclarationByParticipant } from '@/services/firebase/healthDeclarations';
import { getParticipant } from '@/services/firebase/participants';
import { parseParentInfo, parseMedicalNotes } from '@/utils/pdf/healthDeclarationParser';

const PrintableHealthDeclarationPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const participantId = searchParams.get('participantId');

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [healthData, setHealthData] = useState<{
    participantName: string;
    participantId?: string;
    participantPhone?: string;
    formState: {
      agreement: boolean;
      notes: string;
      parentName: string;
      parentId: string;
      signature?: string;
    };
    submissionDate?: Date;
  } | null>(null);

  useEffect(() => {
    const load = async () => {
      if (!participantId) {
        setError('מזהה משתתף חסר');
        setIsLoading(false);
        return;
      }

      try {
        const [healthDeclaration, participant] = await Promise.all([
          getHealthDeclarationByParticipant(participantId),
          getParticipant(participantId),
        ]);

        if (!healthDeclaration) throw new Error('לא נמצאה הצהרת בריאות');
        if (!participant) throw new Error('לא נמצאו פרטי המשתתף');

        const rawNotes = healthDeclaration.notes || '';
        const parentInfo = parseParentInfo(rawNotes);
        const medicalNotes = parseMedicalNotes(rawNotes);

        setHealthData({
          participantName: `${participant.firstName} ${participant.lastName}`,
          participantId: participant.idNumber,
          participantPhone: participant.phone,
          formState: {
            agreement: true,
            notes: healthDeclaration.notes ? medicalNotes : '',
            parentName: healthDeclaration.parentName ?? parentInfo.parentName,
            parentId: healthDeclaration.parentId ?? parentInfo.parentId,
            signature: healthDeclaration.signature ?? undefined,
          },
          submissionDate: healthDeclaration.submissionDate
            ? new Date(healthDeclaration.submissionDate)
            : new Date(),
        });
      } catch (err) {
        console.error('Error loading health declaration:', err);
        setError(err instanceof Error ? err.message : 'אירעה שגיאה בטעינת הצהרת הבריאות');
      } finally {
        setIsLoading(false);
      }
    };

    load();
  }, [participantId]);

  if (isLoading) {
    return (
      <div className="container py-10" dir="rtl">
        <Card className="max-w-3xl mx-auto">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center p-8">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
              <p className="mt-4">טוען הצהרת בריאות...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !healthData) {
    return (
      <div className="container py-10" dir="rtl">
        <Alert variant="destructive" className="max-w-3xl mx-auto">
          <AlertDescription>{error || 'אירעה שגיאה בטעינת הצהרת הבריאות'}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container py-6">
      <PrintableHealthDeclaration
        participantName={healthData.participantName}
        participantId={healthData.participantId}
        participantPhone={healthData.participantPhone}
        formState={healthData.formState}
        submissionDate={healthData.submissionDate}
      />
    </div>
  );
};

export default PrintableHealthDeclarationPage;
