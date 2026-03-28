import { getParticipant } from '@/services/firebase/participants';
import { getHealthDeclarationByParticipant } from '@/services/firebase/healthDeclarations';
import { createRtlPdf } from './pdf/pdfConfig';
import { buildHealthDeclarationPDF } from './pdf/healthDeclarationContentBuilder';
import { toast } from '@/components/ui/use-toast';
import { parseParentInfo, parseMedicalNotes } from './pdf/healthDeclarationParser';

export const generateHealthDeclarationPdf = async (participantId: string) => {
  try {
    if (!participantId) throw new Error('מזהה המשתתף חסר או לא תקין');

    const [participant, healthDeclaration] = await Promise.all([
      getParticipant(participantId),
      getHealthDeclarationByParticipant(participantId),
    ]);

    if (!participant || !participant.firstName || !participant.lastName) {
      throw new Error('פרטי המשתתף לא נמצאו');
    }

    const fullName = `${participant.firstName} ${participant.lastName}`.trim();

    const declarationData = healthDeclaration ?? {
      id: 'טיוטה',
      participantId,
      token: '',
      formStatus: 'pending' as const,
      submissionDate: new Date().toISOString(),
      notes: null,
      signature: null,
      parentName: null,
      parentId: null,
    };

    const pdf = await createRtlPdf();

    // Parse parent info and medical notes from the notes field (legacy format)
    const { parentName, parentId } = parseParentInfo(declarationData.notes);
    const medicalNotes = parseMedicalNotes(declarationData.notes);

    const enhancedDeclaration = {
      id: declarationData.id,
      participant_id: participantId,
      submission_date: declarationData.submissionDate ?? null,
      notes: medicalNotes,
      form_status: declarationData.formStatus,
      signature: declarationData.signature ?? null,
      parent_name: declarationData.parentName ?? parentName,
      parent_id: declarationData.parentId ?? parentId,
    };

    const fileName = buildHealthDeclarationPDF(pdf, enhancedDeclaration, {
      firstname: participant.firstName,
      lastname: participant.lastName,
      idnumber: participant.idNumber,
      phone: participant.phone,
      fullName,
    });

    setTimeout(() => pdf.save(fileName), 100);

    toast({ title: 'PDF נוצר בהצלחה', description: 'הצהרת הבריאות נשמרה במכשיר שלך' });
    return fileName;
  } catch (error) {
    console.error('Error generating health declaration PDF:', error);
    toast({
      title: 'שגיאה',
      description: error instanceof Error ? error.message : 'אירעה שגיאה ביצירת ה-PDF',
      variant: 'destructive',
    });
    throw error;
  }
};
