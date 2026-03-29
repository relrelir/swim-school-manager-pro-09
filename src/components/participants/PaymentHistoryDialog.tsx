import React, { useState } from 'react';
import { Payment } from '@/types';
import { useData } from '@/context/DataContext';
import { auth } from '@/config/firebase';
import { reauthenticateWithCredential, EmailAuthProvider } from 'firebase/auth';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
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

type PendingAction = { type: 'edit'; payment: Payment } | { type: 'delete'; id: string };

const PaymentHistoryDialog: React.FC<PaymentHistoryDialogProps> = ({
  payments,
  participantName,
  isOpen,
  onOpenChange,
}) => {
  const { updatePayment, deletePayment } = useData();

  // edit row state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editAmount, setEditAmount] = useState('');
  const [editDate, setEditDate] = useState('');
  const [editReceipt, setEditReceipt] = useState('');

  // inline password confirmation state
  const [pending, setPending] = useState<PendingAction | null>(null);
  const [password, setPassword] = useState('');
  const [pwError, setPwError] = useState('');
  const [saving, setSaving] = useState(false);

  const total = payments.reduce((sum, p) => sum + p.amount, 0);

  // ── edit helpers ─────────────────────────────────────────────────────────────
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
    openPasswordPrompt({
      type: 'edit',
      payment: { ...p, amount, paymentDate: editDate, receiptNumber: editReceipt.trim() },
    });
  };

  const requestDelete = (id: string) => openPasswordPrompt({ type: 'delete', id });

  // ── password prompt (inline, no nested dialog) ────────────────────────────────
  const openPasswordPrompt = (action: PendingAction) => {
    setPending(action);
    setPassword('');
    setPwError('');
  };

  const cancelPassword = () => {
    setPending(null);
    setPassword('');
    setPwError('');
  };

  const confirmWithPassword = async () => {
    if (!password) { setPwError('יש להזין סיסמה'); return; }
    setSaving(true);
    setPwError('');
    try {
      const currentUser = auth.currentUser;
      if (!currentUser?.email) throw new Error('no-user');
      await reauthenticateWithCredential(
        currentUser,
        EmailAuthProvider.credential(currentUser.email, password),
      );
      if (pending?.type === 'edit') {
        await updatePayment(pending.payment);
        setEditingId(null);
      } else if (pending?.type === 'delete') {
        await deletePayment(pending.id);
      }
      setPending(null);
      setPassword('');
    } catch (e: unknown) {
      const msg = (e as Error)?.message ?? '';
      setPwError(
        msg.includes('wrong-password') || msg.includes('invalid-credential')
          ? 'סיסמה שגויה'
          : 'שגיאת אימות — נסה שנית',
      );
    } finally {
      setSaving(false);
    }
  };

  // ── render ───────────────────────────────────────────────────────────────────
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl" dir="rtl">
        <DialogHeader>
          <DialogTitle>היסטוריית תשלומים — {participantName}</DialogTitle>
        </DialogHeader>

        {/* ── inline password prompt ── */}
        {pending && (
          <div className="rounded-md border border-destructive/40 bg-destructive/5 p-4 flex flex-col gap-3">
            <p className="text-sm font-medium">
              {pending.type === 'delete' ? 'אישור מחיקת תשלום' : 'אישור עריכת תשלום'}
            </p>
            <p className="text-sm text-muted-foreground">
              לאישור הפעולה יש להזין את סיסמת המנהל.
            </p>
            <div className="flex flex-col gap-1">
              <Label htmlFor="pw-confirm">סיסמת מנהל</Label>
              <Input
                id="pw-confirm"
                type="password"
                autoFocus
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && confirmWithPassword()}
                placeholder="הזן סיסמה..."
                className="h-8"
              />
              {pwError && <p className="text-sm text-destructive">{pwError}</p>}
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant={pending.type === 'delete' ? 'destructive' : 'default'}
                disabled={saving}
                onClick={confirmWithPassword}
              >
                {saving ? 'מאמת...' : pending.type === 'delete' ? 'מחק' : 'שמור'}
              </Button>
              <Button size="sm" variant="outline" disabled={saving} onClick={cancelPassword}>
                ביטול
              </Button>
            </div>
          </div>
        )}

        {/* ── payments table ── */}
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
  );
};

export default PaymentHistoryDialog;
