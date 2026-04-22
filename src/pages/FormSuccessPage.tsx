
import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, Download, FileText, ClipboardCheck } from 'lucide-react';
import { getHealthDeclarationByToken } from '@/services/firebase/healthDeclarations';
import { generateHealthDeclarationPdf } from '@/utils/generateHealthDeclarationPdf';
import { generateTermsPdf } from '@/utils/generateTermsPdf';
import { generateRegistrationConfirmationPdf } from '@/utils/generateRegistrationConfirmationPdf';
import { HealthDeclaration } from '@/types';

type NavState = {
  token?: string;
  participantName?: string;
  participantPhone?: string;
  participantIdNumber?: string;
  productType?: string;
  productName?: string;
  afterCare?: boolean;
} | null;

const FormSuccessPage: React.FC = () => {
  const location = useLocation();
  const navState = location.state as NavState;
  const token: string | undefined = navState?.token;

  const [declaration, setDeclaration] = useState<HealthDeclaration | null>(null);
  const [isGeneratingHealth, setIsGeneratingHealth] = useState(false);
  const [isGeneratingTerms, setIsGeneratingTerms] = useState(false);
  const [isGeneratingConfirmation, setIsGeneratingConfirmation] = useState(false);

  useEffect(() => {
    if (!token) return;
    getHealthDeclarationByToken(token).then(setDeclaration).catch(() => {});
  }, [token]);

  // Merge Firestore declaration with nav-state data so the PDF always has
  // participant/product info even when the declaration was created before
  // these fields were cached, or when productType wasn't stored yet.
  const enrichedDeclaration: HealthDeclaration | null = declaration
    ? {
        ...declaration,
        participantName: navState?.participantName ?? declaration.participantName,
        participantPhone: navState?.participantPhone ?? declaration.participantPhone,
        participantIdNumber: navState?.participantIdNumber ?? declaration.participantIdNumber,
        productType: (navState?.productType ?? declaration.productType) as HealthDeclaration['productType'],
        productName: navState?.productName ?? declaration.productName,
        afterCare: navState?.afterCare ?? declaration.afterCare,
      }
    : null;

  const handleDownloadHealth = async () => {
    if (!declaration) return;
    setIsGeneratingHealth(true);
    try {
      await generateHealthDeclarationPdf(declaration.participantId);
    } finally {
      setIsGeneratingHealth(false);
    }
  };

  const handleDownloadTerms = async () => {
    if (!enrichedDeclaration) return;
    setIsGeneratingTerms(true);
    try {
      await generateTermsPdf(enrichedDeclaration);
    } finally {
      setIsGeneratingTerms(false);
    }
  };

  const handleDownloadConfirmation = async () => {
    if (!enrichedDeclaration) return;
    setIsGeneratingConfirmation(true);
    try {
      await generateRegistrationConfirmationPdf(enrichedDeclaration);
    } finally {
      setIsGeneratingConfirmation(false);
    }
  };

  return (
    <div className="container mx-auto py-10 px-4">
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <div className="flex items-center justify-center mb-4">
            <div className="rounded-full bg-green-100 p-3">
              <Check className="h-8 w-8 text-green-600" />
            </div>
          </div>
          <CardTitle className="text-center">הטפסים התקבלו בהצלחה</CardTitle>
          <CardDescription className="text-center">
            הצהרת הבריאות והתקנון נקלטו במערכת. אין צורך בפעולות נוספות.
          </CardDescription>
        </CardHeader>

        {enrichedDeclaration && (
          <CardContent className="space-y-3">
            <p className="text-sm text-center text-muted-foreground mb-4">
              ניתן להוריד את המסמכים החתומים למכשיר שלך:
            </p>
            <Button
              variant="outline"
              className="w-full gap-2"
              onClick={handleDownloadHealth}
              disabled={isGeneratingHealth}
            >
              <Download className="h-4 w-4" />
              {isGeneratingHealth ? 'מייצר PDF...' : 'הורד הצהרת בריאות חתומה'}
            </Button>
            <Button
              variant="outline"
              className="w-full gap-2"
              onClick={handleDownloadTerms}
              disabled={isGeneratingTerms}
            >
              <FileText className="h-4 w-4" />
              {isGeneratingTerms ? 'מייצר PDF...' : 'הורד תקנון חתום'}
            </Button>
            <Button
              variant="outline"
              className="w-full gap-2"
              onClick={handleDownloadConfirmation}
              disabled={isGeneratingConfirmation}
            >
              <ClipboardCheck className="h-4 w-4" />
              {isGeneratingConfirmation ? 'מייצר PDF...' : 'הורד אישור רישום'}
            </Button>
          </CardContent>
        )}
      </Card>
    </div>
  );
};

export default FormSuccessPage;
