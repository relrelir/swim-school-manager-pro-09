import { useEffect, useState } from 'react';
import { writeBatch, doc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '@/config/firebase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Check, PlusCircle, X, MessageCircle, Mail, Copy, CheckCircle } from 'lucide-react';
import { getProductsBySeason, createProduct } from '@/services/firebase/products';
import { useSeasonProducts } from '@/hooks/useSeasonProducts';
import { useData } from '@/context/DataContext';
import { toast } from '@/components/ui/use-toast';
import {
  sendHealthDeclarationByWhatsApp,
  sendHealthDeclarationByEmail,
  copyHealthDeclarationLink,
} from '@/services/notifications/sendHealthDeclaration';
import ProductFormFields from '@/components/products/ProductFormFields';
import type { Lead, Season, Pool, Product, ProductType } from '@/types';
import type { HealthDeclarationSendInfo } from '@/components/participants/SendHealthDeclarationDialog';

/* ── helper ── */
const makeEmptyProduct = (seasonId: string, poolId: string): Omit<Product, 'id'> => ({
  name: '',
  type: 'קורס' as ProductType,
  startDate: new Date().toISOString().split('T')[0],
  endDate: '',
  price: 0,
  maxParticipants: 10,
  notes: '',
  seasonId,
  poolId,
  meetingsCount: 1,
  daysOfWeek: [],
  startTime: '',
  active: true,
});

interface Props {
  lead: Lead;
  seasons: Season[];
  pools: Pool[];
  open: boolean;
  onOpenChange: (o: boolean) => void;
  onDone: () => void;
}

export function ConvertToRegistrationDialog({ lead, seasons, pools, open, onOpenChange, onDone }: Props) {
  const { addHealthDeclaration } = useData();

  /* ── registration state ── */
  const [seasonId, setSeasonId] = useState('');
  const [poolId, setPoolId] = useState('');
  const [productId, setProductId] = useState('');
  const [allSeasonProducts, setAllSeasonProducts] = useState<Product[]>([]);
  const [receiptNumber, setReceiptNumber] = useState('');
  const [paidAmount, setPaidAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);
  const [healthSendInfo, setHealthSendInfo] = useState<HealthDeclarationSendInfo | null>(null);
  const [linkCopied, setLinkCopied] = useState(false);

  /* ── add-product inline state ── */
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [newProduct, setNewProduct] = useState<Omit<Product, 'id'>>(makeEmptyProduct('', ''));
  const [calculatedEndDate, setCalculatedEndDate] = useState<string | null>(null);
  const [addingProduct, setAddingProduct] = useState(false);

  const { calculateEndDate } = useSeasonProducts();

  /* ── derived ── */
  const filteredPools = pools.filter(p => p.seasonId === seasonId);
  const products = poolId ? allSeasonProducts.filter(p => p.poolId === poolId) : [];
  const selectedProduct = allSeasonProducts.find(p => p.id === productId);

  /* ── effects ── */
  useEffect(() => {
    setPoolId('');
    setProductId('');
    setAllSeasonProducts([]);
    setShowAddProduct(false);
    if (seasonId) {
      getProductsBySeason(seasonId).then(setAllSeasonProducts).catch(console.error);
    }
  }, [seasonId]);

  useEffect(() => {
    setProductId('');
    setShowAddProduct(false);
    if (poolId && seasonId) {
      setNewProduct(makeEmptyProduct(seasonId, poolId));
      setCalculatedEndDate(null);
    }
  }, [poolId, seasonId]);

  /* Auto-calculate end date for new product */
  useEffect(() => {
    if (
      newProduct.startDate &&
      newProduct.daysOfWeek &&
      newProduct.daysOfWeek.length > 0 &&
      newProduct.meetingsCount
    ) {
      const endDate = calculateEndDate(
        newProduct.startDate,
        newProduct.meetingsCount,
        newProduct.daysOfWeek,
      );
      setCalculatedEndDate(endDate);
      setNewProduct(prev => ({ ...prev, endDate }));
    }
  }, [newProduct.startDate, newProduct.daysOfWeek, newProduct.meetingsCount, calculateEndDate]);

  /* ── reset ── */
  const reset = () => {
    setSeasonId(''); setPoolId(''); setProductId('');
    setAllSeasonProducts([]); setReceiptNumber(''); setPaidAmount('');
    setError(''); setDone(false); setHealthSendInfo(null); setLinkCopied(false);
    setShowAddProduct(false);
    setNewProduct(makeEmptyProduct('', ''));
    setCalculatedEndDate(null);
  };

  /* ── create new product inline ── */
  const handleCreateProduct = async () => {
    if (!newProduct.name.trim()) {
      setError('יש להזין שם מוצר');
      return;
    }
    setAddingProduct(true);
    setError('');
    try {
      const created = await createProduct({ ...newProduct, seasonId, poolId });
      // Refresh product list
      const refreshed = await getProductsBySeason(seasonId);
      setAllSeasonProducts(refreshed);
      // Auto-select new product
      setProductId(created.id);
      setShowAddProduct(false);
      setNewProduct(makeEmptyProduct(seasonId, poolId));
      setCalculatedEndDate(null);
    } catch (e) {
      console.error(e);
      setError('שגיאה ביצירת המוצר. אנא נסה שנית.');
    } finally {
      setAddingProduct(false);
    }
  };

  /* ── confirm registration ── */
  const handleConfirm = async () => {
    if (!productId) { setError('יש לבחור מוצר'); return; }
    if (!receiptNumber.trim()) { setError('יש להזין מספר קבלה'); return; }
    const paid = parseFloat(paidAmount);
    if (paidAmount.trim() === '' || isNaN(paid) || paid < 0) {
      setError('יש להזין סכום ששולם (0 אם לא שולם)');
      return;
    }
    if (!selectedProduct) return;

    setLoading(true);
    setError('');
    try {
      const batch = writeBatch(db);
      const alreadyConverted = !!lead.convertedToParticipantId;

      let participantId: string;

      if (alreadyConverted) {
        // Lead was already converted — reuse the existing participant
        participantId = lead.convertedToParticipantId!;
      } else {
        // First conversion — create a new Participant
        const [firstName, ...rest] = lead.name.trim().split(' ');
        const lastName = rest.join(' ') || firstName;
        const participantRef = doc(collection(db, 'participants'));
        batch.set(participantRef, {
          firstName,
          lastName,
          idNumber: lead.idNumber,
          phone: lead.phone,
          healthApproval: false,
          createdAt: new Date().toISOString(),
        });
        participantId = participantRef.id;
      }

      // Create Registration (always)
      const registrationRef = doc(collection(db, 'registrations'));
      batch.set(registrationRef, {
        participantId,
        productId,
        registrationDate: new Date().toISOString().split('T')[0],
        requiredAmount: selectedProduct.effectivePrice ?? selectedProduct.price,
        paidAmount: paid,
        receiptNumber: receiptNumber.trim(),
        discountAmount: null,
        discountApproved: false,
        createdAt: new Date().toISOString(),
      });

      // Create initial Payment document inside the batch so all three writes
      // (Participant, Registration, Payment) succeed or fail together.
      if (paid > 0) {
        const paymentRef = doc(collection(db, 'payments'));
        batch.set(paymentRef, {
          registrationId: registrationRef.id,
          amount: paid,
          paymentDate: new Date().toISOString().split('T')[0],
          receiptNumber: receiptNumber.trim(),
          createdAt: serverTimestamp(),
        });
      }

      // Update Lead
      const leadUpdate: Record<string, unknown> = { updatedAt: new Date().toISOString() };
      if (!alreadyConverted) {
        leadUpdate.status = 'רשום';
        leadUpdate.convertedToParticipantId = participantId;
      }
      batch.update(doc(db, 'leads', lead.id), leadUpdate);

      // Commit Participant + Registration + Payment + Lead update atomically.
      await batch.commit();

      // Auto-create health declaration and immediately send via WhatsApp.
      // This runs only after the batch has fully succeeded.
      let healthSent = false;
      try {
        const healthDecl = await addHealthDeclaration({
          participantId,
          token: '',
          formStatus: 'pending',
          submissionDate: null,
          notes: null,
          signature: null,
          parentName: null,
          parentId: null,
          createdAt: new Date().toISOString(),
          sentAt: null,
        });
        if (healthDecl?.token) {
          const healthFormUrl = `${window.location.origin}/health-form/${healthDecl.token}`;
          setHealthSendInfo({
            participantId,
            participantName: lead.name,
            phone: lead.phone,
            email: lead.email ?? '',
            healthFormUrl,
          });
          // Auto-trigger WhatsApp — opens a pre-filled wa.me deep link in a new tab.
          sendHealthDeclarationByWhatsApp(lead.name, lead.phone, healthFormUrl);
          healthSent = true;
        }
      } catch (healthErr) {
        console.error('Error creating health declaration:', healthErr);
        // Non-fatal — registration and payment already committed successfully.
      }

      toast({
        title: 'הרישום הושלם בהצלחה!',
        description: healthSent
          ? 'הרישום נוצר, התשלום נרשם והצהרת הבריאות נשלחה ב-WhatsApp.'
          : 'הרישום נוצר והתשלום נרשם. הצהרת הבריאות לא נשלחה — ניתן לשלוח ידנית.',
      });

      setDone(true);
      // NOTE: Do NOT call onDone() here.
      // onDone() unmounts the component in the same React render batch as setDone(true),
      // which prevents the success screen (and health declaration send options) from showing.
      // The dialog is closed by the user via the "סגור/דלג" button → onOpenChange(false).
    } catch (e) {
      console.error(e);
      setError('אירעה שגיאה. אנא נסה שנית.');
    } finally {
      setLoading(false);
    }
  };

  /* ── success screen ── */
  if (done) {
    return (
      <Dialog open={open} onOpenChange={(o) => { onOpenChange(o); if (!o) reset(); }}>
        <DialogContent className="max-w-sm" dir="rtl">
          <div className="flex flex-col items-center gap-4 py-4">
            <div className="rounded-full bg-green-100 p-4">
              <Check className="h-10 w-10 text-green-600" />
            </div>
            <p className="text-lg font-semibold">הרישום בוצע בהצלחה!</p>
            <p className="text-sm text-muted-foreground text-center">
              {lead.convertedToParticipantId
                ? `${lead.name} נרשם/ה למוצר נוסף בהצלחה.`
                : `${lead.name} נרשם/ה למוצר ונוסף/ה לרשימת המשתתפים.`}
            </p>

            {healthSendInfo && (
              <div className="w-full space-y-2 pt-2 border-t">
                <p className="text-sm font-medium text-center">שליחת הצהרת בריאות</p>
                <Button
                  className="w-full gap-2 bg-green-500 hover:bg-green-600 text-white"
                  onClick={() => {
                    sendHealthDeclarationByWhatsApp(healthSendInfo.participantName, healthSendInfo.phone, healthSendInfo.healthFormUrl);
                    toast({ title: 'נפתח WhatsApp', description: 'שלחו את ההודעה לחתימה' });
                  }}
                >
                  <MessageCircle className="h-4 w-4" />
                  שלח ב-WhatsApp ({healthSendInfo.phone})
                </Button>
                <Button
                  variant="outline"
                  className="w-full gap-2"
                  onClick={() => {
                    sendHealthDeclarationByEmail(healthSendInfo.participantName, healthSendInfo.email ?? '', healthSendInfo.healthFormUrl);
                    toast({ title: 'נפתח לקוח מייל' });
                  }}
                >
                  <Mail className="h-4 w-4" />
                  שלח במייל
                </Button>
                <Button
                  variant="outline"
                  className="w-full gap-2"
                  onClick={async () => {
                    const ok = await copyHealthDeclarationLink(healthSendInfo.healthFormUrl);
                    if (ok) { setLinkCopied(true); toast({ title: 'הקישור הועתק' }); setTimeout(() => setLinkCopied(false), 3000); }
                  }}
                >
                  {linkCopied ? <><CheckCircle className="h-4 w-4 text-green-500" /> הועתק!</> : <><Copy className="h-4 w-4" /> העתק קישור</>}
                </Button>
              </div>
            )}

            <Button className="w-full" variant={healthSendInfo ? 'ghost' : 'default'} onClick={() => { onOpenChange(false); reset(); }}>
              {healthSendInfo ? 'דלג — אשלח מאוחר יותר' : 'סגור'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  /* ── main dialog ── */
  return (
    <Dialog open={open} onOpenChange={(o) => { onOpenChange(o); if (!o) reset(); }}>
      <DialogContent
        className={`transition-all duration-200 ${showAddProduct ? 'max-w-2xl' : 'max-w-md'}`}
        dir="rtl"
      >
        <DialogHeader>
          <DialogTitle>שיוך לקורס — {lead.name}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2 max-h-[75vh] overflow-y-auto pr-1">

          {/* Lead summary */}
          <div className="bg-muted/50 rounded-md px-3 py-2 text-sm space-y-1">
            <p><span className="text-muted-foreground">ת.ז: </span>{lead.idNumber}</p>
            <p><span className="text-muted-foreground">טלפון: </span>{lead.phone}</p>
            <p><span className="text-muted-foreground">אימייל: </span>{lead.email}</p>
          </div>

          {/* Season */}
          <div className="space-y-1">
            <Label>עונה *</Label>
            <Select value={seasonId} onValueChange={setSeasonId}>
              <SelectTrigger><SelectValue placeholder="בחר עונה" /></SelectTrigger>
              <SelectContent>
                {seasons.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          {/* Pool */}
          <div className="space-y-1">
            <Label>בריכה *</Label>
            <Select value={poolId} onValueChange={setPoolId} disabled={!seasonId}>
              <SelectTrigger>
                <SelectValue placeholder={seasonId ? 'בחר בריכה' : 'בחר עונה תחילה'} />
              </SelectTrigger>
              <SelectContent>
                {filteredPools.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          {/* Product selector + add button */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <Label>קורס / חוג / קייטנה *</Label>
              {poolId && !showAddProduct && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-7 text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-50 gap-1"
                  onClick={() => setShowAddProduct(true)}
                >
                  <PlusCircle className="h-3.5 w-3.5" />
                  הוסף מוצר חדש
                </Button>
              )}
            </div>
            <Select value={productId} onValueChange={setProductId} disabled={!poolId || showAddProduct}>
              <SelectTrigger>
                <SelectValue placeholder={poolId ? 'בחר מוצר' : 'בחר בריכה תחילה'} />
              </SelectTrigger>
              <SelectContent>
                {products.map(p => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.name} — ₪{p.effectivePrice ?? p.price}
                  </SelectItem>
                ))}
                {products.length === 0 && (
                  <div className="px-3 py-2 text-sm text-muted-foreground">
                    אין מוצרים לבריכה זו
                  </div>
                )}
              </SelectContent>
            </Select>
          </div>

          {/* ── Inline new product form ── */}
          {showAddProduct && (
            <div className="border border-blue-200 rounded-lg bg-blue-50/50 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold text-sm text-blue-900">➕ יצירת מוצר חדש</h4>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => { setShowAddProduct(false); setError(''); }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <ProductFormFields
                productName={newProduct.name}
                productType={newProduct.type}
                startDate={newProduct.startDate}
                endDate={calculatedEndDate}
                isEndDateCalculated={!!calculatedEndDate}
                meetingsCount={newProduct.meetingsCount ?? 1}
                startTime={newProduct.startTime ?? ''}
                daysOfWeek={newProduct.daysOfWeek ?? []}
                price={newProduct.price}
                maxParticipants={newProduct.maxParticipants}
                notes={newProduct.notes ?? ''}
                onProductNameChange={v => setNewProduct(p => ({ ...p, name: v }))}
                onProductTypeChange={v => setNewProduct(p => ({ ...p, type: v }))}
                onStartDateChange={v => setNewProduct(p => ({ ...p, startDate: v }))}
                onMeetingsCountChange={v => setNewProduct(p => ({ ...p, meetingsCount: v }))}
                onStartTimeChange={v => setNewProduct(p => ({ ...p, startTime: v }))}
                onDaysOfWeekChange={v => setNewProduct(p => ({ ...p, daysOfWeek: v }))}
                onPriceChange={v => setNewProduct(p => ({ ...p, price: v }))}
                onMaxParticipantsChange={v => setNewProduct(p => ({ ...p, maxParticipants: v }))}
                onNotesChange={v => setNewProduct(p => ({ ...p, notes: v }))}
              />

              <div className="flex gap-2 justify-end pt-1">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => { setShowAddProduct(false); setError(''); }}
                >
                  ביטול
                </Button>
                <Button
                  type="button"
                  size="sm"
                  onClick={handleCreateProduct}
                  disabled={addingProduct || !newProduct.name.trim()}
                >
                  {addingProduct ? 'יוצר מוצר...' : 'צור מוצר ובחר'}
                </Button>
              </div>
            </div>
          )}

          {/* Product details card */}
          {selectedProduct && !showAddProduct && (
            <div className="bg-blue-50 border border-blue-100 rounded-md px-3 py-2 text-sm space-y-1">
              <p><span className="text-muted-foreground">סוג: </span>{selectedProduct.type}</p>
              <p><span className="text-muted-foreground">מחיר: </span>₪{selectedProduct.effectivePrice ?? selectedProduct.price}</p>
              {selectedProduct.startDate && (
                <p><span className="text-muted-foreground">תאריכים: </span>{selectedProduct.startDate} – {selectedProduct.endDate}</p>
              )}
              {selectedProduct.daysOfWeek?.length ? (
                <p><span className="text-muted-foreground">ימים: </span>{selectedProduct.daysOfWeek.join(', ')}</p>
              ) : null}
            </div>
          )}

          {/* Receipt + Paid amount */}
          {!showAddProduct && (
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="receipt">מספר קבלה *</Label>
                <Input
                  id="receipt"
                  value={receiptNumber}
                  onChange={e => { setReceiptNumber(e.target.value); setError(''); }}
                  placeholder="מספר קבלה"
                  dir="ltr"
                  className="text-right"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="paidAmount">סכום ששולם (₪) *</Label>
                <Input
                  id="paidAmount"
                  type="number"
                  min="0"
                  value={paidAmount}
                  onChange={e => { setPaidAmount(e.target.value); setError(''); }}
                  placeholder="0"
                  dir="ltr"
                  className="text-right"
                />
              </div>
            </div>
          )}

          {error && <p className="text-sm text-red-500">{error}</p>}
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>ביטול</Button>
          {!showAddProduct && (
            <Button onClick={handleConfirm} disabled={loading}>
              {loading ? 'מבצע רישום...' : 'אשר רישום'}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
