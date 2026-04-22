import React, { useRef } from 'react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Printer, Download } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Payment } from '@/types';
import { formatCurrencyForUI } from '@/utils/formatters';

interface PrintableRegistrationProps {
  participantName: string;
  participantIdNumber: string;
  participantPhone: string;
  productName: string;
  registrationDate: string;
  effectiveRequiredAmount: number;
  healthApproval: boolean;
  paymentStatusText: string;
  payments: Payment[];
}

const PrintableRegistration: React.FC<PrintableRegistrationProps> = ({
  participantName,
  participantIdNumber,
  participantPhone,
  productName,
  registrationDate,
  effectiveRequiredAmount,
  healthApproval,
  paymentStatusText,
  payments,
}) => {
  const { toast } = useToast();
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    window.print();
  };

  const handleExportImage = async () => {
    try {
      const htmlToImage = await import('html-to-image');
      if (!printRef.current) throw new Error('Could not find content');
      const dataUrl = await htmlToImage.toPng(printRef.current, { quality: 1 });
      const link = document.createElement('a');
      link.download = `אישור_רישום_${participantName.replace(/\s+/g, '_')}.png`;
      link.href = dataUrl;
      link.click();
      toast({ title: 'התמונה נוצרה בהצלחה', description: 'אישור הרישום נשמר כתמונה' });
    } catch (error) {
      console.error('Error generating image:', error);
      toast({ title: 'שגיאה בייצוא', description: 'אירעה שגיאה בעת יצירת התמונה', variant: 'destructive' });
    }
  };

  const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);

  return (
    <div className="p-4 max-w-3xl mx-auto" dir="rtl">
      <div className="flex justify-between mb-6 print:hidden">
        <h1 className="text-2xl font-bold">אישור רישום</h1>
        <div className="flex gap-2">
          <Button onClick={handlePrint} className="flex items-center gap-2">
            <Printer className="h-4 w-4" />
            הדפסה
          </Button>
          <Button onClick={handleExportImage} variant="outline" className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            שמירה כתמונה
          </Button>
        </div>
      </div>

      <div
        ref={printRef}
        className="bg-white p-6 border rounded-md shadow-sm print:shadow-none print:border-none print:p-0 print:max-w-full"
        dir="rtl"
      >
        {/* Header */}
        <div className="mb-6 text-center border-b pb-4">
          <h1 className="text-2xl font-bold mb-1">אישור רישום</h1>
          <p className="text-lg font-semibold text-gray-700">{productName}</p>
          <p className="text-sm text-gray-500 mt-1">{`תאריך הפקה: ${format(new Date(), 'dd/MM/yyyy')}`}</p>
        </div>

        {/* Participant */}
        <div className="mb-6 print:break-inside-avoid">
          <h3 className="text-lg font-semibold mb-3 border-b pb-1">פרטי משתתף</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="font-semibold mb-1">שם מלא:</p>
              <p>{participantName}</p>
            </div>
            <div>
              <p className="font-semibold mb-1">תעודת זהות:</p>
              <p className="ltr-content">{participantIdNumber || 'לא צוין'}</p>
            </div>
            <div>
              <p className="font-semibold mb-1">טלפון:</p>
              <p className="ltr-content">{participantPhone || 'לא צוין'}</p>
            </div>
          </div>
        </div>

        {/* Registration details */}
        <div className="mb-6 pt-2 print:break-inside-avoid">
          <h3 className="text-lg font-semibold mb-3 border-b pb-1">פרטי רישום</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="font-semibold mb-1">תאריך רישום:</p>
              <p className="ltr-content">{format(new Date(registrationDate), 'dd/MM/yyyy')}</p>
            </div>
            <div>
              <p className="font-semibold mb-1">מוצר:</p>
              <p>{productName}</p>
            </div>
            <div>
              <p className="font-semibold mb-1">סכום לתשלום:</p>
              <p>{formatCurrencyForUI(effectiveRequiredAmount)}</p>
            </div>
            <div>
              <p className="font-semibold mb-1">הצהרת בריאות:</p>
              <p>{healthApproval ? 'כן' : 'לא'}</p>
            </div>
            <div>
              <p className="font-semibold mb-1">סטטוס תשלום:</p>
              <p>{paymentStatusText}</p>
            </div>
          </div>
        </div>

        {/* Payments table */}
        {payments.length > 0 && (
          <div className="pt-2 print:break-inside-avoid">
            <h3 className="text-lg font-semibold mb-3 border-b pb-1">פרטי תשלומים</h3>
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-300 px-3 py-2 text-right">תאריך תשלום</th>
                  <th className="border border-gray-300 px-3 py-2 text-right">מספר קבלה</th>
                  <th className="border border-gray-300 px-3 py-2 text-right">סכום</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((payment) => (
                  <tr key={payment.id}>
                    <td className="border border-gray-300 px-3 py-2 ltr-content">
                      {format(new Date(payment.paymentDate), 'dd/MM/yyyy')}
                    </td>
                    <td className="border border-gray-300 px-3 py-2 ltr-content">
                      {payment.receiptNumber || '—'}
                    </td>
                    <td className="border border-gray-300 px-3 py-2">
                      {formatCurrencyForUI(payment.amount)}
                    </td>
                  </tr>
                ))}
                <tr className="bg-gray-50 font-semibold">
                  <td className="border border-gray-300 px-3 py-2" colSpan={2}>סה"כ שולם</td>
                  <td className="border border-gray-300 px-3 py-2">{formatCurrencyForUI(totalPaid)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {/* Signature line */}
        <div className="mt-8 pt-4 border-t print:break-inside-avoid">
          <div className="flex justify-between items-end">
            <div className="text-center">
              <div className="h-px w-40 bg-gray-400 mb-1" />
              <p className="text-sm text-gray-500">חתימת הורה/אפוטרופוס</p>
            </div>
            <div className="text-center">
              <div className="h-px w-40 bg-gray-400 mb-1" />
              <p className="text-sm text-gray-500">חותמת המוסד</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrintableRegistration;
