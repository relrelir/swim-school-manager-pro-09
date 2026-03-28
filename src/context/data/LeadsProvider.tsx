import React, { createContext, useContext, useEffect, useState } from 'react';
import { Lead } from '@/types';
import { toast } from '@/components/ui/use-toast';
import * as leadsService from '@/services/firebase/leads';

export interface LeadsContextType {
  leads: Lead[];
  addLead: (lead: Omit<Lead, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Lead | undefined>;
  updateLead: (lead: Lead) => Promise<void>;
  deleteLead: (id: string) => Promise<void>;
  getLeadsBySeason: (seasonId: string) => Lead[];
  loading: boolean;
}

const LeadsContext = createContext<LeadsContextType | null>(null);

export const useLeadsContext = () => {
  const ctx = useContext(LeadsContext);
  if (!ctx) throw new Error('useLeadsContext must be used within a LeadsProvider');
  return ctx;
};

export const LeadsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const unsubscribe = leadsService.subscribeToLeads((data) => {
      setLeads(data);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const getLeadsBySeason = (seasonId: string): Lead[] =>
    leads.filter((l) => l.interestedInSeasonId === seasonId);

  const addLead = async (lead: Omit<Lead, 'id' | 'createdAt' | 'updatedAt'>): Promise<Lead | undefined> => {
    try {
      const newLead = await leadsService.createLead(lead);
      toast({ title: 'ליד נוסף', description: `${lead.name} נוסף בהצלחה` });
      return newLead;
    } catch (err) {
      console.error('Error adding lead:', err);
      toast({ title: 'שגיאה', description: 'אירעה שגיאה בהוספת הליד', variant: 'destructive' });
    }
  };

  const updateLead = async (lead: Lead): Promise<void> => {
    try {
      const { id, createdAt, ...data } = lead;
      await leadsService.updateLead(id, data);
    } catch (err) {
      console.error('Error updating lead:', err);
      toast({ title: 'שגיאה', description: 'אירעה שגיאה בעדכון הליד', variant: 'destructive' });
    }
  };

  const deleteLead = async (id: string): Promise<void> => {
    try {
      await leadsService.deleteLead(id);
      toast({ title: 'ליד נמחק', description: 'הליד נמחק בהצלחה' });
    } catch (err) {
      console.error('Error deleting lead:', err);
      toast({ title: 'שגיאה', description: 'אירעה שגיאה במחיקת הליד', variant: 'destructive' });
    }
  };

  return (
    <LeadsContext.Provider value={{ leads, addLead, updateLead, deleteLead, getLeadsBySeason, loading }}>
      {children}
    </LeadsContext.Provider>
  );
};
