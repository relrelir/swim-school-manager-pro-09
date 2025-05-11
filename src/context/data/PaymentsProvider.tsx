
import React, { createContext, useState, useContext, useEffect } from 'react';
import { toast } from "@/components/ui/use-toast";
import { Payment } from '@/types';
import { handleSupabaseError, mapPaymentFromDB, mapPaymentToDB } from './utils';
import { supabase } from '@/integrations/supabase/client';

interface PaymentsContextType {
  payments: Payment[];
  addPayment: (payment: Omit<Payment, 'id'>) => Promise<Payment | undefined>;
  updatePayment: (payment: Payment) => void;
  deletePayment: (id: string) => void;
  getPaymentsByRegistration: (registrationId: string) => Payment[];
  loading: boolean;
}

const PaymentsContext = createContext<PaymentsContextType | null>(null);

export const usePaymentsContext = () => {
  const context = useContext(PaymentsContext);
  if (!context) {
    throw new Error('usePaymentsContext must be used within a PaymentsProvider');
  }
  return context;
};

interface PaymentsProviderProps {
  children: React.ReactNode;
}

export const PaymentsProvider: React.FC<PaymentsProviderProps> = ({ children }) => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const { data, error } = await supabase
          .from('payments')
          .select();

        if (error) {
          handleSupabaseError(error, 'fetching payments');
        }

        const transformedPayments = data?.map(payment => mapPaymentFromDB(payment)) || [];
        setPayments(transformedPayments);
      } catch (error) {
        toast({
          title: "שגיאה",
          description: "אירעה שגיאה בטעינת תשלומים",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchPayments();
  }, []);

  const addPayment = async (payment: Omit<Payment, 'id'>) => {
    try {
      const dbPayment = mapPaymentToDB(payment);
      
      const { data, error } = await supabase
        .from('payments')
        .insert([dbPayment])
        .select()
        .single();

      if (error) {
        handleSupabaseError(error, 'adding payment');
      }

      if (data) {
        const newPayment = mapPaymentFromDB(data);
        setPayments([...payments, newPayment]);
        return newPayment;
      }
    } catch (error) {
      toast({
        title: "שגיאה",
        description: "אירעה שגיאה בהוספת תשלום חדש",
        variant: "destructive",
      });
    }
  };

  const updatePayment = async (payment: Payment) => {
    try {
      const { id, ...paymentData } = payment;
      const dbPayment = mapPaymentToDB(paymentData);
      
      const { error } = await supabase
        .from('payments')
        .update(dbPayment)
        .eq('id', id);

      if (error) {
        handleSupabaseError(error, 'updating payment');
      }

      setPayments(payments.map(p => p.id === payment.id ? payment : p));
    } catch (error) {
      toast({
        title: "שגיאה",
        description: "אירעה שגיאה בעדכון תשלום",
        variant: "destructive",
      });
    }
  };

  const deletePayment = async (id: string) => {
    try {
      const { error } = await supabase
        .from('payments')
        .delete()
        .eq('id', id);

      if (error) {
        handleSupabaseError(error, 'deleting payment');
      }

      setPayments(payments.filter(p => p.id !== id));
    } catch (error) {
      toast({
        title: "שגיאה",
        description: "אירעה שגיאה במחיקת תשלום",
        variant: "destructive",
      });
    }
  };

  const getPaymentsByRegistration = (registrationId: string) => {
    return payments.filter(payment => payment.registrationId === registrationId);
  };

  const contextValue: PaymentsContextType = {
    payments,
    addPayment,
    updatePayment,
    deletePayment,
    getPaymentsByRegistration,
    loading
  };

  return (
    <PaymentsContext.Provider value={contextValue}>
      {children}
    </PaymentsContext.Provider>
  );
};
