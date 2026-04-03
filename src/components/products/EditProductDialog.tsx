
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Product, Pool } from '@/types';
import { addDays } from 'date-fns';
import EditProductForm from './EditProductForm';

interface EditProductDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  product: Product | null;
  onSubmit: (productData: Partial<Product>) => void;
  currentPool?: Pool | undefined;
}

const EditProductDialog: React.FC<EditProductDialogProps> = ({
  isOpen,
  onOpenChange,
  product,
  onSubmit,
  currentPool
}) => {
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [calculatedEndDate, setCalculatedEndDate] = useState<string | null>(null);

  // Update form when product changes
  useEffect(() => {
    if (product) {
      setEditingProduct({
        ...product,
        poolId: product.poolId || currentPool?.id // Ensure poolId is set
      });
    }
  }, [product, currentPool]);

  // Calculate estimated end date when days or meetings count change
  useEffect(() => {
    if (editingProduct && editingProduct.daysOfWeek && editingProduct.daysOfWeek.length > 0) {
      // Map Hebrew day names to numeric day of week (0 = Sunday, 1 = Monday, etc.)
      const dayNameToNumber: Record<string, number> = {
        'ראשון': 0,
        'שני': 1,
        'שלישי': 2,
        'רביעי': 3,
        'חמישי': 4,
        'שישי': 5,
        'שבת': 6
      };
  
      const selectedDayNumbers = editingProduct.daysOfWeek.map(day => dayNameToNumber[day]).sort();
      
      if (selectedDayNumbers.length > 0) {
        const start = new Date(editingProduct.startDate);
        let currentDate = new Date(start);
        let meetingsLeft = editingProduct.meetingsCount || 1;
        
        while (meetingsLeft > 0) {
          const currentDayOfWeek = currentDate.getDay();
          
          if (selectedDayNumbers.includes(currentDayOfWeek)) {
            meetingsLeft--;
          }
          
          if (meetingsLeft > 0) {
            currentDate = addDays(currentDate, 1);
          }
        }
        
        setCalculatedEndDate(currentDate.toISOString().split('T')[0]);
      } else {
        setCalculatedEndDate(null);
      }
    } else {
      setCalculatedEndDate(null);
    }
  }, [editingProduct?.daysOfWeek, editingProduct?.meetingsCount, editingProduct?.startDate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingProduct) {
      // Include all necessary fields in the updated product data, including name, type, and startDate
      const updatedProduct: Partial<Product> = {
        name: editingProduct.name,
        type: editingProduct.type,
        startDate: editingProduct.startDate,
        price: editingProduct.price,
        meetingsCount: editingProduct.meetingsCount,
        daysOfWeek: editingProduct.daysOfWeek,
        startTime: editingProduct.startTime,
        maxParticipants: editingProduct.maxParticipants,
        notes: editingProduct.notes,
        endDate: calculatedEndDate || editingProduct.endDate,
        active: editingProduct.active, // Include active field
        poolId: editingProduct.poolId || currentPool?.id // Include poolId
      };
      
      onSubmit(updatedProduct);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95%] w-full sm:max-w-lg p-0 max-h-[85vh] overflow-hidden" dir="ltr">
        <div dir="rtl" className="overflow-y-auto max-h-[85vh] p-4 sm:p-6">
          <DialogHeader className="mb-4">
            <DialogTitle>עריכת מוצר</DialogTitle>
            <DialogDescription>
              שינוי במפגשים או בימי הפעילות ישנה את תאריך הסיום המחושב.
            </DialogDescription>
          </DialogHeader>
          {editingProduct && (
            <EditProductForm
              editingProduct={editingProduct}
              setEditingProduct={setEditingProduct}
              onSubmit={handleSubmit}
              calculatedEndDate={calculatedEndDate}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EditProductDialog;
