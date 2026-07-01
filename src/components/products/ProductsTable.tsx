import React, { useMemo } from 'react';
import { Table } from '@/components/ui/table';
import { Product } from '@/types';
import { useData } from '@/context/DataContext';
import ProductsTableHeader from './ProductsTableHeader';
import ProductsTableContent from './ProductsTableContent';

interface ProductsTableProps {
  products: Product[];
  sortField: keyof Product;
  sortDirection: 'asc' | 'desc';
  handleSort: (field: keyof Product) => void;
  onEditProduct: (product: Product) => void;
  onDeleteProduct: (product: Product) => void; // חדש
}

const ProductsTable: React.FC<ProductsTableProps> = ({ 
  products, 
  sortField, 
  sortDirection, 
  handleSort,
  onEditProduct,
  onDeleteProduct // חדש
}) => {
  const { getAllRegistrationsWithDetails } = useData();

  // Count participants per product using the SAME source of truth as the
  // participants/report pages: getAllRegistrationsWithDetails() drops any
  // registration whose participant/product/season is missing (orphaned docs),
  // so the count here matches exactly what the participants list shows.
  const countByProduct = useMemo(() => {
    const map = new Map<string, number>();
    for (const reg of getAllRegistrationsWithDetails()) {
      map.set(reg.productId, (map.get(reg.productId) ?? 0) + 1);
    }
    return map;
  }, [getAllRegistrationsWithDetails]);

  const getParticipantsCount = (productId: string) => countByProduct.get(productId) ?? 0;

  return (
    <Table>
      <ProductsTableHeader 
        sortField={sortField} 
        sortDirection={sortDirection} 
        handleSort={handleSort} 
      />
      <ProductsTableContent 
        products={products} 
        getParticipantsCount={getParticipantsCount}
        onEditProduct={onEditProduct}
        onDeleteProduct={onDeleteProduct} // חדש
      />
    </Table>
  );
};

export default ProductsTable;
