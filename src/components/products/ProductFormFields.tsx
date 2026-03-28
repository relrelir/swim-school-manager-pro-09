
import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ProductType } from '@/types';
import DaysOfWeekSelector from './DaysOfWeekSelector';

interface ProductFormFieldsProps {
  productName: string;
  productType: ProductType;
  startDate: string;
  endDate: string | null;
  isEndDateCalculated: boolean;
  meetingsCount: number;
  startTime: string;
  daysOfWeek: string[];
  price: number;
  discountAmount?: number | null;
  maxParticipants: number;
  notes: string;
  seasonStartDate?: string;
  seasonEndDate?: string;
  onProductNameChange: (value: string) => void;
  onProductTypeChange: (value: ProductType) => void;
  onStartDateChange: (value: string) => void;
  onMeetingsCountChange: (value: number) => void;
  onStartTimeChange: (value: string) => void;
  onDaysOfWeekChange: (value: string[]) => void;
  onPriceChange: (value: number) => void;
  onDiscountAmountChange?: (value: number | null) => void;
  onMaxParticipantsChange: (value: number) => void;
  onNotesChange: (value: string) => void;
}

const ProductFormFields: React.FC<ProductFormFieldsProps> = ({
  productName,
  productType,
  startDate,
  endDate,
  isEndDateCalculated,
  meetingsCount,
  startTime,
  daysOfWeek,
  price,
  discountAmount,
  maxParticipants,
  notes,
  seasonStartDate,
  seasonEndDate,
  onProductNameChange,
  onProductTypeChange,
  onStartDateChange,
  onMeetingsCountChange,
  onStartTimeChange,
  onDaysOfWeekChange,
  onPriceChange,
  onDiscountAmountChange,
  onMaxParticipantsChange,
  onNotesChange,
}) => {
  const effectivePrice = price - (discountAmount || 0);

  // U8: Local HH/MM state for 24-hour time input
  const [hours, setHours] = useState<string>(startTime ? startTime.split(':')[0] : '');
  const [minutes, setMinutes] = useState<string>(startTime ? startTime.split(':')[1] : '');

  // Sync if startTime prop changes externally (e.g. editing an existing product)
  useEffect(() => {
    if (startTime) {
      setHours(startTime.split(':')[0] || '');
      setMinutes(startTime.split(':')[1] || '');
    }
  }, [startTime]);

  const handleHoursChange = (val: string) => {
    setHours(val);
    const hh = val.padStart(2, '0');
    const mm = (minutes || '00').padStart(2, '0');
    onStartTimeChange(`${hh}:${mm}`);
  };

  const handleMinutesChange = (val: string) => {
    setMinutes(val);
    const hh = (hours || '00').padStart(2, '0');
    const mm = val.padStart(2, '0');
    onStartTimeChange(`${hh}:${mm}`);
  };

  const handleHoursBlur = () => {
    const padded = String(parseInt(hours || '0', 10)).padStart(2, '0');
    setHours(padded);
    onStartTimeChange(`${padded}:${(minutes || '00').padStart(2, '0')}`);
  };

  const handleMinutesBlur = () => {
    const padded = String(parseInt(minutes || '0', 10)).padStart(2, '0');
    setMinutes(padded);
    onStartTimeChange(`${(hours || '00').padStart(2, '0')}:${padded}`);
  };

  return (
    <div className="space-y-4 py-2">
      <div className="space-y-2">
        <Label htmlFor="product-name">שם המוצר</Label>
        <Input
          id="product-name"
          value={productName}
          onChange={(e) => onProductNameChange(e.target.value)}
          placeholder="לדוגמה: קורס שחייה למתחילים"
          required
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="product-type">סוג מוצר</Label>
        <Select 
          value={productType} 
          onValueChange={(value) => onProductTypeChange(value as ProductType)}
        >
          <SelectTrigger id="product-type">
            <SelectValue placeholder="בחר סוג מוצר" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="קייטנה">קייטנה</SelectItem>
            <SelectItem value="חוג">חוג</SelectItem>
            <SelectItem value="קורס">קורס</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="start-date">תאריך התחלה</Label>
          <Input
            id="start-date"
            type="date"
            value={startDate}
            onChange={(e) => onStartDateChange(e.target.value)}
            required
            className="ltr"
            max={seasonEndDate}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="end-date">תאריך סיום (מחושב)</Label>
          <Input
            id="end-date"
            type="date"
            value={endDate || ""}
            readOnly
            className="ltr bg-gray-100"
            title="תאריך הסיום מחושב אוטומטית לפי ימי הפעילות ומספר המפגשים"
          />
          {isEndDateCalculated && (
            <p className="text-xs text-blue-600">
              * מחושב אוטומטית לפי מספר המפגשים וימי הפעילות
            </p>
          )}
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="meetings-count">מספר מפגשים</Label>
          <Input
            id="meetings-count"
            type="number"
            value={meetingsCount}
            onChange={(e) => onMeetingsCountChange(parseInt(e.target.value))}
            required
            min={1}
            className="ltr"
          />
        </div>
        <div className="space-y-2">
          <Label>שעת התחלה</Label>
          <div className="flex items-center gap-1 ltr">
            <Input
              id="start-time-hh"
              type="number"
              value={hours}
              onChange={(e) => handleHoursChange(e.target.value)}
              onBlur={handleHoursBlur}
              min={0}
              max={23}
              className="ltr text-center w-16"
              placeholder="שע'"
              required
            />
            <span className="text-lg font-bold">:</span>
            <Input
              id="start-time-mm"
              type="number"
              value={minutes}
              onChange={(e) => handleMinutesChange(e.target.value)}
              onBlur={handleMinutesBlur}
              min={0}
              max={59}
              className="ltr text-center w-16"
              placeholder="דק'"
            />
          </div>
        </div>
      </div>
      
      <DaysOfWeekSelector 
        selectedDays={daysOfWeek} 
        onChange={onDaysOfWeekChange} 
      />
      
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="price">מחיר מלא (₪)</Label>
          <Input
            id="price"
            type="number"
            value={price}
            onChange={(e) => onPriceChange(Number(e.target.value))}
            required
            min={0}
            className="ltr"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="max-participants">מכסת משתתפים מקסימלית</Label>
          <Input
            id="max-participants"
            type="number"
            value={maxParticipants}
            onChange={(e) => onMaxParticipantsChange(Number(e.target.value))}
            required
            min={1}
            className="ltr"
          />
        </div>
      </div>

      {onDiscountAmountChange && (
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="discount-amount">הנחה (₪)</Label>
            <Input
              id="discount-amount"
              type="number"
              value={discountAmount ?? ''}
              onChange={(e) => onDiscountAmountChange(e.target.value ? Number(e.target.value) : null)}
              min={0}
              max={price}
              className="ltr"
              placeholder="0"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="effective-price">מחיר אחרי הנחה (₪)</Label>
            <Input
              id="effective-price"
              type="number"
              value={effectivePrice}
              readOnly
              className="ltr bg-gray-100"
            />
          </div>
        </div>
      )}
      
      <div className="space-y-2">
        <Label htmlFor="notes">הערות</Label>
        <Textarea
          id="notes"
          value={notes}
          onChange={(e) => onNotesChange(e.target.value)}
          placeholder="הערות נוספות לגבי המוצר"
          rows={3}
        />
      </div>
    </div>
  );
};

export default ProductFormFields;
