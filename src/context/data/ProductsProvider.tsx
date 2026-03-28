import React, { createContext, useContext, useEffect, useState } from 'react';
import { ProductsContextType } from './types';
import { Product } from '@/types';
import { toast } from '@/components/ui/use-toast';
import * as productsService from '@/services/firebase/products';

const ProductsContext = createContext<ProductsContextType | null>(null);

export const useProductsContext = () => {
  const ctx = useContext(ProductsContext);
  if (!ctx) throw new Error('useProductsContext must be used within a ProductsProvider');
  return ctx;
};

export const ProductsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const unsubscribe = productsService.subscribeToProducts((data) => {
      setProducts(data);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const getProductsBySeason = (seasonId: string): Product[] =>
    products.filter((p) => p.seasonId === seasonId);

  const getProductsByPool = (poolId: string): Product[] =>
    products.filter((p) => p.poolId === poolId);

  const addProduct = async (product: Omit<Product, 'id'>): Promise<Product | undefined> => {
    try {
      const newProduct = await productsService.createProduct(product);
      toast({ title: 'קורס נוסף', description: `הקורס ${product.name} נוסף בהצלחה` });
      return newProduct;
    } catch (err) {
      console.error('Error adding product:', err);
      toast({ title: 'שגיאה', description: 'אירעה שגיאה בהוספת הקורס', variant: 'destructive' });
    }
  };

  const updateProduct = async (product: Product): Promise<void> => {
    try {
      const { id, ...data } = product;
      await productsService.updateProduct(id, data);
      toast({ title: 'קורס עודכן', description: `הקורס ${product.name} עודכן בהצלחה` });
    } catch (err) {
      console.error('Error updating product:', err);
      toast({ title: 'שגיאה', description: 'אירעה שגיאה בעדכון הקורס', variant: 'destructive' });
    }
  };

  const deleteProduct = async (productId: string): Promise<void> => {
    try {
      await productsService.deleteProduct(productId);
      toast({ title: 'קורס נמחק', description: 'הקורס נמחק בהצלחה' });
    } catch (err) {
      console.error('Error deleting product:', err);
      toast({ title: 'שגיאה', description: 'אירעה שגיאה במחיקת הקורס', variant: 'destructive' });
    }
  };

  return (
    <ProductsContext.Provider
      value={{ products, getProductsBySeason, getProductsByPool, addProduct, updateProduct, deleteProduct, loading }}
    >
      {children}
    </ProductsContext.Provider>
  );
};
