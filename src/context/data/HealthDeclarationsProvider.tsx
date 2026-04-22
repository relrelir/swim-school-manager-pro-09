import React, { createContext, useContext, useEffect, useState } from 'react';
import { HealthDeclarationsContextType } from './types';
import { HealthDeclaration } from '@/types';
import { toast } from '@/components/ui/use-toast';
import * as hdService from '@/services/firebase/healthDeclarations';

const HealthDeclarationsContext = createContext<HealthDeclarationsContextType | null>(null);

export const useHealthDeclarationsContext = () => {
  const ctx = useContext(HealthDeclarationsContext);
  if (!ctx) throw new Error('useHealthDeclarationsContext must be used within a HealthDeclarationsProvider');
  return ctx;
};

export const HealthDeclarationsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [healthDeclarations, setHealthDeclarations] = useState<HealthDeclaration[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const unsubscribe = hdService.subscribeToHealthDeclarations((data) => {
      setHealthDeclarations(data);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const addHealthDeclaration = async (data: Omit<HealthDeclaration, 'id'>): Promise<HealthDeclaration | undefined> => {
    try {
      const participantData = data.participantName
        ? {
            name: data.participantName,
            idNumber: data.participantIdNumber ?? '',
            phone: data.participantPhone ?? '',
          }
        : undefined;
      const productContext = (data.productType || data.productName)
        ? {
            productType: data.productType ?? undefined,
            productName: data.productName ?? undefined,
          }
        : undefined;
      const hasRegistrationContext =
        data.registrationId != null ||
        data.registrationDate != null ||
        data.requiredAmount != null ||
        data.discountAmount != null ||
        data.discountApproved != null ||
        data.effectiveRequiredAmount != null;
      const registrationContext = hasRegistrationContext
        ? {
            registrationId: data.registrationId ?? undefined,
            registrationDate: data.registrationDate ?? undefined,
            requiredAmount: data.requiredAmount ?? undefined,
            discountAmount: data.discountAmount ?? null,
            discountApproved: data.discountApproved ?? undefined,
            effectiveRequiredAmount: data.effectiveRequiredAmount ?? undefined,
          }
        : undefined;
      const created = await hdService.createHealthDeclarationLink(
        data.participantId,
        participantData,
        productContext,
        registrationContext
      );
      return created;
    } catch (err) {
      console.error('Error adding health declaration:', err);
      toast({ title: 'שגיאה', description: 'אירעה שגיאה ביצירת הצהרת הבריאות', variant: 'destructive' });
    }
  };

  const updateHealthDeclaration = async (id: string, updates: Partial<HealthDeclaration>): Promise<HealthDeclaration | undefined> => {
    try {
      await hdService.updateHealthDeclaration(id, updates);
      return healthDeclarations.find((hd) => hd.id === id);
    } catch (err) {
      console.error('Error updating health declaration:', err);
      toast({ title: 'שגיאה', description: 'אירעה שגיאה בעדכון הצהרת הבריאות', variant: 'destructive' });
    }
  };

  const getHealthDeclarationForRegistration = async (participantId: string): Promise<HealthDeclaration | undefined> => {
    const cached = healthDeclarations.find((hd) => hd.participantId === participantId);
    if (cached) return cached;
    const fetched = await hdService.getHealthDeclarationByParticipant(participantId);
    return fetched ?? undefined;
  };

  const deleteHealthDeclaration = async (id: string): Promise<void> => {
    try {
      await hdService.deleteHealthDeclaration(id);
    } catch (err) {
      console.error('Error deleting health declaration:', err);
    }
  };

  const createHealthDeclarationLink = async (
    participantId: string,
    participantData?: { name: string; idNumber: string; phone: string },
    productContext?: { productType?: string; productName?: string },
    registrationContext?: {
      registrationId?: string;
      registrationDate?: string;
      requiredAmount?: number;
      discountAmount?: number | null;
      discountApproved?: boolean;
      effectiveRequiredAmount?: number;
    }
  ): Promise<string | undefined> => {
    try {
      const declaration = await hdService.createHealthDeclarationLink(
        participantId,
        participantData,
        productContext,
        registrationContext
      );
      return `/health-form/${declaration.token}`;
    } catch (err) {
      console.error('Error creating health declaration link:', err);
      toast({ title: 'שגיאה', description: 'אירעה שגיאה ביצירת הלינק', variant: 'destructive' });
    }
  };

  const getHealthDeclarationByToken = async (token: string): Promise<HealthDeclaration | undefined> => {
    const cached = healthDeclarations.find((hd) => hd.token === token);
    if (cached) return cached;
    const fetched = await hdService.getHealthDeclarationByToken(token);
    return fetched ?? undefined;
  };

  return (
    <HealthDeclarationsContext.Provider
      value={{
        healthDeclarations,
        addHealthDeclaration,
        updateHealthDeclaration,
        getHealthDeclarationForRegistration,
        deleteHealthDeclaration,
        createHealthDeclarationLink,
        getHealthDeclarationByToken,
        loading,
      }}
    >
      {children}
    </HealthDeclarationsContext.Provider>
  );
};
