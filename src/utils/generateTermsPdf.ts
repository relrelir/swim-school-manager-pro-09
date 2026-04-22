import { getParticipant } from '@/services/firebase/participants';
import { getHealthDeclarationByParticipant } from '@/services/firebase/healthDeclarations';
import { createRtlPdf } from './pdf/pdfConfig';
import { buildTermsPDF } from './pdf/termsContentBuilder';
import { toast } from '@/components/ui/use-toast';
import { HealthDeclaration } from '@/types';

/**
 * Generate and download the signed תקנון PDF.
 *
 * Admin path:  pass participantId (string) — fetches data from Firestore.
 * Customer path: pass a HealthDeclaration object — no extra fetch needed.
 */
export const generateTermsPdf = async (
  source: string | HealthDeclaration
): Promise<string> => {
  try {
    let declaration: HealthDeclaration | null;
    let participantId: string;

    if (typeof source === 'string') {
      participantId = source;
      declaration = await getHealthDeclarationByParticipant(participantId);
    } else {
      declaration = source;
      participantId = source.participantId;
    }

    const participant = await getParticipant(participantId);

    if (!participant || !participant.firstName || !participant.lastName) {
      throw new Error('פרטי המשתתף לא נמצאו');
    }

    const fullName = `${participant.firstName} ${participant.lastName}`.trim();

    const declarationData = declaration ?? {
      id: 'טיוטה',
      participantId,
      token: '',
      formStatus: 'pending' as const,
      termsSignature: null,
      termsSignedDate: null,
      parentName: null,
      parentId: null,
    };

    const pdf = await createRtlPdf();

    const fileName = buildTermsPDF(
      pdf,
      {
        termsSignedDate: declarationData.termsSignedDate ?? null,
        termsSignature: declarationData.termsSignature ?? null,
        parentName: declarationData.parentName ?? null,
        parentId: declarationData.parentId ?? null,
        productType: declarationData.productType ?? null,
        afterCare: declarationData.afterCare ?? null,
      },
      {
        firstname: participant.firstName,
        lastname: participant.lastName,
        idnumber: participant.idNumber,
        phone: participant.phone,
        fullName,
      }
    );

    setTimeout(() => pdf.save(fileName), 100);

    toast({ title: 'PDF נוצר בהצלחה', description: 'התקנון החתום נשמר במכשיר שלך' });
    return fileName;
  } catch (error) {
    console.error('Error generating terms PDF:', error);
    toast({
      title: 'שגיאה',
      description: error instanceof Error ? error.message : 'אירעה שגיאה ביצירת ה-PDF',
      variant: 'destructive',
    });
    throw error;
  }
};
