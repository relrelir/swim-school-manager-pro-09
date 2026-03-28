
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Season } from '@/types';
import SeasonList from './SeasonList';
import { useAuth } from '@/context/AuthContext';

interface SeasonSummaryProps {
  seasons: Season[];
  seasonPools: Record<string, number>;
  onDeleteSeason: (seasonId: string) => void;
  onEditSeason: (updated: Season) => void;
}

const SeasonSummary: React.FC<SeasonSummaryProps> = ({
  seasons,
  seasonPools,
  onDeleteSeason,
  onEditSeason,
}) => {
  const { isAdmin } = useAuth();

  return <div className="space-y-4">
      <h2 className="text-xl font-semibold text-slate-50">עונות פעילות</h2>
      <SeasonList
        seasons={seasons}
        seasonPools={seasonPools}
        onDeleteSeason={onDeleteSeason}
        onEditSeason={onEditSeason}
        isAdmin={isAdmin()}
      />
    </div>;
};

export default SeasonSummary;
