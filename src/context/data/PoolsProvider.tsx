import React, { createContext, useContext, useEffect, useState } from 'react';
import { PoolsContextType } from './types';
import { Pool } from '@/types';
import { toast } from '@/components/ui/use-toast';
import * as poolsService from '@/services/firebase/pools';

const PoolsContext = createContext<PoolsContextType | null>(null);

export const usePoolsContext = () => {
  const ctx = useContext(PoolsContext);
  if (!ctx) throw new Error('usePoolsContext must be used within a PoolsProvider');
  return ctx;
};

export const PoolsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [pools, setPools] = useState<Pool[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const unsubscribe = poolsService.subscribeToPools((data) => {
      setPools(data);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const getPoolsBySeason = (seasonId: string): Pool[] =>
    pools.filter((p) => p.seasonId === seasonId);

  const addPool = async (pool: Omit<Pool, 'id' | 'createdAt' | 'updatedAt'>): Promise<Pool | undefined> => {
    try {
      const newPool = await poolsService.createPool(pool);
      toast({ title: 'בריכה נוספה', description: `הבריכה ${pool.name} נוספה בהצלחה` });
      return newPool;
    } catch (err) {
      console.error('Error adding pool:', err);
      toast({ title: 'שגיאה', description: 'אירעה שגיאה בהוספת הבריכה', variant: 'destructive' });
    }
  };

  const updatePool = async (pool: Pool): Promise<void> => {
    try {
      await poolsService.updatePool(pool.id, pool);
      toast({ title: 'בריכה עודכנה', description: `הבריכה ${pool.name} עודכנה בהצלחה` });
    } catch (err) {
      console.error('Error updating pool:', err);
      toast({ title: 'שגיאה', description: 'אירעה שגיאה בעדכון הבריכה', variant: 'destructive' });
    }
  };

  const deletePool = async (id: string): Promise<void> => {
    try {
      await poolsService.deletePool(id);
      toast({ title: 'בריכה נמחקה', description: 'הבריכה נמחקה בהצלחה' });
    } catch (err) {
      console.error('Error deleting pool:', err);
      toast({ title: 'שגיאה', description: 'אירעה שגיאה במחיקת הבריכה', variant: 'destructive' });
    }
  };

  return (
    <PoolsContext.Provider value={{ pools, getPoolsBySeason, addPool, updatePool, deletePool, loading }}>
      {children}
    </PoolsContext.Provider>
  );
};
