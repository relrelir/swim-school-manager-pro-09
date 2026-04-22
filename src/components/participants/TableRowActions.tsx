import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Registration, Payment } from '@/types';
import { Trash2Icon, FileDownIcon, CreditCardIcon, PrinterIcon, HistoryIcon, ScrollText } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { generateHealthDeclarationPdf } from '@/utils/generateHealthDeclarationPdf';
import { generateRegistrationPdf } from '@/utils/generateRegistrationPdf';
import { generateTermsPdf } from '@/utils/generateTermsPdf';
import { getHealthDeclarationByParticipant } from '@/services/firebase/healthDeclarations';
import { toast } from "@/components/ui/use-toast";
import { useAuth } from '@/context/AuthContext';
import PaymentHistoryDialog from './PaymentHistoryDialog';

interface TableRowActionsProps {
  registration: Registration;
  hasPayments: boolean;
  payments?: Payment[];
  participantName?: string;
  onAddPayment: (registration: Registration) => void;
  onDeleteRegistration: (registrationId: string) => void;
}

const TableRowActions: React.FC<TableRowActionsProps> = ({
  registration,
  hasPayments,
  payments = [],
  participantName = '',
  onAddPayment,
  onDeleteRegistration,
}) => {
  const { isAdmin } = useAuth();
  const [isGeneratingHealthPdf, setIsGeneratingHealthPdf] = useState(false);
  const [isGeneratingTermsPdf, setIsGeneratingTermsPdf] = useState(false);
  const [isGeneratingRegistrationPdf, setIsGeneratingRegistrationPdf] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [hasHealthDeclaration, setHasHealthDeclaration] = useState(false);
  const [hasTermsDeclaration, setHasTermsDeclaration] = useState(false);
  const [isCheckingDeclaration, setIsCheckingDeclaration] = useState(false);
  
  // Optimization: Create registrationId and participantId as useMemo to prevent unnecessary calculations
  const registrationId = useMemo(() => registration?.id, [registration?.id]);
  const participantId = useMemo(() => registration?.participantId, [registration?.participantId]);
  
  // Optimization: Use useCallback to prevent unnecessary rerenders
  const checkForHealthDeclaration = useCallback(async () => {
    if (!registrationId || !participantId || isCheckingDeclaration) return;
    
    try {
      setIsCheckingDeclaration(true);
      
      const declaration = await getHealthDeclarationByParticipant(participantId);
      const declarationExists = Boolean(declaration);
      if (hasHealthDeclaration !== declarationExists) {
        setHasHealthDeclaration(declarationExists);
      }
      const termsSigned = Boolean(declaration?.termsSignature);
      if (hasTermsDeclaration !== termsSigned) {
        setHasTermsDeclaration(termsSigned);
      }
    } catch (error) {
      console.error("Error checking for health declaration:", error);
    } finally {
      setIsCheckingDeclaration(false);
    }
  }, [registrationId, participantId, hasHealthDeclaration, hasTermsDeclaration, isCheckingDeclaration]);
  
  // Optimization: Use useEffect with correct dependencies
  useEffect(() => {
    checkForHealthDeclaration();
  }, [checkForHealthDeclaration]);

  const handleOpenRegistrationPrint = useCallback(async () => {
    if (!registrationId) return;
    setIsGeneratingRegistrationPdf(true);
    try {
      await generateRegistrationPdf(registrationId);
    } catch {
      // toast already shown inside generateRegistrationPdf
    } finally {
      setIsGeneratingRegistrationPdf(false);
    }
  }, [registrationId]);
  
  // Improved PDF generation function with better error handling
  const handlePrintHealthDeclaration = useCallback(async () => {
    if (!registration || !registrationId || !participantId) {
      console.error("Cannot generate PDF: Invalid registration", registration);
      toast({
        title: "שגיאה",
        description: "פרטי הרישום אינם תקינים",
        variant: "destructive"
      });
      return;
    }
    
    setIsGeneratingHealthPdf(true);
    try {
      console.log("Starting health declaration PDF generation");
      await generateHealthDeclarationPdf(participantId);
      
      toast({
        title: "הצהרת הבריאות נוצרה בהצלחה",
        description: "המסמך נשמר למכשיר שלך"
      });
    } catch (error) {
      console.error("Error generating health declaration PDF:", error);
      toast({
        title: "שגיאה ביצירת הצהרת בריאות",
        description: "אירעה שגיאה בעת יצירת המסמך",
        variant: "destructive"
      });
    } finally {
      setIsGeneratingHealthPdf(false);
    }
  }, [registrationId, participantId, registration]);
  
  const handleDownloadTerms = useCallback(async () => {
    if (!participantId) return;
    setIsGeneratingTermsPdf(true);
    try {
      await generateTermsPdf(participantId);
    } catch {
      // toast already shown inside generateTermsPdf
    } finally {
      setIsGeneratingTermsPdf(false);
    }
  }, [participantId]);

  // Handle delete registration with confirmation - optimized with useCallback
  const handleDeleteRegistration = useCallback(() => {
    if (hasPayments) {
      toast({
        title: "לא ניתן למחוק",
        description: "לא ניתן למחוק רישום שבוצע עבורו תשלום",
        variant: "destructive",
      });
      return;
    }
    
    if (!isAdmin) {
      toast({
        title: "אין הרשאה",
        description: "אין לך הרשאה למחוק רישום",
        variant: "destructive",
      });
      return;
    }
    
    onDeleteRegistration(registration.id);
  }, [hasPayments, onDeleteRegistration, registration.id, isAdmin]);
  
  return (
    <>
    <PaymentHistoryDialog
      payments={payments}
      participantName={participantName}
      isOpen={isHistoryOpen}
      onOpenChange={setIsHistoryOpen}
    />
    <div className="flex gap-2 justify-end">
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onAddPayment(registration)}
          >
            <CreditCardIcon className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>הוסף תשלום</TooltipContent>
      </Tooltip>

      {hasPayments && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsHistoryOpen(true)}
            >
              <HistoryIcon className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>היסטוריית תשלומים</TooltipContent>
        </Tooltip>
      )}
      
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleOpenRegistrationPrint}
            disabled={isGeneratingRegistrationPdf}
          >
            {isGeneratingRegistrationPdf ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
            ) : (
              <FileDownIcon className="h-4 w-4" />
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent>הורד אישור רישום</TooltipContent>
      </Tooltip>
      
      {/* Health Declaration Print Button - Enable regardless of hasHealthDeclaration for previewing empty form */}
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            onClick={handlePrintHealthDeclaration}
            disabled={isGeneratingHealthPdf}
          >
            {isGeneratingHealthPdf ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
            ) : (
              <PrinterIcon className="h-4 w-4" />
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          {hasHealthDeclaration ? "הדפס הצהרת בריאות" : "הדפס טופס הצהרת בריאות"}
        </TooltipContent>
      </Tooltip>

      {hasTermsDeclaration && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleDownloadTerms}
              disabled={isGeneratingTermsPdf}
            >
              {isGeneratingTermsPdf ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
              ) : (
                <ScrollText className="h-4 w-4" />
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent>הורד תקנון חתום</TooltipContent>
        </Tooltip>
      )}

      {isAdmin() && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleDeleteRegistration}
              disabled={hasPayments}
              className={hasPayments ? "opacity-50 cursor-not-allowed" : ""}
            >
              <Trash2Icon className="h-4 w-4 text-red-500" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            {hasPayments
              ? "לא ניתן למחוק רישום עם תשלומים"
              : "מחק רישום"}
          </TooltipContent>
        </Tooltip>
      )}
    </div>
    </>
  );
};

export default TableRowActions;
