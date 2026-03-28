import React, { createContext, useContext, useEffect, useState } from 'react';
import { SeasonsContextType } from './types';
import { Season } from '@/types';
import { toast } from '@/components/ui/use-toast';
import * as seasonsService from '@/services/firebase/seasons';

const SeasonsContext = createContext<SeasonsContextType | null>(null);

export const useSeasonsContext = () => {
  const ctx = useContext(SeasonsContext);
  if (!ctx) throw new Error('useSeasonsContext must be used within a SeasonsProvider');
  return ctx;
};

export const SeasonsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const unsubscribe = seasonsService.subscribeToSeasons((data) => {
      setSeasons(data);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const addSeason = async (season: Omit<Season, 'id'>): Promise<Season | undefined> => {
    try {
      const newSeason = await seasonsService.createSeason(season);
      toast({ title: 'עונה נוספה', description: `העונה ${season.name} נוספה בהצלחה` });
      return newSeason;
    } catch (err) {
      console.error('Error adding season:', err);
      toast({ title: 'שגיאה', description: 'אירעה שגיאה בהוספת העונה', variant: 'destructive' });
    }
  };

  const updateSeason = async (season: Season) => {
    try {
      await seasonsService.updateSeason(season.id, season);
      toast({ title: 'עונה עודכנה', description: `העונה ${season.name} עודכנה בהצלחה` });
    } catch (err) {
      console.error('Error updating season:', err);
      toast({ title: 'שגיאה', description: 'אירעה שגיאה בעדכון העונה', variant: 'destructive' });
    }
  };

  const deleteSeason = async (id: string) => {
    try {
      await seasonsService.deleteSeason(id);
      toast({ title: 'עונה נמחקה', description: 'העונה נמחקה בהצלחה' });
    } catch (err) {
      console.error('Error deleting season:', err);
      toast({ title: 'שגיאה', description: 'אירעה שגיאה במחיקת העונה', variant: 'destructive' });
    }
  };

  return (
    <SeasonsContext.Provider value={{ seasons, addSeason, updateSeason, deleteSeason, loading }}>
      {children}
    </SeasonsContext.Provider>
  );
};
