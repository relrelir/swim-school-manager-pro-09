import { getRegistration } from '@/services/firebase/registrations';
import { getParticipant } from '@/services/firebase/participants';
import { getPaymentsByRegistration } from '@/services/firebase/payments';
import { getProduct } from '@/services/firebase/products';
import { createRtlPdf } from './pdf/pdfConfig';
import { buildRegistrationPDF } from './pdf/registrationPdfContentBuilder';
import { toast } from '@/components/ui/use-toast';

export const generateRegistrationPdf = async (registrationId: string) => {
  try {
    const registration = await getRegistration(registrationId);
    if (!registration) throw new Error('פרטי הרישום לא נמצאו');

    const [participant, payments, product] = await Promise.all([
      getParticipant(registration.participantId),
      getPaymentsByRegistration(registrationId),
      getProduct(registration.productId),
    ]);

    if (!participant) throw new Error('פרטי המשתתף לא נמצאו');
    if (!product) throw new Error('פרטי הקורס לא נמצאו');

    const pdf = await createRtlPdf();
    const fileName = buildRegistrationPDF(pdf, registration, participant, payments, product.name);
    pdf.save(fileName);

    toast({ title: 'PDF נוצר בהצלחה', description: 'אישור הרישום נשמר במכשיר שלך' });
    return fileName;
  } catch (error) {
    console.error('Error generating registration PDF:', error);
    toast({
      title: 'שגיאה',
      description: error instanceof Error ? error.message : 'אירעה שגיאה ביצירת ה-PDF',
      variant: 'destructive',
    });
    throw error;
  }
};
