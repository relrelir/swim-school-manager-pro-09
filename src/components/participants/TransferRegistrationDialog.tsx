import React, { useEffect, useMemo, useState } from 'react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Pool, Product, RegistrationWithDetails } from '@/types';
import type { TransferPricing } from '@/hooks/usePaymentActions';
import { formatCurrencyForUI } from '@/utils/formatters';

interface TransferRegistrationDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  registration: RegistrationWithDetails | null;
  products: Product[];
  pools: Pool[];
  onConfirm: (registrationId: string, targetProductId: string, pricing: TransferPricing) => void;
}

type PricingMode = 'keep' | 'newProduct' | 'manual';

const TransferRegistrationDialog: React.FC<TransferRegistrationDialogProps> = ({
  isOpen,
  onOpenChange,
  registration,
  products,
  pools,
  onConfirm,
}) => {
  const [targetProductId, setTargetProductId] = useState('');
  const [pricingMode, setPricingMode] = useState<PricingMode>('newProduct');
  const [manualRequired, setManualRequired] = useState(0);
  const [manualDiscount, setManualDiscount] = useState(0);

  // Target products: same season as the current product, excluding the current one.
  const targetProducts = useMemo(() => {
    if (!registration?.product) return [];
    return products.filter(
      (p) => p.seasonId === registration.product.seasonId && p.id !== registration.productId
    );
  }, [products, registration]);

  // Group target products by pool, sorted alphabetically by pool name.
  // Products without a pool go into a "ללא בריכה" group at the end.
  const productsByPool = useMemo(() => {
    const poolMap = new Map<string, { poolName: string; products: Product[] }>();

    for (const product of targetProducts) {
      const pool = pools.find((pl) => pl.id === product.poolId);
      const key = pool?.id ?? '__none__';
      const poolName = pool?.name ?? 'ללא בריכה';
      if (!poolMap.has(key)) poolMap.set(key, { poolName, products: [] });
      poolMap.get(key)!.products.push(product);
    }

    // Sort groups: named pools alphabetically, then "ללא בריכה" last.
    return [...poolMap.entries()]
      .sort(([aKey, a], [bKey, b]) => {
        if (aKey === '__none__') return 1;
        if (bKey === '__none__') return -1;
        return a.poolName.localeCompare(b.poolName, 'he');
      })
      .map(([, group]) => group);
  }, [targetProducts, pools]);

  // Reset form each time the dialog opens for a registration.
  useEffect(() => {
    if (isOpen) {
      setTargetProductId('');
      setPricingMode('newProduct');
      setManualRequired(registration?.requiredAmount ?? 0);
      setManualDiscount(registration?.discountAmount ?? 0);
    }
  }, [isOpen, registration]);

  const targetProduct = targetProducts.find((p) => p.id === targetProductId);
  const paid = registration?.paidAmount ?? 0;

  // Preview the post-transfer financial picture for the selected pricing mode.
  const preview = useMemo(() => {
    if (!registration) return null;
    let required = registration.requiredAmount;
    let discount = registration.discountApproved ? registration.discountAmount ?? 0 : 0;

    if (pricingMode === 'newProduct') {
      required = targetProduct?.price ?? 0;
      discount = 0;
    } else if (pricingMode === 'manual') {
      required = manualRequired;
      discount = manualDiscount;
    }

    const effective = Math.max(0, required - discount);
    const balance = effective - paid; // >0 חוב, <0 יתר
    return { effective, balance };
  }, [registration, pricingMode, targetProduct, manualRequired, manualDiscount, paid]);

  const handleConfirm = () => {
    if (!registration || !targetProductId) return;
    let pricing: TransferPricing;
    if (pricingMode === 'manual') {
      pricing = {
        mode: 'manual',
        requiredAmount: manualRequired,
        discountAmount: manualDiscount > 0 ? manualDiscount : null,
        discountApproved: manualDiscount > 0,
      };
    } else {
      pricing = { mode: pricingMode };
    }
    onConfirm(registration.id, targetProductId, pricing);
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>העברת משתתף לחוג/קורס אחר</DialogTitle>
          <DialogDescription>
            {registration
              ? `${registration.participant.firstName} ${registration.participant.lastName} — כעת ב${registration.product.name}`
              : ''}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label>מוצר יעד</Label>
            <Select value={targetProductId} onValueChange={setTargetProductId}>
              <SelectTrigger>
                <SelectValue placeholder="בחר מוצר יעד" />
              </SelectTrigger>
              <SelectContent>
                {productsByPool.length === 0 ? (
                  <SelectItem value="none" disabled>
                    אין מוצרים אחרים בעונה זו
                  </SelectItem>
                ) : (
                  productsByPool.map((group) => (
                    <SelectGroup key={group.poolName}>
                      <SelectLabel>{group.poolName}</SelectLabel>
                      {group.products.map((p) => (
                        <SelectItem key={p.id} value={p.id}>
                          {p.name} ({formatCurrencyForUI(p.price)})
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>תמחור לאחר המעבר</Label>
            <RadioGroup
              value={pricingMode}
              onValueChange={(v) => setPricingMode(v as PricingMode)}
              className="gap-3"
            >
              <div className="flex items-center gap-2">
                <RadioGroupItem value="newProduct" id="pricing-new" />
                <Label htmlFor="pricing-new" className="font-normal cursor-pointer">
                  מחיר המוצר החדש
                  {targetProduct ? ` (${formatCurrencyForUI(targetProduct.price)})` : ''}
                </Label>
              </div>
              <div className="flex items-center gap-2">
                <RadioGroupItem value="keep" id="pricing-keep" />
                <Label htmlFor="pricing-keep" className="font-normal cursor-pointer">
                  שמירת המחיר הקיים
                  {registration ? ` (${formatCurrencyForUI(registration.requiredAmount)})` : ''}
                </Label>
              </div>
              <div className="flex items-center gap-2">
                <RadioGroupItem value="manual" id="pricing-manual" />
                <Label htmlFor="pricing-manual" className="font-normal cursor-pointer">
                  קביעה ידנית
                </Label>
              </div>
            </RadioGroup>
          </div>

          {pricingMode === 'manual' && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="manual-required">סכום לתשלום</Label>
                <Input
                  id="manual-required"
                  type="number"
                  min={0}
                  value={manualRequired}
                  onChange={(e) => setManualRequired(Number(e.target.value) || 0)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="manual-discount">הנחה</Label>
                <Input
                  id="manual-discount"
                  type="number"
                  min={0}
                  value={manualDiscount}
                  onChange={(e) => setManualDiscount(Number(e.target.value) || 0)}
                />
              </div>
            </div>
          )}

          {preview && (
            <div className="rounded-md bg-muted p-3 text-sm space-y-1">
              <div className="flex justify-between">
                <span>שולם עד כה</span>
                <span>{formatCurrencyForUI(paid)}</span>
              </div>
              <div className="flex justify-between">
                <span>סכום לתשלום לאחר המעבר</span>
                <span>{formatCurrencyForUI(preview.effective)}</span>
              </div>
              <div className="flex justify-between font-semibold">
                {preview.balance > 0 ? (
                  <>
                    <span>יתרה לתשלום</span>
                    <span className="text-amber-600">{formatCurrencyForUI(preview.balance)}</span>
                  </>
                ) : preview.balance < 0 ? (
                  <>
                    <span>תשלום ביתר (זיכוי)</span>
                    <span className="text-blue-600">{formatCurrencyForUI(-preview.balance)}</span>
                  </>
                ) : (
                  <>
                    <span>יתרה</span>
                    <span className="text-green-600">שולם במלואו</span>
                  </>
                )}
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            ביטול
          </Button>
          <Button onClick={handleConfirm} disabled={!targetProductId}>
            בצע מעבר
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default TransferRegistrationDialog;
