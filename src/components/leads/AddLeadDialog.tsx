import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Lead, LeadStatus, ProductType } from '@/types';
import { validateIsraeliId, validateIsraeliPhone, validateEmail } from '@/utils/validation';

interface AddLeadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (lead: Omit<Lead, 'id' | 'createdAt' | 'updatedAt'>) => void;
  editLead?: Lead | null;
}

const STATUSES: LeadStatus[] = ['חדש', 'מטופל', 'רשום'];
const PRODUCT_TYPES: ProductType[] = ['קורס', 'חוג', 'קייטנה'];

const EMPTY: Omit<Lead, 'id' | 'createdAt' | 'updatedAt'> = {
  name: '',
  idNumber: '',
  phone: '',
  email: '',
  status: 'חדש',
  requestedProductType: null,
  notes: null,
  convertedToParticipantId: null,
};

export function AddLeadDialog({ open, onOpenChange, onAdd, editLead }: AddLeadDialogProps) {
  const [form, setForm] = useState<Omit<Lead, 'id' | 'createdAt' | 'updatedAt'>>(
    editLead ? {
      name: editLead.name,
      idNumber: editLead.idNumber,
      phone: editLead.phone,
      email: editLead.email,
      status: editLead.status,
      requestedProductType: editLead.requestedProductType ?? null,
      notes: editLead.notes ?? null,
      convertedToParticipantId: editLead.convertedToParticipantId ?? null,
    } : EMPTY
  );
  const [errors, setErrors] = useState<Partial<Record<string, string>>>({});

  // Sync form data whenever the dialog opens (handles re-use of mounted component)
  useEffect(() => {
    if (open) {
      setForm(editLead ? {
        name: editLead.name,
        idNumber: editLead.idNumber,
        phone: editLead.phone,
        email: editLead.email,
        status: editLead.status,
        requestedProductType: editLead.requestedProductType ?? null,
        notes: editLead.notes ?? null,
        convertedToParticipantId: editLead.convertedToParticipantId ?? null,
      } : EMPTY);
      setErrors({});
    }
  }, [open, editLead]);

  const validate = (): boolean => {
    const e: typeof errors = {};
    if (!form.name.trim()) e.name = 'שדה חובה';
    if (!form.idNumber.trim()) {
      e.idNumber = 'שדה חובה';
    } else if (!validateIsraeliId(form.idNumber)) {
      e.idNumber = 'תעודת זהות לא תקינה';
    }
    if (!form.phone.trim()) {
      e.phone = 'שדה חובה';
    } else if (!validateIsraeliPhone(form.phone)) {
      e.phone = 'מספר טלפון לא תקין';
    }
    if (!form.email.trim()) {
      e.email = 'שדה חובה';
    } else if (!validateEmail(form.email)) {
      e.email = 'כתובת אימייל לא תקינה';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    onAdd(form);
    setForm(EMPTY);
    setErrors({});
    onOpenChange(false);
  };

  const field = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(p => ({ ...p, [key]: e.target.value }));
    setErrors(p => ({ ...p, [key]: undefined }));
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { onOpenChange(o); if (!o) setErrors({}); }}>
      <DialogContent className="max-w-md" dir="rtl">
        <DialogHeader>
          <DialogTitle>{editLead ? 'עריכת ליד' : 'הוספת ליד חדש'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-3">

          <div className="space-y-1">
            <Label htmlFor="d-name">שם *</Label>
            <Input
              id="d-name"
              value={form.name}
              onChange={field('name')}
              placeholder="שם מלא"
              className={errors.name ? 'border-red-400' : ''}
            />
            {errors.name && <p className="text-xs text-red-500">{errors.name}</p>}
          </div>

          <div className="space-y-1">
            <Label htmlFor="d-idNumber">ת.ז *</Label>
            <Input
              id="d-idNumber"
              value={form.idNumber}
              onChange={field('idNumber')}
              placeholder="000000000"
              maxLength={9}
              inputMode="numeric"
              dir="ltr"
              className={`text-right ${errors.idNumber ? 'border-red-400' : ''}`}
            />
            {errors.idNumber && <p className="text-xs text-red-500">{errors.idNumber}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="d-phone">טלפון *</Label>
              <Input
                id="d-phone"
                type="tel"
                value={form.phone}
                onChange={field('phone')}
                placeholder="050-0000000"
                dir="ltr"
                className={`text-right ${errors.phone ? 'border-red-400' : ''}`}
              />
              {errors.phone && <p className="text-xs text-red-500">{errors.phone}</p>}
            </div>
            <div className="space-y-1">
              <Label htmlFor="d-email">אימייל *</Label>
              <Input
                id="d-email"
                type="email"
                value={form.email}
                onChange={field('email')}
                placeholder="name@example.com"
                dir="ltr"
                className={`text-right ${errors.email ? 'border-red-400' : ''}`}
              />
              {errors.email && <p className="text-xs text-red-500">{errors.email}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label>סטטוס</Label>
              <Select value={form.status} onValueChange={(v) => setForm(p => ({ ...p, status: v as LeadStatus }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{STATUSES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>סוג פעילות</Label>
              <Select
                value={form.requestedProductType ?? 'none'}
                onValueChange={(v) => setForm(p => ({ ...p, requestedProductType: v === 'none' ? null : v as ProductType }))}
              >
                <SelectTrigger><SelectValue placeholder="בחר סוג" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">ללא</SelectItem>
                  {PRODUCT_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1">
            <Label htmlFor="d-notes">הערות</Label>
            <Textarea
              id="d-notes"
              value={form.notes ?? ''}
              onChange={(e) => setForm(p => ({ ...p, notes: e.target.value || null }))}
              placeholder="הערות נוספות..."
              rows={2}
            />
          </div>

          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>ביטול</Button>
            <Button type="submit">{editLead ? 'שמור שינויים' : 'הוסף ליד'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
