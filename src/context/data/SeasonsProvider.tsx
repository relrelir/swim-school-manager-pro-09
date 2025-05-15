
import React, { createContext, useContext, useEffect, useState } from 'react';
import { SeasonsContextType } from './types';
import { Season } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { toast } from "@/components/ui/use-toast";

const SeasonsContext = createContext<SeasonsContextType | null>(null);

export const useSeasonsContext = () => {
  const context = useContext(SeasonsContext);
  if (!context) {
    throw new Error('useSeasonsContext must be used within a SeasonsProvider');
  }
  return context;
};

export const SeasonsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch seasons on component mount
  useEffect(() => {
    fetchSeasons();
  }, []);

  const fetchSeasons = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('seasons')
        .select('*');

      if (error) {
        throw error;
      }

      // Map database fields to our model (camelCase)
      const mappedSeasons: Season[] = data.map(item => ({
        id: item.id,
        name: item.name,
        startDate: item.startdate,
        endDate: item.enddate
      }));

      setSeasons(mappedSeasons);
    } catch (error) {
      console.error('Error fetching seasons:', error);
      toast({
        title: 'שגיאה',
        description: 'אירעה שגיאה בטעינת העונות',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Add a new season
  const addSeason = async (season: Omit<Season, 'id'>): Promise<Season | undefined> => {
    try {
      console.log('Adding season:', season); // Debug log

      // Map our model to database fields (snake_case)
      const { data, error } = await supabase
        .from('seasons')
        .insert({
          name: season.name,
          startdate: season.startDate, // Note the correct field name for DB
          enddate: season.endDate      // Note the correct field name for DB
        })
        .select()
        .single();

      if (error) {
        console.error('Supabase error:', error); // Debug log
        throw error;
      }

      // Map the returned data to our model
      const newSeason: Season = {
        id: data.id,
        name: data.name,
        startDate: data.startdate, // Map from DB field name to model field name
        endDate: data.enddate      // Map from DB field name to model field name
      };

      console.log('New season created:', newSeason); // Debug log

      // Update state
      setSeasons(prevSeasons => [...prevSeasons, newSeason]);
      
      toast({
        title: 'עונה נוספה',
        description: `העונה ${season.name} נוספה בהצלחה`,
      });
      
      return newSeason;
    } catch (error) {
      console.error('Error adding season:', error);
      toast({
        title: 'שגיאה',
        description: 'אירעה שגיאה בהוספת העונה',
        variant: 'destructive',
      });
      return undefined;
    }
  };

  // Update a season
  const updateSeason = async (season: Season) => {
    try {
      const { error } = await supabase
        .from('seasons')
        .update({
          name: season.name,
          startdate: season.startDate, // Correct field name for DB
          enddate: season.endDate      // Correct field name for DB
        })
        .eq('id', season.id);

      if (error) {
        throw error;
      }

      // Update state
      setSeasons(prevSeasons =>
        prevSeasons.map(s => (s.id === season.id ? season : s))
      );
      
      toast({
        title: 'עונה עודכנה',
        description: `העונה ${season.name} עודכנה בהצלחה`,
      });
    } catch (error) {
      console.error('Error updating season:', error);
      toast({
        title: 'שגיאה',
        description: 'אירעה שגיאה בעדכון העונה',
        variant: 'destructive',
      });
    }
  };

  // Delete a season
  const deleteSeason = async (id: string) => {
    try {
      const { error } = await supabase
        .from('seasons')
        .delete()
        .eq('id', id);

      if (error) {
        throw error;
      }

      // Update state
      setSeasons(prevSeasons => prevSeasons.filter(s => s.id !== id));
      
      toast({
        title: 'עונה נמחקה',
        description: 'העונה נמחקה בהצלחה',
      });
    } catch (error) {
      console.error('Error deleting season:', error);
      toast({
        title: 'שגיאה',
        description: 'אירעה שגיאה במחיקת העונה',
        variant: 'destructive',
      });
    }
  };

  return (
    <SeasonsContext.Provider
      value={{
        seasons,
        addSeason,
        updateSeason,
        deleteSeason,
        loading,
      }}
    >
      {children}
    </SeasonsContext.Provider>
  );
};
