
import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Plus, Trash2, Pencil } from 'lucide-react';
import { useData } from '@/context/DataContext';
import { Pool } from '@/types';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import BackButton from '@/components/ui/back-button';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import AddPoolDialog from '@/components/pools/AddPoolDialog';
import EditPoolDialog from '@/components/pools/EditPoolDialog';
import { usePools } from '@/hooks/usePools';
import { useAuth } from '@/context/AuthContext';

const PoolsPage = () => {
  const { seasonId } = useParams<{ seasonId: string }>();
  const navigate = useNavigate();
  const { seasons, getProductsByPool } = useData();
  const [isAddPoolDialogOpen, setIsAddPoolDialogOpen] = useState(false);
  const [editingPool, setEditingPool] = useState<Pool | null>(null);
  const { isAdmin } = useAuth();

  // Use the existing hooks
  const {
    pools: seasonPools,
    handleAddPool,
    handleDeletePool,
    handleUpdatePool,
  } = usePools(seasonId);

  const currentSeason = useMemo(
    () => seasons.find(s => s.id === seasonId),
    [seasons, seasonId]
  );

  // Check if pool has products
  const hasPoolProducts = (poolId: string) => {
    const products = getProductsByPool(poolId);
    return products.length > 0;
  };

  if (!currentSeason) {
    return <div className="text-center py-10">העונה לא נמצאה</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4">
        <div className="flex items-center mb-2">
          <BackButton to="/" label="חזרה לרשימת העונות" />
        </div>
        
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/">עונות</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href={`/season/${seasonId}`}>{currentSeason.name}</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              בריכות
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">
            בריכות - {currentSeason.name}
          </h1>
          {isAdmin() && (
            <Button onClick={() => setIsAddPoolDialogOpen(true)} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              <span>הוסף בריכה</span>
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {seasonPools.map(pool => {
          const hasProducts = hasPoolProducts(pool.id);
          
          return (
            <Card key={pool.id} className="overflow-hidden">
              <CardHeader className="pb-2">
                <CardTitle>{pool.name}</CardTitle>
              </CardHeader>
              <CardContent>
                {/* תוכן נוסף של הבריכה יכול להיות כאן */}
              </CardContent>
              <CardFooter className="bg-muted/40 pt-4 flex flex-col gap-2">
                <Button 
                  variant="default" 
                  className="w-full"
                  onClick={() => navigate(`/season/${seasonId}/pool/${pool.id}/products`)}
                >
                  צפה במוצרים
                </Button>
                {isAdmin() && (
                  <div className="flex gap-2 w-full">
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => setEditingPool(pool)}
                    >
                      <Pencil className="h-4 w-4 ml-1" />
                      ערוך
                    </Button>
                    <Button
                      variant="destructive"
                      className="flex-1"
                      onClick={() => handleDeletePool(pool.id)}
                      disabled={hasProducts}
                      title={hasProducts ? "לא ניתן למחוק בריכה עם מוצרים" : "מחק בריכה"}
                    >
                      <Trash2 className="h-4 w-4 ml-1" />
                      מחק
                    </Button>
                  </div>
                )}
              </CardFooter>
            </Card>
          );
        })}
        
        {seasonPools.length === 0 && (
          <div className="col-span-full text-center py-10 bg-muted/40 rounded-lg">
            <p className="text-muted-foreground">לא נמצאו בריכות, אנא הוסף בריכה חדשה</p>
          </div>
        )}
      </div>

      {/* Add Pool Dialog */}
      <AddPoolDialog
        isOpen={isAddPoolDialogOpen}
        onOpenChange={setIsAddPoolDialogOpen}
        onAddPool={(name) => {
          handleAddPool(name);
          setIsAddPoolDialogOpen(false);
        }}
      />

      {/* Edit Pool Dialog */}
      <EditPoolDialog
        pool={editingPool}
        isOpen={!!editingPool}
        onOpenChange={(open) => { if (!open) setEditingPool(null); }}
        onSave={(updated) => { handleUpdatePool(updated); setEditingPool(null); }}
      />
    </div>
  );
};

export default PoolsPage;
