
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Pencil } from 'lucide-react';
import { Season } from '@/types';
import EditSeasonDialog from './EditSeasonDialog';

interface SeasonListProps {
  seasons: Season[];
  seasonPools: Record<string, number>;
  onDeleteSeason: (seasonId: string) => void;
  onEditSeason: (updated: Season) => void;
  isAdmin: boolean;
}

const SeasonList: React.FC<SeasonListProps> = ({ seasons, seasonPools, onDeleteSeason, onEditSeason, isAdmin }) => {
  const navigate = useNavigate();
  const [editingSeason, setEditingSeason] = useState<Season | null>(null);

  const handleViewPools = (seasonId: string) => {
    navigate(`/season/${seasonId}/pools`);
  };

  if (seasons.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 mb-4">לא קיימות עונות</p>
        <p className="text-gray-400 text-sm">הוסיפו עונה חדשה כדי להתחיל</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {seasons.map((season) => {
          const poolCount = seasonPools[season.id] || 0;

          return (
            <Card key={season.id} className="bg-white shadow-md hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <h2 className="text-xl font-semibold">{season.name}</h2>
                <div className="mt-4 space-y-2 text-gray-600">
                  <p className="flex justify-between">
                    <span className="text-gray-500">מתאריך:</span>
                    <span>{new Date(season.startDate).toLocaleDateString('he-IL')}</span>
                  </p>
                  <p className="flex justify-between">
                    <span className="text-gray-500">עד תאריך:</span>
                    <span>{new Date(season.endDate).toLocaleDateString('he-IL')}</span>
                  </p>
                  <p className="flex justify-between">
                    <span className="text-gray-500">בריכות:</span>
                    <span>{poolCount}</span>
                  </p>
                </div>
              </CardContent>
              <CardFooter className="bg-gray-50 flex flex-wrap gap-2">
                <Button onClick={() => handleViewPools(season.id)}>בריכות</Button>

                {isAdmin && (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEditingSeason(season)}
                    >
                      <Pencil className="h-3 w-3 ml-1" />
                      ערוך
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      disabled={poolCount > 0}
                      title={poolCount > 0 ? 'לא ניתן למחוק עונה עם בריכות' : ''}
                      onClick={() => onDeleteSeason(season.id)}
                    >
                      מחק
                    </Button>
                  </>
                )}
              </CardFooter>
            </Card>
          );
        })}
      </div>

      <EditSeasonDialog
        season={editingSeason}
        isOpen={!!editingSeason}
        onOpenChange={(open) => { if (!open) setEditingSeason(null); }}
        onSave={(updated) => { onEditSeason(updated); setEditingSeason(null); }}
      />
    </>
  );
};

export default SeasonList;
