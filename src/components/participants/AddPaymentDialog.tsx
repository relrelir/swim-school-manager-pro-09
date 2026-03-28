
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Participant, RegistrationWithDetails } from '@/types';
import { useAuth } from '@/context/AuthContext';

interface AddPaymentDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  currentRegistration: RegistrationWithDetails | null;
  participants: Participant[];
  newPayment: {
    amount: number;
    receiptNumber: string;
    paymentDate: string;
    registrationId?: string;
  };
  setNewPayment: React.Dispatch<React.SetStateAction<{
    amount: number;
    receiptNumber: string;
    paymentDate: string;
    registrationId?: string;
  }>>;
  onSubmit: (e: React.FormEvent) => void;
  onApplyDiscount: (amount: number, registrationId?: string) => void;
}

const AddPaymentDialog: React.FC<AddPaymentDialogProps> = ({
  isOpen,
  onOpenChange,
  currentRegistration,
  participants,
  newPayment,
  setNewPayment,
  onSubmit,
  onApplyDiscount,
}) => {
  const [isDiscount, setIsDiscount] = useState(false);
  const [discountAmount, setDiscountAmount] = useState(0);
  const today = new Date().toISOString().split('T')[0]; // Get current date in YYYY-MM-DD format
  const { isAdmin } = useAuth();


  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>הוסף תשלום</DialogTitle>
        </DialogHeader>
        <form onSubmit={isDiscount ? (e) => {
          e.preventDefault();
          // Pass the registration ID when applying discount
          onApplyDiscount(discountAmount, currentRegistration?.id);
        } : onSubmit}>
          <div className="space-y-4 py-2">
            {currentRegistration && (
              <>
                <div className="bg-blue-50 p-4 rounded space-y-1">
                  <p className="font-semibold">הוספת תשלום עבור משתתף:</p>
                  {participants.find(p => p.id === currentRegistration.participantId) && (
                    <p>
                      {`${participants.find(p => p.id === currentRegistration.participantId)?.firstName} ${participants.find(p => p.id === currentRegistration.participantId)?.lastName}`}
                    </p>
                  )}
                  {/* Show original price only when a discount is active, for context */}
                  {currentRegistration.discountApproved && currentRegistration.discountAmount ? (
                    <p className="text-sm text-muted-foreground">
                      <span className="font-medium">מחיר מקורי:</span>{' '}
                      {Intl.NumberFormat('he-IL', { style: 'currency', currency: 'ILS' }).format(currentRegistration.requiredAmount)}
                      <span className="text-green-600 mr-1">
                        {` (הנחה: ${Intl.NumberFormat('he-IL', { style: 'currency', currency: 'ILS' }).format(currentRegistration.discountAmount)})`}
                      </span>
                    </p>
                  ) : null}
                  <p>
                    <span className="font-medium">סכום לתשלום:</span>{' '}
                    {Intl.NumberFormat('he-IL', { style: 'currency', currency: 'ILS' }).format(currentRegistration.effectiveRequiredAmount)}
                  </p>
                  <p>
                    <span className="font-medium">שולם עד כה:</span>{' '}
                    {Intl.NumberFormat('he-IL', { style: 'currency', currency: 'ILS' }).format(currentRegistration.paidAmount)}
                  </p>
                  {(() => {
                    const balance = currentRegistration.effectiveRequiredAmount - currentRegistration.paidAmount;
                    if (balance > 0) return (
                      <p className="text-amber-700 font-medium">
                        <span>יתרה לתשלום:</span>{' '}
                        {Intl.NumberFormat('he-IL', { style: 'currency', currency: 'ILS' }).format(balance)}
                      </p>
                    );
                    if (balance < 0) return (
                      <p className="text-green-700 font-medium">
                        <span>תשלום ביתר:</span>{' '}
                        {Intl.NumberFormat('he-IL', { style: 'currency', currency: 'ILS' }).format(Math.abs(balance))}
                      </p>
                    );
                    return <p className="text-green-700 font-medium">שולם במלואו ✓</p>;
                  })()}
                </div>

                {/* Only show discount checkbox for admins */}
                {isAdmin() && (
                  <div className="flex items-center space-x-2 mb-2">
                    <Checkbox
                      id="is-discount"
                      checked={isDiscount}
                      onCheckedChange={(checked) => setIsDiscount(checked as boolean)}
                    />
                    <Label htmlFor="is-discount" className="mr-2">הנחה</Label>
                  </div>
                )}
                
                {isDiscount && isAdmin() ? (
                  <div className="space-y-2">
                    <Label htmlFor="discount-amount">סכום הנחה</Label>
                    <Input
                      id="discount-amount"
                      type="number"
                      value={discountAmount}
                      onChange={(e) => setDiscountAmount(Number(e.target.value))}
                      required
                      min={1}
                      className="ltr"
                    />
                  </div>
                ) : (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="payment-amount">סכום לתשלום</Label>
                      <Input
                        id="payment-amount"
                        type="number"
                        value={newPayment.amount}
                        onChange={(e) => setNewPayment({ ...newPayment, amount: Number(e.target.value) })}
                        required
                        min={1}
                        className="ltr"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="payment-receipt">מספר קבלה</Label>
                      <Input
                        id="payment-receipt"
                        value={newPayment.receiptNumber}
                        onChange={(e) => setNewPayment({ ...newPayment, receiptNumber: e.target.value })}
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="payment-date">תאריך תשלום</Label>
                      <Input
                        id="payment-date"
                        type="date"
                        value={newPayment.paymentDate}
                        onChange={(e) => setNewPayment({ ...newPayment, paymentDate: e.target.value })}
                        required
                        className="ltr"
                      />
                    </div>
                  </>
                )}
              </>
            )}
          </div>
          <DialogFooter className="mt-4">
            <Button type="submit">
              {isDiscount && isAdmin() ? 'אשר הנחה' : 'הוסף תשלום'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddPaymentDialog;
