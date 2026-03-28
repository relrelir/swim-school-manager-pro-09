
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { DialogFooter } from '@/components/ui/dialog';
import { Product, ProductType, Season, Pool } from '@/types';
import { useSeasonProducts } from '@/hooks/useSeasonProducts';
import ProductFormFields from './ProductFormFields';

interface AddProductFormProps {
  onSubmit: (product: Omit<Product, 'id'>) => void;
  currentSeason: Season | undefined;
  currentPool?: Pool | undefined;
}

const AddProductForm: React.FC<AddProductFormProps> = ({ onSubmit, currentSeason, currentPool }) => {
  const { calculateEndDate } = useSeasonProducts();
  const today = new Date().toISOString().split('T')[0]; // Get current date in YYYY-MM-DD format
  
  const [newProduct, setNewProduct] = useState<Omit<Product, 'id'>>({
    name: '',
    type: 'קורס',
    startDate: currentSeason?.startDate || today,
    endDate: currentSeason?.endDate || '',
    price: 0,
    maxParticipants: 10,
    notes: '',
    seasonId: currentSeason?.id || '',
    poolId: currentPool?.id, // Include pool ID if available
    meetingsCount: 1,
    daysOfWeek: [],
    startTime: '',
    active: true
  });
  const [calculatedEndDate, setCalculatedEndDate] = useState<string | null>(null);

  // Update defaults if season or pool changes
  useEffect(() => {
    if (currentSeason) {
      // Use the later date between today and season start date
      const startDate = currentSeason.startDate < today ? today : currentSeason.startDate;
      
      setNewProduct(prev => ({
        ...prev,
        startDate: startDate,
        endDate: currentSeason.endDate,
        seasonId: currentSeason.id,
        poolId: currentPool?.id
      }));
    }
  }, [currentSeason, currentPool, today]);

  // Calculate end date when relevant fields change
  useEffect(() => {
    if (newProduct.startDate && newProduct.daysOfWeek?.length > 0 && newProduct.meetingsCount) {
      const endDate = calculateEndDate(
        newProduct.startDate,
        newProduct.meetingsCount,
        newProduct.daysOfWeek
      );
      setCalculatedEndDate(endDate);
      setNewProduct(prev => ({
        ...prev,
        endDate: endDate
      }));
    }
  }, [newProduct.startDate, newProduct.daysOfWeek, newProduct.meetingsCount, calculateEndDate]);

  const handleCreateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(newProduct);
    setNewProduct({
      name: '',
      type: 'קורס',
      startDate: currentSeason?.startDate || today,
      endDate: currentSeason?.endDate || '',
      price: 0,
      maxParticipants: 10,
      notes: '',
      seasonId: currentSeason?.id || '',
      poolId: currentPool?.id,
      meetingsCount: 1,
      daysOfWeek: [],
      startTime: '',
      active: true
    });
  };

  // Field change handlers
  const handleProductNameChange = (value: string) => {
    setNewProduct({ ...newProduct, name: value });
  };

  const handleProductTypeChange = (value: ProductType) => {
    setNewProduct({ ...newProduct, type: value });
  };

  const handleStartDateChange = (value: string) => {
    setNewProduct({ ...newProduct, startDate: value });
  };

  const handleMeetingsCountChange = (value: number) => {
    setNewProduct({ ...newProduct, meetingsCount: value });
  };

  const handleStartTimeChange = (value: string) => {
    setNewProduct({ ...newProduct, startTime: value });
  };

  const handleDaysOfWeekChange = (value: string[]) => {
    setNewProduct({ ...newProduct, daysOfWeek: value });
  };

  const handlePriceChange = (value: number) => {
    setNewProduct({ ...newProduct, price: value });
  };

  const handleDiscountAmountChange = (value: number | null) => {
    setNewProduct({ ...newProduct, discountAmount: value, effectivePrice: value ? newProduct.price - value : newProduct.price });
  };

  const handleMaxParticipantsChange = (value: number) => {
    setNewProduct({ ...newProduct, maxParticipants: value });
  };

  const handleNotesChange = (value: string) => {
    setNewProduct({ ...newProduct, notes: value });
  };

  return (
    <form onSubmit={handleCreateProduct}>
      <ProductFormFields
        productName={newProduct.name}
        productType={newProduct.type}
        startDate={newProduct.startDate}
        endDate={calculatedEndDate}
        isEndDateCalculated={!!calculatedEndDate}
        meetingsCount={newProduct.meetingsCount}
        startTime={newProduct.startTime}
        daysOfWeek={newProduct.daysOfWeek}
        price={newProduct.price}
        discountAmount={newProduct.discountAmount}
        maxParticipants={newProduct.maxParticipants}
        notes={newProduct.notes}
        seasonStartDate={today}
        seasonEndDate={currentSeason?.endDate}
        onProductNameChange={handleProductNameChange}
        onProductTypeChange={handleProductTypeChange}
        onStartDateChange={handleStartDateChange}
        onMeetingsCountChange={handleMeetingsCountChange}
        onStartTimeChange={handleStartTimeChange}
        onDaysOfWeekChange={handleDaysOfWeekChange}
        onPriceChange={handlePriceChange}
        onDiscountAmountChange={handleDiscountAmountChange}
        onMaxParticipantsChange={handleMaxParticipantsChange}
        onNotesChange={handleNotesChange}
      />
      <DialogFooter className="mt-4">
        <Button type="submit">צור מוצר</Button>
      </DialogFooter>
    </form>
  );
};

export default AddProductForm;
