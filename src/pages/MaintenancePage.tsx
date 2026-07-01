import { useMemo, useState } from 'react';
import { useData } from '@/context/DataContext';
import { useAuth } from '@/context/AuthContext';
import { toast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { AlertTriangle, Trash2, CheckCircle } from 'lucide-react';
import type { Registration } from '@/types';

/**
 * Admin-only maintenance tool.
 *
 * Finds "orphaned" registration documents — registrations whose participant,
 * product, or season no longer exists. These inflate the participant counts on
 * the products/pool tables (which count raw registrations) even though they
 * never render on the participants page (which drops incomplete records).
 *
 * Deleting an orphan also removes its now-orphaned payment docs and any health
 * declaration tied specifically to that registration.
 */
interface OrphanRow {
  registration: Registration;
  reasons: string[];
  paymentCount: number;
}

export default function MaintenancePage() {
  const {
    registrations, products, participants, seasons, payments, healthDeclarations,
    deleteRegistration, deletePayment, deleteHealthDeclaration,
  } = useData();
  const { isAdmin } = useAuth();

  const [confirmAll, setConfirmAll] = useState(false);
  const [busy, setBusy] = useState(false);

  // An orphan is a registration missing any of its required relations.
  const orphans = useMemo<OrphanRow[]>(() => {
    return registrations
      .map((reg) => {
        const product = products.find((p) => p.id === reg.productId);
        const participant = participants.find((p) => p.id === reg.participantId);
        const season = product ? seasons.find((s) => s.id === product.seasonId) : undefined;

        const reasons: string[] = [];
        if (!participant) reasons.push('משתתף חסר');
        if (!product) reasons.push('מוצר חסר');
        else if (!season) reasons.push('עונה חסרה');

        if (reasons.length === 0) return null;
        const paymentCount = payments.filter((p) => p.registrationId === reg.id).length;
        return { registration: reg, reasons, paymentCount };
      })
      .filter((x): x is OrphanRow => x !== null);
  }, [registrations, products, participants, seasons, payments]);

  const deleteOrphan = async (reg: Registration) => {
    // Remove now-orphaned payments tied to this registration.
    const regPayments = payments.filter((p) => p.registrationId === reg.id);
    for (const pay of regPayments) {
      await deletePayment(pay.id);
    }
    // Remove any health declaration tied specifically to this registration.
    const regHealth = healthDeclarations.filter((hd) => hd.registrationId === reg.id);
    for (const hd of regHealth) {
      await deleteHealthDeclaration(hd.id);
    }
    await deleteRegistration(reg.id);
  };

  const handleDeleteOne = async (reg: Registration) => {
    if (!isAdmin()) return;
    if (!window.confirm('למחוק את הרישום היתום הזה ואת התשלומים/הצהרות הבריאות המשויכים אליו?')) return;
    setBusy(true);
    try {
      await deleteOrphan(reg);
      toast({ title: 'הרישום היתום נמחק' });
    } catch (err) {
      console.error('Error deleting orphan:', err);
      toast({ title: 'שגיאה', description: 'אירעה שגיאה במחיקה', variant: 'destructive' });
    } finally {
      setBusy(false);
    }
  };

  const handleDeleteAll = async () => {
    if (!isAdmin()) return;
    setConfirmAll(false);
    setBusy(true);
    let deleted = 0;
    try {
      for (const { registration } of orphans) {
        await deleteOrphan(registration);
        deleted += 1;
      }
      toast({ title: 'הניקוי הושלם', description: `נמחקו ${deleted} רישומים יתומים` });
    } catch (err) {
      console.error('Error during bulk cleanup:', err);
      toast({
        title: 'שגיאה',
        description: `הניקוי נעצר לאחר ${deleted} מחיקות. נסה שוב.`,
        variant: 'destructive',
      });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="container mx-auto p-4 space-y-4" dir="rtl">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">תחזוקת נתונים</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            רישומים יתומים
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            רישומים שהמשתתף, המוצר או העונה שלהם כבר לא קיימים. הם מנפחים את מונה
            המשתתפים בטבלת המוצרים אף שאינם מופיעים ברשימת המשתתפים. מחיקתם מנקה גם
            את התשלומים והצהרות הבריאות המשויכים להם בלבד.
          </p>

          {orphans.length === 0 ? (
            <div className="flex items-center gap-2 rounded-md bg-green-50 p-4 text-green-700">
              <CheckCircle className="h-5 w-5" />
              <span>לא נמצאו רישומים יתומים — הנתונים נקיים.</span>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">נמצאו {orphans.length} רישומים יתומים</span>
                {isAdmin() && (
                  <Button
                    variant="destructive"
                    size="sm"
                    disabled={busy}
                    onClick={() => setConfirmAll(true)}
                  >
                    <Trash2 className="h-4 w-4 ml-1" />
                    מחק את כולם
                  </Button>
                )}
              </div>

              <div className="w-full overflow-x-auto rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>מזהה רישום</TableHead>
                      <TableHead>תאריך רישום</TableHead>
                      <TableHead>סכום נדרש</TableHead>
                      <TableHead>סיבה</TableHead>
                      <TableHead>תשלומים</TableHead>
                      {isAdmin() && <TableHead>פעולה</TableHead>}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orphans.map(({ registration, reasons, paymentCount }) => (
                      <TableRow key={registration.id}>
                        <TableCell className="font-mono text-xs">{registration.id}</TableCell>
                        <TableCell>{registration.registrationDate}</TableCell>
                        <TableCell>{registration.requiredAmount}</TableCell>
                        <TableCell>
                          <span className="text-amber-700">{reasons.join(', ')}</span>
                        </TableCell>
                        <TableCell>{paymentCount || '-'}</TableCell>
                        {isAdmin() && (
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-destructive"
                              disabled={busy}
                              onClick={() => handleDeleteOne(registration)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        )}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={confirmAll} onOpenChange={setConfirmAll}>
        <AlertDialogContent dir="rtl">
          <AlertDialogHeader>
            <AlertDialogTitle>מחיקת כל הרישומים היתומים</AlertDialogTitle>
            <AlertDialogDescription>
              פעולה זו תמחק לצמיתות {orphans.length} רישומים יתומים, כולל
              התשלומים והצהרות הבריאות המשויכים אליהם. לא ניתן לבטל.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>ביטול</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteAll}
              className="bg-destructive text-destructive-foreground"
            >
              מחק את כולם
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
