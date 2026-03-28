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
      const { id, ...data } = registration;
      await registrationsService.updateRegistration(id, data);
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
