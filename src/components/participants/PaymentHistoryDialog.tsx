import React from 'react';
import { Payment } from '@/types';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';

interface PaymentHistoryDialogProps {
  payments: Payment[];
  participantName: string;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

const PaymentHistoryDialog: React.FC<PaymentHistoryDialogProps> = ({
  payments,
  participantName,
  isOpen,
  onOpenChange,
}) => {
  const total = payments.reduce((sum, p) => sum + p.amount, 0);

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString('he-IL');
    } catch {
      return dateStr;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg" dir="rtl">
        <DialogHeader>
          <DialogTitle>היסטוריית תשלומים — {participantName}</DialogTitle>
        </DialogHeader>

        {payments.length === 0 ? (
          <p className="text-center text-muted-foreground py-6">אין תשלומים רשומים</p>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-right">תאריך</TableHead>
                  <TableHead className="text-right">סכום</TableHead>
                  <TableHead className="text-right">מס׳ קבלה</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell>{formatDate(payment.paymentDate)}</TableCell>
                    <TableCell className="font-medium">
                      {new Intl.NumberFormat('he-IL', { style: 'currency', currency: 'ILS' }).format(payment.amount)}
                    </TableCell>
                    <TableCell className="text-muted-foreground">{payment.receiptNumber}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <div className="border-t pt-3 flex justify-between text-sm font-semibold">
              <span>סה״כ שולם:</span>
              <span>{new Intl.NumberFormat('he-IL', { style: 'currency', currency: 'ILS' }).format(total)}</span>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default PaymentHistoryDialog;
