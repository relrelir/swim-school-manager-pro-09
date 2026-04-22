import { createRtlPdf } from './pdf/pdfConfig';
import { buildRegistrationPDF } from './pdf/registrationPdfContentBuilder';
import { HealthDeclaration, Participant, Registration } from '@/types';
import { toast } from '@/components/ui/use-toast';

/**
 * Generate and download the registration confirmation PDF using only data
 * stored in the health declaration — no authentication required.
 *
 * Reuses the shared `buildRegistrationPDF` builder so the output matches the
 * admin-side PDF byte-for-byte (minus the payments table, which depends on
 * `/payments` reads that the public client cannot perform).
 */
export const generateRegistrationConfirmationPdf = async (declaration: HealthDeclaration): Promise<void> => {
  try {
    const pdf = await createRtlPdf();

    const fullName = declaration.participantName ?? '';
    const [firstName, ...rest] = fullName.split(' ');
    const participant: Participant = {
      id: declaration.participantId,
      firstName: firstName ?? '',
      lastName: rest.join(' '),
      idNumber: declaration.participantIdNumber ?? '',
      phone: declaration.participantPhone ?? '',
      email: '',
      healthApproval: declaration.formStatus === 'signed',
      termsApproval: !!declaration.termsSignedDate,
    };

    const registration: Registration = {
      id: declaration.registrationId ?? declaration.id,
      productId: '',
      participantId: declaration.participantId,
      registrationDate:
        declaration.registrationDate ?? declaration.createdAt ?? new Date().toISOString(),
      requiredAmount: declaration.requiredAmount ?? 0,
      paidAmount: 0,
      discountApproved: declaration.discountApproved ?? false,
      discountAmount: declaration.discountAmount ?? null,
      receiptNumber: null,
    };

    const fileName = buildRegistrationPDF(
      pdf,
      registration,
      participant,
      [],
      declaration.productName ?? '',
      {
        productType: declaration.productType ?? undefined,
        afterCare: declaration.afterCare ?? null,
      }
    );

    setTimeout(() => pdf.save(fileName), 100);
    toast({ title: 'PDF נוצר בהצלחה', description: 'אישור הרישום נשמר במכשיר שלך' });
  } catch (error) {
    console.error('Error generating registration confirmation PDF:', error);
    toast({
      title: 'שגיאה',
      description: error instanceof Error ? error.message : 'אירעה שגיאה ביצירת ה-PDF',
      variant: 'destructive',
    });
    throw error;
  }
};
