
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Product } from '@/types';
import { Plus, FileDown, ChevronLeft } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useData } from '@/context/DataContext';

interface ParticipantsHeaderProps {
  product: Product | undefined;
  onExport: () => void;
  onAddParticipant: () => void;
}

const ParticipantsHeader: React.FC<ParticipantsHeaderProps> = ({
  product,
  onExport,
  onAddParticipant
}) => {
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const { seasons, pools } = useData();

  const season = seasons.find(s => s.id === product?.seasonId);
  const pool = pools.find(p => p.id === product?.poolId);

  // Create back URL based on product information
  const getBackUrl = () => {
    if (product?.poolId) {
      return `/season/${product.seasonId}/pool/${product.poolId}/products`;
    }
    return `/season/${product?.seasonId}`;
  };

  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
      <div className="flex flex-col">
        {/* Breadcrumb */}
        {product && (
          <nav className="flex items-center gap-1 text-sm text-muted-foreground mb-2 flex-wrap">
            <button
              onClick={() => navigate('/seasons')}
              className="hover:text-foreground transition-colors"
            >
              עונות
            </button>
            {season && (
              <>
                <ChevronLeft className="h-3 w-3 shrink-0" />
                <button
                  onClick={() => navigate(`/season/${season.id}/pools`)}
                  className="hover:text-foreground transition-colors"
                >
                  {season.name}
                </button>
              </>
            )}
            {pool && (
              <>
                <ChevronLeft className="h-3 w-3 shrink-0" />
                <button
                  onClick={() => navigate(getBackUrl())}
                  className="hover:text-foreground transition-colors"
                >
                  {pool.name}
                </button>
              </>
            )}
            <ChevronLeft className="h-3 w-3 shrink-0" />
            <span className="text-foreground font-medium">{product.name}</span>
          </nav>
        )}

        <h1 className="text-2xl font-bold font-alef">
          {product ? `משתתפים ב${product.name}` : 'משתתפים'}
        </h1>
        {product?.notes && (
          <div className="text-sm text-muted-foreground mt-1">
            <strong>הערות:</strong> {product.notes}
          </div>
        )}
      </div>

      <div className="flex gap-2">
        {isAdmin() && (
          <Button variant="outline" onClick={onExport} className="flex items-center gap-2">
            <FileDown className="h-4 w-4" />
            <span>ייצוא CSV</span>
          </Button>
        )}
        {isAdmin() && (
          <Button onClick={onAddParticipant} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            <span>הוסף משתתף</span>
          </Button>
        )}
      </div>
    </div>
  );
};

export default ParticipantsHeader;
