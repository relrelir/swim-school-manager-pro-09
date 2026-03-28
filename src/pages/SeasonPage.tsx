
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { useData } from "@/context/DataContext";
import AddSeasonDialog from '@/components/seasons/AddSeasonDialog';
import SeasonSummary from '@/components/seasons/SeasonSummary';
import { Plus } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function SeasonPage() {
  const { seasons, deleteSeason, updateSeason, getPoolsBySeason } = useData();
  const [isAddSeasonOpen, setIsAddSeasonOpen] = useState(false);
  const [seasonPoolCounts, setSeasonPoolCounts] = useState<Record<string, number>>({});
  const { isAdmin } = useAuth();

  // חשב ספירת בריכות בכל עונה
  useEffect(() => {
    const counts: Record<string, number> = {};
    seasons.forEach(s => {
      const poolsInSeason = getPoolsBySeason(s.id) || [];
      counts[s.id] = poolsInSeason.length;
    });
    setSeasonPoolCounts(counts);
  }, [seasons]);

  const handleDeleteSeason = (seasonId: string) => {
    if (window.confirm("האם אתה בטוח שברצונך למחוק את העונה?")) {
      deleteSeason(seasonId);
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">עונות פעילות</h1>
        {isAdmin() && (
          <Button className="flex items-center gap-2" onClick={() => setIsAddSeasonOpen(true)}>
            <Plus className="h-4 w-4" />
            <span>הוסף עונה</span>
          </Button>
        )}
      </div>

      <SeasonSummary
        seasons={seasons}
        seasonPools={seasonPoolCounts}
        onDeleteSeason={handleDeleteSeason}
        onEditSeason={(updated) => updateSeason(updated)}
      />

      <AddSeasonDialog 
        isOpen={isAddSeasonOpen}
        onOpenChange={setIsAddSeasonOpen}
      />
    </div>
  );
}
