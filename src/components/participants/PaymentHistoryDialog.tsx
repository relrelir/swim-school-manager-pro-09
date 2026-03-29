import React, { useState } from 'react';
import { Payment } from '@/types';
import { useData } from '@/context/DataContext';
import { useAuth } from '@/context/AuthContext';
import { auth } from '@/config/firebase';
import { reauthenticateWithCredential, EmailAuthProvider } from 'firebase/auth';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle,
  AlertDialogDescription, AlertDialogFooter,
} from '@/components/ui/alert-dialog';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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

// ── password confirmation dialog ──────────────────────────────────────────────
interface PasswordConfirmProps {
  open: boolean;
  title: string;
  onConfirm: (password: string) => Promise<void>;
  onCancel: () => void;
}

const PasswordConfirmDialog: React.FC<PasswordConfirmProps> = ({
  open, title, onConfirm, onCancel,
}) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    if (!password) { setError('יש להזין סיסמה'); return; }
    setLoading(true);
    setError('');
    try {
      await onConfirm(password);
      setPassword('');
    } catch (e: unknown) {
      const msg = (e as Error)?.message ?? '';
      setError(
        msg.includes('wrong-password') || msg.includes('invalid-credential')
          ? 'סיסמה שגויה'
          : 'שגיאת אימות — נסה שנית',
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setPassword('');
    setError('');
    onCancel();
  };

  return (
    <AlertDialog open={open}>
      <AlertDialogContent dir="rtl">
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>
            לאישור הפעולה יש להזין את סיסמת המנהל.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="flex flex-col gap-2 py-2">
          <Label htmlFor="admin-pw">סיסמת מנהל</Label>
          <Input
            id="admin-pw"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleConfirm()}
            autoFocus
            placeholder="הזן סיסמה..."
          />
          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>
        <AlertDialogFooter className="flex-row-reverse gap-2">
          <Button onClick={handleConfirm} disabled={loading}>
            {loading ? 'מאמת...' : 'אשר'}
          </Button>
          <Button variant="outline" onClick={handleCancel} disabled={loading}>
            ביטול
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

// ── main component ─────────────────────────────────────────────────────────────
const PaymentHistoryDialog: React.FC<PaymentHistoryDialogProps> = ({
  payments,
  participantName,
  isOpen,
  onOpenChange,
}) => {
  const { updatePayment, deletePayment } = useData();
  const { user } = useAuth();

  // edit state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editAmount, setEditAmount] = useState('');
  const [editDate, setEditDate] = useState('');
  const [editReceipt, setEditReceipt] = useState('');

  // pending action awaiting password
  type PendingAction = { type: 'edit'; payment: Payment } | { type: 'delete'; id: string };
  const [pending, setPending] = useState<PendingAction | null>(null);

  const total = payments.reduce((sum, p) => sum + p.amount, 0);

  // ── helpers ──────────────────────────────────────────────────────────────────
  const reauthenticate = async (password: string) => {
    const currentUser = auth.currentUser;
    if (!currentUser || !currentUser.email) throw new Error('no-user');
    const credential = EmailAuthProvider.credential(currentUser.email, password);
    await reauthenticateWithCredential(currentUser, credential);
  };

  const startEdit = (p: Payment) => {
    setEditingId(p.id);
    setEditAmount(String(p.amount));
    setEditDate(p.paymentDate);
    setEditReceipt(p.receiptNumber);
  };

  const cancelEdit = () => setEditingId(null);

  const requestSave = (p: Payment) => {
    const amount = parseFloat(editAmount);
    if (isNaN(amount) || amount < 0) return;
    setPending({
      type: 'edit',
      payment: { ...p, amount, paymentDate: editDate, receiptNumber: editReceipt.trim() },
    });
  };

  const requestDelete = (id: string) => setPending({ type: 'delete', id });

  const handlePasswordConfirm = async (password: string) => {
    await reauthenticate(password);          // throws on wrong password
    if (!pending) return;
    if (pending.type === 'edit') {
      await updatePayment(pending.payment);
      setEditingId(null);
    } else {
      await deletePayment(pending.id);
    }
    setPending(null);
  };

  // ── render ───────────────────────────────────────────────────────────────────
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
                    <TableHead />
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
                              onClick={() => requestSave(payment)}
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
                              onClick={() => requestDelete(payment.id)}
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

      <PasswordConfirmDialog
        open={!!pending}
        title={pending?.type === 'delete' ? 'מחיקת תשלום' : 'עריכת תשלום'}
        onConfirm={handlePasswordConfirm}
        onCancel={() => setPending(null)}
      />
    </>
  );
};

export default PaymentHistoryDialog;
