
import React, { createContext, useState, useContext, useEffect } from 'react';
import { toast } from "@/components/ui/use-toast";
import { Participant } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { handleSupabaseError, mapParticipantFromDB, mapParticipantToDB } from './utils';

interface ParticipantsContextType {
  participants: Participant[];
  addParticipant: (participant: Omit<Participant, 'id'>) => Promise<Participant | undefined> | void;
  updateParticipant: (participant: Participant) => void;
  deleteParticipant: (id: string) => Promise<void>;
  loading: boolean;
}

const ParticipantsContext = createContext<ParticipantsContextType | null>(null);

export const useParticipantsContext = () => {
  const context = useContext(ParticipantsContext);
  if (!context) {
    throw new Error('useParticipantsContext must be used within a ParticipantsProvider');
  }
  return context;
};

export const ParticipantsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(true);

  // Load participants from Supabase
  useEffect(() => {
    const fetchParticipants = async () => {
      try {
        const { data, error } = await supabase
          .from('participants')
          .select();

        if (error) {
          handleSupabaseError(error, 'fetching participants');
        }

        if (data) {
          // Transform data to match our Participant type with proper casing
          const transformedParticipants = data.map(participant => mapParticipantFromDB(participant));
          setParticipants(transformedParticipants);
        }
      } catch (error) {
        toast({
          title: "שגיאה",
          description: "אירעה שגיאה בטעינת משתתפים",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchParticipants();
  }, []);

  // Add a participant
  const addParticipant = async (participant: Omit<Participant, 'id'>) => {
    try {
      // Convert to DB field names format (lowercase)
      const dbParticipant = mapParticipantToDB(participant);
      
      const { data, error } = await supabase
        .from('participants')
        .insert([dbParticipant])
        .select()
        .single();

      if (error) {
        handleSupabaseError(error, 'adding participant');
      }

      if (data) {
        // Convert back to our TypeScript model format (camelCase)
        const newParticipant = mapParticipantFromDB(data);
        setParticipants([...participants, newParticipant]);
        return newParticipant;
      }
    } catch (error) {
      toast({
        title: "שגיאה",
        description: "אירעה שגיאה בהוספת משתתף חדש",
        variant: "destructive",
      });
    }
  };

  // Delete a participant
  const deleteParticipant = async (id: string) => {
    try {
      const { error } = await supabase
        .from('participants')
        .delete()
        .eq('id', id);

      if (error) {
        handleSupabaseError(error, 'deleting participant');
      }

      setParticipants(participants.filter(p => p.id !== id));
    } catch (error) {
      console.error("Error deleting participant:", error);
      toast({
        title: "שגיאה",
        description: "אירעה שגיאה במחיקת משתתף",
        variant: "destructive",
      });
    }
  };

  const contextValue: ParticipantsContextType = {
    participants,
    addParticipant,
    updateParticipant: async (participant: Participant) => {
      try {
        const { id, ...participantData } = participant;
        const dbParticipant = mapParticipantToDB(participantData);
        
        const { error } = await supabase
          .from('participants')
          .update(dbParticipant)
          .eq('id', id);

        if (error) {
          handleSupabaseError(error, 'updating participant');
        }

        setParticipants(participants.map(p => p.id === id ? participant : p));
      } catch (error) {
        toast({
          title: "שגיאה",
          description: "אירעה שגיאה בעדכון משתתף",
          variant: "destructive",
        });
      }
    },
    deleteParticipant,
    loading
  };

  return (
    <ParticipantsContext.Provider value={contextValue}>
      {children}
    </ParticipantsContext.Provider>
  );
};
