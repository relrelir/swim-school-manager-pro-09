import React, { createContext, useContext, useEffect, useState } from 'react';
import { ParticipantsContextType } from './types';
import { Participant } from '@/types';
import { toast } from '@/components/ui/use-toast';
import * as participantsService from '@/services/firebase/participants';

const ParticipantsContext = createContext<ParticipantsContextType | null>(null);

export const useParticipantsContext = () => {
  const ctx = useContext(ParticipantsContext);
  if (!ctx) throw new Error('useParticipantsContext must be used within a ParticipantsProvider');
  return ctx;
};

export const ParticipantsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const unsubscribe = participantsService.subscribeToParticipants((data) => {
      setParticipants(data);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const addParticipant = async (participant: Omit<Participant, 'id'>): Promise<Participant | undefined> => {
    try {
      const newParticipant = await participantsService.createParticipant(participant);
      return newParticipant;
    } catch (err) {
      console.error('Error adding participant:', err);
      toast({ title: 'שגיאה', description: 'אירעה שגיאה בהוספת המשתתף', variant: 'destructive' });
    }
  };

  const updateParticipant = async (participant: Participant) => {
    try {
      const { id, ...data } = participant;
      await participantsService.updateParticipant(id, data);
    } catch (err) {
      console.error('Error updating participant:', err);
      toast({ title: 'שגיאה', description: 'אירעה שגיאה בעדכון המשתתף', variant: 'destructive' });
    }
  };

  const deleteParticipant = async (id: string) => {
    try {
      await participantsService.deleteParticipant(id);
    } catch (err) {
      console.error('Error deleting participant:', err);
      toast({ title: 'שגיאה', description: 'אירעה שגיאה במחיקת המשתתף', variant: 'destructive' });
    }
  };

  return (
    <ParticipantsContext.Provider value={{ participants, addParticipant, updateParticipant, deleteParticipant, loading }}>
      {children}
    </ParticipantsContext.Provider>
  );
};
