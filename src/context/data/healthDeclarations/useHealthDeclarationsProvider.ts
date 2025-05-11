
import { useState, useEffect } from 'react';
import { HealthDeclaration } from '@/types';
import { fetchHealthDeclarations } from './fetchHealthDeclarations';
import { addHealthDeclarationService } from './addHealthDeclaration';
import { getHealthDeclarationByToken } from './getHealthDeclaration';
import { createHealthDeclarationLink } from './createHealthDeclarationLink';
import { updateHealthDeclaration as updateHealthDeclarationService } from './updateHealthDeclaration';
import { supabase } from '@/integrations/supabase/client';
import { toast } from "@/components/ui/use-toast";

export const useHealthDeclarationsProvider = () => {
  const [healthDeclarations, setHealthDeclarations] = useState<HealthDeclaration[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadHealthDeclarations = async () => {
      try {
        const data = await fetchHealthDeclarations();
        setHealthDeclarations(data);
      } finally {
        setLoading(false);
      }
    };

    loadHealthDeclarations();
  }, []);

  const addHealthDeclaration = async (healthDeclaration: Omit<HealthDeclaration, 'id'>) => {
    try {
      const newDeclaration = await addHealthDeclarationService(healthDeclaration);
      
      if (newDeclaration) {
        setHealthDeclarations(prevDeclarations => [...prevDeclarations, newDeclaration]);
      }
      
      return newDeclaration;
    } catch (error) {
      console.error('Error adding health declaration:', error);
      return undefined;
    }
  };

  const updateHealthDeclaration = async (id: string, updates: Partial<HealthDeclaration>) => {
    try {
      const updatedDeclaration = await updateHealthDeclarationService(id, updates);
      
      if (updatedDeclaration) {
        setHealthDeclarations(prevDeclarations => 
          prevDeclarations.map(declaration => 
            declaration.id === id ? { ...declaration, ...updatedDeclaration } : declaration
          )
        );
      }
      
      return updatedDeclaration;
    } catch (error) {
      console.error('Error updating health declaration:', error);
      return undefined;
    }
  };

  const deleteHealthDeclaration = async (id: string) => {
    try {
      const { error } = await supabase
        .from('health_declarations')
        .delete()
        .eq('id', id);
      
      if (error) {
        throw error;
      }
      
      setHealthDeclarations(prevDeclarations => 
        prevDeclarations.filter(declaration => declaration.id !== id)
      );
    } catch (error) {
      console.error('Error deleting health declaration:', error);
      toast({
        title: "שגיאה",
        description: "אירעה שגיאה במחיקת הצהרת בריאות",
        variant: "destructive"
      });
    }
  };

  const getHealthDeclarationForRegistration = async (registrationId: string) => {
    try {
      // First get the participant ID from the registration
      const { data: registrationData, error: regError } = await supabase
        .from('registrations')
        .select('participantid')
        .eq('id', registrationId)
        .single();
      
      if (regError || !registrationData) {
        console.error('Error getting registration:', regError);
        return undefined;
      }
      
      const participantId = registrationData.participantid;
      
      // Then get the health declaration for that participant
      const { data, error } = await supabase
        .from('health_declarations')
        .select()
        .eq('participant_id', participantId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
      
      if (error) {
        if (error.code === 'PGRST116') {  // No rows returned error
          console.log('No health declaration found for this registration');
          return undefined;
        }
        console.error('Error getting health declaration:', error);
        return undefined;
      }
      
      // Convert from DB format to our TypeScript model
      return data ? {
        id: data.id,
        participantId: data.participant_id,
        token: data.token,
        formStatus: data.form_status,
        submissionDate: data.submission_date,
        createdAt: data.created_at,
        notes: data.notes,
        signature: data.signature,
        updatedAt: data.updated_at
      } as HealthDeclaration : undefined;
    } catch (error) {
      console.error('Error getting health declaration for registration:', error);
      return undefined;
    }
  };

  return {
    healthDeclarations,
    addHealthDeclaration,
    updateHealthDeclaration,
    deleteHealthDeclaration,
    getHealthDeclarationForRegistration,
    createHealthDeclarationLink,
    getHealthDeclarationByToken,
    loading
  };
};
