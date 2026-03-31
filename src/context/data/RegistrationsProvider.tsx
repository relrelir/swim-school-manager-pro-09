import React, { createContext, useContext, useEffect, useState } from 'react';
import { RegistrationsContextType } from './types';
import { Registration, PaymentStatus } from '@/types';
import { toast } from '@/components/ui/use-toast';
import * as registrationsService from '@/services/firebase/registrations';

const RegistrationsContext = createContext<RegistrationsContextType | null>(null);

export const useRegistrationsContext = () => {
  const ctx = useContext(RegistrationsContext);
  if (!ctx) throw new Error('useRegistrationsContext must be used within a RegistrationsProvider');
  return ctx;
};

export const RegistrationsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const unsubscribe = registrationsService.subscribeToRegistrations((data) => {
      setRegistrations(data);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const getRegistrationsByProduct = (productId: string): Registration[] =>
    registrations.filter((r) => r.productId === productId);

  const addRegistration = async (registration: Omit<Registration, 'id'>): Promise<Registration | undefined> => {
    try {
      const newReg = await registrationsService.createRegistration(registration);
      return newReg;
    } catch (err) {
      console.error('Error adding registration:', err);
      toast({ title: 'שגיאה', description: 'אירעה שגיאה בהוספת הרישום', variant: 'destructive' });
    }
  };

  const updateRegistration = async (registration: Registration) => {
    try {
      // Destructure only the known Registration fields to prevent Firestore from receiving
      // undefined values or extra nested objects (e.g. from RegistrationWithDetails).
      // NOTE: paidAmount is intentionally excluded — it is set once at creation and must
      // never be overwritten here. Callers receive RegistrationWithDetails whose paidAmount
      // is the computed actualPaidAmount (sum of payment docs). Writing that value would
      // corrupt the legacy-fallback logic in calcRegistrationFinancials and cause payment
      // deletions to have no visible effect on the calculated total.
      const {
        id,
        participantId,
        productId,
        registrationDate,
        requiredAmount,
        discountAmount,
        discountApproved,
        receiptNumber,
      } = registration;
      await registrationsService.updateRegistration(id, {
        participantId,
        productId,
        registrationDate,
        requiredAmount,
        discountAmount,
        discountApproved,
        receiptNumber,
      });
    } catch (err) {
      console.error('Error updating registration:', err);
      toast({ title: 'שגיאה', description: 'אירעה שגיאה בעדכון הרישום', variant: 'destructive' });
    }
  };

  const deleteRegistration = async (id: string) => {
    try {
      await registrationsService.deleteRegistration(id);
    } catch (err) {
      console.error('Error deleting registration:', err);
      toast({ title: 'שגיאה', description: 'אירעה שגיאה במחיקת הרישום', variant: 'destructive' });
    }
  };

  const calculatePaymentStatus = (registration: Registration): PaymentStatus =>
    registrationsService.calculatePaymentStatus(registration);

  return (
    <RegistrationsContext.Provider
      value={{ registrations, addRegistration, updateRegistration, deleteRegistration, getRegistrationsByProduct, calculatePaymentStatus, loading }}
    >
      {children}
    </RegistrationsContext.Provider>
  );
};
