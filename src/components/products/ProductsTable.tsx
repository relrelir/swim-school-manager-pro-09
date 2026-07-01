import React from 'react';
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
  const { getRegistrationsByProduct } = useData();

  const getParticipantsCount = (productId: string) => {
    const registrations = getRegistrationsByProduct(productId);
    if (registrations.length > 0) {
      console.debug(`Product ${productId}: ${registrations.length} regs:`, registrations.map(r => ({ id: r.id, participantId: r.participantId, productId: r.productId })));
    }
    return registrations.length;
  };

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
