
import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableHeader } from "@/components/ui/table";
import { Search } from 'lucide-react';
import { Product, Season } from '@/types';
import { useProductsTable } from '@/hooks/useProductsTable';
import { useData } from '@/context/DataContext';
import SeasonProductsTableHeader from './SeasonProductsTableHeader';
import SeasonProductsTableContent from './SeasonProductsTableContent';

interface SeasonProductsTableProps {
  season: Season | null;
  products: Product[];
  getProductMeetingInfo: (product: Product) => { current: number; total: number };
  onEditProduct: (product: Product) => void;
}

const SeasonProductsTable: React.FC<SeasonProductsTableProps> = ({ 
  season, 
  products, 
  getProductMeetingInfo,
  onEditProduct
}) => {
  const navigate = useNavigate();
  const { getAllRegistrationsWithDetails } = useData();

  // Use our custom hook for filtering and sorting
  const {
    filter,
    setFilter,
    sortField,
    sortDirection,
    handleSort,
    filteredAndSortedProducts
  } = useProductsTable({ products });

  // Count participants per product using the SAME source of truth as the
  // participants/report pages: getAllRegistrationsWithDetails() drops any
  // registration whose participant/product/season is missing (orphaned docs),
  // so the count matches exactly what the participants list shows.
  const countByProduct = useMemo(() => {
    const map = new Map<string, number>();
    for (const reg of getAllRegistrationsWithDetails()) {
      map.set(reg.productId, (map.get(reg.productId) ?? 0) + 1);
    }
    return map;
  }, [getAllRegistrationsWithDetails]);

  const getParticipantsCount = (productId: string) => countByProduct.get(productId) ?? 0;

  if (!season) {
    return null;
  }

  return (
    <div className="mt-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">מוצרים בעונה: {season.name}</h2>
        <Button onClick={() => navigate(`/season/${season.id}/products`)}>הוסף מוצר</Button>
      </div>

      {/* Search and Filter */}
      <div className="mb-4 relative">
        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
          <Search className="h-4 w-4 text-gray-400" />
        </div>
        <Input
          placeholder="חיפוש לפי שם או סוג..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="pr-10"
        />
      </div>

      {products.length > 0 ? (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <SeasonProductsTableHeader 
                sortField={sortField}
                sortDirection={sortDirection}
                handleSort={handleSort}
              />
            </TableHeader>
            <SeasonProductsTableContent 
              products={filteredAndSortedProducts}
              getProductMeetingInfo={getProductMeetingInfo}
              getParticipantsCount={getParticipantsCount}
              onEditProduct={onEditProduct}
            />
          </Table>
        </div>
      ) : (
        <p>אין מוצרים בעונה זו</p>
      )}
    </div>
  );
};

export default SeasonProductsTable;
