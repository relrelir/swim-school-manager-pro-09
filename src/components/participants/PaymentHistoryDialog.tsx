import React, { useState, useEffect } from 'react';
import { Payment } from '@/types';
import { useData } from '@/context/DataContext';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Pencil, Trash2, Check, X } from 'lucide-react';

interface PaymentHistoryDialogProps {
  payments: Payment[];
  participantName: string;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('he-IL', { style: 'currency', currency: 'ILS' }).format(amount);

const formatDate = (dateStr: string) => {
  try { return new Date(dateStr).toLocaleDateString('he-IL'); } catch { return dateStr; }
};

const PaymentHistoryDialog: React.FC<PaymentHistoryDialogProps> = ({
  payments,
  participantName,
  isOpen,
  onOpenChange,
}) => {
  const { updatePayment, deletePayment } = useData();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editAmount, setEditAmount] = useState('');
  const [editDate, setEditDate] = useState('');
  const [editReceipt, setEditReceipt] = useState('');
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) {
      setEditingId(null);
      setSaving(false);
      setDeleteId(null);
    }
  }, [isOpen]);

  const total = payments.reduce((sum, p) => sum + p.amount, 0);

  const startEdit = (p: Payment) => {
    setEditingId(p.id);
    setEditAmount(String(p.amount));
    setEditDate(p.paymentDate);
    setEditReceipt(p.receiptNumber);
  };

  const cancelEdit = () => setEditingId(null);

  const handleSave = async (p: Payment) => {
    const amount = parseFloat(editAmount);
    if (isNaN(amount) || amount < 0) return;
    setSaving(true);
    try {
      await updatePayment({ ...p, amount, paymentDate: editDate, receiptNumber: editReceipt.trim() });
      setEditingId(null);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    await deletePayment(deleteId);
    setDeleteId(null);
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-xl" dir="rtl">
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
                    <TableHead className="w-20" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payments.map((payment) =>
                    editingId === payment.id ? (
                      <TableRow key={payment.id}>
                        <TableCell>
                          <Input
                            type="date"
                            value={editDate}
                            onChange={(e) => setEditDate(e.target.value)}
                            className="h-8 text-sm"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            min="0"
                            value={editAmount}
                            onChange={(e) => setEditAmount(e.target.value)}
                            className="h-8 text-sm w-24"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            value={editReceipt}
                            onChange={(e) => setEditReceipt(e.target.value)}
                            className="h-8 text-sm"
                          />
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button
                              variant="ghost" size="icon"
                              className="h-7 w-7 text-green-600"
                              disabled={saving}
                              onClick={() => handleSave(payment)}
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost" size="icon"
                              className="h-7 w-7"
                              onClick={cancelEdit}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      <TableRow key={payment.id}>
                        <TableCell>{formatDate(payment.paymentDate)}</TableCell>
                        <TableCell className="font-medium">{formatCurrency(payment.amount)}</TableCell>
                        <TableCell className="text-muted-foreground">{payment.receiptNumber}</TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button
                              variant="ghost" size="icon"
                              className="h-7 w-7"
                              onClick={() => startEdit(payment)}
                            >
                              <Pencil className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              variant="ghost" size="icon"
                              className="h-7 w-7 text-destructive hover:text-destructive"
                              onClick={() => setDeleteId(payment.id)}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  )}
                </TableBody>
              </Table>

              <div className="border-t pt-3 flex justify-between text-sm font-semibold">
                <span>סה״כ שולם:</span>
                <span>{formatCurrency(total)}</span>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent dir="rtl">
          <AlertDialogHeader>
            <AlertDialogTitle>מחיקת תשלום</AlertDialogTitle>
            <AlertDialogDescription>
              האם אתה בטוח שברצונך למחוק את התשלום? לא ניתן לבטל פעולה זו.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>ביטול</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={handleDelete}
            >
              מחק
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default PaymentHistoryDialog;
