import React, { createContext, useContext, useEffect, useState } from 'react';
import { PaymentsContextType } from './types';
import { Payment } from '@/types';
import { toast } from '@/components/ui/use-toast';
import * as paymentsService from '@/services/firebase/payments';

const PaymentsContext = createContext<PaymentsContextType | null>(null);

export const usePaymentsContext = () => {
  const ctx = useContext(PaymentsContext);
  if (!ctx) throw new Error('usePaymentsContext must be used within a PaymentsProvider');
  return ctx;
};

export const PaymentsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const unsubscribe = paymentsService.subscribeToPayments((data) => {
      setPayments(data);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const getPaymentsByRegistration = (registrationId: string): Payment[] =>
    payments.filter((p) => p.registrationId === registrationId);

  const addPayment = async (payment: Omit<Payment, 'id'>): Promise<Payment | undefined> => {
    try {
      const newPayment = await paymentsService.createPayment(payment);
      // Optimistic update: reflect the new payment in local state immediately so
      // getAllRegistrationsWithDetails (which reads from this state) computes the
      // correct paidAmount without waiting for the onSnapshot listener to fire.
      // The snapshot will eventually replace this state with the authoritative
      // Firestore data, resolving any momentary inconsistency.
      setPayments((prev) => {
        // Guard against duplicates in case the snapshot already arrived
        if (prev.some((p) => p.id === newPayment.id)) return prev;
        return [newPayment, ...prev];
      });
      return newPayment;
    } catch (err) {
      console.error('Error adding payment:', err);
      toast({ title: 'שגיאה', description: 'אירעה שגיאה בהוספת התשלום', variant: 'destructive' });
    }
  };

  const updatePayment = async (payment: Payment) => {
    try {
      const { id, ...data } = payment;
      await paymentsService.updatePayment(id, data);
      // Optimistic update: reflect changes immediately without waiting for onSnapshot
      setPayments((prev) => prev.map((p) => (p.id === payment.id ? payment : p)));
    } catch (err) {
      console.error('Error updating payment:', err);
      toast({ title: 'שגיאה', description: 'אירעה שגיאה בעדכון התשלום', variant: 'destructive' });
    }
  };

  const deletePayment = async (id: string) => {
    try {
      await paymentsService.deletePayment(id);
      // Optimistic update: remove from local state immediately without waiting for onSnapshot
      setPayments((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      console.error('Error deleting payment:', err);
      toast({ title: 'שגיאה', description: 'אירעה שגיאה במחיקת התשלום', variant: 'destructive' });
    }
  };

  return (
    <PaymentsContext.Provider value={{ payments, addPayment, updatePayment, deletePayment, getPaymentsByRegistration, loading }}>
      {children}
    </PaymentsContext.Provider>
  );
};
